/**
 * Local Report Generator for AgentProof Chrome Extension.
 *
 * Formats sanitised security assessments into downloadable JSON and HTML reports.
 * Strictly guarantees that no passwords, tokens, or cookie values are included.
 */

/**
 * Generate a sanitised JSON evaluation report
 *
 * @param {Object} scanState - Complete scan and scoring state
 * @returns {string} Serialized JSON string
 */
export function generateJsonReport(scanState) {
  const {
    url = '',
    hostname = '',
    scoring = {},
    connection = {},
    cookies = {},
    permissions = {},
    privacy = {},
    timestamp = new Date().toISOString(),
  } = scanState;

  const reportObject = {
    metadata: {
      tool: 'AgentProof — Website Safety & Login Advisor',
      version: '1.0.0',
      reportType: 'Heuristic Website Safety Assessment',
      generatedAt: timestamp,
      targetHostname: hostname,
      targetUrl: url,
    },
    riskAssessment: {
      score: scoring.score,
      riskLevel: scoring.level,
      officialRecommendation: scoring.recommendation,
      criticalOverrideActive: scoring.hasCriticalOverride || false,
      criticalOverrideReason: scoring.criticalOverrideReason || null,
      severityCounts: scoring.severityCounts || {},
      scoreBreakdown: scoring.scoreBreakdown || [],
    },
    findings: (scoring.findings || []).map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      category: f.category,
      points: f.weight,
      evidence: f.evidence,
      remediationAdvice: f.remediation,
    })),
    technicalChecks: {
      connection: {
        isHttps: connection.isHttps || false,
        formsInspected: connection.formsCount || 0,
        mixedContentActive: connection.mixedContentActiveCount || 0,
        mixedContentPassive: connection.mixedContentPassiveCount || 0,
      },
      cookies: {
        totalCookiesAudited: cookies.metadataSummary?.totalCookies || 0,
        sensitivePatternsIdentified: cookies.metadataSummary?.sensitivePatternsDetected || 0,
        missingSecureCount: cookies.metadataSummary?.missingSecure || 0,
        missingHttpOnlyCount: cookies.metadataSummary?.missingHttpOnly || 0,
        // List sanitized metadata only (ZERO VALUES)
        cookieListSanitized: (cookies.metadataSummary?.cookies || []).map((c) => ({
          name: c.displayName,
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite: c.sameSite,
          domain: c.domain,
          hostOnly: c.hostOnly,
          session: c.session,
        })),
      },
      permissions: (permissions.permissions || []).map((p) => ({
        name: p.name,
        label: p.label,
        state: p.state,
        impact: p.privacyImpact,
        relevance: p.relevanceAssessment,
        suggestedAction: p.suggestedAction,
      })),
      privacyPolicy: {
        status: privacy.status || 'Not checked',
        policyUrl: privacy.policyUrl || null,
        disclosuresEvaluated: privacy.categories || [],
      },
    },
    coverageAndLimitations: {
      coverage: scoring.coverage || {},
      limitations: [
        'This assessment is a client-side heuristic evaluation and does not guarantee complete security.',
        'No remote network vulnerability scanning or credential verification is executed.',
        'Privacy policy analysis relies on regex heuristics and does not confirm actual corporate adherence.',
        'Cookie checks inspect flags on available cookies and never read or export secret values.',
      ],
    },
  };

  return JSON.stringify(reportObject, null, 2);
}

/**
 * Generate a standalone, styled HTML report
 *
 * @param {Object} scanState - Complete scan and scoring state
 * @returns {string} Complete HTML document string
 */
