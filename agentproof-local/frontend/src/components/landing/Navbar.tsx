import React, { useState, useEffect } from "react"
import { Shield, Github, Menu, X, ArrowUpRight, Cpu } from "lucide-react"

export type LandingTopic = "home" | "governance" | "playground" | "studio" | "extension" | "docs" | "about"

interface NavbarProps {
  activeTopic: LandingTopic
  onSelectTopic: (topic: LandingTopic) => void
  onOpenDashboard?: () => void
  repoUrl?: string
}

const NAV_LINKS: { id: LandingTopic; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "governance", label: "Governance" },
  { id: "playground", label: "Policy Playground" },
  { id: "extension", label: "Chrome Extension" },
  { id: "studio", label: "3D Studio" },
  { id: "docs", label: "Docs" },
  { id: "about", label: "About" },
]

export function Navbar({
  activeTopic,
  onSelectTopic,
  onOpenDashboard,
  repoUrl = "https://github.com/shreyashbhosale/AgentGuard",
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-[#07080A]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] py-3.5"
          : "border-b border-white/5 bg-[#07080A]/60 backdrop-blur-md py-4.5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
        {/* Left: Brand Identity */}
        <button
          onClick={() => onSelectTopic("home")}
          className="group flex items-center gap-3.5 text-left focus:outline-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-[#F5F7FC] shadow-[0_0_16px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" />
            <div className="absolute -inset-0.5 rounded-xl border border-white/10 blur-[1px]" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-[#F5F7FC] flex items-center gap-2">
              <span>AgentGuard</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-mono font-medium text-white/90">
                LOCAL
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-[0.16em] text-[#A3A9B7]">
              INSPECT • UNDERSTAND • SECURE
            </div>
          </div>
        </button>

        {/* Center: Desktop Navigation Links (Switches Separate Pages) */}
        <nav className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0A0C11]/80 px-4 py-1.5 backdrop-blur-md shadow-inner">
          {NAV_LINKS.map((link) => {
            const isActive = activeTopic === link.id
            return (
              <button
                key={link.id}
                onClick={() => onSelectTopic(link.id)}
                className={`relative px-4 py-1.5 text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? "text-[#F5F7FC] font-semibold"
                    : "text-[#A3A9B7] hover:text-[#F5F7FC]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions (GitHub & Dashboard Switch) */}
        <div className="hidden sm:flex items-center gap-3.5">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-[#F5F7FC] hover:bg-white/20 transition-all shadow-[0_0_14px_rgba(255,255,255,0.1)]"
            >
              <Cpu className="h-3.5 w-3.5 text-white" />
              <span>Launch Lab</span>
            </button>
          )}

          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0E1015] px-4 py-2 text-xs font-semibold text-[#F5F7FC] hover:border-white/25 hover:bg-[#141720] transition-all"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
            <ArrowUpRight className="h-3 w-3 text-[#A3A9B7]" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0E1015] text-[#F5F7FC]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#07080A]/95 px-6 py-6 backdrop-blur-2xl">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTopic(link.id)
                  setMobileMenuOpen(false)
                }}
                className={`text-left py-2 px-3 rounded-lg text-sm font-medium tracking-wide transition-all ${
                  activeTopic === link.id
                    ? "bg-white/10 text-[#F5F7FC] font-semibold"
                    : "text-[#A3A9B7] hover:text-[#F5F7FC]"
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
              {onOpenDashboard && (
                <button
                  onClick={() => {
                    onOpenDashboard()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-black py-2.5 text-xs font-semibold"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Open Evaluation Lab</span>
                </button>
              )}

              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0E1015] py-2.5 text-xs font-semibold text-[#F5F7FC]"
              >
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
