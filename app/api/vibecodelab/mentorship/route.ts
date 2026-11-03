import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"
import { getGoogleCalendarBusySlots, createCalendarEvent } from "@/lib/google-calendar"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const isAdmin = url.searchParams.get("admin") === "true"

    const supabase = getSupabaseAdminClient() as any

    let slotsQuery = supabase
      .from("vibecode_mentorship_slots")
      .select("*")
      .order("slot_date", { ascending: true })

    if (!isAdmin) {
      slotsQuery = slotsQuery.or(`status.eq.available,booked_by_user_id.eq.${userId || '00000000-0000-0000-0000-000000000000'}`)
    }

    const { data: slots, error } = await slotsQuery

    if (error) {
      console.error("❌ Error fetching mentorship slots:", error)
      return NextResponse.json({ error: "Error al obtener horarios de mentoría" }, { status: 500 })
    }

    // Dynamic Google Calendar busy checking for available slots
    const processedSlots = await Promise.all(
      (slots || []).map(async (slot: any) => {
        if (slot.status !== "available" || slot.is_booked) {
          return slot
        }

        try {
          const slotStart = new Date(slot.slot_date)
          const dateStr = slotStart.toISOString().split("T")[0]
          const busySlots = await getGoogleCalendarBusySlots(dateStr)

          const slotEnd = new Date(slotStart.getTime() + (slot.duration_minutes || 45) * 60 * 1000)

          const isOverlapping = busySlots.some((busy) => {
            const busyStart = new Date(busy.start)
            const busyEnd = new Date(busy.end)
            return slotStart < busyEnd && slotEnd > busyStart
          })

          if (isOverlapping) {
            return {
              ...slot,
              is_calendar_busy: true,
              status: "busy_in_google_calendar"
            }
          }
        } catch (calErr) {
          console.warn("⚠️ Warning checking Google Calendar busy status for slot:", slot.id, calErr)
        }

        return slot
      })
    )

    // Filter out calendar busy slots for non-admins
    const availableSlots = isAdmin
      ? processedSlots
      : processedSlots.filter((s: any) => !s.is_calendar_busy)

    return NextResponse.json({ success: true, slots: availableSlots })
  } catch (err: any) {
    console.error("❌ Exception in mentorship GET route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { slotId, userId, userName, userEmail, topic } = body

    if (!slotId || !userId) {
      return NextResponse.json({ error: "slotId y userId son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Verify slot is available in Supabase
    const { data: slot, error: fetchErr } = await supabase
      .from("vibecode_mentorship_slots")
      .select("*")
      .eq("id", slotId)
      .single()

    if (fetchErr || !slot) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 })
    }

    if (slot.is_booked && slot.booked_by_user_id !== userId) {
      return NextResponse.json({ error: "Este horario ya ha sido reservado por otro estudiante" }, { status: 409 })
    }

    // 2. Check if slot overlaps with Google Calendar busy slots
    const slotStart = new Date(slot.slot_date)
    const dateStr = slotStart.toISOString().split("T")[0]
    const busySlots = await getGoogleCalendarBusySlots(dateStr)
    const slotEnd = new Date(slotStart.getTime() + (slot.duration_minutes || 45) * 60 * 1000)

    const isOverlapping = busySlots.some((busy) => {
      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)
      return slotStart < busyEnd && slotEnd > busyStart
    })

    if (isOverlapping) {
      return NextResponse.json(
        { error: "Este horario acaba de ser ocupado en la agenda de Google Calendar de Javier Mujica. Por favor elige otro horario." },
        { status: 409 }
      )
    }

    // 3. Create Event in Google Calendar with Google Meet link via API
    let gCalMeetLink = slot.meet_link || "https://meet.google.com/jmg-iqxe-eay"
    let gCalEventId: string | null = null

    try {
      console.log(`📅 Creating Google Calendar event for student ${userEmail} at ${slot.slot_date}`)
      const calendarResult = await createCalendarEvent({
        name: userName || "Alumno Vibecode",
        email: userEmail || "",
        service_type: "Mentoría 1-a-1 Vibecode Lab",
        meeting_time: slot.slot_date,
        message: topic || "Sesión de Mentoría 1-a-1 en Vibecode Lab"
      })

      if (calendarResult?.meetLink) {
        gCalMeetLink = calendarResult.meetLink
      }
      if (calendarResult?.id) {
        gCalEventId = calendarResult.id
      }
    } catch (gcalErr) {
      console.error("⚠️ Exception creating Google Calendar event:", gcalErr)
    }

    // 4. Update slot status in Supabase database
    const { data: updatedSlot, error: updateErr } = await supabase
      .from("vibecode_mentorship_slots")
      .update({
        is_booked: true,
        booked_by_user_id: userId,
        booked_by_name: userName || "Alumno",
        booked_by_email: userEmail || "",
        topic: topic || "Sesión de Mentoría 1-a-1 Vibecode Lab",
        meet_link: gCalMeetLink,
        status: "booked"
      })
      .eq("id", slotId)
      .select()
      .single()

    if (updateErr) {
      console.error("❌ Error booking mentorship slot:", updateErr)
      return NextResponse.json({ error: "Error al agendar la mentoría" }, { status: 500 })
    }

    // 5. Send confirmation email to student with Google Meet link
    if (userEmail) {
      try {
        const slotDateFormatted = new Date(updatedSlot.slot_date).toLocaleString("es-CL", {
          timeZone: "America/Santiago",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Mentoría 1-a-1 Confirmada - Vibecode Lab</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #030712; color: #f3f4f6; padding: 25px;">
            <div style="max-width: 600px; margin: 0 auto; background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 28px;">
              <h2 style="color: #10b981; margin-top: 0;">✅ Mentoría 1-a-1 Confirmada en Agenda</h2>
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Tu sesión de mentoría individual con Javier Mujica se ha agendado y sincronizado exitosamente en Google Calendar.</p>
              
              <div style="background: #0f172a; border: 1px solid #3730a3; border-left: 4px solid #6366f1; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 6px 0;"><strong>🗓️ Fecha y Hora:</strong> ${slotDateFormatted} (Hora de Chile)</p>
                <p style="margin: 6px 0;"><strong>💡 Tema a tratar:</strong> ${topic || "Consultoría y revisión de proyecto"}</p>
                <p style="margin: 12px 0 0 0; font-size: 15px;">
                  <strong>📹 Videollamada por Google Meet:</strong><br/>
                  <a href="${gCalMeetLink}" style="color: #60a5fa; font-weight: bold; text-decoration: underline;" target="_blank">${gCalMeetLink}</a>
                </p>
              </div>

              <p style="font-size: 13px; color: #94a3b8;">
                Se ha enviado una invitación a tu correo electrónico para añadir este evento a tu Google Calendar personal.
              </p>

              <p>¡Nos vemos en la clase!</p>
              <p style="margin-top: 25px;">Saludos,<br/><strong>Javier Mujica</strong></p>
            </div>
          </body>
          </html>
        `

        await sendEmail({
          to: userEmail,
          subject: "🗓️ Mentoría 1-a-1 Sincronizada con Google Calendar",
          html: emailHtml
        })
      } catch (emailErr) {
        console.error("Failed sending mentorship confirmation email:", emailErr)
      }
    }

    return NextResponse.json({ success: true, slot: updatedSlot })
  } catch (err: any) {
    console.error("❌ Exception booking mentorship:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { slot_date, duration_minutes, meet_link } = body

    if (!slot_date) {
      return NextResponse.json({ error: "slot_date es requerido" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    const newSlot = {
      slot_date: new Date(slot_date).toISOString(),
      duration_minutes: duration_minutes || 45,
      meet_link: meet_link || "https://meet.google.com/jmg-iqxe-eay",
      is_booked: false,
      status: "available",
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from("vibecode_mentorship_slots").insert(newSlot).select().single()

    if (error) {
      console.error("❌ Error creating mentorship slot:", error)
      return NextResponse.json({ error: "Error al crear slot de mentoría" }, { status: 500 })
    }

    return NextResponse.json({ success: true, slot: data })
  } catch (err: any) {
    console.error("❌ Exception creating mentorship slot:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { slotId, userId } = body

    if (!slotId || !userId) {
      return NextResponse.json({ error: "slotId y userId son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Obtener información de la reserva
    const { data: slot, error: fetchErr } = await supabase
      .from("vibecode_mentorship_slots")
      .select("*")
      .eq("id", slotId)
      .single()

    if (fetchErr || !slot) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 })
    }

    if (slot.booked_by_user_id !== userId) {
      return NextResponse.json({ error: "No tienes permiso para cancelar esta reserva" }, { status: 403 })
    }

    // 2. Verificar la regla de 24 horas de anticipación
    const slotTime = new Date(slot.slot_date).getTime()
    const now = Date.now()
    const hoursRemaining = (slotTime - now) / (1000 * 60 * 60)

    if (hoursRemaining < 24) {
      return NextResponse.json(
        { error: "No es posible cancelar la hora con menos de 24 horas de anticipación." },
        { status: 400 }
      )
    }

    // 3. Liberar el slot en Supabase
    const { data: updatedSlot, error: updateErr } = await supabase
      .from("vibecode_mentorship_slots")
      .update({
        is_booked: false,
        booked_by_user_id: null,
        booked_by_name: null,
        booked_by_email: null,
        topic: null,
        status: "available"
      })
      .eq("id", slotId)
      .select()
      .single()

    if (updateErr) {
      console.error("❌ Error canceling mentorship slot:", updateErr)
      return NextResponse.json({ error: "Error al cancelar la reserva" }, { status: 500 })
    }

    // 4. Notificar cancelación vía email si hay correo disponible
    if (slot.booked_by_email) {
      try {
        const slotDateFormatted = new Date(slot.slot_date).toLocaleString("es-CL", {
          timeZone: "America/Santiago",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })

        await sendEmail({
          to: slot.booked_by_email,
          subject: "❌ Cancelación de Mentoría 1-a-1 - Vibecode Lab",
          html: `
            <p>Hola <strong>${slot.booked_by_name || "Alumno"}</strong>,</p>
            <p>Tu sesión de mentoría programada para el <strong>${slotDateFormatted}</strong> ha sido cancelada exitosamente.</p>
            <p>El cupo ha sido liberado en la agenda. Puedes agendar un nuevo horario desde la plataforma cuando lo desees.</p>
          `
        })
      } catch (e) {
        console.warn("⚠️ Warning sending cancellation email:", e)
      }
    }

    return NextResponse.json({ success: true, message: "Reserva cancelada exitosamente", slot: updatedSlot })
  } catch (err: any) {
    console.error("❌ Exception in DELETE mentorship route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { oldSlotId, newSlotId, userId, topic } = body

    if (!oldSlotId || !newSlotId || !userId) {
      return NextResponse.json({ error: "oldSlotId, newSlotId y userId son requeridos" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // 1. Obtener la sesión anterior
    const { data: oldSlot, error: oldErr } = await supabase
      .from("vibecode_mentorship_slots")
      .select("*")
      .eq("id", oldSlotId)
      .single()

    if (oldErr || !oldSlot) {
      return NextResponse.json({ error: "Reserva original no encontrada" }, { status: 404 })
    }

    if (oldSlot.booked_by_user_id !== userId) {
      return NextResponse.json({ error: "No tienes permiso para reagendar esta reserva" }, { status: 403 })
    }

    // 2. Validar regla de 24 horas para la sesión anterior
    const oldSlotTime = new Date(oldSlot.slot_date).getTime()
    const now = Date.now()
    const hoursRemaining = (oldSlotTime - now) / (1000 * 60 * 60)

    if (hoursRemaining < 24) {
      return NextResponse.json(
        { error: "No es posible cambiar la fecha con menos de 24 horas de anticipación." },
        { status: 400 }
      )
    }

    // 3. Obtener y verificar que el nuevo slot esté disponible
    const { data: newSlot, error: newErr } = await supabase
      .from("vibecode_mentorship_slots")
      .select("*")
      .eq("id", newSlotId)
      .single()

    if (newErr || !newSlot) {
      return NextResponse.json({ error: "Nuevo horario no encontrado" }, { status: 404 })
    }

    if (newSlot.is_booked && newSlot.booked_by_user_id !== userId) {
      return NextResponse.json({ error: "El nuevo horario seleccionado ya está ocupado por otro alumno" }, { status: 409 })
    }

    // 4. Crear evento en Google Calendar para la nueva fecha
    let gCalMeetLink = newSlot.meet_link || "https://meet.google.com/jmg-iqxe-eay"
    try {
      const calendarResult = await createCalendarEvent({
        name: oldSlot.booked_by_name || "Alumno Vibecode",
        email: oldSlot.booked_by_email || "",
        service_type: "Mentoría 1-a-1 Vibecode Lab (Reagendada)",
        meeting_time: newSlot.slot_date,
        message: topic || oldSlot.topic || "Sesión de Mentoría Reagendada"
      })
      if (calendarResult?.meetLink) {
        gCalMeetLink = calendarResult.meetLink
      }
    } catch (gcalErr) {
      console.error("⚠️ Exception updating Google Calendar for rescheduled slot:", gcalErr)
    }

    // 5. Liberar el slot antiguo
    await supabase
      .from("vibecode_mentorship_slots")
      .update({
        is_booked: false,
        booked_by_user_id: null,
        booked_by_name: null,
        booked_by_email: null,
        topic: null,
        status: "available"
      })
      .eq("id", oldSlotId)

    // 6. Reservar el nuevo slot
    const { data: updatedNewSlot, error: updateErr } = await supabase
      .from("vibecode_mentorship_slots")
      .update({
        is_booked: true,
        booked_by_user_id: userId,
        booked_by_name: oldSlot.booked_by_name,
        booked_by_email: oldSlot.booked_by_email,
        topic: topic || oldSlot.topic || "Sesión de Mentoría 1-a-1 Reagendada",
        meet_link: gCalMeetLink,
        status: "booked"
      })
      .eq("id", newSlotId)
      .select()
      .single()

    if (updateErr) {
      console.error("❌ Error booking new rescheduled slot:", updateErr)
      return NextResponse.json({ error: "Error al asignar el nuevo horario" }, { status: 500 })
    }

    // 7. Enviar correo de confirmación de reagendamiento
    if (oldSlot.booked_by_email) {
      try {
        const slotDateFormatted = new Date(updatedNewSlot.slot_date).toLocaleString("es-CL", {
          timeZone: "America/Santiago",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })

        await sendEmail({
          to: oldSlot.booked_by_email,
          subject: "📅 Mentoría 1-a-1 Reagendada Exitosamente - Vibecode Lab",
          html: `
            <p>Hola <strong>${oldSlot.booked_by_name || "Alumno"}</strong>,</p>
            <p>Tu sesión de mentoría ha sido cambiada de fecha exitosamente.</p>
            <p><strong>🗓️ Nueva Fecha y Hora:</strong> ${slotDateFormatted} (Hora de Chile)</p>
            <p><strong>📹 Google Meet:</strong> <a href="${gCalMeetLink}">${gCalMeetLink}</a></p>
          `
        })
      } catch (e) {
        console.warn("⚠️ Warning sending reschedule email:", e)
      }
    }

    return NextResponse.json({ success: true, message: "Reunión reagendada exitosamente", slot: updatedNewSlot })
  } catch (err: any) {
    console.error("❌ Exception in PATCH mentorship route:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

