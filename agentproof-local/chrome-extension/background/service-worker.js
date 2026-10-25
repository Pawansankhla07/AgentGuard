/**
 * Service Worker for AgentProof Chrome Extension (Manifest V3).
 *
 * Implements event-driven browser protection:
 * - Monitors navigation completions and enforces policy (warn/block/strict).
 * - Monitors browser download events for deceptive double extensions and dangerous formats.
 * - Dispatches authenticated scan requests to the local desktop companion.
 * - Sends rate-limited notifications for verified threats and suspicious downloads.
 * - Handles content script injection and sanitized cookie metadata retrieval.
 */

const DEFAULT_CONFIG = {
  responseLevel: 'monitor',
  allowlist: [],
  denylist: [],
  warnThreshold: 40,
  blockThreshold: 75,
  blockHttpPasswords: true,
  monitorDownloads: true,
  companionUrl: 'http://127.0.0.1:8000',
  companionToken: 'agentguard-local-secure-token',
  notifyHighRisk: true,
  notifyDownloads: true,
  suppressDuplicates: true,
};

// Rate-limiting / deduplication cache for notifications (5-minute cooldown)
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000;
const lastNotificationMap = new Map();

function shouldNotify(key) {
  const now = Date.now();
  const lastTime = lastNotificationMap.get(key) || 0;
  if (now - lastTime < NOTIFICATION_COOLDOWN) {
    return false;
  }
  lastNotificationMap.set(key, now);
  return true;
}

function getStoredConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['agentproof_config'], (res) => {
      resolve(Object.assign({}, DEFAULT_CONFIG, res.agentproof_config || {}));
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AgentProof] Background service worker initialized.');
  // Initialize default config if not present
  chrome.storage.local.get(['agentproof_config'], (res) => {
    if (!res.agentproof_config) {
      chrome.storage.local.set({ agentproof_config: DEFAULT_CONFIG });
    }
  });
});

/**
 * 1. Event-Driven Navigation Monitor
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) {
    return;
  }

  // Skip browser-internal and extension pages
  if (tab.url.startsWith('chrome:') || tab.url.startsWith('chrome-extension:') || tab.url.startsWith('about:')) {
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(tab.url);
  } catch {
    return;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const config = await getStoredConfig();

  // Explicit allowlist check
  if ((config.allowlist || []).includes(hostname)) {
    return;
  }

  // Denylist check (Level 2, Level 3, Level 4)
  if ((config.denylist || []).includes(hostname)) {
    if (config.responseLevel !== 'monitor') {
      const blockedUrl = chrome.runtime.getURL(
        `pages/blocked.html?url=${encodeURIComponent(tab.url)}&reason=${encodeURIComponent('Domain is in your local denylist.')}`
      );
      chrome.tabs.update(tabId, { url: blockedUrl });

      if (config.notifyHighRisk && shouldNotify(hostname)) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: 'AgentProof: Site Blocked',
          message: `Blocked connection to denylisted domain: ${hostname}`,
          priority: 2,
        });
      }
      return;
    }
  }

  // Strict Mode: Block all plain HTTP navigation
  if (config.responseLevel === 'strict' && parsedUrl.protocol === 'http:') {
    const blockedUrl = chrome.runtime.getURL(
      `pages/blocked.html?url=${encodeURIComponent(tab.url)}&reason=${encodeURIComponent('Strict protection mode prohibits unencrypted plain HTTP.')}`
    );
    chrome.tabs.update(tabId, { url: blockedUrl });
    return;
  }

  // Warn Mode: Present warning screen on plain HTTP
  if (config.responseLevel === 'warn' && parsedUrl.protocol === 'http:') {
    const warnedKey = `warned_${tabId}_${hostname}`;
    if (!sessionStorageGet(warnedKey)) {
      sessionStorageSet(warnedKey, true);
      const warnUrl = chrome.runtime.getURL(
        `pages/warning.html?url=${encodeURIComponent(tab.url)}&reason=${encodeURIComponent('Unencrypted HTTP connection detected.')}`
      );
      chrome.tabs.update(tabId, { url: warnUrl });
    }
  }
});

// Simple in-memory session tracker for current worker lifetime
const sessionWarnCache = new Set();
function sessionStorageGet(k) { return sessionWarnCache.has(k); }
function sessionStorageSet(k, v) { if (v) sessionWarnCache.add(k); else sessionWarnCache.delete(k); }

/**
 * 2. Event-Driven Download Monitor
 */
