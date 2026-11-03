import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2-client"

export async function POST(request: NextRequest) {
  // Validar que las variables de entorno estén configuradas
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.error("[upload-video] Faltan variables de entorno de R2")
    return NextResponse.json(
      { error: "Configuración de R2 incompleta en el servidor. Verifica las variables de entorno." },
      { status: 500 }
    )
  }

  if (!process.env.R2_PUBLIC_URL) {
    console.error("[upload-video] Falta R2_PUBLIC_URL")
    return NextResponse.json(
      { error: "Falta R2_PUBLIC_URL en las variables de entorno." },
      { status: 500 }
    )
  }

  try {
    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename y contentType son requeridos" },
        { status: 400 }
      )
    }

    if (!contentType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de video" },
        { status: 400 }
      )
    }

    // Sanitize filename: lowercase, spaces -> underscores
    const safeFilename = filename
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9._-]/g, "")

    const key = `vibecodelab_${safeFilename}`

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    // URL firmada válida por 1 hora
    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    })

    const publicUrl = `${R2_PUBLIC_URL}/${key}`

    console.log(`[upload-video] Presigned URL generada para key: ${key}`)

    return NextResponse.json({ presignedUrl, publicUrl, key })
  } catch (error: any) {
    console.error("[upload-video] Error generando presigned URL:", error?.message ?? error)
    return NextResponse.json(
      { error: `Error generando URL de subida: ${error?.message ?? "error desconocido"}` },
      { status: 500 }
    )
  }
}
