import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { ShieldCheck, Lock, Sparkles, Cpu, Eye, RotateCw, Orbit } from "lucide-react"
import { SplineScene } from "@/components/ui/splite"

interface RobotCenterpieceProps {
  className?: string
  containerRef?: React.RefObject<HTMLDivElement | null>
}

const SPLINE_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"

export function RobotCenterpiece({ className = "", containerRef }: RobotCenterpieceProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [useSpline3D, setUseSpline3D] = useState(true)
  const internalRef = useRef<HTMLDivElement>(null)

  // Spring physics for smooth pointer tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const headRotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), {
    stiffness: 120,
    damping: 18,
  })
  const headRotateY = useSpring(useTransform(mouseX, [-400, 400], [-12, 12]), {
    stiffness: 120,
    damping: 18,
  })

  const eyeOffsetX = useSpring(useTransform(mouseX, [-400, 400], [-7, 7]), {
    stiffness: 200,
    damping: 22,
  })
  const eyeOffsetY = useSpring(useTransform(mouseY, [-300, 300], [-5, 5]), {
    stiffness: 200,
    damping: 22,
  })

  const handlePointerMove = useCallback(
    (e: MouseEvent) => {
      const target = containerRef?.current || internalRef.current
      if (!target) return
      const rect = target.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    },
    [containerRef, mouseX, mouseY]
  )

  useEffect(() => {
    const target = containerRef?.current || internalRef.current
    if (!target) return

    const onEnter = () => setIsHovered(true)
    const onMove = (e: MouseEvent) => handlePointerMove(e)
    const onLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
      setIsHovered(false)
    }

    target.addEventListener("mouseenter", onEnter)
    target.addEventListener("mousemove", onMove)
    target.addEventListener("mouseleave", onLeave)

    return () => {
      target.removeEventListener("mouseenter", onEnter)
      target.removeEventListener("mousemove", onMove)
      target.removeEventListener("mouseleave", onLeave)
    }
  }, [containerRef, handlePointerMove, mouseX, mouseY])

  // Realistic natural eye blinking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const triggerBlink = () => {
      setIsBlinking(true)
      setTimeout(() => {
        setIsBlinking(false)
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true)
            setTimeout(() => setIsBlinking(false), 120)
          }, 180)
        }
      }, 140)
      timeoutId = setTimeout(triggerBlink, 3200 + Math.random() * 2800)
    }
    timeoutId = setTimeout(triggerBlink, 3000)
    return () => clearTimeout(timeoutId)
  }, [])

  // Monochromatic Shaded Robot Fallback in Textured Black & White
  const FallbackRobot = (
    <motion.div
      style={{
        rotateX: headRotateX,
        rotateY: headRotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative flex flex-col items-center justify-center w-full max-w-[400px]"
    >
      {/* Antenna with pulsing monochromatic white beacon */}
      <div className="relative flex flex-col items-center">
        <div className="relative h-4 w-4 rounded-full bg-white shadow-[0_0_24px_#ffffff] animate-pulse">
          <div className="absolute inset-0 rounded-full bg-white opacity-90" />
          <span className="absolute -inset-1.5 rounded-full border border-white/60 animate-ping" />
        </div>
        <div className="h-6 w-1.5 bg-gradient-to-b from-[#E2E8F0] to-[#71717A] rounded-full" />
      </div>

      {/* Robot Head with pearl armor finish */}
      <div className="relative z-10 flex h-40 w-48 md:h-48 md:w-56 items-center justify-center rounded-[44px] border-2 border-white/25 bg-gradient-to-b from-[#FFFFFF] via-[#E4E4E7] to-[#71717A] shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_3px_6px_rgba(255,255,255,0.95)]">
        {/* Armor highlights */}
        <div className="absolute top-2.5 left-8 right-8 h-1 rounded-full bg-white/90" />
        
        {/* Left Ear Module */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-11 w-4.5 items-center justify-center rounded-l-full bg-[#111318] border-l border-y border-white/40 shadow-[-4px_0_16px_rgba(255,255,255,0.25)]">
          <div className="h-6 w-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
        </div>

        {/* Right Ear Module */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex h-11 w-4.5 items-center justify-center rounded-r-full bg-[#111318] border-r border-y border-white/40 shadow-[4px_0_16px_rgba(255,255,255,0.25)]">
          <div className="h-6 w-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
        </div>

        {/* Black Glass Visor Display */}
        <div className="relative flex h-26 w-38 md:h-30 md:w-44 items-center justify-center rounded-[32px] border border-white/15 bg-[#05070B] shadow-[inset_0_4px_20px_rgba(0,0,0,0.95)] overflow-hidden">
          {/* Curvature Reflection */}
          <div className="absolute -top-12 -left-12 h-32 w-48 rounded-full bg-white/12 blur-[1px] rotate-12 pointer-events-none" />

          {/* Pure White Illuminated Sensor Eyes */}
          <motion.div
            style={{ x: eyeOffsetX, y: eyeOffsetY }}
            className="flex items-center gap-7"
          >
            <div
              className={`relative flex items-center justify-center transition-all duration-100 ${
                isBlinking
                  ? "h-1 w-7 bg-white/50 rounded-full"
                  : isHovered
                  ? "h-8 w-8 rounded-full bg-white shadow-[0_0_28px_#ffffff,0_0_10px_#ffffff]"
                  : "h-7 w-7 rounded-full bg-white shadow-[0_0_22px_#ffffff]"
              }`}
            >
              {!isBlinking && (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-black/60" />
                  <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-white" />
                </>
              )}
            </div>

            <div
              className={`relative flex items-center justify-center transition-all duration-100 ${
                isBlinking
                  ? "h-1 w-7 bg-white/50 rounded-full"
                  : isHovered
                  ? "h-8 w-8 rounded-full bg-white shadow-[0_0_28px_#ffffff,0_0_10px_#ffffff]"
                  : "h-7 w-7 rounded-full bg-white shadow-[0_0_22px_#ffffff]"
              }`}
            >
              {!isBlinking && (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-black/60" />
                  <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-white" />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Body & Laptop with Shield */}
      <div className="relative -mt-2 flex flex-col items-center w-56 md:w-68 rounded-t-[38px] border border-white/20 bg-gradient-to-b from-[#F4F4F5] via-[#D4D4D8] to-[#71717A] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-2 rounded-full border border-black/20 bg-[#0A0D12] px-3.5 py-1 shadow-inner">
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          <span className="text-[10px] font-mono tracking-wider text-neutral-300 font-semibold">AGENTGUARD SEC</span>
        </div>

        {/* Laptop */}
        <div className="relative mt-2 flex flex-col items-center">
          <div className="relative flex h-14 w-40 md:h-16 md:w-48 items-center justify-center rounded-t-lg border-t border-x border-white/25 bg-gradient-to-b from-[#18181B] to-[#09090B] shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/30 text-white shadow-[0_0_14px_white]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="h-3.5 w-46 md:w-54 rounded-b-md bg-[#18181B] border-x border-b border-white/20 shadow-xl" />
        </div>
      </div>
      
      {/* Shadow */}
      <div className="h-3 w-64 rounded-full bg-black/90 blur-md -mt-1" />
    </motion.div>
  )

  return (
    <div
      ref={internalRef}
      className={`relative flex h-full w-full min-h-[460px] md:min-h-[520px] lg:min-h-[560px] items-center justify-center select-none ${className}`}
      aria-label="AgentGuard 3D Interactive Security Robot"
    >
      {/* Deep Space Monochromatic Atmosphere behind 3D Object */}
      <div className="pointer-events-none absolute h-[400px] w-[400px] md:h-[500px] md:w-[500px] rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent blur-[110px] -z-10 animate-pulse" />
      <div className="pointer-events-none absolute h-[280px] w-[280px] rounded-full bg-neutral-500/10 blur-[80px] -z-10" />

      {/* 3D Cosmic Orbital Ring 1 (Tilted Celestial Orbit) */}
      <div className="pointer-events-none absolute h-[480px] w-[480px] md:h-[560px] md:w-[560px] rounded-full border border-white/20 -z-5 [transform:rotateX(68deg)_rotateY(15deg)] animate-[spin_24s_linear_infinite]">
        <div className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_16px_white]" />
        <div className="absolute -bottom-1.5 left-1/4 h-2.5 w-2.5 rounded-full bg-neutral-300 shadow-[0_0_10px_white]" />
      </div>

      {/* 3D Cosmic Orbital Ring 2 (Counter-rotating dashed orbital path) */}
      <div className="pointer-events-none absolute h-[400px] w-[400px] md:h-[480px] md:w-[480px] rounded-full border border-dashed border-white/20 -z-5 [transform:rotateX(72deg)_rotateY(-25deg)] animate-[spin_32s_linear_infinite_reverse]">
        <div className="absolute top-1/3 -right-1 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_white]" />
      </div>

      {/* Floating Holographic Security HUD - Top Right */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-4 right-2 md:top-6 md:right-4 z-30 flex items-center gap-2.5 rounded-xl border border-white/20 bg-[#0B0D13]/90 px-3.5 py-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/25 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Guard State</div>
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            Air-Gapped Policy Active
          </div>
        </div>
      </motion.div>

      {/* Floating Holographic Security HUD - Bottom Left */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute bottom-6 left-2 md:bottom-8 md:left-4 z-30 flex items-center gap-2.5 rounded-xl border border-white/20 bg-[#0B0D13]/90 px-3.5 py-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/25 text-white">
          <Lock className="h-4 w-4" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Containment</div>
          <div className="text-xs font-semibold text-white">Zero Unauthorized Actions</div>
        </div>
      </motion.div>

      {/* Mode Switch Button (Top Left of 3D Canvas) */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={() => setUseSpline3D(!useSpline3D)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0B0D13]/80 px-3 py-1 text-[10px] font-mono font-medium text-white backdrop-blur-md hover:bg-white/15 transition-all shadow-sm"
          title="Switch 3D Scene Mode"
        >
          <RotateCw className="h-3 w-3 text-neutral-300" />
          <span>{useSpline3D ? "Spline 3D Active" : "Interactive Shield Mode"}</span>
        </button>
      </div>

      {/* Main 3D Canvas Container */}
      <div className="relative w-full h-full flex items-center justify-center z-10">
        {useSpline3D ? (
          <SplineScene
            scene={SPLINE_SCENE_URL}
            className="w-full h-full min-h-[460px] md:min-h-[520px]"
            fallbackComponent={FallbackRobot}
          />
        ) : (
          FallbackRobot
        )}
      </div>
    </div>
  )
}
