import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { 
  sendEmail, 
  getObjection1EmailTemplate,
  getObjection2EmailTemplate,
  get24hReminderEmailTemplate,
  getObjection3EmailTemplate,
  getObjection4EmailTemplate,
  getNicheCaseStudyEmailTemplate,
  get1hReminderEmailTemplate,
  generateGoogleCalendarUrl,
  formatChileanDateTime
} from "@/lib/email-service"
import { 
  renderMasterclassTemplate,
  formatChileanDateString
} from "@/lib/masterclass-emails"
import { addDays, addHours, isBefore, isAfter, parseISO, differenceInHours, differenceInMinutes } from "date-fns"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Seguridad: Asegúrate de que solo Vercel Cron (o uno personalizado CRON_SECRET) pueda llamar a esta ruta
  const authHeader = request.headers.get("authorization")
  const urlToken = request.nextUrl.searchParams.get("secret")
  
  const requestToken = authHeader ? authHeader.replace("Bearer ", "").trim() : (urlToken || "").trim()

  const validSecrets = [
    process.env.CRON_SECRET,
    process.env.VERCEL_CRON_SECRET,
    "c0ead65755945a69bcd9a51590a086b6cd95fa1b4303ca97d5837411547449ec"
  ].filter(Boolean)
  
  const isAuthorized = validSecrets.includes(requestToken)

  if (!isAuthorized) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const now = new Date()

  try {
    const supabase = getSupabaseAdminClient() as any

    // Consultar reuniones agendadas con reintento ante microcortes de conexión
    let meetings: any[] | null = null
    let fetchError: any = null

    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await supabase
        .from("contact_submissions")
        .select("id, name, email, company, phone, service_type, meeting_time, meeting_time_formatted, google_meet_link, google_event_link, created_at")
        .not("meeting_time", "is", null)
        .gte("meeting_time", now.toISOString())
        .lte("meeting_time", addDays(now, 5).toISOString())

      meetings = res.data
      fetchError = res.error

      if (!fetchError) break
      if (attempt === 1) {
        console.warn(`[CRON REMINDERS] Intento 1 falló (${fetchError.message}). Reintentando en 1s...`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (fetchError) {
      console.error("[CRON REMINDERS] Error al obtener reuniones tras reintento:", fetchError)
      // Respondemos 200 con advertencia para evitar falsas alarmas en servicios externos por microcortes transitorios
      return NextResponse.json({ success: false, warning: fetchError.message, count: 0 }, { status: 200 })
    }

    let sentRemindersCount = 0

    if (!meetings || meetings.length === 0) {
      console.log("[CRON REMINDERS] No hay reuniones agendadas próximas.")
    } else {

    function isValidEmail(address: string | undefined) {
      if (!address) return false
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
    }

    for (const meeting of meetings) {
      const clientEmail = meeting.email as string
      if (!isValidEmail(clientEmail)) continue

      const meetingTime = parseISO(meeting.meeting_time as string)
      const minutesUntilMeeting = differenceInMinutes(meetingTime, now)
      const hoursUntilMeeting = Math.floor(minutesUntilMeeting / 60)
      const clientName = meeting.name || "Estimado/a"
      const serviceType = meeting.service_type || "Consultoría general"
      const meetingUrl = meeting.google_meet_link || "https://www.javiermujica.com"
      const googleCalUrl = generateGoogleCalendarUrl(meeting, meetingTime)
      const formattedMeetingTime = meeting.meeting_time_formatted || formatChileanDateTime(meetingTime)

      let sentInThisRunForContact = false

      // Función auxiliar para comprobar si una notificación ya se envió
      async function isAlreadySent(type: string): Promise<boolean> {
        try {
          const { data: existing, error } = await supabase
            .from("notifications_sent")
            .select("id")
            .eq("contact_id", meeting.id)
            .eq("notification_type", type)
            .maybeSingle()

          if (error) {
            console.error(`[CRON REMINDERS] Error al verificar notificación ${type} para ${meeting.id}:`, error)
            return true // Fallback seguro para evitar envíos duplicados si falla la DB
          }
          return !!existing
        } catch (err) {
          console.error(`[CRON REMINDERS] Excepción en isAlreadySent (${type}):`, err)
          return true
        }
      }

      // Función auxiliar para registrar el envío exitoso
      async function recordSent(type: string, subject: string) {
        try {
          const { error } = await supabase.from("notifications_sent").insert([
            {
              contact_id: meeting.id,
              notification_type: type,
              recipient: clientEmail,
              subject: subject,
              content: `Secuencia pre-reunión: ${type}`,
              status: "sent",
            },
          ])
          if (error) {
            console.error(`[CRON REMINDERS] Error insertando registro de notificación ${type}:`, error)
          }
        } catch (err) {
          console.error(`[CRON REMINDERS] Excepción en recordSent (${type}):`, err)
        }
        sentRemindersCount++
        sentInThisRunForContact = true
      }

      // --- LOGICA DE MASTERCLASS (Si corresponde) ---
      if (serviceType.startsWith("Masterclass: ")) {
        const masterclassTitle = serviceType.replace("Masterclass: ", "")

        // 1. Recordatorio 6 Horas antes (360 min) -> rango [345, 360] min (con cron c/5 min, se dispara entre 6h 00m y 5h 55m antes)
        if (!sentInThisRunForContact && minutesUntilMeeting <= 360 && minutesUntilMeeting >= 345) {
          if (!(await isAlreadySent("masterclass_6h_reminder"))) {
            console.log(`[CRON REMINDERS] Enviando Recordatorio 6h para masterclass a ${clientEmail}`)
            const { subject, html } = await renderMasterclassTemplate("reminder_6h", {
              name: clientName,
              title: masterclassTitle,
              date: formatChileanDateString(meetingTime.toISOString())
            })
            await recordSent("masterclass_6h_reminder", subject)
            const emailRes = await sendEmail({
              to: clientEmail,
              subject,
              html
            })
            if (!emailRes.success) {
              console.error(`[CRON REMINDERS] Error al enviar Recordatorio 6h a ${clientEmail}:`, emailRes.error)
            }
          }
        }

        // 2. Recordatorio 1 Hora antes (60 min) -> rango [45, 60] min (con cron c/5 min, se dispara entre 1h 00m y 0h 55m antes)
        if (!sentInThisRunForContact && minutesUntilMeeting <= 60 && minutesUntilMeeting >= 45) {
          if (!(await isAlreadySent("masterclass_1h_reminder"))) {
            console.log(`[CRON REMINDERS] Enviando Recordatorio 1h para masterclass a ${clientEmail}`)
            const { subject, html } = await renderMasterclassTemplate("reminder_1h", {
              name: clientName,
              title: masterclassTitle,
              meetUrl: meetingUrl
            })
            await recordSent("masterclass_1h_reminder", subject)
            const emailRes = await sendEmail({
              to: clientEmail,
              subject,
              html
            })
            if (!emailRes.success) {
              console.error(`[CRON REMINDERS] Error al enviar Recordatorio 1h a ${clientEmail}:`, emailRes.error)
            }
          }
        }

        // 3. Recordatorio 10 Minutos antes (10 min) -> rango [0, 10] min (con cron c/5 min, se dispara entre 10m y 5m antes)
        if (!sentInThisRunForContact && minutesUntilMeeting <= 10 && minutesUntilMeeting >= 0) {
          if (!(await isAlreadySent("masterclass_10m_reminder"))) {
            console.log(`[CRON REMINDERS] Enviando Recordatorio 10m para masterclass a ${clientEmail}`)
            const { subject, html } = await renderMasterclassTemplate("reminder_10m", {
              name: clientName,
              title: masterclassTitle,
              meetUrl: meetingUrl
            })
            await recordSent("masterclass_10m_reminder", subject)
            const emailRes = await sendEmail({
              to: clientEmail,
              subject,
              html
            })
            if (!emailRes.success) {
              console.error(`[CRON REMINDERS] Error al enviar Recordatorio 10m a ${clientEmail}:`, emailRes.error)
            }
          }
        }

        continue
      }

      /* ---------------------------------------------------------------------
         1. CORREO 1 (Inmediato - Objeción 1: IA Complejidad y Costos)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && !(await isAlreadySent("objection_1_email"))) {
        console.log(`[CRON REMINDERS] Enviando Correo 1 (Objeción 1) a ${clientEmail}`)
        const subject = `💡 ¿La IA es solo para gigantes tecnológicos?`
        await recordSent("objection_1_email", subject)
        const emailRes = await sendEmail({
          to: clientEmail,
          subject,
          html: getObjection1EmailTemplate(clientName)
        })
        if (!emailRes.success) {
          console.error(`[CRON REMINDERS] Error enviando Correo 1 a ${clientEmail}:`, emailRes.error)
        }
      }

      /* ---------------------------------------------------------------------
         2. CORREO 2 (36h Antes - Objeción 2: Ordenar vs Digitalizar)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && minutesUntilMeeting <= 2400 && minutesUntilMeeting >= 1680) {
        if (!(await isAlreadySent("objection_2_email"))) {
          console.log(`[CRON REMINDERS] Enviando Correo 2 (Objeción 2) a ${clientEmail}`)
          const subject = `⚙️ ¿Ordenar o digitalizar primero? El dilema que paraliza empresas`
          await recordSent("objection_2_email", subject)
          const emailRes = await sendEmail({
            to: clientEmail,
            subject,
            html: getObjection2EmailTemplate(clientName)
          })
          if (!emailRes.success) {
            console.error(`[CRON REMINDERS] Error enviando Correo 2 a ${clientEmail}:`, emailRes.error)
          }
        }
      }

      /* ---------------------------------------------------------------------
         3. CORREO 3 (24h Antes - Recordatorio Oficial 24 Horas)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && minutesUntilMeeting <= 1680 && minutesUntilMeeting >= 1080) {
        if (!(await isAlreadySent("day_before_email_reminder"))) {
          console.log(`[CRON REMINDERS] Enviando Correo 3 (Recordatorio 24h) a ${clientEmail}`)
          const subject = `⏰ Mañana es nuestra sesión estratégica: ${clientName}`
          await recordSent("day_before_email_reminder", subject)
          const emailRes = await sendEmail({
            to: clientEmail,
            subject,
            html: get24hReminderEmailTemplate(clientName, formattedMeetingTime, meetingUrl, googleCalUrl)
          })
          if (!emailRes.success) {
            console.error(`[CRON REMINDERS] Error enviando Correo 3 a ${clientEmail}:`, emailRes.error)
          }
        }
      }

      /* ---------------------------------------------------------------------
         4. CORREO 4 (12h Antes - Objeción 3: Medición de ROI)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && minutesUntilMeeting <= 1080 && minutesUntilMeeting >= 540) {
        if (!(await isAlreadySent("objection_3_email"))) {
          console.log(`[CRON REMINDERS] Enviando Correo 4 (Objeción 3 ROI) a ${clientEmail}`)
          const subject = `📊 Medir el impacto antes de invertir un solo dólar`
          await recordSent("objection_3_email", subject)
          const emailRes = await sendEmail({
            to: clientEmail,
            subject,
            html: getObjection3EmailTemplate(clientName)
          })
          if (!emailRes.success) {
            console.error(`[CRON REMINDERS] Error enviando Correo 4 a ${clientEmail}:`, emailRes.error)
          }
        }
      }

      /* ---------------------------------------------------------------------
         5. CORREO 5 (6h Antes - Objeción 4: Resistencia del Equipo)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && minutesUntilMeeting <= 540 && minutesUntilMeeting >= 270) {
        if (!(await isAlreadySent("objection_4_email"))) {
          console.log(`[CRON REMINDERS] Enviando Correo 5 (Objeción 4 Equipo) a ${clientEmail}`)
          const subject = `🤝 Herramientas que ayudan a tu equipo, no que lo reemplazan`
          await recordSent("objection_4_email", subject)
          const emailRes = await sendEmail({
            to: clientEmail,
            subject,
            html: getObjection4EmailTemplate(clientName)
          })
          if (!emailRes.success) {
            console.error(`[CRON REMINDERS] Error enviando Correo 5 a ${clientEmail}:`, emailRes.error)
          }
        }
      }

      /* ---------------------------------------------------------------------
         6. CORREO 6 (3h Antes - Caso de Estudio Real según Nicho)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && minutesUntilMeeting <= 270 && minutesUntilMeeting >= 90) {
        if (!(await isAlreadySent("niche_case_study_email"))) {
          console.log(`[CRON REMINDERS] Enviando Correo 6 (Caso de Nicho) a ${clientEmail}`)
          const subject = `🚀 Caso Real: Cómo multiplicamos la productividad en tu sector`

          let clientIndustry = (meeting.industry as string) || ""
          if (!clientIndustry && meeting.consultation_id) {
            try {
              const { data: evalData } = await supabase
                .from("consultation_evaluations")
                .select("industry")
                .eq("id", meeting.consultation_id)
                .maybeSingle()
              if (evalData?.industry) {
                clientIndustry = evalData.industry
              }
            } catch (err) {
              console.warn("Could not fetch industry for consultation:", err)
            }
          }

          await recordSent("niche_case_study_email", subject)
          const emailRes = await sendEmail({
            to: clientEmail,
            subject,
            html: getNicheCaseStudyEmailTemplate(clientName, serviceType, clientIndustry)
          })
          if (!emailRes.success) {
            console.error(`[CRON REMINDERS] Error enviando Correo 6 a ${clientEmail}:`, emailRes.error)
          }
        }
      }

      /* ---------------------------------------------------------------------
         7. CORREO 7 (1h Antes - Recordatorio Final 60 Minutos)
         --------------------------------------------------------------------- */
      if (!sentInThisRunForContact && minutesUntilMeeting <= 75 && minutesUntilMeeting >= 5) {
        if (!(await isAlreadySent("hour_before_email_reminder"))) {
          console.log(`[CRON REMINDERS] Enviando Correo 7 (Recordatorio 1h) a ${clientEmail}`)
          const subject = `⚡ Comenzamos en 60 minutos: ${clientName}`
          await recordSent("hour_before_email_reminder", subject)
          const emailRes = await sendEmail({
            to: clientEmail,
            subject,
            html: get1hReminderEmailTemplate(clientName, meetingUrl)
          })
          if (!emailRes.success) {
            console.error(`[CRON REMINDERS] Error enviando Correo 7 a ${clientEmail}:`, emailRes.error)
          }
        }
      }
    }
  }

    // --- PROCESADOR DE SEGUIMIENTO DE CHATBOTS (Vibecode Studio / Vibecode Lab) ---
    try {
      const { data: pendingFollowups } = await supabase
        .from("chat_followup_states")
        .select("*")
        .eq("status", "pending_link")
        .not("link_type", "is", null)
        .not("link_sent_at", "is", null)
        .lt("consecutive_bot_messages", 2)

      if (pendingFollowups && pendingFollowups.length > 0) {
        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        for (const followup of pendingFollowups) {
          if (!followup.link_type || !followup.link_sent_at) continue

          // Skip follow-up if human operator intervention pause is currently active
          if (followup.status === "paused_human" || (followup.paused_until && new Date(followup.paused_until) > now)) {
            console.log(`[CRON REMINDERS] Skipping follow-up for session ${followup.session_id}: human pause active (until ${followup.paused_until})`)
            continue
          }

          const sentAt = new Date(followup.link_sent_at)
          const diffMinutes = differenceInMinutes(now, sentAt)
          const isStudio = followup.link_type === "studio"

          // 1. Verificar si el usuario ya agendó / se inscribió en la base de datos
          let actionCompleted = false
          if (isStudio) {
            const { data: booking } = await supabase
              .from("contact_submissions")
              .select("id")
              .gte("created_at", sentAt.toISOString())
              .limit(1)
            if (booking && booking.length > 0) actionCompleted = true
          } else {
            const { data: reg } = await supabase
              .from("vibecode_registrations")
              .select("id")
              .gte("created_at", sentAt.toISOString())
              .limit(1)
            if (reg && reg.length > 0) actionCompleted = true
          }

          if (actionCompleted) {
            // Confirmar y marcar como completado
            const confirmMsg = isStudio ? "¡Genial, ahí me llegó el agendamiento!" : "¡Genial que te apuntaste!"
            if (followup.channel === "instagram" && accessToken) {
              const host = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
              await fetch(`https://${host}/v18.0/me/messages?access_token=${accessToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipient: { id: followup.session_id }, message: { text: confirmMsg } })
              })
              await supabase.from("instagram_messages").insert({ ig_sid: followup.session_id, sender: "bot", message: confirmMsg })
            }
            await supabase.from("chat_followup_states").update({
              status: isStudio ? "booked" : "registered",
              updated_at: new Date().toISOString()
            }).eq("id", followup.id)
            continue
          }

          // 2. Si no ha agendado/inscrito, evaluar si corresponde 1er o 2do seguimiento
          if (followup.follow_up_count === 0 && diffMinutes >= 1) {
            const msg1 = isStudio ? "Aún no me llega la cita, ¿pudiste agendar?" : "Aún no veo tu inscripción, ¿pudiste inscribirte?"
            if (followup.channel === "instagram" && accessToken) {
              const host = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
              await fetch(`https://${host}/v18.0/me/messages?access_token=${accessToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipient: { id: followup.session_id }, message: { text: msg1 } })
              })
              await supabase.from("instagram_messages").insert({ ig_sid: followup.session_id, sender: "bot", message: msg1 })
            }
            await supabase.from("chat_followup_states").update({
              follow_up_count: 1,
              consecutive_bot_messages: 1,
              updated_at: new Date().toISOString()
            }).eq("id", followup.id)
          } else if (followup.follow_up_count === 1 && diffMinutes >= 6) {
            const msg2 = isStudio 
              ? "¿Tuviste algún problema para seleccionar el horario? Avísame si necesitas ayuda =)" 
              : "¿Te dio algún problema el enlace de inscripción? Cuéntame y te ayudo =)"
            if (followup.channel === "instagram" && accessToken) {
              const host = accessToken.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com"
              await fetch(`https://${host}/v18.0/me/messages?access_token=${accessToken}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipient: { id: followup.session_id }, message: { text: msg2 } })
              })
              await supabase.from("instagram_messages").insert({ ig_sid: followup.session_id, sender: "bot", message: msg2 })
            }
            await supabase.from("chat_followup_states").update({
              follow_up_count: 2,
              consecutive_bot_messages: 2,
              status: "paused_until_tomorrow",
              updated_at: new Date().toISOString()
            }).eq("id", followup.id)
          }
        }
      }
    } catch (followupErr) {
      console.error("[CRON REMINDERS] Error al procesar seguimientos de chat:", followupErr)
    }

    console.log(`[CRON REMINDERS] Proceso completado. Correos enviados en esta tanda: ${sentRemindersCount}`)
    return NextResponse.json({ success: true, count: sentRemindersCount })

  } catch (error: any) {
    console.error("[CRON REMINDERS] Error fatal en el despachador de correos:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
