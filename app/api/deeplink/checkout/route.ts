import { NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, payment_method = "mercadopago" } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Ingresa un correo electrónico válido" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const adminEnv = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
    const isOwnerEmail =
      cleanEmail === "hola@javiermujica.com" ||
      cleanEmail === "javiermujicadev@gmail.com" ||
      (adminEnv !== "" && cleanEmail === adminEnv)

    const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

    const host = req.headers.get("host") || "www.javiermujica.com"
    const isProd = mpToken?.startsWith("APP_USR-")
    const redirectOrigin = host.includes("localhost")
      ? `http://${host}`
      : "https://www.javiermujica.com"

    if (isOwnerEmail) {
      return NextResponse.json({
        success: true,
        checkout_url: `${redirectOrigin}/deeplink?status=success&email=${encodeURIComponent(cleanEmail)}`,
        payment_method: "owner_bypass",
        amount_clp: 0,
        amount_usd: 0,
      })
    }

    const amountClp = 990 // ~$1 USD

    // 1. If MercadoPago is selected & token exists
    if (payment_method === "mercadopago" && mpToken) {
      try {
        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mpToken}`,
            "X-Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            items: [
              {
                id: "deeplink-pro-monthly",
                title: "DeepLinks Pro - Suscripción Mensual",
                description: "Creación ilimitada de Deep Links inteligentes para Instagram y TikTok",
                picture_url: "https://www.javiermujica.com/icon.svg",
                category_id: "services",
                quantity: 1,
                unit_price: amountClp,
                currency_id: "CLP",
              },
            ],
            external_reference: `deeplink_${cleanEmail}_${Date.now()}`,
            payer: {
              name: "Founder",
              surname: "DeepLink",
              email: cleanEmail,
            },
            notification_url: "https://www.javiermujica.com/api/vibecode/mercadopago-webhook?source_news=webhooks",
            statement_descriptor: "JAVIERMUJICA",
            back_urls: {
              success: `${redirectOrigin}/deeplink?status=success&email=${encodeURIComponent(cleanEmail)}`,
              failure: `${redirectOrigin}/deeplink?status=failed&email=${encodeURIComponent(cleanEmail)}`,
              pending: `${redirectOrigin}/deeplink?status=pending&email=${encodeURIComponent(cleanEmail)}`,
            },
            auto_return: "approved",
          }),
        })

        if (mpRes.ok) {
          const mpData = await mpRes.json()
          const checkoutUrl = isProd
            ? mpData.init_point || mpData.sandbox_init_point
            : mpData.sandbox_init_point || mpData.init_point

          return NextResponse.json({
            success: true,
            checkout_url: checkoutUrl,
            payment_method: "mercadopago",
            amount_clp: amountClp,
            amount_usd: 1,
          })
        }
      } catch (err) {
        console.error("Error creating MercadoPago preference:", err)
      }
    }

    // 2. Fallback or Bank Transfer / Manual Activation Flow
    if (payment_method === "bank") {
      return NextResponse.json({
        success: true,
        payment_method: "bank",
        amount_clp: amountClp,
        amount_usd: 1,
        bank_details: {
          banco: "Mercado Pago (o BICE / MP)",
          tipo: "Cuenta Vista",
          numero: "1038615486",
          rut: "16.660.933-K",
          nombre: "Javier Ignacio Mujica Carvajal",
          email: "hola@javiermujica.com",
        },
      })
    }

    // 3. Fallback direct simulation / instant activation
    return NextResponse.json({
      success: true,
      checkout_url: `${redirectOrigin}/deeplink?status=success&email=${encodeURIComponent(cleanEmail)}`,
      payment_method: "simulation",
      amount_clp: amountClp,
      amount_usd: 1,
    })
  } catch (error: any) {
    console.error("Checkout route error:", error)
    return NextResponse.json({ error: error?.message || "Error al procesar el pago" }, { status: 500 })
  }
}
