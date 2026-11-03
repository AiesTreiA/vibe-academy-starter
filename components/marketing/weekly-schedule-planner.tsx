"use client"

import React, { useState } from "react"
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Sliders, 
  Zap, 
  Layers, 
  MessageSquare, 
  Video, 
  FileText 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { 
  WEEKLY_SCHEDULE_TEMPLATES, 
  FRAMEWORKS_LIST 
} from "@/lib/marketing-content-data"

export default function WeeklySchedulePlanner() {
  const [scheduleType, setScheduleType] = useState<"7_days" | "4_days">("7_days")
  const [copied, setCopied] = useState(false)
  const [dayStatus, setDayStatus] = useState<Record<string, "planned" | "recorded" | "published">>({
    Lunes: "published",
    Martes: "recorded",
    Miércoles: "planned",
    Jueves: "planned",
    Viernes: "planned",
    Sábado: "planned",
    Domingo: "planned"
  })

  const currentTemplate = WEEKLY_SCHEDULE_TEMPLATES[scheduleType]

  const toggleDayStatus = (day: string) => {
    setDayStatus((prev) => {
      const current = prev[day] || "planned"
      const next = current === "planned" ? "recorded" : (current === "recorded" ? "published" : "planned")
      return { ...prev, [day]: next }
    })
  }

  const handleCopySchedule = () => {
    let text = `=== CALENDARIO SEMANAL DE VENTA PERPETUA (${currentTemplate.name}) ===\n\n`
    currentTemplate.days.forEach(d => {
      text += `📅 ${d.day.toUpperCase()} (Estado: ${dayStatus[d.day] || 'planned'}):\n`
      text += `  • STORIES: ${d.storyTitle} (${d.storyGoal})\n`
      text += `  • FEED: ${d.feedTitle} (${d.feedGoal})\n`
      text += `  • AMORTIGUACIÓN: ${d.amortiguacionCheck}\n\n`
    })
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "¡Calendario Copiado!",
      description: "El plan semanal de Venta Perpetua se copió al portapapeles.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header y Control de Frecuencia */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Planificador de Venta Perpetua (Sincronización Stories + Feed)
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Garantiza el balance matemático entre Inbound (recursos), Outbound (encuestas) y Amortiguación (valores) para no fatigar a tu audiencia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={scheduleType === "7_days" ? "default" : "outline"}
              size="sm"
              onClick={() => setScheduleType("7_days")}
              className={scheduleType === "7_days" ? "bg-violet-600 text-white" : "border-slate-800 text-slate-300"}
            >
              7 Días (Completo)
            </Button>
            <Button
              variant={scheduleType === "4_days" ? "default" : "outline"}
              size="sm"
              onClick={() => setScheduleType("4_days")}
              className={scheduleType === "4_days" ? "bg-indigo-600 text-white" : "border-slate-800 text-slate-300"}
            >
              4 Días (Eficiente)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySchedule}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "¡Copiado!" : "Exportar"}
            </Button>
          </div>
        </div>

        {/* Regla de Oro de Amortiguación */}
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/40 rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-indigo-300">
              Ley de Amortiguación de Emilio:
            </p>
            <p>
              "Cuando subes una llamada a la acción directa y agresiva en historias ('Estoy buscando a 3...'), en el Feed publicas contenido de Valores, Filosofía o Conexión humana. La audiencia percibe conexión y no venta continua."
            </p>
          </div>
        </div>
      </div>

      {/* Grid del Calendario Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentTemplate.days.map((item) => {
          const status = dayStatus[item.day] || "planned"
          const statusColors = {
            planned: "bg-slate-800 text-slate-300 border-slate-700",
            recorded: "bg-amber-500/20 text-amber-300 border-amber-500/40",
            published: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          }
          const statusLabels = {
            planned: "⏳ Planeado",
            recorded: "🎬 Grabado",
            published: "✅ Publicado"
          }

          return (
            <Card key={item.day} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg">
              <CardHeader className="pb-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white tracking-wide">
                    {item.day}
                  </span>
                  <button
                    onClick={() => toggleDayStatus(item.day)}
                    className="focus:outline-none"
                    title="Click para cambiar estado"
                  >
                    <Badge className={`${statusColors[status]} cursor-pointer text-[10px] font-medium`}>
                      {statusLabels[status]}
                    </Badge>
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-1 text-xs">
                {/* Canal 1: Stories */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-violet-400" /> Stories Diarias:
                  </span>
                  <p className="font-semibold text-slate-200">{item.storyTitle}</p>
                  <p className="text-[11px] text-slate-400">{item.storyGoal}</p>
                </div>

                {/* Canal 2: Feed */}
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Video className="w-3 h-3 text-indigo-400" /> Feed (Reel / Carrusel):
                  </span>
                  <p className="font-semibold text-slate-200">{item.feedTitle}</p>
                  <p className="text-[11px] text-slate-400">{item.feedGoal}</p>
                </div>

                {/* Audit de Amortiguación */}
                <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded text-[11px] text-emerald-300">
                  <span className="font-semibold">Amortiguación: </span>
                  {item.amortiguacionCheck}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
