import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 45

// Simple in-memory rate limiter per IP (max 6 image gens per 10 mins per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxRequests = 6

  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count += 1
  return { allowed: true, remaining: maxRequests - record.count }
}

export async function POST(req: Request) {
  const start = Date.now()

  try {
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "anonymous"
    const rateCheck = checkRateLimit(ip)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Has alcanzado el límite de 6 imágenes de prueba gratuita. En Vibecode Lab Gen 2 aprenderás a implementar tu propio pipeline sin límites."
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const userPrompt = (body.prompt || "").trim()
    const aspectRatio = body.aspectRatio || "16:9" // "16:9" | "1:1"

    if (!userPrompt) {
      return NextResponse.json({ error: "El prompt no puede estar vacío" }, { status: 400 })
    }

    // Determine dimensions
    let width = 1024
    let height = 576
    if (aspectRatio === "1:1") {
      width = 768
      height = 768
    }

    // Enhance prompt for high aesthetic output
    const enhancedPrompt = `${userPrompt}, highly detailed, photorealistic, cinematic lighting, 8k resolution, crisp focus, trending on artstation`

    // Generate unique seed
    const seed = Math.floor(Math.random() * 1000000)

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true`

    // Verify availability by performing a fast HEAD / GET probe
    const probe = await fetch(imageUrl, { method: "GET" })
    if (!probe.ok) {
      throw new Error(`Error en el servicio de generación (HTTP ${probe.status})`)
    }

    const latencyMs = Date.now() - start

    return NextResponse.json({
      ok: true,
      imageUrl,
      latencyMs,
      model: "FLUX.1 Schnell (Open Source)",
      cost: "$0.00 USD (Cero Cobro de API)",
      aspectRatio,
      remainingQueries: rateCheck.remaining
    })

  } catch (err: any) {
    const latencyMs = Date.now() - start
    console.error("Error generating image:", err)
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Error al generar la imagen con el modelo abierto",
        latencyMs
      },
      { status: 500 }
    )
  }
}
