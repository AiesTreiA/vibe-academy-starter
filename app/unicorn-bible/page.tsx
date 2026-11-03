"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BookOpen,
  Rocket,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  QrCode,
  Calculator,
  TrendingUp,
  Layers,
  Terminal,
  Flame,
  Award,
  Globe,
  Lock,
  ExternalLink,
  Check,
  AlertCircle,
  CreditCard,
  Coins,
  Megaphone,
  Palette,
  Camera,
  FileText,
  Users,
  BarChart3,
  Cpu,
} from "lucide-react"
import { UNICORN_BIBLE_VOLUMES } from "@/lib/unicorn-bible-config"
import { UnicornTetralogy3D } from "@/components/unicorn-tetralogy-3d"
import { Footer } from "@/components/footer"
import { NeuralNetworkConnector } from "@/components/neural-network-connector"

const ACCENT_STYLES: Record<
  1 | 2 | 3 | 4,
  {
    border: string
    bgGlow: string
    pill: string
    button: string
    text: string
    ring: string
    hex: string
  }
> = {
  1: {
    border: "border-[#3B82F6]/45",
    bgGlow: "from-[#3B82F6]/20 via-indigo-950/35 to-[#040814]",
    pill: "bg-[#3B82F6]/15 text-blue-300 border-[#3B82F6]/40",
    button: "bg-[#3B82F6] hover:bg-blue-500 text-white shadow-blue-600/25",
    text: "text-[#3B82F6]",
    ring: "ring-[#3B82F6]/45",
    hex: "#3B82F6",
  },
  2: {
    border: "border-[#9B72F8]/45",
    bgGlow: "from-[#9B72F8]/20 via-[#EC4899]/15 to-[#040814]",
    pill: "bg-[#9B72F8]/15 text-purple-200 border-[#9B72F8]/40",
    button: "bg-gradient-to-r from-[#9B72F8] to-[#EC4899] hover:opacity-95 text-white shadow-purple-600/25",
    text: "text-[#9B72F8]",
    ring: "ring-[#9B72F8]/45",
    hex: "#9B72F8",
  },
  3: {
    border: "border-emerald-500/45",
    bgGlow: "from-emerald-500/20 via-cyan-950/30 to-[#040814]",
    pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    button: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/25",
    text: "text-emerald-400",
    ring: "ring-emerald-500/45",
    hex: "#10B981",
  },
  4: {
    border: "border-[#F97316]/45",
    bgGlow: "from-[#F97316]/20 via-[#4285F4]/15 to-[#040814]",
    pill: "bg-[#F97316]/15 text-orange-300 border-[#F97316]/40",
    button: "bg-gradient-to-r from-[#F97316] to-[#EC4899] hover:opacity-95 text-slate-950 font-black shadow-orange-500/25",
    text: "text-[#F97316]",
    ring: "ring-[#F97316]/45",
    hex: "#F97316",
  },
}

