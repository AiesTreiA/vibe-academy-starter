import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeWelcomeTemplate, getVibecodeAbonoTemplate, sendAdminRegistrationNotification } from "@/lib/email-service"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const regID = body.reg_id
    const fileBase64 = body.file_base64 // Base64 data string (without "data:image/...;base64,")
    const fileMime = body.file_mime || "image/jpeg"

    if (!regID || !fileBase64) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (reg_id, file_base64)" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Get registration info
    const { data: reg, error: fetchError } = await supabase
      .from("vibecode_registrations")
      .select("*")
      .eq("id", regID)
      .single()

    if (fetchError || !reg) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    // Prepare full data URL to store in DB
    const dataUrl = `data:${fileMime};base64,${fileBase64}`

    // 2. Call AI API (OpenAI primary, Gemini fallback) for Multimodal Auditing
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
      console.warn("⚠️ No AI API Key configured. Falling back to manual verification state.")
      // Save receipt and leave pending
      await supabase
        .from("vibecode_registrations")
        .update({ receipt_url: dataUrl })
        .eq("id", regID)

      return NextResponse.json({
        success: true,
        verified: false,
        message: "Comprobante recibido. La verificación automática no está configurada, un administrador revisará tu pago a la brevedad."
      })
    }

    const systemPrompt = `
Eres un auditor de transferencias de pago de Vibecode. Tu labor es verificar si la imagen adjunta es un comprobante de transferencia bancaria legítimo.
El bootcamp es "Crea Tu App".
Monto esperado: ${reg.amount_paid} USD.
Si la transferencia es chilena (en CLP), asume un tipo de cambio de aprox $950 CLP por USD. Por ejemplo:
- Si el monto esperado es $205 USD, en pesos chilenos equivale a unos $194.750 CLP.
- Si el monto esperado es $209 USD, en pesos chilenos equivale a unos $198.550 CLP.
- Si el monto esperado es $237 USD, equivale a unos $225.150 CLP.
- Si el monto esperado es $265 USD, equivale a unos $251.750 CLP.
- Si el monto esperado es $297 USD, equivale a unos $282.150 CLP.
- Si hay un cupón del 70% aplicado (monto $63 USD), equivale a unos $59.850 CLP.

REGLAS DE AUDITORÍA DE MONTO:
1. SIEMPRE responde con "is_valid": true si la imagen es un comprobante de transferencia bancaria real y legible, INCLUSO si el monto difiere en algunos miles de pesos (ej: 194.000 CLP vs 194.750 CLP, tolerancia +- $5.000 CLP) o si es un pago parcial/abono.
2. Solo marca "is_valid": false si la imagen NO es un comprobante de transferencia bancaria, o si es totalmente ilegible, manipulada o falsa.
3. Extrae siempre el "detected_amount" numérico real y la "currency" ("CLP" o "USD").

Nombre del alumno: ${reg.name}.

Analiza la imagen o captura del comprobante y responde únicamente en formato JSON con este esquema exacto:
{
  "is_valid": true o false,
  "detected_amount": 123 (monto numérico encontrado, en CLP o USD según el comprobante),
  "currency": "CLP" o "USD" o "USDT/BTC/ETH",
  "reason": "explicación corta de 1 oración del resultado en español"
}
`.trim()

    let aiResult = { is_valid: false, reason: "Error al invocar el motor de auditoría inteligente.", detected_amount: 0, currency: "" }
    let callSuccessful = false

    // Try OpenAI first if OPENAI_API_KEY is available
    if (OPENAI_API_KEY) {
      try {
        const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini"
        console.log(`🤖 AI Pago Agent (OpenAI ${openAiModel}): Auditing receipt for ${reg.name} (Expected: $${reg.amount_paid} USD)...`)

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: systemPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: dataUrl
                    }
                  }
                ]
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          })
        })

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json()
          const textResponse = openAiData.choices?.[0]?.message?.content || "{}"
          console.log("🤖 OpenAI Response:", textResponse)
          aiResult = JSON.parse(textResponse)
          callSuccessful = true
        } else {
          const errText = await openAiRes.text()
          console.warn(`OpenAI ${openAiModel} failed (Status: ${openAiRes.status}):`, errText)
        }
      } catch (openAiErr) {
        console.error("Exception invoking OpenAI vision API:", openAiErr)
      }
    }

    // Fallback to Gemini if OpenAI was not called or failed and GEMINI_API_KEY is available
    if (!callSuccessful && GEMINI_API_KEY) {
      let geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash"
      let geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`

      const geminiPayload = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType: fileMime,
                  data: fileBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      }

      console.log(`🤖 AI Pago Agent (Gemini ${geminiModel}): Auditing receipt for ${reg.name}...`)

      let geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      })

      if (!geminiRes.ok) {
        const errText = await geminiRes.text()
        console.warn(`Gemini ${geminiModel} failed (Status: ${geminiRes.status}). Retrying with gemini-1.5-pro...`, errText)
        geminiModel = "gemini-1.5-pro"
        geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`
        geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload)
        })
      }

      if (geminiRes.ok) {
        try {
          const geminiData = await geminiRes.json()
          const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
          console.log("🤖 Gemini Response:", textResponse)
          aiResult = JSON.parse(textResponse)
          callSuccessful = true
        } catch (parseErr) {
          console.error("Failed to parse Gemini JSON output:", parseErr)
          aiResult.reason = "La IA devolvió un formato no legible. Se derivará a revisión manual."
        }
      } else {
        aiResult.reason = "Falla de comunicación con el motor de IA. Se derivará a revisión manual."
      }
    }

    // Safety override: Si la IA marcó is_valid = false únicamente por diferencia leve de monto (delta <= 5000 CLP), forzar is_valid = true.
    if (!aiResult.is_valid && (aiResult.detected_amount || 0) > 10000) {
      const expUSD = reg.amount_paid
      const detRaw = aiResult.detected_amount || 0
      const detCurr = (aiResult.currency || "CLP").toUpperCase()
      const expCLP = Math.round(expUSD * 950)
      const detCLP = detCurr === "CLP" ? detRaw : Math.round(detRaw * 950)
      const diffCLP = expCLP - detCLP

      if (diffCLP <= 5000) {
        console.log(`💡 Safety Override: detected $${detCLP} CLP is within 5.000 CLP tolerance of expected $${expCLP} CLP. Overriding is_valid = true.`)
        aiResult.is_valid = true
      }
    }

    if (aiResult.is_valid) {
      const expectedAmountUSD = reg.amount_paid
      const detectedAmountRaw = aiResult.detected_amount || 0
      const detectedCurrency = (aiResult.currency || "CLP").toUpperCase()

      // Convert detected amount to USD
      let detectedAmountUSD = detectedAmountRaw
      if (detectedCurrency === "CLP") {
        detectedAmountUSD = detectedAmountRaw / 950
      }

      console.log(`🤖 Audit comparison: Expected $${expectedAmountUSD} USD. Detected $${detectedAmountUSD} USD (Raw: ${detectedAmountRaw} ${detectedCurrency})`)

      const totalExpectedCLP = Math.round(expectedAmountUSD * 950)
      const abonoCLP = detectedCurrency === "CLP" ? detectedAmountRaw : Math.round(detectedAmountUSD * 950)
      const remainingCLP = Math.max(0, totalExpectedCLP - abonoCLP)

      // Solo considerar pago parcial (abono) si falta más de $5.000 CLP por pagar (tolerancia delta +- $5.000 CLP)
      if (remainingCLP > 5000) {
        console.log(`🎟️ AI Partial Payment (Abono) detected for ${reg.email}. Expected $${expectedAmountUSD} USD (~$${totalExpectedCLP} CLP). Got ${detectedAmountRaw} ${detectedCurrency}. Remaining: $${remainingCLP} CLP.`)
        const nowIso = new Date().toISOString()

        // Update DB registration as partially_paid / abono
        await supabase
          .from("vibecode_registrations")
          .update({
            status: "partially_paid",
            receipt_url: dataUrl,
            abono_amount_clp: abonoCLP,
            remaining_amount_clp: remainingCLP,
            abono_at: nowIso,
          })
          .eq("id", regID)

        // Send Abono confirmation email to student
        try {
          const abonoHtml = getVibecodeAbonoTemplate(reg.name, abonoCLP, remainingCLP)
          await sendEmail({
            to: reg.email,
            subject: "🎉 ¡Abono Recibido y Cupo Reservado en Vibecode Lab!",
            html: abonoHtml,
          })
          console.log(`[VIBECODE] Abono confirmation email sent to ${reg.email}`)
        } catch (abonoEmailErr) {
          console.error("Failed sending abono confirmation email:", abonoEmailErr)
        }

        // Send admin notification email to Javier
        try {
          await sendEmail({
            to: "hola@javiermujica.com",
            subject: `🎟️ [ABONO RECIBIDO] ${reg.name} ($${abonoCLP.toLocaleString("es-CL")} CLP)`,
            html: `
              <div style="font-family: sans-serif; background: #030712; color: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 25px;">
                  <h2 style="color: #10b981;">🎟️ ¡Nuevo Abono de Reserva Recibido!</h2>
                  <p>El alumno <strong>${reg.name}</strong> (${reg.email}) ha realizado una transferencia por concepto de abono parcial.</p>
                  <ul>
                    <li><strong>Monto Abonado:</strong> $${abonoCLP.toLocaleString("es-CL")} CLP</li>
                    <li><strong>Saldo Pendiente:</strong> $${remainingCLP.toLocaleString("es-CL")} CLP</li>
                    <li><strong>Teléfono:</strong> ${reg.phone || "No especificado"}</li>
                    <li><strong>Cupón Usado:</strong> ${reg.coupon_code || "Ninguno"}</li>
                  </ul>
                  <p>Se le envió el correo de reserva confirmando su cupo. A los 7 días se le solicitará automáticamente el saldo restante por correo.</p>
                </div>
              </div>
            `,
          })
          console.log(`[VIBECODE] Admin abono notification sent to hola@javiermujica.com`)
        } catch (adminAbonoErr) {
          console.error("Failed sending admin abono notification:", adminAbonoErr)
        }

        return NextResponse.json({
          success: true,
          verified: true,
          payment_status: "partially_paid",
          message: `¡Abono verificado con éxito! Registramos tu pago parcial de $${abonoCLP.toLocaleString("es-CL")} CLP y tu cupo quedó oficialmente reservado. Te enviamos un correo con el detalle del saldo pendiente ($${remainingCLP.toLocaleString("es-CL")} CLP).`
        })
      }

      // Check if it's more (overpaid) by more than $10 USD
      const isOverpaid = detectedAmountUSD > expectedAmountUSD + 10
      
      console.log(`✅ AI Payment Verification SUCCESS for ${reg.email}. Updating to paid. Overpaid: ${isOverpaid}`)
      
      // Update DB to paid
      const { error: updateError } = await supabase
        .from("vibecode_registrations")
        .update({ 
          status: "paid", 
          receipt_url: dataUrl,
          paid_at: new Date().toISOString()
        })
        .eq("id", regID)

      if (updateError) {
        console.error("Database update error:", updateError)
        return NextResponse.json({
          success: true,
          verified: false,
          message: "Comprobante verificado por IA, pero ocurrió un error al actualizar tu cuenta. Tu acceso será activado manualmente."
        })
      }

      // Send welcome email
      try {
        const welcomeHtml = getVibecodeWelcomeTemplate(reg.name)
        await sendEmail({
          to: reg.email,
          subject: "🎉 ¡Te damos la bienvenida a VIBECODE LAB!",
          html: welcomeHtml,
        })
        console.log(`[VIBECODE] Welcome email sent to ${reg.email}`)
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr)
      }

      // Send admin purchase notification
      try {
        await sendAdminRegistrationNotification({
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          amount_paid: reg.amount_paid,
          payment_method: reg.payment_method || "transferencia",
          coupon_code: reg.coupon_code,
        })
        console.log(`[VIBECODE] Admin purchase notification email sent for ${reg.email}`)
      } catch (adminEmailErr) {
        console.error("Failed sending admin registration notification:", adminEmailErr)
      }

      // Increment coupon uses
      if (reg.coupon_code) {
        try {
          const { data: couponData, error: fetchCouponErr } = await supabase
            .from("vibecode_coupons")
            .select("current_uses")
            .eq("code", reg.coupon_code)
            .single()

          if (!fetchCouponErr && couponData) {
            await supabase
              .from("vibecode_coupons")
              .update({ current_uses: (couponData.current_uses || 0) + 1 })
              .eq("code", reg.coupon_code)
          }
        } catch (couponErr) {
          console.error("Failed to increment coupon uses:", couponErr)
        }
      }

      if (isOverpaid) {
        // Send email/notification to Javier
        try {
          await sendEmail({
            to: "hola@javiermujica.com",
            subject: `⚠️ Pago Excedente Detectado: ${reg.name}`,
            html: `
              <p>Hola Javier,</p>
              <p>El Agente IA de Pagos detectó que el alumno <strong>${reg.name}</strong> (${reg.email}) transfirió un monto de <strong>${detectedAmountRaw} ${detectedCurrency}</strong> (~$${Math.round(detectedAmountUSD)} USD) para una matrícula de <strong>$${expectedAmountUSD} USD</strong>.</p>
              <p>Su matrícula ha sido activada de todas formas. Por favor gestiona la devolución correspondiente por el monto sobrante.</p>
            `,
          })
          console.log(`[VIBECODE] Overpayment email notification sent to hola@javiermujica.com`)
        } catch (notifErr) {
          console.error("Failed sending overpayment notification:", notifErr)
        }

        return NextResponse.json({
          success: true,
          verified: true,
          payment_status: "overpaid",
          message: "El comprobante fue verificado por la IA. Detectamos un pago adicional. Tu matrícula ha sido activada y se envió una notificación a Javier para gestionar la devolución del dinero extra."
        })
      }

      return NextResponse.json({
        success: true,
        verified: true,
        payment_status: "correct",
        message: "¡Comprobante verificado con éxito por nuestro Agente de Pagos IA! Tu matrícula ha sido activada y te enviamos un correo de bienvenida."
      })
    } else {
      console.log(`⚠️ AI Payment Verification REJECTED for ${reg.email}. Reason: ${aiResult.reason}`)
      
      // Save receipt URL but leave status pending for human review
      await supabase
        .from("vibecode_registrations")
        .update({ receipt_url: dataUrl })
        .eq("id", regID)

      return NextResponse.json({
        success: true,
        verified: false,
        message: `El comprobante no pudo ser auto-verificado: ${aiResult.reason}. Tu pago será revisado manualmente por Javier en breve.`
      })
    }

  } catch (err: any) {
    console.error("Error in upload-receipt handler:", err)
    return NextResponse.json({ error: "Ocurrió un error en el servidor." }, { status: 500 })
  }
}
