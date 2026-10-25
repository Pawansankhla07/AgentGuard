import React, { useState, useEffect } from "react"
import {
  BookOpen,
  Search,
  Shield,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { GlossaryItem } from "@/types"
import { fetchGlossary } from "@/lib/api"

export function SecurityGlossaryView() {
  const [items, setItems] = useState<GlossaryItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedCat, setSelectedCat] = useState("all")

  useEffect(() => {
    fetchGlossary()
      .then(setItems)
      .catch((err) => console.error("Failed to load glossary", err))
  }, [])

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))]

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.definition.toLowerCase().includes(search.toLowerCase()) ||
      item.why_it_matters.toLowerCase().includes(search.toLowerCase())

    const matchesCat = selectedCat === "all" || item.category === selectedCat

    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Security Knowledge Base & Glossary"
        description="Core concepts in LLM tool sandboxing, prompt injection defenses, deterministic policy proxies, and fail-closed engineering."
        badge={
          <StatusBadge variant="info">
            {items.length} Essential Concepts
          </StatusBadge>
        }
      />

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#263246] bg-[#121925] p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A7BB]" />
          <input
            type="text"
            placeholder="Search security terms, attacks, or principles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#263246] bg-[#0E131D] pl-9 pr-3 py-2 text-xs text-[#F1F5FB] placeholder-[#98A7BB]/60 focus:border-[#8585FF] focus:outline-none font-mono"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          aria-label="Filter by category"
          className="rounded-lg border border-[#263246] bg-[#0E131D] px-3 py-2 text-xs text-[#F1F5FB] focus:border-[#8585FF] focus:outline-none font-mono"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>
      </div>

      {/* Glossary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card
            key={item.term}
            className="border-[#263246] bg-[#121925] hover:border-[#3B4A63] transition-all flex flex-col justify-between"
          >
            <CardHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-sm font-bold text-[#F1F5FB]">
                  {item.term}
                </CardTitle>
                <StatusBadge variant="neutral">
                  {item.category}
                </StatusBadge>
              </div>
              <p className="mt-2 text-xs text-[#F1F5FB] leading-relaxed">
                {item.definition}
              </p>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <div className="rounded-lg bg-[#0E131D] border border-[#263246] p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#F2B84B] font-mono text-[10px] font-bold uppercase">
                  <Lightbulb className="h-3 w-3" /> Why It Matters:
                </div>
                <div className="text-[#98A7BB] text-[11.5px] leading-relaxed">
                  {item.why_it_matters}
                </div>
              </div>

              <div className="rounded-lg bg-[#8585FF]/10 border border-[#8585FF]/20 p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#8585FF] font-mono text-[10px] font-bold uppercase">
                  <CheckCircle2 className="h-3 w-3" /> AgentProof Implementation:
                </div>
                <div className="text-[#F1F5FB] text-[11.5px] leading-relaxed font-mono">
                  {item.agentproof_implementation}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
