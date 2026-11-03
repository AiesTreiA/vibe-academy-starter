import { NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now

    let supabase = null
    try {
      supabase = getSupabaseAdminClient()
    } catch {
      try {
        supabase = getSupabaseClient()
      } catch {}
    }

    if (supabase) {
      // Mark user links as paid and set 30-day expiration
      const { error } = await supabase
        .from("deeplinks")
        .update({
          is_paid: true,
          paid_until: expiresAt,
        })
        .eq("user_email", cleanEmail)

      if (error) {
        console.error("Error activating subscription:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Suscripción DeepLinks Pro activada exitosamente por 30 días",
      email: cleanEmail,
      paid_until: expiresAt,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al confirmar pago" }, { status: 500 })
  }
}
