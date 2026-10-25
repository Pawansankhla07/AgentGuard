import React, { useState } from "react"
import { Navbar, LandingTopic } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { DocsSection } from "@/components/landing/DocsSection"
import { AboutSection } from "@/components/landing/AboutSection"
import { Footer } from "@/components/landing/Footer"
import { SplineSceneBasic } from "@/components/ui/demo"
import { LivePolicyPlayground } from "@/components/landing/LivePolicyPlayground"
import { ChromeExtensionSection } from "@/components/landing/ChromeExtensionSection"
import { LiveTestingView } from "@/components/testing/LiveTestingView"
import { StarfieldBackground } from "@/components/ui/StarfieldBackground"
import { CosmicCursor } from "@/components/ui/CosmicCursor"
import { ArrowLeft, Sparkles, Layers, Zap, Box, BookOpen, Users, Chrome, ShieldAlert } from "lucide-react"

interface LandingPageProps {
  onOpenDashboard: () => void
  repoUrl?: string
}

export function LandingPage({
  onOpenDashboard,
  repoUrl = "https://github.com/shreyash-bhosale/AgentGuard",
}: LandingPageProps) {
  const [activeTopic, setActiveTopic] = useState<LandingTopic>("home")

  const handleSelectTopic = (topic: LandingTopic) => {
    setActiveTopic(topic)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen bg-[#060709] text-[#F5F7FC] selection:bg-white/20 selection:text-white">
      {/* 3D Monochromatic Starfield Background with Textured Black/White Shading */}
      <StarfieldBackground />

      {/* 3D Cosmic Starlight Cursor */}
      <CosmicCursor />

      {/* Sticky Top Navigation Bar (Identical Across All Pages) */}
      <Navbar
        activeTopic={activeTopic}
        onSelectTopic={handleSelectTopic}
        onOpenDashboard={onOpenDashboard}
        repoUrl={repoUrl}
      />

      {/* Main Container */}
      <main className="relative z-10">
        
        {/* ===================================================================== */}
        {/* PAGE 1: SHORT START PAGE (Home View)                                  */}
        {/* ===================================================================== */}
        {activeTopic === "home" && (
          <HeroSection
            onSelectTopic={handleSelectTopic}
            onOpenDashboard={onOpenDashboard}
            repoUrl={repoUrl}
          />
        )}

        {/* ===================================================================== */}
        {/* PAGE 2: GOVERNANCE & 4-STAGE CONTAINMENT                             */}
        {/* ===================================================================== */}
        {activeTopic === "governance" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <Layers className="h-4 w-4 text-white" />
                <span>PAGE: 4-STAGE GOVERNANCE</span>
              </div>
            </div>

            <FeaturesSection />
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE 3: LIVE POLICY PLAYGROUND                                        */}
        {/* ===================================================================== */}
        {activeTopic === "playground" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <Zap className="h-4 w-4 text-white" />
                <span>PAGE: INTERACTIVE POLICY SIMULATOR</span>
              </div>
            </div>

            <LivePolicyPlayground />
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE: LIVE TESTING WORKBENCH & FIXTURES                               */}
        {/* ===================================================================== */}
        {activeTopic === "testing" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <ShieldAlert className="h-4 w-4 text-white" />
                <span>PAGE: LIVE TESTING WORKBENCH & FIXTURES</span>
              </div>
            </div>

            <LiveTestingView />
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE: CHROME EXTENSION & WEBSITE SAFETY                               */}
        {/* ===================================================================== */}
        {activeTopic === "extension" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <Chrome className="h-4 w-4 text-white" />
                <span>PAGE: CHROME EXTENSION & LOGIN ADVISOR</span>
              </div>
            </div>

            <ChromeExtensionSection />
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE 4: 3D SECURITY STUDIO                                            */}
        {/* ===================================================================== */}
        {activeTopic === "studio" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <Box className="h-4 w-4 text-white" />
                <span>PAGE: 3D SPLINE WEBGL STUDIO</span>
              </div>
            </div>

            <section className="mx-auto max-w-7xl px-6 md:px-10">
              <SplineSceneBasic />
            </section>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE 5: DEVELOPER DOCUMENTATION                                       */}
        {/* ===================================================================== */}
        {activeTopic === "docs" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <BookOpen className="h-4 w-4 text-white" />
                <span>PAGE: DEVELOPER DOCUMENTATION</span>
              </div>
            </div>

            <DocsSection />
          </div>
        )}

        {/* ===================================================================== */}
        {/* PAGE 6: ABOUT AGENTGUARD & OPEN MISSION                               */}
        {/* ===================================================================== */}
        {activeTopic === "about" && (
          <div className="pt-28 pb-16">
            <div className="mx-auto max-w-7xl px-6 md:px-10 mb-8 flex items-center justify-between">
              <button
                onClick={() => handleSelectTopic("home")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0C11] px-4 py-2 text-xs font-mono text-[#A3A9B7] hover:text-[#F5F7FC] hover:border-white/25 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Home</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-white border border-white/15 bg-white/5 px-3 py-1 rounded-full">
                <Users className="h-4 w-4 text-white" />
                <span>PAGE: ABOUT & COMMUNITY</span>
              </div>
            </div>

            <AboutSection />
          </div>
        )}

      </main>

      {/* Footer (Identical Across All Pages) */}
      <div className="relative z-10">
        <Footer
          onNavigate={(topic) => handleSelectTopic(topic as LandingTopic)}
          onOpenDashboard={onOpenDashboard}
          repoUrl={repoUrl}
        />
      </div>
    </div>
  )
}
