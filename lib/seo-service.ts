import fs from "fs"
import path from "path"
import { getSupabaseAdminClient } from "@/lib/supabase"

export interface GlobalSeoSettings {
  globalTitle: string
  siteDescription: string
  defaultOgImage: string
  robotsTxt: string
  sitemapXml: string
}

export interface SeoPageOverride {
  metaDescription?: string
  title?: string
  altTexts?: string[]
  resolved?: boolean
  updatedAt?: string
}

export interface SeoCacheSettings {
  edgeCache: boolean
  compression: boolean
  lazyLoad: boolean
}

export interface SeoHistoryEntry {
  id: string
  recommendationId?: string
  targetUrl: string
  type: "meta" | "title" | "images" | "cache"
  title: string
  appliedValue: any
  appliedAt: string
}

export interface SeoPersistedData {
  settings: GlobalSeoSettings
  overrides: Record<string, SeoPageOverride>
  resolvedRecommendations: string[]
  improvementHistory: SeoHistoryEntry[]
  cacheSettings: SeoCacheSettings
}

const DEFAULT_SEO_SETTINGS: GlobalSeoSettings = {
  globalTitle: "Javier Mujica · Consultor en IA y Automatización de Procesos | Chile",
  siteDescription:
    "Ingeniero Civil Industrial (U. de Chile) especializado en automatización RPA, IA aplicada y rediseño de procesos. Método flexible y enfocado en resultados.",
  defaultOgImage: "https://www.javiermujica.com/images/optimize-hero.png",
  robotsTxt: `# robots.txt para javiermujica.com\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://www.javiermujica.com/sitemap.xml`,
  sitemapXml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://www.javiermujica.com/</loc>\n    <lastmod>2026-09-01</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://www.javiermujica.com/vibecode</loc>\n    <lastmod>2026-09-01</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>https://www.javiermujica.com/articulos</loc>\n    <lastmod>2026-09-01</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`,
}

const DEFAULT_CACHE_SETTINGS: SeoCacheSettings = {
  edgeCache: true,
  compression: true,
  lazyLoad: true,
}

const BACKUP_FILE_PATH = path.join(process.cwd(), "data", "seo-settings.json")

function readLocalBackup(): SeoPersistedData {
  try {
    if (fs.existsSync(BACKUP_FILE_PATH)) {
      const raw = fs.readFileSync(BACKUP_FILE_PATH, "utf-8")
      const parsed = JSON.parse(raw)
      return {
        settings: { ...DEFAULT_SEO_SETTINGS, ...(parsed.settings || {}) },
        overrides: parsed.overrides || {},
        resolvedRecommendations: parsed.resolvedRecommendations || [],
        improvementHistory: parsed.improvementHistory || [],
        cacheSettings: { ...DEFAULT_CACHE_SETTINGS, ...(parsed.cacheSettings || {}) },
      }
    }
  } catch (err) {
    console.warn("Error reading local SEO backup file:", err)
  }

  return {
    settings: { ...DEFAULT_SEO_SETTINGS },
    overrides: {},
    resolvedRecommendations: [],
    improvementHistory: [],
    cacheSettings: { ...DEFAULT_CACHE_SETTINGS },
  }
}

function writeLocalBackup(data: SeoPersistedData) {
  try {
    const dir = path.dirname(BACKUP_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(data, null, 2), "utf-8")
  } catch (err) {
    console.warn("Error saving local SEO backup file:", err)
  }
}

