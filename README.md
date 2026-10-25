# 🛡️ AgentGuard (AgentProof Local Security Suite)

<p align="center">
  <img src="docs/assets/01_landing_hero.png" alt="AgentGuard Showcase Landing Hero" width="940" style="border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,0.8);" />
</p>

<p align="center">
  <strong>Local-First Personal Security Suite, Manifest V3 Browser Protection, POSIX Quarantine Vault, and Deterministic AI Agent Governance.</strong>
</p>

<p align="center">
  <a href="https://frontend-lake-delta-0bodi7q6wt.vercel.app/"><img src="https://img.shields.io/badge/Live_Deployment-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Deployment on Vercel" /></a>
  <a href="https://github.com/shreyash-bhosale/AgentGuard"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository" /></a>
  <a href="#-automated-testing-verification-111--111-passed"><img src="https://img.shields.io/badge/Automated_Tests-111_Passed_|_100%25-35C98A?style=for-the-badge&logo=pytest&logoColor=white" alt="111 Passing Tests" /></a>
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/Privacy-Zero_Knowledge-blue?style=for-the-badge&logo=auth0&logoColor=white" alt="Zero-Knowledge Privacy" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-white?style=for-the-badge" alt="MIT License" /></a>
</p>

---

## 🌐 Quick Access & Environments Directory

