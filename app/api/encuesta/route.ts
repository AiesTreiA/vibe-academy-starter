import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  try {
    const body = await request.json()
    const {
      name,
      email,
      whatsapp,
      commitment,
      idea_status,
      idea_description,
      ad_budget,
      blocker,
      launch_timeline,
    } = body

    if (!name || !email || !commitment || !idea_status || !ad_budget || !blocker || !launch_timeline) {
      return NextResponse.json(
        { success: false, error: "Por favor completa todos los campos requeridos." },
        { status: 400 }
      )
    }

    // Mapping labels for human-readable recording
    const commitmentMap: Record<number, string> = {
      1: "1/5 - Todavía dudando entre varias",
      2: "2/5 - Explorando opciones",
      3: "3/5 - Convencido pero abierto a pivotear",
      4: "4/5 - Firme y con plan",
      5: "5/5 - Esto es lo que voy a construir sí o sí 🔥",
    }

    const ideaStatusMap: Record<string, string> = {
      tengo_idea: "Tengo idea propia",
      sumar_companero: "Me voy a sumar a la de otro compañero",
      no_claro: "Todavía no lo tengo claro",
    }

    const budgetMap: Record<string, string> = {
      hasta_20k: "Hasta $20.000 CLP",
      de_20k_a_50k: "Entre $20.000 y $50.000 CLP",
      de_50k_a_100k: "Entre $50.000 y $100.000 CLP",
      mas_de_100k: "Más de $100.000 CLP",
    }

    const blockerMap: Record<string, string> = {
      miedo_gastar: "Miedo a gastar plata sin resultado",
      sin_creatividad: "No tengo la campaña o la creatividad lista",
      idea_no_definida: "No sé si la idea está lo suficientemente definida",
      listo: "Nada, estoy listo 🚀",
    }

    const timelineMap: Record<string, string> = {
      esta_semana: "Esta semana",
      dos_semanas: "En dos semanas",
      post_modulo: "Después del cierre del módulo",
    }

    const readableSummary = [
      `=== RESPUESTA ENCUESTA: DE LA IDEA AL MERCADO ===`,
      `Participante: ${name}`,
      `Email: ${email}`,
      `WhatsApp: ${whatsapp || "No indicado"}`,
      ``,
      `1. Nivel de Compromiso:`,
      `   ${commitmentMap[Number(commitment)] || `${commitment}/5`}`,
      ``,
      `2. Situación de la Idea:`,
      `   ${ideaStatusMap[idea_status] || idea_status}`,
      idea_description ? `   Detalle de la Idea: ${idea_description}` : null,
      ``,
      `3. Presupuesto Pauta Publicitaria este mes:`,
      `   ${budgetMap[ad_budget] || ad_budget}`,
      ``,
      `4. Principal Freno para salir a validar:`,
      `   ${blockerMap[blocker] || blocker}`,
      ``,
      `5. Plazo primera campaña corriendo:`,
      `   ${timelineMap[launch_timeline] || launch_timeline}`,
      ``,
      `Fecha de Registro: ${new Date().toISOString()}`,
    ]
      .filter((line) => line !== null)
      .join("\n")

    // Guardar en contact_submissions con service_type 'Encuesta Validacion'
    const { data: submission, error: dbError } = await (supabase.from("contact_submissions") as any)
      .insert([
        {
          name,
          email,
          phone: whatsapp || null,
          company: idea_status === "tengo_idea" && idea_description ? idea_description.slice(0, 200) : "Vibecode Cohort",
          service_type: "Encuesta Validación",
          message: readableSummary,
          status: "completed",
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error("Error guardando encuesta en base de datos:", dbError)
      // Aun si falla la inserción por RLS o similar, loggeamos para no perder la respuesta
      console.log("PAYLOAD ENCUESTA RESPALDADO:", body)
    }

    // Notificación por correo a Javier / Admin (asíncrona y no bloqueante)
    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "javier@javiermujica.com"
      await sendEmail({
        to: adminEmail,
        subject: `🎯 Nueva Encuesta de Validación: ${name} (${ideaStatusMap[idea_status] || idea_status})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0b0f19; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f293d;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                Vibecode Lab · De la Idea al Mercado
              </span>
              <h2 style="color: #ffffff; margin-top: 12px; font-size: 22px; font-weight: 700;">Nueva Respuesta de Validación</h2>
            </div>
            
            <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Participante:</strong> ${name}</p>
              <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
              ${whatsapp ? `<p style="margin: 0 0 8px 0; font-size: 15px;"><strong>WhatsApp:</strong> <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}" style="color: #34d399;">${whatsapp}</a></p>` : ""}
            </div>

            <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; line-height: 1.6;">
              <h3 style="color: #60a5fa; font-size: 14px; text-transform: uppercase; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.05em;">Respuestas del Formulario</h3>
              
              <div style="margin-bottom: 14px;">
                <span style="color: #9ca3af; font-size: 13px; display: block;">1. Nivel de Compromiso:</span>
                <strong style="color: #fbbf24; font-size: 15px;">${commitmentMap[Number(commitment)] || commitment}</strong>
              </div>

              <div style="margin-bottom: 14px;">
                <span style="color: #9ca3af; font-size: 13px; display: block;">2. Situación de la Idea:</span>
                <strong style="color: #e5e7eb; font-size: 15px;">${ideaStatusMap[idea_status] || idea_status}</strong>
                ${idea_description ? `<div style="margin-top: 4px; padding: 8px 12px; background: rgba(255,255,255,0.04); border-left: 3px solid #6366f1; border-radius: 4px; font-style: italic; color: #cbd5e1;">"${idea_description}"</div>` : ""}
              </div>

              <div style="margin-bottom: 14px;">
                <span style="color: #9ca3af; font-size: 13px; display: block;">3. Presupuesto Pauta Publicitaria:</span>
                <strong style="color: #34d399; font-size: 15px;">${budgetMap[ad_budget] || ad_budget}</strong>
              </div>

              <div style="margin-bottom: 14px;">
                <span style="color: #9ca3af; font-size: 13px; display: block;">4. Principal Freno:</span>
                <strong style="color: #f87171; font-size: 15px;">${blockerMap[blocker] || blocker}</strong>
              </div>

              <div>
                <span style="color: #9ca3af; font-size: 13px; display: block;">5. Plazo de Campaña:</span>
                <strong style="color: #a78bfa; font-size: 15px;">${timelineMap[launch_timeline] || launch_timeline}</strong>
              </div>
            </div>

            <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #6b7280;">
              Vibecode Lab · Plataforma de Crecimiento & Validación
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.warn("No se pudo enviar notificación de correo (opcional):", emailErr)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Encuesta registrada exitosamente.",
        id: submission?.id || null,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error en POST /api/encuesta:", error)
    return NextResponse.json(
      { success: false, error: "Ocurrió un error al procesar tu respuesta." },
      { status: 500 }
    )
  }
}
