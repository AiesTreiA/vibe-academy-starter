import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

interface HealthResult {
  ok: boolean
  latencyMs?: number
  detail?: string
}

async function checkSupabase(): Promise<HealthResult> {
  const start = Date.now()
  try {
    const supabase = getSupabaseAdminClient() as any
    const { error } = await supabase
      .from("vibecode_registrations")
      .select("id", { count: "exact", head: true })
    if (error) return { ok: false, latencyMs: Date.now() - start, detail: error.message }
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err: any) {
    return { ok: false, detail: err.message }
  }
}

async function checkDeepSeek(): Promise<HealthResult> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return { ok: false, detail: "DEEPSEEK_API_KEY no configurada" }
  const start = Date.now()
  try {
    const res = await fetch("https://api.deepseek.com/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    })
    const latencyMs = Date.now() - start
    if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, detail: err.message }
  }
}

async function checkGemini(): Promise<HealthResult> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return { ok: false, detail: "GEMINI_API_KEY no configurada" }
  const start = Date.now()
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`,
      { signal: AbortSignal.timeout(6000) }
    )
    const latencyMs = Date.now() - start
    if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, detail: err.message }
  }
}


async function checkAnthropic(): Promise<HealthResult> {
  const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
  if (!key) return { ok: false, detail: "CLAUDE_API_KEY no configurada" }
  const start = Date.now()
  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": key.trim(),
        "anthropic-version": "2023-06-01"
      },
      signal: AbortSignal.timeout(6000),
    })
    const latencyMs = Date.now() - start
    if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, detail: err.message }
  }
}

async function checkOpenAI(): Promise<HealthResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { ok: false, detail: "OPENAI_API_KEY no configurada" }
  const start = Date.now()
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    })
    const latencyMs = Date.now() - start
    if (!res.ok) return { ok: false, latencyMs, detail: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, detail: err.message }
  }
}

async function checkMercadoPago(): Promise<HealthResult & { audit?: any }> {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) return { ok: false, detail: "MERCADO_PAGO_ACCESS_TOKEN no configurado" }
  try {
    const { runMercadoPagoHealthAudit } = await import("@/lib/mercadopago-health")
    const audit = await runMercadoPagoHealthAudit()
    return {
      ok: audit.ok,
      latencyMs: audit.latencyMs,
      detail: audit.detail,
      audit,
    }
  } catch (err: any) {
    return { ok: false, detail: err.message }
  }
}

// Flow — pending integration, just check if key exists
function checkFlow(): HealthResult {
  const key = process.env.FLOW_API_KEY
  if (!key) return { ok: false, detail: "⏳ Pendiente de integrar — FLOW_API_KEY no configurada" }
  return { ok: true, detail: "Clave configurada (aún no en producción)" }
}

// Transbank — pending integration
function checkTransbank(): HealthResult {
  const code = process.env.TRANSBANK_COMMERCE_CODE
  if (!code) return { ok: false, detail: "⏳ Pendiente de integrar — TRANSBANK_COMMERCE_CODE no configurado" }
  return { ok: true, detail: "Clave configurada (aún no en producción)" }
}

// Transferencia bancaria — manual flow, just check if info configured
function checkTransferencia(): HealthResult {
  const info = process.env.BANK_ACCOUNT_INFO
  if (!info) return { ok: false, detail: "⏳ Configura BANK_ACCOUNT_INFO en .env con los datos de la cuenta" }
  return { ok: true, detail: "Datos bancarios configurados en variables de entorno" }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const [supabase, anthropic, openai, deepseek, gemini, mercadopago] = await Promise.all([
    checkSupabase(),
    checkAnthropic(),
    checkOpenAI(),
    checkDeepSeek(),
    checkGemini(),
    checkMercadoPago(),
  ])

  const flow = checkFlow()
  const transbank = checkTransbank()
  const transferencia = checkTransferencia()

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    services: {
      supabase,
      anthropic,
      openai,
      deepseek,
      gemini,
      mercadopago,
      flow,
      transbank,
      transferencia,
    },
  })
}

