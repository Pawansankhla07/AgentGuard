"use client"

import * as React from "react"

/**
 * Robot Tear Reveal: A textured black & white security poster that rips in two as you scroll or hover.
 *
 * In place of the tiger, the AgentGuard Security Robot emerges from behind the torn paper:
 * - Pearl-metallic chassis with precision bevels and specular sheen
 * - Cybernetic antenna beacon with pulsing halo
 * - Deep dark glass visor
 * - Dual ocular scanners that track your pointer in real-time, blink, and squint when clicked
 * - Fully textured black & white monochrome aesthetics
 */

export interface RobotTearRevealProps {
  /** The big word that gets torn. Defaults to "SAFER" */
  word?: string
  /** Small line above the word. Defaults to "AGENTGUARD PLATFORM" */
  tagline?: string
  /** Sub-word / suffix displayed beside or beneath */
  suffix?: string
  /** Word color (defaults to crisp white) */
  ink?: string
  /** Paper color, the sheet that tears (textured obsidian black) */
  paper?: string
  /** Tagline color (silver/monochrome) */
  taglineColor?: string
  /** Eye / visor glow color (pure white) */
  eyeColor?: string
  /** Height of the pinned stage */
  height?: string
  /** Extra scroll distance the tear plays over */
  scrollDistance?: string
  /** 0..1. Drive the tear manually instead of from scroll */
  progress?: number
  /** Show the "scroll" hint */
  hint?: boolean
  /** Allow hover / drag interaction to pull apart tear */
  interactive?: boolean
  /** Extra root class names */
  className?: string
}

export type Pt = [number, number]

/** Seeded PRNG (mulberry32) */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp01 = (x: number) => (x <= 0 ? 0 : x > 1 ? 1 : x)

export function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function easeOutBack(t: number) {
  const c = 1.70158
  const u = clamp01(t) - 1
  return 1 + (c + 1) * u * u * u + c * u * u
}

export function scrollProgress(top: number, height: number, viewport: number) {
  const range = height - viewport
  if (range <= 0) return top <= 0 ? 1 : 0
  return clamp01(-top / range)
}

export function stages(p: number) {
  return {
    crack: smooth(0.02, 0.18, p),
    open: smooth(0.12, 0.65, p),
    rise: smooth(0.2, 0.75, p),
    pop: smooth(0.48, 0.85, p),
    shake: smooth(0.12, 0.22, p) * (1 - smooth(0.25, 0.38, p)),
  }
}

export function tearLine(
  seed = 17,
  from = -800,
  to = 1800,
  step = 10,
  cx = 500,
  cy = 280,
  angle = -5
): Pt[] {
  const r = rng(seed)
  const slope = Math.tan((angle * Math.PI) / 180)
  const out: Pt[] = []
  for (let x = from; x <= to; x += step) {
    const fibre = (r() - 0.5) * 5.5
    const tooth = r() < 0.1 ? (r() - 0.5) * 24 : 0
    const wander =
      Math.sin(x * 0.018 + seed) * 9 + Math.sin(x * 0.05 + seed * 2) * 4
    out.push([x, cy + (x - cx) * slope + wander + fibre + tooth])
  }
  return out
}

export function pieceMotion(open: number) {
  return {
    top: { dx: -12 * open, dy: -90 * open, rot: -2.8 * open },
    bottom: { dx: 14 * open, dy: 88 * open, rot: 2.3 * open },
  }
}

export function fibreWidths(n: number, open: number, seed = 7) {
  const r = rng(seed)
  const k = Math.min(1, open * 4.5)
  return Array.from(
    { length: n },
    (_, i) =>
      k *
      (2.5 +
        6 *
          (0.5 + 0.5 * Math.sin(i * 0.35 + seed)) *
          (0.6 + r() * 0.8))
  )
}

const VIEW_W = 1000
const CX = 500
const CY = 280
const FAR = 4000
const FRAME = "20 20 960 520"

const d = (pts: Pt[], close = true) =>
  "M" +
  pts.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join("L") +
  (close ? "Z" : "")

