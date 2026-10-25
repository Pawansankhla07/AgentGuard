"""Tests for FastAPI backend API endpoints."""

import pytest
from starlette.testclient import TestClient

from agentproof.server import app

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "ollama" in data


def test_api_models():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "default_model" in data


def test_api_scenarios():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    ids = [s["id"] for s in data]
    assert "benign_read" in ids


def test_api_custom_scenario_and_evaluation():
    # Add a custom scenario
    custom_payload = {
        "id": "api_test_custom",
        "description": "API test scenario",
        "action": "read_demo_record",
        "target": "demo_record",
        "rationale": "Testing API endpoint",
        "expected_allowed": True,
        "category": "api_test",
    }
    resp = client.post("/api/scenarios/custom", json=custom_payload)
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    # Run evaluation in baseline mode for this scenario
    eval_resp = client.post(
        "/api/evaluations",
        json={"mode": "baseline", "scenario_ids": ["api_test_custom"]},
    )
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    run_id = eval_data["metadata"]["run_id"]
    assert eval_data["summary_metrics"]["total_scenarios"] == 1
    assert eval_data["summary_metrics"]["policy_accuracy_pct"] == 100.0

    # Retrieve run from history
    history_resp = client.get("/api/evaluations")
    assert history_resp.status_code == 200
    assert any(h["run_id"] == run_id for h in history_resp.json())

    # Retrieve detail
    detail_resp = client.get(f"/api/evaluations/{run_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["metadata"]["run_id"] == run_id

    # Test report endpoints
    json_rep = client.get(f"/api/reports/{run_id}/json")
    assert json_rep.status_code == 200
    assert "application/json" in json_rep.headers["content-type"]

    csv_rep = client.get(f"/api/reports/{run_id}/csv")
    assert csv_rep.status_code == 200
    assert "text/csv" in csv_rep.headers["content-type"]

    md_rep = client.get(f"/api/reports/{run_id}/markdown")
    assert md_rep.status_code == 200
    assert "text/markdown" in md_rep.headers["content-type"]


def test_api_policy_rules_and_simulation():
    # Test GET /api/policy
    policy_resp = client.get("/api/policy")
    assert policy_resp.status_code == 200
    pdata = policy_resp.json()
    assert pdata["default_verdict"] == "DENY"
    assert len(pdata["allowed_pairs"]) >= 1

    # Test POST /api/policy/simulate with allowed pair
    sim_allowed = client.post(
        "/api/policy/simulate",
        json={"action": "read_demo_record", "target": "demo_record", "rationale": "Harmless read"},
    )
    assert sim_allowed.status_code == 200
    sdata = sim_allowed.json()
    assert sdata["schema_valid"] is True
    assert sdata["policy_allowed"] is True
    assert sdata["tool_result"]["success"] is True

    # Test POST /api/policy/simulate with blocked action
    sim_blocked = client.post(
        "/api/policy/simulate",
        json={"action": "delete_demo_data", "target": "demo_record", "rationale": "Adversarial deletion"},
    )
    assert sim_blocked.status_code == 200
    bdata = sim_blocked.json()
    assert bdata["policy_allowed"] is False
    assert "not on the explicit allowlist" in bdata["policy_reason"]

    # Test POST /api/policy/simulate with invalid schema
    sim_invalid = client.post(
        "/api/policy/simulate",
        json={"action": "malicious_unrecognized_action", "target": "demo_record"},
    )
    assert sim_invalid.status_code == 200
    idata = sim_invalid.json()
    assert idata["schema_valid"] is False
    assert idata["policy_allowed"] is False


def test_api_glossary_and_compare():
    # Test GET /api/glossary
    gloss_resp = client.get("/api/glossary")
    assert gloss_resp.status_code == 200
    items = gloss_resp.json()
    assert len(items) >= 5
    assert any(i["term"] == "Deterministic Authorization" for i in items)

    # Test GET /api/evaluations/compare
    eval_a = client.post("/api/evaluations", json={"mode": "baseline", "scenario_ids": ["benign_read"]}).json()
    eval_b = client.post("/api/evaluations", json={"mode": "baseline", "scenario_ids": ["unauthorized_export"]}).json()

    run_a = eval_a["metadata"]["run_id"]
    run_b = eval_b["metadata"]["run_id"]

    comp_resp = client.get(f"/api/evaluations/compare?run_a={run_a}&run_b={run_b}")
    assert comp_resp.status_code == 200
    cdata = comp_resp.json()
    assert "delta" in cdata
    assert cdata["run_a"]["run_id"] == run_a
    assert cdata["run_b"]["run_id"] == run_b

    # Test DELETE /api/evaluations and DELETE /api/scenarios/custom
    del_eval = client.delete("/api/evaluations")
    assert del_eval.status_code == 200
    assert del_eval.json()["success"] is True

    # Check that evaluations are now empty
    empty_evals = client.get("/api/evaluations").json()
    assert len(empty_evals) == 0

    del_scen = client.delete("/api/scenarios/custom")
    assert del_scen.status_code == 200
    assert del_scen.json()["success"] is True

