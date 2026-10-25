"""AgentProof Local - Local-first AI agent security evaluation and policy enforcement."""

from agentproof.config import config
from agentproof.mock_tools import execute_mock_action
from agentproof.policy_engine import evaluate_action
from agentproof.schemas import ActionProposal, PolicyDecision, ScenarioModel, EvaluationResult
from agentproof.llm_client import propose_action, check_ollama_connection, list_ollama_models
from agentproof.scenario_runner import run_scenario, run_scenarios, run_all_scenarios, load_scenarios
from agentproof.metrics import calculate_metrics
from agentproof.reporting import (
    generate_json_report,
    generate_csv_report,
    generate_markdown_summary,
    save_report_to_disk,
    list_saved_reports,
)

__all__ = [
    "config",
    "execute_mock_action",
    "evaluate_action",
    "ActionProposal",
    "PolicyDecision",
    "ScenarioModel",
    "EvaluationResult",
    "propose_action",
    "check_ollama_connection",
    "list_ollama_models",
    "run_scenario",
    "run_scenarios",
    "run_all_scenarios",
    "load_scenarios",
    "calculate_metrics",
    "generate_json_report",
    "generate_csv_report",
    "generate_markdown_summary",
    "save_report_to_disk",
    "list_saved_reports",
]
