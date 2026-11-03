import { type NextRequest, NextResponse } from "next/server"
import { getAIQuotas, updateAICredit } from "@/lib/ai-quota-service"

export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const quotas = await getAIQuotas()
    return NextResponse.json({
      success: true,
      quotas,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("Error fetching AI quotas:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { provider, amountUsd } = body

    if (!provider || typeof amountUsd !== "number" || amountUsd < 0) {
      return NextResponse.json({ success: false, error: "Proveedor o monto inválido" }, { status: 400 })
    }

    const updated = await updateAICredit(provider, amountUsd)
    if (!updated) {
      return NextResponse.json({ success: false, error: "Error al actualizar saldo en la base de datos" }, { status: 500 })
    }

    const quotas = await getAIQuotas()

    return NextResponse.json({
      success: true,
      message: `Crédito de ${provider} actualizado a $${amountUsd.toFixed(2)} USD`,
      quotas
    })
  } catch (err: any) {
    console.error("Error updating AI credit:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
