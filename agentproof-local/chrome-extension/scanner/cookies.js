/**
 * Cookie Security Scanner for AgentProof Chrome Extension.
 *
 * Evaluates cookie security flags (Secure, HttpOnly, SameSite, Domain scoping)
 * without ever exposing, exporting, storing, or transmitting cookie values.
 */

import { CATEGORIES, createFinding } from '../risk/scoring.js';

// Exact and bounded session/authentication token patterns
const AUTH_COOKIE_EXACT = /^(?:_?gh_sess|_?session|_?token|auth_token|authtoken|user_session|sessionid|connect\.sid|phpsessid|jsessionid|jwt|access_token|refresh_token|__host-[a-z0-9_-]+|__secure-[a-z0-9_-]+)$/i;
const AUTH_COOKIE_PREFIX = /^(?:session|auth|jwt|sso)[_-]/i;

// Excluded non-sensitive UI/analytics patterns (e.g. dotcom_user, tz, color_mode, device_id)
const NON_AUTH_COOKIE_PATTERN = /(?:device_id|client_id|analytics|_octo|tz|theme|lang|locale|display|view|opt_out|banner|crumb|csrf|xsrf|user$)/i;

/**
 * Check if a cookie is genuinely an authentication / session token
 */
function isAuthSessionCookie(name) {
  if (!name || typeof name !== 'string') return false;
  const clean = name.trim();
  if (NON_AUTH_COOKIE_PATTERN.test(clean)) return false;
  return AUTH_COOKIE_EXACT.test(clean) || AUTH_COOKIE_PREFIX.test(clean);
}

/**
 * Redact sensitive cookie names for safe display in UI/reports
 */
export function sanitizeCookieName(name) {
  if (!name || typeof name !== 'string') return 'anonymous_cookie';
  if (isAuthSessionCookie(name)) {
    if (name.length <= 4) return `${name.substring(0, 1)}***`;
    return `${name.substring(0, 3)}_***`;
  }
  return name.length > 25 ? `${name.substring(0, 22)}...` : name;
}

/**
 * Analyze cookie metadata for security configuration weaknesses.
 *
 * NOTE: The input `cookies` list must only contain metadata objects.
 * Values are stripped/ignored.
 *
 * @param {Array<Object>} cookieList - Array of cookie metadata objects
 * @param {string} pageUrl - Current page URL
 * @returns {Object} Findings and metadata summary
 */
