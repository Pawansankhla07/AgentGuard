"""Website Scanner Engine for AgentProof Local Security Suite.

Performs deterministic network and URL security evaluations:
- Transport protocol validation (HTTPS vs unencrypted plain HTTP).
- Deceptive hostname detection (Punycode / IDN homograph attacks, raw IP literals).
- Password input submission destination checks.
- Suspicious subdomain structures and lookalike patterns.
- Integration with local allowlist and denylist policies.
"""

import ipaddress
import re
from typing import Any, Optional
from urllib.parse import urlparse

from agentproof.risk_engine import CATEGORIES, SecurityFinding, calculate_risk_score


RESTRICTED_SCHEMES = ("chrome:", "chrome-extension:", "about:", "edge:", "view-source:", "file:")
SUSPICIOUS_TLDS = {".top", ".xyz", ".work", ".click", ".loan", ".fit", ".gq", ".cf", ".tk", ".ml"}


class WebsiteScanner:
    """Evaluates website connection characteristics, form behaviors, and URL anomalies."""

    def __init__(
        self,
        allowlist: Optional[list[str]] = None,
        denylist: Optional[list[str]] = None,
    ):
        self.allowlist = set(allowlist or [])
        self.denylist = set(denylist or [])

    def scan_url(
        self,
        url: str,
        dom_forms: Optional[list[dict[str, Any]]] = None,
        is_mixed_content: bool = False,
    ) -> dict[str, Any]:
        """Perform comprehensive deterministic checks on a target website URL and DOM metadata."""
        findings: list[SecurityFinding] = []
        coverage = {
            "transport_checked": True,
            "hostname_analyzed": True,
            "forms_audited": dom_forms is not None,
            "mixed_content_checked": True,
        }

        if not url:
            findings.append(
                SecurityFinding(
                    id="missing-url",
                    title="No target URL provided",
                    category=CATEGORIES["UNVERIFIED"],
                    severity="low",
                    evidence="Scan invoked without a valid target URL.",
                    remediation="Supply a valid web origin.",
                )
            )
            return calculate_risk_score(findings, coverage)

        # Check for restricted browser internal URLs
        if any(url.lower().startswith(s) for s in RESTRICTED_SCHEMES):
            findings.append(
                SecurityFinding(
                    id="restricted-browser-page",
                    title="Internal Browser Page",
                    category=CATEGORIES["TECHNICAL"],
                    severity="low",
                    weight=0,
                    evidence=f"Internal browser scheme detected ({url}).",
                    remediation="Standard web security scans do not apply to internal browser pages.",
                )
            )
            return calculate_risk_score(findings, coverage)

        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        hostname = (parsed.hostname or "").lower()

        # 1. Denylist / Allowlist check
        if hostname in self.allowlist or any(hostname.endswith("." + a) for a in self.allowlist):
            findings.append(
                SecurityFinding(
                    id="allowlist-trusted",
                    title="Domain explicitly trusted in local allowlist",
                    category=CATEGORIES["TECHNICAL"],
                    severity="low",
                    weight=0,
                    evidence=f"Hostname '{hostname}' matches user allowlist.",
                    remediation="Trusted domain.",
                )
            )
            coverage["allowlist_match"] = True
            return calculate_risk_score(findings, coverage)

        if hostname in self.denylist or any(hostname.endswith("." + d) for d in self.denylist):
            findings.append(
                SecurityFinding(
                    id="denylist-threat-match",
                    title="Domain matched in local security denylist",
                    category=CATEGORIES["POTENTIAL_SECURITY"],
                    severity="critical",
                    is_critical_override=True,
                    evidence=f"Hostname '{hostname}' is present on the user-configured denylist.",
                    remediation="Do not proceed. Domain blocked by explicit security policy.",
                )
            )

        # 2. Transport Protocol Security (HTTP vs HTTPS)
        if scheme == "http":
            findings.append(
                SecurityFinding(
                    id="unencrypted-http-transport",
                    title="Connection is not encrypted (Plain HTTP)",
                    category=CATEGORIES["TECHNICAL"],
                    severity="high",
                    weight=30,
                    evidence=f"URL uses unencrypted 'http://' transport. Data in transit can be eavesdropped.",
                    remediation="Avoid entering credentials, personal data, or payment information.",
                )
            )
        elif scheme != "https":
            findings.append(
                SecurityFinding(
                    id="unknown-transport-scheme",
                    title=f"Non-standard web protocol ({scheme})",
                    category=CATEGORIES["UNVERIFIED"],
                    severity="low",
                    evidence=f"Target protocol is '{scheme}'.",
                    remediation="Review origin carefully.",
                )
            )

        # 3. Hostname Deception & Structural Checks
        # IP Address literal as hostname
        try:
            ipaddress.ip_address(hostname)
            findings.append(
                SecurityFinding(
                    id="ip-address-hostname",
                    title="Raw IP address used as hostname",
                    category=CATEGORIES["POTENTIAL_SECURITY"],
                    severity="high",
                    weight=28,
                    evidence=f"Hostname is a direct IP address literal ({hostname}) rather than a registered domain name.",
                    remediation="Legitimate institutions use registered domain names with TLS certificates.",
                )
            )
        except ValueError:
            pass

        # Punycode / IDN Homograph check
        if "xn--" in hostname:
            findings.append(
                SecurityFinding(
                    id="punycode-homograph-detected",
                    title="Punycode / Internationalized domain detected",
                    category=CATEGORIES["POTENTIAL_SECURITY"],
                    severity="high",
                    weight=28,
                    evidence=f"Hostname contains Punycode prefix 'xn--' ({hostname}). Possible homograph lookalike.",
                    remediation="Inspect decoded characters to ensure the domain is not mimicking a trusted brand.",
                )
            )

        # Multiple hyphens (common phishing indicator)
        if hostname.count("-") >= 3:
            findings.append(
                SecurityFinding(
                    id="excessive-hyphenated-domain",
                    title="Suspiciously hyphenated domain structure",
                    category=CATEGORIES["POTENTIAL_SECURITY"],
                    severity="medium",
                    weight=14,
                    evidence=f"Hostname contains {hostname.count('-')} hyphens, a frequent indicator of phishing brand mimics.",
                    remediation="Confirm canonical organization domain name before logging in.",
                )
            )

        # 4. Mixed Content
        if is_mixed_content and scheme == "https":
            findings.append(
                SecurityFinding(
                    id="mixed-content-detected",
                    title="Mixed content detected on secure page",
                    category=CATEGORIES["TECHNICAL"],
                    severity="medium",
                    weight=18,
                    evidence="HTTPS page loads subresources (scripts, images, or forms) over unencrypted HTTP.",
                    remediation="Unencrypted active resources can be manipulated by network attackers.",
                )
            )

        # 5. Form & Credential Auditing
        if dom_forms:
            for form in dom_forms:
                has_password = bool(
                    form.get("has_password")
                    or form.get("hasPassword")
                    or form.get("hasPasswordField")
                )
                action_url = form.get("action", "").strip()
                action_scheme = urlparse(action_url).scheme.lower() if action_url else scheme

                # Critical Override 1: Password field on unencrypted HTTP page
                if has_password and (scheme == "http" or action_scheme == "http"):
                    findings.append(
                        SecurityFinding(
                            id="critical-password-over-http",
                            title="CRITICAL: Password input field on unencrypted HTTP page",
                            category=CATEGORIES["TECHNICAL"],
                            severity="critical",
                            is_critical_override=True,
                            evidence="Password input field detected on an unencrypted HTTP webpage or submitting to HTTP destination.",
                            remediation="Do NOT enter credentials. Plaintext passwords can be intercepted trivially.",
                        )
                    )

                # Critical Override 2: Form action destination submits over HTTP from HTTPS page
                if scheme == "https" and action_scheme == "http":
                    findings.append(
                        SecurityFinding(
                            id="critical-insecure-form-action",
                            title="CRITICAL: Insecure credential transmission target",
                            category=CATEGORIES["TECHNICAL"],
                            severity="critical",
                            is_critical_override=True,
                            evidence=f"Form action submits to unencrypted HTTP endpoint: {action_url}",
                            remediation="Do not submit credentials. Transmission target is unencrypted.",
                        )
                    )

                # Cross-origin submission warning
                if action_url and not action_url.startswith(("/", "#", "?")):
                    action_host = (urlparse(action_url).hostname or "").lower()
                    if action_host and action_host != hostname and not action_host.endswith("." + hostname):
                        findings.append(
                            SecurityFinding(
                                id="cross-origin-form-destination",
                                title="Form submits to external third-party origin",
                                category=CATEGORIES["POTENTIAL_SECURITY"],
                                severity="medium",
                                weight=16,
                                evidence=f"Form on '{hostname}' submits data to external origin '{action_host}'.",
                                remediation="Verify that the third-party destination is an authorized authentication broker.",
                            )
                        )

        # 6. Compute final deterministic score
        assessment = calculate_risk_score(findings, coverage)
        assessment["url"] = url
        assessment["hostname"] = hostname
        assessment["scheme"] = scheme
        return assessment
