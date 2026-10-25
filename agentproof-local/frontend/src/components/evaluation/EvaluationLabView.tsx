import React, { useState } from "react"
import {
  Play,
  RotateCcw,
  Cpu,
  Clock,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { ModelsInfo, ScenarioModel, EvaluationReport } from "@/types"

interface EvaluationLabViewProps {
  scenarios: ScenarioModel[]
  modelsInfo: ModelsInfo | null
  onRunEvaluation: (params: {
    mode: "baseline" | "llm"
    model_name?: string
    timeout?: number
    scenario_ids?: string[]
  }) => Promise<void>
  isRunning: boolean
  latestReport: EvaluationReport | null
}

export function EvaluationLabView({
  scenarios,
  modelsInfo,
  onRunEvaluation,
  isRunning,
  latestReport,
}: EvaluationLabViewProps) {
  const [evalMode, setEvalMode] = useState<"baseline" | "llm">("baseline")
  const [selectedModel, setSelectedModel] = useState<string>(
    modelsInfo?.default_model || "gemma4:e2b-it-qat"
  )
  const [timeoutSec, setTimeoutSec] = useState<number>(60)
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(
    scenarios.map((s) => s.id)
  )
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const categories = ["all", ...Array.from(new Set(scenarios.map((s) => s.category)))]

  const filteredScenarios = scenarios.filter((s) =>
    categoryFilter === "all" ? true : s.category === categoryFilter
  )

  const handleToggleScenario = (id: string) => {
    setSelectedScenarioIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllVisible = () => {
    const visibleIds = filteredScenarios.map((s) => s.id)
    setSelectedScenarioIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
  }

  const handleClearAll = () => {
    setSelectedScenarioIds([])
  }

  const handleStartRun = async () => {
    if (selectedScenarioIds.length === 0) return
    await onRunEvaluation({
      mode: evalMode,
      model_name: evalMode === "llm" ? selectedModel : undefined,
      timeout: timeoutSec,
      scenario_ids: selectedScenarioIds,
    })
  }

  const isOllamaConnected = modelsInfo?.connected ?? false

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluation Lab"
        description="Configure evaluation parameters, choose target models, select security scenarios, and test deterministic policy containment."
        badge={
          <StatusBadge variant={evalMode === "llm" ? "info" : "neutral"}>
            Mode: {evalMode.toUpperCase()}
          </StatusBadge>
        }
      />

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mode Selector */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardContent className="p-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#98A7BB]">
              Execution Mode
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEvalMode("baseline")}
                className={`rounded-lg border px-3 py-2.5 text-xs font-medium text-left transition-all ${
                  evalMode === "baseline"
                    ? "border-[#8585FF] bg-[#8585FF]/15 text-[#F1F5FB] font-semibold"
                    : "border-[#263246] bg-[#0E131D] text-[#98A7BB] hover:border-[#3B4A63]"
                }`}
              >
                <div className="font-semibold text-[#F1F5FB]">Deterministic</div>
                <div className="text-[10px] text-[#98A7BB]">Baseline (No LLM)</div>
              </button>

              <button
                type="button"
                onClick={() => setEvalMode("llm")}
                disabled={!isOllamaConnected}
                className={`rounded-lg border px-3 py-2.5 text-xs font-medium text-left transition-all ${
                  evalMode === "llm"
                    ? "border-[#8585FF] bg-[#8585FF]/15 text-[#F1F5FB] font-semibold"
                    : "border-[#263246] bg-[#0E131D] text-[#98A7BB] hover:border-[#3B4A63]"
                } ${!isOllamaConnected ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="font-semibold text-[#F1F5FB]">Local LLM</div>
                <div className="text-[10px] text-[#98A7BB]">Ollama / Gemma 4</div>
              </button>
            </div>
            {!isOllamaConnected && (
              <div className="text-[11px] text-[#F2B84B] flex items-center gap-1.5 pt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Ollama offline. Start 'ollama serve' for LLM mode.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Selection */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#98A7BB]">
                Target Model
              </span>
              <Cpu className="h-3.5 w-3.5 text-[#8585FF]" />
            </div>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={evalMode === "baseline" || !isOllamaConnected}
              aria-label="Target Model"
              className="w-full rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none disabled:opacity-50 font-mono"
            >
              {modelsInfo?.models && modelsInfo.models.length > 0 ? (
                modelsInfo.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              ) : (
                <option value="gemma4:e2b-it-qat">gemma4:e2b-it-qat (Default)</option>
              )}
            </select>
            <div className="text-[11px] text-[#98A7BB] font-mono">
              Temperature: 0.0 (Reproducible proposals)
            </div>
          </CardContent>
        </Card>

        {/* Timeout Bounds */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#98A7BB]">
                Request Timeout
              </span>
              <Clock className="h-3.5 w-3.5 text-[#8585FF]" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={timeoutSec}
                onChange={(e) => setTimeoutSec(Number(e.target.value))}
                disabled={evalMode === "baseline"}
                aria-label="Request Timeout"
                className="w-full accent-[#8585FF] cursor-pointer disabled:opacity-50"
              />
              <span className="font-mono text-xs font-bold text-[#F1F5FB] w-12 text-right">
                {timeoutSec}s
              </span>
            </div>
            <div className="text-[11px] text-[#98A7BB]">
              Fails closed if the model exceeds deadline.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Selection Header */}
      <Card className="border-[#263246] bg-[#121925]">
        <div className="border-b border-[#263246] p-4 flex flex-wrap items-center justify-between gap-3 bg-[#0E131D]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5FB]">
              Scenarios ({selectedScenarioIds.length} of {scenarios.length} selected)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllVisible}
                className="text-xs text-[#8585FF] hover:underline flex items-center gap-1 font-mono"
              >
                <CheckSquare className="h-3.5 w-3.5" /> Select All
              </button>
              <span className="text-[#263246]">|</span>
              <button
                onClick={handleClearAll}
                className="text-xs text-[#98A7BB] hover:underline flex items-center gap-1 font-mono"
              >
                <Square className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="rounded-md border border-[#263246] bg-[#121925] px-2.5 py-1 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>

            <button
              onClick={handleStartRun}
              disabled={isRunning || selectedScenarioIds.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8585FF] px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[#7272F5] transition-all disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run {selectedScenarioIds.length} Selected
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scenarios Grid */}
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredScenarios.map((sc) => {
              const isChecked = selectedScenarioIds.includes(sc.id)
              return (
                <div
                  key={sc.id}
                  onClick={() => handleToggleScenario(sc.id)}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                    isChecked
                      ? "border-[#8585FF]/40 bg-[#8585FF]/8 text-[#F1F5FB]"
                      : "border-[#263246] bg-[#0E131D]/60 text-[#98A7BB] hover:border-[#3B4A63]"
                  }`}
                >
                  <div className="mt-0.5">
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-[#8585FF]" />
                    ) : (
                      <Square className="h-4 w-4 text-[#263246]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#F1F5FB]">
                        {sc.id}
                      </span>
                      <StatusBadge variant={sc.expected_allowed ? "allow" : "block"}>
                        {sc.expected_allowed ? "Expect Allow" : "Expect Block"}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-[#98A7BB] line-clamp-2">
                      {sc.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-[#98A7BB]">
                      <span className="text-[#8585FF]">{sc.action}</span>
                      <span>&rarr;</span>
                      <span className="text-[#55B9F5]">{sc.target}</span>
                      <span className="text-[#263246]">|</span>
                      <span>{sc.category}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completion Summary Table */}
      {latestReport && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#F1F5FB] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#35C98A]" />
              Latest Run Results ({latestReport.metadata.run_id})
            </h3>
            <span className="text-xs font-mono text-[#98A7BB]">
              Accuracy: {latestReport.summary_metrics.policy_accuracy_pct}%
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#263246] bg-[#121925]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#263246] bg-[#0E131D] text-[#98A7BB] font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Scenario</th>
                  <th className="px-4 py-3">Proposed Action & Target</th>
                  <th className="px-4 py-3">Policy Verdict</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Correct</th>
                  <th className="px-4 py-3">Intent Match</th>
                  <th className="px-4 py-3">Mock Tool Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#263246]/60">
                {latestReport.results.map((r) => (
                  <tr key={r.scenario_id} className="hover:bg-[#182130]/50 transition-colors">
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
                      <StatusBadge variant={r.expected_allowed ? "allow" : "block"}>
                        {r.expected_allowed ? "ALLOW" : "BLOCK"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {r.policy_correct ? "✅ Match" : "❌ Disagree"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {r.intent_match ? (
                        <span className="text-[#35C98A]">✅ Match</span>
                      ) : (
                        <span className="text-[#F2B84B]">⚠️ Drift</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#98A7BB]">
                      {r.tool_success ? (
                        <span className="text-[#35C98A]">Executed (Mock)</span>
                      ) : (
                        <span>Blocked (Simulated)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
