# AgentProof — Website Safety & Login Advisor (Chrome Extension)

> **Test AI Agents. Enforce Policies. Prove Website Safety.**  
> A local-first, privacy-preserving Manifest V3 Chrome Extension that evaluates website security, analyzes login risk, audits cookie flags, reviews site permissions, and scans privacy policy disclosures.

---

## 1. Overview & Core Mission

When navigating the web or testing autonomous AI agents with web-browsing capabilities, understanding whether a site is safe for authentication or data input is crucial. 

**AgentProof Chrome Extension** provides an instant, heuristic security evaluation directly in the browser toolbar:
- **Transport & Connection Checks:** Validates HTTPS, flags plain HTTP, identifies mixed content, and detects deceptive hostname patterns (IP literals, Punycode, suspicious brand spoofing).
- **Form & Credential Security:** Inspects password fields, detects insecure HTTP form destinations, and flags cross-origin submissions.
- **Privacy-Preserving Cookie Audit:** Checks cookie attributes (`Secure`, `HttpOnly`, `SameSite`, domain scoping). **Crucially: Cookie values are never read, stored, displayed, or transmitted.**
- **Origin Permissions Inspection:** Queries browser permission states (camera, microphone, geolocation, notifications, clipboard) and assesses their privacy impact.
- **Privacy Policy & Terms Heuristics:** Locally scans linked privacy documents for third-party sharing, tracking beacons, data retention periods, and deletion mechanisms without cloud telemetry.
- **Deterministic Risk Scoring Engine:** Transparent, weighted 0–100 risk score with critical override protections and strict official recommendations.
- **Sanitized Export:** Download comprehensive JSON and standalone HTML audit reports with zero credentials or secret tokens.
- **Optional Local Ollama AI:** Synthesizes human-readable summaries using a local Ollama model (`gemma4:e2b-it-qat`) without cloud leaks. The deterministic engine remains authoritative.

---

## 2. Installation Instructions (Load Unpacked)

To install and run the extension locally in Google Chrome:

1. Open Google Chrome.
2. Navigate to `chrome://extensions` in the address bar.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left toolbar.
5. In the file picker dialog, select the `chrome-extension` directory located at:
   ```
   /Users/shreyashbhosale/Desktop/AgentGuard/agentproof-local/chrome-extension
   ```
6. The **AgentProof — Website Safety & Login Advisor** extension will appear in your extensions list.
7. Click the Extension puzzle icon in your Chrome toolbar and pin **AgentProof** for quick access.
8. Navigate to any website (e.g., `https://github.com` or `https://example.com`) and click the AgentProof shield icon.

---

## 3. Chrome Permissions & Privacy Justifications

In accordance with Chrome Web Store and Manifest V3 security standards, the extension adopts a least-privilege permission model:

| Permission | Scope | Justification & Privacy Guarantee |
| :--- | :--- | :--- |
| `activeTab` | Required | Grants temporary, read-only script execution on the currently active tab when the user opens the popup. Avoids asking for permanent browsing access across all sites. |
| `scripting` | Required | Programmatically executes the read-only inspection script (`content/content-script.js`) into the active tab to inspect DOM forms and mixed content. |
| `storage` | Required | Persists local user preferences (e.g., custom Ollama model selection) inside the browser. |
| `tabs` | Required | Reads the active tab's URL and title to display the verified hostname and connection protocol. |
| `cookies` | Optional | Requested on demand only when the user explicitly clicks **Check Cookies**. Scans security flags (`Secure`, `HttpOnly`, `SameSite`). **Cookie values are strictly discarded.** |
| `optional_host_permissions` | Optional (`*://*/*`) | Narrowed to the active site's origin at runtime when auditing cookies. If denied by the user, all other scans continue normally. |

---

## 4. Deterministic Risk Scoring & Official Recommendations

The scoring engine evaluates weighted risk signals, deduplicates repeated items, and outputs an exact score (0–100) and risk tier:

