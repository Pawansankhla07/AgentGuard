# 🛡️ AgentProof Local Security Suite (AgentGuard)

> **Local-first website safety, browser threat interception, desktop file quarantine, and deterministic AI agent policy governance.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://python.org)
[![FastAPI: 0.115+](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![Chrome Extension: MV3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-success.svg)](./agentproof-local/chrome-extension)
[![Python Tests: 89 Passed](https://img.shields.io/badge/Python_Tests-89%20Passed-brightgreen.svg)](./agentproof-local/tests)
[![Extension Tests: 22 Passed](https://img.shields.io/badge/Extension_Tests-22%20Passed-brightgreen.svg)](./agentproof-local/chrome-extension/tests)

---

## 📖 Product Vision & Architecture

AgentProof Local is a personal, local-first security suite operating across four synchronized components:

1. **Chrome Security Extension (Manifest V3)**:
   - Continuously monitors browser events (`tabs.onUpdated`, `downloads.onCreated`).
   - Evaluates website transport (HTTPS vs unencrypted plain HTTP).
   - Detects deceptive hostnames (Punycode IDN homographs, raw IP literals).
   - Flags passwords submitted over unencrypted HTTP (Critical Override: score ≥ 75).
   - Audits cookie security metadata (`Secure`, `HttpOnly`, `SameSite`) with strict **Zero-Knowledge Privacy** (raw cookie values are never stored, logged, or exported).
   - Intercepts deceptive double extensions (`.pdf.exe`, `.doc.js`).
   - Enforces configurable response policies: **Monitor (Level 1)**, **Warn (Level 2)**, **Block Confirmed Threats (Level 3)**, and **Strict Protection (Level 4)**.

2. **Local Security Engine & API (FastAPI)**:
   - Loopback-only service (`http://127.0.0.1:8000`) authenticated via `X-AgentProof-Token`.
   - Exposes deterministic 0–100 risk scoring, scenario evaluations, and report generation.
   - Enforces a 5-layer fail-closed policy engine for autonomous AI agents.

3. **Desktop Security Companion & Quarantine Vault**:
   - Computes cryptographic hashes (SHA-256, SHA-1, MD5).
   - Performs binary magic-byte inspection (PE, ELF, Mach-O vs declared file extension).
   - Detects benign test fixtures (EICAR standard test string) and optional local ClamAV integration.
   - Manages an isolated quarantine repository with POSIX `0o700` restricted permissions.
   - Pre-move and post-move SHA-256 validation prevents data loss or corruption.
   - Reversible restore and confirmed permanent deletion with persistent audit manifest (`quarantine_manifest.json`).

4. **Local Ollama AI Integration**:
   - Connects to local Ollama (`http://localhost:11434`) using models like Gemma 4.
   - Generates beginner-friendly explanations of security findings and summarizes privacy policies.
   - **Fail-Closed Boundary**: The LLM is strictly advisory; deterministic scanning and blocking policies never depend on LLM availability.

---

## 📂 Repository Structure

```text
AgentGuard/
├── PROJECT_AUDIT.md            # Comprehensive defect audit & test execution record
├── SECURITY.md                 # Security model, boundaries, & permissions justification
├── ARCHITECTURE.md             # System architecture & sequence diagrams
├── README.md                   # Installation & operating manual
└── agentproof-local/
    ├── app.py                  # Streamlit desktop dashboard (13 interactive sections)
    ├── agentproof/             # Core Python security suite
    │   ├── server.py           # FastAPI backend & companion endpoints
    │   ├── risk_engine.py      # Deterministic 0-100 risk scoring engine
    │   ├── website_scanner.py  # Network transport & credential form inspector
    │   ├── cookie_analyzer.py  # Zero-knowledge cookie security analyzer
    │   ├── permission_analyzer.py # Origin permission analyzer
    │   ├── file_scanner.py     # Local file scanner & cryptographic hashing
    │   ├── quarantine_manager.py # POSIX 0o700 quarantine vault & manifest
    │   ├── ollama_service.py   # Local Ollama integration & policy summarizer
    │   ├── notification_service.py # Alert dispatcher & rate-limiting cooldown
    │   └── policy_engine.py    # Authoritative deterministic AI agent policy
    ├── chrome-extension/       # Manifest V3 Chrome Extension
    │   ├── manifest.json       # Extension permissions & declarations
    │   ├── background/         # Service worker event listeners (nav & download)
    │   ├── popup/              # Real-time popup inspection dashboard
    │   ├── options/            # Protection rules & threshold configuration
    │   ├── pages/              # Blocked and warning pages with override controls
    │   ├── scanner/            # Web security analyzers
    │   ├── risk/               # JS heuristic risk scoring engine
    │   └── tests/              # 22 automated extension unit tests
    ├── frontend/               # 3D interactive web portal & landing UI
    └── tests/                  # 89 automated Python pytest unit & integration tests
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- **macOS** or **Linux**
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & npm
- (Optional) [Ollama](https://ollama.com) running on `http://localhost:11434`

### 1. Python Backend & Companion Setup
```bash
cd agentproof-local

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Python test suite (89 passing tests)
PYTHONPATH=. pytest
```

### 2. Chrome Extension Installation (Load Unpacked)
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the directory:
   `/Users/shreyashbhosale/Desktop/AgentGuard/agentproof-local/chrome-extension`
5. Pin **AgentProof** to your browser toolbar.
6. Click the extension icon on any webpage to inspect security or click `⚙️` to configure protection modes.

*(Alternatively, download the pre-packaged zip from `frontend/public/agentguard-chrome-extension.zip` and extract.)*

---

## 🚀 Running the Platform

### Terminal 1: FastAPI Local Companion API
```bash
cd agentproof-local
source .venv/bin/activate
uvicorn agentproof.server:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### Terminal 2: Streamlit Security Companion Dashboard
```bash
cd agentproof-local
source .venv/bin/activate
streamlit run app.py --server.port 8501
```
- Streamlit UI: `http://localhost:8501`

### Terminal 3: 3D Frontend Portal
```bash
cd agentproof-local/frontend
npm install
npm run dev -- --port 5173
```
- Web Portal: `http://localhost:5173`

---

## 🧪 Testing Verification

### Run Python Test Suite (89 Tests)
```bash
cd agentproof-local
PYTHONPATH=. pytest tests/ -v
```

### Run Extension Test Suite (22 Tests)
```bash
cd agentproof-local/chrome-extension
npm test
```

### Total Verified Test Coverage
- **111 tests executed**
- **111 passed**
- **0 failed**, **0 skipped**

---

## 🔒 Security Principles

- **Zero Fabricated Scans**: Real operations calculate genuine cryptographic hashes, inspect live DOM elements, and query actual browser metadata.
- **Fail-Closed**: In the event of parser error, network timeout, or offline LLM, actions fail closed and deterministic security rules remain active.
- **Zero-Knowledge Privacy**: Cookie values, tokens, and passwords are never read or stored.
- **Auditable Containment**: Quarantined files are cryptographically verified and restricted to POSIX `0o700`.
