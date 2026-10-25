'use client'

import React from "react"
import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { ShieldCheck, Cpu, Sparkles } from "lucide-react"

export function SplineSceneBasic() {
  return (
    <Card className="w-full min-h-[500px] lg:h-[540px] bg-[#0A0C11]/90 border-white/10 relative overflow-hidden rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        size={500}
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center text-left">
          <div className="inline-flex items-center gap-2 mb-4 self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-mono font-medium text-white">
            <Sparkles className="h-3 w-3" />
            <span>INTERACTIVE WEBGL CANVAS</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Cinematic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-white drop-shadow-[0_0_16px_rgba(255,255,255,0.4)]">3D Agent</span> Environment
          </h2>
          
          <p className="mt-4 text-sm md:text-base text-neutral-300 leading-relaxed max-w-lg">
            Bring your AI governance to life with real-time 3D simulation.
            Explore agent action parameters, inspect policy containment boundaries,
            and interact directly with the security robot in an immersive 3D canvas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10131A] px-3.5 py-2 text-xs font-mono text-white">
              <Cpu className="h-4 w-4 text-white" />
              <span>Spline WebGL Core</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10131A] px-3.5 py-2 text-xs font-mono text-[#35C98A]">
              <ShieldCheck className="h-4 w-4 text-[#35C98A]" />
              <span>Air-Gapped Policy Mode</span>
            </div>
          </div>
        </div>

        {/* Right content: 3D Spline Scene */}
        <div className="flex-1 relative min-h-[360px] md:min-h-full">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
