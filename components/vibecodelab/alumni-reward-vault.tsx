"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Rocket,
  CreditCard,
  Bot,
  TrendingUp,
  Award,
  Github,
  PlayCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Gift,
  Star,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"

interface AlumniRewardVaultProps {
  user: {
    id: string
    email: string
    full_name: string
  }
  classes: any[]
  completionPercentage: number
  completedClasses: number
  totalClasses: number
  onSelectClass: (cls: any) => void
}

const WHITE_LABEL_MASTER_PROMPT = `Actúa como un Arquitecto Principal Full-Stack en Next.js 16, Supabase, Cloudflare R2 y Tailwind CSS.

He desbloqueado la Edición Alumni Pro de la suite de javiermujica.com (Vibecode Lab) y quiero personalizarla en modo White-Label para lanzar mi propia plataforma / academia / SaaS bajo mi marca personal.

### Mis Datos de Marca:
- Nombre de mi Marca / Academia: [ESCRIBE AQUÍ TU MARCA]
- Dominio Principal: [EJ: tudominio.com]
- Nicho / Propuesta de Valor: [EJ: Automatización con IA para Clínicas / SaaS B2B / Academia]
- Paleta de Colores Principal: [EJ: Esmeralda y Slate Oscuro]
- Moneda Principal y País: [EJ: CLP / USD - Chile / LATAM]

### Tareas que debes ejecutar paso a paso en el repositorio:
1. **Identidad & Configuración Global (\`lib/vibecode-config.ts\` y \`app/layout.tsx\`)**:
   - Actualiza los metadatos SEO, OpenGraph, títulos, fechas de cohorte, precios de tramos y nombre del programa.
2. **Personalización del Agente Comercial IA (\`app/api/chat/route.ts\`)**:
   - Adapta el \`systemPrompt\` para que actúe como mi clon digital / consultor senior, calificando prospectos de mi nicho y guiándolos al checkout o agendamiento en Google Meet.
3. **Configuración de Base de Datos & Storage (\`scripts/setup-vibecode-platform-db.sql\`)**:
   - Verifica las tablas de alumnos (\`vibecode_profiles\`, \`vibecode_registrations\`, \`vibecode_classes\`, \`vibecode_user_progress\`, \`certificates\`) y genera el checklist exacto de variables \`.env.local\`.
4. **Activación de Pasarelas de Pago**:
   - Deja habilitadas únicamente las pasarelas que usaré en producción (Mercado Pago / Webpay Plus / Flow / PayPal / Transferencia) ocultando las demás en el checkout.`

const UNICORN_SALES_AGENT_PROMPT = `Eres el Consultor Estratégico Senior y Clon Digital de [TU NOMBRE / MARCA].
Tu objetivo es ayudar genuinamente al visitante, diagnosticar su cuello de botella actual y, cuando detectes fit comercial, guiarlo hacia:
1. Inscripción directa en el programa / plataforma (si busca formación práctica y aceleración).
2. Agendamiento de una sesión estratégica en Google Meet (si representa a una empresa que busca implementación a medida).

Reglas de Oro de Conversación (Edición Alumni Pro):
- Nunca respondas con bloques genéricos de más de 4 líneas; usa viñetas claras y cierra siempre con una pregunta de avance (Micro-Compromiso).
- Si pregunta por precios, presenta primero el retorno de inversión (ahorro en licencias mensuales como Skool/Kajabi y 0% de cobro por egress en Cloudflare R2) antes del valor numérico.
- Si detectas una objeción de tiempo o nivel técnico, destaca la metodología de Vibecoding asistido por IA paso a paso.`