export function analyzeCookies(cookieList = [], pageUrl = '') {
  const findings = [];
  let isHttps = true;
  let pageHost = '';

  try {
    const parsed = new URL(pageUrl);
    isHttps = parsed.protocol === 'https:';
    pageHost = parsed.hostname.toLowerCase();
  } catch {
    // default to secure assumptions if url is ambiguous
  }

  const sanitizedSummary = [];
  let sensitiveCount = 0;
  let missingSecureCount = 0;
  let missingHttpOnlyCount = 0;
  let weakSameSiteCount = 0;
  let broadDomainCount = 0;

  for (const c of cookieList) {
    if (!c) continue;

    const rawName = c.name || '';
    const safeName = sanitizeCookieName(rawName);
    const isSensitive = isAuthSessionCookie(rawName);
    const isSecure = Boolean(c.secure);
    const isHttpOnly = Boolean(c.httpOnly);
    const sameSite = (c.sameSite || 'unspecified').toLowerCase();
    const domain = (c.domain || '').toLowerCase();
    const isHostOnly = Boolean(c.hostOnly);
    const isSession = Boolean(c.session);

    if (isSensitive) sensitiveCount++;

    // Record sanitized metadata record (VALUE NEVER INCLUDED)
    sanitizedSummary.push({
      displayName: safeName,
      isSensitivePattern: isSensitive,
      secure: isSecure,
      httpOnly: isHttpOnly,
      sameSite,
      domain,
      hostOnly: isHostOnly,
      session: isSession,
      hasExpiration: !isSession && typeof c.expirationDate === 'number',
    });

    // 1. Sensitive auth cookie lacking Secure flag on HTTPS site
    if (isHttps && isSensitive && !isSecure) {
      missingSecureCount++;
      findings.push(
        createFinding({
          id: `cookie_missing_secure_${rawName}`,
          title: `Authentication Cookie Lacking Secure Flag (${safeName})`,
          category: CATEGORIES.TECHNICAL,
          severity: 'high',
          weight: 20,
          evidence: `Authentication cookie '${safeName}' lacks the Secure attribute.`,
          remediation: 'Set the Secure flag so session credentials are only transmitted over TLS.',
        })
      );
    }

    // 2. Sensitive auth cookie lacking HttpOnly flag
    if (isSensitive && !isHttpOnly) {
      missingHttpOnlyCount++;
      findings.push(
        createFinding({
          id: `cookie_missing_httponly_${rawName}`,
          title: `Session Cookie Accessible to JavaScript (${safeName})`,
          category: CATEGORIES.POTENTIAL_SECURITY,
          severity: 'medium',
          weight: 12,
          evidence: `Session token '${safeName}' lacks the HttpOnly attribute and is readable by client-side scripts.`,
          remediation: 'Add HttpOnly to prevent script access. (Note: Non-credential UI cookies may legitimately omit HttpOnly).',
        })
      );
    }

    // 3. Weak or missing SameSite configuration on auth cookie
    if (sameSite === 'no_restriction' && !isSecure) {
      weakSameSiteCount++;
      findings.push(
        createFinding({
          id: `cookie_samesite_none_insecure_${rawName}`,
          title: `SameSite=None Without Secure Attribute (${safeName})`,
          category: CATEGORIES.TECHNICAL,
          severity: 'high',
          weight: 20,
          evidence: `Cookie '${safeName}' uses SameSite=None without the required Secure attribute.`,
          remediation: 'Pair SameSite=None with the Secure flag, or use SameSite=Lax for standard web applications.',
        })
      );
    } else if (isSensitive && (sameSite === 'unspecified' || sameSite === 'none' || sameSite === 'no_restriction')) {
      weakSameSiteCount++;
      findings.push(
        createFinding({
          id: `cookie_weak_samesite_${rawName}`,
          title: `Weak SameSite Attribute on Session Cookie (${safeName})`,
          category: CATEGORIES.POTENTIAL_SECURITY,
          severity: 'low',
          weight: 6,
          evidence: `Session cookie '${safeName}' uses SameSite='${sameSite}', which may allow cross-site inclusion.`,
          remediation: 'Configure SameSite=Lax or SameSite=Strict to defend against Cross-Site Request Forgery.',
        })
      );
    }

    // 4. Overly broad cookie domain scoping (e.g. scoping to public suffix or TLD)
    if (domain.startsWith('.') && pageHost) {
      const cleanDomain = domain.replace(/^\./, '');
      const domainParts = cleanDomain.split('.');
      const hostParts = pageHost.split('.');

      // Only flag if domain is excessively high-level (e.g. across 3+ levels or root public suffix)
      if (hostParts.length > domainParts.length + 1 && domainParts.length <= 2) {
        broadDomainCount++;
        findings.push(
          createFinding({
            id: `cookie_broad_domain_${rawName}`,
            title: `Broadly Scoped Cookie Domain (${safeName})`,
            category: CATEGORIES.POTENTIAL_SECURITY,
            severity: 'low',
            weight: 4,
            evidence: `Cookie '${safeName}' domain '${domain}' is shared across all sibling subdomains.`,
            remediation: 'Restrict cookie scoping to the specific host unless cross-subdomain sharing is required.',
          })
        );
      }
    }
  }

  return {
    findings,
    metadataSummary: {
      totalCookies: cookieList.length,
      sensitivePatternsDetected: sensitiveCount,
      missingSecure: missingSecureCount,
      missingHttpOnly: missingHttpOnlyCount,
      weakSameSite: weakSameSiteCount,
      broadDomain: broadDomainCount,
      cookies: sanitizedSummary,
    },
  };
}