const ACRONYM_GLOSSARY_ITEMS: {
  sigla: string
  full: string
  category: "infra" | "pitch" | "metricas" | "capital"
  volLabel: string
  meaning: string
  formulaOrBenchmark: string
}[] = [
  {
    sigla: "MRR",
    full: "Monthly Recurring Revenue (Ingreso Recurrente Mensual)",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "Todo el ingreso predecible por suscripciones mensuales que entra cada 30 días. Excluye pagos únicos o consultorías.",
    formulaOrBenchmark: "Net New MRR = New + Expansion + Reactivation − Contraction − Churned",
  },
  {
    sigla: "ARR",
    full: "Annual Recurring Revenue (Ingreso Recurrente Anual)",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "Tu facturación mensual de suscripciones anualizada. Es la métrica reina sobre la cual los fondos aplican múltiplos de valoración.",
    formulaOrBenchmark: "ARR = MRR × 12 · Serie A LatAm: ≥ $1M–$1.5M USD ARR",
  },
  {
    sigla: "ARPU",
    full: "Average Revenue Per User / Account",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "Cuánto dinero te paga en promedio cada cliente o empresa activa al mes.",
    formulaOrBenchmark: "ARPU = MRR Total ÷ Clientes Activos de Pago",
  },
  {
    sigla: "CAC",
    full: "Customer Acquisition Cost (Costo de Adquisición)",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "Cuántos dólares totales gastas en anuncios, marketing y ventas para conseguir 1 cliente nuevo que realmente saca la tarjeta y paga.",
    formulaOrBenchmark: "CAC = Gasto Total Ventas & Marketing ÷ Nuevos Clientes Pagos",
  },
  {
    sigla: "LTV",
    full: "Lifetime Value (Valor de Vida del Cliente)",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "La utilidad bruta acumulada (descontando servidores, IA y pasarela de pago) que te deja un cliente antes de cancelar.",
    formulaOrBenchmark: "LTV = (ARPU × Margen Bruto %) ÷ Gross MRR Churn Mensual · Meta: LTV/CAC > 3x",
  },
  {
    sigla: "NRR / NDR",
    full: "Net Revenue Retention (Retención Neta de Ingresos)",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "Cuánto dinero te facturan hoy los mismos clientes que tenías hace 12 meses (sumando subidas de plan y restando bajas). Si supera 100%, creces aún sin nuevos clientes.",
    formulaOrBenchmark: "Meta B2B SaaS Élite: NRR > 110% anual (Churn Neto Negativo)",
  },
  {
    sigla: "MoM & CMGR",
    full: "Month-over-Month & Compound Monthly Growth Rate",
    category: "metricas",
    volLabel: "Tomo III",
    meaning:
      "El porcentaje de crecimiento mes contra mes. CMGR mide la velocidad compuesta real entre el mes inicial y el mes final.",
    formulaOrBenchmark: "Ritmo Venture-Backable: 15% a 20% de crecimiento mensual sostenido",
  },
  {
    sigla: "SAFE",
    full: "Simple Agreement for Future Equity (Post-Money SAFE)",
    category: "capital",
    volLabel: "Tomo IV",
    meaning:
      "Contrato estándar de 5 páginas creado por Y Combinator para recibir inversión rápida hoy que se transforma en acciones en tu futura ronda con precio, sin intereses ni fecha de vencimiento.",
    formulaOrBenchmark: "% Inversor SAFE = Monto Invertido ÷ Post-Money Valuation Cap",
  },
  {
    sigla: "Cap Table",
    full: "Capitalization Table (Tabla de Capitalización)",
    category: "capital",
    volLabel: "Tomo IV",
    meaning:
      "El mapa maestro que registra qué porcentaje de la empresa pertenece a los fundadores, ángeles, fondos VC y empleados.",
    formulaOrBenchmark: "Regla de Oro: Fundadores deben retener > 85% post Pre-Seed y > 50% en Serie A",
  },
  {
    sigla: "ESOP",
    full: "Employee Stock Option Pool (Reserva de Opciones)",
    category: "capital",
    volLabel: "Tomo IV",
    meaning:
      "Porcentaje de acciones reservado para atraer y retener a los primeros ingenieros y talentos clave mediante Vesting a 4 años con 1 año de Cliff.",
    formulaOrBenchmark: "Reserva estándar en Seed / Serie A: 8% al 12% del Cap Table",
  },
  {
    sigla: "CORFO",
    full: "Corporación de Fomento de la Producción (Equity-Free)",
    category: "capital",
    volLabel: "Tomo II & IV",
    meaning:
      "Agencia chilena que cofinancia startups dinámicas con subsidios no reembolsables (Semilla Inicia, Semilla Expande, Start-Up Chile) sin tomar ni un 1% de tus acciones.",
    formulaOrBenchmark: "0% Dilución · Hasta $17M CLP (Inicia) / $45M CLP (Expande) / $75M CLP (Growth)",
  },
  {
    sigla: "TAM / SAM / SOM",
    full: "Total / Serviceable / Obtainable Market",
    category: "pitch",
    volLabel: "Tomo II",
    meaning:
      "El tamaño de tu oportunidad: TAM es el mercado total, SAM el mercado que tu software puede atender en la región y SOM lo que capturarás en 24–36 meses.",
    formulaOrBenchmark: "Cálculo Bottom-Up obligatorio: N° Empresas Target × Ticket Anual (ACV)",
  },
  {
    sigla: "PLG",
    full: "Product-Led Growth (Crecimiento Impulsado por Producto)",
    category: "pitch",
    volLabel: "Tomo II & III",
    meaning:
      "Arquitectura comercial donde el usuario descubre el valor (Aha! Moment en < 5 min), paga en autoservicio e invita a otros sin requerir vendedores humanos.",
    formulaOrBenchmark: "Reduce el CAC a una fracción y acelera el Payback Period a < 3 meses",
  },
  {
    sigla: "RLS",
    full: "Row Level Security (Seguridad a Nivel de Fila)",
    category: "infra",
    volLabel: "Tomo I",
    meaning:
      "Escudo criptográfico nativo en PostgreSQL/Supabase que garantiza que cada usuario o empresa solo pueda leer y modificar sus propios registros.",
    formulaOrBenchmark: "Auditoría Due Diligence: 100% de tablas públicas con RLS + índices en auth.uid()",
  },
  {
    sigla: "Pooler :6543",
    full: "Connection Pooling en Modo Transacción (Supavisor)",
    category: "infra",
    volLabel: "Tomo I",
    meaning:
      " Administrador de conexiones que presta un canal de base de datos por milisegundos a cada función Serverless, evitando que cientos de usuarios simultáneos tumben el servidor.",
    formulaOrBenchmark: "Puerto 6543 (Consultas Serverless) vs. Puerto 5432 (Migraciones DDL)",
  },
  {
    sigla: "HMAC-SHA256",
    full: "Hash-based Message Authentication Code (Webhooks)",
    category: "infra",
    volLabel: "Tomo I",
    meaning:
      "Firma criptográfica en la cabecera x-signature que verifica que una notificación de pago proviene realmente de Mercado Pago y no de un atacante.",
    formulaOrBenchmark: "Combinar siempre con mp_payment_id UNIQUE para Idempotencia total",
  },
]

