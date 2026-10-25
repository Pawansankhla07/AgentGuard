"""Unit tests for AgentProof Deterministic Risk Engine."""

import pytest
from agentproof.risk_engine import (
    CATEGORIES,
    SecurityFinding,
    calculate_risk_score,
)


def test_empty_findings_returns_zero_score():
    res = calculate_risk_score([], {"connection_checked": True})
    assert res["score"] == 0
    assert res["level"] == "Low"
    assert res["critical_override"] is False
    assert "No major issues were detected" in res["recommendation"]
    assert len(res["findings"]) == 0


def test_score_boundary_caps_at_100():
    findings = [
        SecurityFinding(
            id=f"issue-{i}",
            title=f"Critical Issue {i}",
            category=CATEGORIES["CONNECTION"],
            severity="critical",
            evidence="Severe vulnerability.",
            remediation="Fix immediately.",
        )
        for i in range(10)
    ]
    res = calculate_risk_score(findings)
    assert res["score"] == 100
    assert res["level"] == "Critical"


def test_critical_override_forces_minimum_75():
    findings = [
        SecurityFinding(
            id="insecure-credential-form",
            title="Password submitted over plain HTTP",
            category=CATEGORIES["CONNECTION"],
            severity="critical",
            evidence="Unencrypted login.",
            remediation="Never submit credentials.",
        )
    ]
    res = calculate_risk_score(findings)
    assert res["score"] >= 75
    assert res["critical_override"] is True
    assert res["level"] == "Critical"
    assert "Do not enter credentials" in res["recommendation"]


def test_deduplication_of_findings():
    findings = [
        SecurityFinding(
            id="missing-secure-flag",
            title="Missing Secure flag",
            category=CATEGORIES["COOKIES"],
            severity="medium",
            evidence="Cookie auth lacks Secure.",
            remediation="Add Secure flag.",
        ),
        SecurityFinding(
            id="missing-secure-flag",
            title="Missing Secure flag (duplicate)",
            category=CATEGORIES["COOKIES"],
            severity="medium",
            evidence="Duplicate cookie finding.",
            remediation="Add Secure flag.",
        ),
    ]
    res = calculate_risk_score(findings)
    assert len(res["findings"]) == 1
    assert res["findings"][0]["id"] == "missing-secure-flag"


def test_category_separation():
    findings = [
        SecurityFinding(
            id="http-plain",
            title="Plain HTTP",
            category=CATEGORIES["CONNECTION"],
            severity="high",
            evidence="No TLS",
            remediation="Use HTTPS",
        ),
        SecurityFinding(
            id="cookie-js",
            title="JS accessible cookie",
            category=CATEGORIES["COOKIES"],
            severity="medium",
            evidence="Missing HttpOnly",
            remediation="Add HttpOnly",
        ),
        SecurityFinding(
            id="sensor-grant",
            title="Camera allowed",
            category=CATEGORIES["PERMISSIONS"],
            severity="low",
            evidence="Camera allowed",
            remediation="Review",
        ),
    ]
    res = calculate_risk_score(findings)
    by_cat = res["by_category"]
    assert CATEGORIES["CONNECTION"] in by_cat
    assert CATEGORIES["COOKIES"] in by_cat
    assert CATEGORIES["PERMISSIONS"] in by_cat
