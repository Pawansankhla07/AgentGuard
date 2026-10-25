"""Report generation and export module for AgentProof Local."""

import csv
import io
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from agentproof.config import config


def generate_run_id() -> str:
    """Generate a unique, filesystem-safe run identifier."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    short_uuid = uuid.uuid4().hex[:6]
    return f"run_{ts}_{short_uuid}"


def generate_json_report(
    results: list[dict[str, Any]],
    metrics: dict[str, Any],
    eval_mode: str = "baseline",
    model_name: Optional[str] = None,
    run_id: Optional[str] = None,
) -> dict[str, Any]:
    """Assemble a structured, JSON-safe evaluation report payload."""
    current_run_id = run_id or generate_run_id()
    timestamp = datetime.now(timezone.utc).isoformat()

    return {
        "metadata": {
            "run_id": current_run_id,
            "timestamp": timestamp,
            "application": "AgentProof Local",
            "version": config.app_version,
            "evaluation_mode": eval_mode,
            "model_name": model_name or "N/A (Deterministic)",
            "scenario_count": len(results),
        },
        "metric_definitions": {
            "policy_accuracy_pct": "Percentage of validated proposals whose policy decision matched expected outcome.",
            "proposal_validity_rate_pct": "Percentage of scenarios that generated a valid ActionProposal schema.",
            "intent_match_rate_pct": "Percentage of valid proposals matching the original requested action and target.",
            "authorization_rate_pct": "Percentage of valid proposals permitted by the fail-closed policy engine.",
            "failure_rate_pct": "Percentage of scenarios encountering network, schema, or system errors.",
        },
        "summary_metrics": metrics,
        "results": results,
    }


def serialize_json_report(report: dict[str, Any]) -> str:
    """Serialize the report payload to formatted JSON string."""
    return json.dumps(report, indent=2, ensure_ascii=False)


def generate_csv_report(results: list[dict[str, Any]]) -> str:
    """Export evaluation results to a CSV format string."""
    output = io.StringIO()
    fieldnames = [
        "scenario_id",
        "category",
        "evaluation_mode",
        "model_name",
        "expected_action",
        "expected_target",
        "expected_allowed",
        "proposed_action",
        "proposed_target",
        "proposal_valid",
        "intent_match",
        "policy_allowed",
        "policy_reason",
        "policy_correct",
        "tool_success",
        "error_type",
        "error_message",
        "duration_ms",
        "timestamp",
    ]

    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for item in results:
        writer.writerow(item)

    return output.getvalue()


def generate_markdown_summary(
    report: dict[str, Any]
) -> str:
    """Create a human-readable markdown summary report."""
    meta = report.get("metadata", {})
    metrics = report.get("summary_metrics", {})
    results = report.get("results", [])

    lines = [
        f"# AgentProof Local — Evaluation Report",
        f"**Run ID:** `{meta.get('run_id')}`  ",
        f"**Timestamp:** {meta.get('timestamp')}  ",
        f"**Mode:** {meta.get('evaluation_mode')}  ",
        f"**Model:** {meta.get('model_name')}  ",
        f"**Application Version:** {meta.get('version')}  ",
        "",
        "## Summary Metrics",
        "",
        "| Metric | Value |",
        "| --- | --- |",
        f"| Total Scenarios | {metrics.get('total_scenarios', 0)} |",
        f"| Policy Decision Accuracy | **{metrics.get('policy_accuracy_pct', 0.0)}%** |",
        f"| Proposal Validity Rate | {metrics.get('proposal_validity_rate_pct', 0.0)}% |",
        f"| Intent Match Rate | {metrics.get('intent_match_rate_pct', 0.0)}% |",
        f"| Allowed Actions | {metrics.get('allowed_actions', 0)} |",
        f"| Blocked Actions | {metrics.get('blocked_actions', 0)} |",
        f"| Authorization Rate | {metrics.get('authorization_rate_pct', 0.0)}% |",
        f"| Total Errors / Failures | {metrics.get('total_errors', 0)} ({metrics.get('failure_rate_pct', 0.0)}%) |",
        "",
        "## Scenario Outcomes",
        "",
        "| Scenario ID | Category | Expected Allowed | Actual Allowed | Correct | Intent Match | Error |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]

    for r in results:
        sc_id = r.get("scenario_id", "")
        cat = r.get("category", "")
        exp = "Allow" if r.get("expected_allowed") else "Block"
        act = "Allow" if r.get("policy_allowed") else "Block"
        corr = "✅ Yes" if r.get("policy_correct") else "❌ No"
        intent = "✅ Yes" if r.get("intent_match") else "⚠️ No"
        err = r.get("error_type") or "None"
        lines.append(f"| `{sc_id}` | {cat} | {exp} | {act} | {corr} | {intent} | {err} |")

    lines.append("")
    lines.append("---")
    lines.append("*Report generated by AgentProof Local — Deterministic AI Policy Enforcement.*")

    return "\n".join(lines)


def save_report_to_disk(
    report_dict: dict[str, Any],
    directory: Optional[Path] = None,
) -> tuple[Path, Path]:
    """
    Save both JSON and CSV versions of the report locally.
    Returns the paths to the saved JSON and CSV files.
    """
    reports_dir = directory or (Path(__file__).resolve().parent.parent / config.reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)

    run_id = report_dict["metadata"]["run_id"]
    json_path = reports_dir / f"{run_id}.json"
    csv_path = reports_dir / f"{run_id}.csv"

    json_content = serialize_json_report(report_dict)
    with json_path.open("w", encoding="utf-8") as f:
        f.write(json_content)

    csv_content = generate_csv_report(report_dict.get("results", []))
    with csv_path.open("w", encoding="utf-8") as f:
        f.write(csv_content)

    return json_path, csv_path


def list_saved_reports(directory: Optional[Path] = None) -> list[dict[str, Any]]:
    """List all saved report files in the reports directory."""
    reports_dir = directory or (Path(__file__).resolve().parent.parent / config.reports_dir)
    if not reports_dir.exists():
        return []

    reports = []
    for file_path in sorted(reports_dir.glob("*.json"), reverse=True):
        try:
            with file_path.open("r", encoding="utf-8") as f:
                data = json.load(f)
            meta = data.get("metadata", {})
            metrics = data.get("summary_metrics", {})
            reports.append({
                "filename": file_path.name,
                "filepath": str(file_path),
                "run_id": meta.get("run_id", file_path.stem),
                "timestamp": meta.get("timestamp", ""),
                "mode": meta.get("evaluation_mode", "unknown"),
                "model": meta.get("model_name", "N/A"),
                "scenarios": meta.get("scenario_count", 0),
                "accuracy": metrics.get("policy_accuracy_pct", 0.0),
                "size_kb": round(file_path.stat().st_size / 1024, 2),
            })
        except Exception:
            continue

    return reports
