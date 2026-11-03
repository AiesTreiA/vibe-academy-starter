"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  Activity, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Clock, 
  Cpu, 
  Info,
  Layers,
  AlertTriangle,
  Play
} from "lucide-react"

interface KeyStatus {
  anthropic: boolean
  huawei: boolean
  gemini: boolean
  deepseek: boolean
  openai: boolean
  nvidia: boolean
}

interface TestResult {
  ok: boolean
  reply?: string
  latencyMs: number
  engineUsed?: string
  modelUsed?: string
  error?: string
}

export default function AITesterPage() {
  const router = useRouter()

  // Status of environment variables
  const [keys, setKeys] = useState<KeyStatus>({
    anthropic: false,
    huawei: false,
    gemini: false,
    deepseek: false,
    openai: false,
    nvidia: false
  })
  
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)

  // Form States
  const [engine, setEngine] = useState<"anthropic" | "huawei" | "gemini" | "deepseek" | "openai" | "nvidia">("gemini")
  const [model, setModel] = useState("")
  const [systemPrompt, setSystemPrompt] = useState(
    "Eres Javier Mujica, desarrollador experto y psicólogo conversacional fluido. Eres el tutor de Vibecode Lab. Tu personalidad es amigable, empática y cercana. El Bootcamp Vibecode Lab inicia las clases en vivo el Miércoles 25 de Noviembre."
  )

  const [userMessage, setUserMessage] = useState("Hola Javier, ¿me das información sobre el inicio de clases y requisitos de PC del bootcamp?")
  const [isLoadingTest, setIsLoadingTest] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  // Pre-load default models when engine changes
  useEffect(() => {
    if (engine === "gemini") setModel("gemini-2.0-flash")
    else if (engine === "anthropic") setModel("claude-haiku-4-5-20251001")
    else if (engine === "huawei") setModel("DeepSeek-V3")
    else if (engine === "deepseek") setModel("deepseek-chat")
    else if (engine === "openai") setModel("gpt-4o-mini")
    else if (engine === "nvidia") setModel("deepseek-ai/deepseek-v4.1-flash")
  }, [engine])


  const fetchKeysStatus = async () => {
    setIsLoadingKeys(true)
    try {
      const res = await fetch("/api/admin/ai-test")
      if (res.ok) {
        const data = await res.json()
        if (data.keys) {
          setKeys(data.keys)
        }
      }
    } catch (err) {
      console.error("Failed to load keys status:", err)
    } finally {
      setIsLoadingKeys(false)
    }
  }

  useEffect(() => {
    fetchKeysStatus()
  }, [])

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userMessage.trim()) return

    setIsLoadingTest(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engine,
          model,
          systemPrompt,
          message: userMessage
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data: TestResult = await res.json()
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setResult({
        ok: false,
        error: err.message || "Error de conexión con la API del servidor",
        latencyMs: 0
      })
    } finally {
      setIsLoadingTest(false)
    }
  }

  // Pre-loaded system prompt templates
  const loadTemplate = (type: "vibecode" | "consultor" | "asistente") => {
    if (type === "vibecode") {
      setSystemPrompt(
        "Eres Javier Mujica, desarrollador experto y psicólogo conversacional fluido. Eres el tutor de Vibecode Lab. Tu personalidad es amigable, empática y cercana, como si hablaras con un amigo. Si preguntan precio dales el cupón MARCO70 a $63 USD."
      )
      setUserMessage("Me interesa el bootcamp, pero no tengo mucha plata... ¿hay alguna promo?")
    } else if (type === "consultor") {
      setSystemPrompt(
        "Eres Javier Mujica, Ingeniero Civil Industrial y consultor experto en optimización de procesos, RPA y digitalización. Entrega un análisis técnico detallado, estructurado y enfocado en ROI."
      )
      setUserMessage("Necesito optimizar el proceso de facturación de mi e-commerce, procesamos 500 pedidos diarios manualmente.")
    } else {
      setSystemPrompt("Eres un asistente general de desarrollo útil, técnico y conciso.")
      setUserMessage("Escribe una función en TypeScript para calcular el dígito verificador del RUT chileno.")
    }
  }

  const getLatencyColor = (ms: number) => {
    if (ms === 0) return "text-slate-500 border-slate-800"
    if (ms < 2000) return "text-emerald-400 border-emerald-500/35 bg-emerald-500/5"
    if (ms < 7500) return "text-emerald-300 border-emerald-500/35 bg-emerald-500/5"
    if (ms < 12000) return "text-amber-400 border-amber-500/35 bg-amber-500/5"
    return "text-red-400 border-red-500/35 bg-red-500/5"
  }

  const getLatencyRating = (ms: number) => {
    if (ms === 0) return "N/A"
    if (ms < 2000) return "Excelente"
    if (ms < 7500) return "Normal (LLM)"
    if (ms < 12000) return "Aceptable"
    return "Alta Latencia"
  }


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden p-4 sm:p-6 md:p-8">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <button 
              onClick={() => router.push("/vibecode")} 
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition group mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver a Vibecode Lab
            </button>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-indigo-400" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Engine Diagnostics Playground</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Entorno de desarrollo para probar, medir latencias y depurar los motores de Inteligencia Artificial configurados.
            </p>
          </div>

          <button
            onClick={fetchKeysStatus}
            className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 px-4 py-2 rounded-xl transition text-slate-350"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            Recargar llaves
          </button>
        </div>

        {/* SECTION 1: Key Status Dashboard */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Key className="h-5 w-5" />
            <h2 className="font-bold text-sm">Estado de las Credenciales (.env)</h2>
          </div>
          
          {isLoadingKeys ? (
            <div className="h-12 flex items-center justify-center text-xs text-slate-500 gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              Verificando llaves de API en el servidor...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              
              {/* Anthropic Claude */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between h-20">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Anthropic Claude</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-indigo-350">Sonnet</span>
                  {keys.anthropic ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Configurada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <XCircle className="h-3.5 w-3.5 text-slate-650" /> Vacía
                    </span>
                  )}
                </div>
              </div>

              {/* Huawei ModelArts */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between h-20">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Huawei MAAS</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-indigo-350">DeepSeek-V3</span>
                  {keys.huawei ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Configurada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <XCircle className="h-3.5 w-3.5 text-slate-650" /> Vacía
                    </span>
                  )}
                </div>
              </div>

              {/* OpenAI */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between h-20">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">OpenAI API</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-indigo-350">GPT-4o</span>
                  {keys.openai ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Configurada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <XCircle className="h-3.5 w-3.5 text-slate-650" /> Vacía
                    </span>
                  )}
                </div>
              </div>

              {/* Gemini */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between h-20">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Google Gemini</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-indigo-350">1.5 Flash</span>
                  {keys.gemini ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Configurada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <XCircle className="h-3.5 w-3.5 text-slate-650" /> Vacía
                    </span>
                  )}
                </div>
              </div>

              {/* DeepSeek Direct */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between h-20">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">DeepSeek API</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-indigo-350">DS Chat</span>
                  {keys.deepseek ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Configurada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <XCircle className="h-3.5 w-3.5 text-slate-650" /> Vacía
                    </span>
                  )}
                </div>
              </div>

              {/* NVIDIA NIM */}
              <div className="bg-slate-950/60 border border-emerald-950/40 rounded-xl p-3 flex flex-col justify-between h-20">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">NVIDIA NIM</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-emerald-300">TensorRT</span>
                  {keys.nvidia ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-450" /> Configurada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <XCircle className="h-3.5 w-3.5 text-slate-650" /> Vacía
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2: Split Testing Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form configuration (5 cols) */}
          <form onSubmit={handleRunTest} className="lg:col-span-5 bg-slate-900/45 border border-slate-850 rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-3">
              <Cpu className="h-5 w-5" />
              <h3 className="font-bold text-sm">Configuración del Test</h3>
            </div>

            {/* Prompt Templates */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Cargar Plantilla de Prompt</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadTemplate("vibecode")}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[10px] rounded-lg transition"
                >
                  💬 Ventas Vibecode Lab
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("consultor")}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[10px] rounded-lg transition"
                >
                  👔 Consultor ROI
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate("asistente")}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[10px] rounded-lg transition"
                >
                  💻 Dev Técnico
                </button>
              </div>
            </div>

            {/* Engine Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Seleccionar Motor de IA</label>
              <select
                value={engine}
                onChange={e => setEngine(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs text-white"
              >
                <option value="nvidia">🟢 NVIDIA NIM (DeepSeek / Nemotron)</option>
                <option value="gemini">Google Gemini (API Key)</option>
                <option value="huawei">Huawei ModelArts MAAS (compatible OpenAI)</option>
                <option value="anthropic">Anthropic Claude (API Key)</option>
                <option value="openai">OpenAI (API Key)</option>
                <option value="deepseek">DeepSeek Direct (API Key)</option>
              </select>
            </div>

            {/* Model String Override */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide flex justify-between">
                <span>Parámetro de Modelo (String)</span>
                {engine === "huawei" && <span className="text-[9px] text-indigo-400">DeepSeek-V3 / deepseek-r1-250528 / glm-5</span>}
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                required
                placeholder="Model ID"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs text-white font-mono"
              />
            </div>

            {/* System Instruction */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">System Prompt / Instrucciones</label>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs text-slate-200 placeholder-slate-650 resize-y scrollbar-thin"
                placeholder="Escribe instrucciones del sistema..."
              />
            </div>

            {/* User Message */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Mensaje del Usuario (Input)</label>
              <textarea
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-xs text-slate-200 placeholder-slate-650 resize-y scrollbar-thin"
                placeholder="Escribe el mensaje a enviar..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingTest}
              className="w-full bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-650/15 text-xs cursor-pointer"
            >
              {isLoadingTest ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Ejecutando petición...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Ejecutar Test Diagnóstico
                </>
              )}
            </button>
          </form>

          {/* Results Display (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Latency & Info Gauges */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`border rounded-2xl p-4 flex flex-col justify-between h-24 transition ${result ? getLatencyColor(result.latencyMs) : 'border-slate-850 bg-slate-900/10 text-slate-500'}`}>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Latencia de Red</span>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-extrabold font-mono">{result ? `${result.latencyMs} ms` : "-- ms"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Clasificación: <strong className="underline">{result ? getLatencyRating(result.latencyMs) : "Ninguna"}</strong></p>
                </div>
              </div>

              <div className={`border rounded-2xl p-4 flex flex-col justify-between h-24 transition ${result ? (result.ok ? 'border-emerald-500/35 bg-emerald-500/5 text-emerald-450' : 'border-red-500/35 bg-red-500/5 text-red-450') : 'border-slate-850 bg-slate-900/10 text-slate-500'}`}>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Estado Conexión</span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-bold truncate">
                    {result ? (result.ok ? "✅ ÉXITO (HTTP 200)" : "❌ ERROR API") : "--"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    {result ? (result.ok ? `Modelo: ${result.modelUsed}` : "Fallo en proveedor") : "Sin peticiones"}
                  </p>
                </div>
              </div>
            </div>

            {/* Response Console Box */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[380px]">
              
              {/* Console Header */}
              <div className="bg-slate-900/80 px-4 py-3 flex items-center justify-between border-b border-slate-850 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Terminal className="h-4 w-4 text-indigo-400" />
                  <span>consola-respuestas-ia</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {result ? result.engineUsed : "idle"}
                </span>
              </div>

              {/* Console Body */}
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin select-text">
                {isLoadingTest && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                    <span className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-xs">Esperando respuesta del servidor de IA...</p>
                  </div>
                )}

                {!isLoadingTest && !result && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
                    <Info className="h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs">No hay pruebas activas.</p>
                    <p className="text-[10px] text-slate-650 max-w-xs mt-1">Configura el formulario de la izquierda y presiona "Ejecutar Test" para comenzar el diagnóstico.</p>
                  </div>
                )}

                {!isLoadingTest && result && (
                  <div className="space-y-4">
                    {result.ok ? (
                      <div className="space-y-2">
                        <div className="text-emerald-400 font-semibold border-b border-slate-850 pb-1.5 flex justify-between items-center text-[10px]">
                          <span>Respuesta del Modelo:</span>
                          <span className="font-mono text-slate-500">Ok</span>
                        </div>
                        <p className="text-slate-200 whitespace-pre-wrap select-text">{result.reply}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-red-400">
                        <div className="text-red-400 font-semibold border-b border-slate-850 pb-1.5 flex items-center gap-1 text-[10px]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Error Detallado de la API:</span>
                        </div>
                        <pre className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl overflow-x-auto text-[11px] text-red-300 font-mono whitespace-pre-wrap select-text">
                          {result.error}
                        </pre>
                        <p className="text-[10px] text-slate-500">
                          Tip: Verifica que la llave correspondiente esté configurada en tu archivo <code className="text-indigo-400">.env</code> y que el endpoint de red del proveedor esté disponible.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

// Simple Icon component helper since RefreshCw wasn't fully imported or is custom
function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
