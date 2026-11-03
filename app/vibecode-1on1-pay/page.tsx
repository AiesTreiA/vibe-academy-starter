"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  Lock, 
  Laptop, 
  Zap,
  Building2,
  CheckCircle2,
  PhoneCall,
  Loader2,
  AlertCircle
} from "lucide-react"
import { AntigravityParticles } from "@/components/antigravity-particles"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function Vibecode1on1PayPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [projectIdea, setProjectIdea] = useState("")
  const [paymentPlan, setPaymentPlan] = useState<"single" | "installments">("single")
  const [selectedMethod, setSelectedMethod] = useState<"card" | "transfer" | "paypal">("card")
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const finalPrice = paymentPlan === "single" ? 360 : 180

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Registrar o redirigir según método seleccionado
      // Construir mensaje estructurado para coordinar y registrar
      const msg = encodeURIComponent(
        `¡Hola Javier! Acabo de registrarme para pagar Vibecode 1:1:\n\n` +
        `👤 Nombre: ${name}\n` +
        `📧 Correo: ${email}\n` +
        `📱 WhatsApp: ${phone}\n` +
        `💡 Proyecto: ${projectIdea || "Por definir en sesión 1"}\n` +
        `💳 Modalidad: ${paymentPlan === "single" ? "Pago único ($360 USD)" : "2 Cuotas ($180 USD c/u)"}\n` +
        `🏦 Método preferido: ${selectedMethod.toUpperCase()}\n\n` +
        `Por favor envíame el link o datos de pago para confirmar.`
      )

      window.open(`https://wa.me/56984242693?text=${msg}`, "_blank")
      setIsSuccess(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AntigravityParticles />
      </div>

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[350px] bg-gradient-to-b from-cyan-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Navigation */}
      <header className="relative z-20 border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/60 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/vibecode-1on1" className="flex items-center gap-2 group text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a Vibecode 1:1</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Lock className="h-3 w-3 text-emerald-400" />
              Checkout Seguro 1:1
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-14 space-y-10">
        
        {/* Title & Badge */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 px-3 py-1 font-mono text-xs">
            <Sparkles className="h-3 w-3 text-cyan-400 mr-1.5" />
            Inscripción y Pago • Vibecode 1:1
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Comienza tu Mentoría Privada de Software con IA
          </h1>
          <p className="text-sm md:text-base text-slate-400">
            Completa tus datos para confirmar tu acceso al paquete de 6 asesorías privadas 1 a 1 y coordinar tus horarios directamente.
          </p>
        </div>

        {/* 2-Column Grid: Left (Order Summary) & Right (Form/Payment) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: ORDER SUMMARY (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 space-y-6">
              
              <div className="space-y-1.5 border-b border-slate-800 pb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">Resumen del Programa</span>
                <h3 className="text-xl font-bold text-white">Vibecode 1:1 (Pack 6 Horas)</h3>
                <p className="text-xs text-slate-400">Mentoría privada individual con Javier Mujica</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-b border-slate-800 pb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Precio regular de lista</span>
                  <span className="text-slate-400 line-through decoration-rose-500 decoration-[2.5px] font-mono font-black text-lg">$497 USD</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-300 font-medium flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Descuento de Lanzamiento
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">-$137 USD</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold pt-2 border-t border-slate-800/80">
                  <span className="text-white">Total a Pagar</span>
                  <span className="text-2xl font-mono text-cyan-400">${finalPrice} USD</span>
                </div>
                {paymentPlan === "installments" && (
                  <p className="text-[11px] text-slate-400 text-right font-mono">
                    (Cuota 1 de 2 • Segunda cuota en sesión 4)
                  </p>
                )}
              </div>

              {/* What is included */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <span className="font-semibold text-white block uppercase tracking-wider text-[10px]">Lo que recibirás:</span>
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>6 sesiones privadas de 1 hora en vivo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Grabación en HD de todas las sesiones</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Plantillas de código Next.js 15, Gemini & Supabase</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Canal privado de WhatsApp para dudas y code-review</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Puesta en producción de tu proyecto real</span>
                </div>
              </div>

              {/* Security & Guarantee */}
              <div className="rounded-xl p-3 bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Garantía de Satisfacción</span>
                </div>
                <p>
                  Si tras la primera sesión sientes que el programa no es para ti, te devolvemos el 100% de tu dinero sin preguntas.
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT: CHECKOUT & PAYMENT FORM (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md">
              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                
                {isSuccess ? (
                  <div className="text-center py-10 space-y-4 animate-fade-in">
                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">¡Datos recibidos con éxito!</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Se ha abierto una conversación en WhatsApp para entregarte tus accesos inmediatos, link de pago y el calendario para agendar tus 6 sesiones.
                    </p>
                    <div className="pt-4">
                      <a
                        href="https://wa.me/56984242693"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-6">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Abrir WhatsApp Ahora
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Step 1: Payment Plan Selector */}
                    <div className="space-y-3">
                      <Label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        1. Selecciona tu modalidad de pago
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentPlan("single")}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            paymentPlan === "single"
                              ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                              : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">Pago Único</span>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Recomendado</Badge>
                          </div>
                          <div className="text-xl font-bold font-mono text-cyan-400 mt-2">$360 USD</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Acceso completo a las 6 sesiones</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentPlan("installments")}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            paymentPlan === "installments"
                              ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                              : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">2 Cuotas</span>
                            <span className="text-[10px] text-slate-400 font-mono">Sin intereses</span>
                          </div>
                          <div className="text-xl font-bold font-mono text-indigo-400 mt-2">2x $180 USD</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Paga la mitad hoy y la otra en sesión 4</p>
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Personal Contact Information */}
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <Label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        2. Tus datos de contacto y facturación
                      </Label>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name" className="text-xs text-slate-400">Nombre completo *</Label>
                          <Input
                            id="name"
                            required
                            placeholder="Ej. Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="email" className="text-xs text-slate-400">Correo electrónico *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              placeholder="tu@correo.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-xs text-slate-400">Teléfono / WhatsApp *</Label>
                            <Input
                              id="phone"
                              required
                              placeholder="+56 9 1234 5678"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="project" className="text-xs text-slate-400">
                            ¿Qué proyecto o software te gustaría construir? (Opcional)
                          </Label>
                          <Textarea
                            id="project"
                            placeholder="Ej. Quiero crear una plataforma SaaS con IA para automatizar reportes..."
                            value={projectIdea}
                            onChange={(e) => setProjectIdea(e.target.value)}
                            className="bg-slate-950 border-slate-800 focus:border-cyan-500 text-white mt-1 min-h-[70px] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Payment Method Selection */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <Label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        3. Método de pago preferido
                      </Label>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMethod("card")}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedMethod === "card"
                              ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <CreditCard className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-[11px] font-semibold block">Mercado Pago / Tarjetas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedMethod("transfer")}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedMethod === "transfer"
                              ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Building2 className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-[11px] font-semibold block">Transferencia (CLP)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedMethod("paypal")}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            selectedMethod === "paypal"
                              ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Zap className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-[11px] font-semibold block">PayPal</span>
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold min-h-[52px] h-auto py-3 px-4 text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all whitespace-normal"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                          <span className="flex items-center justify-center gap-2 text-center leading-snug">
                            <Lock className="h-4 w-4 shrink-0" />
                            <span>
                              Confirmar y Proceder al Pago{" "}
                              <span className="font-mono whitespace-nowrap">(${finalPrice} USD)</span>
                            </span>
                          </span>
                        )}
                      </Button>
                      <p className="text-[11px] text-slate-500 text-center mt-2.5">
                        Al enviar, se abrirá la confirmación directa y recibirás los accesos a tu correo.
                      </p>
                    </div>

                  </form>
                )}

              </CardContent>
            </Card>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
