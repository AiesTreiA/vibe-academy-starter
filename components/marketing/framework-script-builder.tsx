"use client"

import React, { useState } from "react"
import { 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  ShieldAlert, 
  Eye, 
  BookOpen, 
  HelpCircle, 
  Share2, 
  PlayCircle, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Info,
  PhoneCall,
  Sliders,
  Send,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { 
  FrameworkType, 
  FRAMEWORKS_LIST, 
  ContentIdeaItem 
} from "@/lib/marketing-content-data"

interface FrameworkScriptBuilderProps {
  initialIdea?: ContentIdeaItem | null
  onOpenAIModal?: (idea?: ContentIdeaItem | null, framework?: FrameworkType) => void
}

export default function FrameworkScriptBuilder({
  initialIdea,
  onOpenAIModal
}: FrameworkScriptBuilderProps) {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>(
    initialIdea?.suggestedFramework || "reel_hook_omitted"
  )

  const [title, setTitle] = useState(initialIdea?.title || "Cómo conectar webhooks de Mercado Pago en tu SaaS con IA")
  const [avatar, setAvatar] = useState(initialIdea?.targetAvatar || "Founders & Devs")
  const [keyword, setKeyword] = useState(initialIdea?.suggestedKeyword || "PAGOS")
  const [hook, setHook] = useState(initialIdea?.sampleHook || "Si estás cobrando con botones manuales o pasarelas lentas, estás perdiendo el 40% de tus ventas.")
  
  // Custom states for sections
  const [step1, setStep1] = useState("Paso 1: Genera el token seguro en tu backend y configura el endpoint de Supabase.")
  const [step2, setStep2] = useState("Paso 2: Escucha el evento 'payment.created' para actualizar el estado del usuario.")
  const [step3Omitted, setStep3Omitted] = useState("Paso 3 [CENSURADO]: El script exacto de validación criptográfica de la firma del webhook para evitar fraudes.")
  const [ctaText, setCtaText] = useState("Si quieres que te envíe el script completo con la validación de firma lista para copiar y pegar, comenta 'PAGOS' y te lo paso por privado.")
  const [dmResponse, setDmResponse] = useState("¡Hola! 👋 Vi tu comentario en el reel de pagos. Aquí tienes el repositorio con el script: [LINK]. ¿Actualmente estás montando cobros en una app nueva o quieres optimizar una existente?")

  const [copied, setCopied] = useState(false)

  const currentFrameworkObj = FRAMEWORKS_LIST.find(f => f.type === selectedFramework) || FRAMEWORKS_LIST[0]

  const handleCopyFullScript = () => {
    const formatted = `=== GUION DE CONTENIDO - VENTA PERPETUA ===
FORMATO: ${currentFrameworkObj.name} (${currentFrameworkObj.format})
TITULO: ${title}
AVATAR: ${avatar}
CTA KEYWORD: ${keyword}

1. HOOK / GANCHO (Primeros 3-4s):
"${hook}"

2. DESARROLLO / VALOR:
- ${step1}
- ${step2}

3. PIEZA OMITIDA / CRÍTICA:
- ${step3Omitted}

4. LLAMADA A LA ACCIÓN (CTA):
"${ctaText}"

5. GUION DEL SETTER EN DM:
"${dmResponse}"

REGLA DE ORO: ${currentFrameworkObj.goldenRule}
`
    navigator.clipboard.writeText(formatted)
    setCopied(true)
    toast({
      title: "¡Guion Copiado!",
      description: "El guion estructurado completo está en tu portapapeles.",
    })
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Selector de Frameworks de Emilio */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-violet-400" /> Selector de Framework de Venta Perpetua
            </h3>
            <p className="text-xs text-slate-400">
              Selecciona uno de los 8 formatos estratégicos postulados por Emilio para adaptar la estructura de conversión.
            </p>
          </div>
          {onOpenAIModal && (
            <Button
              onClick={() => onOpenAIModal(initialIdea, selectedFramework)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white text-xs font-semibold gap-1.5 shadow-lg shadow-violet-950/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Redactar Guion Completo con IA
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FRAMEWORKS_LIST.map((fw) => {
            const isSelected = selectedFramework === fw.type
            return (
              <button
                key={fw.type}
                onClick={() => setSelectedFramework(fw.type)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected 
                    ? "bg-violet-950/60 border-violet-500 shadow-md shadow-violet-950/30" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{fw.icon}</span>
                  <Badge variant="outline" className={`text-[10px] ${isSelected ? "border-violet-400 text-violet-300" : "border-slate-800 text-slate-500"}`}>
                    {fw.format}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className={`text-xs font-bold leading-snug ${isSelected ? "text-white" : "text-slate-200"}`}>
                    {fw.name.split("(")[0]}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info Banner del Framework Activo */}
        <div className="p-4 bg-violet-950/30 border border-violet-800/40 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-violet-300">
                {currentFrameworkObj.icon} {currentFrameworkObj.name}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              <strong>Objetivo:</strong> {currentFrameworkObj.objective}
            </p>
            <p className="text-xs text-amber-300/90 font-medium">
              💡 <strong>Regla de Oro:</strong> {currentFrameworkObj.goldenRule}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFullScript}
            className="border-violet-700 text-violet-200 hover:bg-violet-900/60 gap-1.5 shrink-0 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "¡Copiado!" : "Copiar Guion Completo"}
          </Button>
        </div>
      </div>

      {/* Editor Interactivo del Guion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Formulario de Campos */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Parámetros del Guion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Título / Idea Central</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Avatar Objetivo</Label>
                  <Input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* Hook Negativo / Gancho */}
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> 1. Gancho / Hook (Primeros 3-4 seg):
                  </Label>
                  <span className="text-[10px] text-slate-400">Aversión a la pérdida</span>
                </div>
                <textarea
                  rows={2}
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-red-900/50 text-white text-xs focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Paso 1 & Paso 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 2. Valor Aplicable (Paso 1):
                  </Label>
                  <textarea
                    rows={3}
                    value={step1}
                    onChange={(e) => setStep1(e.target.value)}
                    className="w-full p-2 rounded-md bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3. Valor Aplicable (Paso 2):
                  </Label>
                  <textarea
                    rows={3}
                    value={step2}
                    onChange={(e) => setStep2(e.target.value)}
                    className="w-full p-2 rounded-md bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* Paso Omitido / Censurado */}
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> 4. Paso Omitido / Pieza Censurada (Paso 3):
                  </Label>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                    Gatillo de Comentarios
                  </Badge>
                </div>
                <textarea
                  rows={2}
                  value={step3Omitted}
                  onChange={(e) => setStep3Omitted(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-amber-900/50 text-white text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* CTA y Palabra Clave */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Palabra Clave (Keyword)</Label>
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                    className="bg-slate-950 border-slate-800 text-emerald-400 font-mono font-bold uppercase text-xs"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs text-slate-300">Llamada a la Acción (CTA en Video/Historia)</Label>
                  <Input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* Guion del Setter en DM */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-indigo-400" /> Respuesta Inmediata del Setter (Chatbooking DM):
                  </Label>
                  <span className="text-[10px] text-slate-400">Automatización / Manychat</span>
                </div>
                <textarea
                  rows={2}
                  value={dmResponse}
                  onChange={(e) => setDmResponse(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-slate-950 border border-indigo-900/50 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Vista Previa Teleprompter & Reglas */}
        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-violet-300 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-violet-400" /> Teleprompter Preview
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  Listo para Grabar
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-200 space-y-2">
                <p className="text-red-400 font-semibold">[00:00 - HOOK]</p>
                <p>"{hook}"</p>
                
                <p className="text-indigo-400 font-semibold pt-1">[00:05 - VALOR REAL]</p>
                <p>"{step1}"</p>
                <p>"{step2}"</p>
                
                <p className="text-amber-400 font-semibold pt-1">[00:25 - EL PASO CENSURADO]</p>
                <p className="italic text-amber-200/90">"{step3Omitted}"</p>
                
                <p className="text-emerald-400 font-semibold pt-1">[00:40 - CTA AL DM]</p>
                <p className="font-bold">"{ctaText}"</p>
              </div>

              <Button
                onClick={handleCopyFullScript}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs gap-1.5 h-9"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "¡Guion Copiado!" : "Copiar Texto para Teleprompter"}
              </Button>
            </CardContent>
          </Card>

          {/* Pasos y Reglas del Framework */}
          <Card className="bg-slate-900/60 border border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-violet-400" /> Estructura Oficial de Emilio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              {currentFrameworkObj.structureSteps.map((st) => (
                <div key={st.stepNumber} className="p-2 bg-slate-950/60 rounded border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <span className="h-4 w-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center font-mono">
                      {st.stepNumber}
                    </span>
                    <span>{st.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5">{st.instruction}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
