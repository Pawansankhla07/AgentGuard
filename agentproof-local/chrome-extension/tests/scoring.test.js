import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskScore,
  createFinding,
  RISK_LEVELS,
  RECOMMENDATIONS,
  CATEGORIES,
} from '../risk/scoring.js';

test('Risk Engine — Empty findings produces score 0 and Low risk with exact wording', () => {
  const result = calculateRiskScore([], { connectionChecked: true });
  assert.equal(result.score, 0);
  assert.equal(result.level, RISK_LEVELS.LOW);
  assert.equal(
    result.recommendation,
    'No major issues were detected in the checks performed. Logging in may be reasonable, but safety is not guaranteed.'
  );
  assert.equal(result.hasCriticalOverride, false);
  assert.equal(result.totalFindings, 0);
});

test('Risk Engine — Medium risk score band and recommendation', () => {
  const findings = [
    createFinding({
      id: 'weak_cookie_1',
      category: CATEGORIES.POTENTIAL_SECURITY,
      title: 'Missing SameSite',
      severity: 'medium',
      weight: 30,
    }),
  ];
  const result = calculateRiskScore(findings);
  assert.equal(result.score, 30);
  assert.equal(result.level, RISK_LEVELS.MEDIUM);
  assert.equal(result.recommendation, 'Review the highlighted issues before logging in.');
});

test('Risk Engine — High risk score band and recommendation', () => {
  const findings = [
    createFinding({
      id: 'active_mixed_content',
      category: CATEGORIES.TECHNICAL,
      title: 'Active Mixed Content',
      severity: 'high',
      weight: 32,
    }),
    createFinding({
      id: 'auth_cookie_insecure',
      category: CATEGORIES.POTENTIAL_SECURITY,
      title: 'Insecure Auth Cookie',
      severity: 'high',
      weight: 30,
    }),
  ];
  const result = calculateRiskScore(findings);
  assert.equal(result.score, 62);
  assert.equal(result.level, RISK_LEVELS.HIGH);
  assert.equal(
    result.recommendation,
    'Avoid entering credentials until the significant issues are resolved or independently verified.'
  );
});

test('Risk Engine — Critical override triggers minimum score 75 and Critical recommendation', () => {
  // Even if the finding weight was small, critical severity triggers override
  const findings = [
    createFinding({
      id: 'http_password_form',
      category: CATEGORIES.TECHNICAL,
      title: 'Password form on plain HTTP',
      severity: 'critical',
      weight: 40,
      isCriticalOverride: true,
    }),
  ];
  const result = calculateRiskScore(findings);
  assert.ok(result.score >= 75);
  assert.equal(result.level, RISK_LEVELS.CRITICAL);
  assert.equal(
    result.recommendation,
    'Do not enter credentials while the critical warning remains unresolved.'
  );
  assert.equal(result.hasCriticalOverride, true);
  assert.ok(result.criticalOverrideReason.includes('Password form on plain HTTP'));
});

test('Risk Engine — Score boundary capping at 100', () => {
  const findings = [];
  for (let i = 0; i < 20; i++) {
    findings.push(
      createFinding({
        id: `issue_${i}`,
        category: CATEGORIES.TECHNICAL,
        title: `Issue #${i}`,
        severity: 'critical',
        weight: 30,
        isCriticalOverride: true,
      })
    );
  }
  const result = calculateRiskScore(findings);
  assert.equal(result.score, 100);
  assert.ok(result.score <= 100);
});

test('Risk Engine — Deduplication of identical finding IDs', () => {
  const f1 = createFinding({
    id: 'duplicate_issue',
    category: CATEGORIES.POTENTIAL_SECURITY,
    title: 'Duplicate finding',
    severity: 'medium',
    weight: 15,
  });
  const f2 = createFinding({
    id: 'duplicate_issue',
    category: CATEGORIES.POTENTIAL_SECURITY,
    title: 'Duplicate finding duplicate',
    severity: 'medium',
    weight: 15,
  });

  const result = calculateRiskScore([f1, f2]);
  assert.equal(result.totalFindings, 1);
  assert.equal(result.score, 15);
});

test('Risk Engine — Category separation', () => {
  const f1 = createFinding({
    id: 'tech_1',
    category: CATEGORIES.TECHNICAL,
    title: 'Unencrypted HTTP',
    severity: 'high',
    weight: 30,
  });
  const f2 = createFinding({
    id: 'priv_1',
    category: CATEGORIES.PRIVACY,
    title: 'Third party advertising',
    severity: 'medium',
    weight: 15,
  });

  const result = calculateRiskScore([f1, f2]);
  assert.equal(result.categoryBuckets[CATEGORIES.TECHNICAL].length, 1);
  assert.equal(result.categoryBuckets[CATEGORIES.PRIVACY].length, 1);
  assert.equal(result.categoryBuckets[CATEGORIES.POTENTIAL_SECURITY].length, 0);
});
