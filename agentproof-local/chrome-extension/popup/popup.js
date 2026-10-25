/**
 * Main Controller for AgentProof Chrome Extension Popup.
 *
 * Coordinates scans across connection, cookies, permissions, and privacy policy,
 * drives the deterministic risk scoring engine, and handles sanitized report export.
 */

import { calculateRiskScore } from '../risk/scoring.js';
import { analyzeConnection, isRestrictedUrl } from '../scanner/connection.js';
import { analyzeCookies } from '../scanner/cookies.js';
import { analyzePermissions } from '../scanner/permissions.js';
import { analyzePrivacyPolicyText } from '../scanner/privacy.js';
import { checkOllamaAvailability, generateOllamaSummary } from '../scanner/ollama.js';
import { generateJsonReport, generateHtmlReport } from '../reports/generator.js';

// Global scan state for current popup session
const scanState = {
  activeTab: null,
  url: '',
  hostname: '',
  origin: '',
  isRestricted: false,
  pageDetails: null,
  connection: {
    isHttps: false,
    formsCount: 0,
    mixedContentActiveCount: 0,
    mixedContentPassiveCount: 0,
    findings: [],
  },
  cookies: {
    permitted: false,
    findings: [],
    metadataSummary: null,
  },
  permissions: {
    findings: [],
    permissions: [],
  },
  privacy: {
    status: 'Not checked',
    policyUrl: null,
    findings: [],
    categories: [],
  },
  allFindings: [],
  scoring: null,
  coverage: {
    connectionChecked: false,
    cookiesChecked: false,
    permissionsChecked: false,
    privacyChecked: false,
    notes: [],
  },
  ollama: {
    available: false,
    model: null,
  },
};

// DOM Element References
const elHostname = document.getElementById('site-hostname');
const elProtocolBadge = document.getElementById('site-protocol-badge');
const elScanStatus = document.getElementById('scan-status-text');
const elRiskScore = document.getElementById('risk-score-value');
const elRiskLevel = document.getElementById('risk-level-badge');
const elRiskDialBar = document.getElementById('risk-dial-bar');
const elRecommendation = document.getElementById('recommendation-text');
const elCriticalBanner = document.getElementById('critical-override-banner');
const elCriticalText = document.getElementById('critical-override-text');
const elFindingsList = document.getElementById('findings-list');
const elFindingsCount = document.getElementById('findings-count');
const elCookieNotice = document.getElementById('cookie-perm-notice');

const covConn = document.getElementById('cov-conn');
const covCook = document.getElementById('cov-cook');
const covPerm = document.getElementById('cov-perm');
const covPriv = document.getElementById('cov-priv');

// Initialize on popup load
document.addEventListener('DOMContentLoaded', async () => {
  setupTabNavigation();
  setupActionButtons();
  await initializeCurrentTab();
  checkOllamaStatus();
});

/**
 * Initialize active tab context
 */
async function initializeCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      setRestrictedState('No active webpage detected.');
      return;
    }

    scanState.activeTab = tab;
    scanState.url = tab.url;

    try {
      const parsed = new URL(tab.url);
      scanState.hostname = parsed.hostname;
      scanState.origin = parsed.origin;
      scanState.connection.isHttps = parsed.protocol === 'https:';

      elHostname.textContent = scanState.hostname;
      elHostname.title = tab.url;

      if (scanState.connection.isHttps) {
        elProtocolBadge.textContent = 'HTTPS';
        elProtocolBadge.className = 'ap-badge ap-badge-low';
      } else {
        elProtocolBadge.textContent = 'HTTP';
        elProtocolBadge.className = 'ap-badge ap-badge-high';
      }
    } catch {
      setRestrictedState('Invalid URL scheme.');
      return;
    }

    // Check if page is restricted (e.g. chrome:// or Web Store)
    if (isRestrictedUrl(scanState.url)) {
      setRestrictedState('Scanning restricted on internal browser pages or Web Store.');
      return;
    }

    // Auto-trigger full scan on first open for a seamless user experience
    await runFullScan();
  } catch (err) {
    elScanStatus.textContent = 'Initialization error';
    console.error('[AgentProof] Init error:', err);
  }
}

/**
 * Handle restricted page state
 */
