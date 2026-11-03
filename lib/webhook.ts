export async function triggerDistributionWebhook(article: any) {
  const webhookUrl = process.env.DISTRIBUTION_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn("⚠️ DISTRIBUTION_WEBHOOK_URL not configured. Skipping Make webhook distribution.")
    return { success: false, reason: "No webhook URL configured" }
  }

  const payload = {
    event: "article.published",
    timestamp: new Date().toISOString(),
    article: {
      id: article.id,
      title: article.title,
      subtitle: article.subtitle || "",
      slug: article.slug,
      category: article.category || "automatizacion",
      read_time: article.read_time || 5,
      url: `https://www.javiermujica.com/articulos/${article.slug}`,
      image_url: `https://www.javiermujica.com/images/${
        article.slug.includes("ciberseguridad") || article.slug.includes("seguridad") || article.slug.includes("api")
          ? "cyber_padlock.png"
          : article.slug.includes("deepseek") || article.slug.includes("seo") 
            ? "seo_agent.png" 
            : article.slug.includes("psicologos") 
              ? "therapist_ia.png" 
              : "lean_processes.png"
      }`
    }
  }

  // Attempt up to 3 times with exponential backoff
  let attempt = 0
  const maxAttempts = 3

  while (attempt < maxAttempts) {
    attempt++
    try {
      console.log(`🔗 Disparando Webhook de distribución a Make.com (Intento ${attempt}/${maxAttempts}):`, webhookUrl)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        console.log("✅ Webhook de distribución ejecutado con éxito en Make.com")
        return { success: true }
      }

      const errorText = await response.text().catch(() => "")
      console.error(`❌ Webhook Make.com respondió con status ${response.status} ${response.statusText}: ${errorText}`)

      // If client error (4xx), do not retry as it indicates invalid URL or setup
      if (response.status >= 400 && response.status < 500) {
        return { success: false, status: response.status, error: errorText }
      }
    } catch (err: any) {
      console.error(`❌ Falló el intento ${attempt} del Webhook de distribución:`, err.message || err)
    }

    if (attempt < maxAttempts) {
      await new Promise((res) => setTimeout(res, 1000 * attempt))
    }
  }

  return { success: false, error: "Max retries reached" }
}
