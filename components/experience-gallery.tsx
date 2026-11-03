"use client"

import { useState, useEffect } from "react"
import { Building2, Battery, Zap, ChevronLeft, ChevronRight, Check, Banknote, Terminal, Sparkles, ExternalLink } from "lucide-react"

interface Photo {
  src: string
  alt: string
  caption: string
  isVideo?: boolean
  isCustomComponent?: string
}

interface ProjectData {
  id: string
  title: string
  company: string
  role: string
  period: string
  description: string
  icon: any
  color: string
  photos: Photo[]
  highlights: string[]
  link?: string
}

const projects: ProjectData[] = [
  {
    id: "verticapp",
    title: "VerticApp: Visión Artificial & Biomecánica",
    company: "VerticApp.pro",
    role: "Fundador / Lead AI Architect",
    period: "2025 - Presente",
    description: "Diseñé, entrené y desplegué VerticApp (verticapp.pro), una plataforma SaaS pionera de visión artificial on-device que transforma la cámara del usuario en un coach inteligente de handstand (verticales), midiendo apertura escapular de 180°, neutralidad cervical y retroversión pélvica en tiempo real con 100% de privacidad local.",
    icon: Sparkles,
    color: "teal",
    link: "https://verticapp.pro",
    photos: [
      {
        src: "/images/verticapp-hero.jpg",
        alt: "VerticApp: Plataforma de corrección biomecánica con IA",
        caption: "VerticApp: Plataforma de visión por computadora para corrección biomecánica de handstand en tiempo real."
      },
      {
        src: "/images/verticapp-straight-line.jpg",
        alt: "Alineación de 180° y eje sagital en VerticApp",
        caption: "Medición cinemática del eje sagital de 180°, retroversión pélvica y neutralidad cervical sin wearables."
      },
      {
        src: "",
        alt: "Simulador interactivo del sensor de hold de VerticApp",
        caption: "Sensor de hold y HUD cinemático: Inferencia on-device <16 ms con corrección por voz e interfaz táctica.",
        isCustomComponent: "verticapp-hud"
      }
    ],
    highlights: [
      "Inferencia de red neuronal on-device con latencias ultrabajas (<16 ms) directamente en navegador y móviles.",
      "Algoritmo de cálculo biomecánico sagital: apertura de 180°, hombros empujados, cadera neutra y cero tensión cervical.",
      "Ecosistema completo con coach por voz en vivo, analítica de progreso, pasarela de suscripciones recurrentes y portal de mentores.",
      "Plataforma operativa en producción y disponible globalmente en verticapp.pro."
    ]
  },
  {
    id: "robotica",
    title: "Gestión de Bodega & Optimización",
    company: "Roboris Ltda.",
    role: "Desarrollo de Nuevos Negocios / Mejora de Procesos",
    period: "Octubre 2019 - Junio 2021",
    description: "Lideré la modernización de la gestión de la bodega, digitalizando el proceso de actualización del inventario y organizando físicamente el espacio, lo que redujo la necesidad de reiteradas revisiones y conteos, y agilizó el suministro de materiales para los proyectos.",
    icon: Building2,
    color: "blue",
    photos: [
      {
        src: "/images/experiencia/roboris-1.webp",
        alt: "Brazo robótico industrial Fanuc",
        caption: "Brazo robótico industrial Fanuc integrado en la línea de producción."
      },
      {
        src: "/images/experiencia/roboris-2.webp",
        alt: "Controlador Teach Pendant de Fanuc",
        caption: "Programación y calibración de brazo robótico mediante interfaz Teach Pendant."
      },
      {
        src: "/images/experiencia/recursiva.mp4",
        alt: "Línea de producción robótica con brazo Fanuc",
        caption: "Video demostrativo del brazo robótico Fanuc en operación industrial.",
        isVideo: true
      }
    ],
    highlights: [
      "Implementación del uso de presupuesto en proyectos de robótica.",
      "Rediseño y automatización del proceso comercial completo.",
      "Levantamiento de roles e interacciones organizacionales para eliminar cuellos de botella."
    ]
  },
  {
    id: "mundos-virtuales",
    title: "Gestión de Efectivo y Automatización Comercial",
    company: "Mundos Virtuales",
    role: "Ingeniero de Producto / Apoyo Comercial",
    period: "Marzo - Junio 2019",
    description: "Desempeñé un rol comercial clave para la introducción y venta de sistemas de gestión de efectivo Glory (tecnología japonesa), logrando un fuerte crecimiento comercial en diversas industrias.",
    icon: Banknote,
    color: "purple",
    photos: [
      {
        src: "/images/experiencia/mundosvirtuales.mp4",
        alt: "Demostración de hardware Glory para gestión de efectivo",
        caption: "Video demostrativo de los sistemas de automatización Glory en Mundos Virtuales.",
        isVideo: true
      }
    ],
    highlights: [
      "Incremento de las ventas de la compañía en un 30% durante el período.",
      "Incorporación exitosa de nuevas industrias y clientes del sector Retail, Casinos y Empresas Transportadoras de Valores.",
      "Gestión comercial integral: presentaciones técnicas de producto, prospección de cuentas y estudios de mercado."
    ]
  },
  {
    id: "movia",
    title: "Electromovilidad y Telemetría",
    company: "MOVIA (AIEV SpA)",
    role: "Gerente Comercial",
    period: "Agosto 2021 - Diciembre 2021",
    description: "Lideré la estrategia comercial para consultorías de recambio de flotas a movilidad eléctrica y telemetría de monitoreo para maximizar vida útil de baterías (BEVs).",
    icon: Zap,
    color: "green",
    photos: [
      {
        src: "/images/experiencia/movia-1.webp",
        alt: "Conector de carga rápida para vehículo eléctrico",
        caption: "Carga rápida Mennekes conectada a vehículo eléctrico comercial."
      },
      {
        src: "/images/experiencia/movia-2.webp",
        alt: "Vehículo eléctrico cargando",
        caption: "Monitoreo y pruebas de carga para vehículos eléctricos ligeros."
      },
      {
        src: "/images/experiencia/movia-3.webp",
        alt: "Flota de camiones ligeros para reparto",
        caption: "Esquema y telemetría para flotas de reparto urbano en proceso de recambio."
      },
      {
        src: "",
        alt: "Dashboard de gestión de flota de vehículos eléctricos",
        caption: "Simulación interactiva de panel de telemetría y estado de carga (SoC) de baterías.",
        isCustomComponent: "dashboard"
      },
      {
        src: "",
        alt: "Roadmap de recambio de flota diésel a eléctrico",
        caption: "Esquema interactivo de transición y fases de recambio de flota diésel a electromovilidad.",
        isCustomComponent: "roadmap"
      }
    ],
    highlights: [
      "Adjudicación de telemetría de 'Mi Taxi Eléctrico' de la Agencia de Sostenibilidad Energética ($9.7M).",
      "Establecimiento de vínculos con actores clave del ecosistema de electromovilidad internacional.",
      "Desarrollo de campañas de prospección digital y ruedas de negocio sectoriales."
    ]
  },
  {
    id: "antu",
    title: "Sistemas de Respaldo Energético",
    company: "Antü Energía",
    role: "Gerente Comercial",
    period: "Agosto 2021 - Diciembre 2021",
    description: "Gestión comercial y técnica de soluciones avanzadas de almacenamiento energético y sistemas de respaldo de energía crítica para la industria.",
    icon: Battery,
    color: "amber",
    photos: [
      {
        src: "/images/experiencia/antu-1.webp",
        alt: "Instalación solar fotovoltaica off-grid",
        caption: "Sistema fotovoltaico off-grid en cabaña de campo para autogeneración sostenible."
      },
      {
        src: "/images/experiencia/antu-2.webp",
        alt: "Paneles solares residenciales/comerciales",
        caption: "Instalación de paneles solares fotovoltaicos sobre tejado residencial."
      },
      {
        src: "/images/experiencia/antu-3.webp",
        alt: "Tablero de control y transferencia de energía",
        caption: "Gabinete eléctrico de control e integración de fuentes de energía (Generador, Carga, Red)."
      }
    ],
    highlights: [
      "Liderazgo de postulaciones a concursos públicos y fondos privados de innovación.",
      "Desarrollo comercial de soluciones de almacenamiento energético sostenible.",
      "Prospección internacional y vinculación con consultoras de internacionalización."
    ]
  },
  {
    id: "recursiva",
    title: "Automatización RPA y Software",
    company: "Recursiva",
    role: "Ingeniero de Software",
    period: "Septiembre 2024 - Febrero 2025",
    description: "Desarrollé bots de automatización de procesos robóticos (RPA) de alta resiliencia en Python 3 para agilizar flujos operativos críticos de grandes corporaciones.",
    icon: Terminal,
    color: "indigo",
    photos: [
      {
        src: "/images/experiencia/desde6.mp4",
        alt: "Demostración de Bot de RPA procesando licencias médicas",
        caption: "Demostración en tiempo real de la automatización de navegador procesando licencias I-Med para CCU.",
        isVideo: true
      },
      {
        src: "",
        alt: "Código fuente del Bot de RPA",
        caption: "Código del bot RPA: Controladores Selenium para alertas, popups y modelos de base de datos en PostgreSQL.",
        isCustomComponent: "recursiva-code"
      }
    ],
    highlights: [
      "Automatización completa del procesamiento de licencias médicas de I-Med para CCU (área de Recursos Humanos).",
      "Programación de lógica de alta resiliencia en Python 3 para control de alertas Selenium y cierre de popups dinámicos.",
      "Diseño y modelado de bases de datos relacionales en PostgreSQL para trazabilidad y auditoría de licencias."
    ]
  }
]

