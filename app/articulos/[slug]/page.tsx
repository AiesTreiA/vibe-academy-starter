import type { Metadata } from "next"
import { getSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import ArticleDetailClient from "@/components/article-detail-client"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabaseClient() as any

  try {
    const { data: article } = await supabase
      .from("articles")
      .select("meta_title, meta_description, title, subtitle, image_url, json_ld")
      .eq("slug", slug)
      .single()

    if (article) {
      const ogImageUrl = article.image_url || article.json_ld?.article?.image || "/images/optimize-hero.png"
      return {
        title: article.meta_title || article.title,
        description: article.meta_description || article.subtitle || "",
        alternates: {
          canonical: `https://www.javiermujica.com/articulos/${slug}`,
        },
        openGraph: {
          title: article.meta_title || article.title,
          description: article.meta_description || article.subtitle || "",
          url: `https://www.javiermujica.com/articulos/${slug}`,
          type: "article",
          authors: ["Javier Mujica"],
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ],
        },
      }
    }
  } catch (err) {
    console.error("Failed to generate metadata for article dynamic page:", err)
  }

  return {
    title: "Artículo no encontrado | Javier Mujica",
    description: "El artículo solicitado no se encuentra disponible.",
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = getSupabaseClient() as any
  let article = null

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single()

    if (!error && data) {
      article = data
    }
  } catch (err) {
    console.error("Failed to fetch article details:", err)
  }

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#060814] text-slate-100 relative">
      {/* Background Neon Auras */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />

      {/* Render article client layout */}
      <ArticleDetailClient article={article} />
    </main>
  )
}
