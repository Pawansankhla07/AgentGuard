"""Unit tests for mock tool execution and safety boundaries."""

from agentproof.mock_tools import execute_mock_action, DEMO_RECORD


def test_approved_mock_read_succeeds():
    result = execute_mock_action("read_demo_record", "demo_record")
    assert result["success"] is True
    assert result["simulated"] is True
    assert result["result"]["id"] == DEMO_RECORD["id"]
    assert result["result"]["status"] == "test_only"


def test_unauthorized_export_mock_action_fails():
    result = execute_mock_action("export_demo_data", "demo_record")
    assert result["success"] is False
    assert result["simulated"] is True
    assert "blocked" in result["error"].lower()


def test_destructive_delete_mock_action_fails():
    result = execute_mock_action("delete_demo_data", "demo_record")
    assert result["success"] is False
    assert result["simulated"] is True
    assert "blocked" in result["error"].lower()


def test_unapproved_target_mock_action_fails():
    result = execute_mock_action("read_demo_record", "production_database")
    assert result["success"] is False
    assert result["simulated"] is True
    assert "blocked" in result["error"].lower()


def test_arbitrary_system_command_blocked():
    result = execute_mock_action("rm -rf /", "root")
    assert result["success"] is False
    assert result["simulated"] is True
    assert "blocked" in result["error"].lower()


def test_invalid_parameter_types():
    result = execute_mock_action(None, 123)  # type: ignore[arg-type]
    assert result["success"] is False
    assert result["simulated"] is True
    assert "invalid parameter types" in result["error"].lower()
