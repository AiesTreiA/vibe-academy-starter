"use client"

import React, { useState, useEffect } from "react"
import {
  Mail,
  Eye,
  User,
  RefreshCw,
  Monitor,
  Smartphone,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Zap,
  Flame,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface EmailTemplateItem {
  id: string
  title: string
  category: string
  description?: string
}

export const EMAIL_TEMPLATES: EmailTemplateItem[] = [
  // Vibecode Lab
  {
    id: "vibecode-welcome",
    title: "Bienvenida / Inscripción Completa (Vibecode Lab)",
    category: "Vibecode Lab",
    description: "Correo enviado al completar la inscripción con fechas de clases, links de Meet, WhatsApp y Google Calendar.",
  },
  {
    id: "vibecode-abono",
    title: "Confirmación de Abono / Pie Inicial (Vibecode Lab)",
    category: "Vibecode Lab",
    description: "Notificación de reserva de cupo tras realizar un pago parcial.",
  },
  {
    id: "vibecode-balance",
    title: "Solicitud de Saldo Pendiente (Vibecode Lab)",
    category: "Vibecode Lab",
    description: "Recordatorio automático para liquidar el saldo restante del bootcamp.",
  },

  // Masterclasses
  {
    id: "masterclass-confirmation",
    title: "Masterclass: Confirmación de Inscripción",
    category: "Masterclasses",
    description: "Confirmación tras registrarse a una Masterclass gratuita.",
  },
  {
    id: "masterclass-reminder-24h",
    title: "Masterclass: Recordatorio 24 Horas Antes",
    category: "Masterclasses",
    description: "Aviso enviado un día antes de la transmisión de la Masterclass.",
  },
  {
    id: "masterclass-reminder-1h",
    title: "Masterclass: Recordatorio 1 Hora Antes",
    category: "Masterclasses",
    description: "Alerta con acceso directo a la sala de Google Meet 60 minutos antes.",
  },
  {
    id: "masterclass-reminder-10m",
    title: "Masterclass: Recordatorio 10 Minutos Antes (¡En Vivo!)",
    category: "Masterclasses",
    description: "Notificación urgente de apertura de sala a minutos de iniciar.",
  },

  // Consultoría
  {
    id: "client-confirmation",
    title: "Consultoría: Confirmación de Reserva 1 a 1",
    category: "Consultoría 1 a 1",
    description: "Confirmación enviada al cliente al agendar una sesión personalizada.",
  },
  {
    id: "reminder-24h",
    title: "Consultoría: Recordatorio 24 Horas Antes",
    category: "Consultoría 1 a 1",
    description: "Recordatorio pre-sesión 1 a 1 con enlace a Google Meet y agenda.",
  },
  {
    id: "reminder-1h",
    title: "Consultoría: Recordatorio 1 Hora Antes",
    category: "Consultoría 1 a 1",
    description: "Aviso final 1 hora antes de la reunión de consultoría.",
  },
  {
    id: "client-reschedule",
    title: "Consultoría: Reagendamiento de Sesión",
    category: "Consultoría 1 a 1",
    description: "Notificación enviada cuando una reunión es reprogramada.",
  },
  {
    id: "admin-notification",
    title: "Sistema: Notificación Interna para Admin",
    category: "Consultoría 1 a 1",
    description: "Alerta enviada a hola@javiermujica.com cuando se recibe una nueva reserva.",
  },

  // Nutrición & Pre-selling
  {
    id: "objection-1",
    title: "Nutrición 1: 'No tengo tiempo suficiente'",
    category: "Nutrición & Pre-selling",
    description: "Secuencia orientada a desmontar la objeción sobre falta de tiempo.",
  },
  {
    id: "objection-2",
    title: "Nutrición 2: 'No soy técnico / No sé programar'",
    category: "Nutrición & Pre-selling",
    description: "Explicación de cómo el Vibe Coding permite crear software sin seniority.",
  },
  {
    id: "objection-3",
    title: "Nutrición 3: '¿Por qué Vibe Coding vs Contratar?'",
    category: "Nutrición & Pre-selling",
    description: "Comparativa de costos y agilidad entre contratar agencias o crear con IA.",
  },
  {
    id: "objection-4",
    title: "Nutrición 4: Garantía y Casos de Éxito",
    category: "Nutrición & Pre-selling",
    description: "Demostración de resultados reales e incentivos de inscripción.",
  },
  {
    id: "niche-case-study",
    title: "Nutrición: Caso de Estudio por Nicho",
    category: "Nutrición & Pre-selling",
    description: "Caso práctico de implementación de IA adaptado según industria.",
  },

  // Recursos
  {
    id: "trello-resource",
    title: "Recursos: Entrega de Tablero Trello",
    category: "Recursos & Materiales",
    description: "Entrega de plantillas de trabajo y roadmaps de desarrollo.",
  },
]

export default function AdminEmailPreviewTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("vibecode-welcome")
  const [simulatedName, setSimulatedName] = useState<string>("Jorge Catalán")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [loading, setLoading] = useState<boolean>(false)
  const [emailData, setEmailData] = useState<{
    subject: string
    from: string
    html: string
  }>({
    subject: "",
    from: "Javier Mujica Consultoría <hola@javiermujica.com>",
    html: "",
  })

  useEffect(() => {
    fetchEmailPreview(selectedTemplate, simulatedName)
  }, [selectedTemplate, simulatedName])

  const fetchEmailPreview = async (templateId: string, name: string) => {
    setLoading(true)
    try {
      const queryName = name.trim() || "Jorge Catalán"
      const res = await fetch(`/api/admin/email-preview?template=${templateId}&name=${encodeURIComponent(queryName)}&format=json`)
      const data = await res.json()

      if (data.success) {
        setEmailData({
          subject: data.subject || "Sin asunto",
          from: data.from || "Javier Mujica Consultoría <hola@javiermujica.com>",
          html: data.html || "<p>Sin contenido</p>",
        })
      }
    } catch (err) {
      console.error("Error fetching email preview:", err)
    } finally {
      setLoading(false)
    }
  }

  const currentTplInfo = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate)

  // Categorías agrupadas
  const categories = Array.from(new Set(EMAIL_TEMPLATES.map((t) => t.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" />
            Visualizador de Correos del Sistema
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Selecciona cualquier correo transaccional, de bienvenida, nutrición o masterclass para ver su diseño exacto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={previewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode("desktop")}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Monitor className="h-4 w-4" />
            Escritorio
          </Button>
          <Button
            variant={previewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode("mobile")}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Smartphone className="h-4 w-4" />
            Móvil
          </Button>
        </div>
      </div>

      {/* Controles de Selección */}
      <Card className="bg-card/25 border-border/30 backdrop-blur-md">
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Selector de Plantilla */}
          <div className="md:col-span-8 space-y-2">
            <Label className="text-white text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Selecciona el Correo a Previsualizar
            </Label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full h-10 px-3 py-2 bg-background/80 border border-border/40 rounded-lg text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`} className="bg-slate-900 text-indigo-300 font-bold">
                  {EMAIL_TEMPLATES.filter((t) => t.category === cat).map((tpl) => (
                    <option key={tpl.id} value={tpl.id} className="bg-slate-950 text-white font-normal py-1">
                      {tpl.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Nombre Simulado */}
          <div className="md:col-span-4 space-y-2">
            <Label className="text-white text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider">
              <User className="h-3.5 w-3.5 text-emerald-400" />
              Nombre del Alumno / Cliente
            </Label>
            <div className="relative">
              <Input
                value={simulatedName}
                onChange={(e) => setSimulatedName(e.target.value)}
                placeholder="Ej. Jorge Catalán"
                className="bg-background/80 border-border/40 text-white h-10 text-sm pl-3 pr-8"
              />
              {loading && (
                <div className="absolute right-2.5 top-2.5">
                  <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descripción de la plantilla seleccionada */}
      {currentTplInfo && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-950/30 border border-indigo-500/20 px-4 py-2.5 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-semibold">
              {currentTplInfo.category}
            </Badge>
            <span className="text-slate-300">{currentTplInfo.description}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">ID: {currentTplInfo.id}</span>
        </div>
      )}

      {/* Visor de Correo con Cabecera y Contenido */}
      <Card className="bg-slate-950 border border-border/40 overflow-hidden shadow-2xl">
        {/* Cabecera del Mensaje */}
        <div className="bg-slate-900/90 border-b border-border/40 p-4 space-y-2 font-sans text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 w-12 shrink-0">De:</span>
              <span className="text-slate-200 font-medium">{emailData.from}</span>
            </div>
            <Badge variant="secondary" className="w-fit text-[10px] bg-slate-800 text-emerald-400 font-mono">
              Simulando a: {simulatedName || "Estudiante"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 border-t border-border/20 pt-2">
            <span className="font-bold text-slate-400 w-12 shrink-0">Para:</span>
            <span className="text-slate-300">{simulatedName ? `${simulatedName} <estudiante@ejemplo.com>` : "estudiante@ejemplo.com"}</span>
          </div>

          <div className="flex items-center gap-2 border-t border-border/20 pt-2">
            <span className="font-bold text-indigo-400 w-12 shrink-0">Asunto:</span>
            <span className="text-white font-bold text-sm tracking-tight">{emailData.subject}</span>
          </div>
        </div>

        {/* Renderizador HTML (iframe) */}
        <div
          className={`mx-auto transition-all duration-300 bg-slate-950 p-4 sm:p-6 overflow-y-auto min-h-[650px] ${
            previewMode === "mobile" ? "max-w-[400px] border-x border-border/30 rounded-xl my-4" : "w-full"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-xs font-mono">Generando vista previa del correo...</p>
            </div>
          ) : (
            <iframe
              srcDoc={emailData.html}
              className="w-full min-h-[650px] border-none bg-white rounded-lg shadow-inner"
              title={`Vista previa: ${emailData.subject}`}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
