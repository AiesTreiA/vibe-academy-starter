"use client"

import React, { useState } from "react"
import { 
  Calendar, 
  Clock, 
  Mail, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Building, 
  Phone, 
  Sparkles, 
  Eye, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  BarChart3,
  Briefcase,
  ShoppingBag,
  ExternalLink,
  Laptop,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminAgendamientoDemo() {
  const [selectedNiche, setSelectedNiche] = useState<string>("salud-bienestar")
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(0)
  const [demoView, setDemoView] = useState<"sequence" | "booking_simulator">("sequence")

  // Client Simulation State
  const [clientName, setClientName] = useState("Camila Silva")
  const [clientCompany, setClientCompany] = useState("Centro de Salud & Nutrición Vital")
  const [clientEmail, setClientEmail] = useState("camila.silva@nutricionvital.cl")

  // Information per niche (8 categories matching the consultation form)
  const nicheData: Record<string, { label: string; icon: any; title: string; challenge: string; solution: string; result: string; image: string }> = {
    "salud-bienestar": {
      label: "Salud, Psicología & Bienestar",
      icon: Stethoscope,
      title: "Salud, Psicología y Bienestar",
      challenge: "Un profesional de la salud/terapeuta perdía más de 3 horas diarias gestionando reservas por WhatsApp, enviando recordatorios manualmente y atendiendo dudas repetitivas, sufriendo ausencias y cancelaciones de último minuto.",
      solution: "1. Agente conversacional IA capacitado en su protocolo de atención.<br/>2. Sincronización automática de agenda con confirmaciones por WhatsApp.<br/>3. Sistema asistido de resúmenes de sesión y agendamiento 24/7.",
      result: "Redujo inasistencias al 5%, recuperó 15 horas de tiempo libre a la semana y duplicó el volumen de pacientes atendidos sin aumentar su carga laboral.",
      image: "/images/therapist_ia.png"
    },
    "marketing-agencias": {
      label: "Marketing, Agencias & Ventas Digitales",
      icon: BarChart3,
      title: "Marketing, Agencias y Ventas Digitales",
      challenge: "Una agencia/equipo comercial gastaba días calificando prospectos fríos manualmente, creando presupuestos repetitivos y elaborando reportes semanales de desempeño para clientes.",
      solution: "1. Embudo conversacional inteligente con IA para auditar y calificar prospectos 24/7.<br/>2. Generación automática de propuestas personalizadas e integración CRM.<br/>3. Flujo automático de nutrición de prospectos y reportes.",
      result: "Redujeron el tiempo de respuesta a prospectos en un 90%, incrementaron la conversión en un 40% y automatizaron su flujo de captación.",
      image: "/images/seo_agent.png"
    },
    "servicios-profesionales": {
      label: "Servicios Profesionales (Consultoría, Abogados, Contadores)",
      icon: Briefcase,
      title: "Servicios Profesionales (Consultoras, Abogados y Contadores)",
      challenge: "Un estudio profesional perdía decenas de horas semanales recopilando documentación de clientes, redactando borradores iniciales repetitivos y gestionando cobranzas manualmente.",
      solution: "1. Ingesta y lectura asistida por IA de documentos y respaldos de clientes.<br/>2. Generación automática de borradores iniciales de contratos e informes.<br/>3. Flujo automatizado de seguimiento y recordatorios de cobro.",
      result: "Eliminaron el 75% del trabajo administrativo repetitivo y aceleraron la entrega de informes finales de semanas a pocos días.",
      image: "/images/pro_services_ia.png"
    },
    "educacion-academias": {
      label: "Educación, Formación & Cursos Online",
      icon: Laptop,
      title: "Educación, Formación y Cursos Online",
      challenge: "Una academia online recibía cientos de consultas repetitivas sobre contenidos de programas, fechas de clases y métodos de pago, colapsando al equipo de atención al cliente.",
      solution: "1. Asistente IA tutor entrenado con la malla curricular y preguntas frecuentes 24/7.<br/>2. Matrícula automatizada con validación de comprobantes de pago.<br/>3. Calificación proactiva de estudiantes para programas avanzados.",
      result: "Atendieron el 85% de las dudas de inmediato sin intervención humana y aumentaron un 30% las inscripciones de nuevos alumnos.",
      image: "/images/education_ia.png"
    },
    "tecnologia-saas": {
      label: "Tecnología, Software & SaaS",
      icon: Cpu,
      title: "Tecnología, Software y SaaS",
      challenge: "Una empresa de software/SaaS gastaba horas del equipo de desarrollo en soporte Nivel 1 repetitivo, onboarding manual de usuarios y triage de tickets.",
      solution: "1. Agente IA de soporte Nivel 1 integrado a la base de conocimiento y documentación.<br/>2. Onboarding conversacional guiado para nuevos usuarios.<br/>3. Clasificación y derivación inteligente de tickets de alto impacto.",
      result: "Resolvieron el 60% de los tickets al instante sin tocar soporte técnico y aumentaron la retención de usuarios en un 25%.",
      image: "/images/saas_tech_ia.png"
    },
    "agricola-logistica": {
      label: "Sector Agrícola, Campo & Logística",
      icon: TrendingUp,
      title: "Sector Agrícola, Campo y Logística",
      challenge: "Una operación agrícola/logística sufría retrasos por reportes manuales en papel, errores en la consolidación de rutas de flotas y falta de visibilidad en tiempo real de los costos de campo.",
      solution: "1. Integración de datos telemáticos y de campo con IA (SOFIA/Webfleet).<br/>2. Automatización de reportes diarios de eficiencia operacional y combustible.<br/>3. Alertas preventivas directas al equipo de gestión.",
      result: "Eliminaron errores de digitación en un 95% y ahorraron más de 25 horas semanales de gestión administrativa.",
      image: "/images/agri_logistics_ia.png"
    },
    "inmobiliaria": {
      label: "Sector Inmobiliario & Real Estate",
      icon: Building,
      title: "Sector Inmobiliario y Real Estate",
      challenge: "Una corredora/desarrolladora inmobiliaria perdía el 40% de prospectos por no responder fuera del horario de oficina ni agendar visitas a propiedades rápidamente.",
      solution: "1. Asistente IA inmobiliario 24/7 capacitado con el catálogo de propiedades y requisitos.<br/>2. Pre-calificación financiera y filtro automático de compradores interesados.<br/>3. Agendamiento directo de visitas coordinado con la agenda de los ejecutivos.",
      result: "Aumentaron un 50% las visitas agendadas a propiedades y duplicaron el cierre de operaciones en 60 días.",
      image: "/images/real_estate_ia.png"
    },
    "otro": {
      label: "Otro Sector / Industria General",
      icon: ShieldCheck,
      title: "Operaciones y Gestión de Negocios",
      challenge: "Pasaban más de 4 horas al día respondiendo correos repetitivos, agendando citas a mano y transcribiendo datos en hojas de cálculo. El desgaste operativo dejaba escapar clientes valiosos.",
      solution: "1. Agente IA autónomo para pre-calificar prospectos 24/7.<br/>2. Automatización del flujo de seguimiento CRM y cotizaciones instantáneas.<br/>3. Dashboard unificado de métricas operativas.",
      result: "Recuperaron 20+ horas semanales de trabajo manual, aumentaron la tasa de conversión en un 35% y escalaron la atención sin contratar personal extra.",
      image: "/images/lean_processes.png"
    }
  }

  const currentNiche = nicheData[selectedNiche] || nicheData["salud-bienestar"]

  // Quick autofill preset handler for all 8 sectors
  const handleAutofillPreset = (nicheKey: string) => {
    setSelectedNiche(nicheKey)
    if (nicheKey === "salud-bienestar") {
      setClientName("Dra. Valeria Contreras")
      setClientCompany("Clínica Dental Avanzada & Estética")
      setClientEmail("valeria.contreras@clinicavital.cl")
    } else if (nicheKey === "marketing-agencias") {
      setClientName("Martín Morales")
      setClientCompany("Agencia Digital Nexus Growth")
      setClientEmail("martin@nexusgrowth.cl")
    } else if (nicheKey === "servicios-profesionales") {
      setClientName("Abog. Fernando Silva")
      setClientCompany("Estudio Jurídico & Asesores SpA")
      setClientEmail("fsilva@estudiojuridico.cl")
    } else if (nicheKey === "educacion-academias") {
      setClientName("Prof. Camila Torres")
      setClientCompany("Academia de Formación Digital Pro")
      setClientEmail("camila@formacionpro.org")
    } else if (nicheKey === "tecnologia-saas") {
      setClientName("Ing. Diego Alarcón")
      setClientCompany("CloudSystems SaaS Tech")
      setClientEmail("diego@cloudsystems.io")
    } else if (nicheKey === "agricola-logistica") {
      setClientName("Roberto Palma")
      setClientCompany("Logística & Transportes del Pacífico")
      setClientEmail("rpalma@logisticapacifico.cl")
    } else if (nicheKey === "inmobiliaria") {
      setClientName("Gonzalo Reyes")
      setClientCompany("Inmobiliaria & Propiedades Urbano")
      setClientEmail("gonzalo@urbanopropiedades.cl")
    } else {
      setClientName("Matías Fuentes")
      setClientCompany("Operaciones & Servicios Integrales")
      setClientEmail("matias@serviciosintegrales.cl")
    }
  }

  // Sequence email definitions
  const emailsSequence = [
    {
      step: "Correo 1",
      timing: "⚡ Inmediato (Al Agendar)",
      subject: "💡 ¿La IA es solo para gigantes tecnológicos?",
      badge: "Objeción 1: Costo & Complejidad",
      color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
      image: "/images/ai_cost_complexity.png",
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>¡Felicidades por dar el paso de agendar tu sesión estratégica!</p>
          <p>Antes de que nos reunamos, quiero abordar una duda muy común que escucho a diario entre fundadores, directores y profesionales: <em>"Javier, ¿la inteligencia artificial y las automatizaciones no son algo exclusivo de multinacionales con presupuestos de millones de dólares?"</em></p>
          <p className="text-indigo-400 font-bold">La respuesta corta es un NO CATEGÓRICO.</p>
          <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950/80">
            <img src="/images/ai_cost_complexity.png" alt="IA Accesible" className="w-full h-auto object-contain max-h-[460px] mx-auto rounded-xl" />
          </div>
          <p>Hace unos años, implementar un sistema inteligente requería contratar equipos enteros de ingenieros y gastar decenas de miles de dólares. Hoy la realidad ha cambiado drásticamente gracias al paradigma del <strong>Vibecoding</strong> y los modelos autónomos.</p>
          <div className="p-4 rounded-lg bg-slate-900 border-l-4 border-indigo-500 space-y-2">
            <h4 className="font-bold text-indigo-300 text-sm">En nuestra reunión verás soluciones reales:</h4>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
              <li><strong>Cero gastos de infraestructura innecesaria:</strong> Pagas únicamente por las consultas que tus herramientas consuman.</li>
              <li><strong>Integración limpia sobre lo que ya usas:</strong> No necesitas desechar tu software actual; la IA actúa como una capa de superpoderes sobre tu flujo de trabajo.</li>
              <li><strong>Resultados visibles desde la primera semana:</strong> Automatizaciones puntuales que ahorran de 10 a 15 horas operativas a la semana por colaborador.</li>
            </ul>
          </div>
          <p>Mi objetivo en nuestra sesión no es venderte tecnología compleja, sino mostrarte el camino más corto, simple y rentable hacia la eficiencia.</p>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">Un abrazo,<br/><strong className="text-white">Javier Mujica</strong><br/>Consultor en Rediseño de Procesos & IA</p>
        </div>
      )
    },
    {
      step: "Correo 2",
      timing: "⏳ 36 Horas Antes",
      subject: "⚙️ ¿Ordenar o digitalizar primero? El dilema que paraliza empresas",
      badge: "Objeción 2: Orden vs Digitalización",
      color: "border-sky-500/40 text-sky-400 bg-sky-500/10",
      image: "/images/process_digitalization.png",
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>Faltan pocas horas para nuestra reunión estratégica. Hoy quiero hacerte reflexionar sobre una trampa en la que caen el 80% de las empresas al intentar innovar:</p>
          <div className="p-3 rounded bg-slate-900 border border-white/10 italic text-xs text-slate-400">
            "Primero necesito ordenar manualmente todos mis procesos internos antes de atreverme a usar Inteligencia Artificial o automatizar."
          </div>
          <p className="text-sky-400 font-bold">Este razonamiento genera PARÁLISIS POR ANÁLISIS.</p>
          <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950/80">
            <img src="/images/process_digitalization.png" alt="Digitalización de Procesos" className="w-full h-auto object-contain max-h-[460px] mx-auto rounded-xl" />
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border-l-4 border-sky-400 space-y-2">
            <h4 className="font-bold text-sky-300 text-sm">El secreto del rediseño moderno:</h4>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
              <li><strong>La IA como espejo organizador:</strong> Al aplicar herramientas sobre tus flujos actuales, la propia tecnología te revela los cuellos de botella reales.</li>
              <li><strong>Eliminación de la grasa operativa:</strong> No automatizamos el caos; identificamos los 2 o 3 pasos críticos que generan ingresos y los dejamos en piloto automático.</li>
              <li><strong>Sprints de victoria rápida:</strong> Logramos resultados tangibles en días, no en meses.</li>
            </ul>
          </div>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">Preparado para el cambio,<br/><strong className="text-white">Javier Mujica</strong></p>
        </div>
      )
    },
    {
      step: "Correo 3",
      timing: "⏰ 24 Horas Antes",
      subject: `⏰ Mañana es nuestra sesión estratégica: ${clientName} (${currentNiche.title})`,
      badge: "Recordatorio 24 Horas",
      color: "border-indigo-400/40 text-indigo-300 bg-indigo-500/10",
      image: "",
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>Te recuerdo que <strong>mañana</strong> tenemos agendada nuestra sesión de consultoría estratégica de procesos e IA para <strong>{clientCompany}</strong> ({currentNiche.title}).</p>
          <div className="p-5 rounded-xl bg-slate-900 border border-indigo-500/30 text-center space-y-3">
            <Badge className="bg-indigo-600/20 text-indigo-300 border-none text-[10px] uppercase font-bold">🗓️ Detalle de la Cita</Badge>
            <p className="text-base font-bold text-white">Mañana a las 10:00 AM (Hora de Chile)</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8">💻 Enlace de la Reunión (Meet/Zoom)</Button>
              <Button variant="outline" className="border-white/20 text-xs h-8 text-white">📅 Agregar a Google Calendar</Button>
            </div>
          </div>
          <p><strong>¿Qué revisaremos en esta sesión?</strong></p>
          <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
            <li>Mapeo de las tareas operativas que más tiempo le quitan a tu equipo en {currentNiche.title}.</li>
            <li>Identificación de oportunidades inmediatas de automatización con IA.</li>
            <li>Plan de acción recomendado con métricas claras de impacto.</li>
          </ul>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">¡Nos vemos mañana!<br/><strong className="text-white">Javier Mujica</strong></p>
        </div>
      )
    },
    {
      step: "Correo 4",
      timing: "📊 12 Horas Antes",
      subject: "📊 Medir el impacto antes de invertir un solo dólar",
      badge: "Objeción 3: Retorno de Inversión (ROI)",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      image: "/images/roi_measurement.png",
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>Entiendo perfectamente la cautela cuando se trata de evaluar una consultoría o la implementación de nuevas tecnologías. En el mercado actual abundan las promesas vacías.</p>
          <p className="text-emerald-400 font-bold">Si no podemos medir matemáticamente el retorno de inversión (ROI), no tiene sentido implementar.</p>
          <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950/80">
            <img src="/images/roi_measurement.png" alt="Medición de ROI" className="w-full h-auto object-contain max-h-[460px] mx-auto rounded-xl" />
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border-l-4 border-emerald-500 space-y-2">
            <h4 className="font-bold text-emerald-300 text-sm">Evaluamos la tecnología bajo 3 métricas concretas:</h4>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
              <li><strong>Horas Hombre Recuperadas:</strong> Convertimos horas invertidas en tareas aburridas en valor monetario directo.</li>
              <li><strong>Reducción del Error Humano:</strong> Cuantificamos el costo de los descuidos en seguimiento o cotizaciones demoradas.</li>
              <li><strong>Velocidad de Respuesta:</strong> Medimos cómo responder en 2 minutos en lugar de 4 horas aumenta tu conversión en más del 300%.</li>
            </ul>
          </div>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">Saludos cordiales,<br/><strong className="text-white">Javier Mujica</strong></p>
        </div>
      )
    },
    {
      step: "Correo 5",
      timing: "🤝 6 Horas Antes",
      subject: "🤝 Herramientas que ayudan a tu equipo, no que lo reemplazan",
      badge: "Objeción 4: Resistencia del Equipo",
      color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      image: "/images/team_adoption.png",
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>Una preocupación común es: <em>"¿Qué pasará con mi equipo? ¿Se van a resistir al cambio o sentirán temor de que la IA los reemplace?"</em></p>
          <p className="text-purple-400 font-bold">La tecnología solo triunfa si las personas la aman.</p>
          <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950/80">
            <img src="/images/team_adoption.png" alt="Adopción del Equipo" className="w-full h-auto object-contain max-h-[460px] mx-auto rounded-xl" />
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border-l-4 border-purple-500 space-y-2">
            <h4 className="font-bold text-purple-300 text-sm">Beneficios de adopción fluida:</h4>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
              <li><strong>Reducción de Burnout:</strong> Se eliminan las tareas aburridas que generan fatiga mental.</li>
              <li><strong>Enfoque en Alto Valor:</strong> Tu equipo concentra su tiempo en creatividad, estrategia y clientes.</li>
              <li><strong>Empoderamiento Tecnológico:</strong> Se convierten en impulsores de la tecnología al sentir que trabaja para ellos.</li>
            </ul>
          </div>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">¡Falta muy poco para conectarnos!<br/><strong className="text-white">Javier Mujica</strong></p>
        </div>
      )
    },
    {
      step: "Correo 6",
      timing: "🚀 3 Horas Antes",
      subject: `🚀 Caso Real en tu Sector: ${currentNiche.title}`,
      badge: `Caso de Estudio Adaptado: ${currentNiche.title}`,
      color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      image: currentNiche.image,
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>Estamos a muy pocas horas de nuestra reunión. Para que veas exactamente lo que es posible lograr en tu rubro de <strong>{currentNiche.title}</strong> ({clientCompany}), quiero compartirte este caso práctico:</p>
          <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950/80">
            <img src={currentNiche.image} alt={currentNiche.title} className="w-full h-auto object-contain max-h-[460px] mx-auto rounded-xl" />
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border-l-4 border-amber-500 space-y-3">
            <div>
              <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">El Desafío Inicial:</h4>
              <p className="text-xs text-slate-300 mt-0.5">{currentNiche.challenge}</p>
            </div>
            <div>
              <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">La Solución Aplicada:</h4>
              <p className="text-xs text-slate-300 mt-0.5" dangerouslySetInnerHTML={{ __html: currentNiche.solution }} />
            </div>
            <div className="pt-2 border-t border-white/10">
              <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">El Resultado Medible:</h4>
              <p className="text-xs font-bold text-white mt-0.5">{currentNiche.result}</p>
            </div>
          </div>
          <p>En nuestra sesión veremos exactamente cómo estructurar una arquitectura similar adaptada a la escala y metas de tu propio negocio.</p>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">¡Nos vemos en breve!<br/><strong className="text-white">Javier Mujica</strong></p>
        </div>
      )
    },
    {
      step: "Correo 7",
      timing: "⚡ 1 Hora Antes",
      subject: `⚡ Comenzamos en 60 minutos: ${clientName} (${currentNiche.title})`,
      badge: "Recordatorio 1 Hora (Ingreso Directo)",
      color: "border-rose-500/40 text-rose-400 bg-rose-500/10",
      image: "",
      renderBody: () => (
        <div className="space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>Hola <strong>{clientName}</strong>,</p>
          <p>En <strong>exactamente 60 minutos</strong> arrancamos nuestra sesión de consultoría estratégica para <strong>{clientCompany}</strong> ({currentNiche.title}).</p>
          <div className="p-6 rounded-xl bg-slate-900 border border-indigo-500/40 text-center space-y-3">
            <p className="text-xs text-slate-400">Haz clic en el siguiente botón para conectarte a la sala:</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-6 w-full sm:w-auto">
              🔗 UNIRME A LA REUNIÓN AHORA
            </Button>
          </div>
          <p><strong>Recomendaciones finales:</strong></p>
          <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
            <li>Conéctate desde un lugar tranquilo con buena conexión a internet.</li>
            <li>Si es posible, ingresa desde un computador para poder compartir pantalla si lo requerimos.</li>
          </ul>
          <p className="pt-4 border-t border-white/10 text-xs text-slate-400">¡Nos vemos en minutos!<br/><strong className="text-white">Javier Mujica</strong></p>
        </div>
      )
    }
  ]

  const currentEmail = emailsSequence[selectedEmailIndex]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="bg-slate-950/60 border-indigo-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[10px] uppercase font-bold mb-2">
                🌟 Muestra Interactiva de Ventas B2B
              </Badge>
              <CardTitle className="text-xl md:text-2xl font-extrabold text-white">
                Demo de Agendamiento & Secuencia de Nutrición Pre-Reunión
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Usa este simulador en vivo para mostrarle a tus clientes corporativos cómo su empresa aumentará el retorno de conversión y matará objeciones antes de cada consultoría.
              </CardDescription>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-white/10 self-start md:self-auto">
              <Button 
                variant={demoView === "sequence" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setDemoView("sequence")}
                className={`text-xs h-8 ${demoView === "sequence" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Secuencia (7 Correos)
              </Button>
              <Button 
                variant={demoView === "booking_simulator" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setDemoView("booking_simulator")}
                className={`text-xs h-8 ${demoView === "booking_simulator" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Simulador de Agendamiento
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Control Bar: Niche Selector & Client Simulator Fields */}
      <Card className="bg-slate-900/80 border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Niche Selector */}
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Seleccionar Rubro del Cliente (Personaliza Caso de Estudio):
            </Label>
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="bg-slate-950 border-indigo-500/30 text-white text-xs h-9">
                <SelectValue placeholder="Selecciona un rubro" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white text-xs">
                {Object.entries(nicheData).map(([key, data]) => {
                  const Icon = data.icon
                  return (
                    <SelectItem key={key} value={key} className="focus:bg-indigo-600 focus:text-white cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{data.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Client Name Input */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">Nombre del Cliente Prospecto:</Label>
            <Input 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)} 
              className="bg-slate-950 border-white/10 text-white text-xs h-9"
            />
          </div>

          {/* Client Company Input */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-400">Empresa / Proyecto:</Label>
            <Input 
              value={clientCompany} 
              onChange={(e) => setClientCompany(e.target.value)} 
              className="bg-slate-950 border-white/10 text-white text-xs h-9"
            />
          </div>
        </div>

        {/* Quick Auto-Fill Demo Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10 mt-3">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            Auto-llenar Demo en 1-Clic:
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("salud-bienestar")}
            className="text-[11px] h-7 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 font-semibold"
          >
            🩺 Salud (Dra. Valeria)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("marketing-agencias")}
            className="text-[11px] h-7 border-sky-500/40 text-sky-300 hover:bg-sky-500/20 font-semibold"
          >
            📈 Marketing (Agencia Nexus)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("servicios-profesionales")}
            className="text-[11px] h-7 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 font-semibold"
          >
            ⚖️ Servicios (Abog. Silva)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("educacion-academias")}
            className="text-[11px] h-7 border-purple-500/40 text-purple-300 hover:bg-purple-500/20 font-semibold"
          >
            🎓 Educación (Prof. Torres)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("tecnologia-saas")}
            className="text-[11px] h-7 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 font-semibold"
          >
            💻 Tech/SaaS (Ing. Alarcón)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("agricola-logistica")}
            className="text-[11px] h-7 border-green-500/40 text-green-300 hover:bg-green-500/20 font-semibold"
          >
            🌾 Agrícola (R. Palma)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("inmobiliaria")}
            className="text-[11px] h-7 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-semibold"
          >
            🏢 Inmobiliaria (G. Reyes)
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAutofillPreset("otro")}
            className="text-[11px] h-7 border-slate-500/40 text-slate-300 hover:bg-slate-500/20 font-semibold"
          >
            ⚙️ Otro Sector (M. Fuentes)
          </Button>
        </div>
      </Card>

      {/* VIEW 1: SEQUENCE VIEWER */}
      {demoView === "sequence" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timeline List of 7 Emails */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Línea de Tiempo (7 Correos)
              </h3>
              <span className="text-[10px] text-slate-400">Selecciona para previsualizar</span>
            </div>

            <div className="space-y-2">
              {emailsSequence.map((item, idx) => {
                const isSelected = selectedEmailIndex === idx
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedEmailIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 relative overflow-hidden ${
                      isSelected 
                        ? "bg-slate-900 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                        : "bg-slate-950/40 border-white/5 hover:border-white/20 hover:bg-slate-900/40"
                    }`}
                  >
                    <div className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 border ${item.color}`}>
                      {item.step}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white truncate">{item.timing}</span>
                        {idx === 5 && (
                          <Badge className="bg-amber-500/20 text-amber-300 text-[8px] px-1 py-0 border-none">
                            Dinámico
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 truncate font-medium">{item.subject}</p>
                      <p className="text-[10px] text-slate-400">{item.badge}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 self-center text-slate-500 transition-transform ${isSelected ? "text-indigo-400 translate-x-0.5" : ""}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Full Email Preview Screen */}
          <div className="lg:col-span-7">
            <Card className="bg-[#060814] border-white/10 overflow-hidden shadow-2xl">
              {/* Email Client Top Mock Bar */}
              <div className="bg-slate-900 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] text-slate-400 font-mono ml-2">Previsualización de Correo Corporativo</span>
                </div>
                <Badge className="bg-indigo-600/20 text-indigo-300 border-none text-[9px] uppercase font-semibold">
                  {currentEmail.timing}
                </Badge>
              </div>

              {/* Email Envelope Info */}
              <div className="p-4 bg-slate-950/60 border-b border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold w-16">De:</span>
                  <span className="text-white font-medium">Javier Mujica Consultoría &lt;consultoria@javiermujica.com&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold w-16">Para:</span>
                  <span className="text-indigo-300 font-medium">{clientName} &lt;{clientEmail}&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold w-16">Asunto:</span>
                  <span className="text-white font-bold">{currentEmail.subject}</span>
                </div>
              </div>

              {/* Email Rendered Canvas Body */}
              <div className="p-6 max-h-[750px] overflow-y-auto bg-[#060814]">
                {/* Header branding */}
                <div className="text-center pb-4 mb-4 border-b border-white/10">
                  <img src="/images/logo-isotipo.png" alt="Logo" className="h-10 w-auto mx-auto mb-2" />
                  <span className="text-[11px] text-slate-400 tracking-widest uppercase">Javier Mujica | Consultoría en Procesos & IA</span>
                </div>

                {/* Rendered Email Content */}
                {currentEmail.renderBody()}

                {/* Email Footer */}
                <div className="mt-8 pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
                  <p>© 2026 Mujica AI Lab SpA. Todos los derechos reservados.</p>
                  <p className="mt-1">Enviado mediante infraestructura dedicada de Resend & Next.js</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: BOOKING SIMULATOR */}
      {demoView === "booking_simulator" && (
        <Card className="bg-slate-950 border-white/10 p-6 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge className="bg-indigo-600/20 text-indigo-300 border-none text-[10px] uppercase font-bold">
              Experiencia del Cliente
            </Badge>
            <h3 className="text-lg md:text-xl font-bold text-white">
              Simulador del Widget de Agendamiento en la Web
            </h3>
            <p className="text-xs text-slate-400">
              Así es como un prospecto reserva una reunión en menos de 60 segundos en tu sitio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="font-bold text-white text-xs">Elección de Fecha y Hora</h4>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-indigo-300 font-medium">
                  <span>Mañana, 10:00 AM</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">Zona horaria detectada automáticamente: Santiago (UTC-4)</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="font-bold text-white text-xs">Formulario de Diagnóstico</h4>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-white/5 space-y-1 text-[11px] text-slate-300">
                <p><strong>Cliente:</strong> {clientName}</p>
                <p><strong>Empresa:</strong> {clientCompany}</p>
                <p><strong>Sector:</strong> {currentNiche.label}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="font-bold text-white text-xs">Disparo de la Secuencia</h4>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-white/5 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Reserva Confirmada</span>
                </div>
                <p className="text-slate-400">Se dispara el Correo #1 al instante y se agendan los otros 6 según la hora de la cita.</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button onClick={() => setDemoView("sequence")} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6">
              Ver la Secuencia de 7 Correos Generada <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
