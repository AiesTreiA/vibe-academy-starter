import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { verifyEmailMx } from "@/lib/email-validator"
import { sendEmail, getTrelloResourceTemplate } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  try {
    const { name, email, service_type } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Nombre y correo son requeridos" }, { status: 400 })
    }

    // 1. Validar si el correo es real (sintaxis + desechables + MX)
    const emailValidation = await verifyEmailMx(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ success: false, error: emailValidation.reason }, { status: 400 })
    }

    const resolvedServiceType = service_type || "Recursos Gratis"
    const resolvedMessage = resolvedServiceType === "Prinergia - Terapeuta Interesado"
      ? "Terapeuta registró interés en Prinergia desde javiermujica.com"
      : "Usuario se registró para acceder a las herramientas y recursos gratuitos."

    // 2. Guardar el lead en Supabase
    const { data: contact, error } = await (supabase.from("contact_submissions") as any)
      .insert([
        {
          name,
          email,
          service_type: resolvedServiceType,
          message: resolvedMessage,
          status: "pending"
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving lead:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 3. Enviar recurso Trello si el registro es para los Recursos Gratuitos
    let emailSent = false
    if (resolvedServiceType === "Recursos Gratis") {
      try {
        console.log(`📧 Enviando plantilla Trello a ${email}...`)
        const subject = "🎁 Tu Plantilla Kanban Neuro-Friendly - Javier Mujica"
        const html = getTrelloResourceTemplate(name)
        
        const emailResult = await sendEmail({
          to: email,
          subject,
          html
        })
        
        if (emailResult.success) {
          emailSent = true
          // Registrar en log de notificaciones
          await supabase.from("notifications_sent").insert([{
            contact_id: contact.id,
            notification_type: "client_resource_email",
            recipient: email,
            subject: subject,
            content: "Envío automático de la plantilla Trello y recursos gratuitos",
            status: "sent"
          }] as any)
          console.log(`✅ Correo enviado con éxito a ${email}`)
        } else {
          console.error("❌ Error al enviar el correo de recursos:", emailResult.error)
        }
      } catch (emailErr) {
        console.error("❌ Excepción al enviar correo de recursos:", emailErr)
      }
    }

    return NextResponse.json({ 
      success: true, 
      contactId: contact.id,
      emailSent
    }, { status: 200 })
  } catch (err: any) {
    console.error("Lead API Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

