import { getSupabaseAdminClient } from "@/lib/supabase"

export interface ProviderQuotaInfo {
  provider: "anthropic" | "openai" | "deepseek" | "huawei" | "gemini"
  displayName: string
  modelDefault: string
  configuredCredit: number // Monto inicial abonado / presupuestado (e.g. 5.00 USD)
  spentUsd: number         // Gasto acumulado en USD por tokens
  remainingCredit: number  // Saldo restante estimado ($ USD)
  percentageRemaining: number // % disponible
  isLiveBalance: boolean   // Indica si el saldo es consultado en tiempo real desde la API oficial
  liveBalanceInfo?: {
    totalBalance?: number
    toppedUpBalance?: number
    grantedBalance?: number
    currency?: string
  }
  tariffInfo: {
    inputPer1M: number
    outputPer1M: number
  }
  status: "active" | "low_credit" | "depleted" | "unconfigured"
}

// Tarifa estimada por millón de tokens (USD)
export const TARIFFS = {
  anthropic: { inputPer1M: 1.00, outputPer1M: 5.00 }, // Claude Haiku 4.5
  openai: { inputPer1M: 0.15, outputPer1M: 0.60 },    // GPT-4o-mini
  deepseek: { inputPer1M: 0.14, outputPer1M: 0.28 },  // DeepSeek-V3
  huawei: { inputPer1M: 0.14, outputPer1M: 0.28 },    // Huawei MAAS DeepSeek-V3
  gemini: { inputPer1M: 0.075, outputPer1M: 0.30 },   // Gemini 2.0 Flash
}

/**
 * Consulta el saldo en tiempo real desde la API oficial de DeepSeek
 */
async function fetchDeepSeekLiveBalance(apiKey: string) {
  try {
    const res = await fetch("https://api.deepseek.com/user/balance", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      next: { revalidate: 30 }
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.is_available && Array.isArray(data.balance_infos)) {
      const info = data.balance_infos[0] || {}
      return {
        totalBalance: parseFloat(info.total_balance || "0"),
        toppedUpBalance: parseFloat(info.topped_up_balance || "0"),
        grantedBalance: parseFloat(info.granted_balance || "0"),
        currency: info.currency || "USD"
      }
    }
  } catch (err) {
    console.warn("⚠️ Error al consultar saldo oficial de DeepSeek:", err)
  }
  return null
}

/**
 * Obtiene las cuotas, gasto acumulado y créditos restantes de todos los proveedores de IA.
 */
