import React, { useState } from "react"
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Chrome,
  Download,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Globe,
  FileCode,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react"

interface DemoSite {
  id: string
  url: string
  name: string
  type: string
  score: number
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  recommendation: string
  findings: {
    title: string
    severity: "low" | "medium" | "high" | "critical"
    evidence: string
    remediation: string
  }[]
  metrics: {
    https: boolean
    passwordOverHttp: boolean
    insecureDestination: boolean
    cookieAudit: string
    permissionsImpact: string
  }
}

const SAMPLE_SITES: DemoSite[] = [
  {
    id: "github",
    url: "https://github.com/login",
    name: "GitHub Login (Secure Verified Origin)",
    type: "Legitimate Dev Portal",
    score: 8,
    riskLevel: "Low",
    recommendation:
      "No major issues were detected in the checks performed. Logging in may be reasonable, but safety is not guaranteed.",
    findings: [
      {
        title: "Secure HTTPS Connection",
        severity: "low",
        evidence: "TLS 1.3 encryption active, verified domain certificate.",
        remediation: "Continue standard authentication with 2FA.",
      },
      {
        title: "Form Submissions Encrypted",
        severity: "low",
        evidence: "Form action targets verified same-origin HTTPS destination.",
        remediation: "Input credentials securely.",
      },
    ],
    metrics: {
      https: true,
      passwordOverHttp: false,
      insecureDestination: false,
      cookieAudit: "All session tokens flagged Secure & SameSite=Lax",
      permissionsImpact: "Zero intrusive permissions requested",
    },
  },
  {
    id: "phishing",
    url: "http://secure-bank-login-verify.net/auth",
    name: "Deceptive HTTP Bank Login (Critical Hazard)",
    type: "Phishing / Unencrypted Portal",
    score: 88,
    riskLevel: "Critical",
    recommendation:
      "Do not enter credentials while the critical warning remains unresolved.",
    findings: [
      {
        title: "CRITICAL: Password input over plain HTTP",
        severity: "critical",
        evidence: "HTML contains <input type='password'> on an unencrypted HTTP page.",
        remediation: "Do not enter passwords or personal data. Interception is trivial.",
      },
      {
        title: "CRITICAL: Insecure credential transmission",
        severity: "critical",
        evidence: "Form action submits credentials without TLS encryption.",
        remediation: "Leave page immediately and verify domain through trusted channels.",
      },
      {
        title: "Suspicious Hostname Pattern",
        severity: "high",
        evidence: "Multiple hyphens and deceptive keywords mimicing financial brand.",
        remediation: "Check canonical bank URL.",
      },
    ],
    metrics: {
      https: false,
      passwordOverHttp: true,
      insecureDestination: true,
      cookieAudit: "Cookies missing Secure flag",
      permissionsImpact: "Unrestricted clipboard access attempted",
    },
  },
  {
    id: "tracker",
    url: "https://ad-network-analytics.biz/survey",
    name: "Overprivileged Tracker Site (High Privacy Risk)",
    type: "Data Aggregator",
    score: 64,
    riskLevel: "High",
    recommendation:
      "Avoid entering credentials until the significant issues are resolved or independently verified.",
    findings: [
      {
        title: "High Origin Permissions Requested",
        severity: "high",
        evidence: "Origin queries camera, microphone, and geolocation permissions.",
        remediation: "Deny device sensor permissions for untrusted web origins.",
      },
      {
        title: "Missing HttpOnly on Sensitive Cookie",
        severity: "medium",
        evidence: "Session identifiers accessible to clientside JavaScript (XSS hazard).",
        remediation: "Set HttpOnly flag on all authentication tokens.",
      },
      {
        title: "Privacy Policy Third-Party Disclosure",
        severity: "medium",
        evidence: "Policy explicitly permits sharing user telemetry with advertising brokers.",
        remediation: "Use ephemeral or anonymized accounts.",
      },
    ],
    metrics: {
      https: true,
      passwordOverHttp: false,
      insecureDestination: false,
      cookieAudit: "Session cookies lack HttpOnly flag",
      permissionsImpact: "Camera + Geolocation requested",
    },
  },
]

