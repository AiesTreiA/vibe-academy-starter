"use client"

import { useEffect, useRef, useState } from "react"

const STEPS = [
  "Analizando tu sector e industria...",
  "Identificando cuellos de botella en tu proceso...",
  "Calculando potencial de automatización...",
  "Estimando ahorro y ROI esperado...",
  "Generando propuesta de solución...",
  "Preparando tu roadmap personalizado...",
]

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  pulse: number
  pulseSpeed: number
}

interface Pulse {
  fromIdx: number
  toIdx: number
  progress: number
  speed: number
}

export function AIAnalysisLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [charIdx, setCharIdx] = useState(0)

  // Typewriter effect
  useEffect(() => {
    const target = STEPS[stepIdx]
    if (charIdx < target.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 28)
      return () => clearTimeout(t)
    }
  }, [charIdx, stepIdx])

  useEffect(() => {
    setDisplayText(STEPS[stepIdx].slice(0, charIdx))
  }, [charIdx, stepIdx])

  // Cycle steps
  useEffect(() => {
    const t = setInterval(() => {
      setStepIdx((i) => (i + 1) % STEPS.length)
      setCharIdx(0)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  // Neural network canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2

    // Create nodes in a loose cluster
    const count = 18
    const nodes: Node[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const dist = 50 + Math.random() * 80
      return {
        x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 30,
        y: cy + Math.sin(angle) * dist * 0.7 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 3 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.03 + Math.random() * 0.03,
      }
    })

    // Data pulses travelling along edges
    const pulses: Pulse[] = []
    for (let i = 0; i < 8; i++) {
      pulses.push({
        fromIdx: Math.floor(Math.random() * count),
        toIdx: Math.floor(Math.random() * count),
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
      })
    }

    const primaryColor = "99,102,241"   // indigo-500
    const accentColor  = "139,92,246"   // violet-500
    const glowColor    = "167,139,250"  // violet-400

    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      frame++

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        n.pulse += n.pulseSpeed
        // Gentle attraction to center
        n.vx += (cx - n.x) * 0.0003
        n.vy += (cy - n.y) * 0.0003
        // Clamp
        if (n.x < 20 || n.x > W - 20) n.vx *= -1
        if (n.y < 20 || n.y > H - 20) n.vy *= -1
      })

      // Draw edges between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.35
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${primaryColor},${alpha})`
            ctx.lineWidth = 0.8
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw data pulses
      pulses.forEach((p) => {
        p.progress += p.speed
        if (p.progress >= 1) {
          p.progress = 0
          p.fromIdx = p.toIdx
          p.toIdx = Math.floor(Math.random() * count)
        }
        const from = nodes[p.fromIdx]
        const to   = nodes[p.toIdx]
        const px = from.x + (to.x - from.x) * p.progress
        const py = from.y + (to.y - from.y) * p.progress

        const grad = ctx.createRadialGradient(px, py, 0, px, py, 6)
        grad.addColorStop(0, `rgba(${glowColor},0.9)`)
        grad.addColorStop(1, `rgba(${glowColor},0)`)
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach((n) => {
        const pulseFactor = 1 + Math.sin(n.pulse) * 0.25
        const r = n.r * pulseFactor

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4)
        grad.addColorStop(0, `rgba(${accentColor},0.5)`)
        grad.addColorStop(1, `rgba(${accentColor},0)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${primaryColor},0.9)`
        ctx.fill()
      })

      // Central scanning ring
      const scanR = 30 + ((frame * 1.2) % 80)
      const scanAlpha = Math.max(0, 0.6 - scanR / 110)
      ctx.beginPath()
      ctx.arc(cx, cy, scanR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${glowColor},${scanAlpha})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Central brain icon — glowing circle
      const brainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22)
      brainGrad.addColorStop(0, `rgba(${primaryColor},1)`)
      brainGrad.addColorStop(0.6, `rgba(${accentColor},0.8)`)
      brainGrad.addColorStop(1, `rgba(${accentColor},0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, 22, 0, Math.PI * 2)
      ctx.fillStyle = brainGrad
      ctx.fill()

      // AI text in center
      ctx.font = "bold 11px Inter, sans-serif"
      ctx.fillStyle = "rgba(255,255,255,0.95)"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("IA", cx, cy)

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      {/* Canvas neural network */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={280}
          height={220}
          className="opacity-90"
        />
        {/* Subtle glow behind canvas */}
        <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-3xl -z-10" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-0.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full"
            style={{
              width: `${((stepIdx + 1) / STEPS.length) * 100}%`,
              transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>Analizando</span>
          <span>{Math.round(((stepIdx + 1) / STEPS.length) * 100)}%</span>
        </div>
      </div>

      {/* Typewriter step text */}
      <div className="text-center max-w-xs min-h-[2.5rem]">
        <p className="text-sm font-medium text-foreground/80 leading-relaxed">
          {displayText}
          <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
        </p>
      </div>

      {/* Step dots */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width:  i === stepIdx ? "20px" : "6px",
              height: "6px",
              background: i <= stepIdx
                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                : "rgba(139,92,246,0.2)",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
