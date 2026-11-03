"use client"

import React, { useRef, useEffect, useState } from "react"

interface ImageToParticlesProps {
  src: string
  alt: string
  className?: string
  gridSpacing?: number // spacing of particles
  particleRadius?: number // multiplier for size
}

export function ImageToParticles({
  src,
  alt,
  className = "",
  gridSpacing = 5,
  particleRadius = 1.2
}: ImageToParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse coords relative to canvas bounds
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    let animationFrameId: number
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src

    interface Particle {
      x: number // original target x
      y: number // original target y
      px: number // current physical x
      py: number // current physical y
      vx: number // velocity x
      vy: number // velocity y
      color: string
      size: number
    }

    let particles: Particle[] = []

    img.onload = () => {
      setImageLoaded(true)
      initParticles()
    }

    const initParticles = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      // Set canvas render resolution matching CSS size
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      // Create an offscreen canvas to sample the image pixels
      const offscreen = document.createElement("canvas")
      const sampleWidth = 185 // higher resolution for detailed particle grid
      const sampleHeight = Math.round((img.height / img.width) * sampleWidth)
      offscreen.width = sampleWidth
      offscreen.height = sampleHeight

      const offCtx = offscreen.getContext("2d")
      if (!offCtx) return

      offCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight)
      const imgData = offCtx.getImageData(0, 0, sampleWidth, sampleHeight)
      const data = imgData.data

      particles = []

      // Calculate scale to fit sample grid into the canvas dimensions
      const scaleX = rect.width / sampleWidth
      const scaleY = rect.height / sampleHeight

      for (let y = 0; y < sampleHeight; y += 1) {
        for (let x = 0; x < sampleWidth; x += 1) {
          const idx = (y * sampleWidth + x) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const a = data[idx + 3]

          if (a > 50) { // filter transparent pixels
            // Map coordinates to canvas display space
            const targetX = x * scaleX + scaleX / 2
            const targetY = y * scaleY + scaleY / 2

            // Calculate dot size based on pixel brightness (halftone look)
            const brightness = (r + g + b) / 3
            const size = (brightness / 255) * particleRadius + 0.8

            // Stagger spawn positions randomly for an organic loading entrance
            particles.push({
              x: targetX,
              y: targetY,
              px: targetX + (Math.random() - 0.5) * 50,
              py: targetY + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              color: `rgb(${r}, ${g}, ${b})`,
              size: size
            })
          }
        }
      }
    }

    const handleResize = () => {
      initParticles()
    }
    window.addEventListener("resize", handleResize)

    // Physics Animation loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y
      const repulsionRadius = 65

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // 1. Mouse Repulsion Force (liquid wave displacement)
        const dx = p.px - mouseX
        const dy = p.py - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < repulsionRadius) {
          const force = (repulsionRadius - dist) / repulsionRadius // 0 to 1
          const angle = Math.atan2(dy, dx)
          // Add velocity pushing away from mouse
          p.vx += Math.cos(angle) * force * 1.5
          p.vy += Math.sin(angle) * force * 1.5
        }

        // 2. Spring force pulling back to home coordinate
        const ax = (p.x - p.px) * 0.08
        const ay = (p.y - p.py) * 0.08
        p.vx += ax
        p.vy += ay

        // 3. Apply friction drag
        p.vx *= 0.85
        p.vy *= 0.85

        // 4. Update coordinates
        p.px += p.vx
        p.py += p.vy

        // Draw particle
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [src, particleRadius])

  // Mouse handlers relative to bounds
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseRef.current = { x: -9999, y: -9999 }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* Display default image while canvas initializes for smooth loading */}
      {!imageLoaded && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full object-cover transition-opacity duration-300 block"
        style={{ opacity: imageLoaded ? 1 : 0 }}
      />
    </div>
  )
}