export function ChromeExtensionSection() {
  const [selectedSite, setSelectedSite] = useState<DemoSite>(SAMPLE_SITES[0])
  const [copiedPath, setCopiedPath] = useState(false)
  const extensionPath = "agentproof-local/chrome-extension"

  const handleCopyPath = () => {
    navigator.clipboard.writeText(extensionPath)
    setCopiedPath(true)
    setTimeout(() => setCopiedPath(false), 2000)
  }

  return (
    <section id="extension" className="relative py-20 bg-transparent text-[#F5F7FC]">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-mono font-medium text-white mb-4 shadow-sm">
            <Chrome className="h-4 w-4 text-white" />
            <span>BROWSER EXTENSION • MANIFEST V3</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Website Safety & Login Advisor
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
            Protect autonomous AI agents and human users before entering credentials.
            Evaluate connection safety, form targets, cookie security, and privacy policies in real time.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* PART 1: HOW TO ADD THE EXTENSION (Step-by-Step Installation)              */}
        {/* ========================================================================= */}
        <div className="mb-20 rounded-3xl border border-white/15 bg-[#0B0D13]/90 p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-neutral-300 uppercase">
                Installation Guide • Load Unpacked in Chrome
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                How to Add the Extension to Google Chrome
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/agentguard-chrome-extension.zip"
                download="agentguard-chrome-extension.zip"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-[0_0_16px_rgba(255,255,255,0.3)] hover:bg-neutral-200 hover:scale-[1.02] transition-all"
              >
                <Download className="h-4 w-4 text-black" />
                <span>Download Extension (.zip)</span>
              </a>
              <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-mono text-white">
                <CheckCircle2 className="h-4 w-4" />
                <span>Manifest V3 Ready</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-white/10 bg-[#12151D] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold text-white">
                    01
                  </span>
                  <Chrome className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="text-sm font-bold text-white">Open Extensions Page</div>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Open Google Chrome, type <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">chrome://extensions</code> in your address bar and press Enter.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-white/10 bg-[#12151D] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold text-white">
                    02
                  </span>
                  <Terminal className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="text-sm font-bold text-white">Enable Developer Mode</div>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Toggle on the <strong className="text-white">Developer mode</strong> switch in the upper-right corner of the Chrome extensions page.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/10 bg-[#12151D] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold text-white">
                    03
                  </span>
                  <Download className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="text-sm font-bold text-white">Click &quot;Load Unpacked&quot;</div>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Click the <strong className="text-white">Load unpacked</strong> button in the top-left toolbar and select this directory from the repo:
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-black/60 border border-white/10 px-2.5 py-1.5 text-[11px] font-mono text-neutral-300">
                <span className="truncate mr-2">{extensionPath}</span>
                <button
                  onClick={handleCopyPath}
                  className="text-neutral-400 hover:text-white p-1 rounded"
                  title="Copy directory path"
                >
                  {copiedPath ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-white/10 bg-[#12151D] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold text-white">
                    04
                  </span>
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm font-bold text-white">Visit Sites & Audit</div>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Pin the AgentGuard shield to your toolbar. Navigate to any website and click the icon to see real-time security advisory!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART 2: REAL-TIME WEBSITE RISK SIMULATOR (Try it Live)                    */}
        {/* ========================================================================= */}
        <div className="mb-20 rounded-3xl border border-white/15 bg-[#0B0D13]/90 p-8 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-neutral-300 uppercase">
                Interactive Heuristic Engine • Live Simulation
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Real-Time Website Risk & Accuracy Scanner
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Select a target website below to inspect how the extension calculates accuracy, risk tiers, and official recommendations.
              </p>
            </div>

            {/* Sample Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_SITES.map((site) => (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    selectedSite.id === site.id
                      ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                      : "bg-[#12151D] text-neutral-300 border-white/10 hover:border-white/25"
                  }`}
                >
                  {site.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Website URL Bar & Technical Signals (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Simulated Browser URL Bar */}
              <div className="rounded-2xl border border-white/10 bg-[#050608] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-3 w-3 rounded-full bg-neutral-700" />
                  <span className="h-3 w-3 rounded-full bg-neutral-700" />
                  <span className="h-3 w-3 rounded-full bg-neutral-700" />
                  <span className="ml-2 text-[11px] font-mono text-neutral-500">Simulated Target Page</span>
                </div>
                
                <div className="flex items-center gap-2.5 rounded-xl bg-[#0A0C11] border border-white/10 px-3 py-2 text-xs font-mono">
                  {selectedSite.metrics.https ? (
                    <Lock className="h-4 w-4 text-white shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-[#FF6577] shrink-0" />
                  )}
                  <span className="text-white truncate font-medium">{selectedSite.url}</span>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>Category: {selectedSite.type}</span>
                  <span className="text-neutral-300">Scan duration: ~18ms</span>
                </div>
              </div>

              {/* Technical Inspection Signals */}
              <div className="rounded-2xl border border-white/10 bg-[#050608] p-5 space-y-3.5">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-2 flex items-center justify-between">
                  <span>Observed Security Signals</span>
                  <span className="text-white">Deterministic Rules</span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-neutral-400">Transport Security (HTTPS):</span>
                  <span className={`font-mono font-bold ${selectedSite.metrics.https ? "text-white" : "text-[#FF6577]"}`}>
                    {selectedSite.metrics.https ? "TLS Verified" : "INSECURE HTTP"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-neutral-400">Password Form on HTTP:</span>
                  <span className={`font-mono font-bold ${selectedSite.metrics.passwordOverHttp ? "text-[#FF6577]" : "text-white"}`}>
                    {selectedSite.metrics.passwordOverHttp ? "DETECTED (CRITICAL OVERRIDE)" : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-neutral-400">Cookie Safety Flags:</span>
                  <span className="text-neutral-200 text-right font-mono text-[11px] max-w-[240px] truncate">
                    {selectedSite.metrics.cookieAudit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-neutral-400">Origin Permissions Impact:</span>
                  <span className="text-neutral-200 text-right font-mono text-[11px] max-w-[240px] truncate">
                    {selectedSite.metrics.permissionsImpact}
                  </span>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Detected Findings & Recommendations
                </div>

                {selectedSite.findings.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-[#12151D] p-3.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{item.title}</span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          item.severity === "critical"
                            ? "bg-[#FF6577]/20 text-[#FF6577]"
                            : item.severity === "high"
                            ? "bg-[#F2B84B]/20 text-[#F2B84B]"
                            : "bg-white/15 text-white"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] leading-relaxed mt-1">{item.evidence}</p>
                    <div className="mt-2 text-[11px] text-neutral-300 font-medium">
                      Advisor: {item.remediation}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right: Heuristic Risk Score HUD & Official Recommendation (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#050608] p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[460px]">
              
              {/* Radial Aura */}
              <div
                className={`pointer-events-none absolute h-72 w-72 rounded-full blur-[90px] transition-colors duration-500 ${
                  selectedSite.riskLevel === "Low"
                    ? "bg-white/20"
                    : selectedSite.riskLevel === "Critical"
                    ? "bg-[#FF6577]/25"
                    : "bg-[#F2B84B]/20"
                }`}
              />

              {/* Circular Gauge */}
              <div className="relative mb-6 flex h-36 w-36 items-center justify-center rounded-full border-2 border-white/20 bg-[#0A0C11] shadow-[0_0_40px_rgba(0,0,0,0.9)]">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {selectedSite.score}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    / 100 RISK
                  </span>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className="z-10 mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
                    selectedSite.riskLevel === "Low"
                      ? "bg-white/15 text-white border-white/30"
                      : selectedSite.riskLevel === "Critical"
                      ? "bg-[#FF6577]/20 text-[#FF6577] border-[#FF6577]/40"
                      : "bg-[#F2B84B]/20 text-[#F2B84B] border-[#F2B84B]/40"
                  }`}
                >
                  {selectedSite.riskLevel} Risk Level
                </span>
              </div>

              {/* Official Recommendation */}
              <div className="z-10 max-w-md">
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
                  Official Advisory Recommendation
                </div>
                <p className="text-sm font-semibold text-neutral-100 leading-relaxed bg-[#0A0C11]/80 border border-white/10 p-4 rounded-xl">
                  &ldquo;{selectedSite.recommendation}&rdquo;
                </p>
              </div>

              {/* Accuracy & Privacy Guarantees */}
              <div className="z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-4 w-full max-w-md text-left text-xs font-mono">
                <div className="rounded-lg bg-[#12151D] p-3 border border-white/5">
                  <div className="text-[10px] text-neutral-400 uppercase">Test Suite Coverage</div>
                  <div className="text-white font-bold mt-0.5">19/19 Unit Tests Passed</div>
                </div>
                <div className="rounded-lg bg-[#12151D] p-3 border border-white/5">
                  <div className="text-[10px] text-neutral-400 uppercase">Data Privacy</div>
                  <div className="text-white font-bold mt-0.5">0 Cookie Values Read</div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART 3: ARCHITECTURE & TELEMETRY-FREE AUDIT                               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/15 bg-[#0B0D13]/85 p-6 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/25 text-white mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white">Zero Telemetry & Local Scoring</h4>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              Calculations run completely inside the browser tab using native JavaScript heuristics.
              No browsing history or URLs are transmitted to any cloud servers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#0B0D13]/85 p-6 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/25 text-white mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white">Critical Override Rules</h4>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              If an unencrypted password field, insecure HTTP form destination, or plaintext credential submission
              is detected, the score is automatically overridden to ≥75 Critical.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#0B0D13]/85 p-6 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/25 text-white mb-4">
              <FileCode className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white">Sanitized Export Reports</h4>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              Download complete standalone JSON or HTML audit summaries with all credentials and cookie values
              strictly omitted for safe compliance archiving.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
