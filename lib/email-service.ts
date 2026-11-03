import { Resend } from "resend"
import { format } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formatea una fecha en español de Chile en la zona horaria America/Santiago.
 * Ejemplo: "Jueves, 21 de mayo de 2026 a las 10:00"
 */
export function formatChileanDateTime(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const parts = formatter.formatToParts(date)
    let weekday = ""
    let day = ""
    let month = ""
    let year = ""
    let hour = ""
    let minute = ""

    for (const part of parts) {
      if (part.type === "weekday") weekday = part.value
      else if (part.type === "day") day = part.value
      else if (part.type === "month") month = part.value
      else if (part.type === "year") year = part.value
      else if (part.type === "hour") hour = part.value
      else if (part.type === "minute") minute = part.value
    }

    const capitalizedWeekday = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : ""
    return `${capitalizedWeekday}, ${day} de ${month} de ${year} a las ${hour}:${minute}`
  } catch (error) {
    console.error("Error formatting Chilean date:", error)
    return date.toLocaleString("es-CL", { timeZone: "America/Santiago" })
  }
}

/**
 * Formatea la hora de una fecha en la zona horaria America/Santiago.
 * Ejemplo: "10:00"
 */
export function formatChileanTime(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    return formatter.format(date)
  } catch (error) {
    console.error("Error formatting Chilean time:", error)
    return date.toLocaleTimeString("es-CL", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit", hour12: false })
  }
}

let resendSingleton: Resend | null = null

function getResend() {
  if (resendSingleton) return resendSingleton
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error("RESEND_API_KEY ausente. Añádela en el dashboard de variables de entorno.")
  }
  resendSingleton = new Resend(key)
  return resendSingleton
}

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
  bcc?: string
  attachments?: Array<{
    filename: string
    content?: Buffer | string
    path?: string
  }>
}

export async function sendEmail({
  to,
  subject,
  html,
  bcc,
  attachments,
  from = process.env.EMAIL_FROM || "Vibecode Lab <onboarding@resend.dev>",
}: EmailData) {
  try {
    const resend = getResend()
    const emailPayload: any = {
      from,
      to,
      bcc,
      subject,
      html,
    }
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments
    }
    const { data, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email service error:", error)
    return { success: false, error }
  }
}

/**
 * Genera un enlace estático para agregar un evento a Google Calendar
 */
export function generateGoogleCalendarUrl(contactData: any, meetingTime?: Date): string {
  if (!meetingTime) return ""
  try {
    const start = new Date(meetingTime)
    const end = new Date(start.getTime() + 45 * 60 * 1000) // 45 minutos de reunión

    const formatUTC = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const dates = `${formatUTC(start)}/${formatUTC(end)}`
    const title = encodeURIComponent("Reunión de Consultoría - Javier Mujica")
    
    let detailsText = `Hola, esta es tu reunión de consultoría agendada con Javier Mujica.\n\n`
    if (contactData.google_meet_link) {
      detailsText += `Enlace de Videollamada (Google Meet): ${contactData.google_meet_link}\n\n`
    }
    detailsText += `Servicio: ${contactData.service_type || "Consultoría general"}`
    
    const details = encodeURIComponent(detailsText)
    const location = encodeURIComponent(contactData.google_meet_link || "Google Meet")

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
  } catch (error) {
    console.error("Error generating static Google Calendar URL:", error)
    return ""
  }
}

