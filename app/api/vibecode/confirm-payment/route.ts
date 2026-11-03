import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeWelcomeTemplate, sendAdminRegistrationNotification } from "@/lib/email-service"
import { provisionVibecodeUser } from "@/lib/vibecode-auth-service"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const regID = body.reg_id
    const preferenceID = body.preference_id
    const paymentID = body.payment_id

    const supabase = getSupabaseAdminClient() as any

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

    if (!reg) {
      // Find latest pending registration created in the last 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from("vibecode_registrations")
        .select("*")
        .eq("status", "pending")
        .gte("created_at", twoHoursAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      reg = data
    }

    if (!reg) {
      return NextResponse.json({ error: "No pending registration found to confirm" }, { status: 404 })
    }

    // Update status to 'paid' if not already paid
    if (reg.status !== "paid") {
      const { error: updateError } = await supabase
        .from("vibecode_registrations")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", reg.id)

      if (updateError) {
        console.error("❌ Error updating registration status to paid:", updateError)
        return NextResponse.json({ error: "Error updating registration status" }, { status: 500 })
      }
    }

    // Provision user account with temp password & send access credentials via Resend
    if (reg.email) {
      try {
        console.log(`📧 [VIBECODE] Provisioning user and sending welcome credentials for ${reg.email}`)
        await provisionVibecodeUser({
          email: reg.email,
          name: reg.name || "Estudiante",
          phone: reg.phone,
        })
        
        // Also send general bootcamp welcome email with classes & Google Meet info
        const welcomeHtml = getVibecodeWelcomeTemplate(reg.name || "Estudiante")
        await sendEmail({
          to: reg.email,
          subject: "🎉 ¡Te damos la bienvenida a VIBECODE LAB!",
          html: welcomeHtml,
        })
      } catch (emailErr) {
        console.error("❌ [VIBECODE] Exception provisioning user email:", emailErr)
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

    // Increment coupon usage if used
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

    return NextResponse.json({
      success: true,
      message: "Pago confirmado e email de bienvenida enviado",
      registration_id: reg.id,
      student_email: reg.email,
    })
  } catch (err: any) {
    console.error("❌ Exception in confirm-payment route:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
