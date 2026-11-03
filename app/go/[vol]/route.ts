import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { isValidVolume } from "@/lib/unicorn-bible-config"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vol: string }> }
) {
  const { vol: rawVol } = await context.params
  const queryVol = request.nextUrl.searchParams.get("vol")
  const parsedVol = isValidVolume(rawVol)
    ? Number(rawVol)
    : isValidVolume(queryVol)
    ? Number(queryVol)
    : 1

  const utmCampaign = request.nextUrl.searchParams.get("utm_campaign") || "unicorn_bible"
  const utmMedium = request.nextUrl.searchParams.get("utm_medium") || "qr"
  const utmContent = request.nextUrl.searchParams.get("utm_content") || `vol_${parsedVol}`

  // Non-blocking telemetry insert into Supabase `ebook_qr_scans` (no PII)
  try {
    const supabase = getSupabaseAdminClient() as any
    await supabase.from("ebook_qr_scans").insert([
      {
        vol: parsedVol,
        source: "ebook",
        utm_campaign: utmCampaign,
        utm_medium: utmMedium,
        utm_content: utmContent,
        user_agent: (request.headers.get("user-agent") || "").slice(0, 255),
        referer: (request.headers.get("referer") || "").slice(0, 255),
      },
    ])
  } catch (err) {
    // Never block user redirection if telemetry table hasn't been migrated yet
    console.warn("QR scan telemetry skipped:", err)
  }

  const targetUrl = new URL("/ebook-quiz", request.nextUrl.origin)
  targetUrl.searchParams.set("source", "ebook")
  targetUrl.searchParams.set("vol", String(parsedVol))
  targetUrl.searchParams.set("utm_campaign", utmCampaign)
  targetUrl.searchParams.set("utm_medium", utmMedium)
  targetUrl.searchParams.set("utm_content", utmContent)

  return NextResponse.redirect(targetUrl.toString(), { status: 302 })
}
