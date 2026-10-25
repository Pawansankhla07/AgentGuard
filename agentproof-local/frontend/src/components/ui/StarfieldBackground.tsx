import React, { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  z: number
  size: number
  baseAlpha: number
  twinkleSpeed: number
  color: string
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  active: boolean
}

// Pure monochromatic black & white starlight palette
const STAR_COLORS = ["#FFFFFF", "#F8FAFC", "#F1F5F9", "#E2E8F0", "#CBD5E1"]

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Generate 3D layered stars
    const STAR_COUNT = Math.min(Math.floor((width * height) / 3400), 300)
    const stars: Star[] = []

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.75 + 0.25,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      })
    }

    // Shooting stars
    const shootingStars: ShootingStar[] = []
    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.35,
        length: Math.random() * 85 + 45,
        speed: Math.random() * 7 + 5,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 0.9,
        active: true,
      })
    }

    let lastShootingStarTime = Date.now()
    let shootingStarInterval = Math.random() * 5000 + 4000

    let targetMouseX = 0
    let targetMouseY = 0
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.06
      targetMouseY = (e.clientY - height / 2) * 0.06
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("resize", handleResize)

    let time = 0

    const render = () => {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      // Render 3D Stars with monochromatic diamond glow
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        const k = 500 / star.z
        const px = star.x - mouseX * (1000 / star.z) + width / 2
        const py = star.y - mouseY * (1000 / star.z) + height / 2
        const size = star.size * k * 0.8

        const twinkle = Math.sin(time * 2 + i) * 0.35 + 0.65
        const alpha = Math.max(0, Math.min(1, star.baseAlpha * twinkle))

        if (px >= -20 && px <= width + 20 && py >= -20 && py <= height + 20) {
          ctx.beginPath()
          ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2)
          ctx.fillStyle = star.color
          ctx.globalAlpha = alpha
          ctx.shadowBlur = size > 1.1 ? 4 : 0
          ctx.shadowColor = "#FFFFFF"
          ctx.fill()
        }
      }

      // Check for shooting stars
      if (Date.now() - lastShootingStarTime > shootingStarInterval) {
        createShootingStar()
        lastShootingStarTime = Date.now()
        shootingStarInterval = Math.random() * 6000 + 4500
      }

      // Render Silver Shooting Stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        if (!s.active) {
          shootingStars.splice(i, 1)
          continue
        }

        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed
        s.opacity -= 0.014

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          s.active = false
          continue
        }

        const tailX = s.x - Math.cos(s.angle) * s.length
        const tailY = s.y - Math.sin(s.angle) * s.length

        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)")
        gradient.addColorStop(0.7, `rgba(226, 232, 240, ${s.opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.6
        ctx.lineCap = "round"
        ctx.globalAlpha = s.opacity
        ctx.shadowBlur = 8
        ctx.shadowColor = "#FFFFFF"
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Textured Black & Charcoal Shading Base */}
      <div className="absolute inset-0 bg-[#060709]" />

      {/* Monochromatic Shading & Soft White / Silver Light Bloom */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-white/[0.045] via-white/[0.015] to-transparent blur-[120px]" />
      
      {/* Subtle Charcoal Horizon Shading */}
      <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[110px]" />
      <div className="absolute bottom-10 left-10 h-[450px] w-[450px] rounded-full bg-white/[0.02] blur-[100px]" />

      {/* Monochromatic Fine Grain Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle Architectural Dot Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* 3D Monochromatic Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-85"
      />

      {/* Soft Vignette Shadows for Cinematic Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#000000_100%)] opacity-70" />
    </div>
  )
}
