"""Unit tests for Pydantic schema validation of agent action proposals and scenarios."""

import pytest
from pydantic import ValidationError

from agentproof.schemas import ActionProposal, PolicyDecision, ScenarioModel


def test_valid_proposal_passes():
    proposal = ActionProposal(
        action="read_demo_record",
        target="demo_record",
        rationale="Valid test justification.",
    )
    assert proposal.action == "read_demo_record"
    assert proposal.target == "demo_record"
    assert proposal.rationale == "Valid test justification."


def test_unknown_action_fails_validation():
    with pytest.raises(ValidationError) as exc:
        ActionProposal(
            action="drop_all_tables",  # type: ignore[arg-type]
            target="demo_record",
            rationale="Malicious action name",
        )
    assert "Input should be 'read_demo_record', 'export_demo_data' or 'delete_demo_data'" in str(exc.value)


def test_unsupported_target_fails_validation():
    with pytest.raises(ValidationError) as exc:
        ActionProposal(
            action="read_demo_record",
            target="arbitrary_filesystem_path",  # type: ignore[arg-type]
            rationale="Invalid target",
        )
    assert "Input should be 'demo_record' or 'production_database'" in str(exc.value)


def test_unexpected_extra_field_rejected():
    with pytest.raises(ValidationError) as exc:
        ActionProposal.model_validate(
            {
                "action": "read_demo_record",
                "target": "demo_record",
                "rationale": "Testing extra field",
                "is_admin": True,  # Disallowed extra field
            }
        )
    assert "Extra inputs are not permitted" in str(exc.value)


def test_missing_required_fields():
    with pytest.raises(ValidationError) as exc:
        ActionProposal.model_validate({"action": "read_demo_record"})
    assert "target" in str(exc.value)
    assert "rationale" in str(exc.value)


def test_empty_rationale_fails():
    with pytest.raises(ValidationError):
        ActionProposal(
            action="read_demo_record",
            target="demo_record",
            rationale="",
        )


def test_excessively_long_rationale_fails():
    with pytest.raises(ValidationError):
        ActionProposal(
            action="read_demo_record",
            target="demo_record",
            rationale="A" * 501,  # Exceeds max_length=500
        )


def test_scenario_model_validation():
    valid_scenario = {
        "id": "test_scenario_1",
        "description": "Valid scenario description",
        "action": "read_demo_record",
        "target": "demo_record",
        "rationale": "Valid rationale",
        "expected_allowed": True,
        "category": "baseline",
    }
    model = ScenarioModel.model_validate(valid_scenario)
    assert model.id == "test_scenario_1"
    assert model.expected_allowed is True


def test_scenario_model_invalid_id():
    invalid_scenario = {
        "id": "invalid id with spaces!!",
        "description": "Valid description",
        "action": "read_demo_record",
        "target": "demo_record",
        "rationale": "Valid rationale",
        "expected_allowed": True,
    }
    with pytest.raises(ValidationError):
        ScenarioModel.model_validate(invalid_scenario)
