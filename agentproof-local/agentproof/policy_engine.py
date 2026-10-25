"""Deterministic, fail-closed policy engine for AgentProof Local."""

from agentproof.schemas import ActionProposal, PolicyDecision


# Explicit allowlist of authorized (action, target) pairs
ALLOWED_PAIRS: set[tuple[str, str]] = {
    ("read_demo_record", "demo_record"),
}


def evaluate_action(proposal: ActionProposal) -> PolicyDecision:
    """
    Fail-closed policy engine:
    Only explicitly permitted demo actions against approved demo targets are allowed.
    This function never calls an LLM, never executes tools, and ignores model rationales.
    Any unexpected exception fails closed (allowed=False).
    """
    try:
        if not isinstance(proposal, ActionProposal):
            return PolicyDecision(
                allowed=False,
                reason="Invalid proposal object: Policy engine fails closed.",
                action=getattr(proposal, "action", "unknown"),
            )

        # Check explicit action allowlist
        if proposal.action != "read_demo_record":
            return PolicyDecision(
                allowed=False,
                reason=f"Action '{proposal.action}' is not on the explicit allowlist.",
                action=proposal.action,
            )

        # Check explicit target allowlist
        if proposal.target != "demo_record":
            return PolicyDecision(
                allowed=False,
                reason=f"Target '{proposal.target}' is not an approved demo resource.",
                action=proposal.action,
            )

        # Verify against allowed pairs set
        if (proposal.action, proposal.target) in ALLOWED_PAIRS:
            return PolicyDecision(
                allowed=True,
                reason="Action and target match the explicit allowlist.",
                action=proposal.action,
            )

        return PolicyDecision(
            allowed=False,
            reason="Action-target pair not permitted by policy.",
            action=proposal.action,
        )

    except Exception as exc:
        # Fail closed on any unforeseen error
        return PolicyDecision(
            allowed=False,
            reason=f"Policy evaluation failure ({type(exc).__name__}): fails closed.",
            action=getattr(proposal, "action", "unknown") if proposal else "unknown",
        )
