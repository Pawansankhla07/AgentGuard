/**
 * Site Permissions Scanner for AgentProof Chrome Extension.
 *
 * Inspects origin permissions (camera, microphone, geolocation, notifications, clipboard)
 * and evaluates privacy risks and relevance.
 */

import { CATEGORIES, createFinding } from '../risk/scoring.js';

export const PERMISSION_DEFINITIONS = [
  {
    name: 'camera',
    label: 'Camera Access',
    impact: 'High (Direct video/visual surveillance risk)',
    expectedSites: ['meet', 'zoom', 'teams', 'video', 'stream', 'camera', 'photo'],
    actionIfUnneeded: 'Set to Block in Chrome Site Settings unless actively engaged in video calls or capture.',
  },
  {
    name: 'microphone',
    label: 'Microphone Access',
    impact: 'High (Direct audio recording / eavesdropping risk)',
    expectedSites: ['meet', 'zoom', 'teams', 'audio', 'voice', 'podcast', 'call', 'music'],
    actionIfUnneeded: 'Set to Block in Chrome Site Settings unless actively using voice services.',
  },
  {
    name: 'geolocation',
    label: 'Location / GPS Tracking',
    impact: 'Medium (Physical location disclosure)',
    expectedSites: ['map', 'delivery', 'weather', 'store', 'uber', 'transit', 'ride'],
    actionIfUnneeded: 'Avoid granting persistent location access. Prefer entering approximate postal codes manually.',
  },
  {
    name: 'notifications',
    label: 'Push Notifications',
    impact: 'Low-Medium (Desktop alert popups)',
    expectedSites: ['mail', 'chat', 'slack', 'news', 'calendar', 'github'],
    actionIfUnneeded: 'Disable notifications to prevent unwanted desktop alerts.',
  },
  {
    name: 'clipboard-read',
    label: 'Clipboard Reading',
    impact: 'High (Reading copied passwords, keys, or private text)',
    expectedSites: ['editor', 'docs', 'paste', 'ide', 'fiddle', 'code'],
    actionIfUnneeded: 'Never allow clipboard access on untrusted websites. Revoke immediately in Chrome settings.',
  },
];

/**
 * Analyze permissions status for current origin
 *
 * @param {Array<Object>} permissionStatuses - List of { name, state }
 * @param {string} pageUrl - Current page URL
 * @returns {Object} Findings and permission cards
 */
export function analyzePermissions(permissionStatuses = [], pageUrl = '') {
  const findings = [];
  const permissionCards = [];

  let hostname = '';
  try {
    hostname = new URL(pageUrl).hostname.toLowerCase();
  } catch {
    hostname = '';
  }

  for (const def of PERMISSION_DEFINITIONS) {
    const matched = permissionStatuses.find((p) => p.name === def.name);
    const state = matched ? matched.state : 'unknown'; // 'granted', 'denied', 'prompt', 'unknown'

    const seemsRelevant = def.expectedSites.some((kw) => hostname.includes(kw));

    permissionCards.push({
      name: def.name,
      label: def.label,
      state, // 'granted', 'denied', 'prompt', 'unknown'
      privacyImpact: def.impact,
      relevanceAssessment: seemsRelevant
        ? 'Commonly requested by this service type'
        : 'Configured in browser site settings',
      suggestedAction: def.actionIfUnneeded,
      settingsUrl: 'chrome://settings/content',
    });

    // Generate risk findings for granted permissions
    if (state === 'granted') {
      if (def.name === 'clipboard-read' && !seemsRelevant) {
        findings.push(
          createFinding({
            id: 'perm_clipboard_granted',
            title: 'High Privacy Risk: Clipboard Access Allowed',
            category: CATEGORIES.POTENTIAL_SECURITY,
            severity: 'high',
            weight: 20,
            evidence: `Website possesses permission to read your system clipboard on '${hostname}'.`,
            remediation: 'Revoke clipboard access in Chrome Site Settings to protect copied credentials.',
          })
        );
      } else if (def.name === 'camera' && !seemsRelevant) {
        findings.push(
          createFinding({
            id: 'perm_camera_granted_unusual',
            title: 'Camera Permission Allowed in Browser Settings',
            category: CATEGORIES.POTENTIAL_SECURITY,
            severity: 'medium',
            weight: 12,
            evidence: `Camera access is allowed on '${hostname}'.`,
            remediation: 'Consider blocking camera access unless actively required for video services.',
          })
        );
      } else if (def.name === 'microphone' && !seemsRelevant) {
        findings.push(
          createFinding({
            id: 'perm_microphone_granted_unusual',
            title: 'Microphone Permission Allowed in Browser Settings',
            category: CATEGORIES.POTENTIAL_SECURITY,
            severity: 'medium',
            weight: 12,
            evidence: `Microphone access is allowed on '${hostname}'.`,
            remediation: 'Set microphone permission to Ask or Block in Chrome Site Settings.',
          })
        );
      } else if (def.name === 'geolocation') {
        findings.push(
          createFinding({
            id: 'perm_geo_granted',
            title: 'Location Permission Enabled in Browser Settings',
            category: CATEGORIES.PRIVACY,
            severity: 'low',
            weight: 4,
            evidence: `Physical location tracking is granted for '${hostname}'.`,
            remediation: 'Revoke location access in Chrome Site Settings if real-time tracking is not needed.',
          })
        );
      } else if (def.name === 'notifications' && !seemsRelevant) {
        findings.push(
          createFinding({
            id: 'perm_notifications_granted',
            title: 'Push Notifications Enabled',
            category: CATEGORIES.POTENTIAL_SECURITY,
            severity: 'low',
            weight: 3,
            evidence: 'Site can send system desktop alerts.',
            remediation: 'If you receive unwanted alerts, block notification permissions.',
          })
        );
      }
    }
  }

  return {
    findings,
    permissions: permissionCards,
  };
}
