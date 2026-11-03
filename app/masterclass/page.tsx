"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, 
  Mail, 
  User, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  MessageSquare, 
  Layers, 
  Sparkles,
  Copy,
  Check,
  Play,
  Video,
  Clock,
  Film,
  Download,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { AntigravityParticles } from "@/components/antigravity-particles"
import { Footer } from "@/components/footer"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { validateEmailClient } from "@/lib/email-validator-client"
import { MasterclassVideoPlayer } from "@/components/masterclass-video-player"

interface MasterclassItem {
  id: string
  title: string
  date: string
  time: string
  meet: string
  image: string
  icon: any
  color: string
  description: string
  isRecorded?: boolean
  driveId?: string
  videoUrl?: string
  youtubeId?: string
  duration?: string
  pdfUrl?: string
  pdfName?: string
  deployedSiteUrl?: string
}

const MASTERCLASSES: MasterclassItem[] = [
  {
    id: "ciberseguridad",
    title: "Ciberseguridad en Vibe Coding",
    date: "Lunes, 03 de Agosto",
    time: "Grabación Completa Disponible • HD",
    meet: "meet.google.com/hbw-dmwp-bgs",
    image: "/images/cyber_vibe_coding.png",
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
    description: "Aprende a proteger tus entornos de desarrollo en vivo y flujos automáticos contra las vulnerabilidades más comunes al programar con IA en tiempo real.",
    isRecorded: true,
    youtubeId: "LLp1evnAA7w",
    duration: "1h 15m",
    pdfUrl: "/docs/Prompts_Auditoria_Seguridad_IA.pdf",
    pdfName: "Prompts Seguridad PDF"
  },
  {
    id: "tokens_contexto",
    title: "Optimización de Tokens y Contexto",
    date: "Lunes, 10 de Agosto",
    time: "Grabación Completa Disponible • HD",
    meet: "meet.google.com/mzj-hhsp-avj",
    image: "/images/tokens_context.png",
    icon: Cpu,
    color: "from-emerald-500 to-teal-600",
    description: "Domina las técnicas para reducir costos, optimizar ventanas de contexto de LLMs y estructurar prompts avanzados para respuestas ultra-precisas.",
    isRecorded: true,
    youtubeId: "Zl7-z9JFu-Q",
    duration: "1h 15m",
    pdfUrl: "/docs/Optimizacion_Tokens_Contexto_IA.pdf",
    pdfName: "Presentación Tokens PDF"
  },
  {
    id: "chatbot_automatizacion",
    title: "Chatbot Inteligente y Automatización",
    date: "Lunes, 17 de Agosto",
    time: "Grabación Completa Disponible • HD",
    meet: "meet.google.com/oiz-teks-spz",
    image: "/images/chatbot_automation.png",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-600",
    description: "Construye asistentes conversacionales omnicanal de alto nivel e intégralos con APIs (Make, n8n) para coordinar tareas automatizadas sin intervención humana.",
    isRecorded: true,
    youtubeId: "vg43utN8qkE",
    duration: "1h 15m",
    pdfUrl: "/docs/Glosario_Chatbot_Omnicanal_IA.pdf",
    pdfName: "Glosario Términos PDF"
  },
  {
    id: "sitebuilder_despliegue",
    title: "Sitebuilder con Despliegue en Vivo",
    date: "Lunes, 24 de Agosto",
    time: "Grabación Completa Disponible • HD",
    meet: "meet.google.com/jdp-dbyf-oyp",
    image: "/images/live_sitebuilder.png",
    icon: Layers,
    color: "from-orange-500 to-amber-600",
    description: "Descubre cómo estructurar un constructor de sitios web modular y desplegarlo en servidores productivos en tiempo récord usando automatizaciones.",
    isRecorded: true,
    videoUrl: "https://pub-57a421ac28b74a958833b59b68238216.r2.dev/masterclass_sitebuilder.mp4",
    duration: "1h 15m",
    deployedSiteUrl: "https://sitebuilder-hcg1708l8-astro-team-9cdc8608.vercel.app/"
  }
]

