"""Configuration management for AgentProof Local."""

import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Locate and load .env from agentproof-local root or current working directory
_local_env = Path(__file__).resolve().parent.parent / ".env"
if _local_env.exists():
    load_dotenv(dotenv_path=_local_env)
load_dotenv()


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
    # Cloud AI & Gemma 4 Configuration
    ai_provider: str = Field(
        default_factory=lambda: os.getenv("AI_PROVIDER", "gemma_cloud").lower()
    )
    gemma_model: str = Field(
        default_factory=lambda: os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
    )
    gemma_endpoint: str = Field(
        default_factory=lambda: os.getenv("GEMMA_ENDPOINT", "").rstrip("/")
    )
    gemma_api_key: str = Field(
        default_factory=lambda: os.getenv("GEMMA_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    )
    ai_request_timeout_seconds: int = Field(
        default_factory=lambda: int(os.getenv("AI_REQUEST_TIMEOUT_SECONDS", "30")),
        ge=5,
        le=180,
    )
    max_image_upload_bytes: int = 10 * 1024 * 1024  # 10 MB strict upload limit
    app_version: str = "1.1.0"


config = AppConfig()
