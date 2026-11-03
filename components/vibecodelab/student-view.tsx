"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  PlayCircle,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  Video,
  Users,
  Heart,
  PlusCircle,
  ExternalLink,
  Code,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  FileCode,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  Maximize2,
  Film,
  Trophy,
  Lock,
  Unlock
} from "lucide-react"
import { toast } from "sonner"
import { AlumniRewardVault } from "./alumni-reward-vault"

interface StudentViewProps {
  user: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
}

export function StudentView({ user }: StudentViewProps) {
  const [activeTab, setActiveTab] = useState("classes")
  const [classes, setClasses] = useState<any[]>([])
  const [activeClass, setActiveClass] = useState<any>(null)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedPartIndex, setSelectedPartIndex] = useState(0)

  useEffect(() => {
    setSelectedPartIndex(0)
  }, [activeClass?.id])

  // Resource Viewer states
  const [viewerResource, setViewerResource] = useState<any | null>(null)
  const [viewerContent, setViewerContent] = useState<string | null>(null)
  const [viewerLoading, setViewerLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Open resource viewer modal
  const handleOpenViewer = async (res: any) => {
    if (!res.url) return

    // External URL -> Open directly in new tab
    if (res.url.startsWith("http://") || res.url.startsWith("https://")) {
      window.open(res.url, "_blank", "noreferrer")
      return
    }

    setViewerResource(res)
    setCopiedCode(false)
    setViewerContent(null)

    const isPdf = res.url.endsWith(".pdf") || res.type === "pdf"
    if (!isPdf) {
      try {
        setViewerLoading(true)
        // Use the download API with ?view=true to serve content inline with correct headers
        const fetchUrl = `/api/vibecodelab/download?file=${encodeURIComponent(res.url)}&view=true`
        const response = await fetch(fetchUrl)
        if (response.ok) {
          const text = await response.text()
          setViewerContent(text)
        } else {
          setViewerContent("// No se pudo cargar el contenido del archivo.")
        }
      } catch (err) {
        console.error(err)
        setViewerContent("// Error al cargar el archivo.")
      } finally {
        setViewerLoading(false)
      }
    }
  }

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (viewerContent) {
      navigator.clipboard.writeText(viewerContent)
      setCopiedCode(true)
      toast.success("¡Código copiado al portapapeles!")
      setTimeout(() => setCopiedCode(false), 2500)
    }
  }

  // Mentorship states
  const [slots, setSlots] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [mentorshipTopic, setMentorshipTopic] = useState("")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [reschedulingSession, setReschedulingSession] = useState<any | null>(null)
  const [rescheduleNewSlot, setRescheduleNewSlot] = useState<any | null>(null)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  // Pitch & Match states
  const [pitchPosts, setPitchPosts] = useState<any[]>([])
  const [pitchCategory, setPitchCategory] = useState("all")
  const [newPitchOpen, setNewPitchOpen] = useState(false)
  const [pitchForm, setPitchForm] = useState({
    title: "",
    category: "idea",
    description: "",
    tech_stack: "",
    contact_info: "",
    looking_for: ""
  })
  const [pitchLoading, setPitchLoading] = useState(false)

  // Load Classes
  const loadClasses = async () => {
    try {
      setLoadingClasses(true)
      const res = await fetch(`/api/vibecodelab/classes?userId=${user.id}`)
      const data = await res.json()
      if (data.success && data.classes) {
        setClasses(data.classes)
        if (data.classes.length > 0 && !activeClass) {
          setActiveClass(data.classes[0])
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al cargar lecciones")
    } finally {
      setLoadingClasses(false)
    }
  }

  // Load Mentorship Slots
  const loadMentorshipSlots = async () => {
    try {
      const res = await fetch(`/api/vibecodelab/mentorship?userId=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setSlots(data.slots || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Load Pitch & Match Posts
  const loadPitchPosts = async (cat: string = "all") => {
    try {
      const res = await fetch(`/api/vibecodelab/pitch-match?category=${cat}`)
      const data = await res.json()
      if (data.success) {
        setPitchPosts(data.posts || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadClasses()
    loadMentorshipSlots()
    loadPitchPosts()
  }, [])

  // Toggle class completion
  const handleToggleComplete = async (cls: any) => {
    const newStatus = !cls.completed
    // Optimistic UI update
    setClasses((prev) =>
      prev.map((c) => (c.id === cls.id ? { ...c, completed: newStatus } : c))
    )
    if (activeClass?.id === cls.id) {
      setActiveClass((prev: any) => ({ ...prev, completed: newStatus }))
    }

    try {
      const res = await fetch("/api/vibecodelab/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          classId: cls.id,
          completed: newStatus,
          userEmail: user.email,
          userName: user.full_name
        })
      })
      const data = await res.json()
      if (!data.success) {
        toast.error("Error guardando progreso")
      } else if (data.justGraduated) {
        toast.success("🏆 ¡100% Completado! Has desbloqueado tu Premio: Bóveda Alumni Pro", {
          description: "Acabamos de habilitar tu acceso exclusivo en la pestaña 'Premio Alumni Pro'.",
          duration: 9000
        })
        setActiveTab("reward")
      } else {
        toast.success(newStatus ? "¡Clase completada!" : "Progreso actualizado")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Seek timestamp
  const handleSeekTimestamp = (seconds: number) => {
    const iframe = document.getElementById("vibe-player") as HTMLIFrameElement
    if (iframe && activeClass?.video_url) {
      const baseUrl = activeClass.video_url.split("?")[0]
      iframe.src = `${baseUrl}?autoplay=1&start=${seconds}`
      toast.info(`Navegando al segundo ${seconds}`)
    }
  }

  // Book mentorship
  const handleBookMentorship = async () => {
    if (!selectedSlot) {
      toast.error("Selecciona un horario disponible")
      return
    }

    setBookingLoading(true)

    try {
      const res = await fetch("/api/vibecodelab/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          userId: user.id,
          userName: user.full_name,
          userEmail: user.email,
          topic: mentorshipTopic
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success("¡Mentoría 1-a-1 agendada con éxito!")
        setSelectedSlot(null)
        setMentorshipTopic("")
        loadMentorshipSlots()
      } else {
        toast.error(data.error || "No se pudo agendar la mentoría")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error en la conexión")
    } finally {
      setBookingLoading(false)
    }
  }

  // Cancel Mentorship (strictly allowed >= 24h before)
  const handleCancelMentorship = async (slotId: string, slotDate: string) => {
    const hoursRemaining = (new Date(slotDate).getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursRemaining < 24) {
      toast.error("No es posible cancelar la cita con menos de 24 horas de anticipación.")
      return
    }

    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva de mentoría? El cupo quedará libre.")) return

    setCancelLoading(true)
    try {
      const res = await fetch("/api/vibecodelab/mentorship", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, userId: user.id })
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Reserva de mentoría cancelada exitosamente.")
        loadMentorshipSlots()
      } else {
        toast.error(data.error || "No se pudo cancelar la reserva.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error en la conexión al cancelar")
    } finally {
      setCancelLoading(false)
    }
  }

  // Reschedule Mentorship (strictly allowed >= 24h before)
  const handleRescheduleMentorship = async () => {
    if (!reschedulingSession || !rescheduleNewSlot) {
      toast.error("Por favor selecciona un nuevo horario para reagendar.")
      return
    }

    const hoursRemaining = (new Date(reschedulingSession.slot_date).getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursRemaining < 24) {
      toast.error("No es posible cambiar la fecha con menos de 24 horas de anticipación.")
      return
    }

    setRescheduleLoading(true)
    try {
      const res = await fetch("/api/vibecodelab/mentorship", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldSlotId: reschedulingSession.id,
          newSlotId: rescheduleNewSlot.id,
          userId: user.id,
          topic: mentorshipTopic || reschedulingSession.topic
        })
      })

      const data = await res.json()
      if (data.success) {
        toast.success("¡Mentoría reagendada exitosamente!")
        setReschedulingSession(null)
        setRescheduleNewSlot(null)
        loadMentorshipSlots()
      } else {
        toast.error(data.error || "No se pudo reagendar la mentoría.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al conectar con el servidor.")
    } finally {
      setRescheduleLoading(false)
    }
  }

  // Create Pitch Post
  const handleCreatePitch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pitchForm.title || !pitchForm.description || !pitchForm.contact_info) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setPitchLoading(true)

    try {
      const res = await fetch("/api/vibecodelab/pitch-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          author_name: user.full_name,
          author_role: "Alumno Vibecode",
          author_avatar: user.avatar_url,
          ...pitchForm
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success("¡Publicación realizada en Pitch & Match!")
        setNewPitchOpen(false)
        setPitchForm({
          title: "",
          category: "idea",
          description: "",
          tech_stack: "",
          contact_info: "",
          looking_for: ""
        })
        loadPitchPosts(pitchCategory)
      } else {
        toast.error(data.error || "Error al publicar")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al publicar")
    } finally {
      setPitchLoading(false)
    }
  }

  // Like Pitch Post
  const handleLikePitch = async (postId: string) => {
    try {
      setPitchPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
      )

      await fetch("/api/vibecodelab/pitch-match", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action: "like" })
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Calculate course completion %
  const totalClasses = classes.length
  const completedClasses = classes.filter((c) => c.completed).length
  const completionPercentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Top Banner / Progress overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-900/60 text-indigo-300 border-indigo-700/50">
                🎓 Vibecode Lab — Alumno
              </Badge>
              <Badge variant="outline" className="border-emerald-700/50 text-emerald-400">
                Acceso Vitalicio
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              ¡Bienvenido/a, {user.full_name}!
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Accede a tus clases grabadas, navega por timestamps interactivos, descarga recursos y programa tu mentoría 1-a-1.
            </p>
          </div>

          {/* Overall Progress Card */}
          <div className="w-full md:w-80 bg-slate-950/80 border border-slate-800 rounded-xl p-4 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Progreso General
              </span>
              <span className={completionPercentage >= 100 ? "text-amber-400 font-bold" : "text-indigo-400"}>
                {completionPercentage}% Completado
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2.5 bg-slate-800" />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{completedClasses} de {totalClasses} clases vistas</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("reward")}
              className={`w-full mt-1 py-1.5 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-all ${
                completionPercentage >= 100
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25"
                  : "bg-indigo-950/60 border-indigo-800/60 text-indigo-300 hover:border-amber-500/40 hover:text-amber-300"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                {completionPercentage >= 100 ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    🏆 ¡Bóveda Alumni Pro Desbloqueada!
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Premio al 100%: Repo Alumni Pro
                  </>
                )}
              </span>
              <span className="underline ml-1 shrink-0">Ver →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-slate-900/90 border border-slate-800 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="classes"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium text-xs sm:text-sm py-2.5 transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2 hidden sm:inline" />
            Clases & Recursos
          </TabsTrigger>
          <TabsTrigger
            value="mentorship"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium text-xs sm:text-sm py-2.5 transition-all"
          >
            <Calendar className="w-4 h-4 mr-2 hidden sm:inline" />
            Mentorías 1-a-1
          </TabsTrigger>
          <TabsTrigger
            value="pitch"
            onClick={() => loadPitchPosts(pitchCategory)}
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium text-xs sm:text-sm py-2.5 transition-all"
          >
            <Users className="w-4 h-4 mr-2 hidden sm:inline" />
            Pitch & Match
          </TabsTrigger>
          <TabsTrigger
            value="reward"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-950 font-bold text-xs sm:text-sm py-2.5 transition-all text-amber-300"
          >
            <Trophy className="w-4 h-4 mr-1.5 inline" />
            Premio Alumni Pro
            {completionPercentage >= 100 ? (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100%
              </span>
            ) : (
              <Lock className="w-3 h-3 ml-1.5 opacity-75 inline" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CLASES GRABADAS & PROGRESO */}
        <TabsContent value="classes" className="mt-6 space-y-6">
          {loadingClasses ? (
            <div className="p-12 text-center text-slate-400">Cargando catálogo de lecciones...</div>
          ) : classes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
              No hay clases publicadas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Video Player & Timestamps (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {activeClass && (
                  <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl">
                    {(() => {
                      const videoUrls = (activeClass.video_url || "")
                        .split(",")
                        .map((u: string) => u.trim())
                        .filter((u: string) => Boolean(u) && !u.includes("#hidden") && !u.includes("test_hidden=true"))
                      const currentVideoUrl = videoUrls[selectedPartIndex] || videoUrls[0] || ""

                      return (
                        <>
                          {videoUrls.length > 1 && (
                            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <Film className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-semibold text-slate-300">Partes de la Clase:</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {videoUrls.map((_: string, idx: number) => {
                                  const blockLetter = String.fromCharCode(65 + idx)
                                  return (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant={selectedPartIndex === idx ? "default" : "outline"}
                                      onClick={() => setSelectedPartIndex(idx)}
                                      className={
                                        selectedPartIndex === idx
                                          ? "bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 px-3 font-semibold shadow-sm shadow-indigo-900/50"
                                          : "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs h-7 px-3"
                                      }
                                    >
                                      Parte {idx + 1} (Bloque {blockLetter})
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Video Player Container */}
                          <div className="relative aspect-video bg-black flex items-center justify-center">
                            {currentVideoUrl && currentVideoUrl.trim() !== "" ? (
                              /\.(mp4|webm|mov|ogg)(\?|$)/i.test(currentVideoUrl) ? (
                                <video
                                  key={currentVideoUrl}
                                  id="vibe-player"
                                  src={currentVideoUrl}
                                  controls
                                  playsInline
                                  autoPlay
                                  className="w-full h-full"
                                  style={{ background: "#000" }}
                                />
                              ) : (
                                <iframe
                                  key={currentVideoUrl}
                                  id="vibe-player"
                                  src={currentVideoUrl}
                                  title={activeClass.title}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              )
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center border-b border-slate-800 relative overflow-hidden">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mb-3 shadow-xl">
                                  <Video className="w-7 h-7" />
                                </div>
                                <h4 className="text-white font-bold text-base md:text-lg mb-1">
                                  Aquí se subirá la clase
                                </h4>
                                <p className="text-slate-400 text-xs md:text-sm max-w-md">
                                  Estamos preparando el contenido de esta lección. Estará disponible en este módulo muy pronto.
                                </p>
                                <Badge variant="outline" className="mt-3 border-indigo-700/60 text-indigo-300 bg-indigo-950/40 font-mono text-[11px]">
                                  ⚡ Vibecode Studio — Lección en Preparación
                                </Badge>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    })()}

                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800">
                          {activeClass.module_title}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {activeClass.duration_minutes} mins
                          </span>
                          <Button
                            size="sm"
                            variant={activeClass.completed ? "default" : "outline"}
                            onClick={() => handleToggleComplete(activeClass)}
                            className={
                              activeClass.completed
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "border-slate-700 text-slate-300 hover:bg-slate-800"
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            {activeClass.completed ? "Completada" : "Marcar completada"}
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-white font-bold">{activeClass.title}</CardTitle>
                      <CardDescription className="text-slate-300 text-sm">
                        {activeClass.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-0">
                      {/* Fe de Erratas Alert Box if present */}
                      {activeClass.errata && (
                        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 space-y-2 text-amber-200 shadow-lg">
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            Aclaración Importante / Fe de Erratas
                          </div>
                          <p className="text-xs text-amber-200/90 leading-relaxed whitespace-pre-line">
                            {activeClass.errata}
                          </p>
                        </div>
                      )}

                      {/* Timestamps Section (Omitido para Clase 0) */}
                      {activeClass.timestamps && activeClass.timestamps.length > 0 && activeClass.order_index !== 0 && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> Timestamps & Momentos Clave
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeClass.timestamps.map((ts: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => handleSeekTimestamp(ts.time)}
                                className="flex items-center justify-between text-left p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-indigo-600 hover:bg-indigo-950/30 transition-all text-xs group"
                              >
                                <span className="text-slate-200 group-hover:text-indigo-300 font-medium truncate mr-2">
                                  {ts.label}
                                </span>
                                <Badge variant="secondary" className="bg-slate-800 text-indigo-400 text-[10px] shrink-0 font-mono">
                                  {Math.floor(ts.time / 60)}:{(ts.time % 60).toString().padStart(2, "0")}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Slides Carousel Section */}
                      {activeClass.slides && activeClass.slides.length > 0 && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-400" />
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Carrusel de Guía / Slides Interactivas
                              </h4>
                            </div>
                            <Badge variant="outline" className="border-indigo-700/60 text-indigo-300 bg-indigo-950/40 text-[11px]">
                              {activeClass.slides[currentSlideIndex]?.badge || `Slide ${currentSlideIndex + 1} de ${activeClass.slides.length}`}
                            </Badge>
                          </div>

                          {/* Slide Box */}
                          <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-5 space-y-3 relative overflow-hidden">
                            <div className="space-y-1 z-10 relative">
                              <h5 className="text-sm font-bold text-white">
                                {activeClass.slides[currentSlideIndex]?.title}
                              </h5>
                              {activeClass.slides[currentSlideIndex]?.subtitle && (
                                <p className="text-xs font-semibold text-indigo-300">
                                  {activeClass.slides[currentSlideIndex]?.subtitle}
                                </p>
                              )}
                              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                                {activeClass.slides[currentSlideIndex]?.content}
                              </p>
                            </div>

                            {/* Slide Controls */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-3 z-10 relative">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={currentSlideIndex === 0}
                                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-8"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                              </Button>

                              <div className="flex items-center gap-1.5">
                                {activeClass.slides.map((_: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCurrentSlideIndex(idx)}
                                    className={`h-2 rounded-full transition-all ${
                                      idx === currentSlideIndex
                                        ? "bg-indigo-500 w-5"
                                        : "bg-slate-700 hover:bg-slate-600 w-2"
                                    }`}
                                  />
                                ))}
                              </div>

                              <Button
                                size="sm"
                                variant="default"
                                disabled={currentSlideIndex === activeClass.slides.length - 1}
                                onClick={() => setCurrentSlideIndex((prev) => Math.min(activeClass.slides.length - 1, prev + 1))}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8"
                              >
                                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Downloadable Resources & Starter Code */}
                      {activeClass.resources && activeClass.resources.length > 0 && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Download className="w-4 h-4" /> Código Fuente & Recursos Descargables
                          </h4>
                          <div className="space-y-2">
                            {activeClass.resources.map((res: any, idx: number) => {
                              const isLocal = res.url && res.url.startsWith("/")
                              const isPdf = res.url && (res.url.endsWith(".pdf") || res.type === "pdf")
                              const downloadHref = isLocal
                                ? `/api/vibecodelab/download?file=${encodeURIComponent(res.url)}`
                                : res.url

                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600/50 hover:bg-slate-900/90 transition-all text-xs group"
                                >
                                  <div
                                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                                    onClick={() => handleOpenViewer(res)}
                                  >
                                    {res.type === "code" || (res.url && res.url.endsWith(".js")) ? (
                                      <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 shrink-0">
                                        <Code className="w-4 h-4" />
                                      </div>
                                    ) : isPdf ? (
                                      <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                    ) : res.type === "github" || (res.url && res.url.includes("github.com")) ? (
                                      <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300 shrink-0">
                                        <Code className="w-4 h-4" />
                                      </div>
                                    ) : (
                                      <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
                                        <FileCode className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <span className="text-slate-200 font-semibold group-hover:text-indigo-300 block truncate">
                                        {res.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {isLocal
                                          ? isPdf
                                            ? "Documento PDF — Clic para abrir visor o descargar"
                                            : res.url.endsWith(".md") || res.type === "markdown"
                                              ? "Documento Markdown (.md) — Clic para ver, copiar o descargar"
                                              : "Script de Código — Clic para ver, copiar o descargar"
                                          : res.type === "github" || (res.url && res.url.includes("github.com"))
                                            ? "Repositorio GitHub — Abrir enlace externo"
                                            : "Formulario Oficial — Abrir enlace externo"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isLocal && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleOpenViewer(res)}
                                        className="bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 text-xs h-8 px-2.5"
                                      >
                                        <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                                      </Button>
                                    )}
                                    <a
                                      href={downloadHref}
                                      download={isLocal ? res.url.split("/").pop() : undefined}
                                      target={isLocal ? undefined : "_blank"}
                                      rel={isLocal ? undefined : "noreferrer"}
                                    >
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-8 px-2.5"
                                      >
                                        {isLocal ? (
                                          <>
                                            <Download className="w-3.5 h-3.5 mr-1" /> Descargar
                                          </>
                                        ) : (
                                          <>
                                            <ExternalLink className="w-3.5 h-3.5 mr-1" /> Abrir
                                          </>
                                        )}
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

      {/* Modal Visor de Recursos (Código & PDF) */}
      <Dialog open={!!viewerResource} onOpenChange={(open) => !open && setViewerResource(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] bg-slate-950 border-slate-800 text-white p-0 overflow-hidden flex flex-col shadow-2xl">
          {viewerResource && (
            <>
              {/* Header Modal Visor */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {viewerResource.url.endsWith(".pdf") || viewerResource.type === "pdf" ? (
                    <Badge className="bg-amber-950 text-amber-300 border-amber-800 shrink-0">PDF</Badge>
                  ) : viewerResource.url.endsWith(".md") || viewerResource.type === "markdown" ? (
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 shrink-0">MARKDOWN</Badge>
                  ) : (
                    <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 shrink-0">CÓDIGO</Badge>
                  )}
                  <DialogTitle className="text-sm md:text-base font-bold text-white truncate">
                    {viewerResource.name}
                  </DialogTitle>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Action for Code / Markdown: Copy Code */}
                  {!viewerResource.url.endsWith(".pdf") && viewerResource.type !== "pdf" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleCopyCode}
                      disabled={viewerLoading || !viewerContent}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> {viewerResource.url.endsWith(".md") || viewerResource.type === "markdown" ? "Copiar Markdown" : "Copiar Código"}
                        </>
                      )}
                    </Button>
                  )}

                  {/* Direct Download Button */}
                  <a
                    href={`/api/vibecodelab/download?file=${encodeURIComponent(viewerResource.url)}`}
                    download={viewerResource.url.split("/").pop()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-700/80 text-emerald-300 hover:bg-emerald-950/50 text-xs h-8"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Descargar Completo
                    </Button>
                  </a>

                  {/* Open in new tab for PDF */}
                  {(viewerResource.url.endsWith(".pdf") || viewerResource.type === "pdf") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(viewerResource.url, "_blank")}
                      className="text-slate-400 hover:text-white text-xs h-8 px-2"
                    >
                      <Maximize2 className="w-3.5 h-3.5 mr-1" /> Nueva Pestaña
                    </Button>
                  )}
                </div>
              </div>

              {/* Modal Visor Body */}
              <div className="flex-1 overflow-auto p-4 min-h-[450px] max-h-[72vh] bg-slate-950">
                {viewerResource.url.endsWith(".pdf") || viewerResource.type === "pdf" ? (
                  <iframe
                    src={viewerResource.url}
                    className="w-full h-[65vh] rounded-xl border border-slate-800 bg-slate-900"
                    title={viewerResource.name}
                  />
                ) : viewerLoading ? (
                  <div className="flex flex-col items-center justify-center h-[320px] gap-3 text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
                    <p className="text-xs font-medium">Cargando código fuente del recurso...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span>{viewerResource.url}</span>
                      <span>{viewerContent ? `${viewerContent.split("\n").length} líneas` : ""}</span>
                    </div>
                    <pre className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text max-h-[60vh]">
                      <code>{viewerContent}</code>
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

              {/* Right Column: Class List Sidebar (1 Col) */}
              <div className="space-y-4">
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Programa de Lecciones</span>
                      <span className="text-xs text-indigo-400 font-normal">
                        {completedClasses}/{totalClasses} Vistas
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 px-3 pb-3">
                    {classes.map((cls, idx) => {
                      const isActive = activeClass?.id === cls.id
                      return (
                        <div
                          key={cls.id}
                          onClick={() => setActiveClass(cls)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isActive
                              ? "bg-indigo-950/60 border-indigo-600 shadow-md shadow-indigo-950"
                              : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleComplete(cls)
                                }}
                                className="mt-0.5 shrink-0"
                              >
                                {cls.completed ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <PlayCircle className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                                )}
                              </button>
                              <div>
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                                  {cls.order_index === 0 ? "CLASE 0" : `CLASE ${cls.order_index ?? (idx + 1)}`}
                                </span>
                                <h5 className={`text-xs font-semibold mt-0.5 ${isActive ? "text-white" : "text-slate-300"}`}>
                                  {cls.title}
                                </h5>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {cls.duration_minutes}m
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: AGENDA DE MENTORÍAS 1-A-1 */}
        <TabsContent value="mentorship" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot Picker & Booking Form */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">Agendar Sesión 1-a-1</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Selecciona una fecha y hora disponible con Javier Mujica
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">
                    Horarios Disponibles:
                  </label>
                  {slots.filter((s) => !s.is_booked).length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                      No hay horarios abiertos en este momento. Escríbenos directamente para habilitar un nuevo cupo.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {slots
                        .filter((s) => !s.is_booked)
                        .map((slot) => {
                          const isSel = selectedSlot?.id === slot.id
                          const formattedDate = new Date(slot.slot_date).toLocaleString("es-CL", {
                            timeZone: "America/Santiago",
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })

                          return (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                                isSel
                                  ? "bg-indigo-950 border-indigo-500 text-white shadow-md shadow-indigo-950"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span className="font-semibold block capitalize">{formattedDate}</span>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                Duración: {slot.duration_minutes || 45} mins
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                </div>

                {selectedSlot && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1 block">
                        Tema o Desafío Principal a Tratar:
                      </label>
                      <Textarea
                        placeholder="Ej: Revisión de código de mi MVP, dudas con Supabase RLS o estrategia de lanzamiento..."
                        value={mentorshipTopic}
                        onChange={(e) => setMentorshipTopic(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-20"
                      />
                    </div>

                    <Button
                      onClick={handleBookMentorship}
                      disabled={bookingLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                    >
                      {bookingLoading ? "Confirmando..." : "Confirmar Reserva de Mentoría"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Booked Sessions */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">Mis Sesiones Agendadas</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Histórico y próximas mentorías programadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {slots.filter((s) => s.booked_by_user_id === user.id).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-xl">
                    Aún no has reservado ninguna sesión 1-a-1.
                  </div>
                ) : (
                  slots
                    .filter((s) => s.booked_by_user_id === user.id)
                    .map((session) => {
                      const dateStr = new Date(session.slot_date).toLocaleString("es-CL", {
                        timeZone: "America/Santiago",
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })

                      const hoursRemaining = (new Date(session.slot_date).getTime() - Date.now()) / (1000 * 60 * 60)
                      const canModify = hoursRemaining >= 24

                      return (
                        <div
                          key={session.id}
                          className="p-4 rounded-xl bg-slate-950 border border-indigo-900/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]">
                              Confirmada
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-mono">
                              45 Minutos
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white capitalize">{dateStr}</h5>
                          {session.topic && (
                            <p className="text-xs text-slate-400 italic">"{session.topic}"</p>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900">
                            <a
                              href={session.meet_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                              <Video className="w-3.5 h-3.5" /> Entrar a Google Meet
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            {canModify ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReschedulingSession(session)
                                    setRescheduleNewSlot(null)
                                  }}
                                  className="h-7 text-[10px] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3 text-indigo-400" /> Reagendar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelMentorship(session.id, session.slot_date)}
                                  disabled={cancelLoading}
                                  className="h-7 text-[10px] border-rose-900/60 text-rose-400 hover:bg-rose-950 hover:text-rose-300 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-400" /> Cancelar
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Sin cambios (&lt;24h)
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modal Reagendar Mentoría */}
          <Dialog open={!!reschedulingSession} onOpenChange={(open) => !open && setReschedulingSession(null)}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2 text-white">
                  <RefreshCw className="w-4 h-4 text-indigo-400" /> Reagendar Sesión de Mentoría
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-400">
                  Selecciona una nueva fecha y hora disponible. La sesión actual se liberará automáticamente.
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <label className="text-xs font-semibold text-slate-300 block">Horarios Disponibles:</label>
                  {slots.filter((s) => !s.is_booked && s.id !== reschedulingSession?.id).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-lg">
                      No hay otros horarios libres disponibles en este momento.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {slots
                        .filter((s) => !s.is_booked && s.id !== reschedulingSession?.id)
                        .map((slot) => {
                          const isSel = rescheduleNewSlot?.id === slot.id
                          const formattedDate = new Date(slot.slot_date).toLocaleString("es-CL", {
                            timeZone: "America/Santiago",
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setRescheduleNewSlot(slot)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                                isSel
                                  ? "bg-indigo-950 border-indigo-500 text-white font-semibold"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span className="capitalize">{formattedDate}</span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReschedulingSession(null)}
                    className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRescheduleMentorship}
                    disabled={!rescheduleNewSlot || rescheduleLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                  >
                    {rescheduleLoading ? "Guardando..." : "Confirmar Cambio de Fecha"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 3: CANAL PITCH & MATCH */}
        <TabsContent value="pitch" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Canal Pitch & Match</h2>
              <p className="text-xs text-slate-400">
                Presenta tus ideas, busca co-founders y colabora con compañeros de la comunidad Vibecode Lab.
              </p>
            </div>

            <Dialog open={newPitchOpen} onOpenChange={setNewPitchOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Publicar en Pitch & Match
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-white">
                    Nueva Publicación en Pitch & Match
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreatePitch} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Título de la Publicación *</label>
                    <Input
                      placeholder="Ej: Busco Co-Founder Técnico para App de Salud con IA"
                      value={pitchForm.title}
                      onChange={(e) => setPitchForm({ ...pitchForm, title: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Categoría</label>
                      <select
                        value={pitchForm.category}
                        onChange={(e) => setPitchForm({ ...pitchForm, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-white"
                      >
                        <option value="idea">💡 Idea de Proyecto</option>
                        <option value="mvp">🚀 MVP Construido</option>
                        <option value="seeking_cofounder">🤝 Busco Socio/Co-Founder</option>
                        <option value="showcase">✨ Showcase / Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 mb-1 block">Buscando (Optional)</label>
                      <Input
                        placeholder="Ej: Desarrollador Backend, Marketer..."
                        value={pitchForm.looking_for}
                        onChange={(e) => setPitchForm({ ...pitchForm, looking_for: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Descripción Detallada *</label>
                    <Textarea
                      placeholder="Explica de qué trata tu proyecto, qué problema resuelve y qué buscas..."
                      value={pitchForm.description}
                      onChange={(e) => setPitchForm({ ...pitchForm, description: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-24"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Tech Stack (separado por comas)</label>
                    <Input
                      placeholder="Next.js, Supabase, Tailwind, Python..."
                      value={pitchForm.tech_stack}
                      onChange={(e) => setPitchForm({ ...pitchForm, tech_stack: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 mb-1 block">Datos de Contacto Directo *</label>
                    <Input
                      placeholder="Email, WhatsApp o perfil de LinkedIn"
                      value={pitchForm.contact_info}
                      onChange={(e) => setPitchForm({ ...pitchForm, contact_info: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white text-xs"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={pitchLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs mt-2"
                  >
                    {pitchLoading ? "Publicando..." : "Publicar Proyecto"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Todas" },
              { id: "idea", label: "💡 Ideas" },
              { id: "mvp", label: "🚀 MVPs" },
              { id: "seeking_cofounder", label: "🤝 Busco Socio" },
              { id: "showcase", label: "✨ Showcase" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setPitchCategory(cat.id)
                  loadPitchPosts(cat.id)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pitchCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pitchPosts.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
                No hay publicaciones en esta categoría. ¡Sé el primero en publicar!
              </div>
            ) : (
              pitchPosts.map((post) => (
                <Card
                  key={post.id}
                  className={`bg-slate-900 border-slate-800 flex flex-col justify-between transition-all ${
                    post.is_pinned ? "border-indigo-700/60 bg-gradient-to-b from-indigo-950/20 to-slate-900" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px]">
                        {post.category === "seeking_cofounder"
                          ? "🤝 Busco Socio"
                          : post.category === "mvp"
                          ? "🚀 MVP"
                          : post.category === "showcase"
                          ? "✨ Showcase"
                          : "💡 Idea"}
                      </Badge>

                      {post.is_pinned && (
                        <Badge variant="outline" className="border-amber-600/50 text-amber-400 text-[10px]">
                          📌 Destacado
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-white">{post.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <span>Por <strong>{post.author_name}</strong> ({post.author_role || "Alumno"})</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3 text-xs text-slate-300">
                    <p className="line-clamp-4">{post.description}</p>

                    {post.looking_for && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-medium">
                        🔍 <strong>Busca:</strong> {post.looking_for}
                      </div>
                    )}

                    {post.tech_stack && post.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.tech_stack.map((tech: string, i: number) => (
                          <span
                            key={i}
                            className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLikePitch(post.id)}
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs px-2"
                    >
                      <Heart className="w-3.5 h-3.5 mr-1 text-rose-500 fill-rose-500/20" />
                      {post.likes_count || 0} Me interesa
                    </Button>

                    <a
                      href={`mailto:${post.contact_info}`}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Contactar
                    </a>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB 4: PREMIO DE GRADUACIÓN ALUMNI PRO */}
        <TabsContent value="reward" className="mt-6">
          <AlumniRewardVault
            user={user}
            classes={classes}
            completionPercentage={completionPercentage}
            completedClasses={completedClasses}
            totalClasses={totalClasses}
            onSelectClass={(cls) => {
              setActiveClass(cls)
              setActiveTab("classes")
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
