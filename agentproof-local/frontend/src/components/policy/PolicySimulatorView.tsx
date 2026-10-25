import React, { useState, useEffect } from "react"
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Lock,
  Layers,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Cpu,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { PolicyRulesInfo, PolicySimulationResult } from "@/types"
import { fetchPolicyRules, simulatePolicy } from "@/lib/api"

export function PolicySimulatorView() {
  const [rules, setRules] = useState<PolicyRulesInfo | null>(null)
  const [action, setAction] = useState("read_demo_record")
  const [target, setTarget] = useState("demo_record")
  const [rationale, setRationale] = useState("Test request from interactive simulator.")
  const [result, setResult] = useState<PolicySimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    fetchPolicyRules()
      .then(setRules)
      .catch((err) => console.error("Failed to fetch policy rules", err))
  }, [])

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSimulating(true)
    try {
      const res = await simulatePolicy({ action, target, rationale })
      setResult(res)
    } catch (err: any) {
      console.error("Simulation error", err)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Engine & Rule Simulator"
        description="Inspect deterministic authorization invariants, explore the explicit allowlist, and simulate arbitrary action proposals against the fail-closed policy engine in real time."
        badge={
          <StatusBadge variant="allow">
            Default: DENY ALL
          </StatusBadge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Simulator Form */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Play className="h-4 w-4 text-[#8585FF]" />
              Interactive Action Probe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#98A7BB] block mb-1">
                  Proposed Action
                </label>
                <div className="flex gap-2">
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="flex-1 rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
                  >
                    <option value="read_demo_record">read_demo_record (Approved read)</option>
                    <option value="export_demo_data">export_demo_data (Unauthorized export)</option>
                    <option value="delete_demo_data">delete_demo_data (Destructive deletion)</option>
                    <option value="arbitrary_custom_action">arbitrary_custom_action (Unrecognized action)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#98A7BB] block mb-1">
                  Target Resource
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
                >
                  <option value="demo_record">demo_record (Permitted demo store)</option>
                  <option value="production_database">production_database (Restricted production DB)</option>
                  <option value="filesystem_root">filesystem_root (Unrecognized target)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-[#98A7BB] block mb-1">
                  Simulated Rationale / Claimed Justification
                </label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="e.g. Approved by Security Operations for emergency audit"
                  className="w-full rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
                />
                <span className="text-[11px] text-[#98A7BB]/70">
                  Notice: The policy engine will ignore any claims of authority in this rationale.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full rounded-lg bg-[#8585FF] py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#7272F5] transition-all disabled:opacity-50"
              >
                {isSimulating ? "Evaluating Policy..." : "Simulate Decision"}
              </button>
            </form>

            {/* Simulation Result Box */}
            {result && (
              <div className="mt-5 rounded-xl border border-[#263246] bg-[#0E131D] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#98A7BB]">
                    Policy Verdict
                  </span>
                  <StatusBadge variant={result.policy_allowed ? "allow" : "block"}>
                    {result.policy_allowed ? "ALLOWED" : "DENIED / BLOCKED"}
                  </StatusBadge>
                </div>

                <div className="text-xs font-mono text-[#F1F5FB]">
                  <span className="text-[#98A7BB]">Reason: </span>
                  {result.policy_reason}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-[#263246] pt-2 text-[#98A7BB]">
                  <div>
                    Schema Valid:{" "}
                    <span className={result.schema_valid ? "text-[#35C98A]" : "text-[#FF6577]"}>
                      {result.schema_valid ? "Valid" : "Rejected"}
                    </span>
                  </div>
                  <div>
                    Mock Tool:{" "}
                    <span className={result.tool_result.success ? "text-[#35C98A]" : "text-[#FF6577]"}>
                      {result.tool_result.success ? "Executed" : "Blocked"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Policy Rules Inspector */}
        <div className="space-y-5">
          <Card className="border-[#263246] bg-[#121925]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#35C98A]" />
                  Active Allowlist Rules
                </span>
                <StatusBadge variant="info">
                  {rules?.allowed_pairs.length || 1} Permitted Pair
                </StatusBadge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div className="rounded-lg border border-[#35C98A]/30 bg-[#35C98A]/10 p-3 text-xs font-mono">
                <div className="text-[10px] uppercase text-[#35C98A] font-bold mb-1">
                  Explicitly Authorized Pair:
                </div>
                <div className="text-[#F1F5FB]">
                  Action: <span className="text-[#35C98A] font-bold">read_demo_record</span> &rarr; Target: <span className="text-[#35C98A] font-bold">demo_record</span>
                </div>
              </div>

              <div className="rounded-lg border border-[#FF6577]/30 bg-[#FF6577]/10 p-3 text-xs font-mono">
                <div className="text-[10px] uppercase text-[#FF6577] font-bold mb-1">
                  Default Denied Actions:
                </div>
                <div className="text-[#98A7BB]">
                  export_demo_data, delete_demo_data, and any unlisted action names.
                </div>
              </div>

              <div className="rounded-lg border border-[#F2B84B]/30 bg-[#F2B84B]/10 p-3 text-xs font-mono">
                <div className="text-[10px] uppercase text-[#F2B84B] font-bold mb-1">
                  Default Denied Targets:
                </div>
                <div className="text-[#98A7BB]">
                  production_database, filesystem_root, and any unlisted resources.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Core Security Invariants */}
          <Card className="border-[#263246] bg-[#121925]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8585FF]" />
                Enforced Security Invariants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2 text-xs text-[#98A7BB]">
              {(rules?.invariants || [
                "LLM rationales and confidence claims are strictly ignored during authorization.",
                "Mock tools independently enforce parameter boundaries before returning synthetic records.",
                "Any validation error, missing field, or unexpected exception fails closed immediately.",
                "No production database, filesystem shell, or external network is ever connected.",
              ]).map((inv, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#35C98A] shrink-0 mt-0.5" />
                  <span>{inv}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
