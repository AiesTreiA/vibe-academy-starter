import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get("file")
    const viewMode = searchParams.get("view") === "true"

    if (!filePath) {
      return NextResponse.json({ error: "Parámetro 'file' requerido" }, { status: 400 })
    }

    // Sanitize path to prevent directory traversal
    const cleanPath = filePath.replace(/^\/+/, "").replace(/\.\.\//g, "")
    const absolutePath = path.join(process.cwd(), "public", cleanPath)

    const publicDir = path.join(process.cwd(), "public")
    if (!absolutePath.startsWith(publicDir) || !fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(absolutePath)
    const fileName = path.basename(absolutePath)
    const ext = path.extname(absolutePath).toLowerCase()

    let contentType = "application/octet-stream"
    if (ext === ".pdf") contentType = "application/pdf"
    else if (ext === ".js") contentType = "application/javascript; charset=utf-8"
    else if (ext === ".ts" || ext === ".tsx") contentType = "text/plain; charset=utf-8"
    else if (ext === ".txt") contentType = "text/plain; charset=utf-8"
    else if (ext === ".sql") contentType = "text/plain; charset=utf-8"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".md") contentType = "text/plain; charset=utf-8"
    else if (ext === ".html") contentType = "text/html; charset=utf-8"

    // view mode: serve inline (no attachment header) so fetch() can read the content
    if (viewMode) {
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Content-Type-Options": "nosniff"
        }
      })
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    })
  } catch (err: any) {
    console.error("❌ Exception in download API route:", err)
    return NextResponse.json({ error: "Error procesando la descarga" }, { status: 500 })
  }
}
