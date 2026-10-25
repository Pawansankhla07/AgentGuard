import React, { useState, useEffect } from "react"
import {
  Download,
  Save,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import {
  EvaluationReport,
  SavedReportInfo,
} from "@/types"
import {
  getReportDownloadUrl,
  saveReportDisk,
  fetchSavedReports,
} from "@/lib/api"

interface ReportsViewProps {
  latestReport: EvaluationReport | null
}

export function ReportsView({ latestReport }: ReportsViewProps) {
  const [savedReports, setSavedReports] = useState<SavedReportInfo[]>([])
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadSavedReports = async () => {
    try {
      const list = await fetchSavedReports()
      setSavedReports(list)
    } catch (err) {
      console.error("Failed to load saved reports", err)
    }
  }

  useEffect(() => {
    loadSavedReports()
  }, [])

  const handleSaveToDisk = async () => {
    if (!latestReport) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const res = await saveReportDisk(latestReport.metadata.run_id)
      setSaveMessage(res.message || "Report saved to reports/ directory successfully.")
      await loadSavedReports()
    } catch (err: any) {
      setSaveMessage(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const runId = latestReport?.metadata.run_id

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluation Reports & Export"
        description="Download evaluation artifacts in JSON, CSV, or Markdown. Persist verification evidence to the local filesystem for auditing and CI/CD pipelines."
        badge={
          runId && (
            <StatusBadge variant="neutral">
              Run: {runId}
            </StatusBadge>
          )
        }
      />

      {/* Active Run Export Card */}
      {latestReport ? (
        <Card className="border-[#263246] bg-[#121925]">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Run Artifacts</CardTitle>
              <StatusBadge variant="info">
                {latestReport.results.length} Scenarios Evaluated
              </StatusBadge>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <a
                href={getReportDownloadUrl(runId!, "json")}
                download={`${runId}.json`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#263246] bg-[#0E131D] p-3 text-xs font-semibold text-[#F1F5FB] hover:border-[#8585FF] hover:bg-[#8585FF]/10 transition-all font-mono"
              >
                <FileCode className="h-4 w-4 text-[#8585FF]" />
                Download JSON
              </a>

              <a
                href={getReportDownloadUrl(runId!, "csv")}
                download={`${runId}.csv`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#263246] bg-[#0E131D] p-3 text-xs font-semibold text-[#F1F5FB] hover:border-[#35C98A] hover:bg-[#35C98A]/10 transition-all font-mono"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#35C98A]" />
                Download CSV
              </a>

              <a
                href={getReportDownloadUrl(runId!, "markdown")}
                download={`${runId}.md`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#263246] bg-[#0E131D] p-3 text-xs font-semibold text-[#F1F5FB] hover:border-[#55B9F5] hover:bg-[#55B9F5]/10 transition-all font-mono"
              >
                <FileText className="h-4 w-4 text-[#55B9F5]" />
                Download Markdown
              </a>

              <button
                onClick={handleSaveToDisk}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#8585FF] p-3 text-xs font-semibold text-white hover:bg-[#7272F5] transition-all font-mono disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save to reports/"}
              </button>
            </div>

            {saveMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-[#8585FF]/10 border border-[#8585FF]/30 p-3 text-xs text-[#8585FF]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{saveMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#263246] bg-[#121925] p-8 text-center text-sm text-[#98A7BB]">
          No active evaluation to export. Complete a run in the <strong>Evaluation Lab</strong> to generate downloadable reports.
        </Card>
      )}

      {/* Local Disk Archive */}
      <Card className="border-[#263246] bg-[#121925]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-[#8585FF]" />
            Local Reports Directory Archive (`reports/`)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {savedReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#263246] bg-[#0E131D] text-[#98A7BB] font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">File Name</th>
                    <th className="px-4 py-2.5">Run ID</th>
                    <th className="px-4 py-2.5">Mode</th>
                    <th className="px-4 py-2.5">Scenarios</th>
                    <th className="px-4 py-2.5">Accuracy</th>
                    <th className="px-4 py-2.5">File Size</th>
                    <th className="px-4 py-2.5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#263246]/60">
                  {savedReports.map((item) => (
                    <tr key={item.filename} className="hover:bg-[#182130]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-[#8585FF]">
                        {item.filename}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#98A7BB]">{item.run_id}</td>
                      <td className="px-4 py-3 font-mono uppercase text-[11px]">{item.mode}</td>
                      <td className="px-4 py-3 font-mono">{item.scenarios}</td>
                      <td className="px-4 py-3 font-mono text-[#35C98A] font-bold">
                        {item.accuracy}%
                      </td>
                      <td className="px-4 py-3 font-mono text-[#98A7BB]">{item.size_kb} KB</td>
                      <td className="px-4 py-3 text-[#98A7BB] font-mono">
                        {item.timestamp ? item.timestamp.slice(0, 19) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-xs text-[#98A7BB] p-4 text-center">
              No saved reports currently in the `reports/` directory. Click "Save to reports/" to persist a run.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
