import { type NextRequest, NextResponse } from "next/server"
import { extractAndParseJSON } from "@/lib/json-utils"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

// Tarifas USD por 1M de tokens
const TARIFF_DEEPSEEK_IN = 0.14
const TARIFF_DEEPSEEK_OUT = 0.28
const TARIFF_OPENAI_IN = 0.150
const TARIFF_OPENAI_OUT = 0.600
const TARIFF_GEMINI_IN = 0.075
const TARIFF_GEMINI_OUT = 0.30

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, targetUrl, currentText, niche = "Consultoría de Software Avanzada, Automatización e Inteligencia Artificial" } = body

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action parameter" }, { status: 400 })
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
    const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat"

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash"
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

    let promptSystem = ""
    let promptUser = ""

    if (action === "generate-meta") {
      promptSystem = `Actúas como un Redactor SEO Experto. Tu nicho es: "${niche}". Genera una Meta Descripción optimizada para SEO (máx. 155 caracteres) para la URL dada. Debe ser atractiva, directa al grano, con un claro llamado a la acción (CTA) implícito y orientada a mejorar el CTR en buscadores.`
      promptUser = `Genera la Meta Descripción para la página: "${targetUrl}". El texto del título actual es: "${currentText || ''}". Responde estrictamente con un formato JSON conteniendo únicamente la clave "metaDescription" y el valor correspondiente.`
    } else if (action === "optimize-title") {
      promptSystem = `Actúas como un Redactor SEO Experto. Tu nicho es: "${niche}". Optimiza el título SEO para la URL dada. El nuevo título debe tener menos de 65 caracteres, ser extremadamente llamativo para aumentar el CTR y contener palabras clave clave de forma natural.`
      promptUser = `Optimiza este título: "${currentText}". Dirección URL: "${targetUrl}". Responde estrictamente con un formato JSON conteniendo únicamente la clave "optimizedTitle".`
    } else if (action === "generate-alt") {
      promptSystem = `Actúas como un experto en accesibilidad web (A11y) y SEO de imágenes. Tu nicho es: "${niche}". Escribe 3 alternativas optimizadas y descriptivas de atributos ALT para imágenes ubicadas en la sección provista.`
      promptUser = `Sección del sitio: "${targetUrl}". Describe de forma concisa pero con palabras clave de valor el ALT de las imágenes. Responde estrictamente con un formato JSON conteniendo únicamente la clave "altTexts" (un arreglo de 3 strings).`
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    let resultJson: any = null
    let tokensIn = 0
    let tokensOut = 0
    let costUsd = 0.0
    let usedProvider = ""

    // 1. INTENTAR CON DEEPSEEK PRIMERO (Prioridad solicitada por el usuario)
    if (DEEPSEEK_API_KEY) {
      try {
        usedProvider = "DeepSeek"
        const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
              { role: "system", content: promptSystem },
              { role: "user", content: promptUser }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
          }),
          signal: AbortSignal.timeout(10000)
        })

        if (res.ok) {
          const data = await res.json()
          const rawText = data.choices?.[0]?.message?.content || ""
          resultJson = extractAndParseJSON(rawText)

          if (data.usage) {
            tokensIn = data.usage.prompt_tokens || 0
            tokensOut = data.usage.completion_tokens || 0
            costUsd = (tokensIn * TARIFF_DEEPSEEK_IN / 1000000) + (tokensOut * TARIFF_DEEPSEEK_OUT / 1000000)
          }
        }
      } catch (err) {
        console.error("DeepSeek failed in optimize API, falling back to OpenAI:", err)
      }
    }

    // 2. FALLBACK A OPENAI
    if (!resultJson && OPENAI_API_KEY) {
      try {
        usedProvider = "OpenAI"
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              { role: "system", content: promptSystem },
              { role: "user", content: promptUser }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2
          }),
          signal: AbortSignal.timeout(10000)
        })

        if (res.ok) {
          const data = await res.json()
          const rawText = data.choices?.[0]?.message?.content || ""
          resultJson = extractAndParseJSON(rawText)

          if (data.usage) {
            tokensIn = data.usage.prompt_tokens || 0
            tokensOut = data.usage.completion_tokens || 0
            costUsd = (tokensIn * TARIFF_OPENAI_IN / 1000000) + (tokensOut * TARIFF_OPENAI_OUT / 1000000)
          }
        }
      } catch (err) {
        console.error("OpenAI failed in optimize API, falling back to Gemini:", err)
      }
    }

    // 3. FALLBACK A GEMINI
    if (!resultJson && GEMINI_API_KEY) {
      try {
        usedProvider = "Gemini"
        const geminiBody = {
          contents: [
            {
              parts: [
                {
                  text: `${promptSystem}\n\n${promptUser}`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        }

        const res = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
          signal: AbortSignal.timeout(10000)
        })

        if (res.ok) {
          const data = await res.json()
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
          resultJson = extractAndParseJSON(rawText)

          if (data.usageMetadata) {
            tokensIn = data.usageMetadata.promptTokenCount || 0
            tokensOut = data.usageMetadata.candidatesTokenCount || 0
            costUsd = (tokensIn * TARIFF_GEMINI_IN / 1000000) + (tokensOut * TARIFF_GEMINI_OUT / 1000000)
          }
        }
      } catch (err) {
        console.error("Gemini fallback failed:", err)
      }
    }

    // Normalizar estructura de respuesta para altTexts
    if (resultJson) {
      if (action === "generate-alt") {
        if (Array.isArray(resultJson)) {
          resultJson = { altTexts: resultJson }
        } else if (resultJson.alt_texts && !resultJson.altTexts) {
          resultJson.altTexts = resultJson.alt_texts
        } else if (resultJson.images && !resultJson.altTexts) {
          resultJson.altTexts = resultJson.images
        } else if (!resultJson.altTexts) {
          const stringVals = Object.values(resultJson).filter(v => typeof v === "string")
          if (stringVals.length > 0) {
            resultJson = { altTexts: stringVals.slice(0, 3) }
          }
        }
      }
    }

    // Heurística inteligente si los proveedores de IA están saturados, sin cuota o ausentes
    if (!resultJson) {
      const cleanUrl = targetUrl ? targetUrl.replace(/^\//, "").replace(/-/g, " ") : "sitio"
      const capitalized = cleanUrl.charAt(0).toUpperCase() + cleanUrl.slice(1)
      usedProvider = "IA Heurística (Motor Local)"

      if (action === "generate-alt") {
        resultJson = {
          altTexts: [
            `Plataforma ${capitalized} - Desarrollo de Software y Aprendizaje con Inteligencia Artificial`,
            `Interfaz de proyectos interactivos y código en vivo en ${capitalized}`,
            `Mentoría personalizada y comunidad de desarrolladores en ${capitalized}`
          ]
        }
      } else if (action === "generate-meta") {
        resultJson = {
          metaDescription: `Aprende programación moderna, desarrollo web e Inteligencia Artificial con proyectos prácticos y mentoría técnica especializada en ${capitalized}.`
        }
      } else if (action === "optimize-title") {
        resultJson = {
          optimizedTitle: `${currentText ? currentText.slice(0, 50) : capitalized} | Aprende Código e IA`
        }
      }
    }

    return NextResponse.json({
      success: true,
      provider: usedProvider,
      result: resultJson,
      usage: {
        tokensIn,
        tokensOut,
        costUsd
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error al optimizar con IA" },
      { status: 500 }
    )
  }
}
