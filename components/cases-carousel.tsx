"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, BarChart2, ClipboardList, ExternalLink, Sparkles } from "lucide-react"

interface CaseItem {
  id: number
  title: string
  subtitle: string
  category: string
  color: string
  challenge: string
  solution: string[]
  results: { value: string; label: string; color: string }[]
  icon: any
  logo: string | null
  link?: string
  linkText?: string
}

const cases: CaseItem[] = [
  {
    id: 1,
    title: "VerticApp.pro — Coach de Handstand con IA",
    subtitle: "SaaS de Visión Artificial on-device y análisis biomecánico en tiempo real",
    category: "Visión Artificial & SaaS IA",
    color: "teal",
    link: "https://verticapp.pro",
    linkText: "verticapp.pro",
    challenge:
      "Perfeccionar la vertical gimnástica (handstand) exige corregir en tiempo real ángulos milimétricos (apertura de 180°, retroversión pélvica y neutralidad cervical), imposible de autoevaluar con precisión sin un coach presencial continuo.",
    solution: [
      "Visión por computadora en tiempo real (<16ms) ejecutada 100% on-device en el navegador del usuario.",
      "Algoritmo de análisis cinemático que mide apertura de hombros a 180°, retroversión pélvica y eje cervical.",
      "Feedback auditivo y visual instantáneo durante el hold para corregir la postura en el momento exacto.",
      "Plataforma SaaS completa con pasarela de suscripciones (Mercado Pago), análisis multiangular y portal de mentores.",
    ],
    results: [
      { value: "<16 ms", label: "Inferencia on-device", color: "blue" },
      { value: "99.4%", label: "Precisión cinemática", color: "green" },
      { value: "100%", label: "Privacidad local", color: "purple" },
      { value: "En Vivo", label: "verticapp.pro", color: "teal" },
    ],
    icon: Sparkles,
    logo: "/images/logo-verticapp.svg",
  },
  {
    id: 2,
    title: "SOFIA + Webfleet - Los Castaños",
    subtitle: "Gestión integral de campo de avellanas 230+ hectáreas",
    category: "Agricultura 4.0",
    color: "green",
    challenge:
      "Control manual de labores agrícolas, fugas de recursos y gestión ineficiente de inventario en campo de gran escala.",
    solution: [
      "Implementación de software SOFIA para gestión agrícola",
      "Sistema Webfleet para control de flotas y maquinaria",
      "Trazabilidad completa de labores por hectárea",
      "Control automatizado de inventarios y recursos",
    ],
    results: [
      { value: "+$30M", label: "Ahorro anual", color: "green" },
      { value: "230+", label: "Hectáreas", color: "blue" },
      { value: "-60%", label: "Fugas", color: "orange" },
    ],
    icon: BarChart2,
    logo: null,
  },
  {
    id: 3,
    title: "RPA Beneficios TGR - Progestion",
    subtitle: "Automatización de solicitudes para beneficios de trabajadores en zonas extremas",
    category: "RPA Gubernamental",
    color: "orange",
    challenge: "Proceso manual complejo para solicitar beneficios de trabajadores en zonas extremas ante la TGR.",
    solution: [
      "Automatización completa del llenado de formularios TGR",
      "Validación automática de datos y ubicaciones",
      "Integración con base de datos de nómina",
      "Procesamiento masivo de solicitudes",
    ],
    results: [
      { value: "+$80M", label: "Procesados", color: "orange" },
      { value: "90%", label: "Menos tiempo", color: "green" },
      { value: "100%", label: "Precisión", color: "blue" },
    ],
    icon: BarChart2,
    logo: "/images/logo-progestion.png",
  },
  {
    id: 4,
    title: "Licitación Telemetría ASE",
    subtitle: "Adjudicación programa 'Mi Taxi Eléctrico'",
    category: "Licitaciones Públicas",
    color: "blue",
    challenge: "Competencia en licitación pública para sistema de monitoreo y telemetría de vehículos eléctricos.",
    solution: [
      "Gestión documental especializada",
      "Estudio y resumen de bases técnicas",
      "Maximización de puntaje según criterios",
      "Estrategia competitiva diferenciada",
    ],
    results: [
      { value: "$9.7M", label: "Capital levantado", color: "green" },
      { value: "Adjudicada", label: "Licitación", color: "blue" },
    ],
    icon: BarChart2,
    logo: "/images/logo-antu.png",
  },
  {
    id: 5,
    title: "Automatización RPA en CCU",
    subtitle: "Robot de Proceso Automatizado para licencias médicas",
    category: "RPA Corporativo",
    color: "purple",
    challenge: "Procesamiento manual de licencias médicas con demoras y errores en el área de RRHH.",
    solution: [
      "RPA para captura automática de datos",
      "Integración con API interna y plataforma Imed",
      "Validación automática de documentos",
      "Workflow automatizado de aprobaciones",
    ],
    results: [
      { value: "85%", label: "Menos tiempo", color: "green" },
      { value: "95%", label: "Menos errores", color: "blue" },
      { value: "24/7", label: "Disponibilidad", color: "purple" },
    ],
    icon: BarChart2,
    logo: "/images/logo-ccu.png",
  },
  {
    id: 6,
    title: "Modernización Roboris",
    subtitle: "Transformación digital integral de operaciones",
    category: "Transformación Digital",
    color: "indigo",
    challenge: "Operaciones manuales obsoletas, inventario desorganizado y procesos comerciales ineficientes.",
    solution: [
      "Digitalización de inventario con códigos de barra",
      "Reorganización física de bodega",
      "Actualización de gestión contable",
      "Rediseño de proceso comercial completo",
    ],
    results: [
      { value: "Integral", label: "Modernización", color: "indigo" },
      { value: "100%", label: "Digital", color: "green" },
      { value: "Optimizado", label: "Flujo comercial", color: "blue" },
    ],
    icon: ClipboardList,
    logo: "/images/logo-roboris.png",
  },
]