const DUAL_AGENT_ARCHITECTURE_SUMMARY = `🏛️ El Imperio Agéntico: Arquitectura Dual (Lean Core + Enterprise Expansion)

1. NÚCLEO LEAN (4 Agentes Esenciales para Squads Ágiles):
- 🧠 El Orquestador / Arquitecto (Claude Opus / Sonnet): Descompone tareas en contratos atómicos. No escribe código masivo.
- ⚡ El Ejecutor de Código (DeepSeek V3 / R1): Escribe código limpio, TypeScript/Python tipado a costo mínimo de tokens.
- 🔍 El Investigador de Documentación: Valida APIs oficiales vigentes y evita código deprecado.
- 🛡️ El Validador / QA de Código: Inspecciona vulnerabilidades OWASP y diseña pruebas unitarias.

2. CAPA DE EXPANSIÓN CORPORATIVA (9 Agentes para Despliegues Enterprise):
- 🏛️ Enterprise Architect: Estándares macro y gobierno multi-cloud (AWS / GCP / Azure).
- 📋 Product Manager / Business Analyst: Historias de usuario técnicas auditables.
- 🔒 Security & Compliance Officer: Normativas bancarias (PCI-DSS, GDPR) y cifrado de datos.
- 👨‍💻 Lead Developer / Tech Lead: Coordinación del sprint y code reviews.
- 🗄️ Backend Specialist: Arquitectura relacional (PostgreSQL/Supabase) y concurrencia.
- 🎨 Frontend / UI-UX Specialist: Sistemas de diseño institucionales y accesibilidad.
- ☁️ DevOps & Infrastructure Engineer: Terraform, Docker/Kubernetes y pipelines CI/CD.
- 🧪 QA & Automated Testing Agent: Pruebas e2e con Playwright y pruebas de estrés con k6.
- 📑 Auditor & Documentation Agent: Trazabilidad, bitácoras y registros ADRs para comités de riesgo.`

