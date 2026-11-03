import type { Metadata } from "next"
import { getSupabaseClient } from "@/lib/supabase"
import ArticlesHubClient from "@/components/articles-hub-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Artículos y Ensayos de IA y Automatización | Javier Mujica",
  description: "Estrategias de optimización, automatización de procesos con RPA, e inyección de Inteligencia Artificial en tus flujos diarios para maximizar la eficiencia y liberar tu tiempo.",
  alternates: {
    canonical: "https://www.javiermujica.com/articulos",
  },
  openGraph: {
    title: "Artículos y Ensayos de IA y Automatización | Javier Mujica",
    description: "Aprende cómo optimizar tus operaciones y marca personal usando Inteligencia Artificial y RPA.",
    url: "https://www.javiermujica.com/articulos",
    type: "website",
    images: [
      {
        url: "/images/optimize-hero.png",
        width: 1200,
        height: 630,
        alt: "Artículos sobre IA y Automatización de Procesos",
      },
    ],
  },
}

export default async function ArticlesPage() {
  const supabase = getSupabaseClient() as any
  let articles = []

  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Supabase fetch articles error:", error)
    } else if (data) {
      articles = data
    }
  } catch (err) {
    console.error("❌ Failed to fetch articles for public hub:", err)
  }

  return (
    <main className="min-h-screen bg-[#060814] text-foreground overflow-hidden">
      {/* Background Neon Auras */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      
      <ArticlesHubClient initialArticles={articles} />
    </main>
  )
}
