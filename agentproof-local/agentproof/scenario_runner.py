"""Run local agent-security scenarios with deterministic policy enforcement and intent tracking."""

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Optional

from agentproof.exceptions import (
    OllamaConnectionError,
    OllamaTimeoutError,
    SchemaValidationError,
)
from agentproof.llm_client import propose_action
from agentproof.mock_tools import execute_mock_action
from agentproof.policy_engine import evaluate_action
from agentproof.schemas import ActionProposal, ScenarioModel

SCENARIOS_PATH = (
    Path(__file__).resolve().parent.parent / "data" / "scenarios.json"
)


def load_scenarios(custom_path: Optional[Path] = None) -> list[dict[str, Any]]:
    """Load and validate scenario definitions from disk."""
    path = custom_path or SCENARIOS_PATH
    if not path.exists():
        raise FileNotFoundError(f"Scenario dataset file not found at: {path}")

    with path.open(encoding="utf-8") as file:
        raw_data = json.load(file)

    if not isinstance(raw_data, list):
        raise ValueError("Scenario dataset must be a JSON array of scenarios.")

    validated: list[dict[str, Any]] = []
    for item in raw_data:
        model = ScenarioModel.model_validate(item)
        validated.append(model.model_dump())

    return validated


def validate_scenario(data: dict[str, Any]) -> ScenarioModel:
    """Validate a single scenario dictionary against the ScenarioModel schema."""
    return ScenarioModel.model_validate(data)


def run_scenario(
    scenario: dict[str, Any],
    use_llm: bool = False,
    model_name: Optional[str] = None,
    timeout: Optional[int] = None,
) -> dict[str, Any]:
    """
    Execute a single scenario through the 5-layer pipeline:
    1. Input validation & intent preservation
    2. Proposal generation (LLM or Baseline)
    3. Strict schema validation
    4. Deterministic fail-closed policy enforcement
    5. Mock tool execution (only if policy allows)
    """
    start_time = time.perf_counter()
    iso_timestamp = datetime.now(timezone.utc).isoformat()

    scenario_id = str(scenario.get("id", "unknown_scenario"))
    description = str(scenario.get("description", "No description provided."))
    category = str(scenario.get("category", "baseline"))
    expected_action = str(scenario.get("action", ""))
    expected_target = str(scenario.get("target", ""))
    expected_allowed = bool(scenario.get("expected_allowed", False))
    eval_mode = "llm" if use_llm else "baseline"

    proposal_obj: Optional[ActionProposal] = None
    proposal_dict: Optional[dict[str, Any]] = None
    proposed_action: Optional[str] = None
    proposed_target: Optional[str] = None
    proposed_rationale: Optional[str] = None
    proposal_valid = False
    intent_match = False
    policy_allowed = False
    policy_reason = ""
    policy_correct = False
    tool_result: Optional[dict[str, Any]] = None
    tool_success = False
    error_type: Optional[str] = None
    error_message: Optional[str] = None

    try:
        # Layer B: Proposal generation
        if use_llm:
            proposal_obj = propose_action(
                scenario,
                model_name=model_name,
                timeout=timeout,
            )
        else:
            # Baseline deterministic mode: build proposal directly from scenario
            proposal_obj = ActionProposal.model_validate(
                {
                    "action": expected_action,
                    "target": expected_target,
                    "rationale": scenario.get("rationale", "Baseline test execution."),
                },
                strict=True,
            )

        # Successful validation
        proposal_valid = True
        proposal_dict = proposal_obj.model_dump()
        proposed_action = proposal_obj.action
        proposed_target = proposal_obj.target
        proposed_rationale = proposal_obj.rationale

        # Compare proposed action & target with original scenario intent
        intent_match = (
            proposed_action == expected_action and proposed_target == expected_target
        )

        # Layer C: Deterministic policy decision (independent of LLM rationale)
        decision = evaluate_action(proposal_obj)
        policy_allowed = decision.allowed
        policy_reason = decision.reason
        policy_correct = (policy_allowed == expected_allowed)

        # Layer D: Mock tool execution (fail-closed: only executed if policy allows)
        if policy_allowed:
            tool_result = execute_mock_action(proposal_obj.action, proposal_obj.target)
            tool_success = tool_result.get("success", False)
        else:
            tool_result = {
                "success": False,
                "simulated": True,
                "error": "Execution blocked by policy engine.",
            }
            tool_success = False

    except OllamaConnectionError as exc:
        error_type = "OllamaConnectionError"
        error_message = str(exc)
        policy_reason = "Model request failed due to connection error; no action authorized."
    except OllamaTimeoutError as exc:
        error_type = "OllamaTimeoutError"
        error_message = str(exc)
        policy_reason = "Model request timed out; no action authorized."
    except SchemaValidationError as exc:
        error_type = "SchemaValidationError"
        error_message = str(exc)
        policy_reason = "Proposal rejected: invalid schema or malformed JSON."
    except Exception as exc:
        error_type = type(exc).__name__
        error_message = str(exc)
        policy_reason = f"Execution error ({error_type}); fail-closed: no action authorized."

    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "scenario_id": scenario_id,
        "description": description,
        "category": category,
        "evaluation_mode": eval_mode,
        "model_name": model_name if use_llm else "N/A (Deterministic)",
        "expected_action": expected_action,
        "expected_target": expected_target,
        "expected_allowed": expected_allowed,
        "proposal": proposal_dict,
        "proposed_action": proposed_action,
        "proposed_target": proposed_target,
        "proposed_rationale": proposed_rationale,
        "proposal_valid": proposal_valid,
        "intent_match": intent_match,
        "policy_allowed": policy_allowed,
        "policy_reason": policy_reason,
        "policy_correct": policy_correct,
        "tool_result": tool_result,
        "tool_success": tool_success,
        "error_type": error_type,
        "error_message": error_message,
        "duration_ms": duration_ms,
        "timestamp": iso_timestamp,
    }


def run_scenarios(
    scenarios: list[dict[str, Any]],
    use_llm: bool = False,
    model_name: Optional[str] = None,
    timeout: Optional[int] = None,
    progress_callback: Optional[Callable[[int, int, str], None]] = None,
) -> list[dict[str, Any]]:
    """Run a specified list of scenarios sequentially with optional progress tracking."""
    results: list[dict[str, Any]] = []
    total = len(scenarios)

    for idx, sc in enumerate(scenarios, start=1):
        sc_id = sc.get("id", f"scenario_{idx}")
        if progress_callback:
            progress_callback(idx, total, sc_id)
        res = run_scenario(
            sc,
            use_llm=use_llm,
            model_name=model_name,
            timeout=timeout,
        )
        results.append(res)

    return results


def run_all_scenarios(
    use_llm: bool = False,
    model_name: Optional[str] = None,
    timeout: Optional[int] = None,
) -> list[dict[str, Any]]:
    """Run all loaded scenarios."""
    scenarios = load_scenarios()
    return run_scenarios(
        scenarios,
        use_llm=use_llm,
        model_name=model_name,
        timeout=timeout,
    )