export async function getSeoPersistedData(): Promise<SeoPersistedData> {
  const localData = readLocalBackup()

  try {
    const supabase = getSupabaseAdminClient() as any
    const { data: dbRows, error } = await supabase
      .from("vibecode_settings")
      .select("key, value")
      .in("key", [
        "seo_global_settings",
        "seo_page_overrides",
        "seo_resolved_recommendations",
        "seo_improvement_history",
        "seo_cache_settings",
      ])

    if (!error && dbRows && dbRows.length > 0) {
      const rowMap: Record<string, string> = {}
      dbRows.forEach((r: { key: string; value: string }) => {
        rowMap[r.key] = r.value
      })

      const settings = rowMap["seo_global_settings"]
        ? { ...DEFAULT_SEO_SETTINGS, ...JSON.parse(rowMap["seo_global_settings"]) }
        : localData.settings

      const overrides = rowMap["seo_page_overrides"]
        ? JSON.parse(rowMap["seo_page_overrides"])
        : localData.overrides

      const resolvedRecommendations = rowMap["seo_resolved_recommendations"]
        ? JSON.parse(rowMap["seo_resolved_recommendations"])
        : localData.resolvedRecommendations

      const improvementHistory = rowMap["seo_improvement_history"]
        ? JSON.parse(rowMap["seo_improvement_history"])
        : localData.improvementHistory

      const cacheSettings = rowMap["seo_cache_settings"]
        ? { ...DEFAULT_CACHE_SETTINGS, ...JSON.parse(rowMap["seo_cache_settings"]) }
        : localData.cacheSettings

      const combined: SeoPersistedData = {
        settings,
        overrides,
        resolvedRecommendations,
        improvementHistory,
        cacheSettings,
      }

      writeLocalBackup(combined)
      return combined
    }
  } catch (err) {
    console.warn("Supabase query failed for SEO settings, using local backup:", err)
  }

  return localData
}

export async function saveGlobalSeoSettings(
  partialSettings: Partial<GlobalSeoSettings>
): Promise<GlobalSeoSettings> {
  const current = await getSeoPersistedData()
  const updatedSettings: GlobalSeoSettings = {
    ...current.settings,
    ...partialSettings,
  }

  current.settings = updatedSettings
  writeLocalBackup(current)

  try {
    const supabase = getSupabaseAdminClient() as any
    await supabase.from("vibecode_settings").upsert({
      key: "seo_global_settings",
      value: JSON.stringify(updatedSettings),
      description: "Configuración global de SEO del sitio web (Title, Meta Description, OG, Robots, Sitemap)",
    })
  } catch (err) {
    console.warn("Failed to persist global SEO settings to Supabase:", err)
  }

  return updatedSettings
}

