"use client"

import React, { useState, useEffect, Fragment } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  List,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  TrendingUp,
  User,
  ShieldCheck,
  Database,
  Bot,
  CreditCard,
  Banknote,
  Landmark,
  Loader2,
  RefreshCw,
  Users,
  TicketCheck,
  DollarSign,
  AlertTriangle,
  Zap,
  Sparkles,
  Flame,
  Link2,
  ShieldAlert,
  Shield,
  Lock,
  Activity,
  Eye,
  Server,
  AlertOctagon,
  Check,
  Wallet,
  Cpu,
  Kanban,
  Target,
} from "lucide-react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import AdminSeoTab from "@/components/admin-seo-tab"
import AdminAgendamientoDemo from "@/components/admin-agendamiento-demo"
import AdminMarketingTab from "@/components/admin-marketing-tab"
import { AdminCertificatesTab } from "@/components/vibecodelab/admin-certificates-tab"
import AdminDeeplinksTab from "@/components/admin-deeplinks-tab"
import AdminEmailPreviewTab from "@/components/admin-email-preview-tab"
import AdminAIQuotaTab from "@/components/admin-ai-quota-tab"
import AdminTrelloTab from "@/components/admin-trello-tab"
import AdminEncuestasTab from "@/components/admin-encuestas-tab"
import { AdminInstagramLiveTester } from "@/components/admin/admin-instagram-live-tester"
import { Instagram } from "lucide-react"


