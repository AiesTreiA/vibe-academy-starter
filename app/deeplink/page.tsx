"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Link as LinkIcon,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  QrCode,
  TrendingUp,
  BarChart3,
  Smartphone,
  Globe,
  ArrowRight,
  Gift,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Youtube,
  MessageCircle,
  ShoppingBag,
  Share2,
  ShieldCheck,
  CreditCard,
  Building2,
  X,
} from "lucide-react"

interface DeeplinkItem {
  id: string
  slug: string
  target_url: string
  title: string
  platform_type: string
  clicks_count: number
  iab_bypass_count: number
  created_at: string
}

export default function DeeplinkLandingPage() {
  const [targetUrl, setTargetUrl] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [title, setTitle] = useState("")
  const [platformType, setPlatformType] = useState("generic")
  const [userEmail, setUserEmail] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successLink, setSuccessLink] = useState<{ short_url: string; slug: string } | null>(null)
  
  const [userLinks, setUserLinks] = useState<DeeplinkItem[]>([])
  const [freeRemaining, setFreeRemaining] = useState<number>(3)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"create" | "my-links" | "pricing">("create")

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "bank" | "paypal">("mercadopago")
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [proActivated, setProActivated] = useState(false)

  // Load stored email if available and check payment status
  useEffect(() => {
    const savedEmail = localStorage.getItem("deeplink_user_email")
    if (savedEmail) {
      setUserEmail(savedEmail)
      fetchUserLinks(savedEmail)
    }

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const status = urlParams.get("status")
      const emailParam = urlParams.get("email")

      if (status === "success" && emailParam) {
        const cleanEmail = decodeURIComponent(emailParam)
        setUserEmail(cleanEmail)
        localStorage.setItem("deeplink_user_email", cleanEmail)
        
        fetch("/api/deeplink/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        }).then(() => {
          setProActivated(true)
          fetchUserLinks(cleanEmail)
        })
      }
    }
  }, [])

  const fetchUserLinks = async (email: string) => {
    try {
      const res = await fetch(`/api/deeplink/stats?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.success) {
        setUserLinks(data.deeplinks || [])
        setFreeRemaining(data.free_links_remaining ?? Math.max(0, 3 - (data.deeplinks || []).length))
      }
    } catch (e) {
      console.error("Error fetching user links:", e)
    }
  }

  const handleCreateDeeplink = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessLink(null)

    if (!targetUrl) {
      setErrorMsg("Ingresa la URL de destino")
      return
    }

    if (!userEmail) {
      setErrorMsg("Ingresa tu correo electrónico para gestionar tus enlaces")
      return
    }

    setLoading(true)
    localStorage.setItem("deeplink_user_email", userEmail)

    let formattedUrl = targetUrl.trim()
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`
    }

    try {
      const res = await fetch("/api/deeplink/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: formattedUrl,
          title: title || getDomainName(formattedUrl),
          slug: customSlug,
          platform_type: platformType,
          user_email: userEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.limit_reached) {
          setErrorMsg("Has alcanzado tu límite de 3 enlaces gratuitos. ¡Desbloquea enlaces ilimitados por solo $1 USD/mes!")
          setShowCheckoutModal(true)
        } else {
          setErrorMsg(data.error || "Error al crear el enlace")
        }
        return
      }

      setSuccessLink({
        short_url: data.short_url,
        slug: data.deeplink.slug,
      })

      setTargetUrl("")
      setCustomSlug("")
      setTitle("")

      fetchUserLinks(userEmail)
    } catch (err: any) {
      setErrorMsg("Ocurrió un error inesperado al generar el enlace.")
    } finally {
      setLoading(false)
    }
  }

  const handleStartCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userEmail) {
      alert("Por favor ingresa tu correo electrónico")
      return
    }

    setCheckoutLoading(true)
    localStorage.setItem("deeplink_user_email", userEmail)

    try {
      const res = await fetch("/api/deeplink/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, payment_method: paymentMethod }),
      })

      const data = await res.json()

      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        // Confirm bank or simulation
        await fetch("/api/deeplink/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        })
        setProActivated(true)
        setShowCheckoutModal(false)
        fetchUserLinks(userEmail)
      }
    } catch (err) {
      alert("Error al procesar la suscripción")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const copyToClipboard = (url: string, slug: string) => {
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  const getDomainName = (url: string) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
      return parsed.hostname.replace("www.", "")
    } catch {
      return "Enlace de Destino"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-purple-400">
                Vibecode DeepLinks
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                $1 USD/mes vs $14 linktw.in
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === "create" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Crear Enlace
            </button>
            <button
              onClick={() => {
                setActiveTab("my-links")
                if (userEmail) fetchUserLinks(userEmail)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === "my-links" ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              Mis Enlaces
              {userLinks.length > 0 && (
                <span className="bg-zinc-800 text-xs px-1.5 py-0.5 rounded-full">{userLinks.length}</span>
              )}
            </button>
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              Plan Pro $1/mes
            </button>
          </nav>
        </div>
      </header>

      {/* Success Notification Banner if Pro activated */}
      {proActivated && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
          <Sparkles className="w-5 h-5 fill-current" />
          ¡Felicidades! Tu Suscripción DeepLinks Pro ($1 USD/mes) ha sido activada con éxito. Ya puedes crear enlaces ilimitados.
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-900/30 via-zinc-900/50 to-zinc-950 border border-purple-500/20 p-8 sm:p-12 mb-12 text-center">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold mb-6">
            <Gift className="w-4 h-4" />
            3 Enlaces 100% GRATIS • Luego solo $1 USD / mes (~$990 CLP)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Rompe el navegador de Instagram y{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              multiplica tus ventas
            </span>
          </h1>

          <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Cuando alguien hace clic en tus links de Instagram o TikTok, se abren atrapados dentro del navegador webkit interno de la app (donde no están logueados). Nombres como{" "}
            <strong className="text-white">linktw.in te cobran $14 USD/mes</strong>. Nosotros te damos exactamente la misma tecnología de Deep Link por{" "}
            <strong className="text-emerald-400">$1 USD al mes</strong>.
          </p>

          {/* Pricing Comparison Bar */}
          <div className="max-w-xl mx-auto grid grid-cols-2 gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 mb-6">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-left">
              <span className="text-xs text-zinc-500 font-semibold block uppercase">Competencia (linktw.in)</span>
              <span className="text-xl font-bold text-red-400 flex items-center gap-1">
                $14 USD <span className="text-xs text-zinc-400 font-normal">/ mes</span>
              </span>
              <span className="text-[11px] text-zinc-500">$168 USD al año</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/40 text-left relative overflow-hidden">
              <div className="absolute top-1 right-2 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                AHORRA 93%
              </div>
              <span className="text-xs text-purple-300 font-semibold block uppercase">Vibecode DeepLinks</span>
              <span className="text-xl font-bold text-emerald-400 flex items-center gap-1">
                $1 USD <span className="text-xs text-zinc-400 font-normal">/ mes</span>
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">¡Con 3 Enlaces GRATIS!</span>
            </div>
          </div>
        </div>

        {/* TAB 1: CREATE DEEPLINK */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Crear Enlace Profundo (Deep Link)
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {freeRemaining > 50 || userEmail.toLowerCase().trim() === "hola@javiermujica.com" || userEmail.toLowerCase().trim() === "javiermujicadev@gmail.com"
                    ? "Ilimitados 👑 (Creador)"
                    : `${freeRemaining} / 3 Gratis Restantes`}
                </span>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>{errorMsg}</div>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    Activar por $1 USD
                  </button>
                </div>
              )}

              {successLink && (
                <div className="mb-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-base mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Tu Deep Link ha sido generado con éxito!
                  </div>
                  <p className="text-xs text-emerald-300/80 mb-4">
                    Este enlace romperá el navegador interno de Instagram y abrirá directamente en el teléfono del usuario.
                  </p>
                  <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-emerald-500/30">
                    <input
                      type="text"
                      readOnly
                      value={successLink.short_url}
                      className="bg-transparent text-sm text-emerald-300 flex-1 outline-none font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(successLink.short_url, successLink.slug)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      {copiedSlug === successLink.slug ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copiar Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateDeeplink} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    1. URL de Destino (YouTube, WhatsApp, E-commerce, etc.) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="youtube.com/watch?v=... o tu-sitio.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Plataforma de Destino
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "youtube", label: "YouTube", icon: Youtube, color: "hover:border-red-500/50 hover:bg-red-500/10" },
                      { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
                      { id: "website", label: "Mi Tienda", icon: ShoppingBag, color: "hover:border-blue-500/50 hover:bg-blue-500/10" },
                      { id: "generic", label: "Personal", icon: Globe, color: "hover:border-purple-500/50 hover:bg-purple-500/10" },
                    ].map((item) => {
                      const Icon = item.icon
                      const isSelected = platformType === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPlatformType(item.id)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                            isSelected
                              ? "bg-purple-600/20 border-purple-500 text-white"
                              : `bg-zinc-950 border-zinc-800 text-zinc-400 ${item.color}`
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                      Título o Nombre Interno (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Oferta Masterclass Instagram"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                      Slug Personalizado (Opcional)
                    </label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus-within:border-purple-500 transition">
                      <span className="text-xs text-zinc-500 select-none">/deeplink/</span>
                      <input
                        type="text"
                        placeholder="mi-link"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Tu Correo Electrónico (Para gestionar tus enlaces) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="emprendedor@gmail.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-purple-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-current" />
                      Generar Deep Link de Conversión
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Live Interactive Simulator */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  ¿Cómo funciona el Deep Link?
                </h3>
                <p className="text-xs text-zinc-400 mb-6">
                  Mira la diferencia entre usar un link común (o linktw.in) vs Vibecode DeepLinks.
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 text-left">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
                      <AlertTriangle className="w-4 h-4" /> Link Común de Instagram (Perdiendo Ventas)
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Se abre dentro del navegador interno de Instagram. El usuario NO tiene su cuenta iniciada de Google/YouTube/E-commerce y abandona la página por flojera de iniciar sesión.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-left relative overflow-hidden">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                      <ShieldCheck className="w-4 h-4" /> Con Vibecode DeepLink (100% Conversión)
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      Dispara automáticamente <strong>Chrome / Safari / App Nativa</strong> del teléfono. El usuario ya tiene sesión iniciada, puede suscribirse o comprar con 1 toque.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                <h4 className="text-sm font-bold text-white mb-4">¿Por qué cambiarte de linktw.in a Vibecode?</h4>
                <ul className="space-y-3 text-xs text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>14 Veces más Barato:</strong> Pagas $1 USD/mes en lugar de $14 USD/mes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>3 Enlaces GRATIS:</strong> Prueba la herramienta sin poner tarjeta.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Soporte Android + iOS:</strong> Dispara Chrome en Android y trampolín nativo en iPhone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Código QR Incluido:</strong> Descarga tus códigos QR para folletos o stories.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY LINKS */}
        {activeTab === "my-links" && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Panel de Estadísticas y Mis Enlaces
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Revisa los clics y el número de escapadas del navegador de Instagram que has logrado.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Buscar por tu correo..."
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => fetchUserLinks(userEmail)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition"
                >
                  Cargar
                </button>
              </div>
            </div>

            {userLinks.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
                <LinkIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-zinc-300 mb-2">No se encontraron enlaces creados</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
                  Crea tu primer enlace en la pestaña "Crear Enlace" con tu correo electrónico.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-xs hover:bg-purple-500 transition"
                >
                  Crear Mi Primer Enlace Gratis
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="py-4 px-4">Título / Destino</th>
                      <th className="py-4 px-4">Enlace Corto</th>
                      <th className="py-4 px-4 text-center">Clics Totales</th>
                      <th className="py-4 px-4 text-center">Instagram Bypasses</th>
                      <th className="py-4 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {userLinks.map((link) => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.javiermujica.com"
                      const fullShortUrl = `${origin}/deeplink/${link.slug}`
                      return (
                        <tr key={link.id} className="hover:bg-zinc-800/30 transition">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-white text-sm mb-0.5">{link.title || link.slug}</div>
                            <div className="text-zinc-500 truncate max-w-xs">{link.target_url}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-mono text-purple-300 bg-purple-950/40 border border-purple-500/30 px-2 py-1 rounded">
                              /deeplink/{link.slug}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-sm text-white">
                            {link.clicks_count || 0}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <Zap className="w-3 h-3" />
                              {link.iab_bypass_count || 0}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyToClipboard(fullShortUrl, link.slug)}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                                title="Copiar Enlace"
                              >
                                {copiedSlug === link.slug ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <a
                                href={fullShortUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                                title="Probar Enlace"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CHECKOUT PAYMENT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Activar Suscripción Pro</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Obtén creación ilimitada de Deep Links por solo <strong className="text-emerald-400">$1 USD / mes (~$990 CLP)</strong>
              </p>
            </div>

            <form onSubmit={handleStartCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Correo Electrónico de la Cuenta
                </label>
                <input
                  type="email"
                  required
                  placeholder="tuemail@ejemplo.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Selecciona Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mercadopago")}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition ${
                      paymentMethod === "mercadopago"
                        ? "bg-emerald-950/40 border-emerald-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs text-white">MercadoPago / Webpay</div>
                      <div className="text-[10px] text-zinc-400">Tarjetas de Crédito/Débito ($990 CLP)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition ${
                      paymentMethod === "bank"
                        ? "bg-emerald-950/40 border-emerald-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50"
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Transferencia Bancaria</div>
                      <div className="text-[10px] text-zinc-400">Mercado Pago / BICE ($990 CLP)</div>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === "bank" && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                  <div className="font-bold text-purple-300 mb-1">Datos para Transferencia ($990 CLP):</div>
                  <div><strong>Beneficiario:</strong> Javier Ignacio Mujica Carvajal</div>
                  <div><strong>RUT:</strong> 16.660.933-K</div>
                  <div><strong>Banco:</strong> Mercado Pago (o BICE / MP)</div>
                  <div><strong>Tipo de Cuenta:</strong> Cuenta Vista</div>
                  <div><strong>Número de Cuenta:</strong> <span className="font-mono font-bold text-white bg-purple-900/50 px-1 rounded select-all">1038615486</span></div>
                  <div><strong>Email:</strong> hola@javiermujica.com</div>
                </div>
              )}

              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Pagar $1 USD (~$990 CLP) y Activar Pro
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 mt-16 text-center text-xs text-zinc-500">
        <p>© 2026 Vibecode • Deep Links de alta conversión para Instagram & TikTok.</p>
      </footer>
    </div>
  )
}
