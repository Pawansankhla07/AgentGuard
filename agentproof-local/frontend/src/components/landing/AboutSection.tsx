import React from "react"
import { ShieldCheck, Cpu, Lock, Sparkles, Heart, Users } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 bg-transparent text-[#F5F7FC] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Hacktoberfest 2026 Celebration Banner - Monochromatic Black & White */}
        <div className="mb-20 rounded-2xl border border-white/20 bg-gradient-to-r from-white/10 via-[#0A0C11] to-white/5 p-8 text-center backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-mono font-semibold text-white mb-3">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>COMMUNITY DRIVEN • HACKTOBERFEST 2026</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Built in Public for the Next Generation of AI Agents
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            AgentGuard was born from a fundamental belief: as autonomous agents gain tools, code execution,
            and database access, authorization must be mathematical and deterministic—never left to the LLM itself.
          </p>
        </div>

        {/* 3 Pillars in Monochromatic Styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-white/15 bg-[#0B0D13]/90 p-7 backdrop-blur-xl shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/25 text-white mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Trust Policy Gate</h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              We separate LLM reasoning from action authorization. Even if a prompt injection completely
              tricks the model into believing it has root permissions, the AgentGuard engine halts the execution.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#0B0D13]/90 p-7 backdrop-blur-xl shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/25 text-white mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Local & Air-Gapped</h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              No cloud telemetry, no third-party API dependencies. Run evaluations on your local machine
              with quantized Ollama models or lightweight test mocks without exposing any data.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#0B0D13]/90 p-7 backdrop-blur-xl shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/25 text-white mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Open Governance Standard</h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Transparent, readable schemas. Every scenario, policy decision, and evaluation report can be
              exported as standard JSON or Markdown for rigorous compliance audits.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
