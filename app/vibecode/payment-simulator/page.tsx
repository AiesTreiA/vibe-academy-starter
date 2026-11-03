"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CreditCard, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react"

function PaymentSimulatorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const regId = searchParams.get("reg_id")
  const prefId = searchParams.get("pref_id")
  const amount = searchParams.get("amount") || "209"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Format USD
  const formatUSD = (val: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(Number(val))
  }

  const handleSimulateSuccess = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/vibecode/simulate-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reg_id: regId }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || "Ocurrió un error al procesar el pago.")
        setLoading(false)
        return
      }

      setSuccess(true)
      // Redirect back to landing page with success query param after 2 seconds
      setTimeout(() => {
        router.push("/vibecode?status=success")
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setError("Error de red. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  const handleSimulateFailure = () => {
    router.push("/vibecode?status=failed")
  }

  if (!regId || !prefId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error de Simulación</h2>
          <p className="text-slate-600 mb-6">
            Falta información de la inscripción. Vuelve a intentarlo desde la página del bootcamp.
          </p>
          <button
            onClick={() => router.push("/vibecode")}
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
          >
            Volver a Vibecode
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 antialiased">
      {/* Mock payment header */}
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-slate-900" />
        <span className="text-lg font-semibold text-slate-900 tracking-tight">
          Mercado Pago · Pasarela Simulada
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-md w-full">
        {/* Top Status */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Detalle del Pago
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {formatUSD(amount)}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Crea Tu App: Bootcamp Práctico (7 Semanas)
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="text-center py-6 animate-fade-in-up">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">¡Pago Confirmado!</h3>
              <p className="text-slate-600 text-sm mb-4">
                Inscripción registrada. Redirigiendo de vuelta a la página del bootcamp...
              </p>
              <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">ID Registro:</span>
                  <span className="font-mono text-slate-800 font-medium">{regId.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">ID Preferencia:</span>
                  <span className="font-mono text-slate-800 font-medium">{prefId.slice(0, 15)}...</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                  <span className="text-slate-500">Método de Pago:</span>
                  <span className="text-slate-800 font-medium flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-slate-600" /> Tarjeta de Crédito / Débito
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl mb-6 flex gap-2 border border-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleSimulateSuccess}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" /> Procesando pago...
                    </>
                  ) : (
                    <>
                      Simular Pago Exitoso <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleSimulateFailure}
                  disabled={loading}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition disabled:opacity-50"
                >
                  Simular Pago Fallido
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Esta es una simulación de pago segura. No se transferirán fondos reales.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSimulator() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentSimulatorContent />
    </Suspense>
  )
}