/** Paper curl points along tear */
const CURLS: Record<"top" | "bottom", [number, number, number][]> = {
  top: [
    [280, 48, 28],
    [540, 34, 20],
    [780, 56, 32],
  ],
  bottom: [
    [190, 52, 30],
    [450, 36, 22],
    [710, 44, 26],
  ],
}

/** SVG Robot Component behind the tear */
const SecurityRobotSVG = React.memo(function SecurityRobotSVG({
  id,
  look,
  blink,
  squint,
  pop,
}: {
  id: string
  look: Pt
  blink: number
  squint: number
  pop: number
}) {
  const lx = look[0] * 16
  const ly = look[1] * 10
  const eyeHeight = Math.max(2, 28 * (1 - blink) * (1 - squint * 0.5))
  const eyeScale = 0.9 + 0.1 * pop

  return (
    <g transform="translate(0, 0)">
      {/* Background radial spotlight behind robot */}
      <circle cx={0} cy={-20} r={280} fill={"url(#" + id + "-halo)"} opacity={0.6} />

      {/* Cybernetic Grid Matrix backdrop */}
      <g opacity={0.12} stroke="#ffffff" strokeWidth={1}>
        {[-220, -140, -60, 20, 100, 180, 260].map((x, i) => (
          <line key={"vx" + i} x1={x} y1={-260} x2={x} y2={240} />
        ))}
        {[-220, -150, -80, -10, 60, 130, 200].map((y, i) => (
          <line key={"hy" + i} x1={-280} y1={y} x2={280} y2={y} />
        ))}
      </g>

      {/* Antenna Beacon */}
      <g transform="translate(0, -180)">
        <line x1={0} y1={0} x2={0} y2={45} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
        <circle cx={0} cy={0} r={12} fill="#ffffff" filter={"url(#" + id + "-glow)"} />
        <circle cx={0} cy={0} r={22} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.4} />
      </g>

      {/* Robot Head Outer Chassis with rounded corners & bevel */}
      <g filter={"url(#" + id + "-drop)"}>
        {/* Shadow base */}
        <rect
          x={-190}
          y={-140}
          width={380}
          height={280}
          rx={60}
          fill="#0c0d12"
          stroke="#3f3f46"
          strokeWidth={4}
        />

        {/* Armor Plate Gradient */}
        <rect
          x={-184}
          y={-134}
          width={368}
          height={268}
          rx={54}
          fill={"url(#" + id + "-armor)"}
        />

        {/* Upper Specular Bevel Line */}
        <path
          d="M -140 -126 L 140 -126"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.8}
        />

        {/* Cyber Ear Pod Left */}
        <rect x={-214} y={-45} width={24} height={90} rx={10} fill="#18181b" stroke="#71717a" strokeWidth={2} />
        <rect x={-208} y={-25} width={10} height={50} rx={5} fill="#ffffff" opacity={0.7} />

        {/* Cyber Ear Pod Right */}
        <rect x={190} y={-45} width={24} height={90} rx={10} fill="#18181b" stroke="#71717a" strokeWidth={2} />
        <rect x={198} y={-25} width={10} height={50} rx={5} fill="#ffffff" opacity={0.7} />

        {/* Visor Recessed Frame */}
        <rect
          x={-145}
          y={-85}
          width={290}
          height={170}
          rx={40}
          fill="#030407"
          stroke="#27272a"
          strokeWidth={3}
        />

        {/* Visor Glass Inner Sheen */}
        <path
          d="M -130 -75 Q 0 -95 130 -75 L 115 -20 Q 0 -40 -115 -20 Z"
          fill="#ffffff"
          opacity={0.08}
        />

        {/* Left Ocular Sensor / Eye */}
        <g transform={`translate(-64, -2) scale(${eyeScale})`}>
          {/* Eye Socket Glow */}
          <ellipse cx={0} cy={0} rx={42} ry={26} fill="#090a0f" stroke="#3f3f46" strokeWidth={2} />
          
          {/* Eye Lens */}
          <g transform={`translate(${lx.toFixed(2)}, ${ly.toFixed(2)})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={28}
              ry={eyeHeight}
              fill={"url(#" + id + "-eye-lens)"}
              filter={"url(#" + id + "-glow)"}
            />
            {blink < 0.7 && (
              <>
                <circle cx={-5} cy={-4} r={6} fill="#ffffff" opacity={0.95} />
                <circle cx={6} cy={5} r={2.5} fill="#ffffff" opacity={0.8} />
              </>
            )}
          </g>
        </g>

        {/* Right Ocular Sensor / Eye */}
        <g transform={`translate(64, -2) scale(${eyeScale})`}>
          {/* Eye Socket Glow */}
          <ellipse cx={0} cy={0} rx={42} ry={26} fill="#090a0f" stroke="#3f3f46" strokeWidth={2} />
          
          {/* Eye Lens */}
          <g transform={`translate(${lx.toFixed(2)}, ${ly.toFixed(2)})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={28}
              ry={eyeHeight}
              fill={"url(#" + id + "-eye-lens)"}
              filter={"url(#" + id + "-glow)"}
            />
            {blink < 0.7 && (
              <>
                <circle cx={-5} cy={-4} r={6} fill="#ffffff" opacity={0.95} />
                <circle cx={6} cy={5} r={2.5} fill="#ffffff" opacity={0.8} />
              </>
            )}
          </g>
        </g>

        {/* Mouth Audio / Frequency Bar Array */}
        <g transform="translate(0, 105)" opacity={0.7}>
          {[-45, -30, -15, 0, 15, 30, 45].map((pos, i) => (
            <rect
              key={i}
              x={pos - 3}
              y={-4}
              width={6}
              height={8 + Math.sin(i * 1.2) * 4}
              rx={2}
              fill="#ffffff"
            />
          ))}
        </g>
      </g>
    </g>
  )
})

