"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Envía una visita anónima a /api/track-visit para el mapa de Geo-Audiencia del panel CTO.
 * No guarda IP; la geolocalización la resuelve el servidor desde headers de Vercel.
 */
export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("cto.")) return
    if (pathname.startsWith("/admin")) return

    let sid = sessionStorage.getItem("vt_sid")
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem("vt_sid", sid)
    }
    let refHost: string | null = null
    try {
      refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : null
      if (refHost === host.replace(/^www\./, "")) refHost = null
    } catch {}

    const payload = JSON.stringify({
      site: host,
      path: pathname,
      referrer: refHost,
      utm_source: new URLSearchParams(window.location.search).get("utm_source"),
      session_id: sid,
    })
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }, [pathname])

  return null
}
