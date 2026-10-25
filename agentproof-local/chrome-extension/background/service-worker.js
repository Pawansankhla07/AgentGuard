/**
 * Service Worker for AgentProof Chrome Extension.
 *
 * Coordinates content script injection and privileged Cookies API queries
 * with strict privacy enforcement (all cookie values stripped).
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AgentProof] Extension installed. Ready for local security evaluation.');
});

/**
 * Handle incoming messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_COOKIES') {
    (async () => {
      const url = message.url;
      if (!url) {
        sendResponse({ success: false, error: 'URL is required to inspect cookies.' });
        return;
      }

      // Check if cookies API is available
      if (!chrome.cookies) {
        sendResponse({
          success: false,
          error: 'Cookies API not permitted. Grant cookie permissions to inspect cookie security.',
        });
        return;
      }

      try {
        const rawCookies = await chrome.cookies.getAll({ url });

        // CRITICAL PRIVACY RULE: Strip values immediately. Only forward metadata.
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
    return true; // Keep message channel open for async response
  }

  if (message.action === 'INJECT_AND_SCAN') {
    (async () => {
      const tabId = message.tabId;
      if (!tabId) {
        sendResponse({ success: false, error: 'Tab ID is required.' });
        return;
      }

      try {
        // Inject content script into active tab
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content/content-script.js'],
        });

        // Query the injected content script for page analysis
        const response = await chrome.tabs.sendMessage(tabId, { action: 'INSPECT_PAGE' });
        sendResponse(response);
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
