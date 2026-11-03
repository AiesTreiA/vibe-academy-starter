import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { updateCalendarEvent } from "@/lib/google-calendar"
import { sendEmail, getClientRescheduleTemplate, formatChileanDateTime } from "@/lib/email-service"
import { parseISO } from "date-fns"

// A simple utility to check authentication from cookies
function checkAuth(request: NextRequest) {
  const session = request.cookies.get("admin_session")?.value
  return session === "authenticated"
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any

  try {
    // Obtener todas las entregas ordenadas por creación descendente
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*, consultation_evaluations(*)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching submissions:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: any) {
    console.error("Admin API GET error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "login") {
      const { email, password } = body
      if (email === "hola@javiermujica.com" && password === "Cuidame") {
        const response = NextResponse.json({ success: true, message: "Login successful" }, { status: 200 })
        // Set cookie for 7 days
        response.cookies.set("admin_session", "authenticated", {
          path: "/",
          httpOnly: false, // Set to false so client side can check it easily too if needed
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "strict",
        })
        return response
      } else {
        return NextResponse.json({ success: false, error: "Credenciales incorrectas" }, { status: 401 })
      }
    }

    // Para cualquier otra acción, validar sesión
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out" }, { status: 200 })
      response.cookies.delete("admin_session")
      return response
    }

    if (action === "updateStatus") {
      const { id, status } = body
      if (!id || !status) {
        return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 })
      }

      const supabase = getSupabaseAdminClient() as any
      const { data, error } = await supabase
        .from("contact_submissions")
        .update({ status })
        .eq("id", id)
        .select()

      if (error) {
        console.error("Error updating status:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data }, { status: 200 })
    }

    if (action === "rescheduleMeeting") {
      const { id, new_meeting_time, note } = body
      if (!id || !new_meeting_time) {
        return NextResponse.json({ success: false, error: "Missing id or new_meeting_time" }, { status: 400 })
      }

      const supabase = getSupabaseAdminClient() as any

      // 1. Obtener la solicitud actual
      const { data: contact, error: fetchErr } = await supabase
        .from("contact_submissions")
        .select("*, consultation_evaluations(*)")
        .eq("id", id)
        .single()

      if (fetchErr || !contact) {
        return NextResponse.json({ success: false, error: "Contact submission not found" }, { status: 404 })
      }

      const previousMeetingTime = contact.meeting_time ? parseISO(contact.meeting_time) : undefined
      const newMeetingDate = parseISO(new_meeting_time)
      const newMeetingFormatted = formatChileanDateTime(newMeetingDate)

      const bookingPayload = {
        name: contact.name,
        email: contact.email,
        company: contact.company,
        phone: contact.phone,
        service_type: contact.service_type,
        message: contact.message,
        meeting_time: new_meeting_time,
        meeting_time_formatted: newMeetingFormatted,
      }

      // 2. Sincronizar o crear evento en Google Calendar
      let googleMeetLink = contact.google_meet_link
      let googleEventId = contact.google_event_id
      let googleEventLink = contact.google_event_link

      try {
        console.log("📅 Actualizando/Creando evento en Google Calendar al reagendar...")
        const calResult = await updateCalendarEvent(googleEventId, bookingPayload, contact.consultation_evaluations)
        if (calResult) {
          googleEventId = calResult.id
          googleEventLink = calResult.htmlLink
          googleMeetLink = calResult.meetLink || googleMeetLink
        }
      } catch (calErr) {
        console.error("⚠️ Error actualizando evento en Google Calendar:", calErr)
      }

      // 3. Actualizar la base de datos Supabase
      const { data: updatedContact, error: updateErr } = await supabase
        .from("contact_submissions")
        .update({
          meeting_time: new_meeting_time,
          meeting_time_formatted: newMeetingFormatted,
          google_event_id: googleEventId,
          google_event_link: googleEventLink,
          google_meet_link: googleMeetLink,
        })
        .eq("id", id)
        .select("*, consultation_evaluations(*)")
        .single()

      if (updateErr) {
        console.error("Error updating meeting time in Supabase:", updateErr)
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
      }

      // 4. Enviar correo de confirmación de reagendamiento al cliente
      const emailPayload = {
        ...updatedContact,
        meeting_time_formatted: newMeetingFormatted,
        google_meet_link: googleMeetLink,
        google_event_link: googleEventLink,
      }

      let emailResult = { success: false }
      if (contact.email) {
        const adminEmail = process.env.ADMIN_EMAIL || "hola@javiermujica.com"
        const bccEmail = process.env.EMAIL_BCC

        const isValidEmail = (address: string | undefined) => {
          if (!address) return false
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
        }

        const bccList: string[] = []
        if (isValidEmail(adminEmail)) bccList.push(adminEmail)
        if (isValidEmail(bccEmail) && bccEmail !== adminEmail) bccList.push(bccEmail!)

        emailResult = await sendEmail({
          to: contact.email,
          bcc: bccList.length > 0 ? bccList.join(",") : undefined,
          subject: "📅 Cambio de Horario de Reunión - Javier Mujica Consultoría",
          html: getClientRescheduleTemplate(emailPayload, newMeetingDate, previousMeetingTime, note),
        })

        if (emailResult.success) {
          await supabase.from("notifications_sent").insert([{
            contact_id: id,
            notification_type: "client_reschedule_email",
            recipient: contact.email,
            subject: "Cambio de Horario de Reunión - Javier Mujica Consultoría",
            content: `Reunión reagendada para el ${newMeetingFormatted}`,
            status: "sent",
          }])
        }
      }

      return NextResponse.json({
        success: true,
        data: updatedContact,
        emailSent: emailResult.success,
        message: "Reunión reagendada exitosamente.",
      }, { status: 200 })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    console.error("Admin API POST error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

