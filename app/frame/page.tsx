"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ShieldAlert, 
  Play, 
  CheckCircle2, 
  Clock, 
  Users, 
  Video, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  Zap,
  Copy
} from "lucide-react"
import { AntigravityParticles } from "@/components/antigravity-particles"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DEFAULT_DRIVE_URL = "https://drive.google.com/file/d/1kvc5LH6XSsAfcKDdOcFMWLJrHTJ4utsA/preview"

export default function FramePage() {
  const [googleDriveUrl, setGoogleDriveUrl] = useState<string>(DEFAULT_DRIVE_URL)
  const [isPlaying, setIsPlaying] = useState(false)
  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false
  })

  // Format Google Drive embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return ""
    // If it's a file ID
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url.trim())) {
      return `https://drive.google.com/file/d/${url.trim()}/preview`
    }
    // If it contains /file/d/ID
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`
    }
    // Return original url if already preview/embed format
    return url
  }

  const toggleCheck = (id: number) => {
    setCheckedRules(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const allChecked = Object.values(checkedRules).every(Boolean)

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AntigravityParticles />
      </div>

      {/* Background Radial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-600/15 via-sky-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Top Banner Alert */}
      <div className="relative z-20 bg-gradient-to-r from-amber-600/90 via-red-600/90 to-amber-600/90 text-white text-center py-2.5 px-4 text-xs md:text-sm font-semibold tracking-wide shadow-lg flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
        <span>¡IMPORTANTE! No cierres esta página hasta completar los 2 pasos.</span>
      </div>

      {/* Header / Brand */}
      <header className="relative z-10 border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/60 sticky top-0">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 text-base">
              V
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">
              Vibecode Studio
            </span>
          </div>

          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs py-1 px-2.5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Llamada Agendada
          </Badge>
        </div>
      </header>

      {/* Main Container - Mobile First Focus */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* Hero Urgency Box */}
        <section className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold tracking-wide uppercase">
            <ShieldAlert className="h-4 w-4" />
            Acción Requerida
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ¡Espera! ✋
          </h1>

          <h2 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-sky-300 to-emerald-200 leading-snug">
            Últimos 2 pasos para que no se cancele tu llamada
          </h2>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Nuestro equipo protege su agenda y solo trabaja con clientes comprometidos. Sigue las instrucciones a continuación para validar tu sesión.
          </p>
        </section>

        {/* STEP 1: VIDEO SECTION */}
        <section className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-2xl space-y-4 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-500/30">
                1
              </span>
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  Paso 1: Ve este video completo
                </h3>
                <p className="text-xs text-slate-400">Duración aproximada: 5 minutos</p>
              </div>
            </div>
          </div>

          {/* Video Player Container */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
            {googleDriveUrl ? (
              <iframe
                src={getEmbedUrl(googleDriveUrl)}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video de Onboarding Vibecode Studio"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950/80 via-slate-900 to-slate-950">
                <div className="relative mb-4">
                  <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-md animate-pulse" />
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 relative">
                    <Play className="h-8 w-8 translate-x-0.5 fill-white" />
                  </div>
                </div>

                <h4 className="text-base font-semibold text-slate-200 mb-1">
                  Video de 5 Minutos • Vibecode Studio
                </h4>
                <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
                  Descubre la oportunidad exacta, nuestro vehículo de Inteligencia Artificial y qué recibirás en tu llamada de diagnóstico.
                </p>

                {/* Google Drive Link Configurator for Admin/Owner */}
                <div className="w-full max-w-sm space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-left">
                  <label className="text-[11px] font-mono text-slate-400 block flex items-center gap-1">
                    <Video className="h-3 w-3 text-indigo-400" /> 
                    Configura tu enlace de video de Google Drive aquí:
                  </label>
                  <input
                    type="text"
                    placeholder="Pega la URL o ID del video de Google Drive..."
                    value={googleDriveUrl}
                    onChange={(e) => setGoogleDriveUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Ejemplo: <code className="text-indigo-300">https://drive.google.com/file/d/1ABC...XYZ/preview</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-indigo-300/90 leading-relaxed flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Nota sobre el video:</strong> Vibecode Studio es una asesoría integral de <strong>IA Aplicada a tu Negocio</strong>. En este video te explicamos cómo optimizamos tu operación, aceleramos tu Go-To-Market (SaaS) y automatizamos procesos sin fórmulas de marketing tradicional.
            </span>
          </div>
        </section>

        {/* STEP 2: PREPARE YOUR CALL */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
            <span className="h-8 w-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-500/30">
              2
            </span>
            <div>
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                Paso 2: Prepara tu llamada <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Importante</span>
              </h3>
              <p className="text-xs text-slate-400">
                Para poder asegurar que te podemos ayudar necesitamos que cumplas con estas 4 condiciones:
              </p>
            </div>
          </div>

          {/* 4 Conditions List */}
          <div className="grid gap-4">

            {/* Condition 1 */}
            <div 
              onClick={() => toggleCheck(1)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                checkedRules[1] 
                  ? "bg-emerald-500/10 border-emerald-500/40" 
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checkedRules[1] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 bg-slate-900"
              }`}>
                {checkedRules[1] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <h4 className="font-bold text-sm text-slate-100">1. Toma la reunión en un lugar sin interrupciones</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conéctate desde una computadora o laptop en un ambiente silencioso. No tomamos reuniones mientras conduces o estás en la calle.
                </p>
              </div>
            </div>

            {/* Condition 2 */}
            <div 
              onClick={() => toggleCheck(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                checkedRules[2] 
                  ? "bg-emerald-500/10 border-emerald-500/40" 
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checkedRules[2] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 bg-slate-900"
              }`}>
                {checkedRules[2] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-slate-100">2. Llega a la hora, la puntualidad es clave</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  La puntualidad respeta el tiempo de todos. Si te retrasas más de 5 minutos, la llamada se cancelará automáticamente.
                </p>
              </div>
            </div>

            {/* Condition 3 */}
            <div 
              onClick={() => toggleCheck(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                checkedRules[3] 
                  ? "bg-emerald-500/10 border-emerald-500/40" 
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checkedRules[3] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 bg-slate-900"
              }`}>
                {checkedRules[3] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <h4 className="font-bold text-sm text-slate-100">3. Asiste con todos tus socios o tomadores de decisión</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para poder avanzar y definir la hoja de ruta en la misma sesión, es requisito que estén presentes todas las personas involucradas en las decisiones del negocio.
                </p>
              </div>
            </div>

            {/* Condition 4 */}
            <div 
              onClick={() => toggleCheck(4)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                checkedRules[4] 
                  ? "bg-emerald-500/10 border-emerald-500/40" 
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checkedRules[4] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 bg-slate-900"
              }`}>
                {checkedRules[4] && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-400" />
                  <h4 className="font-bold text-sm text-slate-100">4. Solo agendamos una vez a las personas</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mi equipo respeta tu tiempo y es importante que aprovechemos el espacio al máximo. No permitimos que la misma persona reserve dos veces. Si no asistes o no avisas con anticipación, no te daremos acceso de nuevo a nuestro calendario y no podrás volver a agendar. Esto lo hacemos para proteger el tiempo de mi equipo. No aceptamos a todos en el programa, solo seleccionamos aquellos a quienes sí podemos ayudar.
                </p>
              </div>
            </div>

          </div>

          {/* Interactive Confirmation Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Progreso de confirmación:</span>
              <span className={`font-bold font-mono ${allChecked ? "text-emerald-400" : "text-amber-400"}`}>
                {Object.values(checkedRules).filter(Boolean).length} / 4 Requisitos marcados
              </span>
            </div>
            
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${(Object.values(checkedRules).filter(Boolean).length / 4) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* GOOGLE MEET & ACCESS DETAILS */}
        <section className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 text-center space-y-4 shadow-xl">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Video className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">
              Ubicación de la Sesión: Google Meet
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              La reunión se llevará a cabo por <strong>Google Meet</strong>. Nuestro equipo te contactará previamente por correo y WhatsApp para enviarte los detalles y confirmar tu asistencia.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              disabled={!allChecked}
              onClick={() => alert("¡Excelente! Tus requisitos han sido confirmados. Nos vemos en la reunión de Google Meet.")}
              className={`w-full sm:w-auto font-bold px-8 shadow-lg transition-all ${
                allChecked 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20" 
                  : "bg-slate-800 text-slate-400 cursor-not-allowed opacity-80"
              }`}
            >
              {allChecked ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Confirmo que estoy preparado
                </span>
              ) : (
                <span>Marca las 4 condiciones para confirmar</span>
              )}
            </Button>
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800/40">
          <p>© {new Date().getFullYear()} Vibecode Studio • Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  )
}
