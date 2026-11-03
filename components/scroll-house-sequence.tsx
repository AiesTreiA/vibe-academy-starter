"use client"

import React, { useRef, useEffect, useState } from "react"

export function ScrollHouseSequence() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0) // 0 to 1

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate progress of container moving through the viewport
      // 0 = just entered from bottom, 1 = leaving from top
      const entryPoint = windowHeight
      const exitPoint = -rect.height
      const totalRange = entryPoint - exitPoint
      
      const currentPos = rect.top - exitPoint
      const rawProgress = 1 - currentPos / totalRange
      
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1)
      setScrollProgress(clampedProgress)
    }

    // Trigger initially
    handleScroll()
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  // Calculate values for Layer 1: House Outline
  // Zooming forward (scale 1 -> 3.5), fading out (1 -> 0)
  const layer1Scale = 1 + scrollProgress * 3.5
  const layer1Opacity = Math.max(0, 1 - scrollProgress * 2.2)

  // Calculate values for Layer 2: Code Corridor / Entry Portal
  // Appears in the middle (0.2 -> 0.7), scaling from 0.5 -> 2.5
  const layer2Scale = 0.5 + scrollProgress * 2.2
  let layer2Opacity = 0
  if (scrollProgress > 0.15 && scrollProgress <= 0.5) {
    layer2Opacity = (scrollProgress - 0.15) / 0.35 // fade in
  } else if (scrollProgress > 0.5 && scrollProgress < 0.8) {
    layer2Opacity = 1 - (scrollProgress - 0.5) / 0.3 // fade out
  }

  // Calculate values for Layer 3: Final Web App Dashboard
  // Fades in (0 -> 1) from 0.45 onwards, scaling from 0.85 -> 1
  const layer3Scale = 0.85 + (scrollProgress > 0.45 ? Math.min((scrollProgress - 0.45) * 0.27, 0.15) : 0)
  const layer3Opacity = scrollProgress <= 0.45 ? 0 : Math.min((scrollProgress - 0.45) * 2.5, 1)

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center pointer-events-none select-none"
    >
      {/* Dynamic Grid Background representing tech environment */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />

      {/* LAYER 1: House Exterior Wireframe Outline */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${layer1Scale})`,
          opacity: layer1Opacity,
          willChange: "transform, opacity"
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-32 h-32 stroke-indigo-400 fill-none stroke-[1.5]"
        >
          {/* House Structure */}
          <path d="M20,80 L20,45 L50,15 L80,45 L80,80 Z" />
          {/* Roof Line */}
          <path d="M12,48 L50,15 L88,48" />
          {/* Door */}
          <path d="M42,80 L42,55 L58,55 L58,80" />
          {/* Windows */}
          <rect x="30" y="38" width="10" height="10" />
          <rect x="60" y="38" width="10" height="10" />
          {/* Internal grid perspective lines */}
          <line x1="50" y1="15" x2="50" y2="35" />
          <line x1="20" y1="45" x2="80" y2="45" />
        </svg>
      </div>

      {/* LAYER 2: Entering Portal/Tech Corridor */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${layer2Scale})`,
          opacity: layer2Opacity,
          willChange: "transform, opacity"
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-36 h-36 stroke-violet-400 fill-none stroke-[1]"
        >
          {/* Tunnel Perspective Boxes */}
          <rect x="40" y="40" width="20" height="20" />
          <rect x="30" y="30" width="40" height="40" />
          <rect x="15" y="15" width="70" height="70" />
          {/* Corner lines connecting the perspective */}
          <line x1="15" y1="15" x2="40" y2="40" />
          <line x1="85" y1="15" x2="60" y2="40" />
          <line x1="15" y1="85" x2="40" y2="60" />
          <line x1="85" y1="85" x2="60" y2="60" />
          {/* Code data streams */}
          <path d="M 22,25 L 30,25" className="stroke-indigo-400 stroke-2" />
          <path d="M 70,75 L 78,75" className="stroke-emerald-400 stroke-2" />
          <path d="M 50,22 L 50,28" className="stroke-violet-400 stroke-2 animate-pulse" />
        </svg>
      </div>

      {/* LAYER 3: Sophisticated Web App Dashboard */}
      <div 
        className="absolute inset-0 w-full h-full p-2 flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${layer3Scale})`,
          opacity: layer3Opacity,
          willChange: "transform, opacity"
        }}
      >
        <img 
          src="/images/phase3_dashboard.png" 
          alt="SaaS Web App Dashboard" 
          className="w-full h-full object-cover rounded-lg shadow-2xl border border-slate-800"
        />
        {/* Subtle glow accent on dashboard */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-emerald-500/10 rounded-lg" />
      </div>
      
      {/* Scroll indicator overlay */}
      <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-[9px] text-slate-400 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
        Scroll interactive
      </div>
    </div>
  )
}
