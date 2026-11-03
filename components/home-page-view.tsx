"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart2,
  CheckCircle,
  ClipboardList,
  MessageSquare,
  Briefcase,
  User,
  Trophy,
  Mail,
  ChevronUp,
  Linkedin,
  Building2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Lock,
  FileText,
  Calculator,
  Wrench,
  Calendar,
  Heart,
  Cpu,
  Upload,
  Trash2,
  Paperclip,
  Settings,
  Clock,
  Banknote,
  Brain,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  Link as LinkIcon,
  Home as HomeIcon,
  Download,
  LockKeyhole,
  BookOpen,
  Database
} from "lucide-react"
import dynamic from "next/dynamic"
import ClientsCarousel from "@/components/clients-carousel"
import { AiEngineeringSection } from "@/components/ai-engineering-section"
import { DataEngineeringSection } from "@/components/data-engineering-section"

const ProcessVisualizer = dynamic(() => import("@/components/process-visualizer"), {
  loading: () => <div className="min-h-[200px] flex items-center justify-center text-xs text-muted-foreground">Cargando...</div>
})
const CasesCarousel = dynamic(() => import("@/components/cases-carousel"), {
  loading: () => <div className="min-h-[200px] flex items-center justify-center text-xs text-muted-foreground">Cargando casos...</div>
})
const ExperienceGallery = dynamic(() => import("@/components/experience-gallery"), {
  loading: () => <div className="min-h-[200px] flex items-center justify-center text-xs text-muted-foreground">Cargando experiencia...</div>
})
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { validateEmailClient } from "@/lib/email-validator-client"
import ProcessFlowAnimation from "@/components/process-flow-animation"
import { translations, type Locale } from "@/lib/translations"
import LanguageToggle from "@/components/language-toggle"

