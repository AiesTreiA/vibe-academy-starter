"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { 
  Cpu, 
  Zap, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Clock, 
  Send, 
  Bot, 
  Loader2, 
  UserCheck, 
  Rocket, 
  TrendingUp, 
  MessageCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  CreditCard,
  Building2,
  ChevronRight
} from "lucide-react"
import { Footer } from "@/components/footer"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  reasoning?: string
  latencyMs?: number
  model?: string
  cost?: string
  timestamp?: string
}

const STARTER_PROMPTS = [
  {
    id: "architecture",
    title: "Arquitectura SaaS $0 API",
    badge: "Full-Stack",
    icon: Layers,
    prompt: "Diseña la arquitectura técnica de un SaaS moderno para automatizar soporte al cliente con agentes autónomos usando Next.js, Supabase y modelos de frontera a costo $0 con NVIDIA NIM."
  },
  {
    id: "monetization",
    title: "Monetización & Pagos",
    badge: "Mercado Pago",
    icon: CreditCard,
    prompt: "¿Cómo estructurar el flujo de cobros de suscripciones recurrentes con Mercado Pago en Next.js, guardando el estado de membresía en Supabase con webhooks seguros?"
  },
  {
    id: "agent_blueprint",
    title: "Blueprint de Agente",
    badge: "Agente Autónomo",
    icon: Bot,
    prompt: "Diseña el blueprint de un Agente Autónomo que analice código fuente, detecte cuellos de botella y genere refactorizaciones listas para producción."
  },
  {
    id: "pitch",
    title: "Pitch Deck para Inversores",
    badge: "Demo Day",
    icon: Rocket,
    prompt: "Estructura un Pitch Deck de 7 diapositivas de alto impacto para presentar mi SaaS ante inversores ángeles en el Demo Day de Vibecode Lab."
  }
]

const FOLLOW_UP_SUGGESTIONS = [
  "¿Cómo conecto esta misma API a un backend en Next.js?",
  "¿Qué políticas de seguridad (RLS) debo aplicar en Supabase?",
  "¿Cuál es la estrategia recomendada para conseguir mis primeros 100 usuarios?",
  "¿Qué diferencia técnica hay entre usar NVIDIA NIM y OpenAI?"
]

