import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { verifyEmailMx } from "@/lib/email-validator"
import { sendEmail } from "@/lib/email-service"
import { 
  MASTERCLASSES_CONFIG, 
  getMasterclassAdminNotificationTemplate,
  renderMasterclassTemplate,
  generateMasterclassCalendarUrl,
  formatChileanDateString 
} from "@/lib/masterclass-emails"

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient()

  try {
    const { name, email, masterclass, masterclasses } = await request.json()

    // Soporte para arreglo o string único
    const classesList: string[] = masterclasses || (masterclass ? [masterclass] : [])

    if (!name || !email || classesList.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nombre, correo y al menos una masterclass son requeridos" },
        { status: 400 }
      )
    }

    // 1. Validar si el correo es real
    const emailValidation = await verifyEmailMx(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ success: false, error: emailValidation.reason }, { status: 400 })
    }

    // Preparar inserciones múltiples
    const insertRows = classesList.map(mc => {
      const mcDetails = MASTERCLASSES_CONFIG[mc]
      const meetingTime = mcDetails ? mcDetails.date : null
      const meetUrl = mcDetails ? mcDetails.meet : "https://meet.google.com"
      
      return {
        name,
        email,
        service_type: `Masterclass: ${mc}`,
        message: `Inscripción registrada para la Master Class: ${mc}`,
        status: "pending",
        meeting_time: meetingTime,
        google_meet_link: meetUrl,
        meeting_time_formatted: meetingTime ? formatChileanDateString(meetingTime) : undefined
      }
    })

    // 2. Guardar el registro en Supabase (Bulk Insert)
    const { data: contacts, error } = await (supabase.from("contact_submissions") as any)
      .insert(insertRows)
      .select()

    if (error) {
      console.error("Error saving masterclass registrations:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const firstContact = contacts && contacts.length > 0 ? contacts[0] : { id: null }

    // Generar tabla HTML consolidada para el correo (con 4 columnas)
    let classesTableHtml = `
      <table style="width:100%; border-collapse:collapse; font-size:13px; margin: 15px 0; background-color:#111827; border:1px solid #1e293b; border-radius:6px;">
        <thead>
          <tr style="border-bottom:2px solid #1e293b; text-align:left; background-color:#1f2937;">
            <th style="padding:10px; color:#9ca3af; font-size:11px; font-weight:bold; text-transform:uppercase;">Masterclass</th>
            <th style="padding:10px; color:#9ca3af; font-size:11px; font-weight:bold; text-transform:uppercase;">Fecha y Hora (Chile)</th>
            <th style="padding:10px; color:#9ca3af; font-size:11px; font-weight:bold; text-transform:uppercase; text-align:center;">Llamada</th>
            <th style="padding:10px; color:#9ca3af; font-size:11px; font-weight:bold; text-transform:uppercase; text-align:right;">Calendario</th>
          </tr>
        </thead>
        <tbody>
    `
    classesList.forEach(mc => {
      const mcDetails = MASTERCLASSES_CONFIG[mc]
      const dateStr = mcDetails ? formatChileanDateString(mcDetails.date) : "—"
      const meetUrl = mcDetails ? mcDetails.meet : "https://meet.google.com"
      const calUrl = mcDetails ? generateMasterclassCalendarUrl(mc, mcDetails.date, meetUrl) : "#"
      
      classesTableHtml += `
        <tr style="border-bottom:1px solid #1e293b;">
          <td style="padding:12px 10px; font-weight:bold; color:#ffffff;">${mc}</td>
          <td style="padding:12px 10px; color:#d1d5db;">${dateStr}</td>
          <td style="padding:12px 10px; text-align:center;"><a href="${meetUrl}" style="color:#38bdf8; text-decoration:underline;" target="_blank">Unirme</a></td>
          <td style="padding:12px 10px; text-align:right;"><a href="${calUrl}" style="color:#10b981; text-decoration:underline;" target="_blank">+ Google</a></td>
        </tr>
      `
    })
    classesTableHtml += `</tbody></table>`

    // 3. Enviar correo de registro exitoso agrupado al alumno
    let emailSent = false
    try {
      const groupTitle = classesList.join(", ")
      const firstMeetUrl = MASTERCLASSES_CONFIG[classesList[0]]?.meet || "https://meet.google.com"

      const { subject, html } = await renderMasterclassTemplate("registration", {
        name,
        title: groupTitle,
        date: classesTableHtml,
        meetUrl: firstMeetUrl
      })
      
      const emailResult = await sendEmail({
        to: email,
        subject,
        html
      })
      
      if (emailResult.success) {
        emailSent = true
        if (firstContact.id) {
          // Registrar la notificación enviada en la BD asociándola al primer registro
          await supabase.from("notifications_sent").insert([{
            contact_id: firstContact.id,
            notification_type: "masterclass_registration",
            recipient: email,
            subject: subject,
            content: `Envío automático unificado de confirmación de registro a las masterclasses: ${groupTitle}`,
            status: "sent"
          }] as any)
        }
      } else {
        console.error("Error sending registration email via Resend:", emailResult.error)
      }

      // 4. Notificar al administrador por correo con el resumen unificado
      try {
        const adminSubject = `🎯 Nueva Inscripción Masterclass: ${name}`
        const adminHtml = getMasterclassAdminNotificationTemplate(name, email, groupTitle, classesTableHtml)
        await sendEmail({
          to: "hola@javiermujica.com",
          subject: adminSubject,
          html: adminHtml
        })
      } catch (adminEmailErr) {
        console.error("Exception sending admin registration notification:", adminEmailErr)
      }
    } catch (emailErr) {
      console.error("Exception rendering or sending registration email:", emailErr)
    }

    return NextResponse.json({
      success: true,
      contactId: firstContact.id,
      emailSent
    }, { status: 200 })
  } catch (err: any) {
    console.error("Masterclass API Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