export function AlumniRewardVault({
  user,
  classes,
  completionPercentage,
  completedClasses,
  totalClasses,
  onSelectClass
}: AlumniRewardVaultProps) {
  const isAdmin = user.email?.toLowerCase() === "hola@javiermujica.com"
  const [adminPreviewUnlocked, setAdminPreviewUnlocked] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const isUnlocked = completionPercentage >= 100 || adminPreviewUnlocked
  const pendingClasses = classes.filter((c) => !c.completed)

  const handleCopy = async (key: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      toast.success(`¡${label} copiado al portapapeles!`)
      setTimeout(() => setCopiedKey(null), 2500)
    } catch {
      toast.error("No se pudo copiar al portapapeles")
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner: Cofre de Graduación */}
      <div
        className={`rounded-2xl p-6 md:p-8 border shadow-2xl relative overflow-hidden transition-all ${
          isUnlocked
            ? "bg-gradient-to-br from-emerald-950/90 via-slate-900 to-amber-950/70 border-amber-500/50"
            : "bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border-indigo-800/50"
        }`}
      >
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  isUnlocked
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/50 font-bold"
                    : "bg-indigo-950 text-indigo-300 border-indigo-700/60"
                }
              >
                {isUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> BÓVEDA DESBLOQUEADA (100% COMPLETADO)
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> PREMIO DE GRADUACIÓN AL 100%
                  </>
                )}
              </Badge>
              <Badge variant="outline" className="border-emerald-600/50 text-emerald-300 text-xs">
                <Gift className="w-3 h-3 mr-1" /> Exclusivo Alumnos Vibecode Lab
              </Badge>
              {isAdmin && completionPercentage < 100 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAdminPreviewUnlocked(!adminPreviewUnlocked)}
                  className="h-6 text-[11px] border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50"
                >
                  {adminPreviewUnlocked ? "🔒 Ver como Bloqueado" : "👁️ Simular 100% (Admin)"}
                </Button>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {isUnlocked
                ? "🏆 ¡Felicitaciones! Has Desbloqueado la Suite Alumni Pro (Unicorn Edition)"
                : "🏆 Tu Premio por Terminar la Formación: Suite Completa Alumni Pro"}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Liberamos una versión básica de <strong className="text-white">javiermujica.com</strong> para la comunidad pública de GitHub, pero reservamos la{" "}
              <strong className="text-amber-300">Edición Alumni Pro Completa</strong> (con pasarelas LATAM en producción, agentes de cierre comercial, motor SEO automático y showcase oficial) únicamente como recompensa para los alumnos que completan el 100% del programa.
            </p>
          </div>

          {/* Progress Status Box */}
          <div className="w-full lg:w-80 bg-slate-950/90 border border-slate-800 rounded-xl p-5 shrink-0 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado del Cofre
              </span>
              <span
                className={`text-sm font-black ${
                  isUnlocked ? "text-amber-400" : "text-indigo-400"
                }`}
              >
                {completionPercentage}% Completado
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-slate-800" />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {completedClasses} de {totalClasses} clases completadas
              </span>
              {isUnlocked ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Activo
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  Faltan {Math.max(0, totalClasses - completedClasses)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table: Public GitHub Version vs Alumni Pro Edition */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                ¿Por qué tu Edición Alumni Pro vale 10x más que el Repo Público de GitHub?
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                El mundo recibe el esqueleto open-source para aprender; tú recibes la maquinaria comercial lista para facturar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Public Community Column */}
            <div className="p-5 space-y-3 bg-slate-950/30">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                  🌍 Versión Pública (GitHub Community)
                </Badge>
                <span className="text-xs text-slate-500 font-mono">Open Source Lite</span>
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                Boilerplate Base para la Comunidad
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Estructura base de Academia LMS y reproductor de video Cloudflare R2.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Widget de Chatbot genérico sin prompts propietarios de cierre comercial.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Plantilla pensada para desarrolladores que quieren explorar el stack.</span>
                </li>
              </ul>
            </div>

            {/* Alumni Pro Column */}
            <div className="p-5 space-y-3 bg-gradient-to-br from-amber-950/20 via-slate-900 to-emerald-950/20">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold">
                  🏆 Edición Alumni Pro (Tu Premio al 100%)
                </Badge>
                <span className="text-xs text-emerald-400 font-bold">Full Commercial Suite</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Bóveda Comercial Completa + Automatización + Backlink Oficial
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Suite Multi-Pasarela LATAM & Global:</strong> Webpay Plus, Flow.cl, Mercado Pago, PayPal y flujo de abonos/transferencias con aprobación en 1 clic.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cerebro Comercial IA "Unicornio" + Google Calendar:</strong> Mis System Prompts exactos de venta consultiva, seguimiento por email y agendamiento automático en Google Meet.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Motor SEO con IA, Instagram Bot & CRM Kanban:</strong> Generador de artículos optimizados, gestor de Deeplinks UTM y emisión de certificados con QR.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Destacado en el "Wall of Builders" del Repo Público:</strong> Tu MVP graduado aparece con enlace directo en el README oficial de GitHub para recibir tráfico y autoridad.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LOCKED STATE vs UNLOCKED VAULT */}
      {!isUnlocked ? (
        <Card className="bg-slate-900 border-indigo-900/60 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Completa las siguientes clases para abrir tu Bóveda Alumni Pro ({pendingClasses.length} pendientes)
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              En cuanto marques tu última clase como completada, esta bóveda se desbloqueará automáticamente y recibirás tu pase de graduación por correo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-700/60 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-indigo-400 font-semibold">
                      Módulo {cls.module_number}: {cls.module_title}
                    </p>
                    <p className="text-xs font-bold text-white truncate">{cls.title}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onSelectClass(cls)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 shrink-0"
                  >
                    <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Ir a Clase
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* UNLOCKED CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vault Item 1: White-Label Master Prompt */}
            <Card className="bg-slate-900 border-amber-500/40 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                    ⚡ KIT #1 · TRANSFORMACIÓN WHITE-LABEL
                  </Badge>
                  <Terminal className="w-4 h-4 text-amber-400" />
                </div>
                <CardTitle className="text-base font-bold text-white">
                  Prompt Maestro: Clona y Adapta la Plataforma a Tu Marca en 5 Minutos
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Copia este prompt y pégalo en Cursor, Antigravity o Claude Code dentro del repositorio para rebrandear toda la arquitectura a tu propio negocio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {WHITE_LABEL_MASTER_PROMPT}
                </pre>
              </CardContent>
              <CardFooter className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Compatible con Antigravity / Cursor / Windsurf
                </span>
                <Button
                  size="sm"
                  onClick={() =>
                    handleCopy("whitelabel", WHITE_LABEL_MASTER_PROMPT, "Prompt Maestro White-Label")
                  }
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {copiedKey === "whitelabel" ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Prompt White-Label
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Vault Item 2: Unicorn Sales Agent Prompt */}
            <Card className="bg-slate-900 border-emerald-500/40 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                    🤖 KIT #2 · CEREBRO COMERCIAL IA
                  </Badge>
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <CardTitle className="text-base font-bold text-white">
                  System Prompt "Unicornio" de Cierre Consultivo & Agendamiento 24/7
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  La estructura persuasiva de javiermujica.com para que tu chatbot multi-modelo (Claude / DeepSeek / GPT-4o / Gemini) convierta visitas en clientes o reuniones en Google Meet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {UNICORN_SALES_AGENT_PROMPT}
                </pre>
              </CardContent>
              <CardFooter className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ✓ Listo para app/api/chat/route.ts
                </span>
                <Button
                  size="sm"
                  onClick={() =>
                    handleCopy("salesprompt", UNICORN_SALES_AGENT_PROMPT, "System Prompt Comercial")
                  }
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {copiedKey === "salesprompt" ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar System Prompt
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Vault Item 3: Dual Agent Empire Architecture */}
            <Card className="bg-slate-900 border-indigo-500/40 flex flex-col justify-between col-span-1 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px]">
                    🏛️ KIT #3 · ARQUITECTURA MULTI-AGENTE DUAL
                  </Badge>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <CardTitle className="text-base font-bold text-white">
                  El Imperio Agéntico: 4 Agentes Squad Ágil + 9 Agentes Capa Corporativa
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  La estructura de elasticidad agéntica que combina Claude (Arquitecto) + DeepSeek (Ejecutor) + Investigador + QA para tus MVPs, extensible a 9 roles para clientes de banca y grandes corporaciones (AWS/GCP/Azure).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                  {DUAL_AGENT_ARCHITECTURE_SUMMARY}
                </pre>
              </CardContent>
              <CardFooter className="border-t border-slate-800/80 pt-3 flex flex-wrap justify-between items-center gap-2">
                <span className="text-[11px] text-indigo-300 font-semibold">
                  ✓ Documento oficial en docs/ARQUITECTURA_AGENTICA_DUAL.md
                </span>
                <Button
                  size="sm"
                  onClick={() =>
                    handleCopy("agentarch", DUAL_AGENT_ARCHITECTURE_SUMMARY, "Arquitectura Agéntica Dual")
                  }
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {copiedKey === "agentarch" ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Arquitectura Agéntica
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Vault Item 4: Full Pro Modules Blueprint & Wall of Builders */}
          <Card className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-700/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 text-white text-[10px]">
                      🌟 RECOMPENSA DOBLE DE VISIBILIDAD
                    </Badge>
                    <span className="text-xs text-indigo-300 font-semibold">
                      Wall of Builders + Certificado QR
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    Publica tu MVP en el Repositorio Oficial de GitHub + Obtén tu Certificado con QR Verificable
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Como graduado al 100%, tienes derecho a que tu proyecto aparezca en la sección{" "}
                    <strong className="text-white">"Built by Vibecode Alumni"</strong> del README público oficial de GitHub (con backlink directo a tu web o LinkedIn) y a recibir tu diploma oficial con validación criptográfica QR.
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg"
                  >
                    <a
                      href={`mailto:hola@javiermujica.com?subject=${encodeURIComponent(
                        `🏆 Solicitud Bóveda Alumni Pro + Certificado MVP - ${user.full_name}`
                      )}&body=${encodeURIComponent(
                        `Hola Javi,\n\n¡Ya completé el 100% de las clases en Vibecode Lab!\n\nMis datos para el repo Alumni Pro y el Wall of Builders en GitHub:\n- Nombre: ${user.full_name}\n- Usuario de GitHub: @\n- Nombre de mi MVP: \n- URL de mi MVP desplegado: \n\n¡Un abrazo!`
                      )}`}
                    >
                      <Award className="w-4 h-4 mr-1.5" /> Reclamar Acceso Repo Pro & Certificado
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
