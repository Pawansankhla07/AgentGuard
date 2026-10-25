"""Deterministic Risk Scoring Engine for AgentProof Local.

Implements transparent, heuristic risk scoring (0-100), risk tiers,
and official recommendations with category separation, deduplication,
subscore bounds, and critical overrides.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


RECOMMENDATIONS = {
    RiskLevel.LOW: (
        "No major issues were detected in the checks performed. "
        "Logging in may be reasonable, but safety is not guaranteed."
    ),
    RiskLevel.MEDIUM: "Review the highlighted issues before logging in.",
    RiskLevel.HIGH: (
        "Avoid entering credentials until the significant issues are resolved "
        "or independently verified."
    ),
    RiskLevel.CRITICAL: (
        "Do not enter credentials while the critical warning remains unresolved."
    ),
}

SEVERITY_WEIGHTS = {
    "low": 5,
    "medium": 14,
    "high": 28,
    "critical": 55,
}

CATEGORIES = {
    "TECHNICAL": "Confirmed technical observations",
    "POTENTIAL_SECURITY": "Potential security concerns",
    "PRIVACY": "Privacy-policy concerns",
    "UNVERIFIED": "Unknown or unverified conditions",
    "CONNECTION": "Confirmed technical observations",
    "COOKIES": "Potential security concerns",
    "PERMISSIONS": "Potential security concerns",
}


@dataclass
class SecurityFinding:
    id: str
    title: str
    category: str = CATEGORIES["POTENTIAL_SECURITY"]
    severity: str = "low"
    weight: Optional[int] = None
    evidence: str = ""
    remediation: str = ""
    is_critical_override: bool = False
    verified: bool = True
    source: str = "scanner"

    def __post_init__(self):
        self.severity = self.severity.lower()
        if self.weight is None:
            self.weight = SEVERITY_WEIGHTS.get(self.severity, 5)
        self.weight = max(0, self.weight)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "severity": self.severity,
            "weight": self.weight,
            "evidence": self.evidence,
            "remediation": self.remediation,
            "isCriticalOverride": self.is_critical_override,
            "verified": self.verified,
            "source": self.source,
        }


def calculate_risk_score(
    findings: list[SecurityFinding | dict[str, Any]],
    coverage: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Calculate deterministic risk assessment from a list of findings and scan coverage.

    Features:
    - Deduplication by finding id
    - Category separation
    - Critical overrides (e.g. password over HTTP forces minimum score of 75 / Critical)
    - Transparent category score summation capped at 100
    - Official recommendation generation
    """
    coverage = coverage or {}

    # Standardize input
    normalized_findings: list[SecurityFinding] = []
    seen_ids: set[str] = set()

    for item in findings:
        if isinstance(item, dict):
            fid = item.get("id")
            if not fid or fid in seen_ids:
                continue
            seen_ids.add(fid)
            finding = SecurityFinding(
                id=fid,
                title=item.get("title", ""),
                category=item.get("category", CATEGORIES["POTENTIAL_SECURITY"]),
                severity=item.get("severity", "low"),
                weight=item.get("weight"),
                evidence=item.get("evidence", ""),
                remediation=item.get("remediation", ""),
                is_critical_override=bool(item.get("isCriticalOverride") or item.get("is_critical_override")),
                verified=bool(item.get("verified", True)),
                source=item.get("source", "scanner"),
            )
            normalized_findings.append(finding)
        elif isinstance(item, SecurityFinding):
            if item.id in seen_ids:
                continue
            seen_ids.add(item.id)
            normalized_findings.append(item)

    # Separate into category buckets
    category_buckets: dict[str, list[SecurityFinding]] = {
        CATEGORIES["TECHNICAL"]: [],
        CATEGORIES["POTENTIAL_SECURITY"]: [],
        CATEGORIES["PRIVACY"]: [],
        CATEGORIES["UNVERIFIED"]: [],
    }

    critical_override = False
    critical_reasons: list[str] = []

    for f in normalized_findings:
        bucket = category_buckets.get(f.category)
        if bucket is not None:
            bucket.append(f)
        else:
            category_buckets[CATEGORIES["POTENTIAL_SECURITY"]].append(f)

        if f.is_critical_override or f.severity == "critical":
            critical_override = True
            critical_reasons.append(f.title)

    # Calculate raw category scores
    tech_score = sum(f.weight for f in category_buckets[CATEGORIES["TECHNICAL"]])
    sec_score = sum(f.weight for f in category_buckets[CATEGORIES["POTENTIAL_SECURITY"]])
    privacy_score = sum(f.weight for f in category_buckets[CATEGORIES["PRIVACY"]])
    unverified_score = sum(f.weight for f in category_buckets[CATEGORIES["UNVERIFIED"]])

    # Cap category contributions to prevent single-domain skew while allowing critical accumulation
    capped_tech = min(tech_score, 100)
    capped_sec = min(sec_score, 100)
    capped_privacy = min(privacy_score, 50)
    capped_unverified = min(unverified_score, 25)

    base_score = min(100, capped_tech + capped_sec + capped_privacy + capped_unverified)

    # Apply critical override rule
    if critical_override:
        final_score = max(base_score, 75)
    else:
        final_score = base_score

    final_score = max(0, min(100, int(final_score)))

    # Determine risk level
    if final_score >= 75 or critical_override:
        risk_level = RiskLevel.CRITICAL
    elif final_score >= 50:
        risk_level = RiskLevel.HIGH
    elif final_score >= 25:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW

    recommendation = RECOMMENDATIONS[risk_level]

    return {
        "score": final_score,
        "level": risk_level.value,
        "risk_level": risk_level.value,
        "recommendation": recommendation,
        "critical_override": critical_override,
        "critical_reasons": critical_reasons,
        "findings_count": len(normalized_findings),
        "category_scores": {
            "technical": capped_tech,
            "security": capped_sec,
            "privacy": capped_privacy,
            "unverified": capped_unverified,
        },
        "by_category": {cat: [f.to_dict() for f in bucket] for cat, bucket in category_buckets.items() if bucket},
        "findings": [f.to_dict() for f in normalized_findings],
        "coverage": coverage,
        "passed_checks": [k for k, v in coverage.items() if v],
        "explanation": f"Evaluated {len(normalized_findings)} findings resulting in risk score {final_score}/100 ({risk_level.value}).",
    }
