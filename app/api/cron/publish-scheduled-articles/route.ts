import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { triggerDistributionWebhook } from "@/lib/webhook"
import { sendEmail } from "@/lib/email-service"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Autenticación de seguridad para el Cron (soporta header Authorization o parámetro ?secret=)
  const authHeader = request.headers.get("authorization")
  const urlToken = request.nextUrl.searchParams.get("secret")
  
  const requestToken = authHeader ? authHeader.replace("Bearer ", "").trim() : (urlToken || "").trim()

  const validSecrets = [
    process.env.CRON_SECRET,
    process.env.VERCEL_CRON_SECRET,
    "c0ead65755945a69bcd9a51590a086b6cd95fa1b4303ca97d5837411547449ec",
    "jm_seo_cron_secret_737441ad761c"
  ].filter(Boolean)
  
  const isAuthorized = validSecrets.includes(requestToken)

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient() as any
  const now = new Date()
  
  // Obtener fecha actual en zona horaria America/Santiago para verificación exacta de días
  const formatter = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
  
  const formattedParts = formatter.formatToParts(now)
  let year = ""
  let month = ""
  let day = ""
  
  for (const part of formattedParts) {
    if (part.type === "year") year = part.value
    else if (part.type === "month") month = part.value
    else if (part.type === "day") day = part.value
  }
  
  const dateChileStr = `${year}-${month}-${day}` // Formato YYYY-MM-DD local en Santiago
  
  try {
    console.log(`[CRON ARTÍCULOS] Ejecutando publicador en fecha local Chile: ${dateChileStr}`)
    
    // 1. Buscar y publicar artículos agendados que deban salir hoy o antes
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "scheduled")
      .lte("created_at", now.toISOString())

    if (fetchError) {
      console.error("[CRON ARTÍCULOS] Error fetching scheduled articles:", fetchError)
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 })
    }

    let publishedCount = 0

    if (scheduledArticles && scheduledArticles.length > 0) {
      console.log(`[CRON ARTÍCULOS] Encontrados ${scheduledArticles.length} artículos para publicar.`)
      
      for (const article of scheduledArticles) {
        console.log(`[CRON ARTÍCULOS] Publicando artículo: "${article.title}"...`)
        
        // Actualizar estado en Supabase
        const { error: updateError } = await supabase
          .from("articles")
          .update({ status: "published", updated_at: now.toISOString() })
          .eq("id", article.id)

        if (updateError) {
          console.error(`[CRON ARTÍCULOS] Error al publicar ID ${article.id}:`, updateError)
          continue
        }

        // Lanzar el webhook de distribución a Make / LinkedIn
        const updatedArticle = { ...article, status: "published" }
        try {
          await triggerDistributionWebhook(updatedArticle)
          publishedCount++
        } catch (webhookErr) {
          console.error(`[CRON ARTÍCULOS] Error en webhook de distribución para ID ${article.id}:`, webhookErr)
        }
      }
    } else {
      console.log("[CRON ARTÍCULOS] No hay artículos agendados para publicación en este momento.")
    }

    // 2. Comprobar si corresponde enviar recordatorio semanal o por pipeline vacío al administrador
    let reminderSent = false
    const dayOfWeek = now.getDay() // 0: Domingo, 1: Lunes, etc.
    const isMonday = dayOfWeek === 1
    const noScheduledArticlesLeft = !scheduledArticles || scheduledArticles.length === 0

    // Enviar recordatorio los lunes o si el pipeline de artículos agendados se encuentra totalmente vacío
    if (isMonday || noScheduledArticlesLeft) {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_TO_EMAIL || "javier.mujica@gmail.com"
      
      console.log(`[CRON ARTÍCULOS] Disparando correo recordatorio de contenido a ${adminEmail}...`)
      
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #060814; color: #f1f5f9;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #312e81; padding-bottom: 10px; margin-top: 0;">🎯 Recordatorio de Generación de Contenido SEO</h2>
          <p>Hola Javier,</p>
          <p>Te escribimos de tu plataforma para recordar mantener el ritmo de publicación y atracción de tráfico orgánico.</p>
          ${noScheduledArticlesLeft ? '<p style="color: #fbbf24; font-weight: bold;">⚠️ Tu pipeline actualmente no tiene artículos agendados pendientes.</p>' : ''}
          <p>Para seguir posicionando las palabras clave de tu consultoría y <strong>Vibecode Lab</strong>, te recomendamos generar o revisar nuevos artículos en tu panel de administración:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.javiermujica.com/admin" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ir al Panel SEO & Administración</a>
          </div>
          <p>El agente SEO autónomo con DeepSeek y Gemini está listo para crear y optimizar tus contenidos en minutos.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 10px;">Recordatorio automático enviado por Javier Mujica AI System.</p>
        </div>
      `
      
      const emailResult = await sendEmail({
        to: adminEmail,
        subject: "🎯 Recordatorio: Genera nuevos artículos SEO en tu panel de administración",
        html: emailHtml
      })

      if (emailResult.success) {
        console.log("✅ Correo recordatorio enviado exitosamente a Javier.")
        reminderSent = true
      } else {
        console.error("❌ Falló el envío del correo recordatorio:", emailResult.error)
      }
    }

    return NextResponse.json({
      success: true,
      publishedCount,
      reminderSent,
      dateChileStr
    }, { status: 200 })

  } catch (err: any) {
    console.error("[CRON ARTÍCULOS] Error fatal en el publicador de cron:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