export default function MasterclassPage() {
  const [theme, setTheme] = useState("dark")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [expandedWorkshops, setExpandedWorkshops] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [copiedMeet, setCopiedMeet] = useState<string | null>(null)
  const [activeVideo, setActiveVideo] = useState<MasterclassItem | null>(null)
  const [filter, setFilter] = useState<"all" | "recorded" | "upcoming">("all")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("light", savedTheme === "light")
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
    
    // Select all 4 masterclasses by default for full videoteca access
    setSelectedClasses(MASTERCLASSES.map(c => c.title))
  }, [])

  const toggleWorkshopExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedWorkshops(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCheckboxChange = (title: string) => {
    if (selectedClasses.includes(title)) {
      if (selectedClasses.length > 1) {
        setSelectedClasses(selectedClasses.filter(c => c !== title))
      } else {
        toast({
          title: "Selección requerida",
          description: "Debes seleccionar al menos una Masterclass para registrarte.",
          variant: "destructive"
        })
      }
    } else {
      setSelectedClasses([...selectedClasses, title])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos vacíos",
        description: "Por favor, completa tu nombre y correo electrónico.",
        variant: "destructive"
      })
      return
    }

    const emailCheck = validateEmailClient(email)
    if (!emailCheck.isValid) {
      toast({
        title: "Correo inválido",
        description: emailCheck.reason || "Por favor, ingresa un correo real.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/masterclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          masterclasses: selectedClasses
        })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "Error al procesar el registro")
      }

      setIsRegistered(true)
      toast({
        title: "¡Inscripción Exitosa! 🎉",
        description: "Has asegurado tu lugar en las Masterclasses y acceso a las grabaciones."
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error al registrar",
        description: err.message || "Hubo un problema de conexión. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = (meetUrl: string) => {
    navigator.clipboard.writeText(meetUrl)
    setCopiedMeet(meetUrl)
    toast({
      title: "Enlace copiado",
      description: "El enlace de Google Meet se copió al portapapeles."
    })
    setTimeout(() => setCopiedMeet(null), 2000)
  }

  const upcomingClasses = MASTERCLASSES.filter(mc => !mc.isRecorded)
  const recordedClasses = MASTERCLASSES.filter(mc => mc.isRecorded)

  const filteredMasterclasses = MASTERCLASSES.filter(mc => {
    if (filter === "recorded") return mc.isRecorded
    if (filter === "upcoming") return !mc.isRecorded
    return true
  })

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AntigravityParticles />
      </div>

      {/* Header / Nav */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform shrink-0" />
            <span>Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-mono text-[10px] sm:text-xs text-primary/80 uppercase tracking-wider sm:tracking-widest bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 shrink-0" />
              <span>Ciclo Masterclasses <span className="hidden xs:inline">En Vivo & HD</span></span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 md:py-14 space-y-12 sm:space-y-16">
        
        {/* HERO & TOP REGISTRATION SECTION (ABOVE THE FOLD ON MOBILE & DESKTOP) */}
        <section className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span>🎉 Ciclo Completo Finalizado • 4 Clases Grabadas</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-sky-300 to-emerald-200 leading-tight">
              Videoteca de Masterclasses Vibe Coding e IA
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Las 4 masterclasses en vivo han finalizado. Registra tu correo para desbloquear el <span className="text-indigo-300 font-semibold">acceso inmediato a las 4 grabaciones en HD</span>, prompts probados y guías descargables en PDF.
            </p>

            {/* Trust points */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] sm:text-xs text-slate-300">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>100% Gratuito</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] sm:text-xs text-slate-300">
                <Video className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>4 Grabaciones HD</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] sm:text-xs text-slate-300">
                <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>PDFs & Prompts</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] sm:text-xs text-slate-300">
                <MessageSquare className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Grupo WhatsApp</span>
              </div>
            </div>

            {/* Quick Link to Grabaciones */}
            <div className="pt-2 border-t border-slate-800/80 hidden lg:block">
              <a 
                href="#clases-grabadas"
                className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Film className="h-4 w-4 text-emerald-400" />
                <span>Ver catálogo de grabaciones completas (4 disponibles) ↓</span>
              </a>
            </div>
          </div>

          {/* Right Column: UNLOCK VIDEOTECA FORM */}
          <div className="lg:col-span-7">
            {!isRegistered ? (
              <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 relative overflow-hidden space-y-5 sm:space-y-6">
                
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                      <span>Desbloquear Videoteca Completa</span>
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      Ingresa tu correo para ver las 4 grabaciones HD y descargar el material:
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold shrink-0">
                    4 Clases Grabadas
                  </span>
                </div>

                {/* 4 RECORDED WORKSHOPS LIST */}
                <div className="space-y-2.5">
                  {MASTERCLASSES.map((mc, idx) => {
                    const Icon = mc.icon
                    const isExpanded = !!expandedWorkshops[mc.id]

                    return (
                      <div 
                        key={mc.id}
                        className="rounded-xl sm:rounded-2xl border border-indigo-500/30 bg-indigo-950/20 overflow-hidden transition-all duration-200"
                      >
                        {/* Collapsed Bar */}
                        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>

                            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 text-indigo-400">
                              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>

                            <div className="min-w-0 pr-1">
                              <h3 className="text-xs sm:text-sm font-bold leading-tight text-slate-100">
                                Clase {idx + 1}: {mc.title}
                              </h3>
                              <p className="text-[10px] sm:text-xs text-emerald-400/90 font-mono mt-0.5">
                                Grabación HD ({mc.duration || "1h 15m"})
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleWorkshopExpand(mc.id, e)}
                            className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-mono touch-manipulation"
                            title={isExpanded ? "Ocultar detalles" : "Ver detalles"}
                          >
                            <span className="hidden sm:inline text-slate-400">
                              {isExpanded ? "Menos info" : "Detalles"}
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Collapsible Details Body */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-1.5 border-t border-slate-800/60 bg-slate-950/70 text-xs text-slate-300 space-y-2 animate-fade-in">
                            <p className="leading-relaxed text-slate-300 text-[11px] sm:text-xs">
                              {mc.description}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/40">
                              <span>Calidad: 1080p HD sin anuncios</span>
                              <span>Materiales: PDFs + Prompts incluidos</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* FORM INPUTS */}
                <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-800/80">
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-1.5">
                      <label className="text-[10px] sm:text-[11px] text-slate-400 font-mono uppercase tracking-wider block">
                        Nombre Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <input 
                          type="text"
                          required
                          placeholder="Tu nombre"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-200 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-1.5">
                      <label className="text-[10px] sm:text-[11px] text-slate-400 font-mono uppercase tracking-wider block">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <input 
                          type="email"
                          required
                          placeholder="tu@correo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-200 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer touch-manipulation min-h-[44px]"
                  >
                    {isSubmitting ? (
                      "Desbloqueando videoteca..."
                    ) : (
                      <>
                        <span>Desbloquear 4 Grabaciones & PDFs Gratis 🚀</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] sm:text-[11px] text-center text-slate-500 font-mono flex items-center justify-center gap-1.5">
                    <span>🔒</span> Acceso inmediato y gratuito a todo el material.
                  </p>
                </form>
              </div>
            ) : (
              /* SUCCESS BANNER */
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-800/80 bg-emerald-950/20 backdrop-blur-xl shadow-2xl text-center space-y-5 sm:space-y-6 animate-fade-in-up">
                <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-emerald-900/40 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 stroke-[2.5]" />
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-100">¡Videoteca Desbloqueada! 🎉</h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Tienes acceso instantáneo a las 4 grabaciones en HD y sus materiales descargables:
                  </p>
                </div>

                {/* Instant Access to all 4 recordings CTA */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2.5 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-300 flex items-center justify-center gap-1.5">
                    <Film className="h-4 w-4 text-indigo-400" /> Elige qué clase reproducir primero:
                  </p>
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => setActiveVideo(MASTERCLASSES.find(mc => mc.id === "sitebuilder_despliegue") || null)}
                      className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.98] transition-all gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer min-h-[44px]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Clase 4: Sitebuilder con Despliegue en Vivo
                    </button>
                    <button
                      onClick={() => setActiveVideo(MASTERCLASSES.find(mc => mc.id === "chatbot_automatizacion") || null)}
                      className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all gap-2 cursor-pointer min-h-[40px]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Clase 3: Chatbot Inteligente & Automatización
                    </button>
                    <button
                      onClick={() => setActiveVideo(MASTERCLASSES.find(mc => mc.id === "tokens_contexto") || null)}
                      className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all gap-2 cursor-pointer min-h-[40px]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Clase 2: Optimización de Tokens y Contexto
                    </button>
                    <button
                      onClick={() => setActiveVideo(MASTERCLASSES.find(mc => mc.id === "ciberseguridad") || null)}
                      className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all gap-2 cursor-pointer min-h-[40px]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Clase 1: Ciberseguridad en Vibe Coding
                    </button>
                  </div>
                </div>

                {/* WhatsApp Group CTA */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2.5 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                    📲 ¡Únete al Grupo de WhatsApp!
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-300">
                    Recibe recordatorios de inicio de clase y descargas exclusivas.
                  </p>
                  <a
                    href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#22c35e] text-white active:scale-[0.98] transition-all gap-2 shadow-lg shadow-[#25D366]/20 min-h-[44px]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.115-2.887-6.978C16.584 1.9 14.116.877 11.487.876c-5.441 0-9.865 4.42-9.869 9.864-.001 1.748.46 3.453 1.335 4.97L2.025 21.8l6.622-1.737zM18.17 14.85c-.3-.15-1.77-.875-2.045-.975-.275-.1-.475-.15-.675.15-.2.3-.77.975-.945 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.777-1.665-2.077-.175-.3-.02-.46.13-.61.135-.13.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.585-.675-.585-.175-.007-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.22 5.11 4.52.714.31 1.27.494 1.7.632.717.228 1.37.196 1.885.12.575-.085 1.77-.724 2.02-1.425.25-.7.25-1.3 1.175-1.425.075-.025.15-.15-.05-.3z"/>
                    </svg>
                    Unirme al Grupo de WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM SECTION: RECORDED CLASSES & WORKSHOPS ARCHIVE */}
        <section id="clases-grabadas" className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 border-t border-slate-800/80">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-mono font-semibold w-fit">
                <Film className="h-3.5 w-3.5 text-emerald-400" />
                Videoteca HD Completa
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Catálogo de Grabaciones (4 Sesiones)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Revive cualquiera de las 4 masterclasses con reproductor HD de alta velocidad, descarga los prompts y visita los sitios web desplegados en vivo.
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
              <Video className="h-4 w-4 text-emerald-400" />
              <span>4 de 4 Grabaciones Disponibles</span>
            </div>
          </div>

          {/* Featured Recorded Card (if available) */}
          {recordedClasses.length > 0 && filter !== "upcoming" && (() => {
            const latestRecorded = recordedClasses[recordedClasses.length - 1]
            return (
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900/80 to-slate-950 backdrop-blur-xl shadow-2xl text-left relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 group">
                <div className="space-y-2.5 sm:space-y-3 z-10 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs font-mono font-semibold">
                      <Film className="h-3.5 w-3.5 text-emerald-400" />
                      Última Grabación Publicada
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      {latestRecorded.duration || "1h 15m"} de clase
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-emerald-200 transition-colors">
                    Masterclass: {latestRecorded.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {latestRecorded.description}
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 z-10 flex flex-col sm:flex-row md:flex-col gap-2.5 sm:gap-3">
                  <button
                    onClick={() => setActiveVideo(latestRecorded)}
                    className="w-full md:w-auto py-3 px-5 rounded-xl sm:rounded-2xl font-bold text-xs bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer min-h-[44px]"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Ver Grabación Ahora
                  </button>
                  {latestRecorded.pdfUrl && (
                    <a
                      href={latestRecorded.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto py-2.5 px-4 rounded-xl sm:rounded-2xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Descargar {latestRecorded.pdfName || "Material PDF"}
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                  )}
                  {latestRecorded.deployedSiteUrl && (
                    <a
                      href={latestRecorded.deployedSiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto py-2.5 px-4 rounded-xl sm:rounded-2xl font-semibold text-xs bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-700/80 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <ExternalLink className="h-4 w-4 text-sky-400" />
                      Visitar Sitio Desplegado en Vivo
                    </a>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Masterclasses Grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredMasterclasses.map((mc) => {
              const Icon = mc.icon
              const isSelected = selectedClasses.includes(mc.title)
              return (
                <div 
                  key={mc.id}
                  onClick={() => {
                    if (mc.isRecorded) {
                      setActiveVideo(mc)
                    } else if (!isRegistered) {
                      handleCheckboxChange(mc.title)
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                    mc.isRecorded
                      ? "border-emerald-500/40 bg-slate-900/60 hover:border-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/5"
                      : isRegistered 
                        ? "border-slate-800 bg-slate-900/35"
                        : isSelected 
                          ? "border-indigo-500 bg-slate-900/80 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10 cursor-pointer"
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-700 cursor-pointer"
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                    <Image 
                      src={mc.image} 
                      alt={mc.title}
                      fill
                      className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap gap-2">
                      {mc.isRecorded ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/90 text-slate-950 rounded-full text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-md">
                          <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          Grabación Disponible • {mc.duration}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-950/80 border border-slate-700/80 rounded-full text-[10px] sm:text-xs font-medium text-slate-200 backdrop-blur-sm">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400" />
                          {mc.date}
                        </span>
                      )}
                    </div>

                    {/* Play Button Overlay on hover for recorded videos */}
                    {mc.isRecorded && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-950/40 opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className="p-3.5 sm:p-4 rounded-full bg-emerald-500 text-slate-950 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/40">
                          <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-xl font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {mc.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-indigo-400/90 font-mono">
                          {mc.time}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {mc.description}
                    </p>

                    {/* Actions */}
                    {mc.isRecorded ? (
                      <div className="pt-1 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveVideo(mc)
                          }}
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Reproducir Clase Grabada
                        </button>
                        {mc.pdfUrl && (
                          <a
                            href={mc.pdfUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2 px-4 rounded-xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 min-h-[38px]"
                          >
                            <FileText className="h-3.5 w-3.5 text-emerald-400" />
                            Descargar {mc.pdfName || "Material PDF"}
                            <Download className="h-3 w-3 text-slate-400" />
                          </a>
                        )}
                        {mc.deployedSiteUrl && (
                          <a
                            href={mc.deployedSiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2 px-4 rounded-xl font-semibold text-xs bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-800/80 transition-all flex items-center justify-center gap-2 min-h-[38px]"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                            Visitar Sitio Desplegado en Vivo
                          </a>
                        )}
                      </div>
                    ) : !isRegistered ? (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-mono text-slate-500">
                          {isSelected ? "✓ Seleccionada" : "+ Seleccionar"}
                        </span>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected 
                            ? "border-indigo-500 bg-indigo-500 text-slate-950"
                            : "border-slate-700 group-hover:border-slate-500"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    ) : (
                      selectedClasses.includes(mc.title) && (
                        <div className="pt-3 border-t border-slate-850 space-y-2">
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                            <span className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-[200px]">
                              {mc.meet}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyLink(mc.meet)
                                }}
                                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                                title="Copiar enlace"
                              >
                                {copiedMeet === mc.meet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                              <a 
                                href={`https://${mc.meet}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-md hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 transition-colors"
                                title="Unirme a la llamada"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </section>

        {/* CONSULTATION & NEXT COHORT CTA BANNER */}
        <section className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>¿Necesitas una solución a medida?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              ¿Quieres implementar Vibe Coding y Asistentes de IA en tu Empresa?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Agenda una sesión de consultoría 1 a 1 para estructurar la arquitectura, integraciones con APIs y automatizaciones para tu equipo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/#contacto"
              className="py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all text-center shadow-lg shadow-indigo-500/25 min-h-[44px] flex items-center justify-center gap-2"
            >
              Agendar Consultoría 1 a 1 →
            </Link>
            <a
              href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all text-center min-h-[44px] flex items-center justify-center gap-2"
            >
              Unirme a la Comunidad
            </a>
          </div>
        </section>

      </main>

      {/* Video Player Modal */}
      {activeVideo && (activeVideo.videoUrl || activeVideo.youtubeId) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative w-full max-w-5xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <MasterclassVideoPlayer
              src={activeVideo.videoUrl}
              youtubeId={activeVideo.youtubeId}
              title={activeVideo.title}
              subtitle={activeVideo.date}
              poster={activeVideo.image}
              autoPlay={true}
              onClose={() => setActiveVideo(null)}
            />

            <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center justify-between text-[10px] sm:text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Transmitiendo en servidor de alta velocidad</span>
              </div>
              <span className="hidden xs:inline">Calidad 1080p HD</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Toaster />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