export async function getAIQuotas(): Promise<Record<string, ProviderQuotaInfo>> {
  const supabase = getSupabaseAdminClient() as any
  let settingsMap: Record<string, string> = {}

  try {
    const { data: settings } = await supabase
      .from("vibecode_settings")
      .select("key, value")

    if (settings) {
      settings.forEach((item: { key: string; value: string }) => {
        settingsMap[item.key] = item.value
      })
    }
  } catch (e) {
    console.warn("⚠️ No se pudieron cargar configuraciones de IA de vibecode_settings:", e)
  }

  // Claves iniciales depositadas (por defecto $5.00 USD para Anthropic, OpenAI, DeepSeek, Huawei)
  const initialAnthropic = parseFloat(settingsMap["ai_credit_anthropic"] || "5.00")
  const initialOpenAI = parseFloat(settingsMap["ai_credit_openai"] || "5.00")
  const initialDeepSeek = parseFloat(settingsMap["ai_credit_deepseek"] || "5.00")
  const initialHuawei = parseFloat(settingsMap["ai_credit_huawei"] || "5.00")
  const initialGemini = parseFloat(settingsMap["ai_credit_gemini"] || "0.00")

  // Gasto acumulado registrado en BD
  const spentAnthropic = parseFloat(settingsMap["ai_spent_anthropic"] || "0.0000")
  const spentOpenAI = parseFloat(settingsMap["ai_spent_openai"] || "0.0000")
  const spentDeepSeek = parseFloat(settingsMap["ai_spent_deepseek"] || "0.0000")
  const spentHuawei = parseFloat(settingsMap["ai_spent_huawei"] || "0.0000")
  const spentGemini = parseFloat(settingsMap["ai_spent_gemini"] || "0.0000")

  // Comprobar disponibilidad de API Keys en entorno
  const hasAnthropic = !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY)
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY
  const hasHuawei = !!process.env.HUAWEI_API_KEY
  const hasGemini = !!process.env.GEMINI_API_KEY

  // Consulta saldo en vivo de DeepSeek si la key existe
  let deepseekLive: any = null
  if (hasDeepSeek) {
    deepseekLive = await fetchDeepSeekLiveBalance(process.env.DEEPSEEK_API_KEY!)
  }

  // Cálculo Anthropic
  const remAnthropic = Math.max(0, initialAnthropic - spentAnthropic)
  const pctAnthropic = initialAnthropic > 0 ? Math.round((remAnthropic / initialAnthropic) * 100) : 0

  // Cálculo OpenAI
  const remOpenAI = Math.max(0, initialOpenAI - spentOpenAI)
  const pctOpenAI = initialOpenAI > 0 ? Math.round((remOpenAI / initialOpenAI) * 100) : 0

  // Cálculo DeepSeek (si hay saldo en vivo, usa el oficial de la API)
  const remDeepSeek = deepseekLive ? deepseekLive.totalBalance : Math.max(0, initialDeepSeek - spentDeepSeek)
  const pctDeepSeek = deepseekLive 
    ? (deepseekLive.totalBalance > 0 ? Math.min(100, Math.round((deepseekLive.totalBalance / Math.max(initialDeepSeek, deepseekLive.totalBalance)) * 100)) : 0)
    : (initialDeepSeek > 0 ? Math.round((remDeepSeek / initialDeepSeek) * 100) : 0)

  // Cálculo Huawei
  const remHuawei = Math.max(0, initialHuawei - spentHuawei)
  const pctHuawei = initialHuawei > 0 ? Math.round((remHuawei / initialHuawei) * 100) : 0

  // Cálculo Gemini (Free Tier / Paid)
  const remGemini = Math.max(0, initialGemini - spentGemini)
  const pctGemini = initialGemini > 0 ? Math.round((remGemini / initialGemini) * 100) : 100

  const getStatus = (hasKey: boolean, rem: number): "active" | "low_credit" | "depleted" | "unconfigured" => {
    if (!hasKey) return "unconfigured"
    if (rem <= 0.05) return "depleted"
    if (rem <= 1.00) return "low_credit"
    return "active"
  }

  return {
    anthropic: {
      provider: "anthropic",
      displayName: "Anthropic Claude",
      modelDefault: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
      configuredCredit: parseFloat(initialAnthropic.toFixed(2)),
      spentUsd: parseFloat(spentAnthropic.toFixed(5)),
      remainingCredit: parseFloat(remAnthropic.toFixed(4)),
      percentageRemaining: pctAnthropic,
      isLiveBalance: false,
      tariffInfo: TARIFFS.anthropic,
      status: getStatus(hasAnthropic, remAnthropic)
    },
    deepseek: {
      provider: "deepseek",
      displayName: "DeepSeek Direct API",
      modelDefault: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      configuredCredit: parseFloat(initialDeepSeek.toFixed(2)),
      spentUsd: parseFloat(spentDeepSeek.toFixed(5)),
      remainingCredit: parseFloat(remDeepSeek.toFixed(4)),
      percentageRemaining: pctDeepSeek,
      isLiveBalance: !!deepseekLive,
      liveBalanceInfo: deepseekLive || undefined,
      tariffInfo: TARIFFS.deepseek,
      status: getStatus(hasDeepSeek, remDeepSeek)
    },
    openai: {
      provider: "openai",
      displayName: "OpenAI API",
      modelDefault: process.env.OPENAI_MODEL || "gpt-4o-mini",
      configuredCredit: parseFloat(initialOpenAI.toFixed(2)),
      spentUsd: parseFloat(spentOpenAI.toFixed(5)),
      remainingCredit: parseFloat(remOpenAI.toFixed(4)),
      percentageRemaining: pctOpenAI,
      isLiveBalance: false,
      tariffInfo: TARIFFS.openai,
      status: getStatus(hasOpenAI, remOpenAI)
    },
    huawei: {
      provider: "huawei",
      displayName: "Huawei Cloud MaaS",
      modelDefault: process.env.HUAWEI_MODEL || "DeepSeek-V3",
      configuredCredit: parseFloat(initialHuawei.toFixed(2)),
      spentUsd: parseFloat(spentHuawei.toFixed(5)),
      remainingCredit: parseFloat(remHuawei.toFixed(4)),
      percentageRemaining: pctHuawei,
      isLiveBalance: false,
      tariffInfo: TARIFFS.huawei,
      status: getStatus(hasHuawei, remHuawei)
    },
    gemini: {
      provider: "gemini",
      displayName: "Google Gemini",
      modelDefault: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      configuredCredit: parseFloat(initialGemini.toFixed(2)),
      spentUsd: parseFloat(spentGemini.toFixed(5)),
      remainingCredit: parseFloat(remGemini.toFixed(4)),
      percentageRemaining: pctGemini,
      isLiveBalance: false,
      tariffInfo: TARIFFS.gemini,
      status: hasGemini ? "active" : "unconfigured"
    }
  }
}

/**
 * Incrementa el gasto consumido de un proveedor de IA.
 */
export async function recordAIUsage(
  provider: "anthropic" | "openai" | "deepseek" | "huawei" | "gemini",
  costUsd: number
) {
  if (!costUsd || costUsd <= 0) return
  try {
    const supabase = getSupabaseAdminClient() as any
    const keyName = `ai_spent_${provider}`

    // Obtener valor actual
    const { data } = await supabase
      .from("vibecode_settings")
      .select("value")
      .eq("key", keyName)
      .single()

    const currentSpent = parseFloat(data?.value || "0")
    const newSpent = currentSpent + costUsd

    await supabase
      .from("vibecode_settings")
      .upsert({
        key: keyName,
        value: newSpent.toFixed(6),
        description: `Gasto total acumulado en USD para ${provider}`
      }, { onConflict: "key" })
  } catch (err) {
    console.warn(`⚠️ Error registrando consumo de IA para ${provider}:`, err)
  }
}

/**
 * Permite actualizar el crédito abonado/depositado de cualquier proveedor.
 */
export async function updateAICredit(
  provider: "anthropic" | "openai" | "deepseek" | "huawei" | "gemini",
  amountUsd: number
) {
  try {
    const supabase = getSupabaseAdminClient() as any
    const keyName = `ai_credit_${provider}`

    await supabase
      .from("vibecode_settings")
      .upsert({
        key: keyName,
        value: amountUsd.toFixed(2),
        description: `Crédito abonado/depositado en USD para ${provider}`
      }, { onConflict: "key" })

    return true
  } catch (err) {
    console.error(`❌ Error al actualizar saldo de ${provider}:`, err)
    return false
  }
}
