import test from 'node:test';
import assert from 'node:assert/strict';
import { isRestrictedUrl, analyzeConnection } from '../scanner/connection.js';
import { sanitizeCookieName, analyzeCookies } from '../scanner/cookies.js';

test('Connection Scanner — Detects restricted browser pages', () => {
  assert.equal(isRestrictedUrl('chrome://settings'), true);
  assert.equal(isRestrictedUrl('edge://extensions'), true);
  assert.equal(isRestrictedUrl('about:blank'), true);
  assert.equal(isRestrictedUrl('https://chromewebstore.google.com/detail/123'), true);
  assert.equal(isRestrictedUrl('https://example.com/login'), false);
});

test('Connection Scanner — Flags plain HTTP as unencrypted transport', () => {
  const findings = analyzeConnection('http://example.com');
  assert.ok(findings.some((f) => f.id === 'insecure_http_transport'));
  assert.equal(findings.find((f) => f.id === 'insecure_http_transport').severity, 'high');
});

test('Connection Scanner — Detects IP address hostnames and punycode', () => {
  const ipFindings = analyzeConnection('http://192.168.1.1/dashboard');
  assert.ok(ipFindings.some((f) => f.id === 'ip_address_host'));

  const punycodeFindings = analyzeConnection('https://xn--pple-43d.com');
  assert.ok(punycodeFindings.some((f) => f.id === 'punycode_homograph'));
});

test('Connection Scanner — Password form on HTTP triggers Critical override', () => {
  const pageDetails = {
    forms: [
      {
        action: 'http://insecure-site.com/login',
        hasPasswordField: true,
        method: 'POST',
      },
    ],
  };

  const findings = analyzeConnection('http://insecure-site.com/login', pageDetails);
  const criticalForm = findings.find((f) => f.id.startsWith('http_password_form'));
  assert.ok(criticalForm, 'Should have critical password form finding');
  assert.equal(criticalForm.severity, 'critical');
  assert.equal(criticalForm.isCriticalOverride, true);
});

test('Cookie Scanner — Redacts sensitive cookie names', () => {
  assert.equal(sanitizeCookieName('session_id'), 'ses_***');
  assert.equal(sanitizeCookieName('authToken'), 'aut_***');
  assert.equal(sanitizeCookieName('jwt'), 'j***');
  assert.equal(sanitizeCookieName('theme_mode'), 'theme_mode');
});

test('Cookie Scanner — Flags sensitive cookie lacking Secure flag on HTTPS', () => {
  const cookieList = [
    {
      name: 'session_token',
      secure: false, // Insecure!
      httpOnly: true,
      sameSite: 'lax',
      domain: 'example.com',
    },
  ];

  const result = analyzeCookies(cookieList, 'https://example.com');
  const secureFinding = result.findings.find((f) => f.id.includes('missing_secure'));
  assert.ok(secureFinding);
  assert.equal(secureFinding.severity, 'high');
  assert.equal(result.metadataSummary.missingSecure, 1);
});

test('Cookie Scanner — Flags sensitive cookie lacking HttpOnly flag', () => {
  const cookieList = [
    {
      name: 'auth_jwt',
      secure: true,
      httpOnly: false, // Script readable!
      sameSite: 'lax',
      domain: 'example.com',
    },
  ];

  const result = analyzeCookies(cookieList, 'https://example.com');
  const httpOnlyFinding = result.findings.find((f) => f.id.includes('missing_httponly'));
  assert.ok(httpOnlyFinding);
  assert.equal(httpOnlyFinding.severity, 'medium');
  assert.equal(result.metadataSummary.missingHttpOnly, 1);
});

test('Cookie Scanner — Flags SameSite=None without Secure attribute', () => {
  const cookieList = [
    {
      name: 'tracker_id',
      secure: false,
      httpOnly: false,
      sameSite: 'no_restriction',
      domain: 'example.com',
    },
  ];

  const result = analyzeCookies(cookieList, 'https://example.com');
  assert.ok(result.findings.some((f) => f.id.includes('samesite_none_insecure')));
});
