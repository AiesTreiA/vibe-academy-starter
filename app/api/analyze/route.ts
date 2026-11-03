import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { recordAIUsage } from "@/lib/ai-quota-service"

export async function POST(req: Request) {
  console.log("=== API ANALYZE POST called ===")
  console.log("Environment:", process.env.NODE_ENV)
  console.log("Method received:", req.method)

  try {
    const body = await req.json().catch(() => ({}))
    const text: string = (body?.text || "").trim()
    const consultationId = body?.consultationId

    console.log("Text length received:", text.length)
    console.log("Consultation ID:", consultationId || "none")

    // Validaciones iniciales
    if (!text || text.length < 10) {
      return NextResponse.json({ ok: false, error: "Texto inválido" }, { status: 400 })
    }

    // === CONFIGURACIÓN DE DEEPSEEK ===
    const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1"
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat"

    if (!DEEPSEEK_API_KEY) {
      console.error("❌ DEEPSEEK_API_KEY no está configurada en producción")
      return NextResponse.json({ 
        ok: false, 
        error: "deepseek_api_key_missing" 
      }, { status: 500 })
    }

    console.log("DeepSeek Base URL used:", `${DEEPSEEK_BASE}/chat/completions`)
    console.log("Model:", DEEPSEEK_MODEL)
    console.log("API Key length:", DEEPSEEK_API_KEY.length)

    // System Prompt
    // System Prompt
    const systemPrompt = `Eres Javier Mujica, Ingeniero Civil Industrial y consultor experto en optimización de procesos, RPA y digitalización.

Responde **EXCLUSIVAMENTE** con un objeto JSON válido.
No escribas nada más: ni texto, ni markdown, ni explicaciones, ni bloques de código.

Devuelve SOLO un JSON con exactamente estas 7 claves:

{
  "potencial": "ALTO" | "MEDIO" | "BAJO",
  "potencial_desc": "descripción breve",
  "diagnostico": "análisis de la situación actual",
  "impacto": "impacto esperado",
  "solucion": "propuesta de solución",
  "ahorro": "estimación de ahorro o beneficio en USD",
  "siguiente_paso": "qué se recomienda hacer a continuación"
}

REGLAS DE PRECIOS Y MONEDA (IMPORTANTE):
- Toda referencia de presupuesto y valores DEBE estar expresada en DÓLARES AMERICANOS (USD).
- Para empresas de 1 persona / micro / emprendedores ("pequena"), las estimaciones de proyecto deben mantenerse en un rango ágil de entre $800 USD y máximo $2,000 USD totales.
- Para empresas medianas ("mediana"), el rango referencial es de $2,500 USD a $7,000 USD.
- Para empresas grandes ("grande"), los proyectos se justifican entre $8,000 USD y $25,000+ USD.

Si no puedes estimar algún campo con seguridad, usa una cadena vacía "".

Analiza el siguiente input del usuario y responde en formato JSON.`

    const userPrompt = `INPUT DEL USUARIO:\n${text}\n\nAnaliza esta información como consultor experto y devuelve únicamente el JSON solicitado.`

    let rawText = ""
    let parsed: any = null

    // 1. Try DeepSeek Direct API
    if (DEEPSEEK_API_KEY) {
      try {
        console.log("DeepSeek URL:", `${DEEPSEEK_BASE}/chat/completions`)
        const dsChatResp = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 1200,
          }),
        })

        if (dsChatResp.ok) {
          const dsChatJson = await dsChatResp.json()
          rawText = dsChatJson.choices?.[0]?.message?.content || ""
          if (dsChatJson.usage) {
            const inTokens = dsChatJson.usage.prompt_tokens || 0
            const outTokens = dsChatJson.usage.completion_tokens || 0
            recordAIUsage("deepseek", (inTokens * 0.14 / 1000000) + (outTokens * 0.28 / 1000000))
          }
        } else {
          console.warn("⚠️ DeepSeek API failed status:", dsChatResp.status)
        }
      } catch (err: any) {
        console.warn("⚠️ DeepSeek call failed:", err.message)
      }
    }

    // 2. Fallback to Anthropic Claude if DeepSeek failed
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!rawText && ANTHROPIC_API_KEY) {
      try {
        const claudeModel = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001"
        console.log(`🤖 Falling back to Anthropic Claude (${claudeModel}) for proposal analysis...`)
        const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 1200,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            temperature: 0.2
          })
        })

        if (anthropicResp.ok) {
          const data = await anthropicResp.json()
          rawText = data.content?.[0]?.text || ""
          if (data.usage) {
            const inTokens = data.usage.input_tokens || 0
            const outTokens = data.usage.output_tokens || 0
            recordAIUsage("anthropic", (inTokens * 1.00 / 1000000) + (outTokens * 5.00 / 1000000))
          }
        }
      } catch (claudeErr: any) {
        console.warn("⚠️ Anthropic Claude fallback failed:", claudeErr.message)
      }
    }

    // 3. Fallback to OpenAI if both failed
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!rawText && OPENAI_API_KEY) {
      try {
        console.log("🤖 Falling back to OpenAI (gpt-4o-mini)...")
        const oaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 1200
          })
        })

        if (oaiResp.ok) {
          const data = await oaiResp.json()
          rawText = data.choices?.[0]?.message?.content || ""
          if (data.usage) {
            const inTokens = data.usage.prompt_tokens || 0
            const outTokens = data.usage.completion_tokens || 0
            recordAIUsage("openai", (inTokens * 0.15 / 1000000) + (outTokens * 0.60 / 1000000))
          }
        }
      } catch (oaiErr: any) {
        console.warn("⚠️ OpenAI fallback failed:", oaiErr.message)
      }
    }

    if (!rawText.trim()) {
      return NextResponse.json({ ok: false, error: "all_ai_providers_failed" }, { status: 200 })
    }

    // Parsear JSON de la respuesta
    try {
      parsed = JSON.parse(rawText.trim())
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {}
      }
    }

    if (!parsed) {
      return NextResponse.json({ ok: false, error: "IA response not JSON", raw: rawText }, { status: 200 })
    }

    console.log("✅ Successfully parsed AI diagnosis response")


    // === CARGAR DETALLES DEL CLIENTE PARA CONTEXTO ===
    let companySize = "pequena"
    let currentChallenge = ""
    let companyName = ""
    
    if (consultationId) {
      try {
        const supabase = getSupabaseAdminClient() as any
        const { data: evalData } = await supabase
          .from("consultation_evaluations")
          .select("company, company_size, current_challenge")
          .eq("id", consultationId)
          .single()
        
        if (evalData) {
          companyName = evalData.company || ""
          companySize = evalData.company_size || "pequena"
          currentChallenge = evalData.current_challenge || ""
          console.log("🔍 Loaded consultation data from DB:", { companyName, companySize, challengeLen: currentChallenge.length })
        }
      } catch (dbErr) {
        console.error("⚠️ Failed to load consultation details from DB:", dbErr)
      }
    }

    // Fallbacks si no se encontró en BD
    if (!companyName) {
      const matchCompany = text.match(/Empresa:\s*(.*)/i)
      if (matchCompany) companyName = matchCompany[1].trim()
    }
    if (!companySize) {
      const matchSize = text.match(/Tamaño:\s*(.*)/i)
      if (matchSize) companySize = matchSize[1].trim()
    }
    if (!currentChallenge) {
      const matchChallenge = text.match(/Desafío Actual:\s*([\s\S]*)/i)
      if (matchChallenge) currentChallenge = matchChallenge[1].trim()
    }

    // === INTEGRACIÓN DE GEMINI PARA MODULACIÓN ===
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (GEMINI_API_KEY) {
      console.log("🤖 Modulating response with Gemini...")
      try {
        let geminiModel = "gemini-2.5-flash"
        let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`

        
        const geminiPrompt = `
Eres un consultor de negocios y estratega comercial experto en startups y optimización de procesos. Tu trabajo es revisar y modular una propuesta técnica y de diagnóstico generada por una IA para adaptarla perfectamente al tamaño de la empresa y al contexto del cliente.

CONTEXTO DEL CLIENTE:
- Nombre de la Empresa: ${companyName}
- Tamaño de la Empresa: ${companySize} (pequena = pequeña/micro/individual/1 persona, mediana, grande)
- Desafío/Necesidad del Cliente: "${currentChallenge}"

PROPUESTA GENERADA POR LA IA (DEEPSEEK):
${JSON.stringify(parsed, null, 2)}

REGLAS OBLIGATORIAS DE MONEDA:
- La moneda de todas las cotizaciones y propuestas DEBE ser USD (Dólares AmericanOS). No uses CLP.

REGLAS DE ESCALA DE PRESUPUESTO SEGÚN TAMAÑO:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 EMPRESA PEQUEÑA / 1 PERSONA ("pequena")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este cliente puede ser un terapeuta, psicólogo, coach, consultor independiente o emprendedor de 1 persona que quiere automatizar procesos simples de marketing o ventas. Las propuestas infladas asustan y generan rechazo inmediato.

REGLAS OBLIGATORIAS para empresa de 1 persona o muy pequeña:
- El ticket MÍNIMO de entrada es de $300 USD (Plan Starter).
- El presupuesto MÁXIMO total de cualquier proyecto para 1 persona no debe superar los $2,000 USD (el rango total completo debe ubicarse entre $800 USD y $2,000 USD máximo).
- Usa el nombre "Plan Starter" para el tier de entrada más simple (ej: chatbot básico, formulario automatizado o landing de ventas simple).
- Si el cliente necesita algo más completo, la solución integral total no debe exceder los $2,000 USD.
- La propuesta debe ser "Lean": focalizada en un MVP, ágil, económica y de rápida implementación (1 a 3 semanas).
- Todos los montos en "items" DEBEN estar expresados estrictamente en USD (ej: "$300 USD", "$500 USD", "$800 USD", "$1,200 USD").
- Modifica "solucion" y "siguiente_paso" para reflejar este enfoque amigable en USD.
- Agrega "propuesta_comercial" con "usar_propuesta_personalizada": true.

Ejemplo de estructura de precios en USD para empresa de 1 persona:
  - Plan Starter: $300 USD (implementación de 1 herramienta simple, ej: chatbot básico o formulario automatizado)
  - Plan Básico Mkt/Automatización: $500 USD – $800 USD (2–3 herramientas integradas)
  - Plan Completo: hasta $1,500 USD – $2,000 USD (solución integral dentro del límite de 1 persona)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 EMPRESA MEDIANA ("mediana")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Propuesta de costo fijo en USD.
- El presupuesto referencial total debe mantenerse entre $2,500 USD y $7,000 USD para proyectos medianos.
- Agrega "propuesta_comercial" con "usar_propuesta_personalizada": false.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 EMPRESA GRANDE ("grande")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Propuesta enterprise en USD.
- Proyectos sobre $8,000 USD hasta $25,000+ USD se justifican plenamente para empresas grandes.
- Agrega "propuesta_comercial" con "usar_propuesta_personalizada": false.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 DESCUENTO DEL 60% (aplica a todos los tamaños)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Si el cliente solicitó un descuento en el chat, aplica un 60% de descuento sobre el precio publicado en USD.
- En ese caso, agrega en "propuesta_comercial" la clave "descuento_aplicado": true y muestra el precio con descuento en USD claramente.
- Si no solicitó descuento, omite la clave o ponla como false.

INSTRUCCIONES ADICIONALES:
- Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido con las mismas claves originales más la clave "propuesta_comercial". No incluyas markdown (no uses triple backticks), ni explicaciones fuera del JSON.
- Asegúrate de que todos los montos en "items" reflejen fielmente las reglas de escala en USD según el tamaño de empresa.

Esquema JSON esperado:
{
  "potencial": "ALTO" | "MEDIO" | "BAJO",
  "potencial_desc": "...",
  "diagnostico": "...",
  "impacto": "...",
  "solucion": "...",
  "ahorro": "...",
  "siguiente_paso": "...",
  "propuesta_comercial": {
    "usar_propuesta_personalizada": boolean,
    "titulo": "string (ej: Plan Starter / Plan Lean / Plan Empresarial)",
    "descripcion": "string (descripción clara del modelo de cobro en USD, lenguaje accesible y sin jerga intimidante)",
    "descuento_aplicado": boolean,
    "items": [
      {
        "concepto": "string (ej: Plan Starter – Chatbot básico)",
        "monto": "string (ej: $300 USD)"
      },
      {
        "concepto": "string (ej: Integración Mkt / CRM)",
        "monto": "string (ej: $500 USD)"
      }
    ]
  }
}
`.trim()

        const geminiBody = {
          contents: [
            {
              parts: [
                {
                  text: geminiPrompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }

        let geminiResp = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
          signal: AbortSignal.timeout(15000)
        })

        if (!geminiResp.ok) {
          const errText = await geminiResp.text()
          console.warn(`Gemini ${geminiModel} failed (Status: ${geminiResp.status}). Retrying with gemini-1.5-pro...`, errText)
          geminiModel = "gemini-1.5-pro"
          geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`
          geminiResp = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geminiBody),
            signal: AbortSignal.timeout(15000)
          })
        }

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json()
          const rawGeminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
          if (rawGeminiText.trim()) {
            let geminiParsed = null
            try {
              geminiParsed = JSON.parse(rawGeminiText.trim())
            } catch {
              const jsonMatch = rawGeminiText.match(/\{[\s\S]*?\}/)
              if (jsonMatch) {
                try {
                  geminiParsed = JSON.parse(jsonMatch[0])
                } catch {}
              }
            }
            if (geminiParsed) {
              console.log("✅ Gemini successfully modulated the proposal")
              parsed = geminiParsed
            } else {
              console.warn("⚠️ Gemini response could not be parsed as JSON:", rawGeminiText)
            }
          }
        } else {
          console.warn("⚠️ Gemini API error status:", geminiResp.status)
        }
      } catch (geminiErr) {
        console.error("❌ Exception during Gemini modulation:", geminiErr)
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY not configured, skipping modulation")
    }

    // Guardar en Supabase
    if (consultationId) {
      try {
        const supabase = getSupabaseAdminClient() as any
        await supabase
          .from("consultation_evaluations")
          .update({
            ai_diagnosis: parsed,
            updated_at: new Date().toISOString()
          })
          .eq("id", consultationId)
      } catch (e) {
        console.error("Failed to save in Supabase:", e)
      }
    }

    return NextResponse.json({ ok: true, data: parsed })

  } catch (err: any) {
    console.error("analyze route error:", err)
    return NextResponse.json({
      ok: false,
      error: err?.message || "internal_error"
    }, { status: 500 })
  }
}