/**
 * Read-Only Content Script for AgentProof Chrome Extension.
 *
 * Safely inspects current page DOM: forms, mixed content, privacy policy links,
 * and site permission states without modifying page state.
 */

(() => {
  // Prevent duplicate execution
  if (window.__agentProofContentScriptLoaded) return;
  window.__agentProofContentScriptLoaded = true;

  /**
   * Inspect form elements and password field placements
   */
  function inspectForms() {
    const forms = [];
    const formElements = Array.from(document.querySelectorAll('form'));

    for (const form of formElements) {
      const passwordInputs = form.querySelectorAll('input[type="password"]');
      const action = form.getAttribute('action') || '';
      const method = (form.getAttribute('method') || 'GET').toUpperCase();

      forms.push({
        action,
        method,
        hasPasswordField: passwordInputs.length > 0,
        passwordFieldCount: passwordInputs.length,
        hasAutocompleteOff: Array.from(passwordInputs).some(
          (p) => p.getAttribute('autocomplete') === 'off'
        ),
      });
    }

    // Also check for orphan password fields outside of any form
    const orphanPasswords = Array.from(document.querySelectorAll('input[type="password"]')).filter(
      (input) => !input.closest('form')
    );

    if (orphanPasswords.length > 0) {
      forms.push({
        action: window.location.href,
        method: 'UNKNOWN',
        hasPasswordField: true,
        passwordFieldCount: orphanPasswords.length,
        isOrphanField: true,
      });
    }

    return forms;
  }

  /**
   * Detect mixed HTTP content loaded on HTTPS pages
   */
  function detectMixedContent() {
    if (window.location.protocol !== 'https:') {
      return { active: [], passive: [] };
    }

    const active = [];
    const passive = [];

    // Active mixed content (scripts, iframes, stylesheets)
    document.querySelectorAll('script[src^="http://"]').forEach((el) => active.push(el.src));
    document.querySelectorAll('iframe[src^="http://"]').forEach((el) => active.push(el.src));
    document.querySelectorAll('link[rel="stylesheet"][src^="http://"], link[rel="stylesheet"][href^="http://"]').forEach((el) => {
      active.push(el.href || el.src);
    });

    // Passive mixed content (images, media)
    document.querySelectorAll('img[src^="http://"]').forEach((el) => passive.push(el.src));
    document.querySelectorAll('audio[src^="http://"], video[src^="http://"]').forEach((el) => passive.push(el.src));

    return { active, passive };
  }

  /**
   * Locate candidate privacy policy and terms links on the page
   */
  function findPolicyLinks() {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const candidates = [];
    const pageOrigin = window.location.origin;

    const regex = /(privacy|terms|cookie|legal|datenschutz|confidentiality)/i;

    for (const a of links) {
      const text = (a.innerText || a.getAttribute('aria-label') || '').trim();
      const href = a.href || '';

      if (regex.test(text) || regex.test(href)) {
        let isSameOrigin = false;
        try {
          isSameOrigin = new URL(href).origin === pageOrigin;
        } catch {
          // ignore invalid urls
        }

        candidates.push({
          text: text.length > 50 ? `${text.substring(0, 47)}...` : text || 'Policy Document',
          url: href,
          isSameOrigin,
        });
      }
    }

    // Sort same-origin first
    candidates.sort((a, b) => (b.isSameOrigin ? 1 : 0) - (a.isSameOrigin ? 1 : 0));
    return candidates.slice(0, 5);
  }

  /**
   * Query site permissions via standard navigator.permissions API
   */
  async function queryPermissions() {
    if (!navigator.permissions || !navigator.permissions.query) {
      return [];
    }

    const permissionNames = ['camera', 'microphone', 'geolocation', 'notifications', 'clipboard-read'];
    const results = [];

    for (const name of permissionNames) {
      try {
        const status = await navigator.permissions.query({ name });
        results.push({ name, state: status.state });
      } catch (err) {
        results.push({ name, state: 'unknown' });
      }
    }

    return results;
  }

  /**
   * Fetch same-origin policy text (capped at 50KB)
   */
  async function fetchPolicySnippet(policyUrl) {
    if (!policyUrl) return null;
    try {
      const parsed = new URL(policyUrl, window.location.href);
      // Ensure same origin to avoid CORS errors
      if (parsed.origin !== window.location.origin) {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(parsed.href, {
        signal: controller.signal,
        credentials: 'omit',
      });
      clearTimeout(timeoutId);

      if (!resp.ok) return null;
      const htmlText = await resp.text();

      // Simple HTML-to-text conversion in memory
      const tempDoc = new DOMParser().parseFromString(htmlText.substring(0, 50000), 'text/html');
      return tempDoc.body ? tempDoc.body.innerText.replace(/\s+/g, ' ').trim() : null;
    } catch (err) {
      return null;
    }
  }

  // Handle messages from popup / service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'INSPECT_PAGE') {
      (async () => {
        try {
          const forms = inspectForms();
          const mixedContent = detectMixedContent();
          const policyLinks = findPolicyLinks();
          const permissions = await queryPermissions();

          // Try to fetch policy text from top candidate if same origin
          let policyText = null;
          let policyUrl = null;
          if (policyLinks.length > 0 && policyLinks[0].isSameOrigin) {
            policyUrl = policyLinks[0].url;
            policyText = await fetchPolicySnippet(policyUrl);
          } else if (policyLinks.length > 0) {
            policyUrl = policyLinks[0].url;
          }

          sendResponse({
            success: true,
            pageDetails: {
              url: window.location.href,
              origin: window.location.origin,
              hostname: window.location.hostname,
              forms,
              mixedContent,
              policyLinks,
              policyText,
              policyUrl,
              permissions,
            },
          });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true; // Keep message channel open for async response
    }
  });
})();
