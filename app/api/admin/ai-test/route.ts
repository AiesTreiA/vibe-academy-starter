import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({
      keys: {
        anthropic: !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
        huawei: !!process.env.HUAWEI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        nvidia: !!(process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY),
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const start = Date.now()
  try {
    const body = await req.json().catch(() => ({}))
    const engine = (body.engine || "").toLowerCase()
    const modelOverride = (body.model || "").trim()
    const systemPrompt = (body.systemPrompt || "").trim()
    const message = (body.message || "").trim()
    const history = body.history || [] // [{ role: "user" | "assistant", content: string }]

    if (!message) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
    }

    let reply = ""
    let modelUsed = ""

    if (engine === "anthropic") {
      const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
      if (!key) throw new Error("ANTHROPIC_API_KEY / CLAUDE_API_KEY no configurada")

      modelUsed = modelOverride || "claude-3-5-sonnet-20241022"
      
      const payloadMessages = history.map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content
      }))
      payloadMessages.push({ role: "user", content: message })

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: modelUsed,
          max_tokens: 1024,
          system: systemPrompt,
          messages: payloadMessages,
          temperature: 0.7
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data = await res.json()
      reply = data.content?.[0]?.text || ""

    } else if (engine === "huawei") {
      const key = process.env.HUAWEI_API_KEY
      if (!key) throw new Error("HUAWEI_API_KEY no configurada")

      const endpoint = process.env.HUAWEI_OPENAI_ENDPOINT || "https://api-ap-southeast-1.modelarts-maas.com/openai/v1"
      modelUsed = modelOverride || process.env.HUAWEI_MODEL || "DeepSeek-V3"

      const payloadMessages = []
      if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt })
      }
      for (const h of history) {
        payloadMessages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content
        })
      }
      payloadMessages.push({ role: "user", content: message })

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: payloadMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data = await res.json()
      reply = data.choices?.[0]?.message?.content || ""

    } else if (engine === "gemini") {
      const key = process.env.GEMINI_API_KEY
      if (!key) throw new Error("GEMINI_API_KEY no configurada")

      let targetModel = modelOverride || process.env.GEMINI_MODEL || "gemini-2.5-flash"
      if (targetModel === "gemini-2.0-flash" || targetModel === "gemini-1.5-pro") {
        targetModel = "gemini-2.5-flash"
      }
      modelUsed = targetModel

      const contents = []
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        })
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      })

      let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent?key=${key}`
      let res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: systemPrompt ? {
            parts: [{ text: systemPrompt }]
          } : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        if (res.status === 429) {
          throw new Error(`HTTP 429 (Saldo Prepagado Agotado en Google AI Studio): ${errText}`)
        }
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data = await res.json()
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    } else if (engine === "deepseek") {
      const key = process.env.DEEPSEEK_API_KEY
      if (!key) throw new Error("DEEPSEEK_API_KEY no configurada")

      const endpoint = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
      modelUsed = modelOverride || process.env.DEEPSEEK_MODEL || "deepseek-chat"

      const payloadMessages = []
      if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt })
      }
      for (const h of history) {
        payloadMessages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content
        })
      }
      payloadMessages.push({ role: "user", content: message })

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: payloadMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data = await res.json()
      reply = data.choices?.[0]?.message?.content || ""

    } else if (engine === "openai") {
      const key = process.env.OPENAI_API_KEY
      if (!key) throw new Error("OPENAI_API_KEY no configurada")

      modelUsed = modelOverride || process.env.OPENAI_MODEL || "gpt-4o-mini"

      const payloadMessages = []
      if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt })
      }
      for (const h of history) {
        payloadMessages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content
        })
      }
      payloadMessages.push({ role: "user", content: message })

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: payloadMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data = await res.json()
      reply = data.choices?.[0]?.message?.content || ""

    } else if (engine === "nvidia") {
      const key = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY
      if (!key) throw new Error("NVIDIA_API_KEY no configurada")

      const endpoint = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1"
      modelUsed = modelOverride || process.env.NVIDIA_MODEL || "deepseek-ai/deepseek-v4.1-flash"

      const payloadMessages = []
      if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt })
      }
      for (const h of history) {
        payloadMessages.push({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content
        })
      }
      payloadMessages.push({ role: "user", content: message })

      const res = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: payloadMessages,
          temperature: 0.6,
          max_tokens: 1500
        })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`HTTP ${res.status}: ${errText}`)
      }

      const data = await res.json()
      reply = data.choices?.[0]?.message?.content || ""

    } else {
      throw new Error(`Motor '${engine}' no soportado o inválido`)
    }

    const latencyMs = Date.now() - start
    return NextResponse.json({
      ok: true,
      reply,
      latencyMs,
      engineUsed: engine,
      modelUsed
    })

  } catch (err: any) {
    const latencyMs = Date.now() - start
    console.error("AI Playground test error:", err)
    return NextResponse.json({
      ok: false,
      error: err.message || "Error desconocido",
      latencyMs
    }, { status: 200 }) // Return 200 so the UI can capture the error object nicely
  }
}
