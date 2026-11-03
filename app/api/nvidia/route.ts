import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 45 // Vercel timeout max duration for LLM inference

// Simple in-memory rate limiter per IP (max 6 requests per 10 mins per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxRequests = 25

  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count += 1
  return { allowed: true, remaining: maxRequests - record.count }
}

const SYSTEM_PROMPTS: Record<string, string> = {
  architecture: `Eres el Lead AI Architect de Vibecode Lab y especialista en infraestructura NVIDIA. 
Tu misión es diseñar arquitecturas de software modernas, serverless y listas para producción.
Cuando el usuario te presente su idea o continúe la conversación:
1. Define el Stack Tecnológico Recomendado (Frontend Next.js, Backend Serverless/Edge, Base de datos Supabase/PostgreSQL, Proveedores de Inferencia como NVIDIA NIM).
2. Estructura de Componentes y Modelos de IA necesarios.
3. Estimación de ventajas de usar inferencia acelerada sobre GPUs NVIDIA.
Mantén la continuidad de la conversación, sé conciso, técnico, estructurado y con formato Markdown impecable.`,

  code_review: `Eres el Principal Code Reviewer de Vibecode Lab con especialización en algoritmos de alto rendimiento y código para IA.
Cuando el usuario te entregue un código o te haga preguntas de seguimiento:
1. Diagnóstico de calidad, complejidad y posibles cuellos de botella o bugs.
2. Versión refactorizada y optimizada con código limpio.
3. Recomendaciones de cómo potenciarlo con agentes de software autónomos.
Sé directo, constructivo y profesional.`,

  agent_blueprint: `Eres el Diseñador de Agentes Autónomos de Vibecode Lab.
Tu rol es entregar el "Blueprint" de un agente de IA autónomo para la tarea que pida el usuario y profundizar según sus preguntas:
1. Perfil del Agente (System Prompt y personalidad).
2. Herramientas y APIs (Tools/Functions) que debe tener conectadas.
3. Flujo de toma de decisiones (Loop de razonamiento, memoria y persistencia).
4. Prompt de activación.
Formato estructurado y listo para implementar con Next.js o SDKs de agentes.`,

  vision_ai: `Eres el Especialista en Visión por Computador y UI/UX de Vibecode Lab.
Tu misión es diseñar cómo un Agente de Visión (Llama Vision / Nemotron Visual) analiza una imagen, captura de pantalla o wireframe:
1. Proceso de descomposición visual (jerarquía tipográfica, componentes detectados, espaciado).
2. Detección de fallos de accesibilidad, contraste y experiencia de usuario.
3. Especificación de componentes y código Tailwind CSS correspondiente.
Sé directo, técnico y estructurado con Markdown.`,

  custom: `Eres el Asistente Técnico y Mentor de IA de Vibecode Lab, impulsado por NVIDIA NIM a costo $0.
Tu objetivo es ayudar al usuario a conceptualizar, estructurar y programar su aplicación web o SaaS con IA.
Responde de forma precisa, experta y técnica manteniendo la continuidad de la conversación en formato Markdown.
Cuando sea relevante, recuérdale que estas técnicas de inferencia a costo $0 y lanzamiento se enseñan en profundidad en el Bootcamp Vibecode Lab.`
}

export async function POST(req: Request) {
  const start = Date.now()

  try {
    // Determine client IP for gentle rate limiting
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "anonymous"
    const rateCheck = checkRateLimit(ip)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Has alcanzado el límite de consultas gratuitas de esta sesión de prueba. Para aprender a conectar tus propias APIs ilimitadas y construir tu SaaS, regístrate en la 2da Generación de Vibecode Lab."
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const prompt = (body.prompt || "").trim()
    const mode = (body.mode || "architecture").toLowerCase()
    const model = (body.model || "meta/llama-3.2-11b-vision-instruct").trim()

    const apiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "NVIDIA_API_KEY no está configurada en las variables de entorno del servidor. Por favor verifica tu .env.local o Vercel."
        },
        { status: 500 }
      )
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.custom

    // Build message list (support multi-turn chat history)
    let formattedMessages: Array<{ role: string; content: string }> = []

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      formattedMessages = body.messages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
        content: String(m.content || "")
      }))
      // Ensure system prompt is first
      if (formattedMessages[0]?.role !== "system") {
        formattedMessages.unshift({ role: "system", content: systemPrompt })
      }
    } else {
      if (!prompt) {
        return NextResponse.json({ error: "El prompt no puede estar vacío" }, { status: 400 })
      }
      formattedMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    }

    const payload = {
      model,
      messages: formattedMessages,
      temperature: 0.6,
      max_tokens: 1800
    }

    const nvidiaUrl = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1"

    const response = await fetch(`${nvidiaUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("NVIDIA NIM API Error:", response.status, errText)

      // Friendly fallback messages
      if (response.status === 401) {
        throw new Error("Clave de API de NVIDIA inválida o expirada.")
      } else if (response.status === 429) {
        throw new Error("El endpoint de NVIDIA está experimentando alta demanda de inferencia. Intenta de nuevo en unos segundos.")
      }
      throw new Error(`Error en NVIDIA NIM (HTTP ${response.status}): ${errText.slice(0, 150)}`)
    }

    const data = await response.json()
    const msg = data.choices?.[0]?.message
    let reply = ""
    if (msg?.content && msg?.reasoning_content) {
      reply = `> 🧠 **Pensamiento / Reasoning (Chain of Thought):**\n> ${msg.reasoning_content.split("\n").join("\n> ")}\n\n${msg.content}`
    } else if (msg?.content) {
      reply = msg.content
    } else if (msg?.reasoning_content) {
      reply = msg.reasoning_content
    } else {
      reply = "No se obtuvo contenido de respuesta del modelo."
    }

    const latencyMs = Date.now() - start

    return NextResponse.json({
      ok: true,
      reply,
      latencyMs,
      modelUsed: model,
      hardware: "NVIDIA TensorRT-LLM (Cloud NIM)",
      remainingQueries: rateCheck.remaining
    })

  } catch (err: any) {
    const latencyMs = Date.now() - start
    console.error("Error in /api/nvidia:", err)
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Error procesando inferencia en NVIDIA NIM",
        latencyMs
      },
      { status: 500 }
    )
  }
}
