import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getVibecodeWelcomeTemplate, sendAdminRegistrationNotification } from "@/lib/email-service"

export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any

  try {
    const { data, error } = await supabase
      .from("vibecode_registrations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching vibecode registrations:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: any) {
    console.error("Vibecode registrations API GET error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "Registration ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    if (action === "toggleStatus") {
      const { currentStatus } = body
      // If current status is paid, set to pending (acts as test / not paid).
      // If current status is pending or failed, set to paid.
      const newStatus = currentStatus === "paid" ? "pending" : "paid"
      const updatePayload: any = { status: newStatus }
      if (newStatus === "paid") {
        updatePayload.paid_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from("vibecode_registrations")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating status:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      if (newStatus === "paid" && data) {
        try {
          const welcomeHtml = getVibecodeWelcomeTemplate(data.name || "Estudiante")
          await sendEmail({
            to: data.email,
            subject: "🎉 ¡Te damos la bienvenida a VIBECODE LAB!",
            html: welcomeHtml,
          })
        } catch (eErr) {
          console.error("Failed to send welcome email on admin toggle:", eErr)
        }

        try {
          await sendAdminRegistrationNotification({
            name: data.name,
            email: data.email,
            phone: data.phone,
            amount_paid: data.amount_paid,
            payment_method: data.payment_method || "manual_admin",
            coupon_code: data.coupon_code,
          })
        } catch (aErr) {
          console.error("Failed to send admin notification on admin toggle:", aErr)
        }
      }

      return NextResponse.json({ success: true, data }, { status: 200 })
    }

    if (action === "delete") {
      const { error } = await supabase
        .from("vibecode_registrations")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error deleting registration:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Registration deleted successfully" }, { status: 200 })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    console.error("Vibecode registrations API POST error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
