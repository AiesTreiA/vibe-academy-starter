"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Rocket, 
  Flame, 
  Target, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Users2, 
  Lightbulb, 
  Sparkles, 
  Clock, 
  Compass, 
  ChevronRight,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Presentation,
  SendHorizontal
} from "lucide-react"

export default function EncuestaPage() {
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    commitment: 0, // 1 to 5
    idea_status: "", // "tengo_idea" | "sumar_companero" | "no_claro"
    idea_description: "",
    ad_budget: "", // "hasta_20k" | "de_20k_a_50k" | "de_50k_a_100k" | "mas_de_100k"
    blocker: "", // "miedo_gastar" | "sin_creatividad" | "idea_no_definida" | "listo"
    launch_timeline: "", // "esta_semana" | "dos_semanas" | "post_modulo"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Calculate completion percentage
  const totalQuestions = 5
  let answeredQuestions = 0
  if (formData.commitment > 0) answeredQuestions++
  if (formData.idea_status !== "") answeredQuestions++
  if (formData.ad_budget !== "") answeredQuestions++
  if (formData.blocker !== "") answeredQuestions++
  if (formData.launch_timeline !== "") answeredQuestions++

  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage("Por favor ingresa tu nombre y apellido.")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.")
      return
    }
    if (formData.commitment === 0) {
      setErrorMessage("Por favor responde a la Pregunta 1 (Nivel de compromiso).")
      return
    }
    if (!formData.idea_status) {
      setErrorMessage("Por favor responde a la Pregunta 2 (Situación de tu idea).")
      return
    }
    if (!formData.ad_budget) {
      setErrorMessage("Por favor responde a la Pregunta 3 (Presupuesto en pauta).")
      return
    }
    if (!formData.blocker) {
      setErrorMessage("Por favor responde a la Pregunta 4 (Qué es lo que más te frena).")
      return
    }
    if (!formData.launch_timeline) {
      setErrorMessage("Por favor responde a la Pregunta 5 (En cuántos días podrías salir a pauta).")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al enviar la encuesta")
      }

      setIsSuccess(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || "Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090e]/80 border-b border-white/[0.08] transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/vibecode" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md group-hover:bg-emerald-400/35 transition-all" />
              <Image
                src="/images/vibecode-logo-icon.png"
                alt="Vibecode Lab Gaussian 3D"
                width={36}
                height={36}
                className="relative z-10 w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(45,212,191,0.6)] group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5 leading-none">
                VIBECODE <span className="text-emerald-400">LAB</span>
              </span>
              <span className="text-[10px] text-slate-400 mt-1 tracking-tight font-medium">Validación de Mercado</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Fase 2: Validación de Mercado
            </span>
            <button
              onClick={scrollToForm}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              Ir a la Encuesta ↓
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        {isSuccess ? (
          /* Success Screen */
          <div className="my-12 p-8 sm:p-12 rounded-3xl bg-[#0f1422]/90 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-emerald-500/25 rounded-full blur-xl animate-pulse" />
              <div className="relative w-full h-full p-2.5 rounded-2xl bg-white/[0.04] border border-emerald-500/30 flex items-center justify-center backdrop-blur-md">
                <Image
                  src="/images/vibecode-logo-icon.png"
                  alt="Vibecode Lab Gaussian 3D"
                  width={90}
                  height={90}
                  className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(45,212,191,0.6)]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-[#0f1422] shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              Compromiso Registrado
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              ¡Se acabó el simulacro, {formData.name.split(" ")[0]}!
            </h1>

            <p className="text-slate-300 max-w-xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
              Tu respuesta ha quedado registrada. Ya diste el primer paso que separa las ideas teóricas de los proyectos con tracción y futuro.
            </p>

            <div className="max-w-lg mx-auto p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left text-sm space-y-3 mb-8">
              <div className="flex justify-between items-center py-1 border-b border-white/[0.05]">
                <span className="text-slate-400">Compromiso:</span>
                <span className="font-semibold text-amber-400">{formData.commitment} / 5</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/[0.05]">
                <span className="text-slate-400">Idea:</span>
                <span className="font-semibold text-slate-200">
                  {formData.idea_status === "tengo_idea" ? "Idea propia" : formData.idea_status === "sumar_companero" ? "Sumarse a compañero" : "Por definir"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/[0.05]">
                <span className="text-slate-400">Inversión en Pauta:</span>
                <span className="font-semibold text-emerald-400">
                  {formData.ad_budget === "hasta_20k" ? "Hasta $20.000" : formData.ad_budget === "de_20k_a_50k" ? "$20.000 - $50.000" : formData.ad_budget === "de_50k_a_100k" ? "$50.000 - $100.000" : "Más de $100.000"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Lanzamiento:</span>
                <span className="font-semibold text-indigo-400">
                  {formData.launch_timeline === "esta_semana" ? "Esta misma semana 🔥" : formData.launch_timeline === "dos_semanas" ? "En dos semanas" : "Post-módulo"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/vibecode"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                Volver a Vibecode
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all text-sm"
              >
                Editar mis respuestas
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* HERO SECTION & MANIFIESTO */}
            <section className="text-center pt-4 pb-12">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative group cursor-pointer mb-5">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 to-indigo-500/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 p-3.5 rounded-2xl bg-[#0b0f19]/90 border border-white/[0.12] shadow-2xl flex items-center justify-center backdrop-blur-xl">
                    <Image
                      src="/images/vibecode-logo-icon.png"
                      alt="Vibecode Lab Gaussian 3D"
                      width={84}
                      height={84}
                      className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(45,212,191,0.5)] transform group-hover:scale-110 transition-all duration-300"
                      priority
                    />
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Vibecode Lab · De la Idea al Mercado
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
                De la idea al mercado. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Se acabó el simulacro.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                Hasta acá construyeron. Aprendieron el stack, ordenaron el entorno, entendieron cómo se arma algo con inteligencia artificial.{" "}
                <span className="text-white font-medium">Eso era la preparación.</span>
              </p>
            </section>

            {/* EDITORIAL NARRATIVE CARDS */}
            <div className="space-y-10 mb-16">
              {/* Bloque 1: Elegir */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0c101c]/80 border border-white/[0.08] backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Lo que viene ahora es otra cosa: elegir.</h3>
                </div>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
                  Elegir una idea, no la más segura, <span className="text-white font-semibold">la que de verdad les quita el sueño</span>, y comprometerse con ella. Elegir con quién se juegan las próximas semanas, porque un equipo no se arma por compatibilidad de horarios, se arma por complementariedad y por ganas de tirar para el mismo lado cuando algo no funcione, y algo no va a funcionar, y está bien.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-indigo-300/80 pt-2">
                  <span className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">#Complementariedad</span>
                  <span className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">#CompromisoReal</span>
                  <span className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">#Equipo</span>
                </div>
              </div>

              {/* Bloque 2: Pauta Real con Imagen War Room */}
              <div className="rounded-3xl bg-[#0c101c]/80 border border-emerald-500/20 overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <Image
                    src="/images/encuesta-war-room-launch.jpg"
                    alt="Equipo en war room lanzando pauta y validando con datos de mercado"
                    fill
                    className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-[#0c101c]/40 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    Fase 1 · Campañas Vivas
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Poner plata real en pauta: el paso que separa ideas de negocios
                    </h3>
                  </div>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
                    Y después, el paso que más asusta, y que es el que separa a los que tienen una idea de los que tienen un negocio: <strong className="text-emerald-400 font-semibold">poner plata real en pauta</strong>.
                  </p>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                    No es gastar por gastar. Es la forma más honesta de preguntarle al mercado si le importa lo que están construyendo, sin filtros, sin la opinión de tu mamá, sin la validación cómoda de tus amigos.
                  </p>

                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-sm sm:text-base font-medium flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      &ldquo;Un peso invertido en pauta y un dato real de vuelta vale más que cien conversaciones donde todos te dicen que tu idea es buena.&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Pitch a Inversionistas & Unicornios */}
              <div className="rounded-3xl bg-[#0c101c]/80 border border-indigo-500/20 overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <Image
                    src="/images/encuesta-pitch-investors.jpg"
                    alt="Founder presentando pitch ante inversionistas en boardroom tecnológico"
                    fill
                    className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c101c] via-[#0c101c]/40 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-indigo-400 border border-indigo-500/30 backdrop-blur-md">
                    Fase 2 · El Kit de Inversión
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Presentation className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Los unicornios nacen probando en el mundo real
                    </h3>
                  </div>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
                    Los unicornios no nacen de la idea perfecta. Nacen de equipos que se atrevieron a probar en el mundo real, rápido, con datos, sin esperar el momento ideal.
                  </p>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                    Y esto no termina cuando tengan el primer dato de validación. La disciplina de moverse rápido y comprometer plata real hoy es el ensayo general de lo que van a hacer más adelante, cuando armen su propio kit de levantamiento de capital para salir a buscar inversión.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 py-3 px-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-bold text-sm sm:text-base">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span>Piensen en grande. Elijan equipo. Inviertan. Salgan a validar.</span>
                  </div>
                </div>
              </div>

              {/* LA REGLA DE ORO: NADIE MIRA DESDE LA BANCA */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent border-2 border-amber-500/30 backdrop-blur-md relative">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Regla innegociable
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1 mb-3">
                      Acá nadie mira desde la banca
                    </h3>
                    <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                      Si tu idea todavía no tiene plata real comprometida detrás, tu aporte este mes es sumarte con todo a la de alguien que sí se está jugando entero. <strong className="text-amber-300 font-semibold">El compromiso no se mide proyecto por proyecto, se mide como equipo completo.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULARIO DE ENCUESTA */}
            <div ref={formRef} className="pt-4 scroll-mt-24">
              <div className="rounded-3xl bg-[#0d1220]/95 border border-white/[0.1] shadow-2xl backdrop-blur-xl p-6 sm:p-10 relative">
                {/* Floating Progress Bar */}
                <div className="mb-8 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-3">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      Progreso de la encuesta: {answeredQuestions} de {totalQuestions} respondidas
                    </span>
                    <span className="font-bold text-emerald-400">{progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* SECCIÓN 0: IDENTIFICACIÓN */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-500 pl-3">
                      <h4 className="text-lg font-bold text-white">Tus Datos de Participante</h4>
                      <p className="text-xs text-slate-400">Para identificarte en el equipo de la cohorte.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Nombre y Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Sofía Valenzuela"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="sofia@ejemplo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        WhatsApp (opcional, para coordinación rápida de equipo)
                      </label>
                      <input
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* PREGUNTA 1: COMPROMISO (1 AL 5) */}
                  <div className="space-y-4 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          ¿Qué tan comprometido estás con tu idea, o con la idea a la que te vas a sumar?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Escala del 1 al 5: donde 1 es todavía dudando entre varias, 3 es convencido pero abierto a pivotear, y 5 es esto es lo que voy a construir sí o sí.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                      {[
                        {
                          val: 1,
                          title: "Nivel 1",
                          desc: "Dudando entre varias ideas",
                          color: "hover:border-slate-400",
                        },
                        {
                          val: 2,
                          title: "Nivel 2",
                          desc: "Explorando y decidiendo",
                          color: "hover:border-blue-400",
                        },
                        {
                          val: 3,
                          title: "Nivel 3",
                          desc: "Convencido, abierto a pivotear",
                          color: "hover:border-indigo-400",
                        },
                        {
                          val: 4,
                          title: "Nivel 4",
                          desc: "Muy claro y con plan",
                          color: "hover:border-purple-400",
                        },
                        {
                          val: 5,
                          title: "Nivel 5 🔥",
                          desc: "Lo voy a construir sí o sí",
                          color: "hover:border-emerald-400",
                        },
                      ].map((item) => {
                        const selected = formData.commitment === item.val
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setFormData({ ...formData, commitment: item.val })}
                            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 relative group ${
                              selected
                                ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500"
                                : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`text-xl font-black ${
                                  selected ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
                                }`}
                              >
                                {item.val}
                              </span>
                              {selected && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white leading-tight mb-1">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-snug">
                              {item.desc}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* PREGUNTA 2: IDEA PROPIA O SUMARSE */}
                  <div className="space-y-4 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          ¿Tienes idea propia o te vas a sumar a la de alguien más?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Elige tu rol para las próximas semanas. Recuerda que complementarse en equipo multiplica las probabilidades.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {[
                        {
                          id: "tengo_idea",
                          title: "Tengo idea propia",
                          desc: "Tengo un proyecto claro que quiero liderar y validar en mercado.",
                          icon: Lightbulb,
                        },
                        {
                          id: "sumar_companero",
                          title: "Me voy a sumar a la de otro compañero",
                          desc: "Prefiero unir fuerzas, aportar al equipo y empujar con todo una idea validable.",
                          icon: Users2,
                        },
                        {
                          id: "no_claro",
                          title: "Todavía no lo tengo claro",
                          desc: "Estoy evaluando si lanzarme con la mía o hacer match con otro proyecto.",
                          icon: HelpCircle,
                        },
                      ].map((item) => {
                        const Icon = item.icon
                        const selected = formData.idea_status === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, idea_status: item.id })}
                            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 relative ${
                              selected
                                ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500"
                                : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3">
                              <Icon className={`w-4 h-4 ${selected ? "text-indigo-400" : "text-slate-400"}`} />
                            </div>
                            <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                            <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Campo condicional para nombre de la idea */}
                    {formData.idea_status === "tengo_idea" && (
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                          ¿Cuál es tu idea o de qué trata brevemente?
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ej: Plataforma de presupuestos con IA para ingenieros constructores..."
                          value={formData.idea_description}
                          onChange={(e) => setFormData({ ...formData, idea_description: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition-all text-sm resize-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* PREGUNTA 3: PRESUPUESTO EN PAUTA */}
                  <div className="space-y-4 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          ¿Cuánto estás dispuesto a invertir en pauta publicitaria este mes para validar?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Plata real que irá directo a Meta Ads / Google / TikTok para conseguir clicks y leads sin simulacro.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      {[
                        {
                          id: "hasta_20k",
                          amount: "Hasta $20.000",
                          badge: "Mínimo viable",
                          desc: "Para probar los primeros anuncios y medir CTR.",
                        },
                        {
                          id: "de_20k_a_50k",
                          amount: "$20.000 - $50.000",
                          badge: "Recomendado",
                          desc: "Volumen suficiente para obtener leads reales.",
                        },
                        {
                          id: "de_50k_a_100k",
                          amount: "$50.000 - $100.000",
                          badge: "Sólido",
                          desc: "Testear múltiples audiencias y creatividades.",
                        },
                        {
                          id: "mas_de_100k",
                          amount: "Más de $100.000",
                          badge: "Full Tracción 🔥",
                          desc: "Acelerar adquisición y saturación del nicho.",
                        },
                      ].map((item) => {
                        const selected = formData.ad_budget === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, ad_budget: item.id })}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                              selected
                                ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500"
                                : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                            }`}
                          >
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-slate-300 mb-2">
                              {item.badge}
                            </span>
                            <div className="text-sm sm:text-base font-extrabold text-white mb-1">
                              {item.amount}
                            </div>
                            <div className="text-[11px] text-slate-400 leading-snug">{item.desc}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* PREGUNTA 4: QUÉ ES LO QUE MÁS TE FRENA */}
                  <div className="space-y-4 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          ¿Qué es lo que más te frena para salir a validar?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Sé 100% honesto. Identificar el cuello de botella es la única forma de destrabarlo en la cohorte.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {[
                        {
                          id: "miedo_gastar",
                          title: "Miedo a gastar plata sin resultado",
                          desc: "Incertidumbre de no ver retornos inmediatos en la inversión.",
                        },
                        {
                          id: "sin_creatividad",
                          title: "No tengo la campaña o la creatividad lista",
                          desc: "Faltan los copies, videos, imágenes o la landing de conversión.",
                        },
                        {
                          id: "idea_no_definida",
                          title: "No sé si la idea está lo suficientemente definida",
                          desc: "Sensación de que todavía faltan detalles antes de mostrarla al público.",
                        },
                        {
                          id: "listo",
                          title: "Nada, estoy listo 🚀",
                          desc: "Cuento con las herramientas y quiero prender la pauta cuanto antes.",
                        },
                      ].map((item) => {
                        const selected = formData.blocker === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, blocker: item.id })}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                              selected
                                ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500"
                                : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                            <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* PREGUNTA 5: EN CUÁNTOS DÍAS CAMPAÑA CORRIENDO */}
                  <div className="space-y-4 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                        5
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          ¿En cuántos días podrías tener tu primera campaña corriendo?
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          La velocidad de iteración define qué proyectos llegan a la etapa de levantamiento.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {[
                        {
                          id: "esta_semana",
                          title: "Esta semana 🔥",
                          desc: "Listo para lanzar en los próximos 3 a 5 días hábiles.",
                        },
                        {
                          id: "dos_semanas",
                          title: "En dos semanas ⚡",
                          desc: "Preparando creativos y landing para salir la próxima semana.",
                        },
                        {
                          id: "post_modulo",
                          title: "Después del cierre del módulo 🗓️",
                          desc: "Prefiero consolidar los entregables y ejecutar al final.",
                        },
                      ].map((item) => {
                        const selected = formData.launch_timeline === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, launch_timeline: item.id })}
                            className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                              selected
                                ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500"
                                : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                            <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ERROR ALERT */}
                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3 animate-in fade-in duration-200">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 shadow-xl shadow-emerald-500/20 hover:shadow-indigo-500/30 transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Guardando tu compromiso...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmar mi compromiso y enviar respuestas</span>
                          <SendHorizontal className="w-5 h-5 text-slate-950" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                      Tus respuestas servirán para armar los squads de trabajo y coordinar las asesorías de validación directa.
                    </p>
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
          <span>De la idea al mercado</span>
          <span>·</span>
          <span>Javier Mujica</span>
        </div>
      </footer>
    </div>
  )
}