export function generateHtmlReport(scanState) {
  const jsonReport = JSON.parse(generateJsonReport(scanState));
  const { metadata, riskAssessment, findings, technicalChecks, coverageAndLimitations } = jsonReport;

  const levelColor =
    riskAssessment.riskLevel === 'Low'
      ? '#35C98A'
      : riskAssessment.riskLevel === 'Medium'
      ? '#F2B84B'
      : '#FF6577';

  const findingsRows = findings
    .map(
      (f) => `
    <tr>
      <td><span class="badge badge-${f.severity}">${f.severity.toUpperCase()}</span></td>
      <td><strong>${escapeHtml(f.title)}</strong><br><small class="text-muted">${escapeHtml(f.category)}</small></td>
      <td><code>${escapeHtml(f.evidence)}</code></td>
      <td>${escapeHtml(f.remediationAdvice)}</td>
    </tr>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AgentProof Safety Report — ${escapeHtml(metadata.targetHostname)}</title>
  <style>
    body {
      background-color: #0B0D12;
      color: #F3F6FC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 40px 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    .header {
      background: #151B26;
      border: 1px solid #293446;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .score-card {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #1B2330;
      border-radius: 8px;
      padding: 20px;
      margin-top: 16px;
    }
    .score-dial {
      font-size: 48px;
      font-weight: 700;
      color: ${levelColor};
      font-family: monospace;
    }
    .recommendation-box {
      background: rgba(124, 140, 255, 0.08);
      border-left: 4px solid ${levelColor};
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #151B26;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #293446;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #293446;
      font-size: 13.5px;
    }
    th { background: #1B2330; color: #9AA7BA; text-transform: uppercase; font-size: 11px; }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }
    .badge-critical { background: rgba(255,101,119,0.2); color: #FF6577; }
    .badge-high { background: rgba(255,101,119,0.15); color: #FF6577; }
    .badge-medium { background: rgba(242,184,75,0.2); color: #F2B84B; }
    .badge-low { background: rgba(53,201,138,0.2); color: #35C98A; }
    .text-muted { color: #9AA7BA; }
    .footer { font-size: 12px; color: #64748B; margin-top: 40px; border-top: 1px solid #293446; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🛡️ AgentProof — Website Safety & Login Advisor Report</h2>
      <p class="text-muted">Target Host: <strong>${escapeHtml(metadata.targetHostname)}</strong> | Generated: ${escapeHtml(metadata.generatedAt)}</p>
      
      <div class="score-card">
        <div class="score-dial">${riskAssessment.score} <span style="font-size: 20px; color: #9AA7BA;">/ 100</span></div>
        <div>
          <div style="font-size: 18px; font-weight: 600; color: ${levelColor};">Risk Level: ${escapeHtml(riskAssessment.riskLevel)}</div>
          <div class="text-muted">Heuristic risk evaluation based on ${findings.length} findings.</div>
        </div>
      </div>

      <div class="recommendation-box">
        <strong>Login Recommendation:</strong><br>
        ${escapeHtml(riskAssessment.officialRecommendation)}
      </div>
    </div>

    <h3>Detected Findings & Evidence (${findings.length})</h3>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Finding / Category</th>
          <th>Observed Evidence</th>
          <th>Remediation Advice</th>
        </tr>
      </thead>
      <tbody>
        ${findingsRows || '<tr><td colspan="4" style="text-align:center;">No notable security findings detected.</td></tr>'}
      </tbody>
    </table>

    <h3>Technical Checks Summary</h3>
    <ul>
      <li><strong>Transport Security:</strong> ${technicalChecks.connection.isHttps ? 'Encrypted (HTTPS)' : 'Insecure (Plain HTTP)'}</li>
      <li><strong>Cookies Audited:</strong> ${technicalChecks.cookies.totalCookiesAudited} (${technicalChecks.cookies.missingSecureCount} missing Secure, ${technicalChecks.cookies.missingHttpOnlyCount} missing HttpOnly)</li>
      <li><strong>Privacy Policy Status:</strong> ${escapeHtml(technicalChecks.privacyPolicy.status)}</li>
    </ul>

    <div class="footer">
      <strong>Limitations:</strong> ${escapeHtml(coverageAndLimitations.limitations.join(' '))}
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
