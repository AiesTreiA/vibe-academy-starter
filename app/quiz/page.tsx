"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Rocket,
  Flame,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  BarChart3,
  SendHorizontal,
  ExternalLink,
  Globe,
  Award,
  MessageSquare,
  ShieldCheck,
  Check,
  Star,
  Layers,
  Zap,
  Download,
  BookOpen,
  QrCode,
} from "lucide-react"
import {
  UNICORN_BIBLE_VOLUMES,
  isValidVolume,
  type QuizReadinessEvaluation,
} from "@/lib/unicorn-bible-config"

// Squad suggestions for quick selection or typing (Cohort 1)
const SQUAD_PRESETS = [
  "Squad 1: SaaS de Contabilidad",
  "Squad 2: Noticiero Semanal de IA para C-Level",
]

// Squad suggestions when entering from E-Book QR (`?source=ebook`)
const EBOOK_SQUAD_PRESETS = [
  "Squad Independiente · Lector Código & Capital",
  "Startup en Bootstrapping / Pre-Seed",
  "Postulante CORFO Semilla / Start-Up Chile",
  "Squad B2B SaaS & Agentes IA",
]

// Obstacles for Question 1
const OBSTACLE_OPTIONS = [
  {
    id: "acuerdo_tarjeta",
    label: "Falta de acuerdo interno sobre quién ponía la tarjeta o cómo repartir el gasto.",
    icon: Flame,
  },
  {
    id: "friccion_tecnica",
    label: "Fricción técnica / configuración de cuentas (Meta Business Manager, Google Ads, píxeles).",
    icon: Zap,
  },
  {
    id: "mvp_no_listo",
    label: "Sentíamos que el MVP aún no estaba lo suficientemente 'listo' o perfecto para mostrarlo.",
    icon: Target,
  },
  {
    id: "dudas_promesa",
    label: "Dudas o falta de claridad sobre qué promesa/anuncio comunicar.",
    icon: HelpCircle,
  },
  {
    id: "falta_tiempo",
    label: "Falta de tiempo o sobrecarga de tareas al final de la cohorte.",
    icon: Layers,
  },
  {
    id: "otro",
    label: "Otro freno u obstáculo específico.",
    icon: MessageSquare,
  },
]

