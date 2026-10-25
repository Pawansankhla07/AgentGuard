/**
 * Privacy Policy and Terms of Service Heuristic Analyzer for AgentProof.
 *
 * Discovers and parses local policy documents for key disclosures
 * (collection, third-party sharing, tracking, retention, deletion rights)
 * without transmitting page text or personal data to remote cloud services.
 */

import { CATEGORIES, createFinding } from '../risk/scoring.js';

export const POLICY_CHECKS = [
  {
    id: 'third_party_sharing',
    categoryName: 'Commercial Data Sharing & Data Brokers',
    pattern: /(sell your personal (data|information)|data brokers|monetiz(e|ation)|targeted behavioral advertising to third parties)/i,
    severity: 'low',
    weight: 6,
    flagTitle: 'Commercial Third-Party Data Sale or Broker Disclosures',
    reason: 'Policy discloses sale or commercial monetization of user data with external brokers.',
    remediation: 'Check for opt-out links or "Do Not Sell My Info" settings.',
  },
  {
    id: 'tracking_technologies',
    categoryName: 'Tracking Technologies & Cross-Device Beacons',
    pattern: /(web beacons?|pixel tags?|cross[- ]device|canvas fingerprinting|device fingerprinting|behavioral (ad )?trackers?)/i,
    severity: 'low',
    weight: 4,
    flagTitle: 'Cross-Device Tracking or Fingerprinting Mentioned',
    reason: 'Policy references cross-device tracking or device fingerprinting technologies.',
    remediation: 'Use a browser tracker blocker if you prefer not to be tracked across sites.',
  },
  {
    id: 'data_retention_indefinite',
    categoryName: 'Indefinite Data Retention',
    pattern: /(store indefinitely without deletion|retain perpetually without (expiry|timeline)|never delete user data)/i,
    severity: 'low',
    weight: 5,
    flagTitle: 'Perpetual Data Retention Without Expiry Mentioned',
    reason: 'Data is stated to be retained indefinitely without user deletion rights.',
    remediation: 'Review account settings for personal data retention options.',
  },
  {
    id: 'deletion_rights',
    categoryName: 'Account & Data Deletion Rights',
    pattern: /(delete (your|my) account|account deletion|close (your|my) account|right to erasure|request deletion|gdpr|ccpa|erasure request)/i,
    severity: 'low',
    positive: true, // Finding indicates user rights exist
    weight: 0,
    flagTitle: 'Account / Data Deletion Rights Documented',
    reason: 'Policy documents clear user procedures for requesting data erasure under GDPR/CCPA.',
    remediation: 'You can exercise data deletion rights via account settings or privacy contact.',
  },
  {
    id: 'security_safeguards',
    categoryName: 'Security Practices',
    pattern: /(encryption at rest|tls|ssl|soc ?2|iso ?27001|safeguards|access controls|two[- ]factor)/i,
    severity: 'low',
    positive: true,
    weight: 0,
    flagTitle: 'Security Safeguards & Encryption Documented',
    reason: 'Policy explicitly commits to technical safeguards and encryption practices.',
    remediation: 'Verify whether two-factor authentication (2FA) is supported on your account.',
  },
  {
    id: 'contact_dpo',
    categoryName: 'Contact & Responsible Entity',
    pattern: /(data protection officer|privacy officer|dpo@|privacy@|registered address)/i,
    severity: 'low',
    positive: true,
    weight: 0,
    flagTitle: 'Designated Privacy Contact / DPO Disclosed',
    reason: 'Organization publishes designated privacy contacts or an address for regulatory inquiries.',
    remediation: 'Use the published privacy address for privacy inquiries or data subject access requests.',
  },
  {
    id: 'children_data',
    categoryName: "Children's Privacy Disclosures",
    pattern: /(children('s)? personal data|coppa|under 13|under 16|parental consent)/i,
    severity: 'low',
    positive: true,
    weight: 0,
    flagTitle: "Children's Privacy Disclosures Present",
    reason: 'Policy contains explicit statements regarding minors and parental consent.',
    remediation: 'Ensure minors do not create accounts on platforms not intended for their age group.',
  },
];

/**
 * Extract an excerpt snippet around the matched regex pattern
 */
function extractSnippet(text, matchIndex, matchLength, maxLen = 120) {
  const start = Math.max(0, matchIndex - 30);
  const end = Math.min(text.length, matchIndex + matchLength + 60);
  let snippet = text.substring(start, end).replace(/\s+/g, ' ').trim();
  if (start > 0) snippet = `...${snippet}`;
  if (end < text.length) snippet = `${snippet}...`;
  return snippet.substring(0, maxLen);
}

/**
 * Analyze policy text heuristics locally
 *
 * @param {string} policyText - Raw text from retrieved policy document
 * @param {string} policyUrl - Source URL of the policy document
 * @returns {Object} Findings and categories breakdown
 */
export function analyzePrivacyPolicyText(policyText, policyUrl) {
  const findings = [];
  const categoryResults = [];

  if (!policyText || policyText.trim().length < 50) {
    findings.push(
      createFinding({
        id: 'policy_unreadable',
        title: 'Privacy Policy Document Inaccessible or Empty',
        category: CATEGORIES.PRIVACY,
        severity: 'low',
        weight: 4,
        evidence: `Could not retrieve readable text from ${policyUrl || 'target site'}.`,
        remediation: 'Review the policy manually before agreeing to terms or sharing personal data.',
      })
    );
    return {
      status: 'Inaccessible',
      findings,
      categories: [],
      policyUrl,
    };
  }

  // Scan text against defined checks
  for (const check of POLICY_CHECKS) {
    const match = check.pattern.exec(policyText);
    if (match) {
      const excerpt = extractSnippet(policyText, match.index, match[0].length);

      categoryResults.push({
        id: check.id,
        name: check.categoryName,
        detected: true,
        excerpt,
        reason: check.reason,
        positive: Boolean(check.positive),
      });

      // If it is a risk-increasing flag (non-positive)
      if (!check.positive) {
        findings.push(
          createFinding({
            id: `policy_${check.id}`,
            title: check.flagTitle,
            category: CATEGORIES.PRIVACY,
            severity: check.severity,
            weight: check.weight,
            evidence: `"${excerpt}"`,
            remediation: check.remediation,
          })
        );
      }
    } else {
      categoryResults.push({
        id: check.id,
        name: check.categoryName,
        detected: false,
        excerpt: null,
        reason: 'Not explicitly mentioned in the scanned document text.',
        positive: Boolean(check.positive),
      });

      // If missing crucial user deletion rights or contact
      if (check.id === 'deletion_rights') {
        findings.push(
          createFinding({
            id: 'policy_missing_deletion_rights',
            title: 'No Explicit Account Deletion Mechanism Disclosed',
            category: CATEGORIES.PRIVACY,
            severity: 'low',
            weight: 4,
            evidence: 'Scanned policy does not explicitly mention user data erasure or GDPR/CCPA deletion rights.',
            remediation: 'Contact customer support to inquire how accounts and personal data can be deleted.',
          })
        );
      }
    }
  }

  return {
    status: 'Analyzed',
    findings,
    categories: categoryResults,
    policyUrl,
    wordCount: policyText.split(/\s+/).length,
  };
}
