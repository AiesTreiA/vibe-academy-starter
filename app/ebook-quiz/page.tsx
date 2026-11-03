"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  UNICORN_BIBLE_VOLUMES,
  EBOOK_EXAM_QUESTIONS,
  evaluateEbookExam,
  isValidVolume,
  type EbookExamEvaluation,
} from "@/lib/unicorn-bible-config"
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Rocket,
  Download,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Users,
  Code2,
  TrendingUp,
} from "lucide-react"

type ExamMode = "vol-1" | "vol-2" | "vol-3" | "vol-4" | "all"

function EbookQuizContent() {
  const searchParams = useSearchParams()
  const volParam = searchParams.get("vol")

  const [mode, setMode] = useState<ExamMode>("all")
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [projectName, setProjectName] = useState("")
  const [mvpUrl, setMvpUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [certResult, setCertResult] = useState<{
    certificateId: string
    verificationHash: string
    evaluation: EbookExamEvaluation
    diplomaUrl: string
    verifyUrl: string
  } | null>(null)

  useEffect(() => {
    if (isValidVolume(volParam)) {
      setMode(`vol-${Number(volParam)}` as ExamMode)
    }
  }, [volParam])

  const filteredQuestions =
    mode === "all"
      ? EBOOK_EXAM_QUESTIONS
      : EBOOK_EXAM_QUESTIONS.filter((q) => q.vol === Number(mode.replace("vol-", "")))

  const evaluation = evaluateEbookExam(answers, mode)
  const answeredCount = filteredQuestions.filter((q) => Boolean(answers[q.id])).length
  const allAnswered = answeredCount === filteredQuestions.length && filteredQuestions.length > 0

  const handleSelectOption = (questionId: string, optionId: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
    setErrorMsg(null)
  }

  const handleResetExam = () => {
    setAnswers({})
    setErrorMsg(null)
    setCertResult(null)
  }

  const handleSubmitCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!allAnswered) {
      setErrorMsg("Por favor responde todas las preguntas de la evaluación antes de emitir tu certificado.")
      return
    }

    if (!evaluation.passed) {
      setErrorMsg(
        `Tu puntaje actual es ${evaluation.scorePct}%. Revisa las cápsulas de refuerzo en las preguntas marcadas en rojo y corrígelas para alcanzar al menos 75%.`
      )
      return
    }

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Por favor ingresa tu nombre completo y tu correo electrónico.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/ebook-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          project_name: projectName.trim(),
          mvp_url: mvpUrl.trim(),
          mode,
          answers,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "No se pudo generar el certificado. Intenta nuevamente.")
      } else {
        setCertResult({
          certificateId: data.certificateId,
          verificationHash: data.verificationHash,
          evaluation: data.evaluation,
          diplomaUrl: data.diplomaUrl,
          verifyUrl: data.verifyUrl,
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch {
      setErrorMsg("Error de red al conectar con el servidor.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#040814]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/unicorn-bible"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition flex items-center gap-1.5"
            >
              ← Volver a La Biblia Ágil
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Certificación Editorial SQR-2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/vibecode?utm_source=ebook_quiz_nav&utm_campaign=unicorn_bible"
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Comunidad VibeCode Lab</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Hero Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>EVALUACIÓN INTERACTIVA DE DOMINIO EDITORIAL · CÓDIGO &amp; CAPITAL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Refuerza los Conceptos de Cada Tomo y Obtén tu{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">
              Certificado SQR-2026
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Este artefacto evalúa y refuerza con retroalimentación inmediata los conceptos técnicos, escénicos y financieros de los 4 tomos de{" "}
            <strong className="text-slate-200">La Biblia de los Squads Ágiles</strong>. Al aprobar con{" "}
            <strong className="text-emerald-400">75% o más</strong>, emitirás tu certificado público verificable para tu{" "}
            <em>Data Room</em> y LinkedIn.
          </p>
        </section>

        {/* IF CERTIFICATE IS ALREADY GENERATED: SHOW SUCCESS + COMMUNITY INVITATION */}
        {certResult ? (
          <section className="space-y-8 animate-fade-in">
            {/* Certificate Issued Card */}
            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-indigo-950/40 p-6 sm:p-10 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <Award className="w-4 h-4" />
                    Acreditación Oficial Emitida
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white pt-1">
                    ¡Felicidades, {name}! Aprobaste con {certResult.evaluation.scorePct}%
                  </h2>
                  <p className="text-sm text-slate-300">
                    Modalidad certificada: <strong className="text-white">{certResult.evaluation.modeTitle}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right bg-slate-950/80 border border-white/10 rounded-2xl px-5 py-3">
                  <div className="text-[11px] font-mono uppercase text-slate-400">ID de Certificado</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">{certResult.certificateId}</div>
                  <div className="text-[10px] font-mono text-slate-500">SHA256: {certResult.verificationHash}</div>
                </div>
              </div>

              {/* Pillar Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-500/25">
                  <div className="text-[11px] text-blue-300 font-semibold">Tomo I · Producción</div>
                  <div className="text-xl font-black text-white">{certResult.evaluation.pillarScores.infraestructura}/25</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-500/25">
                  <div className="text-[11px] text-rose-300 font-semibold">Tomo II · Pitch 180s</div>
                  <div className="text-xl font-black text-white">{certResult.evaluation.pillarScores.pitch}/25</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/25">
                  <div className="text-[11px] text-emerald-300 font-semibold">Tomo III · Métricas</div>
                  <div className="text-xl font-black text-white">{certResult.evaluation.pillarScores.metricas}/25</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/25">
                  <div className="text-[11px] text-amber-300 font-semibold">Tomo IV · Capital</div>
                  <div className="text-xl font-black text-white">{certResult.evaluation.pillarScores.capital}/25</div>
                </div>
              </div>

              {/* Action Buttons for Diploma & Public Verification */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={certResult.diplomaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-6 py-4 text-sm shadow-lg shadow-emerald-500/20 transition"
                >
                  <Download className="w-4 h-4" />
                  Abrir y Descargar Certificado PDF ({certResult.certificateId})
                </a>
                <Link
                  href={certResult.verifyUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-6 py-4 text-sm transition"
                >
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  Ver Portal de Verificación Pública
                </Link>
              </div>
            </div>

            {/* HIGH-CONVERTING INVITATION TO IMPLEMENT IN VIBECODE LAB COMMUNITY */}
            <div className="rounded-3xl border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-950/80 via-[#070d24] to-emerald-950/50 p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                El Siguiente Paso para Fundadores Certificados
              </div>

              <div className="space-y-3 max-w-3xl">
                <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  Ya dominas la teoría. Ahora pasa{" "}
                  <span className="text-emerald-400">del Libro a Producción Real</span> implementando en la Comunidad de{" "}
                  <span className="text-indigo-400">VibeCode Lab</span>.
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Tener tu certificado <code className="text-emerald-300 font-mono">{certResult.certificateId}</code>{" "}
                  demuestra que hablas el idioma técnico y financiero de Silicon Valley y Latinoamérica. Pero los comités de{" "}
                  <strong>CORFO, Inversionistas Ángeles y Venture Capitals</strong> no firman cheques por aprobar un examen: firman cheques cuando ven tu arquitectura cobrando en vivo y tu campaña trayendo clientes reales.
                </p>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  No intentes construir ni levantar capital en solitario. Únete a la{" "}
                  <strong className="text-white">Comunidad y Programa de Implementación de VibeCode Lab</strong>, donde aceleramos en <strong>3 semanas</strong> lo que a un equipo tradicional le toma 6 meses:
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">1. Despliegue Hombro a Hombro</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Implementa tu SaaS con Next.js, Supabase Pooler, Cloudflare R2 y Webhooks de Mercado Pago en vivo con soporte directo.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">2. Tracción Pagada y Pitch 180s</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Lanza tu primera campaña real de validación ($10 USD / 48h), mide tu CAC real y entrena tus 6 escenas de Demo Day frente a jurado.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">3. Comunidad Activa de Squads</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Conecta con otros founders técnicos y comerciales de LatAm, accede a repositorios privados y prepara tu postulación a CORFO y VCs.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/vibecode?utm_source=ebook_quiz_certified&utm_campaign=unicorn_bible"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black px-6 py-4 text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition"
                >
                  <Rocket className="w-5 h-5" />
                  Quiero Implementar mi SaaS en la Comunidad de VibeCode Lab
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/vibecode-1on1"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-4 text-sm transition"
                >
                  Ver Mentoría 1:1 Acelerada
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleResetExam}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Evaluar otro Tomo o repetir el examen
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Mode Selector Tabs */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Selecciona qué lectura deseas evaluar y reforzar hoy:
                </label>
                <span className="text-xs text-slate-400">
                  Respondidas: <strong className="text-white">{answeredCount}/{filteredQuestions.length}</strong> · Puntaje actual:{" "}
                  <strong className={evaluation.scorePct >= 75 ? "text-emerald-400" : "text-amber-400"}>
                    {evaluation.scorePct}%
                  </strong>{" "}
                  (Mínimo 75% para certificar)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {([1, 2, 3, 4] as const).map((v) => {
                  const meta = UNICORN_BIBLE_VOLUMES[v]
                  const active = mode === `vol-${v}`
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setMode(`vol-${v}` as ExamMode)
                        setErrorMsg(null)
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        active
                          ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                          : "bg-slate-950/60 border-white/10 hover:border-white/25 text-slate-400"
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                        Tomo {v} (4 Preguntas)
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5 line-clamp-1">{meta.shortTitle}</div>
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() => {
                    setMode("all")
                    setErrorMsg(null)
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    mode === "all"
                      ? "bg-gradient-to-br from-indigo-950/90 to-emerald-950/70 border-amber-400/70 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40"
                      : "bg-slate-950/60 border-white/10 hover:border-white/25 text-slate-400"
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                    Master Exam (16 Preg.)
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Tetralogía Completa (4 Tomos)</div>
                </button>
              </div>
            </section>

            {/* Questions List with Instant Pedagogical Feedback */}
            <section className="space-y-6">
              {filteredQuestions.map((q, idx) => {
                const selected = answers[q.id]
                const isCorrect = selected === q.correctOptionId
                const volMeta = UNICORN_BIBLE_VOLUMES[q.vol]

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-7 space-y-4 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border ${volMeta.badgeBgClass} ${volMeta.badgeTextClass} ${volMeta.badgeBorderClass}`}
                      >
                        {q.chapterRef}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Pregunta {idx + 1} de {filteredQuestions.length}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{q.question}</h3>

                    <div className="grid gap-2.5">
                      {q.options.map((opt) => {
                        const isThisSelected = selected === opt.id
                        const isOptionCorrect = opt.id === q.correctOptionId

                        let optionStyle =
                          "border-white/10 bg-slate-950/60 hover:border-white/25 text-slate-300"
                        if (selected) {
                          if (isThisSelected && isCorrect) {
                            optionStyle =
                              "border-emerald-500/70 bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/40"
                          } else if (isThisSelected && !isCorrect) {
                            optionStyle =
                              "border-rose-500/70 bg-rose-500/15 text-rose-100 ring-1 ring-rose-500/40"
                          } else if (isOptionCorrect) {
                            optionStyle =
                              "border-emerald-500/40 bg-emerald-500/5 text-emerald-200"
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 ${optionStyle}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                              {opt.id}
                            </span>
                            <span className="text-xs sm:text-sm leading-relaxed flex-1">{opt.text}</span>
                            {selected && isThisSelected && (
                              <span className="shrink-0 mt-0.5">
                                {isCorrect ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-rose-400" />
                                )}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Instant Concept Reinforcement Capsule */}
                    {selected && (
                      <div
                        className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
                          isCorrect
                            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                            : "bg-amber-950/30 border-amber-500/30 text-amber-200"
                        }`}
                      >
                        <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                        <div className="space-y-1">
                          <div className="font-bold">
                            {isCorrect
                              ? "¡Correcto! Refuerzo Conceptual del Manuscrito:"
                              : `Respuesta a reforzar (La opción correcta es la ${q.correctOptionId} — puedes seleccionarla arriba tras leer el refuerzo):`}
                          </div>
                          <p className="text-slate-300">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>

            {/* Certificate Emission Form */}
            <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-6 sm:p-9 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                    Paso Final · Emisión de Credencial SQR-2026
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Genera tu Certificado Oficial de Contenidos Aprobados
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Tu Calificación</div>
                  <div
                    className={`text-xl font-black ${
                      evaluation.passed ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {evaluation.scorePct}% ({evaluation.correctCount}/{evaluation.totalQuestions})
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitCertificate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nombre y Apellido (Como aparecerá en tu Diploma) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Camila Rojas"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Correo Electrónico (Para enviarte el Certificado PDF) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="camila@tu-startup.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Nombre de tu Startup / Proyecto (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: LexiaFlow AI"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      URL de tu MVP o Repositorio (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.tu-saas.com (o déjalo en blanco si aún estás ideando)"
                      value={mvpUrl}
                      onChange={(e) => setMvpUrl(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs sm:text-sm text-rose-200">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-black py-4 px-6 text-sm sm:text-base shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-5 h-5" />
                  {submitting
                    ? "Emitiendo Certificado Criptográfico SQR-2026..."
                    : `Emitir mi Certificado Oficial SQR-2026 (${evaluation.modeTitle})`}
                </button>
              </form>
            </section>

            {/* Bottom Banner Inviting to Implement in VibeCode Lab Community */}
            <section className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <Rocket className="w-4 h-4" />
                  ¿Quieres pasar de la lectura a la implementación real?
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Acelera tu Proceso Implementando en la Comunidad de VibeCode Lab
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  En lugar de tardar meses configurando infraestructura, pasarelas de pago y embudos por tu cuenta, entra al programa práctico de{" "}
                  <strong>VibeCode Lab</strong>: construye tu SaaS en producción en 3 semanas, lanza tu primera pauta publicitaria y presenta en nuestro Demo Day.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <Link
                  href="/vibecode?utm_source=ebook_quiz_banner&utm_campaign=unicorn_bible"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3.5 text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition whitespace-nowrap"
                >
                  🚀 Unirme a la Comunidad VibeCode Lab →
                </Link>
                <Link
                  href="/quiz?source=ebook"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold px-5 py-2.5 text-xs transition whitespace-nowrap"
                >
                  ¿Ya tienes MVP en vivo? Ir al Quiz de Pauta Real
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default function EbookQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040814] text-slate-300 flex items-center justify-center text-sm font-mono">
          Cargando Evaluación Editorial SQR-2026...
        </div>
      }
    >
      <EbookQuizContent />
    </Suspense>
  )
}