| Environment / Component | Access URL | Port / Host | Description |
|:---|:---|:---|:---|
| 🚀 **Live Production Web App** | [**frontend-lake-delta-0bodi7q6wt.vercel.app**](https://frontend-lake-delta-0bodi7q6wt.vercel.app/) | `HTTPS / Vercel Edge` | Cloud-deployed showcase portal, interactive testing workbenches, 3D WebGL studio, and extension downloads. |
| 💻 **Local Web Application** | [**http://127.0.0.1:5173**](http://127.0.0.1:5173) | `Port 5173 / Vite + React` | Local full-stack frontend with real-time heuristic risk testing, zero-knowledge cookie auditor, and policy playground. |
| 🖥️ **Desktop Security Companion** | [**http://127.0.0.1:8501**](http://127.0.0.1:8501) | `Port 8501 / Streamlit` | Desktop companion app with 13 functional modules, real-time monitors, and POSIX `0o700` Quarantine Vault. |
| ⚡ **Local Security Engine (API)** | [**http://127.0.0.1:8000/docs**](http://127.0.0.1:8000/docs) | `Port 8000 / FastAPI` | Loopback security daemon with Swagger OpenAPI documentation, risk endpoints, and fixture APIs. |
| 📦 **GitHub Repository** | [**github.com/shreyash-bhosale/AgentGuard**](https://github.com/shreyash-bhosale/AgentGuard) | `Git / HTTPS` | Official source code, release artifacts, test suites, and documentation. |

---

## 📸 Comprehensive Visual Tour of Every Part

### 1. Showcase Landing & Hero Section
> **URL**: [https://frontend-lake-delta-0bodi7q6wt.vercel.app/](https://frontend-lake-delta-0bodi7q6wt.vercel.app/) • [http://127.0.0.1:5173/?topic=home](http://127.0.0.1:5173/?topic=home)  
> *Dynamic mouse-following monochromatic spotlight, 3D starfield canvas, interactive robot centerpiece, and topic quick-launch buttons.*
<p align="center">
  <img src="docs/assets/01_landing_hero.png" alt="01 - Showcase Landing Hero" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 2. Live Architecture Demo Video Player & Telemetry HUD
> **URL**: [http://127.0.0.1:5173/?topic=demo](http://127.0.0.1:5173/?topic=demo)  
> *Embedded video player with live timeline scrubbing, play/pause controls, speed selectors (1x, 1.5x, 2x), and 5 milestone chapter traces showing real-time network interception, password detection, and quarantine isolation.*
<p align="center">
  <img src="docs/assets/02_demo_video.png" alt="02 - Demo Video Player" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 3. Live Testing Workbench — Part A: Website Risk Engine
> **URL**: [http://127.0.0.1:5173/?topic=testing&testTab=websites](http://127.0.0.1:5173/?topic=testing&testTab=websites)  
> *Test 1-click curated fixtures (Plain HTTP Login with Password Field, Secure HTTPS Bank, IDN Punycode Homograph, Raw IP Hostname) and live sliders evaluating 0–100 deterministic risk scores with automatic Critical Overrides.*
<p align="center">
  <img src="docs/assets/03_testing_website_risk.png" alt="03 - Testing Website Risk Engine" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 4. Live Testing Workbench — Part B: Zero-Knowledge Cookie Privacy
> **URL**: [http://127.0.0.1:5173/?topic=testing&testTab=cookies](http://127.0.0.1:5173/?topic=testing&testTab=cookies)  
> *Inspect session cookie security metadata (`Secure`, `HttpOnly`, `SameSite`). Enforces zero-knowledge privacy where raw cookie values are permanently masked as `[REDACTED_ZERO_KNOWLEDGE]`. Features 1-click cookie jar clearing.*
<p align="center">
  <img src="docs/assets/04_testing_cookie_privacy.png" alt="04 - Testing Cookie Privacy" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 5. Live Testing Workbench — Part C: Site Sensor Permissions
> **URL**: [http://127.0.0.1:5173/?topic=testing&testTab=permissions](http://127.0.0.1:5173/?topic=testing&testTab=permissions)  
> *Cycle camera, microphone, geolocation, clipboard, and notification permissions between Granted, Prompt, and Denied to calculate real-time Privacy Exposure Indices.*
<p align="center">
  <img src="docs/assets/05_testing_sensor_sandbox.png" alt="05 - Testing Sensor Permissions" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 6. Live Testing Workbench — Part D: File Scanner & Quarantine Vault
> **URL**: [http://127.0.0.1:5173/?topic=testing&testTab=files](http://127.0.0.1:5173/?topic=testing&testTab=files)  
> *Inspect SHA-256 digests and magic header bytes of test threats (`tax_invoice_2026.pdf.exe`, `eicar_standard_test.com`) with 1-click simulated POSIX `0o700` vault isolation and reversible restore.*
<p align="center">
  <img src="docs/assets/06_testing_file_quarantine.png" alt="06 - Testing File Quarantine" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 7. Live Testing Workbench — Part E: 12 Adversarial AI Benchmarks
> **URL**: [http://127.0.0.1:5173/?topic=testing&testTab=scenarios](http://127.0.0.1:5173/?topic=testing&testTab=scenarios)  
> *Examine how deterministic policy gates block prompt injection overrides, directory traversal (`../../etc/shadow`), SQL injection, shell command chaining, and disguised exfiltration.*
<p align="center">
  <img src="docs/assets/07_testing_adversarial_benchmarks.png" alt="07 - Testing Adversarial Benchmarks" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 8. Interactive Policy Playground & Enforcement Simulator
> **URL**: [http://127.0.0.1:5173/?topic=playground](http://127.0.0.1:5173/?topic=playground)  
> *Test candidate action proposals against fail-closed deterministic policy gates in real time with side-by-side action diffs and rule violation explanations.*
<p align="center">
  <img src="docs/assets/08_policy_simulator.png" alt="08 - Policy Simulator" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 9. 4-Stage Governance & Containment Architecture
> **URL**: [http://127.0.0.1:5173/?topic=governance](http://127.0.0.1:5173/?topic=governance)  
> *Detailed architecture breakdown of Stage 1 (Threat Discovery), Stage 2 (Plain Language Explanations), Stage 3 (Target Remediation), and Stage 4 (Deterministic Verification).*
<p align="center">
  <img src="docs/assets/09_governance_pipeline.png" alt="09 - Governance Pipeline" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 10. Chrome Security Extension Hub (Manifest V3)
> **URL**: [http://127.0.0.1:5173/?topic=extension](http://127.0.0.1:5173/?topic=extension)  
> *Step-by-step developer mode installation instructions, permission justifications, runtime policy configuration (Levels 1–4), and direct `.ZIP` package download.*
<p align="center">
  <img src="docs/assets/10_chrome_extension_guide.png" alt="10 - Chrome Extension Guide" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 11. 3D Spline WebGL Security Studio
> **URL**: [http://127.0.0.1:5173/?topic=studio](http://127.0.0.1:5173/?topic=studio)  
> *Full-screen interactive 3D WebGL Spline scene showcasing orbital robotic inspection and hardware-accelerated security modeling.*
<p align="center">
  <img src="docs/assets/11_spline_3d_studio.png" alt="11 - 3D Spline Studio" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 12. Developer Documentation & Python SDK Manual
> **URL**: [http://127.0.0.1:5173/?topic=docs](http://127.0.0.1:5173/?topic=docs)  
> *Comprehensive CLI quickstart, Python SDK usage examples, loopback REST API schemas, and architecture documentation.*
<p align="center">
  <img src="docs/assets/12_developer_docs.png" alt="12 - Developer Documentation" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 13. Localhost Dashboard Overview (Port 5173)
> **URL**: [http://127.0.0.1:5173/?page=overview](http://127.0.0.1:5173/?page=overview)  
> *Comprehensive metrics dashboard displaying verified 100% policy accuracy, authorization rates, execution breakdown, and past evaluation run history.*
<p align="center">
  <img src="docs/assets/13_dashboard_overview.png" alt="13 - Dashboard Overview" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 14. Evaluation Lab (Port 5173)
> **URL**: [http://127.0.0.1:5173/?page=lab](http://127.0.0.1:5173/?page=lab)  
> *Evaluation workbench supporting both deterministic baseline and local Ollama LLM execution with customizable timeouts and scenario subsets.*
<p align="center">
  <img src="docs/assets/14_evaluation_lab.png" alt="14 - Evaluation Lab" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 15. Scenario Explorer (Port 5173)
> **URL**: [http://127.0.0.1:5173/?page=scenarios](http://127.0.0.1:5173/?page=scenarios)  
> *Inspect all registered benchmark scenarios and register custom adversarial scenarios into the active session sandbox.*
<p align="center">
  <img src="docs/assets/15_scenario_explorer.png" alt="15 - Scenario Explorer" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 16. Results Explorer & Per-Scenario Traces (Port 5173)
> **URL**: [http://127.0.0.1:5173/?page=results](http://127.0.0.1:5173/?page=results)  
> *Granular result traces showing proposed vs expected actions, policy evaluation verdicts, rationale diffs, and simulated tool outputs.*
<p align="center">
  <img src="docs/assets/16_results_explorer.png" alt="16 - Results Explorer" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 17. Security Analysis & Metric Distributions (Port 5173)
> **URL**: [http://127.0.0.1:5173/?page=analysis](http://127.0.0.1:5173/?page=analysis)  
> *Category-level accuracy distributions, confusion matrices (Allowed vs Blocked), error breakdown, and duration latency graphs.*
<p align="center">
  <img src="docs/assets/17_security_analysis.png" alt="17 - Security Analysis" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 18. Desktop Security Companion & Quarantine Vault (Port 8501)
> **URL**: [http://127.0.0.1:8501](http://127.0.0.1:8501)  
> *Desktop Streamlit companion featuring 13 live modules: website scanning, cookie audits, permission assessment, local Ollama policy summarization, and POSIX `0o700` Quarantine Vault.*
<p align="center">
  <img src="docs/assets/18_desktop_companion_vault.png" alt="18 - Streamlit Quarantine Vault" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

### 19. Local Security Engine Swagger OpenAPI Explorer (Port 8000)
> **URL**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
> *Interactive OpenAPI Swagger documentation for all companion endpoints (`/api/scan/website`, `/api/scan/file`, `/api/quarantine/*`, `/api/fixtures`, `/api/evaluate`).*
<p align="center">
  <img src="docs/assets/19_fastapi_swagger_docs.png" alt="19 - FastAPI Swagger OpenAPI" width="900" style="border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);" />
</p>

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AGENTGUARD LOCAL SECURITY SUITE                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     │                                 │                                 │
     ▼                                 ▼                                 ▼
┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│  Chrome Extension (MV3)  │   │  Local Security Engine   │   │  Desktop Companion &     │
│                          │   │  (FastAPI on Loopback)   │   │  Quarantine Vault        │
├──────────────────────────┤   ├──────────────────────────┤   ├──────────────────────────┤
│ • chrome.tabs.onUpdated  │   │ • Loopback 127.0.0.1:8000│   │ • POSIX 0o700 Isolation  │
│ • chrome.downloads API   │◄─►│ • X-AgentProof-Token Auth│◄─►│ • SHA-256 Pre/Post Move  │
│ • Critical HTTP Overrides│   │ • 0-100 Heuristic Engine │   │ • Double-Ext Interception│
│ • Zero-Knowledge Cookies │   │ • Fail-Closed AI Policies│   │ • Audit Manifest Logging │
└──────────────────────────┘   └─────────────┬────────────┘   └──────────────────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────┐
                               │     Local Ollama AI      │
                               │ (Advisory Decoupled LLM) │
                               ├──────────────────────────┤
                               │ • Gemma 4 Advisory Expl. │
                               │ • Privacy Policy Summary │
                               │ • Fail-Closed Isolation  │
                               └──────────────────────────┘
```

---

## 🧪 Automated Testing Verification (111 / 111 Passed)

```bash
============================= Test Execution Summary =============================
Platform: macOS (Darwin) | Python 3.13 | Node.js v26.4.0

1. Python Security Engine & Companion Tests:
   tests/test_companion_api.py ......                                       [ 6%]
   tests/test_cookie_analyzer.py ....                                       [11%]
   tests/test_file_scanner.py ......                                        [17%]
   tests/test_llm_client.py .........                                       [28%]
   tests/test_llm_output.py .........                                       [38%]
   tests/test_metrics.py ...                                                [41%]
   tests/test_mock_tools.py ......                                          [48%]
   tests/test_policy_engine.py .......                                      [56%]
   tests/test_quarantine_manager.py .....                                   [61%]
   tests/test_reporting.py ....                                             [66%]
   tests/test_risk_engine.py .....                                          [71%]
   tests/test_scenarios.py .......                                          [79%]
   tests/test_server.py ......                                              [86%]
   tests/test_ui_app.py .....                                               [92%]
   tests/test_website_scanner.py .......                                    [100%]
   >>> 89 passed in 1.78s (0 failed, 0 skipped)

2. Chrome Extension Unit Tests:
   ✔ Connection Scanner — Plain HTTP & Critical overrides                   [PASS]
   ✔ Connection Scanner — Detects IP address hostnames and punycode         [PASS]
   ✔ Cookie Scanner — Redacts sensitive cookie names (Zero-Knowledge)       [PASS]
   ✔ Cookie Scanner — Flags missing Secure and HttpOnly flags               [PASS]
   ✔ Cookie Scanner — Flags SameSite=None without Secure attribute          [PASS]
   ✔ Download Protection — Intercepts deceptive double extensions           [PASS]
   ✔ Domain Policy — Allowlist and Denylist evaluation                      [PASS]
   ✔ Risk Engine — Deterministic score bands, overrides & deduplication     [PASS]
   ✔ Reports Generator — Sanitized JSON and HTML exports                    [PASS]
   >>> 22 passed in 49ms (0 failed, 0 skipped)

TOTAL: 111 passed / 111 executed (100% Pass Rate)
==================================================================================
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- **macOS** or **Linux**
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & npm
- Google Chrome browser

---

### 1. Clone Repository & Setup Python Environment
```bash
git clone https://github.com/shreyash-bhosale/AgentGuard.git
cd AgentGuard/agentproof-local

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run Python automated test suite
PYTHONPATH=. pytest tests/ -v
```

---

### 2. Load Chrome Extension in Developer Mode
1. Open Google Chrome and enter `chrome://extensions` in the address bar.
2. Toggle on **Developer mode** (top right).
3. Click **Load unpacked** (top left).
4. Select the directory:
   ```text
   AgentGuard/agentproof-local/chrome-extension
   ```
5. *(Or download the pre-packaged zip from `agentproof-local/frontend/public/agentguard-chrome-extension.zip`)*.

---

### 3. Run the Three Local Services

#### Terminal 1 — Local FastAPI Security Daemon
```bash
cd AgentGuard/agentproof-local
source .venv/bin/activate
uvicorn agentproof.server:app --host 127.0.0.1 --port 8000
```
- API Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health API: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

#### Terminal 2 — Streamlit Desktop Companion & Quarantine Vault
```bash
cd AgentGuard/agentproof-local
source .venv/bin/activate
streamlit run app.py --server.port 8501
```
- Streamlit UI: [http://127.0.0.1:8501](http://127.0.0.1:8501)

#### Terminal 3 — React + Vite Web Application
```bash
cd AgentGuard/agentproof-local/frontend
npm install
npm run dev -- --port 5173
```
- Web Application: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🔒 Security Principles & Invariants

- **Zero-Knowledge Privacy**: Raw cookie values, authentication tokens, and user credentials are strictly masked and never logged, exported, or stored.
- **Fail-Closed Boundary**: Deterministic rules always take precedence over advisory LLM outputs. In the event of an offline LLM or timeout, policies fail closed.
- **Critical Override Floor**: Passwords submitted over unencrypted HTTP force an immutable risk score of **75 / Critical** across both Python and JavaScript engines.
- **Auditable POSIX `0o700` Containment**: Quarantined files are cryptographically verified using pre-move and post-move SHA-256 digests to prevent execution or data loss.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
Built for open-source AI agent security, privacy-first browser monitoring, and verified safe computing.
