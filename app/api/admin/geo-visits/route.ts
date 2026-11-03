import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === "authenticated"
}

const EN_COUNTRIES = new Set(["US", "GB", "CA", "AU", "NZ", "IE"])
const TZ = "America/Santiago"

interface Row {
  created_at: string
  site: string
  path: string | null
  country: string | null
  city: string | null
  lat: number | null
  lon: number | null
  lang: string | null
  referrer: string | null
  utm_source: string | null
  device: string | null
  session_id: string | null
}

function top<T>(map: Map<string, T>, by: (v: T) => number, n: number) {
  return [...map.entries()].sort((a, b) => by(b[1]) - by(a[1])).slice(0, n)
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(request.url)
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 180)
  const site = url.searchParams.get("site") || "all"

  const now = Date.now()
  const curStart = now - days * 86400000
  const prevStart = curStart - days * 86400000

  const supabase = getSupabaseAdminClient() as any
  let q = supabase
    .from("site_visits")
    .select("created_at,site,path,country,city,lat,lon,lang,referrer,utm_source,device,session_id")
    .gte("created_at", new Date(prevStart).toISOString())
    .order("created_at", { ascending: false })
    .limit(50000)
  if (site !== "all") q = q.eq("site", site)

  const { data, error } = await q
  if (error) {
    const missing = /site_visits|relation|does not exist/i.test(error.message)
    return NextResponse.json({ error: error.message, tableMissing: missing }, { status: missing ? 200 : 500 })
  }

  const rows: Row[] = data || []
  const cur = rows.filter((r) => new Date(r.created_at).getTime() >= curStart)
  const prev = rows.filter((r) => new Date(r.created_at).getTime() < curStart)

  const uniq = (rs: Row[]) => new Set(rs.map((r) => r.session_id || r.created_at)).size

  // --- Países ---
  type C = { visits: number; sessions: Set<string>; prev: number; sites: Record<string, number>; langs: Record<string, number> }
  const countries = new Map<string, C>()
  const get = (k: string): C => {
    if (!countries.has(k)) countries.set(k, { visits: 0, sessions: new Set(), prev: 0, sites: {}, langs: {} })
    return countries.get(k)!
  }
  for (const r of cur) {
    const c = get(r.country || "??")
    c.visits++
    c.sessions.add(r.session_id || r.created_at)
    c.sites[r.site] = (c.sites[r.site] || 0) + 1
    if (r.lang) c.langs[r.lang] = (c.langs[r.lang] || 0) + 1
  }
  for (const r of prev) get(r.country || "??").prev++

  const totalVisits = cur.length
  const countryList = [...countries.entries()]
    .filter(([, c]) => c.visits > 0 || c.prev > 0)
    .map(([code, c]) => ({
      code,
      visits: c.visits,
      sessions: c.sessions.size,
      prev: c.prev,
      delta: c.prev > 0 ? Math.round(((c.visits - c.prev) / c.prev) * 100) : c.visits > 0 ? null : -100,
      share: totalVisits ? Math.round((c.visits / totalVisits) * 1000) / 10 : 0,
      sites: c.sites,
    }))
    .sort((a, b) => b.visits - a.visits)

  // --- Ciudades (burbujas del mapa) ---
  const cityMap = new Map<string, { city: string; country: string; lat: number; lon: number; visits: number }>()
  for (const r of cur) {
    if (r.lat == null || r.lon == null) continue
    const key = `${r.city || "?"}|${r.country}`
    const e = cityMap.get(key) || { city: r.city || "Desconocida", country: r.country || "??", lat: r.lat, lon: r.lon, visits: 0 }
    e.visits++
    cityMap.set(key, e)
  }
  const cities = top(cityMap, (v) => v.visits, 200).map(([, v]) => v)

  // --- Sitios ---
  const siteMap = new Map<string, { visits: number; countries: Set<string>; intl: number; home: Record<string, number> }>()
  for (const r of cur) {
    const s = siteMap.get(r.site) || { visits: 0, countries: new Set(), intl: 0, home: {} }
    s.visits++
    if (r.country) {
      s.countries.add(r.country)
      s.home[r.country] = (s.home[r.country] || 0) + 1
    }
    siteMap.set(r.site, s)
  }
  const sites = [...siteMap.entries()].map(([name, s]) => {
    const topCountry = Object.entries(s.home).sort((a, b) => b[1] - a[1])[0]
    return {
      site: name,
      visits: s.visits,
      countries: s.countries.size,
      topCountry: topCountry?.[0] || null,
      topCountryShare: topCountry ? Math.round((topCountry[1] / s.visits) * 100) : 0,
    }
  }).sort((a, b) => b.visits - a.visits)

  // --- Referrers, dispositivos, idiomas ---
  const refs = new Map<string, number>()
  const devices: Record<string, number> = {}
  const langs: Record<string, number> = {}
  for (const r of cur) {
    const ref = r.utm_source || r.referrer || "directo"
    refs.set(ref, (refs.get(ref) || 0) + 1)
    if (r.device) devices[r.device] = (devices[r.device] || 0) + 1
    if (r.lang) langs[r.lang] = (langs[r.lang] || 0) + 1
  }
  const referrers = top(refs, (v) => v, 8).map(([name, visits]) => ({ name, visits }))

  // --- Hora pico (zona Chile) y tendencia diaria ---
  const hourFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: TZ })
  const hours = Array(24).fill(0)
  const daily = new Map<string, number>()
  for (const r of cur) {
    const d = new Date(r.created_at)
    hours[Number(hourFmt.format(d)) % 24]++
    const k = d.toISOString().slice(0, 10)
    daily.set(k, (daily.get(k) || 0) + 1)
  }
  const dailySeries = [...daily.entries()].sort().map(([date, visits]) => ({ date, visits }))

  // --- Insights accionables ---
  const insights: { level: "opportunity" | "risk" | "info"; title: string; detail: string; action: string }[] = []
  const known = countryList.filter((c) => c.code !== "??")
  const topC = known[0]

  if (totalVisits < 50) {
    insights.push({
      level: "info",
      title: "Muestra aún pequeña",
      detail: `Solo ${totalVisits} visitas en ${days} días: las tendencias por país pueden ser ruido.`,
      action: "Espera ≥ 100 visitas antes de mover presupuesto; mientras tanto usa el mapa para detectar patrones, no para decidir.",
    })
  }
  if (topC && topC.share >= 60 && totalVisits >= 30) {
    insights.push({
      level: "risk",
      title: `Alta concentración en ${topC.code} (${topC.share}%)`,
      detail: "Más de 60% de la audiencia viene de un solo país: riesgo de depender de un mercado/canal.",
      action: "Prueba una campaña o artículo dirigido a un 2º mercado hispano o inglés y compara el costo por visita.",
    })
  }
  const emerging = known.find((c) => c !== topC && c.visits >= 8 && (c.delta === null || (c.delta ?? 0) >= 50))
  if (emerging) {
    insights.push({
      level: "opportunity",
      title: `Mercado emergente: ${emerging.code}`,
      detail: `${emerging.visits} visitas (${emerging.delta === null ? "nuevo" : "+" + emerging.delta + "%"} vs período anterior).`,
      action: "Adapta moneda/ejemplos/horarios para ese país y mide si convierte antes de invertir en pauta.",
    })
  }
  const enVisits = cur.filter((r) => (r.country && EN_COUNTRIES.has(r.country)) || r.lang === "en").length
  const enShare = totalVisits ? Math.round((enVisits / totalVisits) * 100) : 0
  if (enShare >= 15) {
    insights.push({
      level: "opportunity",
      title: `${enShare}% de la audiencia es angloparlante`,
      detail: "Hay demanda en inglés: la versión /en ya existe.",
      action: "Publica artículos y CTA de agenda en inglés y prioriza LinkedIn EN y horarios US.",
    })
  }
  const peak = hours.indexOf(Math.max(...hours))
  if (totalVisits >= 30) {
    insights.push({
      level: "info",
      title: `Hora pico: ${String(peak).padStart(2, "0")}:00 (hora Chile)`,
      detail: "Momento del día con más tráfico acumulado.",
      action: `Programa publicaciones y envíos ~1 h antes (${String((peak + 23) % 24).padStart(2, "0")}:00).`,
    })
  }
  const mobileShare = totalVisits ? Math.round(((devices.mobile || 0) / totalVisits) * 100) : 0
  if (mobileShare >= 65) {
    insights.push({
      level: "info",
      title: `${mobileShare}% del tráfico es móvil`,
      detail: "La mayoría navega desde el teléfono.",
      action: "Revisa CTA de agenda y formularios en móvil antes que en desktop.",
    })
  }
  const topRef = referrers.find((r) => r.name !== "directo")
  if (topRef && totalVisits >= 30) {
    insights.push({
      level: "info",
      title: `Canal líder: ${topRef.name}`,
      detail: `${topRef.visits} visitas (${Math.round((topRef.visits / totalVisits) * 100)}%).`,
      action: "Duplica el contenido que alimenta este canal y añade UTM a todo enlace saliente para atribuir conversiones.",
    })
  }

  return NextResponse.json({
    days,
    site,
    generatedAt: new Date().toISOString(),
    totals: {
      visits: totalVisits,
      prevVisits: prev.length,
      deltaPct: prev.length ? Math.round(((totalVisits - prev.length) / prev.length) * 100) : null,
      sessions: uniq(cur),
      countries: known.filter((c) => c.visits > 0).length,
      cities: cityMap.size,
      intlSharePct: topC && totalVisits ? 100 - topC.share : 0,
      topCountry: topC?.code || null,
      topCountryShare: topC?.share || 0,
    },
    countries: countryList.slice(0, 25),
    cities,
    sites,
    referrers,
    devices,
    langs,
    hours,
    daily: dailySeries,
    insights,
  })
}
