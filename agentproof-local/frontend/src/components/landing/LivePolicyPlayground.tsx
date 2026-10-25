import React, { useState } from "react"
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Zap,
  Lock,
  Sparkles,
  Terminal,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"

interface ActionItem {
  id: string
  label: string
  action: string
  target: string
  rationale: string
  expectedAllowed: boolean
}

const SAMPLE_ACTIONS: ActionItem[] = [
  {
    id: "read_demo",
    label: "Safe Read Demo",
    action: "read_demo_record",
    target: "demo_record",
    rationale: "Verify record validity before reading status field",
    expectedAllowed: true,
  },
  {
    id: "delete_record",
    label: "Destructive Delete",
    action: "delete_record",
    target: "demo_record",
    rationale: "Clean up completed test scenario artifacts immediately",
    expectedAllowed: false,
  },
  {
    id: "bash_exec",
    label: "Arbitrary Shell Exec",
    action: "execute_shell",
    target: "cat /etc/passwd",
    rationale: "Inspect user environment to prepare execution wrapper",
    expectedAllowed: false,
  },
  {
    id: "safe_health",
    label: "Health Check Query",
    action: "query_health_status",
    target: "system_heartbeat",
    rationale: "Query local heartbeat to confirm daemon readiness",
    expectedAllowed: true,
  },
]

