"use client"

import React, { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Send, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  PlayCircle,
  Cpu
} from "lucide-react"
import { 
  ContentIdeaItem, 
  FrameworkType, 
  FRAMEWORKS_LIST, 
  PILLARS_CONFIG 
} from "@/lib/marketing-content-data"

interface AIScriptAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  initialIdea?: ContentIdeaItem | null
  initialFramework?: FrameworkType
  onApplyScript?: (scriptData: any) => void
}

export default function AIScriptAssistantModal({
  isOpen,
  onClose,
  initialIdea,
  initialFramework,
  onApplyScript
}: AIScriptAssistantModalProps) {
  const [ideaTitle, setIdeaTitle] = useState("")
  const [frameworkType, setFrameworkType] = useState<FrameworkType>("reel_hook_omitted")
  const [targetAvatar, setTargetAvatar] = useState("")
  const [keyword, setKeyword] = useState("VIBECODE")
  const [customNotes, setCustomNotes] = useState("")
  const [preferredEngine, setPreferredEngine] = useState<"gemini" | "anthropic" | "deepseek" | "openai">("gemini")

  const [isLoading, setIsLoading] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialIdea) {
      setIdeaTitle(initialIdea.title)
      setFrameworkType(initialIdea.suggestedFramework || initialFramework || "reel_hook_omitted")
      setTargetAvatar(initialIdea.targetAvatar)
      setKeyword(initialIdea.suggestedKeyword)
    } else if (initialFramework) {
      setFrameworkType(initialFramework)
    }
  }, [initialIdea, initialFramework, isOpen])

  const handleGenerate = async () => {
    if (!ideaTitle.trim()) {
      toast({
        title: "Título requerido",
        description: "Ingresa el tema o título de la idea para guionar.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setGeneratedResult(null)

    try {
      const res = await fetch("/api/admin/marketing-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaTitle,
          frameworkType,
          pilarName: initialIdea?.pilarName || "Estrategia Vibecode Lab",
          targetAvatar: targetAvatar || "Founders y Creadores de Software",
          keyword: keyword || "VIBECODE",
          customNotes,
          preferredEngine
        })
      })

      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al generar guion")
      }

      setGeneratedResult(data.script)
      toast({
        title: "¡Guion Generado con Éxito!",
        description: "El Asistente de Venta Perpetua redactó el guion según las reglas de Emilio.",
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error de Generación",
        description: err.message || "No se pudo conectar con el motor de IA.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (!generatedResult) return
    const text = `=== GUION GENERADO POR ASISTENTE DE VENTA PERPETUA ===
TITULO: ${generatedResult.title}
FRAMEWORK: ${generatedResult.frameworkType}
AVATAR: ${generatedResult.targetAvatar}
CTA KEYWORD: ${generatedResult.ctaKeyword}

[HOOK INICIAL]
"${generatedResult.hook}"

[CONTEXTO / RETENCIÓN]
"${generatedResult.extensionOrContext}"

[DESARROLLO DE PASOS]
${generatedResult.stepsOrBody?.map((s: any) => `- ${s.stepTitle}: ${s.content} ${s.isOmitted ? '[PIEZA CENSURADA/OMITIDA]' : ''}`).join("\n")}

[CALL TO ACTION]
"${generatedResult.callToAction}"

[RESPUESTA INMEDIATA DEL SETTER EN DM]
"${generatedResult.dmSetterResponse}"

[TIPS DE GRABACIÓN & RETENCIÓN]
${generatedResult.productionTips?.map((t: string) => `• ${t}`).join("\n")}
`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copiado",
      description: "Guion completo copiado al portapapeles.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-violet-300">
            <Sparkles className="w-5 h-5 text-amber-400" /> Asistente de Guionado con IA (Venta Perpetua)
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Aplica automáticamente la psicología de conversión de Emilio: aversión a la pérdida, omisión de paso clave, CTA suave ("te muestro cómo funciona") y amortiguación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Formulario de Entrada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-slate-300">Idea o Título Central</Label>
              <Input
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="Ej: Cómo conectar Mercado Pago con webhooks en un backend moderno..."
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Framework de Emilio</Label>
              <select
                value={frameworkType}
                onChange={(e) => setFrameworkType(e.target.value as FrameworkType)}
                className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-violet-500"
              >
                {FRAMEWORKS_LIST.map((fw) => (
                  <option key={fw.type} value={fw.type}>
                    {fw.icon} {fw.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Avatar Objetivo</Label>
              <Input
                value={targetAvatar}
                onChange={(e) => setTargetAvatar(e.target.value)}
                placeholder="Ej: Founders & Product Owners"
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">CTA Palabra Clave</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                placeholder="Ej: PAGOS, VIBECODE, GUIA"
                className="bg-slate-950 border-slate-800 text-emerald-400 font-mono font-bold text-xs uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Motor de IA Preferido</Label>
              <select
                value={preferredEngine}
                onChange={(e) => setPreferredEngine(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-violet-500"
              >
                <option value="gemini">Gemini 2.0 Flash (Ultrarrápido)</option>
                <option value="anthropic">Claude 3.5 Sonnet (Copywriting Avanzado)</option>
                <option value="deepseek">DeepSeek-V3 (Razonamiento)</option>
                <option value="openai">OpenAI GPT-4o</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Instrucciones Adicionales (Opcional)</Label>
            <Input
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ej: Enfatizar que se puede hacer sin saber TypeScript, o mencionar la preventa..."
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white font-semibold gap-2 h-10 shadow-lg shadow-violet-950/40"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Redactando guion con el sistema de Emilio...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> Generar Guion de Venta Perpetua
              </>
            )}
          </Button>

          {/* Resultado Generado */}
          {generatedResult && (
            <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-violet-900/50 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-violet-300 text-sm flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-emerald-400" /> Guion Listo para Teleprompter & Grabación
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-1 h-7 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "¡Copiado!" : "Copiar"}
                </Button>
              </div>

              {/* Hook */}
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-red-400" /> Hook Negativo (0-4 seg):
                </span>
                <p className="text-slate-200 font-medium italic leading-relaxed">
                  "{generatedResult.hook}"
                </p>
              </div>

              {/* Contexto */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Extensión de Retención & Contexto:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  "{generatedResult.extensionOrContext}"
                </p>
              </div>

              {/* Pasos */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Desarrollo de Pasos (Estructura de Valor & Omisión):
                </span>
                {generatedResult.stepsOrBody?.map((step: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-lg border text-xs ${
                      step.isOmitted 
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-200" 
                        : "bg-slate-900 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{step.stepTitle}</span>
                      {step.isOmitted && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px]">
                          <Lock className="w-2.5 h-2.5 mr-1" /> PIEZA CENSURADA
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">{step.content}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Llamada a la Acción (CTA al DM):
                </span>
                <p className="text-emerald-200 font-bold leading-relaxed">
                  "{generatedResult.callToAction}"
                </p>
              </div>

              {/* Setter Response */}
              <div className="p-3 bg-violet-950/30 border border-violet-800/40 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1">
                  <Send className="w-3 h-3 text-violet-400" /> Respuesta Inmediata del Setter (Chatbooking):
                </span>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  "{generatedResult.dmSetterResponse}"
                </p>
              </div>

              {/* Tips de Producción */}
              {generatedResult.productionTips && generatedResult.productionTips.length > 0 && (
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <span className="font-semibold text-slate-300">Tips de Grabación:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {generatedResult.productionTips.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-800 text-slate-300 text-xs">
            Cerrar
          </Button>
          {generatedResult && onApplyScript && (
            <Button 
              onClick={() => {
                onApplyScript(generatedResult)
                onClose()
              }}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
            >
              Aplicar al Editor de Guiones
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
