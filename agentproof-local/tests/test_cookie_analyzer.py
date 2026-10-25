"""Unit tests for AgentProof Cookie Security Analyzer."""

import pytest
from agentproof.cookie_analyzer import CookieAnalyzer


@pytest.fixture
def analyzer():
    return CookieAnalyzer()


def test_zero_values_stored_and_sanitized(analyzer):
    cookies = [
        {
            "name": "session_id",
            "value": "SUPER_SECRET_PLAINTEXT_SESSION_TOKEN_12345",
            "domain": "example.com",
            "path": "/",
            "secure": True,
            "httpOnly": True,
            "sameSite": "strict",
        }
    ]
    res = analyzer.analyze_cookies(cookies, is_https=True, origin_domain="example.com")
    assert res["coverage"]["zero_values_stored"] is True
    # Verify no raw token values are in sanitized inventory or findings
    for item in res["sanitized_inventory"]:
        assert "value" not in item
        assert "SUPER_SECRET_PLAINTEXT_SESSION_TOKEN_12345" not in str(item)
    assert "SUPER_SECRET_PLAINTEXT_SESSION_TOKEN_12345" not in str(res["findings"])


def test_missing_secure_flag_on_https(analyzer):
    cookies = [
        {
            "name": "auth_token",
            "domain": "example.com",
            "secure": False,  # Missing Secure on HTTPS
            "httpOnly": True,
            "sameSite": "lax",
        }
    ]
    res = analyzer.analyze_cookies(cookies, is_https=True, origin_domain="example.com")
    assert any("missing-secure" in f["id"] for f in res["findings"])
    assert res["score"] >= 20


def test_missing_httponly_flag(analyzer):
    cookies = [
        {
            "name": "session",
            "domain": "example.com",
            "secure": True,
            "httpOnly": False,  # Missing HttpOnly
            "sameSite": "lax",
        }
    ]
    res = analyzer.analyze_cookies(cookies, is_https=True, origin_domain="example.com")
    assert any("missing-httponly" in f["id"] for f in res["findings"])


def test_samesite_none_without_secure(analyzer):
    cookies = [
        {
            "name": "tracker",
            "domain": "example.com",
            "secure": False,
            "httpOnly": False,
            "sameSite": "none",
        }
    ]
    res = analyzer.analyze_cookies(cookies, is_https=True, origin_domain="example.com")
    assert any("samesite-none" in f["id"] for f in res["findings"])
