"""Integration tests for Companion API endpoints and authentication."""

from pathlib import Path
import pytest
from starlette.testclient import TestClient
from agentproof.config import config
from agentproof.server import app


@pytest.fixture
def client():
    return TestClient(app)


def test_companion_status_endpoint(client):
    res = client.get("/api/companion/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "active"
    assert "antivirus_available" in data
    assert "quarantine_count" in data


def test_companion_scan_unauthorized_without_token(client, tmp_path):
    test_file = tmp_path / "test.txt"
    test_file.write_bytes(b"content")

    # Missing token
    res = client.post("/api/companion/scan", json={"file_path": str(test_file)})
    assert res.status_code == 401

    # Invalid token
    res2 = client.post(
        "/api/companion/scan",
        json={"file_path": str(test_file)},
        headers={"X-AgentProof-Token": "wrong-token"},
    )
    assert res2.status_code == 401


def test_companion_scan_authorized(client, tmp_path):
    test_file = tmp_path / "authorized_sample.txt"
    test_file.write_bytes(b"Authorized scan test payload")

    res = client.post(
        "/api/companion/scan",
        json={"file_path": str(test_file)},
        headers={"X-AgentProof-Token": config.companion_token},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "sha256" in data
    assert data["filename"] == "authorized_sample.txt"


def test_companion_quarantine_workflow(client, tmp_path):
    target_file = tmp_path / "threat_sample.exe"
    target_file.write_bytes(b"malicious-payload")

    headers = {"X-AgentProof-Token": config.companion_token}

    # Quarantine without confirmation fails
    res_no_confirm = client.post(
        "/api/companion/quarantine",
        json={"file_path": str(target_file), "confirmed": False},
        headers=headers,
    )
    assert res_no_confirm.status_code == 400

    # Quarantine with confirmation succeeds
    res_quarantine = client.post(
        "/api/companion/quarantine",
        json={"file_path": str(target_file), "confirmed": True, "reason": "Test quarantine"},
        headers=headers,
    )
    assert res_quarantine.status_code == 200
    q_data = res_quarantine.json()
    assert q_data["success"] is True
    qid = q_data["quarantine_id"]

    # List quarantine
    res_list = client.get("/api/companion/quarantine", headers=headers)
    assert res_list.status_code == 200
    items = res_list.json()
    assert any(item["quarantine_id"] == qid for item in items)

    # Restore with confirmation
    res_restore = client.post(
        "/api/companion/quarantine/restore",
        json={"quarantine_id": qid, "confirmed": True},
        headers=headers,
    )
    assert res_restore.status_code == 200
    assert target_file.exists()


def test_scanner_website_endpoint(client):
    res = client.post(
        "/api/scanner/website",
        json={
            "url": "http://insecure-site.com",
            "dom_forms": [{"action": "http://insecure-site.com/login", "hasPasswordField": True}],
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["critical_override"] is True
    assert data["score"] >= 75
    assert data["level"] == "Critical"


def test_scanner_cookies_endpoint(client):
    res = client.post(
        "/api/scanner/cookies",
        json={
            "cookies": [{"name": "sid", "value": "secret", "secure": False, "httpOnly": False}],
            "is_https": True,
            "origin_domain": "example.com",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["coverage"]["zero_values_stored"] is True
    assert any("missing-secure" in f["id"] for f in data["findings"])
