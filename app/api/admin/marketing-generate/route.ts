import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const EMILIO_SYSTEM_PROMPT = `
Eres el Asistente de Estrategia y Generación de Contenido de Venta Perpetua de Vibecode Lab, entrenado bajo la metodología del Social Funnel y Venta Perpetua de Emilio.

Tu misión es transformar ideas en guiones de alta conversión para Instagram (Reels, Carruseles y Stories) y flujos de DM (Chatbooking).

Reglas Inquebrantables del Sistema de Emilio:
1. REELS DE RECURSO / ANZUELO (Framework del Paso Omitido):
   - Hook con aversión a la pérdida (primeros 3-4 seg) atacando un dolor específico.
   - Paso 1 y 2 con valor real y accionable (hace que el prospecto sienta que es capaz de hacerlo).
   - Omitir o censurar el Paso 3 (la pieza crítica: prompt de sistema, webhook, función, regla .cursorrules).
   - CTA Anzuelo al DM: "Comenta [PALABRA_CLAVE] y te lo paso por privado".

2. REELS DE CTA DIRECTO:
   - Dirigidos a audiencia fría/semilla (TAM amplio).
   - Hook amplio -> Contextualización profunda del problema -> Caso de éxito o comparación de vehículo -> CTA suave: "Comenta [PALABRA_CLAVE] y te cuento/muestro cómo funciona".

3. REELS DE AUTORIDAD & BUILD IN PUBLIC:
   - Gancho indirecto -> Desglose de métricas reales, costes de infra IA, arquitectura Supabase/Vercel -> Lección de autoridad.

4. REELS DE VALORES & CONFIANZA:
   - Filosofía de vida/negocio sostenible -> Amortiguador contra la fatiga publicitaria. Cero venta agresiva.

5. STORIES DE RECURSO (Regla de las 2 Diapositivas):
   - Diapositiva 1: Elevar el valor percibido (caso de éxito, pantallazo censurado o resultado extraordinario).
   - Diapositiva 2: Entrega simple del entregable: "Grabé un video corto de X min. Responde [PALABRA_CLAVE] y te lo paso".
   - NUNCA poner enlaces externos (links).

6. STORIES DE CTA DIRECTO:
   - "Estoy buscando a 3 [Nicho]..." / "Grupo Beta / Caso de estudio".
   - Fórmula: "Responde [PALABRA_CLAVE] y te muestro cómo funciona".

7. SECUENCIA Q&A HIDDEN CTA (5 Preguntas):
   - Pregunta 1: Gancho / Dopamina (frena el scroll).
   - Pregunta 2: Autoridad y eficiencia.
   - Pregunta 3: El Vehículo Único (Vibecode / FDE).
   - Pregunta 4: Contrarian (rompe un mito de la industria).
   - Pregunta 5: Ayuda / Hidden CTA (Auto-pregunta) -> "Responde [PALABRA_CLAVE]".
   - 2-3 Historias de descompresión personal + Historia de reiteración final.

8. SECUENCIA CTA DE ENCUESTA (Surfacing):
   - Historia 1: Encuesta de Nicho (¿Cuál te describe mejor?).
   - Historia 2: Encuesta de Situación (Calificación de facturación/inversión).
   - Historia 3: Encuesta de Obstáculo Principal (Dolor exacto).
   - Historia 4: CTA de Recurso para el obstáculo seleccionado.
   - Mensaje de DM Outbound amigable sin presionar.

Contexto del Producto (Vibecode Lab):
- Bootcamp de 7 semanas en vivo para construir SaaS/apps con IA.
- Mentalidad: Forward Deployed Engineer (FDE) vs Programador tradicional.
- Stack: Next.js, Supabase, Tailwind, Gemini API, Claude, Resend, Mercado Pago, Vercel.
- Límite: Estrictamente 33 cupos. Sesiones 1-a-1 de diagnóstico y Demo Day en vivo.

Devuelve SIEMPRE la respuesta en formato JSON estructurado con los campos adecuados.
`

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { 
      ideaTitle, 
      frameworkType, 
      pilarName, 
      targetAvatar, 
      keyword, 
      customNotes,
      preferredEngine 
    } = body

    if (!ideaTitle || !frameworkType) {
      return NextResponse.json({ error: "Faltan parámetros obligatorios (ideaTitle, frameworkType)" }, { status: 400 })
    }

    const userPrompt = `
Genera un guion de contenido completo y listo para producción siguiendo el sistema de Emilio.

Datos del Contenido:
- Título/Idea: "${ideaTitle}"
- Framework solicitado: "${frameworkType}"
- Pilar de Contenido: "${pilarName || 'General'}"
- Avatar Objetivo: "${targetAvatar || 'Emprendedores y Desarrolladores'}"
- Palabra Clave para CTA: "${keyword || 'VIBECODE'}"
- Notas o Enfoque Adicional: "${customNotes || 'Ninguno'}"

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido (sin backticks de markdown alrededor si es posible, o en un bloque de código json limpio) con la siguiente estructura:
{
  "title": "${ideaTitle}",
  "frameworkType": "${frameworkType}",
  "targetAvatar": "${targetAvatar || 'Avatar Ideal'}",
  "ctaKeyword": "${keyword || 'VIBECODE'}",
  "hook": "Gancho inicial exacto palabra por palabra",
  "extensionOrContext": "Extensión de retención o contextualización",
  "stepsOrBody": [
    { "stepTitle": "Paso 1 o Sección 1", "content": "Contenido detallado", "isOmitted": false },
    { "stepTitle": "Paso 2 o Sección 2", "content": "Contenido detallado", "isOmitted": false },
    { "stepTitle": "Paso 3 (Omitido / Clave)", "content": "Descripción de la pieza omitida o censurada", "isOmitted": true }
  ],
  "callToAction": "Llamada a la acción exacta para el guion",
  "dmSetterResponse": "Mensaje exacto que el Setter debe enviar al prospecto cuando responda o comente",
  "productionTips": ["Tip 1 para grabación o edición", "Tip 2 de retención"]
}
`

    // Detect available AI key
    const geminiKey = process.env.GEMINI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    const deepseekKey = process.env.DEEPSEEK_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const huaweiKey = process.env.HUAWEI_API_KEY

    let rawReply = ""

    if ((preferredEngine === "gemini" || !preferredEngine) && geminiKey) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${EMILIO_SYSTEM_PROMPT}\n\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Gemini API error: ${err}`)
      }
      const data = await res.json()
      rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    } else if ((preferredEngine === "anthropic" || (!geminiKey && anthropicKey)) && anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2048,
          system: EMILIO_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
          temperature: 0.7
        })
      })
      if (!res.ok) throw new Error(`Claude API error: ${await res.text()}`)
      const data = await res.json()
      rawReply = data.content?.[0]?.text || ""
    } else if (openaiKey || deepseekKey || huaweiKey) {
      const endpoint = deepseekKey 
        ? "https://api.deepseek.com/v1/chat/completions" 
        : (openaiKey ? "https://api.openai.com/v1/chat/completions" : (process.env.HUAWEI_OPENAI_ENDPOINT || "https://api-ap-southeast-1.modelarts-maas.com/openai/v1/chat/completions"))
      
      const key = deepseekKey || openaiKey || huaweiKey
      const model = deepseekKey ? "deepseek-chat" : (openaiKey ? "gpt-4o-mini" : (process.env.HUAWEI_MODEL || "DeepSeek-V3"))

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: EMILIO_SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7
        })
      })
      if (!res.ok) throw new Error(`API error: ${await res.text()}`)
      const data = await res.json()
      rawReply = data.choices?.[0]?.message?.content || ""
    } else {
      // Fallback local mockup generator if no keys are currently set in this environment
      return NextResponse.json({
        ok: true,
        script: {
          title: ideaTitle,
          frameworkType,
          targetAvatar: targetAvatar || "Founders y Creadores",
          ctaKeyword: keyword || "VIBECODE",
          hook: `Si sigues cometiendo este error al crear tu aplicación, vas a quemar meses de trabajo...`,
          extensionOrContext: `En vez de gastar miles de dólares o perderte en tutoriales, esto es lo que hacen los Forward Deployed Engineers:`,
          stepsOrBody: [
            { stepTitle: "Paso 1: Estructurar el PRD", content: "Define las entidades y los límites en una sola hoja.", isOmitted: false },
            { stepTitle: "Paso 2: Conectar Supabase & Auth", content: "Genera las tablas relacionales y el login en menos de 20 minutos con IA.", isOmitted: false },
            { stepTitle: "Paso 3 (Omitido / Clave)", content: "El prompt exacto de orquestación y las reglas de seguridad RLS.", isOmitted: true }
          ],
          callToAction: `Si quieres que te pase el prompt exacto y el guion para implementarlo, comenta '${keyword || 'VIBECODE'}' y te lo envío por privado.`,
          dmSetterResponse: `¡Hola! 👋 Vi tu comentario en el reel. Te paso la guía por aquí. Antes de mandártela, ¿estás buscando lanzar un SaaS propio o un proyecto para tu negocio?`,
          productionTips: [
            "Graba con cambio de escena cuando reveles el Paso 1 y Paso 2.",
            "Censura visualmente el Paso 3 con un sticker de 'TOP SECRET' para disparar la curiosidad."
          ]
        }
      })
    }

    // Clean JSON response from markdown blocks if needed
    let cleanedJson = rawReply.trim()
    if (cleanedJson.startsWith("```json")) {
      cleanedJson = cleanedJson.replace(/^```json/, "").replace(/```$/, "").trim()
    } else if (cleanedJson.startsWith("```")) {
      cleanedJson = cleanedJson.replace(/^```/, "").replace(/```$/, "").trim()
    }

    const parsed = JSON.parse(cleanedJson)
    return NextResponse.json({ ok: true, script: parsed })
  } catch (err: any) {
    console.error("Error in marketing-generate API:", err)
    return NextResponse.json({ error: err.message || "Error al generar guion" }, { status: 500 })
  }
}
