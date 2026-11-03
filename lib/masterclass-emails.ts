import { sendEmail } from "./email-service"
import { getSupabaseAdminClient } from "./supabase"

export async function renderMasterclassTemplate(
  templateId: string,
  replacements: { name: string; title: string; date?: string; meetUrl?: string }
): Promise<{ subject: string; html: string }> {
  let subject = ""
  let html = ""

  // Fallback defaults
  if (templateId === "registration") {
    subject = "🚀 Inscripción Confirmada - Masterclass: {{title}}"
    html = getMasterclassRegistrationTemplate(
      replacements.name,
      replacements.title,
      replacements.date || "",
      replacements.meetUrl || ""
    )
  } else if (templateId === "reminder_6h") {
    subject = "🔔 Hoy nos vemos en vivo: Masterclass de {{title}}"
    html = getMasterclass6hReminderTemplate(
      replacements.name,
      replacements.title,
      replacements.date || ""
    )
  } else if (templateId === "reminder_1h") {
    subject = "⚡ Comenzamos en 60 minutos: {{title}}"
    html = getMasterclass1hReminderTemplate(
      replacements.name,
      replacements.title,
      replacements.meetUrl || ""
    )
  } else if (templateId === "reminder_10m") {
    subject = "🔥 ¡Partimos en 10 minutos! Únete ya a {{title}}"
    html = getMasterclass10mReminderTemplate(
      replacements.name,
      replacements.title,
      replacements.meetUrl || ""
    )
  }

  try {
    const supabase = getSupabaseAdminClient() as any
    const { data, error } = await supabase
      .from("masterclass_templates")
      .select("subject, html")
      .eq("id", templateId)
      .maybeSingle()

    if (!error && data) {
      subject = data.subject
      html = data.html
    }
  } catch (dbErr) {
    console.warn("[MASTERCLASS EMAILS] Fallback to hardcoded template due to DB error:", dbErr)
  }

  // Replace placeholders in subject and html
  const replaceAll = (text: string) => {
    const mcDetails = MASTERCLASSES_CONFIG[replacements.title]
    const calUrl = mcDetails ? generateMasterclassCalendarUrl(replacements.title, mcDetails.date, mcDetails.meet) : "https://calendar.google.com"

    return text
      .replace(/{{name}}/g, replacements.name)
      .replace(/{{title}}/g, replacements.title)
      .replace(/{{date}}/g, replacements.date || "")
      .replace(/{{meetUrl}}/g, replacements.meetUrl || "")
      .replace(/{{calUrl}}/g, calUrl)
  }

  return {
    subject: replaceAll(subject),
    html: replaceAll(html)
  }
}

