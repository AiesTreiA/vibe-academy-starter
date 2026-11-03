import { google } from "googleapis"

export interface CalendarEventPayload {
  name: string
  email: string
  company?: string
  phone?: string
  service_type?: string
  message?: string
  meeting_time: string
  meeting_time_formatted?: string
}

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn("⚠️ Google Calendar API credentials are not configured in environment variables.")
    return null
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

export async function getGoogleCalendarBusySlots(dateStr: string): Promise<Array<{ start: string; end: string }>> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary"
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) return []

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client })
    
    // Rango del día solicitado (desde las 00:00 hasta las 23:59:59)
    const timeMin = new Date(`${dateStr}T00:00:00-04:00`).toISOString()
    const timeMax = new Date(`${dateStr}T23:59:59-04:00`).toISOString()

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "America/Santiago",
        items: [{ id: calendarId }],
      },
    })

    const busyList = response.data.calendars?.[calendarId]?.busy || []
    return busyList
      .filter((b) => b.start && b.end)
      .map((b) => ({
        start: b.start as string,
        end: b.end as string,
      }))
  } catch (error) {
    console.error("⚠️ Error fetching Google Calendar busy slots:", error)
    return []
  }
}

export async function createCalendarEvent(bookingData: CalendarEventPayload, consultationData?: any) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary"
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) return null

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const startTime = new Date(bookingData.meeting_time)
    // Duración de la reunión: 45 minutos por defecto
    const endTime = new Date(startTime.getTime() + 45 * 60 * 1000)

    const details = [
      `Detalles del Cliente:`,
      `• Nombre: ${bookingData.name}`,
      `• Email: ${bookingData.email}`,
      `• Empresa: ${bookingData.company || "No especificada"}`,
      `• Teléfono: ${bookingData.phone || "No especificado"}`,
      `• Servicio solicitado: ${bookingData.service_type || "Consultoría General"}`,
    ]

    if (bookingData.message) {
      details.push(`\nMensaje:\n"${bookingData.message}"`)
    }

    if (consultationData) {
      details.push(`\n=== RESPUESTAS DE DIAGNÓSTICO ===`)
      
      const formatLabel = (key: string, val: any) => {
        if (val === null || val === undefined || val === "") return null
        
        switch (key) {
          case "industry":
            return `• Industria/Sector: ${val.charAt(0).toUpperCase() + val.slice(1)}`
          case "company_size":
            return `• Tamaño de la Empresa: ${val}`
          case "current_challenge":
            return `• Desafío Principal:\n  "${val}"`
          case "process_type":
            return `• Solución Solicitada: ${val}`
          case "urgency":
            return `• Urgencia: ${val}`
          case "budget":
            return `• Rango de Inversión: ${val}`
          case "expected_roi":
            return `• ROI Esperado: ${val}`
          case "estimated_min_price":
            return `• Cotización Mínima Estimada: $${Number(val).toLocaleString("en-US")} USD`
          case "estimated_max_price":
            return `• Cotización Máxima Estimada: $${Number(val).toLocaleString("en-US")} USD`
          case "estimated_duration":
            return `• Duración Estimada: ${val}`
          default:
            return null
        }
      }

      Object.entries(consultationData).forEach(([key, val]) => {
        const formatted = formatLabel(key, val)
        if (formatted) details.push(formatted)
      })

      if (consultationData.ai_diagnosis) {
        details.push(`\n=== ROADMAP DE MEJORA PROPUESTO POR IA ===`)
        const ai = consultationData.ai_diagnosis
        if (typeof ai === "object" && ai !== null) {
          if (ai.potencial) details.push(`• Potencial: ${ai.potencial}`)
          if (ai.diagnostico) details.push(`• Diagnóstico: ${ai.diagnostico}`)
          if (ai.impacto) details.push(`• Impacto Estimado: ${ai.impacto}`)
          if (ai.solucion) details.push(`• Solución Recomendada:\n  ${ai.solucion}`)
          if (ai.ahorro) details.push(`• Ahorro Estimado: ${ai.ahorro}`)
          if (ai.siguiente_paso) details.push(`• Siguiente Paso:\n  ${ai.siguiente_paso}`)
        }
      }
    }

    const eventDescription = details.join("\n")

    const event = {
      summary: `Consultoría: ${bookingData.service_type || "General"} - ${bookingData.name}`,
      description: eventDescription,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "America/Santiago",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/Santiago",
      },
      attendees: [
        { email: bookingData.email },
        { email: calendarId } // El calendarId suele ser el correo de Javier Mujica
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    }

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all", // Envía invitaciones por correo a los participantes
    })

    console.log("✅ Google Calendar event created successfully:", response.data.htmlLink)
    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === "video")?.uri || null
    }
  } catch (error) {
    console.error("❌ Failed to create Google Calendar event:", error)
    return null
  }
}

export async function updateCalendarEvent(
  eventId: string | null,
  bookingData: CalendarEventPayload,
  consultationData?: any
) {
  if (!eventId) {
    // Si no existía evento previo, crearlo desde cero
    return await createCalendarEvent(bookingData, consultationData)
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary"
  const oauth2Client = getOAuth2Client()
  if (!oauth2Client) return null

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client })
    const startTime = new Date(bookingData.meeting_time)
    const endTime = new Date(startTime.getTime() + 45 * 60 * 1000)

    const response = await calendar.events.patch({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: {
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "America/Santiago",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "America/Santiago",
        },
        summary: `Consultoría: ${bookingData.service_type || "General"} - ${bookingData.name}`,
      },
      sendUpdates: "all",
    })

    console.log("✅ Google Calendar event updated successfully:", response.data.htmlLink)
    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === "video")?.uri || null
    }
  } catch (error: any) {
    console.error("⚠️ Failed to patch Google Calendar event, falling back to creation:", error?.message || error)
    // Fallback: si falla la actualización (por ejemplo, el evento original fue borrado), intentar crear uno nuevo
    return await createCalendarEvent(bookingData, consultationData)
  }
}

