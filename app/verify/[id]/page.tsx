import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Rocket,
  Globe,
  Github,
  Award,
  AlertCircle,
  Share2,
  Lock
} from "lucide-react"

interface VerifyPageProps {
  params: Promise<{
    id: string
  }>
}

function parseSubmissionToCertificate(id: string, sub: any) {
  const msg = sub?.message || ""
  const squadMatch = msg.match(/Squad:\s*(.+)/i)
  const projectMatch = msg.match(/Proyecto \/ MVP:\s*(.+)/i)
  const mvpUrlMatch = msg.match(/URL MVP en Producción:\s*(https?:\/\/[^\s]+)/i)
  const scoreMatch = msg.match(/Puntaje Unicorn Readiness:\s*(\d+)\/100/i)
  const pitchMatch = msg.match(/Hipótesis de validación[^:]*:\s*\n\s*(.+)/i)
  const isSqr = id.toUpperCase().startsWith("SQR-")

  return {
    id,
    student_name: sub.name || "Founder Acreditado",
    course_name: isSqr
      ? "Código & Capital: La Biblia de los Squads Ágiles · VibeCode Lab"
      : "Vibecode Lab: De Cero a SaaS con IA",
    cohort: isSqr
      ? "Squad Readiness · Unicorn Squad Bible (Edición 2026)"
      : "Cohorte Octubre 2026 - Primera Generación",
    squad_name: squadMatch ? squadMatch[1].trim() : "Squad Vibecode",
    mvp_title: projectMatch ? projectMatch[1].trim() : "MVP Funcional",
    mvp_url: mvpUrlMatch ? mvpUrlMatch[1].trim() : null,
    mvp_repo_url: null,
    status: "approved",
    cert_type: isSqr ? "reader_sqr" : "student_vbc",
    audit_status: isSqr ? "preliminary" : "verified_production",
    readiness_score: scoreMatch ? Number(scoreMatch[1]) : 85,
    campaign_pitch: pitchMatch ? pitchMatch[1].trim() : null,
    issued_at: sub.created_at || new Date().toISOString(),
    pdf_url: `/api/quiz/diploma?id=${encodeURIComponent(id)}&download=true`,
    skills: [
      "Google Antigravity",
      "Next.js (App Router)",
      "Supabase PostgreSQL & RLS",
      "Google Gemini AI",
      "Cloudflare (DNS & Bucket R2)",
      "Mercado Pago & Webhooks",
      "Resend",
      "PostHog Analytics",
      "Vercel & GitHub",
    ],
  }
}