| Risk Score | Classification | Official Recommendation Wording |
| :---: | :---: | :--- |
| **0 – 24** | **Low** | *“No major issues were detected in the checks performed. Logging in may be reasonable, but safety is not guaranteed.”* |
| **25 – 49** | **Medium** | *“Review the highlighted issues before logging in.”* |
| **50 – 74** | **High** | *“Avoid entering credentials until the significant issues are resolved or independently verified.”* |
| **75 – 100** | **Critical** | *“Do not enter credentials while the critical warning remains unresolved.”* |

### Critical Override Rules
If any of the following severe technical hazards are detected, the score is automatically overridden to a minimum of **75** and classified as **Critical**:
1. Password field in a form transmitting over plain HTTP.
2. Insecure form submission destination targeting plain HTTP from an HTTPS site.
3. Unencrypted cross-origin credential transmission.

---

## 5. Architectural Directory Layout

```
chrome-extension/
├── manifest.json            # Manifest V3 configuration with least-privilege permissions
├── icons/                   # Real PNG icons (16px, 32px, 48px, 128px)
├── popup/
│   ├── popup.html           # Accessible popup dashboard markup
│   ├── popup.css            # Dark mode AgentProof cyber-security styling
│   └── popup.js             # Client controller, state coordinator, and tab driver
├── background/
│   └── service-worker.js    # MV3 background worker coordinating privileged API calls
├── content/
│   └── content-script.js    # Read-only page DOM inspector (forms, mixed content, policy links)
├── scanner/
│   ├── connection.js        # HTTPS, mixed content, and URL anomaly evaluator
│   ├── cookies.js           # Sanitized cookie metadata inspector (zero value storage)
│   ├── permissions.js       # Origin permissions (camera, mic, geo, notifications)
│   ├── privacy.js           # Local regex heuristic privacy policy parser
│   └── ollama.js            # Optional localhost Ollama AI advisor
├── risk/
│   └── scoring.js           # Authoritative deterministic risk scoring engine
├── reports/
│   └── generator.js         # Sanitized JSON & standalone HTML export formatting
├── tests/
│   ├── scoring.test.js      # Unit tests for scoring engine and critical overrides
│   ├── connection_and_cookies.test.js # Unit tests for transport and cookie checks
│   └── privacy_and_reports.test.js    # Unit tests for policy analyzer and report sanitation
└── package.json             # Native Node.js test runner configuration
```

---

## 6. Automated Testing

All extension modules are covered by automated unit tests using the native Node.js test runner:

```bash
cd chrome-extension
npm test
```

### Verified Test Coverage:
- **Risk Scoring:** Boundary checks (0 and 100 capping), duplicate signal deduplication, missing data resilience, critical overrides, and exact official recommendation strings.
- **Connection Checks:** Scheme validation, restricted page detection, IP hostnames, Punycode detection, and HTTP password form detection.
- **Cookie Security:** Name sanitization/redaction, detection of missing `Secure`, missing `HttpOnly`, insecure `SameSite=None`, and broad domain scoping.
- **Privacy Heuristics:** Disclosures regarding third-party sharing, web tracking beacons, indefinite retention, and data erasure rights.
- **Report Generation:** JSON & HTML structure verification, ensuring **zero** cookie values or passwords appear in exported reports.

---

## 7. Known Limitations

1. **Heuristic Evaluation:** The extension performs client-side heuristic inspection; it cannot detect server-side database vulnerabilities or zero-day exploits.
2. **Restricted Browser Pages:** Google Chrome prohibits content script execution on `chrome://`, `edge://`, `about:blank`, and the Chrome Web Store (`chromewebstore.google.com`). On these pages, the extension displays an informational notice.
3. **CORS on External Privacy Policies:** If a site hosts its privacy policy on a different domain or blocks cross-origin requests, the extension identifies the link but marks the text "External or CORS-protected".
4. **Local Ollama Availability:** Local AI synthesis requires `ollama serve` running on `http://127.0.0.1:11434`. If Ollama is offline, the extension functions completely with full deterministic evaluations.