export default function UnicornBibleLandingPage() {
  const [activeVol, setActiveVol] = useState<1 | 2 | 3 | 4>(1)
  const [acronymFilter, setAcronymFilter] = useState<"all" | "infra" | "pitch" | "metricas" | "capital">("all")
  const [acronymQuery, setAcronymQuery] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null)

  // Interactive Unit Economics & SAFE Calculator state
  const [arpuUsd, setArpuUsd] = useState(79)
  const [grossMarginPct, setGrossMarginPct] = useState(85)
  const [monthlyChurnPct, setMonthlyChurnPct] = useState(2.5)
  const [cacUsd, setCacUsd] = useState(280)
  const [safeInvestmentUsd, setSafeInvestmentUsd] = useState(150000)
  const [safePostMoneyCapUsd, setSafePostMoneyCapUsd] = useState(1500000)

  // Interactive Tokenized E-Book Growth Pool (RWA Co-Producer Node Simulator)
  const [nodeCount, setNodeCount] = useState(2) // 1 Node = $250 USD Ad-Spend Pool contribution
  const [expectedRoas, setExpectedRoas] = useState(3.2) // 3.2x Ad ROAS
  const [royaltySharePct, setRoyaltySharePct] = useState(40) // 40% net revenue share to Growth Pool until cap

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const st = params.get("status")
    if (st) setPurchaseStatus(st)
  }, [])

  const currentVolume = UNICORN_BIBLE_VOLUMES[activeVol]
  const currentStyle = ACCENT_STYLES[activeVol]

  // Unit Economics Formulas
  const effectiveMonthlyGrossMargin = arpuUsd * (grossMarginPct / 100)
  const ltvUsd =
    monthlyChurnPct > 0 ? Math.round(effectiveMonthlyGrossMargin / (monthlyChurnPct / 100)) : 0
  const ltvCacRatio = cacUsd > 0 ? Number((ltvUsd / cacUsd).toFixed(1)) : 0
  const paybackMonths =
    effectiveMonthlyGrossMargin > 0
      ? Number((cacUsd / effectiveMonthlyGrossMargin).toFixed(1))
      : 0
  const safeDilutionPct =
    safePostMoneyCapUsd > 0
      ? Number(((safeInvestmentUsd / safePostMoneyCapUsd) * 100).toFixed(1))
      : 0

  // Tokenized Growth Pool Formulas
  const nodePriceUsd = 250
  const userPoolContributionUsd = nodeCount * nodePriceUsd
  const adSpendAllocatedUsd = Math.round(userPoolContributionUsd * 0.85) // 85% direct to Meta/LinkedIn Ads
  const grossBookSalesGeneratedUsd = Math.round(adSpendAllocatedUsd * expectedRoas)
  const estimatedCopiesSold = Math.max(1, Math.round(grossBookSalesGeneratedUsd / 49))
  const rawRoyaltyReturnUsd = Math.round(grossBookSalesGeneratedUsd * (royaltySharePct / 100))
  const rbfCapMultiplier = 1.8 // 1.8x Revenue-Based Financing cap so author retains permanent IP
  const cappedPayoutUsd = Math.min(
    Math.round(userPoolContributionUsd * rbfCapMultiplier),
    rawRoyaltyReturnUsd
  )
  const estimatedRoiPct =
    userPoolContributionUsd > 0
      ? Math.round(((cappedPayoutUsd - userPoolContributionUsd) / userPoolContributionUsd) * 100)
      : 0

  const filteredAcronyms = ACRONYM_GLOSSARY_ITEMS.filter((item) => {
    const matchesCat = acronymFilter === "all" || item.category === acronymFilter
    const q = acronymQuery.trim().toLowerCase()
    const matchesQuery =
      !q ||
      item.sigla.toLowerCase().includes(q) ||
      item.full.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q)
    return matchesCat && matchesQuery
  })

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckoutError(null)

    if (!buyerEmail.trim() || !buyerEmail.includes("@")) {
      setCheckoutError("Por favor ingresa un correo electrónico válido para recibir el pack.")
      return
    }

    setIsCheckingOut(true)
    try {
      const res = await fetch("/api/unicorn-bible/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buyerName.trim() || "Founder",
          email: buyerEmail.trim(),
          payment_method: "mercadopago",
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo iniciar el checkout.")
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Error al conectar con Mercado Pago.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#040814] text-[#F8FAFC] selection:bg-[#3B82F6] selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Ambient Auras */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[15%] w-[680px] h-[480px] bg-[#3B82F6]/12 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] right-[-8%] w-[600px] h-[600px] bg-[#9B72F8]/12 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[12%] w-[640px] h-[520px] bg-[#10B981]/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#040814]/85 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/15 flex items-center">
              <span className="font-sans font-black text-lg tracking-tight text-[#F8FAFC] leading-none">
                vibecode
              </span>
              <span className="font-sans font-black text-lg text-[#3B82F6] animate-pulse leading-none">
                _
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-xs tracking-wider text-[#F8FAFC] block leading-none">
                CÓDIGO &amp; <span className="text-[#3B82F6]">CAPITAL</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider block mt-0.5">
                JAVIER MUJICA · TETRALOGÍA OFICIAL
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="#glosario-acronimos"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Glosario de Siglas</span>
            </a>
            <a
              href="#token-growth-pool"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nodos Co-Edición &amp; Regalías</span>
            </a>
            <Link
              href={`/ebook-quiz?vol=${activeVol}&utm_campaign=unicorn_bible`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-blue-300 border border-[#3B82F6]/35 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Quiz SQR-2026</span>
            </Link>
            <a
              href="#founder-pack-checkout"
              className="btn-bootcamp-premium inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#4285F4] via-[#9B72F8] to-[#EC4899] text-white shadow-lg"
            >
              <span>Obtener los 4 Tomos</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 space-y-24">
        {/* PURCHASE STATUS BANNER IF RETURNING FROM MERCADO PAGO */}
        {purchaseStatus === "success" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  PAGO APROBADO · ENTREGA INMEDIATA ACTIVADA
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  ¡Bienvenido a La Biblia Operativa del Squad Moderno!
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              Tu acceso al <strong>Founder Unicorn Pack</strong> está activo. Ahora puedes evaluar tu dominio por tomo en el Quiz Oficial de Lectura y emitir tu credencial <code>SQR-2026-XXX</code>.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/ebook-quiz?vol=1&utm_campaign=unicorn_bible"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm"
              >
                <Rocket className="w-4 h-4" />
                Ir al Examen de Lectura y Emitir SQR-2026
              </Link>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 1. HERO, 3D TETRALOGY SHOWROOM & EL MANIFIESTO DE LA BIBLIA ÁGIL   */}
        {/* ================================================================== */}
        <section className="space-y-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest bg-[#3B82F6]/12 text-blue-300 border border-[#3B82F6]/35">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Tetralogía Oficial · Edición PDF de Alta Calidad + Manuscritos .MD para Vibecoders</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F8FAFC] leading-[1.05] max-w-5xl mx-auto">
              CÓDIGO &amp; CAPITAL:{" "}
              <span className="text-gemini-gradient">
                La Biblia de los Squads Ágiles
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              De <em>localhost</em> a una valoración de Unicornio ($1.000M+ USD): arquitectura SaaS en producción, dramaturgia escénica en 180s, <em>unit economics</em> de sangre e ingeniería de capital con CORFO, Ángeles y VCs.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
              <a
                href="#founder-pack-checkout"
                className="btn-bootcamp-premium w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-[#4285F4] via-[#9B72F8] to-[#EC4899] text-white shadow-xl"
              >
                <span>Adquirir Founder Unicorn Pack ($49.990 CLP)</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href={`/ebook-quiz?vol=${activeVol}&utm_campaign=unicorn_bible`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-sm sm:text-base bg-glassmorphism hover:bg-white/10 text-white border border-white/15 transition-all"
              >
                <QrCode className="w-5 h-5 text-[#3B82F6]" />
                <span>Rendir Quiz &amp; Certificado SQR-2026</span>
              </Link>
            </div>
          </div>

          {/* 3D IMMERSIVE TETRALOGY SHOWROOM (WITH HARDWARE TOGGLE SWITCH) */}
          <UnicornTetralogy3D activeVol={activeVol} onSelectVol={setActiveVol} />

          {/* EL MANIFIESTO CARD WITH NEURAL CONSTELLATION HEADER */}
          <div className="max-w-4xl mx-auto rounded-3xl p-[1px] bg-gradient-to-r from-[#4285F4]/50 via-[#9B72F8]/50 to-[#10B981]/50 shadow-2xl">
            <div className="rounded-3xl bg-[#040814]/95 p-6 sm:p-10 text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-[#3B82F6] font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#3B82F6]" /> EL MANIFIESTO DE LA BIBLIA ÁGIL
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  vibecode_ · Vibe Coding &amp; Capital de Alta Velocidad
                </span>
              </div>

              <blockquote className="space-y-4 text-sm sm:text-base text-slate-200 leading-relaxed border-l-2 border-[#3B82F6] pl-4 sm:pl-6 italic">
                <p>
                  &ldquo;El viejo Venture Capital murió. Durante veinte años te mintieron diciendo que para levantar capital necesitabas pasar seis meses diseñando un PowerPoint, quemar miles de dólares en agencias lentas y rogar por reuniones tomando café con inversionistas.
                </p>
                <p>
                  Bienvenido a la era del <strong className="text-white not-italic">Vibe Coding y el Capital de Alta Velocidad</strong>. Hoy, los equipos y <em>Squads</em> más ágiles del planeta no piden permiso ni levantan rondas con promesas vacías: despliegan arquitecturas serverless en producción en semanas, procesan pagos reales en vivo, automatizan su foso defensivo con agentes de IA y se sientan frente a CORFO, Ángeles y VCs con tracción irrefutable.
                </p>
                <p>
                  Esta tetralogía no es un libro de lectura pasiva; es <strong className="text-blue-300 not-italic">La Biblia Operativa del Squad Moderno</strong>. Es la metodología de levantamiento de capital para startups tecnológicas más ágil creada en la historia: un sistema diseñado para que equipos pequeños de alto rendimiento pasen de <em>localhost</em> a una valoración de Unicornio ($1.000M+ USD) dominando el código, la dramaturgia escénica, los <em>unit economics</em> y la ingeniería financiera sin ceder el control de su compañía.&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 2. INTERACTIVE 4-VOLUME SELECTOR, COVER PREVIEW & CHAPTER INDEX    */}
        {/* ================================================================== */}
        <section className="space-y-8" id="preview-tomos">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3B82F6]">
              ARQUITECTURA EDITORIAL EN 4 DIMENSIONES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Explora los 4 Tomos y su Índice Táctico de Ingeniería &amp; Capital
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Cada volumen incluye diagramas arquitectónicos, código listo para producción, fórmulas financieras y acceso directo en formato <strong>PDF Editorial de Alta Calidad</strong> y <strong>Markdown (.md)</strong> para alimentar a tus agentes de IA.
            </p>
          </div>

          {/* Volume Selector Tabs with Cover Thumbnails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {([1, 2, 3, 4] as const).map((v) => {
              const meta = UNICORN_BIBLE_VOLUMES[v]
              const st = ACCENT_STYLES[v]
              const isSelected = activeVol === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setActiveVol(v)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? `bg-slate-900/95 ${st.border} ring-2 ${st.ring} shadow-xl`
                      : "bg-slate-950/70 border-white/10 opacity-80 hover:opacity-100 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="relative w-14 h-20 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-[#040814]">
                    <Image
                      src={meta.coverImage}
                      alt={meta.shortTitle}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${st.pill}`}>
                      TOMO 0{v}
                    </span>
                    <h3 className="text-sm font-extrabold text-white leading-snug truncate">
                      {meta.shortTitle}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {meta.dimensionLabel} · {meta.chapters.length} caps
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Volume Showcase Card */}
          <div
            className={`rounded-3xl border ${currentStyle.border} bg-gradient-to-br ${currentStyle.bgGlow} p-6 sm:p-10 shadow-2xl space-y-8 transition-all`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-8">
              {/* High-Resolution Realistic Cover Preview */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="relative w-60 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden border border-white/25 shadow-[0_25px_65px_rgba(0,0,0,0.85)] group">
                  <Image
                    src={currentVolume.coverImage}
                    alt={currentVolume.title}
                    fill
                    sizes="280px"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Volume Metadata + Dynamic QR Bridge */}
              <div className="lg:col-span-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${currentStyle.pill}`}>
                      TOMO 0{currentVolume.vol} · {currentVolume.dimensionLabel.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      Incluye PDF de Imprenta + Fuente .MD
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    {currentVolume.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {currentVolume.subtitle}
                  </p>
                </div>

                {/* Dynamic QR Preview Box for Active Volume */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#040814]/90 border border-white/15">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center">
                      <Image
                        src={`/ebooks/qr/vol-${currentVolume.vol}.svg`}
                        alt={`QR Tomo ${currentVolume.vol}`}
                        width={72}
                        height={72}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className={`font-mono font-bold uppercase block ${currentStyle.text}`}>
                        QR Dinámico Impreso en Portada · Tomo {currentVolume.vol}
                      </span>
                      <p className="text-slate-300 max-w-md leading-snug">
                        Conecta el libro físico o Kindle con la plataforma interactiva de validación y emite la credencial verificable <code>SQR-2026</code>.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/go/${currentVolume.vol}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 shrink-0"
                  >
                    <span>Probar /go/{currentVolume.vol}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Direct PDF + Markdown (.md) Download Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={`/ebooks/pdf/${currentVolume.slug}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-extrabold text-white transition-all shadow-lg ${currentStyle.button}`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Descargar PDF Editorial · Tomo 0{currentVolume.vol}</span>
                  </a>
                  <a
                    href={`/ebooks/md/${currentVolume.fileName}`}
                    download={currentVolume.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/15 transition-all"
                  >
                    <Terminal className="w-4 h-4 text-[#10B981]" />
                    <span>Versión .MD (Vibecoders &amp; Agentes IA)</span>
                  </a>
                  <a
                    href="/ebooks/pdf/codigo-y-capital-tetralogia-completa.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>Omnibus 4 Tomos (PDF Completo)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Chapter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentVolume.chapters.map((ch) => (
                <div
                  key={ch.number}
                  className="p-5 rounded-2xl bg-[#040814]/85 border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-mono font-bold ${currentStyle.text}`}>
                        CAPÍTULO 0{ch.number}
                      </span>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                        {ch.durationOrMetric}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {ch.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {ch.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 3. DICCIONARIO MAESTRO DE ACRÓNIMOS (PARA USAR ANTES DE SABER)     */}
        {/* ================================================================== */}
        <section id="glosario-acronimos" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-[#3B82F6]/15 text-blue-300 border border-[#3B82F6]/35">
              <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>CAPÍTULO CERO INCLUIDO EN CADA TOMO · TRADUCTOR DE JERGAS VC &amp; SAAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Diccionario Maestro de Acrónimos y Siglas
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
              No necesitas memorizar siglas financieras ni técnicas antes de empezar. Consulta aquí (y en las primeras páginas de cada tomo) qué significa exactamente cada acrónimo en <strong>10 segundos</strong> para usar la calculadora y el libro desde el minuto uno.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/90 border border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "Todas las Siglas (16)" },
                { id: "metricas", label: "Métricas & Finanzas (MRR, LTV, CAC, NRR)" },
                { id: "capital", label: "Capital & Legal (SAFE, ESOP, CORFO)" },
                { id: "pitch", label: "Pitch & Mercado (TAM, PLG)" },
                { id: "infra", label: "Producción (RLS, Pooler, HMAC)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAcronymFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                    acronymFilter === tab.id
                      ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-md shadow-blue-500/20"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64">
              <input
                type="search"
                value={acronymQuery}
                onChange={(e) => setAcronymQuery(e.target.value)}
                placeholder="Buscar sigla (ej. ARPU, SAFE, NRR)..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#040814] border border-white/15 text-xs font-mono text-white placeholder-slate-500 focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>

          {/* Acronym Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAcronyms.map((item) => (
              <div
                key={item.sigla}
                className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 hover:border-[#3B82F6]/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-black font-mono text-[#3B82F6]">
                      {item.sigla}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {item.volLabel}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">
                    {item.full}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.meaning}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-white/10 text-[11px] font-mono text-emerald-400 leading-snug">
                  {item.formulaOrBenchmark}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================== */}
        {/* 4. INTERACTIVE UNIT ECONOMICS & SAFE CAP TABLE CALCULATOR          */}
        {/* ================================================================== */}
        <section className="space-y-8" id="calculadora-unicornio">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              HERRAMIENTA INTERACTIVA INCLUIDA EN EL PACK (TOMOS III &amp; IV)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Simulador en Vivo: Unit Economics &amp; Dilución SAFE
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Verifica si tu SaaS supera el filtro institucional (LTV/CAC &gt; 3x y Payback &lt; 6 meses) y calcula tu dilución exacta en una ronda Pre-Seed con Post-Money SAFE.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">
                    Parámetros de tu SaaS &amp; Ronda Pre-Seed
                  </h3>
                </div>
                <a
                  href="#glosario-acronimos"
                  className="text-[11px] font-mono text-blue-300 hover:underline"
                >
                  ¿Qué significa cada sigla? ↑
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ARPU Mensual ($ USD)
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    Ingreso promedio por cliente al mes
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={arpuUsd}
                    onChange={(e) => setArpuUsd(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Margen Bruto SaaS (%)
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    % libre tras pagar servidores, IA y pasarela
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={99}
                    value={grossMarginPct}
                    onChange={(e) => setGrossMarginPct(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Gross MRR Churn Mensual (%)
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    % de ingreso mensual que cancela cada mes
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min={0.5}
                    max={25}
                    value={monthlyChurnPct}
                    onChange={(e) => setMonthlyChurnPct(Number(e.target.value) || 0.5)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    CAC Total ($ USD)
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    Costo total por adquirir 1 cliente que paga
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={cacUsd}
                    onChange={(e) => setCacUsd(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 font-semibold mb-1">
                    Inversión SAFE Pre-Seed ($ USD)
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    Capital a levantar en tu ronda inicial
                  </span>
                  <input
                    type="number"
                    step={10000}
                    min={10000}
                    value={safeInvestmentUsd}
                    onChange={(e) => setSafeInvestmentUsd(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-[#3B82F6]/35 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 font-semibold mb-1">
                    Valuation Cap Post-Money ($ USD)
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">
                    Techo máximo de valoración acordado en el SAFE
                  </span>
                  <input
                    type="number"
                    step={100000}
                    min={200000}
                    value={safePostMoneyCapUsd}
                    onChange={(e) => setSafePostMoneyCapUsd(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-[#3B82F6]/35 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Outputs Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-emerald-500/30 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    DIAGNÓSTICO FINANCIERO EN TIEMPO REAL
                  </span>
                  <span
                    className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold ${
                      ltvCacRatio >= 3 && paybackMonths <= 6
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-[#3B82F6]/20 text-blue-300 border border-[#3B82F6]/40"
                    }`}
                  >
                    {ltvCacRatio >= 3 && paybackMonths <= 6
                      ? "✓ GRADO VENTURE CAPITAL"
                      : "⚡ OPTIMIZAR CON PLG"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block">LTV Ajustado por Margen</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ${ltvUsd.toLocaleString("en-US")} USD
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block">Ratio LTV / CAC (Meta &gt; 3x)</span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        ltvCacRatio >= 3 ? "text-emerald-400" : "text-pink-400"
                      }`}
                    >
                      {ltvCacRatio}x
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-xs text-slate-400 block">Payback Period (Meta &lt; 6m)</span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        paybackMonths <= 6 ? "text-emerald-400" : "text-orange-400"
                      }`}
                    >
                      {paybackMonths} meses
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/35">
                    <span className="text-xs text-blue-300 block">Dilución SAFE Post-Money</span>
                    <span className="text-2xl font-black text-[#3B82F6] font-mono">
                      {safeDilutionPct}%{" "}
                      <span className="text-xs font-normal text-slate-300">
                        (Founders: {(100 - safeDilutionPct).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/10 pt-3">
                * Nota legal y metodológica: Cálculos educativos basados en los Tomos III y IV de <em>Código &amp; Capital</em>. No constituyen asesoría legal, tributaria ni de inversión financiera.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 5. TOKENIZED E-BOOK GROWTH POOL & CO-PRODUCER NODES (RWA ENGINE)   */}
        {/* ================================================================== */}
        <section id="token-growth-pool" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>INNOVACIÓN WEB3 &amp; GROWTH · NODOS DE CO-EDICIÓN Y PAUTA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Motor Best-Seller: Nodos Tokenizados de Pauta &amp; Regalías
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
              ¿Cómo convertir una obra técnica en un <strong>Best Seller continental</strong> sin depender de editoriales tradicionales que se quedan con el 85%? Mediante <strong>Nodos de Co-Producción &amp; Ad-Spend Pool</strong>: los miembros financian bloques auditados de pauta publicitaria (Meta, LinkedIn y YouTube Ads) y participan en las regalías por ventas atribuibles hasta un tope de retorno (<em>RBF Cap 1.8x</em>).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Interactive Growth Pool Simulator */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-5 h-5 text-[#3B82F6]" />
                    <h3 className="text-lg font-bold text-white">
                      Simulador de Nodos de Pauta &amp; Regalías (Ad-Spend Pool)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#3B82F6]/15 text-blue-300 border border-[#3B82F6]/30">
                    1 Nodo = $250 USD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Nodos Genesis Adquiridos
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={nodeCount}
                      onChange={(e) => setNodeCount(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      Aporte: ${userPoolContributionUsd.toLocaleString("en-US")} USD
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      ROAS Pauta Directa (Meta/LI)
                    </label>
                    <input
                      type="number"
                      step="0.2"
                      min={1.2}
                      max={8.0}
                      value={expectedRoas}
                      onChange={(e) => setExpectedRoas(Number(e.target.value) || 2.0)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                    <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                      85% directo a Ads (${adSpendAllocatedUsd} USD)
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Revenue Share del Nodo (%)
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={50}
                      value={royaltySharePct}
                      onChange={(e) => setRoyaltySharePct(Number(e.target.value) || 40)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                    <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                      Cap Máximo: {rbfCapMultiplier}x (IP 100% Autor)
                    </span>
                  </div>
                </div>

                {/* Output Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-slate-400 block">Ventas Brutas Impulsadas</span>
                    <span className="text-xl font-black text-white font-mono">
                      ${grossBookSalesGeneratedUsd.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-slate-400 block">Packs Vendidos (Rank)</span>
                    <span className="text-xl font-black text-[#3B82F6] font-mono">
                      +{estimatedCopiesSold} packs
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-300 block">Retorno Estimado Nodo</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      ${cappedPayoutUsd.toLocaleString("en-US")} USD
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#9B72F8]/10 border border-[#9B72F8]/30">
                    <span className="text-[11px] text-purple-200 block">ROI Neto (Tope 1.8x)</span>
                    <span className="text-xl font-black text-purple-300 font-mono">
                      {estimatedRoiPct >= 0 ? `+${estimatedRoiPct}%` : `${estimatedRoiPct}%`}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-mono leading-relaxed border-t border-white/10 pt-3">
                * Arquitectura blindada: En lugar de ceder equity perpetuo ni emitir valores pasivos, el modelo opera mediante <strong>Nodos Comerciales de Distribución &amp; Co-Marketing (RBF Cap 1.8x)</strong> con atribución transparente vía Smart Links y códigos QR únicos.
              </p>
            </div>

            {/* Right: The 3-Layer Regulatory & Growth Architecture */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#3B82F6]/15 via-[#9B72F8]/10 to-[#040814] border border-[#3B82F6]/35 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-300 font-bold block">
                  ESTRUCTURA LEGAL &amp; WEB3 EN 3 CAPAS (CHILE / LATAM)
                </span>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-2xl bg-[#040814]/80 border border-white/10 space-y-1">
                    <div className="font-mono font-bold text-[#3B82F6]">
                      1. Smart Growth Nodes (0% Fricción CMF)
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Licencia comercial de distribución con enlace/QR propio y 40% de comisión automática sobre ventas generadas por la pauta del nodo. Contrato mercantil, no valor financiero pasivo.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#040814]/80 border border-white/10 space-y-1">
                    <div className="font-mono font-bold text-[#9B72F8]">
                      2. Cuentas en Participación (Art. 507 C. Comercio)
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Para tickets mayores de pauta privada: Mujica AI Lab SpA actúa como gestor del pool publicitario y reparte flujos hasta el cap de <code>1.8x</code>, manteniendo el 100% del copyright en tus manos.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#040814]/80 border border-white/10 space-y-1">
                    <div className="font-mono font-bold text-emerald-400">
                      3. Credencial On-Chain / SQR-2026-GENESIS
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Token coleccionable de Co-Productor Ejecutivo que otorga acceso al dashboard de ROAS en vivo, créditos en el libro y voto sobre nuevos tomos.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`mailto:hola@javiermujica.com?subject=${encodeURIComponent(
                  `Postulación Nodo Genesis Co-Edición (${nodeCount} Nodos - $${userPoolContributionUsd} USD)`
                )}&body=${encodeURIComponent(
                  `Hola Javier,\n\nMe interesa reservar ${nodeCount} Nodo(s) Genesis de Co-Edición y Pauta ($${userPoolContributionUsd} USD) para escalar la tetralogía Código & Capital a Best Seller.\n\nMi nombre:\nMi LinkedIn / Empresa:`
                )}`}
                className="w-full py-3.5 px-5 rounded-xl font-mono font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Coins className="w-4 h-4" />
                <span>Reservar {nodeCount} Nodo(s) Genesis de Co-Edición</span>
              </a>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* 6. CHECKOUT DEL FOUNDER UNICORN PACK (MERCADO PAGO)                */}
        {/* ================================================================== */}
        <section id="founder-pack-checkout" className="scroll-mt-24">
          <div className="rounded-3xl p-[1.5px] bg-gradient-to-r from-[#4285F4] via-[#9B72F8] to-[#F97316] shadow-2xl">
            <div className="rounded-3xl bg-[#040814] p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Pack Deliverables */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#3B82F6]/15 text-blue-300 border border-[#3B82F6]/35">
                  <Award className="w-4 h-4 text-[#3B82F6]" />
                  FOUNDER UNICORN PACK · EDICIÓN COMPLETA 2026
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  Todo el Sistema para Pasar de Localhost a una Ronda Financiada
                </h2>

                {/* 4 Mini Cover Strip inside Checkout */}
                <div className="grid grid-cols-4 gap-3 max-w-md">
                  {([1, 2, 3, 4] as const).map((v) => (
                    <div
                      key={v}
                      className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/20 shadow-lg"
                    >
                      <Image
                        src={UNICORN_BIBLE_VOLUMES[v].coverImage}
                        alt={UNICORN_BIBLE_VOLUMES[v].shortTitle}
                        fill
                        sizes="110px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                <ul className="space-y-3 text-sm sm:text-base text-slate-200">
                  {[
                    "Los 4 Tomos completos en PDF Editorial de Alta Calidad + Manuscritos .MD nativos para Vibecoders y agentes de IA.",
                    "Diccionario Maestro de Acrónimos + Guiones literales de las 6 Escenas del Power Pitch Method® (180s) para CORFO, Ángeles y VCs.",
                    "Calculadora de Unit Economics (LTV/CAC, Payback, NRR, Regla del 40%) y Simulador de Cap Table (SAFE Post-Money a Serie B).",
                    "Acceso directo mediante Código QR Dinámico al Examen Interactivo de Lectura (/ebook-quiz) con emisión de credencial pública SQR-2026-XXX verificable en /verify/[id].",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Mercado Pago Checkout Card */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-slate-950 border border-white/15 space-y-6">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-400 block">
                      INVERSIÓN ÚNICA · ACCESO VITALICIO
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      $49.990 <span className="text-base font-normal text-slate-400">CLP</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ~$49 USD
                  </span>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Tu Nombre o Nombre de Founder
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Valentina Rojas"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Correo Electrónico para Entrega Inmediata *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="founder@tu-saas.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="btn-bootcamp-premium w-full py-4 px-6 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-[#4285F4] via-[#9B72F8] to-[#EC4899] text-white shadow-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {isCheckingOut
                        ? "Conectando con Mercado Pago..."
                        : "Comprar con Mercado Pago · Entrega Inmediata"}
                    </span>
                  </button>
                </form>

                <div className="pt-2 text-center space-y-2">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Pago 100% seguro vía Mercado Pago Live &amp; Webhooks Idempotentes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ¿Ya tienes el libro físico o digital?{" "}
                    <Link
                      href="/ebook-quiz?vol=1&utm_campaign=unicorn_bible"
                      className="text-[#3B82F6] underline hover:text-blue-300"
                    >
                      Ingresa aquí al Examen &amp; Certificado SQR-2026
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Neural Bridge Banner before Official Footer */}
        <section className="rounded-3xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              RED NEURONAL ACTIVA · MUJICA AI LAB &amp; VIBECODE_
            </span>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Interactúa con los nodos de conexión o explora el ecosistema completo de consultoría IA y bootcamps en vivo.
            </p>
          </div>
          <div className="w-full md:w-80 h-20 relative overflow-hidden rounded-2xl bg-[#040814] border border-white/10">
            <NeuralNetworkConnector />
          </div>
        </section>
      </main>

      {/* Official Javier Mujica Footer (with interactive NeuralNetworkConnector & Brand Logo) */}
      <Footer />
    </div>
  )
}
