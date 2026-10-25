import React, { useRef } from "react"
import {
  Code,
  Github,
  ArrowRight,
  ShieldAlert,
  FileQuestion,
  Wrench,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
  Box,
  BookOpen,
  Users,
  Cpu,
  Chrome,
} from "lucide-react"
import { motion } from "framer-motion"
import { Spotlight } from "@/components/ui/spotlight"
import { RobotCenterpiece } from "@/components/landing/RobotCenterpiece"
import RobotTearReveal from "@/components/ui/robot-tear-reveal"
import { EncryptNavButton } from "@/components/ui/amazing-button-component"
import { LandingTopic } from "@/components/landing/Navbar"

interface HeroSectionProps {
  onSelectTopic: (topic: LandingTopic) => void
  onOpenDashboard: () => void
  repoUrl?: string
}

const FEATURE_STRIP = [
  {
    icon: ShieldAlert,
    title: "Detect Risks",
    desc: "Unapproved file access, destructive commands & leaks.",
    badge: "Deterministic",
    topic: "governance" as LandingTopic,
  },
  {
    icon: FileQuestion,
    title: "Plain Language",
    desc: "Translates opaque agent action schemas into human facts.",
    badge: "Zero-Jargon",
    topic: "governance" as LandingTopic,
  },
  {
    icon: Wrench,
    title: "Safer Fixes",
    desc: "Auto-remediates action targets into safe sandbox scopes.",
    badge: "Fail-Closed",
    topic: "governance" as LandingTopic,
  },
  {
    icon: CheckCircle2,
    title: "Verify Execution",
    desc: "Simulates policy enforcement before agent execution.",
    badge: "100% Proven",
    topic: "playground" as LandingTopic,
  },
]

const TOPIC_SHORTCUTS: {
  id: LandingTopic
  label: string
  icon: any
  desc: string
  badge: string
}[] = [
  {
    id: "governance",
    label: "GOVERNANCE",
    icon: Layers,
    desc: "Threat discovery, plain language reasoning & automated policy remediation.",
    badge: "4-Stage Engine",
  },
  {
    id: "playground",
    label: "POLICY LAB",
    icon: Zap,
    desc: "Test candidate action proposals against fail-closed deterministic gates.",
    badge: "Live Interactive",
  },
  {
    id: "extension",
    label: "CHROME EXTENSION",
    icon: Chrome,
    desc: "Real-time website login safety audit, HTTPS checks & heuristic risk scoring.",
    badge: "Manifest V3",
  },
  {
    id: "studio",
    label: "3D STUDIO",
    icon: Box,
    desc: "Interactive Spline WebGL canvas & orbital robot inspection system.",
    badge: "Full 3D WebGL",
  },
  {
    id: "docs",
    label: "DOCUMENTATION",
    icon: BookOpen,
    desc: "Quickstart commands, Python SDK setup & REST API reference guide.",
    badge: "Developer Guide",
  },
  {
    id: "about",
    label: "ABOUT PROJECT",
    icon: Users,
    desc: "Hacktoberfest 2026, air-gapped security & open mission architecture.",
    badge: "Open Source",
  },
]

export function HeroSection({
  onSelectTopic,
  onOpenDashboard,
  repoUrl = "https://github.com/shreyash-bhosale/AgentGuard",
}: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-[90vh] pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col justify-center overflow-hidden border-b border-white/10 bg-transparent"
    >
      {/* Dynamic Mouse-Following Spotlight in Monochromatic White/Silver */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        size={520}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Main Hero Content — Left Column (7 cols) with Spacious Typography */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            
            {/* 1. Open Source Badge — Textured Black & White */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 mb-5 self-start rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-md shadow-sm"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-white">
                <Code className="h-2.5 w-2.5" />
              </div>
              <span className="text-xs font-medium tracking-wide text-neutral-100">Open Source</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="text-xs font-mono font-semibold text-white tracking-wider">
                Hacktoberfest 2026
              </span>
            </motion.div>

            {/* 2. Platform Brand Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-xs md:text-sm font-mono uppercase tracking-[0.25em] text-neutral-400 mb-2"
            >
              AgentGuard Security Platform
            </motion.div>

            {/* 3. Primary Headline: Integrated Robot Tear Reveal Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full my-2 rounded-2xl overflow-hidden border border-white/10 bg-[#07080B]/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md"
            >
              <RobotTearReveal
                word="SAFER"
                tagline="AGENTGUARD SECURITY PLATFORM"
                suffix="AI AGENTS"
                paper="#08090C"
                ink="#FFFFFF"
                taglineColor="#A1A1AA"
                height="280px"
                scrollDistance="180px"
                interactive={true}
              />
            </motion.div>

            {/* 4. Supporting Tagline in Monochrome */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="my-3 text-lg md:text-2xl font-semibold text-neutral-100 tracking-wide flex items-center gap-3"
            >
              <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">Inspect.</span>
              <span className="text-white/30">•</span>
              <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">Understand.</span>
              <span className="text-white/30">•</span>
              <span className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">Secure.</span>
            </motion.div>

            {/* 5. Product Description with Generous Line-Height */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="my-4 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl font-normal"
            >
              AgentGuard helps you find and fix security risks in AI agents before they can leak
              your data or take harmful actions. Built for developers, teams and anyone using AI tools.
            </motion.p>

            {/* 6. Primary Action Buttons in Monochromatic Black & White */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 mb-8 flex flex-wrap items-center gap-4"
            >
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-xs md:text-sm font-bold text-black shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:shadow-[0_0_36px_rgba(255,255,255,0.65)] hover:bg-neutral-200 hover:scale-[1.02] transition-all"
              >
                <Github className="h-4 w-4 text-black" />
                <span>View on GitHub</span>
                <span className="ml-1 rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-mono text-black font-semibold">
                  v1.0
                </span>
              </a>

              <button
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-xs md:text-sm font-semibold text-white hover:border-white/50 hover:bg-white/10 transition-all shadow-sm"
              >
                <Cpu className="h-4 w-4 text-neutral-200" />
                <span>Launch Evaluation Lab</span>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>
            </motion.div>

            {/* 7. Four-Item Feature Strip in Monochrome */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl"
            >
              {FEATURE_STRIP.map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectTopic(item.topic)}
                    className="group flex flex-col p-3 rounded-xl border border-white/5 hover:border-white/25 hover:bg-white/5 transition-all text-left focus:outline-none"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/20 group-hover:scale-110 transition-transform">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400 uppercase px-1.5 py-0.5 rounded bg-white/5">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-100 leading-snug">
                      {item.title}
                    </div>
                    <div className="mt-1.5 text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                      {item.desc}
                    </div>
                  </button>
                )
              })}
            </motion.div>

          </div>

          {/* Right Column: 3D Robot Centerpiece with Orbitals in Monochromatic Black & White */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] md:min-h-[500px]">
            <RobotCenterpiece containerRef={heroRef} />
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SHORT START PAGE TOPIC DIRECTORY: Big & Visible Encrypt Buttons           */}
        {/* ========================================================================= */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400">
                Explore Project Topics & Separate Pages
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                Security Governance Modules
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-300 border border-white/15 bg-white/5 px-3 py-1.5 rounded-full">
              Hover to scramble • Click to open page
            </span>
          </div>

          {/* Large, Prominent Animated Encrypt Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOPIC_SHORTCUTS.map((shortcut) => (
              <EncryptNavButton
                key={shortcut.id}
                label={shortcut.label}
                desc={shortcut.desc}
                icon={shortcut.icon}
                badge={shortcut.badge}
                onClick={() => onSelectTopic(shortcut.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
