"""Comprehensive glossary of AI agent security and policy enforcement concepts."""

from typing import Any

SECURITY_GLOSSARY: list[dict[str, Any]] = [
    {
        "term": "Deterministic Authorization",
        "category": "Policy Enforcement",
        "definition": "A security decision mechanism whose outcome is 100% predictable, reproducible, and verifiable based solely on strict mathematical rules or allowlists, completely independent of non-deterministic LLM reasoning.",
        "why_it_matters": "Treating an LLM's explanation as an authorization decision leaves systems vulnerable to persuasion, jailbreaks, and hallucinations.",
        "agentproof_implementation": "Layer C policy engine strictly checks if (action, target) is in ALLOWED_PAIRS. Rationales are never passed to the authorization decision.",
    },
    {
        "term": "Fail-Closed Security",
        "category": "Architecture",
        "definition": "A foundational design pattern where any unexpected condition, network error, malformed input, timeout, or uncaught exception immediately results in access denial rather than permission.",
        "why_it_matters": "If a parser crashes or an LLM returns malformed JSON, a fail-open system might accidentally proceed with default permissions.",
        "agentproof_implementation": "All exception handlers and schema validation failures in the runner and policy engine set allowed=False and never invoke mock tools.",
    },
    {
        "term": "Prompt Injection",
        "category": "Attacks",
        "definition": "An adversarial attack technique where an attacker crafts untrusted text input designed to override an LLM's system instructions and force it to propose unauthorized tools or disclose restricted data.",
        "why_it_matters": "Prompt injection is the #1 vulnerability in OWASP Top 10 for LLM Applications (LLM01).",
        "agentproof_implementation": "Tested via 'prompt_injection_override' and 'jailbreak_developer_mode' scenarios. Even if the LLM is tricked into proposing a destructive action, the policy engine denies it.",
    },
    {
        "term": "Intent Drift",
        "category": "Evaluation & Telemetry",
        "definition": "A condition where an LLM generates a syntactically valid action proposal that deviates from the user's or scenario's original requested action or target.",
        "why_it_matters": "A model might subtly alter a target from 'demo_record' to 'production_database' without triggering a schema error.",
        "agentproof_implementation": "The runner preserves expected_action and expected_target and explicitly calculates the intent_match boolean and intent_match_rate_pct.",
    },
    {
        "term": "Defense-in-Depth Mock Execution",
        "category": "Tool Sandboxing",
        "definition": "Layering independent security checks across multiple tiers so that if an upstream layer (e.g. schema validator or policy engine) is bypassed, downstream execution boundaries still block unauthorized actions.",
        "why_it_matters": "Single-point-of-failure architectures allow bugs in authorization logic to cause catastrophic data loss.",
        "agentproof_implementation": "Layer D mock tools independently verify parameters before returning synthetic demo records. No real shells, databases, or filesystems are ever wired up.",
    },
    {
        "term": "Strict Schema Validation",
        "category": "Input Handling",
        "definition": "Enforcing rigid type constraints, bounded string lengths, exact string literal unions, and forbidding any unknown or unexpected fields (extra='forbid') on model output.",
        "why_it_matters": "Prevents parameter smuggling, prototype pollution, and unexpected privilege flags injected by the model.",
        "agentproof_implementation": "Pydantic ActionProposal schema uses ConfigDict(extra='forbid', str_strip_whitespace=True) and Literal unions.",
    },
    {
        "term": "Air-Gapped Simulation",
        "category": "Testing Architecture",
        "definition": "Running security evaluations in a hermetically sealed local environment without external internet calls, third-party cloud APIs, or connections to production infrastructure.",
        "why_it_matters": "Guarantees zero risk of accidental data leakage or inadvertent modification of real systems during adversarial fuzzing.",
        "agentproof_implementation": "Runs locally on developer's machine using local Ollama and in-memory mock data.",
    },
]
