import { MetadataRoute } from "next"
import { getSupabaseAdminClient } from "@/lib/supabase"

export const revalidate = 3600 // Revalida el sitemap cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.javiermujica.com"
  const supabase = getSupabaseAdminClient() as any

  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/vibecode`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/vibecode`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/unicorn-bible`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ebook-quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/articulos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/masterclass`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/agendar`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // Artículos dinámicos publicados desde la base de datos
  let articlePages: MetadataRoute.Sitemap = []

  try {
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, updated_at, created_at")
      .eq("status", "published")

    if (articles && articles.length > 0) {
      articlePages = articles.map((art: any) => ({
        url: `${baseUrl}/articulos/${art.slug}`,
        lastModified: new Date(art.updated_at || art.created_at || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    }
  } catch (err) {
    console.error("Failed to fetch articles for dynamic sitemap:", err)
  }

  return [...staticPages, ...articlePages]
}
