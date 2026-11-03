import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Lista de países angloparlantes principales según cabecera Vercel GeoIP
const ENGLISH_COUNTRIES = new Set([
  "US", // Estados Unidos
  "GB", // Reino Unido
  "CA", // Canadá
  "AU", // Australia
  "NZ", // Nueva Zelanda
  "IE", // Irlanda
])

// Bots y rastreadores de motores de búsqueda que NO deben ser redirigidos forzosamente
const BOT_REGEX =
  /googlebot|bingbot|yandex|duckduckbot|baiduspider|twitterbot|facebookexternalhit|linkedinbot|slackbot|applebot|whatsapp/i

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const { pathname } = request.nextUrl

  // 0. Si el host es cto.javiermujica.com, servir el dashboard con el Gatekeeper de seguridad integrado
  if (host.startsWith("cto.")) {
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = "/cto/index.html"
    return NextResponse.rewrite(url)
  }

  // 1. Ignorar assets estáticos, archivos con extensión y rutas de API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") // .pdf, .ico, .png, etc.
  ) {
    return NextResponse.next()
  }

  // 2. Si ya está en la ruta en inglés (/en o /en/...)
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const response = NextResponse.next()
    // Si no tenía cookie, la fijamos para coherencia
    if (!request.cookies.get("NEXT_LOCALE")) {
      response.cookies.set("NEXT_LOCALE", "en", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
    }
    return response
  }

  // 3. Revisar si el usuario ya eligió explícitamente un idioma en cookie
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value
  if (localeCookie) {
    if (localeCookie === "en" && pathname === "/") {
      return NextResponse.redirect(new URL("/en", request.url))
    }
    return NextResponse.next()
  }

  // 4. No redirigir a bots de búsqueda (regla crítica para SEO: Googlebot entra desde US pero debe ver la versión base)
  const userAgent = request.headers.get("user-agent") || ""
  if (BOT_REGEX.test(userAgent)) {
    return NextResponse.next()
  }

  // 5. Solo evaluar redirección automática en la landing raíz ("/")
  if (pathname === "/") {
    const acceptLanguage = request.headers.get("accept-language") || ""
    const country = request.headers.get("x-vercel-ip-country") || ""

    // Prioridad 1: Idioma del navegador (Accept-Language)
    // Ej: "en-US,en;q=0.9,es;q=0.8" -> Si 'en' tiene mayor prioridad o inicia con 'en'
    const prefersEnglish = acceptLanguage.toLowerCase().startsWith("en")

    // Prioridad 2: País angloparlante detectado por Vercel CDN si no prefiere español explícito
    const prefersSpanish = acceptLanguage.toLowerCase().startsWith("es")
    const isEnglishCountry = ENGLISH_COUNTRIES.has(country.toUpperCase())

    if (prefersEnglish || (!prefersSpanish && isEnglishCountry)) {
      const url = request.nextUrl.clone()
      url.pathname = "/en"
      // Redirección 307 temporal para que los navegadores no cacheen permanentemente si viajan
      const response = NextResponse.redirect(url, 307)
      // Guardamos cookie suave para recordar la sesión
      response.cookies.set("NEXT_LOCALE", "en", { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
