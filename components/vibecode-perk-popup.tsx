"use client"

import React, { useState, useEffect } from "react"
import { Sparkles, Gift, X, ArrowRight } from "lucide-react"

export default function VibecodePerkPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)

  useEffect(() => {
    // Check if previously dismissed in this session
    try {
      const dismissed = sessionStorage.getItem("vibecode_perk_popup_dismissed")
      if (dismissed) return
    } catch {
      // sessionStorage unavailable
    }

    setIsDismissed(false)

    // Trigger after a friendly delay (4.5s) to allow initial hero viewing
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 4500)

    // Also trigger on scroll if not already visible
    const handleScroll = () => {
      if (window.scrollY > 400 && !isVisible) {
        setIsVisible(true)
      }
    }

    const handleChat = () => {
      setIsVisible(true)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("open-chatbot-eustacio", handleChat)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("open-chatbot-eustacio", handleChat)
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    try {
      sessionStorage.setItem("vibecode_perk_popup_dismissed", "true")
    } catch {}
  }

  const handleOpenChat = () => {
    handleDismiss()
    window.dispatchEvent(
      new CustomEvent("open-chatbot", {
        detail: {
          prefill: "¡Hola! Vi en la web que tienen un beneficio sorpresa exclusivo para mí 🎁 ¿De qué se trata?",
        },
      })
    )
  }

  if (isDismissed || !isVisible) return null

  return (
    <aside
      aria-label="Invitación a beneficio sorpresa"
      className="fixed bottom-24 right-4 sm:right-6 z-[9990] max-w-[340px] sm:max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-500 transition-all pointer-events-auto select-none"
    >
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-slate-950/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(99,102,241,0.25)] backdrop-blur-xl">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-xl pointer-events-none" />

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          aria-label="Cerrar invitación"
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
            <Gift className="h-3 w-3 text-indigo-400 animate-bounce" />
            <span>Beneficio Sorpresa Disponible</span>
          </div>
        </div>

        {/* Engaging Copy */}
        <div className="space-y-2 mb-4">
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">¡Descubre un beneficio sorpresa al conversar con nuestro asistente!</h4>
          <p className="text-xs text-slate-300 leading-relaxed">Nuestro asistente de IA tiene un <strong>beneficio sorpresa exclusivo</strong> preparado para ti hoy. Cuéntale sobre tu idea de app o pregúntale por la <strong>Generación 2</strong> y descubre tu recompensa.</p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenChat}
            className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-950/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 transition-transform group-hover:rotate-12" />
            <span>Hablar y Descubrir Beneficio</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  )
}
