"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Check, 
  Terminal, 
  Play, 
  Sparkles, 
  Users, 
  Award, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  CreditCard,
  Code2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Cpu,
  MessageSquare,
  Rocket,
  Handshake,
  Database,
  Bot,
  TrendingUp,
  Presentation,
  Target,
  Zap,
  Building2,
  Flame,
  Compass,
  Brain,
  Download,
  FileText
} from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ImageToParticles } from "@/components/image-to-particles"
import { ScrollHouseSequence } from "@/components/scroll-house-sequence"
import { Footer } from "@/components/footer"
import { VIBECODE_CONFIG } from "@/lib/vibecode-config"
import { validateEmailClient } from "@/lib/email-validator-client"
import VibecodePerkPopup from "@/components/vibecode-perk-popup"
import LanguageToggle from "@/components/language-toggle"
import { vibecodeTranslations, type Locale } from "@/lib/vibecode-translations"

interface StatusData {
  total_seats: number
  seats_taken: number
  seats_remaining: number
  golden_spots_remaining: number
  active_phase: number
  active_price: number
  discount_percentage: number
  next_phase_deadline: string
  seconds_to_next_phase: number
  official_launch_date: string
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const domRef = useRef<HTMLSpanElement | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
          if (domRef.current) {
            observer.unobserve(domRef.current)
          }
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = domRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    let start = 0
    const end = value
    if (start === end) {
      setCount(end)
      return
    }

    const totalMilliseconds = duration
    const incrementTime = Math.max(Math.floor(totalMilliseconds / end), 15)

    const timer = setInterval(() => {
      start += 1
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration, hasStarted])

  return <span ref={domRef}>{count}</span>
}

