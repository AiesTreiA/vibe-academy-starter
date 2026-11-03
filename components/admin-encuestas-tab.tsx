"use client"

import React, { useState } from "react"
import { 
  Target, 
  Search, 
  Download, 
  Users2, 
  Lightbulb, 
  DollarSign, 
  Flame, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface AdminEncuestasTabProps {
  submissions: any[]
  onRefresh?: () => void
}

export default function AdminEncuestasTab({ submissions, onRefresh }: AdminEncuestasTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Filter only validation survey submissions
  const encuestas = submissions.filter(
    (s) => s.service_type === "Encuesta Validación"
  )

  const filtered = encuestas.filter((sub) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      sub.name?.toLowerCase().includes(q) ||
      sub.email?.toLowerCase().includes(q) ||
      sub.phone?.toLowerCase().includes(q) ||
      sub.message?.toLowerCase().includes(q) ||
      sub.company?.toLowerCase().includes(q)
    )
  })

  // Quick stats
  const total = encuestas.length
  const conIdeaPropia = encuestas.filter(
    (s) => s.message?.includes("Tengo idea propia") || (s.company && s.company !== "Vibecode Cohort")
  ).length
  const listosEstaSemana = encuestas.filter((s) => s.message?.includes("Esta semana")).length

  // Export to CSV
  const handleExportCSV = () => {
    if (encuestas.length === 0) return

    const headers = ["Fecha", "Nombre", "Email", "WhatsApp", "Proyecto / Idea", "Detalle Respuestas"]
    const rows = encuestas.map((s) => [
      `"${s.created_at ? format(parseISO(s.created_at), "dd/MM/yyyy HH:mm") : ""}"`,
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${(s.email || "").replace(/"/g, '""')}"`,
      `"${(s.phone || "").replace(/"/g, '""')}"`,
      `"${(s.company || "").replace(/"/g, '""')}"`,
      `"${(s.message || "").replace(/"/g, '""')}"`,
    ])

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `encuestas_validacion_${format(new Date(), "yyyyMMdd_HHmm")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Respuestas Totales
              </p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Con Idea Propia
              </p>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {conIdeaPropia} <span className="text-xs text-muted-foreground font-normal">({total > 0 ? Math.round((conIdeaPropia / total) * 100) : 0}%)</span>
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border/40 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Lanzan Esta Semana
              </p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{listosEstaSemana}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por participante, correo o idea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/40 text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={encuestas.length === 0}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* List of responses */}
      {filtered.length === 0 ? (
        <Card className="bg-card/20 border-border/30 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Target className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">
            {total === 0 ? "Aún no hay respuestas registradas" : "No hay coincidencias con la búsqueda"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {total === 0
              ? "Las respuestas enviadas a través del link /encuesta aparecerán automáticamente en esta vista."
              : "Prueba modificando los términos de búsqueda."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id
            const dateStr = item.created_at
              ? format(parseISO(item.created_at), "dd 'de' MMMM, HH:mm", { locale: es })
              : "Fecha no disp."

            return (
              <Card
                key={item.id}
                className="bg-card/30 border-border/40 hover:border-amber-500/30 transition-all overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Participant Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{item.name}</span>
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                        {dateStr}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-0.5">
                      <a
                        href={`mailto:${item.email}`}
                        className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {item.email}
                      </a>

                      {item.phone && (
                        <a
                          href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-400 text-emerald-400/90 flex items-center gap-1 transition-colors font-medium"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      )}

                      {item.company && item.company !== "Vibecode Cohort" && (
                        <span className="text-slate-300 font-medium">
                          💡 {item.company}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="border-border/40 text-xs gap-1.5"
                    >
                      {isExpanded ? (
                        <>
                          Ocultar <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Ver Respuestas <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border/30 bg-black/20 text-xs">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {item.message || "Sin datos adicionales registrados."}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
