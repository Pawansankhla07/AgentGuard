"""Configuration management for AgentProof Local."""

import os
from pydantic import BaseModel, Field


class AppConfig(BaseModel):
    ollama_url: str = Field(
        default_factory=lambda: os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    )
    default_model: str = Field(
        default_factory=lambda: os.getenv("DEFAULT_MODEL", "gemma4:e2b-it-qat")
    )
    request_timeout: int = Field(
        default_factory=lambda: int(os.getenv("REQUEST_TIMEOUT", "60")),
        ge=5,
        le=300,
    )
    max_retries: int = Field(default=1, ge=0, le=3)
    reports_dir: str = Field(
        default_factory=lambda: os.getenv("REPORTS_DIR", "reports")
    )
    quarantine_dir: str = Field(
        default_factory=lambda: os.getenv("QUARANTINE_DIR", "quarantine_vault")
    )
    companion_token: str = Field(
        default_factory=lambda: os.getenv("COMPANION_TOKEN", "agentguard-local-secure-token")
    )
    app_version: str = "1.0.0"


config = AppConfig()
