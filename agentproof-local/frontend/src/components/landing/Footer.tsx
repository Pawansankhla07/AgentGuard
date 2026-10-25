import React from "react"
import { Shield, Github, Heart, Cpu } from "lucide-react"

interface FooterProps {
  onNavigate: (sectionId: string) => void
  onOpenDashboard?: () => void
  repoUrl?: string
}

export function Footer({
  onNavigate,
  onOpenDashboard,
  repoUrl = "https://github.com/shreyash-bhosale/AgentGuard",
}: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-transparent py-14 text-xs text-[#727B8D]">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#F5F7FC]">AgentGuard</div>
              <div className="text-[10px] font-mono text-[#A3A9B7]">
                Safer AI Agents. Inspect. Understand. Secure.
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-6 text-[#A3A9B7]">
            <button
              onClick={() => onNavigate("home")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("governance")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              Governance
            </button>
            <button
              onClick={() => onNavigate("playground")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              Playground
            </button>
            <button
              onClick={() => onNavigate("extension")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              Extension
            </button>
            <button
              onClick={() => onNavigate("studio")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              3D Studio
            </button>
            <button
              onClick={() => onNavigate("docs")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              Docs
            </button>
            <button
              onClick={() => onNavigate("about")}
              className="hover:text-[#F5F7FC] transition-colors"
            >
              About
            </button>
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="text-white hover:underline transition-colors font-medium"
              >
                Launch Lab
              </button>
            )}
          </div>

          {/* GitHub link */}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#A3A9B7] hover:text-[#F5F7FC] transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Bottom row: status and copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#A3A9B7]">
            <span className="h-2 w-2 rounded-full bg-[#35C98A]" />
            <span>Local Engine: Fail-Closed Protection Active</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Open Source Security • Hacktoberfest 2026</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
