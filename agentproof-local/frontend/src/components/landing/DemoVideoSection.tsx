import React, { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  FileCode,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Download,
} from "lucide-react"

interface Chapter {
  id: string
  title: string
  timeStr: string
  seconds: number
  badge: string
  summary: string
  eventLog: {
    protocol: string
    target: string
    action: string
    verdict: string
    statusColor: string
    rule: string
  }
}

const CHAPTERS: Chapter[] = [
  {
    id: "interception",
    title: "1. Manifest V3 Event-Driven Interception",
    timeStr: "00:00",
    seconds: 0,
    badge: "Browser Layer",
    summary:
      "Chrome Security Extension hooks into chrome.tabs.onUpdated and chrome.downloads.onCreated to inspect every network transition before execution.",
    eventLog: {
      protocol: "MV3 Service Worker",
      target: "chrome.tabs.onUpdated -> 'http://portal.org'",
      action: "Evaluate Security Profile",
      verdict: "INTERCEPTED",
      statusColor: "#35C98A",
      rule: "Event-driven background scanner activated (Zero polling)",
    },
  },
  {
    id: "critical_override",
    title: "2. Plain HTTP Login Critical Override",
    timeStr: "00:35",
    seconds: 35,
    badge: "Risk Engine",
    summary:
      "Detects password form submitting credentials over unencrypted HTTP transport. Enforces deterministic Critical score (>= 75) and blocks credentials.",
    eventLog: {
      protocol: "HTTP/1.1 (Plaintext)",
      target: "http://insecure-login.org/auth",
      action: "Submit Password Credentials",
      verdict: "CRITICAL OVERRIDE (75/100)",
      statusColor: "#FF6577",
      rule: "CRITICAL_INVARIANT_01: Passwords over unencrypted HTTP blocked",
    },
  },
  {
    id: "cookie_redaction",
    title: "3. Zero-Knowledge Cookie Privacy",
    timeStr: "01:10",
    seconds: 70,
    badge: "Zero-Knowledge",
    summary:
      "Audits session tokens for Secure, HttpOnly, and SameSite metadata while enforcing zero-value storage invariant. Values are never stored or logged.",
    eventLog: {
      protocol: "Cookie Jar API",
      target: "Origin: https://secure.bank-example.com",
      action: "Inspect Token Flags",
      verdict: "[REDACTED_ZERO_KNOWLEDGE]",
      statusColor: "#35C98A",
      rule: "ZERO_KNOWLEDGE_INVARIANT: Raw values masked at extraction boundary",
    },
  },
  {
    id: "quarantine_vault",
    title: "4. Desktop POSIX 0o700 Quarantine Vault",
    timeStr: "01:45",
    seconds: 105,
    badge: "Host Protection",
    summary:
      "Intercepts deceptive double-extension executable (invoice.pdf.exe) and isolates it to a restricted vault directory with SHA-256 pre/post validation.",
    eventLog: {
      protocol: "Quarantine Daemon",
      target: "Downloads/tax_invoice_2026.pdf.exe",
      action: "Atomic Move to quarantine_vault/",
      verdict: "ISOLATED (POSIX 0o700)",
      statusColor: "#F2A93B",
      rule: "POSIX_CHMOD_0700: Read/write locked exclusively to root owner",
    },
  },
  {
    id: "ai_governance",
    title: "5. Deterministic AI Policy Engine",
    timeStr: "02:20",
    seconds: 140,
    badge: "Agent Sandbox",
    summary:
      "Evaluates autonomous LLM agent proposals against fail-closed deterministic policy gates. Prompt injection and jailbreaks are blocked prior to tool execution.",
    eventLog: {
      protocol: "Ollama / Baseline Gate",
      target: "delete_demo_data on production_store",
      action: "Prompt Injection Override Attempt",
      verdict: "BLOCKED (FAIL_CLOSED)",
      statusColor: "#FF6577",
      rule: "POLICY_GATE_03: Unapproved destructive targets strictly prohibited",
    },
  },
]

