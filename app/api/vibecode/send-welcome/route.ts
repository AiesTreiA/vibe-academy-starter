import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeWelcomeTemplate } from "@/lib/email-service"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { reg_id, secret } = body

    const expectedSecret = process.env.VERCEL_CRON_SECRET || "bfbad8fc5831ee549dea3ee90d5bcbfa9128763a90849f322bc9a2ed7a7b1eba"
    if (!secret || secret !== expectedSecret) {
      console.warn("⚠️ [VIBECODE] Unauthorized attempt to send welcome email.")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!reg_id) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // Retrieve registration info
    const { data: reg, error: fetchError } = await supabase
      .from("vibecode_registrations")
      .select("name, email, status")
      .eq("id", reg_id)
      .single()

    if (fetchError || !reg) {
      console.error(`❌ [VIBECODE] Registration not found for ID ${reg_id}:`, fetchError)
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (reg.status !== "paid") {
      console.warn(`⚠️ [VIBECODE] Registration ${reg_id} status is '${reg.status}', not 'paid'. Email skipped.`)
      return NextResponse.json({ error: "Registration is not in paid status" }, { status: 400 })
    }

    console.log(`📧 [VIBECODE] Sending welcome email to ${reg.email} (${reg.name})`)
    
    const welcomeHtml = getVibecodeWelcomeTemplate(reg.name)
    const emailResult = await sendEmail({
      to: reg.email,
      subject: "🎉 ¡Te damos la bienvenida a VIBECODE LAB!",
      html: welcomeHtml,
    })

    if (!emailResult.success) {
      console.error("❌ [VIBECODE] Resend failed sending email:", emailResult.error)
      return NextResponse.json({ error: "Email sending failed", details: emailResult.error }, { status: 500 })
    }

    console.log(`✅ [VIBECODE] Welcome email sent successfully to ${reg.email}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ [VIBECODE] Exception in send-welcome route:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
