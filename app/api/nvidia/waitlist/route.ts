import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { verifyEmailMx } from "@/lib/email-validator"
import { sendEmail } from "@/lib/email-service"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body.name || "").trim()
    const email = (body.email || "").trim().toLowerCase()
    const phone = (body.phone || "").trim()
    const projectIdea = (body.projectIdea || "").trim()

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y correo electrónico son obligatorios" },
        { status: 400 }
      )
    }

    // Email validation
    const emailValidation = await verifyEmailMx(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.reason || "Por favor ingresa un correo electrónico válido." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Guardar en contact_submissions
    try {
      await supabase.from("contact_submissions").insert({
        name,
        email,
        phone,
        message: projectIdea ? `[NVIDIA Lab Gen 2 Waitlist] Idea: ${projectIdea}` : "[NVIDIA Lab Gen 2 Waitlist]",
        service: "Vibecode Lab Gen 2 (NVIDIA NIM)"
      })
    } catch (dbErr) {
      console.warn("Could not insert in contact_submissions:", dbErr)
    }

    // 2. Guardar en vibecode_registrations como pending con cupón de preventa especial NVIDIA
    try {
      await supabase.from("vibecode_registrations").upsert({
        name,
        email,
        phone,
        status: "pending",
        coupon_code: "NVIDIA_GEN2",
        amount_paid: 0
      }, { onConflict: "email" })
    } catch (regErr) {
      console.warn("Could not upsert in vibecode_registrations:", regErr)
    }

    // 3. Enviar confirmación al estudiante por email
    try {
      await sendEmail({
        to: email,
        subject: "🚀 Tu acceso prioritario a Vibecode Lab (2da Generación) + NVIDIA NIM",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="border-bottom: 2px solid #76b900; padding-bottom: 16px; margin-bottom: 20px;">
              <span style="font-size: 11px; font-weight: bold; color: #76b900; text-transform: uppercase; letter-spacing: 1.5px;">Vibecode Lab • 2da Generación</span>
              <h1 style="font-size: 22px; color: #0f172a; margin: 8px 0 0 0;">¡Hola ${name}! Estás en la Lista Prioritaria</h1>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Acabamos de confirmar tu registro prioritario para la <strong>2da Generación de Vibecode Lab</strong> a través de nuestra consola de experimentación con <strong>NVIDIA NIM</strong>.
            </p>

            <div style="background-color: #f8fafc; border-left: 4px solid #76b900; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;">Tus beneficios asegurados:</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
                <li><strong>Cupón Early Bird garantizado:</strong> Descuento de primera hora para la apertura oficial.</li>
                <li><strong>Blueprint de Arquitectura NVIDIA NIM:</strong> La plantilla base para conectar modelos de frontera a Next.js sin pagar infraestructura GPU.</li>
                <li><strong>Acceso antes que el público general:</strong> Los cupos son limitados a un grupo reducido.</li>
              </ul>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
              Te estaré escribiendo personalmente antes del lanzamiento oficial. Si tienes dudas directas o quieres comentar tu idea de proyecto, puedes responderme directamente a este correo.
            </p>

            <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #94a3b8;">
              <p style="margin: 0;"><strong>Javier Mujica</strong> — Fundador & Tutor de Vibecode Lab</p>
              <p style="margin: 4px 0 0 0;"><a href="https://javiermujica.com" style="color: #76b900; text-decoration: none;">javiermujica.com</a></p>
            </div>
          </div>
        `
      })
    } catch (mailErr) {
      console.error("Error sending welcome email to waitlist user:", mailErr)
    }

    return NextResponse.json({
      ok: true,
      message: "¡Registro completado exitosamente! Revisa tu bandeja de entrada."
    })

  } catch (err: any) {
    console.error("Waitlist API error:", err)
    return NextResponse.json(
      { error: err.message || "Error procesando el registro" },
      { status: 500 }
    )
  }
}
