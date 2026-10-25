import React, { useState } from "react"
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  X,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { EvaluationReport, EvaluationResult } from "@/types"

interface ResultsExplorerViewProps {
  latestReport: EvaluationReport | null
}

export function ResultsExplorerView({ latestReport }: ResultsExplorerViewProps) {
  const [search, setSearch] = useState("")
  const [filterVerdict, setFilterVerdict] = useState("all")
  const [filterCorrectness, setFilterCorrectness] = useState("all")
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null)

  const results = latestReport?.results || []

  const filtered = results.filter((r) => {
    const matchesSearch =
      r.scenario_id.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.proposed_action || "").toLowerCase().includes(search.toLowerCase())

    const matchesVerdict =
      filterVerdict === "all" ||
      (filterVerdict === "allowed" && r.policy_allowed) ||
      (filterVerdict === "blocked" && !r.policy_allowed) ||
      (filterVerdict === "mismatch" && !r.intent_match) ||
      (filterVerdict === "error" && !!r.error_type)

    const matchesCorrectness =
      filterCorrectness === "all" ||
      (filterCorrectness === "correct" && r.policy_correct) ||
      (filterCorrectness === "incorrect" && !r.policy_correct)

    return matchesSearch && matchesVerdict && matchesCorrectness
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results Explorer"
        description="Search, filter, and inspect evaluation outcomes. Walk through the full 5-layer execution trace for each scenario proposal."
        badge={
          latestReport && (
            <StatusBadge variant="neutral">
              Run: {latestReport.metadata.run_id}
            </StatusBadge>
          )
        }
      />

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#263246] bg-[#121925] p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A7BB]" />
          <input
            type="text"
            placeholder="Search scenario ID or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#263246] bg-[#0E131D] pl-9 pr-3 py-2 text-xs text-[#F1F5FB] placeholder-[#98A7BB]/60 focus:border-[#8585FF] focus:outline-none font-mono"
          />
        </div>

        <select
          value={filterVerdict}
          onChange={(e) => setFilterVerdict(e.target.value)}
          aria-label="Filter by verdict"
          className="rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
        >
          <option value="all">Outcome: All</option>
          <option value="allowed">Allowed Only</option>
          <option value="blocked">Blocked Only</option>
          <option value="mismatch">Intent Drift Only</option>
          <option value="error">Errors Only</option>
        </select>

        <select
          value={filterCorrectness}
          onChange={(e) => setFilterCorrectness(e.target.value)}
          aria-label="Filter by policy match"
          className="rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
        >
          <option value="all">Policy Match: All</option>
          <option value="correct">Expected Match</option>
          <option value="incorrect">Disagreement</option>
        </select>
      </div>

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#263246] bg-[#121925]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#263246] bg-[#0E131D] text-[#98A7BB] font-mono uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Scenario ID</th>
                <th className="px-4 py-3">Proposed Action & Target</th>
                <th className="px-4 py-3">Policy Decision</th>
                <th className="px-4 py-3">Decision Match</th>
                <th className="px-4 py-3">Intent Match</th>
                <th className="px-4 py-3">Simulated Tool</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3 text-right">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#263246]/60">
              {filtered.map((r) => (
                <tr
                  key={r.scenario_id}
                  className="hover:bg-[#182130]/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedResult(r)}
                >
                  <td className="px-4 py-3 font-mono font-medium text-[#F1F5FB]">
                    {r.scenario_id}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#98A7BB]">
                    {r.proposed_action || "None"} &rarr; {r.proposed_target || "None"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={r.policy_allowed ? "allow" : "block"}>
                      {r.policy_allowed ? "ALLOWED" : "BLOCKED"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    {r.policy_correct ? (
                      <span className="font-mono text-[#35C98A]">✅ Match</span>
                    ) : (
                      <span className="font-mono text-[#FF6577]">❌ Disagree</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.intent_match ? (
                      <span className="font-mono text-[#35C98A]">✅ Match</span>
                    ) : (
                      <span className="font-mono text-[#F2B84B]">⚠️ Drift</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={r.tool_success ? "success" : "neutral"}>
                      {r.tool_success ? "EXECUTED" : "BLOCKED"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#98A7BB]">
                    {r.duration_ms}ms
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedResult(r)
                      }}
                      className="rounded bg-[#8585FF]/15 px-2.5 py-1 text-[11px] font-mono font-semibold text-[#8585FF] hover:bg-[#8585FF]/25"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-[#263246] bg-[#121925] p-12 text-center text-sm text-[#98A7BB]">
          No evaluation results to display. Run an evaluation in the <strong>Evaluation Lab</strong> or <strong>Overview</strong>.
        </div>
      )}

      {/* 5-Layer Deep-Dive Inspector Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#263246] bg-[#121925] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#263246]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-mono text-[#F1F5FB]">
                    {selectedResult.scenario_id}
                  </h3>
                  <StatusBadge
                    variant={selectedResult.policy_allowed ? "allow" : "block"}
                  >
                    {selectedResult.policy_allowed ? "POLICY ALLOWED" : "POLICY DENIED"}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-[#98A7BB]">
                  {selectedResult.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedResult(null)}
                className="text-[#98A7BB] hover:text-[#F1F5FB] p-1"
                aria-label="Close inspector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 5-Layer Trace Walkthrough */}
            <div className="mt-6 space-y-4">
              {/* Layer A */}
              <div className="rounded-xl border border-[#263246] bg-[#0E131D] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#8585FF]">
                    Layer A: Scenario Input & Expected Intent
                  </span>
                  <span className="text-[11px] font-mono text-[#98A7BB]">Untrusted Test Case</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#98A7BB]">
                  <div>Expected Action: <span className="text-[#F1F5FB]">{selectedResult.expected_action}</span></div>
                  <div>Expected Target: <span className="text-[#F1F5FB]">{selectedResult.expected_target}</span></div>
                  <div>Expected Decision: <span className="text-[#F1F5FB]">{selectedResult.expected_allowed ? "Allow" : "Block"}</span></div>
                  <div>Category: <span className="text-[#F1F5FB]">{selectedResult.category}</span></div>
                </div>
              </div>

              {/* Layer B */}
              <div className="rounded-xl border border-[#263246] bg-[#0E131D] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#55B9F5]">
                    Layer B: LLM Action Proposal & Schema Validation
                  </span>
                  <StatusBadge variant={selectedResult.proposal_valid ? "success" : "block"}>
                    {selectedResult.proposal_valid ? "VALID SCHEMA" : "MALFORMED"}
                  </StatusBadge>
                </div>
                {selectedResult.proposal_valid ? (
                  <pre className="rounded bg-[#090B10] p-3 text-[11px] font-mono text-[#F1F5FB] overflow-x-auto border border-[#263246]">
                    {JSON.stringify(
                      {
                        action: selectedResult.proposed_action,
                        target: selectedResult.proposed_target,
                        rationale: selectedResult.proposed_rationale,
                      },
                      null,
                      2
                    )}
                  </pre>
                ) : (
                  <div className="text-xs text-[#FF6577] bg-[#FF6577]/10 p-3 rounded-lg border border-[#FF6577]/30 font-mono">
                    {selectedResult.error_message || "Schema validation failed."}
                  </div>
                )}
                <div className="mt-2 text-[11px] font-mono text-[#98A7BB] flex items-center justify-between">
                  <span>Intent Match Check:</span>
                  <span className={selectedResult.intent_match ? "text-[#35C98A]" : "text-[#F2B84B]"}>
                    {selectedResult.intent_match ? "Action & Target matched scenario" : "Model deviated from intent"}
                  </span>
                </div>
              </div>

              {/* Layer C */}
              <div className="rounded-xl border border-[#263246] bg-[#0E131D] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#35C98A]">
                    Layer C: Deterministic Policy Engine Decision
                  </span>
                  <span className="text-[11px] font-mono text-[#98A7BB]">Fail-Closed Allowlist</span>
                </div>
                <div className="text-xs text-[#F1F5FB] bg-[#090B10] p-3 rounded-lg border border-[#263246]">
                  <div className="font-mono text-[#98A7BB] text-[10px] uppercase mb-1">Authorization Reason:</div>
                  "{selectedResult.policy_reason}"
                </div>
              </div>

              {/* Layer D */}
              <div className="rounded-xl border border-[#263246] bg-[#0E131D] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#F2B84B]">
                    Layer D: Harmless Mock Tool Execution
                  </span>
                  <span className="text-[11px] font-mono text-[#98A7BB]">Air-Gapped Sandbox</span>
                </div>
                {selectedResult.tool_result ? (
                  <pre className="rounded bg-[#090B10] p-3 text-[11px] font-mono text-[#F1F5FB] overflow-x-auto border border-[#263246]">
                    {JSON.stringify(selectedResult.tool_result, null, 2)}
                  </pre>
                ) : (
                  <div className="text-xs text-[#98A7BB] italic">
                    Execution was blocked by policy engine before reaching mock tools.
                  </div>
                )}
              </div>

              {/* Layer E */}
              <div className="rounded-xl border border-[#263246] bg-[#0E131D] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase text-[#98A7BB]">
                    Layer E: Telemetry & Outcome Verification
                  </span>
                  <span className="text-[11px] font-mono text-[#98A7BB]">{selectedResult.duration_ms} ms</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#98A7BB]">
                  <div>Policy Decision Match: <span className={selectedResult.policy_correct ? "text-[#35C98A]" : "text-[#FF6577]"}>{selectedResult.policy_correct ? "True (Expected)" : "False"}</span></div>
                  <div>Evaluation Mode: <span className="text-[#F1F5FB]">{selectedResult.evaluation_mode}</span></div>
                  <div>Timestamp: <span className="text-[#F1F5FB]">{selectedResult.timestamp.slice(0, 19)}</span></div>
                  <div>Model: <span className="text-[#F1F5FB]">{selectedResult.model_name}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
