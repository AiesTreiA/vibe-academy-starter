import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { z } from "zod"
import { UNICORN_BIBLE_VOLUMES } from "@/lib/unicorn-bible-config"

const QrQuerySchema = z.object({
  vol: z.coerce.number().int().min(1).max(4).default(1),
  format: z.enum(["svg", "png", "json"]).default("svg"),
  size: z.coerce.number().int().min(128).max(2048).default(1024),
  mode: z.enum(["short", "direct"]).default("direct"),
  theme: z.enum(["dark", "print", "accent"]).default("dark"),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = QrQuerySchema.safeParse(searchParams)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parámetros inválidos para generar el código QR.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { vol, format, size, mode, theme } = parsed.data
    const volKey = vol as 1 | 2 | 3 | 4
    const volumeMeta = UNICORN_BIBLE_VOLUMES[volKey]

    const baseSite = "https://www.javiermujica.com"
    const targetUrl =
      mode === "short"
        ? `${baseSite}/go/${volKey}`
        : `${baseSite}/quiz?source=ebook&vol=${volKey}&utm_campaign=unicorn_bible`

    const colors =
      theme === "print"
        ? { dark: "#040814", light: "#FFFFFF" }
        : theme === "accent"
        ? { dark: volumeMeta.accentHex, light: "#040814" }
        : { dark: "#F8FAFC", light: "#040814" }

    if (format === "svg") {
      const svgString = await QRCode.toString(targetUrl, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 2,
        width: size,
        color: colors,
      })

      return new NextResponse(svgString, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      })
    }

    if (format === "png") {
      const pngBuffer = await QRCode.toBuffer(targetUrl, {
        type: "png",
        errorCorrectionLevel: "H",
        margin: 2,
        width: size,
        color: colors,
      })

      return new NextResponse(pngBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="qr-unicorn-bible-vol-${volKey}.png"`,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      })
    }

    const dataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: size,
      color: colors,
    })

    return NextResponse.json({
      success: true,
      vol: volKey,
      title: volumeMeta.title,
      accent: volumeMeta.accentName,
      target_url: targetUrl,
      short_url: `${baseSite}/go/${volKey}`,
      qr_data_url: dataUrl,
    })
  } catch (err: any) {
    console.error("Error generating QR code:", err)
    return NextResponse.json(
      { success: false, error: "Error interno al generar el código QR." },
      { status: 500 }
    )
  }
}
