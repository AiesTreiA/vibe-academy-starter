"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "jm_cookie_ok"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    setLeaving(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1")
      setVisible(false)
      setLeaving(false)
    }, 350)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-24 sm:w-[320px] z-40 pointer-events-auto"
      style={{
        animation: leaving
          ? "cookieOut 0.35s ease-in forwards"
          : "cookieIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-950/90 px-4 py-3 shadow-xl backdrop-blur-md">
        {/* Icon */}
        <span className="text-base shrink-0" aria-hidden>🍪</span>

        {/* Text */}
        <p className="flex-1 text-[11px] leading-snug text-slate-400">
          Usamos cookies básicas y geolocalización por IP para adaptar el idioma.{" "}
          <a
            href="/privacidad"
            className="text-slate-300 underline hover:text-white transition-colors font-medium"
          >
            Más info
          </a>
        </p>

        {/* Accept button */}
        <button
          onClick={accept}
          className="shrink-0 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500 active:scale-95"
        >
          Aceptar
        </button>
      </div>

      <style>{`
        @keyframes cookieIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes cookieOut {
          from { opacity: 1; transform: translateY(0)   scale(1);    }
          to   { opacity: 0; transform: translateY(8px) scale(0.97); }
        }
      `}</style>
    </div>
  )
}
