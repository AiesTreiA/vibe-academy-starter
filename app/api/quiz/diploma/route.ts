import { type NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import QRCode from "qrcode"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { generateDiplomaHtml } from "@/lib/diploma-generator"

const execFileAsync = promisify(execFile)

function renderInvalidCertificateResponse(reason: string) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado No Válido | Vibecode Lab</title>
  <style>
    body {
      background-color: #040814;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 24px;
    }
    .card {
      max-width: 480px;
      padding: 36px 28px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(239, 68, 68, 0.35);
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.15);
    }
    .icon {
      font-size: 42px;
      margin-bottom: 14px;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      color: #f87171;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 22px;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      transition: all 0.2s;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛡️</div>
    <h1>Certificado No Encontrado o No Válido</h1>
    <p>${reason}</p>
    <p style="font-size: 12px; color: #64748b;">
      Los certificados oficiales de Vibecode Lab están verificados contra los registros oficiales de evaluación y MVP en producción. No es posible generar credenciales sin una entrega aprobada.
    </p>
    <a href="/vibecodelab" class="btn">Volver a Vibecode Lab</a>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")?.trim()
    const isDownload = searchParams.get("download") === "true"
    const format = searchParams.get("format") || "auto"

    if (!id) {
      return renderInvalidCertificateResponse("No se proporcionó un ID de certificado en la solicitud.")
    }

    // 1. Authoritative verification: look up the student name from the database.
    // Client-provided ?name= parameter is IGNORED to prevent tampering.
    const isSqr = id.toUpperCase().startsWith("SQR-")
    let studentName = ""
    let courseName = isSqr
      ? "Código & Capital: La Biblia de los Squads Ágiles · VibeCode Lab"
      : "Vibecode Lab: De Cero a SaaS con IA"
    let completionDate = "Octubre 2026"

    try {
      const supabase = getSupabaseAdminClient() as any

      // 1. Check official `certificates` table
      const { data: certRecord } = await supabase
        .from("certificates")
        .select("student_name, course_name, cohort, status")
        .eq("id", id)
        .maybeSingle()

      if (certRecord && certRecord.student_name) {
        studentName = certRecord.student_name.trim()
        if (certRecord.course_name) courseName = certRecord.course_name.trim()
        if (certRecord.cohort) completionDate = certRecord.cohort.trim()
      } else {
        // 2. Check `ebook_leads_diagnostics`
        const { data: diagRecord } = await supabase
          .from("ebook_leads_diagnostics")
          .select("name, source, source_vol")
          .eq("certificate_id", id)
          .maybeSingle()

        if (diagRecord && diagRecord.name) {
          studentName = diagRecord.name.trim()
        } else {
          // 3. Check `contact_submissions` quiz completions (student or ebook reader)
          const { data: submission } = await supabase
            .from("contact_submissions")
            .select("name, message")
            .ilike("message", `%ID Certificado: ${id}%`)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          if (submission && submission.name) {
            studentName = submission.name.trim()
          }
        }
      }
    } catch (dbErr) {
      console.error("Error al validar certificado en base de datos:", dbErr)
    }

    // 2. Reject if no valid participant record exists for this certificate ID
    if (!studentName) {
      return renderInvalidCertificateResponse(
        `El código de certificado "${id}" no existe en los registros oficiales de Vibecode Lab.`
      )
    }

    // Safe sanitized filename based strictly on the authoritative database name
    const sanitizedName = studentName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")

    const outputDir = path.join(process.cwd(), "public", "docs", "diplomas")
    const pdfPath = path.join(outputDir, `diploma_${sanitizedName}_${id}.pdf`)
    const htmlPath = path.join(outputDir, `diploma_${sanitizedName}_${id}.html`)

    // If PDF exists on disk (e.g. pre-generated or local environment) and format is not explicitly html:
    if (format !== "html" && fs.existsSync(pdfPath)) {
      try {
        const pdfBuffer = fs.readFileSync(pdfPath)
        const disposition = isDownload
          ? `attachment; filename="Diploma_Vibecode_${sanitizedName}.pdf"`
          : `inline; filename="Diploma_Vibecode_${sanitizedName}.pdf"`

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": disposition,
            "Content-Length": pdfBuffer.length.toString(),
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        })
      } catch (readErr) {
        console.warn("Could not read existing PDF, falling back to HTML viewer:", readErr)
      }
    }

    // Try generating PDF with python only if in local environment where python3 exists
    if (format === "pdf" && !fs.existsSync(pdfPath)) {
      try {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }
        const scriptPath = path.join(process.cwd(), "scripts", "generate_diploma.py")
        await execFileAsync("python3", [
          scriptPath,
          "--name",
          studentName,
          "--id",
          id,
          "--output-pdf",
          pdfPath,
          "--output-html",
          htmlPath,
        ])
        if (fs.existsSync(pdfPath)) {
          const pdfBuffer = fs.readFileSync(pdfPath)
          const disposition = isDownload
            ? `attachment; filename="Diploma_Vibecode_${sanitizedName}.pdf"`
            : `inline; filename="Diploma_Vibecode_${sanitizedName}.pdf"`

          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": disposition,
              "Content-Length": pdfBuffer.length.toString(),
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          })
        }
      } catch (pyErr) {
        // Expected in serverless environments (Vercel)
      }
    }

    // Generate QR Code DataURL pointing to public /verify/[id]
    let qrCodeDataUrl: string | null = null
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.javiermujica.com"
      qrCodeDataUrl = await QRCode.toDataURL(`${siteUrl}/verify/${encodeURIComponent(id)}`, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
        color: {
          dark: "#F8FAFC",
          light: "#040814",
        },
      })
    } catch {
      qrCodeDataUrl = null
    }

    // High-fidelity fallback & native viewer: pure TypeScript HTML with print-to-PDF toolbar
    const htmlContent = generateDiplomaHtml({
      studentName: studentName,
      certificateId: id,
      courseName: courseName,
      completionDate: completionDate,
      qrCodeDataUrl,
      showToolbar: true,
      autoPrint: isDownload && format !== "html",
    })

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error: any) {
    console.error("Error sirviendo diploma:", error)
    return renderInvalidCertificateResponse("Ocurrió un error al procesar la solicitud del certificado.")
  }
}
