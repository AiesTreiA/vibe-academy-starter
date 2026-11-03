import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const ALLOWED_SITES = new Set([
  "javiermujica.com",
  "sintergiagroup.com",
  "raapaz.com",
  "verticapp.pro",
])
const BOT_REGEX = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp/i

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

function num(v: string | null) {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : null
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") || ""
    if (BOT_REGEX.test(ua)) return NextResponse.json({ ok: true, skipped: "bot" }, { headers: CORS })

    const body = await request.json().catch(() => ({}))
    const site = String(body.site || "").replace(/^www\./, "").toLowerCase()
    if (!ALLOWED_SITES.has(site)) {
      return NextResponse.json({ ok: false, error: "site no permitido" }, { status: 400, headers: CORS })
    }

    const h = request.headers
    const city = h.get("x-vercel-ip-city")
    const acceptLang = (h.get("accept-language") || "").slice(0, 2).toLowerCase()

    const row = {
      site,
      path: String(body.path || "/").slice(0, 200),
      country: h.get("x-vercel-ip-country"),
      region: h.get("x-vercel-ip-country-region"),
      city: city ? decodeURIComponent(city) : null,
      lat: num(h.get("x-vercel-ip-latitude")),
      lon: num(h.get("x-vercel-ip-longitude")),
      lang: acceptLang || null,
      referrer: body.referrer ? String(body.referrer).slice(0, 120) : null,
      utm_source: body.utm_source ? String(body.utm_source).slice(0, 60) : null,
      device: /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop",
      session_id: body.session_id ? String(body.session_id).slice(0, 40) : null,
    }

    const supabase = getSupabaseAdminClient() as any
    const { error } = await supabase.from("site_visits").insert(row)
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: CORS })
    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500, headers: CORS })
  }
}
