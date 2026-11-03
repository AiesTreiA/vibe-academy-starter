"use client"

import React, { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
  isTrail?: boolean
  // Bracket magnet properties
  targetX?: number
  targetY?: number
  isMagnetized?: boolean
}

interface Ripple {
  x: number
  y: number
  r: number
  maxR: number
  speed: number
  force: number
}

export function AntigravityParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Track mouse coordinates, previous coordinates, speed, activity state, and idle time
  const mouseRef = useRef({
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    active: false,
    lastMoveTime: Date.now(),
  })

  // List of active shockwave ripples
  const ripplesRef = useRef<Ripple[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Generate bracket targets
    let bracketTargets: { x: number; y: number }[] = []
    
    const updateBracketTargets = (w: number, h: number) => {
      const targets = []
      const cy = h / 2
      
      // Responsive layout offsets for brackets
      const offset = Math.min(260, w * 0.22)
      const lcx = w / 2 - offset
      const rcx = w / 2 + offset
      
      const pointsCount = 40
      
      // Left Bracket {
      for (let i = 0; i < pointsCount; i++) {
        const t = (i / (pointsCount - 1)) * 2 - 1 // -1 to 1
        const y = cy + t * 180
        
        let dx = -45
        if (Math.abs(t) > 0.8) {
          // Curled ends
          const curlt = (Math.abs(t) - 0.8) / 0.2
          dx = -45 + curlt * curlt * 35
        } else if (Math.abs(t) < 0.15) {
          // Middle notch tip
          const notch = (0.15 - Math.abs(t)) / 0.15
          dx = -45 - notch * 20
        }
        
        targets.push({ x: lcx + dx, y })
      }

      // Right Bracket }
      for (let i = 0; i < pointsCount; i++) {
        const t = (i / (pointsCount - 1)) * 2 - 1
        const y = cy + t * 180
        
        let dx = 45
        if (Math.abs(t) > 0.8) {
          const curlt = (Math.abs(t) - 0.8) / 0.2
          dx = 45 - curlt * curlt * 35
        } else if (Math.abs(t) < 0.15) {
          const notch = (0.15 - Math.abs(t)) / 0.15
          dx = 45 + notch * 20
        }
        
        targets.push({ x: rcx + dx, y })
      }
      
      bracketTargets = targets
    }

    updateBracketTargets(width, height)

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      updateBracketTargets(width, height)
    }
    window.addEventListener("resize", handleResize)

    // Setup base floating particles (120 particles for density)
    const baseParticlesCount = 120
    const particles: Particle[] = []

    // Universal palette optimized for dark and light backgrounds
    const colors = [
      "rgba(59, 130, 246,",  // Indigo blue
      "rgba(139, 92, 246,", // Neon violet
      "rgba(249, 115, 22,",  // Sunset orange
    ]

    const createBaseParticle = (xPos?: number, yPos?: number): Particle => {
      const randColor = colors[Math.floor(Math.random() * colors.length)]
      return {
        x: xPos ?? Math.random() * width,
        y: yPos ?? Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 4 + 1.5,
        color: randColor,
        alpha: Math.random() * 0.35 + 0.15,
        decay: 0.0004,
      }
    }

    for (let i = 0; i < baseParticlesCount; i++) {
      particles.push(createBaseParticle())
    }

    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      
      const mouse = mouseRef.current
      mouse.px = mouse.x
      mouse.py = mouse.y
      mouse.x = mx
      mouse.y = my
      mouse.vx = mx - mouse.px
      mouse.vy = my - mouse.py
      mouse.active = true
      mouse.lastMoveTime = Date.now()

      // Create interactive water trail particles on fast movement
      const dist = Math.hypot(mouse.vx, mouse.vy)
      if (dist > 4) {
        const count = Math.min(4, Math.floor(dist / 4))
        for (let k = 0; k < count; k++) {
          const t = k / count
          const interpolatedX = mouse.px + mouse.vx * t
          const interpolatedY = mouse.py + mouse.vy * t

          const randColor = colors[Math.floor(Math.random() * colors.length)]
          particles.push({
            x: interpolatedX + (Math.random() - 0.5) * 12,
            y: interpolatedY + (Math.random() - 0.5) * 12,
            vx: mouse.vx * 0.2 + (Math.random() - 0.5) * 1.5,
            vy: mouse.vy * 0.2 + (Math.random() - 0.5) * 1.5,
            size: Math.random() * 2.5 + 1,
            color: randColor,
            alpha: 0.65,
            decay: Math.random() * 0.012 + 0.007,
            isTrail: true,
          })
        }
      }
    }

    // Mouse click shockwave ripple trigger
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      
      ripplesRef.current.push({
        x: mx,
        y: my,
        r: 0,
        maxR: 350,
        speed: 6.5,
        force: 9,
      })
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseleave", handleMouseLeave)

    // Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      
      const mouse = mouseRef.current
      const isIdle = Date.now() - mouse.lastMoveTime > 2000 // idle for more than 2 seconds
      
      // Update Shockwave ripples
      const ripples = ripplesRef.current
      for (let j = ripples.length - 1; j >= 0; j--) {
        const r = ripples[j]
        r.r += r.speed

        // Optional: Draw a subtle expanding shockwave ring
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - r.r / r.maxR) * 0.12})`
        ctx.lineWidth = 4
        ctx.stroke()

        if (r.r >= r.maxR) {
          ripples.splice(j, 1)
        }
      }

      // Draw interactive radial hover glow
      if (mouse.active && !isIdle) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          350
        )
        gradient.addColorStop(0, "rgba(224, 231, 255, 0.25)")
        gradient.addColorStop(0.4, "rgba(243, 244, 246, 0.03)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      // Update and render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // 1. Process active ripples shockwave physics
        for (const rip of ripples) {
          const rDist = Math.hypot(p.x - rip.x, p.y - rip.y)
          const diff = Math.abs(rDist - rip.r)
          if (diff < 22) {
            const angle = Math.atan2(p.y - rip.y, p.x - rip.x)
            const push = (1 - diff / 22) * rip.force
            p.vx += Math.cos(angle) * push
            p.vy += Math.sin(angle) * push
          }
        }

        // 2. Liquid-like mouse interaction physics (radius 400px)
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.hypot(dx, dy)

        if (mouse.active && dist < 400 && !isIdle && !p.isTrail) {
          const force = (400 - dist) / 400
          
          // Tangent (swirl) vector
          const tx = -dy / (dist || 1)
          const ty = dx / (dist || 1)
          
          // Swirling pull + transfer cursor velocity
          p.vx += mouse.vx * force * 0.12 + tx * force * 0.2
          p.vy += mouse.vy * force * 0.12 + ty * force * 0.2
          
          // Damp speeds to avoid explosion
          p.vx *= 0.94
          p.vy *= 0.94
        }

        // 3. Magnetic target coordinate locking for code brackets
        if (isIdle && !p.isTrail && i < bracketTargets.length) {
          const target = bracketTargets[i]
          p.targetX = target.x
          p.targetY = target.y
          p.isMagnetized = true

          const tx = p.targetX - p.x
          const ty = p.targetY - p.y
          const targetDist = Math.hypot(tx, ty)
          
          if (targetDist > 1) {
            p.vx += (tx / targetDist) * 0.25
            p.vy += (ty / targetDist) * 0.25
            // High friction once close to locking
            p.vx *= 0.88
            p.vy *= 0.88
          }
        } else {
          p.isMagnetized = false
        }

        // Apply velocities to positions
        p.x += p.vx
        p.y += p.vy

        // Floating ambient friction
        if (!p.isTrail) {
          p.vx *= 0.985
          p.vy *= 0.985

          // Ambient noise drift
          p.vx += (Math.random() - 0.5) * 0.05
          p.vy += (Math.random() - 0.5) * 0.05

          // Boundary bounce with friction
          if (p.x < 0) { p.x = 0; p.vx *= -0.5 }
          if (p.x > width) { p.x = width; p.vx *= -0.5 }
          if (p.y < 0) { p.y = 0; p.vy *= -0.5 }
          if (p.y > height) { p.y = height; p.vy *= -0.5 }
        } else {
          // Trail particles fade
          p.alpha -= p.decay
        }

        // Render particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)

        // Magnetized brackets particles are slightly brighter and more opaque
        const finalAlpha = p.isMagnetized 
          ? Math.max(0.6, p.alpha * 1.5).toFixed(2)
          : p.alpha.toFixed(2)

        ctx.fillStyle = `${p.color}${finalAlpha})`
        
        // Add subtle shadow glows for premium contrast
        ctx.shadowBlur = p.isMagnetized ? 6 : p.isTrail ? 8 : 2
        ctx.shadowColor = p.color + "0.4)"
        
        ctx.fill()
        ctx.shadowBlur = 0 // reset shadow

        // Remove dead trail particles
        if (p.isTrail && p.alpha <= 0) {
          particles.splice(i, 1)
        }
      }

      // Maintain baseline floating count
      const activeBaseCount = particles.filter((p) => !p.isTrail).length
      if (activeBaseCount < baseParticlesCount) {
        particles.push(createBaseParticle())
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-transparent"
    />
  )
}