function VibecodeLandingContent({ locale = "es" }: { locale?: Locale }) {
  const t = vibecodeTranslations[locale] || vibecodeTranslations.es
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("light", savedTheme === "light")
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("light", newTheme === "light")
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const searchParams = useSearchParams()
  const router = useRouter()
  const statusParam = searchParams.get("status")

  // Form enrollment states
  const [enrollName, setEnrollName] = useState("")
  const [enrollEmail, setEnrollEmail] = useState("")
  const [enrollPhone, setEnrollPhone] = useState("")
  const [enrollCoupon, setEnrollCoupon] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [shouldScrollTimeline, setShouldScrollTimeline] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "crypto" | "bank" | "paypal">("mercadopago")
  const [showCryptoModal, setShowCryptoModal] = useState(false)
  const [cryptoAmount, setCryptoAmount] = useState<number>(0)
  const [isPaypalSdkLoaded, setIsPaypalSdkLoaded] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [bankAmount, setBankAmount] = useState<number>(0)
  const [bankPhasePrice, setBankPhasePrice] = useState<number>(297)
  const [currentRegId, setCurrentRegId] = useState<string>("")
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null)
  const [receiptMime, setReceiptMime] = useState<string>("")
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
  const [receiptUploadResult, setReceiptUploadResult] = useState<{ verified: boolean; message: string } | null>(null)

  // Coupon validation states
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null)
  const [couponFixedPrice, setCouponFixedPrice] = useState<number | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null)

  // Status API states (defaulting to Tramo 1 for G2)
  const [status, setStatus] = useState<StatusData>({
    total_seats: 11,
    seats_taken: 2,
    seats_remaining: 9,
    golden_spots_remaining: 3,
    active_phase: 1,
    active_price: 209,
    discount_percentage: 30,
    next_phase_deadline: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days default
    seconds_to_next_phase: 172800,
    official_launch_date: new Date(VIBECODE_CONFIG.launchDate).toISOString(),
  })
  
  const [progressBarProps, setProgressBarProps] = useState({
    progressPercent: 0,
    currentDayLabel: "Hoy",
    activePhase: 1
  })

  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.getElementsByTagName("head")[0].appendChild(link)
    }
    link.type = "image/png"
    link.href = "/images/vibecode-logo-icon.png"
  }, [])

  useEffect(() => {
    if (paymentMethod === "paypal" && !isPaypalSdkLoaded) {
      if ((window as any).paypal) {
        setIsPaypalSdkLoaded(true)
        return
      }
      const script = document.createElement("script")
      script.src = `https://www.paypal.com/sdk/js?client-id=AaEhTGJ8mMOtY3JzFReDEx9j3TvYM0lKBeEXW7qrme3MJ7Yk1LOSuZgFQgiOVjAiMdGTDa5Ib8CLoTP-&currency=USD`
      script.async = true
      script.onload = () => {
        setIsPaypalSdkLoaded(true)
      }
      document.body.appendChild(script)
    }
  }, [paymentMethod, isPaypalSdkLoaded])

  useEffect(() => {
    const startDate = new Date(VIBECODE_CONFIG.timelineStart)
    const endDate = new Date(VIBECODE_CONFIG.timelineEnd)
    const d1 = new Date(VIBECODE_CONFIG.d1)
    const d2 = new Date(VIBECODE_CONFIG.d2)
    const d3 = new Date(VIBECODE_CONFIG.d3)
    const now = new Date()

    // Format current day label (e.g. "Hoy (23 sept)")
    const formatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
    const dayLabel = `Hoy (${formatter.format(now)})`

    // Determine active phase based on current date
    let activePhase = 1
    if (now > d3) activePhase = 4
    else if (now > d2) activePhase = 3
    else if (now > d1) activePhase = 2

    // Mapeo por tramos correspondiente a las marcas visuales de la barra (33.33%, 56.66%, 80.00%)
    const TICK1 = 33.33
    const TICK2 = 56.66
    const TICK3 = 80.00

    let pct = 0
    if (now <= startDate) {
      pct = 0
    } else if (now <= d1) {
      const elapsed = now.getTime() - startDate.getTime()
      const duration = d1.getTime() - startDate.getTime()
      pct = Math.min(TICK1, (elapsed / duration) * TICK1)
    } else if (now <= d2) {
      const elapsed = now.getTime() - d1.getTime()
      const duration = d2.getTime() - d1.getTime()
      pct = TICK1 + Math.min(TICK2 - TICK1, (elapsed / duration) * (TICK2 - TICK1))
    } else if (now <= d3) {
      const elapsed = now.getTime() - d2.getTime()
      const duration = d3.getTime() - d2.getTime()
      pct = TICK2 + Math.min(TICK3 - TICK2, (elapsed / duration) * (TICK3 - TICK2))
    } else if (now <= endDate) {
      const elapsed = now.getTime() - d3.getTime()
      const duration = endDate.getTime() - d3.getTime()
      pct = TICK3 + Math.min(100 - TICK3, (elapsed / duration) * (100 - TICK3))
    } else {
      pct = 100
    }

    setProgressBarProps({
      progressPercent: pct,
      currentDayLabel: dayLabel,
      activePhase
    })
  }, [status.official_launch_date])

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [activeConsoleTab, setActiveConsoleTab] = useState("caracteristicas")
  const [isConsoleClosed, setIsConsoleClosed] = useState(false)
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false)
  const [isPlayRippling, setIsPlayRippling] = useState(false)
  const [isRunningChatbotAnimation, setIsRunningChatbotAnimation] = useState(false)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [showNotification, setShowNotification] = useState<"success" | "failed" | null>(null)

  const tabsRef = useRef<HTMLDivElement>(null)

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 150
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  const renderConsole = (isModal: boolean) => {
    return (
      <div className={`bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-300 font-mono text-xs w-full transition-all duration-300 ${
        isModal 
          ? "h-full flex flex-col" 
          : "max-w-lg mx-auto"
      }`}>
        {/* Card Header bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2 group/controls">
            {/* Red button (Close) */}
            <button 
              onClick={() => {
                if (isModal) {
                  setIsConsoleExpanded(false)
                }
                setIsConsoleClosed(true)
              }}
              className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-[8px] text-red-900 font-bold transition-all relative animate-none"
              title="Cerrar"
            >
              <span className="opacity-0 group-hover/controls:opacity-100 transition-opacity absolute">x</span>
            </button>
            
            {/* Orange/Yellow button (Minimize/Collapse) */}
            <button 
              onClick={() => {
                if (isModal) {
                  setIsConsoleExpanded(false)
                }
                setIsConsoleCollapsed(!isConsoleCollapsed)
              }}
              className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 flex items-center justify-center text-[8px] text-yellow-900 font-bold transition-all relative animate-none"
              title={isConsoleCollapsed ? "Expandir" : "Colapsar"}
            >
              <span className="opacity-0 group-hover/controls:opacity-100 transition-opacity absolute">-</span>
            </button>
            
            {/* Green button (Maximize/Expand) */}
            <button 
              onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 flex items-center justify-center text-[6px] text-emerald-900 font-black transition-all relative animate-none"
              title={isModal ? "Restaurar" : "Maximizar"}
            >
              <span className="opacity-0 group-hover/controls:opacity-100 transition-opacity absolute">▢</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-400 font-sans tracking-wide">
            mi-aplicacion-web
          </div>
          {/* Play button with ripple wave animation */}
          <button
            className={`relative flex items-center justify-center w-6 h-6 rounded-full hover:bg-slate-700/50 transition-all ${
              !isRunningChatbotAnimation 
                ? "animate-[pulse_2s_infinite] shadow-[0_0_8px_rgba(52,211,153,0.4)] border border-emerald-500/30" 
                : ""
            }`}
            title="Run"
            onClick={() => {
              if (isPlayRippling || isRunningChatbotAnimation) return
              setIsPlayRippling(true)
              setTimeout(() => setIsPlayRippling(false), 900)

              setIsRunningChatbotAnimation(true)
              setTerminalLogs([])

              const celebrities = [
                // 1. Pioneros de la Computación
                "Steve Jobs · Apple Co-founder",
                "Alan Turing · Codebreaker",
                "Grace Hopper · COBOL Creator",
                "Ada Lovelace · First Programmer",
                "Linus Torvalds · Linux Creator",
                "Barbara Liskov · Liskov Principle",

                // 2. Grandes Marketers
                "Frank Kern · Internet Marketer",
                "Tony Robbins · Performance Coach",
                "Gary V. · VeeFriends Creator",
                "Alex Hormozi · Skool Founder",
                "Robert Kiyosaki · Rich Dad Poor Dad",

                // 3. Hollywood Actors
                "Keanu Reeves · Matrix & Wick",
                "Arnold Schwarzenegger · Terminator",
                "Robert Downey Jr. · Iron Man Actor",
                "Scarlett Johansson · Black Widow Actress",
                "Leonardo DiCaprio · Inception Actor",

                // 4. Pop Culture & Sci-Fi AIs (Nuestra Idea)
                "JARVIS · Stark AI",
                "Yoda · Jedi Master",
                "Sherlock Holmes · Master Detective",
                "Jack Sparrow · Pirate Captain",
                "Darth Vader · Sith Lord"
              ]
              const character = celebrities[Math.floor(Math.random() * celebrities.length)]

              const logs = [
                `$ bun run start-agent --character="${character}"`,
                "⚙️ Cargando configuración de agente de lenguaje natural...",
                "--------------------------------------------------",
                "✨ LOGRAR TENER IA ATENDIENDO QUE NO PARECE IA ✨",
                "--------------------------------------------------",
                `🧠 Inicializando personalidad ficticia: ${character}...`,
                "⚡ Configuración sin límites: 100% personalizable",
                `🟢 ${character} listo y en línea!`,
                "🚀 Abriendo widget del chatbot..."
              ]

              logs.forEach((log, index) => {
                setTimeout(() => {
                  setTerminalLogs(prev => [...prev, log])
                  if (index === logs.length - 1) {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("open-chatbot-eustacio", { detail: { character } }));
setIsRunningChatbotAnimation(false);

// Determine if we should scroll based on the final log content
const triggerWords = ["pronto pago", "descuento", "precio", "precios", "línea de tiempo"]; 
const lastLog = logs[logs.length - 1] || "";
const shouldScroll = triggerWords.some(w => lastLog.toLowerCase().includes(w));
if (shouldScroll) {
  const timelineEl = document.getElementById("timeline");
  if (timelineEl) {
    timelineEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
                      setIsRunningChatbotAnimation(false);
    const timelineEl = document.getElementById('timeline');
    if (timelineEl) {
      timelineEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
                    }, 1200)
                  }
                }, (index + 1) * 350)
              })
            }}
          >
            <Play className="h-3 w-3 text-emerald-400 relative z-10" />
            {isPlayRippling && (
              <>
                <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-[playRipple_0.9s_ease-out_0ms_forwards]" />
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-[playRipple_0.9s_ease-out_150ms_forwards]" />
                <span className="absolute inset-0 rounded-full bg-emerald-400/10 animate-[playRipple_0.9s_ease-out_300ms_forwards]" />
              </>
            )}
          </button>
          <style>{`
            @keyframes playRipple {
              0%   { transform: scale(1);   opacity: 1; }
              100% { transform: scale(4.5); opacity: 0; }
            }
            .scrollbar-custom::-webkit-scrollbar {
              width: 5px;
              height: 4px;
            }
            .scrollbar-custom::-webkit-scrollbar-track {
              background: rgba(15, 23, 42, 0.3);
            }
            .scrollbar-custom::-webkit-scrollbar-thumb {
              background: #334155;
              border-radius: 2px;
            }
            .scrollbar-custom::-webkit-scrollbar-thumb:hover {
              background: #475569;
            }
            .scrollbar-custom {
              -ms-overflow-style: auto;
              scrollbar-width: thin;
              scrollbar-color: #334155 rgba(15, 23, 42, 0.3);
            }
          `}</style>
        </div>
        
        {(!isConsoleCollapsed || isModal) && (
          <>
            {/* Tab Navigation Wrapper */}
            <div className="relative flex items-center bg-slate-900/60 border-b border-slate-800">
              <div 
                ref={tabsRef}
                className="flex-1 px-4 flex gap-3 sm:gap-4 text-xs font-sans text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-custom scroll-smooth"
              >
                <button 
                  onClick={() => setActiveConsoleTab("caracteristicas")}
                  className={`py-2 border-b-2 transition ${activeConsoleTab === "caracteristicas" ? "border-indigo-500 text-white font-medium" : "border-transparent hover:text-slate-200"} shrink-0`}
                >
                  Caracteristicas.json
                </button>
                <button 
                  onClick={() => setActiveConsoleTab("horarios")}
                  className={`py-2 border-b-2 transition ${activeConsoleTab === "horarios" ? "border-indigo-500 text-white font-medium" : "border-transparent hover:text-slate-200"} shrink-0`}
                >
                  Horarios.json
                </button>
                <button 
                  onClick={() => setActiveConsoleTab("pricing")}
                  className={`py-2 border-b-2 transition ${activeConsoleTab === "pricing" ? "border-indigo-500 text-white font-medium" : "border-transparent hover:text-slate-200"} shrink-0`}
                >
                  Precios.json
                </button>
                <button 
                  onClick={() => setActiveConsoleTab("faq")}
                  className={`py-2 border-b-2 transition ${activeConsoleTab === "faq" ? "border-indigo-500 text-white font-medium" : "border-transparent hover:text-slate-200"} shrink-0`}
                >
                  FAQ.json
                </button>
                <button 
                  onClick={() => setActiveConsoleTab("lograras")}
                  className={`py-2 border-b-2 transition flex items-center gap-1.5 ${
                    activeConsoleTab === "lograras" 
                      ? "border-emerald-500 text-white font-medium" 
                      : "border-transparent text-emerald-400 hover:text-emerald-300 font-semibold"
                  } shrink-0`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Lograras.json
                </button>
              </div>
              
              {/* Navigation Arrows */}
              <div className="flex border-l border-slate-800 bg-slate-900 shrink-0 self-stretch">
                <button 
                  onClick={() => scrollTabs("left")}
                  className="px-2.5 hover:bg-slate-800/80 text-slate-400 hover:text-white transition flex items-center justify-center border-r border-slate-800 self-stretch"
                  title="Desplazar izquierda"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => scrollTabs("right")}
                  className="px-2.5 hover:bg-slate-800/80 text-slate-400 hover:text-white transition flex items-center justify-center self-stretch"
                  title="Desplazar derecha"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Code/Output Area */}
            <div className={`p-4 sm:p-5 overflow-auto leading-relaxed select-none scrollbar-custom ${
              isModal ? "flex-1 text-[12px] sm:text-xs" : "h-64 text-[11px]"
            }`}>
              {isRunningChatbotAnimation ? (
                <pre className="text-slate-300">
                  <code>
                    {terminalLogs.map((log, i) => {
                      if (log.startsWith("$")) {
                        return <div key={i} className="text-slate-400 font-bold mb-1.5">{log}</div>
                      }
                      if (log.startsWith("💡")) {
                        return <div key={i} className="text-amber-400 font-bold my-2 whitespace-pre-wrap leading-relaxed">{log}</div>
                      }
                      if (log.startsWith("🟢")) {
                        return <div key={i} className="text-emerald-400 font-bold my-1">{log}</div>
                      }
                      if (log.startsWith("🚀")) {
                        return <div key={i} className="text-indigo-400 font-bold mt-1.5 animate-pulse">{log}</div>
                      }
                      return <div key={i} className="mb-0.5">{log}</div>
                    })}
                  </code>
                </pre>
              ) : (
                <>
                  {activeConsoleTab === "caracteristicas" && (
                <pre className="text-slate-300">
                  <code>
  &#123;<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"bootcamp"</span>: <span className="text-amber-400">"Crea Tu App (Vibecode Lab)"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"formato"</span>: <span className="text-amber-400">"100% en vivo & práctico"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"mentoria"</span>: <span className="text-amber-400">"2 horas individual 1-a-1"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"proyectos_reales"</span>: [<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Base de datos y Login seguro"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Pasarela de pagos real (Mercado Pago)"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Envío automático de emails"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Despliegue y publicación en internet"</span><br/>
  &nbsp;&nbsp;],<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"asistencia_ia"</span>: <span className="text-amber-400">"Gemini como tutor personal"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"cupos_maximos"</span>: <span className="text-emerald-400">11</span><br/>
  &#125;
                  </code>
                </pre>
              )}

              {activeConsoleTab === "horarios" && (
                <pre className="text-slate-300">
                  <code>
  &#123;<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"curso"</span>: <span className="text-amber-400">"Bootcamp Vibecode Lab"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"generacion"</span>: <span className="text-amber-400">"Generación 2"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"duracion_total"</span>: <span className="text-amber-400">"7 clases (7 semanas)"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"dia_clase"</span>: <span className="text-amber-400">"Miércoles"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"hora_clase"</span>: <span className="text-amber-400">"20:00 a 22:30 hrs (Chile)"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"inicio_clases"</span>: <span className="text-amber-400">"Miércoles 25 de Noviembre de 2026"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"mentoria_individual"</span>: &#123;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"beneficio_primeros_5"</span>: <span className="text-amber-400">"2 horas (1h inicio + 1h final) 100% incluidas"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"del_6_en_adelante"</span>: <span className="text-amber-400">"$50 USD por sesión"</span><br/>
  &nbsp;&nbsp;&#125;,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"grabaciones"</span>: <span className="text-indigo-300">"Disponibles al día siguiente"</span><br/>
  &#125;
                  </code>
                </pre>
              )}

              {activeConsoleTab === "pricing" && (
                <pre className="text-slate-300">
                  <code>
  &#123;<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"moneda"</span>: <span className="text-amber-400">"USD"</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"precio_lista"</span>: <span className="text-emerald-400">297</span>,<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"estrategia_descuentos"</span>: &#123;<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"tramo_1_extra"</span>: &#123;<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"label"</span>: <span className="text-amber-400">"Tramo 1 – 20% extra"</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"precio"</span>: <span className="text-emerald-400">209</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"deadline"</span>: <span className="text-amber-400">"08-11-2026"</span><br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"tramo_2_extra"</span>: &#123;<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"label"</span>: <span className="text-amber-400">"Tramo 2 – 15% extra"</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"precio"</span>: <span className="text-emerald-400">237</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"deadline"</span>: <span className="text-amber-400">"15-11-2026"</span><br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"tramo_3_extra"</span>: &#123;<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"label"</span>: <span className="text-amber-400">"Tramo 3 – 10% extra"</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"precio"</span>: <span className="text-emerald-400">265</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"deadline"</span>: <span className="text-amber-400">"22-11-2026"</span><br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br/>
    &nbsp;&nbsp;&#125;,<br/>
    &nbsp;&nbsp;<span className="text-emerald-400">"cupos"</span>: &#123;<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"total"</span>: <span className="text-emerald-400">{status.total_seats}</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"porcentaje_ocupacion"</span>: <span className="text-amber-400">"{Math.round((status.seats_taken / status.total_seats) * 100)}%"</span><br/>
    &nbsp;&nbsp;<span className="text-emerald-400">"tramo_final"</span>: &#123;<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"label"</span>: <span className="text-amber-400">"Último tramo – extra según inscritos"</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"max_extra_less_10"</span>: <span className="text-emerald-400">40</span>,<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"max_extra_10_or_more"</span>: <span className="text-emerald-400">5</span>,<br/>
    &nbsp;&nbsp;&#125;,<br/>
  &#125;
                  </code>
                </pre>
              )}

              {activeConsoleTab === "faq" && (
                <pre className="text-slate-300">
                  <code>
  [<br/>
  &nbsp;&nbsp;&#123;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"pregunta"</span>: <span className="text-amber-400">"¿Necesito experiencia?"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"respuesta"</span>: <span className="text-amber-400">"No, partimos desde cero."</span><br/>
  &nbsp;&nbsp;&#125;,<br/>
  &nbsp;&nbsp;&#123;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"pregunta"</span>: <span className="text-amber-400">"¿Cuáles son los horarios?"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"respuesta"</span>: <span className="text-amber-400">"Miércoles 20:00 a 22:30 en vivo + 2h mentoría (primeros 5 inscritos)."</span><br/>
  &nbsp;&nbsp;&#125;,<br/>
  &nbsp;&nbsp;&#123;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"pregunta"</span>: <span className="text-amber-400">"¿Y si no puedo asistir?"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"respuesta"</span>: <span className="text-amber-400">"Las sesiones se graban y suben al día siguiente."</span><br/>
  &nbsp;&nbsp;&#125;,<br/>
  &nbsp;&nbsp;&#123;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"pregunta"</span>: <span className="text-amber-400">"¿Cómo funciona el descuento?"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"respuesta"</span>: <span className="text-amber-400">"Sube de precio por tramos según fecha."</span><br/>
  &nbsp;&nbsp;&#125;,<br/>
  &nbsp;&nbsp;&#123;<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"pregunta"</span>: <span className="text-amber-400">"¿Qué computador necesito?"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">"respuesta"</span>: <span className="text-amber-400">"Cualquiera con 8GB RAM de los últimos 6-8 años."</span><br/>
  &nbsp;&nbsp;&#125;<br/>
  ]
                  </code>
                </pre>
              )}

              {activeConsoleTab === "lograras" && (
                <pre className="text-slate-300">
                  <code>
  &#123;<br/>
  &nbsp;&nbsp;<span className="text-emerald-400">"que_lograras"</span>: [<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Tu aplicación funcionando en internet"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Sistema de cobros integrado (tarjetas)"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Registro e inicio de sesión seguro"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Envío automático de correos"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Programación asistida por IA"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Mentoría 1-a-1 personalizada (incluida primeros 5 cupos / $50 USD desde el 6°)"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Bono 3 meses Google AI Pro por solo ~$6 USD (5.400 CLP) primeros 10 inscritos"</span>,<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">"Integración de agentes de IA a tu desarrollo"</span><br/>
  &nbsp;&nbsp;]<br/>
  &#125;
                  </code>
                </pre>
              )}
                </>
              )}
            </div>

            {/* Terminal Status Bar / Footer */}
            <div className="bg-slate-900 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[10px] font-sans text-slate-500 select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>mi-aplicacion-web</span>
              </div>
              <div className="font-mono text-[9px] text-slate-600">JSON | UTF-8</div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Fetch stats from local API server
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/vibecode/status")
      if (res.ok) {
        const data: StatusData = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.warn("Failed fetching API status. Running with client-side clock defaults.", err)
    }
  }

  useEffect(() => {
    fetchStatus()
    
    // Check url params for payment results
    if (statusParam === "success") {
      setShowNotification("success")

      // Auto confirm payment and trigger welcome email
      const regId = searchParams.get("reg_id") || searchParams.get("external_reference")
      const prefId = searchParams.get("preference_id") || searchParams.get("pref_id")
      const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id")

      fetch("/api/vibecode/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reg_id: regId,
          preference_id: prefId,
          payment_id: paymentId,
        }),
      }).catch((err) => console.error("Error confirming payment on return:", err))

      // Clear status parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (statusParam === "failed") {
      setShowNotification("failed")
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Check for coupon parameter
    const couponParam = searchParams.get("coupon")
    if (couponParam) {
      setEnrollCoupon(couponParam.toUpperCase())
      setShowFormModal(true)
    }
  }, [statusParam, searchParams])

  // Listen for chatbot coupon offer to automatically open enrollment
  useEffect(() => {
    const handleOpenEnroll = (e: Event) => {
      const customEvent = e as CustomEvent
      const coupon = customEvent.detail?.coupon
      const name = customEvent.detail?.name
      if (coupon) {
        setEnrollCoupon(coupon.toUpperCase())
      }
      if (name) {
        // Capitalize name nicely
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        setEnrollName(formattedName)
      }
      setShowFormModal(true)
    }
    window.addEventListener("open-enrollment-modal", handleOpenEnroll)
    return () => {
      window.removeEventListener("open-enrollment-modal", handleOpenEnroll)
    }
  }, [])

  // Dynamic coupon validation with debounce
  useEffect(() => {
    const trimmed = enrollCoupon.trim()
    if (!trimmed) {
      setCouponDiscount(null)
      setCouponError(null)
      setCouponSuccessMessage(null)
      setIsValidatingCoupon(false)
      return
    }

    setIsValidatingCoupon(true)
    setCouponError(null)
    setCouponSuccessMessage(null)

    let active = true

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/vibecode/validate-coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coupon_code: trimmed }),
        })

        const data = await response.json()

        if (!active) return

        if (!response.ok) {
          setCouponError(data.error || "Cupón inválido.")
          setCouponDiscount(null)
          setCouponFixedPrice(null)
          setCouponSuccessMessage(null)
        } else {
          if (data.is_test_1usd || data.final_price === 1) {
            setCouponFixedPrice(1)
            setCouponDiscount(null)
            setCouponSuccessMessage(`¡Cupón de prueba ${data.coupon_code} de $1 USD aplicado! (~$950 CLP)`)
          } else {
            setCouponFixedPrice(null)
            setCouponDiscount(data.discount_pct)
            setCouponSuccessMessage(`¡Cupón ${data.coupon_code} de ${data.discount_pct}% aplicado!`)
          }
          setCouponError(null)
        }
      } catch (err) {
        if (!active) return
        console.error("Error validating coupon:", err)
        setCouponError("Error al conectar con el servidor.")
        setCouponDiscount(null)
        setCouponFixedPrice(null)
        setCouponSuccessMessage(null)
      } finally {
        if (active) {
          setIsValidatingCoupon(false)
        }
      }
    }, 450)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [enrollCoupon])

  // Reset coupon state when modal is closed
  useEffect(() => {
    if (!showFormModal) {
      setEnrollCoupon("")
      setCouponDiscount(null)
      setCouponFixedPrice(null)
      setCouponError(null)
      setCouponSuccessMessage(null)
      setIsValidatingCoupon(false)
    }
  }, [showFormModal])

  // Countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      const deadline = new Date(status.next_phase_deadline).getTime()
      const now = new Date().getTime()
      const diff = deadline - now

      if (diff <= 0) {
        clearInterval(timer)
        fetchStatus() // reload pricing
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [status.next_phase_deadline])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Form submission handler
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrollError(null)

    // Validar el correo en el cliente (sintaxis + desechables)
    const emailCheck = validateEmailClient(enrollEmail)
    if (!emailCheck.isValid) {
      setEnrollError(emailCheck.reason || "Por favor ingresa un correo electrónico válido.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/vibecode/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enrollName,
          email: enrollEmail,
          phone: enrollPhone,
          coupon_code: enrollCoupon,
          payment_method: paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setEnrollError(data.error || "Ocurrió un error al procesar tu inscripción.")
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      setShowFormModal(false)
      setCurrentRegId(data.registration_id)
      setReceiptBase64(null)
      setReceiptUploadResult(null)

      if (paymentMethod === "crypto") {
        setCryptoAmount(data.amount_to_pay)
        setShowCryptoModal(true)
      } else if (paymentMethod === "bank") {
        setBankAmount(data.amount_to_pay)
        setBankPhasePrice(status.active_price || 297)
        setShowBankModal(true)
      } else {
        // Success - Redirect to checkout url (simulated page)
        window.location.href = data.checkout_url
      }
    } catch (err: any) {
      console.error(err)
      setEnrollError("Error de conexión. Por favor verifica tu red e inténtalo de nuevo.")
      setIsSubmitting(false)
    }
  }

  // Format currency helper
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(val)
  }

  // File to base64 converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptMime(file.type)
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      // Extract the raw base64 data by removing the prefix
      const commaIdx = base64String.indexOf(",")
      if (commaIdx !== -1) {
        setReceiptBase64(base64String.substring(commaIdx + 1))
      }
    }
    reader.readAsDataURL(file)
  }

  // Receipt verification API caller
  const handleVerifyReceipt = async () => {
    if (!receiptBase64) return
    setIsUploadingReceipt(true)
    setReceiptUploadResult(null)

    try {
      const response = await fetch("/api/vibecode/upload-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reg_id: currentRegId,
          file_base64: receiptBase64,
          file_mime: receiptMime
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setReceiptUploadResult({
          verified: data.verified,
          message: data.message
        })
      } else {
        setReceiptUploadResult({
          verified: false,
          message: data.error || "Ocurrió un error al verificar tu comprobante. Por favor reintenta o contacta soporte."
        })
      }
    } catch (err) {
      console.error(err)
      setReceiptUploadResult({
        verified: false,
        message: "Error de red al intentar verificar el comprobante."
      })
    } finally {
      setIsUploadingReceipt(false)
    }
  }

  const finalPayablePrice = couponFixedPrice !== null
    ? couponFixedPrice
    : couponDiscount !== null 
      ? status.active_price - Math.floor(status.active_price * (couponDiscount / 100)) 
      : status.active_price

  return (
    <div className="relative z-10 w-full">
      {/* Subtle mouse spotlight glow overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.045), rgba(139, 92, 246, 0.01) 50%, transparent 80%)`
        }}
      />
      {/* Payment Success/Failed Notifications */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          {showNotification === "success" ? (
            <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-2xl border border-emerald-500/30 max-w-sm flex flex-col gap-2 backdrop-blur bg-opacity-95">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-emerald-400">¡Inscripción Exitosa!</span>
              </div>
              <p className="text-sm text-slate-300">
                Tu pago fue procesado correctamente. Revisa tu casilla de correo para la confirmación e instrucciones de acceso.
              </p>
              <button 
                onClick={() => setShowNotification(null)}
                className="mt-2 text-xs font-semibold text-slate-400 hover:text-white transition text-right"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-2xl border border-red-500/30 max-w-sm flex flex-col gap-2 backdrop-blur bg-opacity-95">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-red-400">Pago Rechazado</span>
              </div>
              <p className="text-sm text-slate-300">
                El proceso de simulación falló o fue cancelado. Por favor, intenta inscribirte de nuevo.
              </p>
              <button 
                onClick={() => setShowNotification(null)}
                className="mt-2 text-xs font-semibold text-slate-400 hover:text-white transition text-right"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
       {/* SECTION 1: HEADER & HERO */}
      <div className="w-full bg-background/60 backdrop-blur-md text-foreground border-b border-border transition-colors duration-300 fixed top-0 left-0 right-0 z-50">
        {/* Language Notification Banner if English */}
        {locale === "en" && (
          <div className="w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-indigo-200 text-[11px] sm:text-xs py-2 px-4 border-b border-indigo-500/30 text-center flex items-center justify-center gap-2 flex-wrap animate-fade-in">
            <span>🌐 <strong>Notice:</strong> {t.languageBanner.text}</span>
            <Link href={t.languageBanner.actionHref} className="underline font-bold text-white hover:text-indigo-300">
              {t.languageBanner.actionText}
            </Link>
          </div>
        )}
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none min-w-0" onClick={() => router.push(locale === "en" ? "/en" : "/")}>
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-indigo-600 bg-clip-text text-transparent inline-block py-0.5 truncate max-w-[130px] min-[390px]:max-w-none">
              Javier Mujica
            </span>
            <span className="text-[9px] sm:text-xs bg-indigo-500/10 text-indigo-400 font-extrabold tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
              VIBECODE LAB
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#fde-fenomeno" className="hover:text-foreground transition-colors">{t.nav.manifesto}</a>
            <a href="#perfiles" className="hover:text-foreground transition-colors">{t.nav.profiles}</a>
            <a href="#paradigmas" className="hover:text-foreground transition-colors">{t.nav.paradigms}</a>
            <a href="#temario" className="hover:text-foreground transition-colors">{t.nav.curriculum}</a>
            <a href="#precios" className="hover:text-foreground transition-colors">{t.nav.pricing}</a>
            <Link 
              href="/unicorn-bible" 
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"
            >
              <span>{t.nav.ebooks}</span>
            </Link>
            <Link 
              href="/vibecode-1on1" 
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20"
            >
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {t.nav.oneOnOne}
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector ES | EN */}
            <LanguageToggle currentLocale={locale} />

            {/* Styled Switch Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-border bg-muted/80 p-0.5 transition-colors duration-300 ease-in-out focus:outline-none hover:scale-105 active:scale-95"
              title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            >
              <span className="sr-only">Toggle theme</span>
              <span
                className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-primary text-primary-foreground shadow-md ring-0 transition duration-300 ease-in-out ${
                  theme === "light" ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {theme === "light" ? (
                  <Sun className="h-3 w-3 text-amber-500" />
                ) : (
                  <Moon className="h-3 w-3 text-indigo-300" />
                )}
              </span>
            </button>
            <button 
              onClick={() => setShowFormModal(true)}
              className="btn-bootcamp-premium text-xs sm:text-sm font-semibold bg-slate-950 dark:bg-slate-50 text-white dark:text-slate-950 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shrink-0"
            >
              {t.nav.reserveSpot}
            </button>
          </div>
        </header>
      </div>

      {/* Spacer to prevent content from going under the fixed header */}
      <div className={locale === "en" ? "h-[110px] sm:h-[125px] w-full" : "h-[73px] sm:h-[85px] w-full"} />

      {/* HERO SECTION */}
      <section className="w-full bg-background/30 backdrop-blur-md text-foreground py-16 md:py-24 overflow-hidden transition-colors duration-300 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          
          {/* Header Block: Headline & Subtitle */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <ScrollReveal delay={100}>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                <span>{t.hero.badge}</span>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-balance">
                {t.hero.titleLead} <span className="text-gemini-gradient">{t.hero.titleHighlight}</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <p className="text-lg text-muted-foreground sm:text-balance leading-relaxed max-w-2xl mx-auto">
                {t.hero.subtitle}
              </p>
            </ScrollReveal>
          </div>

          {/* Full-width VSL Video Container */}
          <ScrollReveal delay={350} duration={1000} className="w-full max-w-4xl mx-auto">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-950/70 bg-slate-950 group transition-all duration-300 hover:border-indigo-500/50">
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 text-[11px] font-bold text-white shadow-lg pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>VSL · Presentación Vibecode</span>
              </div>
              <video
                src="https://pub-57a421ac28b74a958833b59b68238216.r2.dev/vibecodelab/vibecode_vsl.mp4"
                poster="/vibecode-og.png"
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover relative z-10"
              >
                Tu navegador no soporta la reproducción de este video VSL.
              </video>
            </div>
          </ScrollReveal>

          {/* 2-Column Details Grid Below Video */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start pt-4">
            <div className="md:col-span-7 space-y-8">
              {/* Quick trust metrics */}
              <ScrollReveal delay={400}>
                <div className="grid grid-cols-2 min-[380px]:grid-cols-3 gap-6 pt-4 border-t border-border max-w-md">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-foreground"><AnimatedNumber value={7} /></p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Semanas en vivo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-foreground"><AnimatedNumber value={2} /></p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1 whitespace-nowrap">Mentorías 1-a-1*</p>
                  </div>
                  <div className="col-span-2 min-[380px]:col-span-1 text-center">
                    <p className="text-3xl font-extrabold text-indigo-400"><AnimatedNumber value={status.total_seats || 11} /></p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Cupos límite</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Class schedule block */}
              <ScrollReveal delay={450}>
                <div className="mt-5 p-4 bg-card border border-border rounded-xl max-w-md text-xs text-muted-foreground space-y-1.5 shadow-sm transition-colors duration-300">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    📅 Horarios y Planificación Vibecode Lab (Generación 2)
                  </p>
                  <p>
                    <strong className="text-foreground">Inicio:</strong> Miércoles 25 de Noviembre a las 20:00 hrs (hora Chile).
                  </p>
                  <p>
                    <strong className="text-foreground">Clases:</strong> Solo los miércoles, 20:00 a 22:30 hrs (con break de 15 min).
                  </p>
                  <p>
                    <strong className="text-foreground">Mentoría:</strong> 2 horas personalizadas (1h inicio + 1h final) incluidas para los primeros 5 inscritos ($50 USD por sesión del 6° en adelante).
                  </p>
                  <p>
                    <strong className="text-foreground">Bono Especial:</strong> 3 meses de Google AI Pro (Gemini Advanced 2TB) a solo ~$6 USD (5.400 CLP) para los primeros 10 inscritos.
                  </p>
                  <p className="text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-1.5 rounded border border-indigo-500/20">
                    🎥 <strong>¿No puedes asistir en vivo?</strong> No te preocupes. Todas las sesiones quedan grabadas y disponibles al día siguiente.
                  </p>
                </div>

                {/* Offer Doc Download Block (Option A) */}
                <div className="mt-3 p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl max-w-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      ¿Necesitas más detalles del programa?
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Descarga la propuesta completa y estructura oficial (PDF).
                    </p>
                  </div>
                  <a
                    href="/docs/Vibecode%20Lab%20-%20Offer%20Doc.pdf"
                    download="Vibecode Lab - Offer Doc.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 font-medium text-xs transition-all shrink-0 group"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>Descargar PDF</span>
                  </a>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={500}>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button 
                    onClick={() => setShowFormModal(true)}
                    className="btn-bootcamp-premium bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 group text-center shadow-lg shadow-indigo-950/40"
                  >
                    Reservar mi cupo <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a 
                    href="#fde-fenomeno"
                    className="border border-border hover:bg-muted text-muted-foreground font-semibold px-8 py-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-center"
                  >
                    Conocer el Manifiesto FDE
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Interactive Stack Mockup Panel */}
            <div className="md:col-span-5 relative w-full">
              <ScrollReveal delay={500} duration={1200} className="w-full">
                <div className="absolute inset-0 bg-gemini-glow blur-3xl -z-10 rounded-full" />
                
                {isConsoleClosed ? (
                <div className="flex items-center justify-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 max-w-md mx-auto text-center h-48">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-mono">Terminal (mi-aplicacion-web) cerrada.</p>
                    <button 
                      onClick={() => {
                        setIsConsoleClosed(false)
                        setIsConsoleCollapsed(false)
                        setIsConsoleExpanded(false)
                      }}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-full transition shadow-md"
                    >
                      🔄 Reabrir Terminal
                    </button>
                  </div>
                </div>
              ) : (
                <div className={isConsoleExpanded ? "opacity-0 pointer-events-none" : "w-full space-y-4"}>
                  {/* Premium CTA Callout Banner */}
                  <div className="bg-slate-950/80 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-xl shadow-indigo-950/20 flex items-center gap-3.5 relative overflow-hidden group">
                    {/* Ambient sweeping background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-violet-500/5 opacity-50" />
                    
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0 relative z-10 border border-indigo-500/20">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                    </div>
                    
                    <div className="text-left relative z-10">
                      <h4 className="text-xs font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Prueba la aplicación en vivo
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                        Haz clic en el botón de <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5">play <Play className="h-2.5 w-2.5 fill-emerald-400 stroke-none inline" /></span> en la esquina de <code className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded font-mono">mi-aplicacion-web</code> para ver el chatbot de IA en acción.
                      </p>
                    </div>
                  </div>
                  
                  {renderConsole(false)}
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>

      {/* SECTION: EL FENÓMENO FDE & EL ESPÍRITU DE VIBECODE LAB */}
      <section id="fde-fenomeno" className="w-full bg-slate-950 text-white py-20 relative overflow-hidden border-t border-b border-slate-800 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <ScrollReveal className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>El Paradigma de la Era de la Inteligencia Artificial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Rompe la trampa corporativa: Tu máximo potencial no es optimizar gigantes, es <span className="text-gemini-gradient">crear lo tuyo</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed sm:text-balance max-w-2xl mx-auto">
              Miles de personas están orientando su talento a resolver problemas operativos, de marketing y ventas para grandes empresas. Pero el verdadero poder de aplicar IA se desata al construir tus propios productos, salir al mercado, iterar, validar y escalar.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Card 1: La tendencia FDE */}
            <ScrollReveal delay={100} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition-all duration-300 shadow-xl">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">1. LA TENDENCIA GLOBAL</span>
                <h3 className="text-xl font-bold text-white">El auge del Forward Deployed Engineer</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Empresas como OpenAI, Palantir y gigantes tecnológicos están capacitando y buscando masivamente FDEs: profesionales capaces de entrar a un negocio, detectar ineficiencias y desplegar IA. Es la habilidad más codiciada del mercado.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs text-indigo-300 font-medium">
                🏢 Enorme demanda corporativa... al servicio de otros.
              </div>
            </ScrollReveal>

            {/* Card 2: La trampa corporativa */}
            <ScrollReveal delay={200} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition-all duration-300 shadow-xl">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Flame className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">2. EL ERROR HABITUAL</span>
                <h3 className="text-xl font-bold text-white">Acelerar negocios ajenos en lugar del tuyo</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Miles de talentos se forman para resolver cuellos de botella operativos o comerciales dentro de grandes empresas. Regalan su mayor ventaja competitiva —saber aplicar IA y software— a cambio de un sueldo fijo y proyectos que jamás poseerán.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs text-sky-300 font-medium">
                ⚠️ Tu know-how genera millones para corporaciones.
              </div>
            </ScrollReveal>

            {/* Card 3: El Espíritu de Vibecode Lab */}
            <ScrollReveal delay={300} className="bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
                  <Compass className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">3. EL ESPÍRITU VIBECODE LAB</span>
                <h3 className="text-xl font-bold text-white">Crear, salir al mercado, iterar, validar y escalar</h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  Donde realmente aprovechas tu máximo potencial es al usar la IA para <strong>construir tus propios productos</strong>. Vibecode Lab nace para ayudarte a salir al mercado, validar rápido, iterar en vivo y escalar tus propios SaaS.
                </p>
              </div>
              <div className="p-3.5 bg-indigo-950/80 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 font-semibold relative z-10">
                🚀 CREAR → SALIR AL MERCADO → ITERAR → VALIDAR → ESCALAR
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* SECTION: LOS 4 PERFILES DEL ECOSISTEMA */}
      <section id="perfiles" className="w-full bg-slate-900 text-white py-20 relative overflow-hidden border-b border-slate-800 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <ScrollReveal className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Ecosistema de Talentos Complementarios</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Diseñado para 4 Perfiles que Cambian el Juego
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed sm:text-balance max-w-2xl mx-auto">
              Saber construir es una ventaja. Saber construir algo que el mercado quiere comprar es otra. Y hacerlo rodeado de los perfiles correctos cambia completamente el juego.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Perfil 1: Developers */}
            <ScrollReveal delay={100} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition duration-300 shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    PERFIL 01
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">Developers</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Saben escribir código sólido y dominar arquitecturas complejas, pero muchas veces carecen de habilidades de negocio, ventas, marketing, Go-To-Market, monetización o fundraising para independizarse.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-indigo-300">
                  ⚡ <strong>En Vibecode Lab:</strong> Aprendes a transformar tu código técnico en productos comerciales sostenibles.
                </div>
              </div>
            </ScrollReveal>

            {/* Perfil 2: Founders */}
            <ScrollReveal delay={150} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition duration-300 shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                    PERFIL 02
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">Founders</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Tienen visión de negocio, capacidad comercial y conocimiento de su industria, pero necesitan velocidad de ejecución técnica y flujos de IA para iterar sin depender de agencias o dev houses caras.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-violet-300">
                  ⚡ <strong>En Vibecode Lab:</strong> Adquieres autonomía técnica con IA y encuentras aliados para construir rápido.
                </div>
              </div>
            </ScrollReveal>

            {/* Perfil 3: Creativos & Diseñadores */}
            <ScrollReveal delay={200} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition duration-300 shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                    PERFIL 03
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">Creativos</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Tienen ideas potentes, sensibilidad estética y comprensión profunda del usuario, pero necesitan capacidades técnicas y comerciales para llevar sus diseños a software real operando en producción.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-sky-300">
                  ⚡ <strong>En Vibecode Lab:</strong> Conviertes tus maquetas e ideas en aplicaciones reales con cobros y usuarios.
                </div>
              </div>
            </ScrollReveal>

            {/* Perfil 4: Builders & FDEs */}
            <ScrollReveal delay={250} className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition duration-300 shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Handshake className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    PERFIL 04
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">Builders & FDEs</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Tienen la capacidad pragmática de entrar en problemas reales, integrar software y automatizar procesos, y buscan canalizar esa habilidad en su propio portafolio de SaaS independientes.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-emerald-300">
                  ⚡ <strong>En Vibecode Lab:</strong> Encuentras la estructura de validación, GTM y ecosistema para escalar lo tuyo.
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* SECTION: PARADIGMAS QUE VIBECODE LAB ROMPE */}
      <section id="paradigmas" className="w-full bg-slate-950 text-white py-20 relative overflow-hidden border-b border-slate-800 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <ScrollReveal className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span>Cambio de Mentalidad</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Paradigmas que <span className="text-gemini-gradient">Vibecode Lab</span> rompe
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Para construir un SaaS exitoso no necesitas acumular más teoría. Necesitas cambiar la forma en que abordas el producto y el negocio.
            </p>
          </ScrollReveal>

          {/* TABLE COMPARISON STRUCTURE */}
          <ScrollReveal delay={100} className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Prominent Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 bg-slate-950/95 border-b border-slate-800 p-6 items-center">
              <div className="col-span-5 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-red-400 font-mono">
                  Viejo Paradigma
                </h3>
              </div>
              <div className="col-span-2 text-center text-slate-500 font-mono font-bold text-sm">
                VS
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-emerald-400 font-mono">
                  Nuevo Paradigma (Vibecode)
                </h3>
              </div>
            </div>

            {/* Table Body Rows */}
            <div className="divide-y divide-slate-800/80">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 gap-6 md:gap-4 items-center hover:bg-slate-800/40 transition-colors">
                <div className="md:col-span-5 space-y-2">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mb-1">
                    Viejo Paradigma
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-slate-400 line-through opacity-85">
                    "Para emprender necesito ser un desarrollador experto."
                  </p>
                </div>

                <div className="hidden md:flex md:col-span-2 justify-center items-center">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 font-bold">
                    ➔
                  </span>
                </div>

                <div className="md:col-span-5 space-y-2 bg-emerald-950/30 md:bg-transparent p-5 md:p-0 rounded-2xl border border-emerald-500/30 md:border-none">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-1">
                    Nuevo Paradigma
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-emerald-300 leading-snug">
                    Usa las herramientas correctas y rodéate del talento que te falta.
                  </h4>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 gap-6 md:gap-4 items-center hover:bg-slate-800/40 transition-colors">
                <div className="md:col-span-5 space-y-2">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mb-1">
                    Viejo Paradigma
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-slate-400 line-through opacity-85">
                    "Primero tengo que construir durante meses y después buscar clientes."
                  </p>
                </div>

                <div className="hidden md:flex md:col-span-2 justify-center items-center">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 font-bold">
                    ➔
                  </span>
                </div>

                <div className="md:col-span-5 space-y-2 bg-emerald-950/30 md:bg-transparent p-5 md:p-0 rounded-2xl border border-emerald-500/30 md:border-none">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-1">
                    Nuevo Paradigma
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-emerald-300 leading-snug">
                    Valida antes de construir. Ahorra meses de trabajo en vano.
                  </h4>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 gap-6 md:gap-4 items-center hover:bg-slate-800/40 transition-colors">
                <div className="md:col-span-5 space-y-2">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mb-1">
                    Viejo Paradigma
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-slate-400 line-through opacity-85">
                    "Si soy buen programador, eventualmente conseguiré que mi SaaS funcione."
                  </p>
                </div>

                <div className="hidden md:flex md:col-span-2 justify-center items-center">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 font-bold">
                    ➔
                  </span>
                </div>

                <div className="md:col-span-5 space-y-2 bg-emerald-950/30 md:bg-transparent p-5 md:p-0 rounded-2xl border border-emerald-500/30 md:border-none">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-1">
                    Nuevo Paradigma
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-emerald-300 leading-snug">
                    Construir producto y construir negocio son habilidades distintas.
                  </h4>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 gap-6 md:gap-4 items-center hover:bg-slate-800/40 transition-colors">
                <div className="md:col-span-5 space-y-2">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 mb-1">
                    Viejo Paradigma
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-slate-400 line-through opacity-85">
                    "Necesito otro curso grabado con horas de videos."
                  </p>
                </div>

                <div className="hidden md:flex md:col-span-2 justify-center items-center">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 font-bold">
                    ➔
                  </span>
                </div>

                <div className="md:col-span-5 space-y-2 bg-emerald-950/30 md:bg-transparent p-5 md:p-0 rounded-2xl border border-emerald-500/30 md:border-none">
                  <span className="md:hidden inline-block text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-1">
                    Nuevo Paradigma
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-emerald-300 leading-snug">
                    Menos teoría. Más construcción, lanzamiento y acompañamiento.
                  </h4>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION: LO QUE VIBECODE LAB NO ES */}
      <section className="w-full bg-slate-950 text-white py-20 relative overflow-hidden border-b border-slate-800 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <ScrollReveal className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Diferenciación de Alternativas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Lo que Vibecode Lab <span className="text-red-400">NO ES</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              No somos otra biblioteca de contenido. Somos un acelerador de ejecución y ecosistema para builders.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NO ES */}
            <ScrollReveal delay={100} className="bg-slate-900/60 border border-red-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                ❌ Lo que NO vas a encontrar aquí
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Otro curso grabado o biblioteca de tutoriales pasivos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Meses estudiando teoría académica antes de tocar una línea de código.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Construir en aislamiento total sin feedback real.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Comunidades genéricas de Discord con networking sin propósito.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Pagar agencias costosas para construir un MVP que podrías hacer tú mismo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Acumular herramientas de IA sin saber qué problema resuelven.</span>
                </li>
              </ul>
            </ScrollReveal>

            {/* SÍ ES */}
            <ScrollReveal delay={200} className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                ✅ Lo que SÍ vas a experimentar
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg">BUILD</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg">VALIDATE</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg">LAUNCH</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg">ITERATE</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg">MONETIZE</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg">CONNECT</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-300 pt-2">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>7 semanas de ejecución práctica en vivo</strong> con mentoría directa.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Validación comercial anticipada</strong> antes de invertir meses de desarrollo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Equipos complementarios:</strong> Conexión real entre talento técnico, founders y creativos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Sistemas con cobros integrados</strong> desde el día uno.</span>
                </li>
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SECTION: ¿PARA QUIÉN ES VIBECODE LAB? (DUAL VALUE PROPOSITION & NETWORKING) */}
      <section className="w-full bg-slate-950 text-white py-20 relative overflow-hidden border-y border-slate-800 z-10">
        <div className="absolute inset-0 bg-[url('/images/bg-topography.jpg')] bg-cover bg-center opacity-15 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-slate-950/90 to-slate-950 -z-10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <ScrollReveal className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Público Objetivo & Ecosistema de Alianzas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              ¿Para quién está diseñado <span className="text-gemini-gradient">Vibecode Lab</span>?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed sm:text-balance">
              Tanto si estás dando tus primeros pasos en tecnología como si ya eres un desarrollador consolidado, Vibecode Lab entrega un entorno único de aprendizaje práctico y vinculación profesional.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Card 1: Principiantes / Primeros pasos en Vibecoding */}
            <ScrollReveal delay={100} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300 shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-indigo-400 group-hover:opacity-20 transition-opacity">
                <Rocket className="h-32 w-32" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Rocket className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Para Principiantes & No-Coders</span>
                  <h3 className="text-2xl font-bold text-white">Si estás comenzando con Vibecoding</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Aprende a construir aplicaciones completas desde cero sin frustrarte con teoría compleja. Te enseñamos a usar modelos de IA como copilotos para crear software real sin barreras.
                  </p>
                </div>
                
                <ul className="space-y-3 pt-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Cero experiencia requerida:</strong> Desde instalar tu entorno hasta publicar una app con URL propia en internet.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Construcción 100% Real:</strong> Sistema de usuarios, login seguro, cobros con Mercado Pago y correos automáticos.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Autonomía Digital:</strong> Convierte tus ideas o las de tu negocio en productos digitales funcionales.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 text-xs text-indigo-300 font-medium">
                🎯 Ideal para: Emprendedores, creadores, profesionales y quienes quieran aprender a programar rápido.
              </div>
            </ScrollReveal>

            {/* Card 2: Programadores / Devs con experiencia / Networking & Alianzas */}
            <ScrollReveal delay={200} className="bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-violet-400/60 transition-all duration-300 shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-violet-400 group-hover:opacity-20 transition-opacity">
                <Handshake className="h-32 w-32" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Handshake className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Para Programadores & Devs Experimentados</span>
                  <h3 className="text-2xl font-bold text-white">Networking, Alianzas & Co-Founding</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Si ya programas, sumarte a <strong>Vibecode Lab</strong> te posiciona en el centro de un ecosistema activo de fundadores y emprendedores buscando alianzas técnicas y nuevos proyectos.
                  </p>
                </div>
                
                <ul className="space-y-3 pt-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                    <span><strong>Networking Estratégico:</strong> Conecta con profesionales y empresas que necesitan liderazgo o desarrollo técnico.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                    <span><strong>Flujos de IA de Última Generación:</strong> Optimiza tu velocidad x10 aprendiendo a estructurar agentes de IA autónomos (Gemini / DeepSeek / Claude).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                    <span><strong>Generación de Sinergias:</strong> Identifica socios comerciales, clientes de consultoría o co-fundadores para tus iniciativas.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 text-xs text-violet-300 font-medium">
                🤝 Ideal para: Developers Senior/Mid, Tech Leads, Freelancers y Consultores que buscan expandir su red.
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      <section className="w-full bg-slate-950 text-white py-24 border-y border-slate-800/80 relative overflow-hidden z-10">
        {/* Atmospheric subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 relative z-10">
          <ScrollReveal className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Resultados Tangibles · 7 Semanas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Lo que lograrás al finalizar <span className="text-gemini-gradient">Vibecode Lab</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              En solo 7 semanas de práctica real en vivo, habrás desarrollado y publicado un sistema completo listo para recibir usuarios y pagos.
            </p>
          </ScrollReveal>

          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Outcome 1 */}
              <ScrollReveal delay={100} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/funcionando-internet.png" 
                    alt="Tu aplicación funcionando en internet" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-md">
                    <Code2 className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">Tu aplicación funcionando en internet</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Tendrás tu propio proyecto real publicado en internet con un enlace público. Podrás mostrárselo a clientes, empleadores o amigos, accediendo desde cualquier teléfono o computador.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Outcome 2 */}
              <ScrollReveal delay={200} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-violet-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/cobros-integrado.png" 
                    alt="Sistema de cobros integrado" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/30 shadow-md">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2">Sistema de cobros integrado</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Tu aplicación podrá recibir pagos reales en línea con tarjeta de crédito o débito de forma automatizada, transfiriendo el dinero directo a tu cuenta bancaria.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Outcome 3 */}
              <ScrollReveal delay={300} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/registro-seguro.png" 
                    alt="Registro e inicio de sesión seguro" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">Registro e inicio de sesión seguro</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Crearás un sistema donde tus usuarios puedan registrarse, iniciar sesión con total seguridad y proteger sus datos personales dentro de tu aplicación.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Outcome 4 */}
              <ScrollReveal delay={400} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/envio-correos.png" 
                    alt="Envío automático de correos" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md">
                    <Layers className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-2">Envío automático de correos</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Aprenderás a hacer que tu aplicación envíe correos electrónicos automáticos de bienvenida, avisos o confirmaciones de pago a tus clientes de forma autónoma.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Outcome 5 */}
              <ScrollReveal delay={500} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/programacion-ia.png" 
                    alt="Programación asistida por IA" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">Programación asistida por IA</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Aprenderás a usar modelos de Inteligencia Artificial como tus asistentes de programación para resolver problemas, escribir código y acelerar tu aprendizaje 10 veces más rápido.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Outcome 6 */}
              <ScrollReveal delay={600} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-rose-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/mentoria-personalizada.png" 
                    alt="Mentoría 1-a-1 personalizada" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-md">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors mb-2">Mentoría <span className="whitespace-nowrap">1-a-1</span> personalizada</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Dispondrás de 2 horas de mentoría individual 1-a-1 directa para resolver dudas, revisar tu proyecto de forma personalizada y asegurar tu éxito en el bootcamp.
                    </p>
                    <p className="mt-3 text-[11.5px] font-semibold text-rose-400 leading-snug">
                      * Bono exclusivo de 2 mentorías 1-a-1 incluido para los primeros 5 inscritos por generación. A partir del 6° en adelante, el valor por consultoría 1-a-1 es de $50 USD cada una.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Bottom Row Centered (Outcome 7 & 8) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-center gap-8">
              {/* Outcome 7 */}
              <ScrollReveal delay={700} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-teal-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] transition-all duration-300 flex flex-col overflow-hidden w-full lg:w-[calc(33.333%-1.333rem)] hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/agentes-ia.png" 
                    alt="Integración de agentes de IA a tu desarrollo" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shadow-md">
                    <Cpu className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors mb-2">Integración de agentes de IA a tu desarrollo</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Construirás e integrarás agentes de IA inteligentes en tu aplicación, capaces de procesar información, tomar decisiones autónomas y automatizar flujos de trabajo complejos.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Outcome 8 */}
              <ScrollReveal delay={800} className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-sky-500/40 rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] transition-all duration-300 flex flex-col overflow-hidden w-full lg:w-[calc(33.333%-1.333rem)] hover:-translate-y-1 group">
                <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src="/images/outcomes/chatbot-natural.png" 
                    alt="Chatbot natural (que no parezca IA)" 
                    className="w-full h-full object-cover select-none pointer-events-none opacity-85 group-hover:scale-105 transition-transform duration-500"
                    style={{
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)'
                    }}
                  />
                  <div className="absolute top-4 left-4 h-12 w-12 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-md">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">Chatbot natural (que no parezca IA)</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Diseñarás un asistente conversacional con respuestas humanas y empáticas, configurado para entender el contexto real del usuario sin sonar robótico o artificial.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CAPACITY & SCARCITY (DARK THEME) */}
      <section className="w-full bg-slate-950 text-white py-20 relative overflow-hidden z-10">
        {/* Stylish high-end 3D topography background texture with dark overlay */}
        <div className="absolute inset-0 bg-[url('/images/bg-topography.jpg')] bg-cover bg-center opacity-25 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/75 to-slate-950 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Scarcity Progress Bar */}
            <ScrollReveal className="space-y-6">
              <div className="flex items-center gap-2 text-white font-bold text-xl">
                <Users className="h-5.5 w-5.5 text-indigo-400" />
                <span>Estado de las Reservas</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Admitiremos un máximo estricto de <strong className="text-white font-bold">11 estudiantes</strong>. Este límite asegura un acompañamiento uno-a-uno personalizado para responder todas tus dudas en directo y potenciar tu aprendizaje.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{status.seats_taken} cupos reservados</span>
                  <span className="text-indigo-400 font-bold">{Math.max(0, 11 - status.seats_taken)} disponibles</span>
                </div>
                
                {/* Progress bar container */}
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden relative border border-slate-700/50">
                  <div 
                    className="bg-gemini-gradient h-full rounded-full transition-all duration-1000 shadow-md"
                    style={{ width: `${(status.seats_taken / (status.total_seats || 11)) * 100}%` }}
                  />
                  <div className="absolute inset-0 bg-white/10 animate-pulse-glow pointer-events-none" />
                </div>
              </div>
            </ScrollReveal>

            {/* The Early Bird Mentorship Box */}
            <ScrollReveal className="relative overflow-hidden bg-gradient-to-br from-indigo-950/80 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl">
              <div className="absolute top-0 left-0 bg-gemini-gradient h-1 w-full" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="bg-indigo-500/10 rounded-2xl px-4 py-3 border border-indigo-500/20 shrink-0 w-fit flex items-center justify-center shadow-inner">
                  <img 
                    src="/images/vibecode-logo.png" 
                    alt="Logo Vibecode Lab" 
                    className="h-12 sm:h-14 md:h-16 w-auto max-w-[240px] object-contain" 
                  />
                </div>
                <div className="inline-flex items-center w-fit bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full">
                  Bono Exclusivo · Primeros 5 Inscritos
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  2 Horas de Mentoría Personalizada <span className="whitespace-nowrap">1-a-1</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Las 2 mentorías individuales 1-a-1 directas con Javier Mujica (1 al inicio y 1 al cierre del bootcamp para definir arquitectura y revisar código) son un beneficio exclusivo para los <strong className="text-white font-bold">primeros 5 inscritos por generación</strong>. A partir del 6° inscrito en adelante, el valor por consultoría 1-a-1 es de <strong className="text-white font-bold">$50 USD cada una</strong>.
                </p>
                
                <div className="flex items-center gap-2 pt-2 text-indigo-300 font-semibold text-sm">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400"></span>
                  </span>
                  <span>Quedan {Math.max(0, 5 - status.seats_taken)} cupos con mentoría 1-a-1 incluida</span>
                </div>

                <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
                      Bono Google AI Pro · Primeros 10 Inscritos
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Acceso a link de invitación exclusiva para <strong>3 meses de Google AI Pro (Gemini Advanced + 2TB)</strong> por solo <strong>5.400 CLP (~$6 USD totales)</strong> en vez de su valor comercial de ~$60 USD (oferta sujeta a términos de Google One para nuevas cuentas elegibles).
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SECTION 3: SYLLABUS / TEMARIO (DARK VIOLET TECH THEME) */}
      <section id="temario" className="w-full bg-[#060814] text-white py-24 relative z-10 overflow-hidden border-t border-slate-800/80">
        {/* Subtle violet & cyan ambient gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(147,51,234,0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16 relative z-10">
          <ScrollReveal className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 px-4 py-1.5 rounded-full border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Ruta de Aprendizaje Práctica</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Programa de Estudios <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">(Syllabus)</span>
            </h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed sm:text-balance">
              Diseñado con un enfoque práctico y secuencial para llevarte de la mano desde tu primera línea de código hasta publicar una aplicación real y funcional en internet.
            </p>
          </ScrollReveal>

          <div className="space-y-8">
            
            {/* Clase 1 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(147,51,234,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase1_setup.png" 
                    alt="Fase 1 Setup" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-slate-700 group-hover:bg-purple-500 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 1 · Clase 1
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Instalación & Tu Primer Contacto</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <Terminal className="h-3.5 w-3.5 text-purple-400" /> Entorno Completo
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Configuraremos tu computadora paso a paso. Perderemos el miedo a la consola de comandos de tu sistema y dejaremos listas las herramientas profesionales necesarias para empezar a programar sin ningún bloqueo técnico.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Clase 2-3 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase2_ai.png" 
                    alt="Fase 2 AI" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-700 group-hover:bg-indigo-400 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 2 · Clase 2
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">Programación con Inteligencia Artificial</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Asistente de IA
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Aprenderemos a usar la Inteligencia Artificial (Gemini) como un tutor personal. Sabrás cómo pedirle que te ayude a planificar tu aplicación, explicarte el código paso a paso y resolver cualquier error en segundos.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Clase 3 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase3_database.png" 
                    alt="Arquitectura del MVP & Base de Datos" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-700 group-hover:bg-blue-400 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 3 · Clase 3
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Arquitectura del MVP & Base de Datos</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <Database className="h-3.5 w-3.5 text-blue-400" /> Supabase, Auth & RLS
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Modelado de datos en Supabase, autenticación segura de usuarios (Auth), asignación de roles y políticas de seguridad RLS para sentar la infraestructura técnica del proyecto.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Clase 4 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase4_api_cube.png" 
                    alt="Integración de APIs & Agentes de IA" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-purple-700 group-hover:bg-purple-400 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 3 · Clase 4
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Integración de APIs & Agentes de IA</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <Bot className="h-3.5 w-3.5 text-purple-400" /> Gemini, Claude & DeepSeek
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Conexión con modelos de IA avanzados, estructuración de prompts en el backend, gestión de contexto y automatización de respuestas inteligentes sin fricción. <strong className="text-purple-300">Incluye Laboratorio Práctico:</strong> Inferencia de video e imágenes con IA en la nube utilizando GPUs de 15GB VRAM (Google Colab / NVIDIA T4) a costo $0 sin requerir tarjeta gráfica gamer.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Clase 5 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase5_monetization.png" 
                    alt="Monetización en Vivo & Correos" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-700 group-hover:bg-emerald-400 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 3 · Clase 5
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">Monetización en Vivo & Correos Automáticos</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> Mercado Pago & Resend
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Integración de Mercado Pago (checkouts y suscripciones), procesamiento de pagos mediante webhooks en tiempo real y envío automático de correos transaccionales (Resend/SendGrid).
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Clase 6 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase6_gtm_rocket.png" 
                    alt="Frontend Interactivo & Freemium GTM" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-700 group-hover:bg-amber-400 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 3 · Clase 6
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">Front-end Interactivo, Modelo Freemium & Go-To-Market</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Freemium / PLG & Tracción
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Desarrollo de interfaz responsiva con chatbot interactivo, configuración de límites Freemium (Product-Led Growth) para adquisición fluida y estrategia Go-To-Market para tus primeros 100 usuarios.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Clase 7 */}
            <ScrollReveal>
              <div className="border border-slate-800/90 rounded-2xl bg-slate-900/80 hover:bg-slate-900/95 shadow-xl hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] overflow-hidden flex flex-col md:flex-row items-stretch group hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5">
                {/* Image side */}
                <div className="w-full md:w-[220px] shrink-0 h-48 md:h-auto relative overflow-hidden bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800/80 group">
                  <img 
                    src="/images/phase7_vc_elevator.png" 
                    alt="Despliegue, Pitch Deck & Demo Day" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-slate-900/40 pointer-events-none" />
                </div>
                {/* Content side */}
                <div className="p-5 sm:p-6 md:p-8 flex-1 relative flex flex-col justify-between">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-700 group-hover:bg-indigo-400 transition-colors" />
                  <div className="pl-3 sm:pl-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4">
                      <div>
                        <div className="inline-block bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          Fase 3 · Clase 7
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">Despliegue en Producción, Pitch para Capital & Demo Day</h3>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full w-fit h-fit">
                        <Rocket className="h-3.5 w-3.5 text-indigo-400" /> Vercel, Pitch & Demo Day
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Publicación en Vercel con dominio propio y SSL, estructuración de un Pitch Deck de alto impacto para inversores y el Demo Day oficial de presentación en vivo frente a la comunidad.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

          {/* Sección Co-Founding & Networking */}
          <ScrollReveal className="mt-12">
            <div className="border border-purple-500/30 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900/90 to-indigo-950/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Handshake className="h-3.5 w-3.5 text-purple-400" /> Comunidad, Co-Founding & Capital
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Ecosistema Co-Founding & Networking
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                  Diseñado para que emprendedores analíticos y desarrolladores unan fuerzas. Transforma tu MVP en una startup con equipo técnico y tracción real.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-purple-500/40 transition duration-300 group">
                    <h4 className="font-bold text-white text-base flex items-center gap-2 mb-2 group-hover:text-purple-300 transition-colors">
                      <Users className="h-4 w-4 text-purple-400" /> Canal Exclusivo "Pitch & Match"
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Espacio comunitario donde los emprendedores presentan la oportunidad/problema validado y los desarrolladores evalúan la factibilidad técnica o se unen como socios técnicos (CTO / Co-Founder).
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-indigo-500/40 transition duration-300 group">
                    <h4 className="font-bold text-white text-base flex items-center gap-2 mb-2 group-hover:text-indigo-300 transition-colors">
                      <Presentation className="h-4 w-4 text-indigo-400" /> Demo Day & Showcase en Vivo
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Al cierre de las 7 semanas, cada dupla o estudiante expone su SaaS funcionando frente a la comunidad, emprendedores e invitados para validar su modelo y recibir feedback real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section id="precios" className="w-full bg-slate-950 text-white py-20 border-t border-slate-900 relative overflow-hidden z-10">
        {/* High-tech cybernetic waves background texture */}
        <div className="absolute inset-0 bg-[url('/images/bg-cyber-waves.jpg')] bg-cover bg-center opacity-20 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal className="text-center max-w-xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Precios Decrecientes de Pronto Pago
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Fomentamos la toma de decisiones inmediata. A medida que se acerca la fecha oficial de lanzamiento, el porcentaje de descuento disminuye automáticamente.
            </p>
          </ScrollReveal>

          {/* Progress Timeline Bar */}
          <ScrollReveal className="max-w-5xl mx-auto mb-12 px-4 w-full">
            <div id="timeline" className="relative bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.1] dark:opacity-[0.4] pointer-events-none" />
              
              <div className="flex flex-col gap-4 relative z-10">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                      ⏳ Línea de Tiempo de Preventa
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">El precio incrementa automáticamente según la fecha actual.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                      {status.active_phase === 1 ? "Tramo 1 (30% Off)" :
                       status.active_phase === 2 ? "Tramo 2 (20% Off)" :
                       status.active_phase === 3 ? "Tramo 3 (10% Off)" :
                       "Precio de Lista"}
                    </span>
                    <span className="bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium">
                      {progressBarProps.currentDayLabel}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Track and Indicators */}
                <div className="relative my-6 select-none">
                  {/* Track Background */}
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-900 overflow-hidden relative">
                    {/* Glowing active progress fill */}
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                      style={{ width: `${progressBarProps.progressPercent}%` }}
                    />
                  </div>

                  {/* Phase Markers (Ticks) */}
                  {/* Tick 1: July 15 (33.33%) */}
                  <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-800 pointer-events-none" style={{ left: '33.33%' }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500/80 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500/80 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  {/* Tick 2: July 22 (56.66%) */}
                  <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-800 pointer-events-none" style={{ left: '56.66%' }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500/80 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-500/80 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                  </div>
                  {/* Tick 3: July 29 (80.00%) */}
                  <div className="absolute top-0 bottom-0 w-px border-l border-dashed border-slate-800 pointer-events-none" style={{ left: '80.00%' }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500/80 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500/80 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  </div>

                  {/* Glowing Floating Indicator Dot */}
                  <div 
                    className="absolute -top-2.5 h-8 w-8 -ml-4 bg-indigo-500 rounded-full border-4 border-white dark:border-slate-950 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center transition-all duration-500 ease-out z-20"
                    style={{ left: `${progressBarProps.progressPercent}%` }}
                  >
                    <div className="h-3 w-3 bg-white rounded-full animate-ping absolute opacity-75" />
                    <div className="h-2.5 w-2.5 bg-white rounded-full" />
                  </div>
                </div>

                {/* Timeline Labels and Deadlines */}
                <div className="relative h-12 mt-2 w-full text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {/* Inicio: VIBECODE_CONFIG.labels.start */}
                  <div className="absolute left-0 top-0 flex flex-col gap-0.5 text-left">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px] sm:text-[9px]">Inicio</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{VIBECODE_CONFIG.labels.start}</span>
                  </div>
                  
                  {/* Tramo 1 (30% Off) - centered in the first segment (0% to 33.33%) */}
                  <div className="absolute top-0 -translate-x-1/2 flex flex-col gap-0.5 items-center text-center w-32" style={{ left: '16.66%' }}>
                    <span className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[8px] sm:text-[9px] font-bold">Tramo 1 (30% Off)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Hasta {VIBECODE_CONFIG.labels.t1}</span>
                  </div>

                  {/* Tramo 2 (20% Off) - centered in the second segment (33.33% to 56.66%) */}
                  <div className="absolute top-0 -translate-x-1/2 flex flex-col gap-0.5 items-center text-center w-32" style={{ left: '45%' }}>
                    <span className="text-teal-600 dark:text-teal-400 uppercase tracking-wider text-[8px] sm:text-[9px] font-bold">Tramo 2 (20% Off)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Hasta {VIBECODE_CONFIG.labels.t2}</span>
                  </div>

                  {/* Tramo 3 (10% Off) - centered in the third segment (56.66% to 80.00%) */}
                  <div className="absolute top-0 -translate-x-1/2 flex flex-col gap-0.5 items-center text-center w-32" style={{ left: '68.33%' }}>
                    <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[8px] sm:text-[9px] font-bold">Tramo 3 (10% Off)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Hasta {VIBECODE_CONFIG.labels.t3}</span>
                  </div>

                  {/* Clases: VIBECODE_CONFIG.labels.launch */}
                  <div className="absolute right-0 top-0 flex flex-col gap-0.5 text-right">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px] sm:text-[9px]">Clases</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{VIBECODE_CONFIG.labels.launch}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* Tramo 1 */}
            <ScrollReveal className="h-full">
              <div className={`border rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative transition duration-300 h-full ${status.active_phase === 1 ? "border-indigo-500 shadow-2xl bg-white dark:bg-slate-900 scale-105" : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 opacity-70"}`}>
                {status.active_phase === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Fase Activa
                  </span>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tramo 1 (30% Off)</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatUSD(209)}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">USD</span>
                  </div>
                  <p className="text-xs text-slate-450 dark:text-slate-500 line-through">Base $297</p>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 mt-6">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Hasta el 8 de Noviembre
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Tramo 2 */}
            <ScrollReveal className="h-full">
              <div className={`border rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative transition duration-300 h-full ${status.active_phase === 2 ? "border-indigo-500 shadow-2xl bg-white dark:bg-slate-900 scale-105" : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 opacity-70"}`}>
                {status.active_phase === 2 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Fase Activa
                  </span>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tramo 2 (20% Off)</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatUSD(237)}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">USD</span>
                  </div>
                  <p className="text-xs text-slate-450 dark:text-slate-500 line-through">Base $297</p>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 mt-6">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Del 9 al 15 de Noviembre
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Tramo 3 */}
            <ScrollReveal className="h-full">
              <div className={`border rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative transition duration-300 h-full ${status.active_phase === 3 ? "border-indigo-500 shadow-2xl bg-white dark:bg-slate-900 scale-105" : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 opacity-70"}`}>
                {status.active_phase === 3 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Fase Activa
                  </span>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tramo 3 (10% Off)</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatUSD(265)}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">USD</span>
                  </div>
                  <p className="text-xs text-slate-450 dark:text-slate-500 line-through">Base $297</p>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 mt-6">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Del 16 al 22 de Noviembre
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Precio Full */}
            <ScrollReveal className="h-full">
              <div className={`border rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative transition duration-300 h-full ${status.active_phase >= 4 ? "border-indigo-500 shadow-2xl bg-white dark:bg-slate-900 scale-105" : "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 opacity-70"}`}>
                {status.active_phase >= 4 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    Fase Activa
                  </span>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio Full</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatUSD(297)}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">USD</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 mt-6">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> Desde el 23 de Noviembre
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Pricing Countdown Banner */}
          {status.seconds_to_next_phase > 0 && (
            <ScrollReveal>
              <div className="mt-12 max-w-lg mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-amber-500 animate-pulse shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-center sm:items-start">
                    <h4 className="text-sm font-bold">Próximo cambio de tramo</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">El descuento actual expirará en:</p>
                  </div>
                </div>
                
                {/* Timer metrics */}
                <div className="flex gap-2.5 text-center font-mono shrink-0">
                  <div>
                    <span className="text-lg font-bold block">{String(timeLeft.days).padStart(2, "0")}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Días</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 text-lg">:</span>
                  <div>
                    <span className="text-lg font-bold block">{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Hrs</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 text-lg">:</span>
                  <div>
                    <span className="text-lg font-bold block">{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Min</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700 text-lg">:</span>
                  <div>
                    <span className="text-lg font-bold block text-amber-500">{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">Seg</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* 1:1 Mentorship Alternative Callout */}
          <ScrollReveal>
            <div className="mt-12 max-w-2xl mx-auto rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    ¿Prefieres avanzar a tu propio ritmo?
                  </span>
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    Lanzamiento: $360 USD <span className="line-through text-slate-500 font-normal">($497)</span>
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">Programa Vibecode 1:1 (Privado)</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  6 asesorías privadas de 1 hora 100% personalizadas, enfocadas directamente en tu propio software o MVP.
                </p>
              </div>
              <Link href="/vibecode-1on1" className="shrink-0 w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-1.5 transition-all">
                  Ver Oferta 1:1 ($360 USD)
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 5: FAQs (DARK TEAL TECH THEME) */}
      <section className="w-full bg-slate-950 text-white py-24 relative z-10 overflow-hidden border-t border-slate-800/80">
        {/* Subtle teal & indigo ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(20,184,166,0.1),transparent_70%)] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10 relative z-10">
          <ScrollReveal className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-teal-500/15 text-teal-300 px-4 py-1.5 rounded-full border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5 text-teal-400" />
              <span>Resolución de Dudas Frecuentes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Preguntas <span className="bg-gradient-to-r from-teal-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">Frecuentes</span>
            </h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">
              Todo lo que necesitas saber antes de asegurar tu cupo para la Generación 2.
            </p>
          </ScrollReveal>
          
          <div className="space-y-4">
            <ScrollReveal delay={100}>
              <div className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-teal-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] transition-all duration-300 group hover:-translate-y-0.5">
                <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors text-base flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0" /> ¿Necesito experiencia previa programando?
                </h4>
                <p className="text-sm text-slate-300 pl-6 leading-relaxed">
                  Para nada. Partiremos con una nivelación de 1 semana donde te ayudaremos a configurar tus herramientas desde cero y daremos tus primeros pasos en la programación. Está pensado precisamente para quienes no tienen experiencia previa.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-teal-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] transition-all duration-300 group hover:-translate-y-0.5">
                <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors text-base flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0" /> ¿Cuáles son los días y horarios de las clases?
                </h4>
                <p className="text-sm text-slate-300 pl-6 leading-relaxed mb-4">
                  Las clases en vivo se realizarán los <strong className="text-white">miércoles de 20:00 a 22:30 hrs</strong> (con un break de 15 minutos), iniciando el <strong className="text-white">miércoles 25 de Noviembre</strong>, con <strong className="text-white">1 sesión semanal</strong> a lo largo de <strong className="text-white">7 semanas</strong> (7 sesiones en total). Adicionalmente, los primeros 5 inscritos de cada cohorte cuentan con <strong className="text-teal-300 font-semibold">2 horas de mentoría personalizada 1-a-1</strong> con el mentor (1 hora al inicio y 1 hora al final del curso) para guiar su proyecto de manera individual. A partir del 6° inscrito en adelante, el valor por consultoría 1-a-1 es de $50 USD cada una. Además, los primeros 10 inscritos acceden al bono de 3 meses de Google AI Pro por solo 5.400 CLP (~$6 USD).
                </p>
                <div className="border-t border-slate-800/80 pt-3">
                  <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors text-base flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0" /> ¿Qué ocurre si no puedo asistir en esos horarios?
                  </h4>
                  <p className="text-sm text-slate-300 pl-6 leading-relaxed">
                    No te preocupes. <strong className="text-white">Todas las sesiones se graban</strong> y quedan disponibles en tu panel de alumno al día siguiente, junto con las guías de estudio y el código fuente exacto para que puedas repasar cuando quieras.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-teal-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] transition-all duration-300 group hover:-translate-y-0.5">
                <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors text-base flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0" /> ¿Cómo funciona el descuento de pronto pago?
                </h4>
                <p className="text-sm text-slate-300 pl-6 leading-relaxed">
                  Para premiar a quienes toman decisiones rápidas, el precio aumenta automáticamente según las fechas indicadas. El descuento se calcula sobre el valor normal de $297 USD. El primer tramo (30% de descuento, quedando en $209 USD) finaliza el 8 de Noviembre, el segundo (20% de descuento, en $237 USD) el 15 de Noviembre, el tercero (10% de descuento, en $265 USD) el 22 de Noviembre, y a partir del 23 de Noviembre costará su valor normal de $297 USD previo al inicio de clases del 25 de Noviembre.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-teal-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] transition-all duration-300 group hover:-translate-y-0.5">
                <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors text-base flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0" /> ¿Qué computador necesito para el curso?
                </h4>
                <p className="text-sm text-slate-300 pl-6 leading-relaxed">
                  Cualquier computador (Windows, Mac o Linux) de los últimos 6 a 8 años sirve perfectamente. Te recomendamos contar con al menos 8 GB de memoria RAM, un procesador Intel Core i5, AMD Ryzen 5 (o superior, o cualquier chip Apple M1/M2/M3) y una conexión a internet estable para seguir las clases sin retraso.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={450}>
              <div className="bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-teal-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl hover:shadow-[0_8px_30px_rgba(20,184,166,0.1)] transition-all duration-300 group hover:-translate-y-0.5">
                <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors text-base flex items-center gap-2 mb-2">
                  <HelpCircle className="h-4.5 w-4.5 text-teal-400 shrink-0" /> ¿Para quién es ideal Vibecode Lab y qué significa tener mentalidad FDE?
                </h4>
                <p className="text-sm text-slate-300 pl-6 leading-relaxed">
                  <strong className="text-white">Vibecode Lab</strong> es ideal para Developers, Founders, Creativos y Builders. Tener mentalidad <strong className="text-teal-300">Forward Deployed Engineer (FDE)</strong> significa poseer la capacidad táctica de entrar en problemas reales de mercado, entender operaciones y desplegar software e IA que aporten valor inmediato. En lugar de usar esa capacidad para ser un engranaje corporativo más, en el Lab la canalizas para <strong className="text-white">construir, validar y monetizar tus propios SaaS</strong>.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SECTION: ANTIGRAVITY QUOTE MANIFESTO */}
      <section className="w-full bg-slate-950 text-white py-16 sm:py-20 relative overflow-hidden z-10 border-t border-b border-indigo-950/60">
        <div className="absolute inset-0 bg-[url('/images/bg-cyber-waves.jpg')] bg-cover bg-center opacity-15 mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950/90 to-slate-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-4">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest mb-3 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Manifiesto Vibecode
            </div>
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-relaxed text-slate-100 sm:text-balance max-w-3xl mx-auto">
              “La IA democratizó la creación de software. El cuello de botella ya no es programar. <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">El nuevo cuello de botella es lanzar, validar y monetizar antes que los demás.</span>”
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 6: FOOTER (DARK THEME) */}
      <Footer 
        logoSrc="/images/vibecode-logo.png" 
        logoAlt="Logo Crea Tu App" 
        logoClassName="h-20 w-auto opacity-80 hover:opacity-100 transition-opacity filter brightness-110" 
      />

      {/* Enrollment Drawer/Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowFormModal(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in-up max-h-[90dvh] flex flex-col">
            <div className="bg-slate-950 text-white p-6 shrink-0">
              <h3 className="text-lg font-bold">Matrícula al Bootcamp</h3>
              <p className="text-xs text-slate-400 mt-1">Completa tus datos para proceder con el pago seguro</p>
            </div>
            
            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-slate-950 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Nombre Completo</label>
                <input 
                  type="text" 
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={enrollEmail}
                  onChange={(e) => {
                    setEnrollEmail(e.target.value)
                    if (enrollError) setEnrollError(null)
                  }}
                  placeholder="juan@email.com"
                  required
                  className={`w-full border rounded-xl px-4 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 transition ${
                    enrollError && (enrollError.includes("correo") || enrollError.includes("dominio") || enrollError.includes("mail") || enrollError.includes("formato"))
                      ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/20 text-slate-900"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
                {enrollError && (enrollError.includes("correo") || enrollError.includes("dominio") || enrollError.includes("mail") || enrollError.includes("formato")) && (
                  <p className="text-xs text-red-600 font-semibold flex items-start gap-1 mt-1 bg-red-50 p-2 rounded-lg border border-red-200">
                    <Info className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{enrollError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  value={enrollPhone}
                  onChange={(e) => setEnrollPhone(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Cupón de Descuento (Opcional)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={enrollCoupon}
                    onChange={(e) => setEnrollCoupon(e.target.value)}
                    placeholder="Ej. VIBE30"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase pr-10"
                  />
                  {isValidatingCoupon && (
                    <div className="absolute right-3 top-3 flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {couponError && (
                  <p className="text-xs text-red-650 font-semibold mt-1">
                    ❌ {couponError}
                  </p>
                )}
                {couponSuccessMessage && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    ✓ {couponSuccessMessage}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mercadopago")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition duration-200 ${
                      paymentMethod === "mercadopago"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-950 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px]">💳 Mercado Pago</span>
                    <span className="text-[9px] text-slate-500 font-normal mt-0.5">Tarjetas LATAM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition duration-200 ${
                      paymentMethod === "paypal"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-950 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px]">🅿️ PayPal</span>
                    <span className="text-[9px] text-slate-500 font-normal mt-0.5">Internacional</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition duration-200 ${
                      paymentMethod === "crypto"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-950 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px]">🪙 Criptomonedas</span>
                    <span className="text-[9px] text-slate-500 font-normal mt-0.5">USDT / BTC / ETH</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition duration-200 ${
                      paymentMethod === "bank"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-950 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px]">🏦 Transf. Bancaria</span>
                    <span className="text-[9px] text-slate-500 font-normal mt-0.5">Solo para Chile</span>
                  </button>
                </div>
              </div>

              {/* Resumen de Pago */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Resumen de Pago</h4>
                
                <div className="space-y-1 text-xs">
                  {/* Siempre mostramos el Precio Lista */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Precio Lista:</span>
                    <span className={`${status.active_phase < 4 || couponDiscount !== null ? "line-through text-slate-400" : "font-semibold text-slate-900"} font-mono`}>
                      {formatUSD(297)}
                    </span>
                  </div>

                  {/* Si hay Pronto Pago, lo mostramos */}
                  {status.active_phase < 4 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Descuento Pronto Pago (Fase {status.active_phase}):</span>
                      <span className={`${couponDiscount !== null ? "line-through text-slate-400" : "font-semibold text-slate-900"} font-mono`}>
                        {formatUSD(status.active_price)}
                      </span>
                    </div>
                  )}

                  {/* Si hay cupón, mostramos el descuento */}
                  {couponDiscount !== null && (
                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                      <span>Descuento Cupón ({couponDiscount}%):</span>
                      <span className="font-mono">-{formatUSD(Math.floor(status.active_price * (couponDiscount / 100)))}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 uppercase">Total a Pagar:</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">
                    {formatUSD(finalPayablePrice)}
                  </span>
                </div>

                {/* CLP estimate for Mercado Pago or Bank transfer */}
                {(paymentMethod === "mercadopago" || paymentMethod === "bank") && (
                  <p className="text-[10px] text-slate-400 text-right mt-1 italic font-medium">
                    * Equiv. aproximado: {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Math.round(finalPayablePrice * 950))} CLP
                  </p>
                )}
              </div>

              {paymentMethod === "paypal" && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-600 uppercase">Pagar con PayPal</label>
                  {!enrollName || !enrollEmail ? (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100 font-sans">
                      ⚠️ Completa tu Nombre y Correo para habilitar el pago con PayPal.
                    </div>
                  ) : (
                    <div className="w-full min-h-[150px] relative z-30">
                      <PayPalButtonComponent 
                        amount={finalPayablePrice} 
                        name={enrollName} 
                        email={enrollEmail} 
                        phone={enrollPhone} 
                        coupon={enrollCoupon}
                        onSuccess={() => {
                          setShowFormModal(false)
                          setShowNotification("success")
                        }}
                        onError={(err) => {
                          setEnrollError(err)
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 items-center justify-between pt-4 border-t border-slate-100">
                {enrollError ? (
                  <div className="text-red-600 text-[11px] flex items-center gap-1 font-semibold flex-1">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>{enrollError}</span>
                  </div>
                ) : <div className="flex-1" />}
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition shrink-0"
                >
                  Cancelar
                </button>
                {paymentMethod !== "paypal" && (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition duration-200 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Pagar Seguro <CreditCard className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crypto Payment Modal */}
      {showCryptoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowCryptoModal(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in-up text-slate-900">
            <div className="bg-slate-950 text-white p-6">
              <h3 className="text-lg font-bold flex items-center gap-2">🪙 Pagar con Criptomonedas</h3>
              <p className="text-xs text-slate-400 mt-1">Transfiere el equivalente a ${cryptoAmount} USD a una de nuestras wallets</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {/* USDT TRC-20 */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800 uppercase">USDT (Red TRC-20 / Tron)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Comisión baja</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-250 rounded-lg p-2.5 mt-1 select-all font-mono text-xs overflow-x-auto">
                    <span>TLwmYyyAgyt9g7rCuLz8rN3Ka4vKRpRXiU</span>
                  </div>
                </div>

                {/* BTC */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800 uppercase">Bitcoin (Red BTC)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-250 rounded-lg p-2.5 mt-1 select-all font-mono text-xs overflow-x-auto">
                    <span>12bjLyfXtV3wDzqsBrSW55SyKehdw1tFjy</span>
                  </div>
                </div>

                {/* ETH */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800 uppercase">Ethereum (Red ETH / ERC-20)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-250 rounded-lg p-2.5 mt-1 select-all font-mono text-xs overflow-x-auto">
                    <span>0x490335dece24f850ebc4034533f2b65ba5c2865e</span>
                  </div>
                </div>
              </div>

              {/* Receipt File Upload Flow */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 block uppercase">Adjuntar Comprobante / Tx Hash (Imagen/PDF)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="text-xs border border-slate-200 rounded-lg p-2 flex-1 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-900 file:text-white file:hover:bg-slate-800 cursor-pointer"
                  />
                  <button
                    type="button"
                    disabled={!receiptBase64 || isUploadingReceipt || receiptUploadResult?.verified}
                    onClick={handleVerifyReceipt}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition duration-200 disabled:opacity-50 disabled:bg-slate-300 text-center flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isUploadingReceipt ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </>
                    ) : receiptUploadResult?.verified ? (
                      "✓ Verificado"
                    ) : (
                      "Verificar con IA"
                    )}
                  </button>
                </div>

                {receiptUploadResult && (
                  <div className={`text-xs p-3 rounded-lg border leading-relaxed flex gap-1.5 items-start mt-2 ${
                    receiptUploadResult.verified 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                      : "bg-amber-50 text-amber-800 border-amber-100"
                  }`}>
                    <Info className={`h-4 w-4 shrink-0 mt-0.5 ${receiptUploadResult.verified ? "text-emerald-500" : "text-amber-500"}`} />
                    <span>{receiptUploadResult.message}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowCryptoModal(false)}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Payment Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setShowBankModal(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in-up text-slate-900">
            <div className="bg-slate-950 text-white p-6">
              <h3 className="text-lg font-bold flex items-center gap-2">🏦 Transferencia Bancaria</h3>
              <p className="text-xs text-slate-400 mt-1">Transfiere a tu cuenta bancaria chilena para activar tu matrícula</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Pricing breakdown block */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Detalle del Pago</p>
                <div className="flex justify-center gap-6 text-xs text-slate-600 font-sans">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Valor Base</span>
                    <span className="font-semibold line-through">${bankPhasePrice} USD</span>
                  </div>
                  <div className="border-r border-slate-200" />
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Descuento</span>
                    <span className="font-bold text-emerald-600">
                      {Math.max(0, Math.round(((bankPhasePrice - bankAmount) / bankPhasePrice) * 100))}% OFF
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-150">
                  <span className="block text-[10px] uppercase text-slate-400 font-bold font-sans">Monto Total a Transferir</span>
                  <div className="text-2xl font-black text-indigo-600 mt-0.5 font-mono">
                    ${bankAmount} USD
                  </div>
                  <div className="text-sm font-bold text-slate-500 mt-0.5 font-mono">
                    ~ ${(bankAmount * 950).toLocaleString("es-CL")} CLP
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed flex gap-2">
                <span className="text-sm shrink-0">⚠️</span>
                <span>
                  <strong>¡Importante!</strong> Si te encuentras fuera de Chile, evita usar este método y prefiere <strong>PayPal o Criptomonedas</strong>. Las transferencias bancarias internacionales tradicionales tienen comisiones elevadas y demoras de varios días.
                </span>
              </div>

              <div className="space-y-3 text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 font-sans">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Beneficiario:</span>
                  <span className="font-bold text-slate-800">Javier Ignacio Mujica Carvajal</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">RUT:</span>
                  <span className="font-bold text-slate-800">16.660.933-K</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Banco:</span>
                  <span className="font-bold text-slate-800">Mercado Pago (o BICE / MP)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Tipo de Cuenta:</span>
                  <span className="font-bold text-slate-800">Cuenta Vista</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Número de Cuenta:</span>
                  <span className="font-bold text-slate-800 select-all font-mono">1038615486</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-800">hola@javiermujica.com</span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-3 text-[10px] text-indigo-900 leading-relaxed">
                <p className="font-bold">🌍 Transferencias Internacionales (desde fuera de Chile):</p>
                <p className="mt-1">Si estás fuera de Chile, usa <strong>PayPal o Criptomonedas</strong>. Son más rápidos, sin comisiones ocultas y sin trámites adicionales.</p>
              </div>

              {/* Receipt File Upload Flow */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 block uppercase">Adjuntar Comprobante de Transferencia (Imagen/PDF)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="text-xs border border-slate-200 rounded-lg p-2 flex-1 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-900 file:text-white file:hover:bg-slate-800 cursor-pointer"
                  />
                  <button
                    type="button"
                    disabled={!receiptBase64 || isUploadingReceipt || receiptUploadResult?.verified}
                    onClick={handleVerifyReceipt}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition duration-200 disabled:opacity-50 disabled:bg-slate-300 text-center flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isUploadingReceipt ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </>
                    ) : receiptUploadResult?.verified ? (
                      "✓ Verificado"
                    ) : (
                      "Verificar con IA"
                    )}
                  </button>
                </div>

                {receiptUploadResult && (
                  <div className={`text-xs p-3 rounded-lg border leading-relaxed flex gap-1.5 items-start mt-2 ${
                    receiptUploadResult.verified 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                      : "bg-amber-50 text-amber-800 border-amber-100"
                  }`}>
                    <Info className={`h-4 w-4 shrink-0 mt-0.5 ${receiptUploadResult.verified ? "text-emerald-500" : "text-amber-500"}`} />
                    <span>{receiptUploadResult.message}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowBankModal(false)}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Expanded Console Modal */}
      {isConsoleExpanded && !isConsoleClosed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsConsoleExpanded(false)}
          />
          <div className="relative w-full max-w-5xl h-[80vh] flex flex-col animate-fade-in-up">
            {renderConsole(true)}
          </div>
        </div>
      )}

      {/* Surprise Benefit AI Assistant Toast Popup */}
      <VibecodePerkPopup />
    </div>
  )
}

interface PayPalButtonComponentProps {
  amount: number
  name: string
  email: string
  phone: string
  coupon: string
  onSuccess: () => void
  onError: (msg: string) => void
}

function PayPalButtonComponent({ amount, name, email, phone, coupon, onSuccess, onError }: PayPalButtonComponentProps) {
  const containerId = "paypal-button-container"

  useEffect(() => {
    const container = document.getElementById(containerId)
    if (!container || !(window as any).paypal) return

    // Clear previous button renderings
    container.innerHTML = ""

    ;(window as any).paypal.Buttons({
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toString()
            }
          }]
        });
      },
      onApprove: async function(data: any, actions: any) {
        return actions.order.capture().then(async function(details: any) {
          try {
            // 1. Call enroll endpoint
            const res = await fetch("/api/vibecode/enroll", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                coupon_code: coupon,
                payment_method: "paypal"
              })
            })
            const enrollData = await res.json()
            if (res.ok) {
              // 2. Call simulate success to process enrollment complete
              await fetch("/api/vibecode/simulate-success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reg_id: enrollData.registration_id })
              })
              onSuccess()
            } else {
              onError(enrollData.error || "Ocurrió un error al procesar tu matrícula.")
            }
          } catch (err) {
            console.error(err)
            onError("Error de conexión al activar tu matrícula.")
          }
        });
      },
      onError: function(err: any) {
        console.error(err)
        onError("El pago a través de PayPal falló o fue cancelado.")
      }
    }).render("#" + containerId)
  }, [amount, name, email, phone, coupon])

  return <div id={containerId} className="w-full relative z-30" />
}

export default function VibecodePageView({ locale = "es" }: { locale?: Locale }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VibecodeLandingContent locale={locale} />
    </Suspense>
  )
}
