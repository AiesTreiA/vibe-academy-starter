"use client"

import React, { useState } from "react"
import { 
  Sparkles, 
  Video, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Plus, 
  Copy, 
  Check, 
  PlayCircle, 
  ShieldAlert, 
  HelpCircle, 
  FileText, 
  Filter, 
  BookOpen, 
  PhoneCall, 
  ChevronRight, 
  Layers, 
  Flame, 
  Zap, 
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Share2,
  Lock,
  Eye,
  RefreshCw,
  Sliders,
  DollarSign,
  Calendar,
  Send,
  Workflow
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

import ContentLibraryBrowser from "@/components/marketing/content-library-browser"
import FrameworkScriptBuilder from "@/components/marketing/framework-script-builder"
import WeeklySchedulePlanner from "@/components/marketing/weekly-schedule-planner"
import AIScriptAssistantModal from "@/components/marketing/ai-script-assistant-modal"
import { ContentIdeaItem, FrameworkType } from "@/lib/marketing-content-data"

export interface DMScriptStage {
  id: string
  stageName: string
  sourceType: "inbound_reel" | "inbound_story" | "outbound_poll" | "qa_hidden"
  goal: string
  scriptText: string
  exampleReply: string
}

const DM_SETTER_SCRIPTS: DMScriptStage[] = [
  {
    id: "dm-inbound-1",
    stageName: "1. Inbound Reel Anzuelo (Comentario de Palabra Clave)",
    sourceType: "inbound_reel",
    goal: "Romper el hielo cuando comentan VIBECODE, GUIA o PAGOS en un Reel.",
    scriptText: "¡Hola [Nombre]! 👋 Vi tu comentario en el reel. Te dejo por aquí el recurso prometido: [LINK_RECURSO]. Antes de que lo revises, ¿actualmente estás buscando construir un MVP/SaaS propio o quieres acelerar el desarrollo en tu proyecto actual?",
    exampleReply: "Respuesta habitual: 'Quiero lanzar una app web para mi negocio' o 'Tengo una idea pero no soy técnico'."
  },
  {
    id: "dm-inbound-2",
    stageName: "2. Diagnóstico del Dolor (Parálisis Técnica o Agencia Cara)",
    sourceType: "inbound_reel",
    goal: "Descubrir si están atrapados intentando aprender sintaxis tradicional o cotizando agencias costosas.",
    scriptText: "Genial [Nombre]. Cuéntame, ¿hasta ahora has intentado contratar programadores/agencias o aprender código tradicional, o ya has probado herramientas de IA por tu cuenta?",
    exampleReply: "Respuesta: 'Le pedí cotización a agencias y cobran $8,000 USD' o 'Intento usar ChatGPT pero el código se me rompe al conectar la base de datos'."
  },
  {
    id: "dm-inbound-3",
    stageName: "3. Brecha de Oportunidad & Transición a la Agenda",
    sourceType: "inbound_reel",
    goal: "Posicionar el modelo Forward Deployed Engineer y ofrecer sesión corta de diagnóstico.",
    scriptText: "Te entiendo 100%. Ese es el error clásico: depender de agencias lentas o intentar aprender sintaxis desde cero. Con Vibe Coding construyes la lógica en días manteniendo el control total de tu backend. Si te interesa ver cómo estructurar tu idea específica para salir a producción en 7 semanas, ¿te gustaría que coordinemos 15 minutos para revisarlo?",
    exampleReply: "Respuesta: 'Sí me interesa, ¿dónde puedo agendar?'"
  },
  {
    id: "dm-outbound-1",
    stageName: "4. Outbound Surfacing (Voto en Encuesta de Historia)",
    sourceType: "outbound_poll",
    goal: "Abrir conversación en frío amigable con quien votó en la Encuesta de Nicho u Obstáculo.",
    scriptText: "Hola [Nombre], vi tu voto en la encuesta de mi historia sobre [Obstáculo votado, ej: 'Falta de tiempo para programar']. Estoy preparando los contenidos de las próximas clases y me encantaría tu perspectiva como [Nicho: Founder/Dev]. ¿Hace cuánto te está pasando eso?",
    exampleReply: "Respuesta: 'Llevo 4 meses con la idea parada porque no tengo tiempo de aprender código'."
  },
  {
    id: "dm-qa-1",
    stageName: "5. Lead de Q&A Hidden CTA (Pregunta de Ayuda)",
    sourceType: "qa_hidden",
    goal: "Cerrar al prospecto que respondió a la historia final de la secuencia de preguntas.",
    scriptText: "¡Hola [Nombre]! 👋 Qué bueno que viste la secuencia de historias. Justo estamos por cerrar los 33 cupos del ciclo de Agosto de Vibecode Lab. Te cuento rápido: el programa son 7 semanas en vivo donde construyes tu app con Supabase, Next.js e IA con mentoría 1-a-1. ¿Tienes ya la idea definida de lo que quieres lanzar?",
    exampleReply: "Respuesta: 'Sí, quiero crear un SaaS de automatización para inmobiliarias'."
  }
]

export default function AdminMarketingTab() {
  const [activeTab, setActiveTab] = useState("ideas-bank")
  const [selectedIdeaForBuilder, setSelectedIdeaForBuilder] = useState<ContentIdeaItem | null>(null)
  
  // AI Modal states
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiModalIdea, setAiModalIdea] = useState<ContentIdeaItem | null>(null)
  const [aiModalFramework, setAiModalFramework] = useState<FrameworkType | undefined>(undefined)

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast({
      title: "¡Copiado!",
      description: "Texto copiado al portapapeles con éxito.",
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSelectIdeaForScript = (idea: ContentIdeaItem) => {
    setSelectedIdeaForBuilder(idea)
    setActiveTab("script-studio")
    toast({
      title: `Idea #${idea.id} cargada`,
      description: "Se aplicó al Studio de Guiones con el framework recomendado.",
    })
  }

  const handleOpenAIModal = (idea?: ContentIdeaItem | null, framework?: FrameworkType) => {
    setAiModalIdea(idea || null)
    setAiModalFramework(framework || undefined)
    setIsAIModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Banner Principal de la Estrategia */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 p-6 md:p-8 border border-violet-800/40 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 px-3 py-1 font-medium">
                <Flame className="w-3.5 h-3.5 mr-1 text-amber-400 fill-amber-400" /> Sistema de Venta Perpetua
              </Badge>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 px-3 py-1">
                Social Funnel & Vibe Coding
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Centro de Estrategia & Generación de Contenido
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Metodología oficial de <span className="text-amber-300 font-semibold">Venta Perpetua</span>: 100 ideas para Vibecode Lab, 8 frameworks de conversión (Reels y Stories), sincronización con amortiguación y guiones de chatbooking en DM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={() => handleOpenAIModal(null, "reel_hook_omitted")}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-900/30 gap-2 border border-violet-400/30 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Asistente IA de Guionado
            </Button>
          </div>
        </div>
      </div>

      {/* Menú de Sub-Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900 p-1 border border-slate-800 rounded-xl grid grid-cols-2 md:grid-cols-5 w-full h-auto">
          <TabsTrigger value="ideas-bank" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white py-2.5 font-medium gap-1.5 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" /> 1. 100 Ideas (Vibecode)
          </TabsTrigger>
          <TabsTrigger value="script-studio" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white py-2.5 font-medium gap-1.5 text-xs sm:text-sm">
            <Video className="w-4 h-4" /> 2. Studio de Guiones (8 Formatos)
          </TabsTrigger>
          <TabsTrigger value="weekly-schedule" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white py-2.5 font-medium gap-1.5 text-xs sm:text-sm">
            <Calendar className="w-4 h-4" /> 3. Planificador Semanal
          </TabsTrigger>
          <TabsTrigger value="dm-setter" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white py-2.5 font-medium gap-1.5 text-xs sm:text-sm">
            <MessageSquare className="w-4 h-4" /> 4. DM Setting (Chatbooking)
          </TabsTrigger>
          <TabsTrigger value="funnel-precierre" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white py-2.5 font-medium gap-1.5 text-xs sm:text-sm">
            <PhoneCall className="w-4 h-4" /> 5. Cierre High Ticket
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BANCO DE 100 IDEAS DE VIBECODE LAB */}
        <TabsContent value="ideas-bank" className="space-y-6">
          <ContentLibraryBrowser
            onSelectIdeaForScript={handleSelectIdeaForScript}
            onGenerateWithAI={(idea) => handleOpenAIModal(idea, idea.suggestedFramework)}
          />
        </TabsContent>

        {/* TAB 2: STUDIO DE GUIONES (8 FORMATOS DE EMILIO) */}
        <TabsContent value="script-studio" className="space-y-6">
          <FrameworkScriptBuilder
            initialIdea={selectedIdeaForBuilder}
            onOpenAIModal={handleOpenAIModal}
          />
        </TabsContent>

        {/* TAB 3: PLANIFICADOR SEMANAL DE VENTA PERPETUA */}
        <TabsContent value="weekly-schedule" className="space-y-6">
          <WeeklySchedulePlanner />
        </TabsContent>

        {/* TAB 4: DM SETTING & CHATBOOKING SCRIPTS */}
        <TabsContent value="dm-setter" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-violet-300">
                    <MessageSquare className="w-5 h-5 text-indigo-400" /> Guiones de DM Setting & Chatbooking
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Estructuras de respuesta para convertir interacciones Inbound (comentarios) y Outbound (encuestas de surfacing) en llamadas agendadas.
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 self-start md:self-auto">
                  Agendamiento por Conversación Humana
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {DM_SETTER_SCRIPTS.map((stage) => (
                  <div key={stage.id} className="relative p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 hover:border-violet-800/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-400 uppercase tracking-wider bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/40">
                        {stage.stageName}
                      </span>
                      <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px]">
                        {stage.sourceType}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-amber-300">Objetivo del Setter / Manychat:</p>
                      <p className="text-slate-300 text-xs">{stage.goal}</p>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed relative">
                      <p>{stage.scriptText}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyText(stage.scriptText, stage.id)}
                        className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:text-white"
                      >
                        {copiedId === stage.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>

                    <div className="text-xs text-slate-400 italic">
                      <span className="font-semibold text-slate-300">Respuesta esperada:</span> {stage.exampleReply}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: CIERRE HIGH TICKET & EMBUDO */}
        <TabsContent value="funnel-precierre" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800 text-white md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-300">
                  <Layers className="w-5 h-5" /> Estructura del Embudo de Precierre & Cierre High Ticket
                </CardTitle>
                <CardDescription className="text-slate-400">
                  El prospecto consume tu contenido de precierre (VSL / Masterclass) antes de la llamada de ventas para estar pre-calificado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <Badge className="bg-violet-500/20 text-violet-300">Etapa 1: Anzuelo</Badge>
                    <h4 className="font-bold text-slate-200 text-sm">Recurso de Alto Valor</h4>
                    <p className="text-xs text-slate-400">PDF, plantilla o entrenamiento corto entregado en DM al comentar palabra clave.</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <Badge className="bg-indigo-500/20 text-indigo-300">Etapa 2: VSL Precierre</Badge>
                    <h4 className="font-bold text-slate-200 text-sm">Video de Oportunidad (5-8 min)</h4>
                    <p className="text-xs text-slate-400">Explica el Contexto, Pruebas y la Brecha del Vehículo antes de la agendación.</p>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300">Etapa 3: Cualificación</Badge>
                    <h4 className="font-bold text-slate-200 text-sm">Formulario Filtro</h4>
                    <p className="text-xs text-slate-400">Preguntas de facturación actual, compromiso y presupuesto antes de agendar.</p>
                  </div>
                </div>

                {/* Objeciones */}
                <div className="p-4 bg-violet-950/30 rounded-xl border border-violet-800/40 space-y-3">
                  <h4 className="font-bold text-violet-300 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" /> Manejador de Objeciones Clave en la Llamada (Emilio):
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                      <span className="font-semibold text-amber-300">Objeción: "Es muy caro / No tengo el dinero"</span>
                      <p className="italic">"Si tuvieras el dinero hoy, ¿esto sería lo que elegirías para lanzar tu software? [Sí] &rarr; Perfecto, entonces el problema no es el programa, es el flujo. ¿Cómo podemos solucionar la parte financiera para que arranques este ciclo?"</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                      <span className="font-semibold text-indigo-300">Objeción: "Tengo que pensarlo"</span>
                      <p className="italic">"Totalmente comprensible. Pero para saber exactamente qué vas a pensar: ¿tienes dudas sobre si la metodología funciona para tu idea o es un tema de tiempo?"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-300">
                  <Zap className="w-5 h-5 text-amber-400" /> Métricas Objetivo
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Estándares de conversión Venta Perpetua
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Cupos Máximos Ciclo:</span>
                  <span className="text-base font-bold text-violet-400">33 alumnos</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Tasa de Cierre en Llamadas:</span>
                  <span className="text-base font-bold text-emerald-400">30% - 45%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Conversión de Encuesta a DM:</span>
                  <span className="text-base font-bold text-indigo-400">&gt; 70%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Generación con IA */}
      <AIScriptAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialIdea={aiModalIdea}
        initialFramework={aiModalFramework}
        onApplyScript={(scriptData) => {
          setSelectedIdeaForBuilder({
            id: Date.now(),
            pilarId: "pilar-1",
            pilarName: "Personalizado",
            title: scriptData.title,
            suggestedFramework: scriptData.frameworkType,
            targetAvatar: scriptData.targetAvatar,
            corePainOrDesire: scriptData.extensionOrContext,
            sampleHook: scriptData.hook,
            suggestedKeyword: scriptData.ctaKeyword
          })
          setActiveTab("script-studio")
        }}
      />
    </div>
  )
}
