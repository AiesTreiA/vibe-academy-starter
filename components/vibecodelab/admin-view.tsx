"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  DollarSign,
  Video,
  CheckCircle,
  KeyRound,
  PlusCircle,
  Trash2,
  Pin,
  RefreshCw,
  UserPlus,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Calendar,
  Pencil,
  Eye,
  EyeOff,
  FlaskConical,
  Play,
  Award,
  Gift,
  Send,
  Trophy
} from "lucide-react"
import { toast } from "sonner"
import { R2VideoUploader } from "@/components/r2-video-uploader"
import { AdminCertificatesTab } from "./admin-certificates-tab"

interface AdminViewProps {
  user: {
    id: string
    email: string
    full_name: string
  }
  onSwitchToStudentView?: () => void
}

export function AdminView({ user, onSwitchToStudentView }: AdminViewProps) {
  const [metrics, setMetrics] = useState<any>({
    total_students: 0,
    paid_students: 0,
    total_revenue_usd: 0,
    completed_lessons_count: 0,
    booked_mentorships_count: 0,
    pitch_posts_count: 0
  })

  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  // New Student Form State
  const [newStudentOpen, setNewStudentOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: "", email: "", phone: "", amount_paid: 265 })
  const [actionLoading, setActionLoading] = useState(false)

  // Class Management States
  const [classList, setClassList] = useState<any[]>([])
  const [newClassOpen, setNewClassOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState<string | null>(null)
  const [classForm, setClassForm] = useState({
    module_number: 1,
    module_title: "Módulo 1: Fundamentos",
    title: "",
    description: "",
    errata: "",
    video_url: "",
    duration_minutes: 60,
    timestamps: "",
    resources: ""
  })

  // Test Bench / Sandbox State
  const [testVideoUrl, setTestVideoUrl] = useState<string>("")
  const [testBenchOpen, setTestBenchOpen] = useState<boolean>(true)

  // Mentorship Slots Creation
  const [newSlotOpen, setNewSlotOpen] = useState(false)
  const [slotDate, setSlotDate] = useState("")

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setLoadingStudents(true)
      const res = await fetch("/api/vibecodelab/admin/students")
      const data = await res.json()

      if (data.success) {
        setMetrics(data.metrics)
        setStudents(data.students || [])
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al cargar datos del panel de administración")
    } finally {
      setLoadingStudents(false)
    }
  }

  // Load Classes
  const loadClasses = async () => {
    try {
      const res = await fetch("/api/vibecodelab/classes?admin=true")
      const data = await res.json()
      if (data.success) {
        setClassList(data.classes || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadAdminData()
    loadClasses()
  }, [])

  // Reset Password & Resend Access via Resend
  const handleResetAccess = async (studentEmail: string, studentName: string) => {
    if (!confirm(`¿Deseas generar una clave temporal y reenviar los accesos a ${studentEmail}?`)) {
      return
    }

    try {
      toast.info(`Generando clave y enviando correo a ${studentEmail}...`)
      const res = await fetch("/api/vibecodelab/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          email: studentEmail,
          name: studentName
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Accesos enviadas a ${studentEmail}. Clave Temp: ${data.tempPassword}`)
        loadAdminData()
      } else {
        toast.error(data.error || "Error al enviar accesos")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al conectar con el servidor")
    }
  }

  // Send Open Source + Alumni Pro Reward Announcement to a single student
  const handleSendOpenSourceAnnouncement = async (
    studentEmail: string,
    studentName: string,
    progressPercent: number = 0
  ) => {
    if (
      !confirm(
        `¿Enviar el anuncio del Premio de Graduación (Repo Alumni Pro al 100%) a ${studentName} (${studentEmail})?`
      )
    ) {
      return
    }

    try {
      toast.info(`Enviando anuncio de Premio Alumni Pro a ${studentEmail}...`)
      const res = await fetch("/api/vibecodelab/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_opensource_announcement",
          email: studentEmail,
          name: studentName,
          progress_percent: progressPercent
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message || `Anuncio enviado a ${studentEmail}`)
      } else {
        toast.error(data.error || "Error al enviar anuncio")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error de red al enviar el anuncio")
    }
  }

  // Broadcast Open Source + Alumni Pro Reward Announcement to ALL paid students
  const handleBroadcastOpenSourceAnnouncement = async () => {
    const paidCount = students.filter((s) => s.status === "paid").length
    if (
      !confirm(
        `¿Confirmas enviar el correo de anuncio "¡Liberé mi Repo al Mundo + Premio Bóveda Alumni Pro al 100%!" a los ${paidCount} alumnos inscritos con pago confirmado?`
      )
    ) {
      return
    }

    try {
      setActionLoading(true)
      toast.info("Enviando comunicado oficial a todos los alumnos...")
      const res = await fetch("/api/vibecodelab/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_opensource_announcement"
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message || `¡Anuncio enviado a ${data.sentCount} alumnos!`)
      } else {
        toast.error(data.error || "Error en el envío masivo")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error de red en el envío masivo")
    } finally {
      setActionLoading(false)
    }
  }

  // Create Manual Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStudent.email) {
      toast.error("El email es requerido")
      return
    }

    setActionLoading(true)

    try {
      const res = await fetch("/api/vibecodelab/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_student",
          ...newStudent
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Alumno registrado con éxito. Clave Temp: ${data.tempPassword}`)
        setNewStudentOpen(false)
        setNewStudent({ name: "", email: "", phone: "", amount_paid: 265 })
        loadAdminData()
      } else {
        toast.error(data.error || "Error al registrar alumno")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error en la solicitud")
    } finally {
      setActionLoading(false)
    }
  }

  // Open Edit Class Modal
  const handleOpenEditClass = (cls: any) => {
    setEditingClassId(cls.id)
    setClassForm({
      module_number: cls.module_number || 1,
      module_title: cls.module_title || "Módulo 1: Fundamentos",
      title: cls.title || "",
      description: cls.description || "",
      errata: cls.errata || "",
      video_url: cls.video_url || "",
      duration_minutes: cls.duration_minutes || 60,
      timestamps: cls.timestamps && Array.isArray(cls.timestamps) ? JSON.stringify(cls.timestamps, null, 2) : "",
      resources: cls.resources && Array.isArray(cls.resources) ? JSON.stringify(cls.resources, null, 2) : ""
    })
    setNewClassOpen(true)
  }

  const handleOpenNewClass = () => {
    setEditingClassId(null)
    setClassForm({
      module_number: 1,
      module_title: "Módulo 1: Fundamentos",
      title: "",
      description: "",
      errata: "",
      video_url: "",
      duration_minutes: 60,
      timestamps: "",
      resources: ""
    })
    setNewClassOpen(true)
  }

  // Create or Update Class Video
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!classForm.title) {
      toast.error("El título de la clase es requerido")
      return
    }

    // Parse Timestamps JSON if present
    let parsedTimestamps: any[] = []
    if (classForm.timestamps) {
      try {
        parsedTimestamps = JSON.parse(classForm.timestamps)
      } catch {
        parsedTimestamps = [
          { time: 0, label: "00:00 - Inicio de la Clase" },
          { time: 1800, label: "30:00 - Práctica en Vivo" }
        ]
      }
    }

    // Parse Resources JSON if present
    let parsedResources: any[] = []
    if (classForm.resources) {
      try {
        parsedResources = JSON.parse(classForm.resources)
      } catch {
        parsedResources = []
      }
    }

    try {
      const isEditing = !!editingClassId
      const url = "/api/vibecodelab/classes"
      const method = isEditing ? "PUT" : "POST"
      const payload = isEditing
        ? {
            id: editingClassId,
            ...classForm,
            timestamps: parsedTimestamps,
            resources: parsedResources
          }
        : {
            ...classForm,
            timestamps: parsedTimestamps,
            resources: parsedResources,
            order_index: classList.length + 1
          }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        toast.success(isEditing ? "¡Clase actualizada con éxito!" : "¡Nueva clase publicada!")
        setNewClassOpen(false)
        setEditingClassId(null)
        setClassForm({
          module_number: 1,
          module_title: "Módulo 1: Fundamentos",
          title: "",
          description: "",
          errata: "",
          video_url: "",
          duration_minutes: 60,
          timestamps: "",
          resources: ""
        })
        loadClasses()
      } else {
        toast.error(data.error || "Error al guardar clase")
      }
    } catch (err: any) {
      console.error("[Admin] Error guardando clase:", err)
      toast.error("Error de conexión al guardar la clase")
    }
  }

  // Create Mentorship Slot
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!slotDate) {
      toast.error("Selecciona la fecha y hora")
      return
    }

    try {
      const res = await fetch("/api/vibecodelab/mentorship", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_date: slotDate })
      })

      const data = await res.json()

      if (data.success) {
        toast.success("¡Horario de mentoría 1-a-1 habilitado!")
        setNewSlotOpen(false)
        setSlotDate("")
      } else {
        toast.error(data.error || "Error al habilitar slot")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-950 text-amber-300 border-amber-700/50">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Control de Administración
              </Badge>
              <Badge variant="outline" className="border-indigo-700/50 text-indigo-400">
                hola@javiermujica.com
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-white">Panel de Control Vibecode Lab</h1>
            <p className="text-xs text-slate-400 mt-1">
              Gestión de inscritos, emisión de claves temporales, subida de contenidos y moderación comunitaria.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToStudentView && (
              <Button
                size="sm"
                onClick={onSwitchToStudentView}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
              >
                <Eye className="w-4 h-4 mr-1.5" /> Ver como Alumno
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setNewStudentOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              <UserPlus className="w-4 h-4 mr-1.5" /> Registrar Alumno
            </Button>
            <Button
              size="sm"
              onClick={loadAdminData}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="metrics"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm py-2.5"
          >
            <BarChart3 className="w-4 h-4 mr-2 hidden sm:inline" /> Métricas
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm py-2.5"
          >
            <Users className="w-4 h-4 mr-2 hidden sm:inline" /> Alumnos ({students.length})
          </TabsTrigger>
          <TabsTrigger
            value="recordings"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm py-2.5"
          >
            <Video className="w-4 h-4 mr-2 hidden sm:inline" /> Grabaciones
          </TabsTrigger>
          <TabsTrigger
            value="mentorships"
            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm py-2.5"
          >
            <Calendar className="w-4 h-4 mr-2 hidden sm:inline" /> Mentorías
          </TabsTrigger>
          <TabsTrigger
            value="certificates"
            className="data-[state=active]:bg-violet-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm py-2.5 col-span-2 sm:col-span-1"
          >
            <Award className="w-4 h-4 mr-2 hidden sm:inline text-violet-300" /> Certificados & MVPs
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MÉTRICAS GLOBALES */}
        <TabsContent value="metrics" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase">Inscritos Totales</CardTitle>
                <Users className="w-4 h-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">{metrics.total_students}</div>
                <p className="text-[10px] text-emerald-400 mt-1">
                  {metrics.paid_students} Confirmados con Pago
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase">Recaudación Estimada</CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-400">${metrics.total_revenue_usd} USD</div>
                <p className="text-[10px] text-slate-400 mt-1">Cobros vía Mercado Pago & Abonos</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase">Lecciones Vistas</CardTitle>
                <CheckCircle className="w-4 h-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">{metrics.completed_lessons_count}</div>
                <p className="text-[10px] text-slate-400 mt-1">Total de completados por alumnos</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase">Mentorías Reservadas</CardTitle>
                <Calendar className="w-4 h-4 text-rose-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">{metrics.booked_mentorships_count}</div>
                <p className="text-[10px] text-slate-400 mt-1">Sesiones 1-a-1 agendadas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: LISTA DE INSCRITOS & GESTIÓN DE ACCESOS */}
        <TabsContent value="students" className="mt-6 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base text-white">Directorio de Alumnos, Progreso & Premio Alumni Pro</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Monitorea quién ha completado el 100%, envía el comunicado oficial del Premio Repo Pro o reenvía credenciales.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() =>
                    handleSendOpenSourceAnnouncement(
                      user.email || "hola@javiermujica.com",
                      user.full_name || "Javier Mujica",
                      75
                    )
                  }
                  className="border-amber-600/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 text-xs font-semibold"
                >
                  <Gift className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Probar Correo Premio en mi Email
                </Button>
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={handleBroadcastOpenSourceAnnouncement}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-md shadow-amber-900/30"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Anunciar Premio Repo Pro a Todos
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-900/30"
                >
                  <Link href="/admin/certificates">
                    <Award className="w-3.5 h-3.5 mr-1.5 text-violet-200" /> Revisar MVPs y Certificados
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="p-8 text-center text-xs text-slate-400">Cargando directorio...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-950">
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-300">Nombre</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Estado Pago</TableHead>
                        <TableHead className="text-slate-300">Progreso / Premio</TableHead>
                        <TableHead className="text-slate-300">Clave Temp</TableHead>
                        <TableHead className="text-right text-slate-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((st) => {
                        const pct = st.progress_percent || 0
                        const isGraduated = pct >= 100
                        return (
                          <TableRow key={st.id} className="border-slate-800">
                            <TableCell className="font-medium text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{st.name}</span>
                                {st.role === "admin" && (
                                  <Badge variant="outline" className="border-amber-600 text-amber-400 text-[10px]">
                                    admin
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono">{st.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  st.status === "paid"
                                    ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                    : "bg-amber-950 text-amber-400 border-amber-800"
                                }
                              >
                                {st.status === "paid" ? "Pagado ($" + st.amount_paid + " USD)" : "Pendiente"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    isGraduated
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                                      : "bg-slate-800 text-slate-300 border-slate-700"
                                  }
                                >
                                  {isGraduated ? (
                                    <>
                                      <Trophy className="w-3 h-3 mr-1 text-amber-400" /> 100% · Premio Activo
                                    </>
                                  ) : (
                                    `${pct}% (${st.completed_classes || 0}/${st.total_classes || 0})`
                                  )}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {st.must_change_password ? (
                                <span className="text-amber-400 text-[11px] font-semibold">⚠️ Requiere Cambio</span>
                              ) : (
                                <span className="text-emerald-400 text-[11px] font-semibold">✅ Personalizada</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSendOpenSourceAnnouncement(st.email, st.name, pct)}
                                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 text-xs"
                                  title="Enviar correo de anuncio del Premio Repo Alumni Pro"
                                >
                                  <Gift className="w-3.5 h-3.5 mr-1" /> Anunciar Premio
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleResetAccess(st.email, st.name)}
                                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 text-xs"
                                >
                                  <KeyRound className="w-3.5 h-3.5 mr-1" /> Accesos
                                </Button>
                              </div>
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
        </TabsContent>

        {/* TAB 3: SUBIDA DE GRABADACIONES */}
        <TabsContent value="recordings" className="mt-6 space-y-6">
          {/* BANCO DE PRUEBAS / SANDBOX UPLOADER (ADMIN ONLY) */}
          <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Laboratorio de Pruebas de Subida R2</h4>
                    <Badge className="bg-violet-950 text-violet-300 border-violet-700/60 text-[10px]">
                      🧪 Exclusivo Modo Admin (Invisible para alumnos)
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Arrastra cualquier video de prueba (&gt;1 GB) para probar la subida multipart, velocidad MB/s y ver el reproductor en vivo sin afectar tus clases.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setTestBenchOpen(!testBenchOpen)}
                className="text-slate-400 hover:text-white text-xs"
              >
                {testBenchOpen ? "Ocultar panel de pruebas" : "Mostrar panel de pruebas"}
              </Button>
            </div>

            {testBenchOpen && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <R2VideoUploader
                  onUploaded={(url) => {
                    setTestVideoUrl(url)
                    toast.success("¡Video de prueba subido y listo en el reproductor de testing!")
                  }}
                />

                {testVideoUrl && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-violet-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-400" /> Vista previa del video de prueba en R2:
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const c3 = classList.find(c => c.order_index === 3 || c.title?.toLowerCase().includes("clase 3"))
                            if (c3) {
                              handleOpenEditClass(c3)
                              // Añadir como bloque C oculto a alumnos por defecto
                              const hiddenUrl = `${testVideoUrl}#hidden`
                              setClassForm(prev => ({
                                ...prev,
                                video_url: prev.video_url ? `${prev.video_url},${hiddenUrl}` : hiddenUrl
                              }))
                              toast.success("Video agregado a Clase 3 como Bloque C [Oculto a Alumnos]. Haz clic en Guardar Cambios en el modal.")
                            } else {
                              toast.info("Abre cualquier clase en 'Editar' y añade el video con 1 clic.")
                            }
                          }}
                          className="border-violet-500/40 text-violet-300 hover:bg-violet-950/50 text-xs h-7"
                        >
                          ➕ Asignar como Bloque C (Test) a Clase 3
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTestVideoUrl("")
                            toast.info("Video de prueba descartado.")
                          }}
                          className="text-rose-400 hover:text-rose-300 text-xs h-7"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Descartar prueba
                        </Button>
                      </div>
                    </div>

                    <div className="relative aspect-video max-w-xl mx-auto bg-black rounded-lg overflow-hidden border border-slate-800">
                      <video src={testVideoUrl} controls className="w-full h-full object-contain" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="truncate">{testVideoUrl}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(testVideoUrl)
                          toast.success("URL de prueba copiada al portapapeles!")
                        }}
                        className="text-violet-400 hover:underline font-semibold ml-2 flex-shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <h3 className="text-sm font-bold text-white">Catálogo de Grabaciones ({classList.length} lecciones)</h3>

            <Button
              onClick={handleOpenNewClass}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" /> Agregar Grabación
            </Button>

            <Dialog open={newClassOpen} onOpenChange={setNewClassOpen}>
              <DialogContent className="sm:max-w-xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-white">
                <DialogHeader className="p-5 pb-3 border-b border-slate-800 shrink-0">
                  <DialogTitle className="text-base font-bold">
                    {editingClassId ? "Editar Clase Grabada" : "Publicar Nueva Clase Grabada"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateClass} className="space-y-3 p-5 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Nº Módulo</label>
                      <Input
                        type="number"
                        value={classForm.module_number}
                        onChange={(e) => setClassForm({ ...classForm, module_number: parseInt(e.target.value) || 1 })}
                        className="bg-slate-950 border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Duración (Mins)</label>
                      <Input
                        type="number"
                        value={classForm.duration_minutes}
                        onChange={(e) => setClassForm({ ...classForm, duration_minutes: parseInt(e.target.value) || 60 })}
                        className="bg-slate-950 border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Título del Módulo</label>
                    <Input
                      value={classForm.module_title}
                      onChange={(e) => setClassForm({ ...classForm, module_title: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Título de la Clase *</label>
                    <Input
                      value={classForm.title}
                      onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300 block">Video de la Clase</label>
                      {classForm.video_url ? (
                        <button
                          type="button"
                          onClick={() => {
                            setClassForm(prev => ({ ...prev, video_url: "" }))
                            toast.info("Video quitado. Haz clic en Guardar Cambios para aplicar.")
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Quitar Video
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Opcional / Pendiente</span>
                      )}
                    </div>

                    {classForm.video_url ? (
                      <div className="space-y-3">
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              Videos asignados a esta clase ({classForm.video_url.split(",").filter(Boolean).length} {classForm.video_url.split(",").filter(Boolean).length === 1 ? "parte" : "partes"}):
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setClassForm(prev => ({ ...prev, video_url: "" }))
                                toast.info("Videos quitados del formulario.")
                              }}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 h-6 px-2 text-[11px]"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Limpiar todo
                            </Button>
                          </div>

                          <div className="space-y-1.5">
                            {classForm.video_url.split(",").map((urlPart, idx) => {
                              const trimmed = urlPart.trim()
                              if (!trimmed) return null
                              const isHidden = trimmed.includes("#hidden") || trimmed.includes("test_hidden=true")
                              const cleanUrl = trimmed.replace("#hidden", "").replace("?test_hidden=true", "")
                              const blockLetter = String.fromCharCode(65 + idx)

                              return (
                                <div key={idx} className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-2 text-xs">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      isHidden
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                    }`}>
                                      Bloque {blockLetter} {isHidden && "(🧪 Test - Oculto a Alumnos)"}
                                    </span>
                                    <code className="text-[11px] text-slate-200 font-mono truncate">{cleanUrl}</code>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Toggle Hide/Show */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const parts = classForm.video_url.split(",").map(u => u.trim()).filter(Boolean)
                                        if (isHidden) {
                                          parts[idx] = cleanUrl
                                          toast.success(`Bloque ${blockLetter} ahora es VISIBLE para los alumnos.`)
                                        } else {
                                          parts[idx] = `${cleanUrl}#hidden`
                                          toast.info(`Bloque ${blockLetter} ahora está OCULTO para los alumnos (Solo visible en Admin).`)
                                        }
                                        setClassForm(prev => ({ ...prev, video_url: parts.join(",") }))
                                      }}
                                      className={`p-1 rounded text-xs transition-colors ${
                                        isHidden
                                          ? "text-amber-400 hover:text-amber-300 hover:bg-amber-950/40"
                                          : "text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                                      }`}
                                      title={isHidden ? "Hacer visible a los alumnos" : "Ocultar a los alumnos (Solo prueba en Admin)"}
                                    >
                                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>

                                    {/* Delete Block */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const parts = classForm.video_url.split(",").map(u => u.trim()).filter(Boolean)
                                        parts.splice(idx, 1)
                                        setClassForm(prev => ({ ...prev, video_url: parts.join(",") }))
                                        toast.info(`Bloque ${blockLetter} eliminado.`)
                                      }}
                                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                                      title="Quitar esta parte"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="pt-1">
                          <p className="text-[11px] text-slate-400 mb-2">
                            Sube otro video para agregarlo como siguiente bloque (Bloque B, C...) o prueba:
                          </p>
                          <R2VideoUploader
                            onUploaded={(url) => {
                              setClassForm(prev => {
                                const current = prev.video_url.trim()
                                if (!current) return { ...prev, video_url: url }
                                return { ...prev, video_url: `${current},${url}` }
                              })
                              toast.success("¡Video subido y agregado como siguiente bloque!")
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <R2VideoUploader
                        onUploaded={(url) => {
                          setClassForm(prev => ({ ...prev, video_url: url }))
                          toast.success("¡Video subido y asignado a la clase exitosamente!")
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Descripción</label>
                    <Textarea
                      value={classForm.description}
                      onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-16"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-amber-300 mb-1 block flex items-center gap-1">
                      📌 Fe de Erratas / Aclaración Importante (Opcional)
                    </label>
                    <Textarea
                      placeholder="Texto de fe de erratas o aclaraciones que se mostrará destacado a los alumnos..."
                      value={classForm.errata}
                      onChange={(e) => setClassForm({ ...classForm, errata: e.target.value })}
                      className="bg-slate-950 border-amber-500/30 text-amber-200 text-xs h-20 placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Timestamps (JSON Array)</label>
                    <Textarea
                      placeholder='[{"time": 0, "label": "00:00 Intro"}, {"time": 600, "label": "10:00 Config"}]'
                      value={classForm.timestamps}
                      onChange={(e) => setClassForm({ ...classForm, timestamps: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs font-mono h-16"
                    />
                  </div>

                  <div className="pt-2 sticky bottom-0 bg-slate-900 pb-1">
                    <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2.5">
                      {editingClassId ? "Guardar Cambios" : "Publicar Grabación"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {classList.map((cls, idx) => (
              <div key={cls.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px] mb-1">
                    {cls.module_title}
                  </Badge>
                  <h4 className="text-sm font-bold text-white truncate">{cls.title}</h4>
                  <p className="text-xs text-slate-400">
                    {cls.duration_minutes} minutos — {cls.timestamps?.length || 0} Timestamps
                    {cls.video_url ? (
                      <span className="ml-2 text-emerald-400 font-mono text-[10px]">● Video asignado</span>
                    ) : (
                      <span className="ml-2 text-amber-400 font-mono text-[10px]">○ Sin video</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditClass(cls)}
                    className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar / Video
                  </Button>
                  <Badge variant="outline" className="border-emerald-700 text-emerald-400">
                    Publicada
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* TAB 4: MENTORÍAS & DISPONIBILIDAD */}
        <TabsContent value="mentorships" className="mt-6 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">Habilitar Horarios de Mentoría 1-a-1</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Crea un nuevo horario disponible para que los alumnos agenden mentoría.
                </CardDescription>
              </div>

              <Dialog open={newSlotOpen} onOpenChange={setNewSlotOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
                    <PlusCircle className="w-4 h-4 mr-1.5" /> Habilitar Horario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Nuevo Horario de Mentoría</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleCreateSlot} className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Fecha y Hora *</label>
                      <Input
                        type="datetime-local"
                        value={slotDate}
                        onChange={(e) => setSlotDate(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
                      Crear Slot
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* TAB 5: CERTIFICADOS & PROMPT MAESTRO */}
        <TabsContent value="certificates" className="mt-6 space-y-6">
          <AdminCertificatesTab />
        </TabsContent>
      </Tabs>

      {/* Manual Student Registration Modal */}
      <Dialog open={newStudentOpen} onOpenChange={setNewStudentOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Registrar Alumno Manualmente</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateStudent} className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-slate-300 mb-1 block">Nombre Completo</label>
              <Input
                placeholder="Ej: Paula Garcés"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Correo Electrónico *</label>
              <Input
                type="email"
                placeholder="alumno@ejemplo.com"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Teléfono / WhatsApp</label>
              <Input
                placeholder="+569..."
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Monto Pagado (USD)</label>
              <Input
                type="number"
                value={newStudent.amount_paid}
                onChange={(e) => setNewStudent({ ...newStudent, amount_paid: parseInt(e.target.value) || 0 })}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              {actionLoading ? "Registrando..." : "Registrar y Enviar Credenciales"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
