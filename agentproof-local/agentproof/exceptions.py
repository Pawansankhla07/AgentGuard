"""Custom typed exceptions for AgentProof Local."""


class AgentProofError(Exception):
    """Base exception for all AgentProof errors."""


class OllamaConnectionError(AgentProofError):
    """Raised when the Ollama service cannot be reached."""


class OllamaTimeoutError(AgentProofError):
    """Raised when an Ollama request times out."""


class OllamaModelNotFoundError(AgentProofError):
    """Raised when the requested model is not found on Ollama."""


class SchemaValidationError(AgentProofError):
    """Raised when model output or input data fails schema validation."""


class PolicyEngineError(AgentProofError):
    """Raised when an unexpected error occurs during policy evaluation."""


class MockToolError(AgentProofError):
    """Raised when a mock tool execution encounters an error."""
