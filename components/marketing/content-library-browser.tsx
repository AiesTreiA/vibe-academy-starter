"use client"

import React, { useState } from "react"
import { 
  Search, 
  Filter, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  ArrowRight, 
  Zap, 
  Flame, 
  Eye, 
  BookOpen, 
  Tag, 
  UserCheck 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { 
  VIBECODE_100_IDEAS, 
  PILLARS_CONFIG, 
  PillarId, 
  ContentIdeaItem, 
  FrameworkType,
  FRAMEWORKS_LIST 
} from "@/lib/marketing-content-data"

interface ContentLibraryBrowserProps {
  onSelectIdeaForScript: (idea: ContentIdeaItem) => void
  onGenerateWithAI: (idea: ContentIdeaItem) => void
}

export default function ContentLibraryBrowser({
  onSelectIdeaForScript,
  onGenerateWithAI
}: ContentLibraryBrowserProps) {
  const [selectedPilar, setSelectedPilar] = useState<string>("all")
  const [selectedAvatar, setSelectedAvatar] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = (idea: ContentIdeaItem) => {
    const text = `IDEA #${idea.id}: ${idea.title}\nPILAR: ${idea.pilarName}\nAVATAR: ${idea.targetAvatar}\nHOOK SUGERIDO: "${idea.sampleHook}"\nCTA KEYWORD: "${idea.suggestedKeyword}"\nFRAMEWORK RECOMENDADO: ${idea.suggestedFramework}`
    navigator.clipboard.writeText(text)
    setCopiedId(idea.id)
    toast({
      title: "¡Idea Copiada!",
      description: `Idea #${idea.id} copiada al portapapeles.`,
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredIdeas = VIBECODE_100_IDEAS.filter((idea) => {
    const matchPilar = selectedPilar === "all" || idea.pilarId === selectedPilar
    const matchAvatar = selectedAvatar === "all" || idea.targetAvatar === selectedAvatar
    const matchSearch = searchQuery.trim() === "" || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.sampleHook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.suggestedKeyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.corePainOrDesire.toLowerCase().includes(searchQuery.toLowerCase())
    return matchPilar && matchAvatar && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Banco de 100 Ideas de Contenido (Vibecode Lab)
            </h2>
            <p className="text-sm text-slate-400">
              Estructuradas en los 5 pilares estratégicos de la metodología de Venta Perpetua y Social Funnel.
            </p>
          </div>
          <Badge className="bg-violet-600/30 text-violet-300 border border-violet-500/40 px-3 py-1 font-mono text-sm self-start md:self-auto">
            {filteredIdeas.length} de 100 Ideas disponibles
          </Badge>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <Input
            placeholder="Buscar por palabra clave, dolor del cliente, webhook, Supabase, preventa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filtros por Pilares */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-violet-400" /> Filtrar por Pilar Estratégico:
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedPilar === "all" ? "default" : "outline"}
              onClick={() => setSelectedPilar("all")}
              className={selectedPilar === "all" ? "bg-violet-600 text-white" : "border-slate-800 text-slate-300 hover:bg-slate-800"}
            >
              Todos los Pilares (100)
            </Button>
            {(Object.keys(PILLARS_CONFIG) as PillarId[]).map((pKey) => {
              const pInfo = PILLARS_CONFIG[pKey]
              const isSelected = selectedPilar === pKey
              return (
                <Button
                  key={pKey}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedPilar(pKey)}
                  className={isSelected ? "bg-slate-100 text-slate-900 font-bold" : "border-slate-800 text-slate-300 hover:bg-slate-800"}
                >
                  {pInfo.name.split(" ")[0]} ({pInfo.range})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Filtro por Avatar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Avatar:
          </span>
          {["all", "Founders & Product Owners", "Desarrolladores & Devs", "Creativos & Diseñadores", "Emprendedores No Técnicos", "General / Audiencia Amplia"].map((av) => (
            <button
              key={av}
              onClick={() => setSelectedAvatar(av)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                selectedAvatar === av 
                  ? "bg-indigo-600 text-white border-indigo-500 font-medium" 
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {av === "all" ? "Todos los avatares" : av}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => {
          const pilarInfo = PILLARS_CONFIG[idea.pilarId]
          const frameworkInfo = FRAMEWORKS_LIST.find(f => f.type === idea.suggestedFramework)
          
          return (
            <Card key={idea.id} className="bg-slate-900 border-slate-800 hover:border-violet-700/60 transition-all flex flex-col justify-between shadow-lg">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
                      #{idea.id}
                    </span>
                    <Badge className={pilarInfo.badgeColor}>
                      {pilarInfo.name.split(":")[0]}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="border-slate-800 text-slate-400 text-[11px]">
                    {frameworkInfo?.icon} {frameworkInfo?.format}
                  </Badge>
                </div>

                <CardTitle className="text-base font-bold text-slate-100 leading-snug">
                  {idea.title}
                </CardTitle>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-indigo-300 font-medium bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                    🎯 {idea.targetAvatar}
                  </span>
                  <span className="text-slate-400">
                    Dolor: {idea.corePainOrDesire}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-sm">
                {/* Gancho preliminar */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Hook Sugerido (Primeros 3 seg):
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{idea.sampleHook}"
                  </p>
                </div>

                {/* Paso Omitido o Valor */}
                {idea.sampleStepOmittedOrValue && (
                  <div className="p-2.5 bg-violet-950/20 border border-violet-900/30 rounded-lg text-xs text-slate-300">
                    <span className="font-semibold text-violet-300">Estructura / Paso Omitido: </span>
                    {idea.sampleStepOmittedOrValue}
                  </div>
                )}

                {/* Keyword */}
                <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg text-xs border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-400" /> CTA Palabra Clave:
                  </span>
                  <Badge className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                    {idea.suggestedKeyword}
                  </Badge>
                </div>

                {/* Botones de Acción */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(idea)}
                    className="text-xs text-slate-400 hover:text-white h-8 px-2.5"
                  >
                    {copiedId === idea.id ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedId === idea.id ? "¡Copiado!" : "Copiar"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGenerateWithAI(idea)}
                      className="text-xs border-violet-700/60 bg-violet-950/40 text-violet-300 hover:bg-violet-900/60 h-8 gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Redactar con IA
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onSelectIdeaForScript(idea)}
                      className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white h-8 gap-1"
                    >
                      Guionar <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
