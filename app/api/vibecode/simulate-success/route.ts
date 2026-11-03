import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeWelcomeTemplate } from "@/lib/email-service"
import { provisionVibecodeUser } from "@/lib/vibecode-auth-service"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const regID = body.reg_id

    if (!regID) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // Query registration details
    const { data: reg, error: fetchError } = await supabase
      .from("vibecode_registrations")
      .select("name, email, coupon_code, status")
      .eq("id", regID)
      .single()

    if (fetchError || !reg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (reg.status === "paid") {
      return NextResponse.json({ success: true, message: "Already paid" })
    }

    // Update status to 'paid'. This will fire the DB trigger `trg_verify_vibecode_seat`
    // which raises an exception if capacity is exceeded!
    const { error: updateError } = await supabase
      .from("vibecode_registrations")
      .update({ status: "paid" })
      .eq("id", regID)

    if (updateError) {
      console.error("Database update error (trigger block potentially):", updateError)
      // Check if it is a capacity limit error raised by the trigger
      const msg = updateError.message || ""
      if (msg.includes("capacity reached") || msg.includes("exceeded")) {
        return NextResponse.json(
          { error: "Lo sentimos, el cupo de 11 alumnos se ha agotado en este instante." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "Error al confirmar el pago en la base de datos." },
        { status: 500 }
      )
    }

    // Provision user and send credentials via Resend
    if (reg && reg.email) {
      try {
        await provisionVibecodeUser({
          email: reg.email,
          name: reg.name || "Estudiante",
        })
        const welcomeHtml = getVibecodeWelcomeTemplate(reg.name)
        await sendEmail({
          to: reg.email,
          subject: "🎉 ¡Te damos la bienvenida a VIBECODE LAB!",
          html: welcomeHtml,
        })
        console.log(`[VIBECODE] Welcome credentials & email sent via simulation to ${reg.email}`)
      } catch (emailErr) {
        console.error("Failed to send welcome email in simulation:", emailErr)
      }
    }

    // If a coupon code was used, increment its usage count
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

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Exception in simulate-success API:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
