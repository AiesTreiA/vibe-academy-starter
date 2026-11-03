"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Home,
  Zap,
  Mail,
  Linkedin,
  ArrowUpRight
} from "lucide-react"

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  meta_title?: string
  meta_description?: string
  category: string
  read_time: number
  content: string
  created_at: string
}

interface ArticlesHubClientProps {
  initialArticles: Article[]
}

const CATEGORY_LABELS: Record<string, string> = {
  "automatizacion": "Automatización",
  "ia-aplicada": "IA Aplicada",
  "procesos": "Rediseño de Procesos",
  "marca-personal": "Marca Personal"
}

const getArticleImage = (slug: string, article?: any) => {
  if (article?.json_ld?.article?.image) return article.json_ld.article.image
  if (article?.image_url) return article.image_url
  if (slug.includes("bootcamp") || slug.includes("go-to-market") || slug.includes("vibecode")) return "/images/vibecode-squad-pitch.webp"
  if (slug.includes("ciberseguridad") || slug.includes("seguridad") || slug.includes("api")) return "/images/cyber_padlock.webp"
  if (slug.includes("deepseek") || slug.includes("seo") || slug.includes("agente")) return "/images/seo_agent.webp"
  if (slug.includes("psicologos") || slug.includes("terapeutas")) return "/images/therapist_ia.webp"
  if (slug.includes("lean") || slug.includes("procesos")) return "/images/lean_processes.webp"
  return "/images/optimize-hero.webp"
}

