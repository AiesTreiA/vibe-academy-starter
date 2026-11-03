import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { userId, newPassword } = await req.json().catch(() => ({}))

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "ID de usuario y nueva contraseña son requeridos" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Update password in Supabase Auth
    try {
      await supabase.auth.admin.updateUserById(userId, { password: newPassword })
    } catch (authErr) {
      console.warn("⚠️ Warning updating user password in Supabase Auth:", authErr)
    }

    // 2. Update must_change_password = false in vibecode_profiles
    const { error: updateErr } = await supabase
      .from("vibecode_profiles")
      .update({
        must_change_password: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (updateErr) {
      console.error("❌ Error updating must_change_password in profile:", updateErr)
      return NextResponse.json({ error: "Error al actualizar el perfil de usuario" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente"
    })
  } catch (err: any) {
    console.error("❌ Exception in change-password route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
