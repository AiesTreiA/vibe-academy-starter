import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import {
  getVibecodeWelcomeTemplate,
  getVibecodeAbonoTemplate,
  getVibecodeBalanceRequestTemplate,
  getClientConfirmationTemplate,
  get24hReminderEmailTemplate,
  get1hReminderEmailTemplate,
  getClientRescheduleTemplate,
  getAdminNotificationTemplate,
  getObjection1EmailTemplate,
  getObjection2EmailTemplate,
  getObjection3EmailTemplate,
  getObjection4EmailTemplate,
  getNicheCaseStudyEmailTemplate,
  getTrelloResourceTemplate,
} from "@/lib/email-service"

export const dynamic = "force-dynamic"

const TEMPLATE_LIST = [
  // Vibecode Lab
  { id: "vibecode-welcome", title: "Vibecode Lab: Correo de Bienvenida (Inscripción Completa)", category: "Vibecode Lab" },
  { id: "vibecode-abono", title: "Vibecode Lab: Confirmación de Abono / Pie Inicial", category: "Vibecode Lab" },
  { id: "vibecode-balance", title: "Vibecode Lab: Solicitud de Saldo Pendiente", category: "Vibecode Lab" },

  // Masterclasses
  { id: "masterclass-confirmation", title: "Masterclass: Confirmación de Inscripción", category: "Masterclasses" },
  { id: "masterclass-reminder-24h", title: "Masterclass: Recordatorio 24 Horas Antes", category: "Masterclasses" },
  { id: "masterclass-reminder-1h", title: "Masterclass: Recordatorio 1 Hora Antes", category: "Masterclasses" },
  { id: "masterclass-reminder-10m", title: "Masterclass: Recordatorio 10 Minutos Antes (¡En Vivo!)", category: "Masterclasses" },

  // Consultoría
  { id: "client-confirmation", title: "Consultoría: Confirmación de Reserva de Sesión", category: "Consultoría" },
  { id: "reminder-24h", title: "Consultoría: Recordatorio 24 Horas Antes", category: "Consultoría" },
  { id: "reminder-1h", title: "Consultoría: Recordatorio 1 Hora Antes", category: "Consultoría" },
  { id: "client-reschedule", title: "Consultoría: Reagendamiento de Sesión", category: "Consultoría" },
  { id: "admin-notification", title: "Sistema: Notificación Interna para Admin", category: "Consultoría" },

  // Nutrición & Pre-selling
  { id: "objection-1", title: "Nutrición: Objeción 1 — 'No tengo tiempo suficiente'", category: "Nutrición & Pre-selling" },
  { id: "objection-2", title: "Nutrición: Objeción 2 — 'No soy técnico / No sé programar'", category: "Nutrición & Pre-selling" },
  { id: "objection-3", title: "Nutrición: Objeción 3 — '¿Por qué Vibe Coding en vez de contratar?'", category: "Nutrición & Pre-selling" },
  { id: "objection-4", title: "Nutrición: Objeción 4 — Garantía y Casos de Éxito", category: "Nutrición & Pre-selling" },
  { id: "niche-case-study", title: "Nutrición: Caso de Estudio por Nicho", category: "Nutrición & Pre-selling" },

  // Recursos
  { id: "trello-resource", title: "Recursos: Entrega de Tablero Trello", category: "Recursos & Materiales" },
]

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const templateId = url.searchParams.get("template") || "vibecode-welcome"
  const name = url.searchParams.get("name") || "Jorge Catalán"
  const format = url.searchParams.get("format") || "html"

  if (templateId === "list") {
    return NextResponse.json({ success: true, templates: TEMPLATE_LIST })
  }

  let html = ""
  let subject = ""
  let from = "Javier Mujica Consultoría <hola@javiermujica.com>"

  try {
    switch (templateId) {
      case "vibecode-welcome":
        subject = "🎉 ¡Te damos la bienvenida a VIBECODE LAB!"
        html = getVibecodeWelcomeTemplate(name)
        break

      case "vibecode-abono":
        subject = "🎉 ¡Abono Recibido! Tu cupo en Vibecode Lab está Reservado"
        html = getVibecodeAbonoTemplate(name, 50000, 150000)
        break

      case "vibecode-balance":
        subject = "⏳ Recordatorio: Completa el saldo de tu inscripción en Vibecode Lab"
        html = getVibecodeBalanceRequestTemplate(name, 50000, 150000, "demo-reg-id")
        break

      case "masterclass-confirmation":
      case "masterclass-reminder-24h":
      case "masterclass-reminder-1h":
      case "masterclass-reminder-10m": {
        const mcKey = templateId.replace("masterclass-", "").replace("-", "_")
        const supabase = getSupabaseAdminClient() as any
        const { data: dbTpl } = await supabase
          .from("masterclass_templates")
          .select("*")
          .eq("id", mcKey)
          .maybeSingle()

        const masterclassTitle = "Ciberseguridad en Vibe Coding"
        const meetUrl = "https://meet.google.com/jmg-iqxe-eay"
        const calUrl = "https://calendar.google.com"

        if (dbTpl && dbTpl.html) {
          subject = dbTpl.subject
            .replace(/{{name}}/g, name)
            .replace(/{{title}}/g, masterclassTitle)
            .replace(/{{date}}/g, "Miércoles 26 de Agosto a las 20:00")
            .replace(/{{meetUrl}}/g, meetUrl)
            .replace(/{{calUrl}}/g, calUrl)

          html = dbTpl.html
            .replace(/{{name}}/g, name)
            .replace(/{{title}}/g, masterclassTitle)
            .replace(/{{date}}/g, "Miércoles 26 de Agosto a las 20:00")
            .replace(/{{meetUrl}}/g, meetUrl)
            .replace(/{{calUrl}}/g, calUrl)
        } else {
          subject = `🚀 [Masterclass] ${masterclassTitle}`
          html = getVibecodeWelcomeTemplate(name)
        }
        break
      }

      case "client-confirmation":
        subject = "✅ Reunión Confirmada - Javier Mujica Consultoría"
        html = getClientConfirmationTemplate(
          {
            name,
            email: "jhcatalang@gmail.com",
            phone: "+56912345678",
            company: "Empresa Demo",
            meeting_time_formatted: "Miércoles 26 de Agosto a las 20:00 (Chile)",
          },
          new Date(),
          { service_type: "Consultoría 1 a 1" }
        )
        break

      case "reminder-24h":
        subject = "⏰ Recordatorio: Nuestra sesión es mañana"
        html = get24hReminderEmailTemplate(
          name,
          "Mañana a las 20:00 (Chile)",
          "https://meet.google.com/jmg-iqxe-eay",
          "https://calendar.google.com"
        )
        break

      case "reminder-1h":
        subject = "⏳ ¡Comenzamos en 1 hora! - Enlace de Google Meet"
        html = get1hReminderEmailTemplate(name, "https://meet.google.com/jmg-iqxe-eay")
        break

      case "client-reschedule":
        subject = "🔄 Reagendamiento de Sesión - Javier Mujica Consultoría"
        html = getClientRescheduleTemplate(
          { name, email: "jhcatalang@gmail.com" },
          new Date()
        )
        break

      case "admin-notification":
        subject = `🔔 [NUEVA RESERVA] ${name}`
        from = "Sistema Consultoría <hola@javiermujica.com>"
        html = getAdminNotificationTemplate(
          { name, email: "jhcatalang@gmail.com", phone: "+56912345678", message: "Consulta sobre Vibecode Lab" },
          { service_type: "Consultoría 1 a 1" },
          new Date()
        )
        break

      case "objection-1":
        subject = "💡 ¿No tienes tiempo para programar? Esto te interesa"
        from = "Javier Mujica <hola@javiermujica.com>"
        html = getObjection1EmailTemplate(name)
        break

      case "objection-2":
        subject = "💡 ¿Crees que necesitas ser programador para usar Vibe Coding?"
        from = "Javier Mujica <hola@javiermujica.com>"
        html = getObjection2EmailTemplate(name)
        break

      case "objection-3":
        subject = "💡 ¿Contratar a un programador o construirlo tú mismo con IA?"
        from = "Javier Mujica <hola@javiermujica.com>"
        html = getObjection3EmailTemplate(name)
        break

      case "objection-4":
        subject = "💡 Resultados reales construyendo software con IA (+ Garantía)"
        from = "Javier Mujica <hola@javiermujica.com>"
        html = getObjection4EmailTemplate(name)
        break

      case "niche-case-study":
        subject = "📊 Caso de Estudio: Cómo automatizar sistemas en tu industria"
        from = "Javier Mujica <hola@javiermujica.com>"
        html = getNicheCaseStudyEmailTemplate(name, "Desarrollo con IA", "Tecnología")
        break

      case "trello-resource":
        subject = "📋 Aquí tienes tu plantilla y recursos exclusivos de Trello"
        from = "Javier Mujica <hola@javiermujica.com>"
        html = getTrelloResourceTemplate(name)
        break

      default:
        subject = "🎉 ¡Te damos la bienvenida a VIBECODE LAB!"
        html = getVibecodeWelcomeTemplate(name)
        break
    }
  } catch (err: any) {
    console.error("Error generating email preview:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }

  if (format === "json") {
    return NextResponse.json({
      success: true,
      templateId,
      name,
      subject,
      from,
      html,
    })
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Email-Subject": encodeURIComponent(subject),
      "X-Email-From": encodeURIComponent(from),
    },
  })
}
