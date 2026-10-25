import React from "react"
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart2,
  FileSpreadsheet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { EvaluationReport } from "@/types"

interface SecurityAnalysisViewProps {
  latestReport: EvaluationReport | null
}

export function SecurityAnalysisView({ latestReport }: SecurityAnalysisViewProps) {
  const metrics = latestReport?.summary_metrics

  if (!metrics || !latestReport) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Security Analysis"
          description="Visual security metrics, policy containment rates, and adversarial defense telemetry."
        />
        <div className="rounded-xl border border-[#263246] bg-[#121925] p-12 text-center text-sm text-[#98A7BB]">
          No evaluation data to analyze. Run an evaluation in the <strong>Evaluation Lab</strong> first.
        </div>
      </div>
    )
  }

  const isSmallSample = metrics.total_scenarios <= 8
  const total = metrics.total_scenarios || 1
  const allowedPct = Math.round((metrics.allowed_actions / total) * 100)
  const blockedPct = 100 - allowedPct

  const correctPct = Math.round((metrics.correct_decisions / total) * 100)
  const incorrectPct = 100 - correctPct

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Analysis"
        description="Comprehensive analysis of policy enforcement boundaries, schema adherence, and adversarial containment."
        badge={
          <StatusBadge variant="neutral">
            Run: {latestReport.metadata.run_id}
          </StatusBadge>
        }
      />

      {isSmallSample && (
        <div className="flex items-center gap-3 rounded-xl border border-[#F2B84B]/30 bg-[#F2B84B]/10 p-4 text-xs text-[#F2B84B]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Preliminary Sample Size:</strong> Current run contains {metrics.total_scenarios} scenarios.
            Metrics demonstrate exact policy engine mechanics and strict allowlist enforcement.
          </span>
        </div>
      )}

      {/* Visual Telemetry Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Allowed vs Blocked */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Proposals: Allowed vs. Blocked</span>
              <span className="font-mono text-xs text-[#98A7BB]">{metrics.total_scenarios} Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#35C98A]">Permitted Actions ({metrics.allowed_actions})</span>
                <span className="text-[#35C98A] font-bold">{allowedPct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#0E131D] overflow-hidden">
                <div
                  className="h-full bg-[#35C98A] rounded-full transition-all"
                  style={{ width: `${allowedPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#FF6577]">Blocked Actions ({metrics.blocked_actions})</span>
                <span className="text-[#FF6577] font-bold">{blockedPct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#0E131D] overflow-hidden">
                <div
                  className="h-full bg-[#FF6577] rounded-full transition-all"
                  style={{ width: `${blockedPct}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#98A7BB] pt-1">
              Deterministic allowlist enforces that only approved read operations against demo resources are executed.
            </p>
          </CardContent>
        </Card>

        {/* Policy Correctness */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Policy Decision Accuracy</span>
              <span className="font-mono text-xs text-[#35C98A] font-bold">{metrics.policy_accuracy_pct}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#35C98A]">Expected Decisions Matched ({metrics.correct_decisions})</span>
                <span className="text-[#35C98A] font-bold">{correctPct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#0E131D] overflow-hidden">
                <div
                  className="h-full bg-[#35C98A] rounded-full transition-all"
                  style={{ width: `${correctPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#FF6577]">Disagreements / Failures ({metrics.incorrect_decisions})</span>
                <span className="text-[#FF6577] font-bold">{incorrectPct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[#0E131D] overflow-hidden">
                <div
                  className="h-full bg-[#FF6577] rounded-full transition-all"
                  style={{ width: `${incorrectPct}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#98A7BB] pt-1">
              Measures whether policy engine decisions match the ground-truth expectation recorded in test scenarios.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card className="border-[#263246] bg-[#121925]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold">Performance by Scenario Category</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#263246] bg-[#0E131D] text-[#98A7BB] font-mono uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Scenarios</th>
                <th className="px-4 py-2.5">Correct Decisions</th>
                <th className="px-4 py-2.5">Allowed</th>
                <th className="px-4 py-2.5">Blocked</th>
                <th className="px-4 py-2.5">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263246]/60">
              {Object.entries(metrics.category_breakdown || {}).map(([cat, stats]) => {
                const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
                return (
                  <tr key={cat} className="hover:bg-[#182130]/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-[#F1F5FB]">{cat}</td>
                    <td className="px-4 py-3 font-mono">{stats.total}</td>
                    <td className="px-4 py-3 font-mono text-[#35C98A]">{stats.correct}</td>
                    <td className="px-4 py-3 font-mono text-[#35C98A]">{stats.allowed}</td>
                    <td className="px-4 py-3 font-mono text-[#FF6577]">{stats.blocked}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#8585FF]">{acc}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Security Invariants Enforced */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-[#263246] bg-[#121925] p-5">
          <div className="flex items-center gap-2 mb-2 text-[#8585FF]">
            <Lock className="h-4 w-4" />
            <h4 className="text-xs font-bold font-mono uppercase">Separation of Authority</h4>
          </div>
          <p className="text-xs text-[#98A7BB] leading-relaxed">
            The model generates proposals, but has zero authorization rights. Rationale claims (e.g. SOC2 compliance or emergency admin directives) are ignored entirely by the deterministic policy engine.
          </p>
        </Card>

        <Card className="border-[#263246] bg-[#121925] p-5">
          <div className="flex items-center gap-2 mb-2 text-[#35C98A]">
            <Cpu className="h-4 w-4" />
            <h4 className="text-xs font-bold font-mono uppercase">Defense-in-Depth Mock Tools</h4>
          </div>
          <p className="text-xs text-[#98A7BB] leading-relaxed">
            Even if an upstream component malfunctions, the mock execution layer independently validates that only approved read operations on simulated demo records return synthetic test payloads.
          </p>
        </Card>
      </div>
    </div>
  )
}