export default function NvidiaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! Soy el mentor técnico interactivo de **Vibecode Lab**, conectado en vivo a microservicios **NVIDIA NIM** sobre GPUs de alto rendimiento a costo $0.\n\nPuedes consultarme sobre **arquitectura de software para tu SaaS, conexión de modelos de IA de frontera, bases de datos con Supabase o cómo levantar capital en un Demo Day**.\n\nEscribe cualquier pregunta o elige uno de los casos de prueba de arriba para comenzar:",
      model: "meta/llama-3.2-11b-vision-instruct",
      latencyMs: 95,
      cost: "$0.00 USD",
      timestamp: "Ahora"
    }
  ])

  const [inputPrompt, setInputPrompt] = useState("")
  const [selectedModel, setSelectedModel] = useState("meta/llama-3.2-11b-vision-instruct")
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages, loading])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Conversación reiniciada. Puedes plantear un nuevo desafío técnico para tu SaaS o consultar sobre cómo conectar APIs de IA sin pagar suscripciones.",
        model: selectedModel,
        latencyMs: 50,
        cost: "$0.00 USD",
        timestamp: "Ahora"
      }
    ])
    setInputPrompt("")
  }

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed || loading) return

    const userMsgId = "user-" + Date.now()
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputPrompt("")
    setLoading(true)

    try {
      // Build history payload for multi-turn conversational context
      const historyPayload = updatedMessages
        .filter(m => m.id !== "welcome" && !m.id.startsWith("welcome-"))
        .map(m => ({
          role: m.role,
          content: m.content
        }))

      // If only the new user message exists in history payload, pass it directly
      const payloadToSend = historyPayload.length > 0 
        ? historyPayload 
        : [{ role: "user", content: trimmed }]

      const res = await fetch("/api/nvidia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadToSend,
          prompt: trimmed,
          model: selectedModel
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: "err-" + Date.now(),
            role: "assistant",
            content: `⚠️ **Aviso:** ${data.error || "Ocurrió un error al procesar tu solicitud."}`,
            latencyMs: data.latencyMs || 0,
            cost: "$0.00 USD"
          }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: "asst-" + Date.now(),
            role: "assistant",
            content: data.reply || "Respuesta completada.",
            reasoning: data.reasoning || undefined,
            latencyMs: data.latencyMs || 0,
            model: data.modelUsed || selectedModel,
            cost: data.cost || "$0.00 USD",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ])
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: `⚠️ **Error de conexión:** ${err.message || "No se pudo comunicar con el servidor de inferencia."}`,
          cost: "$0.00 USD"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputPrompt)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputPrompt)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-[#76b900] selection:text-black">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#76b900]/15 via-[#76b900]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/vibecode" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-[#76b900]/40 flex items-center justify-center text-[#76b900]">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
                VIBECODE <span className="text-[#76b900]">LAB</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#76b900]/15 text-[#76b900] font-mono border border-[#76b900]/30 font-normal">
                  Gen 2
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Consola API NVIDIA $0</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a 
              href="#chat-console" 
              className="text-xs text-slate-300 hover:text-white transition hidden md:inline-block"
            >
              Probar Chat en Vivo
            </a>
            <a 
              href="#pilares" 
              className="text-xs text-slate-300 hover:text-white transition hidden sm:inline-block"
            >
              Qué Aprenderás
            </a>
            <Link 
              href="/vibecode" 
              className="px-4 py-2 rounded-full bg-[#76b900] text-black font-bold text-xs hover:bg-[#88d500] transition flex items-center gap-1.5 shadow-lg shadow-[#76b900]/25"
            >
              <span>Ver Bootcamp Oficial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-14 pb-10 px-4 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#76b900]/10 border border-[#76b900]/30 text-[#76b900] text-xs font-mono mb-5">
          <span className="w-2 h-2 rounded-full bg-[#76b900] animate-pulse" />
          <span>VIBECODE LAB · CONSOLA INTERACTIVA DE INFERENCIA EN VIVO</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-none">
          Inferencia de IA de Frontera: <br />
          <span className="bg-gradient-to-r from-white via-[#76b900] to-emerald-400 bg-clip-text text-transparent">
            Aprende a Conectar APIs a Costo $0
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Mientras las APIs propietarias cobran suscripciones y tokens caros, en <strong>Vibecode Lab</strong> te enseñamos a orquestar microservicios abiertos acelerados por NVIDIA para <strong>construir tu SaaS, lanzar al mercado y levantar capital</strong>.
        </p>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-8">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <Zap className="w-4 h-4 text-[#76b900] mb-1" />
            <div className="font-bold text-xs sm:text-sm text-white">Inferencia $0 API</div>
            <div className="text-[11px] text-slate-400">Sin tarjetas requeridas</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <Bot className="w-4 h-4 text-emerald-400 mb-1" />
            <div className="font-bold text-xs sm:text-sm text-white">Modelos Top Open</div>
            <div className="text-[11px] text-slate-400">Llama 3.2 • GLM 5.3</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <Terminal className="w-4 h-4 text-[#76b900] mb-1" />
            <div className="font-bold text-xs sm:text-sm text-white">Chat Continuo</div>
            <div className="text-[11px] text-slate-400">Pregunta y profundiza</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <Rocket className="w-4 h-4 text-amber-400 mb-1" />
            <div className="font-bold text-xs sm:text-sm text-white">Lanzamiento & Demo</div>
            <div className="text-[11px] text-slate-400">De la idea al capital</div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CHAT CONSOLE SECTION */}
      <section id="chat-console" className="py-6 px-4 max-w-5xl mx-auto scroll-mt-20">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col h-[750px]">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#76b900] to-transparent" />

          {/* Console Header & Model Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#76b900]/10 text-[#76b900]">
                <Terminal className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Consola de Chat Técnico en Vivo</span>
                  <span className="w-2 h-2 rounded-full bg-[#76b900] animate-pulse" />
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">
                  Endpoint: NVIDIA NIM Serverless · Latencia ultra baja
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 font-mono">Modelo:</span>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value="meta/llama-3.2-11b-vision-instruct" className="bg-slate-950">
                    Meta Llama 3.2 (Rápido ~1.2s)
                  </option>
                  <option value="z-ai/glm-5.3" className="bg-slate-950">
                    GLM 5.3 (MoE 753B Razonamiento)
                  </option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Starter Presets Bar */}
          <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-800/40">
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Temas:</span>
            {STARTER_PROMPTS.map(preset => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.id}
                  onClick={() => sendMessage(preset.prompt)}
                  disabled={loading}
                  className="shrink-0 px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-[#76b900]/40 text-xs text-slate-200 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-[#76b900]" />
                  <span>{preset.title}</span>
                </button>
              )
            })}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-[#76b900]/15 border border-[#76b900]/30 flex items-center justify-center text-[#76b900] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#76b900] text-black font-medium rounded-tr-none shadow-md shadow-[#76b900]/10"
                      : "bg-slate-950 border border-slate-800/90 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {/* Assistant Header Info / Telemetry */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono border-b border-slate-800 pb-2 text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{msg.cost || "$0.00 USD"}</span>
                        <span>•</span>
                        <span>{msg.model || selectedModel}</span>
                        {msg.latencyMs !== undefined && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-[#76b900]">
                              <Clock className="w-3 h-3" />
                              {msg.latencyMs} ms
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-white transition flex items-center gap-1"
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Reasoning block if present */}
                  {msg.reasoning && (
                    <details className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono">
                      <summary className="cursor-pointer text-[11px] text-[#76b900] font-bold select-none">
                        🔍 Ver Proceso de Razonamiento Interno (Thinking)
                      </summary>
                      <div className="mt-2 text-[11px] text-slate-400 whitespace-pre-wrap border-t border-slate-800 pt-2">
                        {msg.reasoning}
                      </div>
                    </details>
                  )}

                  {/* Main Content */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-sm justify-start">
                <div className="w-8 h-8 rounded-xl bg-[#76b900]/15 border border-[#76b900]/30 flex items-center justify-center text-[#76b900] shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-[#76b900]" />
                  <span>Razonando en microservicios NVIDIA NIM...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up Suggestion Chips */}
          {messages.length > 1 && !loading && (
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-slate-800/40">
              <span className="text-[10px] text-slate-400 font-mono uppercase shrink-0">Seguir indagando:</span>
              {FOLLOW_UP_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(suggestion)}
                  className="shrink-0 px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition hover:text-[#76b900]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* In-Chat Conversion Highlight */}
          <div className="my-2 p-3 rounded-xl bg-gradient-to-r from-slate-950 via-[#76b900]/10 to-slate-950 border border-[#76b900]/30 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-7 h-7 rounded-lg bg-[#76b900]/20 text-[#76b900] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-slate-200">
                ¿Quieres aprender a integrar esta API en tu propio SaaS y presentar ante inversores?
              </div>
            </div>

            <Link
              href="/vibecode"
              className="px-3.5 py-1.5 rounded-lg bg-[#76b900] hover:bg-[#88d500] text-black font-extrabold text-xs transition flex items-center gap-1 shrink-0 shadow-md shadow-[#76b900]/20"
            >
              <span>Conoce Vibecode Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSubmit} className="pt-2 shrink-0">
            <div className="relative flex items-center">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Escribe tu pregunta de seguimiento o plantea un nuevo requerimiento..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-24 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#76b900] transition font-sans resize-none"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={loading || !inputPrompt.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-[#76b900] hover:bg-[#88d500] text-black font-bold text-xs transition flex items-center gap-1 disabled:opacity-40 disabled:hover:bg-[#76b900]"
                >
                  <span>Enviar</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-1 font-mono">
              <span>Presiona Enter para enviar • Shift + Enter para salto de línea</span>
              <span className="text-emerald-400 font-bold">Costo por consulta: $0.00 USD</span>
            </div>
          </form>
        </div>
      </section>

      {/* THE 3 REAL PILLARS OF VIBECODE LAB */}
      <section id="pilares" className="py-16 px-4 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-[#76b900] uppercase tracking-wider">
            Plan de Estudios Práctico · 2da Generación
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Lo que aprenderás a dominar en Vibecode Lab
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2">
            No te enseñamos teoría de laboratorio: construyes un producto real en vivo, con arquitectura escalable y preparado para monetizar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-[#76b900]/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#76b900]/10 border border-[#76b900]/30 flex items-center justify-center text-[#76b900]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Inferencia Abierta a Costo $0</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aprende a conectar microservicios NVIDIA NIM, modelos open-weights (Llama 3.2, DeepSeek) y endpoints serverless sin tener que pagar facturas mensuales sorpresa en OpenAI.
            </p>
            <div className="text-[11px] text-[#76b900] font-mono">⚡ Sin costes por token iniciales</div>
          </div>

          {/* Pilar 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Full-Stack & Cobros en Vivo</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Desarrolla en Next.js con Supabase (Auth, RLS, Base de datos) e integra pasarela de pagos real con Mercado Pago para cobrar suscripciones o créditos a usuarios reales.
            </p>
            <div className="text-[11px] text-emerald-400 font-mono">💳 Pagos directo a tu cuenta bancaria</div>
          </div>

          {/* Pilar 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Lanzamiento Real & Capital</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Estrategia Go-to-Market para traccionar tus primeros 100 usuarios, preparación de Pitch Deck y presentación en el Demo Day frente a la comunidad e inversores.
            </p>
            <div className="text-[11px] text-amber-400 font-mono">🚀 Demo Day frente a inversores</div>
          </div>
        </div>
      </section>

      {/* COMPARATIVE SECTION */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="text-xs font-mono text-rose-400 uppercase tracking-wide">
              ❌ Lo que enseñan los cursos convencionales
            </div>
            <h3 className="text-lg font-bold text-slate-200">
              Desarrollador Dependiente de Wrappers
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Dependencia absoluta de una sola API propietaria con facturas caras cada fin de mes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Proyectos que se quedan como juguetes locales y nunca se publican en internet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Cero preparación de negocio, métricas o levantamiento de capital.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#76b900]/10 to-slate-900/60 border border-[#76b900]/40 space-y-4 shadow-xl">
            <div className="text-xs font-mono text-[#76b900] uppercase tracking-wide flex items-center gap-1.5">
              <span>🚀 Lo que dominas en Vibecode Lab Gen 2</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Constructor de Software con IA & Tracción
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#76b900] shrink-0 mt-0.5" />
                <span>Orquestación de microservicios abiertos acelerados a <strong>costo de API $0</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#76b900] shrink-0 mt-0.5" />
                <span>Aplicación publicada en Vercel con login, base de datos y cobros automatizados.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#76b900] shrink-0 mt-0.5" />
                <span>Estrategia comercial para conseguir tus primeros usuarios y presentar en el Demo Day.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BIG CONVERSION CTA */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-[#76b900]/40 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#76b900]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#76b900]/15 text-[#76b900] font-mono text-xs font-semibold">
            DE LA EXPERIMENTACIÓN AL NEGOCIO • VIBECODE LAB
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
            No te quedes solo chateando: <br />
            <span className="text-[#76b900]">Construye tu propio SaaS y Lánzalo</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Aprender a conectar modelos de IA a costo $0 es solo el primer paso. En el bootcamp completo de <strong>Vibecode Lab</strong> te acompañamos paso a paso desde la idea hasta el producto en producción con usuarios reales y la preparación para levantar capital de inversión.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/vibecode"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#76b900] hover:bg-[#88d500] text-black font-extrabold text-base transition flex items-center justify-center gap-2 shadow-xl shadow-[#76b900]/25 group"
            >
              <span>Ver Programa Completo y Postular</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="https://wa.me/56961405230?text=Hola%20Javier,%20vengo%20de%20la%20consola%20de%20NVIDIA%20y%20quiero%20conocer%20m%C3%A1s%20sobre%20Vibecode%20Lab%20Gen%202"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Hablar por WhatsApp</span>
            </a>
          </div>

          <div className="text-xs text-slate-400 pt-2">
            Revisa los cupos disponibles, fechas oficiales de clase y tramos de descuento en la landing oficial.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
