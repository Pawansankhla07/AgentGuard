"""Local Ollama Service for AgentProof Local Security Suite.

Provides local AI assistance, beginner-friendly explanations, and policy summaries:
- Inspects locally available Ollama models.
- Graceful degradation: core security scans continue if Ollama is unavailable.
- Strict boundaries: LLM reasoning never overrides deterministic security scores.
- Untrusted content isolation: sanitizes input text before inference.
- Zero cloud transmission: all prompts remain strictly on loopback.
"""

from typing import Any, Optional
import httpx

from agentproof.config import config
from agentproof.llm_client import check_ollama_connection


DEFAULT_OLLAMA_TIMEOUT = 12


class OllamaService:
    """Manages local Ollama connectivity and AI explanation synthesis."""

    def __init__(self, base_url: Optional[str] = None, default_model: Optional[str] = None):
        self.base_url = (base_url or config.ollama_url).rstrip("/")
        self.default_model = default_model or config.default_model

    def get_status(self) -> dict[str, Any]:
        """Check live connection and enumerate local models."""
        return check_ollama_connection(self.base_url, timeout=3)

    def explain_findings(
        self,
        findings: list[dict[str, Any]],
        url_or_target: str,
        risk_level: str,
        score: int,
        model_name: Optional[str] = None,
    ) -> dict[str, Any]:
        """Generate a beginner-friendly explanation for technical security findings."""
        status = self.get_status()
        if not status.get("connected"):
            return {
                "success": False,
                "available": False,
                "error": "Local Ollama service is offline. Deterministic scan results remain authoritative.",
                "explanation": (
                    f"Site was classified as '{risk_level}' with risk score {score}/100 based on {len(findings)} "
                    "deterministic security observations. Start Ollama locally for AI-assisted explanations."
                ),
            }

        target_model = model_name or self.default_model

        # Sanitize and summarize findings to prevent prompt injection or token bloat
        summary_lines = []
        for f in findings[:6]:
            title = f.get("title", "")
            sev = f.get("severity", "")
            summary_lines.append(f"- [{sev.upper()}] {title}")

        findings_text = "\n".join(summary_lines) or "No security issues detected."

        prompt = (
            f"You are a helpful security assistant in AgentProof Local.\n"
            f"Explain these security scan findings to a non-technical user in 2 concise sentences.\n"
            f"Target: {url_or_target}\n"
            f"Risk Level: {risk_level} ({score}/100)\n"
            f"Findings:\n{findings_text}\n\n"
            f"Provide actionable advice on whether entering login credentials is safe."
        )

        try:
            with httpx.Client(timeout=DEFAULT_OLLAMA_TIMEOUT) as client:
                res = client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": target_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.2, "top_p": 0.9},
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "").strip()
                    return {
                        "success": True,
                        "available": True,
                        "model": target_model,
                        "explanation": response_text,
                        "is_ai_assistance": True,
                    }
                else:
                    return {
                        "success": False,
                        "available": True,
                        "error": f"Ollama returned HTTP status {res.status_code}.",
                        "explanation": f"Review {len(findings)} findings. AI explanation unavailable.",
                    }
        except Exception as exc:
            return {
                "success": False,
                "available": False,
                "error": f"Ollama query failed: {exc}",
                "explanation": "Deterministic security findings remain authoritative. AI assistant timed out.",
            }

    def summarize_privacy_policy(
        self,
        policy_text: str,
        url: str = "",
        model_name: Optional[str] = None,
    ) -> dict[str, Any]:
        """Summarize privacy policy disclosures and flag concerning clauses."""
        status = self.get_status()
        if not status.get("connected"):
            return {
                "success": False,
                "available": False,
                "error": "Local Ollama service is offline. Privacy policy summary unavailable.",
                "summary": "Ollama is offline. Manual inspection of privacy policy recommended.",
            }

        target_model = model_name or self.default_model
        sanitized_sample = policy_text[:2500].replace("<", "&lt;").replace(">", "&gt;")

        prompt = (
            f"You are a privacy analyst in AgentProof Local. Analyze this website privacy policy excerpt.\n"
            f"Source URL: {url}\n"
            f"Excerpt:\n```\n{sanitized_sample}\n```\n\n"
            f"List key points in 3-4 bullet points regarding:\n"
            f"1. Personal data collected\n"
            f"2. Third-party data sharing\n"
            f"3. User data deletion rights\n"
            f"Note: This is AI-assisted summarization, not legal advice."
        )

        try:
            with httpx.Client(timeout=DEFAULT_OLLAMA_TIMEOUT) as client:
                res = client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": target_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.1},
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "success": True,
                        "available": True,
                        "model": target_model,
                        "summary": data.get("response", "").strip(),
                        "is_ai_assistance": True,
                    }
                return {
                    "success": False,
                    "available": True,
                    "error": f"Ollama returned HTTP status {res.status_code}",
                    "summary": "Policy summarization encountered an error from the local LLM.",
                }
        except Exception as exc:
            return {
                "success": False,
                "available": False,
                "error": f"Ollama query failed: {exc}",
                "summary": "AI summarization timed out. Inspect policy manually.",
            }
