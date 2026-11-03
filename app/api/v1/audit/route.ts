import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log("=== API V1 AUDIT POST called ===")
  try {
    const body = await req.json().catch(() => ({}))
    const cvText = (body?.cv || "").trim()
    const jdText = (body?.jobDescription || "").trim()

    if (!cvText || !jdText) {
      return NextResponse.json(
        { ok: false, error: "CV y Descripción de cargo son requeridos" },
        { status: 400 }
      )
    }

    const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat"

    if (!DEEPSEEK_API_KEY) {
      console.error("❌ DEEPSEEK_API_KEY no está configurada en la aplicación")
      // Fallback response so it works even if keys aren't set
      return NextResponse.json({
        match_percentage: 75,
        upcycling_hints: [
          "No se detectó API Key de DeepSeek. Mostrando sugerencias por defecto.",
          "Asegúrate de que tu experiencia en RPA e integración de APIs esté visible.",
          "Detalla tu rol liderando equipos comerciales y técnicos."
        ]
      })
    }

    const systemPrompt = `Actúas como un experto consultor de carrera, auditor de currículums (CV) y reclutador sénior.
Tu tarea es analizar la coincidencia y compatibilidad entre el Currículum Vitae de un candidato y la Descripción de Cargo (Job Description) proporcionada.

Responde **EXCLUSIVAMENTE** con un objeto JSON válido en español.
No escribas nada más: ni explicaciones, ni introducciones, ni bloques de código markdown.

Devuelve SOLO un JSON con exactamente esta estructura:
{
  "match_percentage": <número entero entre 0 y 100 indicando la compatibilidad de habilidades, experiencia y educación>,
  "upcycling_hints": [
    "Consejo de optimización 1 indicando exactamente qué agregar, quitar o reescribir en el CV para alinearlo con este puesto.",
    "Consejo de optimización 2 relacionado con habilidades técnicas requeridas que faltan o no se enfatizan.",
    "Consejo de optimización 3 relacionado con logros cuantitativos o métricas de impacto que el puesto demanda.",
    "Consejo de optimización 4 relacionado con palabras clave importantes de la vacante que no están presentes en el CV."
  ]
}

Asegúrate de que tu JSON sea 100% válido y compatible con JSON.parse.`

    const userPrompt = `CURRÍCULUM VITAE (CV):\n${cvText}\n\nDESCRIPCIÓN DE CARGO (JOB DESCRIPTION):\n${jdText}\n\nRealiza el análisis y devuelve únicamente el JSON solicitado.`

    const dsUrl = `${DEEPSEEK_BASE}/chat/completions`
    const dsBody = {
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }

    const response = await fetch(dsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(dsBody),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "No error details")
      console.error("Error calling DeepSeek API in Audit:", response.status, errText)
      throw new Error(`DeepSeek API returned status ${response.status}`)
    }

    const resJson = await response.json()
    const rawContent = resJson.choices?.[0]?.message?.content || ""

    if (!rawContent.trim()) {
      throw new Error("Empty response from DeepSeek API")
    }

    let parsed: any = null
    try {
      parsed = JSON.parse(rawContent.trim())
    } catch {
      // Fallback regex match if Markdown wraps it
      const jsonMatch = rawContent.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch {}
      }
    }

    if (!parsed || typeof parsed.match_percentage === "undefined" || !Array.isArray(parsed.upcycling_hints)) {
      console.error("Failed to parse DeepSeek response into target format. Raw response:", rawContent)
      throw new Error("Invalid format from DeepSeek")
    }

    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error("Error in audit API route:", err)
    // Fallback safe mock return so the website handles the request gracefully
    return NextResponse.json({
      match_percentage: 60,
      upcycling_hints: [
        "Ocurrió un error al consultar el servicio de IA. Inténtalo de nuevo.",
        "Verifica que tu CV tenga palabras clave relevantes como automatización, gestión, o tu especialidad.",
        "Asegúrate de estructurar tu experiencia con viñetas claras y logros cuantitativos."
      ]
    })
  }
}