export function generateMasterclassCalendarUrl(title: string, dateIso: string, meetUrl: string): string {
  try {
    const start = new Date(dateIso)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hora de duración

    const formatUTC = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const dates = `${formatUTC(start)}/${formatUTC(end)}`
    const eventTitle = encodeURIComponent(`Masterclass: ${title}`)
    
    // Descripción simple sin saltos de línea crudos para evitar que los clientes de correo corten la URL
    const detailsText = `Videollamada de acceso (Google Meet): ${meetUrl}`
    const details = encodeURIComponent(detailsText)
    const location = encodeURIComponent(meetUrl)

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dates}&details=${details}&location=${location}`
  } catch (error) {
    console.error("Error generating masterclass calendar URL:", error)
    return "https://calendar.google.com"
  }
}

export const MASTERCLASSES_CONFIG: Record<string, { date: string; meet: string; description: string }> = {
  "Ciberseguridad en Vibe Coding": {
    date: "2026-08-03T21:00:00-04:00",
    meet: "https://meet.google.com/hbw-dmwp-bgs",
    description: "Aprende a proteger tus entornos de desarrollo en vivo y flujos automáticos contra las vulnerabilidades más comunes al programar con IA en tiempo real."
  },
  "Optimización de Tokens y Contexto": {
    date: "2026-08-10T21:00:00-04:00",
    meet: "https://meet.google.com/mzj-hhsp-avj",
    description: "Domina las técnicas para reducir costos, optimizar ventanas de contexto de LLMs y estructurar prompts avanzados para respuestas ultra-precisas."
  },
  "Chatbot Inteligente y Automatización": {
    date: "2026-08-17T21:00:00-04:00",
    meet: "https://meet.google.com/oiz-teks-spz",
    description: "Construye asistentes conversacionales de alto nivel e intégralos con APIs (Make, n8n) para coordinar tareas automatizadas sin intervención humana."
  },
  "Sitebuilder con Despliegue en Vivo": {
    date: "2026-08-24T21:00:00-04:00",
    meet: "https://meet.google.com/jdp-dbyf-oyp",
    description: "Descubre cómo estructurar un constructor de sitios web modular y desplegarlo en servidores productivos en tiempo récord usando automatizaciones."
  }
}

// Helper to format Chilean date
export function formatChileanDateString(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

// 1. Email de registro exitoso (Inmediato)
export function getMasterclassRegistrationTemplate(name: string, title: string, dateStr: string, meetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registro Confirmado - Masterclass: ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .cta-container { text-align: center; margin: 25px 0; }
        .cta-button { background: #6366f1; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 15px; }
        .whatsapp-container { background-color: #022c22; border: 1px solid #064e3b; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .whatsapp-button { background-color: #25D366; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        h2, h3 { color: #6366f1; margin-top: 0; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px; color: #ffffff !important;">🚀 ¡Inscripción Confirmada!</h1>
          <p style="margin: 5px 0 0 0; color: #a3b8cc; font-size: 14px;">Masterclass: ${title}</p>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Tu inscripción para la masterclass gratuita ha sido registrada con éxito. A continuación encuentras los detalles para unirte a la sesión en vivo:</p>

          <div class="highlight">
            <h3>🗓️ Detalles del Evento</h3>
            <p><strong>Tema:</strong> ${title}</p>
            <p><strong>Fecha y Hora:</strong> ${formatChileanDateString(dateStr)} (Chile)</p>
            <p><strong>Plataforma:</strong> Google Meet</p>
          </div>

          <div class="cta-container">
            <a href="${meetUrl}" class="cta-button" target="_blank">Guardar Enlace de Google Meet</a>
          </div>

          <div class="whatsapp-container">
            <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 14px;">💬 Únete al grupo exclusivo de WhatsApp</p>
            <p style="margin: 5px 0 10px 0; font-size: 12px; color: #9ca3af;">Recibe materiales complementarios, avisos rápidos de acceso y comparte con otros alumnos en vivo.</p>
            <a href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH" class="whatsapp-button" target="_blank">Unirme al Grupo de WhatsApp</a>
          </div>

          <p>Te enviaremos recordatorios por correo para que no te pierdas el inicio de la clase (6 horas, 1 hora y 10 minutos antes de comenzar).</p>

          <p>¡Nos vemos pronto!</p>
          <p>Saludos cordiales,<br>Javier Mujica</p>
        </div>
        <div class="footer">
          <p>Javier Mujica Consultoría - Inteligencia Artificial y Automatización</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// 2. Email Recordatorio 6 Horas Antes
export function getMasterclass6hReminderTemplate(name: string, title: string, dateStr: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recordatorio: Hoy es la Masterclass de ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .whatsapp-container { background-color: #022c22; border: 1px solid #064e3b; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .whatsapp-button { background-color: #25D366; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        h2, h3 { color: #6366f1; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px; color: #ffffff !important;">🔔 Hoy nos vemos en vivo</h1>
          <p style="margin: 5px 0 0 0; color: #a3b8cc; font-size: 14px;">Masterclass: ${title}</p>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Este es un recordatorio de que hoy realizaremos la masterclass <strong>${title}</strong> en vivo.</p>

          <div class="highlight">
            <h3>⏰ Horario de la Clase</h3>
            <p><strong>Inicio:</strong> ${formatChileanDateString(dateStr)} (Chile)</p>
            <p style="margin-top: 10px; margin-bottom: 0;">
              <a href="{{calUrl}}" style="color: #6366f1; text-decoration: underline; font-size: 13px; font-weight: bold;" target="_blank">📅 Agregar a Google Calendar</a>
            </p>
          </div>

          <div class="whatsapp-container">
            <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 14px;">💬 Únete al grupo exclusivo de WhatsApp</p>
            <p style="margin: 5px 0 10px 0; font-size: 12px; color: #9ca3af;">Recibe materiales complementarios, avisos rápidos de acceso y comparte con otros alumnos en vivo.</p>
            <a href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH" class="whatsapp-button" target="_blank">Unirme al Grupo de WhatsApp</a>
          </div>

          <p>Prepárate y ten a mano tus apuntes. En 5 horas te enviaremos el enlace directo de acceso para conectarte a la sesión.</p>

          <p>¡Te esperamos!</p>
          <p>Saludos cordiales,<br>Javier Mujica</p>
        </div>
        <div class="footer">
          <p>Javier Mujica Consultoría - Inteligencia Artificial y Automatización</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// 3. Email Recordatorio 1 Hora Antes
export function getMasterclass1hReminderTemplate(name: string, title: string, meetUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>Comenzamos en 1 hora: ${title}</title>
      <style>
        :root { color-scheme: light dark; supported-color-schemes: light dark; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
        .header { background-color: #0f172a !important; border-bottom: 2px solid #10b981; padding: 30px 25px; text-align: center; }
        .content { padding: 25px; background-color: #0b0f19; color: #d1d5db; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .cta-container { text-align: center; margin: 25px 0; }
        .cta-button { background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 15px; }
        .whatsapp-container { background-color: #022c22; border: 1px solid #064e3b; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .whatsapp-button { background-color: #25D366; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body style="background-color: #030712; color: #f3f4f6; margin: 0; padding: 20px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712;">
        <tr>
          <td align="center" style="padding: 10px;">
            <table class="container" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden;">
              <tr>
                <td class="header" style="background-color: #0f172a !important; border-bottom: 2px solid #10b981; padding: 30px 25px; text-align: center;">
                  <h1 style="margin: 0; font-size: 22px; color: #ffffff !important; font-weight: 800;"><span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">⚡ Todo listo: Iniciamos en 60 minutos</span></h1>
                  <p style="margin: 5px 0 0 0; color: #a3b8cc !important; font-size: 14px;"><span style="color: #a3b8cc !important; -webkit-text-fill-color: #a3b8cc !important;">Masterclass: ${title}</span></p>
                </td>
              </tr>
              <tr>
                <td class="content" style="padding: 25px; background-color: #0b0f19; color: #d1d5db;">
                  <p style="color: #f3f4f6;">Hola <strong style="color: #ffffff;">${name}</strong>,</p>
                  
                  <p style="color: #d1d5db;">Estamos a solo una hora de dar inicio a la masterclass en vivo. Asegúrate de tener una buena conexión y haz clic en el siguiente botón para unirte a la sala:</p>

                  <div class="cta-container" style="text-align: center; margin: 25px 0;">
                    <a href="${meetUrl}" class="cta-button" style="background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 15px;" target="_blank"><span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">Entrar a la Masterclass</span></a>
                    <div style="margin-top: 12px;">
                      <a href="{{calUrl}}" style="color: #34d399; text-decoration: underline; font-size: 13px; font-weight: bold;" target="_blank">📅 Guardar en Google Calendar</a>
                    </div>
                  </div>

                  <div class="highlight" style="background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb;">
                    <p style="margin: 0;"><strong>Enlace alternativo:</strong> <a href="${meetUrl}" target="_blank" style="color: #60a5fa;">${meetUrl}</a></p>
                  </div>

                  <div class="whatsapp-container" style="background-color: #022c22; border: 1px solid #064e3b; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 14px;">💬 Únete al grupo exclusivo de WhatsApp</p>
                    <p style="margin: 5px 0 10px 0; font-size: 12px; color: #9ca3af;">Recibe materiales complementarios, avisos rápidos de acceso y comparte con otros alumnos en vivo.</p>
                    <a href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH" class="whatsapp-button" style="background-color: #25D366; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px; margin-top: 10px;" target="_blank"><span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;">Unirme al Grupo de WhatsApp</span></a>
                  </div>

                  <p style="color: #d1d5db;">Nos vemos en breve.</p>
                  <p style="color: #d1d5db;">Saludos cordiales,<br><strong style="color: #ffffff;">Javier Mujica</strong></p>
                </td>
              </tr>
              <tr>
                <td class="footer" style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #1e293b; background-color: #070a12;">
                  <p style="margin: 0;">Javier Mujica Consultoría - Inteligencia Artificial y Automatización</p>
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

// 4. Email Recordatorio 10 Minutos Antes
export function getMasterclass10mReminderTemplate(name: string, title: string, meetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>¡Partimos en 10 minutos! Únete ya a ${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #b91c1c 0%, #0f172a 100%); border-bottom: 1px solid #1e293b; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 25px; background-color: #090d16; color: #d1d5db; }
        .highlight { background-color: #111827; border: 1px solid #1e293b; padding: 15px; border-radius: 6px; margin: 15px 0; color: #e5e7eb; }
        .cta-container { text-align: center; margin: 25px 0; }
        .cta-button { background: #ef4444; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 15px; }
        .whatsapp-container { background-color: #022c22; border: 1px solid #064e3b; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .whatsapp-button { background-color: #25D366; color: white !important; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        h2, h3 { color: #ef4444; margin-top: 0; }
        a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px; color: #ffffff !important;">🔥 ¡Partimos en 10 minutos!</h1>
          <p style="margin: 5px 0 0 0; color: #a3b8cc; font-size: 14px;">Masterclass: ${title}</p>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Ya estamos abriendo la sala de transmisión en vivo. Conéctate ahora haciendo clic en el botón de abajo para no perderte ni un minuto:</p>

          <div class="cta-container">
            <a href="${meetUrl}" class="cta-button" target="_blank">Unirme en Google Meet</a>
            <div style="margin-top: 12px;">
              <a href="{{calUrl}}" style="color: #ef4444; text-decoration: underline; font-size: 13px; font-weight: bold;" target="_blank">📅 Guardar en Google Calendar</a>
            </div>
          </div>

          <div class="whatsapp-container">
            <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 14px;">💬 Únete al grupo exclusivo de WhatsApp</p>
            <p style="margin: 5px 0 10px 0; font-size: 12px; color: #9ca3af;">Recibe materiales complementarios, avisos rápidos de acceso y comparte con otros alumnos en vivo.</p>
            <a href="https://chat.whatsapp.com/E23kOon1Uuj9eKEUQ3rhKH" class="whatsapp-button" target="_blank">Unirme al Grupo de WhatsApp</a>
          </div>

          <p>¡Entra ya a la sesión!</p>
          <p>Saludos cordiales,<br>Javier Mujica</p>
        </div>
        <div class="footer">
          <p>Javier Mujica Consultoría - Inteligencia Artificial y Automatización</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getMasterclassAdminNotificationTemplate(name: string, email: string, title: string, dateStr: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva Inscripción Masterclass - ${name}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #030712; color: #f3f4f6; padding: 20px 0; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; }
        .header { background: #111827; border-bottom: 1px solid #1e293b; padding: 20px; text-align: center; }
        .content { padding: 25px; color: #d1d5db; }
        .highlight { background-color: #161b22; border: 1px solid #30363d; padding: 15px; border-radius: 6px; margin: 15px 0; color: #c9d1d9; }
        h2 { color: #58a6ff; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 20px; color: #ffffff;">🎯 Nueva Inscripción a Masterclass</h1>
        </div>
        <div class="content">
          <p>Hola Javier,</p>
          <p>Se ha registrado un nuevo participante para el ciclo de Masterclasses:</p>
          
          <div class="highlight">
            <h2>📋 Datos del Inscrito</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Masterclasses:</strong> ${title}</p>
            <div style="margin-top: 15px;">
              <p style="margin: 0 0 5px 0;"><strong>Detalles de Inscripción:</strong></p>
              ${dateStr}
            </div>
          </div>
          
          <p>El registro ya se encuentra almacenado en la base de datos de Supabase y visible en tu panel de administración.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