export async function applySeoOptimization({
  targetUrl,
  type,
  value,
  recommendationId,
}: {
  targetUrl: string
  type: "meta" | "title" | "images" | "cache"
  value: any
  recommendationId?: string
}): Promise<{ success: boolean; message: string; data: SeoPersistedData }> {
  const current = await getSeoPersistedData()
  const normalizedUrl = targetUrl || "/vibecode"

  const override: SeoPageOverride = current.overrides[normalizedUrl] || {
    updatedAt: new Date().toISOString(),
  }
  override.updatedAt = new Date().toISOString()
  override.resolved = true

  let successMessage = "Mejora aplicada y guardada correctamente."

  if (type === "meta") {
    const metaDesc = typeof value === "string" ? value.trim() : ""
    override.metaDescription = metaDesc
    current.overrides[normalizedUrl] = override

    // 1. Si es /vibecode, actualizar layout.tsx
    if (normalizedUrl === "/vibecode") {
      try {
        const layoutPath = path.join(process.cwd(), "app/vibecode/layout.tsx")
        if (fs.existsSync(layoutPath)) {
          let layoutContent = fs.readFileSync(layoutPath, "utf-8")
          const descRegex = /(description:\s*)(["`])[\s\S]*?\2/
          if (descRegex.test(layoutContent)) {
            layoutContent = layoutContent.replace(descRegex, `$1${JSON.stringify(metaDesc)}`)
            fs.writeFileSync(layoutPath, layoutContent, "utf-8")
          }
        }
      } catch (fileErr) {
        console.warn("Could not update app/vibecode/layout.tsx directly:", fileErr)
      }
      successMessage = "Meta Descripción guardada para /vibecode y actualizada en layout.tsx."
    }

    // 2. Si es un artículo de blog (/articulos/[slug])
    if (normalizedUrl.startsWith("/articulos/")) {
      const slug = normalizedUrl.replace(/^\/articulos\//, "").split("?")[0].split("/")[0]
      if (slug) {
        try {
          const supabase = getSupabaseAdminClient() as any
          await supabase
            .from("articles")
            .update({ meta_description: metaDesc, updated_at: new Date().toISOString() })
            .eq("slug", slug)
        } catch (dbErr) {
          console.warn("Could not update article meta_description in Supabase:", dbErr)
        }
      }
      successMessage = `Meta Descripción guardada en base de datos para el artículo '${slug}'.`
    }
  } else if (type === "title") {
    const titleText = typeof value === "string" ? value.trim() : ""
    override.title = titleText
    current.overrides[normalizedUrl] = override

    // Si es un artículo de blog (/articulos/[slug])
    if (normalizedUrl.startsWith("/articulos/")) {
      const slug = normalizedUrl.replace(/^\/articulos\//, "").split("?")[0].split("/")[0]
      if (slug) {
        try {
          const supabase = getSupabaseAdminClient() as any
          await supabase
            .from("articles")
            .update({ title: titleText, meta_title: titleText, updated_at: new Date().toISOString() })
            .eq("slug", slug)
        } catch (dbErr) {
          console.warn("Could not update article title in Supabase:", dbErr)
        }
      }
      successMessage = `Título SEO actualizado en base de datos para el artículo '${slug}'.`
    }
  } else if (type === "images") {
    override.altTexts = Array.isArray(value) ? value : [String(value)]
    current.overrides[normalizedUrl] = override
    successMessage = `Atributos ALT asignados para las imágenes de '${normalizedUrl}'.`
  } else if (type === "cache") {
    current.cacheSettings = {
      ...current.cacheSettings,
      ...(typeof value === "object" ? value : {}),
    }
    successMessage = "Configuración de CDN Edge Cache y compresión guardada con éxito."
  }

  // Registrar identificadores como resueltos
  const resolvedId =
    recommendationId || `rec-${type}-${normalizedUrl.replace(/[^a-zA-Z0-9]/g, "-")}`

  if (!current.resolvedRecommendations.includes(resolvedId)) {
    current.resolvedRecommendations.push(resolvedId)
  }
  // También marcar por URL para garantizar que desaparezca
  const urlResolvedKey = `url-${type}-${normalizedUrl}`
  if (!current.resolvedRecommendations.includes(urlResolvedKey)) {
    current.resolvedRecommendations.push(urlResolvedKey)
  }

  // Crear entrada en el historial de mejoras archivadas
  const historyEntry: SeoHistoryEntry = {
    id: `hist-${Date.now()}`,
    recommendationId: resolvedId,
    targetUrl: normalizedUrl,
    type,
    title:
      type === "meta"
        ? `Meta Descripción optimizada para ${normalizedUrl}`
        : type === "title"
        ? `Título SEO optimizado para ${normalizedUrl}`
        : type === "images"
        ? `Atributos ALT asignados en ${normalizedUrl}`
        : `Caché CDN y compresión habilitadas`,
    appliedValue: value,
    appliedAt: new Date().toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }

  current.improvementHistory = [historyEntry, ...(current.improvementHistory || [])]

  // Persistir en local backup
  writeLocalBackup(current)

  // Persistir en Supabase vibecode_settings
  try {
    const supabase = getSupabaseAdminClient() as any
    await Promise.all([
      supabase.from("vibecode_settings").upsert({
        key: "seo_page_overrides",
        value: JSON.stringify(current.overrides),
        description: "Overrides y estados resueltos de SEO por URL",
      }),
      supabase.from("vibecode_settings").upsert({
        key: "seo_resolved_recommendations",
        value: JSON.stringify(current.resolvedRecommendations),
        description: "Lista de recomendaciones SEO resueltas",
      }),
      supabase.from("vibecode_settings").upsert({
        key: "seo_improvement_history",
        value: JSON.stringify(current.improvementHistory),
        description: "Historial de mejoras SEO aplicadas y archivadas",
      }),
      supabase.from("vibecode_settings").upsert({
        key: "seo_cache_settings",
        value: JSON.stringify(current.cacheSettings),
        description: "Configuración de Edge Caching y compresión SEO",
      }),
    ])
  } catch (err) {
    console.warn("Failed to persist SEO optimization to Supabase:", err)
  }

  return {
    success: true,
    message: successMessage,
    data: current,
  }
}
