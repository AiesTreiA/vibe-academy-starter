import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeWelcomeTemplate, sendAdminRegistrationNotification } from "@/lib/email-service"
import { provisionVibecodeUser } from "@/lib/vibecode-auth-service"
import { verifyMercadoPagoWebhookSignature } from "@/lib/mercadopago-health"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get("topic") || url.searchParams.get("type")
    const idParam = url.searchParams.get("id") || url.searchParams.get("data.id")

    const body = await req.json().catch(() => ({}))
    const paymentId = idParam || body?.data?.id || body?.id

    const sigCheck = verifyMercadoPagoWebhookSignature({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: String(idParam || paymentId || ""),
      secret:
        process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MERCADO_PAGO_CLIENT_SECRET,
    })

    console.log(
      `🔔 [MP WEBHOOK] Received event - topic: ${topic}, paymentId: ${paymentId}, hmacValid: ${sigCheck.valid}`
    )

    if (!paymentId || String(paymentId) === "123456") {
      return NextResponse.json(
        { status: "ignored", reason: "probe or no payment id", signatureVerified: sigCheck.valid },
        { status: 200 }
      )
    }

    const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!mpToken) {
      console.error("❌ [MP WEBHOOK] MERCADO_PAGO_ACCESS_TOKEN not configured")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    // Verify payment details directly with Mercado Pago API
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${mpToken}`,
      },
    })

    if (!mpRes.ok) {
      console.error(`❌ [MP WEBHOOK] Failed to fetch payment ${paymentId} from MP API: ${mpRes.status}`)
      return NextResponse.json({ received: true, warning: "MP API payment not found" }, { status: 200 })
    }

    const paymentData = await mpRes.json()
    const status = paymentData.status // e.g. 'approved'
    const regID = paymentData.external_reference
    const preferenceID = paymentData.preference_id
    const payerEmail = paymentData.payer?.email

    console.log(`💳 [MP WEBHOOK] Payment ${paymentId} status: '${status}', regID: '${regID}', prefID: '${preferenceID}'`)

    if (status !== "approved") {
      console.log(`ℹ️ [MP WEBHOOK] Payment status is '${status}' (not approved). Ignoring.`)
      return NextResponse.json({ status: "ignored", payment_status: status }, { status: 200 })
    }

    const supabase = getSupabaseAdminClient() as any

    // Check if this is a Unicorn Bible order
    if (regID && String(regID).startsWith("unicorn_bible_")) {
      await supabase
        .from("bundle_orders")
        .update({ status: "approved", mp_payment_id: String(paymentId) })
        .eq("external_reference", regID)
      return NextResponse.json({
        success: true,
        flow: "unicorn_bible",
        external_reference: regID,
        signatureVerified: sigCheck.valid,
      })
    }

    let reg = null

    if (regID) {
      const { data } = await supabase
        .from("vibecode_registrations")
        .select("*")
        .eq("id", regID)
        .maybeSingle()
      reg = data
    }

    if (!reg && preferenceID) {
      const { data } = await supabase
        .from("vibecode_registrations")
        .select("*")
        .eq("mp_preference_id", preferenceID)
        .maybeSingle()
      reg = data
    }

    if (!reg && payerEmail) {
      const { data } = await supabase
        .from("vibecode_registrations")
        .select("*")
        .eq("email", payerEmail.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      reg = data
    }

    if (!reg) {
      console.log(`ℹ️ [MP WEBHOOK] Payment ${paymentId} (${regID}) acknowledged (non-vibecode or test flow)`)
      return NextResponse.json(
        {
          received: true,
          status: "acknowledged",
          external_reference: regID,
          signatureVerified: sigCheck.valid,
        },
        { status: 200 }
      )
    }

    // Update status to 'paid'
    if (reg.status !== "paid") {
      const { error: updateError } = await supabase
        .from("vibecode_registrations")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", reg.id)

      if (updateError) {
        console.error("❌ [MP WEBHOOK] DB update error:", updateError)
        return NextResponse.json({ error: "DB update error" }, { status: 500 })
      }
      console.log(`✅ [MP WEBHOOK] Updated registration ${reg.id} status to 'paid'`)
    }

    // Provision user account with temp password & send access credentials via Resend
    if (reg.email) {
      try {
        console.log(`📧 [MP WEBHOOK] Provisioning user and sending credentials to ${reg.email}`)
        await provisionVibecodeUser({
          email: reg.email,
          name: reg.name || "Estudiante",
          phone: reg.phone,
        })
        const welcomeHtml = getVibecodeWelcomeTemplate(reg.name || "Estudiante")
        await sendEmail({
          to: reg.email,
          subject: "🎉 ¡Te damos la bienvenida a VIBECODE LAB!",
          html: welcomeHtml,
        })
      } catch (emailErr) {
        console.error("❌ [MP WEBHOOK] Exception provisioning user email:", emailErr)
      }
    }

    // Send admin notification
    await sendAdminRegistrationNotification({
      name: reg.name,
      email: reg.email,
      phone: reg.phone,
      amount_paid: reg.amount_paid,
      payment_method: reg.payment_method,
      coupon_code: reg.coupon_code,
    })

    // Increment coupon usage
    if (reg.coupon_code) {
      try {
        const { data: couponData } = await supabase
          .from("vibecode_coupons")
          .select("current_uses")
          .eq("code", reg.coupon_code)
          .maybeSingle()

        if (couponData) {
          await supabase
            .from("vibecode_coupons")
            .update({ current_uses: (couponData.current_uses || 0) + 1 })
            .eq("code", reg.coupon_code)
        }
      } catch (couponErr) {
        console.error("Error updating coupon usage:", couponErr)
      }
    }

    return NextResponse.json({ success: true, registration_id: reg.id }, { status: 200 })
  } catch (err: any) {
    console.error("❌ [MP WEBHOOK] Error processing webhook:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Mercado Pago webhook route active" })
}
