"""Unit tests for Ollama client with mocked HTTP interactions."""

import pytest
from unittest.mock import patch, MagicMock
import requests

from agentproof.exceptions import (
    OllamaConnectionError,
    OllamaTimeoutError,
    SchemaValidationError,
)
from agentproof.llm_client import (
    check_ollama_connection,
    list_ollama_models,
    propose_action,
)
from agentproof.schemas import ActionProposal


def test_check_ollama_connection_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "models": [
            {"name": "gemma4:e2b-it-qat"},
            {"name": "llama3.1:latest"},
        ]
    }

    with patch("requests.get", return_value=mock_response):
        res = check_ollama_connection("http://localhost:11434")
        assert res["connected"] is True
        assert res["model_count"] == 2
        assert "gemma4:e2b-it-qat" in res["models"]
        assert res["error"] is None


def test_check_ollama_connection_failure():
    with patch("requests.get", side_effect=requests.exceptions.ConnectionError("Connection refused")):
        res = check_ollama_connection("http://localhost:11434")
        assert res["connected"] is False
        assert res["model_count"] == 0
        assert "Cannot connect to Ollama" in res["error"]


def test_check_ollama_connection_timeout():
    with patch("requests.get", side_effect=requests.exceptions.Timeout("Read timeout")):
        res = check_ollama_connection("http://localhost:11434", timeout=2)
        assert res["connected"] is False
        assert "timed out" in res["error"].lower()


def test_list_ollama_models():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "models": [{"name": "gemma4:e2b-it-qat"}]
    }

    with patch("requests.get", return_value=mock_response):
        models = list_ollama_models()
        assert models == ["gemma4:e2b-it-qat"]


def test_propose_action_success():
    scenario = {
        "id": "benign_read",
        "action": "read_demo_record",
        "target": "demo_record",
        "rationale": "Harmless read",
    }
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "message": {
            "content": '{"action": "read_demo_record", "target": "demo_record", "rationale": "Harmless read"}'
        }
    }

    with patch("requests.post", return_value=mock_response):
        proposal = propose_action(scenario)
        assert isinstance(proposal, ActionProposal)
        assert proposal.action == "read_demo_record"
        assert proposal.target == "demo_record"


def test_propose_action_connection_error():
    scenario = {"id": "test"}
    with patch("requests.post", side_effect=requests.exceptions.ConnectionError("Refused")):
        with pytest.raises(OllamaConnectionError):
            propose_action(scenario)


def test_propose_action_timeout_error():
    scenario = {"id": "test"}
    with patch("requests.post", side_effect=requests.exceptions.Timeout("Timeout")):
        with pytest.raises(OllamaTimeoutError):
            propose_action(scenario)


def test_propose_action_malformed_json_error():
    scenario = {"id": "test"}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "message": {
            "content": "This is plain text, not JSON"
        }
    }

    with patch("requests.post", return_value=mock_response):
        with pytest.raises(SchemaValidationError) as exc:
            propose_action(scenario)
        assert "not valid JSON" in str(exc.value)


def test_propose_action_schema_mismatch_error():
    scenario = {"id": "test"}
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "message": {
            "content": '{"action": "unauthorized_command", "target": "demo_record", "rationale": "test"}'
        }
    }

    with patch("requests.post", return_value=mock_response):
        with pytest.raises(SchemaValidationError) as exc:
            propose_action(scenario)
        assert "failed strict schema validation" in str(exc.value)
