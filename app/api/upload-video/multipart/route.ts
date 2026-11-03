import { NextRequest, NextResponse } from "next/server"
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2-client"

const PART_SIZE = 10 * 1024 * 1024 // 10 MiB por chunk

function checkEnv() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return "Configuración de R2 incompleta en el servidor. Faltan variables de entorno."
  }
  if (!process.env.R2_PUBLIC_URL) {
    return "Falta R2_PUBLIC_URL en las variables de entorno."
  }
  return null
}

export async function POST(request: NextRequest) {
  const envError = checkEnv()
  if (envError) {
    return NextResponse.json({ error: envError }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: "Campo 'action' requerido" }, { status: 400 })
    }

    // 1. INICIAR SUBIDA MULTIPART
    if (action === "init") {
      const { filename, contentType, fileSize } = body

      if (!filename || !contentType) {
        return NextResponse.json(
          { error: "filename y contentType son requeridos para iniciar la subida" },
          { status: 400 }
        )
      }

      if (!contentType.startsWith("video/")) {
        return NextResponse.json(
          { error: "Solo se permiten archivos de video (mp4, mov, webm, etc.)" },
          { status: 400 }
        )
      }

      // Sanitizar el nombre del archivo
      const safeFilename = filename
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9._-]/g, "")

      const key = safeFilename.startsWith("vibecodelab_")
        ? safeFilename
        : `vibecodelab_${safeFilename}`

      const totalParts = fileSize ? Math.ceil(fileSize / PART_SIZE) : 1

      const createCommand = new CreateMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
      })

      const createRes = await r2Client.send(createCommand)
      const uploadId = createRes.UploadId

      if (!uploadId) {
        throw new Error("No se pudo obtener el UploadId de Cloudflare R2")
      }

      const publicUrl = `${R2_PUBLIC_URL}/${key}`

      return NextResponse.json({
        uploadId,
        key,
        publicUrl,
        partSize: PART_SIZE,
        totalParts,
      })
    }

    // 2. OBTENER URLS FIRMADAS PARA PARTES
    if (action === "get-part-urls") {
      const { key, uploadId, partNumbers } = body

      if (!key || !uploadId || !Array.isArray(partNumbers) || partNumbers.length === 0) {
        return NextResponse.json(
          { error: "key, uploadId y partNumbers (array) son requeridos" },
          { status: 400 }
        )
      }

      const urls: Record<number, string> = {}

      for (const partNumber of partNumbers) {
        const command = new UploadPartCommand({
          Bucket: R2_BUCKET,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
        })

        const presignedUrl = await getSignedUrl(r2Client, command, {
          expiresIn: 3600, // 1 hora de validez
        })

        urls[partNumber] = presignedUrl
      }

      return NextResponse.json({ urls })
    }

    // 3. COMPLETAR SUBIDA MULTIPART
    if (action === "complete") {
      const { key, uploadId, parts } = body

      if (!key || !uploadId) {
        return NextResponse.json(
          { error: "key y uploadId son requeridos para completar la subida" },
          { status: 400 }
        )
      }

      let partsToComplete: { PartNumber: number; ETag: string }[] = []

      // Si el navegador no pudo leer los ETags por políticas CORS de ExposeHeaders,
      // consultamos la lista de partes directamente a Cloudflare R2 con ListPartsCommand
      if (!parts || !Array.isArray(parts) || parts.length === 0 || parts.some((p) => !p.ETag)) {
        console.log(`[multipart-upload] Recuperando lista de partes directamente de R2 para: ${key}`)
        const listRes = await r2Client.send(
          new ListPartsCommand({
            Bucket: R2_BUCKET,
            Key: key,
            UploadId: uploadId,
          })
        )

        partsToComplete = (listRes.Parts || []).map((p) => ({
          PartNumber: p.PartNumber!,
          ETag: p.ETag!,
        }))
      } else {
        partsToComplete = parts
      }

      if (partsToComplete.length === 0) {
        throw new Error("No se encontraron partes subidas en Cloudflare R2")
      }

      // Ordenar las partes por PartNumber ascendentemente (requerido por S3/R2)
      const sortedParts = [...partsToComplete].sort((a, b) => a.PartNumber - b.PartNumber)

      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: sortedParts.map((p) => ({
            PartNumber: p.PartNumber,
            ETag: p.ETag,
          })),
        },
      })

      await r2Client.send(completeCommand)

      const publicUrl = `${R2_PUBLIC_URL}/${key}`

      console.log(`[multipart-upload] Video completado con éxito: ${key}`)

      return NextResponse.json({
        success: true,
        key,
        publicUrl,
      })
    }

    // 4. ABORTAR SUBIDA MULTIPART (Limpieza)
    if (action === "abort") {
      const { key, uploadId } = body

      if (key && uploadId) {
        try {
          const abortCommand = new AbortMultipartUploadCommand({
            Bucket: R2_BUCKET,
            Key: key,
            UploadId: uploadId,
          })
          await r2Client.send(abortCommand)
          console.log(`[multipart-upload] Subida cancelada y limpiada: ${key}`)
        } catch (err: any) {
          console.warn(`[multipart-upload] Error abortando subida: ${err.message}`)
        }
      }

      return NextResponse.json({ success: true, message: "Subida abortada exitosamente" })
    }

    return NextResponse.json({ error: `Acción '${action}' no reconocida` }, { status: 400 })
  } catch (error: any) {
    console.error("[multipart-upload] Error general:", error?.message ?? error)
    return NextResponse.json(
      { error: `Error en subida multipart: ${error?.message ?? "Error desconocido"}` },
      { status: 500 }
    )
  }
}
