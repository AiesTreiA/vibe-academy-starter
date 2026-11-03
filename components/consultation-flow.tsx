"use client"

import { useState } from "react"
import { AIAnalysisLoader } from "@/components/ai-analysis-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import MeetingScheduler from "@/components/meeting-scheduler"
import { useRouter } from "next/navigation"

interface ConsultationData {
  company: string
  industry: string
  company_size: string
  current_challenge: string
  process_type: string
  urgency: string
  budget: string
  expected_roi: string
}

interface ContactData {
  name: string
  email: string
  company: string
  phone: string
  service_type: string
  message: string
  consultation_id?: string
}

interface Roadmap {
  phase: string
  duration: string
  activities: string[]
  deliverables: string[]
}

interface Pricing {
  service: string
  minPrice: number
  maxPrice: number
  description: string
}




export default function ConsultationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const router = useRouter()
  const [aiStatus, setAiStatus] = useState<'idle'|'running'|'done'|'error'>('idle')
  const [aiResult, setAiResult] = useState<any | null>(null)


  const [consultationData, setConsultationData] = useState<ConsultationData>({
    company: "",
    industry: "",
    company_size: "",
    current_challenge: "",
    process_type: "digitalizacion",
    urgency: "",
    budget: "",
    expected_roi: "",
  })

  const [contactData, setContactData] = useState<ContactData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    service_type: "",
    message: "",
  })

  const handleInputChange = (field: keyof ConsultationData, value: string) => {
    setConsultationData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContactChange = (field: keyof ContactData, value: string) => {
    setContactData((prev) => ({ ...prev, [field]: value }))
  }

  const generateRoadmap = (): Roadmap[] => {
    if (aiResult && typeof aiResult === "object" && !Array.isArray(aiResult)) {
      const { diagnostico, solucion, impacto, ahorro, siguiente_paso } = aiResult as any
      const cleanText = (value: any) =>
        typeof value === "string"
          ? value
              .replace(/\n/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          : ""

      const splitItems = (text: string) =>
        text
          .split(/(?<!\b(?:[eE][jJ]|[pP]|[eE][tT][cC]|[sS][rR]|[sS][rR][aA]|[dD][rR]|[iI][nN][gG]|[lL][iI][cC]|[eE][eE]|[eE][eE]\.[uU][uU]))\s*\.\s*(?=\s|[A-ZÁÉÍÓÚÑ]|$)|;|\n/)
          .map((item) => item.trim())
          .filter(Boolean)

      const phase1: Roadmap = {
        phase: "Diagnóstico y Análisis",
        duration: "1-2 semanas",
        activities: splitItems(cleanText(diagnostico)).slice(0, 5),
        deliverables: ["Informe de diagnóstico", "Resumen de hallazgos"],
      }

      const phase2: Roadmap = {
        phase: "Diseño de Solución",
        duration: "2-4 semanas",
        activities: splitItems(cleanText(solucion)).slice(0, 6),
        deliverables: ["Propuesta técnica", "Roadmap de implementación"],
      }

      const phase3: Roadmap = {
        phase: "Pilotaje y Ajustes",
        duration: "3-6 semanas",
        activities: [
          `Validar las mejoras propuestas y ajustar según resultados`,
          `Medir impacto estimado: ${cleanText(impacto)}`,
        ],
        deliverables: [
          "Informe de pilotaje",
          `Métricas de ahorro estimadas: ${cleanText(ahorro)}`,
        ],
      }

      const phase4: Roadmap = {
        phase: "Seguimiento y Siguiente Paso",
        duration: "Ongoing",
        activities: [
          `Implementar seguimiento con indicadores clave`,
          `Ejecución del siguiente paso recomendado: ${cleanText(siguiente_paso)}`,
        ],
        deliverables: ["Reporte mensual de desempeño", "Plan de optimización continua"],
      }

      return [phase1, phase2, phase3, phase4]
    }

    const baseRoadmap: Roadmap[] = [
      {
        phase: "Diagnóstico y Análisis",
        duration: "2-3 semanas",
        activities: [
          "Mapeo de procesos actuales",
          "Identificación de cuellos de botella",
          "Análisis de datos y métricas",
          "Entrevistas con stakeholders",
        ],
        deliverables: ["Informe de diagnóstico", "Mapa de procesos AS-IS", "Análisis de gaps"],
      },
      {
        phase: "Diseño de Solución",
        duration: "2-4 semanas",
        activities: [
          "Diseño de procesos optimizados",
          "Selección de tecnologías",
          "Definición de arquitectura",
          "Plan de implementación",
        ],
        deliverables: ["Propuesta técnica", "Mapa de procesos TO-BE", "Plan de proyecto"],
      },
    ]

    if (consultationData.process_type === "rpa") {
      baseRoadmap.push({
        phase: "Desarrollo e Implementación RPA",
        duration: "4-8 semanas",
        activities: [
          "Desarrollo de bots RPA",
          "Testing y validación",
          "Integración con sistemas",
          "Capacitación de usuarios",
        ],
        deliverables: ["Bots RPA funcionales", "Documentación técnica", "Manual de usuario"],
      })
    } else if (consultationData.process_type === "digitalizacion") {
      baseRoadmap.push({
        phase: "Digitalización e Integración",
        duration: "6-12 semanas",
        activities: [
          "Implementación de sistemas",
          "Migración de datos",
          "Integración de plataformas",
          "Capacitación y change management",
        ],
        deliverables: ["Sistema implementado", "Datos migrados", "Usuarios capacitados"],
      })
    } else {
      baseRoadmap.push({
        phase: "Implementación y Optimización",
        duration: "4-10 semanas",
        activities: [
          "Implementación de mejoras",
          "Monitoreo de resultados",
          "Ajustes y optimización",
          "Capacitación continua",
        ],
        deliverables: ["Procesos optimizados", "KPIs establecidos", "Equipo capacitado"],
      })
    }

    baseRoadmap.push({
      phase: "Seguimiento y Soporte",
      duration: "Ongoing",
      activities: ["Monitoreo de KPIs", "Soporte técnico", "Mejora continua", "Reportes de performance"],
      deliverables: ["Dashboards de control", "Reportes mensuales", "Plan de mejora continua"],
    })

    return baseRoadmap
  }

  const getPotentialMultiplier = (potencial?: string) => {
    if (!potencial) return 1
    const normalized = potencial.trim().toUpperCase()
    if (normalized.includes("ALTO")) return 1.4
    if (normalized.includes("MEDIO")) return 1.2
    if (normalized.includes("BAJO")) return 0.95
    return 1
  }

  const getSavingsMultiplier = (ahorro?: string) => {
    if (!ahorro) return 1
    const match = String(ahorro).match(/(\d+)(\.?\d*)\s*%/) // 30% o 30.5%
    if (!match) return 1
    const sav = Number(match[1])
    if (Number.isNaN(sav)) return 1
    // A mayor porcentaje de ahorro, ofrecemos un precio ligeramente mayor hacia valor percibido
    return 1 + Math.min(Math.max(sav / 200, 0), 0.5)
  }

  const generatePricing = (): Pricing[] => {
    const isMediana = consultationData.company_size === "mediana"
    const isGrande = consultationData.company_size === "grande"
    const isPequena = !isMediana && !isGrande

    const basePricing: Pricing[] = []

    if (isPequena) {
      basePricing.push({
        service: "Diagnóstico y Análisis",
        minPrice: 300,
        maxPrice: 500,
        description: "Evaluación inicial de procesos, identificación de cuellos de botella y diseño de solución ágil",
      })

      if (consultationData.process_type === "rpa") {
        basePricing.push({
          service: "Implementación RPA / Automatización",
          minPrice: 500,
          maxPrice: 1500,
          description: "Desarrollo e integración de automatizaciones clave (ej: chatbots, flujos con IA/Make)",
        })
      } else if (consultationData.process_type === "digitalizacion") {
        basePricing.push({
          service: "Digitalización e Implementación Mkt / Ventas",
          minPrice: 500,
          maxPrice: 1500,
          description: "Montaje de landing, automatización de captura de leads y embudo de ventas",
        })
      } else if (consultationData.process_type === "gestion-agricola") {
        basePricing.push({
          service: "Gestión Agrícola (SOFIA/Webfleet)",
          minPrice: 600,
          maxPrice: 1500,
          description: "Implementación de sistemas de gestión agrícola y control de flotas",
        })
      } else if (consultationData.process_type === "bienestar-ia") {
        basePricing.push({
          service: "Automatización IA y Embudo Guiado",
          minPrice: 500,
          maxPrice: 1300,
          description: "Sitio web, agendamiento automático y asistente IA para profesionales independientes",
        })
      } else {
        basePricing.push({
          service: "Consultoría e Implementación Ágil",
          minPrice: 500,
          maxPrice: 1500,
          description: "Optimización de flujo comercial y herramientas clave de productividad",
        })
      }
    } else if (isMediana) {
      basePricing.push({
        service: "Diagnóstico y Análisis Operativo",
        minPrice: 800,
        maxPrice: 1500,
        description: "Evaluación completa de procesos departamentales e integración de herramientas",
      })

      if (consultationData.process_type === "rpa") {
        basePricing.push({
          service: "Implementación RPA Corporativa",
          minPrice: 2000,
          maxPrice: 5500,
          description: "Robots de proceso automatizado e integración con sistemas existentes",
        })
      } else if (consultationData.process_type === "digitalizacion") {
        basePricing.push({
          service: "Digitalización Integral de Procesos",
          minPrice: 2000,
          maxPrice: 5500,
          description: "Transformación digital completa con integración de CRM y flujos comerciales",
        })
      } else if (consultationData.process_type === "gestion-agricola") {
        basePricing.push({
          service: "Gestión Agrícola (SOFIA/Webfleet)",
          minPrice: 2000,
          maxPrice: 5500,
          description: "Implementación de sistemas de gestión agrícola y control de flotas",
        })
      } else if (consultationData.process_type === "bienestar-ia") {
        basePricing.push({
          service: "Acompañamiento Integral y Automatización IA",
          minPrice: 1500,
          maxPrice: 4000,
          description: "Plataforma multi-terapeuta y automatización operativa",
        })
      } else {
        basePricing.push({
          service: "Consultoría y Rediseño de Procesos",
          minPrice: 1800,
          maxPrice: 5000,
          description: "Rediseño de procesos multiequipo y seguimiento de KPIs",
        })
      }
    } else {
      // Grande
      basePricing.push({
        service: "Diagnóstico y Levantamiento de Arquitectura",
        minPrice: 1500,
        maxPrice: 3000,
        description: "Evaluación exhaustiva de arquitectura de sistemas, seguridad y procesos enterprise",
      })

      if (consultationData.process_type === "rpa") {
        basePricing.push({
          service: "Desarrollo e Integración RPA Enterprise",
          minPrice: 7000,
          maxPrice: 22000,
          description: "Automatización a gran escala, orquestación de bots y alta disponibilidad",
        })
      } else if (consultationData.process_type === "digitalizacion") {
        basePricing.push({
          service: "Transformación Digital Enterprise",
          minPrice: 7000,
          maxPrice: 22000,
          description: "Digitalización core, migración e integración de sistemas complejos",
        })
      } else if (consultationData.process_type === "gestion-agricola") {
        basePricing.push({
          service: "Gestión Agrícola Enterprise",
          minPrice: 7000,
          maxPrice: 20000,
          description: "Integración masiva de flotas y sistemas agrícolas avanzados",
        })
      } else {
        basePricing.push({
          service: "Consultoría Estratégica y Reingeniería",
          minPrice: 6500,
          maxPrice: 20000,
          description: "Reingeniería integral de procesos de negocio y Change Management",
        })
      }
    }

    const potentialMultiplier = getPotentialMultiplier((aiResult as any)?.potencial)
    const ahorroMultiplier = getSavingsMultiplier((aiResult as any)?.ahorro)

    return basePricing.map((item) => ({
      ...item,
      minPrice: Math.round(item.minPrice * potentialMultiplier * ahorroMultiplier),
      maxPrice: Math.round(item.maxPrice * potentialMultiplier * ahorroMultiplier),
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getEstimatedROI = () => {
    const roiMap = {
      rpa: "300-500%",
      digitalizacion: "200-400%",
      "gestion-agricola": "400-600%",
      rediseno: "150-300%",
      consultoria: "200-350%",
      "bienestar-ia": "250-450%",
    }
    return roiMap[consultationData.process_type as keyof typeof roiMap] || "200-400%"
  }

  const getImplementationTime = () => {
    const timeMap = {
      rpa: "2-4 meses",
      digitalizacion: "3-6 meses",
      "gestion-agricola": "2-5 meses",
      rediseno: "1-3 meses",
      consultoria: "2-4 meses",
      "bienestar-ia": "2-3 meses",
    }
    return timeMap[consultationData.process_type as keyof typeof timeMap] || "2-4 meses"
  }

  const canProceedToStep2 = () => {
    return (
      consultationData.company &&
      consultationData.industry &&
      consultationData.company_size &&
      consultationData.current_challenge &&
      contactData.name &&
      contactData.email
    )
  }

  const canProceedToStep3 = () => {
    return contactData.name && contactData.email && contactData.company
  }


  async function callAIAnalysis(text: string, consultationId: string | number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s

  try {
    const resp = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, consultationId }),
      signal: controller.signal,
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => null)
      return { success: false, raw: txt ?? `status:${resp.status}` }
    }
    
    let json: any = null
    try {
      json = await resp.json()
    } catch {
      return { success: false, raw: "invalid_json_response" }
    }
    
    if (!json || !json.ok) return { success: false, raw: json?.raw ?? json }
    
    return { success: true, data: json.data }
  } catch (err: any) {
    if (err.name === "AbortError") return { success: false, error: "timeout" }
    return { success: false, error: String(err) }
  } finally {
    clearTimeout(timeout)
  }
  }

  function startAIAnalysis(text: string, consultationId: string | number) {
    setAiStatus("running")
    callAIAnalysis(text, consultationId)
      .then((r) => {
        if (r.success) {
          setAiResult(r.data)
          setAiStatus("done")
        } else {
          console.warn("AI analysis failed", r)
          setAiStatus("error")
        }
      })
      .catch((e) => {
        console.error("AI analysis error", e)
        setAiStatus("error")
      })
  }

  const submitConsultation = async () => {
    setIsSubmitting(true)
    setLastError(null)

    try {
      const pricing = generatePricing()
      const totalMin = pricing.reduce((sum, item) => sum + item.minPrice, 0)
      const totalMax = pricing.reduce((sum, item) => sum + item.maxPrice, 0)

      const consultationPayload = {
        ...consultationData,
        estimated_min_price: totalMin,
        estimated_max_price: totalMax,
        estimated_duration: getImplementationTime(),
      }

      console.log("🚀 Submitting consultation:", consultationPayload)

      const response = await fetch("/api/submit-consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationPayload),
      })

      const result = await response.json()

      console.log("📥 API Response:", { status: response.status, result })

      if (result.success) {
        setConsultationId(result.consultationId)
        setCurrentStep(2)
        toast({
          title: "Evaluación guardada",
          description: "Tu roadmap ha sido generado exitosamente.",
        })
      
        // reset AI state and start background analysis
        setAiResult(null)
        setAiStatus("running")
        
        // Build comprehensive analysis text
        const analysisText = `
Empresa: ${consultationData.company}
Industria: ${consultationData.industry}
Tamaño: ${consultationData.company_size}
Tipo de Proceso: ${consultationData.process_type}
Urgencia: ${consultationData.urgency}
Presupuesto: ${consultationData.budget}
ROI Esperado: ${consultationData.expected_roi}

Desafío Actual: ${consultationData.current_challenge}
        `.trim()
        
        startAIAnalysis(analysisText, String(result.consultationId))
      } else {
        const errorMessage = result.message || "Error desconocido"
        setLastError(errorMessage)

        // Show specific error messages based on error type
        if (result.error === "TABLES_NOT_FOUND") {
          toast({
            title: "Error de configuración",
            description: "Las tablas de la base de datos no existen. Por favor contacta al administrador.",
            variant: "destructive",
          })
        } else if (result.error === "MISSING_ENV_VARS") {
          toast({
            title: "Error de configuración del servidor",
            description: "Faltan variables de entorno. Por favor contacta al administrador.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error al generar roadmap",
            description: errorMessage,
            variant: "destructive",
          })
        }

        console.error("❌ Submission failed:", result)
      }
    } catch (error) {
      console.error("💥 Network error:", error)
      const errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente."
      setLastError(errorMessage)
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitBooking = async (bookingData: {
    name: string
    email: string
    company: string
    phone: string
    service_type: string
    message: string
    consultation_id: string | null
    meeting_time: string
    meeting_time_formatted: string
  }) => {
    setIsSubmitting(true)
    let isSuccess = false

    try {
      console.log("🚀 Submitting booking to API:", bookingData)

      const response = await fetch("/api/submit-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      console.log("📥 API Response status:", response.status)

      const contentType = response.headers.get("content-type") || ""
      let result: any

      if (contentType.includes("application/json")) {
        result = await response.json()
        console.log("📄 API Response data:", result)
      } else {
        const text = await response.text()
        console.error("❌ Non-JSON response:", text)
        throw new Error(`Server error: ${text}`)
      }

      if (result?.success) {
        console.log("✅ Booking successful, redirecting to frame page")
        isSuccess = true
        router.push("/frame")
      } else {
        console.error("❌ Booking failed:", result)
        throw new Error(result?.error || result?.message || "Server responded with an error")
      }
    } catch (error: any) {
      console.error("💥 Booking submission error:", error)
      toast({
        title: "Error al agendar",
        description: error.message || "Hubo un problema al agendar tu reunión. Intenta nuevamente.",
        variant: "destructive",
      })
      throw error // Re-throw para que MeetingScheduler pueda manejarlo
    } finally {
      if (!isSuccess) {
        setIsSubmitting(false)
      }
    }
  }

  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Evaluemos tu Desafío</h3>
          <p className="text-muted-foreground">
            Responde estas preguntas para generar un roadmap y cotización personalizada
          </p>
        </div>

        {lastError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error:</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{lastError}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                required
                value={contactData.name}
                onChange={(e) => handleContactChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={contactData.email}
                onChange={(e) => handleContactChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Nombre de la empresa o proyecto</Label>
              <Input
                id="company"
                placeholder="Tu empresa o proyecto"
                required
                value={consultationData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Sector / Nicho de tu negocio</Label>
              <Select
                value={consultationData.industry}
                onValueChange={(value) => handleInputChange("industry", value)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Selecciona tu sector o nicho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salud-bienestar">Salud y Bienestar (Terapeutas, Psicólogos, Coaches, Clínicas)</SelectItem>
                  <SelectItem value="marketing-agencias">Marketing, Agencias y E-commerce / Ventas</SelectItem>
                  <SelectItem value="servicios-profesionales">Servicios Profesionales (Consultoría, Abogados, Contadores)</SelectItem>
                  <SelectItem value="educacion-academias">Educación, Formación y Cursos Online</SelectItem>
                  <SelectItem value="tecnologia-saas">Tecnología, Software y SaaS</SelectItem>
                  <SelectItem value="agricola-logistica">Sector Agrícola, Campo y Logística</SelectItem>
                  <SelectItem value="inmobiliaria">Inmobiliario y Real Estate</SelectItem>
                  <SelectItem value="otro">Otro sector / Industria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Tamaño de la empresa / tipo de negocio</Label>
            <Select
              value={consultationData.company_size}
              onValueChange={(value) => handleInputChange("company_size", value)}
            >
              <SelectTrigger id="companySize">
                <SelectValue placeholder="Selecciona el tamaño o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pequena">Pequeña / Micro / Startup / Proyecto Personal</SelectItem>
                <SelectItem value="mediana">Mediana (51-250 empleados)</SelectItem>
                <SelectItem value="grande">Grande (250+ empleados)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentChallenge">¿Qué necesitas resolver, optimizar o automatizar?</Label>
            <Textarea
              id="currentChallenge"
              placeholder="Describe detalladamente qué necesitas solucionar, automatizar o el proyecto que quieres armar (ej: ayuda para dropshipping, automatizar flujos de inventario, etc.)"
              className="min-h-[120px]"
              required
              value={consultationData.current_challenge}
              onChange={(e) => handleInputChange("current_challenge", e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={submitConsultation}
          disabled={!canProceedToStep2() || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "Generando..." : "Generar Roadmap y Cotización"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Toaster />
      </div>
    )
  }

  if (currentStep === 2) {
    if (aiStatus === "running" && !aiResult) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-1">Analizando tu caso</h3>
            <p className="text-muted-foreground text-sm">Nuestra IA está procesando tu información para generar un plan a medida.</p>
          </div>
          <Card className="border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent overflow-hidden">
            <CardContent className="p-0">
              <AIAnalysisLoader />
            </CardContent>
          </Card>
        </div>
      )
    }

    const roadmap = generateRoadmap()
    const pricing = generatePricing()
    const totalMin = pricing.reduce((sum, item) => sum + item.minPrice, 0)
    const totalMax = pricing.reduce((sum, item) => sum + item.maxPrice, 0)
    const isPersonalized = aiResult && typeof aiResult === "object"

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">
            {isPersonalized ? "Tu Roadmap Personalizado" : "Roadmap Recomendado"}
          </h3>
          <p className="text-muted-foreground">
            Basado en tu información, aquí está nuestro plan recomendado para {consultationData.company}
          </p>
        </div>

        {!isPersonalized && aiStatus === "error" && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            ⚠️ El análisis con IA no estuvo disponible en este momento. Te mostramos un roadmap base según tu tipo de proceso. Contáctanos para recibir una propuesta 100% personalizada.
          </div>
        )}

        {/* Desafío Operativo Identificado */}
        {consultationData.current_challenge && (
          <Card className="border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(59,130,246,0.05)] backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                <Target className="h-5 w-5 animate-pulse" />
                Tu Desafío Operativo Identificado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground italic leading-relaxed bg-background/40 p-3 rounded-lg border border-border/30">
                "{consultationData.current_challenge}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resumen del Proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resumen del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Duración Estimada</div>
                  <div className="text-sm text-muted-foreground">{getImplementationTime()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold">ROI Esperado</div>
                  <div className="text-sm text-muted-foreground">{getEstimatedROI()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold">Industria</div>
                  <div className="text-sm text-muted-foreground capitalize">{consultationData.industry}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Plan de Implementación</CardTitle>
            <CardDescription>Fases del proyecto con actividades y entregables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {roadmap.map((phase, index) => (
                <div key={index} className="relative pb-6">
                  <div className="absolute left-4 top-8 bottom-6 w-0.5 bg-gray-200"></div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{phase.phase}</h4>
                        <Badge variant="outline">{phase.duration}</Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Actividades:</h5>
                          <ul className="text-sm space-y-2">
                            {phase.activities.map((activity, actIndex) => (
                              <li key={actIndex} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                                <span className="leading-snug">{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Entregables:</h5>
                          <ul className="text-sm space-y-2">
                            {phase.deliverables.map((deliverable, delIndex) => (
                              <li key={delIndex} className="flex items-start gap-2">
                                <Zap className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                                <span className="leading-snug">{deliverable}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cotización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cotización Estimada
            </CardTitle>
            <CardDescription>Rangos de inversión basados en tu perfil y requerimientos</CardDescription>
          </CardHeader>
          <CardContent>
            {aiResult?.propuesta_comercial?.usar_propuesta_personalizada ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-2">
                  <h4 className="font-bold text-lg text-primary">{aiResult.propuesta_comercial.titulo}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{aiResult.propuesta_comercial.descripcion}</p>
                </div>
                {aiResult.propuesta_comercial.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary/30 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.concepto}</h4>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">
                        {item.monto}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {pricing.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.service}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatPrice(item.minPrice)} - {formatPrice(item.maxPrice)}
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                  <div>
                    <h4 className="font-bold text-lg">Inversión Total Estimada</h4>
                    <p className="text-sm text-muted-foreground">Incluye todas las fases del proyecto</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-primary">
                      {formatPrice(totalMin)} - {formatPrice(totalMax)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Modificar información
          </Button>
          <Button
            onClick={() => {
              setContactData((prev) => ({ ...prev, company: consultationData.company }))
              setCurrentStep(3)
            }}
            className="w-full sm:flex-1 flex items-center justify-center gap-2"
          >
            Agendar consulta personalizada <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <Toaster />
      </div>
    )
  }

  if (currentStep === 3) {
    const initialDataForScheduler = {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || consultationData.company,
      phone: contactData.phone,
      service_type: consultationData.process_type,
      message: contactData.message,
    }

    return (
      <MeetingScheduler
        initialContactData={initialDataForScheduler}
        consultationId={consultationId}
        onBookingSubmit={submitBooking}
        onBack={() => setCurrentStep(2)}
      />
    )
  }

  return null
}
