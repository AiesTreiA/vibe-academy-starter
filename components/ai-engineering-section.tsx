"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Bot,
  Cpu,
  Workflow,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Terminal,
  Database,
  Cloud,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Server,
  FileCode2,
  Code2,
  Linkedin,
  Mail,
  Download,
  Activity,
  Network,
  Truck,
  Eye,
  BarChart3
} from "lucide-react"

interface AiEngineeringSectionProps {
  onContactClick?: () => void
}

const TECH_BADGES = [
  { name: "Python (Adv)", icon: Code2, color: "from-blue-500/20 to-emerald-500/20 text-blue-400 border-blue-500/30" },
  { name: "TypeScript", icon: FileCode2, color: "from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/30" },
  { name: "Protocolo MCP (Model Context)", icon: Network, color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30" },
  { name: "Multi-Agent Workflows", icon: Bot, color: "from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30" },
  { name: "Sistemas RAG Avanzados", icon: Layers, color: "from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/30" },
  { name: "Hybrid Search (BM25 + pgvector)", icon: Database, color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30" },
  { name: "OpenAI · Claude · Gemini", icon: Sparkles, color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30" },
  { name: "LLMOps & Evals (Ragas)", icon: Activity, color: "from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30" },
  { name: "Guardrails & Output Validation", icon: ShieldCheck, color: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30" },
  { name: "FastAPI & WebSockets", icon: Zap, color: "from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30" },
  { name: "PostgreSQL & Supabase", icon: Server, color: "from-blue-600/20 to-cyan-500/20 text-blue-300 border-blue-500/30" },
  { name: "GCP & AWS (Cloud Run / Tasks)", icon: Cloud, color: "from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/30" },
  { name: "Docker & CI/CD", icon: Terminal, color: "from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/30" },
  { name: "APIs & Webhooks", icon: GitBranch, color: "from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30" },
]

const PILLARS = [
  {
    number: "01",
    title: "Arquitecturas Agénticas, Protocolo MCP & RAG",
    icon: Bot,
    color: "emerald",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description:
      "Diseño y despliegue de sistemas multi-agente autónomos y pipelines RAG de alto rendimiento, optimizados para cero alucinaciones y eficiencia de costes.",
    features: [
      "Ecosistemas de agentes basados en Model Context Protocol (MCP) y ejecución de herramientas dinámicas",
      "Hybrid Search (BM25 + pgvector en Supabase/Postgres) con reranking contextual para grounding factual",
      "Reducción del 35% en consumo de tokens y costes operativos mediante enrutamiento eficiente (Small vs Large LLMs)",
      "Persistencia relacional y vectorial con indexación HNSW para consultas de alta concurrencia",
    ],
  },
  {
    number: "02",
    title: "LLMOps, Calidad Continua & Guardrails",
    icon: ShieldCheck,
    color: "cyan",
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    borderHover: "hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description:
      "Monitoreo riguroso, pipelines de evaluación automatizada y barreras de seguridad para llevar modelos y agentes a producción empresarial confiable.",
    features: [
      "Evaluación continua de calidad (evals con Ragas): fidelidad factual, relevancia semántica y métricas sintéticas",
      "Guardrails de moderación, protección contra prompt injection y filtrado de PII",
      "Control estricto de esquemas estructurados de salida (JSON mode / Pydantic validation)",
      "Observabilidad y tracing end-to-end: latencia, drift, cadenas de razonamiento y tracking de costos por token",
    ],
  },
  {
    number: "03",
    title: "Forward Deployed & Operaciones en Producción",
    icon: Truck,
    color: "indigo",
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    borderHover: "hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description:
      "Traducción directa de la complejidad logística y operativa de los clientes en soluciones técnicas de IA que actúan y resuelven problemas en tiempo real.",
    features: [
      "Interlocución técnica y de negocio fluida con stakeholders y clientes corporativos (Ingeniería Civil Industrial, U. de Chile)",
      "Integración de agentes sobre plataformas existentes mediante APIs REST, Webhooks y microservicios asíncronos",
      "Despliegue rápido de prototipos viables a producción garantizando impacto medible en eficiencia y costos",
      "Experiencia probada en optimización logística y operativa (CCU, Transbank, PROGESTION)",
    ],
  },
]

const EXPERIENCES = [
  {
    role: "Lead AI & Software Engineer",
    company: "Mujica AI Lab SpA",
    period: "MAR 2025 – PRESENTE",
    badge: "Agentes & RAG en Producción",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description:
      "Liderazgo en diseño, construcción y operación end-to-end de asistentes autónomos y ecosistemas agénticos con IA Generativa en producción para clientes de logística, finanzas y analítica.",
    achievements: [
      "Diseño de ecosistemas multi-agente basados en el protocolo MCP (Model Context Protocol), conectando LLMs con bases transaccionales, APIs REST y almacenamiento documental.",
      "Implementación de sistemas RAG avanzados con Hybrid Search (BM25 + pgvector) y reordenamiento contextual (reranking), reduciendo alucinaciones al mínimo y optimizando costos en un 35%.",
      "Establecimiento del framework de LLMOps, data contracts y observabilidad continua (evals de calidad con Ragas, tracking de latencia y drift).",
    ],
    tech: ["Python", "TypeScript", "MCP Protocol", "LangChain", "LlamaIndex", "pgvector", "Ragas", "GCP/AWS"],
  },
  {
    role: "AI Architect & Backend Engineer",
    company: "Plataformas SaaS & Sistemas de Visión / IA en Producción",
    period: "2024 – PRESENTE",
    badge: "VerticApp.pro · En Producción",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description:
      "Arquitecto de VerticApp.pro: SaaS de telemetría y visión artificial en tiempo real para análisis cinemático, diagnóstico biomecánico y feedback asistido por IA.",
    achievements: [
      "Diseño e implementación de pipelines de inferencia multimodal y extracción de keypoints en Edge y microservicios Cloud asíncronos con FastAPI y WebSockets de latencia sub-segundo.",
      "Persistencia de trayectorias y eventos en PostgreSQL / Supabase con soporte relacional y vectorial (indexación HNSW) para alta concurrencia.",
      "Integración de módulos de síntesis mediante LLMs para generar diagnósticos técnicos automatizados y recomendaciones hiperpersonalizadas en JSON estructurado.",
    ],
    tech: ["Python", "TypeScript", "FastAPI", "WebSockets", "Supabase Vector", "PostgreSQL", "OpenAI / Claude"],
  },
  {
    role: "Ingeniero de Automatización & Pipelines de Datos",
    company: "Recursiva",
    period: "MAY 2024 – MAY 2025",
    badge: "Data Pipelines & Operaciones",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description:
      "Desarrollo de pipelines automatizados en Python para ingesta masiva, parsing y normalización de información heterogénea en grandes corporaciones.",
    achievements: [
      "Impacto directo medible: recaudación de más de $80MM CLP en beneficios para clientes (PROGESTION) y reducción del 30% en horas-hombre en áreas de operaciones (CCU).",
      "Construcción de scripts algorítmicos en servidores dedicados para detección temprana de anomalías, auditoría transaccional continua y alertas automáticas (Transbank).",
      "Conexión e integración de sistemas vía APIs, Webhooks y bases de datos relacionales garantizando integridad operativa.",
    ],
    tech: ["Python", "APIs & Webhooks", "Data Pipelines", "SQL", "Linux Servers", "Automation"],
  },
]

export function AiEngineeringSection({ onContactClick }: AiEngineeringSectionProps) {
  return (
    <section
      id="ai-engineering"
      className="py-20 md:py-28 px-4 bg-gradient-to-b from-background via-secondary/20 to-background border-y border-border/60 relative overflow-hidden"
    >
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[280px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container max-w-6xl mx-auto space-y-16">
        {/* Header de Sección */}
        <div className="text-center max-w-4xl mx-auto space-y-5 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-sm shadow-sm">
            <Brain className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span className="tracking-wide uppercase text-[11px]">AI Engineering & Forward Deployed</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Arquitecturas Agénticas, RAG &{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Despliegue de IA en Producción
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            <strong>Ingeniero Civil Industrial (Universidad de Chile)</strong> con sólida experiencia técnica en <strong>Python y TypeScript</strong>, especializado en construir soluciones de IA generativa robustas: agentes autónomos (protocolo MCP), sistemas RAG híbridos (BM25 + pgvector con reranking), pipelines de evaluación y monitoreo (LLMOps con Ragas) y capacidades Forward Deployed para traducir desafíos operativos y logísticos en software que genera impacto medible desde el primer día.
          </p>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
              <div className="text-2xl font-black text-emerald-400 font-mono">10+</div>
              <div className="text-xs text-muted-foreground mt-0.5">Años Trayectoria</div>
            </div>
            <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
              <div className="text-2xl font-black text-cyan-400 font-mono">-35%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Costos Token / RAG</div>
            </div>
            <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
              <div className="text-2xl font-black text-indigo-400 font-mono">MCP</div>
              <div className="text-xs text-muted-foreground mt-0.5">Model Context Protocol</div>
            </div>
            <div className="p-3 rounded-xl bg-card/60 border border-border/60 text-center">
              <div className="text-2xl font-black text-teal-400 font-mono">U. Chile</div>
              <div className="text-xs text-muted-foreground mt-0.5">Ing. Civil Industrial</div>
            </div>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Core Technical Stack & Herramientas de IA</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {TECH_BADGES.map((badge) => {
              const Icon = badge.icon
              return (
                <div
                  key={badge.name}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r ${badge.color} border backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default select-none`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grid de 3 Pilares */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Pilares de Ingeniería de IA & Despliegue
            </h3>
            <p className="text-sm text-muted-foreground">
              Desde el diseño del agente y el context grounding hasta la observabilidad y el impacto operativo
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <Card
                  key={pillar.number}
                  className={`relative flex flex-col justify-between h-full bg-card/60 backdrop-blur-sm border border-border/70 ${pillar.borderHover} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl overflow-hidden group`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  <CardHeader className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl border ${pillar.iconBg}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-3xl font-black text-muted/40 font-mono tracking-tighter">
                        {pillar.number}
                      </span>
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-bold leading-snug group-hover:text-emerald-400 transition-colors">
                      {pillar.title}
                    </CardTitle>

                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 relative z-10 pt-0">
                    <div className="border-t border-border/50 pt-4 space-y-2.5">
                      {pillar.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Experiencia Aplicada en IA en Producción */}
        <div className="space-y-8">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5" />
              <span>Experiencia Práctica Comprobada</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Trayectoria en Sistemas Agénticos & Software en Producción
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Implementación de soluciones de IA con impacto cuantificable en clientes corporativos y plataformas SaaS activas.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {EXPERIENCES.map((exp, idx) => (
              <Card
                key={idx}
                className="flex flex-col justify-between h-full bg-card/70 backdrop-blur-sm border border-border/70 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${exp.badgeColor}`}>
                      {exp.badge}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                      {exp.period}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-foreground leading-tight">{exp.role}</h4>
                    <p className="text-sm font-medium text-emerald-400 mt-0.5">{exp.company}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2 border-t border-border/50 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Logros & Entregables Clave:
                    </p>
                    <ul className="space-y-2">
                      {exp.achievements.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-xs text-muted-foreground leading-normal">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                    {exp.tech.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-secondary/80 border border-border/60 text-muted-foreground font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call To Action Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-card to-cyan-950/40 border border-emerald-500/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Scaleup Ready · AI Engineer & Forward Deployed</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-foreground">
              ¿Buscando un AI Engineer con visión estratégica y rigor técnico?
            </h4>
            <p className="text-sm text-muted-foreground max-w-xl">
              Hablemos sobre arquitecturas agénticas, optimización logística con IA, observabilidad con LLMOps o integraciones en producción.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="/CV_Javier_Mujica_AI_Engineer_Buk.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="CV_Javier_Mujica_AI_Engineer.pdf"
            >
              <Button variant="outline" className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-semibold">
                <Download className="h-4 w-4" />
                <span>Descargar CV (PDF)</span>
              </Button>
            </a>
            {onContactClick ? (
              <Button
                onClick={onContactClick}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Contactar</span>
              </Button>
            ) : (
              <a href="#contacto">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Contactar</span>
                </Button>
              </a>
            )}
            <a
              href="https://www.linkedin.com/in/javier-mujica"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2 border-border/80 hover:bg-secondary/60">
                <Linkedin className="h-4 w-4 text-sky-400" />
                <span>LinkedIn</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AiEngineeringSection
