"use client"

import React, { useState, useEffect } from "react"
import { 
  Bot, 
  Cpu, 
  DollarSign, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Wallet, 
  Edit3, 
  Save, 
  X,
  Database,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface ProviderQuota {
  provider: "anthropic" | "openai" | "deepseek" | "huawei" | "gemini"
  displayName: string
  modelDefault: string
  configuredCredit: number
  spentUsd: number
  remainingCredit: number
  percentageRemaining: number
  isLiveBalance: boolean
  liveBalanceInfo?: {
    totalBalance?: number
    toppedUpBalance?: number
    grantedBalance?: number
    currency?: string
  }
  tariffInfo: {
    inputPer1M: number
    outputPer1M: number
  }
  status: "active" | "low_credit" | "depleted" | "unconfigured"
}

export default function AdminAIQuotaTab() {
  const [loading, setLoading] = useState(true)
  const [quotas, setQuotas] = useState<Record<string, ProviderQuota>>({})
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<string>("")
  const [updating, setUpdating] = useState(false)

  const fetchQuotas = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/ai-quota")
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.quotas) {
          setQuotas(data.quotas)
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI quotas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotas()
  }, [])

  const handleStartEdit = (provider: string, currentCredit: number) => {
    setEditingProvider(provider)
    setEditAmount(currentCredit.toString())
  }

  const handleSaveCredit = async (provider: string) => {
    const num = parseFloat(editAmount)
    if (isNaN(num) || num < 0) {
      toast({
        title: "Monto inválido",
        description: "Ingresa un número positivo en USD.",
        variant: "destructive"
      })
      return
    }

    setUpdating(true)
    try {
      const res = await fetch("/api/admin/ai-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          amountUsd: num
        })
      })

      const data = await res.json()
      if (data.success && data.quotas) {
        setQuotas(data.quotas)
        toast({
          title: "Saldo Actualizado",
          description: `Crédito abonado para ${provider.toUpperCase()} fijado en $${num.toFixed(2)} USD.`,
        })
        setEditingProvider(null)
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo actualizar el saldo.",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  // Calculate totals
  const totalConfigured = Object.values(quotas).reduce((acc, q) => acc + (q.configuredCredit || 0), 0)
  const totalSpent = Object.values(quotas).reduce((acc, q) => acc + (q.spentUsd || 0), 0)
  const totalRemaining = Object.values(quotas).reduce((acc, q) => acc + (q.remainingCredit || 0), 0)

  const getStatusBadge = (status: ProviderQuota["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">🟢 Operativo</Badge>
      case "low_credit":
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">⚠️ Saldo Bajo</Badge>
      case "depleted":
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs">🚨 Sin Saldo</Badge>
      case "unconfigured":
        return <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs">⚪ Sin Key</Badge>
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/20 border border-border/30 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Monitor de Cuotas & Créditos de IA</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Control de saldo en tiempo real, recargas de crédito y consumo acumulado en USD por cada proveedor de IA.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchQuotas}
          disabled={loading}
          className="hover:bg-primary/10 text-xs flex items-center gap-2 border-border/40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          {loading ? "Actualizando..." : "Recargar Saldos"}
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card className="bg-card/40 border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <CardContent className="p-5 flex flex-col justify-center">
            <span className="text-xs text-indigo-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Total Presupuestado / Abonado
            </span>
            <span className="text-3xl font-extrabold text-white mt-1">${totalConfigured.toFixed(2)} USD</span>
            <span className="text-[10px] text-muted-foreground mt-1">Fondo total disponible entre APIs</span>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-5 flex flex-col justify-center">
            <span className="text-xs text-amber-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Gasto Total Consumido
            </span>
            <span className="text-3xl font-extrabold text-amber-400 mt-1">${totalSpent.toFixed(4)} USD</span>
            <span className="text-[10px] text-muted-foreground mt-1">Consumo real acumulado por uso de tokens</span>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex flex-col justify-center">
            <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Saldo Restante Estimado
            </span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-1">${totalRemaining.toFixed(2)} USD</span>
            <span className="text-[10px] text-muted-foreground mt-1">Crédito disponible para consultas</span>
          </CardContent>
        </Card>

      </div>

      {/* Provider Quota Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {Object.values(quotas).map((q) => {
          const isEditing = editingProvider === q.provider

          return (
            <Card key={q.provider} className="bg-card/30 border-border/30 hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              
              <CardHeader className="pb-3 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {q.provider === "anthropic" && <Sparkles className="h-5 w-5 text-amber-400" />}
                    {q.provider === "openai" && <Bot className="h-5 w-5 text-emerald-400" />}
                    {q.provider === "deepseek" && <Cpu className="h-5 w-5 text-blue-400" />}
                    {q.provider === "huawei" && <Layers className="h-5 w-5 text-purple-400" />}
                    {q.provider === "gemini" && <Zap className="h-5 w-5 text-cyan-400" />}
                    <CardTitle className="text-base font-bold text-white">{q.displayName}</CardTitle>
                  </div>
                  {getStatusBadge(q.status)}
                </div>
                <CardDescription className="text-[11px] font-mono text-muted-foreground mt-1 flex items-center justify-between">
                  <span>Modelo por defecto:</span>
                  <span className="text-indigo-300 font-semibold">{q.modelDefault}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="py-4 space-y-4 flex-1">
                
                {/* Credit balance display or edit */}
                <div className="bg-background/50 rounded-xl p-3.5 border border-border/20 space-y-2">
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Crédito Abonado / Inicial:</span>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white">$</span>
                        <Input
                          type="number"
                          step="0.5"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="h-7 w-20 text-xs bg-slate-900 border-indigo-500 text-white p-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveCredit(q.provider)}
                          disabled={updating}
                          className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingProvider(null)}
                          className="h-7 w-7 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">${q.configuredCredit.toFixed(2)} USD</span>
                        <button
                          onClick={() => handleStartEdit(q.provider, q.configuredCredit)}
                          className="text-muted-foreground hover:text-indigo-400 transition"
                          title="Abonar o cambiar saldo presupuestado"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Remaining credit meter */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground font-medium">Crédito Restante:</span>
                    <span className={`text-base font-extrabold font-mono ${
                      q.remainingCredit > 1.0 ? "text-emerald-400" : q.remainingCredit > 0.1 ? "text-amber-400" : "text-red-400"
                    }`}>
                      ${q.remainingCredit.toFixed(4)} USD
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-500 ${
                        q.percentageRemaining > 40 ? "bg-emerald-400" : q.percentageRemaining > 15 ? "bg-amber-400" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, q.percentageRemaining))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Disponible: {q.percentageRemaining}%</span>
                    <span>Gastado: ${q.spentUsd.toFixed(4)} USD</span>
                  </div>

                </div>

                {/* Live balance badge for DeepSeek */}
                {q.isLiveBalance && q.liveBalanceInfo && (
                  <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-indigo-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Balance Oficial en Tiempo Real (API)
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">DeepSeek API</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 text-[11px] pt-1">
                      <span>Saldo Total:</span>
                      <span className="font-mono font-bold text-emerald-400">${q.liveBalanceInfo.totalBalance?.toFixed(2)} USD</span>
                    </div>
                    {q.liveBalanceInfo.grantedBalance ? (
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Crédito Otorgado (Bonus):</span>
                        <span className="font-mono">${q.liveBalanceInfo.grantedBalance.toFixed(2)} USD</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Tariffs Info */}
                <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border/20">
                  <div className="flex justify-between">
                    <span>Tarifa Input (1M Tokens):</span>
                    <span className="font-mono text-slate-300">${q.tariffInfo.inputPer1M.toFixed(3)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa Output (1M Tokens):</span>
                    <span className="font-mono text-slate-300">${q.tariffInfo.outputPer1M.toFixed(3)} USD</span>
                  </div>
                </div>

              </CardContent>

            </Card>
          )
        })}

      </div>

      {/* Explanatory Banner */}
      <Card className="bg-card/20 border-border/30">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>¿Cómo funciona el Reemplazo / Fallback?</strong> Si un motor falla o agota su cuota, el sistema salta automáticamente al siguiente en la cadena de reemplazo sin interrumpir el servicio al usuario.
            </span>
          </div>
          <a
            href="/admin/ai-tester"
            className="inline-flex items-center gap-1 text-primary hover:underline font-bold shrink-0 text-xs"
          >
            Ir al AI Playground Diagnóstico <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>

    </div>
  )
}