export default function HomePageView({ locale = "es" }: { locale?: Locale }) {
  const t = translations[locale] || translations.es

  const SERVICES = [
    {
      id: "rediseno",
      title: t.services.items[0].title,
      icon: ClipboardList,
      image: "/images/service-process-redesign.webp",
      description: t.services.items[0].description,
      detailedDescription: t.services.items[0].detailedDescription,
      features: t.services.items[0].features,
      benefits: t.services.items[0].benefits,
      methodology: t.services.items[0].methodology,
      animationPrompt: "A smooth, 3D vector-style loop animation showing a chaotic web of messy, tangled glowing lines of tasks representing a cluttered process. Suddenly, a stylized digital hand sweeps through, organizing and straightening the lines into a clean, parallel, and flowing light-up pathway. Beautiful neon green and ocean blue color scheme, sleek modern typography transitions, micro-interactions, high frame rate, looping smoothly, transparent background."
    },
    {
      id: "automatizacion",
      title: t.services.items[1].title,
      icon: BarChart2,
      image: "/images/service-automation.webp",
      description: t.services.items[1].description,
      detailedDescription: t.services.items[1].detailedDescription,
      features: t.services.items[1].features,
      benefits: t.services.items[1].benefits,
      methodology: t.services.items[1].methodology,
      animationPrompt: "A minimal, futuristic isometric 3D animation showing a stylized factory or digital workbench. Colorful data blocks (representing documents, emails, and database rows) flow down a conveyor belt. Robotic arms made of glowing light and holographic gear wheels gracefully pick up the data blocks, sort them, and inject them into floating cloud databases. Sleek digital interface overlays, ambient neon lighting, high-tech aesthetic, loop."
    },
    {
      id: "consultoria",
      title: t.services.items[2].title,
      icon: MessageSquare,
      image: "/images/service-consulting.webp",
      description: t.services.items[2].description,
      detailedDescription: t.services.items[2].detailedDescription,
      features: t.services.items[2].features,
      benefits: t.services.items[2].benefits,
      methodology: t.services.items[2].methodology,
      animationPrompt: "A beautiful, conceptual motion graphics animation representing a mind with scattered, floating thoughts (represented by floating abstract geometric shapes). A warm, pulsing light emanates from a lighthouse/beacon, gently aligning these shapes into a beautiful, harmonious structure that continues to breathe and expand organically. Glassmorphism textures, soft pastel gradients of teal, purple, and gold, soothing motion, 4k, loop."
    },
    {
      id: "marca-personal",
      title: t.services.items[3].title,
      icon: User,
      image: "/images/service-personal-brand.webp",
      description: t.services.items[3].description,
      detailedDescription: t.services.items[3].detailedDescription,
      features: t.services.items[3].features,
      benefits: t.services.items[3].benefits,
      methodology: t.services.items[3].methodology,
      animationPrompt: "A warm and inviting 3D animation of a cozy digital home office. An empty desk where a calendar is floating, automatically flipping pages and filling itself with shining calendar event icons. A cute envelope icon flies in, opens, and releases small sparkling stars that light up a client database. Extremely cozy lighting, warm organic colors, smooth animations, glassmorphism, soft focus, loop."
    }
  ]

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

  const [activeSection, setActiveSection] = useState("inicio")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<any | null>(null)

  // Interactive profile switcher state: "ai" (AI Engineer) vs "data" (Data Engineer)
  const [profileRole, setProfileRole] = useState<"ai" | "data">("ai")

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const roleParam = params.get("perfil") || params.get("role")
      if (roleParam === "data" || roleParam === "ai") {
        setProfileRole(roleParam)
        return
      }
      const saved = localStorage.getItem("jm_profile_role")
      if (saved === "data" || saved === "ai") {
        setProfileRole(saved)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleRoleChange = (role: "ai" | "data") => {
    setProfileRole(role)
    try {
      localStorage.setItem("jm_profile_role", role)
      const url = new URL(window.location.href)
      url.searchParams.set("perfil", role)
      window.history.replaceState({}, "", url.toString())
    } catch (e) {
      // ignore
    }
  }

  // Lead state for free resources
  const [emailUnlocked, setEmailUnlocked] = useState(false)
  const [leadName, setLeadName] = useState("")
  const [leadEmail, setLeadEmail] = useState("")
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [leadModalReason, setLeadModalReason] = useState<{ title: string; description: string; actionType?: string }>({
    title: "Desbloquear Resultado",
    description: "Ingresa tu nombre y correo para ver el resultado de tu cálculo o descargar tu informe.",
  })
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [roiCalculated, setRoiCalculated] = useState(false)

  // CV Audit tool state
  const [cvText, setCvText] = useState("")
  const [jdText, setJdText] = useState("")
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState<any | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadedFile(file)

    // Simulate OCR / Document Parsing
    setTimeout(() => {
      setIsUploading(false)
      // If it's a plain text file, read it. Otherwise, generate a premium mock CV extraction based on user CV
      if (file.type === "text/plain") {
        const reader = new FileReader()
        reader.onload = (evt) => {
          setCvText(evt.target?.result as string || "")
        }
        reader.readAsText(file)
      } else {
        // High fidelity mock CV extraction matching the user's CV details
        setCvText(
          `JAVIER MUJICA\n` +
          `Consultor de Procesos, Automatización y Electromovilidad\n\n` +
          `EXPERIENCIA:\n` +
          `- Ingeniero de Software en Recursiva (Automatización RPA Python 3, Selenium, PostgreSQL)\n` +
          `- Gerente Comercial en MOVIA (Consultorías de recambio a flotas BEVs y telemetría de baterías)\n` +
          `- Gerente Comercial en Antü Energía (Soluciones de almacenamiento y respaldo crítico)\n` +
          `- Apoyo Comercial en Mundos Virtuales (Gestión de efectivo y optimización en retail/transporte)\n` +
          `- Desarrollo de Nuevos Negocios en Roboris Ltda. (Modernización de gestión de bodega e inventario digital)\n\n` +
          `HABILIDADES:\n` +
          `Python 3, Selenium, Automatización, SQL, Ingeniería de Software, Consultoría de Procesos, Electromovilidad.`
        )
      }
    }, 1200)
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setCvText("")
  }

  const [uploadedJdFile, setUploadedJdFile] = useState<File | null>(null)
  const [isUploadingJd, setIsUploadingJd] = useState(false)

  const handleJdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingJd(true)
    setUploadedJdFile(file)

    // Simulate OCR / Document Parsing
    setTimeout(() => {
      setIsUploadingJd(false)
      // If it's a plain text file, read it. Otherwise, generate a premium mock Job Description extraction
      if (file.type === "text/plain") {
        const reader = new FileReader()
        reader.onload = (evt) => {
          setJdText(evt.target?.result as string || "")
        }
        reader.readAsText(file)
      } else {
        setJdText(
          `Buscamos un Ingeniero de Proyectos o Ingeniero de Software para liderar iniciativas de automatización y transformación digital.\n\n` +
          `REQUISITOS:\n` +
          `- Experiencia programando en Python 3 o lenguajes equivalentes.\n` +
          `- Conocimientos en desarrollo de scripts de automatización RPA (Selenium, Puppeteer o similar).\n` +
          `- Gestión y modelado de bases de datos relacionales (PostgreSQL, MySQL).\n` +
          `- Habilidad para interactuar con clientes, levantar requerimientos de procesos e implementar optimizaciones.\n` +
          `- Valorable: Conocimientos en electromovilidad o telemetría de flotas.`
        )
      }
    }, 1200)
  }

  const handleRemoveJdFile = () => {
    setUploadedJdFile(null)
    setJdText("")
  }

  // Calculator state
  const [hoursPerWeek, setHoursPerWeek] = useState(5)
  const [hourlyRate, setHourlyRate] = useState(50000)

  // Prinergia simulator state
  const [prinergiaService, setPrinergiaService] = useState("Psicoterapia Individual")
  const [prinergiaSlot, setPrinergiaSlot] = useState("Lunes 10:00 AM")
  const [prinergiaSimResult, setPrinergiaSimResult] = useState<string | null>(null)

  // Prinergia therapist interest capture
  const [prinergiaEmail, setPrinergiaEmail] = useState("")
  const [prinergiaSubmitting, setPrinergiaSubmitting] = useState(false)
  const [prinergiaRegistered, setPrinergiaRegistered] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const unlocked = localStorage.getItem("recursos_unlocked") === "true"
      setEmailUnlocked(unlocked)
    }
  }, [])

  const requireEmailAccess = (title: string, description: string, onSuccess: () => void) => {
    if (emailUnlocked) {
      onSuccess()
      return
    }
    setLeadModalReason({ title, description })
    setPendingAction(() => onSuccess)
    setLeadModalOpen(true)
  }

  const handleUnlockLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadName || !leadEmail) return

    setIsLeadSubmitting(true)

    // Validar el correo en el cliente (sintaxis + desechables)
    const emailCheck = validateEmailClient(leadEmail)
    if (!emailCheck.isValid) {
      toast({
        title: "Correo inválido",
        description: "Se requiere un mail válido. Por favor, verifica el formato o que no sea un dominio temporal.",
        variant: "destructive",
      })
      setIsLeadSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: leadName, email: leadEmail })
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        localStorage.setItem("recursos_unlocked", "true")
        setEmailUnlocked(true)
        setLeadModalOpen(false)
        toast({
          title: "¡Acceso Desbloqueado! 🎉",
          description: "Herramientas e informes desbloqueados. Te enviamos además la plantilla Kanban a tu correo.",
        })
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        }
      } else {
        toast({
          title: "Error al desbloquear",
          description: `Se requiere un mail válido. ${data?.error || "El dominio ingresado no existe o no tiene registros de correo (MX) activos."}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting lead:", err)
      toast({
        title: "Error de red",
        description: "Hubo un problema de conexión. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLeadSubmitting(false)
    }
  }

  const downloadAuditReport = () => {
    if (!auditResult) return
    const content = 
`==============================================
INFORME DE COMPATIBILIDAD CV & VACANTE (IA)
Javier Mujica - Consultoría en IA y Procesos
==============================================

PORCENTAJE DE COINCIDENCIA: ${auditResult.match_percentage}%

RECOMENDACIONES DE MEJORA (UPCYCLING HINTS):
${(auditResult.upcycling_hints || []).map((hint: string, i: number) => `${i + 1}. ${hint}`).join("\n\n")}

----------------------------------------------
Generado en https://javiermujica.com
`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `auditoria-cv-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({
      title: "Descarga iniciada 📄",
      description: "Tu informe de auditoría ha sido descargado exitosamente.",
    })
  }

  const downloadRoiReport = () => {
    const monthlySaving = hoursPerWeek * 4.33 * hourlyRate
    const annualSaving = hoursPerWeek * 52 * hourlyRate
    const hoursMonthly = (hoursPerWeek * 4.33).toFixed(1)
    const hoursAnnual = (hoursPerWeek * 52).toFixed(1)

    const content = 
`==============================================
ESTIMACIÓN DE RETORNO DE INVERSIÓN (ROI)
Automatización de Procesos con IA y RPA
Javier Mujica - Consultoría Estratégica
==============================================

PARÁMETROS INGRESADOS:
- Horas manuales perdidas por semana: ${hoursPerWeek} hrs
- Valor estimado de tu hora de trabajo: CLP $${hourlyRate.toLocaleString("es-CL")}

RESULTADOS DEL AHORRO ESTIMADO:
- Ahorro Mensual Proyectado: CLP $${monthlySaving.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
- Ahorro Anual Proyectado: CLP $${annualSaving.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
- Tiempo recuperado al mes: ~${hoursMonthly} horas de foco estratégico
- Tiempo recuperado al año: ~${hoursAnnual} horas de vida y productividad

----------------------------------------------
Agenda una sesión de diagnóstico en https://javiermujica.com/#contacto
`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `calculo-roi-automatizacion-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({
      title: "Descarga iniciada 📊",
      description: "Tu cálculo de ROI ha sido descargado en formato de texto.",
    })
  }

  const handleRunAudit = async () => {
    if (!cvText || !jdText) return
    setIsAuditing(true)
    try {
      const response = await fetch("/api/v1/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: cvText, jobDescription: jdText })
      })
      if (response.ok) {
        const data = await response.json()
        setAuditResult(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsAuditing(false)
    }
  }

  const handleSimulateBooking = () => {
    setPrinergiaSimResult(
      `¡Simulación Exitosa! El cliente agendó "${prinergiaService}" para el "${prinergiaSlot}". Acciones ejecutadas en segundo plano: 1. Zoom link creado. 2. Recordatorio enviado. 3. Pago recibido de $35.000 CLP. 4. Ficha digital actualizada.`
    )
  }

  const handlePrinergiaInterest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prinergiaEmail) return
    setPrinergiaSubmitting(true)

    // Validar el correo en el cliente (sintaxis + desechables)
    const emailCheck = validateEmailClient(prinergiaEmail)
    if (!emailCheck.isValid) {
      toast({
        title: "Correo inválido",
        description: emailCheck.reason || "Por favor, ingresa un correo real.",
        variant: "destructive",
      })
      setPrinergiaSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prinergiaEmail.split("@")[0],
          email: prinergiaEmail,
          service_type: "Prinergia - Terapeuta Interesado"
        })
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.success) {
        setPrinergiaRegistered(true)
        toast({
          title: "¡Interés Registrado! 🚀",
          description: "Te avisaremos apenas Prinergia esté disponible.",
        })
      } else {
        toast({
          title: "Error al registrar",
          description: data?.error || "El correo electrónico no es válido o no existe.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Prinergia interest error:", err)
      toast({
        title: "Error de red",
        description: "Hubo un problema de conexión. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setPrinergiaSubmitting(false)
    }
  }

  const sections = [
    { id: "inicio", name: t.nav.home, icon: HomeIcon },
    {
      id: profileRole === "ai" ? "ai-engineering" : "data-engineering",
      name: profileRole === "ai" ? t.nav.aiEngineering : t.nav.dataEngineering,
      icon: profileRole === "ai" ? Brain : Database,
    },
    { id: "servicios", name: t.nav.services, icon: Briefcase },
    { id: "optimizacion-visual", name: t.nav.optimization, icon: Cpu },
    { id: "recursos", name: t.nav.freeResources, icon: Sparkles },
    { id: "experiencia", name: t.nav.experience, icon: User },
    { id: "clientes", name: t.nav.clients, icon: Building2 },
    { id: "casos", name: t.nav.caseStudies, icon: Trophy },
    { id: "faq", name: t.nav.faq, icon: HelpCircle },
    { id: "contacto", name: t.nav.contact, icon: Mail },
  ]

  const faqs = [
    {
      q: t.faq.items[0]?.q || "¿Trabajas solo con empresas grandes?",
      a: t.faq.items[0]?.a || "",
      icon: Building2,
    },
    {
      q: t.faq.items[1]?.q || "¿Qué haces si mi equipo es creativo pero desordenado?",
      a: t.faq.items[1]?.a || "",
      icon: Sparkles,
    },
    {
      q: t.faq.items[2]?.q || "¿Automatizas todo o puedo elegir solo una parte?",
      a: t.faq.items[2]?.a || "",
      icon: Settings,
    },
    {
      q: t.faq.items[3]?.q || "¿En cuánto tiempo veo resultados?",
      a: t.faq.items[3]?.a || "",
      icon: Clock,
    },
    {
      q: t.faq.items[4]?.q || "¿Cómo cobras?",
      a: t.faq.items[4]?.a || "",
      icon: Banknote,
    },
    {
      q: t.faq.items[5]?.q || "¿Qué significa que tu metodología sea neurodivergent-friendly?",
      a: t.faq.items[5]?.a || "",
      icon: Brain,
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 100
          setShowScrollTop(window.scrollY > 500)

          for (const section of sections) {
            const element = document.getElementById(section.id)
            if (element) {
              const { offsetTop, offsetHeight } = element
              if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                setActiveSection(section.id)
                break
              }
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 90 // Navbar height + breathing room
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Navigation */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300">
        <div 
          className={`pointer-events-auto bg-card/95 backdrop-blur-md shadow-lg border border-border w-[calc(100vw-1.5rem)] md:w-auto flex flex-col gap-2 transition-all duration-300 ${
            mobileMenuOpen ? "rounded-[24px] px-4 sm:px-6 py-3" : "rounded-full px-4 sm:px-6 py-2"
          }`}
          onMouseLeave={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-lg text-foreground cursor-pointer select-none" onClick={scrollToTop}>
              <img src="/images/logo-isotipo.webp" alt="Javier Mujica Logo" width={40} height={40} loading="eager" decoding="async" className="h-8 sm:h-10 w-auto object-contain" />
              <span className="hidden sm:inline text-sm">Javier Mujica</span>
            </div>
            
            {/* Navigation and controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden md:flex items-center gap-2">
                {sections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToSection(section.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground shadow-md scale-110"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground hover:scale-105"
                      }`}
                      title={section.name}
                    >
                      <IconComponent className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>

              <Link 
                href="/articulos"
                prefetch={false}
                className="hidden md:flex text-xs hover:bg-secondary text-muted-foreground hover:text-foreground font-semibold px-3 py-1.5 rounded-full whitespace-nowrap items-center gap-1 border border-border"
                title="Artículos de IA y Automatización"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{t.nav.articles}</span>
              </Link>

              <Link 
                href="/unicorn-bible"
                prefetch={false}
                className="hidden md:flex text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold px-3 py-1.5 rounded-full whitespace-nowrap items-center gap-1.5 transition-all"
                title="CÓDIGO & CAPITAL: La Biblia de los Squads Ágiles (4 E-Books)"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t.nav.ebooks}</span>
              </Link>

              <Link 
                href="/vibecode"
                prefetch={false}
                className="btn-bootcamp-premium hidden md:flex text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap ml-1 items-center gap-1"
                title="Bootcamp Vibecode Lab"
              >
                <span>{t.nav.bootcamp}</span>
              </Link>

              {/* Language Selector ES | EN */}
              <LanguageToggle currentLocale={locale} />
              
              {/* Styled Switch Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-10 sm:h-7 sm:w-12 shrink-0 cursor-pointer rounded-full border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800/80 p-0.5 transition-colors duration-300 ease-in-out focus:outline-none hover:scale-105 active:scale-95 ml-0"
                title={theme === "light" ? t.nav.themeDark : t.nav.themeLight}
              >
                <span className="sr-only">Toggle theme</span>
                <span
                  className={`pointer-events-none flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-primary text-primary-foreground shadow-md ring-0 transition duration-300 ease-in-out ${
                    theme === "light" ? "translate-x-4 sm:translate-x-5" : "translate-x-0"
                  }`}
                >
                  {theme === "light" ? (
                    <Sun className="h-3 w-3 text-amber-500" />
                  ) : (
                    <Moon className="h-3 w-3 text-indigo-300" />
                  )}
                </span>
              </button>

              {/* Hamburger Button (Mobile only) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition md:hidden ml-0"
                title={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown (Vertical sections list) */}
          {mobileMenuOpen && (
            <div className="flex flex-col gap-2 pt-2 border-t border-border/60 md:hidden animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {sections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToSection(section.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-left text-sm font-semibold ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <IconComponent className="h-4 w-4 shrink-0" />
                      <span>{section.name}</span>
                    </button>
                  )
                })}
              </div>
              <div className="pt-2 border-t border-border/40 space-y-2">
                <Link 
                  href="/articulos"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-sm bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 px-4 rounded-xl w-full border border-border"
                >
                  <FileText className="h-4 w-4" />
                  <span>Artículos & Blog</span>
                </Link>
                <Link 
                  href="/unicorn-bible"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl w-full"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>📚 La Biblia del Squad Ágil (4 E-Books)</span>
                </Link>
                <Link 
                  href="/vibecode"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-bootcamp-premium flex items-center justify-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl w-full"
                >
                  <span>🚀 Bootcamp Vibecode Lab</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-20 right-5 sm:bottom-24 sm:right-6 z-40 bg-indigo-600/80 hover:bg-indigo-600 text-white p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

      {/* Section 1: Inicio */}
      <section id="inicio" className="min-h-screen flex flex-col px-4 py-16 md:py-24">
        <div className="container max-w-6xl mx-auto my-auto">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <img
                  src="/images/logo-completo.webp"
                  alt="Javier Mujica - Consultoría en IA Aplicada"
                  className="h-64 w-auto hover:scale-105 transition-transform duration-300 brightness-150 contrast-125 saturate-110"
                  width={256}
                  height={256}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <a
                  href="https://verticapp.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 group shadow-sm backdrop-blur-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Nuevo en portafolio: <strong>VerticApp.pro</strong> · Coach de Handstand con IA</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
              {/* Profile Role Switcher (AI Engineer vs Data Engineer) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-secondary/70 border border-border/80 backdrop-blur-md shadow-lg w-full sm:w-fit">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span>Enfoque Profesional:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 bg-background/80 p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("ai")}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                      profileRole === "ai"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Brain className="h-3.5 w-3.5 shrink-0" />
                    <span>AI Engineer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("data")}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                      profileRole === "data"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 scale-[1.02]"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Database className="h-3.5 w-3.5 shrink-0" />
                    <span>Data Engineer</span>
                  </button>
                </div>
              </div>

              {profileRole === "ai" ? (
                <>
                  <h1
                    className="text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent py-4 animate-fade-in"
                    style={{ lineHeight: "1.3" }}
                  >
                    {locale === "en"
                      ? "AI Agents, Advanced RAG & Production-Ready Workflows"
                      : "Agentes de IA, Sistemas RAG & Soluciones en Producción"}
                  </h1>
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-lg sm:text-xl font-semibold text-foreground/90">
                      {locale === "en"
                        ? "Industrial & Systems Engineer (U. of Chile) | Forward-Deployed AI Engineer"
                        : "Ingeniero Civil Industrial (U. de Chile) | AI Engineer & Forward Deployed"}
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {locale === "en"
                        ? "Design, engineering, and deployment of LLM-powered ecosystems (multi-agent orchestration, MCP protocol, advanced RAG, and LLMOps) alongside robust operational integrations in Python & TypeScript."
                        : "Diseño, construcción y despliegue de soluciones basadas en LLMs (ecosistemas multi-agente, protocolo MCP, RAG avanzado y LLMOps) e integraciones operativas de alto impacto con Python y TypeScript."}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h1
                    className="text-4xl font-bold tracking-tight lg:text-6xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent py-4 animate-fade-in"
                    style={{ lineHeight: "1.3" }}
                  >
                    {locale === "en"
                      ? "Data Engineering & End-to-End Analytics Products"
                      : "Data Engineering & Productos de Datos End-to-End"}
                  </h1>
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-lg sm:text-xl font-semibold text-foreground/90">
                      {locale === "en"
                        ? "Industrial & Systems Engineer (U. of Chile) | Cloud Data Architect"
                        : "Ingeniero Civil Industrial (U. de Chile) | Data Engineer & Cloud Architecture"}
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {locale === "en"
                        ? "Architecture and operation of scalable ETL/ELT pipelines, modern cloud warehouses (PostgreSQL, BigQuery, Databricks), and governed production data models that enable autonomous consumption."
                        : "Diseño y operación de pipelines ETL/ELT escalables, arquitecturas Cloud modernas (PostgreSQL, BigQuery, Databricks) y modelos de datos gobernados en producción para habilitar consumo autónomo."}
                    </p>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 pt-2">
                {profileRole === "ai" ? (
                  <Button 
                    size="lg" 
                    onClick={() => scrollToSection("ai-engineering")} 
                    className="h-auto whitespace-normal text-center py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold group shadow-lg shadow-emerald-600/20"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    {locale === "en" ? "AI Engineering & Agents" : "AI Engineering & Agentes"}{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={() => scrollToSection("data-engineering")} 
                    className="h-auto whitespace-normal text-center py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold group shadow-lg shadow-cyan-600/20"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    {locale === "en" ? "Data Pipelines & Cloud" : "Data Engineering & Pipelines"}{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}

                <a
                  className="inline-block w-full sm:w-auto"
                  href={profileRole === "ai" ? "/CV_Javier_Mujica_AI_Engineer_Buk.pdf" : "/CV_Javier_Mujica_Data_Engineer_Buk.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={profileRole === "ai" ? "CV_Javier_Mujica_AI_Engineer.pdf" : "CV_Javier_Mujica_Data_Engineer.pdf"}
                >
                  <Button size="lg" variant="outline" className="h-auto whitespace-normal text-center py-3 border-border/80 hover:bg-secondary/70 gap-2 w-full sm:w-auto">
                    <Download className="h-4 w-4 text-emerald-400" />
                    <span>{locale === "en" ? "Download Resume" : "Descargar CV"} ({profileRole === "ai" ? "AI Engineer" : "Data Engineer"})</span>
                  </Button>
                </a>

                <Button size="lg" variant="outline" onClick={() => scrollToSection("contacto")}>
                  {locale === "en" ? "Request Consultation" : "Solicitar asesoría"}
                </Button>
                <Button variant="outline" size="lg" onClick={() => scrollToSection("casos")}>
                  {locale === "en" ? "View Case Studies" : "Ver casos de éxito"}
                </Button>
                <Link href="/vibecode" prefetch={false} className="block w-full sm:w-auto">
                  <Button size="lg" className="btn-bootcamp-premium w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-none shadow-lg shadow-indigo-600/10 font-bold group flex items-center justify-center gap-2">
                    <span>{t.nav.bootcamp}</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/optimize-hero.webp"
                alt={profileRole === "ai" ? "Javier Mujica - AI Engineer & Forward Deployed" : "Javier Mujica - Data Engineer & Cloud Architecture"}
                className="rounded-xl object-cover max-w-full h-auto shadow-2xl hover:scale-105 transition-transform duration-500"
                width={500}
                height={350}
                loading="lazy"
                fetchPriority="auto"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Technical Section: AI Engineering or Data Engineering based on profileRole */}
      <div className="relative">
        {profileRole === "ai" ? (
          <>
            <div id="data-engineering" className="absolute -top-24 pointer-events-none opacity-0" />
            <AiEngineeringSection onContactClick={() => scrollToSection("contacto")} />
          </>
        ) : (
          <>
            <div id="ai-engineering" className="absolute -top-24 pointer-events-none opacity-0" />
            <DataEngineeringSection onContactClick={() => scrollToSection("contacto")} />
          </>
        )}
      </div>

      {/* Section 2: Servicios */}
      <section id="servicios" className="min-h-screen flex flex-col px-4 py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto my-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Mis Servicios</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Soluciones personalizadas para optimizar la operación de tu empresa (haz clic en cualquiera para ver detalles y metodologías)
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card 
                  key={service.id} 
                  className="group/card flex flex-col justify-between h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in-up cursor-pointer border border-border/60 hover:border-primary/40 overflow-hidden"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="relative h-44 w-full bg-slate-900 border-b border-border/40 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={200}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent transition-opacity duration-300 group-hover/card:opacity-70" />
                    {/* Subtle glow overlay on hover */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader className="pb-4">
                    <IconComponent className="h-8 w-8 text-primary mb-2 transition-transform duration-300 group-hover/card:scale-110 group-hover/card:rotate-3" />
                    <CardTitle className="text-lg transition-colors duration-200 group-hover/card:text-primary">{service.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-4">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
                    <ul className="space-y-2 text-sm mb-4">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-primary hover:text-primary-foreground hover:bg-primary group mt-2 px-5 py-2 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      Ver detalle y metodología{" "}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <ProcessVisualizer />

      {/* Section 2.5: Recursos */}
      <section id="recursos" className="min-h-screen flex flex-col px-4 py-16 md:py-24 bg-secondary/10">
        <div className="container max-w-6xl mx-auto my-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" /> Recursos y Herramientas Gratis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimiza tu carrera y tu negocio con herramientas interactivas impulsadas por IA.
            </p>
          </div>

          {/* Tools Container */}
          <div className="space-y-8 animate-fade-in-up">
            {!emailUnlocked && (
              <div className="max-w-2xl mx-auto p-4 rounded-xl border border-primary/30 bg-primary/5 text-center space-y-1.5 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Modo Interactivo Libre</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa todas las calculadoras y simuladores de inmediato. Al calcular o descargar tu informe detallado te pediremos tu correo para enviarte el resultado y la plantilla Kanban de regalo.
                </p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 items-start">
              
              {/* Tool 1: CV Audit */}
              <Card className="group overflow-hidden border border-indigo-100 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-950/80 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Auditoría de CV y Vacante con IA</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-4">
                      <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                        Analiza la compatibilidad de tu Currículum Vitae con una descripción de cargo y recibe consejos para optimizarlo.
                      </CardDescription>
                      
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="cv-text" className="text-xs font-semibold">Tu Currículum (Experiencia, habilidades)</Label>
                              
                              {/* File Upload Button / Trigger */}
                              <div className="relative">
                                <input
                                  type="file"
                                  id="cv-file"
                                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={handleFileUpload}
                                  disabled={isUploading}
                                />
                                <Label 
                                  htmlFor="cv-file" 
                                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-semibold cursor-pointer border border-primary/20 rounded px-1.5 py-0.5 bg-primary/5 transition-colors"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  Adjuntar CV (PDF, DOC, Imagen)
                                </Label>
                              </div>
                            </div>

                            {/* Loading status */}
                            {isUploading && (
                              <div className="p-3 bg-secondary/10 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Procesando documento...
                              </div>
                            )}

                            {/* Uploaded File Indicator */}
                            {!isUploading && uploadedFile && (
                              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-emerald-400 font-bold">✓</span>
                                  <span className="font-semibold truncate max-w-[180px]">{uploadedFile.name}</span>
                                  <span className="text-[10px] text-emerald-400/60 font-mono">({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                <button 
                                  onClick={handleRemoveFile}
                                  className="p-1 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-all duration-200"
                                  title="Quitar archivo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Textarea for CV text input */}
                            {!isUploading && !uploadedFile && (
                              <Textarea
                                id="cv-text"
                                placeholder="Pega aquí el contenido de tu CV... o adjunta un archivo arriba"
                                className="h-28 resize-none bg-background border-border text-xs"
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                              />
                            )}

                            {/* Display extracted text read-only when file is uploaded */}
                            {!isUploading && uploadedFile && (
                              <div className="relative group">
                                <Textarea
                                  id="cv-text-read"
                                  readOnly
                                  className="h-28 resize-none bg-background/50 border-border text-xs text-muted-foreground cursor-not-allowed select-none"
                                  value={cvText}
                                />
                                <div className="absolute inset-0 bg-transparent" />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="jd-text" className="text-xs font-semibold">Descripción del Cargo / Job Description</Label>
                              
                              {/* File Upload Button / Trigger for JD */}
                              <div className="relative">
                                <input
                                  type="file"
                                  id="jd-file"
                                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                  className="hidden"
                                  onChange={handleJdFileUpload}
                                  disabled={isUploadingJd}
                                />
                                <Label 
                                  htmlFor="jd-file" 
                                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-semibold cursor-pointer border border-primary/20 rounded px-1.5 py-0.5 bg-primary/5 transition-colors"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  Adjuntar Vacante (PDF, DOC, Imagen)
                                </Label>
                              </div>
                            </div>

                            {/* Loading status */}
                            {isUploadingJd && (
                              <div className="p-3 bg-secondary/10 border border-dashed border-border rounded-lg text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                <span className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Procesando documento...
                              </div>
                            )}

                            {/* Uploaded File Indicator */}
                            {!isUploadingJd && uploadedJdFile && (
                              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-emerald-400 font-bold">✓</span>
                                  <span className="font-semibold truncate max-w-[180px]">{uploadedJdFile.name}</span>
                                  <span className="text-[10px] text-emerald-400/60 font-mono">({(uploadedJdFile.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                <button 
                                  onClick={handleRemoveJdFile}
                                  className="p-1 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-all duration-200"
                                  title="Quitar archivo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Textarea for JD text input */}
                            {!isUploadingJd && !uploadedJdFile && (
                              <Textarea
                                id="jd-text"
                                placeholder="Pega aquí la descripción del cargo a postular... o adjunta un archivo arriba"
                                className="h-28 resize-none bg-background border-border text-xs"
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                              />
                            )}

                            {/* Display extracted text read-only when file is uploaded */}
                            {!isUploadingJd && uploadedJdFile && (
                              <div className="relative group">
                                <Textarea
                                  id="jd-text-read"
                                  readOnly
                                  className="h-28 resize-none bg-background/50 border-border text-xs text-muted-foreground cursor-not-allowed select-none"
                                  value={jdText}
                                />
                                <div className="absolute inset-0 bg-transparent" />
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={handleRunAudit}
                          disabled={isAuditing || !cvText || !jdText}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          {isAuditing ? "Analizando compatibilidad..." : "Analizar Compatibilidad"}
                        </Button>

                        {auditResult && (
                          <div className="mt-4 p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-4 animate-fade-in-up">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                              {/* Circular match percentage badge */}
                              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-primary bg-primary/5 shrink-0">
                                <span className="text-xl font-bold text-foreground">{auditResult.match_percentage}%</span>
                                <span className="absolute bottom-1.5 text-[7px] uppercase tracking-wider text-muted-foreground font-semibold">Match</span>
                              </div>
                              <div className="space-y-1 text-center sm:text-left">
                                <h4 className="font-semibold text-foreground text-sm">Resultado del Análisis</h4>
                                <p className="text-[11px] text-muted-foreground">Tu perfil cuenta con un alto porcentaje de coincidencia con los requisitos de la vacante.</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                💡 Puntos de Mejora (Upcycling Hints)
                              </h5>
                              <ul className="grid gap-1.5 pl-2">
                                {auditResult.upcycling_hints.map((hint: string, idx: number) => (
                                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                    <span>{hint}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Download Audit Report Button */}
                            <div className="pt-2 border-t border-border/40 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5 border-primary/40 hover:bg-primary/10"
                                onClick={() => {
                                  requireEmailAccess(
                                    "Descargar Informe de Compatibilidad",
                                    "Ingresa tu nombre y correo para descargar el informe completo de compatibilidad y recibir la plantilla Kanban Neuro-Friendly de regalo.",
                                    downloadAuditReport
                                  )
                                }}
                              >
                                <Download className="h-3.5 w-3.5 text-primary" />
                                Descargar Informe de Auditoría (.txt)
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tool 2: ROI Calculator */}
              <Card className="group overflow-hidden border border-teal-100 dark:border-teal-500/20 hover:border-teal-300 dark:hover:border-teal-500/40 bg-gradient-to-br from-teal-50 via-white to-slate-50 dark:from-teal-950/40 dark:via-slate-900/60 dark:to-slate-950/80 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Calculadora de ROI de Automatización</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-4">
                      <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                        Descubre cuánto dinero y tiempo puedes ahorrar al automatizar tus procesos manuales rutinarios.
                      </CardDescription>
                      
                      <div className="space-y-4 pt-1">
                        <div className="grid gap-3 grid-cols-2">
                          <div className="space-y-1">
                            <Label htmlFor="hours-per-week" className="text-xs">Horas perdidas/semana</Label>
                            <Input
                              id="hours-per-week"
                              type="number"
                              min="1"
                              max="80"
                              className="bg-background border-border text-xs"
                              value={hoursPerWeek}
                              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="hourly-rate" className="text-xs">Valor de tu hora (CLP)</Label>
                            <Input
                              id="hourly-rate"
                              type="number"
                              step="1000"
                              className="bg-background border-border text-xs"
                              value={hourlyRate}
                              onChange={(e) => setHourlyRate(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        {/* Botón de cálculo interactivo */}
                        {(!roiCalculated && !emailUnlocked) ? (
                          <div className="pt-1">
                            <Button
                              onClick={() => {
                                requireEmailAccess(
                                  "Ver Resultado del Cálculo de ROI",
                                  "Ingresa tu nombre y correo para ver el desglose completo del ahorro mensual, anual y horas recuperadas para tu negocio.",
                                  () => setRoiCalculated(true)
                                )
                              }}
                              className="w-full flex items-center justify-center gap-2 font-semibold shadow-md shadow-primary/10"
                            >
                              <Calculator className="h-4 w-4" />
                              Calcular Ahorro y ROI
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 animate-fade-in-up">
                            <div className="p-4 rounded-xl bg-secondary/35 border border-border/50 grid grid-cols-2 gap-2 text-center">
                              <div className="space-y-0.5 border-r border-border/50">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ahorro Mensual</span>
                                <div className="text-base font-bold text-primary">
                                  CLP ${(hoursPerWeek * 4.33 * hourlyRate).toLocaleString("es-CL", { maximumFractionDigits: 0 })}
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ahorro Anual</span>
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                  CLP ${(hoursPerWeek * 52 * hourlyRate).toLocaleString("es-CL", { maximumFractionDigits: 0 })}
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground leading-relaxed text-center">
                              Al automatizar estas tareas repetitivas con IA y RPA, recuperas aproximadamente <strong>{(hoursPerWeek * 4.33).toFixed(1)} horas</strong> al mes de foco estratégico y tranquilidad mental.
                            </p>

                            <div className="pt-2 border-t border-border/40 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5 border-teal-500/40 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                onClick={() => {
                                  requireEmailAccess(
                                    "Descargar Cálculo de ROI",
                                    "Ingresa tu nombre y correo para descargar el cálculo de ROI en formato texto e iniciar tu optimización operativa.",
                                    downloadRoiReport
                                  )
                                }}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Descargar Cálculo de ROI (.txt)
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tool 3: Prinergia Ecosistema para Terapeutas */}
              <Card className="group overflow-hidden border border-rose-100 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40 bg-gradient-to-br from-rose-50 via-white to-slate-50 dark:from-rose-950/30 dark:via-slate-900/60 dark:to-slate-950/80 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-emerald-400" />
                    <CardTitle className="text-xl">Prinergia: Ecosistema para Terapeutas</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-4">
                      <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                        Plataforma integrada para gestionar reservas, cobros recurrentes y fichas clínicas sin perder tu paz mental.
                      </CardDescription>
                      
                      <div className="space-y-4 pt-1">
                        {/* Simulator UI */}
                        <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 space-y-3">
                          <h6 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> Simulador de Agendamiento
                          </h6>
                          
                          <div className="grid gap-2 grid-cols-2 text-xs">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Servicio</Label>
                              <select 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                                value={prinergiaService}
                                onChange={(e) => setPrinergiaService(e.target.value)}
                              >
                                <option value="Psicoterapia Individual">Psicoterapia Individual</option>
                                <option value="Terapia de Parejas">Terapia de Parejas</option>
                                <option value="Consulta de Bienestar">Consulta de Bienestar</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Bloque Horario</Label>
                              <select 
                                className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                                value={prinergiaSlot}
                                onChange={(e) => setPrinergiaSlot(e.target.value)}
                              >
                                <option value="Lunes 10:00 AM">Lunes 10:00 AM</option>
                                <option value="Miércoles 4:00 PM">Miércoles 4:00 PM</option>
                                <option value="Viernes 2:00 PM">Viernes 2:00 PM</option>
                              </select>
                            </div>
                          </div>

                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="w-full text-xs font-medium"
                            onClick={handleSimulateBooking}
                          >
                            Simular Reserva Automática
                          </Button>

                          {prinergiaSimResult && (
                            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 leading-relaxed font-mono animate-fade-in-up">
                              {prinergiaSimResult}
                            </div>
                          )}
                        </div>

                        {/* Prinergia therapist interest capture */}
                        {prinergiaRegistered ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1 animate-fade-in-up">
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">✅ ¡Registrado!</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Te avisaré cuando Prinergia esté lista. Mientras más terapeutas se anoten, más rápido la construimos. 🚀
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handlePrinergiaInterest} className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              ¿Eres terapeuta y esto te interesa? Deja tu correo y te aviso cuando esté disponible:
                            </p>
                            <div className="flex gap-2">
                              <Input
                                type="email"
                                placeholder="tu@correo.com"
                                value={prinergiaEmail}
                                onChange={(e) => setPrinergiaEmail(e.target.value)}
                                required
                                className="text-xs h-8 flex-1 bg-background/60"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                disabled={prinergiaSubmitting}
                                className="h-8 px-3 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                              >
                                {prinergiaSubmitting ? "..." : "Me interesa"}
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tool 4: Kanban Board */}
              <Card className="group overflow-hidden border border-blue-100 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-slate-950/80 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Plantilla Kanban Neuro-Friendly / Altas Capacidades</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-4">
                      <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                        Estructura visual simplificada diseñada especialmente para organizar tareas de forma flexible, reduciendo el agobio mental.
                      </CardDescription>
                      
                      <div className="space-y-4 pt-1">
                        <div className="p-3 rounded-lg bg-secondary/15 border border-border/50 space-y-2">
                          <h6 className="text-xs font-semibold text-foreground">Columnas sugeridas:</h6>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 text-[10px] rounded bg-primary/20 text-primary border border-primary/20">Para hoy (Max 3)</span>
                            <span className="px-2 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20">En progreso (Max 1)</span>
                            <span className="px-2 py-0.5 text-[10px] rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border border-yellow-500/20">En espera / Bloqueado</span>
                            <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">¡Hecho!</span>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            className="w-full flex items-center justify-center gap-1.5"
                            onClick={() => {
                              requireEmailAccess(
                                "Obtener Plantilla Kanban Neuro-Friendly",
                                "Ingresa tu nombre y correo para acceder a la plantilla Trello y recibirla directamente en tu bandeja.",
                                () => {
                                  window.open("https://trello.com/b/dm036rnt/kanban-tda-friendly", "_blank", "noopener,noreferrer")
                                }
                              )
                            }}
                          >
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Acceder a Plantilla Trello
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tool 5: Deep Links Generator for Instagram */}
              <Card className="group overflow-hidden border border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/40 bg-gradient-to-br from-purple-50 via-white to-slate-50 dark:from-purple-950/40 dark:via-slate-900/60 dark:to-slate-950/80 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl md:col-span-2">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-purple-400" />
                    <CardTitle className="text-xl">Deep Links para Instagram & TikTok (Bypass IAB)</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-4">
                      <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                        Crea enlaces profundos inteligentes que rompen el navegador cerrado de Instagram y fuerzan la apertura directa en Google Chrome / Safari o Apps Nativas (YouTube, WhatsApp, Tienda Web) para triplicar tus conversiones.
                      </CardDescription>
                      
                      <div className="space-y-4 pt-1">
                        <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between gap-4">
                          <div>
                            <strong className="text-purple-300 font-bold">¡3 Enlaces GRATIS incluidos!</strong>
                            <p className="text-[11px] text-zinc-400">Sin necesidad de poner tarjeta. Luego solo $1 USD/mes.</p>
                          </div>
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                            VS $14 linktw.in
                          </span>
                        </div>
                        
                        <Link
                          href="/deeplink"
                          prefetch={false}
                          className="w-full block pt-2"
                        >
                          <Button className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20">
                            <Zap className="h-4 w-4 fill-current" />
                            Acceder al Creador de Deep Links (3 Gratis)
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tool 6: VerticApp AI Coach */}
              <Card className="group overflow-hidden border border-teal-100 dark:border-teal-500/20 hover:border-teal-300 dark:hover:border-teal-500/40 bg-gradient-to-br from-teal-50 via-white to-emerald-50/40 dark:from-teal-950/40 dark:via-slate-900/60 dark:to-emerald-950/40 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl md:col-span-2">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-emerald-400" />
                      <CardTitle className="text-xl">VerticApp.pro — Coach de Handstand con IA</CardTitle>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0">
                      SaaS en Producción
                    </span>
                  </div>
                </CardHeader>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 space-y-4">
                      <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                        Plataforma SaaS pionera que utiliza visión artificial on-device para analizar la alineación biomecánica (180°), retroversión pélvica y neutralidad cervical en tiempo real mientras entrenas la vertical, con inferencia &lt;16 ms y 100% de privacidad local.
                      </CardDescription>
                      
                      <div className="space-y-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                          <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/20">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Latencia</span>
                            <div className="text-base font-bold text-teal-400">&lt;16 ms On-Device</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Precisión</span>
                            <div className="text-base font-bold text-emerald-400">99.4% Cinemática</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Privacidad</span>
                            <div className="text-base font-bold text-cyan-400">100% Sin Enviar Video</div>
                          </div>
                        </div>

                        <a
                          href="https://verticapp.pro"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full block pt-1"
                        >
                          <Button className="w-full bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20">
                            <Sparkles className="h-4 w-4 fill-current" />
                            Abrir VerticApp.pro (Prueba Gratis en Navegador) →
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tool 7: The Unicorn Squad Bible (Bundle 4 E-Books) */}
              <Card className="group overflow-hidden border border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60 bg-gradient-to-br from-amber-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-indigo-950/40 dark:to-emerald-950/30 shadow-xl backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out hover:shadow-2xl md:col-span-2">
                <CardHeader className="pb-3 cursor-pointer">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <BookOpen className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                      <CardTitle className="text-lg sm:text-xl min-w-0 break-words leading-snug">CÓDIGO &amp; CAPITAL: La Biblia de los Squads Ágiles (4 E-Books)</CardTitle>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full whitespace-normal text-center max-w-full">
                      Nuevo Bundle Editorial + Certificación SQR-2026
                    </span>
                  </div>
                </CardHeader>
                <div className="px-6 pb-6 space-y-4">
                  <CardDescription className="text-sm text-muted-foreground pb-2 border-b border-border/20">
                    La tetralogía operativa de <strong>VibeCode Lab</strong> para escalar un SaaS desde <code className="text-xs">localhost</code> hasta una ronda de Venture Capital: Arquitectura en Producción (Tomo I), Pitch Escénico de 180s (Tomo II), Unit Economics y NRR (Tomo III) y SAFEs / Cap Table hacia el Unicornio (Tomo IV).
                  </CardDescription>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Tomo I</span>
                      <div className="font-semibold text-foreground break-words leading-tight">Localhost a Prod</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">Tomo II</span>
                      <div className="font-semibold text-foreground break-words leading-tight">El Pitch Irrefutable</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Tomo III</span>
                      <div className="font-semibold text-foreground break-words leading-tight">Unit Economics SaaS</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <span className="text-[10px] font-bold text-pink-400 uppercase">Tomo IV</span>
                      <div className="font-semibold text-foreground break-words leading-tight">SAFEs &amp; Cap Table</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Link href="/unicorn-bible" prefetch={false} className="block w-full sm:flex-1">
                      <Button className="h-auto min-h-11 w-full max-w-full whitespace-normal break-words px-3 py-3 text-sm leading-tight text-center bg-gradient-to-r from-emerald-600 via-indigo-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg">
                        <BookOpen className="h-4 w-4 shrink-0" />
                        <span>Ver los 4 Tomos y Comprar Bundle →</span>
                      </Button>
                    </Link>
                    <Link href="/ebook-quiz" prefetch={false} className="block w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto font-semibold border-emerald-500/40 hover:bg-emerald-500/10">
                        Quiz &amp; Certificado SQR-2026
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

            </div>

            {/* Botón de Restablecimiento (solo visible si el usuario ya ingresó sus datos) */}
            {emailUnlocked && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("recursos_unlocked");
                    window.location.reload();
                  }}
                >
                  <Lock className="h-3 w-3 mr-2" />
                  Restablecer modo de prueba (Bloquear descargas)
                </Button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Section 3: Experiencia */}
      <section id="experiencia" className="min-h-screen flex flex-col px-4 py-16 md:py-24">
        <div className="container max-w-6xl mx-auto my-auto space-y-16">
          <div className="grid gap-12 lg:grid-cols-3 items-center">
            <div className="lg:col-span-1 flex justify-center animate-fade-in-left">
              <img
                src="/images/javier-personal.webp"
                alt="Javier Mujica - Consultor en IA Aplicada"
                className="rounded-full object-cover border-4 border-primary/50 shadow-2xl shadow-primary/20 hover:scale-[1.3] transition-transform duration-500"
                width={220}
                height={220}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="lg:col-span-2 space-y-6 animate-fade-in-right">
              <h2 className="text-4xl font-bold">Experiencia y Trayectoria</h2>
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                <p>
                  Soy Ingeniero Civil Industrial de la Universidad de Chile, con una sólida trayectoria en optimización de procesos de negocio, automatización, robótica industrial y transformación digital.
                </p>
                <p>
                  Mi enfoque combina una mirada estratégica y técnica para impulsar tu eficiencia operativa. Creo firmemente que los procesos deben adaptarse a las personas y no al revés, estructurando el caos con flexibilidad y automatizaciones que eliminen el trabajo mecánico tedioso.
                </p>
                <div className="pt-2">
                  <Button onClick={() => scrollToSection("contacto")} className="group">
                    Consulta sobre tu proyecto{" "}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Real projects gallery component */}
          <div className="animate-fade-in-up animation-delay-200">
            <h3 className="text-lg font-bold mb-6 text-primary flex items-center gap-2">
              📸 Proyectos Reales e Industria (Robótica, Electromovilidad, Energía)
            </h3>
            <ExperienceGallery />
          </div>
        </div>
      </section>

      {/* Section: Clientes */}
      <section id="clientes" className="py-20 bg-secondary/20 border-y border-border/40">
        <div className="container max-w-6xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Empresas que han confiado en mi trabajo</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            He colaborado con equipos de grandes corporaciones y también con emprendedores que están empezando. Todos con un mismo objetivo: optimizar lo que hacen.
          </p>
          <ClientsCarousel />
        </div>
      </section>

      {/* Section 4: Casos de Éxito */}
      <section id="casos" className="min-h-screen flex flex-col px-4 py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto my-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Casos de Éxito</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proyectos que han transformado la operación de mis clientes
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-200">
            <CasesCarousel />
          </div>

          <div className="text-center mt-12 animate-fade-in-up animation-delay-400">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary rounded-lg p-6 hover:shadow-lg transition-all duration-300 border border-border">
              <h3 className="text-xl font-bold mb-3">Experiencia Multisectorial</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Desde agricultura de precisión hasta automatización gubernamental, optimizamos procesos en cualquier
                industria.
              </p>
              <Button onClick={() => scrollToSection("contacto")} className="group">
                Evaluar mi proyecto{" "}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: FAQ */}
      <section id="faq" className="py-20 bg-secondary/10 border-y border-border/40">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Respuestas rápidas sobre cómo trabajo y qué puedes esperar de la consultoría
            </p>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="group/faq border border-border rounded-xl bg-card/50 overflow-hidden transition-all duration-300 ease-out hover:border-primary/40 hover:-translate-x-1 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/80"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-base sm:text-lg hover:text-primary transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                        isOpen ? "transform rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[500px] opacity-100 border-t border-border/50" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-5 flex items-start gap-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {/* Icon that appears with the answer */}
                      <div className={`shrink-0 mt-0.5 p-2 rounded-lg bg-primary/10 border border-primary/20 transition-all duration-500 ${
                        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-2"
                      }`}>
                        {faq.icon && <faq.icon className="h-5 w-5 text-primary" />}
                      </div>
                      <span>{faq.a}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Vibecode Studio & Agendamiento */}
      <section id="contacto" className="py-16 md:py-24 px-4 bg-slate-950/80 border-t border-slate-800">
        <div className="container max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Mentoría & Consultoría 1 a 1
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-sky-300 to-emerald-200">
              Vibecode Studio
            </h2>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Nuestro sistema de acompañamiento personalizado de alto valor para implementar Inteligencia Artificial a medida en tu negocio, aplicación web, base de datos e infraestructura.
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto overflow-hidden p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-900/60 backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-100">
              ¿Listo para escalar tu arquitectura con IA?
            </h3>
            <p className="text-sm text-slate-400">
              Completa el diagnóstico técnico inicial y agenda tu sesión estratégica directamente en nuestra plataforma de agendamiento.
            </p>
            <div className="pt-2">
              <Link href="/agendar" prefetch={false} className="block w-full sm:inline-block sm:w-auto">
                <Button
                  size="lg"
                  className="h-auto min-h-[52px] w-full max-w-full whitespace-normal break-words px-5 py-4 text-sm sm:text-base leading-tight text-center font-bold bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-indigo-500/20"
                >
                  Agendar Sesión en Vibecode Studio →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Detail Modal */}
      <Dialog open={selectedService !== null} onOpenChange={(open) => { if (!open) setSelectedService(null); }}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border border-border text-foreground overflow-y-auto max-h-[90vh] shadow-2xl p-6 rounded-xl">
          {selectedService && (
            <>
              {/* Service Hero Image or Video */}
              <div className="relative h-[250px] w-full rounded-lg overflow-hidden border border-border/50 mb-4 shadow-inner">
                {selectedService.id === "marca-personal" ? (
                  <video 
                    src="/images/experiencia/videoagendaia.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      if (video.currentTime >= 5) {
                        video.currentTime = 0;
                        video.play().catch(() => {});
                      }
                    }}
                  />
                ) : selectedService.id === "automatizacion" ? (
                  <video 
                    src="/images/experiencia/servicio3.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : selectedService.id === "rediseno" ? (
                  <ProcessFlowAnimation />
                ) : selectedService.id === "consultoria" ? (
                  <video 
                    src="/images/experiencia/estrategia.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={selectedService.image} 
                    alt={selectedService.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
              </div>
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <selectedService.icon className="h-8 w-8 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {selectedService.title}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-base text-muted-foreground leading-relaxed pt-2">
                  {selectedService.detailedDescription}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 my-4 text-sm">
                {/* Beneficios */}
                <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" /> Beneficios Clave
                  </h4>
                  <ul className="grid gap-2 pl-4 list-disc text-muted-foreground">
                    {selectedService.benefits.map((benefit: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{benefit}</li>
                    ))}
                  </ul>
                </div>

                {/* Metodología */}
                <div className="p-4 rounded-xl border border-border/50 bg-secondary/15">
                  <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" /> ¿Cómo lo logramos? (Paso a paso)
                  </h4>
                  <div className="grid gap-4 pl-2">
                    {selectedService.methodology.map((step: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <strong className="text-foreground text-sm block">{step.step}</strong>
                        <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prompt para IA de animación (solo si no tiene video adjunto) */}
                {selectedService.id !== "marca-personal" && selectedService.id !== "automatizacion" && selectedService.id !== "rediseno" && selectedService.id !== "consultoria" && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="text-sm font-semibold text-primary mb-1 flex items-center gap-1.5">
                      💡 Prompt Sugerido para Generación de Animación
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Puedes copiar este prompt en herramientas como Runway Gen-2, Luma Dream Machine, Sora o Midjourney/Pika para crear un clip animado que ilustre visualmente este servicio:
                    </p>
                    <div 
                      className="bg-black/50 p-3 rounded-lg border border-border/50 text-xs font-mono select-all cursor-pointer hover:bg-black/75 transition-all duration-300 break-words leading-relaxed text-emerald-300"
                      title="Haz clic para copiar"
                    >
                      {selectedService.animationPrompt}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Desbloqueo / Captura de Lead Inteligente */}
      <Dialog open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 text-foreground shadow-2xl p-6 rounded-2xl">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              {leadModalReason.title || "Desbloquear Acceso"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-center pt-1 leading-relaxed">
              {leadModalReason.description || "Ingresa tu nombre y correo para ver el resultado y acceder a todas las herramientas interactivas."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUnlockLead} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="modal-lead-name" className="text-xs font-semibold">Nombre</Label>
              <Input
                id="modal-lead-name"
                type="text"
                placeholder="Tu nombre"
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="bg-background border-border text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-lead-email" className="text-xs font-semibold">Correo Electrónico</Label>
              <Input
                id="modal-lead-email"
                type="email"
                placeholder="tu@correo.com"
                required
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="bg-background border-border text-xs"
              />
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full font-semibold flex items-center justify-center gap-2 group shadow-lg shadow-primary/20"
                disabled={isLeadSubmitting}
              >
                {isLeadSubmitting ? "Desbloqueando..." : "Desbloquear y continuar"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center leading-tight pt-1">
              🔒 Cuidamos tu privacidad. Recibirás tu resultado de inmediato y la plantilla Kanban Neuro-Friendly en tu bandeja.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />

      <style jsx>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }

      .animate-fade-in-left {
        animation: fadeInLeft 0.8s ease-out forwards;
      }

      .animate-fade-in-right {
        animation: fadeInRight 0.8s ease-out forwards;
      }

      .animation-delay-100 {
        animation-delay: 0.1s;
      }

      .animation-delay-200 {
        animation-delay: 0.2s;
      }

      .animation-delay-300 {
        animation-delay: 0.3s;
      }

      .animation-delay-400 {
        animation-delay: 0.4s;
      }

      /* Smooth scrolling for the entire page */
      html {
        scroll-behavior: smooth;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
      }
    `}</style>
    </div>
  )
}