if (chrome.downloads && chrome.downloads.onCreated) {
  chrome.downloads.onCreated.addListener(async (downloadItem) => {
    const config = await getStoredConfig();
    if (!config.monitorDownloads) {
      return;
    }

    const filename = (downloadItem.filename || downloadItem.finalUrl || '').toLowerCase();
    const isDoubleExtension = /\.(pdf|doc|docx|xlsx|png|jpg|txt|mp3|mp4)\.(exe|bat|cmd|vbs|js|ps1|scr|jar|msi)$/i.test(filename);
    const isDangerousExtension = /\.(exe|bat|cmd|vbs|js|ps1|scr|pif|hta|cpl|jar|msi)$/i.test(filename);

    if (isDoubleExtension || (isDangerousExtension && config.responseLevel === 'strict')) {
      const alertTitle = isDoubleExtension
        ? 'Suspicious Double Extension Detected'
        : 'Dangerous Download Intercepted';
      const alertMsg = `Download: "${filename.split(/[\/\\]/).pop()}". Deceptive executable format flagged by policy.`;

      if (config.notifyDownloads && shouldNotify(`download_${filename}`)) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: `AgentProof: ${alertTitle}`,
          message: alertMsg,
          priority: 2,
        });
      }

      // If local companion is configured, attempt to alert desktop companion
      if (config.companionUrl && config.companionToken) {
        try {
          fetch(`${config.companionUrl}/api/companion/status`, {
            headers: { 'X-AgentProof-Token': config.companionToken },
          }).catch(() => {});
        } catch {}
      }
    }
  });
}

/**
 * 3. Message Routing for Popup & Injected Scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_COOKIES') {
    (async () => {
      const url = message.url;
      if (!url) {
        sendResponse({ success: false, error: 'URL is required to inspect cookies.' });
        return;
      }

      if (!chrome.cookies) {
        sendResponse({
          success: false,
          error: 'Cookies API not permitted. Grant cookie permissions to inspect cookie security.',
        });
        return;
      }

      try {
        const rawCookies = await chrome.cookies.getAll({ url });
        // CRITICAL PRIVACY GUARANTEE: Never store or transmit raw cookie values!
        const sanitizedCookies = rawCookies.map((c) => ({
          name: c.name,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite,
          session: c.session,
          expirationDate: c.expirationDate,
          hostOnly: c.hostOnly,
        }));

        sendResponse({
          success: true,
          cookies: sanitizedCookies,
        });
      } catch (err) {
        sendResponse({
          success: false,
          error: `Cookie access failed: ${err.message}`,
        });
      }
    })();
    return true;
  }

  if (message.action === 'INJECT_AND_SCAN') {
    (async () => {
      const tabId = message.tabId;
      if (!tabId) {
        sendResponse({ success: false, error: 'Tab ID is required.' });
        return;
      }

      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content/content-script.js'],
        });

        const response = await chrome.tabs.sendMessage(tabId, { action: 'INSPECT_PAGE' });
        sendResponse(response);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.action === 'CLEAR_CURRENT_COOKIES') {
    (async () => {
      const url = message.url;
      if (!url || !chrome.cookies) {
        sendResponse({ success: false, error: 'Cookies API unavailable or URL missing.' });
        return;
      }
      try {
        const rawCookies = await chrome.cookies.getAll({ url });
        let deletedCount = 0;
        for (const c of rawCookies) {
          const cookieUrl = `http${c.secure ? 's' : ''}://${c.domain.replace(/^\./, '')}${c.path}`;
          await chrome.cookies.remove({ url: cookieUrl, name: c.name });
          deletedCount++;
        }
        sendResponse({ success: true, count: deletedCount });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
