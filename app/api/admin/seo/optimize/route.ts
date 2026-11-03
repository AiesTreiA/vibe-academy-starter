import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { extractAndParseJSON } from "@/lib/json-utils"

export const maxDuration = 60
export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

// Tariff Constants (USD per 1M tokens)
const TARIFF_GEMINI_IN = 0.075
const TARIFF_GEMINI_OUT = 0.30

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, type = "ctr" } = body // type: 'ctr', 'position', 'decay'

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing article ID" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // Fetch the current article
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 })
    }

    // --- SETUP GEMINI CONNECTION ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_MODEL = "gemini-2.5-flash"
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`


    if (!GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "Gemini API Key missing" }, { status: 500 })
    }

    let promptSystem = ""
    let promptUser = ""

    if (type === "ctr") {
      // LOW CTR: Optimize meta title and description
      promptSystem = `
Eres un especialista en optimización de tasa de clics (CTR). Recibirás el contenido de un artículo con su título actual y sus metadatos.
Debes reescribir e incrementar la persuasión, el gancho y el CTR del Meta Title y de la Meta Description.

Instrucciones:
- Meta Title: Máximo 60 caracteres. Orientado a la curiosidad, valor del usuario y beneficio inmediato.
- Meta Description: Máximo 155 caracteres. Llama a la acción, persuasiva, con gancho.

Responde exclusivamente con un objeto JSON:
{
  "meta_title": "Nuevo título optimizado",
  "meta_description": "Nueva descripción optimizada"
}
`
      promptUser = `
ARTÍCULO ACTUAL:
- Título: "${article.title}"
- Meta Title Actual: "${article.meta_title}"
- Meta Description Actual: "${article.meta_description}"
- Resumen del contenido: ${article.content.slice(0, 1000)}
`
    } else if (type === "position") {
      // BOOST POSITION (Rank 5-20): Inject new relevant sub-sections
      promptSystem = `
Eres un analista SEO. El artículo está en la "segunda página" de Google y necesita un empuje semántico.
Debes redactar una o dos nuevas secciones (en formato Markdown H2 o H3 con su respectivo texto explicativo) para insertarlas al final del artículo, respondiendo a preguntas que los competidores omiten o agregando casos prácticos y tecnicismos.

Instrucciones:
- Las secciones deben estar escritas en Markdown fluido y premium.
- Evita el relleno. Usa viñetas o listas legibles.
- Las secciones deben integrarse orgánicamente.

Responde exclusivamente con un objeto JSON:
{
  "injected_markdown": "\\n\\n## Nueva Sección SEO\\n\\nTexto explicativo...\\n- Punto 1\\n- Punto 2"
}
`
      promptUser = `
ARTÍCULO ACTUAL:
- Título: "${article.title}"
- Palabras Claves: ${JSON.stringify(article.keywords)}
- Contenido Actual:
${article.content}
`
    } else {
      // CONTENT DECAY: Refresh statistics and refresh text
      promptSystem = `
Eres un redactor de contenidos. Este artículo tiene información que ha quedado vieja o desactualizada y necesita un refresco (Content Decay).
Revisa el texto provisto y optimiza párrafos puntuales o añade una nota de actualización moderna con datos actualizados para el año 2026/2027.

Responde exclusivamente con un objeto JSON:
{
  "refreshed_content": "Todo el contenido del artículo en Markdown, con las optimizaciones e información renovada ya inyectadas."
}
`
      promptUser = `
ARTÍCULO ACTUAL:
- Título: "${article.title}"
- Contenido Actual:
${article.content}
`
    }

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

    const geminiResp = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
      signal: AbortSignal.timeout(20000)
    })

    if (!geminiResp.ok) {
      return NextResponse.json({ success: false, error: `Gemini API error: ${geminiResp.status}` }, { status: 500 })
    }

    const geminiData = await geminiResp.json()
    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const result = extractAndParseJSON(rawText)

    // Calculate cost update
    let inTokens = 0
    let outTokens = 0
    if (geminiData.usageMetadata) {
      inTokens = geminiData.usageMetadata.promptTokenCount || 0
      outTokens = geminiData.usageMetadata.candidatesTokenCount || 0
    }

    const deltaCost = (inTokens * TARIFF_GEMINI_IN / 1000000) + (outTokens * TARIFF_GEMINI_OUT / 1000000)

    // Prepare update parameters
    const updateData: Record<string, any> = {
      tokens_gemini_in: (article.tokens_gemini_in || 0) + inTokens,
      tokens_gemini_out: (article.tokens_gemini_out || 0) + outTokens,
      cost_usd: parseFloat(((article.cost_usd || 0) + deltaCost).toFixed(5)),
      updated_at: new Date().toISOString()
    }

    if (type === "ctr") {
      updateData.meta_title = result.meta_title
      updateData.meta_description = result.meta_description
      
      // Update breadcrumb and article headline inside json_ld if necessary
      if (article.json_ld) {
        const jsonLd = { ...article.json_ld }
        if (jsonLd.article) {
          jsonLd.article.headline = article.title
        }
        updateData.json_ld = jsonLd
      }
    } else if (type === "position") {
      updateData.content = article.content + result.injected_markdown
      
      // Re-generate TOC for new headings
      const toc: any[] = []
      const lines = updateData.content.split("\n")
      lines.forEach((line: string) => {
        const match = line.match(/^(#{2,3})\s+(.*)$/)
        if (match) {
          const level = match[1].length
          const text = match[2].trim()
          const id = text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
          toc.push({ id, text, level })
        }
      })
      updateData.toc = toc
    } else {
      updateData.content = result.refreshed_content
    }

    // Save changes in Supabase
    const { data: updatedArticle, error: updateError } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()

    if (updateError) {
      console.error("Error updating article after optimization:", updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedArticle[0],
      delta: {
        tokensIn: inTokens,
        tokensOut: outTokens,
        costUsd: deltaCost
      }
    }, { status: 200 })

  } catch (err: any) {
    console.error("Admin SEO Optimize POST error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
