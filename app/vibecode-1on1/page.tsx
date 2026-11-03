"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  Code2, 
  Database, 
  Bot, 
  CreditCard, 
  Rocket, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Laptop,
  Check,
  PhoneCall
} from "lucide-react"
import { AntigravityParticles } from "@/components/antigravity-particles"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function Vibecode1on1Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const sessions = [
    {
      number: "01",
      title: "Arquitectura & Setup Pro",
      desc: "Definición del alcance de tu MVP, diseño de la arquitectura técnica, configuración del entorno de desarrollo acelerado con Cursor AI, repositorio GitHub y base de Next.js 15.",
      tags: ["Cursor AI", "Next.js 15", "GitHub Repo"]
    },
    {
      number: "02",
      title: "Base de Datos & Auth Seguro",
      desc: "Diseño del modelo relacional en Supabase, configuración de tablas, políticas de seguridad RLS (Row Level Security) y sistema de autenticación de usuarios (Email / Google OAuth).",
      tags: ["Supabase", "PostgreSQL", "RLS & Auth"]
    },
    {
      number: "03",
      title: "Cerebro de IA & Agentes",
      desc: "Conexión directa con Google Gemini 2.5 / OpenAI. Creación de prompts estructurados, llamadas a herramientas (function calling) y agentes que ejecutan tareas autónomas para tus usuarios.",
      tags: ["Gemini 2.5", "Structured Outputs", "AI Tools"]
    },
    {
      number: "04",
      title: "Lógica Core & UI React",
      desc: "Construcción de la interfaz de usuario con Tailwind CSS y componentes de alta calidad. Implementación de Server Actions, manejo de estados y la lógica clave de tu producto.",
      tags: ["Tailwind CSS", "Server Actions", "TypeScript"]
    },
    {
      number: "05",
      title: "Pagos & Monetización",
      desc: "Integración de pasarela de cobro real (Mercado Pago o Fintoc). Creación de suscripciones o pagos únicos, webhooks automáticos y actualización del estado del usuario.",
      tags: ["Mercado Pago", "Webhooks", "SaaS Billing"]
    },
    {
      number: "06",
      title: "Deploy & Lanzamiento",
      desc: "Despliegue continuo a producción en Vercel, vinculación de tu dominio propio, optimización SEO básica, analíticas y estrategia para conseguir tus primeros usuarios reales.",
      tags: ["Vercel Deploy", "Custom Domain", "Lanzamiento"]
    }
  ]

  const faqs = [
    {
      q: "¿Cómo se coordinan los horarios de las 6 sesiones?",
      a: "Una vez que adquieres el paquete, coordinamos directamente por WhatsApp tu disponibilidad. Las sesiones se agendan en bloques de 1 hora según tu calendario, pudiendo hacer de 1 a 2 sesiones por semana."
    },
    {
      q: "¿Necesito tener experiencia previa programando?",
      a: "No es obligatorio tener experiencia avanzada. Adaptamos el ritmo de las 6 sesiones a tu nivel actual, usando herramientas de IA de vanguardia para acelerar el desarrollo desde el primer minuto."
    },
    {
      q: "¿Puedo trabajar en una idea confidencial o un proyecto de mi empresa?",
      a: "Sí, absolutamente. A diferencia de las cohortes grupales, en Vibecode 1:1 el código y las sesiones son 100% privadas entre tú y el mentor."
    },
    {
      q: "¿Las sesiones quedan grabadas?",
      a: "Sí, cada sesión se graba en alta resolución y se te entrega el enlace con acceso vitalicio para que puedas repasar los comandos y el código en cualquier momento."
    },
    {
      q: "¿Cuáles son las formas de pago?",
      a: "Puedes pagar el valor promocional de lanzamiento de $360 USD (precio normal de lista $497 USD) vía Mercado Pago (tarjetas de crédito, débito o cuotas), PayPal o transferencia bancaria local en Chile (en pesos chilenos al cambio del día). También puedes optar por 2 cuotas de $180 USD."
    },
    {
      q: "¿Qué soporte tengo entre una sesión y otra?",
      a: "Tendrás canal directo por WhatsApp para resolver dudas rápidas, desbloquear errores de código y revisar tus Pull Requests entre sesión y sesión."
    }
  ]

  const whatsappMessage = encodeURIComponent("¡Hola Javier! Me interesa la oferta de lanzamiento del programa Vibecode 1:1 (6 asesorías de 1 hora por $360 USD, normal $497 USD). Quisiera coordinar fechas y empezar.")

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Dynamic Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AntigravityParticles />
      </div>

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-cyan-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/60 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group text-sm text-slate-400 hover:text-slate-200 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/vibecode" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-mono">
              Ver Cohorte Grupal
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs px-3 py-1 font-mono flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400 animate-pulse" />
              Vibecode 1:1 • Cupos Limitados
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-20">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            Programa de Mentoría Privada y Personalizada
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Aprende a programar software real con IA en{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              sesiones 1 a 1
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            El mismo currículum de alto nivel de <strong>Vibecode Lab</strong>, pero adaptado 100% a tus propios horarios, a tu velocidad y a tu proyecto específico.
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto items-stretch">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[105px]">
              <span className="text-base sm:text-lg md:text-xl font-black font-mono text-slate-400 line-through decoration-rose-500 decoration-[2.5px] block leading-none mb-1.5 opacity-90">$497 USD</span>
              <div className="text-2xl md:text-3xl font-bold font-mono text-cyan-400 leading-tight">$360 USD</div>
              <div className="text-[11px] text-amber-400 font-medium mt-1 leading-none">🔥 Lanzamiento</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-center flex flex-col items-center justify-center min-h-[105px]">
              <div className="text-2xl md:text-3xl font-bold font-mono text-indigo-400 leading-tight">6 Sesiones</div>
              <div className="text-xs text-slate-400 mt-1 leading-normal">1 a 1 en vivo (1h c/u)</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-center flex flex-col items-center justify-center min-h-[105px]">
              <div className="text-2xl md:text-3xl font-bold font-mono text-emerald-400 leading-tight">Inmediato</div>
              <div className="text-xs text-slate-400 mt-1 leading-normal">Sin esperar cohortes</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm text-center flex flex-col items-center justify-center min-h-[105px]">
              <div className="text-2xl md:text-3xl font-bold font-mono text-purple-400 leading-tight">100% Privado</div>
              <div className="text-xs text-slate-400 mt-1 leading-normal">En tu propio repo</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={`https://wa.me/56984242693?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-6 sm:px-8 min-h-[48px] h-auto py-3 text-xs sm:text-sm shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all whitespace-normal">
                <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 mr-2 shrink-0" />
                <span>Agendar por WhatsApp ($360 USD)</span>
              </Button>
            </a>
            <Link href="/agendar" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 hover:bg-slate-800/60 text-slate-200 px-4 sm:px-6 min-h-[48px] h-auto py-3 text-xs sm:text-sm whitespace-normal">
                <Calendar className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                <span>Agendar llamada de evaluación previa</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* ROADMAP DE LAS 6 SESIONES */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 px-3 py-1 font-mono text-xs">
              Estructura del Programa
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              ¿Qué construiremos en las 6 sesiones?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Un paso a paso estructurado para pasar de una idea en blanco a una aplicación web real, monetizable y con IA en producción.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, idx) => (
              <Card key={idx} className="bg-slate-900/50 border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black font-mono text-slate-700 group-hover:text-cyan-400 transition-colors">
                      {session.number}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                      {idx === 0 && <Laptop className="h-4 w-4" />}
                      {idx === 1 && <Database className="h-4 w-4" />}
                      {idx === 2 && <Bot className="h-4 w-4" />}
                      {idx === 3 && <Code2 className="h-4 w-4" />}
                      {idx === 4 && <CreditCard className="h-4 w-4" />}
                      {idx === 5 && <Rocket className="h-4 w-4" />}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {session.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {session.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {session.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* COMPARATIVE SECTION: 1:1 VS COHORTE */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-950 p-6 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              ¿Por qué elegir el formato 1 a 1?
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Compara la experiencia de la cohorte grupal tradicional frente a la mentoría privada.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 font-semibold">Aspecto</th>
                  <th className="py-3 px-4 font-semibold text-slate-300">Vibecode Lab (Cohorte)</th>
                  <th className="py-3 px-4 font-semibold text-cyan-400 bg-cyan-500/10 rounded-t-lg">Vibecode 1:1 (Privado)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-300">Atención</td>
                  <td className="py-3.5 px-4 text-slate-400">Grupal (hasta 11 alumnos)</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-cyan-500/5">100% individual y exclusiva</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-300">Horarios</td>
                  <td className="py-3.5 px-4 text-slate-400">Fijos (Miércoles 20:00 hrs)</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-cyan-500/5">Flexibles a tu conveniencia</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-300">Proyecto</td>
                  <td className="py-3.5 px-4 text-slate-400">Proyecto del Squad (equipo que se forme)</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-cyan-500/5">100% tu propio software / MVP individual</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-300">Fecha de Inicio</td>
                  <td className="py-3.5 px-4 text-slate-400">Según calendario oficial</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-cyan-500/5">Inmediata (empiezas hoy mismo)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-300">Soporte entre sesiones</td>
                  <td className="py-3.5 px-4 text-slate-400">Comunidad en Discord</td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold bg-cyan-500/5">WhatsApp directo con Javier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* PRICING & VALUE CARD */}
        <section className="max-w-xl mx-auto">
          <div className="relative rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.15)] text-center">
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-extrabold text-xs px-4 py-1 rounded-full uppercase tracking-wider">
              Acceso Inmediato
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-2xl font-bold text-white">Pack Vibecode 1:1</h3>
              <p className="text-xs text-slate-400 font-mono">6 asesorías privadas de 1 hora cada una</p>
            </div>

            <div className="py-4 space-y-2">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl md:text-4xl text-slate-400 line-through decoration-rose-500 decoration-[3.5px] font-mono font-black tracking-tight">$497 USD</span>
                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full">
                  28% OFF Lanzamiento
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-white font-mono">$360</span>
                <span className="text-slate-400 text-sm font-semibold">USD</span>
              </div>
              <p className="text-xs text-emerald-400 mt-1 font-mono">Ahorras $137 USD • Opción de 2 pagos de $180 USD</p>
            </div>

            <div className="space-y-3 text-left text-sm border-y border-slate-800 py-6">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>6 horas de mentoría privada en vivo con Javier</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Grabaciones de alta calidad de todas las sesiones</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Repositorios y plantillas base listas para producción</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Soporte por WhatsApp para resolver bloqueos de código</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>Deploy final con dominio y pasarela de pago operativa</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/56984242693?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button size="lg" className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold min-h-[50px] h-auto py-3 px-4 text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.25)] whitespace-normal">
                  <PhoneCall className="h-4 w-4 mr-2 shrink-0" />
                  <span>Reservar Pack 1:1 por WhatsApp</span>
                </Button>
              </a>

              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Garantía de satisfacción en la primera sesión
              </p>
            </div>

          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Preguntas Frecuentes
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Todo lo que necesitas saber antes de empezar tus sesiones privadas.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 font-semibold text-slate-200 hover:text-white"
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-5 md:px-5 md:pb-5 text-sm text-slate-400 border-t border-slate-800/60 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
