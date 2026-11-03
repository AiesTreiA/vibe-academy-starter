import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { getSupabaseAdminClient } from "@/lib/supabase"

const CheckoutSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").optional().default("Founder"),
  email: z.string().trim().email("Ingresa un correo electrónico válido"),
  payment_method: z.enum(["mercadopago", "bank"]).optional().default("mercadopago"),
})

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}))
    const parsed = CheckoutSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos de compra inválidos" },
        { status: 400 }
      )
    }

    const { name, email, payment_method } = parsed.data
    const cleanEmail = email.toLowerCase().trim()
    const adminEnv = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
    const isOwnerEmail =
      cleanEmail === "hola@javiermujica.com" ||
      cleanEmail === "javiermujicadev@gmail.com" ||
      (adminEnv !== "" && cleanEmail === adminEnv)

    const amountClp = Number(process.env.UNICORN_BIBLE_PRICE_CLP || 49990)
    const amountUsd = 49
    const externalReference = `unicorn_bible_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`
    const downloadToken = crypto.randomBytes(20).toString("hex")

    const host = req.headers.get("host") || "www.javiermujica.com"
    const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    const isProd = mpToken?.startsWith("APP_USR-")
    const redirectOrigin = host.includes("localhost")
      ? `http://${host}`
      : "https://www.javiermujica.com"

    // Record order in Supabase `bundle_orders` (non-blocking if table not yet migrated)
    try {
      const supabase = getSupabaseAdminClient() as any
      await supabase.from("bundle_orders").insert([
        {
          external_reference: externalReference,
          buyer_name: name,
          buyer_email: cleanEmail,
          payment_method,
          status: isOwnerEmail ? "approved" : "pending",
          amount_clp: amountClp,
          amount_usd: amountUsd,
          currency: "CLP",
          download_token: downloadToken,
        },
      ])
    } catch (dbErr) {
      console.warn("Aviso al registrar orden en bundle_orders:", dbErr)
    }

    if (isOwnerEmail) {
      return NextResponse.json({
        success: true,
        checkout_url: `${redirectOrigin}/unicorn-bible?status=success&email=${encodeURIComponent(cleanEmail)}&token=${downloadToken}`,
        payment_method: "owner_bypass",
        amount_clp: 0,
        amount_usd: 0,
      })
    }

    // 1. Mercado Pago Preference Creation
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
                id: "founder-unicorn-pack-2026",
                title: "Founder Unicorn Pack — Código & Capital (Tetralogía 4 E-Books + Herramientas)",
                description:
                  "Los 4 Tomos de La Biblia de los Squads Ágiles + Calculadora Unit Economics & Cap Table + Plantillas Power Pitch + Diagnóstico SQR con QR",
                picture_url: "https://www.javiermujica.com/icon.svg",
                category_id: "learnings",
                quantity: 1,
                unit_price: amountClp,
                currency_id: "CLP",
              },
            ],
            external_reference: externalReference,
            payer: {
              name: name || "Founder",
              surname: "UnicornPack",
              email: cleanEmail,
            },
            notification_url: "https://www.javiermujica.com/api/vibecode/mercadopago-webhook?source_news=webhooks",
            statement_descriptor: "JAVIERMUJICA",
            back_urls: {
              success: `${redirectOrigin}/unicorn-bible?status=success&email=${encodeURIComponent(cleanEmail)}&ref=${externalReference}`,
              failure: `${redirectOrigin}/unicorn-bible?status=failed&email=${encodeURIComponent(cleanEmail)}`,
              pending: `${redirectOrigin}/unicorn-bible?status=pending&email=${encodeURIComponent(cleanEmail)}`,
            },
            auto_return: "approved",
          }),
        })

        if (mpRes.ok) {
          const mpData = await mpRes.json()
          const checkoutUrl = isProd
            ? mpData.init_point || mpData.sandbox_init_point
            : mpData.sandbox_init_point || mpData.init_point

          // Update preference ID in bundle_orders
          try {
            const supabase = getSupabaseAdminClient() as any
            await supabase
              .from("bundle_orders")
              .update({ mp_preference_id: mpData.id })
              .eq("external_reference", externalReference)
          } catch {
            // ignore
          }

          return NextResponse.json({
            success: true,
            checkout_url: checkoutUrl,
            payment_method: "mercadopago",
            external_reference: externalReference,
            amount_clp: amountClp,
            amount_usd: amountUsd,
          })
        }
      } catch (err) {
        console.error("Error creating MercadoPago preference for Unicorn Bible:", err)
      }
    }

    // 2. Fallback or Bank Transfer
    if (payment_method === "bank") {
      return NextResponse.json({
        success: true,
        payment_method: "bank",
        amount_clp: amountClp,
        amount_usd: amountUsd,
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

    return NextResponse.json({
      success: true,
      checkout_url: `${redirectOrigin}/unicorn-bible?status=success&email=${encodeURIComponent(cleanEmail)}&ref=${externalReference}`,
      payment_method: "simulation",
      amount_clp: amountClp,
      amount_usd: amountUsd,
    })
  } catch (error: any) {
    console.error("Unicorn Bible checkout error:", error)
    return NextResponse.json(
      { error: error?.message || "Error al procesar el checkout del Founder Unicorn Pack" },
      { status: 500 }
    )
  }
}
