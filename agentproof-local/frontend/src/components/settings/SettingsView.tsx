import React, { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Server,
  Terminal,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { HealthInfo, ModelsInfo } from "@/types"
import { fetchHealth, fetchModels } from "@/lib/api"

interface SettingsViewProps {
  health: HealthInfo | null
  modelsInfo: ModelsInfo | null
  onRefreshHealth: () => void
  isRefreshing: boolean
}

export function SettingsView({
  health,
  modelsInfo,
  onRefreshHealth,
  isRefreshing,
}: SettingsViewProps) {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const h = await fetchHealth()
      if (h.ollama.connected) {
        setTestResult(`Success: Connected to Ollama at ${h.ollama.url} (${h.ollama.model_count} models found).`)
      } else {
        setTestResult(`Warning: Backend is active, but Ollama is offline: ${h.ollama.error || "Connection refused"}`)
      }
    } catch (err: any) {
      setTestResult(`Error: Could not reach backend server: ${err.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  const isOllamaConnected = health?.ollama?.connected ?? false

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Diagnostics"
        description="Verify local inference endpoints, inspect Ollama connectivity, view installed model weights, and troubleshoot evaluation telemetry."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Backend & Runtime Diagnostics */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-[#8585FF]" />
              Python Backend Service
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 font-mono text-xs text-[#98A7BB]">
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Status:</span>
              <span className="text-[#35C98A] font-bold">HEALTHY</span>
            </div>
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Framework:</span>
              <span className="text-[#F1F5FB]">FastAPI + AgentProof Core</span>
            </div>
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Version:</span>
              <span className="text-[#F1F5FB]">{health?.version || "1.0.0"}</span>
            </div>
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Policy Engine:</span>
              <span className="text-[#35C98A]">Deterministic Fail-Closed</span>
            </div>
            <div className="flex justify-between">
              <span>Target Resource:</span>
              <span className="text-[#55B9F5]">Air-Gapped Synthetic Mock</span>
            </div>
          </CardContent>
        </Card>

        {/* Local Ollama Diagnostics */}
        <Card className="border-[#263246] bg-[#121925]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#8585FF]" />
                Ollama Local Inference
              </span>
              <StatusBadge variant={isOllamaConnected ? "allow" : "warn"}>
                {isOllamaConnected ? "ONLINE" : "OFFLINE"}
              </StatusBadge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 font-mono text-xs text-[#98A7BB]">
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Base URL:</span>
              <span className="text-[#F1F5FB]">{health?.ollama?.url || "http://localhost:11434"}</span>
            </div>
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Default Model:</span>
              <span className="text-[#8585FF] font-semibold">{health?.default_model || "gemma4:e2b-it-qat"}</span>
            </div>
            <div className="flex justify-between border-b border-[#263246]/60 pb-2">
              <span>Installed Models:</span>
              <span className="text-[#F1F5FB]">{health?.ollama?.model_count || 0} models detected</span>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 rounded-lg bg-[#8585FF] py-2 text-xs font-semibold text-white hover:bg-[#7272F5] transition-all disabled:opacity-50"
              >
                {isTesting ? "Testing..." : "Test Ollama Connection"}
              </button>
              <button
                onClick={onRefreshHealth}
                disabled={isRefreshing}
                className="rounded-lg border border-[#263246] bg-[#182130] px-3 py-2 text-xs font-semibold text-[#F1F5FB] hover:border-[#3B4A63]"
                title="Refresh Model List"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {testResult && (
              <div className="mt-3 rounded-lg bg-[#0E131D] border border-[#263246] p-2.5 text-[11px] text-[#F1F5FB]">
                {testResult}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Models List */}
      <Card className="border-[#263246] bg-[#121925]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold">Installed Models on Local System</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {modelsInfo?.models && modelsInfo.models.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {modelsInfo.models.map((m) => {
                const isDefault = m === health?.default_model
                return (
                  <div
                    key={m}
                    className={`rounded-lg border p-3 font-mono text-xs flex items-center justify-between ${
                      isDefault
                        ? "border-[#8585FF]/40 bg-[#8585FF]/10 text-[#F1F5FB]"
                        : "border-[#263246] bg-[#0E131D] text-[#98A7BB]"
                    }`}
                  >
                    <span>{m}</span>
                    {isDefault && (
                      <span className="text-[10px] bg-[#8585FF] text-white px-1.5 py-0.5 rounded font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-xs text-[#98A7BB] p-4 text-center">
              No models discovered. Ensure Ollama is running and has models installed.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actionable Terminal Commands */}
      <Card className="border-[#263246] bg-[#121925]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#8585FF]" />
            Operator Troubleshooting Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3 text-xs">
          <div>
            <div className="text-[#98A7BB] mb-1 font-mono">1. If Ollama connection fails:</div>
            <pre className="rounded bg-[#090B10] border border-[#263246] p-2.5 font-mono text-[#F1F5FB]">
              ollama serve
            </pre>
          </div>
          <div>
            <div className="text-[#98A7BB] mb-1 font-mono">2. If gemma4:e2b-it-qat model is missing:</div>
            <pre className="rounded bg-[#090B10] border border-[#263246] p-2.5 font-mono text-[#F1F5FB]">
              ollama pull gemma4:e2b-it-qat
            </pre>
          </div>
          <div>
            <div className="text-[#98A7BB] mb-1 font-mono">3. Run backend unit & integration tests:</div>
            <pre className="rounded bg-[#090B10] border border-[#263246] p-2.5 font-mono text-[#F1F5FB]">
              python -m pytest -v
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
