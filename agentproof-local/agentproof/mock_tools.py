"""Harmless simulated tools for AgentProof Local.

No real files, databases, shells, or external systems are modified or contacted.
Mock tools independently enforce authorization invariants regardless of upstream policy bugs.
"""

from typing import Any

# Fictional in-memory test record. No external data source.
DEMO_RECORD: dict[str, Any] = {
    "id": "demo_record",
    "name": "Example Student",
    "status": "test_only",
    "record_type": "synthetic_mock_data",
}


def execute_mock_action(action: str, target: str) -> dict[str, Any]:
    """
    Simulate execution of permitted actions.
    Independently verifies that only 'read_demo_record' targeting 'demo_record'
    is permitted to execute, ensuring defense-in-depth even if policy logic fails.
    """
    try:
        if not isinstance(action, str) or not isinstance(target, str):
            return {
                "success": False,
                "simulated": True,
                "error": "Mock execution rejected: invalid parameter types.",
            }

        if action == "read_demo_record" and target == "demo_record":
            return {
                "success": True,
                "simulated": True,
                "result": DEMO_RECORD.copy(),
            }

        return {
            "success": False,
            "simulated": True,
            "error": f"Mock tool independently blocked unauthorized action '{action}' on target '{target}'.",
        }
    except Exception as exc:
        return {
            "success": False,
            "simulated": True,
            "error": f"Mock tool execution error: {type(exc).__name__}: {exc}",
        }
