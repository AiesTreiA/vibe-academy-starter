import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const email = url.searchParams.get("email")

    if (!userId && !email) {
      return NextResponse.json({ error: "userId o email son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any
    let query = supabase.from("vibecode_profiles").select("*")

    if (userId) {
      query = query.eq("id", userId)
    } else if (email) {
      query = query.eq("email", email.trim().toLowerCase())
    }

    const { data: profile } = await query.maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile })
  } catch (err: any) {
    console.error("❌ Exception fetching profile:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { userId, email, full_name, avatar_url } = body

    if (!userId || !email) {
      return NextResponse.json({ error: "userId y email son requeridos" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const isAdmin = normalizedEmail === "hola@javiermujica.com"
    const role = isAdmin ? "admin" : "student"

    const supabase = getSupabaseAdminClient() as any

    // 1. Verification of Active Paid Registration for Students
    if (!isAdmin) {
      const { data: registration } = await supabase
        .from("vibecode_registrations")
        .select("id, status, email")
        .eq("email", normalizedEmail)
        .eq("status", "paid")
        .maybeSingle()

      if (!registration) {
        console.warn(`⛔ [VIBECODE AUTH] Access denied for unregistered/unpaid user: ${normalizedEmail}`)
        return NextResponse.json(
          {
            success: false,
            access_granted: false,
            error: `Tu correo (${normalizedEmail}) no figura como inscrito o con un pago activo en Vibecode Lab. Por favor inscríbete en el programa para acceder.`
          },
          { status: 403 }
        )
      }
    }

    // 2. Upsert profile for OAuth or authenticated session
    const { data: profile, error } = await supabase
      .from("vibecode_profiles")
      .upsert(
        {
          id: userId,
          email: normalizedEmail,
          full_name: full_name || (isAdmin ? "Javier Mujica" : "Estudiante Vibecode"),
          avatar_url: avatar_url || null,
          role,
          must_change_password: false, // Google OAuth users don't need to change password
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      )
      .select()
      .single()

    if (error) {
      console.error("❌ Error sync/upserting profile:", error)
      return NextResponse.json({ error: "Error al sincronizar el perfil" }, { status: 500 })
    }

    return NextResponse.json({ success: true, access_granted: true, profile })
  } catch (err: any) {
    console.error("❌ Exception in profile POST sync route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { userId, full_name, email, phone, bio, avatar_url } = body

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    const updates: any = {
      updated_at: new Date().toISOString()
    }
    if (full_name !== undefined) updates.full_name = full_name
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (bio !== undefined) updates.bio = bio
    if (avatar_url !== undefined) updates.avatar_url = avatar_url

    const { data, error } = await supabase
      .from("vibecode_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating profile:", error)
      return NextResponse.json({ error: "Error actualizando perfil" }, { status: 500 })
    }

    if (email) {
      try {
        await supabase.auth.admin.updateUserById(userId, { email })
      } catch (authErr) {
        console.warn("⚠️ Warning updating email in Supabase Auth:", authErr)
      }
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    console.error("❌ Exception updating profile:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