export default function QuizCierrePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isEbookMode, setIsEbookMode] = useState(false)
  const [selectedVol, setSelectedVol] = useState<1 | 2 | 3 | 4>(1)
  const [utmCampaign, setUtmCampaign] = useState("unicorn_bible")
  const [readinessResult, setReadinessResult] = useState<QuizReadinessEvaluation | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    // Paso 1
    name: "",
    email: "",
    squad_name: "",
    project_name: "",
    mvp_url: "",

    // Paso 2
    obstacles: [] as string[],
    obstacle_other: "",
    campaign_pitch: "",

    // Paso 3
    superpower_testimonial: "",
    aha_moment: "",
    testimonial_authorized: true,

    // Paso 4
    improvement_feedback: "",
    nps_rating: 10,
    final_thoughts: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [certificateId, setCertificateId] = useState<string | null>(null)
  const [diplomaUrl, setDiplomaUrl] = useState<string | null>(null)

  const topCardRef = useRef<HTMLDivElement>(null)

  // Detect URL parameters (?source=ebook&vol=1..4&utm_campaign=unicorn_bible)
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const src = params.get("source") || params.get("mode")
    const volParam = params.get("vol")
    const utm = params.get("utm_campaign")

    if (src === "ebook" || isValidVolume(volParam)) {
      setIsEbookMode(true)
      if (isValidVolume(volParam)) {
        setSelectedVol(Number(volParam) as 1 | 2 | 3 | 4)
      }
      if (utm) {
        setUtmCampaign(utm)
      }
    }
  }, [])

  const scrollToTopCard = () => {
    topCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Toggle obstacle checkbox
  const handleToggleObstacle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.obstacles.includes(id)
      const next = exists ? prev.obstacles.filter((item) => item !== id) : [...prev.obstacles, id]
      return { ...prev, obstacles: next }
    })
  }

  // Validate current step
  const validateStep = (stepNumber: number): boolean => {
    setErrorMessage(null)

    if (stepNumber === 1) {
      if (!formData.name.trim()) {
        setErrorMessage("Por favor ingresa tu Nombre Completo.")
        return false
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setErrorMessage("Por favor ingresa un Correo Electrónico válido.")
        return false
      }
      if (!formData.squad_name.trim()) {
        setErrorMessage("Por favor indica el Nombre de tu Squad.")
        return false
      }
      if (!formData.project_name.trim()) {
        setErrorMessage("Por favor indica el Nombre de tu Proyecto / MVP.")
        return false
      }
      if (!formData.mvp_url.trim()) {
        setErrorMessage("Por favor ingresa el Enlace público a tu MVP desplegado.")
        return false
      }
      const urlPattern = /^(https?:\/\/)?([\w.-]+)+(:[0-9]+)?(\/.*)?$/i
      if (!urlPattern.test(formData.mvp_url.trim())) {
        setErrorMessage("Por favor ingresa un formato de URL válido (ej: https://tu-mvp.vercel.app).")
        return false
      }
    }

    if (stepNumber === 2) {
      if (formData.obstacles.length === 0) {
        setErrorMessage("Por favor selecciona al menos un obstáculo o freno en la Pregunta 1.")
        return false
      }
      if (formData.obstacles.includes("otro") && !formData.obstacle_other.trim()) {
        setErrorMessage("Por favor especifica cuál fue ese otro obstáculo en el campo de texto.")
        return false
      }
      if (!formData.campaign_pitch.trim()) {
        setErrorMessage("Por favor responde a la Pregunta 2 con tu titular/gancho y métrica de éxito.")
        return false
      }
    }

    if (stepNumber === 3) {
      if (!formData.superpower_testimonial.trim()) {
        setErrorMessage("Por favor responde a la Pregunta 3 sobre el superpoder o cambio de mentalidad.")
        return false
      }
    }

    if (stepNumber === 4) {
      if (!formData.improvement_feedback.trim()) {
        setErrorMessage("Por favor completa la Pregunta 5 con tu sugerencia de mejora para la cohorte.")
        return false
      }
    }

    return true
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrorMessage(null)
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      scrollToTopCard()
    }
  }

  const handlePrevStep = () => {
    setErrorMessage(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    scrollToTopCard()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all steps
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s)
        scrollToTopCard()
        return
      }
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    // Ensure URL has protocol
    let formattedMvpUrl = formData.mvp_url.trim()
    if (!formattedMvpUrl.startsWith("http://") && !formattedMvpUrl.startsWith("https://")) {
      formattedMvpUrl = `https://${formattedMvpUrl}`
    }

    try {
      const payload = {
        ...formData,
        mvp_url: formattedMvpUrl,
        source: isEbookMode ? "ebook" : "student",
        vol: isEbookMode ? selectedVol : null,
        utm_campaign: utmCampaign,
        obstacles: formData.obstacles.map((id) => {
          if (id === "otro") return `otro: ${formData.obstacle_other.trim()}`
          const found = OBSTACLE_OPTIONS.find((o) => o.id === id)
          return found ? found.label : id
        }),
      }

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al registrar el quiz de cierre.")
      }

      if (data.certificate_id) {
        setCertificateId(data.certificate_id)
      }
      if (data.diploma_url) {
        setDiplomaUrl(data.diploma_url)
      }
      if (data.readiness) {
        setReadinessResult(data.readiness)
      }

      setIsSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || "Ocurrió un error inesperado al enviar. Por favor reintenta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate percentage of progress
  const progressPercentage = Math.round((currentStep / 4) * 100)
  const activeVolMeta = UNICORN_BIBLE_VOLUMES[selectedVol]
  const activeSquadPresets = isEbookMode ? EBOOK_SQUAD_PRESETS : SQUAD_PRESETS

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-purple-600 selection:text-white font-sans antialiased">
      {/* Background ambient lighting - dark/tech theme matching /encuesta */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[15%] w-[650px] h-[650px] bg-purple-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] right-[-5%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090e]/85 border-b border-white/[0.08] transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={isEbookMode ? "/unicorn-bible" : "/vibecode"} className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:bg-purple-400/35 transition-all" />
              <Image
                src="/images/vibecode-logo-icon.png"
                alt="Vibecode Lab Gaussian 3D"
                width={36}
                height={36}
                className="relative z-10 w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5 leading-none">
                VIBECODE <span className="text-purple-400">LAB</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-1 tracking-tight font-medium">
                {isEbookMode ? `Unicorn Squad Bible · Tomo ${selectedVol}` : "Cierre Generación 1"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                isEbookMode
                  ? `${activeVolMeta.badgeBgClass} ${activeVolMeta.badgeTextClass} ${activeVolMeta.badgeBorderClass}`
                  : "bg-purple-500/10 text-purple-300 border-purple-500/20"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {isEbookMode ? `Modo Lector · Tomo ${selectedVol}` : "Quiz Final de Cierre"}
            </span>
            <Link
              href={isEbookMode ? "/unicorn-bible" : "/vibecodelab"}
              className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              {isEbookMode ? "Ver los 4 Tomos" : "Plataforma"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        {/* CONTEXTUAL E-BOOK QR BANNER WHEN ENTERING FROM BOOK QR */}
        {isEbookMode && !isSuccess && (
          <div
            className={`mb-8 p-5 sm:p-6 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${activeVolMeta.badgeBgClass} ${activeVolMeta.badgeBorderClass}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <QrCode className={`w-5 h-5 ${activeVolMeta.badgeTextClass}`} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider font-bold ${activeVolMeta.badgeTextClass}`}
                    >
                      QR DETECTADO · CÓDIGO &amp; CAPITAL
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/70 text-slate-300 border border-white/10">
                      Credencial a emitir: SQR-2026-XXX
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white mt-1">
                    {activeVolMeta.quizBannerTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {activeVolMeta.quizBannerSubtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Volume Switcher for Reader */}
            <div className="pt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Tomo desde el que escaneaste:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {([1, 2, 3, 4] as const).map((v) => {
                  const meta = UNICORN_BIBLE_VOLUMES[v]
                  const active = selectedVol === v
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVol(v)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs border transition-all ${
                        active
                          ? "bg-white text-slate-950 border-white shadow-sm"
                          : "bg-slate-950/60 text-slate-300 border-white/10 hover:bg-slate-900"
                      }`}
                    >
                      Tomo {v}: {meta.shortTitle}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="my-10 p-8 sm:p-12 rounded-3xl bg-[#0c101c]/90 border border-purple-500/30 shadow-2xl shadow-purple-500/10 backdrop-blur-xl text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-full h-full p-2.5 rounded-2xl bg-white/[0.04] border border-purple-500/30 flex items-center justify-center backdrop-blur-md">
                <Image
                  src="/images/vibecode-logo-icon.png"
                  alt="Vibecode Lab Gaussian 3D"
                  width={90}
                  height={90}
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center border-2 border-[#0c101c] shadow-lg">
                <CheckCircle2 className="w-5 h-5 font-bold" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-4">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              {isEbookMode
                ? `Squad Readiness Acreditado · Tomo ${selectedVol}`
                : "Cohorte 1 Completada · Artefacto Registrado"}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              ¡Misión cumplida, {formData.name.split(" ")[0]}!
            </h1>

            <p className="text-slate-300 max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
              {isEbookMode
                ? "Tu diagnóstico práctico de Código & Capital, tu hipótesis de pauta ($10 USD / 48h) y el enlace a tu MVP han quedado registrados con tu credencial verificable SQR-2026."
                : "Tu Quiz de Cierre y la entrega de tu MVP han quedado formalmente registrados en el sistema de Vibecode Lab."}
            </p>

            {/* Recibo del Artefacto */}
            <div className="max-w-lg mx-auto p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left text-sm space-y-3 mb-6">
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Participante:</span>
                <span className="font-semibold text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Squad:</span>
                <span className="font-semibold text-purple-400">{formData.squad_name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Proyecto / MVP:</span>
                <span className="font-semibold text-cyan-300">{formData.project_name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">URL del MVP:</span>
                <a
                  href={formData.mvp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 truncate max-w-[200px]"
                >
                  <span className="truncate">{formData.mvp_url.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Modalidad:</span>
                <span className="font-semibold text-cyan-300 text-xs sm:text-sm">
                  {isEbookMode
                    ? `Squad Readiness · Biblia Código & Capital (Tomo ${selectedVol})`
                    : "35 Horas Cronológicas (2,5h clases + 2,5h squads/sem)"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Certificado ID:</span>
                <span className="font-mono text-xs text-purple-300 font-semibold">
                  {certificateId || (isEbookMode ? "SQR-2026-OFICIAL" : "VBC-2026-OFICIAL")}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Estado de Acreditación:</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {isEbookMode ? "Squad Readiness Activo (SQR)" : "Graduado de Primera Generación (VBC)"}
                </span>
              </div>
            </div>

            {/* Unicorn & Investment Readiness Score Breakdown */}
            {readinessResult && (
              <div className="max-w-lg mx-auto p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/25 text-left mb-8 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block">
                      UNICORN &amp; INVESTMENT READINESS SCORE
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Nivel: <span className="text-emerald-400">{readinessResult.level}</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono">
                      {readinessResult.totalScore}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>1. Infraestructura (Tomo 1)</span>
                      <span className="font-mono font-bold text-blue-400">
                        {readinessResult.dimensions.infraestructura}/25
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(readinessResult.dimensions.infraestructura / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>2. Power Pitch (Tomo 2)</span>
                      <span className="font-mono font-bold text-rose-400">
                        {readinessResult.dimensions.pitch}/25
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${(readinessResult.dimensions.pitch / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>3. Unit Economics (Tomo 3)</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {readinessResult.dimensions.metricas}/25
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(readinessResult.dimensions.metricas / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>4. Capital &amp; Cap Table (Tomo 4)</span>
                      <span className="font-mono font-bold text-amber-400">
                        {readinessResult.dimensions.capital}/25
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(readinessResult.dimensions.capital / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 justify-center items-center">
              {/* Botón Descargar Certificado de Participación */}
              <a
                href={
                  diplomaUrl ||
                  `/api/quiz/diploma?name=${encodeURIComponent(formData.name)}&id=${certificateId || "VBC-2026-001"}&download=true`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-extrabold bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 transition-all shadow-xl shadow-purple-500/25 active:scale-95 text-sm sm:text-base group"
              >
                <Download className="w-5 h-5 text-slate-950 group-hover:translate-y-0.5 transition-transform" />
                <span>Descargar Certificado Oficial (PDF)</span>
              </a>

              {certificateId && (
                <Link
                  href={`/verify/${certificateId}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 transition-all text-sm active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ver Portal de Verificación ({certificateId})</span>
                </Link>
              )}

              <a
                href={formData.mvp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 transition-all text-sm active:scale-95"
              >
                <Globe className="w-4 h-4" />
                <span>Ver MVP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href={isEbookMode ? "/unicorn-bible" : "/vibecodelab"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all text-sm"
              >
                <span>{isEbookMode ? "Volver a Unicorn Bible" : "Plataforma"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Aviso de correo enviado automáticamente */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] max-w-lg mx-auto flex items-center justify-center gap-2.5 text-xs text-slate-300 text-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span>
                Enviamos automáticamente una copia oficial de tu certificado a{" "}
                <strong className="text-white">{formData.email}</strong>.
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="text-center pt-2 pb-8">
              <div className="flex flex-col items-center justify-center mb-5">
                <div className="relative group cursor-pointer mb-4">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 p-3.5 rounded-2xl bg-[#0b0f19]/90 border border-white/[0.12] shadow-2xl flex items-center justify-center backdrop-blur-xl">
                    <Image
                      src="/images/vibecode-logo-icon.png"
                      alt="Vibecode Lab Gaussian 3D"
                      width={80}
                      height={80}
                      className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] transform group-hover:scale-110 transition-all duration-300"
                      priority
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {isEbookMode
                    ? `Vibecode Lab · Herramienta Oficial de Validación y Pauta (Tomo ${selectedVol})`
                    : "Vibecode Lab · Primera Generación"}
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] mb-5">
                {isEbookMode ? "Diagnóstico de Tracción:" : "Cierre de Cohorte:"} <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  El Quiz de la Verdad.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                El código compila en local, pero la verdad compila afuera. Haz tu balance con honestidad, registra tu artefacto, diseña tu experimento de pauta publicitaria y emite tu acreditación verificable.
              </p>
            </section>

            {/* WIZARD CARD CONTAINER */}
            <div ref={topCardRef} className="pt-2 scroll-mt-24">
              <div className="rounded-3xl bg-[#0d1220]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl p-5 sm:p-10 relative">
                
                {/* STEPPER NAVIGATION BAR & PROGRESS */}
                <div className="mb-8 pb-6 border-b border-white/[0.08]">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-3">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Paso {currentStep} de 4 · {
                        currentStep === 1
                          ? "Identificación y Artefacto"
                          : currentStep === 2
                          ? "Confrontación y Diagnóstico"
                          : currentStep === 3
                          ? "Testimonio y Transformación"
                          : "Feedback de Cierre"
                      }
                    </span>
                    <span className="font-bold text-cyan-400">{progressPercentage}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-6">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full shadow-sm shadow-cyan-400/30"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Step Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { num: 1, label: "1. Identificación", desc: "Artefacto & MVP" },
                      { num: 2, label: "2. Validación", desc: "Frenos & Hipótesis" },
                      { num: 3, label: "3. Testimonio", desc: "Transformación" },
                      { num: 4, label: "4. Feedback", desc: "Cierre & Mejora" },
                    ].map((step) => {
                      const isActive = currentStep === step.num
                      const isCompleted = currentStep > step.num
                      return (
                        <button
                          key={step.num}
                          type="button"
                          onClick={() => {
                            // Allow stepping backward anytime, or validate to step forward
                            if (step.num < currentStep) {
                              setCurrentStep(step.num)
                              scrollToTopCard()
                            } else if (step.num === currentStep + 1 && validateStep(currentStep)) {
                              setCurrentStep(step.num)
                              scrollToTopCard()
                            }
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all text-xs ${
                            isActive
                              ? "bg-purple-600/20 border-purple-500 ring-1 ring-purple-500/50"
                              : isCompleted
                              ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
                              : "bg-white/[0.02] border-white/[0.06] opacity-60 hover:opacity-80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`font-bold ${isActive ? "text-purple-300" : isCompleted ? "text-emerald-400" : "text-slate-400"}`}>
                              {step.label}
                            </span>
                            {isCompleted && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 hidden sm:block">
                            {step.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* FORM CONTENT */}
                <form onSubmit={handleSubmit}>
                  {/* ============================================================ */}
                  {/* PASO 1: IDENTIFICACIÓN Y ARTEFACTO */}
                  {/* ============================================================ */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300 slide-in-from-right-4">
                      <div className="border-l-4 border-purple-500 pl-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          Paso 1 de 4
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                          Identificación y Artefacto
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Consolida tus datos de creador y el link oficial de tu proyecto desplegado en producción (o entorno de staging navegable).
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Nombre Completo */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Nombre Completo *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Camilo Henríquez"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 transition-all text-sm"
                          />
                        </div>

                        {/* Correo Electrónico */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Correo Electrónico *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="camilo@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Nombre del Squad */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Nombre del Squad *
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {isEbookMode
                              ? "Selecciona tu perfil de Squad o escribe el nombre de tu equipo"
                              : "Selecciona tu squad de la Cohorte 1"}
                          </span>
                        </div>

                        {/* Quick preset cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                          {activeSquadPresets.map((sq) => {
                            const isSelected = formData.squad_name === sq
                            return (
                              <button
                                key={sq}
                                type="button"
                                onClick={() => setFormData({ ...formData, squad_name: sq })}
                                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 text-xs sm:text-sm font-semibold ${
                                  isSelected
                                    ? "bg-purple-600/20 border-purple-400 text-white shadow-md shadow-purple-500/15 ring-1 ring-purple-400/50"
                                    : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                <span>{sq}</span>
                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
                                )}
                              </button>
                            )
                          })}
                        </div>

                        <input
                          type="text"
                          required
                          placeholder={
                            isEbookMode
                              ? "Ej: Squad FinTech LatAm / Startup en Pre-Seed"
                              : "Ej: Squad 1: SaaS de Contabilidad"
                          }
                          value={formData.squad_name}
                          onChange={(e) => setFormData({ ...formData, squad_name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 transition-all text-xs sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nombre del Proyecto / MVP */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Nombre del Proyecto / MVP *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: FlowAudit AI"
                            value={formData.project_name}
                            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-white placeholder-slate-500 transition-all text-sm"
                          />
                        </div>

                        {/* Enlace al MVP desplegado */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Enlace al MVP desplegado (URL pública) *
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              required
                              placeholder="https://tu-mvp.vercel.app"
                              value={formData.mvp_url}
                              onChange={(e) => setFormData({ ...formData, mvp_url: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-500 transition-all text-sm"
                            />
                            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            Ej: Vercel, Lovable, dominio propio, etc. Debe ser navegable en vivo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* PASO 2: CONFRONTACIÓN Y DIAGNÓSTICO DE VALIDACIÓN REAL */}
                  {/* ============================================================ */}
                  {currentStep === 2 && (
                    <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-right-4">
                      <div className="border-l-4 border-cyan-400 pl-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                          Paso 2 de 4
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                          Confrontación y Diagnóstico de Validación Real
                        </h2>
                        <div className="p-3.5 mt-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-xs sm:text-sm leading-relaxed">
                          &ldquo;En Vibecode Lab aprendimos que el código compila en local, pero la verdad compila afuera. Reflexionemos con honestidad sobre el salto al mercado.&rdquo;
                        </div>
                      </div>

                      {/* PREGUNTA 1: CHECKBOXES OBSTÁCULOS */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              ¿Cuál fue el principal obstáculo o freno dentro del squad para no encender pauta publicitaria durante el programa? *
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Selecciona todas las opciones que reflejen la realidad de tu squad.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 pt-2">
                          {OBSTACLE_OPTIONS.map((item) => {
                            const isChecked = formData.obstacles.includes(item.id)
                            const Icon = item.icon
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleToggleObstacle(item.id)}
                                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                                  isChecked
                                    ? "bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40"
                                    : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                    isChecked
                                      ? "bg-cyan-400 border-cyan-400 text-slate-950"
                                      : "border-white/20 bg-white/5"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <div className="flex-1">
                                  <span className={`text-sm ${isChecked ? "text-white font-medium" : "text-slate-300"}`}>
                                    {item.label}
                                  </span>
                                </div>
                                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isChecked ? "text-cyan-400" : "text-slate-500"}`} />
                              </div>
                            )
                          })}
                        </div>

                        {/* Campo condicional para 'Otro' */}
                        {formData.obstacles.includes("otro") && (
                          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 animate-in fade-in duration-200">
                            <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
                              Especifica cuál fue ese obstáculo o freno *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Describe en una frase la situación interna..."
                              value={formData.obstacle_other}
                              onChange={(e) => setFormData({ ...formData, obstacle_other: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* PREGUNTA 2: $10 USD CAMPAÑA HIPÓTESIS */}
                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              Si mañana te dieran $10 USD para correr tu primera campaña y validar tu MVP en 48 horas: ¿cuál sería el titular o gancho exacto de tu anuncio y qué métrica considerarías un éxito rotundo? *
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Define tu promesa irresistible y el dato duro que probaría interés real (ej: 5 registros calificados, 3 reservas o $2 USD/lead).
                            </p>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          required
                          placeholder="Ej: Titular: 'Ahorra 10 horas semanales en presupuestos de obra con IA'. Métrica de éxito: Al menos 5 registros de ingenieros o un CPL menor a $1.8 USD en 48 horas..."
                          value={formData.campaign_pitch}
                          onChange={(e) => setFormData({ ...formData, campaign_pitch: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 transition-all text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* PASO 3: TESTIMONIO Y TRANSFORMACIÓN PERSONAL */}
                  {/* ============================================================ */}
                  {currentStep === 3 && (
                    <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-right-4">
                      <div className="border-l-4 border-purple-400 pl-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          Paso 3 de 4
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                          Testimonio y Transformación Personal
                        </h2>
                        <div className="p-3.5 mt-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-purple-200 text-xs sm:text-sm leading-relaxed">
                          &ldquo;Tu experiencia inspira a los siguientes creadores de la comunidad.&rdquo;
                        </div>
                      </div>

                      {/* PREGUNTA 3: SUPERPODER / CAMBIO DE MENTALIDAD */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              Si tuvieras que explicarle a un colega o amigo qué superpoder o cambio de mentalidad te dio Vibecode Lab, ¿qué le dirías con total sinceridad? *
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Piensa en la diferencia entre el día que entraste y hoy que tienes un artefacto desplegado.
                            </p>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          required
                          placeholder="Ej: Vibecode Lab me quitó el síndrome del impostor técnico. Me demostró que con Antigravity y un enfoque iterativo puedo pasar de una idea a un software funcional con pagos y base de datos en cuestión de días..."
                          value={formData.superpower_testimonial}
                          onChange={(e) => setFormData({ ...formData, superpower_testimonial: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-slate-500 transition-all text-sm leading-relaxed"
                        />
                      </div>

                      {/* PREGUNTA 4: MOMENTO AJÁ (OPCIONAL PERO DESTACADO) */}
                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                            4
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-white">
                                ¿Cuál fue el momento &lsquo;ajá&rsquo; o la herramienta/concepto que más te voló la cabeza durante las sesiones en vivo?
                              </h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                                Opcional
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Aquella clase, prompt maestro, arquitectura o tip de Javier que encendió la ampolleta.
                            </p>
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Ej: Cuando conectamos Mercado Pago con Webhooks seguros server-to-server en menos de 20 minutos, entendí que ya no hay excusas para no monetizar..."
                          value={formData.aha_moment}
                          onChange={(e) => setFormData({ ...formData, aha_moment: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 text-white placeholder-slate-500 transition-all text-sm leading-relaxed"
                        />
                      </div>

                      {/* AUTORIZACIÓN DE TESTIMONIO */}
                      <div className="pt-2">
                        <div
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              testimonial_authorized: !prev.testimonial_authorized,
                            }))
                          }
                          className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                            formData.testimonial_authorized
                              ? "bg-purple-900/15 border-purple-500/50 ring-1 ring-purple-500/30"
                              : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              formData.testimonial_authorized
                                ? "bg-gradient-to-br from-purple-500 to-indigo-500 border-purple-400 text-white shadow-md shadow-purple-500/30"
                                : "border-white/20 bg-white/5"
                            }`}
                          >
                            {formData.testimonial_authorized && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white block">
                              Autorizo a Vibecode Lab a compartir mis palabras, nombre y proyecto como testimonio público en la web y redes sociales.
                            </span>
                            <span className="text-xs text-slate-400 mt-1 block leading-relaxed">
                              Ayúdanos a mostrar al ecosistema tech que se pueden lanzar productos reales usando IA sin burocracia.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* PASO 4: FEEDBACK DE CIERRE Y MEJORA CONTINUA */}
                  {/* ============================================================ */}
                  {currentStep === 4 && (
                    <div className="space-y-8 animate-in fade-in duration-300 slide-in-from-right-4">
                      <div className="border-l-4 border-emerald-400 pl-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Paso 4 de 4
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                          Feedback de Cierre y Mejora Continua
                        </h2>
                        <div className="p-3.5 mt-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 text-xs sm:text-sm leading-relaxed">
                          &ldquo;Queremos que la experiencia de las próximas generaciones sea aún más brutal. Tu crítica constructiva y sugerencias honestas son nuestro combustible.&rdquo;
                        </div>
                      </div>

                      {/* PREGUNTA 5: SUGERENCIAS DE MEJORA */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">
                            5
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              ¿Qué aspectos específicos del programa (metodología de clases en vivo, soporte técnico, contenido o mentorías) mejorarías o cambiarías para la próxima cohorte? *
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Sé 100% transparente. ¿Qué faltó? ¿Qué sobró? ¿Qué habría acelerado aún más tu resultado?
                            </p>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          required
                          placeholder="Ej: Me habría gustado tener 1 hora extra de office hours antes de la entrega, o profundizar más en la pauta de Meta Ads desde la clase 3..."
                          value={formData.improvement_feedback}
                          onChange={(e) => setFormData({ ...formData, improvement_feedback: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 text-white placeholder-slate-500 transition-all text-sm leading-relaxed"
                        />
                      </div>

                      {/* NPS RATING INTERACTIVO (1 AL 10) */}
                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              ¿Qué tan probable es que recomiendes Vibecode Lab a un colega desarrollador o emprendedor?
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Escala de 1 (Nada probable) a 10 (Totalmente recomendado)
                            </p>
                          </div>
                          <span className="text-xl font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                            {formData.nps_rating} / 10
                          </span>
                        </div>

                        <div className="grid grid-cols-10 gap-1.5 pt-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                            const isSelected = formData.nps_rating === num
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setFormData({ ...formData, nps_rating: num })}
                                className={`h-11 sm:h-12 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center border ${
                                  isSelected
                                    ? "bg-gradient-to-t from-purple-600 to-indigo-500 border-purple-400 text-white shadow-lg shadow-purple-500/30 scale-105 ring-2 ring-purple-400/50"
                                    : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                                }`}
                              >
                                {num}
                              </button>
                            )
                          })}
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 px-1 pt-1 font-medium">
                          <span>1: Nada probable</span>
                          <span>10: Lo recomiendo a ojos cerrados 🔥</span>
                        </div>
                      </div>

                      {/* MENSAJE LIBRE / DEDICATORIA FINAL */}
                      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-white">
                                Mensaje final para Javier Mujica y el equipo de Vibecode Lab
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                                Opcional
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Un saludo, dedicatoria o comentario de despedida para cerrar la cohorte.
                            </p>
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          placeholder="Unas palabras finales de cierre..."
                          value={formData.final_thoughts}
                          onChange={(e) => setFormData({ ...formData, final_thoughts: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-white placeholder-slate-500 transition-all text-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* ERROR ALERT */}
                  {errorMessage && (
                    <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-in fade-in duration-200">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* NAVIGATION CONTROLS / BUTTONS */}
                  <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                    {/* Botón Atrás */}
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 border border-white/10 transition-all text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Paso anterior
                      </button>
                    ) : (
                      <div className="hidden sm:block" />
                    )}

                    {/* Botón Siguiente o Enviar */}
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 hover:from-purple-400 hover:to-cyan-300 text-slate-950 transition-all shadow-xl shadow-purple-500/20 hover:shadow-cyan-400/30 active:scale-95"
                      >
                        <span>Siguiente paso</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>Guardando Quiz de Cierre...</span>
                          </>
                        ) : (
                          <>
                            <span>Enviar Quiz Final y Cerrar Cohorte</span>
                            <Rocket className="w-5 h-5 text-slate-950 fill-slate-950" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500 relative z-10 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/vibecode-logo-icon.png"
            alt="Vibecode Lab Gaussian 3D"
            width={18}
            height={18}
            className="w-4 h-4 object-contain opacity-80"
          />
          <span className="font-semibold text-slate-300">Vibecode Lab</span>
          <span>·</span>
          <span>Cierre Primera Generación</span>
          <span>·</span>
          <span>Javier Mujica</span>
        </div>
      </footer>
    </div>
  )
}
