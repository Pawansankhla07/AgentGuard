/**
 * Deterministic Risk Scoring Engine for AgentProof Chrome Extension.
 *
 * Computes heuristic risk scores (0-100), risk tiers, and official recommendations
 * with transparent signal weighting, category subscore bounds, deduplication,
 * and critical overrides.
 */

export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const RECOMMENDATIONS = {
  LOW: 'No major issues were detected in the checks performed. Logging in may be reasonable, but safety is not guaranteed.',
  MEDIUM: 'Review the highlighted issues before logging in.',
  HIGH: 'Avoid entering credentials until the significant issues are resolved or independently verified.',
  CRITICAL: 'Do not enter credentials while the critical warning remains unresolved.',
};

export const SEVERITY_WEIGHTS = {
  low: 5,
  medium: 14,
  high: 28,
  critical: 55,
};

export const CATEGORIES = {
  TECHNICAL: 'Confirmed technical observations',
  POTENTIAL_SECURITY: 'Potential security concerns',
  PRIVACY: 'Privacy-policy concerns',
  UNVERIFIED: 'Unknown or unverified conditions',
};

/**
 * Standard finding constructor helper
 */
export function createFinding({
  id,
  title,
  category = CATEGORIES.POTENTIAL_SECURITY,
  severity = 'low',
  weight = null,
  evidence = '',
  remediation = '',
  isCriticalOverride = false,
}) {
  const finalWeight = typeof weight === 'number' ? weight : (SEVERITY_WEIGHTS[severity] || 5);
  return {
    id,
    title,
    category,
    severity: severity.toLowerCase(),
    weight: Math.max(0, finalWeight),
    evidence,
    remediation,
    isCriticalOverride,
  };
}

/**
 * Calculate deterministic risk assessment from a list of findings and scan coverage.
 *
 * @param {Array<Object>} findings - List of detected finding objects.
 * @param {Object} coverage - Scan coverage status dictionary.
 * @returns {Object} Comprehensive scoring assessment.
 */
export function calculateRiskScore(findings = [], coverage = {}) {
  if (!Array.isArray(findings)) {
    findings = [];
  }

  // 1. Deduplicate findings by unique ID
  const seenIds = new Set();
  const dedupedFindings = [];

  for (const item of findings) {
    if (!item || !item.id) continue;
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    dedupedFindings.push(item);
  }

  // 2. Separate into category buckets
  const categoryBuckets = {
    [CATEGORIES.TECHNICAL]: [],
    [CATEGORIES.POTENTIAL_SECURITY]: [],
    [CATEGORIES.PRIVACY]: [],
    [CATEGORIES.UNVERIFIED]: [],
  };

  for (const f of dedupedFindings) {
    const cat = f.category || CATEGORIES.POTENTIAL_SECURITY;
    if (categoryBuckets[cat]) {
      categoryBuckets[cat].push(f);
    } else {
      categoryBuckets[CATEGORIES.POTENTIAL_SECURITY].push(f);
    }
  }

  // 3. Category Subscore Calculation with diminishing returns
  // This prevents multiple minor privacy disclosures or UI cookies from falsely inflating a score.

  // Category A: Confirmed Technical Observations (Transport, HTTP, Form Action targets, Mixed Content)
  let techRaw = 0;
  for (const f of categoryBuckets[CATEGORIES.TECHNICAL]) {
    techRaw += f.weight;
  }
  const techScore = Math.min(65, techRaw);

  // Category B: Potential Security Concerns (Real Auth Cookies, Risky Permissions)
  let secRaw = 0;
  for (const f of categoryBuckets[CATEGORIES.POTENTIAL_SECURITY]) {
    secRaw += f.weight;
  }
  const secScore = Math.min(30, secRaw);

  // Category C: Privacy Policy Concerns
  let privRaw = 0;
  for (const f of categoryBuckets[CATEGORIES.PRIVACY]) {
    privRaw += f.weight;
  }
  const privScore = Math.min(15, privRaw);

  // Category D: Unverified
  let unverifiedRaw = 0;
  for (const f of categoryBuckets[CATEGORIES.UNVERIFIED]) {
    unverifiedRaw += f.weight;
  }
  const unverifiedScore = Math.min(10, unverifiedRaw);

  // Combined raw score
  let calculatedScore = techScore + secScore + privScore + unverifiedScore;

  // Breakdown records for UI inspection
  const scoreBreakdown = dedupedFindings.map((f) => ({
    id: f.id,
    title: f.title,
    severity: f.severity,
    points: f.weight,
    category: f.category,
  }));

  // 4. Critical Warning Override
  const criticalFindings = dedupedFindings.filter(
    (f) => f.severity === 'critical' || f.isCriticalOverride === true
  );
  const hasCriticalOverride = criticalFindings.length > 0;

  if (hasCriticalOverride) {
    // If critical findings exist, total score is scaled to [75, 100]
    calculatedScore = Math.max(75, 75 + Math.round((techRaw + secRaw) * 0.25));
  } else {
    // Without an actual critical severity hazard, cap at 65 (High maximum).
    // Routine warnings or privacy disclosures NEVER falsely brand a site as Critical!
    calculatedScore = Math.min(65, calculatedScore);
  }

  // Bounded final score [0, 100]
  const finalScore = Math.max(0, Math.min(100, Math.round(calculatedScore)));

  // 5. Determine Risk Classification & Official Recommendations
  let riskLevel = RISK_LEVELS.LOW;
  let recommendation = RECOMMENDATIONS.LOW;

  if (hasCriticalOverride || (finalScore >= 75 && criticalFindings.length > 0)) {
    riskLevel = RISK_LEVELS.CRITICAL;
    recommendation = RECOMMENDATIONS.CRITICAL;
  } else if (finalScore >= 50) {
    riskLevel = RISK_LEVELS.HIGH;
    recommendation = RECOMMENDATIONS.HIGH;
  } else if (finalScore >= 25) {
    riskLevel = RISK_LEVELS.MEDIUM;
    recommendation = RECOMMENDATIONS.MEDIUM;
  } else {
    riskLevel = RISK_LEVELS.LOW;
    recommendation = RECOMMENDATIONS.LOW;
  }

  // 6. Summary metrics
  const severityCounts = {
    critical: criticalFindings.length,
    high: dedupedFindings.filter((f) => f.severity === 'high').length,
    medium: dedupedFindings.filter((f) => f.severity === 'medium').length,
    low: dedupedFindings.filter((f) => f.severity === 'low').length,
  };

  return {
    score: finalScore,
    level: riskLevel,
    recommendation,
    hasCriticalOverride,
    criticalOverrideReason: hasCriticalOverride
      ? `Critical risk trigger: ${criticalFindings.map((c) => c.title).join('; ')}`
      : null,
    findings: dedupedFindings,
    totalFindings: dedupedFindings.length,
    severityCounts,
    scoreBreakdown,
    categoryBuckets,
    coverage: {
      connectionChecked: Boolean(coverage.connectionChecked),
      cookiesChecked: Boolean(coverage.cookiesChecked),
      permissionsChecked: Boolean(coverage.permissionsChecked),
      privacyChecked: Boolean(coverage.privacyChecked),
      notes: coverage.notes || [],
    },
    timestamp: new Date().toISOString(),
  };
}
