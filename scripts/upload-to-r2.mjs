import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3"
import fs from "fs"

import path from "path"

// Configuración
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "66e4bee7f741a4af1febf36efedebc23"
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "vibecode-media"
const PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-57a421ac28b74a958833b59b68238216.r2.dev"

const inputPath = process.argv[2] || "/home/astro/Vídeos/Videos_javi/Vibecode Lab/vibecode3_a.mp4"
const FILE_PATH = path.resolve(inputPath)
const OBJECT_KEY = process.argv[3] || path.basename(FILE_PATH)
const PART_SIZE = 10 * 1024 * 1024 // 10 MiB por parte

async function main() {
  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.error("\n❌ Error: Se necesitan tus credenciales S3 de R2.")
    console.error("\nUso:")
    console.error("  node scripts/upload-to-r2.mjs <ACCESS_KEY_ID> <SECRET_ACCESS_KEY>\n")
    console.error("O exportando variables de entorno:")
    console.error("  R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=yyy node scripts/upload-to-r2.mjs\n")
    process.exit(1)
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ No se encontró el archivo: ${FILE_PATH}`)
    process.exit(1)
  }

  const stat = fs.statSync(FILE_PATH)
  const fileSize = stat.size
  const totalParts = Math.ceil(fileSize / PART_SIZE)

  console.log(`\n🚀 Iniciando subida a Cloudflare R2...`)
  console.log(`📦 Bucket:      ${BUCKET_NAME}`)
  console.log(`📄 Objeto:      ${OBJECT_KEY}`)
  console.log(`💾 Tamaño:      ${(fileSize / 1024 / 1024).toFixed(2)} MB (${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB)`)
  console.log(`🧩 Partes:      ${totalParts} partes de 10 MB`)

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  })

  // 1. Iniciar subida multipart
  const createRes = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
      ContentType: "video/mp4",
    })
  )
  const uploadId = createRes.UploadId

  console.log(`\n✅ Subida multipart iniciada (UploadId: ${uploadId})`)

  const completedParts = []
  const fd = fs.openSync(FILE_PATH, "r")
  const startTime = Date.now()

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * PART_SIZE
      const end = Math.min(start + PART_SIZE, fileSize)
      const partLength = end - start

      const buffer = Buffer.alloc(partLength)
      fs.readSync(fd, buffer, 0, partLength, start)

      const partRes = await s3.send(
        new UploadPartCommand({
          Bucket: BUCKET_NAME,
          Key: OBJECT_KEY,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: buffer,
        })
      )

      completedParts.push({
        PartNumber: partNumber,
        ETag: partRes.ETag,
      })

      const percent = ((end / fileSize) * 100).toFixed(1)
      const mbUploaded = (end / 1024 / 1024).toFixed(1)
      const totalMb = (fileSize / 1024 / 1024).toFixed(1)
      const elapsedSec = (Date.now() - startTime) / 1000
      const speed = (end / 1024 / 1024 / elapsedSec).toFixed(2)

      process.stdout.write(
        `\r⏳ Progreso: [${partNumber}/${totalParts}] ${percent}% (${mbUploaded}/${totalMb} MB) - ${speed} MB/s`
      )
    }

    fs.closeSync(fd)
    console.log("\n\n📦 Ensamblando partes en Cloudflare R2...")

    // 2. Completar subida
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: OBJECT_KEY,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: completedParts,
        },
      })
    )

    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1)
    const publicVideoUrl = `${PUBLIC_URL}/${OBJECT_KEY}`
    console.log(`\n🎉 ¡Video subido con éxito a Cloudflare R2!`)
    console.log(`⏱️ Tiempo total: ${totalSeconds}s`)
    console.log(`🔗 Clave en R2:   ${OBJECT_KEY}`)
    console.log(`🌐 URL Pública:   ${publicVideoUrl}\n`)
  } catch (err) {
    fs.closeSync(fd)
    console.error(`\n❌ Error durante la subida: ${err.message}`)
    console.log("⚠️ Cancelando subida multipart...")
    try {
      await s3.send(
        new AbortMultipartUploadCommand({
          Bucket: BUCKET_NAME,
          Key: OBJECT_KEY,
          UploadId: uploadId,
        })
      )
    } catch (_) {}
    process.exit(1)
  }
}

main()
