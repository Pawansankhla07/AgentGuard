"""Unit tests for reporting and export capabilities."""

import json
from pathlib import Path

from agentproof.metrics import calculate_metrics
from agentproof.reporting import (
    generate_json_report,
    serialize_json_report,
    generate_csv_report,
    generate_markdown_summary,
    save_report_to_disk,
    list_saved_reports,
)


def test_generate_and_serialize_json_report(tmp_path):
    results = [
        {
            "scenario_id": "benign_read",
            "category": "baseline",
            "evaluation_mode": "baseline",
            "model_name": "N/A",
            "expected_action": "read_demo_record",
            "expected_target": "demo_record",
            "expected_allowed": True,
            "proposed_action": "read_demo_record",
            "proposed_target": "demo_record",
            "proposal_valid": True,
            "intent_match": True,
            "policy_allowed": True,
            "policy_reason": "Allowed by allowlist",
            "policy_correct": True,
            "tool_success": True,
            "error_type": None,
            "error_message": None,
            "duration_ms": 15.0,
            "timestamp": "2026-10-25T06:00:00Z",
        }
    ]
    metrics = calculate_metrics(results)
    report = generate_json_report(results, metrics, eval_mode="baseline", run_id="test_run_123")

    assert report["metadata"]["run_id"] == "test_run_123"
    assert report["metadata"]["scenario_count"] == 1
    assert "policy_accuracy_pct" in report["summary_metrics"]

    json_str = serialize_json_report(report)
    parsed = json.loads(json_str)
    assert parsed["metadata"]["run_id"] == "test_run_123"


def test_generate_csv_report():
    results = [
        {
            "scenario_id": "benign_read",
            "category": "baseline",
            "evaluation_mode": "baseline",
            "model_name": "N/A",
            "expected_action": "read_demo_record",
            "expected_target": "demo_record",
            "expected_allowed": True,
            "proposed_action": "read_demo_record",
            "proposed_target": "demo_record",
            "proposal_valid": True,
            "intent_match": True,
            "policy_allowed": True,
            "policy_reason": "Allowed by allowlist",
            "policy_correct": True,
            "tool_success": True,
            "error_type": None,
            "error_message": None,
            "duration_ms": 15.0,
            "timestamp": "2026-10-25T06:00:00Z",
        }
    ]
    csv_str = generate_csv_report(results)
    lines = csv_str.strip().split("\r\n" if "\r\n" in csv_str else "\n")
    assert len(lines) == 2  # Header + 1 row
    assert "scenario_id" in lines[0]
    assert "benign_read" in lines[1]


def test_generate_markdown_summary():
    results = [
        {
            "scenario_id": "benign_read",
            "category": "baseline",
            "expected_allowed": True,
            "policy_allowed": True,
            "policy_correct": True,
            "intent_match": True,
            "error_type": None,
        }
    ]
    metrics = calculate_metrics(results)
    report = generate_json_report(results, metrics, eval_mode="baseline", run_id="test_run_md")
    md = generate_markdown_summary(report)
    assert "# AgentProof Local — Evaluation Report" in md
    assert "`test_run_md`" in md
    assert "benign_read" in md


def test_save_report_to_disk_and_list(tmp_path):
    results = [
        {
            "scenario_id": "benign_read",
            "category": "baseline",
            "expected_allowed": True,
            "policy_allowed": True,
            "policy_correct": True,
            "intent_match": True,
            "error_type": None,
        }
    ]
    metrics = calculate_metrics(results)
    report = generate_json_report(results, metrics, eval_mode="baseline", run_id="test_disk_run")

    json_path, csv_path = save_report_to_disk(report, directory=tmp_path)
    assert json_path.exists()
    assert csv_path.exists()

    saved_list = list_saved_reports(directory=tmp_path)
    assert len(saved_list) == 1
    assert saved_list[0]["run_id"] == "test_disk_run"
