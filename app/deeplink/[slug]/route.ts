import { NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseClient } from "@/lib/supabase"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const userAgent = req.headers.get("user-agent") || ""
  const referrer = req.headers.get("referer") || ""

  let targetUrl = "https://www.javiermujica.com"
  let linkId: string | null = null
  let platformType = "generic"
  let linkFound = false

  // 1. Fetch deep link target from Supabase
  try {
    let supabase = null
    try {
      supabase = getSupabaseAdminClient()
    } catch {
      try {
        supabase = getSupabaseClient()
      } catch {}
    }

    if (supabase) {
      const { data: link } = await supabase
        .from("deeplinks")
        .select("id, target_url, platform_type, clicks_count, iab_bypass_count")
        .eq("slug", slug)
        .single()

      if (link) {
        targetUrl = link.target_url
        linkId = link.id
        platformType = link.platform_type
        linkFound = true
      }
    }
  } catch (err) {
    console.error("Error fetching deeplink:", err)
  }

  // If link not found and not a test slug, redirect to /deeplink with warning
  if (!linkFound && slug !== "test") {
    const origin = req.headers.get("origin") || "https://www.javiermujica.com"
    return NextResponse.redirect(`${origin}/deeplink?error=not_found&slug=${encodeURIComponent(slug)}`, 302)
  }

  // 2. User Agent & In-App Browser (IAB) analysis
  const uaLower = userAgent.toLowerCase()
  const isInstagram = uaLower.includes("instagram")
  const isTikTok = uaLower.includes("bytedance") || uaLower.includes("tiktok")
  const isFacebook = uaLower.includes("fban") || uaLower.includes("fbav")
  const isIAB = isInstagram || isTikTok || isFacebook || uaLower.includes("webview") || uaLower.includes("gsa/")

  const isAndroid = uaLower.includes("android")
  const isIOS = uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")

  // Log click asynchronously in background (fire-and-forget)
  if (linkId) {
    logClickAsync(linkId, userAgent, isAndroid ? "android" : isIOS ? "ios" : "desktop", isIAB, referrer)
  }

  // 3. Clean Target URL for Intent / Scheme formatting
  const cleanTargetHostAndPath = targetUrl.replace(/^https?:\/\//, "")

  // 4. STRATEGY FOR ANDROID IN-APP BROWSER (Instagram/TikTok/FB on Android)
  if (isAndroid && isIAB) {
    // Generate Android Chrome Intent URI
    const chromeIntentUri = `intent://${cleanTargetHostAndPath}#Intent;scheme=https;package=com.android.chrome;end`

    // Directly return HTTP 302 Redirect to the Intent URI!
    // Android OS catches 302 redirects to intent:// and launches Chrome directly without loading Instagram webview!
    return new Response(null, {
      status: 302,
      headers: {
        Location: chromeIntentUri,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  }

  // 5. STRATEGY FOR iOS IN-APP BROWSER (Instagram/TikTok/FB on iPhone)
  if (isIOS && isIAB) {
    let nativeAppScheme = ""
    let chromeIosScheme = `googlechromes://${cleanTargetHostAndPath}`

    if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
      const ytVideoId = extractYoutubeId(targetUrl)
      if (ytVideoId) {
        nativeAppScheme = `vnd.youtube://${ytVideoId}`
      }
    } else if (targetUrl.includes("wa.me") || targetUrl.includes("whatsapp.com")) {
      nativeAppScheme = targetUrl.replace("https://", "whatsapp://")
    } else if (targetUrl.includes("open.spotify.com")) {
      nativeAppScheme = targetUrl.replace("https://open.spotify.com", "spotify:")
    }

    // High-converting iOS escape screen
    const htmlResponseIOS = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Abriendo en Navegador Nativo...</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
      background: #09090b;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .card {
      background: rgba(24, 24, 27, 0.9);
      border: 1px solid rgba(161, 161, 170, 0.2);
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      position: relative;
    }
    .top-arrow {
      position: absolute;
      top: -12px;
      right: 24px;
      color: #3b82f6;
      font-size: 24px;
      animation: bounce 1.2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff, #a1a1aa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .desc {
      color: #a1a1aa;
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: white;
      text-decoration: none;
      padding: 16px 20px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 16px;
      display: block;
      margin-bottom: 12px;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #e4e4e7;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      display: block;
      margin-bottom: 16px;
    }
    .step-box {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 14px;
      border-radius: 14px;
      font-size: 13px;
      color: #93c5fd;
      text-align: left;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="top-arrow">↗️</div>
    <div class="icon">⚡</div>
    <div class="title">Abrir fuera de Instagram</div>
    <div class="desc">Abre este enlace en tu navegador para tener tu sesión iniciada y comprar o navegar sin restricciones.</div>

    ${nativeAppScheme ? `<a href="${nativeAppScheme}" class="btn-primary">📱 Abrir en App Nativa</a>` : ""}
    <a href="${chromeIosScheme}" class="btn-primary" id="openChromeBtn">🚀 Abrir en Google Chrome</a>
    <a href="${targetUrl}" class="btn-secondary">Continuar en la web actual</a>

    <div class="step-box">
      <strong>💡 Para abrir en Safari:</strong><br>
      1. Toca los <strong>tres puntos (···)</strong> arriba a la derecha.<br>
      2. Selecciona <strong>"Abrir en navegador"</strong>.
    </div>
  </div>

  <script>
    const nativeScheme = "${nativeAppScheme}";
    const chromeScheme = "${chromeIosScheme}";

    // Auto-try native scheme if target is YouTube/WhatsApp/Spotify
    if (nativeScheme) {
      window.location.href = nativeScheme;
    } else if (chromeScheme) {
      window.location.href = chromeScheme;
    }
  </script>
</body>
</html>`

    return new Response(htmlResponseIOS, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  }

  // 6. DEFAULT REDIRECT FOR STANDARD BROWSERS (HTTP 302)
  return NextResponse.redirect(targetUrl, 302)
}

// Helper to log click metrics asynchronously
async function logClickAsync(linkId: string, userAgent: string, os: string, isIAB: boolean, referrer: string) {
  try {
    let supabase = null
    try {
      supabase = getSupabaseAdminClient()
    } catch {
      try {
        supabase = getSupabaseClient()
      } catch {}
    }

    if (supabase) {
      // 1. Record click entry
      await supabase.from("deeplink_clicks").insert({
        deeplink_id: linkId,
        user_agent: userAgent,
        os,
        is_iab: isIAB,
        referrer,
      })

      // 2. Increment counters in main table
      const { data: current } = await supabase
        .from("deeplinks")
        .select("clicks_count, iab_bypass_count")
        .eq("id", linkId)
        .single()

      if (current) {
        await supabase
          .from("deeplinks")
          .update({
            clicks_count: (current.clicks_count || 0) + 1,
            iab_bypass_count: isIAB ? (current.iab_bypass_count || 0) + 1 : current.iab_bypass_count || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", linkId)
      }
    }
  } catch (e) {
    console.error("Error logging click async:", e)
  }
}

// Helper to extract YouTube Video ID
function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