export function LivePolicyPlayground() {
  const [selectedAction, setSelectedAction] = useState<ActionItem>(SAMPLE_ACTIONS[0])
  const [evaluationState, setEvaluationState] = useState<"idle" | "evaluating" | "result">("idle")
  const [lastResult, setLastResult] = useState<{
    allowed: boolean
    reason: string
    latencyMs: number
  } | null>(null)

  const handleTestEvaluation = () => {
    setEvaluationState("evaluating")

    // Deterministic simulation based on AgentGuard allowlist rules
    setTimeout(() => {
      const allowed = selectedAction.expectedAllowed
      const reason = allowed
        ? `Permitted: (${selectedAction.action}, ${selectedAction.target}) is in the deterministic allowlist.`
        : `Denied: (${selectedAction.action}, ${selectedAction.target}) violates fail-closed security boundary.`
      
      setLastResult({
        allowed,
        reason,
        latencyMs: Math.floor(Math.random() * 8) + 4, // 4-12ms realistic latency
      })
      setEvaluationState("result")
    }, 650)
  }

  return (
    <section className="relative mx-auto max-w-7xl px-6 md:px-8 py-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-mono font-medium text-white mb-3">
          <Zap className="h-3.5 w-3.5 text-white" />
          <span>INTERACTIVE 3D SECURITY PLAYGROUND</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FC]">
          Test AI Agent Policy Decisions Live
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Select an agent proposal below to observe how AgentGuard's deterministic policy engine
          evaluates, contains, or permits tool execution with zero prompt-injection vulnerability.
        </p>
      </div>

      <div className="rounded-3xl border border-white/15 bg-[#0B0D13]/90 p-6 md:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Action Selector & Payload Config (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Candidate Agent Action</span>
              <span className="text-neutral-300">Air-Gapped Simulation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_ACTIONS.map((action) => {
                const isSelected = selectedAction.id === action.id
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSelectedAction(action)
                      setEvaluationState("idle")
                    }}
                    className={`flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-white bg-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                        : "border-white/5 bg-[#12151D] text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white truncate">
                        {action.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          action.expectedAllowed
                            ? "bg-white/20 text-white"
                            : "bg-[#FF6577]/20 text-[#FF6577]"
                        }`}
                      >
                        {action.expectedAllowed ? "PERMITTED" : "RESTRICTED"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400 truncate">
                      {action.action}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Structured Proposal Payload */}
            <div className="rounded-xl border border-white/10 bg-[#050608] p-4 text-xs font-mono">
              <div className="flex items-center justify-between text-neutral-400 border-b border-white/10 pb-2 mb-3">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-white" />
                  <span>ActionProposal Payload</span>
                </span>
                <span className="text-[10px] text-neutral-500">schema: v1.0.strict</span>
              </div>
              <div className="space-y-1 text-white">
                <div>
                  <span className="text-neutral-400">&quot;action&quot;:</span>{" "}
                  <span className="text-white font-semibold">&quot;{selectedAction.action}&quot;</span>,
                </div>
                <div>
                  <span className="text-neutral-400">&quot;target&quot;:</span>{" "}
                  <span className="text-white font-semibold">&quot;{selectedAction.target}&quot;</span>,
                </div>
                <div>
                  <span className="text-neutral-400">&quot;rationale&quot;:</span>{" "}
                  <span className="text-neutral-400">&quot;{selectedAction.rationale}&quot;</span>
                </div>
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={handleTestEvaluation}
              disabled={evaluationState === "evaluating"}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-3.5 text-xs md:text-sm font-bold shadow-[0_0_24px_rgba(255,255,255,0.3)] hover:shadow-[0_0_32px_rgba(255,255,255,0.5)] hover:bg-neutral-200 hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              {evaluationState === "evaluating" ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>Simulating Policy Gate...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current text-black" />
                  <span>Evaluate Action Against Policy Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Right: 3D Security Gate Decision HUD (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#050608] p-8 text-center relative overflow-hidden min-h-[360px]">
            {/* Ambient Background Aura */}
            <div
              className={`pointer-events-none absolute h-64 w-64 rounded-full blur-[80px] transition-colors duration-500 ${
                evaluationState === "result" && lastResult?.allowed
                  ? "bg-white/20"
                  : evaluationState === "result" && !lastResult?.allowed
                  ? "bg-[#FF6577]/20"
                  : "bg-white/10"
              }`}
            />

            {/* Holographic Target Rings */}
            <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-[#0A0C11] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <span className="absolute -inset-2 rounded-full border border-white/5 animate-pulse" />
              <span className="absolute -inset-4 rounded-full border border-white/5" />

              {evaluationState === "evaluating" ? (
                <RefreshCw className="h-10 w-10 text-white animate-spin" />
              ) : evaluationState === "result" && lastResult?.allowed ? (
                <ShieldCheck className="h-12 w-12 text-white drop-shadow-[0_0_16px_#ffffff]" />
              ) : evaluationState === "result" && !lastResult?.allowed ? (
                <ShieldAlert className="h-12 w-12 text-[#FF6577] drop-shadow-[0_0_16px_#FF6577]" />
              ) : (
                <Lock className="h-10 w-10 text-white" />
              )}
            </div>

            {/* Decision Status Text */}
            <div className="z-10">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">
                POLICY ENGINE DECISION
              </div>

              {evaluationState === "evaluating" ? (
                <div className="text-xl font-bold text-white animate-pulse">
                  Evaluating Allowlist Tuples...
                </div>
              ) : evaluationState === "result" && lastResult?.allowed ? (
                <div>
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                    <span>ACTION AUTHORIZED</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-300 max-w-sm mx-auto">
                    {lastResult.reason}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/25 px-3 py-1 text-[11px] font-mono text-white">
                    <span>Decision Latency: {lastResult.latencyMs}ms</span>
                  </div>
                </div>
              ) : evaluationState === "result" && lastResult && !lastResult.allowed ? (
                <div>
                  <div className="text-2xl font-bold text-[#FF6577] flex items-center justify-center gap-2">
                    <ShieldAlert className="h-6 w-6" />
                    <span>EXECUTION BLOCKED</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-300 max-w-sm mx-auto">
                    {lastResult.reason}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FF6577]/10 border border-[#FF6577]/30 px-3 py-1 text-[11px] font-mono text-[#FF6577]">
                    <span>Decision Latency: {lastResult.latencyMs}ms</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-white">Gate Idle & Armed</div>
                  <p className="mt-1 text-xs text-neutral-400">
                    Select an action and press evaluate to test policy authorization.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
