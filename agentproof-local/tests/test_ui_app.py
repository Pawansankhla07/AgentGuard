"""Automated integration tests for Streamlit application using AppTest."""

from pathlib import Path
from streamlit.testing.v1 import AppTest

APP_PATH = str(Path(__file__).resolve().parent.parent / "app.py")


def test_app_initial_render():
    """Verify that app launches cleanly and renders default overview dashboard."""
    at = AppTest.from_file(APP_PATH, default_timeout=15)
    at.run()
    assert not at.exception
    # Check that sidebar exists
    assert len(at.sidebar.radio) >= 1
    # Check that title / banner renders
    assert any("AgentProof" in str(s.value) for s in at.markdown)


def test_app_navigation_to_scenario_explorer():
    """Verify navigating to Scenario Explorer works without error."""
    at = AppTest.from_file(APP_PATH, default_timeout=15)
    at.run()
    assert not at.exception

    # Select Scenario Explorer
    at.sidebar.radio[0].set_value("Scenario Explorer").run()
    assert not at.exception
    assert any("Scenario Explorer" in str(s.value) for s in at.subheader)


def test_app_navigation_to_diagnostics():
    """Verify navigating to Settings & Diagnostics works without error."""
    at = AppTest.from_file(APP_PATH, default_timeout=15)
    at.run()
    assert not at.exception

    # Select Settings & Diagnostics
    at.sidebar.radio[0].set_value("Settings & Diagnostics").run()
    assert not at.exception
    assert any("Settings" in str(s.value) for s in at.subheader)


def test_app_run_baseline_evaluation_and_inspect_views():
    """Verify executing baseline evaluation updates state and renders in all views."""
    at = AppTest.from_file(APP_PATH, default_timeout=15)
    at.run()
    assert not at.exception

    # Trigger baseline run from overview button
    baseline_btn = [b for b in at.button if "Run Baseline Evaluation Now" in b.label]
    assert len(baseline_btn) > 0
    baseline_btn[0].click().run()
    assert not at.exception

    # Check session state
    results = at.session_state.current_results
    assert results is not None
    assert len(results) >= 4
    metrics = at.session_state.current_metrics
    assert metrics is not None
    assert metrics["policy_accuracy_pct"] == 100.0

    # Navigate to Results Explorer with populated results
    at.sidebar.radio[0].set_value("Results Explorer").run()
    assert not at.exception
    assert any("Results Explorer" in str(s.value) for s in at.subheader)

    # Navigate to Security Analysis with populated results
    at.sidebar.radio[0].set_value("Security Analysis").run()
    assert not at.exception
    assert any("Security Analysis" in str(s.value) for s in at.subheader)

    # Navigate to Reports with populated results
    at.sidebar.radio[0].set_value("Reports").run()
    assert not at.exception
    assert any("Evaluation Reports" in str(s.value) for s in at.subheader)


def test_app_add_custom_scenario_in_sandbox():
    """Verify adding a custom scenario via the form."""
    at = AppTest.from_file(APP_PATH, default_timeout=15)
    at.run()
    assert not at.exception

    at.sidebar.radio[0].set_value("Scenario Explorer").run()
    assert not at.exception

    # Submit custom scenario form
    submit_btn = [b for b in at.button if "Add Scenario" in b.label]
    assert len(submit_btn) > 0
    submit_btn[0].click().run()
    assert not at.exception

    # Check that custom scenario was appended to session state
    customs = at.session_state.custom_scenarios
    assert len(customs) > 0
    assert any(s["id"] == "custom_prompt_test" for s in customs)
