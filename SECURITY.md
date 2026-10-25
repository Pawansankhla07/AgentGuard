# Security Policy & Architecture Model — AgentProof Local

## 1. Threat Model & Security Boundaries

AgentProof Local operates under a **local-first, fail-closed, defense-in-depth** security architecture. Its primary objective is to evaluate websites, inspect credentials/cookie exposures, detect deceptive files/downloads, and enforce deterministic policy invariants on AI agent workflows.

### Trust Boundaries
```
+-------------------------------------------------------------+
| Browser / User Space                                        |
|  - Active Tab (Untrusted Web Content)                      |
|  - Extension Content Script (Sanitizes DOM & Form inputs)    |
|  - Extension Service Worker (Event-driven background logic) |
+------------------------------+------------------------------+
                               | Authenticated Loopback (127.0.0.1)
                               | Header: X-AgentProof-Token
+------------------------------v------------------------------+
| Local Security Companion & Engine                           |
|  - FastAPI Loopback Gateway                                 |
|  - Deterministic Policy Engine (5-Layer Fail-Closed)        |
|  - File Scanner (Cryptographic Hashes & Binary Inspection)  |
|  - Quarantine Vault (POSIX 0o700, Integrity Verification)   |
+------------------------------+------------------------------+
                               | Isolated Loopback (11434)
+------------------------------v------------------------------+
| Local Ollama LLM Service (Assistance & Summarization Only)   |
|  - Strictly decoupled from security decisions               |
|  - Zero cloud outbound telemetry                            |
+-------------------------------------------------------------+
```

### Strict Invariants
1. **Deterministic Authority**: The AI model (Ollama) produces advisory explanations and summaries only. The deterministic policy engine and heuristic risk rules remain 100% authoritative. An LLM cannot override a failed scan, bypass a critical alert, or execute destructive actions.
2. **Zero-Knowledge Privacy**: Raw cookie values, passwords, session tokens, or private user credentials are **never** logged, stored on disk, sent to Ollama, or exported in reports.
3. **Loopback-Only Binding**: All backend endpoints are bound strictly to `127.0.0.1` / `localhost`. Foreign origins and external network calls are blocked.
4. **Token-Authenticated Companion API**: All file scanning and quarantine requests must supply a valid `X-AgentProof-Token` or Bearer secret to prevent drive-by attacks from malicious websites.

---

## 2. Permissions Justification (Least Privilege)

| Permission | Scope | Technical Justification |
|---|---|---|
| `activeTab` | Temporary | Inspects the current active tab's URL and DOM only when explicitly invoked by user. |
| `scripting` | Explicit | Injects `content/content-script.js` to inspect form actions and detect unencrypted password inputs. |
| `storage` | Local | Persists user protection preferences (response level, allowlist, denylist) in `chrome.storage.local`. |
| `tabs` | Browser | Identifies active tab URL and updates tab navigation for blocked or warning screens. |
| `downloads` | Browser | Listens to `chrome.downloads.onCreated` to detect deceptive double extensions (`.pdf.exe`). |
| `alarms` | Background | Coordinates scheduled background policy checks without battery-draining continuous polling. |
| `notifications`| User | Dispatches system desktop notifications for verified critical threats and intercepted downloads. |
| `cookies` | Optional | Audits cookie security flags (`Secure`, `HttpOnly`, `SameSite`). Requested on-demand; zero values stored. |

---

## 3. Local Quarantine Security Protocol

The desktop companion provides safe, isolated file containment with the following guarantees:
- **Restricted Access**: The quarantine vault directory is initialized with POSIX `0o700` permissions (owner read/write/execute only).
- **De-weaponization**: Quarantined payloads are stored with non-executable permissions (`0o400`) and renamed with non-colliding UUIDs (`<uuid>.quarantined`).
- **Integrity Verification**: SHA-256 hashes are verified immediately before and after moving a file into the vault. If any hash mismatch occurs, the move is rolled back.
- **Path Traversal Defense**: The quarantine manager strictly prevents attempts to quarantine files already within the vault or via relative traversal sequences (`../`).
- **Reversibility**: Quarantined files can be safely restored to their original path or a user-specified directory upon explicit confirmation.

---

## 4. Responsible Testing & Safe Fixtures

- **Never test with live malware**: Do not execute or download active trojans, ransomware, or exploits.
- **Benign Fixtures**: Use the official, harmless EICAR standard antivirus test string (`X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*`) to test antivirus alerting and quarantine workflows safely.
- **Controlled Scenarios**: Test deceptive double extensions using synthetic benign files (e.g., `invoice.pdf.exe` containing standard text bytes).

---

## 5. Reporting Security Vulnerabilities

If you identify a security defect, privilege escalation, or privacy issue in AgentProof Local:
1. Do not file public GitHub issues for unpatched vulnerabilities.
2. Email full technical details and reproduction steps to the project maintainers.
3. Allow 72 hours for maintainers to verify and provide a mitigation patch.