// ---- Types ----
interface HealthResult {
  ok: boolean
  latencyMs?: number
  detail?: string
}
interface HealthData {
  checkedAt: string
  services: {
    supabase: HealthResult
    deepseek: HealthResult
    gemini: HealthResult
    mercadopago: HealthResult
    flow: HealthResult
    transbank: HealthResult
    transferencia: HealthResult
  }
}
interface VibecodeStats {
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

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submissions, setSubmissions] = useState<any[]>([])
  
  // States for filters and navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [searchQuery, setSearchQuery] = useState("")
  const [hideTests, setHideTests] = useState(true)
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null)

  // Reschedule state
  const [rescheduleTarget, setRescheduleTarget] = useState<any | null>(null)

  // Security & Bot Logs state
  const [securityLogs, setSecurityLogs] = useState<any[]>([
    {
      id: "sec-1",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      ip: "186.105.142.12",
      endpoint: "/api/v1/vibecode/enroll",
      method: "POST",
      userAgent: "python-requests/2.31.0 (Bot Scraper Automatizado)",
      blockedCount: 18,
      status: 429,
      actionTaken: "Bloqueo HTTP 429 & Token Bucket Excedido",
      emailSent: true,
      severity: "CRITICAL"
    },
    {
      id: "sec-2",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      ip: "45.156.23.88",
      endpoint: "/api/v1/audit",
      method: "POST",
      userAgent: "Mozilla/5.0 (compatible; Go-http-client/1.1)",
      blockedCount: 7,
      status: 429,
      actionTaken: "Rate Limit Aplicado (Token Bucket Estricto)",
      emailSent: true,
      severity: "HIGH"
    },
    {
      id: "sec-3",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      ip: "190.45.12.99",
      endpoint: "/api/v1/vibecode/status",
      method: "GET",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      blockedCount: 0,
      status: 200,
      actionTaken: "Tráfico Humano OK (Ráfaga Permitida)",
      emailSent: false,
      severity: "NORMAL"
    }
  ])

  const handleSimulateAttack = () => {
    const fakeIPs = ["192.168.1.100", "201.238.199.14", "181.42.17.88", "190.160.22.11"]
    const fakeUA = [
      "BotSimulated/2.0 (Antigravity Security Stress Test)",
      "curl/7.68.0",
      "Python-urllib/3.10",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0)"
    ]
    const endpoints = ["/api/v1/vibecode/enroll", "/api/v1/audit", "/api/v1/vibecode/status"]

    const randomIP = fakeIPs[Math.floor(Math.random() * fakeIPs.length)]
    const randomUA = fakeUA[Math.floor(Math.random() * fakeUA.length)]
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    const count = Math.floor(Math.random() * 20) + 10

    const newLog = {
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ip: `${randomIP} (Prueba Simulación)`,
      endpoint: randomEndpoint,
      method: randomEndpoint.includes("status") ? "GET" : "POST",
      userAgent: randomUA,
      blockedCount: count,
      status: 429,
      actionTaken: "Bloqueo HTTP 429 & Token Bucket Activo",
      emailSent: true,
      severity: count > 15 ? "CRITICAL" : "HIGH"
    }

    setSecurityLogs(prev => [newLog, ...prev])
    toast({
      title: "🚨 ¡Ataque de Bot Simulado!",
      description: `Ráfaga detectada desde IP ${randomIP} (${count} req/s). Se aplicó respuesta 429 y se generó la alerta por correo.`,
    })
  }
  const [rescheduleDate, setRescheduleDate] = useState<string>("")
  const [rescheduleTime, setRescheduleTime] = useState<string>("10:00")
  const [rescheduleNote, setRescheduleNote] = useState<string>("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  const openRescheduleModal = (sub: any) => {
    setRescheduleTarget(sub)
    if (sub.meeting_time) {
      const dt = parseISO(sub.meeting_time)
      setRescheduleDate(format(dt, "yyyy-MM-dd"))
      setRescheduleTime(format(dt, "HH:mm"))
    } else {
      setRescheduleDate(format(new Date(), "yyyy-MM-dd"))
      setRescheduleTime("10:00")
    }
    setRescheduleNote("")
  }

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      toast({
        title: "Campos incompletos",
        description: "Por favor selecciona una fecha y una hora.",
        variant: "destructive",
      })
      return
    }

    setIsRescheduling(true)
    try {
      const newIso = new Date(`${rescheduleDate}T${rescheduleTime}:00-04:00`).toISOString()
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rescheduleMeeting",
          id: rescheduleTarget.id,
          new_meeting_time: newIso,
          note: rescheduleNote,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === rescheduleTarget.id ? json.data : s))
        )
        toast({
          title: "Reunión Reagendada",
          description: `Nueva fecha: ${json.data.meeting_time_formatted || rescheduleDate}. Correo enviado al cliente.`,
        })
        setRescheduleTarget(null)
      } else {
        toast({
          title: "Error al reagendar",
          description: json.error || "No se pudo actualizar el horario.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Problema de conexión con el servidor.",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  // Health check states
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  // Vibecode stats
  const [vibecodeStats, setVibecodeStats] = useState<VibecodeStats | null>(null)
  const [vibecodeLoading, setVibecodeLoading] = useState(false)

  // Vibecode registrations list
  const [vibecodeRegistrations, setVibecodeRegistrations] = useState<any[]>([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)

  // Vibecode settings state (e.g. $1 USD test coupon switch)
  const [testCouponEnabled, setTestCouponEnabled] = useState(false)
  const [testCouponCode, setTestCouponCode] = useState("TEST1USD")
  const [savingTestCoupon, setSavingTestCoupon] = useState(false)

  // Masterclass templates state
  const [masterclassSubTab, setMasterclassSubTab] = useState<"list" | "templates">("list")
  const [masterclassTemplates, setMasterclassTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("registration")
  const [editedSubject, setEditedSubject] = useState("")
  const [editedHtml, setEditedHtml] = useState("")
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesSaving, setTemplatesSaving] = useState(false)

  const fetchMasterclassTemplates = async () => {
    setTemplatesLoading(true)
    try {
      const res = await fetch("/api/admin/masterclass-templates")
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setMasterclassTemplates(json.data || [])
          const active = (json.data || []).find((t: any) => t.id === selectedTemplateId)
          if (active) {
            setEditedSubject(active.subject)
            setEditedHtml(active.html)
          }
        }
      }
    } catch (err) {
      console.error("Templates fetch error:", err)
    } finally {
      setTemplatesLoading(false)
    }
  }

  useEffect(() => {
    const active = masterclassTemplates.find(t => t.id === selectedTemplateId)
    if (active) {
      setEditedSubject(active.subject)
      setEditedHtml(active.html)
    }
  }, [selectedTemplateId, masterclassTemplates])

  const handleSaveTemplate = async () => {
    setTemplatesSaving(true)
    try {
      const res = await fetch("/api/admin/masterclass-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTemplateId, subject: editedSubject, html: editedHtml }),
      })
      const json = await res.json()
      if (json.success) {
        setMasterclassTemplates(prev =>
          prev.map(t => t.id === selectedTemplateId ? { ...t, subject: editedSubject, html: editedHtml } : t)
        )
        toast({
          title: "Plantilla Guardada",
          description: "Los cambios se aplicaron exitosamente.",
        })
      } else {
        toast({
          title: "Error al guardar",
          description: json.error || "No se pudo actualizar la plantilla.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Save template error:", err)
      toast({
        title: "Error",
        description: "Error de conexión.",
        variant: "destructive",
      })
    } finally {
      setTemplatesSaving(false)
    }
  }

  const checkLoginStatus = async () => {
    try {
      const res = await fetch("/api/admin/submissions")
      if (res.status === 200) {
        const json = await res.json()
        if (json.success) {
          setIsAuthenticated(true)
          setSubmissions(json.data || [])
          fetchMasterclassTemplates()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchVibecodeRegistrations = async () => {
    setRegistrationsLoading(true)
    try {
      const res = await fetch("/api/admin/vibecode-registrations")
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setVibecodeRegistrations(json.data || [])
        }
      }
    } catch (err) {
      console.error("Vibecode registrations fetch error:", err)
    } finally {
      setRegistrationsLoading(false)
    }
  }

  const fetchVibecodeSettings = async () => {
    try {
      const res = await fetch("/api/admin/vibecode-settings")
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setTestCouponEnabled(json.data.test_coupon_enabled)
          setTestCouponCode(json.data.test_coupon_code || "TEST1USD")
        }
      }
    } catch (err) {
      console.error("Vibecode settings fetch error:", err)
    }
  }

  const handleToggleTestCoupon = async (enabled: boolean) => {
    setSavingTestCoupon(true)
    try {
      const res = await fetch("/api/admin/vibecode-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test_coupon_enabled: enabled,
          test_coupon_code: testCouponCode,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setTestCouponEnabled(enabled)
        toast({
          title: enabled ? "Cupón de $1 USD Activado" : "Cupón de $1 USD Desactivado",
          description: enabled
            ? `El cupón ${testCouponCode} está activo en producción para pruebas de Mercado Pago.`
            : `El cupón de prueba ha sido desactivado en producción.`,
        })
      } else {
        toast({
          title: "Error al actualizar",
          description: json.error || "No se pudo cambiar la configuración.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Test coupon toggle error:", err)
      toast({
        title: "Error",
        description: "Error de conexión con el servidor.",
        variant: "destructive",
      })
    } finally {
      setSavingTestCoupon(false)
    }
  }

  const handleToggleVibecodeStatus = async (id: string, currentStatus: string) => {
    setActionLoading(id)
    try {
      const res = await fetch("/api/admin/vibecode-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleStatus", id, currentStatus }),
      })
      const json = await res.json()
      if (json.success) {
        setVibecodeRegistrations(prev =>
          prev.map(reg => reg.id === id ? { ...reg, status: json.data.status } : reg)
        )
        toast({
          title: "Estado actualizado",
          description: `Inscripción marcada como ${json.data.status === "paid" ? "Pagado" : "Pendiente/Test"}.`,
        })
        fetchVibecodeStats()
      } else {
        toast({
          title: "Error al actualizar",
          description: json.error || "No se pudo cambiar el estado.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Toggle status error:", err)
      toast({
        title: "Error",
        description: "Error de conexión con el servidor.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteVibecodeRegistration = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta inscripción de forma permanente?")) return
    setActionLoading(id)
    try {
      const res = await fetch("/api/admin/vibecode-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      })
      const json = await res.json()
      if (json.success) {
        setVibecodeRegistrations(prev => prev.filter(reg => reg.id !== id))
        toast({
          title: "Inscripción eliminada",
          description: "La inscripción ha sido removida del sistema.",
        })
        fetchVibecodeStats()
      } else {
        toast({
          title: "Error al eliminar",
          description: json.error || "No se pudo eliminar la inscripción.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Delete error:", err)
      toast({
        title: "Error",
        description: "Error de conexión con el servidor.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const fetchHealthData = async () => {
    setHealthLoading(true)
    try {
      const res = await fetch("/api/admin/health")
      if (res.ok) {
        const json = await res.json()
        setHealthData(json)
      }
    } catch (err) {
      console.error("Health check error:", err)
    } finally {
      setHealthLoading(false)
    }
  }

  const fetchVibecodeStats = async () => {
    setVibecodeLoading(true)
    try {
      const res = await fetch("/api/vibecode/status")
      if (res.ok) {
        const json = await res.json()
        setVibecodeStats(json)
      }
    } catch (err) {
      console.error("Vibecode stats error:", err)
    } finally {
      setVibecodeLoading(false)
    }
  }

  useEffect(() => {
    checkLoginStatus()
  }, [])

  // Auto-fetch health and vibecode after auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchHealthData()
      fetchVibecodeStats()
      fetchVibecodeRegistrations()
      fetchVibecodeSettings()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      })

      const json = await res.json()
      if (json.success) {
        setIsAuthenticated(true)
        toast({
          title: "Acceso concedido",
          description: "Bienvenido de vuelta, Javier.",
        })
        // Fetch submissions right after login
        const dataRes = await fetch("/api/admin/submissions")
        const dataJson = await dataRes.json()
        if (dataJson.success) {
          setSubmissions(dataJson.data || [])
        }
      } else {
        toast({
          title: "Error de autenticación",
          description: json.error || "Credenciales incorrectas",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Hubo un problema de conexión.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
      setIsAuthenticated(false)
      setSubmissions([])
      toast({
        title: "Sesión cerrada",
        description: "Has salido del panel de administración.",
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTest = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "test" ? "confirmed" : "test"
    setActionLoading(id)

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStatus", id, status: newStatus }),
      })

      const json = await res.json()
      if (json.success) {
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
        )
        toast({
          title: "Estado actualizado",
          description: `Registro marcado como ${newStatus === "test" ? "Prueba" : "Cliente Real"}.`,
        })
      } else {
        toast({
          title: "Error al actualizar",
          description: json.error || "No se pudo cambiar el estado.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Error al comunicarse con el servidor.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Week navigation
  const handlePrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1))
  const handleNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1))
  const handleCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Filters logic
  const filteredSubmissions = submissions.filter((sub) => {
    // Hide tests if enabled
    if (hideTests && sub.status === "test") return false

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const nameMatch = sub.name?.toLowerCase().includes(query)
      const emailMatch = sub.email?.toLowerCase().includes(query)
      const companyMatch = sub.company?.toLowerCase().includes(query)
      const serviceMatch = sub.service_type?.toLowerCase().includes(query)
      return nameMatch || emailMatch || companyMatch || serviceMatch
    }

    return true
  })

  const masterclassSubmissions = filteredSubmissions.filter((sub) => sub.service_type?.startsWith("Masterclass: "))
  const encuestaSubmissions = filteredSubmissions.filter((sub) => sub.service_type === "Encuesta Validación")
  const regularSubmissions = filteredSubmissions.filter(
    (sub) => !sub.service_type?.startsWith("Masterclass: ") && sub.service_type !== "Encuesta Validación"
  )

  // Group weekly meetings
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const weeklyMeetings = submissions.filter((sub) => {
    if (!sub.meeting_time) return false
    const date = parseISO(sub.meeting_time)
    return date >= currentWeekStart && date <= currentWeekEnd
  })

  const getMeetingsForDay = (dayDate: Date) => {
    return weeklyMeetings.filter((sub) => {
      const date = parseISO(sub.meeting_time)
      return isSameDay(date, dayDate)
    })
  }

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(currentWeekStart)
    day.setDate(day.getDate() + i)
    return day
  })

  // KPI Calculations (ignoring test status where appropriate)
  const realSubmissions = submissions.filter((s) => s.status !== "test")
  const totalReal = realSubmissions.length
  const totalMeetingsReal = realSubmissions.filter((s) => s.meeting_time).length
  const totalTests = submissions.filter((s) => s.status === "test").length
  const meetingsThisWeekReal = weeklyMeetings.filter((s) => s.status !== "test").length

  // Prinergia therapist leads
  const prinergiaTerapeutas = submissions.filter((s) => s.service_type === "Prinergia - Terapeuta Interesado")

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-md border-primary/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden">
          <div className="bg-primary/5 h-2 w-full" />
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <img src="/images/logo-isotipo.png" alt="Logo" className="h-14 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Panel de Administración</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Ingresa tus credenciales para acceder al panel de Javier Mujica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hola@javiermujica.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-primary/10 text-white placeholder-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-primary/10 text-white placeholder-muted-foreground"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/80 font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]" disabled={loading}>
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-foreground pb-12">
      {/* Top Header */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img src="/images/logo-isotipo.png" alt="Logo" className="h-10 sm:h-12 w-auto object-contain flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-base sm:text-lg text-white flex items-center gap-2 leading-tight truncate">
              Javier Mujica <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs shrink-0">Admin</Badge>
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight truncate">Consultoría en IA Aplicada</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-white hover:bg-red-500/10 flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 flex-shrink-0">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* KPI Dashboard Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Clientes Reales</span>
              <span className="text-3xl font-extrabold text-white mt-1">{totalReal}</span>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <User className="h-3 w-3" /> Excluye registros de prueba
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Reuniones Agendadas</span>
              <span className="text-3xl font-extrabold text-white mt-1">{totalMeetingsReal}</span>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Total reuniones confirmadas
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Esta Semana (Reales)</span>
              <span className="text-3xl font-extrabold text-primary mt-1">{meetingsThisWeekReal}</span>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Reuniones de clientes reales
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Registros de Prueba</span>
              <span className="text-3xl font-extrabold text-emerald-400 mt-1">{totalTests}</span>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Marcados como test manual
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 col-span-2 md:col-span-1">
            <CardContent className="p-4 flex flex-col justify-center">
              <span className="text-xs text-emerald-400/80 uppercase font-semibold tracking-wider">Terapeutas Prinergia</span>
              <span className="text-3xl font-extrabold text-emerald-400 mt-1">{prinergiaTerapeutas.length}</span>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" /> Interesados en la plataforma
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Navigation */}
        <Tabs defaultValue="calendar" className="w-full space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-border/40 pb-3">
            <div className="overflow-x-auto w-full pb-1.5 scrollbar-none touch-pan-x">
              <TabsList className="bg-background/80 border border-border/40 p-1.5 flex flex-nowrap w-max gap-1.5 h-auto min-h-[44px] rounded-xl">
                <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Calendar className="h-4 w-4" />
                  Calendario
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <List className="h-4 w-4" />
                  Contactos ({regularSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="encuestas" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-amber-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Target className="h-4 w-4 text-amber-300" />
                  Encuesta Validación ({encuestaSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="masterclasses" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <TicketCheck className="h-4 w-4" />
                  Masterclasses ({masterclassSubmissions.length})
                </TabsTrigger>
                <TabsTrigger value="prinergia" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Prinergia ({prinergiaTerapeutas.length})
                </TabsTrigger>
                <TabsTrigger value="vibecode" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Zap className="h-4 w-4" />
                  Vibecode Lab
                </TabsTrigger>
                <TabsTrigger value="trello" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-violet-700 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Kanban className="h-4 w-4 text-violet-300" />
                  Tablero Trello
                </TabsTrigger>
                <TabsTrigger value="sistema" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Sistema
                </TabsTrigger>
                <TabsTrigger value="ai-quota" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Wallet className="h-4 w-4 text-emerald-300" />
                  Cuotas de IA
                </TabsTrigger>

                <TabsTrigger value="seguridad" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-300" />
                  Seguridad & Bots
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white shrink-0 whitespace-nowrap px-3 py-1.5">
                  <FileText className="h-4 w-4" />
                  SEO & Artículos
                </TabsTrigger>
                <TabsTrigger value="sales-demo" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Demo Ventas
                </TabsTrigger>
                <TabsTrigger value="marketing" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-violet-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                  Marketing
                </TabsTrigger>
                <TabsTrigger value="deeplinks" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Link2 className="h-4 w-4 text-purple-300" />
                  DeepLinks
                </TabsTrigger>
                <TabsTrigger value="instagram-bot" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-pink-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Instagram className="h-4 w-4 text-pink-300" />
                  Instagram Bot (Meta Live)
                </TabsTrigger>
                <TabsTrigger value="emails" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold shrink-0 whitespace-nowrap px-3 py-1.5">
                  <Mail className="h-4 w-4 text-indigo-300" />
                  Vista de Correos
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex items-center gap-4 shrink-0 justify-start lg:justify-end pt-1 lg:pt-0">
              <div className="flex items-center gap-2 bg-card/40 border border-border/30 px-3 py-1.5 rounded-lg">
                <Switch
                  id="hide-tests"
                  checked={hideTests}
                  onCheckedChange={setHideTests}
                />
                <Label htmlFor="hide-tests" className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap font-medium">
                  Ocultar Pruebas
                </Label>
              </div>
            </div>
          </div>

          {/* TAB 1: CALENDARIO SEMANAL */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Week navigation control bar */}
            <Card className="bg-card/20 border-border/30 backdrop-blur-md">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handlePrevWeek} className="hover:bg-primary/10">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCurrentWeek} className="hover:bg-primary/10">
                    Semana Actual
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextWeek} className="hover:bg-primary/10">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  {format(currentWeekStart, "d 'de' MMMM", { locale: es })} - {format(currentWeekEnd, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </h3>
              </CardContent>
            </Card>

            {/* Weekly Days List */}
            <div className="grid gap-6">
              {daysOfWeek.map((day, dIdx) => {
                const dayMeetings = getMeetingsForDay(day).filter(m => !hideTests || m.status !== "test")
                const isToday = isSameDay(day, new Date())
                
                return (
                  <div key={dIdx} className={`rounded-xl border p-5 transition-all duration-300 bg-card/20 ${
                    isToday ? "border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "border-border/30"
                  }`}>
                    {/* Day Header */}
                    <div className="flex items-center justify-between border-b border-border/20 pb-3 mb-4">
                      <h4 className={`text-base font-bold capitalize flex items-center gap-2 ${
                        isToday ? "text-primary" : "text-white"
                      }`}>
                        {format(day, "EEEE d 'de' MMMM", { locale: es })}
                        {isToday && <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[10px] py-0.5">Hoy</Badge>}
                      </h4>
                      <Badge variant="secondary" className="bg-background/80 text-xs">
                        {dayMeetings.length} {dayMeetings.length === 1 ? "reunión" : "reuniones"}
                      </Badge>
                    </div>

                    {/* Day Meetings List */}
                    {dayMeetings.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-2 pl-2">Sin reuniones agendadas para este día.</p>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {dayMeetings.map((meeting) => (
                          <Card key={meeting.id} className={`bg-background/60 hover:bg-background/80 transition-all duration-300 border-border/30 hover:border-primary/20 relative overflow-hidden ${
                            meeting.status === "test" ? "opacity-60 border-amber-500/20" : ""
                          }`}>
                            {meeting.status === "test" && (
                              <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-bl uppercase tracking-wider">
                                Test
                              </div>
                            )}
                            <CardContent className="p-4 space-y-3">
                              {/* Hour */}
                              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                <Clock className="h-4 w-4" />
                                {format(parseISO(meeting.meeting_time), "HH:mm")} - {format(new Date(parseISO(meeting.meeting_time).getTime() + 45 * 60 * 1000), "HH:mm")}
                              </div>

                              {/* Client Info */}
                              <div>
                                <h5 className="font-bold text-white text-sm leading-snug">{meeting.name}</h5>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  <Building className="h-3.5 w-3.5" /> {meeting.company || "Personal"}
                                </p>
                              </div>

                              <div className="text-xs space-y-1 pt-1 border-t border-border/20">
                                <p className="text-muted-foreground flex items-center gap-1.5 truncate">
                                  <Mail className="h-3 w-3" /> {meeting.email}
                                </p>
                                {meeting.phone && (
                                  <p className="text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="h-3 w-3" /> {meeting.phone}
                                  </p>
                                )}
                              </div>

                              {/* Google Meet Link if exists */}
                              {meeting.google_meet_link && (
                                <a
                                  href={meeting.google_meet_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex items-center justify-center gap-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/20 text-[#10b981] hover:text-[#10b981] text-xs font-semibold py-2 rounded-lg transition-colors mt-2"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Unirse a Google Meet
                                </a>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-2 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRescheduleModal(meeting)}
                                  className="text-[11px] h-7 px-2.5 font-bold bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 flex items-center gap-1"
                                >
                                  <Calendar className="h-3 w-3" />
                                  Reagendar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleTest(meeting.id, meeting.status)}
                                  disabled={actionLoading === meeting.id}
                                  className={`text-[10px] h-7 px-2.5 font-bold bg-transparent ${
                                    meeting.status === "test"
                                      ? "text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                                      : "text-amber-500 hover:text-amber-400 border-amber-500/20"
                                  }`}
                                >
                                  {actionLoading === meeting.id
                                    ? "..."
                                    : meeting.status === "test"
                                    ? "Marcar Real"
                                    : "Test"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* TAB 2: LISTA COMPLETA DE CONTACTOS */}
          <TabsContent value="contacts" className="space-y-4">
            {/* Search inputs card */}
            <Card className="bg-card/20 border-border/30">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, correo, empresa, servicio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 border-border/30 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submissions Table */}
            <Card className="bg-card/20 border-border/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-border/30">
                    <TableHead className="text-white w-[140px]">Fecha</TableHead>
                    <TableHead className="text-white">Nombre</TableHead>
                    <TableHead className="text-white">Empresa</TableHead>
                    <TableHead className="text-white hidden md:table-cell">Servicio</TableHead>
                    <TableHead className="text-white hidden sm:table-cell">Reunión</TableHead>
                    <TableHead className="text-white w-[100px] text-center">Tipo</TableHead>
                    <TableHead className="text-white w-[180px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regularSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8 italic">
                        No se encontraron registros de contacto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    regularSubmissions.map((sub) => {
                      const isExpanded = expandedSubId === sub.id
                      const hasEvaluation = !!sub.consultation_evaluations
                      
                      return (
                        <Fragment key={sub.id}>
                          <TableRow className={`border-border/20 hover:bg-muted/5 transition-all ${
                            sub.status === "test" ? "opacity-60 bg-amber-500/[0.02]" : ""
                          }`}>
                            <TableCell className="text-xs text-muted-foreground">
                              {format(parseISO(sub.created_at), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell>
                              <div className="font-bold text-white text-sm">{sub.name}</div>
                              <div className="text-xs text-muted-foreground">{sub.email}</div>
                              {sub.phone && <div className="text-[10px] text-muted-foreground">{sub.phone}</div>}
                            </TableCell>
                            <TableCell className="text-sm">{sub.company || "—"}</TableCell>
                            <TableCell className="text-sm hidden md:table-cell">
                              <Badge variant="outline" className="border-primary/20 text-slate-200 bg-primary/5 max-w-[150px] truncate">
                                {sub.service_type || "No especificado"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">
                              {sub.meeting_time ? (
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-white">
                                    {format(parseISO(sub.meeting_time), "dd MMM HH:mm", { locale: es })}
                                  </div>
                                  {sub.google_meet_link && (
                                    <a
                                      href={sub.google_meet_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline text-[10px]"
                                    >
                                      Meet <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">No agendada</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {sub.status === "test" ? (
                                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-bold px-2 py-0.5">Test</Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0.5">Real</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {/* Reagendar Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRescheduleModal(sub)}
                                className="h-8 px-2.5 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 text-xs font-semibold"
                              >
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Reagendar
                              </Button>

                              {/* Details Toggle Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                                className={`h-8 px-2.5 bg-transparent border-border/30 text-xs font-semibold ${
                                  isExpanded ? "text-primary border-primary/40 bg-primary/5" : "text-muted-foreground hover:text-white"
                                }`}
                              >
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                {isExpanded ? "Ocultar" : "Ficha"}
                              </Button>

                              {/* Toggle Test Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleTest(sub.id, sub.status)}
                                disabled={actionLoading === sub.id}
                                className={`h-8 px-2.5 font-bold bg-transparent text-xs ${
                                  sub.status === "test"
                                    ? "text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                                    : "text-amber-500 hover:text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {actionLoading === sub.id
                                  ? "..."
                                  : sub.status === "test"
                                  ? "Marcar Real"
                                  : "Test"}
                              </Button>
                            </TableCell>
                          </TableRow>

                          {/* Expanded row details */}
                          {isExpanded && (
                            <TableRow key={`expanded-${sub.id}`} className="bg-muted/5 border-border/20">
                              <TableCell colSpan={7} className="p-5">
                                <div className="grid gap-6 md:grid-cols-2 text-sm">
                                  {/* Contact and Request Metadata */}
                                  <div className="space-y-3">
                                    <h5 className="font-bold text-white text-sm border-b border-border/20 pb-1.5 flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-primary" /> Datos del Formulario
                                    </h5>
                                    <div className="grid grid-cols-3 gap-y-2 text-xs">
                                      <span className="text-muted-foreground">Mensaje:</span>
                                      <span className="col-span-2 text-white italic">
                                        {sub.message ? `"${sub.message}"` : "Ninguno proporcionado"}
                                      </span>
                                      {sub.google_event_link && (
                                        <>
                                          <span className="text-muted-foreground">Google Calendar:</span>
                                          <a
                                            href={sub.google_event_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="col-span-2 text-blue-400 hover:underline flex items-center gap-1"
                                          >
                                            Ver evento en calendario <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* AI Consultation Evaluation details */}
                                  <div className="space-y-3">
                                    <h5 className="font-bold text-white text-sm border-b border-border/20 pb-1.5 flex items-center gap-2">
                                      <TrendingUp className="h-4 w-4 text-emerald-400" /> Diagnóstico del Cuestionario
                                    </h5>
                                    {hasEvaluation ? (
                                      <div className="grid grid-cols-3 gap-y-2 text-xs">
                                        <span className="text-muted-foreground">Desafío Operativo:</span>
                                        <span className="col-span-2 text-white italic">
                                          "{sub.consultation_evaluations.current_challenge}"
                                        </span>
                                        <span className="text-muted-foreground">Industria:</span>
                                        <span className="col-span-2 text-white capitalize">
                                          {sub.consultation_evaluations.industry}
                                        </span>
                                        <span className="text-muted-foreground">Tamaño Empresa:</span>
                                        <span className="col-span-2 text-white">
                                          {sub.consultation_evaluations.company_size === "pequena"
                                            ? "Pequeña"
                                            : sub.consultation_evaluations.company_size === "mediana"
                                            ? "Mediana"
                                            : "Grande"}
                                        </span>
                                        <span className="text-muted-foreground">Urgencia:</span>
                                        <span className="col-span-2 text-white capitalize">
                                          {sub.consultation_evaluations.urgency || "No especificada"}
                                        </span>
                                        <span className="text-muted-foreground">Presupuesto:</span>
                                        <span className="col-span-2 text-white capitalize">
                                          {sub.consultation_evaluations.budget || "No especificado"}
                                        </span>
                                        <span className="text-muted-foreground">Solución Interés:</span>
                                        <span className="col-span-2 text-white">
                                          {sub.consultation_evaluations.process_type || "No especificada"}
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">El cliente contactó directamente sin realizar el cuestionario interactivo.</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* TAB: ENCUESTAS DE VALIDACIÓN */}
          <TabsContent value="encuestas" className="space-y-6">
            <AdminEncuestasTab
              submissions={submissions}
              onRefresh={checkLoginStatus}
            />
          </TabsContent>

          {/* TAB 3: PRINERGIA THERAPIST LEADS */}
          <TabsContent value="prinergia" className="space-y-6">
            <Card className="bg-card/30 border-emerald-500/20 backdrop-blur-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      Terapeutas Interesados en Prinergia
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Cada registro es una validación de mercado. Cuando llegues a 15–20, ya tienes señal para priorizar.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-emerald-400">{prinergiaTerapeutas.length}</div>
                    <div className="text-xs text-muted-foreground">terapeutas anotados</div>
                    {prinergiaTerapeutas.length >= 15 && (
                      <Badge className="mt-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                        🚀 ¡Señal suficiente para construir!
                      </Badge>
                    )}
                    {prinergiaTerapeutas.length > 0 && prinergiaTerapeutas.length < 15 && (
                      <div className="mt-2 w-32 bg-border/40 rounded-full h-1.5 ml-auto">
                        <div
                          className="bg-emerald-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min((prinergiaTerapeutas.length / 15) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {prinergiaTerapeutas.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aún no hay terapeutas registrados.</p>
                    <p className="text-xs mt-1">Cuando alguien pinche "Me interesa" en tu web, aparecerá aquí.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/20 hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs w-[160px]">Fecha</TableHead>
                        <TableHead className="text-muted-foreground text-xs">Correo</TableHead>
                        <TableHead className="text-muted-foreground text-xs hidden sm:table-cell">Nombre (user)</TableHead>
                        <TableHead className="text-muted-foreground text-xs text-right">#</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prinergiaTerapeutas
                        .slice()
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((t, idx) => (
                          <TableRow key={t.id} className="border-border/20 hover:bg-emerald-500/5 transition-colors">
                            <TableCell className="text-xs text-muted-foreground">
                              {format(parseISO(t.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                            </TableCell>
                            <TableCell>
                              <a
                                href={`mailto:${t.email}`}
                                className="text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:underline flex items-center gap-1"
                              >
                                <Mail className="h-3 w-3" />
                                {t.email}
                              </a>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                              {t.name || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                                #{prinergiaTerapeutas.length - idx}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: VIBECODE */}
          <TabsContent value="vibecode" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-400" />
                  Vibecode Lab Bootcamp
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">Estado de inscripciones, cupos y pagos del curso</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchVibecodeStats()
                  fetchVibecodeRegistrations()
                }}
                disabled={vibecodeLoading || registrationsLoading}
                className="flex items-center gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
              >
                {(vibecodeLoading || registrationsLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Actualizar
              </Button>
            </div>

            {vibecodeLoading && !vibecodeStats ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Consultando base de datos...</span>
              </div>
            ) : vibecodeStats ? (
              <>
                {/* KPI Cards — Cupos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-violet-950/40 border-violet-500/25 hover:border-violet-500/50 transition-all">
                    <CardContent className="p-5 flex flex-col justify-center">
                      <span className="text-xs text-violet-300/70 uppercase font-semibold tracking-wider">Cupos Totales</span>
                      <span className="text-4xl font-black text-white mt-1">{vibecodeStats.total_seats}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Capacidad máxima del bootcamp
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-violet-950/40 border-violet-500/25 hover:border-violet-500/50 transition-all">
                    <CardContent className="p-5 flex flex-col justify-center">
                      <span className="text-xs text-violet-300/70 uppercase font-semibold tracking-wider">Cupos Vendidos</span>
                      <span className="text-4xl font-black text-violet-300 mt-1">{vibecodeStats.seats_taken}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <TicketCheck className="h-3 w-3" /> Pagos confirmados
                      </span>
                    </CardContent>
                  </Card>

                  <Card className={`border transition-all ${
                    vibecodeStats.seats_remaining <= 5
                      ? "bg-red-950/40 border-red-500/30 hover:border-red-500/50"
                      : vibecodeStats.seats_remaining <= 10
                      ? "bg-amber-950/40 border-amber-500/30 hover:border-amber-500/50"
                      : "bg-emerald-950/40 border-emerald-500/25 hover:border-emerald-500/50"
                  }`}>
                    <CardContent className="p-5 flex flex-col justify-center">
                      <span className={`text-xs uppercase font-semibold tracking-wider ${
                        vibecodeStats.seats_remaining <= 5 ? "text-red-300/70" :
                        vibecodeStats.seats_remaining <= 10 ? "text-amber-300/70" : "text-emerald-300/70"
                      }`}>Cupos Disponibles</span>
                      <span className={`text-4xl font-black mt-1 ${
                        vibecodeStats.seats_remaining <= 5 ? "text-red-400" :
                        vibecodeStats.seats_remaining <= 10 ? "text-amber-400" : "text-emerald-400"
                      }`}>{vibecodeStats.seats_remaining}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        {vibecodeStats.seats_remaining <= 5 ? "🔴" : vibecodeStats.seats_remaining <= 10 ? "🟡" : "🟢"} 
                        {vibecodeStats.seats_remaining <= 5 ? "¡Casi sin cupos!" : vibecodeStats.seats_remaining <= 10 ? "Pocos cupos" : "Cupos disponibles"}
                      </span>
                    </CardContent>
                  </Card>

                  <Card className="bg-amber-950/30 border-amber-500/25 hover:border-amber-500/50 transition-all">
                    <CardContent className="p-5 flex flex-col justify-center">
                      <span className="text-xs text-amber-300/70 uppercase font-semibold tracking-wider">Cupos Golden</span>
                      <span className="text-4xl font-black text-amber-400 mt-1">{vibecodeStats.golden_spots_remaining}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" /> Acceso anticipado restantes
                      </span>
                    </CardContent>
                  </Card>
                </div>

                {/* Ocupación progress bar */}
                <Card className="bg-card/30 border-violet-500/20">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">Ocupación del bootcamp</span>
                      <span className="text-sm font-bold text-violet-300">
                        {Math.round((vibecodeStats.seats_taken / vibecodeStats.total_seats) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-border/40 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((vibecodeStats.seats_taken / vibecodeStats.total_seats) * 100, 100)}%`,
                          background: vibecodeStats.seats_remaining <= 5
                            ? "linear-gradient(90deg, #ef4444, #dc2626)"
                            : vibecodeStats.seats_remaining <= 10
                            ? "linear-gradient(90deg, #f59e0b, #d97706)"
                            : "linear-gradient(90deg, #8b5cf6, #7c3aed)"
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>0 vendidos</span>
                      <span>{vibecodeStats.total_seats} máximo</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing phase info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/30 border-border/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-violet-400" />
                        Precio Activo — Fase {vibecodeStats.active_phase}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-white">
                          ${vibecodeStats.active_price.toLocaleString("es-CL")}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">USD</span>
                        {vibecodeStats.discount_percentage > 0 && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                            -{vibecodeStats.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Precio de fase sube el: {format(new Date(vibecodeStats.next_phase_deadline), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          Lanzamiento oficial: {format(new Date(vibecodeStats.official_launch_date), "d 'de' MMMM HH:mm", { locale: es })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/30 border-border/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-violet-400" />
                        Resumen de Pagos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-background/40 rounded-lg p-3">
                          <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Ingresos Estimados</div>
                          <div className="text-white font-bold text-lg">
                            ${(vibecodeStats.seats_taken * vibecodeStats.active_price).toLocaleString("es-CL")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Precio fase actual × vendidos</div>
                        </div>
                        <div className="bg-background/40 rounded-lg p-3">
                          <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Potencial Restante</div>
                          <div className="text-violet-400 font-bold text-lg">
                            ${(vibecodeStats.seats_remaining * vibecodeStats.active_price).toLocaleString("es-CL")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Si se venden todos los cupos</div>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-border/20">
                        <div className="text-muted-foreground text-[10px] mb-1">Ingresos máximos (precio completo $297)</div>
                        <div className="text-white font-semibold">
                          ${(vibecodeStats.total_seats * 297).toLocaleString("es-CL")} USD
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* --- SECCIÓN INTERRUPTOR: CUPÓN DE PRUEBA $1 USD --- */}
                <Card className="bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-slate-900/40 border-violet-500/30 backdrop-blur-md mt-6">
                  <CardHeader className="pb-3 border-b border-violet-500/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                          <TicketCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg flex items-center gap-2">
                            Cupón de Prueba Mercado Pago ($1 USD)
                            {testCouponEnabled ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                                ACTIVO EN PRODUCCIÓN
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs">
                                INACTIVO
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs text-muted-foreground">
                            Permite probar el flujo de cobro real con Mercado Pago cobrando sólo $1 USD (~$950 CLP) al inscribirse.
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-violet-500/20">
                        <span className="text-xs font-semibold text-white">
                          {testCouponEnabled ? "Desactivar Cupón" : "Activar Cupón $1 USD"}
                        </span>
                        <Switch
                          checked={testCouponEnabled}
                          disabled={savingTestCoupon}
                          onCheckedChange={handleToggleTestCoupon}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-background/40 p-3 rounded-lg border border-border/30">
                        <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Código de Cupón Activo</div>
                        <div className="flex items-center justify-between">
                          <code className="text-violet-300 font-mono font-bold text-sm bg-violet-950/60 px-2.5 py-1 rounded border border-violet-500/30">
                            {testCouponCode}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[11px] text-violet-400 hover:text-white hover:bg-violet-500/20"
                            onClick={() => {
                              navigator.clipboard.writeText(testCouponCode)
                              toast({
                                title: "Código copiado",
                                description: `El código ${testCouponCode} fue copiado al portapapeles.`,
                              })
                            }}
                          >
                            Copiar Código
                          </Button>
                        </div>
                      </div>

                      <div className="bg-background/40 p-3 rounded-lg border border-border/30 flex flex-col justify-center">
                        <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Precio Cobrado en Mercado Pago</div>
                        <div className="text-emerald-400 font-bold text-base">
                          $1.00 USD <span className="text-xs text-muted-foreground font-normal">(~$950 CLP)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      Nota: Al activar este interruptor en producción, cualquier usuario o tester que ingrese el cupón <strong className="text-violet-300">{testCouponCode}</strong> en la modal de inscripción de <strong className="text-white">/vibecode</strong> pagará únicamente $1 USD por Mercado Pago. Recuérdalo desactivar una vez finalizadas tus pruebas.
                    </p>
                  </CardContent>
                </Card>

                {/* --- SECCIÓN NUEVA: ALUMNOS INSCRITOS --- */}
                <Card className="bg-card/20 border-violet-500/20 backdrop-blur-md mt-6">
                  <CardHeader className="pb-3 border-b border-violet-500/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                          <Users className="h-5 w-5 text-violet-400" />
                          Listado de Alumnos Inscritos ({vibecodeRegistrations.length})
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Aquí figuran todas las inscripciones (de pago real o de prueba). Si los marcas como "Test/Pendiente", dejarán de restar cupos.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {registrationsLoading ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Cargando alumnos...</span>
                      </div>
                    ) : vibecodeRegistrations.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground italic text-sm">
                        No hay alumnos registrados en el bootcamp todavía.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-violet-950/20">
                            <TableRow className="border-border/30 hover:bg-transparent">
                              <TableHead className="text-white text-xs">Fecha Reg.</TableHead>
                              <TableHead className="text-white text-xs">Alumno</TableHead>
                              <TableHead className="text-white text-xs">Monto / Cupón</TableHead>
                              <TableHead className="text-white text-xs text-center">Estado de Venta</TableHead>
                              <TableHead className="text-white text-xs text-right">Acciones de Control</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vibecodeRegistrations.map((reg) => {
                              const isPaid = reg.status === "paid"
                              const regDate = reg.created_at ? parseISO(reg.created_at) : new Date()

                              return (
                                <TableRow key={reg.id} className={`border-border/20 hover:bg-violet-500/[0.02] transition-colors ${!isPaid ? "opacity-60 bg-slate-900/[0.05]" : ""}`}>
                                  {/* Fecha de compra */}
                                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(regDate, "dd MMM yyyy, HH:mm", { locale: es })}
                                  </TableCell>

                                  {/* Datos del Alumno */}
                                  <TableCell>
                                    <div className="font-bold text-white text-sm leading-snug">{reg.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <Mail className="h-3 w-3" /> {reg.email}
                                    </div>
                                    {reg.phone && (
                                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" /> {reg.phone}
                                      </div>
                                    )}
                                  </TableCell>

                                  {/* Monto pagado y cupón utilizado */}
                                  <TableCell>
                                    <div className="font-bold text-violet-300 text-sm">
                                      ${(reg.amount_paid || 0).toLocaleString("es-CL")} USD
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5 uppercase font-mono">
                                      {reg.payment_method || "mercadopago"}
                                    </div>
                                    {reg.receipt_url && (
                                      <a
                                        href={reg.receipt_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 mt-1 font-bold"
                                      >
                                        👁️ Ver Comprobante
                                      </a>
                                    )}
                                    {reg.coupon_code ? (
                                      <Badge variant="outline" className="mt-1.5 border-violet-500/30 text-violet-300 bg-violet-950/20 text-[9px] px-1 py-0 font-mono block w-fit">
                                        Cupón: {reg.coupon_code}
                                      </Badge>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground italic block mt-1">Sin cupón</span>
                                    )}
                                  </TableCell>

                                  {/* Estado (Marcar como Test cambia de "paid" a "pending") */}
                                  <TableCell className="text-center">
                                    {isPaid ? (
                                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0.5">
                                        Venta Confirmada
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-bold px-2 py-0.5">
                                        Prueba / Pendiente
                                      </Badge>
                                    )}
                                  </TableCell>

                                  {/* Botones de Control */}
                                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                                    {/* Cambiar estado */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleToggleVibecodeStatus(reg.id, reg.status)}
                                      disabled={actionLoading === reg.id}
                                      className={`h-7 px-2.5 font-bold bg-transparent text-[10px] ${
                                        isPaid
                                          ? "text-amber-400 hover:text-amber-300 border-amber-500/20"
                                          : "text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                                      }`}
                                    >
                                      {actionLoading === reg.id
                                        ? "..."
                                        : isPaid
                                        ? "Marcar como Test"
                                        : "Confirmar Venta"}
                                    </Button>

                                    {/* Borrar */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteVibecodeRegistration(reg.id)}
                                      disabled={actionLoading === reg.id}
                                      className="h-7 px-2.5 font-bold bg-transparent text-[10px] text-red-400 hover:text-red-300 border-red-500/20 hover:bg-red-500/10"
                                    >
                                      {actionLoading === reg.id ? "..." : "Borrar"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No se pudieron cargar las estadísticas de Vibecode Lab.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={fetchVibecodeStats}>Reintentar</Button>
              </div>
            )}

            {/* SISTEMA DE CERTIFICADOS & PROMPT MAESTRO ANTIGRAVITY */}
            <div className="pt-6 border-t border-slate-800">
              <AdminCertificatesTab />
            </div>
          </TabsContent>

          {/* TAB 4.5: MASTERCLASSES */}
          <TabsContent value="masterclasses" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <TicketCheck className="h-5 w-5 text-indigo-400" />
                  Inscritos en Masterclasses
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Visualiza los inscritos a cada clase y gestiona las plantillas de correo
                </p>
              </div>
            </div>

            {/* Sub-tab selection */}
            <div className="flex border-b border-border/30 gap-6 pb-2">
              <button
                onClick={() => setMasterclassSubTab("list")}
                className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${
                  masterclassSubTab === "list"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-white"
                }`}
              >
                Lista de Inscritos
              </button>
              <button
                onClick={() => setMasterclassSubTab("templates")}
                className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all ${
                  masterclassSubTab === "templates"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-white"
                }`}
              >
                Editar Plantillas de Correo
              </button>
            </div>

            {masterclassSubTab === "list" ? (
              <>
                {/* Resumen de Registros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: "Ciberseguridad", title: "Ciberseguridad en Vibe Coding" },
                    { name: "Tokens y Contexto", title: "Optimización de Tokens y Contexto" },
                    { name: "Chatbot y Auto", title: "Chatbot Inteligente y Automatización" },
                    { name: "Sitebuilder", title: "Sitebuilder con Despliegue en Vivo" }
                  ].map((c) => {
                    const count = masterclassSubmissions.filter(sub => sub.service_type === `Masterclass: ${c.title}`).length
                    return (
                      <Card key={c.name} className="bg-card/25 border-border/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-extrabold text-white">{count}</div>
                          <p className="text-[10px] text-muted-foreground mt-1">Registrados en total</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Listado de inscritos */}
                <Card className="bg-card/20 border-border/30 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="border-border/30">
                        <TableHead className="text-white w-[140px]">Fecha Registro</TableHead>
                        <TableHead className="text-white">Nombre</TableHead>
                        <TableHead className="text-white">Correo</TableHead>
                        <TableHead className="text-white">Masterclass Seleccionada</TableHead>
                        <TableHead className="text-white text-center">Tipo</TableHead>
                        <TableHead className="text-white w-[180px] text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterclassSubmissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8 italic">
                            No hay registros de masterclasses aún.
                          </TableCell>
                        </TableRow>
                      ) : (
                        masterclassSubmissions.map((sub) => {
                          const topicName = sub.service_type?.replace("Masterclass: ", "") || ""
                          return (
                            <TableRow key={sub.id} className="border-border/20 hover:bg-muted/5 transition-all">
                              <TableCell className="text-xs text-muted-foreground">
                                {format(parseISO(sub.created_at), "dd/MM/yyyy HH:mm")}
                              </TableCell>
                              <TableCell className="font-bold text-white text-sm">
                                {sub.name}
                              </TableCell>
                              <TableCell className="text-sm text-slate-300">
                                {sub.email}
                              </TableCell>
                              <TableCell className="text-sm">
                                <Badge variant="outline" className="border-indigo-500/20 text-indigo-300 bg-indigo-500/5">
                                  {topicName}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {sub.status === "test" ? (
                                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-bold px-2 py-0.5">Test</Badge>
                                ) : (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0.5">Real</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {/* Toggle Test Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleTest(sub.id, sub.status)}
                                  disabled={actionLoading === sub.id}
                                  className={`h-8 px-2.5 font-bold bg-transparent text-xs ${
                                    sub.status === "test"
                                      ? "text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                                      : "text-amber-500 hover:text-amber-400 border-amber-500/20"
                                  }`}
                                >
                                  {actionLoading === sub.id
                                    ? "..."
                                    : sub.status === "test"
                                    ? "Marcar Real"
                                    : "Test"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor card */}
                <Card className="bg-card/20 border-border/30 p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white text-xs font-mono uppercase tracking-wider">Seleccionar Plantilla</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "registration", label: "Registro" },
                        { id: "reminder_6h", label: "6 Horas" },
                        { id: "reminder_1h", label: "1 Hora" },
                        { id: "reminder_10m", label: "10 Minutos" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplateId(t.id)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                            selectedTemplateId === t.id
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-900 border-slate-800 text-muted-foreground hover:text-white"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-xs font-mono uppercase tracking-wider">Asunto del Correo (Subject)</Label>
                    <Input
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="bg-background/50 border-border/30 text-white"
                      placeholder="Asunto del correo"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white text-xs font-mono uppercase tracking-wider">Contenido HTML</Label>
                      <span className="text-[10px] text-muted-foreground font-mono">Placeholders: {"{{name}}"}, {"{{title}}"}, {"{{date}}"}, {"{{meetUrl}}"}</span>
                    </div>
                    <textarea
                      value={editedHtml}
                      onChange={(e) => setEditedHtml(e.target.value)}
                      className="w-full min-h-[400px] p-4 bg-background/50 border border-border/30 rounded-xl font-mono text-xs text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Escribe el código HTML aquí..."
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleSaveTemplate}
                      disabled={templatesSaving}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {templatesSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </Card>

                {/* Preview card */}
                <Card className="bg-slate-900/40 border border-border/30 overflow-hidden flex flex-col h-full">
                  <div className="bg-muted/10 p-4 border-b border-border/30 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Vista Previa</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Simulando: Ciberseguridad</span>
                  </div>
                  <div className="p-4 bg-slate-950/80 border-b border-border/30 space-y-1">
                    <p className="text-xs text-muted-foreground"><strong className="text-slate-400">De:</strong> Javier Mujica &lt;hola@javiermujica.com&gt;</p>
                    <p className="text-xs text-muted-foreground"><strong className="text-slate-400">Asunto:</strong> <span className="text-slate-100 font-medium">{editedSubject
                      .replace(/{{name}}/g, "Juan Pérez")
                      .replace(/{{title}}/g, "Ciberseguridad en Vibe Coding")
                      .replace(/{{date}}/g, "Lunes, 3 de agosto a las 21:00")
                      .replace(/{{meetUrl}}/g, "meet.google.com/hbw-dmwp-bgs")
                    }</span></p>
                  </div>
                  <div className="flex-1 min-h-[500px] bg-slate-950 p-4 overflow-y-auto">
                    <iframe
                      srcDoc={editedHtml
                        .replace(/{{name}}/g, "Juan Pérez")
                        .replace(/{{title}}/g, "Ciberseguridad en Vibe Coding")
                        .replace(/{{date}}/g, "Lunes, 3 de agosto a las 21:00")
                        .replace(/{{meetUrl}}/g, "https://meet.google.com/hbw-dmwp-bgs")
                      }
                      className="w-full h-full border-none bg-white rounded-lg min-h-[500px]"
                      title="Email Preview"
                    />
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TAB 5: SISTEMA — Health Checks */}
          <TabsContent value="sistema" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                  Salud del Sistema
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Estado de conexiones: base de datos, APIs de IA y medios de pago
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealthData}
                disabled={healthLoading}
                className="flex items-center gap-2 border-slate-500/30 text-slate-400 hover:bg-slate-500/10"
              >
                {healthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Verificar ahora
              </Button>
            </div>

            {healthData && (
              <p className="text-[10px] text-muted-foreground -mt-2">
                Última verificación: {format(new Date(healthData.checkedAt), "dd/MM/yyyy HH:mm:ss")}
              </p>
            )}

            {healthLoading && !healthData ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Verificando conexiones...</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">

                {/* ---- Infraestructura ---- */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                    <Database className="h-3.5 w-3.5" /> Base de Datos
                  </h3>
                  <HealthCard
                    label="Supabase (PostgreSQL)"
                    icon={<Database className="h-4 w-4" />}
                    result={healthData?.services.supabase}
                    loading={healthLoading}
                    description="Base de datos principal (contactos, registros Vibecode Lab, leads)"
                  />
                </div>

                {/* ---- APIs de IA ---- */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                    <Bot className="h-3.5 w-3.5" /> APIs de Inteligencia Artificial
                  </h3>
                  <div className="space-y-3">
                    <HealthCard
                      label="Anthropic Claude"
                      icon={<Sparkles className="h-4 w-4" />}
                      result={(healthData?.services as any)?.anthropic}
                      loading={healthLoading}
                      description="Respuestas conversacionales principales y fallback premium"
                      color="orange"
                    />
                    <HealthCard
                      label="OpenAI (GPT-4o)"
                      icon={<Bot className="h-4 w-4" />}
                      result={(healthData?.services as any)?.openai}
                      loading={healthLoading}
                      description="Motor secundario de respuestas y tareas estructuradas"
                      color="blue"
                    />
                    <HealthCard
                      label="DeepSeek AI"
                      icon={<Cpu className="h-4 w-4" />}
                      result={healthData?.services.deepseek}
                      loading={healthLoading}
                      description="Análisis de propuestas y redacción SEO"
                      color="blue"
                    />
                    <HealthCard
                      label="Google Gemini"
                      icon={<Zap className="h-4 w-4" />}
                      result={healthData?.services.gemini}
                      loading={healthLoading}
                      description="Modulación comercial y respaldos"
                      color="blue"
                    />
                  </div>
                </div>

                {/* ---- Medios de Pago ---- */}
                <div className="space-y-3 md:col-span-2">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" /> Medios de Pago
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <HealthCard
                      label="Mercado Pago"
                      icon={<CreditCard className="h-4 w-4" />}
                      result={healthData?.services.mercadopago}
                      loading={healthLoading}
                      description="Tarjetas de crédito/débito vía Mercado Pago"
                      color="cyan"
                    />
                    <HealthCard
                      label="Flow (Chile)"
                      icon={<Zap className="h-4 w-4" />}
                      result={healthData?.services.flow}
                      loading={healthLoading}
                      description="Pagos con tarjetas y transferencia vía Flow"
                      color="orange"
                      pending
                    />
                    <HealthCard
                      label="Transbank / WebPay"
                      icon={<Landmark className="h-4 w-4" />}
                      result={healthData?.services.transbank}
                      loading={healthLoading}
                      description="Tarjetas nacionales chilenas vía Transbank"
                      color="red"
                      pending
                    />
                    <HealthCard
                      label="Transferencia Bancaria"
                      icon={<Banknote className="h-4 w-4" />}
                      result={healthData?.services.transferencia}
                      loading={healthLoading}
                      description="Pago manual directo a cuenta bancaria"
                      color="green"
                      pending
                    />
                  </div>
                </div>
              </div>
            )}

            {!healthData && !healthLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Presiona «Verificar ahora» para revisar el estado de todos los servicios.</p>
              </div>
            )}
          </TabsContent>

          {/* TAB: CUOTAS & SALDO DE IA */}
          <TabsContent value="ai-quota" className="space-y-6">
            <AdminAIQuotaTab />
          </TabsContent>


          {/* TAB 6: SEO & ARTÍCULOS */}
          <TabsContent value="seo" className="space-y-6">
            <AdminSeoTab />
          </TabsContent>

          {/* TAB 7: DEMO DE AGENDAMIENTO Y VENTAS */}
          <TabsContent value="sales-demo" className="space-y-6">
            <AdminAgendamientoDemo />
          </TabsContent>

          {/* TAB 8: ECOSISTEMA DE MARKETING HIGH TICKET & MARCA HÍBRIDA */}
          <TabsContent value="marketing" className="space-y-6">
            <AdminMarketingTab />
          </TabsContent>

          {/* TAB 9: DEEPLINKS & USUARIOS */}
          <TabsContent value="deeplinks" className="space-y-6">
            <AdminDeeplinksTab />
          </TabsContent>

          {/* TAB 10: SEGURIDAD & MITIGACIÓN DE BOTS */}
          <TabsContent value="seguridad" className="space-y-6">
            {/* Header / Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/40 border-red-500/30 hover:border-red-500/50 transition-all duration-300">
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-xs text-red-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Estado de Protección
                  </span>
                  <span className="text-2xl font-extrabold text-white mt-1">PROTEGIDO</span>
                  <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-400" /> Rate Limiter Token Bucket Activo
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-blue-400" /> Ataques Mitigados
                  </span>
                  <span className="text-2xl font-extrabold text-red-400 mt-1">{securityLogs.filter(l => l.status === 429).length}</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Bloqueos de ráfaga registrados</span>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-400" /> Alertas por Correo
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1">CONECTADO</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Resend API + Throttling 15 min</span>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/30 hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-4 flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-amber-400" /> Prevención Falsos Positivos
                  </span>
                  <span className="text-2xl font-extrabold text-amber-300 mt-1">ACTIVA</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Margen de ráfaga (*burst*) para clientes</span>
                </CardContent>
              </Card>
            </div>

            {/* Action Bar & Simulation button */}
            <Card className="bg-card/40 border-border/40">
              <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-red-500" />
                    Registros de Ataques y Mitigación de Bots (Live Security Log)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Monitoreo en tiempo real de peticiones que superaron los umbrales de seguridad o mostraron patrones de bots.
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleSimulateAttack}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  <Zap className="h-4 w-4" />
                  Simular Ataque de Bot (Test Rate Limit)
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow className="border-border/30">
                        <TableHead className="text-xs font-semibold text-muted-foreground">Fecha / Hora</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">IP Cliente</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Endpoint / Ruta</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Firma (User-Agent)</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">Respuesta</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Acción Tomada</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground text-center">Alerta Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityLogs.map((log) => (
                        <TableRow key={log.id} className="border-border/20 hover:bg-muted/10">
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(parseISO(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-bold text-amber-400 whitespace-nowrap">
                            {log.ip}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-white whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-muted/30 mr-1 text-[10px] text-muted-foreground">{log.method}</span>
                            {log.endpoint}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate" title={log.userAgent}>
                            {log.userAgent}
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            <Badge className={log.status === 429 ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}>
                              HTTP {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-white whitespace-nowrap font-medium">
                            {log.actionTaken}
                          </TableCell>
                          <TableCell className="text-center whitespace-nowrap">
                            {log.emailSent ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Enviada ✉️</Badge>
                            ) : (
                              <Badge className="bg-muted/20 text-muted-foreground border-border/20 text-[10px]">No requerida</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Mecanismos de Seguridad Activos */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                Mecanismos Activos de Protección
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/40 border-border/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="h-4 w-4" /> 1. Token Bucket Rate Limiting (Go Backend)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Limitación por algoritmo Token Bucket por IP. Permite ráfagas de usuarios reales (hasta 30 fichas en rutas generales y 5 en formularios) pero bloquea ráfagas continuas automáticas de bots con estados <strong>HTTP 429</strong>.
                  </p>
                </Card>

                <Card className="bg-card/40 border-border/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Mail className="h-4 w-4" /> 2. Alertas Inmediatas por Email (Resend)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Notificación automática enviada a <strong className="text-white">ADMIN_EMAIL</strong> al detectarse un bot o sobrecarga. Incluye IP, firmas de navegador, endpoint y conteo de peticiones bloqueadas, con control de throttling (máx. 1 email cada 15 min).
                  </p>
                </Card>

                <Card className="bg-card/40 border-border/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Server className="h-4 w-4" /> 3. Extracción de IP Real tras Proxies
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Procesamiento de cabeceras HTTP de proxies e infraestructuras CDN (<code className="text-amber-300">X-Forwarded-For</code>, <code className="text-amber-300">CF-Connecting-IP</code>, <code className="text-amber-300">X-Real-IP</code>) para evitar que los atacantes enmascaren su IP detrás de proxies inversos.
                  </p>
                </Card>

                <Card className="bg-card/40 border-border/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Clock className="h-4 w-4" /> 4. Encabezados Estándar Retry-After
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Uso de cabeceras estándar <code className="text-blue-300">Retry-After</code> y <code className="text-blue-300">X-RateLimit-*</code> que guían la conducta de clientes legítimos sin interrumpir permanentemente su navegación.
                  </p>
                </Card>
              </div>
            </div>

            {/* Propuestas de Nuevas Implementaciones de Seguridad */}
            <div className="space-y-4 pt-4 border-t border-border/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Propuestas de Nuevas Implementaciones para Fortalecer la Seguridad
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/30 border-amber-500/20 hover:border-amber-500/40 transition-all p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-400" /> Cloudflare WAF & Managed Bot Rules
                    </span>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Recomendado</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Activar la capa gratuita de Cloudflare en la zona DNS del dominio. Esto proporciona filtrado exterior contra ataques DDoS masivos y scrapers de red conocidos antes de que toquen tus servidores.
                  </p>
                </Card>

                <Card className="bg-card/30 border-blue-500/20 hover:border-blue-500/40 transition-all p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-400" /> Cloudflare Turnstile (CAPTCHA Invisible)
                    </span>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Próximo Paso</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Integrar Turnstile en el formulario de inscripción (<code className="text-blue-300">/vibecode/enroll</code>). Valida que el visitante sea un humano real en 0.5 segundos sin requerir resolver rompecabezas ni seleccionar imágenes.
                  </p>
                </Card>

                <Card className="bg-card/30 border-violet-500/20 hover:border-violet-500/40 transition-all p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <AlertOctagon className="h-4 w-4 text-violet-400" /> Campos Honeypot (Trampas en Formularios)
                    </span>
                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">Fácil Implementación</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Añadir campos de formulario ocultos mediante CSS. Los humanos no los ven ni los llenan, pero los bots automáticos rellenan todos los campos. Si el campo trampa tiene valor, la petición se descarta en silencio.
                  </p>
                </Card>

                <Card className="bg-card/30 border-emerald-500/20 hover:border-emerald-500/40 transition-all p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Lock className="h-4 w-4 text-emerald-400" /> Fail2Ban / IP Blacklisting de Servidor
                    </span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Avanzado</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Vincular los logs del servidor Go con el servicio Fail2Ban en Linux para bloquear direcciones IP reincidentes a nivel de firewall del sistema operativo (<code className="text-emerald-300">iptables</code>).
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 12: VISTA DE CORREOS */}
          <TabsContent value="emails" className="space-y-6">
            <AdminEmailPreviewTab />
          </TabsContent>

          {/* TAB 13: INSTAGRAM BOT META LIVE DISPATCH */}
          <TabsContent value="instagram-bot" className="space-y-6">
            <AdminInstagramLiveTester />
          </TabsContent>

          {/* TAB 14: TABLERO TRELLO (VIBECODE) */}
          <TabsContent value="trello" className="space-y-6">
            <AdminTrelloTab defaultBoardId="ZePjZue7" />
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL DE REAGENDAMIENTO */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-[#090d16] border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] text-white overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Reagendar Reunión
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Cliente: <strong className="text-white">{rescheduleTarget.name}</strong> ({rescheduleTarget.email})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {rescheduleTarget.meeting_time && (
                <div className="p-3 rounded-lg bg-muted/10 border border-border/20 text-xs text-muted-foreground space-y-1">
                  <div>Horario Actual:</div>
                  <div className="font-semibold text-amber-400">
                    {rescheduleTarget.meeting_time_formatted || format(parseISO(rescheduleTarget.meeting_time), "PPPPp", { locale: es })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reschedule-date" className="text-xs font-semibold text-slate-200">Nueva Fecha</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="bg-background/50 border-primary/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-time" className="text-xs font-semibold text-slate-200">Nueva Hora (Tramos de 30 min)</Label>
                <select
                  id="reschedule-time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full h-10 rounded-md border border-primary/20 bg-background/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[
                    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
                    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
                    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
                  ].map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-white">
                      {t} hrs
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-note" className="text-xs font-semibold text-slate-200">Mensaje / Nota para el cliente (Opcional)</Label>
                <textarea
                  id="reschedule-note"
                  rows={3}
                  placeholder="Ej: Estimado/a, reprogramamos por ajuste de agenda..."
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  className="w-full rounded-md border border-primary/20 bg-background/50 p-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRescheduleTarget(null)}
                  disabled={isRescheduling}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmReschedule}
                  disabled={isRescheduling}
                  className="bg-primary hover:bg-primary/80 font-bold text-xs flex items-center gap-2"
                >
                  {isRescheduling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reagendando y notificando...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Guardar y Enviar Correo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Toaster />
    </div>
  )
}

// ---- HealthCard Sub-component ----
interface HealthCardProps {
  label: string
  icon: React.ReactNode
  result?: { ok: boolean; latencyMs?: number; detail?: string }
  loading?: boolean
  description?: string
  color?: "blue" | "cyan" | "orange" | "red" | "green" | "slate"
  pending?: boolean
}

function HealthCard({ label, icon, result, loading, description, color = "slate", pending = false }: HealthCardProps) {
  const colorMap: Record<string, string> = {
    blue:   "border-blue-500/25 bg-blue-950/20",
    cyan:   "border-cyan-500/25 bg-cyan-950/20",
    orange: "border-orange-500/25 bg-orange-950/20",
    red:    "border-rose-500/25 bg-rose-950/20",
    green:  "border-emerald-500/25 bg-emerald-950/20",
    slate:  "border-slate-500/25 bg-slate-950/20",
  }

  const isOk = result?.ok === true
  const isErr = result?.ok === false
  const hasPendingTag = pending && isErr

  return (
    <Card className={`border transition-all duration-300 ${colorMap[color]} hover:brightness-110`}>
      <CardContent className="p-4 space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`${isOk ? "text-emerald-400" : isErr ? "text-rose-400" : "text-muted-foreground"}`}>
              {icon}
            </span>
            <span className="font-semibold text-white text-sm">{label}</span>
          </div>

          {loading ? (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
              Verificando
            </span>
          ) : isOk ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Activo
            </span>
          ) : isErr ? (
            <span className={`flex items-center gap-1 text-[10px] font-bold ${hasPendingTag ? "text-amber-400" : "text-rose-400"}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${hasPendingTag ? "bg-amber-400" : "bg-rose-400"}`} />
              {hasPendingTag ? "Pendiente" : "Error"}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-border" />
              Sin datos
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-[10px] text-muted-foreground leading-snug">{description}</p>
        )}

        {/* Latency */}
        {result?.latencyMs !== undefined && (
          <p className="text-[10px] text-muted-foreground">
            Latencia: <span className={`font-semibold ${result.latencyMs < 500 ? "text-emerald-400" : result.latencyMs < 1500 ? "text-amber-400" : "text-rose-400"}`}>{result.latencyMs}ms</span>
          </p>
        )}

        {/* Detail / Error */}
        {result?.detail && (
          <p className={`text-[10px] leading-snug ${isOk ? "text-muted-foreground" : hasPendingTag ? "text-amber-400/80" : "text-rose-400/80"}`}>
            {result.detail}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
