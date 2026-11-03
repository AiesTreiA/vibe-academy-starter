"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Target, 
  Users, 
  Clock, 
  MessageSquare,
  Linkedin
} from "lucide-react"
import { AntigravityParticles } from "@/components/antigravity-particles"
import { Footer } from "@/components/footer"
import ConsultationFlow from "@/components/consultation-flow"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"

export default function AgendarPage() {
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("light", savedTheme === "light")
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AntigravityParticles />
      </div>

      {/* Header / Nav */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-primary/80 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Vibecode Studio • Mentoría & Consultoría 1 a 1
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-sky-500/20 to-emerald-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            Oferta Premium High-Ticket • Implementación Directa de IA
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-sky-300 to-emerald-200 leading-tight">
            Vibecode Studio
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            "Deja de añadir personas a un problema que puedes resolver con sistemas."
          </p>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            No quieres aprender IA. Quieres convertir IA en infraestructura para eliminar fricción operativa, automatizar procesos y acelerar tu Go-To-Market.
          </p>

          {/* 3 Key Value Props */}
          <div className="grid md:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md space-y-3 hover:border-indigo-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">1. Diagnóstico de Negocio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Entramos contigo al negocio, analizamos tus procesos y detectamos dónde existe mayor apalancamiento operativo y comercial.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md space-y-3 hover:border-sky-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">2. Sistemas & IA como Infraestructura</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Diseñamos e implementamos sistemas de IA a medida integrados directamente en tus flujos reales de producción y negocio.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">3. Acompañamiento Estratégico</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Te acompañamos en vivo con Javier Mujica y nuestro equipo hasta que la IA produzca un impacto real en tus métricas.
              </p>
            </div>
          </div>
        </section>

        {/* Consultation Flow Container */}
        <section className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 md:p-10 shadow-2xl shadow-indigo-500/5">
          <div className="mb-8 text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Reserva de Sesión Estratégica</h2>
            <p className="text-sm text-slate-400">
              Complete el diagnóstico inicial para coordinar su llamada con el equipo de Vibecode Studio
            </p>
          </div>

          <ConsultationFlow />

          <div className="mt-12 pt-8 border-t border-slate-800/80 text-center space-y-4">
            <h3 className="text-sm font-semibold text-slate-400">¿Prefiere contacto directo?</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="https://www.linkedin.com/in/javier-mujica-aa32291a/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  LinkedIn Javier Mujica
                </Button>
              </Link>
              <Link
                href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Contacto por WhatsApp
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Toaster />
    </div>
  )
}