export function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [currentTime, setCurrentTime] = useState<number>(12)
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const [activeSpeed, setActiveSpeed] = useState<number>(1)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0)

  const totalDuration = 175 // 2m 55s

  // Automated timeline progression when playing
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1 * activeSpeed
          if (next >= totalDuration) {
            return 0
          }
          return next
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, activeSpeed, totalDuration])

  // Sync active chapter based on time
  useEffect(() => {
    let currentIdx = 0
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (currentTime >= CHAPTERS[i].seconds) {
        currentIdx = i
      }
    }
    setSelectedChapterIndex(currentIdx)
  }, [currentTime])

  const activeChapter = CHAPTERS[selectedChapterIndex]

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value))
  }

  const handleJumpToChapter = (idx: number) => {
    setSelectedChapterIndex(idx)
    setCurrentTime(CHAPTERS[idx].seconds)
    setIsPlaying(true)
  }

  return (
    <section id="demo-video" className="relative py-20 px-6 md:px-10 border-b border-white/10 bg-[#060709]">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-mono font-medium text-white shadow-inner">
            <Sparkles className="h-3.5 w-3.5" />
            <span>FULL ARCHITECTURE DEMONSTRATION</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#F5F7FC]">
            Watch AgentGuard in Action
          </h2>
          <p className="text-sm md:text-base text-[#A3A9B7] leading-relaxed">
            See how the 4 core components—Chrome Manifest V3 Extension, FastAPI Security Engine, POSIX Quarantine Vault, and Deterministic Policy Gates—work together to defend your browser and AI agents in real time.
          </p>
        </div>

        {/* Video Player & Stage Component */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Video Frame (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-[#090B10] p-4 md:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] space-y-4">
            
            {/* Top Video HUD Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-mono text-[#A3A9B7]">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF6577] animate-pulse" />
                <span className="font-semibold text-white uppercase tracking-wider">LIVE RECORDED WALKTHROUGH</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/90">
                  {activeChapter.badge}
                </span>
                <span>1080p 60FPS</span>
              </div>
            </div>

            {/* Video Stage Visualizer Canvas */}
            <div className="relative aspect-video w-full rounded-2xl border border-white/10 bg-[#050608] overflow-hidden flex flex-col justify-between p-6">
              
              {/* Background Cyber Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Top HUD: Current Chapter Title */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#35C98A] flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                    <span>ACTIVE EVALUATION TRACE</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                    {activeChapter.title}
                  </h3>
                </div>

                <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-1.5 font-mono text-xs text-white/80">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </div>
              </div>

              {/* Center Dynamic Telemetry Card */}
              <div className="relative z-10 my-auto rounded-xl border border-white/10 bg-[#0A0C12]/90 backdrop-blur-md p-5 shadow-2xl space-y-3 max-w-xl mx-auto w-full">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A3A9B7]">PROTOCOL TRACE</span>
                  <span className="text-white font-semibold">{activeChapter.eventLog.protocol}</span>
                </div>

                <div className="rounded-lg bg-black/60 p-3 font-mono text-xs text-white/90 space-y-1 border border-white/5">
                  <div className="text-white/40">Target: <span className="text-white">{activeChapter.eventLog.target}</span></div>
                  <div className="text-white/40">Action: <span className="text-white">{activeChapter.eventLog.action}</span></div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-white/50">Verdict</span>
                  <span
                    className="text-xs font-mono font-bold px-3 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${activeChapter.eventLog.statusColor}20`,
                      color: activeChapter.eventLog.statusColor,
                      border: `1px solid ${activeChapter.eventLog.statusColor}40`,
                    }}
                  >
                    {activeChapter.eventLog.verdict}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-white/70 italic border-t border-white/5 pt-2">
                  🛡️ {activeChapter.eventLog.rule}
                </div>
              </div>

              {/* Bottom HUD: Live Status */}
              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white/50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#35C98A]" />
                  <span>AgentGuard Engine: PASSING ALL 111 TESTS</span>
                </div>
                <div>LOCAL AIR-GAPPED EVALUATION</div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="space-y-3 pt-2">
              
              {/* Scrub Slider */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/20 transition-all"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => setCurrentTime(0)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/15 transition-all"
                    title="Restart"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  <div className="font-mono text-xs text-white/80 pl-2">
                    {formatTime(currentTime)} <span className="text-white/40">/ {formatTime(totalDuration)}</span>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5 text-[11px] font-mono text-white/80">
                    {[1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setActiveSpeed(spd)}
                        className={`px-2 py-0.5 rounded ${activeSpeed === spd ? "bg-white text-black font-bold" : "hover:text-white"}`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/15 transition-all"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chapter Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-white/15 bg-[#090B10] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-white/80" />
                  Video Chapters & Milestones
                </h3>
                <span className="text-[11px] font-mono text-white/40">5 Sections</span>
              </div>

              <div className="space-y-2.5">
                {CHAPTERS.map((ch, idx) => {
                  const isActive = selectedChapterIndex === idx
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleJumpToChapter(idx)}
                      className={`w-full text-left rounded-2xl border p-3.5 transition-all flex flex-col gap-1.5 ${
                        isActive
                          ? "border-white/40 bg-white/10 shadow-lg"
                          : "border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white line-clamp-1">{ch.title}</span>
                        <span className="text-[10px] font-mono text-white/50">{ch.timeStr}</span>
                      </div>
                      <p className="text-[11px] text-[#A3A9B7] line-clamp-2 leading-relaxed">
                        {ch.summary}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Direct Links and Download inside Chapter Card */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <a
                  href="/agentguard-chrome-extension.zip"
                  download
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all shadow-md"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Chrome Extension (.ZIP)</span>
                </a>

                <a
                  href="http://127.0.0.1:8501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/50 px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-white hover:border-white/25 transition-all"
                >
                  <span>Open Streamlit Quarantine Vault</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
