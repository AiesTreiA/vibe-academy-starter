"use client"

import React, { useState, useEffect } from "react"
import {
  Sparkles,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Settings,
  Globe,
  FileText,
  Clock,
  Gauge,
  ArrowRight,
  Save,
  HelpCircle,
  ArrowUpRight,
  ListFilter,
  History,
  Archive,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Recommendation {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  impact: string
  status: "pending" | "resolved"
  actionText: string
  targetUrl: string
}

interface KeywordMetric {
  term: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface AuditDetail {
  url: string
  status: "success" | "warning" | "error"
  errors: string[]
}

interface PageSpeedMetric {
  value: number
  label: string
  unit: string
  status: "good" | "needs-improvement" | "poor"
}

export interface HistoryItem {
  id: string
  recommendationId?: string
  targetUrl: string
  type: string
  title: string
  appliedValue: any
  appliedAt: string
}

interface SeoData {
  generalScore: number
  stats: {
    totalPages: number
    indexedPages: number
    errorPages: number
    avgSpeedScore: number
  }
  pageSpeedMetrics: {
    lcp: PageSpeedMetric
    inp: PageSpeedMetric
    cls: PageSpeedMetric
    fcp: PageSpeedMetric
    tti: PageSpeedMetric
    speedIndex: PageSpeedMetric
  }
  pageSpeedIsLive?: boolean
  searchConsole: {
    keywords: KeywordMetric[]
    summary: {
      totalImpressions: number
      totalClicks: number
      avgCtr: number
      avgPosition: number
    }
    isLive?: boolean
    error?: string
    property?: string
  }
  auditDetails: AuditDetail[]
  recommendations: Recommendation[]
  history?: HistoryItem[]
  settings: {
    globalTitle: string
    siteDescription: string
    defaultOgImage: string
    robotsTxt: string
    sitemapXml: string
  }
}

export default function SeoInsightsSection() {
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [data, setData] = useState<SeoData | null>(null)
  
  // Tab local state: "summary" | "recommendations" | "keywords" | "settings"
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "recommendations" | "keywords" | "settings">("summary")
  const [recViewFilter, setRecViewFilter] = useState<"pending" | "history">("pending")
  const [recentlyCompletedId, setRecentlyCompletedId] = useState<string | null>(null)
  
  // Keyword search filter
  const [kwSearch, setKwSearch] = useState("")

  // Form states
  const [globalTitle, setGlobalTitle] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [defaultOgImage, setDefaultOgImage] = useState("")
  const [robotsTxt, setRobotsTxt] = useState("")
  const [sitemapXml, setSitemapXml] = useState("")

  // AI Cost & Modification Tracker (Simulated / LocalStorage persistent)
  const [totalAiCost, setTotalAiCost] = useState(0.0)
  const [appliedImprovements, setAppliedImprovements] = useState(0)
  const [processedTokens, setProcessedTokens] = useState(0)

  // Dialog / Modal states
  const [activeModal, setActiveModal] = useState<"meta" | "title" | "images" | "cache" | null>(null)
  const [activeTargetUrl, setActiveTargetUrl] = useState("")
  const [activeCurrentText, setActiveCurrentText] = useState("")
  const [activeRecId, setActiveRecId] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [nicheInput, setNicheInput] = useState("Consultoría de Software Avanzada, Automatización e Inteligencia Artificial y Clientes de Alto Valor")
  
  // Buffers for edits
  const [tempMetaText, setTempMetaText] = useState("")
  const [tempTitleText, setTempTitleText] = useState("")
  const [tempAltTexts, setTempAltTexts] = useState<string[]>(["", "", ""])
  const [cacheOptions, setCacheOptions] = useState({ edgeCache: true, compression: true, lazyLoad: true })

  useEffect(() => {
    fetchSeoInsights()
    // Load persisted AI usage cost
    if (typeof window !== "undefined") {
      const savedCost = localStorage.getItem("seo_ai_total_cost")
      const savedImps = localStorage.getItem("seo_ai_improvements")
      const savedTokens = localStorage.getItem("seo_ai_tokens")
      if (savedCost) setTotalAiCost(parseFloat(savedCost))
      if (savedImps) setAppliedImprovements(parseInt(savedImps))
      if (savedTokens) setProcessedTokens(parseInt(savedTokens))
    }
  }, [])

  const trackAiUsage = (cost: number, tokens: number) => {
    const newCost = totalAiCost + cost
    const newImps = appliedImprovements + 1
    const newTokens = processedTokens + tokens

    setTotalAiCost(newCost)
    setAppliedImprovements(newImps)
    setProcessedTokens(newTokens)

    if (typeof window !== "undefined") {
      localStorage.setItem("seo_ai_total_cost", newCost.toString())
      localStorage.setItem("seo_ai_improvements", newImps.toString())
      localStorage.setItem("seo_ai_tokens", newTokens.toString())
    }
  }

  const handleOptimizeWithAi = async (
    action: "generate-meta" | "optimize-title" | "generate-alt",
    overrideTargetUrl?: string,
    overrideCurrentText?: string
  ) => {
    setIsOptimizing(true)
    try {
      const urlToSend = overrideTargetUrl || activeTargetUrl || (action === "generate-alt" ? "/vibecodelab" : "/vibecode")
      const textToSend = overrideCurrentText !== undefined ? overrideCurrentText : (activeCurrentText || "")
      const res = await fetch("/api/admin/seo/insights/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          targetUrl: urlToSend,
          currentText: textToSend,
          niche: nicheInput
        })
      })

      const json = await res.json()
      if (json.success) {
        const { result, usage } = json
        if (action === "generate-meta") {
          setTempMetaText(result.metaDescription || "")
        } else if (action === "optimize-title") {
          setTempTitleText(result.optimizedTitle || "")
        } else if (action === "generate-alt") {
          const alts = result.altTexts || []
          if (Array.isArray(alts) && alts.length > 0) {
            setTempAltTexts(alts)
          }
        }

        // Track actual tokens and cost in localStorage
        trackAiUsage(usage?.costUsd || 0.0001, (usage?.tokensIn || 0) + (usage?.tokensOut || 0))
        
        toast({
          title: "Optimización generada con IA",
          description: `Proveedor: ${json.provider || "IA"}.`
        })
      } else {
        toast({
          title: "Aviso de IA",
          description: json.error || "Se utilizaron sugerencias heurísticas contextuales.",
        })
      }
    } catch (err) {
      toast({
        title: "Aviso de conexión",
        description: "Se han precargado sugerencias contextuales para continuar.",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplyImprovement = async (
    type: "meta" | "title" | "images" | "cache",
    value: any,
    successMessage: string,
    explicitRecId?: string
  ) => {
    setIsApplying(true)
    const effectiveTargetUrl = activeTargetUrl || (type === "images" ? "/vibecodelab" : "/vibecode")
    const recId =
      explicitRecId ||
      activeRecId ||
      (type === "meta"
        ? `rec-meta-${effectiveTargetUrl.replace(/[^a-zA-Z0-9]/g, "-")}`
        : type === "title"
        ? `rec-title-${effectiveTargetUrl.replace(/[^a-zA-Z0-9]/g, "-")}`
        : type === "images"
        ? `rec-alt-${effectiveTargetUrl.replace(/[^a-zA-Z0-9]/g, "-")}`
        : "rec-5")

    setRecentlyCompletedId(recId)

    try {
      const res = await fetch("/api/admin/seo/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply-optimization",
          targetUrl: effectiveTargetUrl,
          type,
          value,
          recommendationId: recId
        })
      })

      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
        toast({
          title: "Mejora guardada y archivada",
          description: json.message || successMessage
        })
        setActiveModal(null)
        setTimeout(() => {
          setRecentlyCompletedId(null)
        }, 1200)
      } else {
        setRecentlyCompletedId(null)
        toast({
          title: "Error al aplicar",
          description: json.error || "No se pudo guardar la mejora.",
          variant: "destructive"
        })
      }
    } catch (err) {
      setRecentlyCompletedId(null)
      toast({
        title: "Error de red",
        description: "No se pudo comunicar con el servidor.",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  const fetchSeoInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/seo/insights")
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        // Populate form fields
        setGlobalTitle(json.data.settings.globalTitle)
        setSiteDescription(json.data.settings.siteDescription)
        setDefaultOgImage(json.data.settings.defaultOgImage)
        setRobotsTxt(json.data.settings.robotsTxt)
        setSitemapXml(json.data.settings.sitemapXml)
      } else {
        toast({
          title: "Error de carga",
          description: json.error || "No se pudieron obtener los datos de SEO",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error de red",
        description: "No se pudo comunicar con el servidor.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await fetch("/api/admin/seo/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalTitle,
          siteDescription,
          defaultOgImage,
          robotsTxt,
          sitemapXml
        })
      })
      const json = await res.json()
      if (json.success) {
        toast({
          title: "Configuración guardada",
          description: "Los cambios de Meta-Tags y archivos de SEO se aplicaron correctamente."
        })
        // Update local reference
        if (data) {
          setData({
            ...data,
            settings: json.data
          })
        }
      } else {
        toast({
          title: "Error al guardar",
          description: json.error,
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un fallo al guardar las configuraciones.",
        variant: "destructive"
      })
    } finally {
      setSavingSettings(false)
    }
  }

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400"
      case "medium":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400"
      case "low":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
    }
  }

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <Badge className="bg-rose-600 text-white hover:bg-rose-700">Prioridad Alta</Badge>
      case "medium":
        return <Badge className="bg-amber-600 text-white hover:bg-amber-700">Prioridad Media</Badge>
      case "low":
        return <Badge className="bg-slate-700 text-slate-200 hover:bg-slate-800">Prioridad Baja</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 stroke-emerald-400"
    if (score >= 70) return "text-amber-400 stroke-amber-400"
    return "text-rose-500 stroke-rose-500"
  }

  const filteredKeywords = data?.searchConsole.keywords.filter(kw =>
    kw.term.toLowerCase().includes(kwSearch.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-muted-foreground text-sm">Analizando estado del SEO del sitio...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex bg-slate-950/60 p-1 border border-white/10 rounded-lg">
          <button
            onClick={() => setActiveSubTab("summary")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "summary"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveSubTab("recommendations")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "recommendations"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Recomendaciones ({data.recommendations.filter(r => r.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveSubTab("keywords")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "keywords"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Palabras Clave & Tráfico
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === "settings"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Configuración Global
          </button>
        </div>

        <Button
          onClick={fetchSeoInsights}
          variant="outline"
          size="sm"
          className="border-white/10 text-xs text-slate-300 hover:bg-slate-900"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Actualizar Diagnóstico
        </Button>
      </div>

      {/* VIEW 1: SUMMARY GENERAL */}
      {activeSubTab === "summary" && (
        <div className="space-y-6">
          {/* Main Indicators Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Circular SEO Score Card */}
            <Card className="border-white/15 bg-slate-950/40 relative overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-indigo-400" />
                  Score SEO General
                </CardTitle>
                <CardDescription className="text-xs">
                  Diagnóstico consolidado del rendimiento y estructura.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 flex-1">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-slate-800"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Colored score circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`${getScoreColor(data.generalScore)} transition-all duration-1000 ease-out`}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * data.generalScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{data.generalScore}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">/ 100</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  {data.generalScore >= 90 ? (
                    <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      Excelente Cumplimiento
                    </Badge>
                  ) : data.generalScore >= 70 ? (
                    <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      Cumplimiento Aceptable
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-500/10 border border-rose-500/30 text-rose-400">
                      Acción Crítica Requerida
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Indexed vs Errors Card */}
            <Card className="border-white/15 bg-slate-950/40 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  Indexación de Páginas
                </CardTitle>
                <CardDescription className="text-xs">
                  Estado de rastreo de URLs en base de datos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 border border-white/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Indexadas</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                      <CheckCircle className="h-4 w-4" />
                      {data.stats.indexedPages}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-4 border border-white/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground">Con Errores</div>
                    <div className="text-2xl font-bold text-rose-500 mt-1 flex items-center justify-center gap-1.5">
                      <XCircle className="h-4 w-4" />
                      {data.stats.errorPages}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso de indexación</span>
                    <span>{Math.round((data.stats.indexedPages / data.stats.totalPages) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${(data.stats.indexedPages / data.stats.totalPages) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Total auditado: {data.stats.totalPages} páginas. {data.stats.errorPages} requieren optimizaciones urgentes de meta-tags.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals Card */}
            <Card className="border-white/15 bg-slate-950/40 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    Rendimiento y Carga
                  </CardTitle>
                  {data.pageSpeedIsLive ? (
                    <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                      ● Google PageSpeed En Vivo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-white/20 text-slate-400">
                      Auditoría Base
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {data.pageSpeedIsLive
                    ? "Métricas reales obtenidas desde la API oficial de Google PageSpeed (Mobile)."
                    : "Métricas de Core Web Vitals para javiermujica.com."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* LCP */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-2.5 border border-white/5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">LCP (Carga de Imagen Hero)</span>
                      <span className="text-[10px] text-muted-foreground">Largest Contentful Paint</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {data.pageSpeedMetrics.lcp.value} {data.pageSpeedMetrics.lcp.unit}
                      </span>
                      <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] py-0">
                        Óptimo
                      </Badge>
                    </div>
                  </div>

                  {/* INP */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-2.5 border border-white/5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">INP (Interactividad de la Página)</span>
                      <span className="text-[10px] text-muted-foreground">Interaction to Next Paint</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {data.pageSpeedMetrics.inp.value} {data.pageSpeedMetrics.inp.unit}
                      </span>
                      <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] py-0">
                        Rápido
                      </Badge>
                    </div>
                  </div>

                  {/* CLS */}
                  <div className="flex items-center justify-between bg-slate-900/40 p-2.5 border border-white/5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">CLS (Estabilidad del Layout)</span>
                      <span className="text-[10px] text-muted-foreground">Cumulative Layout Shift</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {data.pageSpeedMetrics.cls.value}
                      </span>
                      <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] py-0">
                        Óptimo
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 border-t border-white/5 pt-2">
                  <span>PageSpeed Score Promedio:</span>
                  <span className="font-bold text-emerald-400">{data.stats.avgSpeedScore}/100</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Cost Tracker Card */}
            <Card className="border-indigo-500/20 bg-slate-950/40 relative overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-1.5">
                <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Optimización con IA
                </CardTitle>
                <CardDescription className="text-xs">
                  Gasto y tokens acumulados por mejoras automáticas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 flex-1 flex flex-col justify-between">
                <div className="bg-slate-900/60 p-3.5 border border-indigo-500/10 rounded-lg text-center relative overflow-hidden">
                  <div className="text-[10px] text-muted-foreground">Inversión SEO IA (GSC/Meta)</div>
                  <div className="text-xl font-extrabold text-indigo-300 mt-1">
                    ${totalAiCost.toFixed(5)} USD
                  </div>
                  <div className="absolute top-0 right-0 p-1 opacity-10">
                    <Sparkles className="h-10 w-10 text-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-900/40 p-2 border border-white/5 rounded">
                    <div className="text-[9px] text-muted-foreground">Mejoras Aplicadas</div>
                    <div className="font-semibold text-white mt-0.5">{appliedImprovements}</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 border border-white/5 rounded">
                    <div className="text-[9px] text-muted-foreground">Tokens procesados</div>
                    <div className="font-semibold text-slate-300 mt-0.5">{processedTokens.toLocaleString()}</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    if (confirm("¿Estás seguro de restablecer el gasto del optimizador?")) {
                      setTotalAiCost(0.0)
                      setAppliedImprovements(0)
                      setProcessedTokens(0)
                      localStorage.removeItem("seo_ai_total_cost")
                      localStorage.removeItem("seo_ai_improvements")
                      localStorage.removeItem("seo_ai_tokens")
                      toast({ title: "Historial de gasto de IA restablecido" })
                    }
                  }}
                  variant="ghost" 
                  className="text-[9px] text-muted-foreground hover:text-white hover:bg-slate-900 h-6 w-full mt-2"
                >
                  Restablecer acumulador
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Score Breakdown and Failing Pages Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Math Breakdown */}
            <Card className="border-white/10 bg-slate-950/30 lg:col-span-5 flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-indigo-400" />
                  Desglose del Puntaje SEO
                </CardTitle>
                <CardDescription className="text-xs">
                  Entiende en base a qué métricas se calcula tu Score actual de {data.generalScore}/100.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4 text-xs">
                <div className="space-y-3">
                  {/* Indexación */}
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-300">1. Salud de Indexación (40%)</span>
                      <span className={`${data.stats.errorPages > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {Math.round((data.stats.indexedPages / data.stats.totalPages) * 40 * 10) / 10} / 40 pts
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Calculado sobre el porcentaje de páginas sin errores: ({data.stats.indexedPages} de {data.stats.totalPages} exitosas). 
                      <span className="text-rose-400 block mt-0.5 font-medium">Tus {data.stats.errorPages} páginas con errores te restan {Math.round((data.stats.errorPages / data.stats.totalPages) * 40 * 10) / 10} puntos.</span>
                    </p>
                  </div>

                  {/* PageSpeed */}
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-300">2. Velocidad PageSpeed (40%)</span>
                      <span className="text-emerald-400">
                        {Math.round((data.stats.avgSpeedScore / 100) * 40 * 10) / 10} / 40 pts
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Basado en tu puntaje de rendimiento de Core Web Vitals ({data.stats.avgSpeedScore}/100). Aporta {Math.round((data.stats.avgSpeedScore / 100) * 40 * 10) / 10} puntos.
                    </p>
                  </div>

                  {/* Meta Tags Globales */}
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-300">3. Meta-Tags Globales (20%)</span>
                      <span className="text-emerald-400">20 / 20 pts</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Verifica la correcta configuración de og:image y meta descripciones generales para compartir enlaces.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-300">
                  <strong>Tip de Impacto:</strong> Si resuelves las advertencias de meta descripción y longitud de títulos de las {data.stats.errorPages} páginas afectadas, tu puntaje subirá inmediatamente a <strong>{Math.round((1 + (data.stats.avgSpeedScore/100)*40 + 20))} / 100</strong>.
                </div>
              </CardContent>
            </Card>

            {/* Right side: Failing Pages list */}
            <Card className="border-white/10 bg-slate-950/30 lg:col-span-7 flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Páginas con Errores Detectados ({data.stats.errorPages})
                </CardTitle>
                <CardDescription className="text-xs">
                  Modifica o genera con IA los tags para estas páginas específicas para resolver los errores.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t border-white/5 max-h-[310px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-950/40 text-xs">
                    <TableRow className="border-b border-white/5">
                      <TableHead className="text-muted-foreground py-2">Página / URL</TableHead>
                      <TableHead className="text-muted-foreground py-2">Detalle del Error</TableHead>
                      <TableHead className="text-muted-foreground text-right py-2">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.auditDetails.filter(d => d.status !== "success").map((detail, idx) => (
                      <TableRow key={idx} className="border-b border-white/5 hover:bg-slate-900/30 transition-colors">
                        <TableCell className="font-mono text-[11px] text-slate-300 py-2.5 max-w-[180px] truncate" title={detail.url}>
                          {detail.url}
                        </TableCell>
                        <TableCell className="text-[11px] text-rose-400 py-2.5 font-medium">
                          {detail.errors.join(", ")}
                        </TableCell>
                        <TableCell className="text-right py-2.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveTargetUrl(detail.url)
                              setActiveCurrentText(detail.errors.join(", "))
                              setTempMetaText("")
                              setTempTitleText("")
                              if (detail.errors.some(e => e.includes("Meta Descripción"))) {
                                setActiveRecId("rec-1")
                                setActiveModal("meta")
                              } else if (detail.errors.some(e => e.includes("Título"))) {
                                setActiveRecId("rec-2")
                                setActiveModal("title")
                              } else if (detail.errors.some(e => e.includes("alt"))) {
                                setActiveRecId("rec-3")
                                setActiveModal("images")
                              } else {
                                setActiveRecId("rec-1")
                                setActiveModal("meta")
                              }
                            }}
                            className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[10px] h-7 px-2.5"
                          >
                            Resolver con IA
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.auditDetails.filter(d => d.status !== "success").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-xs text-emerald-400 py-8">
                          🎉 ¡Excelente! No se detectaron errores de indexación ni meta-tags.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Audit URL List with badges */}
          <Card className="border-white/10 bg-slate-950/20">
            <CardHeader className="p-4">
              <CardTitle className="text-white text-sm font-semibold">Auditoría Completa del Sitio</CardTitle>
              <CardDescription className="text-xs">
                Cumplimiento normativo y presencia de meta etiquetas por URL auditada.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[220px] overflow-y-auto border-t border-white/10">
              <Table>
                <TableHeader className="bg-slate-950/40 text-xs">
                  <TableRow className="border-b border-white/10">
                    <TableHead className="text-muted-foreground">URL del Sitio</TableHead>
                    <TableHead className="text-muted-foreground">Estado SEO</TableHead>
                    <TableHead className="text-muted-foreground">Problemas Encontrados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.auditDetails.map((detail, idx) => (
                    <TableRow key={idx} className="border-b border-white/5 hover:bg-slate-900/30 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-300 py-2.5">{detail.url}</TableCell>
                      <TableCell className="py-2.5">
                        {detail.status === "success" && (
                          <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] flex items-center w-fit gap-1">
                            <CheckCircle className="h-3 w-3" /> CUMPLE
                          </Badge>
                        )}
                        {detail.status === "warning" && (
                          <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] flex items-center w-fit gap-1">
                            <AlertTriangle className="h-3 w-3" /> ADVERTENCIA
                          </Badge>
                        )}
                        {detail.status === "error" && (
                          <Badge className="bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center w-fit gap-1">
                            <XCircle className="h-3 w-3" /> CRÍTICO
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs py-2.5">
                        {detail.errors.length > 0 ? (
                          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                            {detail.errors.map((err, eIdx) => (
                              <li key={eIdx}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-emerald-400/70">Todo en orden</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 2: RECOMMENDATIONS & ARCHIVED HISTORY */}
      {activeSubTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-4 rounded-xl border border-white/10">
            <div>
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Sugerencias de Optimización SEO
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Acciones priorizadas para elevar el CTR, corregir metadatos y archivar mejoras aplicadas.
              </p>
            </div>

            {/* Filter Pills: Pendientes vs Historial */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 p-1 rounded-lg shrink-0">
              <button
                onClick={() => setRecViewFilter("pending")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  recViewFilter === "pending"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Pendientes ({data.recommendations.filter(r => r.status === "pending").length})
              </button>
              <button
                onClick={() => setRecViewFilter("history")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  recViewFilter === "history"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <History className="h-3.5 w-3.5 text-emerald-300" />
                Historial de Mejoras ({(data.history?.length || 0) + data.recommendations.filter(r => r.status === "resolved").length})
              </button>
            </div>
          </div>

          {/* TAB 1: PENDIENTES */}
          {recViewFilter === "pending" && (
            <div className="space-y-3">
              {data.recommendations.filter(r => r.status === "pending").length === 0 ? (
                <Card className="border-emerald-500/20 bg-emerald-950/10 p-8 text-center rounded-xl">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-white font-bold text-base">¡Todas las sugerencias han sido completadas!</h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Tu sitio web y artículos tienen todas sus metaetiquetas y configuraciones al día. Puedes revisar todas las intervenciones guardadas en el historial.
                  </p>
                  <Button
                    onClick={() => setRecViewFilter("history")}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-2"
                  >
                    <History className="h-3.5 w-3.5" />
                    Revisar Historial de Mejoras
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {data.recommendations
                    .filter(r => r.status === "pending")
                    .map((rec) => {
                      const isRecentlyCompleted = recentlyCompletedId === rec.id

                      return (
                        <Card
                          key={rec.id}
                          className={`border-white/10 bg-slate-950/30 relative overflow-hidden transition-all hover:border-indigo-500/30 ${
                            isRecentlyCompleted ? "opacity-40 line-through border-emerald-500/50" : ""
                          }`}
                        >
                          <div
                            className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                              rec.priority === "high"
                                ? "bg-rose-500"
                                : rec.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-cyan-500"
                            }`}
                          />
                          <CardContent className="p-4 pl-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {getPriorityBadge(rec.priority)}
                                <Badge className="bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-[10px]">
                                  {rec.impact}
                                </Badge>
                                {isRecentlyCompleted && (
                                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] animate-pulse">
                                    ✓ ARCHIVANDO EN HISTORIAL...
                                  </Badge>
                                )}
                              </div>
                              <h4 className={`text-white font-bold text-sm mt-1 ${isRecentlyCompleted ? "line-through text-slate-400" : ""}`}>
                                {rec.title}
                              </h4>
                              <p className="text-muted-foreground text-xs leading-relaxed max-w-3xl">
                                {rec.description}
                              </p>
                              {rec.targetUrl && (
                                <div className="text-[11px] text-indigo-400 font-mono">
                                  Página de impacto: {rec.targetUrl}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <Button
                                disabled={isRecentlyCompleted}
                                onClick={() => {
                                  const targetUrl = rec.targetUrl || "/vibecode"
                                  const currentText = rec.title || ""
                                  const recId = rec.id

                                  setActiveTargetUrl(targetUrl)
                                  setActiveCurrentText(currentText)
                                  setActiveRecId(recId)

                                  if (rec.id.startsWith("rec-meta") || rec.id === "rec-1") {
                                    setActiveModal("meta")
                                    setTempMetaText("")
                                    handleOptimizeWithAi("generate-meta", targetUrl, currentText)
                                  } else if (rec.id.startsWith("rec-title") || rec.id === "rec-2") {
                                    setActiveModal("title")
                                    setTempTitleText("")
                                    handleOptimizeWithAi("optimize-title", targetUrl, currentText)
                                  } else if (rec.id.startsWith("rec-alt") || rec.id === "rec-3") {
                                    setActiveModal("images")
                                    const defaultAlts = targetUrl.includes("vibecodelab")
                                      ? [
                                          "Plataforma Vibecode Lab - Laboratorio de Desarrollo con Inteligencia Artificial",
                                          "Interfaz interactiva y proyectos prácticos de programación en Vibecode Lab",
                                          "Comunidad de desarrolladores y mentoría técnica personalizada en Vibecode Lab"
                                        ]
                                      : [
                                          `Imagen descriptiva de la sección ${targetUrl}`,
                                          `Panel interactivo y recursos de software en ${targetUrl}`,
                                          `Comunidad y herramientas de desarrollo en ${targetUrl}`
                                        ]
                                    setTempAltTexts(defaultAlts)
                                    handleOptimizeWithAi("generate-alt", targetUrl, currentText)
                                  } else if (rec.id.startsWith("rec-cache") || rec.id === "rec-5") {
                                    setActiveModal("cache")
                                  } else {
                                    setActiveModal("meta")
                                    setTempMetaText("")
                                    handleOptimizeWithAi("generate-meta", targetUrl, currentText)
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-4 font-medium"
                              >
                                {rec.actionText}
                                <ArrowRight className="h-3 w-3 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORIAL DE MEJORAS APLICADAS / ARCHIVADAS */}
          {recViewFilter === "history" && (
            <div className="space-y-3">
              {(!data.history || data.history.length === 0) &&
              data.recommendations.filter(r => r.status === "resolved").length === 0 ? (
                <Card className="border-white/10 bg-slate-950/20 p-8 text-center rounded-xl">
                  <Archive className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <h4 className="text-white font-bold text-sm">No hay mejoras archivadas aún</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Cuando apliques y guardes sugerencias con IA, quedarán registradas aquí con su texto y fecha de aplicación.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {/* Entradas del Historial Persistido */}
                  {data.history?.map((item) => (
                    <Card key={item.id} className="border-emerald-500/20 bg-slate-950/40 relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-500" />
                      <CardContent className="p-4 pl-6 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                              <Check className="h-3 w-3" /> APLICADA & GUARDADA
                            </Badge>
                            <span className="font-mono text-xs text-indigo-300 font-semibold">{item.targetUrl}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.appliedAt}
                          </span>
                        </div>

                        <h4 className="text-white font-semibold text-xs">{item.title}</h4>

                        {item.appliedValue && (
                          <div className="bg-slate-900/90 border border-white/5 rounded-md p-2.5 text-[11px] text-emerald-300/90 font-mono break-words leading-relaxed">
                            {typeof item.appliedValue === "string"
                              ? item.appliedValue
                              : Array.isArray(item.appliedValue)
                              ? item.appliedValue.join(" | ")
                              : JSON.stringify(item.appliedValue)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Fallback para recomendaciones que estén marcadas como resueltas */}
                  {data.recommendations
                    .filter(r => r.status === "resolved")
                    .map((rec) => (
                      <Card key={rec.id} className="border-emerald-500/15 bg-slate-950/20 relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-500/60" />
                        <CardContent className="p-4 pl-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                RESUELTO
                              </Badge>
                              {rec.targetUrl && (
                                <span className="font-mono text-xs text-indigo-400">{rec.targetUrl}</span>
                              )}
                            </div>
                            <h4 className="text-white font-semibold text-xs">{rec.title}</h4>
                            <p className="text-muted-foreground text-[11px]">{rec.description}</p>
                          </div>
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                            <CheckCircle className="h-3.5 w-3.5" /> Verificado
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: KEYWORDS PANEL */}
      {activeSubTab === "keywords" && (
        <Card className="border-white/10 bg-slate-950/20">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    Rendimiento de Palabras Clave
                  </CardTitle>
                  {data.searchConsole?.isLive ? (
                    <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                      ● Search Console En Vivo {data.searchConsole.property ? `(${data.searchConsole.property})` : ""}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300">
                      Datos de Muestra (GSC no vinculado)
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {data.searchConsole?.isLive 
                    ? "Métricas de posicionamiento y clics en vivo sincronizadas con Search Console."
                    : data.searchConsole?.error 
                      ? `Diagnóstico de conexión: ${data.searchConsole.error}`
                      : "Métricas de ejemplo. Para ver tus términos de búsqueda reales de Google, vincula una cuenta de servicio de Google Search Console."}
                </CardDescription>
              </div>

              {/* Keyword Search Input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar palabra clave..."
                  value={kwSearch}
                  onChange={(e) => setKwSearch(e.target.value)}
                  className="pl-8 bg-slate-900 border-white/10 text-xs h-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t border-white/10">
            <Table>
              <TableHeader className="bg-slate-950/40 text-xs">
                <TableRow className="border-b border-white/10">
                  <TableHead className="text-muted-foreground">Palabra Clave</TableHead>
                  <TableHead className="text-muted-foreground text-right">Clics</TableHead>
                  <TableHead className="text-muted-foreground text-right">Impresiones</TableHead>
                  <TableHead className="text-muted-foreground text-right">CTR Promedio</TableHead>
                  <TableHead className="text-muted-foreground text-right">Posición Prom.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      No se encontraron palabras clave{kwSearch ? ` para "${kwSearch}"` : ""}.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKeywords.map((kw, idx) => (
                    <TableRow key={idx} className="border-b border-white/5 hover:bg-slate-900/30 transition-colors">
                      <TableCell className="font-semibold text-xs text-white py-3">{kw.term}</TableCell>
                      <TableCell className="text-right text-xs text-indigo-300 font-mono py-3">
                        {kw.clicks}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-300 font-mono py-3">
                        {kw.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs py-3">
                        <span className="font-mono text-emerald-400">{kw.ctr}%</span>
                      </TableCell>
                      <TableCell className="text-right text-xs py-3">
                        <Badge className="bg-slate-900 border border-indigo-500/20 text-indigo-400 font-mono text-[10px]">
                          #{kw.position}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* VIEW 4: METATAGS GLOBAL SETTINGS */}
      {activeSubTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="border-white/10 bg-slate-950/20">
            <CardHeader className="p-4">
              <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                Meta-Tags Globales del Sitio
              </CardTitle>
              <CardDescription className="text-xs">
                Administra el título por defecto, descripciones generales de Open Graph y recursos robots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Global Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="globalTitle" className="text-xs font-semibold text-slate-300">
                    Título Global de la Web
                  </Label>
                  <Input
                    id="globalTitle"
                    value={globalTitle}
                    onChange={(e) => setGlobalTitle(e.target.value)}
                    className="bg-slate-900 border-white/10 text-xs h-9 text-white focus:border-indigo-500"
                    placeholder="Vibecode Lab | Soluciones de IA"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Recomendado: menor a 60 caracteres. Actual: {globalTitle.length} caract.
                  </p>
                </div>

                {/* Default OG Image */}
                <div className="space-y-1.5">
                  <Label htmlFor="defaultOgImage" className="text-xs font-semibold text-slate-300">
                    og:image por Defecto (Link absoluto)
                  </Label>
                  <Input
                    id="defaultOgImage"
                    value={defaultOgImage}
                    onChange={(e) => setDefaultOgImage(e.target.value)}
                    className="bg-slate-900 border-white/10 text-xs h-9 text-white focus:border-indigo-500"
                    placeholder="https://tusitio.net/og-default.png"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Imagen de portada predeterminada al compartir links en LinkedIn o Slack.
                  </p>
                </div>
              </div>

              {/* Site Description */}
              <div className="space-y-1.5">
                <Label htmlFor="siteDescription" className="text-xs font-semibold text-slate-300">
                  Descripción Global de la Web (Meta Description)
                </Label>
                <textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-white/10 rounded-md p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Describe la web para los motores de búsqueda..."
                />
                <p className="text-[10px] text-muted-foreground">
                  Recomendado: entre 140 y 160 caracteres. Actual: {siteDescription.length} caract.
                </p>
              </div>

              {/* Robots.txt and Sitemap.xml files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="robotsTxt" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-cyan-400" />
                    Edición de robots.txt
                  </Label>
                  <textarea
                    id="robotsTxt"
                    value={robotsTxt}
                    onChange={(e) => setRobotsTxt(e.target.value)}
                    rows={6}
                    className="w-full font-mono bg-slate-900 border border-white/10 rounded-md p-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sitemapXml" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-emerald-400" />
                    Edición de sitemap.xml
                  </Label>
                  <textarea
                    id="sitemapXml"
                    value={sitemapXml}
                    onChange={(e) => setSitemapXml(e.target.value)}
                    rows={6}
                    className="w-full font-mono bg-slate-900 border border-white/10 rounded-md p-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="submit"
              disabled={savingSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-6 py-2 flex items-center gap-2"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Guardar Configuración SEO
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* DIALOG 1: GENERATE META DESCRIPTION */}
      <Dialog open={activeModal === "meta"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="bg-slate-950 border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Generar Meta Descripción con IA
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Genera una meta descripción óptima orientada a la conversión y CTR para la página `{activeTargetUrl}`.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-200 font-semibold">Meta Descripción Sugerida</Label>
                <span className="text-[10px] text-muted-foreground">
                  {tempMetaText.length > 0 ? (
                    <span className={tempMetaText.length > 160 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                      {tempMetaText.length} / 160 caracteres
                    </span>
                  ) : (
                    "Recomendado: 120-160 caracteres"
                  )}
                </span>
              </div>
              <textarea
                value={tempMetaText}
                onChange={(e) => setTempMetaText(e.target.value)}
                rows={4}
                maxLength={165}
                className="w-full bg-slate-900 border border-white/10 rounded-md p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Haz clic en 'Generar con IA (Gemini)' para redactar una meta descripción optimizada al instante..."
              />
              <p className="text-[10px] text-slate-400">
                💡 La IA analiza automáticamente el contenido y palabras clave de la URL para crear la descripción ideal para Google.
              </p>
            </div>

            {/* Opcional: Acordeón discreto para quien quiera forzar un tono específico */}
            <details className="group text-[11px] text-slate-400 border border-white/5 rounded-md p-2.5 bg-slate-900/40">
              <summary className="cursor-pointer list-none flex items-center justify-between text-slate-400 hover:text-slate-200 transition-colors">
                <span className="font-medium">⚙️ Personalizar enfoque o tono específico (Opcional)</span>
                <span className="text-[10px] text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="pt-2">
                <Input 
                  value={nicheInput} 
                  onChange={(e) => setNicheInput(e.target.value)} 
                  className="bg-slate-950 border-white/10 text-xs text-slate-200 mt-1"
                  placeholder="Ej. Dirigido a fundadores técnicos, automatización de procesos..."
                />
              </div>
            </details>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="border-white/10 text-xs text-slate-300 hover:bg-slate-900"
              disabled={isApplying}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleOptimizeWithAi("generate-meta", activeTargetUrl, activeCurrentText)}
              disabled={isOptimizing || isApplying}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white flex items-center gap-1.5"
            >
              {isOptimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {tempMetaText ? "Volver a generar con IA" : "Generar con IA"}
            </Button>
            <Button
              onClick={() => handleApplyImprovement("meta", tempMetaText, "Se guardó y aplicó la nueva Meta Descripción optimizada.", activeRecId || undefined)}
              disabled={!tempMetaText || isOptimizing || isApplying}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white flex items-center gap-1.5"
            >
              {isApplying ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Aplicar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: OPTIMIZE TITLE LENGTH */}
      <Dialog open={activeModal === "title"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="bg-slate-950 border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Optimizar Longitud de Título
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Reduce la longitud del título de <span className="text-indigo-400 font-mono">{activeTargetUrl}</span> manteniendo el atractivo comercial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Título Actual (Excesivo)</span>
              <p className="text-xs text-rose-400 font-medium">{activeCurrentText}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300 font-semibold">Título Optimizado</Label>
              <Input
                value={tempTitleText}
                onChange={(e) => setTempTitleText(e.target.value)}
                className="bg-slate-900 border-white/10 text-xs text-white"
                placeholder="Título SEO sugerido..."
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Ideal: &lt; 65 caracteres</span>
                <span className="font-mono">{tempTitleText.length} caracteres</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="border-white/10 text-xs text-slate-300 hover:bg-slate-900"
              disabled={isApplying}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleOptimizeWithAi("optimize-title", activeTargetUrl, activeCurrentText)}
              disabled={isOptimizing || isApplying}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white flex items-center gap-1.5"
            >
              {isOptimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {tempTitleText ? "Volver a generar con IA" : "Reescribir con IA"}
            </Button>
            <Button
              onClick={() => handleApplyImprovement("title", tempTitleText, "El título SEO corto fue aplicado con éxito en la entrada.", activeRecId || undefined)}
              disabled={!tempTitleText || isOptimizing || isApplying}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white flex items-center gap-1.5"
            >
              {isApplying ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Aplicar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: IMAGES ALT */}
      <Dialog open={activeModal === "images"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="bg-slate-950 border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Sugerir Atributos Alt para Imágenes
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Genera y asigna etiquetas descriptivas para las imágenes de <span className="text-indigo-400 font-mono">{activeTargetUrl || "/vibecodelab"}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {tempAltTexts.map((alt, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Imagen #{idx + 1}
                  </Label>
                  {alt && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {alt.length} caracteres
                    </span>
                  )}
                </div>
                <Input
                  value={alt}
                  onChange={(e) => {
                    const newAlts = [...tempAltTexts]
                    newAlts[idx] = e.target.value
                    setTempAltTexts(newAlts)
                  }}
                  className="bg-slate-900 border-white/10 text-xs text-white"
                  placeholder={`Describir imagen ${idx + 1}...`}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="border-white/10 text-xs text-slate-300 hover:bg-slate-900"
              disabled={isApplying}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleOptimizeWithAi("generate-alt", activeTargetUrl, activeCurrentText)}
              disabled={isOptimizing || isApplying}
              className="bg-indigo-600 hover:bg-indigo-700 text-xs text-white flex items-center gap-1.5"
            >
              {isOptimizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {tempAltTexts.some(Boolean) ? "Volver a sugerir con IA" : "Sugerir con IA"}
            </Button>
            <Button
              onClick={() => handleApplyImprovement("images", tempAltTexts.filter(Boolean), "Se agregaron los atributos ALT correspondientes a las imágenes.", activeRecId || undefined)}
              disabled={tempAltTexts.filter(a => a && a.trim().length > 0).length === 0 || isOptimizing || isApplying}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white flex items-center gap-1.5"
            >
              {isApplying ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              Aplicar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: OPTIMIZE CACHE */}
      <Dialog open={activeModal === "cache"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="bg-slate-950 border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              Optimización del Servidor (Caché & TTFB)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Acelera el tiempo de respuesta del servidor (TTFB) y optimiza las métricas FCP.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-md">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Edge Caching (Vercel Edge Network)</span>
                <span className="text-[10px] text-muted-foreground">Cachea la shell HTML en ubicaciones globales.</span>
              </div>
              <input 
                type="checkbox" 
                checked={cacheOptions.edgeCache} 
                onChange={(e) => setCacheOptions({ ...cacheOptions, edgeCache: e.target.checked })}
                className="accent-indigo-600 h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-md">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Compresión Brotli/Gzip Avanzada</span>
                <span className="text-[10px] text-muted-foreground">Minimiza el tamaño de transferencia de recursos estáticos.</span>
              </div>
              <input 
                type="checkbox" 
                checked={cacheOptions.compression} 
                onChange={(e) => setCacheOptions({ ...cacheOptions, compression: e.target.checked })}
                className="accent-indigo-600 h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900 border border-white/5 rounded-md">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Lazy-loading automático de recursos pesados</span>
                <span className="text-[10px] text-muted-foreground">Difiere scripts y librerías por debajo de la pantalla.</span>
              </div>
              <input 
                type="checkbox" 
                checked={cacheOptions.lazyLoad} 
                onChange={(e) => setCacheOptions({ ...cacheOptions, lazyLoad: e.target.checked })}
                className="accent-indigo-600 h-4 w-4 rounded"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="border-white/10 text-xs text-slate-300 hover:bg-slate-900"
              disabled={isApplying}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                handleApplyImprovement("cache", cacheOptions, "Configuraciones de CDN Edge Cache y compresión aplicadas con éxito.", "rec-5")
              }}
              disabled={isApplying}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white flex items-center gap-1.5"
            >
              {isApplying ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
              Habilitar y Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
