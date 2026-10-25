"""Unit tests for AgentProof Website Scanner."""

import pytest
from agentproof.website_scanner import WebsiteScanner


@pytest.fixture
def scanner():
    return WebsiteScanner(
        allowlist=["internal.corp", "trusted.bank.com"],
        denylist=["known-phishing.xyz", "malicious-site.top"],
    )


def test_benign_https_site(scanner):
    res = scanner.scan_url("https://www.example.com", dom_forms=[])
    assert res["score"] == 0
    assert res["level"] == "Low"
    assert res["critical_override"] is False
    assert len(res["findings"]) == 0


def test_plain_http_transport(scanner):
    res = scanner.scan_url("http://insecure-site.org")
    assert res["score"] >= 25
    assert any("unencrypted-http" in f["id"] for f in res["findings"])


def test_raw_ip_literal_hostname(scanner):
    res = scanner.scan_url("http://192.168.1.100/login")
    assert any("ip-address" in f["id"] for f in res["findings"])


def test_punycode_idn_homograph(scanner):
    res = scanner.scan_url("https://xn--pple-43d.com")
    assert any("punycode" in f["id"] for f in res["findings"])


def test_password_form_on_http_triggers_critical_override(scanner):
    forms = [
        {
            "action": "http://insecure-login.org/auth",
            "method": "POST",
            "hasPasswordField": True,
        }
    ]
    res = scanner.scan_url("http://insecure-login.org", dom_forms=forms)
    assert res["critical_override"] is True
    assert res["score"] >= 75
    assert res["level"] == "Critical"
    assert any("password" in f["id"] for f in res["findings"])


def test_denylist_detection(scanner):
    res = scanner.scan_url("https://known-phishing.xyz")
    assert res["critical_override"] is True
    assert res["score"] >= 75
    assert any("denylist" in f["id"] for f in res["findings"])


def test_allowlist_bypass(scanner):
    res = scanner.scan_url("http://internal.corp")
    assert res["score"] == 0
    assert res["level"] == "Low"
    assert any("allowlist" in f["id"] for f in res["findings"])
