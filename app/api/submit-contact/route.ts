import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail, getAdminNotificationTemplate, getClientConfirmationTemplate, getObjection1EmailTemplate } from "@/lib/email-service"
import { createCalendarEvent } from "@/lib/google-calendar"
import { parseISO } from "date-fns"
import { verifyEmailMx } from "@/lib/email-validator"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  async function safeInsertContact(payload: any) {
    const { data, error } = await supabase.from("contact_submissions").insert([payload] as any).select().single()
    return { data, error }
  }


  try {
    const contactPayload = await request.json()

    // Validar si el correo es real (sintaxis + desechables + MX)
    const emailValidation = await verifyEmailMx(contactPayload.email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ success: false, error: emailValidation.reason }, { status: 400 })
    }

    const { data: contact, error } = await safeInsertContact(contactPayload)

    if (error) {
      console.error("Error saving contact:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!contact) {
      console.error("Contact data is null")
      return NextResponse.json({ success: false, error: "Failed to save contact" }, { status: 500 })
    }

    let consultationData = null
    if (contactPayload.consultation_id) {
      const { data } = await supabase
        .from("consultation_evaluations")
        .select("*")
        .eq("id", contactPayload.consultation_id)
        .single()
      consultationData = data
    }

    // Integración de Google Calendar
    let googleMeetLink = null
    let googleEventId = null
    let googleEventLink = null
    
    if (contactPayload.meeting_time) {
      try {
        console.log("📅 Creando evento en Google Calendar...")
        const calendarResult = await createCalendarEvent(contactPayload, consultationData)
        if (calendarResult) {
          googleMeetLink = calendarResult.meetLink
          googleEventId = calendarResult.id
          googleEventLink = calendarResult.htmlLink

          // Guardar el id del evento, enlace de Meet y de Calendar en la BD
          await (supabase.from("contact_submissions") as any)
            .update({
              google_event_id: googleEventId,
              google_meet_link: googleMeetLink,
              google_event_link: googleEventLink
            })
            .eq("id", (contact as any).id)
        }
      } catch (calErr) {
        console.error("⚠️ Error al crear evento en Google Calendar:", calErr)
      }
    }

    const emailPayload = {
      ...contactPayload,
      google_meet_link: googleMeetLink,
      google_event_link: googleEventLink
    }

    const meetingTime = contactPayload.meeting_time ? parseISO(contactPayload.meeting_time) : undefined
    const adminEmail = process.env.ADMIN_EMAIL || "tu-email@ejemplo.com"
    const bccEmail = process.env.EMAIL_BCC

    function isValidEmail(address: string | undefined) {
      if (!address) return false
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
    }

    let adminEmailResult = { success: false }
    if (isValidEmail(adminEmail)) {
      adminEmailResult = await sendEmail({
        to: adminEmail,
        bcc: isValidEmail(bccEmail) ? bccEmail : undefined,
        subject: `🎯 Nueva Consulta - ${contactPayload.company || contactPayload.name}`,
        html: getAdminNotificationTemplate(emailPayload, consultationData, meetingTime),
      })
    }

    if (adminEmailResult.success) {
      await supabase.from("notifications_sent").insert([{
        contact_id: (contact as any).id,
        notification_type: "admin_email",
        recipient: adminEmail,
        subject: `Nueva Consulta - ${contactPayload.company || contactPayload.name}`,
        content: "Notificación de nueva consulta enviada al administrador",
        status: "sent",
      }] as any)
    }

    let clientEmailResult = { success: false }
    if (isValidEmail(contactPayload.email)) {
      clientEmailResult = await sendEmail({
        to: contactPayload.email,
        subject: "✅ Confirmación de Reunión - Javier Mujica Consultoría",
        html: getClientConfirmationTemplate(emailPayload, meetingTime, consultationData),
      })
    }

    if (clientEmailResult.success) {
      await supabase.from("notifications_sent").insert([{
        contact_id: (contact as any).id,
        notification_type: "client_email",
        recipient: contactPayload.email,
        subject: "Confirmación de Reunión - Javier Mujica Consultoría",
        content: "Email de confirmación enviado al cliente",
        status: "sent",
      }] as any)
    }

    // Enviar Correo 1 (Objeción 1: IA Complejidad y Costos) de inmediato al agendar
    let objection1EmailResult = { success: false }
    if (isValidEmail(contactPayload.email)) {
      const objectionSubject = "💡 ¿La IA es solo para gigantes tecnológicos?"
      objection1EmailResult = await sendEmail({
        to: contactPayload.email,
        subject: objectionSubject,
        html: getObjection1EmailTemplate(contactPayload.name || "Estimado/a"),
      })
      if (objection1EmailResult.success) {
        await supabase.from("notifications_sent").insert([{
          contact_id: (contact as any).id,
          notification_type: "objection_1_email",
          recipient: contactPayload.email,
          subject: objectionSubject,
          content: "Email inmediato de objeción 1 enviado al cliente",
          status: "sent",
        }] as any)
      }
    }

    return NextResponse.json({
      success: true,
      contactId: (contact as any).id,
      message: "Consulta enviada exitosamente",
      notifications: {
        adminEmail: adminEmailResult.success,
        clientEmail: clientEmailResult.success,
        objection1Email: objection1EmailResult.success,
      },
    }, { status: 200 })

  } catch (err: any) {
    console.error("API Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}