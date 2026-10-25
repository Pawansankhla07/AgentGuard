import React, { useEffect, useState, useRef } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  alpha: number
  vx: number
  vy: number
}

export function CosmicCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring physics for smooth cursor aura
  const cursorX = useSpring(mouseX, { stiffness: 450, damping: 28 })
  const cursorY = useSpring(mouseY, { stiffness: 450, damping: 28 })

  // Trailing larger glow
  const haloX = useSpring(mouseX, { stiffness: 180, damping: 22 })
  const haloY = useSpring(mouseY, { stiffness: 180, damping: 22 })

  useEffect(() => {
    // Check if touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true)
      return
    }

    let particleId = 0
    let lastX = -100
    let lastY = -100

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      // Check if hovering clickable element
      const target = e.target as HTMLElement | null
      const isClickable = Boolean(
        target?.closest("button, a, input, select, textarea, [role='button']")
      )
      setIsPointer(isClickable)

      // Add silver stardust particles on movement
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY)
      if (dist > 8 && particlesRef.current.length < 35) {
        particlesRef.current.push({
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 3 + 1,
          alpha: 0.8,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4,
        })
        lastX = e.clientX
        lastY = e.clientY
      }
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    // Canvas particle render loop
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    let animId: number

    const renderParticles = () => {
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const particles = particlesRef.current

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha -= 0.024
          p.size *= 0.96

          if (p.alpha <= 0 || p.size <= 0.4) {
            particles.splice(i, 1)
            continue
          }

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(245, 247, 252, ${p.alpha})`
          ctx.shadowBlur = 6
          ctx.shadowColor = "#FFFFFF"
          ctx.fill()
        }
      }
      animId = requestAnimationFrame(renderParticles)
    }

    renderParticles()

    // Resize canvas
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("resize", handleResize)
    }
  }, [mouseX, mouseY])

  if (isTouchDevice) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Particle Canvas for Silver Stardust Trail */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Trailing Silver Magnetic Halo */}
      <motion.div
        style={{
          x: haloX,
          y: haloY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className={`absolute rounded-full border transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${
          isPointer
            ? "h-12 w-12 border-white/60 bg-white/10 shadow-[0_0_24px_rgba(255,255,255,0.4)]"
            : "h-8 w-8 border-white/20 bg-white/5 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
        }`}
      />

      {/* Core Glowing Starlight Cursor Dot */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className={`absolute rounded-full bg-white shadow-[0_0_12px_#FFF] transition-all duration-150 ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${isPointer ? "h-2.5 w-2.5 bg-white" : "h-1.5 w-1.5"}`}
      />
    </div>
  )
}
