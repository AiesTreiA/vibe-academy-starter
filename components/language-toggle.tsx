"use client"

import { usePathname, useRouter } from "next/navigation"
import { Globe } from "lucide-react"

interface LanguageToggleProps {
  currentLocale: "es" | "en"
}

export default function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageSwitch = (targetLocale: "es" | "en") => {
    if (targetLocale === currentLocale) return

    // Guardar preferencia del usuario en cookie por 1 año
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`

    if (targetLocale === "en") {
      // Si estamos en la home o cualquier subpágina sin prefijo
      if (pathname === "/") {
        router.push("/en")
      } else if (!pathname.startsWith("/en")) {
        router.push(`/en${pathname}`)
      }
    } else {
      // Target es español: si estamos en /en o subruta /en/...
      if (pathname === "/en") {
        router.push("/")
      } else if (pathname.startsWith("/en/")) {
        router.push(pathname.replace(/^\/en/, ""))
      } else {
        router.push("/")
      }
    }
  }

  const isEnglish = currentLocale === "en"

  return (
    <div
      className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-700 bg-slate-200/80 dark:bg-slate-800/80 p-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm"
      role="group"
      aria-label="Selector de idioma"
    >
      <button
        type="button"
        onClick={() => handleLanguageSwitch("es")}
        className={`px-2 py-1 rounded-full transition-all duration-200 flex items-center gap-1 ${
          !isEnglish
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Ver en Español"
        aria-pressed={!isEnglish}
      >
        <span className="text-[10px] sm:text-xs">ES</span>
      </button>
      <button
        type="button"
        onClick={() => handleLanguageSwitch("en")}
        className={`px-2 py-1 rounded-full transition-all duration-200 flex items-center gap-1 ${
          isEnglish
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="View in English"
        aria-pressed={isEnglish}
      >
        <Globe className="h-3 w-3 sm:hidden" />
        <span className="text-[10px] sm:text-xs">EN</span>
      </button>
    </div>
  )
}
