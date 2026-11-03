import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { VIBECODE_CONFIG } from "@/lib/vibecode-config"

// Force dynamic execution since we use database checks and dates
export const dynamic = "force-dynamic"

function calculatePricing(now: Date) {
  const d1 = new Date(VIBECODE_CONFIG.d1)
  const d2 = new Date(VIBECODE_CONFIG.d2)
  const d3 = new Date(VIBECODE_CONFIG.d3)
  const basePrice = 297

  if (now < d1) {
    return { phase: 1, price: 209 }
  } else if (now < d2) {
    return { phase: 2, price: 237 }
  } else if (now < d3) {
    return { phase: 3, price: 265 }
  } else {
    return { phase: 4, price: basePrice }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const couponCode = (body.coupon_code || "").trim().toUpperCase()

    if (!couponCode) {
      return NextResponse.json(
        { error: "El código de cupón es requerido" },
        { status: 400 }
      )
    }

    const now = new Date()
    const { price: phasePrice } = calculatePricing(now)
    let discountPct = 0

    const supabase = getSupabaseAdminClient() as any

    // Check test coupon setting from DB
    const { data: settings } = await supabase
      .from("vibecode_settings")
      .select("key, value")
      .in("key", ["test_coupon_enabled", "test_coupon_code"])

    const settingsMap: Record<string, string> = {}
    if (settings) {
      settings.forEach((r: any) => { settingsMap[r.key] = r.value })
    }
    const isTestCouponEnabled = settingsMap["test_coupon_enabled"] === "true"
    const activeTestCouponCode = (settingsMap["test_coupon_code"] || "TEST1USD").toUpperCase()

    if (couponCode === activeTestCouponCode || couponCode === "TEST1USD" || couponCode === "MP1USD") {
      if (!isTestCouponEnabled) {
        return NextResponse.json(
          { error: "El cupón de prueba de $1 USD está actualmente desactivado en administración." },
          { status: 400 }
        )
      }

      const calculatedDiscountPct = Math.round(((phasePrice - 1) / phasePrice) * 100)
      return NextResponse.json({
        valid: true,
        coupon_code: couponCode,
        is_test_1usd: true,
        discount_pct: calculatedDiscountPct,
        original_price: phasePrice,
        final_price: 1,
        message: "¡Cupón de prueba de $1 USD aplicado correctamente!",
      })
    }

    const match = couponCode.match(/^[A-Z]+(\d+)$/)

    if (match) {
      const parsedDiscount = parseInt(match[1], 10)
      
      // Define date thresholds (Chile time) from VIBECODE_CONFIG
      const d1 = new Date(VIBECODE_CONFIG.d1)
      const d2 = new Date(VIBECODE_CONFIG.d2)
      const d3 = new Date(VIBECODE_CONFIG.d3)

      let maxAllowedDiscount = 20.0

      if (now < d1) {
        maxAllowedDiscount = 20.0
      } else if (now < d2) {
        maxAllowedDiscount = 15.0
      } else if (now < d3) {
        maxAllowedDiscount = 10.0
      } else {
        // Period 4: check sales count in DB
        const { count } = await supabase
          .from("vibecode_registrations")
          .select("*", { count: "exact", head: true })
          .eq("status", "paid")

        const seatsTaken = count || 0
        if (seatsTaken < 10) {
          maxAllowedDiscount = 40.0
        } else {
          maxAllowedDiscount = 5.0
        }
      }

      // Deactivate coupon if it exceeds current allowed max or absolute cap of 40%
      // Special case: CLAU55 must always work
      if (couponCode !== "CLAU55" && (parsedDiscount > maxAllowedDiscount || parsedDiscount > 40)) {
        return NextResponse.json(
          { error: "Cupón no válido para la fase actual." },
          { status: 400 }
        )
      }

      discountPct = parsedDiscount
    } else {
      // Static database coupon
      const { data: coupon, error: couponError } = await supabase
        .from("vibecode_coupons")
        .select("discount_pct, valid_until, max_uses, current_uses")
        .eq("code", couponCode)
        .maybeSingle()

      if (couponError || !coupon) {
        return NextResponse.json(
          { error: "Cupón de descuento inválido o inexistente." },
          { status: 400 }
        )
      }

      const validUntil = new Date(coupon.valid_until)
      if (now > validUntil) {
        return NextResponse.json(
          { error: "El cupón de descuento ha expirado." },
          { status: 400 }
        )
      }

      if (coupon.current_uses >= coupon.max_uses) {
        return NextResponse.json(
          { error: "El cupón ha agotado su cantidad de usos." },
          { status: 400 }
        )
      }

      discountPct = Number(coupon.discount_pct)
    }

    const discountAmount = Math.floor(phasePrice * (discountPct / 100))
    const finalPrice = phasePrice - discountAmount

    return NextResponse.json({
      valid: true,
      coupon_code: couponCode,
      discount_pct: discountPct,
      original_price: phasePrice,
      final_price: finalPrice,
    })
  } catch (err: any) {
    console.error("Failed in coupon validation handler:", err)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al validar el cupón." },
      { status: 500 }
    )
  }
}
