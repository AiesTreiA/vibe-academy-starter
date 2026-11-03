import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    let supabase: any = null
    try {
      supabase = getSupabaseAdminClient()
    } catch (e) {
      console.warn("Supabase admin client not available:", e)
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        summary: {
          total_users: 0,
          total_deeplinks: 0,
          total_clicks: 0,
          total_iab_bypass: 0,
          pro_users_count: 0,
        },
        users: [],
        all_links: [],
      })
    }

    const { data: deeplinks, error } = await supabase
      .from("deeplinks")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching deeplinks in admin API:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const links = deeplinks || []

    // Group links by user_email
    const usersMap = new Map<string, {
      user_email: string
      link_count: number
      total_clicks: number
      total_iab_bypass: number
      is_paid: boolean
      paid_until: string | null
      first_created_at: string
      last_created_at: string
      links: any[]
    }>()

    let totalClicks = 0
    let totalIabBypass = 0

    for (const link of links) {
      const email = (link.user_email || "guest@anonymous.com").toLowerCase().trim()
      const clicks = Number(link.clicks_count || 0)
      const iabBypass = Number(link.iab_bypass_count || 0)
      
      totalClicks += clicks
      totalIabBypass += iabBypass

      const existing = usersMap.get(email)
      const nowIsPaid = Boolean(link.is_paid)

      if (existing) {
        existing.link_count += 1
        existing.total_clicks += clicks
        existing.total_iab_bypass += iabBypass
        if (nowIsPaid) {
          existing.is_paid = true
          if (link.paid_until && (!existing.paid_until || new Date(link.paid_until) > new Date(existing.paid_until))) {
            existing.paid_until = link.paid_until
          }
        }
        if (new Date(link.created_at) < new Date(existing.first_created_at)) {
          existing.first_created_at = link.created_at
        }
        if (new Date(link.created_at) > new Date(existing.last_created_at)) {
          existing.last_created_at = link.created_at
        }
        existing.links.push(link)
      } else {
        usersMap.set(email, {
          user_email: email,
          link_count: 1,
          total_clicks: clicks,
          total_iab_bypass: iabBypass,
          is_paid: nowIsPaid,
          paid_until: link.paid_until || null,
          first_created_at: link.created_at || new Date().toISOString(),
          last_created_at: link.created_at || new Date().toISOString(),
          links: [link],
        })
      }
    }

    const usersList = Array.from(usersMap.values()).sort((a, b) => b.link_count - a.link_count || new Date(b.last_created_at).getTime() - new Date(a.last_created_at).getTime())
    const proUsersCount = usersList.filter(u => u.is_paid).length

    return NextResponse.json({
      success: true,
      summary: {
        total_users: usersList.length,
        total_deeplinks: links.length,
        total_clicks: totalClicks,
        total_iab_bypass: totalIabBypass,
        pro_users_count: proUsersCount,
      },
      users: usersList,
      all_links: links,
    })
  } catch (err: any) {
    console.error("Admin deeplinks GET error:", err)
    return NextResponse.json({ success: false, error: err.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de enlace requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any
    const { error } = await supabase
      .from("deeplinks")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Enlace eliminado correctamente" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Error al eliminar" }, { status: 500 })
  }
}
