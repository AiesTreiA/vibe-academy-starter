"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Link2,
  Users,
  MousePointerClick,
  Zap,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

export interface DeeplinkItem {
  id: string
  slug: string
  target_url: string
  title?: string
  platform_type?: string
  user_email: string
  clicks_count: number
  iab_bypass_count?: number
  active: boolean
  is_paid?: boolean
  paid_until?: string
  created_at: string
}

export interface UserDeeplinkSummary {
  user_email: string
  link_count: number
  total_clicks: number
  total_iab_bypass: number
  is_paid: boolean
  paid_until: string | null
  first_created_at: string
  last_created_at: string
  links: DeeplinkItem[]
}

export interface DeeplinksSummaryData {
  total_users: number
  total_deeplinks: number
  total_clicks: number
  total_iab_bypass: number
  pro_users_count: number
}

export default function AdminDeeplinksTab() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<DeeplinksSummaryData>({
    total_users: 0,
    total_deeplinks: 0,
    total_clicks: 0,
    total_iab_bypass: 0,
    pro_users_count: 0,
  })
  const [users, setUsers] = useState<UserDeeplinkSummary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "pro" | "free">("all")
  const [sortBy, setSortBy] = useState<"links" | "clicks" | "recent">("links")
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/deeplinks")
      const data = await res.json()
      if (data.success) {
        setSummary(data.summary || {
          total_users: 0,
          total_deeplinks: 0,
          total_clicks: 0,
          total_iab_bypass: 0,
          pro_users_count: 0,
        })
        setUsers(data.users || [])
      } else {
        toast({
          title: "Error al cargar Deeplinks",
          description: data.error || "No se pudieron obtener los datos",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error de conexión",
        description: err.message || "Error al conectar con la API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.javiermujica.com"
    const fullUrl = `${origin}/deeplink/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedSlug(slug)
    toast({ title: "Copiado al portapapeles", description: fullUrl })
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleDeleteLink = async (linkId: string, slug: string) => {
    if (!confirm(`¿Estás seguro de eliminar el enlace /deeplink/${slug}?`)) return
    setDeletingId(linkId)
    try {
      const res = await fetch(`/api/admin/deeplinks?id=${encodeURIComponent(linkId)}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Enlace eliminado", description: `El deeplink /${slug} fue removido.` })
        fetchData()
      } else {
        toast({ title: "Error al eliminar", description: data.error, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const exportToCSV = () => {
    if (users.length === 0) return
    const headers = ["Email", "Cantidad de Links", "Clics Totales", "Bypass IAB", "Estado Pro", "Primer Registro", "Ultima Actividad"]
    const rows = users.map(u => [
      `"${u.user_email}"`,
      u.link_count,
      u.total_clicks,
      u.total_iab_bypass,
      u.is_paid ? "Pro" : "Gratis",
      `"${new Date(u.first_created_at).toLocaleString('es-CL')}"`,
      `"${new Date(u.last_created_at).toLocaleString('es-CL')}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `deeplinks_usuarios_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter & Sort users
  const filteredUsers = useMemo(() => {
    let list = [...users]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(u => 
        u.user_email.toLowerCase().includes(q) ||
        u.links.some(l => l.title?.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q) || l.target_url.toLowerCase().includes(q))
      )
    }

    if (filterType === "pro") {
      list = list.filter(u => u.is_paid)
    } else if (filterType === "free") {
      list = list.filter(u => !u.is_paid)
    }

    if (sortBy === "links") {
      list.sort((a, b) => b.link_count - a.link_count)
    } else if (sortBy === "clicks") {
      list.sort((a, b) => b.total_clicks - a.total_clicks)
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.last_created_at).getTime() - new Date(a.last_created_at).getTime())
    }

    return list
  }, [users, searchQuery, filterType, sortBy])

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-background p-6 rounded-xl border border-purple-800/30 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white hover:bg-purple-700 font-semibold px-2.5 py-0.5">
              DeepLinks Analytics
            </Badge>
            <span className="text-xs text-purple-300 font-medium">Gestión de Usuarios & Enlaces</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Métricas de Correos y Cantidad de Links
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza los correos de las personas que han creado o probado deeplinks y sus estadísticas de uso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="border-purple-800/40 hover:bg-purple-950/50 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={exportToCSV}
            disabled={users.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-purple-800/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Total Usuarios / Correos
              <Users className="h-4 w-4 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{summary.total_users}</div>
            <p className="text-xs text-muted-foreground mt-1">Interesados con emails registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-purple-800/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Deeplinks Creados
              <Link2 className="h-4 w-4 text-indigo-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">{summary.total_deeplinks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio: {summary.total_users > 0 ? (summary.total_deeplinks / summary.total_users).toFixed(1) : 0} por usuario
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-purple-800/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Clics Totales
              <MousePointerClick className="h-4 w-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-400">{summary.total_clicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Redirecciones a apps/web</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-purple-800/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Aperturas App (Bypass)
              <Zap className="h-4 w-4 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-400">{summary.total_iab_bypass}</div>
            <p className="text-xs text-muted-foreground mt-1">Salidas exitosas del navegador in-app</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-purple-800/20">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Usuarios Pro / Pago
              <Sparkles className="h-4 w-4 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-400">{summary.pro_users_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Suscripción $1 USD/mes activa</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-purple-800/20">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Listado de Personas y Enlaces ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                Desglose detallado por correo con la cantidad de deeplinks generados.
              </CardDescription>
            </div>

            {/* Filter and search controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por correo o slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9 bg-background/50 border-purple-800/30"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-9 text-xs rounded-md bg-background border border-purple-800/30 px-2.5 py-1 text-foreground"
              >
                <option value="all">Todos los Planes</option>
                <option value="pro">Solo Pro / Pago</option>
                <option value="free">Solo Free</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 text-xs rounded-md bg-background border border-purple-800/30 px-2.5 py-1 text-foreground"
              >
                <option value="links">Ordenar por Cantidad de Links</option>
                <option value="clicks">Ordenar por Clics</option>
                <option value="recent">Ordenar por Más Reciente</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400" />
              <p className="text-sm">Cargando datos de deeplinks...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-3">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-medium">No se encontraron usuarios o enlaces con el criterio ingresado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-purple-950/20">
                  <TableRow>
                    <TableHead className="w-[300px]">Correo Electrónico</TableHead>
                    <TableHead className="text-center">Cantidad de Links</TableHead>
                    <TableHead className="text-center">Clics Totales</TableHead>
                    <TableHead className="text-center">Bypass App</TableHead>
                    <TableHead>Estado Plan</TableHead>
                    <TableHead>Último Enlace Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isExpanded = expandedUser === u.user_email
                    return (
                      <React.Fragment key={u.user_email}>
                        <TableRow className={`hover:bg-purple-950/10 transition-colors ${isExpanded ? "bg-purple-950/20" : ""}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{u.user_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2.5 py-0.5 text-xs font-bold">
                              {u.link_count} {u.link_count === 1 ? "link" : "links"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-emerald-400">{u.total_clicks}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-amber-400 font-medium">{u.total_iab_bypass}</span>
                          </TableCell>
                          <TableCell>
                            {u.is_paid ? (
                              <Badge className="bg-purple-600 text-white text-[11px] gap-1">
                                <Sparkles className="h-3 w-3" /> Pro ($1/mo)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[11px] text-muted-foreground border-border/50">
                                Gratuito ({u.link_count}/3)
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(u.last_created_at).toLocaleDateString("es-CL", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedUser(isExpanded ? null : u.user_email)}
                              className="text-xs gap-1 hover:bg-purple-900/30 text-purple-300"
                            >
                              {isExpanded ? (
                                <>
                                  Ocultar <ChevronUp className="h-3.5 w-3.5" />
                                </>
                              ) : (
                                <>
                                  Ver ({u.links.length}) <ChevronDown className="h-3.5 w-3.5" />
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded sub-table showing all user links */}
                        {isExpanded && (
                          <TableRow className="bg-purple-950/30 border-b border-purple-800/30">
                            <TableCell colSpan={7} className="p-4">
                              <div className="space-y-3 pl-4 border-l-2 border-purple-500/50">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                    <Link2 className="h-3.5 w-3.5" />
                                    Deeplinks creados por {u.user_email} ({u.links.length})
                                  </h4>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                  {u.links.map((link) => (
                                    <div
                                      key={link.id}
                                      className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-background/80 border border-purple-800/20 gap-2 hover:border-purple-500/40 transition-colors"
                                    >
                                      <div className="space-y-1 max-w-xl">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-sm text-foreground">
                                            {link.title || link.slug}
                                          </span>
                                          <Badge variant="outline" className="text-[10px] uppercase border-purple-500/30 text-purple-400">
                                            {link.platform_type || "generic"}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span className="font-mono text-purple-300 font-medium">
                                            /deeplink/{link.slug}
                                          </span>
                                          <span>→</span>
                                          <span className="truncate max-w-xs text-muted-foreground/80" title={link.target_url}>
                                            {link.target_url}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-3">
                                          <span className="text-muted-foreground">
                                            Clics: <strong className="text-emerald-400">{link.clicks_count || 0}</strong>
                                          </span>
                                          <span className="text-muted-foreground">
                                            Bypass: <strong className="text-amber-400">{link.iab_bypass_count || 0}</strong>
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopyLink(link.slug)}
                                            title="Copiar enlace corto"
                                            className="h-7 w-7 hover:bg-purple-900/40"
                                          >
                                            {copiedSlug === link.slug ? (
                                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            ) : (
                                              <Copy className="h-3.5 w-3.5 text-purple-300" />
                                            )}
                                          </Button>

                                          <a
                                            href={link.target_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-purple-900/40 text-purple-300"
                                            title="Abrir destino en nueva pestaña"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>

                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteLink(link.id, link.slug)}
                                            disabled={deletingId === link.id}
                                            title="Eliminar deeplink"
                                            className="h-7 w-7 hover:bg-red-950/50 text-red-400"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