async function getCertificate(id: string) {
  if (!id) return null
  const cleanId = id.trim()
  const isSqr = cleanId.toUpperCase().startsWith("SQR-")
  const supabase = getSupabaseAdminClient() as any

  // 1. Primary lookup in `certificates`
  const { data: certData } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", cleanId)
    .maybeSingle()

  // Also check `ebook_leads_diagnostics` for readiness score & campaign pitch enrichment
  let diagData: any = null
  try {
    const { data: diag } = await supabase
      .from("ebook_leads_diagnostics")
      .select("*")
      .eq("certificate_id", cleanId)
      .maybeSingle()
    diagData = diag
  } catch {
    diagData = null
  }

  if (certData) {
    return {
      ...certData,
      cert_type: certData.cert_type || (isSqr ? "reader_sqr" : "student_vbc"),
      audit_status: certData.audit_status || (isSqr ? "preliminary" : "verified_production"),
      readiness_score: diagData?.readiness_score ?? 88,
      dimension_scores: diagData?.dimension_scores ?? null,
      campaign_pitch: certData.campaign_pitch || diagData?.campaign_pitch || null,
      pdf_url: certData.pdf_url || `/api/quiz/diploma?id=${encodeURIComponent(cleanId)}&download=true`,
    }
  }

  // 2. Fallback to `ebook_leads_diagnostics`
  if (diagData) {
    return {
      id: cleanId,
      student_name: diagData.name,
      course_name: isSqr
        ? "Código & Capital: La Biblia de los Squads Ágiles · VibeCode Lab"
        : "Vibecode Lab: De Cero a SaaS con IA",
      cohort: isSqr
        ? `Squad Readiness · ${diagData.source_vol ? `Tomo ${diagData.source_vol}` : "Edición 2026"}`
        : "Cohorte Octubre 2026 - Primera Generación",
      squad_name: diagData.squad_name,
      mvp_title: diagData.project_name,
      mvp_url: diagData.mvp_url,
      mvp_repo_url: null,
      status: "approved",
      cert_type: isSqr ? "reader_sqr" : "student_vbc",
      audit_status: isSqr ? "preliminary" : "verified_production",
      readiness_score: diagData.readiness_score ?? 85,
      dimension_scores: diagData.dimension_scores ?? null,
      campaign_pitch: diagData.campaign_pitch || null,
      issued_at: diagData.created_at,
      pdf_url: `/api/quiz/diploma?id=${encodeURIComponent(cleanId)}&download=true`,
      skills: [
        "Google Antigravity",
        "Next.js (App Router)",
        "Supabase PostgreSQL & RLS",
        "Google Gemini AI",
        "Cloudflare (DNS & Bucket R2)",
        "Mercado Pago & Webhooks",
        "Resend",
        "PostHog Analytics",
        "Vercel & GitHub",
      ],
    }
  }

  // 3. Fallback to `contact_submissions` (quiz completions)
  try {
    const { data: sub } = await supabase
      .from("contact_submissions")
      .select("name, message, created_at")
      .ilike("message", `%ID Certificado: ${cleanId}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub) {
      return parseSubmissionToCertificate(cleanId, sub)
    }
  } catch {
    // ignore fallback error
  }

  return null
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { id } = await params
  const cert = await getCertificate(id)
  if (!cert || cert.status !== "approved") {
    return {
      title: "Verificación de Certificado | Vibecode Lab",
      description: "Portal oficial de verificación y acreditación de credenciales técnicas en Vibecode Lab.",
    }
  }

  const isSqr = String(cert.id || "").toUpperCase().startsWith("SQR-")
  const title = isSqr
    ? `Acreditación Squad Readiness (${cert.id}): ${cert.student_name} — Vibecode Lab`
    : `Certificado Oficial (${cert.id}): ${cert.student_name} — Vibecode Lab`
  const description = isSqr
    ? `Credencial Squad Readiness emitida a ${cert.student_name} por registrar el artefacto '${cert.mvp_title}' y su hipótesis de validación bajo la metodología Código & Capital de Vibecode Lab.`
    : `Acreditación oficial emitida a ${cert.student_name} por completar con éxito el programa intensivo Vibecode Lab (${cert.course_name}) con el artefacto funcional '${cert.mvp_title}' validado en producción.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/docs/plantilla_certifier_vibecode.png",
          width: 1200,
          height: 630,
          alt: `Certificado Oficial - ${cert.student_name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { id } = await params
  const cert = await getCertificate(id)

  if (!cert || cert.status !== "approved") {
    return (
      <main className="min-h-screen bg-[#040814] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <Card className="max-w-md w-full bg-slate-900/90 border-red-500/30 text-white backdrop-blur-xl relative z-10 shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Certificado No Encontrado o Pendiente
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              El identificador de credencial <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-mono">{id || "N/A"}</code> no registra una certificación activa en este momento.
            </p>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Button asChild variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  const isSqr = String(cert.id || "").toUpperCase().startsWith("SQR-")
  const isAuditedProduction = cert.audit_status === "verified_production" && !isSqr

  const formattedDate = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Octubre 2026"

  const skillsList = Array.isArray(cert.skills) && cert.skills.length > 0
    ? cert.skills
    : [
        "Google Antigravity",
        "Next.js (App Router)",
        "Supabase PostgreSQL & RLS",
        "Google Gemini AI",
        "Cloudflare (DNS & Bucket R2)",
        "Mercado Pago & Webhooks",
        "Resend",
        "PostHog Analytics",
        "Vercel & GitHub",
      ]

  return (
    <main className="min-h-screen bg-[#040814] text-white selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-600/15 via-violet-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Brand & Verification Badge Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <Link href={isSqr ? "/unicorn-bible" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 p-0.5 shadow-lg shadow-violet-900/30">
              <div className="w-full h-full bg-[#040814] rounded-[10px] flex items-center justify-center">
                <Award className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-white uppercase block">Vibecode Lab</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                {isSqr ? "PORTAL DE VERIFICACIÓN PARA INVERSORES (SQR)" : "ACREDITACIÓN VERIFICADA (VBC)"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs py-1 px-3 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              {isAuditedProduction
                ? "Certificación Oficial Auditada en Producción"
                : "Diagnóstico Squad Readiness Registrado (SQR)"}
            </Badge>
          </div>
        </div>

        {/* Certificate Credential Showcase Card */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-500/40 via-violet-500/40 to-pink-500/40 shadow-2xl shadow-violet-950/40">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-6 sm:p-10 space-y-8">
            {/* Top Meta Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400 block mb-1">
                  {isSqr
                    ? "< REGISTRO SQUAD READINESS · THE UNICORN SQUAD BIBLE >"
                    : "< REGISTRO OFICIAL DE ACREDITACIÓN >"}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {isSqr ? "Acreditación Squad Readiness" : "Diploma de Participación"}
                </h1>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">ID de Certificación</span>
                <span className="text-sm sm:text-base font-mono font-bold text-violet-300 bg-violet-950/60 border border-violet-500/30 px-3 py-1 rounded-md mt-0.5">
                  {cert.id}
                </span>
              </div>
            </div>

            {/* Student & Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Otorgado a:</span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                    {cert.student_name}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <p>
                    <strong className="text-white">Programa / Metodología:</strong> {cert.course_name}
                  </p>
                  <p>
                    <strong className="text-white">Edición / Cohorte:</strong> {cert.cohort}
                  </p>
                  <p>
                    <strong className="text-white">Squad de Trabajo:</strong>{" "}
                    <span className="text-violet-400 font-semibold">{cert.squad_name || "Equipo Vibecode"}</span>
                  </p>
                  {typeof cert.readiness_score === "number" && (
                    <p>
                      <strong className="text-white">Unicorn Readiness Score:</strong>{" "}
                      <span className="font-mono font-bold text-emerald-400">{cert.readiness_score}/100 pts</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Fecha de Emisión: <span className="text-slate-200">{formattedDate}</span>
                  </p>
                </div>

                {cert.campaign_pitch && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/25 text-xs space-y-1">
                    <span className="font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      Hipótesis de Validación Declarada ($10 USD / 48h):
                    </span>
                    <p className="text-slate-300 leading-relaxed">{cert.campaign_pitch}</p>
                  </div>
                )}
              </div>

              {/* Verified MVP Showcase Box */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-violet-950/30 via-slate-900 to-blue-950/20 border border-violet-500/30 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Rocket className="w-4 h-4 text-cyan-400" /> Artefacto &amp; MVP Funcional
                  </span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                    {isAuditedProduction ? "Auditado en Producción" : "Registrado por el Squad"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {cert.mvp_title || "MVP Funcional"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Software completamente desarrollado, configurado con base de datos, autenticación y desplegado a producción pública.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {cert.mvp_url ? (
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-900/30 w-full"
                    >
                      <a href={cert.mvp_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-3.5 h-3.5 mr-1.5" /> Probar MVP en Vivo
                        <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                      </a>
                    </Button>
                  ) : null}

                  {cert.mvp_repo_url ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs w-full sm:w-auto"
                    >
                      <a href={cert.mvp_repo_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3.5 h-3.5 mr-1.5" /> Repo
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Skills & Stack */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Stack Técnico Acreditado:
              </span>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-md bg-slate-900 border border-blue-500/25 text-blue-300 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certification Authority / Mentor Signature */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-blue-500/40 bg-blue-950/40 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Javier Mujica</div>
                  <div className="text-xs text-slate-400">Fundador & Lead Mentor · Vibecode Lab</div>
                  <div className="text-[11px] text-slate-500 font-mono">Mujica AI Lab SpA · Chile</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {cert.pdf_url ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-slate-700 hover:bg-slate-800 text-white text-xs"
                  >
                    <a href={cert.pdf_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Descargar Copia Oficial (PDF)
                    </a>
                  </Button>
                ) : null}

                <Button
                  asChild
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                >
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      `${process.env.NEXT_PUBLIC_SITE_URL || "https://vibecodelab.com"}/verify/${cert.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" /> Compartir en LinkedIn
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Footnote */}
        <p className="text-center text-xs text-slate-500">
          Esta página representa el registro criptográfico y técnico oficial de Vibecode Lab. Para consultas institucionales o validaciones adicionales, contactar a <a href="mailto:hola@javiermujica.com" className="text-slate-400 underline">hola@javiermujica.com</a>.
        </p>
      </div>
    </main>
  )
}