export default function ArticlesHubClient({ initialArticles }: ArticlesHubClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filter articles dynamically
  const filteredArticles = useMemo(() => {
    return initialArticles.filter(a => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (a.subtitle && a.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === "all" || a.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [initialArticles, searchQuery, selectedCategory])

  // Featured article (first published article in the list)
  const featuredArticle = useMemo(() => {
    if (initialArticles.length === 0) return null
    return initialArticles[0]
  }, [initialArticles])

  // Remaining articles excluding the featured one
  const gridArticles = useMemo(() => {
    if (initialArticles.length === 0) return []
    if (selectedCategory !== "all" || searchQuery !== "") return filteredArticles
    return filteredArticles.slice(1)
  }, [filteredArticles, initialArticles, selectedCategory, searchQuery])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "America/Santiago"
      })
    } catch {
      return ""
    }
  }

  return (
    <div className="relative min-h-screen pb-20 text-slate-100 font-sans overflow-hidden">
      {/* CSS-based ambient drift animation */}
      <style>{`
        @keyframes drift-orb-1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(80px, 50px) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes drift-orb-2 {
          0% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-60px, 80px) scale(0.85); }
          100% { transform: translate(0, 0) scale(1.1); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.15; }
          50% { opacity: 0.3; }
          100% { opacity: 0.15; }
        }
      `}</style>

      {/* Floating Animated Ambient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[15%] left-[10%] w-[380px] h-[380px] rounded-full bg-indigo-600/10 blur-[90px]" 
          style={{ animation: 'drift-orb-1 25s infinite ease-in-out' }}
        />
        <div 
          className="absolute bottom-[25%] right-[5%] w-[420px] h-[420px] rounded-full bg-violet-600/10 blur-[110px]" 
          style={{ animation: 'drift-orb-2 30s infinite ease-in-out' }}
        />
        <div 
          className="absolute top-[50%] left-[2%] w-[320px] h-[320px] rounded-full bg-cyan-600/5 blur-[80px]" 
          style={{ animation: 'pulse-glow 15s infinite ease-in-out' }}
        />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl h-16 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-white tracking-tight text-lg group-hover:text-indigo-400 transition-colors">
              Javier Mujica
            </span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/25 font-semibold">
              Consultor IA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <Link href="/#servicios" className="hover:text-white transition-colors">Servicios</Link>
            <Link href="/vibecode" className="hover:text-white transition-colors flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
              Vibecode Lab
            </Link>
            <Link href="/articulos" className="text-white font-medium border-b border-indigo-500 pb-0.5">
              Artículos
            </Link>
            <Link href="/agendar" className="hover:text-white transition-colors">Contacto</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex border-white/10 hover:bg-white/5 text-xs text-white">
              <Link href="/agendar">Agendar Reunión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge className="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5 w-fit mx-auto">
            <Sparkles className="h-3.5 w-3.5" />
            Zona Artículos Potenciados con IA
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Insights de IA, Automatización y Procesos
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Casos prácticos de optimización RPA, guías paso a paso para pymes y reflexiones estratégicas sobre la transformación digital de alta conversión.
          </p>
        </div>
      </section>

      {/* Featured Article Section (Only shown when not searching/filtering) */}
      {featuredArticle && selectedCategory === "all" && searchQuery === "" && (
        <section className="container mx-auto max-w-6xl px-4 pb-12">
          <div className="relative group rounded-2xl border border-white/10 bg-slate-950/30 overflow-hidden hover:border-indigo-500/30 transition-all duration-500 shadow-xl">
            {/* Ambient Aura Hover */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8">
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-600/20 text-indigo-300 border-none px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                      {CATEGORY_LABELS[featuredArticle.category] || featuredArticle.category}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featuredArticle.read_time} min de lectura
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    {featuredArticle.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2.5 text-xs text-slate-400">
                    <img src="/images/javier-avatar.png" alt="Javier Mujica" className="h-6 w-6 rounded-full object-cover border border-white/10" />
                    <span>Javier Mujica</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(featuredArticle.created_at)}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/articulos/${featuredArticle.slug}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors"
                  >
                    Leer Artículo
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Image side panel */}
              <div className="lg:col-span-5 relative min-h-[220px] rounded-xl overflow-hidden border border-white/5 bg-slate-900/30 group/img">
                <img 
                  src={getArticleImage(featuredArticle.slug, featuredArticle)} 
                  alt={featuredArticle.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 bg-indigo-600/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Destacado
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Articles List Section */}
      <section className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        
        {/* Controls: Search and Categories */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          {/* Categories Tab list */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded text-xs transition-all border shrink-0 ${selectedCategory === "all" ? "bg-indigo-600 border-indigo-500 text-white font-semibold" : "bg-transparent border-white/10 text-slate-400 hover:text-white"}`}
            >
              Todos
            </button>
            {Object.keys(CATEGORY_LABELS).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs transition-all border shrink-0 ${selectedCategory === cat ? "bg-indigo-600 border-indigo-500 text-white font-semibold" : "bg-transparent border-white/10 text-slate-400 hover:text-white"}`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-slate-950/80 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Grid List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-3">
            <Layers className="h-12 w-12 mx-auto opacity-20" />
            <p className="text-sm">No se encontraron artículos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map(a => (
              <div 
                key={a.id}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/20 hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-indigo-500/5 overflow-hidden"
              >
                {/* Card Image */}
                <div className="relative h-40 w-full overflow-hidden border-b border-white/5 bg-slate-900/30">
                  <img 
                    src={getArticleImage(a.slug, a)} 
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                </div>

                <div className="flex flex-col justify-between flex-grow p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                        {CATEGORY_LABELS[a.category] || a.category}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {a.read_time} min
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/articulos/${a.slug}`}>{a.title}</Link>
                    </h3>
                    
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {a.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(a.created_at)}
                    </span>
                    
                    <Link 
                      href={`/articulos/${a.slug}`}
                      className="flex items-center gap-1 text-white group-hover:text-indigo-400 font-semibold transition-colors"
                    >
                      Leer más
                      <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Box / Consulting Banner */}
      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="relative rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-6 md:p-10 text-center overflow-hidden">
          {/* Neon Circle */}
          <div className="absolute -bottom-[50%] left-[50%] -translate-x-[50%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />
          
          <div className="relative max-w-xl mx-auto space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">¿Necesitas acelerar tus operaciones con IA?</h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Diseño e implemento sistemas autónomos a medida y automatizaciones de flujos de trabajo orientadas a resultados tangibles. Conversemos sobre tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-2 h-9 w-full sm:w-auto">
                <Link href="/agendar">Agendar Reunión de Consultoría</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 text-xs text-slate-300 w-full sm:w-auto">
                <Link href="/vibecode" className="flex items-center justify-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-violet-400" />
                  Ver Curso Vibecode Lab
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
