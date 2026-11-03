import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"
import {
  generateCertificateId,
  generateVerificationHash,
  evaluateEbookExam,
} from "@/lib/unicorn-bible-config"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  try {
    const body = await request.json()
    const {
      name,
      email,
      project_name,
      mvp_url,
      mode = "all",
      answers = {},
    } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Por favor ingresa tu nombre completo y correo electrónico para emitir el certificado.",
        },
        { status: 400 }
      )
    }

    const validModes = ["vol-1", "vol-2", "vol-3", "vol-4", "all"] as const
    const examMode = validModes.includes(mode) ? mode : "all"

    const evaluation = evaluateEbookExam(answers, examMode)

    if (!evaluation.passed) {
      return NextResponse.json(
        {
          success: false,
          error: `Obtuviste ${evaluation.scorePct}% (${evaluation.correctCount}/${evaluation.totalQuestions}). Se requiere al menos 75% para emitir el certificado oficial SQR-2026.`,
          evaluation,
        },
        { status: 400 }
      )
    }

    const certificateId = generateCertificateId("ebook")
    const cleanProjectName = project_name?.trim() || "Squad en Formación (La Biblia Ágil)"
    const cleanMvpUrl = mvp_url?.trim() || "https://www.javiermujica.com/unicorn-bible"
    const verificationHash = generateVerificationHash(certificateId, email, cleanMvpUrl)
    const sourceVol = examMode === "all" ? null : Number(examMode.replace("vol-", ""))

    const readableSummary = [
      `=== EXAMEN DE CERTIFICACIÓN EDITORIAL · LA BIBLIA DEL SQUAD ÁGIL ===`,
      `• Modalidad Evaluada: ${evaluation.modeTitle}`,
      `• Resultado Examen: ${evaluation.scorePct}% (${evaluation.correctCount}/${evaluation.totalQuestions} respuestas correctas) — APROBADO`,
      `• ID Certificado: ${certificateId}`,
      `• Hash Verificación: ${verificationHash}`,
      `• Lector / Founder: ${name.trim()} (${email.trim()})`,
      `• Proyecto / Startup: ${cleanProjectName}`,
      `• URL MVP: ${cleanMvpUrl}`,
      `• Pilares: Infra (${evaluation.pillarScores.infraestructura}/25) | Pitch (${evaluation.pillarScores.pitch}/25) | Métricas (${evaluation.pillarScores.metricas}/25) | Capital (${evaluation.pillarScores.capital}/25)`,
    ].join("\n")

    // 1. Save in contact_submissions for universal fallback compatibility with /verify/[id] and /api/quiz/diploma
    try {
      await (supabase.from("contact_submissions") as any).insert([
        {
          name: name.trim(),
          email: email.trim(),
          company: `Certificación Editorial SQR-2026 (${examMode.toUpperCase()}) | ${cleanProjectName}`,
          service_type: "Certificación Editorial Unicorn Bible",
          message: readableSummary,
          status: "completed",
        },
      ])
    } catch (err) {
      console.warn("[EbookQuiz] Non-fatal contact_submissions insert warning:", err)
    }

    // 2. Save in certificates table
    try {
      await (supabase.from("certificates") as any).insert([
        {
          id: certificateId,
          student_name: name.trim(),
          student_email: email.trim(),
          squad_name: `Certificación Editorial · ${evaluation.modeTitle}`,
          project_name: cleanProjectName,
          mvp_url: cleanMvpUrl,
          certificate_prefix: "SQR",
          source_origin: "ebook",
          source_volume: sourceVol,
          readiness_score: evaluation.scorePct,
          readiness_level: evaluation.scorePct >= 85 ? "Investment-Ready" : "Production-Ready",
          pillar_scores: evaluation.pillarScores,
          campaign_hypothesis: `Examen Editorial Aprobado (${evaluation.scorePct}% en ${evaluation.modeTitle})`,
          verification_hash: verificationHash,
        },
      ])
    } catch (certErr) {
      console.warn("[EbookQuiz] Fallback certificates insert:", certErr)
      try {
        await (supabase.from("certificates") as any).insert([
          {
            id: certificateId,
            student_name: name.trim(),
            student_email: email.trim(),
            squad_name: `Certificación Editorial · ${evaluation.modeTitle}`,
            project_name: cleanProjectName,
            mvp_url: cleanMvpUrl,
          },
        ])
      } catch (fallbackErr) {
        console.warn("[EbookQuiz] Secondary fallback certificates warning:", fallbackErr)
      }
    }

    // 3. Save in ebook_leads_diagnostics
    try {
      await (supabase.from("ebook_leads_diagnostics") as any).insert([
        {
          certificate_id: certificateId,
          reader_name: name.trim(),
          reader_email: email.trim(),
          squad_name: `Certificación Editorial (${examMode})`,
          project_name: cleanProjectName,
          mvp_url: cleanMvpUrl,
          source_volume: sourceVol,
          utm_campaign: "unicorn_bible_exam",
          total_score: evaluation.scorePct,
          readiness_level: evaluation.scorePct >= 85 ? "Investment-Ready" : "Production-Ready",
          infra_score: evaluation.pillarScores.infraestructura,
          pitch_score: evaluation.pillarScores.pitch,
          metrics_score: evaluation.pillarScores.metricas,
          capital_score: evaluation.pillarScores.capital,
          campaign_pitch: `Aprobado Examen ${evaluation.modeTitle} (${evaluation.correctCount}/${evaluation.totalQuestions})`,
          obstacles: [],
          raw_payload: {
            mode: examMode,
            answers,
            evaluation,
          },
        },
      ])
    } catch (diagErr) {
      console.warn("[EbookQuiz] Non-fatal ebook_leads_diagnostics warning:", diagErr)
    }

    // 4. Send congratulatory email with Diploma link + VibeCode Lab Community invitation
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://www.javiermujica.com"
    const diplomaUrl = `${siteOrigin}/api/quiz/diploma?id=${encodeURIComponent(certificateId)}`
    const verifyUrl = `${siteOrigin}/verify/${encodeURIComponent(certificateId)}`
    const communityUrl = `${siteOrigin}/vibecode?utm_source=ebook_cert_email&utm_campaign=unicorn_bible`

    try {
      await sendEmail({
        to: email.trim(),
        subject: `🎓 Certificado Oficial ${certificateId} — Dominio Aprobado (${evaluation.modeTitle})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #040814; color: #f8fafc; padding: 36px 28px; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.25);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="display: inline-block; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 999px;">
                CERTIFICACIÓN OFICIAL · ${certificateId}
              </span>
              <h1 style="font-size: 24px; font-weight: 800; margin: 16px 0 8px; color: #ffffff;">
                ¡Felicidades, ${name.trim()}! Aprobaste con ${evaluation.scorePct}%
              </h1>
              <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                ${evaluation.modeTitle}
              </p>
            </div>

            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 16px;">
                Has demostrado dominio de los conceptos tácticos de <strong>CÓDIGO &amp; CAPITAL: La Biblia de los Squads Ágiles</strong>. Tu certificado oficial ya está emitido y respaldado criptográficamente:
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${diplomaUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #4f46e5); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin: 4px;">
                  📄 Descargar Certificado PDF (${certificateId})
                </a>
                <a href="${verifyUrl}" style="display: inline-block; background: rgba(255,255,255,0.06); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); text-decoration: none; font-weight: 600; font-size: 13px; padding: 11px 20px; border-radius: 10px; margin: 4px;">
                  🔍 Ver Portal de Verificación Pública
                </a>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(16, 185, 129, 0.15)); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 12px; padding: 24px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin: 0 0 10px;">
                🚀 El Siguiente Paso: Pasa del Libro a la Cancha en la Comunidad de VibeCode Lab
              </h2>
              <p style="font-size: 13.5px; line-height: 1.6; color: #e2e8f0; margin: 0 0 16px;">
                Dominar los conceptos te pone por delante del 90% de los fundadores. Pero los comités de CORFO, Ángeles y Venture Capitals no invierten en teoría: <strong>invierten en productos operando en producción con pagos reales en vivo</strong>.
              </p>
              <p style="font-size: 13.5px; line-height: 1.6; color: #cbd5e1; margin: 0 0 18px;">
                Te invitamos a dar el salto e implementar todo lo que aprendiste dentro de la <strong>Comunidad y Bootcamp de VibeCode Lab</strong>: desplegaremos tu arquitectura SaaS en semanas, entrenaremos tu Pitch de 180s en vivo y lanzaremos tu primera campaña real de adquisición junto a otros Squads de alto rendimiento.
              </p>
              <div style="text-align: center;">
                <a href="${communityUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 13px 28px; border-radius: 10px;">
                  🚀 Acelerar mi Implementación en VibeCode Lab →
                </a>
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.warn("[EbookQuiz] Non-fatal email send warning:", emailErr)
    }

    return NextResponse.json({
      success: true,
      certificateId,
      verificationHash,
      evaluation,
      diplomaUrl: `/api/quiz/diploma?id=${encodeURIComponent(certificateId)}`,
      verifyUrl: `/verify/${encodeURIComponent(certificateId)}`,
    })
  } catch (err) {
    console.error("[EbookQuiz] Error processing exam submission:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Ocurrió un error al procesar tu evaluación. Por favor intenta nuevamente.",
      },
      { status: 500 }
    )
  }
}
