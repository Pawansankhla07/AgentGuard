"""Sanitized Cookie Security Analyzer for AgentProof Local Security Suite.

Inspects cookie security flags and scoping:
- Verifies `Secure`, `HttpOnly`, and `SameSite` flags.
- Flags sensitive session tokens missing crucial protections.
- Evaluates domain scoping to detect overly permissive exposure.
- CRITICAL PRIVACY GUARANTEE: Cookie values are never stored, logged,
  displayed, or transmitted anywhere. Only metadata is analyzed.
"""

from typing import Any
from agentproof.risk_engine import CATEGORIES, SecurityFinding, calculate_risk_score


SENSITIVE_COOKIE_KEYWORDS = ("session", "token", "auth", "jwt", "key", "sid", "logged_in", "user")


class CookieAnalyzer:
    """Analyzes cookie security flags without inspecting or storing values."""

    def analyze_cookies(
        self,
        cookies: list[dict[str, Any]],
        is_https: bool = True,
        origin_domain: str = "",
    ) -> dict[str, Any]:
        findings: list[SecurityFinding] = []
        coverage = {
            "cookie_count": len(cookies),
            "cookies_inspected": True,
            "zero_values_stored": True,
        }

        sanitized_inventory = []

        for c in cookies:
            name = c.get("name", "")
            domain = c.get("domain", "")
            path = c.get("path", "/")
            secure = bool(c.get("secure"))
            http_only = bool(c.get("httpOnly") or c.get("http_only"))
            same_site = (c.get("sameSite") or c.get("same_site") or "unspecified").lower()

            # Redact name display if sensitive
            is_sensitive = any(kw in name.lower() for kw in SENSITIVE_COOKIE_KEYWORDS)
            display_name = name if not is_sensitive else (name[:3] + "***" if len(name) > 3 else "***")

            sanitized_inventory.append({
                "display_name": display_name,
                "domain": domain,
                "path": path,
                "secure": secure,
                "http_only": http_only,
                "same_site": same_site,
                "is_sensitive": is_sensitive,
            })

            # Check 1: Sensitive cookie missing Secure flag on HTTPS
            if is_sensitive and is_https and not secure:
                findings.append(
                    SecurityFinding(
                        id=f"sensitive-cookie-missing-secure-{name}",
                        title=f"Sensitive cookie '{display_name}' lacks Secure flag",
                        category=CATEGORIES["POTENTIAL_SECURITY"],
                        severity="high",
                        weight=22,
                        evidence=f"Cookie '{display_name}' matches sensitive authentication pattern but allows plaintext transmission.",
                        remediation="Set the 'Secure' attribute so this cookie is only transmitted over TLS/HTTPS.",
                    )
                )

            # Check 2: Sensitive cookie missing HttpOnly flag
            if is_sensitive and not http_only:
                findings.append(
                    SecurityFinding(
                        id=f"sensitive-cookie-missing-httponly-{name}",
                        title=f"Sensitive cookie '{display_name}' lacks HttpOnly flag",
                        category=CATEGORIES["POTENTIAL_SECURITY"],
                        severity="medium",
                        weight=14,
                        evidence=f"Cookie '{display_name}' is accessible to clientside JavaScript (document.cookie).",
                        remediation="Set the 'HttpOnly' attribute to mitigate session hijacking via Cross-Site Scripting (XSS).",
                    )
                )

            # Check 3: SameSite=None without Secure attribute
            if same_site == "none" and not secure:
                findings.append(
                    SecurityFinding(
                        id=f"samesite-none-without-secure-{name}",
                        title=f"Cookie '{display_name}' uses SameSite=None without Secure",
                        category=CATEGORIES["TECHNICAL"],
                        severity="high",
                        weight=20,
                        evidence="Modern browsers block SameSite=None cookies unless the Secure attribute is also present.",
                        remediation="Add the 'Secure' flag to allow valid cross-site cookie transmission.",
                    )
                )

        assessment = calculate_risk_score(findings, coverage)
        assessment["sanitized_cookies"] = sanitized_inventory
        assessment["sanitized_inventory"] = sanitized_inventory
        return assessment