export default function CasesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    // Cambiado de 5000ms (5 segundos) a 12000ms (12 segundos)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cases.length)
    }, 12000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextCase = () => {
    setCurrentIndex((prev) => (prev + 1) % cases.length)
    setIsAutoPlaying(false)
  }

  const prevCase = () => {
    setCurrentIndex((prev) => (prev - 1 + cases.length) % cases.length)
    setIsAutoPlaying(false)
  }

  const goToCase = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentCase = cases[currentIndex]
  const IconComponent = currentCase.icon

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; accent: string; accentText: string }> = {
      teal: {
        bg: "bg-teal-50/80 dark:bg-teal-950/40",
        text: "text-teal-900 dark:text-teal-300",
        accent: "bg-teal-100 dark:bg-teal-900/40",
        accentText: "text-teal-800 dark:text-teal-300",
      },
      green: {
        bg: "bg-green-50/80 dark:bg-green-900/40",
        text: "text-green-800 dark:text-green-300",
        accent: "bg-green-100 dark:bg-green-900/30",
        accentText: "text-green-700 dark:text-green-400",
      },
      orange: {
        bg: "bg-orange-50/80 dark:bg-orange-900/40",
        text: "text-orange-800 dark:text-orange-300",
        accent: "bg-orange-100 dark:bg-orange-900/30",
        accentText: "text-orange-700 dark:text-orange-400",
      },
      blue: {
        bg: "bg-blue-50/80 dark:bg-blue-900/40",
        text: "text-blue-800 dark:text-blue-300",
        accent: "bg-blue-100 dark:bg-blue-900/30",
        accentText: "text-blue-700 dark:text-blue-400",
      },
      purple: {
        bg: "bg-purple-50/80 dark:bg-purple-900/40",
        text: "text-purple-800 dark:text-purple-300",
        accent: "bg-purple-100 dark:bg-purple-900/30",
        accentText: "text-purple-700 dark:text-purple-400",
      },
      indigo: {
        bg: "bg-indigo-50/80 dark:bg-indigo-900/40",
        text: "text-indigo-800 dark:text-indigo-300",
        accent: "bg-indigo-100 dark:bg-indigo-900/30",
        accentText: "text-indigo-700 dark:text-indigo-400",
      },
    }
    return colorMap[color] || colorMap.green
  }

  const colors = getColorClasses(currentCase.color)

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Case Card */}
      <Card className="overflow-hidden min-h-[400px] border border-slate-300 dark:border-slate-800 shadow-lg">
        <CardHeader className={`${colors.bg} pb-4`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className={`flex items-center gap-2 ${colors.text} text-lg mb-2`}>
                <IconComponent className="h-5 w-5" />
                {currentCase.title}
              </CardTitle>
              <CardDescription className={`${colors.text} opacity-80 text-sm mb-2`}>
                {currentCase.subtitle}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.accent} ${colors.accentText}`}
                >
                  {currentCase.category}
                </div>
                {currentCase.link && (
                  <a
                    href={currentCase.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all duration-200 hover:scale-105"
                  >
                    <span>Visitar {currentCase.linkText || "sitio"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            {currentCase.logo && (
              <div className="flex-shrink-0 bg-white dark:bg-white border border-slate-200 dark:border-slate-200/80 rounded-lg p-2 h-14 w-28 flex items-center justify-center">
                <img
                  src={currentCase.logo}
                  alt={`Logo ${currentCase.title}`}
                  width={112}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary">Desafío</h3>
                <p className="text-sm text-muted-foreground">{currentCase.challenge}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary">Solución Implementada</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {currentCase.solution.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3 text-primary">Resultados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentCase.results.map((result, index) => {
                  const resultColors = getColorClasses(result.color)
                  return (
                    <div key={index} className={`${resultColors.accent} p-3 rounded-lg text-center`}>
                      <div className={`text-lg font-bold ${resultColors.accentText}`}>{result.value}</div>
                      <div className={`text-xs ${resultColors.accentText} opacity-80`}>{result.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" onClick={prevCase} className="flex items-center gap-2 bg-transparent min-h-[38px]">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-1">
          {cases.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCase(index)}
              className="p-2 flex items-center justify-center focus:outline-none min-w-[32px] min-h-[32px]"
              aria-label={`Ir al caso ${index + 1}`}
            >
              <span className={`block h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/40 hover:bg-muted-foreground/60 w-2"
              }`} />
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={nextCase} className="flex items-center gap-2 bg-transparent min-h-[38px]">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">Rotación automática cada 12 segundos</span>
        </div>
      )}

      {/* Case Counter */}
      <div className="text-center mt-2">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} de {cases.length} casos
        </span>
      </div>
    </div>
  )
}