export default function ExperienceGallery() {
  const [activeTab, setActiveTab] = useState("verticapp")
  const [photoIndexes, setPhotoIndexes] = useState<Record<string, number>>({
    verticapp: 0,
    robotica: 0,
    "mundos-virtuales": 0,
    movia: 0,
    antu: 0,
    recursiva: 0
  })

  const currentProject = projects.find((p) => p.id === activeTab) || projects[0]
  const currentPhotoIndex = photoIndexes[activeTab] || 0
  const currentPhoto = currentProject.photos[currentPhotoIndex]

  // Autoplay Effect: Advance slides every 5 seconds for images/custom components.
  // Videos will trigger nextPhoto automatically upon finishing via onEnded.
  useEffect(() => {
    if (currentPhoto?.isVideo) return

    const timer = setInterval(() => {
      nextPhoto(currentProject.id, currentProject.photos.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [activeTab, currentPhotoIndex, currentPhoto])

  const nextPhoto = (projectId: string, maxPhotos: number) => {
    setPhotoIndexes((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] + 1) % maxPhotos
    }))
  }

  const prevPhoto = (projectId: string, maxPhotos: number) => {
    setPhotoIndexes((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] - 1 + maxPhotos) % maxPhotos
    }))
  }

  const getTabStyles = (projectId: string, color: string) => {
    const isActive = activeTab === projectId
    if (!isActive) return "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-800"
    
    switch (color) {
      case "teal":
        return "border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/5 font-semibold"
      case "green":
        return "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 font-semibold"
      case "amber":
        return "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/5 font-semibold"
      case "purple":
        return "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/5 font-semibold"
      case "indigo":
        return "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5 font-semibold"
      default:
        return "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/5 font-semibold"
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto pb-px scrollbar-none">
        {projects.map((p) => {
          const Icon = p.icon
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap focus:outline-none ${getTabStyles(p.id, p.color)}`}
            >
              <Icon className="h-4 w-4" />
              <span>{p.company}</span>
            </button>
          )
        })}
      </div>

      {/* Content Container */}
      <div className="grid gap-8 lg:grid-cols-12 items-start bg-indigo-50/20 dark:bg-slate-950/40 rounded-2xl border border-indigo-100/80 dark:border-slate-800/80 p-6 backdrop-blur-md">
        
        {/* Photo Slider (Lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group shadow-lg">
            
            {/* Image, Video or Custom Component */}
            {currentPhoto.isCustomComponent === "verticapp-hud" ? (
              <div className="w-full h-full bg-[#07120E] p-4 pb-12 text-xs font-mono text-emerald-100 flex flex-col justify-between overflow-y-auto select-none relative">
                {/* HUD Header */}
                <div className="flex justify-between items-center border-b border-teal-900/60 pb-2 mb-2">
                  <div className="flex items-center gap-2 text-teal-300 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>NEURAL POSE 2.4 · 180° AXIS</span>
                  </div>
                  <span className="text-[10px] text-teal-300/90 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
                    &lt;16ms INFERENCE
                  </span>
                </div>

                {/* HUD Main Grid */}
                <div className="grid grid-cols-2 gap-3 flex-1 min-h-[160px] text-[11px] my-1">
                  <div className="space-y-1.5 border-r border-teal-900/60 pr-2">
                    <div className="text-[9px] text-teal-400 uppercase font-bold tracking-wider">Lectura Articular</div>
                    <div className="p-1.5 bg-teal-950/50 border border-teal-900/80 rounded flex justify-between items-center">
                      <span className="text-slate-300">Empuje Escapular</span>
                      <span className="text-emerald-400 font-bold">180° ✓</span>
                    </div>
                    <div className="p-1.5 bg-teal-950/50 border border-teal-900/80 rounded flex justify-between items-center">
                      <span className="text-slate-300">Cue Cervical</span>
                      <span className="text-emerald-400 font-bold">Bajo Columna</span>
                    </div>
                    <div className="p-1.5 bg-teal-950/50 border border-teal-900/80 rounded flex justify-between items-center">
                      <span className="text-slate-300">Retroversión</span>
                      <span className="text-emerald-400 font-bold">Pélvica OK</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pl-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] text-teal-400 uppercase font-bold tracking-wider mb-1">Precisión Cinemática</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-300">Alineación Sagital:</span>
                          <span className="text-emerald-400 font-bold">99.4%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-teal-950">
                          <div className="h-full w-[99.4%] bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-emerald-950/40 border border-emerald-800/60 rounded text-[10px] leading-relaxed">
                      <div className="text-emerald-400 font-bold flex items-center gap-1">
                        <span>🔊 Feedback de Voz:</span>
                      </div>
                      <p className="text-emerald-200/90 italic mt-0.5">"Excelente línea. Empuja hombros y mantén la mirada en los dedos."</p>
                    </div>
                  </div>
                </div>

                {/* HUD Footer */}
                <div className="border-t border-teal-900/60 pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-teal-400/80">Procesado 100% on-device</span>
                  <a
                    href="https://verticapp.pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-bold bg-teal-900/60 hover:bg-emerald-600 border border-teal-700/80 px-2.5 py-1 rounded transition-colors"
                  >
                    <span>Probar verticapp.pro</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : currentPhoto.isCustomComponent === "dashboard" ? (
              <div className="w-full h-full bg-slate-950 p-4 pb-12 text-xs font-mono text-slate-300 flex flex-col justify-between overflow-y-auto select-none">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    MOVIA FLEET TELEMETRY v2.1
                  </div>
                  <div className="text-[10px] text-muted-foreground">SANTIAGO ZONE</div>
                </div>
                <div className="grid grid-cols-2 gap-3 flex-1 min-h-[160px] text-[11px]">
                  <div className="space-y-1.5 border-r border-slate-800/80 pr-2">
                    <div className="text-[9px] text-muted-foreground uppercase font-bold">Vehículos en Ruta</div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                      <span>🚚 Camión-01</span>
                      <span className="text-emerald-400 font-bold">87% SoC</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                      <span>🚚 Camión-02</span>
                      <span className="text-emerald-400 font-bold">92% SoC</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                      <span>🚗 Van-01</span>
                      <span className="text-amber-500 font-bold">45% SoC</span>
                    </div>
                  </div>
                  <div className="space-y-2 pl-1">
                    <div className="text-[9px] text-muted-foreground uppercase font-bold">Monitoreo de Batería</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Salud Promedio:</span>
                        <span className="text-emerald-400 font-bold">98.4% SoH</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-[98%] bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-900/60 border border-slate-800 rounded text-[9px] leading-relaxed">
                      <div className="text-slate-400">Estado de Alertas:</div>
                      <div className="text-emerald-400 font-bold">✓ Temperatura en rango óptimo (&lt;35°C)</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-[9px] text-muted-foreground">
                  <span>Distancia Hoy: 642 km</span>
                  <span>Carga Total: 184 kWh</span>
                </div>
              </div>
            ) : currentPhoto.isCustomComponent === "roadmap" ? (
              <div className="w-full h-full bg-slate-950 p-4 pb-12 flex flex-col justify-between overflow-y-auto select-none">
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider border-b border-slate-800 pb-1.5">
                  Plan de Ruta: Recambio Diésel a Eléctrico
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-3 py-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-400 text-[10px]">1</div>
                    <div>
                      <div className="font-bold text-slate-200">Auditoría Operativa</div>
                      <p className="text-[10px] text-muted-foreground leading-tight">Telemetría diésel para mapear autonomía y consumos reales.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-[10px]">2</div>
                    <div>
                      <div className="font-bold text-slate-200">Piloto BEV & Carga</div>
                      <p className="text-[10px] text-muted-foreground leading-tight">Instalación de cargadores de 22kW e introducción de primeros 5 vehículos.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-[10px]">3</div>
                    <div>
                      <div className="font-bold text-slate-200">Escalamiento & Software</div>
                      <p className="text-[10px] text-muted-foreground leading-tight">Monitoreo con telemetría de baterías MOVIA para maximizar vida útil.</p>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-center text-emerald-400 font-bold bg-emerald-500/5 py-1 border border-emerald-500/10 rounded">
                  ★ Retorno de Inversión (ROI) proyectado: 18 - 24 meses
                </div>
              </div>
            ) : currentPhoto.isCustomComponent === "recursiva-code" ? (
              <div className="w-full h-full bg-slate-950 p-4 pb-12 flex flex-col justify-between overflow-hidden select-none group/code">
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider border-b border-slate-800 pb-1.5 flex justify-between items-center">
                  <span>Código Fuente RPA: Selenium & DB Models</span>
                  <span className="text-emerald-400 font-mono text-[9px]">CCU_IMED</span>
                </div>
                
                {/* 3D Perspective Stack of Code Screenshots */}
                <div className="flex-1 relative flex items-center justify-center min-h-[180px] my-2">
                  
                  {/* Card 1: DB Models (Bottom/Back Card) */}
                  <div className="absolute w-[80%] aspect-[16/10] rounded-lg overflow-hidden border border-slate-700/50 shadow-2xl transition-all duration-500 ease-out 
                    transform perspective-[1000px] rotateY(-25deg) rotateX(12deg) translateZ(-40px) -translateX(20px) -translateY(10px)
                    group-hover/code:translateZ(-20px) group-hover/code:-translateX(35px) group-hover/code:-translateY(15px) group-hover/code:rotateY(-20deg)
                    opacity-80 group-hover/code:opacity-90">
                    <img 
                      src="/images/experiencia/recursiva-code-2.png" 
                      alt="Modelos de Base de Datos - conexion.py" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover/code:bg-transparent transition-colors duration-500" />
                  </div>

                  {/* Card 2: Scraping Functions (Top/Front Card) */}
                  <div className="absolute w-[80%] aspect-[16/10] rounded-lg overflow-hidden border border-primary/50 shadow-[0_15px_35px_rgba(59,130,246,0.3)] transition-all duration-500 ease-out 
                    transform perspective-[1000px] rotateY(-25deg) rotateX(12deg) translateZ(30px) translateX(20px) translateY(10px)
                    group-hover/code:translateZ(50px) group-hover/code:translateX(35px) group-hover/code:translateY(15px) group-hover/code:rotateY(-20deg)
                    z-10">
                    <img 
                      src="/images/experiencia/recursiva-code-1.png" 
                      alt="Control de Alertas y Popups - funciones.py" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                </div>

                <div className="text-[9px] text-center text-primary font-bold bg-primary/5 py-1 border border-primary/10 rounded">
                  💡 Pasa el cursor para separar y ver en detalle la arquitectura del bot
                </div>
              </div>
            ) : currentPhoto.isVideo ? (
              <video
                src={currentPhoto.src}
                controls
                controlsList="nofullscreen"
                onDoubleClick={(e) => e.preventDefault()}
                autoPlay
                muted
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  if (currentPhoto.src.includes("desde6.mp4")) {
                    video.currentTime = 7;
                    if (video.textTracks && video.textTracks[0]) {
                      video.textTracks[0].mode = "showing";
                    }
                  }
                }}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  if (currentPhoto.src.includes("desde6.mp4")) {
                    if (video.currentTime < 7) {
                      video.currentTime = 7;
                    }
                    if (video.currentTime >= 86) {
                      video.pause();
                      nextPhoto(currentProject.id, currentProject.photos.length);
                    }
                  }
                }}
                onEnded={() => nextPhoto(currentProject.id, currentProject.photos.length)}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  currentPhoto.src.includes("desde6.mp4") ? "scale-[1.2] origin-center" : ""
                }`}
              >
                <track
                  label="Español"
                  kind="captions"
                  srcLang="es"
                  src="/recursiva.vtt"
                  default
                />
              </video>
            ) : (
              <img
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
            
            {/* Navigation buttons */}
            {currentProject.photos.length > 1 && (
              <>
                <button
                  onClick={() => prevPhoto(currentProject.id, currentProject.photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-foreground hover:bg-slate-900 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => nextPhoto(currentProject.id, currentProject.photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-foreground hover:bg-slate-900 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Siguiente foto"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Slider Dots */}
            {currentProject.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/70 px-2 py-1 rounded-full backdrop-blur-sm border border-slate-800">
                {currentProject.photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoIndexes((prev) => ({ ...prev, [currentProject.id]: idx }))}
                    className="p-2 flex items-center justify-center focus:outline-none min-w-[32px] min-h-[32px]"
                    aria-label={`Ir a foto ${idx + 1}`}
                  >
                    <span className={`block h-2 rounded-full transition-colors duration-200 ${idx === currentPhotoIndex ? "w-5 bg-primary" : "w-2 bg-slate-600 hover:bg-slate-400"}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Photo Caption */}
          <p className="text-xs text-slate-600 dark:text-slate-300 italic text-center px-4 leading-relaxed">
            {currentPhoto.caption}
          </p>
        </div>

        {/* Text Description (Lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  {currentProject.period}
                </span>
                {currentProject.link && (
                  <a
                    href={currentProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Ver app en vivo</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {currentProject.title}
              </h3>
              <div className="text-sm font-semibold text-primary dark:text-blue-400 mt-0.5">
                {currentProject.role}
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed font-normal">
              {currentProject.description}
            </p>

            {/* Highlights */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Logros y Aportes Clave:
              </h4>
              <ul className="space-y-2">
                {currentProject.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start text-xs text-muted-foreground leading-relaxed">
                    <span className="mr-2 mt-0.5 p-0.5 rounded bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {currentProject.link && (
              <div className="pt-2">
                <a
                  href={currentProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Visitar {currentProject.company} ({currentProject.link.replace("https://", "")})</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex justify-between items-center">
            <span>Proyecto en {currentProject.company}</span>
            <span className="font-semibold text-foreground bg-secondary/35 px-2 py-0.5 rounded">
              {currentPhoto.isCustomComponent ? "Esquema interactivo" : currentProject.photos.some(p => p.isVideo) ? "Video disponible" : `${currentProject.photos.length} Fotos`}
            </span>
          </div>
        </div>

      </div>
      
      {/* Estilos personalizados para achicar los subtítulos WebVTT y evitar que se corten por el zoom del video */}
      <style dangerouslySetInnerHTML={{ __html: `
        video::cue {
          font-size: 11px !important;
          font-family: inherit !important;
          background-color: rgba(15, 23, 42, 0.85) !important;
          color: #f1f5f9 !important;
          text-shadow: none !important;
          padding: 2px 6px !important;
        }
      ` }} />
    </div>
  )
}
