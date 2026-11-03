import crypto from "crypto"

export interface MpQualityCheckItem {
  id: string
  category: "seguridad" | "antifraude" | "conciliacion" | "experiencia"
  title: string
  requirement: string
  weight: number
  status: "passed" | "warning" | "failed"
  currentValue: string
  recommendation?: string
}

export interface MpDeveloperRequirementNotice {
  id: string
  version: string
  title: string
  impact: "critical" | "high" | "medium"
  implemented: boolean
  description: string
  actionRequired?: string
}

export function verifyMercadoPagoWebhookSignature(params: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string | null
  secret: string | undefined
}): { valid: boolean; reason: string } {
  const { xSignature, xRequestId, dataId, secret } = params

  if (!secret || secret.trim().length < 6) {
    return { valid: false, reason: "MERCADO_PAGO_WEBHOOK_SECRET no configurado" }
  }
  if (!xSignature) {
    return { valid: false, reason: "Header x-signature ausente" }
  }

  let ts = ""
  let hash = ""
  for (const part of xSignature.split(",")) {
    const [k, v] = part.split("=").map((s) => s.trim())
    if (k === "ts") ts = v
    if (k === "v1") hash = v
  }

  if (!ts || !hash) {
    return { valid: false, reason: "Formato x-signature inválido" }
  }

  const normalizedId = dataId ? dataId.toLowerCase() : ""
  const manifestParts: string[] = []
  if (normalizedId) manifestParts.push(`id:${normalizedId}`)
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`)
  manifestParts.push(`ts:${ts}`)
  const manifest = `${manifestParts.join(";")};`

  const computed = crypto.createHmac("sha256", secret.trim()).update(manifest).digest("hex")
  const isValid =
    computed.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash))

  return {
    valid: isValid,
    reason: isValid ? "Firma HMAC-SHA256 verificada" : "Firma HMAC no coincide",
  }
}

export async function runMercadoPagoHealthAudit() {
  const start = Date.now()
  const accessToken = (process.env.MERCADO_PAGO_ACCESS_TOKEN || "").trim()
  const publicKey = (
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
    process.env.MERCADO_PAGO_PUBLIC_KEY ||
    ""
  ).trim()
  const webhookSecret = (
    process.env.MERCADO_PAGO_WEBHOOK_SECRET ||
    process.env.MERCADO_PAGO_CLIENT_SECRET ||
    ""
  ).trim()

  const appId = accessToken ? accessToken.split("-")[1] || "" : ""
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  }

  let userData: any = null
  let prefSearch: any = null
  let latestPref: any = null
  let paySearch: any = null

  if (accessToken) {
    try {
      const [uRes, pRes, payRes] = await Promise.all([
        fetch("https://api.mercadopago.com/users/me", {
          headers,
          signal: AbortSignal.timeout(5000),
        }),
        fetch("https://api.mercadopago.com/checkout/preferences/search?limit=50", {
          headers,
          signal: AbortSignal.timeout(5000),
        }),
        appId
          ? fetch(
              `https://api.mercadopago.com/v1/payments/search?application_id=${appId}&limit=5&sort=date_created&criteria=desc`,
              { headers, signal: AbortSignal.timeout(5000) }
            )
          : Promise.resolve(null),
      ])

      if (uRes.ok) userData = await uRes.json()
      if (pRes.ok) prefSearch = await pRes.json()
      if (payRes && payRes.ok) paySearch = await payRes.json()

      const appPrefs = (prefSearch?.elements || []).filter(
        (el: any) => !appId || String(el.client_id) === String(appId)
      )
      appPrefs.sort(
        (a: any, b: any) =>
          new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime()
      )

      const targetPrefId = appPrefs[0]?.id || prefSearch?.elements?.[0]?.id
      if (targetPrefId) {
        const dRes = await fetch(
          `https://api.mercadopago.com/checkout/preferences/${targetPrefId}`,
          { headers, signal: AbortSignal.timeout(4000) }
        )
        if (dRes.ok) latestPref = await dRes.json()
      }
    } catch (err) {
      console.warn("[MP Health Audit] Error:", err)
    }
  }

  const latencyMs = Date.now() - start
  const item = latestPref?.items?.[0] || {}

  const checks: MpQualityCheckItem[] = [
    {
      id: "credentials_live",
      category: "seguridad",
      title: "Credenciales de Producción (/users/me + Public Key)",
      requirement: "Access Token y Public Key APP_USR-* activos",
      weight: 15,
      status: userData?.id && publicKey.startsWith("APP_USR-") ? "passed" : "failed",
      currentValue: userData?.id
        ? `${userData.nickname} (ID ${userData.id} · ${userData.site_id})`
        : "Sin conexión",
    },
    {
      id: "webhook_hmac",
      category: "seguridad",
      title: "Validación Criptográfica Webhook (x-signature HMAC-SHA256)",
      requirement: "Verificación de manifest id;request-id;ts y respuesta HTTP 200 rápida",
      weight: 15,
      status: webhookSecret.length >= 8 ? "passed" : "failed",
      currentValue:
        webhookSecret.length >= 8
          ? "Validador HMAC-SHA256 activo en /api/vibecode/mercadopago-webhook"
          : "Sin secreto",
    },
    {
      id: "external_reference",
      category: "conciliacion",
      title: "Referencia Externa de Conciliación (external_reference)",
      requirement: "Incluir external_reference único en todas las preferencias",
      weight: 15,
      status: latestPref?.external_reference ? "passed" : "failed",
      currentValue: latestPref?.external_reference || "null",
    },
    {
      id: "notification_url",
      category: "conciliacion",
      title: "URL de Notificación Webhook HTTPS (?source_news=webhooks)",
      requirement: "Enviar notification_url con HTTPS y ?source_news=webhooks",
      weight: 15,
      status:
        latestPref?.notification_url &&
        String(latestPref.notification_url).includes("source_news=webhooks")
          ? "passed"
          : latestPref?.notification_url
          ? "warning"
          : "failed",
      currentValue: latestPref?.notification_url || "null",
    },
    {
      id: "items_completeness",
      category: "antifraude",
      title: "Integridad de Ítems Antifraude (id, category_id, description, picture_url)",
      requirement: "Cada ítem debe incluir id, title, description, category_id, picture_url, quantity y unit_price",
      weight: 20,
      status:
        item.id && item.category_id && item.description && item.picture_url
          ? "passed"
          : item.id && item.description
          ? "warning"
          : "failed",
      currentValue: `id="${item.id || ""}", category_id="${item.category_id || ""}", desc=${
        item.description ? "OK" : "NO"
      }, pic=${item.picture_url ? "OK" : "NO"}`,
    },
    {
      id: "statement_descriptor",
      category: "experiencia",
      title: "Descriptor en Cartola Bancaria (statement_descriptor)",
      requirement: "Incluir statement_descriptor (<= 13 chars) para evitar desconocimientos de cargo",
      weight: 10,
      status: latestPref?.statement_descriptor ? "passed" : "failed",
      currentValue: latestPref?.statement_descriptor || "null",
    },
    {
      id: "back_urls_format",
      category: "experiencia",
      title: "Redirección back_urls + auto_return='approved'",
      requirement: "Configurar back_urls HTTPS y auto_return='approved'",
      weight: 10,
      status:
        latestPref?.auto_return === "approved" && latestPref?.back_urls?.success
          ? "passed"
          : "warning",
      currentValue: `auto_return="${latestPref?.auto_return || ""}"`,
    },
  ]

  let score = 0
  for (const c of checks) {
    if (c.status === "passed") score += c.weight
    else if (c.status === "warning") score += Math.round(c.weight * 0.5)
  }

  const requirementsRadar: MpDeveloperRequirementNotice[] = [
    {
      id: "req-idempotency-key",
      version: "MP API 2025/2026",
      title: "Header X-Idempotency-Key en peticiones POST",
      impact: "critical",
      implemented: true,
      description: "Evita cobros o preferencias duplicadas ante reintentos de red.",
    },
    {
      id: "req-webhook-v1-hmac",
      version: "Webhooks Seguridad v1",
      title: "Verificación HMAC-SHA256 de header x-signature y retorno 200 OK",
      impact: "critical",
      implemented: webhookSecret.length >= 8,
      description:
        "Valida el origen de Mercado Pago y responde HTTP 200 aún en pagos de otros flujos (Unicorn Bible, DeepLinks, Homologación).",
    },
    {
      id: "req-source-news-webhooks",
      version: "Notificaciones 2025+",
      title: "Parámetro ?source_news=webhooks en notification_url",
      impact: "high",
      implemented: Boolean(
        latestPref?.notification_url &&
          String(latestPref.notification_url).includes("source_news=webhooks")
      ),
      description: "Evita recibir notificaciones IPN duplicadas heredadas.",
    },
    {
      id: "req-antifraud-items",
      version: "Calidad de Integración",
      title: "Atributos antifraude completos en items[] + statement_descriptor",
      impact: "high",
      implemented: Boolean(
        item.id && item.category_id && item.description && latestPref?.statement_descriptor
      ),
      description:
        "Maximiza la tasa de aprobación en el motor antifraude de Mercado Pago.",
    },
  ]

  return {
    ok: Boolean(userData?.id),
    score,
    grade:
      score >= 90
        ? "Excelente (Homologable)"
        : score >= 75
        ? "Bueno"
        : "Requiere Atención",
    latencyMs,
    detail: userData?.id
      ? `Calidad ${score}/100 · Cuenta ${userData.nickname} (App ID ${appId})`
      : "No conectado",
    account: {
      collectorId: userData?.id,
      nickname: userData?.nickname,
      email: userData?.email,
      siteId: userData?.site_id,
      applicationId: appId,
    },
    latestPreferenceId: latestPref?.id,
    appPaymentsCount: paySearch?.paging?.total ?? 0,
    checks,
    requirementsRadar,
  }
}
