import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any

  try {
    const { data: settings, error } = await supabase
      .from("vibecode_settings")
      .select("key, value, description")

    if (error) {
      console.error("Error fetching vibecode settings:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const settingsMap: Record<string, string> = {}
    if (settings) {
      settings.forEach((item: { key: string; value: string }) => {
        settingsMap[item.key] = item.value
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        test_coupon_enabled: settingsMap["test_coupon_enabled"] === "true",
        test_coupon_code: settingsMap["test_coupon_code"] || "TEST1USD",
        raw: settingsMap,
      },
    })
  } catch (err: any) {
    console.error("Vibecode settings API GET error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { test_coupon_enabled, test_coupon_code } = body

    const supabase = getSupabaseAdminClient() as any

    const updates = []

    if (typeof test_coupon_enabled === "boolean") {
      updates.push({
        key: "test_coupon_enabled",
        value: test_coupon_enabled ? "true" : "false",
        description: "Habilita o deshabilita el cupón de prueba de $1 USD en producción",
      })
    }

    if (typeof test_coupon_code === "string" && test_coupon_code.trim()) {
      updates.push({
        key: "test_coupon_code",
        value: test_coupon_code.trim().toUpperCase(),
        description: "Código del cupón de prueba de $1 USD",
      })
    }

    if (updates.length > 0) {
      const { error } = await supabase
        .from("vibecode_settings")
        .upsert(updates, { onConflict: "key" })

      if (error) {
        console.error("Error updating vibecode settings:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Configuración actualizada correctamente",
      data: {
        test_coupon_enabled: Boolean(test_coupon_enabled),
        test_coupon_code: (test_coupon_code || "TEST1USD").toUpperCase(),
      },
    })
  } catch (err: any) {
    console.error("Vibecode settings API POST error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
