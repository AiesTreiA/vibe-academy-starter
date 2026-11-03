import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { extractAndParseJSON } from "@/lib/json-utils"
import { recordAIUsage } from "@/lib/ai-quota-service"
import { generateOrFetchArticleImage } from "@/lib/article-image-service"

export const maxDuration = 60
export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

function getDeepSeekEndpoint(rawBaseUrl?: string): string {
  if (!rawBaseUrl) return "https://api.deepseek.com/chat/completions"
  let clean = rawBaseUrl.trim().replace(/\/+$/, "")
  if (clean.endsWith("/chat/completions")) return clean
  return `${clean}/chat/completions`
}

// Tariff Constants (USD per 1M tokens)
const TARIFF_DEEPSEEK_IN = 0.14
const TARIFF_DEEPSEEK_OUT = 0.28
const TARIFF_GEMINI_IN = 0.075
const TARIFF_GEMINI_OUT = 0.30

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { keyword, secondaryKeywords = [], category = "automatizacion", ctaType = "both" } = body

    if (!keyword) {
      return NextResponse.json({ success: false, error: "Missing keyword" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // --- PHASE 0 & 1: Fetch existing articles for RAG / Internal Linking ---
    let existingArticlesSummary = ""
    try {
      const { data: articles, error } = await supabase
        .from("articles")
        .select("title, slug, category")
        .eq("status", "published")
        .limit(5)
      
      if (!error && articles && articles.length > 0) {
        existingArticlesSummary = articles
          .map((a: any) => `- Título: "${a.title}", Enlace: "/articulos/${a.slug}" (Categoría: ${a.category})`)
          .join("\n")
      }
    } catch (e) {
      console.warn("Failed to fetch existing articles for internal linking:", e)
    }

    const siteNavigationInfo = `
Navegaciones del sitio a las que puedes enlazar de manera orgánica:
- Página de Inicio (Servicios de Javier Mujica): "/"
- Programa Vibecode Lab (Curso e Ingesta de Software): "/vibecode"
- Agendamiento de Consultoría / Evaluación: "/agendar"
- Artículos existentes en el blog (inyectar 1 a 2 si es relevante):
${existingArticlesSummary || "No hay artículos publicados todavía."}
`

    // --- SETUP MODEL CONNECTIONS ---
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
    const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat"

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const HUAWEI_API_KEY = process.env.HUAWEI_API_KEY
    const HUAWEI_ENDPOINT = process.env.HUAWEI_OPENAI_ENDPOINT || "https://api-ap-southeast-1.modelarts-maas.com/openai/v1"
    const HUAWEI_MODEL = process.env.HUAWEI_MODEL || "DeepSeek-V3"

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
    const GEMINI_MODEL = "gemini-2.5-flash"
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`


    let contentResult: any = null
    let modelUsedForContent = "DeepSeek-V3"

    // Tokens tracked
    let tokensHuaweiIn = 0
    let tokensHuaweiOut = 0
    let tokensGeminiIn = 0
    let tokensGeminiOut = 0
    let costUsd = 0.00000

    // Prompts
    const promptMaestroSystem = `
Actúas como un Redactor SEO Experto de Alta Conversión (Modelo Antigravity). Escribirás un artículo que sea extremadamente humano, premium, útil y estructurado para superar a la competencia en buscadores.

REGLAS DE REDACCIÓN INCORRUPTIBLES:
1. Cero Relleno: Prohibido usar frases cliché como "en el revolucionario mundo de hoy" o "como todos sabemos". Ve directo al grano.
2. Humano Primero: Escribe con un tono profesional, claro, empático y fluido (español de Chile/Latinoamérica).
3. Cero Alucinación: Si necesitas citar cifras o estadísticas que no conozcas con certeza, escribe exactamente "[VERIFICAR DATOS: Motivo]" en lugar de inventar.
4. Enlazado Interno: Inyecta de manera 100% natural de 3 a 5 enlaces del sitio provisto. Los anchor texts deben fluir orgánicamente (nunca forzar exact-match).
5. FORMATO DE TEXTO EN JSON: Prohibido usar comillas dobles (") sin escapar dentro de los valores de texto. Usa comillas simples (') o comillas angulares (« ») para citas o destacados en Markdown.

Estructura requerida para el contenido:
- Introducción (Hook + Respuesta Rápida / TL;DR destacado).
- Encabezados lógicos (H2, H3, H4) que expliquen el tema a fondo.
- Tabla comparativa o lista legible con ejemplos prácticos.
- Conclusión con una llamada a la acción contextual adaptada.

Responde EXCLUSIVAMENTE con un objeto JSON válido. No escribas nada más, ni comillas triples markdown, ni introducciones.
El esquema JSON debe ser exactamente:
{
  "title": "Título del artículo (H1 orientado a CTR, máx. 70 caracteres)",
  "subtitle": "Breve gancho o subtítulo descriptivo (máx. 150 caracteres)",
  "content": "Contenido del artículo formateado en Markdown (sin el H1, empezando desde el Hook TL;DR, incluyendo enlaces internos orgánicos, tablas y ejemplos)",
  "faq": [
    { "question": "Pregunta real del usuario...", "answer": "Respuesta directa y detallada..." }
  ],
  "myths": [
    { "myth": "Mito común sobre el tema...", "reality": "La verdad explicada de forma clara y fundamentada..." }
  ]
}
`

    const promptMaestroUser = `
Escribe un artículo completo sobre el siguiente tema:
- Palabra Clave Principal: "${keyword}"
- Palabras Clave Secundarias: ${secondaryKeywords.length > 0 ? secondaryKeywords.join(", ") : "Ninguna"}
- Categoría: "${category}"

CONEXIÓN DE ENLACES INTERNOS:
${siteNavigationInfo}
`

    // --- STEP 1: GENERATE CONTENT (Fallback Chain: DeepSeek Direct -> OpenAI gpt-4o-mini -> Huawei -> Gemini) ---
    let generatedRawText = ""
    const providerErrors: string[] = []

    // 1. Try DeepSeek Direct API (with 50s timeout & 1 retry on timeout)
    if (DEEPSEEK_API_KEY) {
      console.log("🚀 Calling DeepSeek Direct API for article drafting...")
      const dsEndpoint = getDeepSeekEndpoint(DEEPSEEK_BASE_URL)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const dsResp = await fetch(dsEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: DEEPSEEK_MODEL,
              messages: [
                { role: "system", content: promptMaestroSystem },
                { role: "user", content: promptMaestroUser }
              ],
              temperature: 0.3,
              max_tokens: 8000,
              response_format: { type: "json_object" }
            }),
            signal: AbortSignal.timeout(50000)
          })

          if (dsResp.ok) {
            const dsData = await dsResp.json()
            generatedRawText = dsData.choices?.[0]?.message?.content || ""
            modelUsedForContent = "DeepSeek Direct (V3)"
            if (dsData.usage) {
              tokensHuaweiIn = dsData.usage.prompt_tokens || 0
              tokensHuaweiOut = dsData.usage.completion_tokens || 0
              costUsd += (tokensHuaweiIn * TARIFF_DEEPSEEK_IN / 1000000) + (tokensHuaweiOut * TARIFF_DEEPSEEK_OUT / 1000000)
            }
            console.log("✅ DeepSeek Direct content generated successfully.")
            break
          } else {
            const errText = await dsResp.text().catch(() => "")
            providerErrors.push(`DeepSeek Intent #${attempt} (HTTP ${dsResp.status}): ${errText.slice(0, 100)}`)
            console.warn(`⚠️ DeepSeek Direct API attempt ${attempt} returned status:`, dsResp.status)
          }
        } catch (err: any) {
          providerErrors.push(`DeepSeek Intent #${attempt} Excepción: ${err.message}`)
          console.warn(`⚠️ DeepSeek Direct API attempt ${attempt} failed:`, err.message)
        }
      }
    } else {
      providerErrors.push("DEEPSEEK_API_KEY no configurada")
    }

    // 2. Try OpenAI gpt-4o-mini
    if (!generatedRawText && OPENAI_API_KEY) {
      console.log("🤖 Trying OpenAI (gpt-4o-mini)...")
      try {
        const oaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              { role: "system", content: promptMaestroSystem },
              { role: "user", content: promptMaestroUser }
            ],
            temperature: 0.3,
            max_tokens: 8000,
            response_format: { type: "json_object" }
          }),
          signal: AbortSignal.timeout(45000)
        })

        if (oaiResp.ok) {
          const oaiData = await oaiResp.json()
          generatedRawText = oaiData.choices?.[0]?.message?.content || ""
          modelUsedForContent = "OpenAI gpt-4o-mini"
          if (oaiData.usage) {
            const inTokens = oaiData.usage.prompt_tokens || 0
            const outTokens = oaiData.usage.completion_tokens || 0
            costUsd += (inTokens * 0.15 / 1000000) + (outTokens * 0.60 / 1000000)
          }
          console.log("✅ OpenAI gpt-4o-mini content generated successfully.")
        } else {
          const errText = await oaiResp.text().catch(() => "")
          providerErrors.push(`OpenAI (HTTP ${oaiResp.status}): ${errText.slice(0, 100)}`)
          console.warn("⚠️ OpenAI API returned status:", oaiResp.status)
        }
      } catch (err: any) {
        providerErrors.push(`OpenAI Excepción: ${err.message}`)
        console.warn("⚠️ OpenAI API failed:", err.message)
      }
    } else if (!generatedRawText) {
      providerErrors.push("OPENAI_API_KEY no configurada")
    }

    // 2.5. Try Anthropic Claude (Sonnet / Haiku)
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!generatedRawText && ANTHROPIC_API_KEY) {
      const claudeModel = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001"
      console.log(`🤖 Trying Anthropic Claude (${claudeModel})...`)
      try {
        const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 8000,
            system: promptMaestroSystem,
            messages: [{ role: "user", content: promptMaestroUser }],
            temperature: 0.3
          }),
          signal: AbortSignal.timeout(45000)
        })

        if (anthropicResp.ok) {
          const data = await anthropicResp.json()
          generatedRawText = data.content?.[0]?.text || ""
          modelUsedForContent = `Anthropic Claude (${claudeModel})`
          if (data.usage) {
            const inTokens = data.usage.input_tokens || 0
            const outTokens = data.usage.output_tokens || 0
            const stepCost = (inTokens * 1.00 / 1000000) + (outTokens * 5.00 / 1000000)
            costUsd += stepCost
            recordAIUsage("anthropic", stepCost)
          }
          console.log("✅ Anthropic Claude content generated successfully.")
        } else {
          const errText = await anthropicResp.text().catch(() => "")
          providerErrors.push(`Anthropic (HTTP ${anthropicResp.status}): ${errText.slice(0, 100)}`)
          console.warn("⚠️ Anthropic Claude API returned status:", anthropicResp.status)
        }
      } catch (err: any) {
        providerErrors.push(`Anthropic Excepción: ${err.message}`)
        console.warn("⚠️ Anthropic Claude API failed:", err.message)
      }
    } else if (!generatedRawText) {
      providerErrors.push("ANTHROPIC_API_KEY / CLAUDE_API_KEY no configurada")
    }

    // 3. Try Huawei Cloud MaaS
    if (!generatedRawText && HUAWEI_API_KEY) {
      console.log("🚀 Trying Huawei Cloud MaaS (DeepSeek-V3)...")
      try {
        const dsResp = await fetch(`${HUAWEI_ENDPOINT}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${HUAWEI_API_KEY}`
          },
          body: JSON.stringify({
            model: HUAWEI_MODEL,
            messages: [
              { role: "system", content: promptMaestroSystem },
              { role: "user", content: promptMaestroUser }
            ],
            temperature: 0.3,
            max_tokens: 8000
          }),
          signal: AbortSignal.timeout(45000)
        })

        if (dsResp.ok) {
          const dsData = await dsResp.json()
          generatedRawText = dsData.choices?.[0]?.message?.content || ""
          modelUsedForContent = "Huawei/DeepSeek-V3"
          if (dsData.usage) {
            tokensHuaweiIn = dsData.usage.prompt_tokens || 0
            tokensHuaweiOut = dsData.usage.completion_tokens || 0
            costUsd += (tokensHuaweiIn * TARIFF_DEEPSEEK_IN / 1000000) + (tokensHuaweiOut * TARIFF_DEEPSEEK_OUT / 1000000)
          }
          console.log("✅ Huawei DeepSeek-V3 content generated successfully.")
        } else {
          const errText = await dsResp.text().catch(() => "")
          providerErrors.push(`Huawei (HTTP ${dsResp.status}): ${errText.slice(0, 100)}`)
          console.warn("⚠️ Huawei Cloud API returned error:", dsResp.status)
        }
      } catch (err: any) {
        providerErrors.push(`Huawei Excepción: ${err.message}`)
        console.warn("⚠️ Huawei Cloud call failed:", err.message)
      }
    } else if (!generatedRawText) {
      providerErrors.push("HUAWEI_API_KEY no configurada")
    }

    // 4. Try Gemini Flash
    if (!generatedRawText && GEMINI_API_KEY) {
      console.log("🤖 Running fallback to Gemini Flash...")
      modelUsedForContent = "Gemini Flash"
      try {
        const geminiBody = {
          contents: [{ parts: [{ text: `${promptMaestroSystem}\n\n${promptMaestroUser}` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8192 }
        }

        const geminiResp = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
          signal: AbortSignal.timeout(35000)
        })

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json()
          generatedRawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
          if (geminiData.usageMetadata) {
            const inTokens = geminiData.usageMetadata.promptTokenCount || 0
            const outTokens = geminiData.usageMetadata.candidatesTokenCount || 0
            tokensGeminiIn += inTokens
            tokensGeminiOut += outTokens
            costUsd += (inTokens * TARIFF_GEMINI_IN / 1000000) + (outTokens * TARIFF_GEMINI_OUT / 1000000)
          }
          console.log("✅ Gemini content generated successfully.")
        } else {
          const errText = await geminiResp.text().catch(() => "")
          providerErrors.push(`Gemini (HTTP ${geminiResp.status}): ${errText.slice(0, 100)}`)
        }
      } catch (err: any) {
        providerErrors.push(`Gemini Excepción: ${err.message}`)
        console.warn("⚠️ Gemini call failed:", err.message)
      }
    } else if (!generatedRawText) {
      providerErrors.push("GEMINI_API_KEY / GOOGLE_API_KEY no configurada")
    }

    if (!generatedRawText) {
      return NextResponse.json({ 
        success: false, 
        error: "Ningún proveedor de IA pudo generar el artículo. Diagnóstico de proveedores: " + providerErrors.join(" | ")
      }, { status: 500 })
    }

    // Parse Content JSON
    try {
      contentResult = extractAndParseJSON(generatedRawText)
    } catch (parseErr: any) {
      console.error("❌ Failed to parse content JSON, using emergency text fallback. Error:", parseErr.message)
      contentResult = {
        title: keyword,
        subtitle: "",
        content: generatedRawText.replace(/^```(?:json|markdown)?/i, "").replace(/```$/, "").trim(),
        faq: [],
        myths: []
      }
    }

    // Safe fallbacks for content fields
    contentResult = contentResult || {}
    contentResult.title = contentResult.title || keyword
    contentResult.subtitle = contentResult.subtitle || ""
    contentResult.content = contentResult.content || ""
    contentResult.faq = Array.isArray(contentResult.faq) ? contentResult.faq : []
    contentResult.myths = Array.isArray(contentResult.myths) ? contentResult.myths : []

    // --- STEP 2: TECHNICAL SEO MARKUP GENERATION (OpenAI / DeepSeek / Gemini Fallback) ---
    console.log("🤖 Running Step 2: Technical SEO schemas...")
    
    const promptTechnicalSystem = `
Eres un especialista en SEO Técnico. Recibirás un artículo con su título y categorías, y debes generar los metadatos de producción e inyección JSON-LD.

Esquema JSON esperado:
{
  "slug": "slug-url-amigable-en-minusculas-separado-por-guiones",
  "meta_title": "Meta Title optimizado para CTR (máx. 60 caracteres)",
  "meta_description": "Meta Description persuasiva (máx. 155 caracteres)",
  "json_ld": {
    "article": {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Título del artículo",
      "image": "/images/optimize-hero.png",
      "author": {
        "@type": "Person",
        "name": "Javier Mujica",
        "url": "https://www.javiermujica.com"
      },
      "publisher": {
        "@type": "ProfessionalService",
        "name": "Javier Mujica · Consultoría en IA y Automatización",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.javiermujica.com/images/logo-isotipo.png"
        }
      }
    },
    "faq": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    },
    "breadcrumb": {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": []
    }
  }
}

INSTRUCCIONES DE BREADCRUMB:
El BreadcrumbList debe mapear: Inicio (/) -> Artículos (/articulos) -> Artículo actual (/articulos/slug).

INSTRUCCIONES DE FAQ:
Construye el FAQPage de Schema a partir de la lista de FAQs provistas.

Responde exclusivamente con el objeto JSON.
`

    const promptTechnicalUser = `
ARTÍCULO GENERADO:
- Título: "${contentResult.title}"
- Subtítulo: "${contentResult.subtitle}"
- Categoría: "${category}"
- FAQs: ${JSON.stringify(contentResult.faq)}
`

    let technicalResult: any = null
    let rawTechText = ""

    // Try OpenAI or DeepSeek for tech schema
    if (OPENAI_API_KEY) {
      try {
        const oaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              { role: "system", content: promptTechnicalSystem },
              { role: "user", content: promptTechnicalUser }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          }),
          signal: AbortSignal.timeout(15000)
        })
        if (oaiResp.ok) {
          const techData = await oaiResp.json()
          rawTechText = techData.choices?.[0]?.message?.content || ""
        }
      } catch (err: any) {
        console.warn("⚠️ Technical schema generation via OpenAI failed:", err.message)
      }
    }

    if (!rawTechText && DEEPSEEK_API_KEY) {
      try {
        const dsResp = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
              { role: "system", content: promptTechnicalSystem },
              { role: "user", content: promptTechnicalUser }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
          }),
          signal: AbortSignal.timeout(15000)
        })
        if (dsResp.ok) {
          const techData = await dsResp.json()
          rawTechText = techData.choices?.[0]?.message?.content || ""
        }
      } catch (err: any) {
        console.warn("⚠️ Technical schema generation via DeepSeek failed:", err.message)
      }
    }

    if (!rawTechText && GEMINI_API_KEY) {
      try {
        const geminiTechnicalBody = {
          contents: [{ parts: [{ text: `${promptTechnicalSystem}\n\n${promptTechnicalUser}` }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        }
        const geminiTechResp = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiTechnicalBody),
          signal: AbortSignal.timeout(15000)
        })
        if (geminiTechResp.ok) {
          const techData = await geminiTechResp.json()
          rawTechText = techData.candidates?.[0]?.content?.parts?.[0]?.text || ""
        }
      } catch (err: any) {
        console.warn("⚠️ Technical schema generation via Gemini failed:", err.message)
      }
    }

    if (rawTechText) {
      try {
        technicalResult = extractAndParseJSON(rawTechText)
      } catch (parseErr: any) {
        console.error("❌ Failed to parse technical JSON:", rawTechText)
      }
    }

    if (!technicalResult) {
      // Fallback manual si falla la generación técnica
      console.warn("⚠️ Falling back to manual technical schema construction...")
      const generatedSlug = contentResult.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim()
      
      technicalResult = {
        slug: generatedSlug,
        meta_title: contentResult.title.slice(0, 60),
        meta_description: contentResult.subtitle.slice(0, 155),
        json_ld: {
          article: {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": contentResult.title,
            "image": "/images/optimize-hero.png"
          },
          faq: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": contentResult.faq.map((f: any) => ({
              "@type": "Question",
              "name": f.question,
              "acceptedAnswer": { "@type": "Answer", "text": f.answer }
            }))
          },
          breadcrumb: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.javiermujica.com" },
              { "@type": "ListItem", "position": 2, "name": "Artículos", "item": "https://www.javiermujica.com/articulos" },
              { "@type": "ListItem", "position": 3, "name": contentResult.title, "item": `https://www.javiermujica.com/articulos/${generatedSlug}` }
            ]
          }
        }
      }
    }

    // --- ESTIMATE READ TIME (Approx 200 words per minute) ---
    const wordCount = contentResult.content.split(/\s+/).length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    // --- GENERATE TABLE OF CONTENTS (TOC) ---
    const toc: any[] = []
    const lines = contentResult.content.split("\n")
    lines.forEach((line: string) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        // Skip TL;DR or Executive Summary headers from TOC
        if (/^(?:Resumen\s+rápido\s*\(TL;DR\)|TL;DR|Resumen\s+Ejecutivo):?$/i.test(text)) return
        const id = text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
        toc.push({ id, text, level })
      }
    })

    // Clean and sanitize the raw article content to prevent raw prompt headers or H1 duplicates
    let cleanContent = contentResult.content.trim()
    
    // 1. Remove duplicate H1 header if present
    cleanContent = cleanContent.replace(/^#\s+.*$/m, "").trim()
    
    // 2. Remove leading/trailing markdown wrapper quotes if present
    if (cleanContent.startsWith("```markdown")) {
      cleanContent = cleanContent.slice(11).trim()
    } else if (cleanContent.startsWith("```")) {
      const firstLineBreak = cleanContent.indexOf("\n")
      if (firstLineBreak !== -1) {
        cleanContent = cleanContent.slice(firstLineBreak + 1).trim()
      }
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3).trim()
    }

    // --- STEP 3: HIGH-QUALITY HERO IMAGE SOURCING & PERSISTENCE ---
    console.log("🎨 Sourcing high-quality hero image for article...")
    const imageResult = await generateOrFetchArticleImage({
      title: contentResult.title || keyword,
      keyword,
      category,
      subtitle: contentResult.subtitle,
      slug: technicalResult.slug
    })
    const generatedImageUrl = imageResult.url

    if (technicalResult.json_ld?.article) {
      technicalResult.json_ld.article.image = generatedImageUrl
    }

    // Strip any hero image markdown from body content to avoid displaying the image twice (header banner already renders it)
    if (generatedImageUrl && cleanContent.includes(generatedImageUrl)) {
      const escapedUrl = generatedImageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      cleanContent = cleanContent.replace(new RegExp(`!\\[.*?\\]\\(${escapedUrl}\\)\\n*`, "g"), "").trim()
    }

    // Sanitize TL;DR formatting in cleanContent to guarantee standard "**TL;DR:** text" format without blockquotes or duplicate prefixes
    cleanContent = cleanContent.replace(/^(?:#{1,6}\s+|>\s*)*(?:\*\*|\*)?TL;DR:?(?:\*\*|\*)?\s*\n+/i, "**TL;DR:** ")
    cleanContent = cleanContent.split("\n").map((line: string) => {
      const trimmed = line.trim()
      const unquoted = trimmed.replace(/^(?:#{1,6}\s+|>\s*)*/, "").trim()
      if (/^(\*\*|\*)?TL;DR:?(\*\*|\*)?\s*/i.test(unquoted)) {
        let tldrText = unquoted.replace(/^(\*\*|\*)?TL;DR:?(\*\*|\*)?:?\s*/i, "").trim()
        tldrText = tldrText.replace(/^(\*\*|\*)?TL;DR:?(\*\*|\*)?:?\s*/i, "").trim()
        return `**TL;DR:** ${tldrText}`
      }
      return line
    }).join("\n").replace(/\n{3,}/g, "\n\n").trim()

    // Consolidated Output Payload
    const finalPayload = {
      title: contentResult.title,
      subtitle: contentResult.subtitle,
      slug: technicalResult.slug,
      meta_title: technicalResult.meta_title,
      meta_description: technicalResult.meta_description,
      category,
      read_time: readTime,
      image_url: generatedImageUrl,
      content: cleanContent,
      toc,
      faq: contentResult.faq,
      myths: contentResult.myths,
      cta_type: ctaType,
      json_ld: technicalResult.json_ld,
      status: "published",
      keywords: [keyword, ...secondaryKeywords],
      tokens_huawei_in: tokensHuaweiIn,
      tokens_huawei_out: tokensHuaweiOut,
      tokens_gemini_in: tokensGeminiIn,
      tokens_gemini_out: tokensGeminiOut,
      cost_usd: parseFloat(costUsd.toFixed(5)),
      model_used_content: modelUsedForContent
    }

    return NextResponse.json({
      success: true,
      data: finalPayload
    }, { status: 200 })

  } catch (err: any) {
    console.error("Admin SEO Generate POST error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
