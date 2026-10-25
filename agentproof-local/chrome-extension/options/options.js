/**
 * Options page controller for AgentProof Local.
 * Persists user configuration to chrome.storage.local.
 */

const DEFAULT_CONFIG = {
  responseLevel: 'monitor',
  allowlist: [],
  denylist: [],
  warnThreshold: 40,
  blockThreshold: 75,
  blockHttpPasswords: true,
  monitorDownloads: true,
  companionUrl: 'http://127.0.0.1:8000',
  companionToken: 'agentguard-local-secure-token',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'gemma4:e2b-it-qat',
  notifyHighRisk: true,
  notifyDownloads: true,
  suppressDuplicates: true,
};

// DOM References
const elBanner = document.getElementById('status-banner');
const elAllowlist = document.getElementById('allowlist-input');
const elDenylist = document.getElementById('denylist-input');
const elWarnThreshold = document.getElementById('warn-threshold');
const elBlockThreshold = document.getElementById('block-threshold');
const elBlockHttpPasswords = document.getElementById('block-http-passwords');
const elMonitorDownloads = document.getElementById('monitor-downloads');
const elCompanionUrl = document.getElementById('companion-url');
const elCompanionToken = document.getElementById('companion-token');
const elCompanionStatus = document.getElementById('companion-test-status');
const elOllamaUrl = document.getElementById('ollama-url');
const elOllamaModel = document.getElementById('ollama-model');
const elOllamaStatus = document.getElementById('ollama-test-status');
const elNotifyHighRisk = document.getElementById('notify-high-risk');
const elNotifyDownloads = document.getElementById('notify-downloads');
const elSuppressDuplicates = document.getElementById('suppress-duplicates');

function showBanner(message, isError = false) {
  elBanner.textContent = message;
  elBanner.className = `status-banner ${isError ? 'error' : 'success'}`;
  elBanner.classList.remove('hidden');
  setTimeout(() => {
    elBanner.classList.add('hidden');
  }, 4000);
}

async function loadSettings() {
  chrome.storage.local.get(['agentproof_config'], (res) => {
    const config = Object.assign({}, DEFAULT_CONFIG, res.agentproof_config || {});

    // Response level radio
    const radios = document.getElementsByName('responseLevel');
    for (const r of radios) {
      if (r.value === config.responseLevel) {
        r.checked = true;
        break;
      }
    }

    elAllowlist.value = (config.allowlist || []).join('\n');
    elDenylist.value = (config.denylist || []).join('\n');
    elWarnThreshold.value = config.warnThreshold;
    elBlockThreshold.value = config.blockThreshold;
    elBlockHttpPasswords.checked = Boolean(config.blockHttpPasswords);
    elMonitorDownloads.checked = Boolean(config.monitorDownloads);
    elCompanionUrl.value = config.companionUrl;
    elCompanionToken.value = config.companionToken;
    elOllamaUrl.value = config.ollamaUrl;
    elOllamaModel.value = config.ollamaModel;
    elNotifyHighRisk.checked = Boolean(config.notifyHighRisk);
    elNotifyDownloads.checked = Boolean(config.notifyDownloads);
    elSuppressDuplicates.checked = Boolean(config.suppressDuplicates);
  });
}

function saveSettings() {
  const selectedRadio = document.querySelector('input[name="responseLevel"]:checked');
  const responseLevel = selectedRadio ? selectedRadio.value : 'monitor';

  const allowlist = elAllowlist.value
    .split('\n')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const denylist = elDenylist.value
    .split('\n')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const updatedConfig = {
    responseLevel,
    allowlist,
    denylist,
    warnThreshold: parseInt(elWarnThreshold.value, 10) || 40,
    blockThreshold: parseInt(elBlockThreshold.value, 10) || 75,
    blockHttpPasswords: elBlockHttpPasswords.checked,
    monitorDownloads: elMonitorDownloads.checked,
    companionUrl: elCompanionUrl.value.trim().replace(/\/+$/, ''),
    companionToken: elCompanionToken.value.trim(),
    ollamaUrl: elOllamaUrl.value.trim().replace(/\/+$/, ''),
    ollamaModel: elOllamaModel.value.trim(),
    notifyHighRisk: elNotifyHighRisk.checked,
    notifyDownloads: elNotifyDownloads.checked,
    suppressDuplicates: elSuppressDuplicates.checked,
  };

  chrome.storage.local.set({ agentproof_config: updatedConfig }, () => {
    showBanner('Security preferences saved successfully.');
  });
}

function resetDefaults() {
  if (!confirm('Are you sure you want to reset all security settings to factory defaults?')) {
    return;
  }
  chrome.storage.local.set({ agentproof_config: DEFAULT_CONFIG }, () => {
    loadSettings();
    showBanner('Settings reset to safe defaults.');
  });
}

async function testCompanion() {
  elCompanionStatus.textContent = 'Testing connection...';
  elCompanionStatus.className = 'status-indicator';
  const url = elCompanionUrl.value.trim().replace(/\/+$/, '');
  const token = elCompanionToken.value.trim();

  try {
    const res = await fetch(`${url}/api/companion/status`, {
      headers: { 'X-AgentProof-Token': token },
    });
    if (res.ok) {
      const data = await res.json();
      elCompanionStatus.textContent = `Connected (Vault items: ${data.quarantine_count || 0})`;
      elCompanionStatus.className = 'status-indicator ok';
    } else {
      elCompanionStatus.textContent = `HTTP ${res.status}: Authentication failed`;
      elCompanionStatus.className = 'status-indicator fail';
    }
  } catch (err) {
    elCompanionStatus.textContent = `Failed: ${err.message}`;
    elCompanionStatus.className = 'status-indicator fail';
  }
}

async function testOllama() {
  elOllamaStatus.textContent = 'Testing Ollama...';
  elOllamaStatus.className = 'status-indicator';
  const url = elOllamaUrl.value.trim().replace(/\/+$/, '');

  try {
    const res = await fetch(`${url}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      const count = (data.models || []).length;
      elOllamaStatus.textContent = `Connected (${count} local models)`;
      elOllamaStatus.className = 'status-indicator ok';
    } else {
      elOllamaStatus.textContent = `HTTP ${res.status}: Ollama error`;
      elOllamaStatus.className = 'status-indicator fail';
    }
  } catch (err) {
    elOllamaStatus.textContent = 'Ollama offline or unreachable on loopback';
    elOllamaStatus.className = 'status-indicator fail';
  }
}

// Event Listeners
document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
document.getElementById('btn-reset-defaults').addEventListener('click', resetDefaults);
document.getElementById('btn-test-companion').addEventListener('click', testCompanion);
document.getElementById('btn-test-ollama').addEventListener('click', testOllama);

document.addEventListener('DOMContentLoaded', loadSettings);
