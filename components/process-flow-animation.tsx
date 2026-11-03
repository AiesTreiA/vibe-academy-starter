"use client"

import { useEffect, useState } from "react"

// Animated flow diagram: shows a chaotic process transforming into an optimized one
export default function ProcessFlowAnimation() {
  const [phase, setPhase] = useState<0 | 1>(0) // 0 = caos, 1 = optimizado
  const [tick, setTick] = useState(0)

  // Alternate between chaotic and optimized every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p === 0 ? 1 : 0))
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Particle tick for animating data dots
  useEffect(() => {
    const raf = requestAnimationFrame(() => setTick((t) => t + 1))
    return () => cancelAnimationFrame(raf)
  }, [tick])

  const isOptimized = phase === 1

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col select-none overflow-hidden relative">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-950/90 z-10">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full transition-colors duration-700 ${isOptimized ? "bg-emerald-400 animate-pulse" : "bg-red-500 animate-ping"}`} />
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            {isOptimized ? "Proceso Optimizado" : "Proceso Actual"}
          </span>
        </div>
        <div className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all duration-700 ${
          isOptimized 
            ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" 
            : "text-red-400 border-red-500/40 bg-red-500/10"
        }`}>
          {isOptimized ? "✓ Rediseñado" : "⚠ Ineficiente"}
        </div>
      </div>

      {/* SVG Flow Diagram */}
      <svg
        viewBox="0 0 560 180"
        className="w-full flex-1"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Optimized gradient */}
          <linearGradient id="optGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
          </linearGradient>
          {/* Chaos gradient */}
          <linearGradient id="chaosGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
          {/* Arrow markers */}
          <marker id="arrowOpt" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#10b981" />
          </marker>
          <marker id="arrowChaos" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="arrowBlue" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#3b82f6" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ─── OPTIMIZED FLOW (left→right linear pipeline) ─── */}
        <g
          className="transition-all duration-700"
          style={{ opacity: isOptimized ? 1 : 0, transform: isOptimized ? "none" : "translateY(8px)" }}
        >
          {/* Connector lines */}
          <line x1="90" y1="90" x2="148" y2="90" stroke="url(#optGrad)" strokeWidth="2.5" markerEnd="url(#arrowOpt)" />
          <line x1="212" y1="90" x2="268" y2="90" stroke="url(#optGrad)" strokeWidth="2.5" markerEnd="url(#arrowOpt)" />
          <line x1="332" y1="90" x2="388" y2="90" stroke="url(#optGrad)" strokeWidth="2.5" markerEnd="url(#arrowOpt)" />
          <line x1="452" y1="90" x2="508" y2="90" stroke="url(#optGrad)" strokeWidth="2.5" markerEnd="url(#arrowOpt)" />

          {/* Node 1 – Inicio */}
          <rect x="18" y="70" width="72" height="40" rx="8" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.8" />
          <text x="54" y="87" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold">INICIO</text>
          <text x="54" y="100" textAnchor="middle" fill="#6ee7b7" fontSize="7">Solicitud</text>

          {/* Node 2 – Diagnóstico */}
          <rect x="150" y="70" width="62" height="40" rx="8" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.8" />
          <text x="181" y="87" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">ANÁLISIS</text>
          <text x="181" y="100" textAnchor="middle" fill="#93c5fd" fontSize="7">Diagnóstico</text>

          {/* Node 3 – Diseño (diamond) */}
          <polygon points="300,68 332,90 300,112 268,90" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="1.8" />
          <text x="300" y="88" textAnchor="middle" fill="#10b981" fontSize="7.5" fontWeight="bold">DISEÑO</text>
          <text x="300" y="100" textAnchor="middle" fill="#6ee7b7" fontSize="6.5">Co-diseño</text>

          {/* Node 4 – Implementación */}
          <rect x="390" y="70" width="62" height="40" rx="8" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.8" />
          <text x="421" y="86" textAnchor="middle" fill="#60a5fa" fontSize="7.5" fontWeight="bold">IMPL.</text>
          <text x="421" y="99" textAnchor="middle" fill="#93c5fd" fontSize="6.5">Automatizar</text>

          {/* Node 5 – Resultado (circle) */}
          <circle cx="530" cy="90" r="22" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" filter="url(#glow)" />
          <text x="530" y="87" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold">FLUJO</text>
          <text x="530" y="99" textAnchor="middle" fill="#6ee7b7" fontSize="7">Óptimo</text>

          {/* Flowing data packet */}
          <circle r="5" fill="#10b981" opacity="0.9" filter="url(#glow)">
            <animateMotion dur="2.4s" repeatCount="indefinite"
              path="M 54,90 L 154,90 L 181,90 L 268,90 L 300,90 L 390,90 L 421,90 L 508,90" />
          </circle>
          <circle r="3.5" fill="#3b82f6" opacity="0.8">
            <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.8s"
              path="M 54,90 L 154,90 L 181,90 L 268,90 L 300,90 L 390,90 L 421,90 L 508,90" />
          </circle>

          {/* Labels below */}
          <text x="54" y="125" textAnchor="middle" fill="#6ee7b7" fontSize="6.5" opacity="0.6">Paso 1</text>
          <text x="181" y="125" textAnchor="middle" fill="#93c5fd" fontSize="6.5" opacity="0.6">Paso 2</text>
          <text x="300" y="130" textAnchor="middle" fill="#6ee7b7" fontSize="6.5" opacity="0.6">Paso 3</text>
          <text x="421" y="125" textAnchor="middle" fill="#93c5fd" fontSize="6.5" opacity="0.6">Paso 4</text>
          <text x="530" y="125" textAnchor="middle" fill="#6ee7b7" fontSize="6.5" opacity="0.6">Salida</text>
        </g>

        {/* ─── CHAOTIC FLOW (tangled, multi-path) ─── */}
        <g
          style={{ opacity: isOptimized ? 0 : 1, transition: "opacity 0.7s ease" }}
        >
          {/* Tangled connector paths */}
          <path d="M 80 70 C 130 30, 180 120, 240 75" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="4,3" markerEnd="url(#arrowChaos)" opacity="0.8" />
          <path d="M 80 110 C 150 160, 200 40, 260 110" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,4" markerEnd="url(#arrowChaos)" opacity="0.7" />
          <path d="M 250 75 C 310 20, 340 140, 380 80" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowChaos)" opacity="0.75" />
          <path d="M 260 110 C 290 150, 350 50, 390 90" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowChaos)" opacity="0.6" />
          <path d="M 380 80 C 430 30, 460 130, 500 85" fill="none" stroke="#ef4444" strokeWidth="1.8" markerEnd="url(#arrowChaos)" opacity="0.8" />
          <path d="M 390 90 C 420 150, 480 50, 510 90" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrowChaos)" opacity="0.5" />
          {/* Backflow – loop that goes backwards */}
          <path d="M 380 80 C 380 20, 160 20, 80 70" fill="none" stroke="#991b1b" strokeWidth="1.2" strokeDasharray="4,5" markerEnd="url(#arrowChaos)" opacity="0.4" />

          {/* Nodes – irregular shapes */}
          <rect x="18" y="58" width="62" height="34" rx="4" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="49" y="75" textAnchor="middle" fill="#f87171" fontSize="7.5" fontWeight="bold">ENTRADA</text>
          <text x="49" y="86" textAnchor="middle" fill="#fca5a5" fontSize="6.5">Sin formato</text>

          <rect x="228" y="62" width="32" height="30" rx="4" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="244" y="78" textAnchor="middle" fill="#f87171" fontSize="7">Paso?</text>

          <rect x="245" y="98" width="34" height="28" rx="4" fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.5" />
          <text x="262" y="116" textAnchor="middle" fill="#fb923c" fontSize="7">¿Quién?</text>

          <rect x="370" y="65" width="34" height="30" rx="4" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="387" y="82" textAnchor="middle" fill="#f87171" fontSize="7">Revisar</text>

          <rect x="378" y="82" width="36" height="26" rx="4" fill="rgba(185,28,28,0.12)" stroke="#b91c1c" strokeWidth="1.5" />
          <text x="396" y="98" textAnchor="middle" fill="#fca5a5" fontSize="7">Rehacer</text>

          <circle cx="510" cy="88" r="20" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="510" y="85" textAnchor="middle" fill="#f87171" fontSize="7.5">¿Listo?</text>
          <text x="510" y="97" textAnchor="middle" fill="#fca5a5" fontSize="6.5">¿O no?</text>

          {/* Slow chaotic particles */}
          <circle r="4" fill="#f87171" opacity="0.85">
            <animateMotion dur="5s" repeatCount="indefinite"
              path="M 49,70 C 130 30, 180 120, 244 78 C 310 20, 340 140, 387 73" />
          </circle>
          <circle r="3" fill="#f97316" opacity="0.7">
            <animateMotion dur="7s" repeatCount="indefinite" begin="1.5s"
              path="M 49,90 C 150 160, 200 40, 262 110 C 290 150, 360 60, 396 90" />
          </circle>
          <circle r="2.5" fill="#ef4444" opacity="0.6">
            <animateMotion dur="9s" repeatCount="indefinite" begin="3s"
              path="M 380 80 C 380 20, 160 20, 49 70" />
          </circle>

          {/* Warning labels */}
          <text x="140" y="28" textAnchor="middle" fill="#f87171" fontSize="7" opacity="0.7">⚠ Sin responsable</text>
          <text x="300" y="165" textAnchor="middle" fill="#f97316" fontSize="7" opacity="0.65">🔁 Reproceso constante</text>
          <text x="460" y="28" textAnchor="middle" fill="#fca5a5" fontSize="7" opacity="0.7">❌ Sin estándar</text>
        </g>
      </svg>

      {/* Footer metrics bar */}
      <div className="px-4 py-2 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/80">
        <div className="flex gap-4">
          <div className="text-center">
            <div className={`text-sm font-bold font-mono transition-colors duration-700 ${isOptimized ? "text-emerald-400" : "text-red-400"}`}>
              {isOptimized ? "4" : "8+"}
            </div>
            <div className="text-[8px] text-slate-500 uppercase tracking-wide">Pasos</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold font-mono transition-colors duration-700 ${isOptimized ? "text-emerald-400" : "text-red-400"}`}>
              {isOptimized ? "0" : "3"}
            </div>
            <div className="text-[8px] text-slate-500 uppercase tracking-wide">Reprocesos</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold font-mono transition-colors duration-700 ${isOptimized ? "text-emerald-400" : "text-amber-400"}`}>
              {isOptimized ? "1d" : "7d"}
            </div>
            <div className="text-[8px] text-slate-500 uppercase tracking-wide">Ciclo</div>
          </div>
        </div>
        <div className={`text-[9px] font-mono px-2 py-1 rounded transition-all duration-700 ${
          isOptimized ? "text-emerald-300 bg-emerald-500/10" : "text-red-300 bg-red-500/10"
        }`}>
          {isOptimized ? "↓ 85% tiempo de ciclo" : "↑ Cuellos de botella detectados"}
        </div>
      </div>
    </div>
  )
}
