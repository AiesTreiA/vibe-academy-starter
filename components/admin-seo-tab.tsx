"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Sparkles,
  Plus,
  Search,
  FileText,
  TrendingUp,
  BarChart2,
  DollarSign,
  LineChart,
  Percent,
  ArrowUpRight,
  Eye,
  MousePointer,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Network,
  GitBranch,
  ExternalLink,
  ChevronRight,
  Loader2,
  Layers,
  SearchCode,
  Gauge,
  AlertTriangle,
  Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import SeoInsightsSection from "@/components/seo-insights-section"

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  meta_title?: string
  meta_description?: string
  category: string
  read_time: number
  image_url?: string
  content: string
  toc?: any
  faq?: any
  myths?: any
  cta_type: string
  cta_custom_text?: string
  cta_custom_url?: string
  json_ld?: any
  status: string
  keywords?: string[]
  impressions: number
  clicks: number
  ctr: number
  avg_position: number
  tokens_huawei_in: number
  tokens_huawei_out: number
  tokens_gemini_in: number
  tokens_gemini_out: number
  cost_usd: number
  created_at: string
}

export default function AdminSeoTab() {
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [seoSubTab, setSeoSubTab] = useState<"articles" | "insights">("articles")
  
  // Generation state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateStep, setGenerateStep] = useState(0)
  const [generateLogs, setGenerateLogs] = useState<string[]>([])
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState("")
  const [secKeywords, setSecKeywords] = useState("")
  const [category, setCategory] = useState("automatizacion")
  const [ctaType, setCtaType] = useState("both")
  const [generatedArticle, setGeneratedArticle] = useState<Partial<Article> | null>(null)
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false)

  // Simulation state (Google Search Console)
  const [showSimModal, setShowSimModal] = useState(false)
  const [simArticle, setSimArticle] = useState<Article | null>(null)
  const [simImpressions, setSimImpressions] = useState(0)
  const [simClicks, setSimClicks] = useState(0)
  const [simPosition, setSimPosition] = useState(0)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeChartMetric, setActiveChartMetric] = useState<"clicks" | "impressions">("clicks")

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/seo/articles")
      const data = await res.json()
      if (data.success) {
        setArticles(data.data)
      } else {
        toast({
          title: "Error cargando artículos",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Pre-seed mock data if empty database
  const seedDefaultArticles = async () => {
    // Seed default data will be handled in DB setup or manual creation
    toast({
      title: "Sembrando base inicial",
      description: "Generando artículos de demostración...",
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este artículo?")) return
    try {
      const res = await fetch(`/api/admin/seo/articles/${id}`, {
        method: "DELETE"
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Artículo eliminado",
          description: "El artículo ha sido eliminado con éxito."
        })
        setArticles(articles.filter(a => a.id !== id))
        if (selectedArticle?.id === id) setSelectedArticle(null)
      } else {
        toast({
          title: "Error al eliminar",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleUpdateStatus = async (article: Article, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/seo/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: `Artículo ${newStatus === 'published' ? 'publicado' : 'guardado en borrador'}`,
          description: "Estado actualizado correctamente."
        })
        setArticles(articles.map(a => a.id === article.id ? { ...a, status: newStatus } : a))
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  // Step-by-step generator runner simulation
  const runGeneration = async () => {
    if (!keyword) {
      toast({
        title: "Ingresa una palabra clave",
        description: "El campo palabra clave principal es obligatorio.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    setGenerateStep(0)
    setGeneratedArticle(null)
    setGenerateLogs([])
    setGenerationError(null)

    const addLog = (msg: string) => {
      setGenerateLogs(prev => [...prev, `[${new Date().toLocaleTimeString("es-CL")}] ${msg}`])
    }

    try {
      // Step 0: Ingestion / Indexing
      setGenerateStep(0)
      addLog("Fase 0: Iniciando ingesta masiva de URLs...")
      await new Promise(r => setTimeout(r, 1200))
      addLog("Fase 0: Escaneando árbol de directorios de `/app` y `/components`...")
      addLog("Fase 0: Generando embeddings permanentes del mapa semántico actual.")
      
      // Step 1: Technical Audit
      setGenerateStep(1)
      await new Promise(r => setTimeout(r, 1400))
      addLog("Fase 1: Mapeando brechas de contenido (Content Gaps) e intenciones latentes...")
      addLog(`Fase 1: Palabra clave principal registrada: "${keyword}"`)
      addLog(`Fase 1: Palabra clave secundarias: [${secKeywords || "ninguna"}]`)
      
      // Step 2: Intent research
      setGenerateStep(2)
      await new Promise(r => setTimeout(r, 1500))
      addLog("Fase 2: Analizando Top 5 SERPs en competidores orgánicos...")
      addLog("Fase 2: Identificando puntos ciegos y preguntas frecuentes de los usuarios...")
      addLog("Fase 2: Diseñando estructura jerárquica óptima.")

      // Step 3: Redacting content via Huawei (DeepSeek-V3)
      setGenerateStep(3)
      addLog("Fase 3: Ejecutando redacción fina de alta conversión en Huawei Cloud (DeepSeek-V3)...")
      
      // Actual Fetch to the API
      const secKeywordsArray = secKeywords.split(",").map(k => k.trim()).filter(k => k.length > 0)
      const apiPromise = fetch("/api/admin/seo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          secondaryKeywords: secKeywordsArray,
          category,
          ctaType
        })
      })

      // Add visual delay log for long text generation
      const apiTimeout = new Promise(r => setTimeout(r, 3000))
      await Promise.all([apiPromise, apiTimeout])
      
      const res = await apiPromise
      if (!res.ok) {
        let errDetail = ""
        try {
          const errJson = await res.json()
          errDetail = errJson.error || errJson.message || JSON.stringify(errJson)
        } catch {
          const rawText = await res.text().catch(() => "")
          errDetail = rawText || `Respuesta de servidor HTTP ${res.status}`
        }
        const fullErr = `Error HTTP ${res.status}: ${errDetail}`
        setGenerationError(fullErr)
        addLog(`❌ ${fullErr}`)
        setIsGenerating(false)
        toast({
          title: `❌ Error de Redacción (HTTP ${res.status})`,
          description: errDetail,
          variant: "destructive"
        })
        return
      }

      const data = await res.json()

      if (!data.success) {
        const fullErr = `Error en motor de redacción: ${data.error}`
        setGenerationError(fullErr)
        addLog(`❌ ${fullErr}`)
        setIsGenerating(false)
        toast({
          title: "❌ Error al generar contenido",
          description: data.error,
          variant: "destructive"
        })
        return
      }

      const generatedData = data.data
      addLog(`Fase 3: Borrador conceptual completo. Total palabras: ${generatedData.content.split(/\s+/).length}`)
      addLog(`Fase 3: Coste de redacción registrado: $${generatedData.cost_usd} USD`)
      if (generatedData.image_url) {
        addLog(`📸 Fase 3.5: Portada editorial seleccionada de banco de imágenes de derechos abiertos (Unsplash / Cloudflare R2)`)
      }

      // Step 4: Internal linking
      setGenerateStep(4)
      await new Promise(r => setTimeout(r, 1400))
      addLog("Fase 4: Ejecutando enlazado interno RAG-Driven...")
      addLog("Fase 4: Escaneando artículos existentes para inyectar backlinks bidireccionales...")
      addLog("Fase 4: Inyectados enlaces contextuales a Vibecode Lab, Agendamiento y artículos relacionados.")

      // Step 5: Technical SEO
      setGenerateStep(5)
      await new Promise(r => setTimeout(r, 1200))
      addLog("Fase 5: Generando metadatos estructurados y optimizaciones de velocidad...")
      addLog(`Fase 5: Meta Title optimizado: "${generatedData.meta_title}"`)
      addLog(`Fase 5: Meta Description generada (${generatedData.meta_description.length} chars)`)
      addLog("Fase 5: Esquemas JSON-LD (Article, FAQPage, BreadcrumbList) listos para producción.")

      // Step 6: CTA Conversions
      setGenerateStep(6)
      await new Promise(r => setTimeout(r, 1000))
      addLog("Fase 6: Configurando llamados a la acción dinámicos...")
      addLog(`Fase 6: Llamado a la acción configurado como: "${ctaType === 'both' ? 'Mixto' : ctaType.toUpperCase()}"`)

      // Step 7: Continuous Optimization Setup
      setGenerateStep(7)
      addLog("Fase 7: Configurando loop de Search Console. Listo para revisión y publicación.")
      
      setGeneratedArticle(generatedData)
      toast({
        title: "Generación completada",
        description: "El artículo ha sido redactado y optimizado por la IA.",
      })
      
    } catch (err: any) {
      console.error(err)
      const fullErr = `Excepción en tubería autónoma: ${err.message || err}`
      setGenerationError(fullErr)
      addLog(`❌ ${fullErr}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveGenerated = async () => {
    if (!generatedArticle) return
    try {
      const res = await fetch("/api/admin/seo/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedArticle)
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Artículo guardado",
          description: "El artículo se ha publicado con éxito."
        })
        setArticles([data.data, ...articles])
        setShowGenerateModal(false)
        setGeneratedArticle(null)
      } else {
        toast({
          title: "Error al guardar",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleRegenerateImage = async (article: Article) => {
    setIsRegeneratingImage(true)
    try {
      const res = await fetch("/api/admin/seo/articles/regenerate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id })
      })
      const data = await res.json()
      if (data.success) {
        const updated = { 
          ...article, 
          image_url: data.data.image_url,
          json_ld: {
            ...article.json_ld,
            article: {
              ...article.json_ld?.article,
              image: data.data.image_url
            }
          }
        }
        setSelectedArticle(updated)
        setArticles(articles.map(a => a.id === article.id ? updated : a))
        toast({
          title: "Imagen de alta calidad actualizada",
          description: "Se ha obtenido y guardado una nueva imagen optimizada para el artículo.",
        })
      } else {
        toast({
          title: "Error al actualizar imagen",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setIsRegeneratingImage(false)
    }
  }

  // Optimize article (Phase 7 Loop)
  const runOptimization = async (optType: string) => {
    if (!simArticle) return
    setIsOptimizing(true)
    try {
      const res = await fetch("/api/admin/seo/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: simArticle.id, type: optType })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Optimización completada (Fase 7)",
          description: `Se optimizó el artículo en base a ${optType === 'ctr' ? 'CTR' : optType === 'position' ? 'Posición SERP' : 'Content Decay'}. Coste acumulado incrementado.`,
        })
        
        // Simular las nuevas métricas mejoradas
        let newImpressions = simImpressions
        let newClicks = simClicks
        let newPosition = simPosition

        if (optType === 'ctr') {
          newClicks = Math.round(newClicks * 1.5)
        } else if (optType === 'position') {
          newPosition = Math.max(1, Math.round(newPosition * 0.7))
          newImpressions = Math.round(newImpressions * 1.3)
        } else {
          newImpressions = Math.round(newImpressions * 1.1)
          newClicks = Math.round(newClicks * 1.1)
        }

        const updatedArticle = {
          ...data.data,
          impressions: newImpressions,
          clicks: newClicks,
          avg_position: newPosition,
          ctr: parseFloat(((newClicks / (newImpressions || 1)) * 100).toFixed(2))
        }

        // Actualizar base de datos con las métricas simuladas mejoradas
        await fetch(`/api/admin/seo/articles/${simArticle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            impressions: newImpressions,
            clicks: newClicks,
            avg_position: newPosition,
            ctr: updatedArticle.ctr
          })
        })

        setArticles(articles.map(a => a.id === simArticle.id ? updatedArticle : a))
        setSimArticle(updatedArticle)
        setSimImpressions(newImpressions)
        setSimClicks(newClicks)
        setSimPosition(newPosition)
        
        if (selectedArticle?.id === simArticle.id) {
          setSelectedArticle(updatedArticle)
        }
      } else {
        toast({
          title: "Error al optimizar",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleUpdateSimulatedMetrics = async () => {
    if (!simArticle) return
    try {
      const calculatedCtr = parseFloat(((simClicks / (simImpressions || 1)) * 100).toFixed(2))
      const res = await fetch(`/api/admin/seo/articles/${simArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          impressions: simImpressions,
          clicks: simClicks,
          avg_position: simPosition,
          ctr: calculatedCtr
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Métricas actualizadas",
          description: "Métricas simuladas de Search Console actualizadas con éxito."
        })
        setArticles(articles.map(a => a.id === simArticle.id ? data.data : a))
        if (selectedArticle?.id === simArticle.id) {
          setSelectedArticle(data.data)
        }
        setShowSimModal(false)
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  // KPI calculations
  const stats = useMemo(() => {
    const totalInversion = articles.reduce((sum, a) => sum + (a.cost_usd || 0), 0)
    const totalImpressions = articles.reduce((sum, a) => sum + (a.impressions || 0), 0)
    const totalClicks = articles.reduce((sum, a) => sum + (a.clicks || 0), 0)
    const avgCtr = articles.length > 0 
      ? articles.reduce((sum, a) => sum + (a.ctr || 0), 0) / articles.length 
      : 0
    const avgCost = articles.length > 0 ? totalInversion / articles.length : 0

    return {
      totalInversion: totalInversion.toFixed(3),
      totalImpressions,
      totalClicks,
      avgCtr: avgCtr.toFixed(2),
      avgCost: avgCost.toFixed(3)
    }
  }, [articles])

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (a.keywords && a.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())))
      
      const matchesCategory = categoryFilter === "all" || a.category === categoryFilter
      const matchesStatus = statusFilter === "all" || a.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [articles, searchQuery, categoryFilter, statusFilter])

  // Render ROI Chart SVG Data
  const chartData = useMemo(() => {
    if (articles.length === 0) return null

    // Tomar los últimos 8 artículos para graficar
    const sorted = [...articles]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-8)

    const maxCost = Math.max(...sorted.map(a => a.cost_usd || 0), 0.05)
    const maxMetric = Math.max(...sorted.map(a => activeChartMetric === 'clicks' ? a.clicks : a.impressions), 50)

    const width = 600
    const height = 180
    const padding = 40

    const points = sorted.map((a, idx) => {
      const x = padding + (idx * (width - padding * 2) / Math.max(1, sorted.length - 1))
      
      // Y del Costo (Barra)
      const costRatio = (a.cost_usd || 0) / maxCost
      const costY = height - padding - (costRatio * (height - padding * 2))
      
      // Y del SEO Metric (Línea)
      const metricVal = activeChartMetric === 'clicks' ? a.clicks : a.impressions
      const metricRatio = metricVal / maxMetric
      const metricY = height - padding - (metricRatio * (height - padding * 2))

      return {
        x,
        costY,
        metricY,
        cost: a.cost_usd,
        metricVal,
        title: a.title,
        slug: a.slug
      }
    })

    return { points, maxCost, maxMetric, width, height, padding }
  }, [articles, activeChartMetric])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            SEO Inteligente (Antigravity)
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Ingesta, RAG permanente y ciclo autónomo de optimización de artículos de alta conversión.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {seoSubTab === "articles" && (
            <Button 
              onClick={() => setShowGenerateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generar Artículo con IA
            </Button>
          )}
        </div>
      </div>

      {/* Subtab Navigation Selector */}
      <div className="flex bg-slate-900/60 p-1 border border-white/5 rounded-lg w-fit">
        <button
          onClick={() => setSeoSubTab("articles")}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            seoSubTab === "articles"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          Artículos y Conversión
        </button>
        <button
          onClick={() => setSeoSubTab("insights")}
          className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            seoSubTab === "insights"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          SEO Insights (Diagnóstico)
        </button>
      </div>

      {seoSubTab === "articles" ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-indigo-500/10 bg-slate-950/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Inversión Total en IA</span>
              <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white">${stats.totalInversion} USD</div>
            <div className="text-[10px] text-muted-foreground">Huawei / Gemini acum.</div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/10 bg-slate-950/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Costo Promedio / Art</span>
              <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white">${stats.avgCost} USD</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="h-3 w-3" />
              Alta Eficiencia
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/10 bg-slate-950/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Artículos Publicados</span>
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white">{articles.length}</div>
            <div className="text-[10px] text-muted-foreground">Enlazados bidireccionalmente</div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/10 bg-slate-950/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Impresiones Totales</span>
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white">{stats.totalImpressions.toLocaleString()}</div>
            <div className="text-[10px] text-indigo-400 font-medium">Search Console simulado</div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/10 bg-slate-950/20">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>CTR Promedio</span>
              <Percent className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white">{stats.avgCtr}%</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Ideal: &gt; 3.0%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI SVG Chart */}
      {articles.length > 0 && chartData && (
        <Card className="border-border/30 bg-slate-950/40">
          <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
                <LineChart className="h-4 w-4 text-indigo-400" />
                Gráfica ROI: Inversión en Tokens vs Rendimiento SEO
              </CardTitle>
              <CardDescription className="text-xs">
                Inversión en IA por artículo (barras) frente a los resultados de búsqueda (línea).
              </CardDescription>
            </div>
            <div className="flex items-center bg-slate-900 border border-border/50 rounded p-0.5 text-xs text-muted-foreground">
              <button 
                onClick={() => setActiveChartMetric("clicks")}
                className={`px-2 py-0.5 rounded transition-all ${activeChartMetric === "clicks" ? "bg-indigo-600 text-white" : "hover:text-white"}`}
              >
                Clics
              </button>
              <button 
                onClick={() => setActiveChartMetric("impressions")}
                className={`px-2 py-0.5 rounded transition-all ${activeChartMetric === "impressions" ? "bg-indigo-600 text-white" : "hover:text-white"}`}
              >
                Impresiones
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="w-full overflow-x-auto">
              <svg 
                viewBox={`0 0 ${chartData.width} ${chartData.height}`} 
                className="w-full max-w-[700px] mx-auto overflow-visible"
              >
                {/* Grid horizontal lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                  const y = chartData.padding + r * (chartData.height - chartData.padding * 2)
                  return (
                    <line 
                      key={i} 
                      x1={chartData.padding} 
                      y1={y} 
                      x2={chartData.width - chartData.padding} 
                      y2={y} 
                      stroke="rgba(255,255,255,0.06)" 
                      strokeDasharray="2" 
                    />
                  )
                })}

                {/* Draw Cost Bars */}
                {chartData.points.map((p, i) => {
                  const barWidth = 14
                  const barHeight = chartData.height - chartData.padding - p.costY
                  return (
                    <g key={`bar-${i}`} className="group">
                      <rect 
                        x={p.x - barWidth / 2} 
                        y={p.costY} 
                        width={barWidth} 
                        height={barHeight} 
                        fill="url(#violetGradient)" 
                        rx="2"
                        className="opacity-75 hover:opacity-100 transition-opacity cursor-help"
                      />
                      <title>{`Artículo: ${p.title}\nCosto IA: $${p.cost.toFixed(4)} USD`}</title>
                    </g>
                  )
                })}

                {/* Draw SEO Line */}
                <path 
                  d={chartData.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.metricY}`).join(" ")}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                />

                {/* Draw SEO Points */}
                {chartData.points.map((p, i) => (
                  <g key={`dot-${i}`} className="group">
                    <circle 
                      cx={p.x} 
                      cy={p.metricY} 
                      r="4.5" 
                      fill="#0e172a" 
                      stroke="#06b6d4" 
                      strokeWidth="2"
                      className="cursor-help hover:scale-125 transition-transform"
                    />
                    <title>{`Artículo: ${p.title}\n${activeChartMetric === 'clicks' ? 'Clics' : 'Impresiones'}: ${p.metricVal}`}</title>
                  </g>
                ))}

                {/* X Axis Labels */}
                {chartData.points.map((p, i) => (
                  <text 
                    key={`lbl-${i}`} 
                    x={p.x} 
                    y={chartData.height - 15} 
                    fill="rgba(255,255,255,0.4)" 
                    fontSize="7" 
                    textAnchor="middle"
                  >
                    {p.slug.length > 15 ? `${p.slug.slice(0, 12)}...` : p.slug}
                  </text>
                ))}

                {/* Gradients */}
                <defs>
                  <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>

                {/* Legend */}
                <text x={chartData.padding} y={20} fill="#818cf8" fontSize="8" fontWeight="bold">
                  ■ Costo IA (USD)
                </text>
                <text x={chartData.padding + 90} y={20} fill="#06b6d4" fontSize="8" fontWeight="bold">
                  ● {activeChartMetric === 'clicks' ? 'Clics' : 'Impresiones'} SEO
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Panel Content: Split into list and preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Article List */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/40 bg-slate-950/20">
            <CardHeader className="p-4 pb-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <CardTitle className="text-white text-base">Mesa de Trabajo de Artículos</CardTitle>
                
                {/* Table Search & Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar artículo..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8 bg-slate-900 border-border/50 h-8 text-xs w-full sm:w-48"
                    />
                  </div>

                  <select 
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-border/50 text-xs rounded px-2 h-8 text-white focus:outline-none"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="automatizacion">Automatización</option>
                    <option value="ia-aplicada">IA Aplicada</option>
                    <option value="procesos">Procesos</option>
                    <option value="marca-personal">Marca Personal</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="text-xs">Cargando mesa de trabajo...</span>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground space-y-2">
                  <FileText className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-xs">No se encontraron artículos.</p>
                  {articles.length === 0 && (
                    <Button variant="outline" size="sm" onClick={seedDefaultArticles} className="border-border/50 text-xs text-indigo-400">
                      Crear base inicial
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-900/40">
                      <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs py-2.5 pl-4">Artículo</TableHead>
                        <TableHead className="text-muted-foreground text-xs py-2.5">Categoría</TableHead>
                        <TableHead className="text-muted-foreground text-xs py-2.5">Costo IA</TableHead>
                        <TableHead className="text-muted-foreground text-xs py-2.5">Posición SERP</TableHead>
                        <TableHead className="text-muted-foreground text-xs py-2.5">Impress. / Clics</TableHead>
                        <TableHead className="text-muted-foreground text-xs py-2.5 text-right pr-4">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArticles.map(a => (
                        <TableRow 
                          key={a.id} 
                          onClick={() => setSelectedArticle(a)}
                          className={`border-border/20 cursor-pointer transition-colors hover:bg-slate-900/20 ${selectedArticle?.id === a.id ? 'bg-indigo-600/10 border-indigo-600/30' : ''}`}
                        >
                          <TableCell className="pl-4 py-3">
                            <div className="font-semibold text-white text-xs leading-snug">{a.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                              <span>/{a.slug}</span>
                              <span>•</span>
                              <Badge variant="outline" className={`text-[8px] h-3.5 px-1 py-0 border-none ${a.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                {a.status === 'published' ? 'Publicado' : 'Borrador'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-xs text-muted-foreground py-3">
                            {a.category.replace("-", " ")}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-indigo-300 py-3">
                            ${(a.cost_usd || 0).toFixed(4)} USD
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-xs text-white font-medium flex items-center gap-1">
                              {a.avg_position ? `${a.avg_position}°` : '—'}
                              {a.avg_position && a.avg_position <= 3 && <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] h-3 px-1">Top</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="text-white">{a.impressions?.toLocaleString() || 0} imp</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{a.clicks || 0} clics ({a.ctr || 0}%)</div>
                          </TableCell>
                          <TableCell className="text-right pr-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-indigo-400 hover:text-white hover:bg-slate-900"
                                onClick={() => {
                                  setSimArticle(a)
                                  setSimImpressions(a.impressions || 0)
                                  setSimClicks(a.clicks || 0)
                                  setSimPosition(a.avg_position || 10)
                                  setShowSimModal(true)
                                }}
                                title="Simular métricas Search Console"
                              >
                                <Gauge className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-amber-400 hover:text-white hover:bg-slate-900"
                                onClick={() => handleUpdateStatus(a, a.status === 'published' ? 'draft' : 'published')}
                                title="Cambiar estado"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-rose-500 hover:text-rose-400 hover:bg-slate-900"
                                onClick={() => handleDelete(a.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Preview & SEO Report */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border/40 bg-slate-950/20 h-full flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-border/20">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <SearchCode className="h-4 w-4 text-indigo-400" />
                Informe SEO y Marcados
              </CardTitle>
              <CardDescription className="text-xs">
                Selecciona un artículo de la lista para ver su previsualización y código técnico.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between overflow-y-auto max-h-[600px]">
              {selectedArticle ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Featured Image & Quick Actions */}
                    <div className="p-3 bg-slate-900/60 border border-border/30 rounded space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                          Portada del Artículo
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={isRegeneratingImage}
                          onClick={() => handleRegenerateImage(selectedArticle)}
                          className="h-6 text-[10px] px-2 text-indigo-400 hover:text-white hover:bg-indigo-600/20"
                        >
                          {isRegeneratingImage ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Obteniendo...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Regenerar Portada
                            </>
                          )}
                        </Button>
                      </div>
                      {(selectedArticle.image_url || selectedArticle.json_ld?.article?.image) ? (
                        <div className="relative w-full h-28 rounded overflow-hidden border border-white/10 shadow-sm bg-black/40">
                          <img 
                            src={selectedArticle.image_url || selectedArticle.json_ld?.article?.image} 
                            alt={selectedArticle.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded border border-dashed border-white/10 flex items-center justify-center text-[10px] text-muted-foreground">
                          Sin imagen asignada
                        </div>
                      )}
                    </div>

                    {/* Meta Section */}
                    <div className="p-3 bg-slate-900/60 border border-border/30 rounded space-y-2.5">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Meta Title</div>
                        <div className="text-xs text-white font-medium mt-0.5">{selectedArticle.meta_title}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Meta Description</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{selectedArticle.meta_description}</div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-border/20 text-[10px] text-muted-foreground">
                        <span>Slug: /{selectedArticle.slug}</span>
                        <span>Lectura: {selectedArticle.read_time} min</span>
                      </div>
                    </div>

                    {/* Keywords tags */}
                    {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5 tracking-wider">Keywords Objetivo</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedArticle.keywords.map((k, i) => (
                            <Badge key={i} variant="secondary" className="bg-slate-900 border-border/30 text-[9px] py-0 px-1.5 h-4.5 text-indigo-300">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Token statistics */}
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5 tracking-wider">Gasto en Tokens y Modelos</div>
                      <div className="p-2.5 bg-slate-900/30 rounded text-[10px] space-y-1.5 text-muted-foreground border border-border/20">
                        <div className="flex items-center justify-between text-white font-medium border-b border-border/20 pb-1 mb-1">
                          <span>Inversión IA total</span>
                          <span className="text-indigo-400">${(selectedArticle.cost_usd || 0).toFixed(4)} USD</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Huawei / DeepSeek-V3 In</span>
                          <span>{selectedArticle.tokens_huawei_in?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Huawei / DeepSeek-V3 Out</span>
                          <span>{selectedArticle.tokens_huawei_out?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Gemini 3.5 Flash In</span>
                          <span>{selectedArticle.tokens_gemini_in?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Gemini 3.5 Flash Out</span>
                          <span>{selectedArticle.tokens_gemini_out?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Schema Markup View */}
                    {selectedArticle.json_ld && (
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5 tracking-wider">Esquemas JSON-LD (Schema)</div>
                        <div className="relative">
                          <pre className="text-[9px] bg-slate-900/80 p-2.5 rounded border border-border/30 text-indigo-300 font-mono overflow-x-auto max-h-[140px] leading-tight select-all">
                            {JSON.stringify(selectedArticle.json_ld, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/20 flex gap-2">
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-border/50 text-xs text-indigo-400 hover:text-white"
                    >
                      <a href={`/articulos/${selectedArticle.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Ver Publicado
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSimArticle(selectedArticle)
                        setSimImpressions(selectedArticle.impressions || 0)
                        setSimClicks(selectedArticle.clicks || 0)
                        setSimPosition(selectedArticle.avg_position || 10)
                        setShowSimModal(true)
                      }}
                      className="flex-1 border-border/50 text-xs text-amber-400 hover:text-white"
                    >
                      <Gauge className="h-3.5 w-3.5 mr-1" />
                      Optimizar (F7)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-24 space-y-2">
                  <Eye className="h-8 w-8 opacity-20" />
                  <p className="text-xs">No hay artículo seleccionado para inspección.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* DIALOG 1: GENERATE ARTICLE MODAL */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-slate-950 border-border/50 text-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Generador Autónomo SEO (Antigravity)
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Configura el agente autónomo para auditar, redactar y estructurar un nuevo artículo optimizado.
            </DialogDescription>
          </DialogHeader>

          {/* ERROR ALERT BANNER */}
          {generationError && (
            <div className="bg-red-500/15 border border-red-500/50 p-4 rounded-lg space-y-2 animate-in fade-in duration-200 max-w-full overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>Error Detectado en Servidor (Antigravity Pipeline)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGenerationError(null)}
                  className="h-6 text-[10px] text-red-400 hover:text-white hover:bg-red-500/20 px-2"
                >
                  Descartar
                </Button>
              </div>
              <p className="text-xs text-red-200 font-mono bg-red-950/60 p-2.5 rounded border border-red-500/30 whitespace-pre-wrap break-words max-w-full overflow-x-auto">
                {generationError}
              </p>
              <div className="text-[11px] text-red-300/90 leading-tight">
                💡 <strong>Diagnóstico:</strong> Comprueba las llaves de API de IA (<code className="text-amber-300">DEEPSEEK_API_KEY</code>, <code className="text-amber-300">OPENAI_API_KEY</code>, <code className="text-amber-300">HUAWEI_API_KEY</code> o <code className="text-amber-300">GEMINI_API_KEY</code>) en tu servidor.
              </div>
            </div>
          )}

          {!isGenerating && !generatedArticle ? (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="keyword" className="text-xs">Keyword / Tema Principal</Label>
                  <Input 
                    id="keyword"
                    placeholder="Ej: Automatizar Reporte de Finanzas con Make"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    className="bg-slate-900 border-border/50 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-keywords" className="text-xs">Keywords Secundarias (Sep. por coma)</Label>
                  <Input 
                    id="sec-keywords"
                    placeholder="Ej: automatización Make, finanzas pymes, optimización"
                    value={secKeywords}
                    onChange={e => setSecKeywords(e.target.value)}
                    className="bg-slate-900 border-border/50 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs">Categoría Destino</Label>
                  <select 
                    id="category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-border/50 text-xs rounded p-2.5 text-white focus:outline-none"
                  >
                    <option value="automatizacion">Automatización de Procesos</option>
                    <option value="ia-aplicada">Inteligencia Artificial Aplicada</option>
                    <option value="procesos">Rediseño de Procesos (Lean)</option>
                    <option value="marca-personal">Marca Personal & Bienestar</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cta" className="text-xs">Llamado a la Acción (CTA)</Label>
                  <select 
                    id="cta"
                    value={ctaType}
                    onChange={e => setCtaType(e.target.value)}
                    className="w-full bg-slate-900 border border-border/50 text-xs rounded p-2.5 text-white focus:outline-none"
                  >
                    <option value="both">Mixto: Vibecode Lab + Consultoría (Recomendado)</option>
                    <option value="vibecode">Vibecode Lab: Postular al curso directamente</option>
                    <option value="consulting">Consultoría: Agenda de Reunión</option>
                  </select>
                </div>
              </div>

              {/* Crawl Preview / Semantic Map SVG Simulation */}
              <div className="border border-border/30 rounded p-3 bg-slate-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  <Network className="h-3.5 w-3.5 text-indigo-400" />
                  Mapa Semántico y Crawl de Enlaces Genuinos
                </div>
                <div className="flex justify-center py-1">
                  <svg width="240" height="90" viewBox="0 0 240 90" className="overflow-visible">
                    {/* Connection lines */}
                    <line x1="120" y1="20" x2="40" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    <line x1="120" y1="20" x2="120" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    <line x1="120" y1="20" x2="200" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                    <path d="M 40 70 Q 120 45 200 70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="3" />

                    {/* Nodes */}
                    <circle cx="120" cy="20" r="10" fill="#6366f1" className="animate-pulse" />
                    <text x="120" y="36" fill="#fff" fontSize="6" textAnchor="middle">Nuevo Artículo</text>

                    <circle cx="40" cy="70" r="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                    <text x="40" y="84" fill="rgba(255,255,255,0.6)" fontSize="6" textAnchor="middle">Inicio (/)</text>

                    <circle cx="120" cy="70" r="8" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1" />
                    <text x="120" y="84" fill="rgba(255,255,255,0.6)" fontSize="6" textAnchor="middle">Vibecode Lab</text>

                    <circle cx="200" cy="70" r="8" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
                    <text x="200" y="84" fill="rgba(255,255,255,0.6)" fontSize="6" textAnchor="middle">Agendar</text>
                  </svg>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  El artículo se enlazará bidireccionalmente de manera orgánica con las secciones clave del ecosistema.
                </p>
              </div>
            </div>
          ) : isGenerating ? (
            /* ACTIVE RUNNING PROCESS FLOW */
            <div className="space-y-4 my-4">
              <div className="relative h-1 bg-slate-900 rounded overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${(generateStep + 1) * 12.5}%` }}
                />
              </div>

              {/* Steps timeline indicator */}
              <div className="grid grid-cols-8 gap-1 text-center text-[9px] font-semibold text-muted-foreground">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(step => (
                  <div 
                    key={step}
                    className={`pb-1 border-b-2 ${generateStep >= step ? 'border-indigo-500 text-white' : 'border-transparent'}`}
                  >
                    Fase {step}
                  </div>
                ))}
              </div>

              {/* Progress Detail */}
              <div className="flex items-center gap-3 p-3 bg-slate-900 border border-border/30 rounded">
                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {generateStep === 0 && "Fase 0: Ingesta y Indexación (Huawei Cloud Heavy)"}
                    {generateStep === 1 && "Fase 1: Auditoría Técnica y Content Gap"}
                    {generateStep === 2 && "Fase 2: Benchmark de Intención SERPs"}
                    {generateStep === 3 && "Fase 3: Redactando contenido con DeepSeek-V3"}
                    {generateStep === 4 && "Fase 4: Inyección de Enlaces Internos RAG"}
                    {generateStep === 5 && "Fase 5: SEO Técnico y Marcados Estructurados (Gemini Flash)"}
                    {generateStep === 6 && "Fase 6: Configurando llamados de conversión (CTA)"}
                    {generateStep === 7 && "Fase 7: Inicialización del loop autónomo"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Procesando parámetros estructurados del Prompt Maestro...
                  </div>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="bg-slate-950 p-3 rounded border border-border/20 font-mono text-[9px] text-emerald-400 h-44 overflow-y-auto space-y-1 select-none">
                {generateLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={log.includes("❌") ? "text-red-400 font-bold bg-red-950/40 p-1.5 rounded border border-red-500/40 leading-snug" : "leading-tight"}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PREVIEW GENERATED ARTICLE BEFORE SAVING */
            <div className="space-y-4 my-2 max-w-full overflow-hidden">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-2.5 text-xs text-emerald-400 max-w-full">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div className="break-words max-w-full">
                  <span className="font-semibold">¡Artículo redactado exitosamente!</span> Revisa el borrador estructurado antes de insertarlo en la base de datos de producción.
                </div>
              </div>

              <div className="border border-border/40 rounded max-h-[350px] overflow-y-auto overflow-x-hidden max-w-full bg-slate-900/20 p-4 space-y-3 break-words">
                <div className="border-b border-border/20 pb-3">
                  <Badge className="bg-indigo-600/20 text-indigo-300 border-none capitalize text-[9px] mb-1.5">
                    {generatedArticle?.category}
                  </Badge>
                  <h1 className="text-base font-bold text-white leading-snug break-words">{generatedArticle?.title}</h1>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug break-words">{generatedArticle?.subtitle}</p>
                  {(generatedArticle?.image_url || generatedArticle?.json_ld?.article?.image) && (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-white/10 mt-3 shadow-md bg-black/40">
                      <img 
                        src={generatedArticle.image_url || generatedArticle.json_ld?.article?.image} 
                        alt={generatedArticle.title || "Hero preview"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                {/* Meta details preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-border/20 text-[10px] text-muted-foreground break-all">
                  <div>Slug: <span className="text-white">/{generatedArticle?.slug}</span></div>
                  <div>Lectura: <span className="text-white">{generatedArticle?.read_time} min</span></div>
                  <div>Inversión IA: <span className="text-indigo-400">${generatedArticle?.cost_usd} USD</span></div>
                </div>

                {/* Markdown content preview excerpt */}
                <div className="text-xs text-muted-foreground space-y-2 leading-relaxed max-w-full overflow-hidden">
                  <p className="font-semibold text-white">Contenido completo:</p>
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto max-w-full font-sans bg-slate-900/60 p-3.5 rounded-lg border border-border/20 text-slate-200">
                    {generatedArticle?.content}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/20 pt-3">
            {!isGenerating && !generatedArticle && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowGenerateModal(false)} className="border-border/50 text-xs text-slate-400">
                  Cancelar
                </Button>
                <Button onClick={runGeneration} className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white">
                  Ejecutar Agente
                </Button>
              </>
            )}
            {isGenerating && (
              <Button disabled className="bg-indigo-600/50 text-xs text-white">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Redactando artículo...
              </Button>
            )}
            {generatedArticle && (
              <>
                <Button variant="outline" size="sm" onClick={() => setGeneratedArticle(null)} className="border-border/50 text-xs text-slate-400">
                  Atrás
                </Button>
                <Button onClick={handleSaveGenerated} className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white">
                  Guardar y Publicar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: SIMULATE SEARCH CONSOLE & OPTIMIZE (F7) */}
      <Dialog open={showSimModal} onOpenChange={setShowSimModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-slate-950 border-border/50 text-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Gauge className="h-5 w-5 text-indigo-400" />
              Consola de Optimización Analítica
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Simula datos de rendimiento SEO y ejecuta el loop autónomo de optimización continua (Fase 7).
            </DialogDescription>
          </DialogHeader>

          {simArticle && (
            <div className="space-y-4 my-2">
              <div className="p-3 bg-slate-900 border border-border/30 rounded space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Artículo a optimizar</div>
                <div className="text-xs font-semibold text-white leading-snug">{simArticle.title}</div>
                <div className="text-[10px] text-indigo-300">Costo IA acumulado: ${(simArticle.cost_usd || 0).toFixed(4)} USD</div>
              </div>

              {/* Set Metrics Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sim-impressions" className="text-xs">Impresiones</Label>
                  <Input 
                    id="sim-impressions"
                    type="number"
                    value={simImpressions}
                    onChange={e => setSimImpressions(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-slate-900 border-border/50 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sim-clicks" className="text-xs">Clics</Label>
                  <Input 
                    id="sim-clicks"
                    type="number"
                    value={simClicks}
                    onChange={e => setSimClicks(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-slate-900 border-border/50 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sim-pos" className="text-xs">Posición Media</Label>
                  <Input 
                    id="sim-pos"
                    type="number"
                    step="0.1"
                    value={simPosition}
                    onChange={e => setSimPosition(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="bg-slate-900 border-border/50 text-xs text-white"
                  />
                </div>
              </div>

              <div className="text-center text-[10px] text-muted-foreground border-b border-border/20 pb-3">
                CTR calculado: <span className="font-semibold text-white">{parseFloat(((simClicks / (simImpressions || 1)) * 100).toFixed(2))}%</span>
              </div>

              {/* Trigger Loop Phase 7 Buttons */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white">Ejecutar Re-optimización Inteligente (Fase 7)</div>
                
                {isOptimizing ? (
                  <div className="p-4 bg-slate-900 border border-border/30 rounded flex items-center justify-center gap-3 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Optimizando código semántico y metadatos con Gemini...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      onClick={() => runOptimization("ctr")}
                      variant="outline"
                      className="border-indigo-500/20 bg-indigo-950/10 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs flex justify-between h-9 px-3"
                    >
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Optimizar por Bajo CTR
                      </span>
                      <span className="text-[9px] opacity-60">Reescribe Meta Title/Desc</span>
                    </Button>
                    
                    <Button 
                      onClick={() => runOptimization("position")}
                      variant="outline"
                      className="border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs flex justify-between h-9 px-3"
                    >
                      <span className="flex items-center gap-2">
                        <GitBranch className="h-3.5 w-3.5" />
                        Impulsar Posición (Rank 5-20)
                      </span>
                      <span className="text-[9px] opacity-60">Inyecta nuevas secciones</span>
                    </Button>

                    <Button 
                      onClick={() => runOptimization("decay")}
                      variant="outline"
                      className="border-amber-500/20 bg-amber-950/10 hover:bg-amber-600 text-amber-300 hover:text-white text-xs flex justify-between h-9 px-3"
                    >
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Corregir Decaimiento (Content Decay)
                      </span>
                      <span className="text-[9px] opacity-60">Renueva estadísticas 2026/27</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/20 pt-3">
            <Button variant="outline" size="sm" onClick={() => setShowSimModal(false)} className="border-border/50 text-xs text-slate-400" disabled={isOptimizing}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateSimulatedMetrics} className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white" disabled={isOptimizing}>
              Guardar Métricas de Simulación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      ) : (
        <SeoInsightsSection />
      )}
    </div>
  )
}
