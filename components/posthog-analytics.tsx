"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

/**
 * Inicializa PostHog en el cliente (una sola vez).
 * - Pageviews automáticos en navegación SPA (history_change).
 * - Session replay y autocapture según la configuración del proyecto en PostHog.
 * - No hace nada si NEXT_PUBLIC_POSTHOG_KEY no está definida (dev/local sin key).
 */
export default function PostHogAnalytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key || posthog.__loaded) return

    // No trackear pruebas locales (localhost, 127.0.0.1, IPs de red local)
    const host = window.location.hostname
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]" ||
      host.endsWith(".local") ||
      /^(192\.168\.|10\.)/.test(host)
    if (isLocal) return

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest",
      ui_host: "https://us.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: "history_change",
      capture_pageleave: true,
      defaults: "2025-05-24",
    })
  }, [])

  return null
}
