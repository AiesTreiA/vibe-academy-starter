import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"
import {
  generateCertificateId,
  generateVerificationHash,
  evaluateQuizReadiness,
  isValidVolume,
  UNICORN_BIBLE_VOLUMES,
} from "@/lib/unicorn-bible-config"
import { execFile } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"

const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  try {
    const body = await request.json()
    const {
      name,
      email,
      squad_name,
      project_name,
      mvp_url,
      obstacles,
      obstacle_other,
      campaign_pitch,
      superpower_testimonial,
      aha_moment,
      testimonial_authorized,
      improvement_feedback,
      nps_rating,
      final_thoughts,
      source,
      vol,
      utm_campaign,
    } = body

    // Server-side validation for required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !squad_name?.trim() ||
      !project_name?.trim() ||
      !mvp_url?.trim() ||
      !Array.isArray(obstacles) ||
      obstacles.length === 0 ||
      !campaign_pitch?.trim() ||
      !superpower_testimonial?.trim() ||
      !improvement_feedback?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Por favor completa todos los campos requeridos del formulario." },
        { status: 400 }
      )
    }

    const isEbook = source === "ebook"
    const sourceVol = isValidVolume(vol) ? Number(vol) : null
    const volTitle = sourceVol ? UNICORN_BIBLE_VOLUMES[sourceVol as 1 | 2 | 3 | 4].shortTitle : null

    // Generate unique Certificate ID: SQR-2026-XXX for e-book readers, VBC-2026-XXX for students
    const certificateId = generateCertificateId(isEbook ? "ebook" : "student")
    const verificationHash = generateVerificationHash(certificateId, email, mvp_url)
    const readiness = evaluateQuizReadiness({
      mvpUrl: mvp_url,
      campaignPitch: campaign_pitch,
      obstacles,
      superpowerTestimonial: superpower_testimonial,
      sourceVol,
    })

    // Format obstacles for human-readable summary
    const formattedObstacles = obstacles
      .map((obs: string) => {
        if (obs === "otro" && obstacle_other) {
          return `Otro freno: ${obstacle_other}`
        }
        return obs
      })
      .join("\n   • ")

    const readableSummary = [
      isEbook
        ? `=== AUDITORÍA SQUAD READINESS · UNICORN BIBLE (${volTitle ? `TOMO ${sourceVol}: ${volTitle}` : "E-BOOK"}) ===`
        : `=== QUIZ FINAL DE CIERRE · GENERACIÓN 1 (VIBECODE LAB) ===`,
      `Fecha de Registro: ${new Date().toISOString()}`,
      `ID Certificado: ${certificateId}`,
      `Hash Verificación: ${verificationHash}`,
      `Puntaje Unicorn Readiness: ${readiness.totalScore}/100 (${readiness.level})`,
      isEbook ? `Origen: Lector E-Book Código & Capital${sourceVol ? ` (Tomo ${sourceVol})` : ""}` : `Origen: Alumno Cohorte Vibecode Lab`,
      ``,
      `--- PASO 1: IDENTIFICACIÓN Y ARTEFACTO ---`,
      `Participante: ${name}`,
      `Email: ${email}`,
      `Squad: ${squad_name}`,
      `Proyecto / MVP: ${project_name}`,
      `URL MVP en Producción: ${mvp_url}`,
      ``,
      `--- PASO 2: CONFRONTACIÓN Y VALIDACIÓN REAL ---`,
      `Obstáculos para encender pauta durante el programa:`,
      `   • ${formattedObstacles}`,
      ``,
      `Hipótesis de validación ($10 USD / 48 hrs - Gancho y Métrica):`,
      `   ${campaign_pitch}`,
      ``,
      `--- PASO 3: TESTIMONIO Y TRANSFORMACIÓN PERSONAL ---`,
      `Superpoder o cambio de mentalidad ganado en Vibecode Lab:`,
      `   ${superpower_testimonial}`,
      aha_moment ? `Momento 'ajá' o herramienta que más voló la cabeza:\n   ${aha_moment}` : null,
      `Autorización de Testimonio Público: ${testimonial_authorized ? "SÍ (Autorizado para web y RRSS)" : "NO (Privado / confidencial)"}`,
      ``,
      `--- PASO 4: FEEDBACK DE CIERRE Y MEJORA CONTINUA ---`,
      `Sugerencias de mejora para la próxima generación (Pregunta 5):`,
      `   ${improvement_feedback}`,
      nps_rating ? `Calificación NPS (1 al 10): ${nps_rating} / 10` : null,
      final_thoughts ? `Mensaje final para Javier y el equipo:\n   ${final_thoughts}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n")

    // 1. Guardar en contact_submissions (mantiene compatibilidad total con panel admin actual)
    const { data: submission, error: dbError } = await (supabase.from("contact_submissions") as any)
      .insert([
        {
          name,
          email,
          company: `${squad_name} · ${project_name}`.slice(0, 255),
          service_type: "Quiz Cierre Cohorte 1",
          message: readableSummary,
          status: "completed",
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error("Error guardando quiz en base de datos:", dbError)
      console.log("PAYLOAD QUIZ CIERRE RESPALDADO EN LOGS:", body)
    }

    // 2. Guardar en `ebook_leads_diagnostics` (si la tabla ya fue creada)
    try {
      await (supabase.from("ebook_leads_diagnostics") as any).insert([
        {
          certificate_id: certificateId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          squad_name: squad_name.trim(),
          project_name: project_name.trim(),
          mvp_url: mvp_url.trim(),
          source: isEbook ? "ebook" : "student",
          source_vol: sourceVol,
          utm_campaign: utm_campaign || (isEbook ? "unicorn_bible" : "cohort_1"),
          obstacles,
          obstacle_other: obstacle_other || null,
          campaign_pitch: campaign_pitch.trim(),
          superpower_testimonial: superpower_testimonial.trim(),
          aha_moment: aha_moment || null,
          testimonial_authorized: Boolean(testimonial_authorized),
          improvement_feedback: improvement_feedback.trim(),
          nps_rating: typeof nps_rating === "number" ? nps_rating : 10,
          final_thoughts: final_thoughts || null,
          readiness_score: readiness.totalScore,
          dimension_scores: readiness.dimensions,
        },
      ])
    } catch (diagErr) {
      console.warn("Aviso al insertar en ebook_leads_diagnostics:", diagErr)
    }

    // 3. Registrar en `certificates` para que `/verify/[id]` resuelva de inmediato tanto VBC- como SQR-
    try {
      const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.javiermujica.com"
      await (supabase.from("certificates") as any).upsert(
        {
          id: certificateId,
          student_name: name.trim(),
          student_email: email.trim().toLowerCase(),
          course_name: isEbook
            ? "Código & Capital: La Biblia de los Squads Ágiles · VibeCode Lab"
            : "Vibecode Lab: De Cero a SaaS con IA",
          cohort: isEbook
            ? `Squad Readiness · ${volTitle ? `Tomo ${sourceVol}: ${volTitle}` : "Edición 2026"}`
            : "Cohorte Octubre 2026 - Primera Generación",
          squad_name: squad_name.trim(),
          mvp_title: project_name.trim(),
          mvp_url: mvp_url.trim(),
          status: "approved",
          issued_at: new Date().toISOString(),
          pdf_url: `${siteOrigin}/api/quiz/diploma?id=${encodeURIComponent(certificateId)}&download=true`,
          qr_code_url: `${siteOrigin}/verify/${encodeURIComponent(certificateId)}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
    } catch (certErr) {
      console.warn("Aviso al registrar certificado en tabla certificates:", certErr)
    }

    // Pre-generate PDF diploma file on server
    const sanitizedName = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")

    const outputDir = path.join(process.cwd(), "public", "docs", "diplomas")
    let pdfBuffer: Buffer | null = null
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      const pdfPath = path.join(outputDir, `diploma_${sanitizedName}_${certificateId}.pdf`)
      const htmlPath = path.join(outputDir, `diploma_${sanitizedName}_${certificateId}.html`)
      const scriptPath = path.join(process.cwd(), "scripts", "generate_diploma.py")
      await execFileAsync("python3", [
        scriptPath,
        "--name",
        name,
        "--id",
        certificateId,
        "--output-pdf",
        pdfPath,
        "--output-html",
        htmlPath,
      ])
      if (fs.existsSync(pdfPath)) {
        pdfBuffer = fs.readFileSync(pdfPath)
      }
    } catch {
      // In serverless environments (Vercel) python3 is unavailable.
      // The diploma is served seamlessly via /api/quiz/diploma with the native viewer.
    }

    const diplomaUrl = `/api/quiz/diploma?name=${encodeURIComponent(name)}&id=${certificateId}&download=true`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://javiermujica.com"
    const fullDiplomaDownloadUrl = `${siteUrl}${diplomaUrl}`

    // 1. Enviar correo automático de felicitación y entrega de Diploma al ALUMNO
    try {
      const firstName = name.split(" ")[0]
      const studentEmailAttachments = pdfBuffer
        ? [
            {
              filename: `Diploma_Vibecode_${sanitizedName}.pdf`,
              content: pdfBuffer,
            },
          ]
        : undefined

      await sendEmail({
        to: email,
        subject: `🎓 ¡Felicitaciones por graduarte de Vibecode Lab, ${firstName}! Tu Diploma Oficial`,
        attachments: studentEmailAttachments,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 28px 24px; background-color: #040814; color: #f1f5f9; border-radius: 16px; border: 1px solid rgba(66, 133, 244, 0.3);">
            <div style="text-align: center; margin-bottom: 28px;">
              <span style="display: inline-block; padding: 6px 16px; background: rgba(155, 114, 248, 0.15); color: #c084fc; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid rgba(155, 114, 248, 0.35);">
                Vibecode Lab · Primera Generación 2026
              </span>
              <h1 style="color: #ffffff; margin-top: 14px; font-size: 26px; font-weight: 900; letter-spacing: -0.02em;">
                ¡Completaste el programa, ${firstName}!
              </h1>
              <p style="color: #94a3b8; font-size: 15px; margin-top: 6px; line-height: 1.5;">
                El código compila en local, pero la verdad compila afuera. Has cerrado la cohorte con tu artefacto en producción.
              </p>
            </div>

            <!-- Recuadro del Certificado -->
            <div style="background: radial-gradient(ellipse at 50% 0%, #0f1c3f 0%, #060b1b 70%, #040814 100%); border: 1px solid rgba(66, 133, 244, 0.35); border-radius: 14px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; margin-bottom: 16px;">
                <span style="color: #60a5fa; font-size: 12px; font-weight: 700; font-family: monospace; letter-spacing: 1px;">
                  CERTIFICACIÓN OFICIAL
                </span>
                <span style="color: #94a3b8; font-size: 11px; font-family: monospace; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px;">
                  ID: ${certificateId}
                </span>
              </div>

              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Otorgado a:</p>
                <h3 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800;">${name}</h3>
              </div>

              <div style="display: grid; gap: 8px; font-size: 13px; line-height: 1.5; color: #cbd5e1; margin-bottom: 18px;">
                <p style="margin: 0;"><strong>Programa:</strong> Vibecode Lab: De Cero a SaaS con IA</p>
                <p style="margin: 0;"><strong>Intensidad:</strong> <span style="color: #38bdf8; font-weight: 700;">35 Horas Cronológicas</span> (2,5 hrs de clases en vivo + 2,5 hrs de ejecución propia y en equipos por semana · 7 semanas)</p>
                <p style="margin: 0;"><strong>Squad:</strong> <span style="color: #c084fc;">${squad_name}</span></p>
                <p style="margin: 0;"><strong>Proyecto / MVP:</strong> <span style="color: #34d399;">${project_name}</span></p>
                <p style="margin: 0;"><strong>URL MVP:</strong> <a href="${mvp_url}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${mvp_url}</a></p>
              </div>

              <!-- Stack badges -->
              <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06);">
                <p style="margin: 0 0 8px 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Stack Técnico Acreditado:</p>
                <div style="font-size: 11px; line-height: 1.8; color: #93c5fd; font-family: monospace;">
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Google Antigravity</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Next.js (App Router)</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Supabase PostgreSQL & RLS</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Google Gemini AI</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Cloudflare (DNS & Bucket R2)</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Mercado Pago & Webhooks</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Resend</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">PostHog Analytics</span>
                  <span style="background: rgba(15,23,42,0.85); border: 1px solid rgba(59,130,246,0.35); padding: 3px 7px; border-radius: 4px; margin-right: 4px; display: inline-block;">Vercel & GitHub</span>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 20px;">
                <a href="${fullDiplomaDownloadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4285F4 0%, #9B72F8 50%, #EC4899 100%); color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 0 20px rgba(66, 133, 244, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                  🎓 Ver y Descargar mi Diploma Oficial
                </a>
              </div>
            </div>

            <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; text-align: center; margin-bottom: 24px;">
              ${pdfBuffer ? "📎 También hemos adjuntado tu diploma en formato PDF directamente a este correo para que lo tengas siempre disponible." : "Puedes abrir y guardar tu diploma oficial en PDF de alta resolución en cualquier momento haciendo clic en el botón superior."}
            </p>

            <div style="text-align: center; font-size: 12px; color: #64748b; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">
              Vibecode Lab · Javier Mujica · Mujica AI Lab SpA
            </div>
          </div>
        `,
      })
    } catch (studentMailErr) {
      console.warn("No se pudo enviar el correo automático al alumno:", studentMailErr)
    }

    // 2. Notificación por correo a Javier / Admin
    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "javier@javiermujica.com"
      await sendEmail({
        to: adminEmail,
        subject: `🎓 Quiz Cierre Cohorte 1: ${name} (${project_name} - ${squad_name})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #07090e; color: #f1f5f9; border-radius: 16px; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="display: inline-block; padding: 6px 14px; background: rgba(139, 92, 246, 0.15); color: #c084fc; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(139, 92, 246, 0.3);">
                Vibecode Lab · Cierre de Primera Generación
              </span>
              <h2 style="color: #ffffff; margin-top: 12px; font-size: 22px; font-weight: 800;">Quiz Final de Cierre Registrado</h2>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">ID Certificado: <strong>${certificateId}</strong></p>
            </div>
            
            <!-- Paso 1 -->
            <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
              <div style="color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                Paso 1: Identificación y Artefacto
              </div>
              <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Participante:</strong> ${name}</p>
              <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #818cf8;">${email}</a></p>
              <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Squad:</strong> <span style="color: #a78bfa;">${squad_name}</span></p>
              <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Proyecto:</strong> <span style="color: #34d399; font-weight: 600;">${project_name}</span></p>
              <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>URL MVP:</strong> <a href="${mvp_url}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${mvp_url}</a></p>
              <p style="margin: 0; font-size: 14px;"><strong>Diploma Generado:</strong> <a href="${fullDiplomaDownloadUrl}" target="_blank" style="color: #c084fc; text-decoration: underline;">Descargar PDF (${certificateId})</a></p>
            </div>

            <!-- Paso 2 -->
            <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
              <div style="color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                Paso 2: Diagnóstico de Validación Real
              </div>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;"><strong>Frenos para encender pauta:</strong></p>
              <ul style="margin: 0 0 12px 0; padding-left: 20px; font-size: 13px; color: #e2e8f0;">
                ${obstacles
                  .map((o: string) => `<li>${o === "otro" && obstacle_other ? `Otro: ${obstacle_other}` : o}</li>`)
                  .join("")}
              </ul>
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;"><strong>Hipótesis $10 USD / 48 hrs (Gancho y métrica de éxito):</strong></p>
              <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-left: 3px solid #f59e0b; border-radius: 6px; font-size: 13px; color: #f1f5f9; line-height: 1.5;">
                ${campaign_pitch.replace(/\n/g, "<br/>")}
              </div>
            </div>

            <!-- Paso 3 -->
            <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
              <div style="color: #a855f7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                Paso 3: Testimonio y Transformación
              </div>
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;"><strong>Superpoder o cambio de mentalidad ganado:</strong></p>
              <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-left: 3px solid #a855f7; border-radius: 6px; font-size: 13px; color: #f1f5f9; line-height: 1.5; margin-bottom: 12px;">
                "${superpower_testimonial.replace(/\n/g, "<br/>")}"
              </div>
              ${
                aha_moment
                  ? `
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;"><strong>Momento 'ajá' o concepto clave:</strong></p>
                <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-left: 3px solid #38bdf8; border-radius: 6px; font-size: 13px; color: #f1f5f9; line-height: 1.5; margin-bottom: 12px;">
                  "${aha_moment.replace(/\n/g, "<br/>")}"
                </div>
              `
                  : ""
              }
              <p style="margin: 0; font-size: 13px;">
                <strong>Autorización de Testimonio:</strong> 
                <span style="color: ${testimonial_authorized ? "#34d399" : "#f87171"}; font-weight: 700;">
                  ${testimonial_authorized ? "✅ AUTORIZADO para uso público" : "❌ PRIVADO"}
                </span>
              </p>
            </div>

            <!-- Paso 4 -->
            <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <div style="color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                Paso 4: Feedback de Cierre y Mejora Continua
              </div>
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;"><strong>Propuesta de mejora para la próxima generación (Pregunta 5):</strong></p>
              <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-left: 3px solid #10b981; border-radius: 6px; font-size: 13px; color: #f1f5f9; line-height: 1.5; margin-bottom: 12px;">
                ${improvement_feedback.replace(/\n/g, "<br/>")}
              </div>
              ${
                nps_rating
                  ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Calificación NPS:</strong> <span style="color: #fbbf24; font-weight: 700; font-size: 16px;">${nps_rating} / 10</span></p>`
                  : ""
              }
              ${
                final_thoughts
                  ? `
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;"><strong>Mensaje final para Javier y el equipo:</strong></p>
                <div style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-left: 3px solid #6366f1; border-radius: 6px; font-size: 13px; color: #f1f5f9; line-height: 1.5;">
                  ${final_thoughts.replace(/\n/g, "<br/>")}
                </div>
              `
                  : ""
              }
            </div>

            <div style="text-align: center; font-size: 12px; color: #64748b; padding-top: 12px; border-top: 1px solid #1e293b;">
              Vibecode Lab · Primera Generación · Plataforma de Crecimiento
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.warn("No se pudo enviar notificación por correo del quiz al admin:", emailErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Quiz registrado exitosamente.",
        id: submission?.id || null,
        certificate_id: certificateId,
        diploma_url: diplomaUrl,
        verify_url: `/verify/${certificateId}`,
        readiness,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error en POST /api/quiz:", error)
    return NextResponse.json(
      { success: false, error: "Ocurrió un error al procesar tu respuesta del quiz." },
      { status: 500 }
    )
  }
}
