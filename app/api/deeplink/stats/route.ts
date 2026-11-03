import { NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    const slug = searchParams.get("slug")

    let supabase = null
    try {
      supabase = getSupabaseAdminClient()
    } catch {
      try {
        supabase = getSupabaseClient()
      } catch {}
    }

    if (!supabase) {
      return NextResponse.json({ success: true, deeplinks: [] })
    }

    if (slug) {
      const { data: link, error } = await supabase
        .from("deeplinks")
        .select("*, deeplink_clicks(*)")
        .eq("slug", slug)
        .single()

      if (error || !link) {
        return NextResponse.json({ error: "Enlace no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ success: true, deeplink: link })
    }

    if (email) {
      const cleanEmail = email.toLowerCase().trim()
      const adminEnv = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
      const isOwnerEmail =
        cleanEmail === "hola@javiermujica.com" ||
        cleanEmail === "javiermujicadev@gmail.com" ||
        (adminEnv !== "" && cleanEmail === adminEnv)

      const { data: links, error } = await supabase
        .from("deeplinks")
        .select("*")
        .eq("user_email", cleanEmail)
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        deeplinks: links || [],
        total_links: (links || []).length,
        free_links_remaining: isOwnerEmail ? 9999 : Math.max(0, 3 - (links || []).length),
        is_owner: isOwnerEmail,
      })
    }

    return NextResponse.json({ error: "Se requiere parámetro 'email' o 'slug'" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error al obtener estadísticas" }, { status: 500 })
  }
}
