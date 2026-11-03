"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Send, 
  Check, 
  Smartphone, 
  Sparkles, 
  DollarSign, 
  Gift, 
  Copy, 
  Bot, 
  Info,
  ExternalLink,
  RefreshCw,
  Award
} from "lucide-react"

interface Message {
  role: "user" | "model"
  content: string
}

export default function InstagramSimulatorPage() {
  const router = useRouter()
  
  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "[AUDIO: /audio/saludo.mp4]" },
    { role: "model", content: "Te dejé esa nota de voz arriba ☝️ Cuéntame para poder darte una mano. ¿A qué te dedicas o qué proyecto tienes hoy?" }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [userName, setUserName] = useState("")
  const [inputName, setInputName] = useState("")
  const [hasSubmittedName, setHasSubmittedName] = useState(false)

  // Simulation checklist states
  const [checklist, setChecklist] = useState({
    askDates: false,
    askPrice: false,
    askMentoring: false,
    triggerObjection: false,
    triggerBotClause: false,
    receiveCoupon: false,
  })

  // Coupon state detected
  const [detectedCoupon, setDetectedCoupon] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Process checklist triggers based on messages
  const updateChecklist = (text: string, isUser: boolean, replyText?: string) => {
    const lowerText = text.toLowerCase()
    const lowerReply = (replyText || "").toLowerCase()

    setChecklist(prev => {
      const next = { ...prev }
      if (isUser) {
        if (/cuándo|fecha|inicio|comienza|empieza|miércoles|horario/i.test(lowerText)) {
          next.askDates = true
        }
        if (/precio|cuánto|costo|pagar|valor/i.test(lowerText)) {
          next.askPrice = true
        }
        if (/mentoría|individual|1-a-1|uno a uno/i.test(lowerText)) {
          next.askMentoring = true
        }
        if (/caro|costoso|plata|dinero|descuento|promo|rebaja/i.test(lowerText)) {
          next.triggerObjection = true
        }
        if (/bot|ia|robot|humano|persona/i.test(lowerText)) {
          next.triggerBotClause = true
        }
      }

      // Check if bot offered coupon code (e.g. USERNAME30, USERNAME60, USERNAME70)
      if (replyText) {
        const couponMatch = replyText.match(/\b[A-Z]{2,}(\d{1,2})\b/i)
        if (couponMatch) {
          next.receiveCoupon = true
          setDetectedCoupon(couponMatch[0].toUpperCase())
        }
      }

      return next
    })
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text) return

    if (!textToSend) {
      setInputValue("")
    }

    // Add user message
    const userMessage: Message = { role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    updateChecklist(text, true)
    
    // Simular tiempo de lectura/espera antes de empezar a escribir (1 a 2 segundos)
    const readDelay = 1000 + Math.random() * 1000
    // Simular tiempo en que muestra "escribiendo..." (1 a 2 segundos)
    const writeDelay = 1000 + Math.random() * 1000

    try {
      // Build history excluding last message (since we pass it separately)
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const startApiCall = Date.now()
      const apiPromise = fetch("/api/vibecode/instagram/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          name: userName || "amigo"
        })
      })

      const elapsedApiInit = Date.now() - startApiCall
      if (readDelay > elapsedApiInit) {
        await new Promise(r => setTimeout(r, readDelay - elapsedApiInit))
      }

      setIsTyping(true)

      const [response] = await Promise.all([
        apiPromise,
        new Promise(r => setTimeout(r, writeDelay))
      ])

      setIsTyping(false)

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const botReply = data.reply || "¡Bacán socio! Cuéntame más."
      setMessages(prev => [...prev, { role: "model", content: botReply }])
      updateChecklist(text, false, botReply)

    } catch (err) {
      console.error(err)
      setIsTyping(false)
      setMessages(prev => [...prev, { role: "model", content: "Chuta socio, tuve un pequeño problema de conexión. ¿Me lo repites?" }])
    }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputName.trim()) {
      setUserName(inputName.trim())
      setHasSubmittedName(true)
    }
  }

  const copyCouponToClipboard = () => {
    if (!detectedCoupon) return
    navigator.clipboard.writeText(detectedCoupon)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text)
  }

  const resetSimulator = () => {
    setMessages([
      { role: "model", content: "¡Buena! Qué gusto tenerte por acá amigo. 👋 ¿En qué andas hoy? ¿Tienes alguna idea de aplicación en mente que quieras lanzar, o estás buscando meterte de lleno en el mundo de la programación y la IA?" }
    ])
    setDetectedCoupon(null)
    setChecklist({
      askDates: false,
      askPrice: false,
      askMentoring: false,
      triggerObjection: false,
      triggerBotClause: false,
      receiveCoupon: false,
    })
  }

  // Extract discount percentage from the detected coupon
  const couponDiscountPct = detectedCoupon ? parseInt(detectedCoupon.replace(/[^0-9]/g, ""), 10) : 0
  const estimatedPrice = couponDiscountPct ? Math.round(209 * (1 - couponDiscountPct / 100)) : 209

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:grid md:grid-cols-12 overflow-x-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT / CENTER PANEL: SmartPhone Instagram Mockup (5 cols) */}
      <div className="col-span-12 md:col-span-5 flex items-center justify-center p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800 relative z-10">
        
        {/* If name is not submitted yet, show introductory modal */}
        {!hasSubmittedName ? (
          <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Simulador de Ventas Vibecode Lab</h3>
              <p className="text-sm text-slate-400">
                Para empezar a simular la conversación de Instagram, dime tu nombre para que la IA genere el cupón personalizado.
              </p>
            </div>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Ingresa tu nombre (ej: Astro)"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 text-base md:text-sm"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm"
              >
                Comenzar Simulación
              </button>
            </form>
          </div>
        ) : (
          /* SmartPhone Container */
          <div className="relative w-full max-w-[360px] h-[640px] bg-black rounded-[40px] shadow-2xl border-[10px] border-slate-900 flex flex-col overflow-hidden">
            
            {/* Phone notch/camera */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-850" />
            </div>

            {/* Instagram Header */}
            <div className="bg-slate-950 border-b border-slate-900 px-4 pt-8 pb-3 flex items-center justify-between z-20 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push("/vibecode")}
                  className="p-1 hover:bg-slate-900 rounded-full transition"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      <span className="font-bold text-[10px] text-white">JM</span>
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs">javier.vibecode</span>
                    <span className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center text-[6px] text-white font-bold" title="Cuenta verificada">✓</span>
                  </div>
                  <span className="text-[9px] text-slate-500">Activo ahora</span>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 scrollbar-none">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div 
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-br-none" 
                        : "bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800/50"
                    }`}
                  >
                    {msg.content.startsWith("[AUDIO:") ? (
                      <div className="flex flex-col gap-1.5 py-1">
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-[11px]">
                          <span>🎤 Nota de voz de Javier</span>
                        </div>
                        <audio 
                          controls 
                          src="/audio/saludo.mp3" 
                          className="h-8 max-w-[220px] rounded-lg bg-slate-800"
                        />
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800/50 text-slate-400 px-3.5 py-3 rounded-2xl rounded-bl-none text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Quick Reply */}
            <div className="px-3 py-2 bg-slate-950 flex gap-2 overflow-x-auto scrollbar-none border-t border-slate-900 shrink-0 select-none">
              <button 
                onClick={() => handleSuggestionClick("¿Cuándo empieza y qué horarios tiene?")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-400 rounded-full border border-slate-800 shrink-0 transition"
              >
                📅 Horarios e Inicio
              </button>
              <button 
                onClick={() => handleSuggestionClick("¿Qué computador necesito y si requiere experiencia?")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-400 rounded-full border border-slate-800 shrink-0 transition"
              >
                💻 Requisitos
              </button>
              <button 
                onClick={() => handleSuggestionClick("Uff, me interesa mucho pero está muy caro...")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-400 rounded-full border border-slate-800 shrink-0 transition"
              >
                💸 ¿Descuento?
              </button>
              <button 
                onClick={() => handleSuggestionClick("¿Eres una inteligencia artificial o una persona real?")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-400 rounded-full border border-slate-800 shrink-0 transition"
              >
                🤖 ¿Eres un bot?
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2 items-center shrink-0">
              <input
                type="text"
                placeholder="Envía un mensaje..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-base md:text-xs text-white focus:outline-none focus:border-indigo-600 placeholder-slate-600"
              />
              <button 
                onClick={() => handleSendMessage()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition shrink-0"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* RIGHT PANEL: Simulation Dashboard (7 cols) */}
      <div className="col-span-12 md:col-span-7 p-6 sm:p-8 space-y-8 overflow-y-auto relative z-10 flex flex-col justify-between">
        
        <div className="space-y-6">
          
          {/* Header Dashboard */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">Simulación Activa</span>
                <span className="text-slate-500 text-xs">Javier Mujica Bot</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Instagram CRM Simulator</h2>
            </div>
            
            <button
              onClick={resetSimulator}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 hover:bg-slate-900 text-xs rounded-xl transition text-slate-400 hover:text-white shrink-0 self-start sm:self-center"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reiniciar Conversación
            </button>
          </div>

          {/* Goal checklists */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm">Objetivos de Prueba de la IA</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checklist.askDates ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 text-slate-650'}`}>
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold">Preguntar fechas e inicio</p>
                  <p className="text-[10px] text-slate-500">¿Cuándo empieza? ¿Graban clases?</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checklist.askPrice ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 text-slate-650'}`}>
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold">Preguntar precio del bootcamp</p>
                  <p className="text-[10px] text-slate-500">¿Cuánto cuesta?</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checklist.askMentoring ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 text-slate-650'}`}>
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold">Dudas sobre mentoría 1-a-1</p>
                  <p className="text-[10px] text-slate-500">Validar disclaimer de exclusión</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checklist.triggerObjection ? 'bg-emerald-550 text-slate-950' : 'bg-slate-850 text-slate-650'}`}>
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold">Objeción por precio / presupuesto</p>
                  <p className="text-[10px] text-slate-500">Decir que es caro o no hay dinero</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checklist.triggerBotClause ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 text-slate-650'}`}>
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold">Preguntar si es una IA / Bot</p>
                  <p className="text-[10px] text-slate-500">Validar cláusula de descubrimiento</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checklist.receiveCoupon ? 'bg-emerald-500 text-slate-950' : 'bg-slate-850 text-slate-650'}`}>
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold">Recibir cupón de descuento</p>
                  <p className="text-[10px] text-slate-500">Negociar código de descuento</p>
                </div>
              </div>
            </div>
          </div>

          {/* Golden Cupón Detected Notification Panel */}
          {detectedCoupon && (
            <div className="bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-pulse-subtle">
              <div className="flex items-center gap-2 text-indigo-400">
                <Gift className="h-5 w-5" />
                <h3 className="font-bold text-sm">¡Cupón Especial de Descuento Detectado!</h3>
              </div>
              <p className="text-xs text-slate-300">
                La IA ha evaluado la conversación y te ha otorgado el cupón <strong>{detectedCoupon}</strong>. Este código de <strong>{couponDiscountPct}%</strong> reduce el precio final del bootcamp de preventa a un valor único de <strong>${estimatedPrice} USD</strong> (pago único, sin mensualidades).
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={copyCouponToClipboard}
                  className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-500/20 text-indigo-300 transition"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar código {detectedCoupon}
                    </>
                  )}
                </button>
                <a
                  href={`/vibecode?coupon=${detectedCoupon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition shadow-lg shadow-indigo-600/10"
                >
                  Registrarme con descuento ahora
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* CRM Log & Info */}
          <div className="bg-slate-900/20 border border-slate-800/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="h-4.5 w-4.5" />
              <h4 className="font-semibold text-xs">CRM & Analítica Local</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cada interacción con el bot genera un archivo de log analítico en la carpeta local <code className="text-indigo-400 font-mono">historial_conversaciones/</code>. Estos logs permiten registrar las objeciones superadas, qué cupones se emitieron y evaluar las respuestas más efectivas para mejorar la automatización del negocio.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-900 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Vibecode Lab. Desarrollado con Inteligencia Artificial.</p>
          <a href="/vibecode" className="hover:text-indigo-400 transition flex items-center gap-1 font-medium">
            Volver a la landing principal de Vibecode Lab
          </a>
        </div>

      </div>

      <style jsx global>{`
        /* Custom scrollbar hides */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.35s ease-out forwards;
        }
        
        .animate-pulse-subtle {
          animation: pulseSubtle 3s infinite ease-in-out;
        }
        
        @keyframes pulseSubtle {
          0%, 100% {
            border-color: rgba(99, 102, 241, 0.2);
            box-shadow: 0 0 0px rgba(99, 102, 241, 0);
          }
          50% {
            border-color: rgba(99, 102, 241, 0.45);
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.05);
          }
        }
      `}</style>

    </div>
  )
}
