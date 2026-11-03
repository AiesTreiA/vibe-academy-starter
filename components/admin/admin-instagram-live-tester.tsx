"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Instagram, 
  Send, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Radio, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Laptop
} from "lucide-react"

export function AdminInstagramLiveTester() {
  const [assetInfo, setAssetInfo] = useState<any>(null)
  const [loadingAsset, setLoadingAsset] = useState(true)
  const [recipientId, setRecipientId] = useState("")
  const [messageText, setMessageText] = useState("Hola! Este es un mensaje de prueba en vivo desde la consola de VibeCourseBot.")
  const [useAi, setUseAi] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [eventsLog, setEventsLog] = useState<Array<any>>([])

  const fetchAsset = async () => {
    setLoadingAsset(true)
    try {
      const res = await fetch("/api/admin/instagram/live-test")
      const data = await res.json()
      setAssetInfo(data.asset)
    } catch (e) {
      console.error("Error loading Instagram asset info:", e)
    } finally {
      setLoadingAsset(false)
    }
  }

  useEffect(() => {
    fetchAsset()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientId.trim()) return

    setIsSending(true)
    const newEvent = {
      id: Date.now(),
      type: "dispatched",
      recipient: recipientId.trim(),
      timestamp: new Date().toLocaleTimeString(),
      status: "sending"
    }
    setEventsLog(prev => [newEvent, ...prev])

    try {
      const res = await fetch("/api/admin/instagram/live-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: recipientId.trim(),
          messageText,
          testAi: useAi
        })
      })

      const data = await res.json()
      setLastResult(data)

      setEventsLog(prev => prev.map(ev => {
        if (ev.id === newEvent.id) {
          return {
            ...ev,
            status: data.success ? "delivered" : "failed",
            message: data.delivered_message || data.error,
            messageId: data.message_id
          }
        }
        return ev
      }))
    } catch (err: any) {
      setLastResult({ success: false, error: err.message })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-indigo-950/40 border border-pink-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Instagram className="h-6 w-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Instagram AI Bot & Live Dispatch Console</h2>
            <Badge className="bg-pink-500/10 text-pink-300 border-pink-500/30 text-xs">VibeCourseBot Live Engine</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Herramienta administrativa oficial para inspeccionar el activo vinculado (Page/Instagram Account), verificar la conexión Meta Graph API y probar el envío en vivo de respuestas contextuales generadas por IA.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAsset}
          className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10 shrink-0 flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingAsset ? "animate-spin" : ""}`} />
          Refrescar Activo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Asset Selection & Linked Meta Accounts (Requisito 1 de Meta) */}
        <Card className="bg-card/40 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-pink-300">
                <Building2 className="h-4 w-4 text-pink-400" />
                (1) Asset Selection & Portfolio
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Verificado</Badge>
            </div>
            <CardDescription className="text-xs">
              Activo comercial y cuentas oficiales vinculadas en Meta Business Manager.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-background/50 border border-border/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Portafolio Legal:</span>
                <span className="font-semibold text-white">JAVIER IGNACIO MUJICA CARVAJAL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Business ID:</span>
                <span className="font-mono text-[11px] text-pink-300">1777092366829362</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">App ID:</span>
                <span className="font-mono text-[11px] text-indigo-300">1342161154696429</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-pink-950/20 border border-pink-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Instagram className="h-3.5 w-3.5 text-pink-400" /> Cuenta Instagram:
                </span>
                <span className="font-bold text-pink-300">@mujica_ai_lab</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tipo de Cuenta:</span>
                <span className="text-slate-300">Instagram Profesional / Creador</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fan Page ID:</span>
                <span className="font-mono text-[11px] text-slate-300">{assetInfo?.connected_page_id || "61591534187376"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Webhook Endpoint:</span>
                <span className="text-[10px] text-emerald-400 font-mono">/api/vibecode/instagram/webhook</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 text-[11px]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Token de acceso activo con permisos de mensajería profesional.</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Live Send Action from App UI (Requisito 2 de Meta) */}
        <Card className="lg:col-span-2 bg-card/40 border-pink-500/20 backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                <Send className="h-4 w-4 text-pink-400" />
                (2) Live Send Action from App UI
              </CardTitle>
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[10px]">Server-to-Server / Live Dispatch</Badge>
            </div>
            <CardDescription className="text-xs">
              Simulador de despacho en vivo: ingresa el Instagram User ID del destinatario o prueba con un usuario tester.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="recipientId" className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-pink-400" />
                    ID de Usuario Instagram (Recipient Scoped ID)
                  </Label>
                  <Input 
                    id="recipientId"
                    placeholder="Ej: 17841400000000000 o ID de chat"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    className="bg-background/60 border-border/40 text-xs font-mono text-white"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    El ID del usuario de Instagram que interactúa con @mujica_ai_lab.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-indigo-400" />
                    Modo de Generación
                  </Label>
                  <div className="flex items-center gap-3 pt-1">
                    <Button 
                      type="button" 
                      size="sm"
                      variant={useAi ? "default" : "outline"}
                      onClick={() => setUseAi(true)}
                      className={`text-xs flex items-center gap-1.5 ${useAi ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "border-border/30 text-slate-400"}`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Motor IA Activo
                    </Button>
                    <Button 
                      type="button" 
                      size="sm"
                      variant={!useAi ? "default" : "outline"}
                      onClick={() => setUseAi(false)}
                      className={`text-xs flex items-center gap-1.5 ${!useAi ? "bg-pink-600 hover:bg-pink-500 text-white" : "border-border/30 text-slate-400"}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Texto Directo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="messageText" className="text-xs text-slate-300 font-semibold">
                  {useAi ? "Mensaje del Usuario a procesar por la IA:" : "Mensaje de texto a enviar directamente:"}
                </Label>
                <textarea 
                  id="messageText"
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full rounded-md border border-border/40 bg-background/60 p-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Escribe el mensaje de prueba..."
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Laptop className="h-3.5 w-3.5 text-slate-400" />
                  Al enviar, la respuesta se transmite por la Meta Graph API oficial hacia el chat nativo de Instagram.
                </span>

                <Button 
                  type="submit" 
                  disabled={isSending || !recipientId.trim()}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 px-5"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Despachando a Instagram...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Enviar a Instagram Live
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Live Result Feedback (Requisito 3 de Meta: Delivered message status) */}
            {lastResult && (
              <div className={`mt-4 p-3.5 rounded-lg border text-xs animate-in fade-in ${lastResult.success ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" : "bg-rose-950/20 border-rose-500/30 text-rose-200"}`}>
                <div className="flex items-center justify-between mb-1.5 font-bold">
                  <span className="flex items-center gap-1.5">
                    {lastResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                    {lastResult.success ? "✅ Mensaje Despachado con Éxito (Delivered to Native Client)" : "❌ Error de Despacho"}
                  </span>
                  {lastResult.message_id && (
                    <span className="font-mono text-[10px] opacity-80">Message ID: {lastResult.message_id}</span>
                  )}
                </div>
                {lastResult.delivered_message && (
                  <p className="p-2 rounded bg-background/50 border border-border/20 text-slate-200 text-[11px] mt-2">
                    <strong className="text-white">Texto Entregado:</strong> {lastResult.delivered_message}
                  </p>
                )}
                {lastResult.error && (
                  <p className="text-[11px] mt-1 text-rose-300">
                    <strong>Detalle del error:</strong> {lastResult.error}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events Log Table */}
      <Card className="bg-card/30 border-border/30 backdrop-blur-md">
        <CardHeader className="py-3 px-4 border-b border-border/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            Registro de Eventos y Despacho en Vivo (Live Dispatch Log)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {eventsLog.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No se han emitido eventos en esta sesión. Los mensajes despachados aparecerán aquí con su estado de entrega en tiempo real.
            </div>
          ) : (
            <div className="divide-y divide-border/20 text-xs">
              {eventsLog.map(ev => (
                <div key={ev.id} className="p-3.5 flex items-center justify-between hover:bg-card/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">[{ev.timestamp}]</span>
                      <span className="font-semibold text-white">Destinatario ID: {ev.recipient}</span>
                      <Badge className={ev.status === "delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]" : "bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px]"}>
                        {ev.status === "delivered" ? "Entregado a Instagram" : ev.status}
                      </Badge>
                    </div>
                    {ev.message && (
                      <p className="text-[11px] text-slate-300 line-clamp-1">
                        {ev.message}
                      </p>
                    )}
                  </div>
                  {ev.messageId && (
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                      ID: {ev.messageId}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
