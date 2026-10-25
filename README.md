# 🛡️ AgentGuard

> **Safer AI Agents. Inspect. Understand. Secure.**  
> *Local-first AI agent security evaluation, deterministic policy enforcement, and 3D governance platform.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://python.org)
[![FastAPI: 0.115+](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React: 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![TailwindCSS: v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com)
[![Tests: 56 Passed](https://img.shields.io/badge/Tests-56%20Passed-success.svg)](./agentproof-local/tests)

---

## 📖 Overview

**AgentGuard** is an open-source, local-first platform built to find and fix security risks in tool-using autonomous AI agents before they can leak sensitive data or execute destructive system actions.

Built on the core security principle:
> **The LLM proposes. The validator checks. The policy engine decides. The sandbox mock tool executes. The evaluator measures.**

---

## 🚀 Key Features

1. **4-Stage Containment Engine**:
   - **Stage 01 (Threat Discovery)**: Inspects tool call proposals for filesystem tampering, shell injection, or credential leakage.
   - **Stage 02 (Zero-Jargon Translation)**: Converts opaque agent schema payloads and prompt-injected rationales into clear, human-readable explanations.
   - **Stage 03 (Automated Policy Remediation)**: Auto-generates fail-closed diffs redirecting destructive commands to safe, restricted sandbox scopes.
   - **Stage 04 (Deterministic Verification)**: Simulates policy decisions against strict allowlist tuples in real time (< 10ms latency).

2. **Cinematic 3D Web Experience**:
   - Interactive 3D Security Robot centerpiece featuring mouse-tracking optics, natural blinking, and click reactions.
   - Textured monochromatic aesthetic (obsidian, graphite, silver, and pure white).
   - Dynamic heading tear-reveal animation exposing the security robot.
   - Cybernetic scrambler buttons with laser line scanning and particle halos.

3. **Air-Gapped & 100% Local**:
   - Zero cloud telemetry, zero remote dependencies.
   - Supports quantized local models (e.g. Gemma 4 via Ollama) or deterministic test mocks.
   - Interactive Streamlit evaluation lab, FastAPI backend, and React/Tailwind frontend.

4. **Chrome Safety Extension**:
   - Manifest V3 browser extension evaluating login pages, form targets, HTTPS transport, and privacy risks.

---

## 📂 Repository Structure

```
AgentGuard/
├── README.md                           # Main repository documentation
├── .gitignore                          # Global git ignore configuration
└── agentproof-local/                   # Core platform workspace
    ├── agentproof/                     # Core Python security library
    │   ├── config.py                   # Configuration & env management
    │   ├── schemas.py                  # Pydantic action models
    │   ├── policy.py                   # Deterministic fail-closed policy engine
    │   ├── ollama_client.py            # Local model connectivity
    │   ├── runner.py                   # Automated scenario runner
    │   ├── server.py                   # FastAPI application server
    │   ├── tools.py                    # Safe sandboxed mock tools
    │   └── reporter.py                 # Report & metrics generation
    ├── chrome-extension/               # Website safety Chrome extension
    ├── frontend/                       # Modern React + Vite + Tailwind web app
    │   └── src/
    │       ├── components/landing/     # Hero, 3D robot, and topic pages
    │       └── components/ui/          # UI primitives (tear reveal, scrambler)
    ├── tests/                          # Complete test suite (56 unit & integration tests)
    ├── app.py                          # Streamlit evaluation laboratory
    └── requirements.txt                # Python dependencies
```

---

## ⚡ Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- (Optional) [Ollama](https://ollama.com) with `gemma:2b` or similar local model

### 1. Backend Setup
```bash
cd agentproof-local

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run test suite to verify installation (56 tests)
pytest
```

### 2. Start Services
```bash
# Terminal 1: Launch FastAPI Backend Server
uvicorn agentproof.server:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Launch Modern 3D Web UI
cd frontend
npm install
npm run dev -- --port 5173

# Terminal 3 (Optional): Launch Streamlit Evaluation Lab
streamlit run app.py --server.port 8501
```

Visit the web application at **`http://localhost:5173`**.

---

## 🛡️ License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
