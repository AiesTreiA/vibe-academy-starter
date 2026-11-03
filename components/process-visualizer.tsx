"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, AlertTriangle, Cpu, TrendingUp } from "lucide-react"

export default function ProcessVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0) // 0 to 1
  const [activeStep, setActiveStep] = useState(0) // 0 (chaos), 1 (automation), 2 (optimized)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate how much of the container has been scrolled through
      // container height is 300vh, top starts at windowHeight and ends at -2*windowHeight
      const totalDist = rect.height - windowHeight
      const scrolledDist = -rect.top
      
      let progress = 0
      if (scrolledDist > 0) {
        progress = Math.min(scrolledDist / totalDist, 1)
      }
      
      setScrollProgress(progress)
      
      // Map progress to active step
      if (progress < 0.33) {
        setActiveStep(0)
      } else if (progress < 0.66) {
        setActiveStep(1)
      } else {
        setActiveStep(2)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Trigger initial check
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Interpolated values for SVG nodes based on scroll progress
  // Node coordinates transitioning from chaotic/scattered (activeStep 0)
  // to automated/integrating (activeStep 1) to perfectly aligned (activeStep 2)
  const getNodeCoords = (nodeIndex: number) => {
    // 0: Input, 1: Process A, 2: Process B, 3: Output
    const coords = [
      // Chaos Coordinates
      [
        { x: 100, y: 150 }, // Input (off-center)
        { x: 280, y: 80 },  // Proc A (high)
        { x: 220, y: 280 }, // Proc B (low)
        { x: 450, y: 220 }  // Output (misaligned)
      ],
      // Automation Coordinates (Moving to order)
      [
        { x: 80, y: 200 },
        { x: 250, y: 120 },
        { x: 250, y: 280 },
        { x: 420, y: 200 }
      ],
      // Optimized Coordinates (Perfect pipeline flow)
      [
        { x: 80, y: 200 },  // Input (level)
        { x: 200, y: 200 }, // Proc A (centered)
        { x: 320, y: 200 }, // Proc B (centered)
        { x: 440, y: 200 }  // Output (level)
      ]
    ]

    let fromStep = 0
    let toStep = 0
    let factor = 0

    if (scrollProgress < 0.5) {
      fromStep = 0
      toStep = 1
      factor = scrollProgress * 2 // 0 to 1
    } else {
      fromStep = 1
      toStep = 2
      factor = (scrollProgress - 0.5) * 2 // 0 to 1
    }

    const from = coords[fromStep][nodeIndex]
    const to = coords[toStep][nodeIndex]

    return {
      x: from.x + (to.x - from.x) * factor,
      y: from.y + (to.y - from.y) * factor
    }
  }

  const n0 = getNodeCoords(0)
  const n1 = getNodeCoords(1)
  const n2 = getNodeCoords(2)
  const n3 = getNodeCoords(3)

  return (
    <section ref={containerRef} id="optimizacion-visual" className="relative min-h-[300vh] bg-slate-50 dark:bg-slate-950/80">
      {/* Title that scrolls away naturally on mobile */}
      <div className="w-full text-center pt-8 pb-2 px-4 lg:hidden bg-slate-50 dark:bg-slate-950/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
          <Cpu className="h-3.5 w-3.5 animate-pulse" />
          Optimización en Acción
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          ¿Cómo transformo tus procesos?
        </h2>
      </div>

      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-4 lg:py-10 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto grid gap-4 lg:gap-8 lg:grid-cols-12 items-center h-full max-h-[90vh] lg:max-h-[85vh]">
          
          {/* Left Column: Context / Descriptions (40% width) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4 lg:space-y-8 select-none z-10">
            <div>
              <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
                <Cpu className="h-3.5 w-3.5 animate-pulse" />
                Optimización en Acción
              </div>
              <h2 className="hidden lg:block text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ¿Cómo transformo tus procesos?
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 mt-1 lg:mt-2">
                Haz scroll hacia abajo para ver cómo simplificamos y automatizamos tus flujos operativos en tiempo real.
              </p>
            </div>

            {/* Steps timeline indicators */}
            <div className="space-y-4">
              {/* Step 1: Chaos */}
              <div 
                className={`p-3 lg:p-4 rounded-xl transition-all duration-500 border ${
                  activeStep === 0 
                    ? "bg-red-500/10 dark:bg-slate-950/80 border-red-500/30 dark:border-red-500/40 shadow-lg shadow-red-500/5 translate-x-2 block" 
                    : "bg-secondary/5 dark:bg-slate-950/20 border-transparent opacity-75 dark:opacity-80 hidden lg:block"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeStep === 0 ? "bg-red-500/20 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200">Fase 1: Caos Operativo (Manual)</h3>
                    <p className="text-xs text-slate-800 dark:text-slate-300 mt-1 leading-relaxed">
                      Sistemas desconectados, duplicidad de datos, cuellos de botella y tareas manuales repetitivas que drenan tu energía y tiempo semanal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: RPA & Connect */}
              <div 
                className={`p-3 lg:p-4 rounded-xl transition-all duration-500 border ${
                  activeStep === 1 
                    ? "bg-blue-500/10 dark:bg-slate-950/80 border-blue-500/30 dark:border-blue-500/40 shadow-lg shadow-blue-500/5 translate-x-2 block" 
                    : "bg-secondary/5 dark:bg-slate-950/20 border-transparent opacity-75 dark:opacity-80 hidden lg:block"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeStep === 1 ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"}`}>
                    <Cpu className="h-5 w-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200">Fase 2: Conexión y Automatización</h3>
                    <p className="text-xs text-slate-800 dark:text-slate-300 mt-1 leading-relaxed">
                      Implementamos bots de RPA con Python/Go y automatizaciones de APIs (Make/Zapier). Conectamos tus herramientas para que la tecnología trabaje por ti.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Optimized */}
              <div 
                className={`p-3 lg:p-4 rounded-xl transition-all duration-500 border ${
                  activeStep === 2 
                    ? "bg-emerald-500/10 dark:bg-slate-950/80 border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5 translate-x-2 block" 
                    : "bg-secondary/5 dark:bg-slate-950/20 border-transparent opacity-75 dark:opacity-80 hidden lg:block"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeStep === 2 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200">Fase 3: Flujo Sincronizado y Optimizado</h3>
                    <p className="text-xs text-slate-800 dark:text-slate-300 mt-1 leading-relaxed">
                      Procesos limpios, rápidos y libres de errores. Liberas hasta un 30% de tu tiempo operativo para enfocarte en aportar el verdadero valor estratégico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer Canvas (70% width on LG) */}
          <div className="lg:col-span-7 flex items-center justify-center h-full w-full z-0">
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] aspect-square rounded-2xl bg-glassmorphism border border-slate-200 dark:border-slate-800 p-4 lg:p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
              
              {/* Floating Metrics Dashboard (placed on top of the grid lines, solid background) */}
              <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md">
                <div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Estado del Proceso</div>
                  <div className={`text-xs sm:text-sm font-bold transition-colors duration-500 ${
                    activeStep === 0 ? "text-red-500" : activeStep === 1 ? "text-blue-500" : "text-emerald-500"
                  }`}>
                    {activeStep === 0 ? "⚠️ Crítico - Cuellos" : activeStep === 1 ? "⚙️ Automatizando..." : "🚀 Optimizado - 100%"}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Eficiencia</div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {activeStep === 0 ? "35%" : activeStep === 1 ? "70%" : "98%"}
                    </div>
                  </div>
                  {activeStep === 2 && (
                    <div className="p-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      <TrendingUp className="h-3 w-3 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 pointer-events-none" />

              {/* SVG Canvas for nodes and pathways */}
              <div className="relative w-full flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
                <svg viewBox="0 0 520 400" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  {/* Connecting lines */}
                  {activeStep === 0 ? (
                    <>
                      {/* Chaotic complex knot pathways */}
                      <path d={`M ${n0.x} ${n0.y} C 250 50, 150 350, ${n2.x} ${n2.y}`} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" className="opacity-70 animate-pulse" />
                      <path d={`M ${n0.x} ${n0.y} C 350 80, 50 250, ${n1.x} ${n1.y}`} fill="none" stroke="#ef4444" strokeWidth="3.5" className="opacity-90" />
                      <path d={`M ${n1.x} ${n1.y} C 120 180, 380 180, ${n2.x} ${n2.y}`} fill="none" stroke="#f97316" strokeWidth="2.5" />
                      <path d={`M ${n2.x} ${n2.y} C 200 400, 300 0, ${n3.x} ${n3.y}`} fill="none" stroke="#ef4444" strokeWidth="3.5" />
                      <path d={`M ${n1.x} ${n1.y} C 400 300, 100 100, ${n3.x} ${n3.y}`} fill="none" stroke="#b91c1c" strokeWidth="2" strokeDasharray="4,4" />
                      {/* Extra loops to make it look like a knot */}
                      <path d={`M ${n1.x} ${n1.y} C 150 180, 350 180, ${n2.x} ${n2.y}`} fill="none" stroke="#ef4444" strokeWidth="1.5" className="opacity-60" />
                      <path d={`M ${n0.x} ${n0.y} C 300 300, 150 50, ${n3.x} ${n3.y}`} fill="none" stroke="#991b1b" strokeWidth="2.5" strokeDasharray="2,8" className="opacity-50" />
                      
                      {/* Extra chaotic lines to increase complexity */}
                      <path d="M 80 200 C 150 380, 380 50, 440 200" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" className="opacity-45" />
                      <path d="M 100 150 C 50 300, 450 100, 220 280" fill="none" stroke="#dc2626" strokeWidth="2" className="opacity-60" />
                      <path d="M 280 80 C 180 0, 100 400, 450 220" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="6,4" className="opacity-70 animate-pulse" />
                    </>
                  ) : activeStep === 1 ? (
                    <>
                      {/* Remanentes del caos anterior (proceso de estabilización) */}
                      <path d="M 100 150 C 50 300, 450 100, 220 280" fill="none" stroke="#f87171" strokeWidth="1.2" strokeDasharray="3,3" className="opacity-40 animate-pulse" />
                      <path d="M 280 80 C 180 0, 100 400, 450 220" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,6" className="opacity-30" />

                      <path d={`M ${n0.x} ${n0.y} C 160 140, 160 260, ${n1.x} ${n1.y}`} fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <path d={`M ${n0.x} ${n0.y} C 160 260, 160 140, ${n2.x} ${n2.y}`} fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <path d={`M ${n1.x} ${n1.y} C 340 140, 340 260, ${n3.x} ${n3.y}`} fill="none" stroke="#3b82f6" strokeWidth="3" />
                      <path d={`M ${n2.x} ${n2.y} C 340 260, 340 140, ${n3.x} ${n3.y}`} fill="none" stroke="#3b82f6" strokeWidth="3" />
                      
                      <circle cx="250" cy="200" r="45" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" strokeDasharray="4,4" className="animate-spin-slow" />
                      <circle cx="250" cy="200" r="30" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" strokeDasharray="10,5" className="animate-spin-reverse" />
                    </>
                  ) : (
                    <>
                      <line x1={n0.x} y1={n0.y} x2={n1.x} y2={n1.y} stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
                      <line x1={n2.x} y1={n2.y} x2={n3.x} y2={n3.y} stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
                      
                      <line x1={n0.x} y1={n0.y} x2={n3.x} y2={n3.y} stroke="rgba(16,185,129,0.3)" strokeWidth="8" strokeLinecap="round" />
                    </>
                  )}

                  {/* Flowing data packets */}
                  {activeStep === 0 ? (
                    <>
                      <circle r="4" fill="#f87171">
                        <animateMotion dur="6s" repeatCount="indefinite" path={`M ${n0.x} ${n0.y} C 350 80, 50 250, ${n1.x} ${n1.y}`} />
                      </circle>
                      <circle r="5" fill="#f87171">
                        <animateMotion dur="9s" repeatCount="indefinite" path={`M ${n1.x} ${n1.y} C 120 180, 380 180, ${n2.x} ${n2.y}`} />
                      </circle>
                      <circle r="3" fill="#fb923c">
                        <animateMotion dur="5s" repeatCount="indefinite" path={`M ${n2.x} ${n2.y} C 200 400, 300 0, ${n3.x} ${n3.y}`} />
                      </circle>
                      
                      {/* Extra slow data packets representing latency/waste */}
                      <circle r="3.5" fill="#f97316">
                        <animateMotion dur="14s" repeatCount="indefinite" path="M 80 200 C 150 380, 380 50, 440 200" />
                      </circle>
                      <circle r="4.5" fill="#ef4444">
                        <animateMotion dur="11s" repeatCount="indefinite" path="M 100 150 C 50 300, 450 100, 220 280" />
                      </circle>
                      <circle r="3" fill="#b91c1c">
                        <animateMotion dur="16s" repeatCount="indefinite" path="M 280 80 C 180 0, 100 400, 450 220" />
                      </circle>
                    </>
                  ) : activeStep === 1 ? (
                    <>
                      {/* Partículas de caos residual/estabilización lenta */}
                      <circle r="2.5" fill="#f87171" className="opacity-50">
                        <animateMotion dur="8.5s" repeatCount="indefinite" path="M 100 150 C 50 300, 450 100, 220 280" />
                      </circle>
                      <circle r="3" fill="#ef4444" className="opacity-45">
                        <animateMotion dur="11s" repeatCount="indefinite" path="M 280 80 C 180 0, 100 400, 450 220" />
                      </circle>

                      <circle r="5.5" fill="#60a5fa">
                        <animateMotion dur="4.2s" repeatCount="indefinite" path={`M ${n0.x} ${n0.y} C 160 140, 160 260, ${n1.x} ${n1.y}`} />
                      </circle>
                      <circle r="4.5" fill="#34d399">
                        <animateMotion dur="3.8s" repeatCount="indefinite" path={`M ${n0.x} ${n0.y} C 160 260, 160 140, ${n2.x} ${n2.y}`} />
                      </circle>
                      <circle r="5" fill="#60a5fa">
                        <animateMotion dur="3.2s" repeatCount="indefinite" path={`M ${n1.x} ${n1.y} C 340 140, 340 260, ${n3.x} ${n3.y}`} />
                      </circle>
                      <circle r="5" fill="#34d399">
                        <animateMotion dur="3.5s" repeatCount="indefinite" path={`M ${n2.x} ${n2.y} C 340 260, 340 140, ${n3.x} ${n3.y}`} />
                      </circle>
                    </>
                  ) : (
                    <>
                      <circle r="6" fill="#34d399" className="opacity-95 shadow-[0_0_10px_#10b981]">
                        <animateMotion dur="1.2s" repeatCount="indefinite" path={`M ${n0.x} ${n0.y} L ${n3.x} ${n3.y}`} />
                      </circle>
                      <circle r="5" fill="#60a5fa" className="opacity-90">
                        <animateMotion dur="1.5s" begin="0.3s" repeatCount="indefinite" path={`M ${n0.x} ${n0.y} L ${n3.x} ${n3.y}`} />
                      </circle>
                      <circle r="4" fill="#a7f3d0" className="opacity-80">
                        <animateMotion dur="1.0s" begin="0.7s" repeatCount="indefinite" path={`M ${n0.x} ${n0.y} L ${n3.x} ${n3.y}`} />
                      </circle>
                    </>
                  )}

                  {/* Draw Nodes */}
                  <g>
                    <circle cx={n0.x} cy={n0.y} r="16" fill={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} stroke={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} strokeWidth="2" />
                    <text x={n0.x} y={n0.y + 4} textAnchor="middle" fill="#fff" className="text-[10px] font-bold select-none">IN</text>
                  </g>
                  
                  <g>
                    <circle cx={n1.x} cy={n1.y} r="16" fill={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} stroke={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} strokeWidth="2" />
                    {activeStep === 0 && (
                      <circle cx={n1.x + 10} cy={n1.y - 10} r="7" fill="#f97316" stroke="#000" strokeWidth="1" className="animate-pulse" />
                    )}
                    <text x={n1.x} y={n1.y + 4} textAnchor="middle" fill="#fff" className="text-[10px] font-bold select-none">A</text>
                  </g>

                  <g>
                    <circle cx={n2.x} cy={n2.y} r="16" fill={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} stroke={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} strokeWidth="2" />
                    {activeStep === 0 && (
                      <circle cx={n2.x - 10} cy={n2.y + 10} r="7" fill="#ef4444" stroke="#000" strokeWidth="1" className="animate-bounce" />
                    )}
                    <text x={n2.x} y={n2.y + 4} textAnchor="middle" fill="#fff" className="text-[10px] font-bold select-none">B</text>
                  </g>

                  <g>
                    <circle cx={n3.x} cy={n3.y} r="16" fill={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} stroke={activeStep === 0 ? "#ef4444" : activeStep === 1 ? "#3b82f6" : "#10b981"} strokeWidth="2" />
                    <text x={n3.x} y={n3.y + 4} textAnchor="middle" fill="#fff" className="text-[10px] font-bold select-none">OUT</text>
                  </g>

                  {/* Chaos step keywords and pointer arrows */}
                  {activeStep === 0 && (
                    <g className="animate-pulse">
                      {/* Arrow & Label: Cuellos de botella */}
                      <text x="500" y="45" className="text-red-600 dark:text-red-400 fill-current text-[10px] sm:text-[13px] font-bold font-mono select-none" textAnchor="end">⚠️ Cuellos de botella</text>
                      <path d="M 340 48 Q 320 52, 296 70" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
                      <polygon points="296,70 306,67 301,75" fill="#ef4444" />

                      {/* Arrow & Label: Tiempos muertos */}
                      <text x="20" y="45" className="text-red-600 dark:text-red-400 fill-current text-[10px] sm:text-[13px] font-bold font-mono select-none" textAnchor="start">⏳ Tiempos muertos</text>
                      <path d="M 120 48 Q 150 70, 180 110" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
                      <polygon points="180,110 171,105 178,99" fill="#ef4444" />

                      {/* Arrow & Label: Trabajo manual */}
                      <text x="20" y="355" className="text-orange-600 dark:text-orange-400 fill-current text-[10px] sm:text-[13px] font-bold font-mono select-none" textAnchor="start">⚡ Trabajo manual</text>
                      <path d="M 115 351 Q 155 330, 205 292" fill="none" stroke="#fb923c" strokeWidth="1.2" strokeDasharray="3,3" />
                      <polygon points="205,292 196,297 202,303" fill="#fb923c" />

                      {/* Arrow & Label: falta de estandarización */}
                      <text x="500" y="355" className="text-red-600 dark:text-red-400 fill-current text-[10px] sm:text-[13px] font-bold font-mono select-none" textAnchor="end">❌ falta de estandarización</text>
                      <path d="M 330 351 Q 280 320, 245 220" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
                      <polygon points="245,220 253,227 244,230" fill="#ef4444" />

                      {/* Arrow & Label: Corrección de errores */}
                      <text x="500" y="283" className="text-red-600 dark:text-red-400 fill-current text-[10px] sm:text-[13px] font-bold font-mono select-none" textAnchor="end">🛠️ Corrección de errores</text>
                      <path d="M 350 280 L 242 280" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" />
                      <polygon points="242,280 252,276 250,284" fill="#ef4444" />
                    </g>
                  )}
                </svg>
              </div>



            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 16s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-back 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-back {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </section>
  )
}
