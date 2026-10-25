import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzePrivacyPolicyText } from '../scanner/privacy.js';
import { generateJsonReport, generateHtmlReport } from '../reports/generator.js';
import { calculateRiskScore, createFinding, CATEGORIES } from '../risk/scoring.js';

test('Privacy Scanner — Analyzes policy text and identifies disclosures', () => {
  const policySample = `
    Welcome to ExampleCorp Privacy Policy.
    We collect your personal details. We share personal data with third-party advertising partners and data brokers.
    We use web beacons and cross-device analytics trackers.
    We retain user data indefinitely as long as needed.
    You may request account deletion under GDPR at privacy@examplecorp.com.
  `;

  const result = analyzePrivacyPolicyText(policySample, 'https://example.com/privacy');
  assert.equal(result.status, 'Analyzed');
  assert.ok(result.categories.length >= 4);

  // Check that third party sharing was detected
  const thirdParty = result.categories.find((c) => c.id === 'third_party_sharing');
  assert.ok(thirdParty);
  assert.equal(thirdParty.detected, true);

  // Check that web tracking was detected
  const tracking = result.categories.find((c) => c.id === 'tracking_technologies');
  assert.ok(tracking);
  assert.equal(tracking.detected, true);

  // Check that deletion rights were documented
  const deletion = result.categories.find((c) => c.id === 'deletion_rights');
  assert.ok(deletion);
  assert.equal(deletion.detected, true);
  assert.equal(deletion.positive, true);
});

test('Privacy Scanner — Handles empty or inaccessible policy documents', () => {
  const result = analyzePrivacyPolicyText('', 'https://example.com/privacy');
  assert.equal(result.status, 'Inaccessible');
  assert.ok(result.findings.some((f) => f.id === 'policy_unreadable'));
});

test('Reports Generator — JSON export is well-structured and contains no secrets', () => {
  const dummyFinding = createFinding({
    id: 'test_finding',
    category: CATEGORIES.TECHNICAL,
    title: 'Test Finding',
    severity: 'medium',
    weight: 20,
    evidence: 'Example evidence pattern',
    remediation: 'Apply security configuration',
  });

  const scoring = calculateRiskScore([dummyFinding]);

  const scanState = {
    url: 'https://example.com',
    hostname: 'example.com',
    scoring,
    connection: { isHttps: true, formsCount: 1 },
    cookies: {
      metadataSummary: {
        totalCookies: 1,
        cookies: [{ displayName: 'sess_***', secure: true, httpOnly: true, sameSite: 'lax', domain: 'example.com' }],
      },
    },
    permissions: { permissions: [] },
    privacy: { status: 'Analyzed', policyUrl: 'https://example.com/privacy', categories: [] },
  };

  const jsonStr = generateJsonReport(scanState);
  assert.ok(jsonStr.length > 50);

  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.metadata.targetHostname, 'example.com');
  assert.equal(parsed.riskAssessment.score, 20);
  assert.equal(parsed.riskAssessment.riskLevel, 'Low');
  assert.equal(
    parsed.riskAssessment.officialRecommendation,
    'No major issues were detected in the checks performed. Logging in may be reasonable, but safety is not guaranteed.'
  );

  // Verify no secret value fields exist
  assert.equal(JSON.stringify(parsed).includes('"value":'), false);
  assert.equal(JSON.stringify(parsed).includes('password'), false);
});

test('Reports Generator — HTML report renders valid document with recommendation', () => {
  const dummyFinding = createFinding({
    id: 'test_finding',
    category: CATEGORIES.TECHNICAL,
    title: 'Test HTML Finding',
    severity: 'high',
    weight: 55,
    evidence: 'Insecure protocol',
    remediation: 'Upgrade to TLS',
  });

  const scoring = calculateRiskScore([dummyFinding]);

  const scanState = {
    url: 'https://example.com',
    hostname: 'example.com',
    scoring,
    connection: { isHttps: true },
    cookies: { metadataSummary: { totalCookies: 0, cookies: [] } },
    permissions: { permissions: [] },
    privacy: { status: 'Not checked', categories: [] },
  };

  const htmlStr = generateHtmlReport(scanState);
  assert.ok(htmlStr.includes('<!DOCTYPE html>'));
  assert.ok(htmlStr.includes('AgentProof'));
  assert.ok(htmlStr.includes('Test HTML Finding'));
  assert.ok(htmlStr.includes('55'));
  assert.ok(htmlStr.includes('Avoid entering credentials until the significant issues are resolved'));
});