// Template para notificación al admin
export function getAdminNotificationTemplate(contactData: any, consultationData?: any, meetingTime?: Date) {
  // Usar el texto preformateado enviado desde el cliente (ya en hora local correcta)
  // Si no existe (registros antiguos), formatear con Intl como fallback
  const formattedMeetingTime = contactData.meeting_time_formatted
    || (meetingTime ? formatChileanDateTime(meetingTime) : "No agendada")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva Consulta - ${contactData.company || contactData.name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: #090d16; border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
        .label { font-weight: bold; color: #9ca3af; }
        .value { margin-left: 10px; color: #ffffff; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .pricing { background-color: #064e3b; border: 1px solid #047857; color: #ecfdf5; padding: 15px; border-radius: 6px; }
        h2, h3, h4 { color: #10b981; margin-top: 0; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 12px;">
            <img src="https://www.javiermujica.com/images/logo-completo.png" alt="Javier Mujica" width="190" height="190" style="width: 190px; height: 190px; display: inline-block; outline: none; border: none; text-decoration: none;" />
          </div>
          <h1 style="margin: 5px 0 2px 0; font-size: 22px; color: #ffffff !important; text-align: center;">🎯 Nueva Consulta de Cliente</h1>
          <p style="margin: 0; color: #a3b8cc; font-size: 14px;">Se ha recibido una nueva solicitud de consultoría</p>
        </div>
        <div class="content">
          <div class="section">
            <h2>📋 Información de Contacto</h2>
            <p><span class="label">Nombre:</span><span class="value">${contactData.name}</span></p>
            <p><span class="label">Email:</span><span class="value">${contactData.email}</span></p>
            <p><span class="label">Empresa:</span><span class="value">${contactData.company || "No especificada"}</span></p>
            <p><span class="label">Teléfono:</span><span class="value">${contactData.phone || "No especificado"}</span></p>
            <p><span class="label">Servicio:</span><span class="value">${contactData.service_type || "No especificado"}</span></p>
            <p><span class="label">Reunión Agendada:</span><span class="value">${formattedMeetingTime}</span></p>
            ${
              contactData.google_meet_link
                ? `<p><span class="label">Google Meet:</span><span class="value"><a href="${contactData.google_meet_link}" target="_blank">${contactData.google_meet_link}</a></span></p>`
                : ""
            }
          </div>

          ${
            contactData.message
              ? `
          <div class="section">
            <h2>💬 Mensaje</h2>
            <div class="highlight">
              ${contactData.message}
            </div>
          </div>
          `
              : ""
          }

          ${
            consultationData
              ? `
          <div class="section">
            <h2>🔍 Evaluación Previa</h2>
            <p><span class="label">Industria:</span><span class="value">${consultationData.industry}</span></p>
            <p><span class="label">Tamaño:</span><span class="value">${consultationData.company_size}</span></p>
            <p><span class="label">Tipo de proceso:</span><span class="value">${consultationData.process_type}</span></p>
            <p><span class="label">Urgencia:</span><span class="value">${consultationData.urgency || "No especificada"}</span></p>
            
            <div class="highlight">
              <h3>Desafío Principal:</h3>
              <p>${consultationData.current_challenge}</p>
            </div>

            ${              consultationData.ai_diagnosis
                ? `
              <div class="section">
                <h2>🤖 Roadmap Propuesto (IA)</h2>
                <p><strong>Potencial:</strong> ${consultationData.ai_diagnosis.potencial || "N/A"}</p>
                <p><strong>Impacto:</strong> ${consultationData.ai_diagnosis.impacto || "N/A"}</p>
                <p><strong>Solución:</strong> ${consultationData.ai_diagnosis.solucion || "N/A"}</p>
                <p><strong>Ahorrará:</strong> ${consultationData.ai_diagnosis.ahorro || "N/A"}</p>
                <p><strong>Siguiente paso:</strong> ${consultationData.ai_diagnosis.siguiente_paso || "N/A"}</p>
              </div>
              `
                : ""
            }

            ${
              consultationData?.ai_diagnosis?.propuesta_comercial?.usar_propuesta_personalizada
                ? `
                <div class="pricing" style="background-color: #0c1b33; border: 1px solid #1d4ed8; color: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 10px;">
                  <h3 style="margin-top:0; color:#3b82f6; font-size:16px;">💎 Propuesta Comercial: ${consultationData.ai_diagnosis.propuesta_comercial.titulo}</h3>
                  <p style="font-size:14px; margin-bottom:10px;">${consultationData.ai_diagnosis.propuesta_comercial.descripcion}</p>
                  <table style="width:100%; border-collapse:collapse; font-size:14px; color:#d1d5db;">
                    ${
                      consultationData.ai_diagnosis.propuesta_comercial.items?.map((item: any) => `
                        <tr style="border-bottom: 1px solid #1e293b;">
                          <td style="padding:6px 0;">${item.concepto}</td>
                          <td style="padding:6px 0; text-align:right; font-weight:bold; color:#ffffff;">${item.monto}</td>
                        </tr>
                      `).join("")
                    }
                  </table>
                </div>
                `
                : consultationData?.estimated_min_price
                  ? `
                  <div class="pricing">
                    <h3>💰 Cotización Estimada</h3>
                    <p><strong>Rango:</strong> $${consultationData.estimated_min_price?.toLocaleString()} - $${consultationData.estimated_max_price?.toLocaleString()} USD</p>
                    <p><strong>Duración:</strong> ${consultationData.estimated_duration}</p>
                  </div>
                  `
                  : ""
            }
          </div>
          `
              : ""
          }

          <div class="section">
            <h2>⏰ Próximos Pasos (Interno)</h2>
            <p>1. Revisar la información del cliente y la evaluación previa.</p>
            <p>2. Preparar la reunión agendada para el ${formattedMeetingTime}.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para confirmación al cliente
export function getClientConfirmationTemplate(contactData: any, meetingTime?: Date, consultationData?: any) {
  // Usar el texto preformateado enviado desde el cliente (ya en hora local correcta)
  const formattedMeetingTime = contactData.meeting_time_formatted
    || (meetingTime ? formatChileanDateTime(meetingTime) : "Por confirmar")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Reunión - Javier Mujica Consultoría</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: #090d16; border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
        .label { font-weight: bold; color: #9ca3af; }
        .value { margin-left: 10px; color: #ffffff; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .pricing { background-color: #064e3b; border: 1px solid #047857; color: #ecfdf5; padding: 15px; border-radius: 6px; }
        .cta { background-color: #111827; border: 1px solid #1e293b; color: white; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        h2, h3, h4 { color: #10b981; margin-top: 0; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 12px;">
            <img src="https://www.javiermujica.com/images/logo-completo.png" alt="Javier Mujica" width="190" height="190" style="width: 190px; height: 190px; display: inline-block; outline: none; border: none; text-decoration: none;" />
          </div>
          <h1 style="margin: 5px 0 2px 0; font-size: 22px; color: #ffffff !important; text-align: center;">✅ ¡Consulta Recibida!</h1>
          <p style="margin: 0; color: #a3b8cc; font-size: 14px;">Gracias por contactar a Javier Mujica Consultoría</p>
        </div>
        <div class="content">
          <p>Hola <strong>${contactData.name}</strong>,</p>
          
          <p>Hemos recibido tu solicitud de consultoría para <strong>${contactData.company || "tu empresa"}</strong>.</p>

          <div class="highlight">
            <h3>📋 Detalles de tu Solicitud</h3>
            <p><strong>Servicio solicitado:</strong> ${contactData.service_type || "Consultoría general"}</p>
            <p><strong>Email de contacto:</strong> ${contactData.email}</p>
            ${contactData.phone ? `<p><strong>Teléfono:</strong> ${contactData.phone}</p>` : ""}
            <p><span class="label">Reunión:</span> ${formattedMeetingTime}</p>
          </div>

          ${(() => {
            const calendarUrl = contactData.google_event_link || generateGoogleCalendarUrl(contactData, meetingTime);
            return `
            <div style="background-color: #0c1524; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              ${
                contactData.google_meet_link
                  ? `
                  <h3 style="color: #34d399; margin-top: 0; font-size: 17px; font-weight: bold; margin-bottom: 8px;">🎥 Videollamada por Google Meet</h3>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #a3b8cc;">Únete a la reunión directamente en el día y hora agendados haciendo clic aquí:</p>
                  <div style="margin-top: 10px;">
                    <a href="${contactData.google_meet_link}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 12px; margin-bottom: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(16,185,129,0.2);" target="_blank">Entrar a la Videollamada</a>
                    ${
                      calendarUrl
                        ? `<a href="${calendarUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(59,130,246,0.2);" target="_blank">📅 Agregar a mi Calendario</a>`
                        : ""
                    }
                  </div>
                  `
                  : `
                  <h3 style="color: #10b981; margin-top: 0; font-size: 17px; font-weight: bold; margin-bottom: 8px;">📅 Reunión Agendada</h3>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #a3b8cc;">Tu reunión está confirmada. Agrégala a tu agenda para no olvidarla:</p>
                  <div style="margin-top: 10px;">
                    ${
                      calendarUrl
                        ? `<a href="${calendarUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(59,130,246,0.2);" target="_blank">📅 Agregar a mi Calendario</a>`
                        : ""
                    }
                  </div>
                  `
              }
            </div>
            `;
          })()}

          ${
            consultationData?.ai_diagnosis || consultationData?.estimated_min_price
              ? `
          <div class="section">
            <h3>🧩 Plan y Presupuesto Estimados</h3>
            ${consultationData?.ai_diagnosis ? `
            <p><strong>Potencial:</strong> ${consultationData.ai_diagnosis.potencial}</p>
            <p><strong>Ahorro/Impacto:</strong> ${consultationData.ai_diagnosis.ahorro || consultationData.ai_diagnosis.impacto || "N/A"}</p>
            <p><strong>Solución propuesta:</strong> ${consultationData.ai_diagnosis.solucion}</p>
            ` : ""}
            
            ${
              consultationData?.ai_diagnosis?.propuesta_comercial?.usar_propuesta_personalizada
                ? `
                <div class="pricing" style="background-color: #0c1b33; border: 1px solid #1d4ed8; color: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 10px;">
                  <h4 style="margin-top:0; color:#3b82f6; font-size:16px;">💎 Propuesta Comercial: ${consultationData.ai_diagnosis.propuesta_comercial.titulo}</h4>
                  <p style="font-size:14px; margin-bottom:10px;">${consultationData.ai_diagnosis.propuesta_comercial.descripcion}</p>
                  <table style="width:100%; border-collapse:collapse; font-size:14px; color:#d1d5db;">
                    ${
                      consultationData.ai_diagnosis.propuesta_comercial.items?.map((item: any) => `
                        <tr style="border-bottom: 1px solid #1e293b;">
                          <td style="padding:6px 0;">${item.concepto}</td>
                          <td style="padding:6px 0; text-align:right; font-weight:bold; color:#ffffff;">${item.monto}</td>
                        </tr>
                      `).join("")
                    }
                  </table>
                </div>
                `
                : consultationData?.estimated_min_price
                  ? `
                  <div class="pricing">
                    <h3>💰 Cotización Estimada</h3>
                    <p><strong>Rango:</strong> $${consultationData.estimated_min_price?.toLocaleString()} - $${consultationData.estimated_max_price?.toLocaleString()} USD</p>
                    <p><strong>Duración estimada:</strong> ${consultationData.estimated_duration}</p>
                  </div>
                  `
                  : ""
            }
          </div>
          `
              : ""
          }

          <div class="section">
            <h3>🚀 Próximos Pasos</h3>
            <p>1. <strong>Confirmación:</strong> Ya recibiste este correo con los detalles.</p>
            <p>2. <strong>Recordatorios:</strong> Te enviaremos recordatorios un día y una hora antes de la reunión.</p>
            <p>3. <strong>Preparación:</strong> Te recomendamos tener a mano cualquier pregunta o detalle adicional sobre tu desafío operativo.</p>
          </div>

          ${
            consultationData?.ai_diagnosis
              ? `
          <div class="section">
            <h2>📈 Roadmap Propuesto por IA</h2>
            <div class="highlight">
              <p><strong>Potencial:</strong> ${consultationData.ai_diagnosis.potencial || "N/A"}</p>
              <p><strong>Diagnóstico:</strong> ${consultationData.ai_diagnosis.diagnostico || "N/A"}</p>
              <p><strong>Impacto:</strong> ${consultationData.ai_diagnosis.impacto || "N/A"}</p>
              <p><strong>Solución:</strong> ${consultationData.ai_diagnosis.solucion || "N/A"}</p>
              <p><strong>Ahorrará:</strong> ${consultationData.ai_diagnosis.ahorro || "N/A"}</p>
              <p><strong>Siguiente paso:</strong> ${consultationData.ai_diagnosis.siguiente_paso || "N/A"}</p>
            </div>
          </div>
          `
              : ""
          }

          <div class="cta">
            <h3>📞 ¿Necesitas reagendar o tienes preguntas?</h3>
            <p>Puedes escribirnos directamente a WhatsApp o llamarnos</p>
            <p><strong>WhatsApp:</strong> +56930756467</p>
            <p><strong>Email:</strong> <a href="mailto:hola@javiermujica.com" style="color: #ffffff; text-decoration: underline;">hola@javiermujica.com</a></p>
          </div>

          <p>Estamos comprometidos en ayudarte a alcanzar la excelencia operativa que tu empresa merece.</p>
          
          <p style="margin-bottom: 15px;">Saludos cordiales,</p>
          <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
            <tr>
              <td style="padding-right: 12px; vertical-align: middle;">
                <img src="https://www.javiermujica.com/images/logo-isotipo.png" alt="Logo" width="32" height="56" style="width: 32px; height: 56px; display: block; outline: none; border: none; text-decoration: none;" />
              </td>
              <td style="border-left: 1px solid #1e293b; padding-left: 12px; vertical-align: middle;">
                <strong style="font-size: 15px; color: #ffffff; display: block; line-height: 1.2;">Javier Mujica</strong>
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-top: 2px; line-height: 1.2;">Consultoría en IA Aplicada y Mejora Continua</span>
                <span style="font-size: 11px; color: #3b82f6; display: block; margin-top: 2px;"><a href="https://www.javiermujica.com" style="color: #3b82f6; text-decoration: none;">www.javiermujica.com</a></span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Javier Mujica Consultoría - Optimización de Procesos y Automatización</p>
          <p>Este email fue enviado porque agendaste una reunión en nuestro sitio web.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para notificación de reagendamiento al cliente
export function getClientRescheduleTemplate(
  contactData: any,
  newMeetingTime: Date,
  previousMeetingTime?: Date,
  note?: string
) {
  const formattedNewTime = contactData.meeting_time_formatted || formatChileanDateTime(newMeetingTime)
  const formattedPrevTime = previousMeetingTime ? formatChileanDateTime(previousMeetingTime) : null
  const calendarUrl = contactData.google_event_link || generateGoogleCalendarUrl(contactData, newMeetingTime)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cambio de Horario de Reunión - Javier Mujica Consultoría</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: #090d16; border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
        .highlight-new { background-color: #064e3b; border: 1px solid #047857; color: #ecfdf5; padding: 18px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .prev-time { color: #9ca3af; text-decoration: line-through; margin-bottom: 8px; font-size: 13px; text-align: center; }
        .new-time { font-size: 18px; font-weight: bold; color: #34d399; margin: 5px 0; }
        .note-box { background-color: #1e1b4b; border: 1px solid #4338ca; color: #e0e7ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .cta-btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px; margin-bottom: 8px; font-size: 14px; }
        .cal-btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 8px; font-size: 14px; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 12px;">
            <img src="https://www.javiermujica.com/images/logo-completo.png" alt="Javier Mujica" width="190" height="190" style="width: 190px; height: 190px; display: inline-block; outline: none; border: none;" />
          </div>
          <h1 style="margin: 5px 0 2px 0; font-size: 22px; color: #ffffff !important; text-align: center;">📅 Cambio de Horario de Reunión</h1>
          <p style="margin: 0; color: #a3b8cc; font-size: 14px;">Tu reunión de consultoría ha sido reprogramada</p>
        </div>
        <div class="content">
          <p>Hola <strong>${contactData.name}</strong>,</p>
          <p>Te notificamos que la hora de tu reunión de consultoría con <strong>Javier Mujica</strong> ha sido modificada.</p>

          ${formattedPrevTime ? `<div class="prev-time">Horario anterior: ${formattedPrevTime}</div>` : ""}

          <div class="highlight-new">
            <h3 style="margin-top: 0; color: #a7f3d0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">NUEVO HORARIO CONFIRMADO</h3>
            <div class="new-time">🗓️ ${formattedNewTime}</div>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #6ee7b7;">Hora de Chile (America/Santiago)</p>
          </div>

          ${note ? `
            <div class="note-box">
              <strong style="color: #818cf8; font-size: 13px; text-transform: uppercase;">Mensaje de Javier:</strong>
              <p style="margin: 5px 0 0 0; font-style: italic;">"${note}"</p>
            </div>
          ` : ""}

          <div style="background-color: #0c1524; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #34d399; margin-top: 0; font-size: 16px;">🎥 Acceso a la Videollamada</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #a3b8cc;">Utiliza este enlace para ingresar a la reunión en el nuevo horario:</p>
            <div>
              ${contactData.google_meet_link ? `
                <a href="${contactData.google_meet_link}" class="cta-btn" target="_blank">Entrar a Google Meet</a>
              ` : ""}
              ${calendarUrl ? `
                <a href="${calendarUrl}" class="cal-btn" target="_blank">📅 Agregar a mi Calendario</a>
              ` : ""}
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 13px; color: #9ca3af;">
            <p>Si tienes alguna duda o deseas ajustar nuevamente el horario, puedes responder directamente a este correo o contactarnos al WhatsApp <strong>+56930756467</strong>.</p>
            <p style="margin-top: 15px; color: #ffffff;">Saludos cordiales,<br/><strong>Javier Mujica</strong><br/>Consultor en Rediseño de Procesos & IA</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Nueva plantilla para recordatorios de reunión
export function getMeetingReminderTemplate(
  contactData: any,
  meetingTime: Date,
  reminderType: "day_before" | "hour_before",
) {
  // Usar el texto preformateado guardado en la BD (ya en hora local del cliente)
  // Si no existe (registros antiguos), formatear con Intl como fallback
  const formattedDate = (contactData as any).meeting_time_formatted || formatChileanDateTime(meetingTime)
  const subjectPrefix =
    reminderType === "day_before" ? "Recordatorio: Tu Reunión Mañana" : "Recordatorio: Tu Reunión en 1 Hora"
  const introMessage =
    reminderType === "day_before"
      ? `Solo para recordarte que tu reunión con Javier Mujica está programada para <strong>mañana, ${formattedDate}</strong>.`
      : `Solo para recordarte que tu reunión con Javier Mujica está programada para <strong>hoy, en 1 hora, a las ${formatChileanTime(meetingTime)}</strong>.`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subjectPrefix} - Javier Mujica Consultoría</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: #090d16; border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
        .highlight { background: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .pricing { background-color: #064e3b; border: 1px solid #047857; color: #ecfdf5; padding: 15px; border-radius: 6px; }
        .cta { background-color: #111827; border: 1px solid #1e293b; color: white; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        h2, h3, h4 { color: #10b981; margin-top: 0; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 12px;">
            <img src="https://www.javiermujica.com/images/logo-completo.png" alt="Javier Mujica" width="190" height="190" style="width: 190px; height: 190px; display: inline-block; outline: none; border: none; text-decoration: none;" />
          </div>
          <h1 style="margin: 5px 0 2px 0; font-size: 22px; color: #ffffff !important; text-align: center;">🔔 Recordatorio de Reunión</h1>
          <p style="margin: 0; color: #a3b8cc; font-size: 14px;">¡Estamos listos para ayudarte a optimizar tus procesos!</p>
        </div>
        <div class="content">
          <p>Hola <strong>${contactData.name}</strong>,</p>
          
          <p>${introMessage}</p>

          <div class="highlight">
            <h3>🗓️ Detalles de tu Reunión</h3>
            <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
            <p><strong>Empresa:</strong> ${contactData.company || "No especificada"}</p>
            <p><strong>Email de contacto:</strong> ${contactData.email}</p>
            ${contactData.phone ? `<p><strong>Teléfono:</strong> ${contactData.phone}</p>` : ""}
          </div>

          ${(() => {
            const calendarUrl = (contactData as any).google_event_link || generateGoogleCalendarUrl(contactData, meetingTime);
            return `
            <div style="background-color: #0c1524; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              ${
                contactData.google_meet_link
                  ? `
                  <h3 style="color: #34d399; margin-top: 0; font-size: 17px; font-weight: bold; margin-bottom: 8px;">🎥 Videollamada por Google Meet</h3>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #a3b8cc;">Únete a la reunión haciendo clic aquí:</p>
                  <div style="margin-top: 10px;">
                    <a href="${contactData.google_meet_link}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 12px; margin-bottom: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(16,185,129,0.2);" target="_blank">Entrar a la Videollamada</a>
                    ${
                      calendarUrl
                        ? `<a href="${calendarUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(59,130,246,0.2);" target="_blank">📅 Agregar a mi Calendario</a>`
                        : ""
                    }
                  </div>
                  `
                  : `
                  <h3 style="color: #10b981; margin-top: 0; font-size: 17px; font-weight: bold; margin-bottom: 8px;">📅 Reunión Agendada</h3>
                  <p style="margin: 0 0 16px 0; font-size: 14px; color: #a3b8cc;">No olvides agregar la reunión a tu agenda:</p>
                  <div style="margin-top: 10px;">
                    ${
                      calendarUrl
                        ? `<a href="${calendarUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 8px; font-size: 14px; box-shadow: 0 2px 4px rgba(59,130,246,0.2);" target="_blank">📅 Agregar a mi Calendario</a>`
                        : ""
                    }
                  </div>
                  `
              }
            </div>
            `;
          })()}

          <div class="section">
            <h3>Preparación para la Reunión</h3>
            <p>Te recomendamos tener a mano cualquier pregunta o detalle adicional sobre tu desafío operativo para que podamos aprovechar al máximo nuestro tiempo.</p>
          </div>

          <div class="cta">
            <h3>¿Necesitas reagendar o cancelar?</h3>
            <p>Por favor, contáctanos lo antes posible si necesitas hacer algún cambio.</p>
            <p><strong>Email:</strong> <a href="mailto:hola@javiermujica.com" style="color: #ffffff; text-decoration: underline;">hola@javiermujica.com</a></p>
          </div>

          <p>¡Esperamos verte pronto!</p>
          
          <p style="margin-bottom: 15px;">Saludos cordiales,</p>
          <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
            <tr>
              <td style="padding-right: 12px; vertical-align: middle;">
                <img src="https://www.javiermujica.com/images/logo-isotipo.png" alt="Logo" width="32" height="56" style="width: 32px; height: 56px; display: block; outline: none; border: none; text-decoration: none;" />
              </td>
              <td style="border-left: 1px solid #1e293b; padding-left: 12px; vertical-align: middle;">
                <strong style="font-size: 15px; color: #ffffff; display: block; line-height: 1.2;">Javier Mujica</strong>
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-top: 2px; line-height: 1.2;">Consultoría en IA Aplicada y Mejora Continua</span>
                <span style="font-size: 11px; color: #3b82f6; display: block; margin-top: 2px;"><a href="https://www.javiermujica.com" style="color: #3b82f6; text-decoration: none;">www.javiermujica.com</a></span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Javier Mujica Consultoría - Optimización de Procesos y Automatización</p>
          <p>Este email fue enviado como recordatorio de tu próxima reunión.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para la entrega de la Plantilla Kanban Neuro-Friendly
export function getTrelloResourceTemplate(name: string) {
  const trelloLink = "https://trello.com/b/dm036rnt/kanban-tda-friendly"
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tu Plantilla Kanban Neuro-Friendly - Javier Mujica Consultoría</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: #090d16; border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .cta-container { text-align: center; margin: 30px 0; }
        .cta-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px; border: 1px solid #059669; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        h2, h3 { color: #10b981; margin-top: 0; }
        a { color: #3b82f6; text-decoration: none; }
        ul { padding-left: 20px; margin-top: 5px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 12px;">
            <img src="https://www.javiermujica.com/images/logo-completo.png" alt="Javier Mujica" width="190" height="190" style="width: 190px; height: 190px; display: inline-block; outline: none; border: none; text-decoration: none;" />
          </div>
          <h1 style="margin: 5px 0 2px 0; font-size: 22px; color: #ffffff !important; text-align: center;">🎁 ¡Aquí tienes tu Recurso Gratuito!</h1>
          <p style="margin: 0; color: #a3b8cc; font-size: 14px;">Plantilla Kanban Neuro-Friendly para estructurar tus tareas</p>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>¡Gracias por registrarte en mi sitio web! Tal como lo prometí, aquí tienes acceso directo a la <strong>Plantilla Kanban Neuro-Friendly</strong>.</p>
          
          <p>Esta plantilla está diseñada con una estructura visual ultra simplificada para reducir el agobio mental y ayudarte a mantener el foco diario, adaptándose de forma flexible a tu propio ritmo.</p>

          <div class="cta-container">
            <a href="${trelloLink}" class="cta-button" target="_blank">Obtener Plantilla Kanban Neuro-Friendly</a>
          </div>

          <div class="highlight">
            <h3>💡 ¿Cómo copiar el tablero en tu Trello?</h3>
            <ol style="padding-left: 20px; margin: 0; color: #d1d5db;">
              <li style="margin-bottom: 6px;">Haz clic en el botón de arriba para abrir el tablero en Trello.</li>
              <li style="margin-bottom: 6px;">Si no has iniciado sesión, hazlo con tu cuenta de Trello (o crea una gratis en segundos).</li>
              <li style="margin-bottom: 6px;">En la barra superior del tablero, haz clic en el botón de los tres puntos (...) <strong>"Mostrar menú"</strong>.</li>
              <li style="margin-bottom: 6px;">Selecciona <strong>"... Más"</strong> y luego haz clic en <strong>"Copiar tablero"</strong>.</li>
              <li style="margin-bottom: 6px;">Dale un título (ej: <i>"Mi Kanban Diario"</i>) y guárdalo en tu espacio de trabajo personal. ¡Listo! Ya es tuyo para editarlo.</li>
            </ol>
          </div>

          <div class="section">
            <h3>🚀 ¿Qué columnas incluye este tablero y por qué?</h3>
            <ul>
              <li><strong>Para hoy (Máximo 3 tareas):</strong> Limita tu foco diario. Menos es más. Si surge algo nuevo, va a la columna de espera.</li>
              <li><strong>En progreso (Máximo 1 tarea):</strong> El multitasking es el enemigo del foco. Concéntrate en terminar una sola cosa a la vez.</li>
              <li><strong>En espera / Bloqueado:</strong> Para tareas que dependen de terceros o respuestas externas, quitándolas de tu vista activa para que no estorben.</li>
              <li><strong>¡Hecho!:</strong> Celebra cada logro diario. Mover tarjetas aquí libera dopamina sana y te da un registro visual de tu avance.</li>
            </ul>
          </div>

          <p>Además, al registrarte ya tienes acceso completo a todas las demás herramientas de la web, incluyendo el <strong>Auditor de CV con IA</strong> y la <strong>Calculadora de ROI de Automatización</strong>.</p>
          
          <p>Si tienes alguna consulta sobre cómo optimizar tus flujos de trabajo, automatizar tareas repetitivas o implementar inteligencia artificial en tu negocio, no dudes en escribirme.</p>
          
          <p style="margin-bottom: 15px;">Saludos cordiales,</p>
          <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
            <tr>
              <td style="padding-right: 12px; vertical-align: middle;">
                <img src="https://www.javiermujica.com/images/logo-isotipo.png" alt="Logo" width="32" height="56" style="width: 32px; height: 56px; display: block; outline: none; border: none; text-decoration: none;" />
              </td>
              <td style="border-left: 1px solid #1e293b; padding-left: 12px; vertical-align: middle;">
                <strong style="font-size: 15px; color: #ffffff; display: block; line-height: 1.2;">Javier Mujica</strong>
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-top: 2px; line-height: 1.2;">Consultoría en IA Aplicada y Mejora Continua</span>
                <span style="font-size: 11px; color: #3b82f6; display: block; margin-top: 2px;"><a href="https://www.javiermujica.com" style="color: #3b82f6; text-decoration: none;">www.javiermujica.com</a></span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Javier Mujica Consultoría - Optimización de Procesos y Automatización</p>
          <p>Recibiste este correo porque te registraste en nuestro sitio web.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Notification para el administrador cuando un nuevo alumno se inscribe
export async function sendAdminRegistrationNotification(reg: {
  name: string
  email: string
  phone?: string
  amount_paid?: number
  payment_method?: string
  coupon_code?: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "hola@javiermujica.com"
  const fromEmail = process.env.EMAIL_FROM || "Javier Mujica Consultoría <hola@javiermujica.com>"

  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Inscripción Vibecode</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #030712; color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 25px;">
          <h2 style="color: #6366f1; margin-top: 0;">🎉 ¡Nueva Inscripción en Vibecode Lab!</h2>
          <p>Un nuevo alumno se ha inscrito exitosamente al bootcamp <strong>Crea Tu App</strong>:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px; color: #94a3b8; width: 40%;"><strong>Nombre:</strong></td>
              <td style="padding: 10px; color: #ffffff; font-weight: bold;">${reg.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px; color: #94a3b8;"><strong>Correo Electrónico:</strong></td>
              <td style="padding: 10px; color: #3b82f6;">${reg.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px; color: #94a3b8;"><strong>Teléfono / WhatsApp:</strong></td>
              <td style="padding: 10px; color: #ffffff;">${reg.phone || "No especificado"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px; color: #94a3b8;"><strong>Monto Pagado:</strong></td>
              <td style="padding: 10px; color: #22c55e; font-weight: bold;">$${reg.amount_paid ?? "N/A"} USD</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px; color: #94a3b8;"><strong>Método de Pago:</strong></td>
              <td style="padding: 10px; color: #ffffff;">${reg.payment_method || "mercadopago"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px; color: #94a3b8;"><strong>Cupón Usado:</strong></td>
              <td style="padding: 10px; color: #a855f7;">${reg.coupon_code || "Ninguno"}</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            Notificación automática generada por Vibecode Lab System.
          </p>
        </div>
      </body>
      </html>
    `

    return await sendEmail({
      to: adminEmail,
      subject: `🎉 [NUEVO ALUMNO] ${reg.name} ($${reg.amount_paid ?? 0} USD)`,
      html,
      from: fromEmail,
    })
  } catch (err) {
    console.error("Error sending admin registration notification:", err)
  }
}

// Template para el correo de bienvenida del Bootcamp Vibecode Lab
export function getVibecodeWelcomeTemplate(name: string) {
  const whatsappLink = "https://chat.whatsapp.com/FthHTnYchZqCInEtmB7JeS"
  const googleMeetLink = "https://meet.google.com/jmg-iqxe-eay"

  const classes = [
    {
      num: "Clase 1",
      dateStr: "Miércoles 25 de Noviembre",
      isoDate: "20261125T200000/20261125T223000",
      title: "Instalación & Tu Primer Contacto",
      description: "Configuraremos tu computadora paso a paso. Perderemos el miedo a la consola de comandos de tu sistema y dejaremos listas las herramientas profesionales necesarias para empezar a programar sin ningún bloqueo técnico.",
    },
    {
      num: "Clase 2",
      dateStr: "Miércoles 2 de Diciembre",
      isoDate: "20261202T200000/20261202T223000",
      title: "Programación con Inteligencia Artificial",
      description: "Aprenderemos a usar la Inteligencia Artificial (Gemini) como un tutor personal. Sabrás cómo pedirle que te ayude a planificar tu aplicación, explicarte el código paso a paso y resolver cualquier error en segundos.",
    },
    {
      num: "Clase 3",
      dateStr: "Miércoles 9 de Diciembre",
      isoDate: "20261209T200000/20261209T223000",
      title: "Arquitectura del MVP & Base de Datos",
      description: "Modelado de datos en Supabase, autenticación segura de usuarios (Auth), asignación de roles y políticas de seguridad RLS para sentar la infraestructura técnica del proyecto.",
    },
    {
      num: "Clase 4",
      dateStr: "Miércoles 16 de Diciembre",
      isoDate: "20261216T200000/20261216T223000",
      title: "Integración de APIs & Agentes de IA",
      description: "Conexión con modelos de IA avanzados, estructuración de prompts en el backend, gestión de contexto y automatización de respuestas inteligentes sin fricción.",
    },
    {
      num: "Clase 5",
      dateStr: "Miércoles 23 de Diciembre",
      isoDate: "20261223T200000/20261223T223000",
      title: "Monetización en Vivo & Correos Automáticos",
      description: "Integración de Mercado Pago (checkouts y suscripciones), procesamiento de pagos mediante webhooks en tiempo real y envío automático de correos transaccionales (Resend/SendGrid).",
    },
    {
      num: "Clase 6",
      dateStr: "Miércoles 30 de Diciembre",
      isoDate: "20261230T200000/20261230T223000",
      title: "Front-end Interactivo, Modelo Freemium & Go-To-Market",
      description: "Desarrollo de interfaz responsiva con chatbot interactivo, configuración de límites Freemium (Product-Led Growth) para adquisición fluida y estrategia Go-To-Market para tus primeros 100 usuarios.",
    },
    {
      num: "Clase 7",
      dateStr: "Miércoles 6 de Enero",
      isoDate: "20270106T200000/20270106T223000",
      title: "Despliegue en Producción, Pitch para Capital & Demo Day",
      description: "Publicación en Vercel con dominio propio y SSL, estructuración de un Pitch Deck de alto impacto para inversores y el Demo Day oficial de presentación en vivo frente a la comunidad.",
    },
  ]

  const createClassCalendarUrl = (cls: typeof classes[0]) => {
    const title = `Vibecode Lab — ${cls.num}: ${cls.title}`
    const details = `Vibecode Lab
${cls.num}: ${cls.title}

📋 Contenidos a Tratar:
${cls.description}

 Horario: 8:00 pm - 10:30 pm (hora Chile)
 Sala Google Meet: ${googleMeetLink}
 Grupo de WhatsApp: ${whatsappLink}`

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${cls.isoDate}&ctz=America/Santiago&details=${encodeURIComponent(details)}&location=${encodeURIComponent(googleMeetLink)}`
  }

  const seriesCalendarTitle = "Vibecode Lab (7 Semanas)"
  const seriesCalendarDetails = `Vibecode Lab (7 Clases en Vivo)

📅 Programa de Estudios y Contenidos:
1. 25 Nov: Instalación & Tu Primer Contacto
2. 2 Dic: Programación con Inteligencia Artificial
3. 9 Dic: Arquitectura del MVP & Base de Datos
4. 16 Dic: Integración de APIs & Agentes de IA
5. 23 Dic: Monetización en Vivo & Correos Automáticos
6. 30 Dic: Front-end Interactivo, Freemium & Go-To-Market
7. 6 Ene: Despliegue en Producción, Pitch & Demo Day

 Horario: Todos los Miércoles de 8:00 pm a 10:30 pm (Chile)
 Sala Google Meet: ${googleMeetLink}
 Grupo de WhatsApp: ${whatsappLink}`

  const seriesCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(seriesCalendarTitle)}&dates=20261125T200000/20261125T223000&ctz=America/Santiago&details=${encodeURIComponent(seriesCalendarDetails)}&location=${encodeURIComponent(googleMeetLink)}&recur=RRULE:FREQ=WEEKLY;BYDAY=WE;UNTIL=20270106T235959`

  const classesHtmlList = classes
    .map(
      (cls) => `
      <div style="background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px;">
        <div style="margin-bottom: 6px;">
          <span style="font-weight: 700; color: #818cf8; font-size: 12px; text-transform: uppercase; tracking: 0.05em;">${cls.num} · ${cls.dateStr}</span>
          <span style="color: #9ca3af; font-size: 11px; float: right;">8:00 pm - 10:30 pm Chile</span>
        </div>
        <h4 style="margin: 4px 0 6px 0; color: #ffffff; font-size: 15px; font-weight: 700;">${cls.title}</h4>
        <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 12.5px; line-height: 1.5;">${cls.description}</p>
        <div style="text-align: right; margin-top: 8px;">
          <a href="${createClassCalendarUrl(cls)}" target="_blank" style="display: inline-block; background: #1e1b4b; color: #a5b4fc !important; border: 1px solid #3730a3; padding: 6px 14px; border-radius: 6px; font-size: 11.5px; font-weight: 600; text-decoration: none;">
            📅 Agendar ${cls.num} en Google Calendar
          </a>
        </div>
      </div>
    `
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Te damos la bienvenida a Vibecode Lab!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; color: white; padding: 40px 25px; text-align: center; }
        .content { padding: 32px 28px; background-color: #090d16; color: #ffffff; }
        .highlight-box { background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #6366f1; }
        .footer { text-align: center; margin-top: 35px; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 24px; }
        h2, h3 { color: #ffffff; margin-top: 0; }
        .text-accent { color: #f97316; font-weight: bold; }
        .badge { background: #312e81; color: #a5b4fc; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #4338ca; display: inline-block; margin-bottom: 12px; letter-spacing: 0.05em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="padding: 0; background-color: #090d16; border-bottom: 1px solid #1e293b; text-align: center; overflow: hidden;">
          <img src="https://www.javiermujica.com/images/vibecode-email-banner.png" alt="Vibecode Lab - Inscripción Confirmada" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto; border: 0;" />
        </div>

        <div class="content">
          <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
          
          <p>¡Felicidades por dar el paso y sumarte a <strong>Vibecode Lab</strong>! Tu inscripción se ha procesado con éxito y ya tienes tu cupo asegurado para aprender a construir y publicar tus propios sistemas web reales.</p>

          <p style="text-align: center; margin-top: 24px; margin-bottom: 14px; font-weight: 700; color: #ffffff; font-size: 15px;">👇 Enlaces y Accesos Obligatorios:</p>

          <!-- Botones de Acción Formato Tabla para Compatibilidad Email -->
          <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0 24px 0;">
            <tr>
              <td style="padding-bottom: 12px;">
                <a href="${whatsappLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #25d366; color: #ffffff !important; border: 1px solid #128c7e; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;">
                  💬 Unirme al Grupo Oficial de WhatsApp
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 12px;">
                <a href="${seriesCalendarLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #3b82f6; color: #ffffff !important; border: 1px solid #1d4ed8; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;">
                  📅 Agendar las 7 Clases en Google Calendar
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <a href="${googleMeetLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #ef4444; color: #ffffff !important; border: 1px solid #b91c1c; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;">
                  📹 Entrar a la Sala de Google Meet
                </a>
              </td>
            </tr>
          </table>
          
          <div class="highlight-box">
            <h3 style="margin-bottom: 6px; color: #818cf8; font-size: 17px;">📅 Programa de Estudios & Contenidos por Clase</h3>
            <p style="margin-top: 0; margin-bottom: 16px; color: #94a3b8; font-size: 13px;">
              Las 7 sesiones son los <strong>miércoles de 8:00 pm a 10:30 pm (hora Chile)</strong>. Puedes agendar la serie completa o cada clase individualmente con sus contenidos a tratar:
            </p>
            
            ${classesHtmlList}

            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
                🎥 <strong class="text-accent">¿Qué pasa si no puedes asistir en directo?</strong> ¡No hay problema! Todas las clases se graban y quedan disponibles al día siguiente en la plataforma de alumnos para que las repases a tu propio ritmo.
              </p>
            </div>
          </div>

          <p style="margin-top: 24px; color: #cbd5e1;">
            En los próximos días te compartiremos los accesos de usuario a la plataforma de estudio y el checklist de herramientas iniciales.
          </p>

          <p style="color: #cbd5e1;">Si tienes cualquier duda antes de comenzar, puedes responder directamente a este correo.</p>
          
          <p style="margin-bottom: 20px; font-weight: 600; color: #ffffff;">¡Nos vemos en clases!</p>
          
          <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 25px; border-top: 1px solid #1e293b; padding-top: 20px; width: 100%;">
            <tr>
              <td style="width: 56px; vertical-align: middle;">
                <img src="https://www.javiermujica.com/images/logo-isotipo.png" alt="Logo" width="27" height="48" style="width: 27px; height: 48px; display: block; outline: none; border: none;" />
              </td>
              <td style="padding-left: 12px; vertical-align: middle;">
                <strong style="font-size: 15px; color: #ffffff; display: block; line-height: 1.2;">Javier Mujica</strong>
                <span style="font-size: 12px; color: #9ca3af; display: block; margin-top: 2px; line-height: 1.2;">Creador de Vibecode Lab & Mentor del Bootcamp</span>
                <span style="font-size: 11px; color: #3b82f6; display: block; margin-top: 2px;"><a href="https://www.javiermujica.com" style="color: #3b82f6; text-decoration: none;">www.javiermujica.com</a></span>
              </td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>© 2026 Vibecode Lab. Todos los derechos reservados.</p>
          <p>Recibiste este correo porque te inscribiste en Vibecode Lab.</p>
        </div>
      </div>
  `
}

/**
 * Plantilla de correo enviada al alumno cuando realiza un abono parcial (reserva de cupo).
 */
export function getVibecodeAbonoTemplate(name: string, abonoCLP: number, remainingCLP: number) {
  const whatsappLink = "https://chat.whatsapp.com/FthHTnYchZqCInEtmB7JeS"
  const googleMeetLink = "https://meet.google.com/jmg-iqxe-eay"
  const formattedAbono = `$${abonoCLP.toLocaleString("es-CL")} CLP`
  const formattedRemaining = `$${remainingCLP.toLocaleString("es-CL")} CLP`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Abono Recibido y Cupo Reservado! - Vibecode Lab</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; color: white; padding: 30px 25px; text-align: center; }
        .content { padding: 32px 28px; background-color: #090d16; color: #ffffff; }
        .highlight-box { background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; margin-top: 35px; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 24px; }
        h2, h3 { color: #ffffff; margin-top: 0; }
        .badge { background: #064e3b; color: #6ee7b7; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #047857; display: inline-block; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="badge">🎟️ ABONO RECIBIDO Y CUPO RESERVADO</span>
          <h1 style="margin: 10px 0 0 0; font-size: 24px; color: #ffffff;">🎉 ¡Bienvenido/a a Vibecode Lab!</h1>
        </div>

        <div class="content">
          <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
          
          <p>Hemos recibido tu transferencia por concepto de <strong>abono/reserva</strong> para el bootcamp <strong>Vibecode Lab: Crea Tu App</strong>. Tu cupo en el curso ha quedado <strong>oficialmente reservado</strong>.</p>

          <div class="highlight-box">
            <h3 style="margin-bottom: 12px; color: #10b981; font-size: 17px;">📋 Resumen de tu Reserva</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Monto Abonado:</strong></td>
                <td style="padding: 8px 0; color: #34d399; text-align: right; font-weight: bold;">${formattedAbono}</td>
              </tr>
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Saldo Pendiente:</strong></td>
                <td style="padding: 8px 0; color: #f87171; text-align: right; font-weight: bold;">${formattedRemaining}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Estado de Reserva:</strong></td>
                <td style="padding: 8px 0; color: #60a5fa; text-align: right; font-weight: bold;">✅ Cupo Reservado</td>
              </tr>
            </table>
          </div>

          <p style="color: #cbd5e1;">
            Te enviaremos un correo a la semana siguiente con el recordatorio y datos bancarios para completar el pago del saldo restante (o antes de iniciar las clases en vivo).
          </p>

          <p style="text-align: center; margin-top: 24px; margin-bottom: 14px; font-weight: 700; color: #ffffff; font-size: 15px;">👇 Accesos a la Comunidad y Clases:</p>

          <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding-bottom: 12px;">
                <a href="${whatsappLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #25d366; color: #ffffff !important; border: 1px solid #128c7e; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;">
                  💬 Unirme al Grupo Oficial de WhatsApp
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <a href="${googleMeetLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #ef4444; color: #ffffff !important; border: 1px solid #b91c1c; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;">
                  📹 Entrar a la Sala de Google Meet
                </a>
              </td>
            </tr>
          </table>

          <p style="margin-top: 24px; color: #94a3b8; font-size: 13px;">
            Si tienes alguna consulta sobre tu pago o la reserva, puedes responder directamente a este correo.
          </p>

          <p style="margin-bottom: 20px; font-weight: 600; color: #ffffff;">¡Nos vemos en el bootcamp!</p>
          <p>Saludos cordiales,<br/><strong>Javier Mujica</strong></p>
        </div>

        <div class="footer">
          <p>© 2026 Vibecode Lab. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Plantilla de correo enviada automáticamente al alumno a los 7 días para solicitar el saldo pendiente.
 */
export function getVibecodeBalanceRequestTemplate(name: string, abonoCLP: number, remainingCLP: number, regID: string) {
  const uploadUrl = `https://www.javiermujica.com/vibecode?status=pending&reg_id=${regID}`
  const formattedAbono = `$${abonoCLP.toLocaleString("es-CL")} CLP`
  const formattedRemaining = `$${remainingCLP.toLocaleString("es-CL")} CLP`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Saldo Pendiente - Vibecode Lab</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; color: white; padding: 30px 25px; text-align: center; }
        .content { padding: 32px 28px; background-color: #090d16; color: #ffffff; }
        .highlight-box { background-color: #0f172a; border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #6366f1; }
        .bank-box { background-color: #1e1b4b; border: 1px solid #3730a3; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 35px; color: #64748b; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 24px; }
        h2, h3 { color: #ffffff; margin-top: 0; }
        .badge { background: #312e81; color: #a5b4fc; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid #4338ca; display: inline-block; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="badge">🔔 RECORDATORIO DE SALDO PENDIENTE</span>
          <h1 style="margin: 10px 0 0 0; font-size: 24px; color: #ffffff;">Vibecode Lab: Completa tu Matrícula</h1>
        </div>

        <div class="content">
          <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
          
          <p>Esperamos que estés teniendo una excelente semana. Te escribimos para recordarte que tu cupo para el bootcamp <strong>Vibecode Lab: Crea Tu App</strong> se encuentra actualmente reservado con tu abono inicial.</p>

          <div class="highlight-box">
            <h3 style="margin-bottom: 12px; color: #818cf8; font-size: 17px;">💳 Estado de tu Matrícula</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Monto Abonado:</strong></td>
                <td style="padding: 8px 0; color: #34d399; text-align: right; font-weight: bold;">${formattedAbono}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;"><strong>Monto Pendiente por Transferir:</strong></td>
                <td style="padding: 8px 0; color: #f87171; text-align: right; font-weight: bold; font-size: 16px;">${formattedRemaining}</td>
              </tr>
            </table>
          </div>

          <div class="bank-box">
            <h3 style="margin-bottom: 10px; color: #a5b4fc; font-size: 16px;">🏦 Datos para Transferencia Bancaria</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #e0e7ff;"><strong>Banco:</strong> Banco Santander</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e0e7ff;"><strong>Tipo de Cuenta:</strong> Cuenta Corriente</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e0e7ff;"><strong>Nombre:</strong> Javier Mujica</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e0e7ff;"><strong>RUT / ID:</strong> Enviar comprobante a hola@javiermujica.com</p>
            <p style="margin: 4px 0; font-size: 14px; color: #e0e7ff;"><strong>Monto a Transferir:</strong> ${formattedRemaining}</p>
          </div>

          <p style="text-align: center; margin-top: 24px; margin-bottom: 14px; font-weight: 700; color: #ffffff; font-size: 15px;">👇 Sube tu Comprobante del Saldo:</p>

          <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
            <tr>
              <td>
                <a href="${uploadUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #6366f1; color: #ffffff !important; border: 1px solid #4f46e5; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 15px; text-align: center; text-decoration: none;">
                  📤 Subir Comprobante del Saldo Restante
                </a>
              </td>
            </tr>
          </table>

          <p style="margin-top: 24px; color: #94a3b8; font-size: 13px;">
            Una vez transferido y subido el comprobante, tu matrícula quedará activada al 100%. Si necesitas facilidades adicionales o tienes dudas, puedes responder directamente a este correo.
          </p>

          <p style="margin-bottom: 20px; font-weight: 600; color: #ffffff;">Saludos cordiales,<br/><strong>Javier Mujica</strong></p>
        </div>

        <div class="footer">
          <p>© 2026 Vibecode Lab. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}



/* ==========================================================================
   SECUENCIA DE 7 CORREOS PRE-REUNIÓN (DERRIBO DE OBJECIONES + CASO DE ESTUDIO + RECORDATORIOS)
   ========================================================================== */

/**
 * CORREO 1: Objeción 1 (Complejidad y Costos) - Envió Inmediato
 */
export function getObjection1EmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>¿La IA es solo para gigantes tecnológicos?</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #060814; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center; color: #ffffff !important; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .banner-img { width: 100%; max-width: 550px; height: auto; object-fit: contain; max-height: 550px; border-radius: 10px; margin: 15px auto 25px auto; border: 1px solid #1e293b; display: block; }
        .highlight-card { background-color: #0f172a; border-left: 4px solid #6366f1; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
        h1 { color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; }
        h2 { color: #818cf8; font-size: 18px; margin-top: 0; }
        ul { padding-left: 20px; margin: 15px 0; }
        li { margin-bottom: 10px; color: #cbd5e1; }
        .accent { color: #818cf8; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">💡 ¿La IA es solo para gigantes tecnológicos?</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>¡Felicidades por dar el paso de agendar tu sesión estratégica!</p>
          
          <p>Antes de que nos reunamos, quiero abordar una duda muy común que escucho a diario entre fundadores, directores y profesionales: <em>"Javier, ¿la inteligencia artificial y las automatizaciones no son algo exclusivo de multinacionales con presupuestos de millones de dólares?"</em></p>
          
          <p>La respuesta corta es un <strong class="accent">NO CATEGÓRICO</strong>.</p>
          
          <div style="text-align: center;">
            <img src="https://www.javiermujica.com/images/ai_cost_complexity.png" alt="IA Accesible para PYMEs" class="banner-img" />
          </div>

          <p>Hace unos años, implementar un sistema inteligente requería contratar equipos enteros de ingenieros en software y gastar decenas de miles de dólares en servidores dedicados. Hoy la realidad ha cambiado drásticamente gracias al paradigma del <strong>Vibecoding</strong> y los modelos autónomos.</p>
          
          <div class="highlight-card">
            <h2>En nuestra reunión verás soluciones reales:</h2>
            <ul>
              <li><strong>Cero gastos de infraestructura innecesaria:</strong> Pagas únicamente por las consultas que tus herramientas consuman.</li>
              <li><strong>Integración limpia sobre lo que ya usas:</strong> No necesitas desechar tu software actual; la IA actúa como una capa de superpoderes sobre tu flujo de trabajo existente.</li>
              <li><strong>Resultados visibles desde la primera semana:</strong> Automatizaciones puntuales que ahorran de 10 a 15 horas operativas a la semana por colaborador.</li>
            </ul>
          </div>

          <p>Mi objetivo en nuestra sesión no es venderte tecnología compleja, sino mostrarte el camino más corto, simple y rentable hacia la eficiencia.</p>

          <p>Nos vemos muy pronto.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            Un abrazo,<br/>
            <strong style="color: #ffffff;">Javier Mujica</strong><br/>
            <span style="font-size: 13px; color: #94a3b8;">Consultor en Rediseño de Procesos & IA | <a href="https://www.javiermujica.com" style="color: #6366f1; text-decoration: none;">www.javiermujica.com</a></span>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * CORREO 2: Objeción 2 (Ordenar vs Digitalizar) - 36 Horas Antes
 */
export function getObjection2EmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>¿Ordenar o digitalizar primero?</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #060814; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center; color: #ffffff !important; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .banner-img { width: 100%; max-width: 550px; height: auto; object-fit: contain; max-height: 550px; border-radius: 10px; margin: 15px auto 25px auto; border: 1px solid #1e293b; display: block; }
        .highlight-card { background-color: #0f172a; border-left: 4px solid #38bdf8; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
        h1 { color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; }
        h2 { color: #38bdf8; font-size: 18px; margin-top: 0; }
        ul { padding-left: 20px; margin: 15px 0; }
        li { margin-bottom: 10px; color: #cbd5e1; }
        .accent { color: #38bdf8; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">⚙️ ¿Ordenar o digitalizar primero? El dilema que paraliza empresas</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Faltan pocas horas para nuestra reunión estratégica. Hoy quiero hacerte reflexionar sobre una trampa en la que caen el 80% de las empresas al intentar innovar:</p>
          
          <p style="background-color: #0f172a; padding: 15px; border-radius: 6px; font-style: italic; color: #94a3b8;">
            "Primero necesito ordenar manualmente todos mis procesos internos antes de atreverme a usar Inteligencia Artificial o automatizar."
          </p>

          <p>Este razonamiento suena lógico a simple vista, pero en la práctica genera <strong class="accent">PARÁLISIS POR ANÁLISIS</strong>. Pasar meses intentando documentar procesos caóticos en papel sin herramientas digitales suele terminar en frustración y abandono.</p>
          
          <div style="text-align: center;">
            <img src="https://www.javiermujica.com/images/process_digitalization.png" alt="Rediseño de Procesos y Digitalización" class="banner-img" />
          </div>

          <div class="highlight-card">
            <h2>El secreto del rediseño moderno:</h2>
            <p style="margin-top: 0;">La optimización de procesos y la digitalización estratégica van de la mano:</p>
            <ul>
              <li><strong>La IA como espejo organizador:</strong> Al aplicar herramientas sobre tus flujos actuales, la propia tecnología te revela dónde están los cuellos de botella reales.</li>
              <li><strong>Eliminación de la grasa operativa:</strong> No automatizamos el caos; identificamos los 2 o 3 pasos críticos que generan ingresos y los dejamos corriendo en piloto automático.</li>
              <li><strong>Sprints de victoria rápida:</strong> En lugar de esperar 6 meses para ordenar la empresa, logramos resultados tangibles en pocos días.</li>
            </ul>
          </div>

          <p>En nuestra sesión de diagnóstico analizaremos juntos tus flujos actuales para identificar exactamente por dónde empezar a simplificar sin perder tiempo.</p>

          <p style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            Preparado para el cambio,<br/>
            <strong style="color: #ffffff;">Javier Mujica</strong><br/>
            <span style="font-size: 13px; color: #94a3b8;">Consultor en Rediseño de Procesos & IA | <a href="https://www.javiermujica.com" style="color: #38bdf8; text-decoration: none;">www.javiermujica.com</a></span>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * CORREO 3: Recordatorio 24 Horas Antes
 */
export function get24hReminderEmailTemplate(name: string, formattedMeetingTime: string, meetingUrl: string, googleCalendarUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>⏰ Mañana es nuestra sesión estratégica</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #060814; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center; color: #ffffff !important; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .card-details { background-color: #0f172a; border: 1px solid #312e81; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        .btn-calendar { background-color: #1e293b; border: 1px solid #475569; margin-left: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
        h1 { color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">⏰ Mañana es nuestra sesión estratégica: ${name}</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Te recuerdo que <strong>mañana</strong> tenemos agendada nuestra sesión de consultoría estratégica de procesos e IA.</p>
          
          <div class="card-details">
            <h3 style="color: #818cf8; margin-top: 0;">🗓️ Detalle de la Cita</h3>
            <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin: 10px 0;">${formattedMeetingTime}</p>
            
            <div style="margin-top: 20px;">
              <a href="${meetingUrl}" class="btn" target="_blank">💻 Enlace de la Reunión (Meet/Zoom)</a>
              ${googleCalendarUrl ? `<a href="${googleCalendarUrl}" class="btn btn-calendar" target="_blank">📅 Agregar a Google Calendar</a>` : ''}
            </div>
          </div>

          <p><strong>¿Qué revisaremos en esta sesión?</strong></p>
          <ul>
            <li>Mapeo de las tareas operativas que más tiempo le quitan a tu equipo.</li>
            <li>Identificación de oportunidades inmediatas de automatización con IA.</li>
            <li>Plan de acción recomendado con métricas claras de impacto.</li>
          </ul>

          <p>Por favor, asegúrate de tener a mano una lista breve de los procesos o softwares que usas a diario.</p>

          <p>¡Nos vemos mañana!</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            Un saludo,<br/>
            <strong style="color: #ffffff;">Javier Mujica</strong>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * CORREO 4: Objeción 3 (Retorno de Inversión - ROI) - 12 Horas Antes
 */
export function getObjection3EmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Medir el impacto antes de invertir un solo dólar</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #060814; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center; color: #ffffff !important; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .banner-img { width: 100%; max-width: 550px; height: auto; object-fit: contain; max-height: 550px; border-radius: 10px; margin: 15px auto 25px auto; border: 1px solid #1e293b; display: block; }
        .highlight-card { background-color: #0f172a; border-left: 4px solid #10b981; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
        h1 { color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; }
        h2 { color: #10b981; font-size: 18px; margin-top: 0; }
        ul { padding-left: 20px; margin: 15px 0; }
        li { margin-bottom: 10px; color: #cbd5e1; }
        .accent { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">📊 Medir el impacto antes de invertir un solo dólar</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Entiendo perfectamente la cautela cuando se trata de evaluar una consultoría o la implementación de nuevas tecnologías. En el mercado actual abundan las promesas vacías y la "espuma" comercial.</p>
          
          <p>Por eso quiero dejarte clara mi filosofía de trabajo: <strong class="accent">Si no podemos medir matemáticamente el retorno de inversión (ROI), no tiene sentido implementar.</strong></p>
          
          <div style="text-align: center;">
            <img src="https://www.javiermujica.com/images/roi_measurement.png" alt="Medición de ROI y Métricas" class="banner-img" />
          </div>

          <div class="highlight-card">
            <h2>Evaluamos la tecnología bajo 3 métricas concretas:</h2>
            <ul>
              <li><strong>Horas Hombre Recuperadas:</strong> Convertimos las horas invertidas en tareas administrativas repetitivas en valor monetario directo.</li>
              <li><strong>Reducción del Error Humano:</strong> Cuantificamos el costo de los descuidos en seguimiento de clientes, cotizaciones demoradas o datos mal ingresados.</li>
              <li><strong>Velocidad de Respuesta:</strong> Medimos cómo responder a un cliente en 2 minutos en lugar de 4 horas aumenta tu tasa de conversión en más de un 300%.</li>
            </ul>
          </div>

          <p>Durante nuestra reunión no hablaremos de conceptos abstractos. Calcularemos juntos los números reales de tu caso para que tomes una decisión basada en datos fríos y rentabilidad clara.</p>

          <p style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            Saludos cordiales,<br/>
            <strong style="color: #ffffff;">Javier Mujica</strong><br/>
            <span style="font-size: 13px; color: #94a3b8;">Consultor en Rediseño de Procesos & IA | <a href="https://www.javiermujica.com" style="color: #10b981; text-decoration: none;">www.javiermujica.com</a></span>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * CORREO 5: Objeción 4 (Resistencia del Equipo) - 6 Horas Antes
 */
export function getObjection4EmailTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Herramientas que ayudan a tu equipo, no que lo reemplazan</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #060814; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center; color: #ffffff !important; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .banner-img { width: 100%; max-width: 550px; height: auto; object-fit: contain; max-height: 550px; border-radius: 10px; margin: 15px auto 25px auto; border: 1px solid #1e293b; display: block; }
        .highlight-card { background-color: #0f172a; border-left: 4px solid #c084fc; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
        h1 { color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; }
        h2 { color: #c084fc; font-size: 18px; margin-top: 0; }
        ul { padding-left: 20px; margin: 15px 0; }
        li { margin-bottom: 10px; color: #cbd5e1; }
        .accent { color: #c084fc; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">🤝 Herramientas que ayudan a tu equipo, no que lo reemplazan</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Una de las mayores preocupaciones de todo líder o emprendedor es: <em>"¿Qué pasará con mi equipo? ¿Se van a resistir al cambio o sentirán temor de que la IA los reemplace?"</em></p>
          
          <p>La experiencia en decenas de implementaciones me ha enseñado una regla de oro: <strong class="accent">La tecnología solo triunfa si las personas la aman.</strong></p>
          
          <div style="text-align: center;">
            <img src="https://www.javiermujica.com/images/team_adoption.png" alt="Adopción del Equipo e IA" class="banner-img" />
          </div>

          <p>La IA no llega a reemplazar el talento ni el criterio de tu equipo; llega para <strong>liberarlos de la monotonía</strong>. Cuando a un colaborador le quitas de encima la carga de copiar y pegar datos, redactar correos rutinarios o llenar planillas manualmente, ocurre una transformación inmediata:</p>

          <div class="highlight-card">
            <h2>Beneficios de adopción fluida:</h2>
            <ul>
              <li><strong>Reducción de Burnout:</strong> Se eliminan las tareas aburridas que generan fatiga mental.</li>
              <li><strong>Enfoque en Alto Valor:</strong> Tu equipo concentra su tiempo en creatividad, estrategia y relaciones con clientes.</li>
              <li><strong>Empoderamiento Tecnológico:</strong> Se convierten en los mayores impulsores de la tecnología al sentir que la herramienta trabaja para ellos.</li>
            </ul>
          </div>

          <p>En nuestra reunión abordaremos cómo involucrar a tu equipo desde el primer día, garantizando una adopción fluida y entusiasta.</p>

          <p style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            ¡Falta muy poco para conectarnos!<br/>
            <strong style="color: #ffffff;">Javier Mujica</strong>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * CORREO 6: Caso de Estudio Real según Nicho/Sector (8 Categorías Específicas) - 3 Horas Antes
 */
export function getNicheCaseStudyEmailTemplate(name: string, serviceType?: string, industry?: string) {
  const combined = `${serviceType || ""} ${industry || ""}`.toLowerCase()

  let sectorTitle = "Operaciones y Gestión de Negocios"
  let challengeText = "Pasaban más de 4 horas al día respondiendo correos repetitivos, agendando citas a mano y transcribiendo datos en hojas de cálculo. El desgaste operativo dejaba escapar clientes valiosos."
  let solutionText = "1. Agente IA autónomo para pre-calificar prospectos 24/7.<br/>2. Automatización del flujo de seguimiento CRM y cotizaciones instantáneas.<br/>3. Dashboard unificado de métricas operativas."
  let resultText = "Recuperaron 20+ horas semanales de trabajo manual, aumentaron la tasa de conversión en un 35% y escalaron la atención sin contratar personal extra."
  let imageFileName = "lean_processes.png"

  if (combined.includes("salud-bienestar") || combined.includes("salud") || combined.includes("bienestar") || combined.includes("psicolog") || combined.includes("terapeut") || combined.includes("clinica") || combined.includes("coach")) {
    sectorTitle = "Salud, Psicología y Consultas de Bienestar"
    challengeText = "Un profesional de la salud/terapeuta perdía más de 3 horas diarias gestionando reservas por WhatsApp, enviando recordatorios manualmente y atendiendo dudas repetitivas, sufriendo ausencias y cancelaciones de último minuto."
    solutionText = "1. Agente conversacional IA capacitado en su protocolo de atención.<br/>2. Sincronización automática de agenda con confirmaciones por WhatsApp.<br/>3. Sistema asistido de resúmenes de sesión y agendamiento 24/7."
    resultText = "Redujo inasistencias al 5%, recuperó 15 horas de tiempo libre a la semana y duplicó el volumen de pacientes atendidos sin aumentar su carga laboral."
    imageFileName = "therapist_ia.png"
  } else if (combined.includes("marketing-agencias") || combined.includes("marketing") || combined.includes("agencia") || combined.includes("e-commerce") || combined.includes("ventas") || combined.includes("seo")) {
    sectorTitle = "Marketing, Agencias y Ventas Digitales"
    challengeText = "Una agencia/equipo comercial gastaba días calificando prospectos fríos manualmente, creando presupuestos repetitivos y elaborando reportes semanales de desempeño para clientes."
    solutionText = "1. Embudo conversacional inteligente con IA para auditar y calificar prospectos 24/7.<br/>2. Generación automática de propuestas personalizadas e integración CRM.<br/>3. Flujo automático de nutrición de prospectos y reportes."
    resultText = "Redujeron el tiempo de respuesta a prospectos en un 90%, incrementaron la conversión en un 40% y automatizaron su flujo de captación."
    imageFileName = "seo_agent.png"
  } else if (combined.includes("servicios-profesionales") || combined.includes("consultoria") || combined.includes("abogado") || combined.includes("contador")) {
    sectorTitle = "Servicios Profesionales (Consultoría, Abogados y Contadores)"
    challengeText = "Un estudio profesional perdía decenas de horas semanales recopilando documentación de clientes, redactando borradores iniciales repetitivos y gestionando cobranzas manualmente."
    solutionText = "1. Ingesta y lectura asistida por IA de documentos y respaldos de clientes.<br/>2. Generación automática de borradores iniciales de contratos e informes.<br/>3. Flujo automatizado de seguimiento y recordatorios de cobro."
    resultText = "Eliminaron el 75% del trabajo administrativo repetitivo y aceleraron la entrega de informes finales de semanas a pocos días."
    imageFileName = "pro_services_ia.png"
  } else if (combined.includes("educacion-academias") || combined.includes("educacion") || combined.includes("curso") || combined.includes("academia") || combined.includes("formacion")) {
    sectorTitle = "Educación, Formación y Cursos Online"
    challengeText = "Una academia online recibía cientos de consultas repetitivas sobre contenidos de programas, fechas de clases y métodos de pago, colapsando al equipo de atención al cliente."
    solutionText = "1. Asistente IA tutor entrenado con la malla curricular y preguntas frecuentes 24/7.<br/>2. Matrícula automatizada con validación de comprobantes de pago.<br/>3. Calificación proactiva de estudiantes para programas avanzados."
    resultText = "Atendieron el 85% de las dudas de inmediato sin intervención humana y aumentaron un 30% las inscripciones de nuevos alumnos."
    imageFileName = "education_ia.png"
  } else if (combined.includes("tecnologia-saas") || combined.includes("tecnologia") || combined.includes("software") || combined.includes("saas")) {
    sectorTitle = "Tecnología, Software y SaaS"
    challengeText = "Una empresa de software/SaaS gastaba horas del equipo de desarrollo en soporte Nivel 1 repetitivo, onboarding manual de usuarios y triage de tickets."
    solutionText = "1. Agente IA de soporte Nivel 1 integrado a la base de conocimiento y documentación.<br/>2. Onboarding conversacional guiado para nuevos usuarios.<br/>3. Clasificación y derivación inteligente de tickets de alto impacto."
    resultText = "Resolvieron el 60% de los tickets al instante sin tocar soporte técnico y aumentaron la retención de usuarios en un 25%."
    imageFileName = "saas_tech_ia.png"
  } else if (combined.includes("agricola-logistica") || combined.includes("agricola") || combined.includes("campo") || combined.includes("logistica") || combined.includes("flota")) {
    sectorTitle = "Sector Agrícola, Campo y Logística"
    challengeText = "Una operación agrícola/logística sufría retrasos por reportes manuales en papel, errores en la consolidación de rutas de flotas y falta de visibilidad en tiempo real de los costos de campo."
    solutionText = "1. Integración de datos telemáticos y de campo con IA (SOFIA/Webfleet).<br/>2. Automatización de reportes diarios de eficiencia operacional y combustible.<br/>3. Alertas preventivas directas al equipo de gestión."
    resultText = "Eliminaron errores de digitación en un 95% y ahorraron más de 25 horas semanales de gestión administrativa."
    imageFileName = "agri_logistics_ia.png"
  } else if (combined.includes("inmobiliaria") || combined.includes("real estate") || combined.includes("propiedades")) {
    sectorTitle = "Sector Inmobiliario y Real Estate"
    challengeText = "Una corredora/desarrolladora inmobiliaria perdía el 40% de prospectos por no responder fuera del horario de oficina ni agendar visitas a propiedades rápidamente."
    solutionText = "1. Asistente IA inmobiliario 24/7 capacitado con el catálogo de propiedades y requisitos.<br/>2. Pre-calificación financiera y filtro automático de compradores interesados.<br/>3. Agendamiento directo de visitas coordinado con la agenda de los ejecutivos."
    resultText = "Aumentaron un 50% las visitas agendadas a propiedades y duplicaron el cierre de operaciones en 60 días."
    imageFileName = "real_estate_ia.png"
  } else if (combined.includes("otro")) {
    sectorTitle = "Operaciones y Gestión de Negocios"
    challengeText = "Pasaban más de 4 horas al día respondiendo correos repetitivos, agendando citas a mano y transcribiendo datos en hojas de cálculo. El desgaste operativo dejaba escapar clientes valiosos."
    solutionText = "1. Agente IA autónomo para pre-calificar prospectos 24/7.<br/>2. Automatización del flujo de seguimiento CRM y cotizaciones instantáneas.<br/>3. Dashboard unificado de métricas operativas."
    resultText = "Recuperaron 20+ horas semanales de trabajo manual, aumentaron la tasa de conversión en un 35% y escalaron la atención sin contratar personal extra."
    imageFileName = "lean_processes.png"
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Caso Real: Cómo multiplicamos la productividad en tu sector</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #060814; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center; color: #ffffff !important; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .banner-img { width: 100%; max-width: 550px; height: auto; object-fit: contain; max-height: 550px; border-radius: 10px; margin: 15px auto 25px auto; border: 1px solid #1e293b; display: block; }
        .highlight-card { background-color: #0f172a; border-left: 4px solid #f59e0b; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
        h1 { color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; }
        h2 { color: #f59e0b; font-size: 18px; margin-top: 0; }
        .accent { color: #f59e0b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0c1024 !important; background: linear-gradient(135deg, #1e1b4b 0%, #060814 100%) !important; border-bottom: 1px solid #1e293b; padding: 30px 25px; text-align: center;">
          <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">🚀 Caso Real en tu Sector: ${sectorTitle}</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Estamos a muy pocas horas de nuestra reunión. Para que veas exactamente lo que es posible lograr en tu rubro, quiero compartirte este caso práctico:</p>
          
          <div style="text-align: center;">
            <img src="https://www.javiermujica.com/images/${imageFileName}" alt="Caso de Estudio" class="banner-img" />
          </div>

          <div class="highlight-card">
            <h2>El Desafío Inicial:</h2>
            <p style="margin-top: 0; color: #cbd5e1;">${challengeText}</p>
            
            <h2>La Solución Aplicada:</h2>
            <p style="color: #cbd5e1;">${solutionText}</p>
            
            <h2 style="color: #10b981; margin-bottom: 0;">El Resultado Medible:</h2>
            <p style="margin-top: 5px; color: #ffffff; font-weight: bold;">${resultText}</p>
          </div>

          <p>En nuestra sesión veremos exactamente cómo estructurar una arquitectura similar adaptada a la escala y metas de tu propio negocio.</p>

          <p style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            ¡Nos vemos en breve!<br/>
            <strong style="color: #ffffff;">Javier Mujica</strong>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * CORREO 7: Recordatorio 1 Hora Antes (Ingreso Directo)
 */
export function get1hReminderEmailTemplate(name: string, meetingUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>⚡ Comenzamos en 60 minutos</title>
      <style>
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background-color: #0f172a !important; border-bottom: 2px solid #6366f1; padding: 30px 25px; text-align: center; }
        .content { padding: 30px 25px; color: #e2e8f0; }
        .card-link { background-color: #111827; border: 1px solid #4f46e5; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .btn-live { display: inline-block; padding: 14px 28px; background-color: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding-top: 20px; }
      </style>
    </head>
    <body style="background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712;">
        <tr>
          <td align="center" style="padding: 10px;">
            <table class="container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
              <!-- Header Row -->
              <tr>
                <td class="header" style="background-color: #0f172a !important; border-bottom: 2px solid #6366f1; padding: 32px 25px; text-align: center;">
                  <div style="display: inline-block; background-color: #1e1b4b; border: 1px solid #4338ca; padding: 4px 14px; border-radius: 20px; margin-bottom: 12px;">
                    <span style="color: #a5b4fc !important; -webkit-text-fill-color: #a5b4fc !important; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">⚡ RECORDATORIO 60 MINUTOS</span>
                  </div>
                  <h1 style="color: #ffffff !important; margin: 0; font-size: 22px; font-weight: 800; text-align: center; line-height: 1.3;">
                    <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">⚡ Comenzamos en 60 minutos: ${name}</span>
                  </h1>
                </td>
              </tr>
              <!-- Content Row -->
              <tr>
                <td class="content" style="padding: 30px 25px; color: #e2e8f0;">
                  <p style="margin-top: 0; font-size: 16px; color: #e2e8f0;">Hola <strong style="color: #ffffff;">${name}</strong>,</p>
                  
                  <p style="font-size: 15px; color: #cbd5e1;">En <strong style="color: #a5b4fc;">exactamente 60 minutos</strong> arrancamos nuestra sesión de consultoría estratégica.</p>
                  
                  <div class="card-link" style="background-color: #111827; border: 1px solid #4f46e5; padding: 25px; border-radius: 8px; margin: 24px 0; text-align: center;">
                    <p style="font-size: 14px; color: #94a3b8; margin-top: 0; margin-bottom: 16px;">Haz clic en el siguiente botón para conectarte a la sala:</p>
                    <a href="${meetingUrl}" class="btn-live" style="display: inline-block; padding: 14px 28px; background-color: #6366f1; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(99,102,241,0.4);" target="_blank">
                      <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">🔗 UNIRME A LA REUNIÓN AHORA</span>
                    </a>
                  </div>

                  <p style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">Recomendaciones finales:</p>
                  <ul style="padding-left: 20px; margin-top: 0; color: #cbd5e1; font-size: 14px;">
                    <li style="margin-bottom: 6px;">Conéctate desde un lugar tranquilo con buena conexión a internet.</li>
                    <li style="margin-bottom: 6px;">Si es posible, ingresa desde un computador para poder compartir pantalla si lo requerimos.</li>
                  </ul>

                  <p style="font-size: 15px; color: #e2e8f0; margin-top: 20px;">¡Todo listo de este lado! Nos vemos en minutos.</p>
                  
                  <div style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 14px;">Un saludo,</p>
                    <strong style="color: #ffffff; font-size: 16px;">Javier Mujica</strong>
                  </div>
                </td>
              </tr>
              <!-- Footer Row -->
              <tr>
                <td class="footer" style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b; padding: 20px 25px; background-color: #070a12;">
                  <p style="margin: 0;">© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * Plantilla para enviar los accesos de usuario (email y contraseña temporal) post-compra
 */
export function getVibecodeAccessCredentialsTemplate(
  name: string,
  email: string,
  tempPass: string,
  loginUrl: string = "https://www.javiermujica.com/vibecodelab"
) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Tus Accesos a la Plataforma Vibecode Lab</title>
      <style>
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
      </style>
    </head>
    <body style="background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712;">
        <tr>
          <td align="center" style="padding: 10px; background-color: #030712;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #090d16; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5);">
              
              <!-- Header Row -->
              <tr>
                <td bgcolor="#0f172a" style="background-color: #0f172a !important; border-bottom: 2px solid #6366f1; padding: 36px 25px; text-align: center;">
                  <div style="display: inline-block; background-color: #1e1b4b; border: 1px solid #4338ca; padding: 6px 16px; border-radius: 20px; margin-bottom: 14px;">
                    <span style="color: #a5b4fc !important; -webkit-text-fill-color: #a5b4fc !important; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">🚀 ACCESO OFICIAL A LA PLATAFORMA</span>
                  </div>
                  <h1 style="color: #ffffff !important; margin: 10px 0 0 0; font-size: 24px; font-weight: 900; text-align: center; line-height: 1.3;">
                    <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">🎉 ¡Bienvenido/a a Vibecode Lab!</span>
                  </h1>
                </td>
              </tr>

              <!-- Content Row -->
              <tr>
                <td bgcolor="#090d16" style="padding: 32px 28px; background-color: #090d16 !important; color: #ffffff !important;">
                  <p style="font-size: 16px; color: #ffffff !important; margin-top: 0;">
                    Hola <strong style="color: #ffffff !important;">${name}</strong>,
                  </p>
                  
                  <p style="color: #cbd5e1 !important; font-size: 15px;">
                    Tu inscripción se ha confirmado con éxito. A continuación encontrarás tus credenciales de acceso para ingresar a la plataforma privada en <strong style="color: #ffffff !important;">/vibecodelab</strong>:
                  </p>

                  <!-- Credentials Box -->
                  <div style="background-color: #0f172a !important; border: 1px solid #3730a3; border-left: 4px solid #6366f1; padding: 24px; border-radius: 12px; margin: 24px 0;">
                    <h3 style="margin-top: 0; color: #818cf8 !important; font-size: 17px; font-weight: 800; margin-bottom: 14px;">
                      <span style="color: #818cf8 !important; -webkit-text-fill-color: #818cf8 !important;">🔑 Datos de Inicio de Sesión</span>
                    </h3>
                    <p style="margin: 8px 0; font-size: 15px; color: #f8fafc !important;">
                      <strong style="color: #ffffff !important;">Correo de Login:</strong> <span style="color: #60a5fa !important; font-weight: bold;">${email}</span>
                    </p>
                    <p style="margin: 8px 0; font-size: 15px; color: #f8fafc !important;">
                      <strong style="color: #ffffff !important;">Contraseña Temporal:</strong> 
                      <code style="background-color: #1e1b4b !important; color: #f43f5e !important; -webkit-text-fill-color: #f43f5e !important; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-family: monospace; font-size: 16px; border: 1px solid #4338ca; display: inline-block;">${tempPass}</code>
                    </p>
                    <p style="margin: 14px 0 0 0; font-size: 12.5px; color: #94a3b8 !important; font-style: italic;">
                      ⚠️ Al ingresar por primera vez a la plataforma, verás una notificación emergente sugiriéndote guardar tu clave o cambiarla por una contraseña personalizada.
                    </p>
                  </div>

                  <!-- Botón Destacado 3D CTA de Ingreso a /vibecodelab -->
                  <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 32px 0;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <a href="${loginUrl}" target="_blank" style="display: inline-block; width: 90%; max-width: 450px; box-sizing: border-box; background: #4f46e5 !important; background-color: #4f46e5 !important; color: #ffffff !important; border-radius: 14px; padding: 18px 24px; font-weight: 900; font-size: 16px; text-align: center; text-decoration: none; border-bottom: 5px solid #312e81; border-top: 1px solid #818cf8; border-left: 1px solid #6366f1; border-right: 1px solid #6366f1; box-shadow: 0 8px 22px rgba(79,70,229,0.5); letter-spacing: 0.5px;">
                          <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">🚀 INGRESAR A LA PLATAFORMA (/vibecodelab) →</span>
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Calendario Oficial de Clases del Bootcamp -->
                  <div style="background-color: #0f172a !important; border: 1px solid #1e293b; border-left: 4px solid #10b981; padding: 22px; border-radius: 12px; margin-bottom: 24px;">
                    <h4 style="margin-top: 0; color: #34d399 !important; font-size: 15px; margin-bottom: 14px; font-weight: 800;">
                      <span style="color: #34d399 !important; -webkit-text-fill-color: #34d399 !important;">📅 Calendario Oficial de Clases en Vivo & Módulos:</span>
                    </h4>
                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #cbd5e1 !important;">
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #818cf8 !important;">⚡ Lección 0 (Setup de Entorno)</td>
                        <td style="padding: 10px 0; text-align: right; color: #34d399 !important; font-weight: bold;">Disponible Ahora en /vibecodelab</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">🚀 Clase 1: Fundamentos & Consola</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">🤖 Clase 2: Vibecoding & IA en Vivo</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">🗄️ Clase 3: Arquitectura & Supabase DB</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">🌐 Clase 4: APIs & Agentes Autónomos</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">💳 Clase 5: Monetización & Pasarelas de Pago</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">🎨 Clase 6: Front-end UI/UX & Freemium</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-weight: bold; color: #f8fafc !important;">🏆 Clase 7: Despliegue en Producción & Demo Day</td>
                        <td style="padding: 10px 0; text-align: right; color: #94a3b8 !important;">Miércoles · 8:00 PM (Chile)</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Features Included -->
                  <div style="background-color: #0f172a !important; border: 1px solid #1e293b; padding: 20px; border-radius: 10px; margin-bottom: 24px;">
                    <h4 style="margin-top: 0; color: #818cf8 !important; font-size: 14px; margin-bottom: 8px; font-weight: 800;">
                      <span style="color: #818cf8 !important; -webkit-text-fill-color: #818cf8 !important;">✨ Lo que encontrarás en la plataforma:</span>
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #cbd5e1 !important; font-size: 13.5px;">
                      <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Lección 0 (Setup de Entorno):</strong> Guía paso a paso, Slides interactivas y PDF oficial descargable.</li>
                      <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Clases Grabadas:</strong> Reproductor HD con navegación por timestamps y barra de progreso.</li>
                      <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Mentorías 1-a-1:</strong> Agendamiento directo sincronizado con Google Calendar.</li>
                      <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Canal Pitch & Match:</strong> Presenta tus ideas y conecta con otros estudiantes.</li>
                    </ul>
                  </div>

                  <p style="color: #cbd5e1 !important; font-size: 14px;">Si tienes cualquier duda con tu cuenta o con las fechas de las clases, puedes responder directamente a este correo.</p>
                  
                  <p style="margin-bottom: 20px; font-weight: 600; color: #ffffff !important;">¡Nos vemos en la plataforma!</p>
                  <p style="margin: 0; color: #ffffff !important;">Saludos cordiales,<br/><strong style="color: #ffffff !important;">Javier Mujica</strong></p>
                </td>
              </tr>

              <!-- Footer Row -->
              <tr>
                <td bgcolor="#070a12" style="text-align: center; color: #94a3b8 !important; font-size: 12px; border-top: 1px solid #1e293b; padding: 24px; background-color: #070a12 !important;">
                  <p style="margin: 0; color: #64748b !important;">© 2026 Vibecode Lab. Todos los derechos reservados.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * Plantilla para anunciar a los alumnos la liberación Open Source de javiermujica.com
 * y el Premio Exclusivo (Edición Alumni Pro) al completar el 100% de la formación.
 */
export function getVibecodeOpenSourceAnnouncementTemplate(
  name: string,
  progressPercent: number = 0,
  loginUrl: string = "https://www.javiermujica.com/vibecodelab"
) {
  const isCompleted = progressPercent >= 100
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>🏆 Tu Premio de Graduación en Vibecode Lab: Edición Alumni Pro</title>
    </head>
    <body style="background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712;">
        <tr>
          <td align="center" style="padding: 10px; background-color: #030712;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #090d16; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.6);">
              
              <!-- Header -->
              <tr>
                <td bgcolor="#0f172a" style="background: linear-gradient(135deg, #1e1b4b 0%, #090d16 60%, #422006 100%) !important; border-bottom: 2px solid #f59e0b; padding: 36px 25px; text-align: center;">
                  <div style="display: inline-block; background-color: #451a03; border: 1px solid #d97706; padding: 6px 16px; border-radius: 20px; margin-bottom: 14px;">
                    <span style="color: #fcd34d !important; -webkit-text-fill-color: #fcd34d !important; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">🎁 ANUNCIO ESPECIAL PARA ALUMNOS</span>
                  </div>
                  <h1 style="color: #ffffff !important; margin: 8px 0 0 0; font-size: 24px; font-weight: 900; text-align: center; line-height: 1.3;">
                    <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">Liberé mi Plataforma al Mundo... pero guardé la <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important;">Bóveda Pro</span> como tu Premio de Graduación 🏆</span>
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td bgcolor="#090d16" style="padding: 32px 28px; background-color: #090d16 !important; color: #e2e8f0 !important;">
                  <p style="font-size: 16px; color: #ffffff !important; margin-top: 0;">
                    Hola <strong style="color: #ffffff !important;">${name}</strong>,
                  </p>

                  <p style="color: #cbd5e1 !important; font-size: 15px;">
                    Anoche tomé una decisión importante: decidí liberar una versión base de la plataforma de <strong style="color: #ffffff !important;">javiermujica.com</strong> como repositorio Open Source público en GitHub para aportar a toda la comunidad de creadores y desarrolladores.
                  </p>

                  <p style="color: #cbd5e1 !important; font-size: 15px;">
                    Pero inmediatamente pensé en ti y en quienes apostaron por formarse conmigo en <strong style="color: #818cf8 !important;">Vibecode Lab</strong>. No quería simplemente darles lo mismo que tendrá todo el mundo en GitHub. Quería que terminar la formación tuviera una <strong style="color: #fbbf24 !important;">recompensa real, injusta y de altísimo valor comercial</strong>.
                  </p>

                  <!-- Dual Edition Comparison Box -->
                  <div style="background-color: #0f172a !important; border: 1px solid #334155; border-radius: 12px; padding: 22px; margin: 24px 0;">
                    <h3 style="margin-top: 0; color: #ffffff !important; font-size: 16px; font-weight: 800; margin-bottom: 14px;">
                      ⚡ ¿Cuál es la diferencia entre la versión Pública y tu Premio Alumni Pro?
                    </h3>
                    
                    <p style="margin: 0 0 12px 0; font-size: 13.5px; color: #94a3b8 !important;">
                      🌍 <strong style="color: #e2e8f0 !important;">Edición Pública (Community Starter en GitHub):</strong><br/>
                      Incluye solo el esqueleto base (reproductor R2, estructura LMS limpia y widget de chat básico) pensado como plantilla de estudio.
                    </p>

                    <div style="background-color: #1e1b4b !important; border: 1px solid #f59e0b; border-left: 4px solid #f59e0b; border-radius: 10px; padding: 16px; margin-top: 14px;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #fbbf24 !important;">
                        🏆 Tu Premio Exclusivo: Edición Alumni Pro (Desbloqueable al 100% del curso)
                      </p>
                      <ul style="margin: 0; padding-left: 18px; color: #e2e8f0 !important; font-size: 13.5px;">
                        <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Pack Completo de Pasarelas LATAM & Global:</strong> Integración lista para producción con Transbank Webpay Plus, Flow.cl, Mercado Pago, PayPal y flujo de abonos/transferencias.</li>
                        <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Cerebro Comercial IA "Unicornio":</strong> Mis System Prompts reales de cierre de ventas, manejo de objeciones, control de cuotas de tokens y agendamiento directo en Google Calendar + Google Meet.</li>
                        <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Motor de Automatización SEO, Marketing & CRM:</strong> Generador automático de artículos de blog con IA, Bot de Instagram, creador de Deeplinks UTM y tablero Kanban de leads.</li>
                        <li style="margin-bottom: 6px;"><strong style="color: #ffffff !important;">Destacado en el "Wall of Builders" de GitHub:</strong> Tu MVP certificado aparecerá con enlace directo en el README público oficial frente a miles de desarrolladores e inversores.</li>
                      </ul>
                    </div>
                  </div>

                  <!-- Progress Status Box -->
                  <div style="background-color: #0f172a !important; border: 1px solid ${isCompleted ? "#10b981" : "#6366f1"}; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: ${isCompleted ? "#34d399" : "#a5b4fc"} !important; font-weight: 800;">
                      ${isCompleted ? "🎉 ¡YA TIENES EL 100% COMPLETADO!" : `📊 TU PROGRESO ACTUAL: ${progressPercent}% COMPLETADO`}
                    </p>
                    <p style="margin: 0; font-size: 14.5px; color: #f8fafc !important;">
                      ${
                        isCompleted
                          ? "¡Tu cofre Alumni Pro ya está desbloqueado y esperándote dentro de la pestaña <strong>🏆 Premio Alumni Pro</strong> en la plataforma!"
                          : "Entra a la plataforma, completa las clases pendientes hasta llegar al <strong>100%</strong> y el cofre se abrirá automáticamente en tu panel."
                      }
                    </p>
                  </div>

                  <!-- CTA Button -->
                  <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${loginUrl}" target="_blank" style="display: inline-block; width: 90%; max-width: 440px; box-sizing: border-box; background: #f59e0b !important; background-color: #f59e0b !important; color: #090d16 !important; border-radius: 12px; padding: 16px 24px; font-weight: 900; font-size: 15px; text-align: center; text-decoration: none; border-bottom: 4px solid #b45309; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);">
                          <span style="color: #090d16 !important; -webkit-text-fill-color: #090d16 !important;">🏆 IR A MI PANEL Y RECLAMAR MI PREMIO →</span>
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #94a3b8 !important; font-size: 14px; margin-top: 24px;">
                    Gracias por ser parte de la primera línea de constructores de Vibecode Lab. ¡Vamos por ese 100% y a lanzar tu plataforma a producción!
                  </p>

                  <p style="margin: 0; color: #ffffff !important;">
                    Un abrazo,<br/>
                    <strong style="color: #ffffff !important;">Javier Mujica</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td bgcolor="#070a12" style="text-align: center; color: #64748b !important; font-size: 12px; border-top: 1px solid #1e293b; padding: 22px; background-color: #070a12 !important;">
                  <p style="margin: 0;">© 2026 Vibecode Lab · javiermujica.com</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * Plantilla automática cuando el alumno alcanza el 100% de las clases en /vibecodelab
 */
export function getVibecodeGraduationRewardUnlockedTemplate(
  name: string,
  loginUrl: string = "https://www.javiermujica.com/vibecodelab"
) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🔓 ¡Desbloqueaste la Bóveda Alumni Pro! (100% Completado)</title>
    </head>
    <body style="background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712;">
        <tr>
          <td align="center" style="padding: 10px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #090d16; border: 1px solid #10b981; border-radius: 16px; overflow: hidden;">
              <tr>
                <td bgcolor="#064e3b" style="background: linear-gradient(135deg, #064e3b 0%, #090d16 100%) !important; border-bottom: 2px solid #10b981; padding: 32px 25px; text-align: center;">
                  <div style="display: inline-block; background-color: #065f46; border: 1px solid #34d399; padding: 5px 14px; border-radius: 20px; margin-bottom: 12px;">
                    <span style="color: #a7f3d0 !important; font-size: 12px; font-weight: 800; text-transform: uppercase;">🎉 100% COMPLETADO · PREMIO DESBLOQUEADO</span>
                  </div>
                  <h1 style="color: #ffffff !important; margin: 6px 0 0 0; font-size: 23px; font-weight: 900;">
                    🏆 ¡Felicitaciones, ${name}! Has desbloqueado la Edición Alumni Pro
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 26px; color: #e2e8f0;">
                  <p style="margin-top: 0; font-size: 15.5px;">
                    Acabas de completar el <strong style="color: #34d399;">100% de las clases</strong> de Vibecode Lab. Como premio por terminar la formación, tu acceso a la <strong>Bóveda Alumni Pro de javiermujica.com</strong> ya está abierto en tu panel de estudiante.
                  </p>
                  <div style="background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; font-weight: 800; color: #34d399;">🔓 Ya puedes acceder en la pestaña "🏆 Premio Alumni Pro" a:</p>
                    <ul style="margin: 0; padding-left: 18px; font-size: 13.5px; color: #cbd5e1;">
                      <li><strong>Blueprint & Suite Pro Completa:</strong> Pasarelas LATAM (Webpay, Flow, Mercado Pago, PayPal), Motor SEO con IA y CRM Kanban.</li>
                      <li><strong>Prompt Maestro White-Label:</strong> Personaliza colores, marca y agentes IA en 5 minutos.</li>
                      <li><strong>Postulación al Wall of Builders + Certificado QR:</strong> Envía tu MVP para aparecer en el repositorio oficial de GitHub.</li>
                    </ul>
                  </div>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #052e16 !important; font-weight: 900; padding: 15px 28px; border-radius: 10px; text-decoration: none; font-size: 15px;">
                      🔓 ACCEDER A MI BÓVEDA ALUMNI PRO →
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #94a3b8; margin-bottom: 0;">
                    ¡Un orgullo tenerte entre los graduados de Vibecode Lab!<br/>
                    <strong style="color: #ffffff;">Javier Mujica</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}