export default function RobotTearReveal({
  word = "SAFER",
  tagline = "AGENTGUARD SECURITY PLATFORM",
  suffix = "AI AGENTS",
  ink = "#FFFFFF",
  paper = "#08090C",
  taglineColor = "#94A3B8",
  eyeColor = "#FFFFFF",
  height = "380px",
  scrollDistance = "240px",
  progress,
  hint = false,
  interactive = true,
  className = "",
}: RobotTearRevealProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const id = "rtr" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const line = React.useMemo(() => tearLine(), [])
  const [f, setF] = React.useState({ p: progress ?? 0, look: [0, 0] as Pt, blink: 0, squint: 0 })
  const [isHovering, setIsHovering] = React.useState(false)

  const controlled = progress !== undefined
  const pointer = React.useRef<{ x: number; y: number } | null>(null)
  const squintAt = React.useRef(-1e9)

  React.useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    let raf = 0
    let visible = true
    let p = progress ?? 0
    let look: Pt = [0, 0]
    let idle: Pt = [0, 0]
    let nextIdle = 0
    let nextBlink = performance.now() + 2500

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(tick)
    })
    io.observe(root)

    function tick(now: number) {
      raf = 0
      if (!visible) return

      let target = controlled
        ? clamp01(progress ?? 0)
        : scrollProgress(
            root!.getBoundingClientRect().top,
            root!.offsetHeight,
            stage!.offsetHeight
          )

      // If interactive hover is enabled and user hovers, gently peel open
      if (interactive && isHovering && !controlled && target < 0.45) {
        target = 0.55
      }

      p = p + (target - p) * 0.12
      if (Math.abs(target - p) < 0.0005) p = target

      let want: Pt
      if (pointer.current) {
        const r = stage!.getBoundingClientRect()
        want = [
          Math.max(-1, Math.min(1, (pointer.current.x - r.left - r.width / 2) / (r.width * 0.35))),
          Math.max(-1, Math.min(1, (pointer.current.y - r.top - r.height * 0.5) / (r.height * 0.35))),
        ]
      } else {
        if (now > nextIdle) {
          const g = rng(Math.floor(now))
          idle = [(g() - 0.5) * 1.2, (g() - 0.5) * 0.7]
          nextIdle = now + 1600 + g() * 2000
        }
        want = idle
      }
      look = [look[0] + (want[0] - look[0]) * 0.14, look[1] + (want[1] - look[1]) * 0.14]

      let blink = 0
      const since = now - nextBlink
      if (since > 0) {
        blink = since < 90 ? since / 90 : since < 200 ? 1 - (since - 90) / 110 : 0
        if (since > 200) nextBlink = now + 2600 + Math.random() * 3000
      }
      const squint = Math.max(0, 1 - (now - squintAt.current) / 800)

      setF({ p, look, blink, squint })
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [controlled, progress, interactive, isHovering])

  const s = stages(f.p)
  const pop = easeOutBack(s.pop)
  const rise = (1 - s.rise) * 140
  const shake = Math.sin(f.p * 800) * 5 * s.shake
  const crackReach = s.crack * 600
  const crack = line.filter(([x]) => Math.abs(x - CX) <= crackReach)

  const robotTransform =
    "translate(" + CX + " " + (CY + rise - 10).toFixed(2) + ") scale(" + (1.1 - 0.05 * s.rise).toFixed(4) + ")"

  const Half = ({
    side,
    children,
  }: {
    side: "top" | "bottom"
    children: React.ReactNode
  }) => {
    const up = side === "top"
    const m = pieceMotion(s.open)[side]
    const shape = up
      ? [[line[0][0], -FAR] as Pt, [line[line.length - 1][0], -FAR] as Pt, ...[...line].reverse()]
      : [...line, [line[line.length - 1][0], FAR] as Pt, [line[0][0], FAR] as Pt]
    const widths = fibreWidths(line.length, s.open, up ? 5 : 8)
    const core = line.concat(line.map(([x, y], i) => [x, y + (up ? -widths[i] : widths[i])] as Pt).reverse())
    const curls = CURLS[side].map(([cx, hw, depth]) => {
      const pts = line.filter(([x]) => Math.abs(x - cx) <= hw)
      const back = pts.map(([x, y]) => {
        const sine = Math.cos(((x - cx) / hw) * (Math.PI / 2))
        return [
          x + (up ? 5 : -5) * sine * s.open,
          y + (up ? 1 : -1) * depth * sine * sine * Math.min(1, s.open * 2.5),
        ] as Pt
      })
      return d(pts.concat(back.reverse()))
    })
    const transform =
      "translate(" + m.dx.toFixed(2) + " " + m.dy.toFixed(2) + ") rotate(" + m.rot.toFixed(3) + " " + CX + " " + CY + ")"
    const clip = id + "-" + side

    return (
      <g transform={transform}>
        {s.open > 0 ? (
          <path
            d={d(line, false)}
            fill="none"
            stroke="#000000"
            strokeOpacity={0.8 * Math.min(1, s.open * 3)}
            strokeWidth={24}
            transform={"translate(0 " + (up ? 12 : -12) + ")"}
            filter={"url(#" + id + "-soft)"}
          />
        ) : null}
        <clipPath id={clip}>
          <path d={d(shape)} />
        </clipPath>
        <g clipPath={"url(#" + clip + ")"}>{children}</g>
        {s.open > 0 ? (
          <>
            <path d={d(core)} fill="#ffffff" opacity={0.92} />
            {curls.map((c, i) => (
              <path key={i} d={c} fill={"url(#" + id + "-curl-" + side + ")"} stroke="#ffffff" strokeWidth={1} />
            ))}
          </>
        ) : null}
      </g>
    )
  }

  const sheet = (
    <>
      {/* Textured dark paper base */}
      <rect x={-FAR} y={-FAR} width={FAR * 2 + VIEW_W} height={FAR * 2} fill={paper} />
      
      {/* Noise grain / mesh texture grid */}
      <rect
        x={0}
        y={0}
        width={VIEW_W}
        height={600}
        fill={"url(#" + id + "-paper-grid)"}
        opacity={0.35}
      />

      {/* Small Tagline above headline */}
      {tagline && (
        <text
          x={CX}
          y={140}
          textAnchor="middle"
          fill={taglineColor}
          style={{
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "0.32em",
          }}
        >
          {tagline}
        </text>
      )}

      {/* Main Big Word */}
      <text
        x={CX}
        y={330}
        textAnchor="middle"
        textLength={860}
        lengthAdjust="spacingAndGlyphs"
        fill={ink}
        style={{
          fontFamily: '"Impact", "Anton", "Bebas Neue", sans-serif',
          fontSize: "210px",
          fontWeight: 900,
          letterSpacing: "0.02em",
        }}
      >
        {word}
      </text>

      {/* Sub-label under big word */}
      {suffix && (
        <text
          x={CX}
          y={400}
          textAnchor="middle"
          fill="#A1A1AA"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "26px",
            fontWeight: 600,
            letterSpacing: "0.45em",
          }}
        >
          {suffix}
        </text>
      )}
    </>
  )

  return (
    <div
      ref={rootRef as any}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        height: controlled ? height : `calc(${height} + ${scrollDistance})`,
        background: "transparent",
      }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 w-full overflow-hidden flex items-center justify-center cursor-pointer"
        style={{ height }}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => {
          setIsHovering(false)
          pointer.current = null
        }}
        onPointerMove={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
        onPointerDown={() => s.pop > 0.3 && (squintAt.current = performance.now())}
      >
        <svg
          viewBox={FRAME}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${word} ${suffix} — torn reveal exposing the AgentGuard security robot`}
          className="w-full h-full block max-w-5xl mx-auto"
        >
          <defs>
            {/* Paper Texture Pattern */}
            <pattern id={id + "-paper-grid"} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
              <circle cx="20" cy="20" r="1" fill="#ffffff" opacity="0.15" />
            </pattern>

            {/* Halo behind robot */}
            <radialGradient id={id + "-halo"} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
              <stop offset="60%" stopColor="#71717a" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#000000" stopOpacity={0} />
            </radialGradient>

            {/* Robot Armor Gradient */}
            <linearGradient id={id + "-armor"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" />
              <stop offset="35%" stopColor="#a1a1aa" />
              <stop offset="85%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>

            {/* Eye Lens Glow Gradient */}
            <radialGradient id={id + "-eye-lens"}>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#e4e4e7" />
              <stop offset="80%" stopColor="#71717a" />
              <stop offset="100%" stopColor="#18181b" />
            </radialGradient>

            {/* Torn Paper Curls */}
            <linearGradient id={id + "-curl-top"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
            <linearGradient id={id + "-curl-bottom"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>

            {/* Filters */}
            <filter id={id + "-soft"} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <filter id={id + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={id + "-drop"} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          <g transform={`translate(${shake.toFixed(2)}, ${(shake * 0.4).toFixed(2)})`}>
            {/* Behind paper: Security Robot rising */}
            {s.open > 0 && (
              <g transform={robotTransform}>
                <SecurityRobotSVG
                  id={id}
                  look={f.look}
                  blink={f.blink}
                  squint={f.squint}
                  pop={pop}
                />
              </g>
            )}

            {/* Torn paper sheets */}
            {s.open > 0 ? (
              <>
                <Half side="top">{sheet}</Half>
                <Half side="bottom">{sheet}</Half>
              </>
            ) : (
              sheet
            )}

            {/* Pre-tear jagged crack */}
            {s.crack > 0 && s.open < 0.15 && crack.length > 1 && (
              <path
                d={d(crack, false)}
                fill="none"
                stroke="#ffffff"
                strokeWidth={2.4}
                strokeLinejoin="bevel"
                opacity={1 - s.open / 0.15}
              />
            )}
          </g>
        </svg>

        {/* Subtle interactive indicator */}
        <div className="pointer-events-none absolute bottom-2 inset-x-0 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          <span>Tear to Reveal Security Robot</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        </div>
      </div>
    </div>
  )
}
