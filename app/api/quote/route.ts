import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { origin_address, destination_address, floors_stairs = 0, items_description, client_name, client_phone } = body

    if (!origin_address || !destination_address || !items_description) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios: origin_address, destination_address o items_description." },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY no configurada en las variables de entorno." },
        { status: 500 }
      )
    }

    // System Prompt estricto para forzar cálculo y salida en JSON puro
    const systemPrompt = `Eres el motor experto de cotización de fletes y logística de "VibeCargo".
Debes calcular los costos de forma razonable y justificada según las siguientes reglas de negocio:
1. Tarifa base de traslado: $15.000 CLP (cubre hasta 5 km estándar).
2. Costo por piso por escalera: $4.000 CLP por cada piso reportado (${floors_stairs} pisos).
3. Costo según volumen/complejidad de ítems descritos: estima entre $10.000 y $50.000 CLP según la cantidad y peso.
4. Margen operativo / imprevistos: 15% a 20% del subtotal.
5. Mensaje de WhatsApp: Redacta un mensaje amable, claro y profesional con emojis, detallando el resumen del servicio, total en CLP y un llamado a confirmar el horario.

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO SIN TEXTO ANTES NI DESPUÉS (sin bloques markdown de comillas triples).
Estructura JSON requerida:
{
  "breakdown": [
    { "item": "Tarifa Base de Traslado", "cost": 15000 },
    { "item": "Recargo por Pisos de Escalera (X pisos)", "cost": 0 },
    { "item": "Manipulación y Carga de Ítems", "cost": 0 },
    { "item": "Margen Operativo y Logística", "cost": 0 }
  ],
  "subtotal": 0,
  "estimated_total": 0,
  "currency": "CLP",
  "whatsapp_message": "Hola! 👋 Te comparto el detalle de tu cotización de flete..."
}`

    const userContent = `Datos del Flete a Cotizar:
- Origen: ${origin_address}
- Destino: ${destination_address}
- Pisos por escalera: ${floors_stairs}
- Descripción de muebles / ítems: ${items_description}
- Cliente: ${client_name || "Cliente"}
- Teléfono: ${client_phone || "No especificado"}`

    // Llamada directa a Gemini 1.5 / 2.0 con responseMimeType application/json
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[Gemini API Error]:", errText)
      return NextResponse.json(
        { ok: false, error: "Error en la respuesta del modelo Gemini.", details: errText },
        { status: 502 }
      )
    }

    const geminiData = await response.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: "Gemini no devolvió contenido." },
        { status: 502 }
      )
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(rawText)
    } catch (e) {
      // Limpieza preventiva si vino con backticks
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim()
      parsedResult = JSON.parse(cleanJson)
    }

    // Persistencia opcional en Supabase
    let savedQuoteId = null
    try {
      const supabase = getSupabaseClient()
      const { data: inserted, error: dbError } = await supabase
        .from("quotes")
        .insert({
          origin_address,
          destination_address,
          floors_stairs: Number(floors_stairs) || 0,
          items_description,
          estimated_total: parsedResult.estimated_total || parsedResult.total || 0,
          breakdown_json: parsedResult.breakdown || [],
          whatsapp_message: parsedResult.whatsapp_message || "",
          client_name: client_name || null,
          client_phone: client_phone || null,
          status: "generated",
        })
        .select("id")
        .single()

      if (!dbError && inserted) {
        savedQuoteId = inserted.id
      }
    } catch (dbErr) {
      console.warn("[Quote API] Nota: No se pudo guardar en Supabase (continuando):", dbErr)
    }

    return NextResponse.json({
      ok: true,
      quote_id: savedQuoteId,
      data: parsedResult,
    })
  } catch (error: any) {
    console.error("[Quote API Exception]:", error)
    return NextResponse.json(
      { ok: false, error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