function setRestrictedState(reason) {
  scanState.isRestricted = true;
  elHostname.textContent = 'Restricted Page';
  elProtocolBadge.textContent = 'N/A';
  elScanStatus.textContent = reason;
  elRecommendation.textContent =
    'Browser security restrictions prevent script injection and security inspection on internal browser pages, extension pages, and the Chrome Web Store.';

  document.getElementById('btn-scan-all').disabled = true;
  document.getElementById('btn-scan-connection').disabled = true;
  document.getElementById('btn-scan-cookies').disabled = true;
  document.getElementById('btn-scan-perms').disabled = true;
  document.getElementById('btn-scan-privacy').disabled = true;
}

/**
 * Wire action buttons
 */
function setupActionButtons() {
  document.getElementById('btn-refresh').addEventListener('click', () => {
    if (!scanState.isRestricted) runFullScan();
  });

  document.getElementById('btn-scan-all').addEventListener('click', () => {
    runFullScan();
  });

  document.getElementById('btn-scan-connection').addEventListener('click', async () => {
    await runConnectionScan();
    recalculateAndRender();
  });

  document.getElementById('btn-scan-cookies').addEventListener('click', async () => {
    await runCookiesScan();
    recalculateAndRender();
  });

  document.getElementById('btn-scan-perms').addEventListener('click', async () => {
    await runPermissionsScan();
    recalculateAndRender();
  });

  document.getElementById('btn-scan-privacy').addEventListener('click', async () => {
    await runPrivacyScan();
    recalculateAndRender();
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    exportReport('json');
  });

  document.getElementById('btn-export-html').addEventListener('click', () => {
    exportReport('html');
  });

  document.getElementById('btn-generate-ai').addEventListener('click', async () => {
    await handleAiSummary();
  });

  const elOpenOptions = document.getElementById('btn-open-options');
  if (elOpenOptions) {
    elOpenOptions.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  const elClearCookies = document.getElementById('btn-clear-site-cookies');
  if (elClearCookies) {
    elClearCookies.addEventListener('click', async () => {
      if (!scanState.url) return;
      if (!confirm(`Are you sure you want to clear cookies for ${scanState.hostname}? You will be signed out of this site.`)) return;
      chrome.runtime.sendMessage({ action: 'CLEAR_CURRENT_COOKIES', url: scanState.url }, (res) => {
        if (res && res.success) {
          alert(`Successfully cleared ${res.count} cookies for ${scanState.hostname}.`);
          runCookiesScan().then(recalculateAndRender);
        } else {
          alert(`Failed to clear cookies: ${(res && res.error) || 'Unknown error'}`);
        }
      });
    });
  }
}

/**
 * Tab switching controller
 */
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.ap-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.ap-tab-pane').forEach((pane) => pane.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetId = tab.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/**
 * Check local Ollama daemon status
 */
async function checkOllamaStatus() {
  const tag = document.getElementById('ollama-status-tag');
  const res = await checkOllamaAvailability();
  scanState.ollama.available = res.available;
  scanState.ollama.model = res.recommendedModel;

  if (res.available) {
    tag.textContent = `Online (${res.recommendedModel})`;
    tag.className = 'ap-badge ap-badge-low';
  } else {
    tag.textContent = 'Offline (Local Only)';
    tag.className = 'ap-badge ap-badge-neutral';
  }
}

/**
 * Run comprehensive full scan
 */
async function runFullScan() {
  elScanStatus.textContent = 'Scanning website...';
  try {
    await runConnectionScan();
    await runCookiesScan();
    await runPermissionsScan();
    await runPrivacyScan();
    elScanStatus.textContent = 'Scan completed';
  } catch (err) {
    elScanStatus.textContent = 'Scan completed with notices';
  }
  recalculateAndRender();
}

/**
 * 1. Connection & Page Scan
 */
async function runConnectionScan() {
  if (!scanState.activeTab) return;
  try {
    // Inject and query content script
    const resp = await chrome.runtime.sendMessage({
      action: 'INJECT_AND_SCAN',
      tabId: scanState.activeTab.id,
    });

    if (resp && resp.success && resp.pageDetails) {
      scanState.pageDetails = resp.pageDetails;
      const details = resp.pageDetails;

      const connFindings = analyzeConnection(scanState.url, details);
      scanState.connection.findings = connFindings;
      scanState.connection.formsCount = (details.forms || []).length;
      scanState.connection.mixedContentActiveCount = (details.mixedContent?.active || []).length;
      scanState.connection.mixedContentPassiveCount = (details.mixedContent?.passive || []).length;

      scanState.coverage.connectionChecked = true;
      covConn.className = 'ap-cov-dot checked';
      covConn.title = 'Connection: Checked';

      renderConnectionDetails(details);
    } else {
      // Fallback: evaluate URL directly without DOM injection
      const connFindings = analyzeConnection(scanState.url, {});
      scanState.connection.findings = connFindings;
      scanState.coverage.connectionChecked = true;
      covConn.className = 'ap-cov-dot checked';
    }
  } catch (err) {
    console.warn('[AgentProof] Connection scan notice:', err);
    const connFindings = analyzeConnection(scanState.url, {});
    scanState.connection.findings = connFindings;
    scanState.coverage.connectionChecked = true;
    covConn.className = 'ap-cov-dot checked';
  }
}

/**
 * 2. Cookie Security Scan
 */
async function runCookiesScan() {
  if (!scanState.url) return;

  // Check if we have cookie permission for this origin
  const originPattern = `${scanState.origin}/*`;
  let hasPermission = false;

  try {
    hasPermission = await chrome.permissions.contains({
      permissions: ['cookies'],
      origins: [originPattern],
    });
  } catch {
    hasPermission = false;
  }

  if (!hasPermission) {
    elCookieNotice.classList.remove('hidden');
    try {
      hasPermission = await chrome.permissions.request({
        permissions: ['cookies'],
        origins: [originPattern],
      });
    } catch (err) {
      hasPermission = false;
    }
    elCookieNotice.classList.add('hidden');
  }

  if (!hasPermission) {
    scanState.cookies.permitted = false;
    scanState.cookies.findings = [];
    scanState.coverage.cookiesChecked = false;
    covCook.className = 'ap-cov-dot failed';
    covCook.title = 'Cookies: Permission not granted';
    renderCookiesDenied();
    return;
  }

  scanState.cookies.permitted = true;
  try {
    const resp = await chrome.runtime.sendMessage({
      action: 'GET_COOKIES',
      url: scanState.url,
    });

    if (resp && resp.success) {
      const { findings, metadataSummary } = analyzeCookies(resp.cookies || [], scanState.url);
      scanState.cookies.findings = findings;
      scanState.cookies.metadataSummary = metadataSummary;

      scanState.coverage.cookiesChecked = true;
      covCook.className = 'ap-cov-dot checked';
      covCook.title = 'Cookies: Checked';

      renderCookiesDetails(metadataSummary);
    } else {
      throw new Error(resp?.error || 'Failed to inspect cookies');
    }
  } catch (err) {
    scanState.coverage.cookiesChecked = false;
    covCook.className = 'ap-cov-dot failed';
    renderCookiesError(err.message);
  }
}

/**
 * 3. Permissions Scan
 */
async function runPermissionsScan() {
  const permList = scanState.pageDetails?.permissions || [];
  const { findings, permissions } = analyzePermissions(permList, scanState.url);

  scanState.permissions.findings = findings;
  scanState.permissions.permissions = permissions;
  scanState.coverage.permissionsChecked = true;
  covPerm.className = 'ap-cov-dot checked';
  covPerm.title = 'Permissions: Checked';

  renderPermissionsDetails(permissions);
}

/**
 * 4. Privacy Policy Scan
 */
async function runPrivacyScan() {
  const policyText = scanState.pageDetails?.policyText;
  const policyUrl = scanState.pageDetails?.policyUrl;

  if (policyText) {
    const result = analyzePrivacyPolicyText(policyText, policyUrl);
    scanState.privacy = result;
    scanState.coverage.privacyChecked = true;
    covPriv.className = 'ap-cov-dot checked';
    covPriv.title = 'Privacy: Analyzed';
  } else if (policyUrl) {
    scanState.privacy = {
      status: 'External or CORS-protected document (Link detected)',
      policyUrl,
      findings: [],
      categories: [],
    };
    scanState.coverage.privacyChecked = true;
    covPriv.className = 'ap-cov-dot checked';
    covPriv.title = 'Privacy: Link detected';
  } else {
    scanState.privacy = {
      status: 'No clear Privacy Policy or Terms link identified on page',
      policyUrl: null,
      findings: [],
      categories: [],
    };
    scanState.coverage.privacyChecked = false;
    covPriv.className = 'ap-cov-dot';
    covPriv.title = 'Privacy: Link not found';
  }

  renderPrivacyDetails(scanState.privacy);
}

/**
 * Recalculate deterministic risk score & update UI
 */
function recalculateAndRender() {
  // Aggregate all findings across modules
  const allFindings = [
    ...(scanState.connection.findings || []),
    ...(scanState.cookies.findings || []),
    ...(scanState.permissions.findings || []),
    ...(scanState.privacy.findings || []),
  ];

  scanState.allFindings = allFindings;
  const scoring = calculateRiskScore(allFindings, scanState.coverage);
  scanState.scoring = scoring;

  // 1. Update Risk Dial & Score
  elRiskScore.textContent = scoring.score;
  const dashOffset = 264 - (264 * scoring.score) / 100;
  elRiskDialBar.style.strokeDashoffset = dashOffset;

  // Dial Color by Severity Level
  let dialColor = '#35C98A';
  let badgeClass = 'ap-badge-low';
  if (scoring.level === 'Critical') {
    dialColor = '#E11D48';
    badgeClass = 'ap-badge-critical';
  } else if (scoring.level === 'High') {
    dialColor = '#FF6577';
    badgeClass = 'ap-badge-high';
  } else if (scoring.level === 'Medium') {
    dialColor = '#F2B84B';
    badgeClass = 'ap-badge-medium';
  }

  elRiskDialBar.style.stroke = dialColor;
  elRiskLevel.textContent = `${scoring.level} Risk`;
  elRiskLevel.className = `ap-level-badge ${badgeClass}`;

  // 2. Critical Override Notification
  if (scoring.hasCriticalOverride) {
    elCriticalBanner.classList.remove('hidden');
    elCriticalText.textContent = scoring.criticalOverrideReason;
  } else {
    elCriticalBanner.classList.add('hidden');
  }

  // 3. Official Recommendation Wording
  elRecommendation.textContent = scoring.recommendation;

  // 4. Render Findings List
  renderFindingsList(scoring.findings);
  elFindingsCount.textContent = scoring.totalFindings;
}

/**
 * Render findings accordion list
 */
function renderFindingsList(findings) {
  if (!findings || findings.length === 0) {
    elFindingsList.innerHTML = `
      <div class="ap-empty-state">
        <span class="ap-empty-icon">✅</span>
        <p>No security or privacy issues detected in the checks performed.</p>
      </div>
    `;
    return;
  }

  elFindingsList.innerHTML = '';
  findings.forEach((f, idx) => {
    const item = document.createElement('div');
    item.className = 'ap-finding-item';

    const badgeClass =
      f.severity === 'critical'
        ? 'ap-badge-critical'
        : f.severity === 'high'
        ? 'ap-badge-high'
        : f.severity === 'medium'
        ? 'ap-badge-medium'
        : 'ap-badge-low';

    item.innerHTML = `
      <div class="ap-finding-header" data-index="${idx}">
        <div>
          <div class="ap-finding-title">${escapeHtml(f.title)}</div>
          <div class="ap-finding-category">${escapeHtml(f.category)}</div>
        </div>
        <span class="ap-badge ${badgeClass}">${f.severity.toUpperCase()}</span>
      </div>
      <div class="ap-finding-details">
        <div style="font-weight:600; font-size:10.5px; color:#9AA7BA;">OBSERVED EVIDENCE:</div>
        <div class="ap-evidence-box">${escapeHtml(f.evidence || 'Pattern observed in page structure.')}</div>
        <div style="font-weight:600; font-size:10.5px; color:#9AA7BA; margin-top:6px;">REMEDIATION ADVICE:</div>
        <div class="ap-remediation-box">${escapeHtml(f.remediation || 'Review site configuration.')}</div>
      </div>
    `;

    elFindingsList.appendChild(item);
  });
}

/**
 * Render Connection Details in Connection Tab
 */
function renderConnectionDetails(details) {
  const container = document.getElementById('connection-content');
  const forms = details.forms || [];
  const mixedActive = details.mixedContent?.active || [];
  const mixedPassive = details.mixedContent?.passive || [];

  container.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div><strong>Transport Protocol:</strong> <code>${scanState.connection.isHttps ? 'HTTPS (TLS Encrypted)' : 'HTTP (Plaintext Insecure)'}</code></div>
      <div><strong>Hostname Scanned:</strong> <code>${escapeHtml(scanState.hostname)}</code></div>
    </div>
    
    <div style="font-weight:600; margin-bottom: 4px;">Credential Forms Detected: ${forms.length}</div>
    ${forms.length === 0 ? '<div class="ap-unscanned-notice">No forms with password inputs found on this page.</div>' : ''}
    ${forms
      .map(
        (form, i) => `
      <div style="background:var(--bg-input); padding:6px 8px; border-radius:4px; margin-bottom:6px; border:1px solid var(--border-color);">
        <div><strong>Form #${i + 1}:</strong> ${form.hasPasswordField ? '🔑 Contains Password Field' : 'Standard Form'}</div>
        <div><strong>Target Action:</strong> <code>${escapeHtml(form.action || '(Current Page URL)')}</code></div>
        <div><strong>Method:</strong> <code>${escapeHtml(form.method)}</code></div>
      </div>
    `
      )
      .join('')}

    <div style="font-weight:600; margin-top: 10px; margin-bottom: 4px;">Mixed Content Audit:</div>
    <div>Active Mixed Content (Scripts/Frames): <strong>${mixedActive.length}</strong></div>
    <div>Passive Mixed Content (Images/Audio): <strong>${mixedPassive.length}</strong></div>
  `;
}

/**
 * Render Cookies Details in Cookies Tab
 */
function renderCookiesDetails(summary) {
  const container = document.getElementById('cookies-content');
  if (!summary) return;

  const cookies = summary.cookies || [];
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:12px; background:var(--bg-input); padding:8px; border-radius:6px;">
      <div>Total: <strong>${summary.totalCookies}</strong></div>
      <div>Missing Secure: <strong style="color:${summary.missingSecure > 0 ? '#FF6577' : '#35C98A'}">${summary.missingSecure}</strong></div>
      <div>Missing HttpOnly: <strong style="color:${summary.missingHttpOnly > 0 ? '#F2B84B' : '#35C98A'}">${summary.missingHttpOnly}</strong></div>
    </div>

    <div style="font-size:11px; color:#9AA7BA; margin-bottom:8px;">
      Audited metadata attributes (Values are never displayed or stored):
    </div>

    ${cookies.length === 0 ? '<div class="ap-unscanned-notice">No cookies found for this origin.</div>' : ''}
    ${cookies
      .map(
        (c) => `
      <div style="background:var(--bg-input); padding:6px 8px; border-radius:4px; margin-bottom:6px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div><strong>${escapeHtml(c.displayName)}</strong> ${c.isSensitivePattern ? '<span class="ap-badge ap-badge-neutral">AUTH</span>' : ''}</div>
          <div style="font-size:10px; color:#64748B;">Domain: ${escapeHtml(c.domain)}</div>
        </div>
        <div style="display:flex; gap:4px;">
          <span class="ap-badge ${c.secure ? 'ap-badge-low' : 'ap-badge-high'}">${c.secure ? 'Secure' : 'No Sec'}</span>
          <span class="ap-badge ${c.httpOnly ? 'ap-badge-low' : 'ap-badge-medium'}">${c.httpOnly ? 'HttpOnly' : 'No JS'}</span>
        </div>
      </div>
    `
      )
      .join('')}
  `;
}

function renderCookiesDenied() {
  document.getElementById('cookies-content').innerHTML = `
    <div class="ap-callout ap-callout-info">
      <strong>Host Permission Required for Cookie Scan:</strong>
      <p style="margin-top:4px;">To audit cookie security flags (Secure, HttpOnly, SameSite), click "Check Cookies" and accept the origin access prompt. Cookie values are never accessed.</p>
    </div>
  `;
}

function renderCookiesError(msg) {
  document.getElementById('cookies-content').innerHTML = `
    <div class="ap-callout ap-callout-critical">
      <strong>Cookie Audit Notice:</strong> ${escapeHtml(msg)}
    </div>
  `;
}

/**
 * Render Permissions Details in Permissions Tab
 */
function renderPermissionsDetails(permissions) {
  const container = document.getElementById('permissions-content');
  container.innerHTML = `
    <div style="font-size:11px; color:#9AA7BA; margin-bottom:10px;">
      Site permission states queried for <code>${escapeHtml(scanState.hostname)}</code>:
    </div>

    ${permissions
      .map((p) => {
        const stateColor =
          p.state === 'granted'
            ? 'ap-badge-high'
            : p.state === 'denied'
            ? 'ap-badge-neutral'
            : 'ap-badge-low';
        return `
        <div style="background:var(--bg-input); padding:8px; border-radius:6px; margin-bottom:6px; border:1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${escapeHtml(p.label)}</strong>
            <span class="ap-badge ${stateColor}">${p.state.toUpperCase()}</span>
          </div>
          <div style="font-size:10.5px; color:#9AA7BA; margin-top:4px;">${escapeHtml(p.privacyImpact)}</div>
          <div style="font-size:10.5px; color:#CBD5E1; margin-top:2px;">Relevance: ${escapeHtml(p.relevanceAssessment)}</div>
        </div>
      `;
      })
      .join('')}
  `;
}

/**
 * Render Privacy Policy Details in Privacy Tab
 */
function renderPrivacyDetails(privacy) {
  const container = document.getElementById('privacy-content');
  const categories = privacy.categories || [];

  container.innerHTML = `
    <div style="margin-bottom:10px;">
      <div><strong>Status:</strong> ${escapeHtml(privacy.status)}</div>
      ${privacy.policyUrl ? `<div><strong>Source Document:</strong> <a href="${escapeHtml(privacy.policyUrl)}" target="_blank" style="color:var(--accent); word-break:break-all;">${escapeHtml(privacy.policyUrl)}</a></div>` : ''}
    </div>

    ${categories.length === 0 ? '<div class="ap-unscanned-notice">No policy text extracted for analysis.</div>' : ''}
    ${categories
      .map(
        (cat) => `
      <div style="background:var(--bg-input); padding:8px; border-radius:6px; margin-bottom:6px; border:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between;">
          <strong>${escapeHtml(cat.name)}</strong>
          <span class="ap-badge ${cat.detected ? (cat.positive ? 'ap-badge-low' : 'ap-badge-medium') : 'ap-badge-neutral'}">
            ${cat.detected ? (cat.positive ? 'Documented' : 'Disclosed') : 'Not Found'}
          </span>
        </div>
        ${cat.excerpt ? `<div class="ap-evidence-box" style="margin-top:6px;">"${escapeHtml(cat.excerpt)}"</div>` : ''}
      </div>
    `
      )
      .join('')}
  `;
}

/**
 * Handle Local Ollama AI Summary
 */
async function handleAiSummary() {
  const output = document.getElementById('ai-summary-output');
  output.textContent = 'Contacting local Ollama instance...';

  const sanitisedContext = {
    hostname: scanState.hostname,
    score: scanState.scoring ? scanState.scoring.score : 0,
    riskLevel: scanState.scoring ? scanState.scoring.level : 'Unknown',
    recommendation: scanState.scoring ? scanState.scoring.recommendation : '',
    findings: scanState.allFindings,
  };

  const summary = await generateOllamaSummary(sanitisedContext, scanState.ollama.model);
  output.textContent = summary;
}

/**
 * Export Sanitized Report (JSON or HTML)
 */
function exportReport(format) {
  let content = '';
  let mimeType = '';
  let filename = '';

  const cleanHost = scanState.hostname.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dateStr = new Date().toISOString().substring(0, 10);

  if (format === 'json') {
    content = generateJsonReport(scanState);
    mimeType = 'application/json';
    filename = `AgentProof_Report_${cleanHost}_${dateStr}.json`;
  } else {
    content = generateHtmlReport(scanState);
    mimeType = 'text/html';
    filename = `AgentProof_Report_${cleanHost}_${dateStr}.html`;
  }

  const blob = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
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
