import { NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase"

// In-memory fallback if Supabase is offline/not initialized
const memoryLinks = new Map<string, any>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { target_url, title, slug: customSlug, platform_type, user_email } = body

    if (!target_url) {
      return NextResponse.json({ error: "La URL de destino es obligatoria" }, { status: 400 })
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(target_url.startsWith("http") ? target_url : `https://${target_url}`)
    } catch {
      return NextResponse.json({ error: "URL inválida. Debe incluir dominio válido." }, { status: 400 })
    }

    const email = (user_email || "guest@anonymous.com").toLowerCase().trim()
    const adminEnv = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
    const isOwnerEmail =
      email === "hola@javiermujica.com" ||
      email === "javiermujicadev@gmail.com" ||
      (adminEnv !== "" && email === adminEnv)

    // Generate or sanitize slug
    let finalSlug = customSlug
      ? customSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "")
      : Math.random().toString(36).substring(2, 8)

    if (!finalSlug) {
      finalSlug = Math.random().toString(36).substring(2, 8)
    }

    // Check count for free tier (3 free links per user_email)
    let userLinksCount = 0
    let supabase = null

    try {
      supabase = getSupabaseAdminClient()
    } catch {
      try {
        supabase = getSupabaseClient()
      } catch (e) {
        console.warn("Supabase client not available, using in-memory store")
      }
    }

    if (supabase) {
      // Check existing links count for this user
      const { data: existingUserLinks, error: countErr } = await supabase
        .from("deeplinks")
        .select("id, is_paid, paid_until")
        .eq("user_email", email)

      if (!countErr && existingUserLinks) {
        userLinksCount = existingUserLinks.length
        const now = new Date()
        const hasPaidSubscription =
          isOwnerEmail ||
          existingUserLinks.some((l: any) => {
            if (!l.is_paid) return false
            if (!l.paid_until) return true
            return new Date(l.paid_until) > now
          })

        if (userLinksCount >= 3 && !hasPaidSubscription) {
          return NextResponse.json(
            {
              error: "Has alcanzado el límite de 3 enlaces gratuitos o tu suscripción ha vencido. Renueva por $1 USD/mes para seguir creando enlaces.",
              limit_reached: true,
              user_links_count: userLinksCount,
            },
            { status: 402 }
          )
        }
      }

      // Check if slug exists
      const { data: existingSlug } = await supabase
        .from("deeplinks")
        .select("id")
        .eq("slug", finalSlug)
        .single()

      if (existingSlug) {
        finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 5)}`
      }

      // Insert link into Supabase
      const newLink = {
        slug: finalSlug,
        target_url: validUrl.toString(),
        title: title || validUrl.hostname,
        platform_type: platform_type || "generic",
        user_email: email,
        clicks_count: 0,
        iab_bypass_count: 0,
        active: true,
        is_paid: isOwnerEmail ? true : false,
      }

      const { data: inserted, error: insertErr } = await supabase
        .from("deeplinks")
        .insert(newLink)
        .select()
        .single()

      if (!insertErr && inserted) {
        return NextResponse.json({
          success: true,
          deeplink: inserted,
          short_url: `${req.headers.get("origin") || "https://www.javiermujica.com"}/deeplink/${inserted.slug}`,
          free_links_remaining: isOwnerEmail ? 9999 : Math.max(0, 3 - (userLinksCount + 1)),
          is_owner: isOwnerEmail,
        })
      }
    }

    // Fallback if Supabase is unavailable
    if (memoryLinks.has(finalSlug)) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 5)}`
    }

    const fallbackLink = {
      id: `mem-${Date.now()}`,
      slug: finalSlug,
      target_url: validUrl.toString(),
      title: title || validUrl.hostname,
      platform_type: platform_type || "generic",
      user_email: email,
      clicks_count: 0,
      iab_bypass_count: 0,
      active: true,
      is_paid: isOwnerEmail ? true : false,
      created_at: new Date().toISOString(),
    }
    memoryLinks.set(finalSlug, fallbackLink)

    return NextResponse.json({
      success: true,
      deeplink: fallbackLink,
      short_url: `${req.headers.get("origin") || "https://www.javiermujica.com"}/deeplink/${finalSlug}`,
      free_links_remaining: isOwnerEmail ? 9999 : Math.max(0, 3 - (userLinksCount + 1)),
      is_owner: isOwnerEmail,
      fallback: true,
    })
  } catch (error: any) {
    console.error("Error creating deeplink:", error)
    return NextResponse.json({ error: error?.message || "Error al generar el enlace profundo" }, { status: 500 })
  }
}
