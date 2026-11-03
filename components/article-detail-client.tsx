"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Calendar, 
  ArrowLeft, 
  ChevronRight,
  Home,
  Zap,
  Mail,
  Linkedin,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  Compass,
  ArrowUpRight
} from "lucide-react"

import { getVibecodeTierInfo } from "@/lib/vibecode-config"

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  category: string
  read_time: number
  content: string
  image_url?: string
  toc?: { id: string; text: string; level: number }[]
  faq?: { question: string; answer: string }[]
  myths?: { myth: string; reality: string }[]
  cta_type: string
  cta_custom_text?: string
  cta_custom_url?: string
  json_ld?: any
  created_at: string
}

interface ArticleDetailClientProps {
  article: Article
}

const CATEGORY_LABELS: Record<string, string> = {
  "automatizacion": "Automatización",
  "ia-aplicada": "IA Aplicada",
  "procesos": "Rediseño de Procesos",
  "marca-personal": "Marca Personal"
}

export default function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [activeHeading, setActiveHeading] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null)
  const tierInfo = getVibecodeTierInfo()

  // Track active heading on scroll for table of contents
  useEffect(() => {
    const handleScroll = () => {
      if (!article.toc || article.toc.length === 0) return
      
      const headingElements = article.toc.map(item => document.getElementById(item.id))
      const scrollPosition = window.scrollY + 200

      let activeId = ""
      for (const el of headingElements) {
        if (el && scrollPosition >= el.offsetTop) {
          activeId = el.id
        }
      }
      
      if (activeId) {
        setActiveHeading(activeId)
      } else if (article.toc.length > 0) {
        setActiveHeading(article.toc[0].id)
      }
    };

    window.addEventListener("scroll", handleScroll)
    // Run once initially
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [article.toc])

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

  // --- LIGHTWEIGHT CUSTOM MARKDOWN PARSER ---
  const parseMarkdown = (markdown: string) => {
    if (!markdown) return null

    const lines = markdown.split("\n")
    const elements: React.ReactNode[] = []
    let listItems: React.ReactNode[] = []
    let listType: "ul" | "ol" | null = null
    let tableRows: any[] = []
    let inTable = false
    let inCodeBlock = false
    let codeContent: string[] = []

    // Helper to replace inline styles (bold, links, code)
    const renderInlineStyles = (text: string) => {
      let parts: React.ReactNode[] = [text]

      // 1. Links: [Text](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      let match
      let newParts: React.ReactNode[] = []

      for (const part of parts) {
        if (typeof part !== "string") {
          newParts.push(part)
          continue
        }

        let lastIndex = 0
        linkRegex.lastIndex = 0 // Reset regex state

        while ((match = linkRegex.exec(part)) !== null) {
          const index = match.index
          // Text before link
          if (index > lastIndex) {
            newParts.push(part.slice(lastIndex, index))
          }
          // The Link
          const linkText = match[1]
          const linkUrl = match[2]
          
          let resolvedUrl = linkUrl
          if (linkUrl === "#agendar-reunion" || linkUrl === "#agendar-consultoria" || linkUrl === "#agendar-reunion-evaluacion" || linkUrl === "/#agendar-reunion") {
            resolvedUrl = "/agendar"
          } else if (linkUrl === "#vibecode" || linkUrl === "#vibecoding") {
            resolvedUrl = "/vibecode"
          }

          if (resolvedUrl.startsWith("http") || resolvedUrl.startsWith("/")) {
            const isExternal = resolvedUrl.startsWith("http")
            newParts.push(
              <Link 
                key={`${index}-${resolvedUrl}`} 
                href={resolvedUrl} 
                className="text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {linkText}
              </Link>
            )
          } else {
            // Render other hash references as homepage-targeted anchor links
            const resolvedHash = resolvedUrl.startsWith("#") ? resolvedUrl : `#${resolvedUrl}`
            newParts.push(
              <Link 
                key={`${index}-${resolvedUrl}`} 
                href={`/${resolvedHash}`} 
                className="text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors"
              >
                {linkText}
              </Link>
            )
          }
          lastIndex = linkRegex.lastIndex
        }

        if (lastIndex < part.length) {
          newParts.push(part.slice(lastIndex))
        }
      }
      parts = newParts

      // 2. Bold text: **text**
      const boldRegex = /\*\*([^*]+)\*\*/g
      newParts = []
      for (const part of parts) {
        if (typeof part !== "string") {
          newParts.push(part)
          continue
        }

        let lastIndex = 0
        boldRegex.lastIndex = 0

        while ((match = boldRegex.exec(part)) !== null) {
          const index = match.index
          if (index > lastIndex) {
            newParts.push(part.slice(lastIndex, index))
          }
          newParts.push(<strong key={index} className="font-bold text-white">{match[1]}</strong>)
          lastIndex = boldRegex.lastIndex
        }

        if (lastIndex < part.length) {
          newParts.push(part.slice(lastIndex))
        }
      }
      parts = newParts

      // 3. Inline code: `code`
      const inlineCodeRegex = /`([^`]+)`/g
      newParts = []
      for (const part of parts) {
        if (typeof part !== "string") {
          newParts.push(part)
          continue
        }

        let lastIndex = 0
        inlineCodeRegex.lastIndex = 0

        while ((match = inlineCodeRegex.exec(part)) !== null) {
          const index = match.index
          if (index > lastIndex) {
            newParts.push(part.slice(lastIndex, index))
          }
          newParts.push(
            <code key={index} className="bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px]">
              {match[1]}
            </code>
          )
          lastIndex = inlineCodeRegex.lastIndex
        }

        if (lastIndex < part.length) {
          newParts.push(part.slice(lastIndex))
        }
      }
      parts = newParts

      return parts
    }

    const flushList = (key: number) => {
      if (listItems.length > 0 && listType) {
        if (listType === "ul") {
          elements.push(
            <ul key={`ul-${key}`} className="list-disc pl-6 my-4 text-slate-300 text-sm md:text-base space-y-2 leading-relaxed">
              {listItems}
            </ul>
          )
        } else {
          elements.push(
            <ol key={`ol-${key}`} className="list-decimal pl-6 my-4 text-slate-300 text-sm md:text-base space-y-2 leading-relaxed">
              {listItems}
            </ol>
          )
        }
        listItems = []
        listType = null
      }
    }

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        const hasHeader = tableRows.length > 1
        const header = hasHeader ? tableRows[0] : null
        const bodyRows = hasHeader ? tableRows.slice(1) : tableRows

        elements.push(
          <div key={`table-wrapper-${key}`} className="overflow-x-auto my-6 border border-white/10 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              {header && (
                <thead className="bg-slate-900/60 border-b border-white/10">
                  <tr>
                    {header.map((cell: string, idx: number) => (
                      <th key={idx} className="p-3 font-semibold text-white uppercase text-[10px] tracking-wider">
                        {cell.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-white/5">
                {bodyRows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className="p-3 text-slate-300 leading-normal">
                        {renderInlineStyles(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
        inTable = false
      }
    }

    const heroImageUrl = article.json_ld?.article?.image || article.image_url

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      const unquoted = trimmed.replace(/^>\s?/, "").trim()

      // Handle TL;DR Executive Summary Box
      const tldrMatch = unquoted.match(/^(?:#{1,6}\s+|>\s*)*(?:\*\*|\*)?(?:Resumen\s+rápido\s*\(TL;DR\)|TL;DR|Resumen\s+Ejecutivo):?(?:\*\*|\*)?\s*(.*)$/i)
      
      if (tldrMatch) {
        flushList(i)
        flushTable(i)
        let rawTldrText = tldrMatch[1]?.trim() || ""
        
        // If the heading line was standalone (e.g. "## TL;DR"), grab the summary text from the next line(s)
        if (!rawTldrText) {
          let j = i + 1
          while (j < lines.length && lines[j].trim() === "") {
            j++
          }
          if (j < lines.length && !lines[j].trim().startsWith("#")) {
            rawTldrText = lines[j].trim()
            i = j // Advance line index past summary text
          }
        }

        // Strip any residual "TL;DR:" prefix if present inside text
        const tldrText = rawTldrText.replace(/^(?:\*\*|\*)?(?:Resumen\s+rápido\s*\(TL;DR\)|TL;DR|Resumen\s+Ejecutivo):?:?\s*/i, "").trim()
        
        if (tldrText) {
          elements.push(
            <div key={`tldr-${i}`} className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-slate-200 text-sm md:text-base leading-relaxed mb-8 flex items-start gap-3 shadow-inner">
              <Zap className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-1 text-xs uppercase tracking-wider">Resumen Ejecutivo</span>
                {renderInlineStyles(tldrText)}
              </div>
            </div>
          )
        }
        continue
      }

      // Handle Image: ![alt](url)
      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      if (imageMatch) {
        flushList(i)
        flushTable(i)
        const altText = imageMatch[1]
        const imageUrl = imageMatch[2]
        
        // Skip rendering if image is identical to featured header banner image to avoid duplicate images
        if (heroImageUrl && (imageUrl === heroImageUrl || encodeURI(imageUrl) === heroImageUrl || imageUrl.split("?")[0] === heroImageUrl.split("?")[0])) {
          continue
        }

        elements.push(
          <div key={`img-${i}`} className="relative w-full h-[240px] md:h-[380px] rounded-2xl overflow-hidden border border-white/10 my-8 shadow-2xl group">
            <img 
              src={imageUrl} 
              alt={altText || article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
            {altText && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 text-center text-xs text-slate-300 font-medium tracking-wide">
                {altText}
              </div>
            )}
          </div>
        )
        continue
      }

      // Handle Code Block
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-slate-950 border border-white/10 p-4 rounded-lg my-4 text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed select-all">
              <code>{codeContent.join("\n")}</code>
            </pre>
          )
          codeContent = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        continue
      }

      if (inCodeBlock) {
        codeContent.push(line)
        continue
      }

      // Handle Headings (H2, H3, H4)
      const h2Match = line.match(/^##\s+(.*)$/)
      const h3Match = line.match(/^###\s+(.*)$/)
      const h4Match = line.match(/^####\s+(.*)$/)

      if (h2Match || h3Match || h4Match) {
        flushList(i)
        flushTable(i)
        
        const text = (h2Match || h3Match || h4Match)![1].trim()
        const id = text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")

        if (h2Match) {
          elements.push(
            <h2 id={id} key={i} className="text-xl md:text-2xl font-bold text-white tracking-tight mt-8 mb-4 border-b border-white/5 pb-2">
              {text}
            </h2>
          )
        } else if (h3Match) {
          elements.push(
            <h3 id={id} key={i} className="text-base md:text-lg font-bold text-white tracking-tight mt-6 mb-3">
              {text}
            </h3>
          )
        } else {
          elements.push(
            <h4 id={id} key={i} className="text-sm md:text-base font-semibold text-white tracking-tight mt-4 mb-2">
              {text}
            </h4>
          )
        }
        continue
      }

      // Handle Blockquotes
      if (trimmed.startsWith(">")) {
        flushList(i)
        flushTable(i)
        
        // Clean blockquote indicator
        const text = trimmed.replace(/^>\s?/, "")
        
        // Special render for alerts
        if (text.startsWith("[!NOTE]") || text.startsWith("[!TIP]") || text.startsWith("[!IMPORTANT]") || text.startsWith("[!WARNING]")) {
          const alertType = text.match(/^\[!([^\]]+)\]/)![1]
          const alertContent = text.replace(/^\[![^\]]+\]\s?/, "")
          
          let alertColor = "border-indigo-500 bg-indigo-950/20 text-indigo-300"
          if (alertType === "WARNING") alertColor = "border-rose-500/50 bg-rose-950/20 text-rose-300"
          if (alertType === "TIP") alertColor = "border-cyan-500 bg-cyan-950/20 text-cyan-300"
          if (alertType === "IMPORTANT") alertColor = "border-amber-500 bg-amber-950/20 text-amber-300"

          elements.push(
            <div key={i} className={`border-l-4 p-4 my-6 rounded-r ${alertColor} text-xs md:text-sm`}>
              <div className="font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {alertType}
              </div>
              <p className="leading-relaxed">{renderInlineStyles(alertContent)}</p>
            </div>
          )
        } else {
          elements.push(
            <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 py-1.5 my-6 bg-slate-900/30 rounded-r text-slate-300 italic text-sm md:text-base leading-relaxed">
              {renderInlineStyles(text)}
            </blockquote>
          )
        }
        continue
      }

      // Handle Tables
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        flushList(i)
        
        // Check if separator line
        if (trimmed.includes("---") || trimmed.includes(":-")) {
          inTable = true
          continue
        }

        const cells = trimmed.split("|").slice(1, -1)
        tableRows.push(cells)
        inTable = true
        continue
      } else if (inTable) {
        flushTable(i)
      }

      // Handle Unordered Lists
      const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/)
      if (ulMatch) {
        flushTable(i)
        if (listType !== "ul") {
          flushList(i)
          listType = "ul"
        }
        listItems.push(
          <li key={i} className="ml-2 pl-1 leading-relaxed">
            {renderInlineStyles(ulMatch[2])}
          </li>
        )
        continue
      }

      // Handle Ordered Lists
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/)
      if (olMatch) {
        flushTable(i)
        if (listType !== "ol") {
          flushList(i)
          listType = "ol"
        }
        listItems.push(
          <li key={i} className="ml-2 pl-1 leading-relaxed">
            {renderInlineStyles(olMatch[2])}
          </li>
        )
        continue
      }

      // Empty Lines
      if (!trimmed) {
        flushList(i)
        flushTable(i)
        continue
      }

      // Standard Paragraph
      flushList(i)
      flushTable(i)
      elements.push(
        <p key={i} className="text-slate-300 text-sm md:text-base leading-relaxed my-4">
          {renderInlineStyles(trimmed)}
        </p>
      )
    }

    // Flush any remaining elements
    flushList(lines.length)
    flushTable(lines.length)

    return elements
  }

  return (
    <div className="relative min-h-screen pb-20 text-slate-100 font-sans">
      
      {/* Schema technical JSON-LD injection */}
      {article.json_ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(article.json_ld) }}
        />
      )}

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
            <Link href="/articulos" className="hover:text-white transition-colors">
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

      {/* Breadcrumb and Back Button */}
      <section className="container mx-auto max-w-4xl px-4 pt-6 pb-2 flex items-center justify-between text-xs text-slate-400">
        <Link 
          href="/articulos"
          className="flex items-center gap-1 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a artículos
        </Link>
        <div className="hidden sm:flex items-center gap-1.5">
          <Link href="/articulos" className="hover:text-white transition-colors">Artículos</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-300 capitalize">{article.category.replace("-", " ")}</span>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="container mx-auto max-w-6xl px-4 py-6 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative">
        
        {/* Left Side: Sticky Table of Contents & Profile Container */}
        <aside className="md:col-span-4 lg:col-span-3 space-y-6 hidden md:block self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 custom-scrollbar transition-all duration-300">
          <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-xl shadow-indigo-950/10 space-y-6">
            {article.toc && article.toc.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <Compass className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  Tabla de contenidos
                </h4>
                <nav className="flex flex-col gap-1 text-xs">
                  {article.toc.map((item, idx) => {
                    const isActive = activeHeading === item.id
                    return (
                      <a 
                        key={idx}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          const el = document.getElementById(item.id)
                          if (el) {
                            const yOffset = -100
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
                            window.scrollTo({ top: y, behavior: "smooth" })
                            setActiveHeading(item.id)
                          }
                        }}
                        style={{ paddingLeft: `${Math.max(0, (item.level - 2)) * 8 + 8}px` }}
                        className={`group relative flex items-center py-1.5 px-2.5 rounded-lg text-[11px] transition-all duration-200 ease-out leading-snug ${
                          isActive 
                            ? "bg-indigo-500/15 text-indigo-300 font-semibold border-l-2 border-indigo-400 translate-x-1 shadow-sm shadow-indigo-500/10" 
                            : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                        }`}
                      >
                        <span className="truncate">{item.text}</span>
                      </a>
                    )
                  })}
                </nav>
              </div>
            )}

            {/* Small Profile Card */}
            <div className="pt-3 border-t border-white/5 text-center space-y-2.5">
              <img src="/images/javier-avatar.png" alt="Javier Mujica" className="h-11 w-11 rounded-full object-cover border border-indigo-500/30 mx-auto shadow-md shadow-indigo-500/10" />
              <div>
                <div className="text-xs font-bold text-white">Javier Mujica</div>
                <div className="text-[10px] text-indigo-400 font-medium">Consultor en Procesos & IA</div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Ayudo a profesionales y empresas a estructurar, automatizar y optimizar sus procesos usando IA.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Side: Article Header & Body Content */}
        <div className="md:col-span-8 lg:col-span-9 space-y-8">
          
          {/* Article Header (Badges, Title, Subtitle & Banner Image) */}
          <div className="space-y-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-indigo-600/20 text-indigo-300 border-none px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {CATEGORY_LABELS[article.category] || article.category}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.read_time} min de lectura
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(article.created_at)}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {/* Featured Header Banner Image */}
            {(article.json_ld?.article?.image || article.image_url) && (
              <div className="relative w-full h-[240px] md:h-[360px] rounded-2xl overflow-hidden border border-white/10 mt-6 shadow-2xl">
                <img 
                  src={article.json_ld?.article?.image || article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060814] via-transparent to-transparent opacity-40" />
              </div>
            )}
          </div>

          <article className="prose prose-invert max-w-none">
            {parseMarkdown(article.content)}
          </article>

          {/* Myths / Truths Section */}
          {article.myths && article.myths.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-400" />
                Mitos y Verdades
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {article.myths.map((m: any, idx: number) => (
                  <div key={idx} className="border border-white/10 rounded-lg overflow-hidden bg-slate-950/20">
                    <button 
                      onClick={() => setExpandedMyth(expandedMyth === idx ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="text-xs md:text-sm font-semibold text-rose-300">
                        {`Mito: "${m.myth}"`}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expandedMyth === idx ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedMyth === idx && (
                      <div className="p-4 pt-0 border-t border-white/5 bg-slate-900/10 text-xs md:text-sm text-slate-300 leading-relaxed">
                        <div className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" />
                          La Realidad
                        </div>
                        {m.reality}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Section */}
          {article.faq && article.faq.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                Preguntas Frecuentes (FAQ)
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {article.faq.map((f: any, idx: number) => (
                  <div key={idx} className="border border-white/10 rounded-lg overflow-hidden bg-slate-950/20">
                    <button 
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="text-xs md:text-sm font-semibold text-white">
                        {f.question}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-4 pt-0 border-t border-white/5 bg-slate-900/10 text-xs md:text-sm text-slate-300 leading-relaxed">
                        {f.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic CTA Box (Mixto: Vibecode + Consultoría) */}
          <div className="pt-10 border-t border-white/5">
            {article.cta_type === "both" ? (
              /* DUAL MIXED CTA */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-indigo-500/25 bg-slate-950/50 p-6 md:p-8 overflow-hidden relative">
                {/* Ambient glow circle */}
                <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-indigo-600/5 blur-[50px] pointer-events-none" />
                
                {/* Column 1: Vibecode */}
                <div className="flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                  <div className="space-y-2">
                    <Badge className="bg-violet-600/15 text-violet-400 border border-violet-500/30 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit">
                      <Zap className="h-3 w-3" />
                      Bootcamp & Go-To-Market
                    </Badge>
                    <h4 className="font-bold text-white text-base">Acelera tu Software al Mercado con Vibecode Lab</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      El bootcamp fuera de serie para devs (jr, mid, sr), founders y creadores. Construye tu software con IA, domina la validación comercial, estrategias freemium y acelera tu salida al mercado en comunidad.
                    </p>
                  </div>
                  <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-9 w-full mt-2">
                    <Link href="/vibecode">Ver Programa Vibecode Lab</Link>
                  </Button>
                </div>

                {/* Column 2: Consulting */}
                <div className="flex flex-col justify-between space-y-4 md:pl-2">
                  <div className="space-y-2">
                    <Badge className="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit">
                      <Home className="h-3 w-3" />
                      Consultoría Estratégica
                    </Badge>
                    <h4 className="font-bold text-white text-base">Agenda una Reunión de Diagnóstico</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Conversemos uno a uno. Analizaremos las ineficiencias de tus procesos actuales y cómo la automatización RPA o la IA pueden liberar tu tiempo operativo.
                    </p>
                  </div>
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 w-full mt-2">
                    <Link href="/agendar">Agendar Reunión Sin Costo</Link>
                  </Button>
                </div>
              </div>
            ) : article.cta_type === "vibecode" ? (
              /* VIBECODE ONLY CTA */
              <div className="rounded-2xl border border-violet-500/25 bg-slate-950/40 p-6 md:p-8 text-center space-y-4 max-w-xl mx-auto">
                <Badge className="bg-violet-600/15 text-violet-400 border border-violet-500/30 text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit mx-auto">
                  <Zap className="h-3 w-3" />
                  {tierInfo.tierName}
                </Badge>
                <h4 className="font-bold text-white text-lg">Vibecode Lab: El Sistema para Pasar de Idea a SaaS en Producción</h4>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  El bootcamp fuera de serie para devs (jr, mid, sr), founders y creadores motivados. Aprende a crear aplicaciones con IA, validar comercialmente, ejecutar estrategias freemium efectivas y acelerar tu lanzamiento en squads multidisciplinarios.
                </p>

                {/* Dynamic Tier & Coupon Box */}
                <div className="bg-violet-950/40 border border-violet-500/30 rounded-xl p-4 text-xs text-violet-200 text-left space-y-2">
                  <div className="flex items-center justify-between font-bold text-white text-xs border-b border-violet-500/20 pb-2">
                    <span>⚡ Tramo activo: <span className="text-violet-300">{tierInfo.tierName}</span></span>
                    <span className="bg-violet-600/30 border border-violet-500/40 text-violet-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">{tierInfo.extraCouponDiscount}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ⏰ <strong>Fecha límite del tramo actual:</strong> {tierInfo.deadlineLabel}.
                  </p>
                  <p className="text-[11px] text-slate-300">
                    🎟️ {tierInfo.couponNotice} Usa el cupón <code className="bg-violet-900/90 text-white font-mono px-2 py-0.5 rounded border border-violet-400/50 font-bold">{tierInfo.couponCode}</code> en el proceso de inscripción.
                  </p>
                </div>

                <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-10 px-8 mx-auto shadow-lg shadow-violet-600/20">
                  <Link href="/vibecode">Postular a Vibecode Lab ahora →</Link>
                </Button>
              </div>
            ) : (
              /* CONSULTING ONLY CTA */
              <div className="rounded-2xl border border-indigo-500/25 bg-slate-950/40 p-6 md:p-8 text-center space-y-4 max-w-xl mx-auto">
                <Badge className="bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wide flex items-center gap-1.5 w-fit mx-auto">
                  <Home className="h-3 w-3" />
                  Consultoría de Procesos
                </Badge>
                <h4 className="font-bold text-white text-lg">¿Quieres Optimizar tu Negocio de Forma Personalizada?</h4>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                  Si prefieres delegar completamente el diseño de tus integraciones, bots de RPA o automatizaciones corporativas, agenda una sesión de diagnóstico conmigo.
                </p>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-6 mx-auto">
                  <Link href="/agendar">Agendar Reunión de Evaluación</Link>
                </Button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
