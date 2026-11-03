"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  Layers,
  Workflow,
  Cloud,
  ShieldCheck,
  TrendingUp,
  Cpu,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Terminal,
  Server,
  Binary,
  Code2,
  Linkedin,
  Mail,
  Zap,
} from "lucide-react"

interface DataEngineeringSectionProps {
  onContactClick?: () => void
}

const TECH_BADGES = [
  { name: "Python", icon: Code2, color: "from-blue-500/20 to-emerald-500/20 text-blue-400 border-blue-500/30" },
  { name: "SQL Avanzado", icon: Database, color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30" },
  { name: "ETL / ELT Pipelines", icon: Workflow, color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30" },
  { name: "Data Modeling", icon: Layers, color: "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30" },
  { name: "BigQuery", icon: Cloud, color: "from-blue-600/20 to-cyan-500/20 text-sky-400 border-sky-500/30" },
  { name: "Databricks", icon: Cpu, color: "from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30" },
  { name: "Cloud Architecture", icon: Server, color: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30" },
  { name: "PostgreSQL / Supabase", icon: Binary, color: "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30" },
  { name: "Data Governance & Quality", icon: ShieldCheck, color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30" },
  { name: "APIs & Integraciones", icon: GitBranch, color: "from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30" },
]

const PILLARS = [
  {
    number: "01",
    title: "Pipelines ETL/ELT & Arquitectura Cloud",
    icon: Workflow,
    color: "emerald",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description:
      "Diseño, orquestación y mantenimiento de flujos de datos confiables y escalables en producción utilizando Python, SQL y arquitecturas modernas en la nube.",
    features: [
      "Orquestación robusta con idempotencia de cargas y manejo de fallos",
      "Pipelines de ingesta multi-fuente (APIs, Webhooks, DBs, archivos)",
      "Procesamiento por lotes y micro-batches optimizados para latencia y coste",
      "Infraestructura cloud serverless y contenerizada (Docker, Cloud Tasks)",
    ],
  },
  {
    number: "02",
    title: "Modelado, Calidad & Gobierno de Datos",
    icon: ShieldCheck,
    color: "cyan",
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    borderHover: "hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description:
      "Estructuración de modelos de datos reutilizables, control de calidad, documentación técnica y trazabilidad de la información para asegurar disponibilidad continua.",
    features: [
      "Modelado dimensional (Star Schema / Snowflake) y normalizado",
      "Reglas de validación automatizada y monitoreo de data drift/anomalías",
      "Catálogo de metadatos, documentación técnica y linaje de datos",
      "Garantía de integridad referencial y consistencia ACID transaccional",
    ],
  },
  {
    number: "03",
    title: "Productos de Datos & Visión de Negocio",
    icon: TrendingUp,
    color: "indigo",
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    borderHover: "hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description:
      "Definición de roadmaps y estrategia de datos junto a stakeholders, habilitando el consumo autónomo (Self-Service) y midiendo el impacto real en la operación.",
    features: [
      "Traducción fluida de objetivos de negocio a especificaciones técnicas de datos",
      "Construcción de Data Marts departamentales listos para consumo autónomo",
      "Reportería operativa y tableros analíticos de alta disponibilidad",
      "Medición de impacto económico, reducción de costos y optimización de ROI",
    ],
  },
]

const EXPERIENCES = [
  {
    role: "Lead Data & Software Engineer",
    company: "Mujica AI Lab SpA",
    badge: "Consultoría & Productos en Producción",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description:
      "Diseño y construcción end-to-end de productos de datos, arquitecturas Cloud y pipelines de ingesta/transformación automatizados en producción para clientes corporativos.",
    achievements: [
      "Arquitectura y despliegue de pipelines de datos desacoplados con ingesta continua, garantizando alta disponibilidad y tolerancia a fallos.",
      "Integración de motores analíticos y orquestación con Python y SQL para procesar flujos de información empresarial con auditoría completa.",
      "Despliegue de microservicios en la nube con monitoreo proactivo de latencia y telemetría de ejecución de pipelines.",
    ],
    tech: ["Python", "SQL Avanzado", "Cloud Architecture (GCP)", "Docker", "FastAPI", "ETL/ELT"],
  },
  {
    role: "Arquitectura de Datos & Backend",
    company: "Plataformas SaaS & Sistemas Transaccionales en Producción",
    badge: "Sistemas Críticos en Producción",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description:
      "Modelado de datos relacional (PostgreSQL/Supabase), diseño de pipelines de eventos, reportería operativa e integraciones mediante APIs para plataformas logísticas y de servicios.",
    achievements: [
      "Diseño e implementación de esquemas relacionales optimizados, particionamiento de tablas, índices compuestos y stored procedures.",
      "Flujos de eventos asíncronos y sincronización bidireccional mediante Webhooks y REST APIs con garantías de idempotencia.",
      "Modelado de modelos analíticos operativos consumibles por dashboards de negocio con tiempos de respuesta sub-segundo.",
    ],
    tech: ["PostgreSQL", "Supabase", "Event Pipelines", "Data Modeling", "REST APIs", "Analytics"],
  },
  {
    role: "Ingeniero de Proyectos (Automatización & Datos)",
    company: "Recursiva",
    badge: "Automatización & Data Ops",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description:
      "Construcción y operación de flujos ETL automatizados y scripts de extracción/integración en producción, conectando múltiples fuentes de datos y optimizando la disponibilidad de información para el negocio.",
    achievements: [
      "Desarrollo de scripts de extracción y transformación de datos desde APIs, ERPs y bases de datos heterogéneas.",
      "Eliminación de silos operativos mediante la centralización de datos en repositorios estructurados para la toma de decisiones.",
      "Reducción drástica del tiempo de entrega de reportería ejecutiva y validación cruzada de consistencia de datos.",
    ],
    tech: ["Python", "ETL Pipelines", "API Integrations", "SQL", "Data Quality", "Automation"],
  },
]

export function DataEngineeringSection({ onContactClick }: DataEngineeringSectionProps) {
  return (
    <section
      id="data-engineering"
      className="py-20 md:py-28 px-4 bg-gradient-to-b from-background via-secondary/20 to-background border-y border-border/60 relative overflow-hidden"
    >
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container max-w-6xl mx-auto space-y-16">
        {/* Header de Sección */}
        <div className="text-center max-w-4xl mx-auto space-y-5 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-sm shadow-sm">
            <Database className="h-3.5 w-3.5 animate-pulse" />
            <span className="tracking-wide uppercase text-[11px]">Especialidad Técnica Principal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Data Engineering &{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Productos de Datos End-to-End
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-balance max-w-3xl mx-auto">
            Ingeniero Civil Industrial (Universidad de Chile) especializado en diseñar, construir y operar
            arquitecturas de datos escalables y pipelines ETL/ELT en producción. Combino una sólida ejecución técnica
            en Python, SQL y entornos Cloud con experiencia real liderando áreas de negocio, lo que me permite traducir
            desafíos comerciales y operativos en productos de datos confiables, gobernados y listos para el consumo
            autónomo.
          </p>
        </div>

        {/* Tech Stack Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Core Technical Stack & Herramientas</span>
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

        {/* Grid de 3 Pilares (Cards) */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Pilares de Ejecución Técnica
            </h3>
            <p className="text-sm text-muted-foreground">
              De la ingesta cruda al autoservicio gobernado en entornos de producción
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

        {/* Experiencia Aplicada en Ingeniería de Datos */}
        <div className="space-y-8">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5" />
              <span>Experiencia Práctica Comprobada</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Trayectoria Aplicada en Ingeniería de Datos
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Implementación de infraestructura, modelado y pipelines que operan actualmente en producción.
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
                      Logros & Entregables:
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
            <h4 className="text-lg sm:text-xl font-bold text-foreground">
              ¿Buscando un perfil de Data Engineering con visión estratégica?
            </h4>
            <p className="text-sm text-muted-foreground">
              Conectemos para conversar sobre pipelines escalables, arquitecturas Cloud o modelos de datos en producción.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
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
              href="https://www.linkedin.com/in/javier-mujica-aa32291a/"
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
export default DataEngineeringSection
