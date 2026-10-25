"""Site Permission Analyzer for AgentProof Local Security Suite.

Evaluates browser origin permission states and privacy impacts:
- Inspects camera, microphone, geolocation, notifications, and clipboard states.
- Assesses risk of sensitive sensor access on untrusted origins.
- Provides actionable remediation advice.
"""

from typing import Any
from agentproof.risk_engine import CATEGORIES, SecurityFinding, calculate_risk_score


PERMISSION_WEIGHTS = {
    "camera": 24,
    "microphone": 24,
    "geolocation": 18,
    "clipboard-read": 16,
    "notifications": 8,
}


class PermissionAnalyzer:
    """Evaluates origin permission grants and assesses privacy impact."""

    def analyze_permissions(
        self,
        permissions: dict[str, str],
        origin: str = "",
        is_https: bool = True,
    ) -> dict[str, Any]:
        findings: list[SecurityFinding] = []
        coverage = {
            "origin": origin,
            "permissions_inspected": True,
            "permission_count": len(permissions),
        }

        active_grants = []

        for perm_name, state in permissions.items():
            norm_state = (state or "prompt").lower()
            norm_name = perm_name.lower()

            active_grants.append({
                "permission": norm_name,
                "state": norm_state,
                "impact": "High" if norm_name in ("camera", "microphone", "geolocation") else "Medium",
            })

            if norm_state == "granted":
                # High-privilege hardware access check
                if norm_name in ("camera", "microphone"):
                    findings.append(
                        SecurityFinding(
                            id=f"granted-sensor-{norm_name}",
                            title=f"Origin has access to physical {norm_name}",
                            category=CATEGORIES["POTENTIAL_SECURITY"],
                            severity="medium",
                            weight=PERMISSION_WEIGHTS.get(norm_name, 18),
                            evidence=f"Origin '{origin}' is actively granted unrestricted {norm_name} recording.",
                            remediation=f"Revoke {norm_name} permission in Chrome site settings if not explicitly required.",
                        )
                    )
                elif norm_name == "geolocation":
                    findings.append(
                        SecurityFinding(
                            id="granted-geolocation",
                            title="Origin has persistent access to physical Geolocation",
                            category=CATEGORIES["PRIVACY"],
                            severity="medium",
                            weight=16,
                            evidence=f"Origin '{origin}' is granted permission to query accurate device location.",
                            remediation="Reset location permission in site settings to prevent background tracking.",
                        )
                    )
                elif norm_name in ("clipboard-read", "clipboard"):
                    findings.append(
                        SecurityFinding(
                            id="granted-clipboard-read",
                            title="Origin can read system Clipboard contents",
                            category=CATEGORIES["POTENTIAL_SECURITY"],
                            severity="high",
                            weight=24,
                            evidence=f"Origin '{origin}' is allowed to read clipboard data without per-operation prompt.",
                            remediation="Clipboard contents may contain passwords or tokens. Revoke clipboard permission.",
                        )
                    )

        assessment = calculate_risk_score(findings, coverage)
        assessment["active_grants"] = active_grants
        return assessment
