import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { verifyEmailMx } from "@/lib/email-validator"
import { VIBECODE_CONFIG } from "@/lib/vibecode-config"

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
    const name = (body.name || "").trim()
    const email = (body.email || "").trim().toLowerCase()
    const phone = (body.phone || "").trim()
    let couponCode = (body.coupon_code || "").trim().toUpperCase()
    const paymentMethod = (body.payment_method || "mercadopago").trim().toLowerCase()

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y correo electrónico son requeridos" },
        { status: 400 }
      )
    }

    // Validar si el correo es real (sintaxis + desechables + MX)
    const emailValidation = await verifyEmailMx(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.reason || "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Capacity Check
    const { count: seatsTaken, error: countError } = await supabase
      .from("vibecode_registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")

    if (countError) {
      console.error("Error checking capacity:", countError)
    }

    // Get max capacity
    const { data: maxSeatsRow } = await supabase
      .from("vibecode_settings")
      .select("value")
      .eq("key", "max_seats")
      .single()

    const maxCapacity = maxSeatsRow ? parseInt(maxSeatsRow.value, 10) : (VIBECODE_CONFIG.maxSeats || 11)

    if ((seatsTaken || 0) >= maxCapacity) {
      return NextResponse.json(
        { error: `El bootcamp ha alcanzado su capacidad máxima de ${maxCapacity} alumnos.` },
        { status: 409 }
      )
    }

    // 2. Base pricing
    const now = new Date()
    const { price: phasePrice } = calculatePricing(now)
    let finalPrice = phasePrice

    // 3. Coupon validation
    if (couponCode) {
      // Check test coupon setting from DB
      const { data: testSettings } = await supabase
        .from("vibecode_settings")
        .select("key, value")
        .in("key", ["test_coupon_enabled", "test_coupon_code"])

      const settingsMap: Record<string, string> = {}
      if (testSettings) {
        testSettings.forEach((r: any) => { settingsMap[r.key] = r.value })
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

        finalPrice = 1

        // Upsert the test coupon to satisfy foreign key constraint if needed
        await supabase
          .from("vibecode_coupons")
          .upsert({
            code: couponCode,
            discount_pct: Math.round(((phasePrice - 1) / phasePrice) * 100),
            valid_until: new Date("2028-12-31T23:59:59Z").toISOString(),
            max_uses: 99999,
            current_uses: 0,
          }, { onConflict: "code" })
      } else {
        let discountPct = 0
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
          const { count, error: countError } = await supabase
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
            { error: "Cupón no válido." },
            { status: 400 }
          )
        }

        discountPct = parsedDiscount

        // Avoid resetting current_uses if the coupon already exists in the database
        const { data: existingCoupon } = await supabase
          .from("vibecode_coupons")
          .select("code")
          .eq("code", couponCode)
          .maybeSingle()

        if (!existingCoupon) {
          // Upsert the coupon to satisfy the foreign key constraint
          const { error: upsertError } = await supabase
            .from("vibecode_coupons")
            .upsert({
              code: couponCode,
              discount_pct: discountPct,
              valid_until: new Date("2028-12-31T23:59:59Z").toISOString(),
              max_uses: 99999,
              current_uses: 0,
            }, { onConflict: "code" })

          if (upsertError) {
            console.error("Error upserting dynamic coupon:", upsertError)
          }
        }
      } else {
        const { data: coupon, error: couponError } = await supabase
          .from("vibecode_coupons")
          .select("discount_pct, valid_until, max_uses, current_uses")
          .eq("code", couponCode)
          .single()

        if (couponError || !coupon) {
          return NextResponse.json(
            { error: "Cupón de descuento inválido o inexistente" },
            { status: 400 }
          )
        }

        const validUntil = new Date(coupon.valid_until)
        if (now > validUntil) {
          return NextResponse.json(
            { error: "El cupón de descuento ha expirado" },
            { status: 400 }
          )
        }

        if (coupon.current_uses >= coupon.max_uses) {
          return NextResponse.json(
            { error: "El cupón ha agotado su cantidad de usos" },
            { status: 400 }
          )
        }

        discountPct = Number(coupon.discount_pct)
      }

      // Apply discount for standard coupons
      const discountAmount = Math.floor(phasePrice * (discountPct / 100))
      finalPrice = phasePrice - discountAmount
      }
    } else {
      couponCode = null
    }

    // 4. Create pending registration
    // Upsert on email conflict so the user can re-register/retry payment
    const { data: registration, error: regError } = await supabase
      .from("vibecode_registrations")
      .upsert(
        {
          name,
          email,
          phone,
          status: "pending",
          coupon_code: couponCode || null,
          amount_paid: finalPrice,
          payment_method: paymentMethod,
        },
        { onConflict: "email" }
      )
      .select("id")
      .single()

    if (regError || !registration) {
      console.error("Error creating registration:", regError)
      return NextResponse.json(
        { error: "Ocurrió un error al crear la inscripción. Por favor intenta de nuevo." },
        { status: 500 }
      )
    }

    const regID = registration.id
    let prefID = `pref_vibecode_${regID}_${Date.now()}`
    let checkoutURL = `/vibecode/payment-simulator?pref_id=${prefID}&reg_id=${regID}&amount=${finalPrice}`

    // Real Mercado Pago preference creation
    const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    console.log("🔍 VIBECODE DEBUG: mpToken status =", mpToken ? "LOADED (starts with " + mpToken.substring(0, 15) + ")" : "NOT LOADED / UNDEFINED")
    if (mpToken && paymentMethod === "mercadopago") {
      try {
        // Determine dynamic request host origin for redirect urls
        const protocol = req.headers.get("x-forwarded-proto") || "http"
        const host = req.headers.get("host") || "localhost:3000"
        const origin = `${protocol}://${host}`
        const isLocal = host.includes("localhost") || host.includes("127.0.0.1")
        const isProd = mpToken.startsWith("APP_USR-")

        // In production mode, we MUST use secure HTTPS back_urls, otherwise Mercado Pago disables payment methods.
        const redirectOrigin = isProd ? "https://www.javiermujica.com" : origin

        const clpPrice = Math.round(finalPrice * 950)

        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${mpToken}`,
            "X-Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            items: [
              {
                id: "vibecode-bootcamp",
                title: "Vibecode Lab Bootcamp",
                description: "Inscripción en vivo Bootcamp Vibecode Lab - 3 meses de formación intensiva",
                picture_url: "https://www.javiermujica.com/icon.svg",
                category_id: "learnings",
                quantity: 1,
                unit_price: clpPrice,
                currency_id: "CLP",
              },
            ],
            external_reference: regID,
            payer: {
              name: name || "Estudiante",
              surname: "Vibecode",
              email: email,
            },
            back_urls: {
              success: `${redirectOrigin}/vibecode?status=success&reg_id=${regID}`,
              failure: `${redirectOrigin}/vibecode?status=failed&reg_id=${regID}`,
              pending: `${redirectOrigin}/vibecode?status=pending&reg_id=${regID}`,
            },
            notification_url: `${redirectOrigin}/api/vibecode/mercadopago-webhook?source_news=webhooks`,
            statement_descriptor: "VIBECODELAB",
            // Auto return requires public https domains; omit for localhost sandbox testing
            ...((isLocal && !isProd) ? {} : { auto_return: "approved" })
          }),
        })

        if (mpRes.ok) {
          const mpData = await mpRes.json()
          if (mpData.id && (mpData.sandbox_init_point || mpData.init_point)) {
            prefID = mpData.id
            const isProd = mpToken.startsWith("APP_USR-")
            checkoutURL = isProd ? (mpData.init_point || mpData.sandbox_init_point) : (mpData.sandbox_init_point || mpData.init_point)
            console.log(`✅ Mercado Pago preference created: ${prefID} (Mode: ${isProd ? "Production" : "Sandbox"})`)
          }
        } else {
          const errText = await mpRes.text().catch(() => "")
          console.error("❌ Mercado Pago API error response:", mpRes.status, errText)
        }
      } catch (mpErr) {
        console.error("❌ Exception during Mercado Pago preference creation:", mpErr)
      }
    }

    // Update preference ID in db
    await supabase
      .from("vibecode_registrations")
      .update({ mp_preference_id: prefID })
      .eq("id", regID)

    return NextResponse.json({
      registration_id: regID,
      checkout_url: checkoutURL,
      amount_to_pay: finalPrice,
      status: "pending",
    })
  } catch (err: any) {
    console.error("Failed in enroll POST handler:", err)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor. Por favor intenta de nuevo." },
      { status: 500 }
    )
  }
}
