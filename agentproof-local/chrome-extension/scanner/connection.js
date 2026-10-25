/**
 * Connection, URL, and Form Security Scanner for AgentProof Chrome Extension.
 *
 * Evaluates transport security (HTTPS/HTTP), mixed content, cross-origin forms,
 * insecure password fields, and hostname anomalies.
 */

import { CATEGORIES, createFinding } from '../risk/scoring.js';

const RESTRICTED_SCHEMES = ['chrome:', 'chrome-extension:', 'edge:', 'devtools:', 'about:', 'view-source:', 'file:'];
const WEBSTORE_HOSTS = ['chromewebstore.google.com', 'chrome.google.com'];

/**
 * Check if a URL is restricted from extension content scripts
 */
export function isRestrictedUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return true;
  try {
    const parsed = new URL(urlString);
    if (RESTRICTED_SCHEMES.includes(parsed.protocol)) return true;
    if (WEBSTORE_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Extract base registrable domain (e.g. github.com from api.github.com)
 */
function getBaseDomain(hostname) {
  if (!hostname) return '';
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname.toLowerCase();
  // Simple multi-part TLD check (e.g. co.uk)
  const isSecondLevel = ['co.uk', 'com.au', 'co.jp', 'gov.uk', 'org.uk'].some((tld) =>
    hostname.endsWith(`.${tld}`)
  );
  if (isSecondLevel && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Check if two hostnames belong to the same parent organization
 */
function isSameOrganization(hostA, hostB) {
  if (!hostA || !hostB) return false;
  const a = hostA.toLowerCase();
  const b = hostB.toLowerCase();
  if (a === b) return true;
  const baseA = getBaseDomain(a);
  const baseB = getBaseDomain(b);
  return baseA === baseB && baseA.length > 0;
}

/**
 * Inspect page connection and URL properties
 *
 * @param {string} urlString - Full page URL
 * @param {Object} pageDetails - DOM inspection payload from content script
 * @returns {Array<Object>} List of security findings
 */
export function analyzeConnection(urlString, pageDetails = {}) {
  const findings = [];

  let url;
  try {
    url = new URL(urlString);
  } catch (err) {
    findings.push(
      createFinding({
        id: 'invalid_url',
        title: 'Invalid or Malformed URL',
        category: CATEGORIES.UNVERIFIED,
        severity: 'medium',
        weight: 12,
        evidence: `URL cannot be parsed: ${urlString}`,
        remediation: 'Verify the browser address bar before interacting or entering information.',
      })
    );
    return findings;
  }

  // 1. Check for restricted browser pages
  if (isRestrictedUrl(urlString)) {
    findings.push(
      createFinding({
        id: 'restricted_page',
        title: 'Restricted Browser Internal Page',
        category: CATEGORIES.UNVERIFIED,
        severity: 'low',
        weight: 0,
        evidence: `Page scheme '${url.protocol}' is restricted by browser security policy.`,
        remediation: 'Browser security architecture restricts extension execution on internal and store pages.',
      })
    );
    return findings;
  }

  // 2. Transport encryption check: HTTPS vs plain HTTP
  const isHttps = url.protocol === 'https:';
  if (!isHttps) {
    findings.push(
      createFinding({
        id: 'insecure_http_transport',
        title: 'Unencrypted HTTP Connection',
        category: CATEGORIES.TECHNICAL,
        severity: 'high',
        weight: 35,
        evidence: `Site transmits data over plain HTTP (${url.origin}).`,
        remediation: 'Avoid transmitting any credentials, cookies, or personal information over plain HTTP.',
      })
    );
  }

  // 3. Hostname inspection: IP address, Punycode, Deceptive brand names in subdomains
  const hostname = url.hostname.toLowerCase();

  // IPv4 or IPv6 literal
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[');
  if (isIpAddress) {
    findings.push(
      createFinding({
        id: 'ip_address_host',
        title: 'Numeric IP Address Hostname',
        category: CATEGORIES.POTENTIAL_SECURITY,
        severity: 'high',
        weight: 25,
        evidence: `Host is a raw IP address (${hostname}) rather than a verified domain name.`,
        remediation: 'Legitimate services generally use domain names with trusted certificates. Exercise caution.',
      })
    );
  }

  // Punycode / Internationalized Domain Name (Homograph risk)
  if (hostname.includes('xn--')) {
    findings.push(
      createFinding({
        id: 'punycode_homograph',
        title: 'Punycode Internationalized Domain Name Detected',
        category: CATEGORIES.POTENTIAL_SECURITY,
        severity: 'medium',
        weight: 15,
        evidence: `Domain '${hostname}' uses Punycode encoding, which can be used for homograph deception.`,
        remediation: 'Carefully verify the intended domain spelling in the address bar before entering credentials.',
      })
    );
  }

  // Deceptive subdomains: brand name preceding another domain (e.g. paypal.com.evil.com)
  const suspiciousBrands = ['paypal', 'google', 'apple', 'microsoft', 'amazon', 'facebook', 'bank', 'github', 'chase'];
  const baseDomain = getBaseDomain(hostname);

  for (const brand of suspiciousBrands) {
    // If the base domain is the brand's authentic domain (e.g. github.com), skip!
    if (baseDomain === `${brand}.com` || baseDomain === `${brand}.org` || baseDomain === `${brand}.net`) {
      continue;
    }

    const parts = hostname.split('.');
    const brandIndex = parts.indexOf(brand);
    // If brand appears in subdomains but NOT as the verified base domain
    if (brandIndex !== -1 && brandIndex < parts.length - 2) {
      findings.push(
        createFinding({
          id: `deceptive_subdomain_${brand}`,
          title: `Suspicious Brand Reference in Subdomain (${brand})`,
          category: CATEGORIES.POTENTIAL_SECURITY,
          severity: 'high',
          weight: 30,
          evidence: `The name '${brand}' appears in subdomains of unverified base domain '${baseDomain}'.`,
          remediation: 'Verify this is an authentic domain owned by the referenced organization before logging in.',
        })
      );
      break;
    }
  }

  // 4. Form security analysis (from DOM inspection)
  const forms = pageDetails.forms || [];

  for (const [idx, form] of forms.entries()) {
    const hasPassword = form.hasPasswordField;
    const actionUrl = form.action || '';
    let parsedAction;
    try {
      parsedAction = new URL(actionUrl, urlString);
    } catch {
      parsedAction = null;
    }

    // A. Password field on plain HTTP page -> Critical override
    if (hasPassword && !isHttps) {
      findings.push(
        createFinding({
          id: `http_password_form_${idx}`,
          title: 'Critical Warning: Password Form on Plain HTTP',
          category: CATEGORIES.TECHNICAL,
          severity: 'critical',
          weight: 60,
          isCriticalOverride: true,
          evidence: `Form #${idx + 1} requests passwords over unencrypted HTTP.`,
          remediation: 'Do not enter credentials while the critical warning remains unresolved. Plaintext credentials can be intercepted by network eavesdroppers.',
        })
      );
    }

    // B. Form action transmits over HTTP on an HTTPS site -> Critical override if password
    if (isHttps && parsedAction && parsedAction.protocol === 'http:') {
      findings.push(
        createFinding({
          id: `insecure_form_action_${idx}`,
          title: 'Insecure Form Submission Destination (HTTP)',
          category: CATEGORIES.TECHNICAL,
          severity: 'critical',
          weight: 55,
          isCriticalOverride: hasPassword,
          evidence: `Form action points to unencrypted HTTP destination: ${parsedAction.origin}`,
          remediation: 'Credentials or form submissions would be transmitted in cleartext. Do not submit this form.',
        })
      );
    }

    // C. Cross-origin form destination
    // Exclude same-organization subdomains (e.g. collector.github.com on github.com)
    // and standard identity providers (OAuth).
    if (parsedAction && parsedAction.origin !== url.origin) {
      const isFirstPartySubdomain = isSameOrganization(parsedAction.hostname, url.hostname);
      const isKnownOAuth = /accounts\.google\.com|login\.microsoftonline\.com|appleid\.apple.com|github\.com/i.test(
        parsedAction.hostname
      );

      if (!isFirstPartySubdomain && !isKnownOAuth) {
        if (hasPassword) {
          findings.push(
            createFinding({
              id: `cross_origin_login_form_${idx}`,
              title: 'Cross-Origin Credential Form Destination',
              category: CATEGORIES.POTENTIAL_SECURITY,
              severity: 'high',
              weight: 25,
              evidence: `Form targets external origin '${parsedAction.origin}' instead of current origin '${url.origin}'.`,
              remediation: 'Cross-origin submission can be legitimate (SSO/identity provider) or an exfiltration vector. Confirm the target service is trustworthy.',
            })
          );
        } else {
          findings.push(
            createFinding({
              id: `cross_origin_form_${idx}`,
              title: 'Form Submits to External Origin',
              category: CATEGORIES.POTENTIAL_SECURITY,
              severity: 'low',
              weight: 5,
              evidence: `Form submission destination '${parsedAction.origin}' differs from current page origin.`,
              remediation: 'Ensure the external service is an intended partner or provider before submitting personal data.',
            })
          );
        }
      }
    }
  }

  // 5. Mixed Content Analysis (from DOM inspection)
  const mixedContent = pageDetails.mixedContent || {};
  const activeMixed = mixedContent.active || [];
  const passiveMixed = mixedContent.passive || [];

  if (isHttps && activeMixed.length > 0) {
    findings.push(
      createFinding({
        id: 'active_mixed_content',
        title: 'Active Mixed Content Detected',
        category: CATEGORIES.TECHNICAL,
        severity: 'high',
        weight: 28,
        evidence: `${activeMixed.length} insecure script(s), stylesheet(s), or iframe(s) loaded over HTTP (e.g. ${activeMixed[0]}).`,
        remediation: 'Active mixed content allows network attackers to alter page behavior or inject malicious scripts.',
      })
    );
  }

  if (isHttps && passiveMixed.length > 0) {
    findings.push(
      createFinding({
        id: 'passive_mixed_content',
        title: 'Passive Mixed Content Detected',
        category: CATEGORIES.TECHNICAL,
        severity: 'low',
        weight: 6,
        evidence: `${passiveMixed.length} insecure media/image resource(s) loaded over HTTP (e.g. ${passiveMixed[0]}).`,
        remediation: 'Passive content can reveal user browsing activity to network observers. Sites should migrate all assets to HTTPS.',
      })
    );
  }

  return findings;
}
