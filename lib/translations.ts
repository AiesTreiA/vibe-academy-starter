export type Locale = "es" | "en"

export interface TranslationDictionary {
  meta: {
    title: string
    description: string
    ogDescription: string
    keywords: string[]
  }
  nav: {
    home: string
    aiEngineering: string
    dataEngineering: string
    services: string
    optimization: string
    freeResources: string
    experience: string
    clients: string
    caseStudies: string
    faq: string
    contact: string
    articles: string
    ebooks: string
    bootcamp: string
    themeDark: string
    themeLight: string
    openMenu: string
    closeMenu: string
    switchLanguage: string
  }
  hero: {
    badge: string
    focusLabel: string
    aiRole: string
    dataRole: string
    aiTitle: string
    aiSubtitle: string
    aiCtaAudit: string
    aiCtaSchedule: string
    aiCtaExplore: string
    dataTitle: string
    dataSubtitle: string
    dataCtaAudit: string
    dataCtaSchedule: string
    dataCtaExplore: string
  }
  services: {
    sectionTitle: string
    sectionSubtitle: string
    items: Array<{
      id: string
      title: string
      description: string
      detailedDescription: string
      features: string[]
      benefits: string[]
      methodology: Array<{ step: string; desc: string }>
    }>
  }
  freeResources: {
    badge: string
    title: string
    subtitle: string
    auditTitle: string
    auditDesc: string
    auditCvLabel: string
    auditJdLabel: string
    auditButton: string
    auditAuditing: string
    roiTitle: string
    roiDesc: string
    roiHoursLabel: string
    roiRateLabel: string
    roiMonthlySavings: string
    roiAnnualSavings: string
    roiDownload: string
    prinergiaTitle: string
    prinergiaDesc: string
    prinergiaSimulate: string
    prinergiaResultSuccess: string
    prinergiaRegisterInterest: string
    prinergiaInterestedBtn: string
    prinergiaRegisteredMsg: string
    kanbanTitle: string
    kanbanDesc: string
    kanbanDownload: string
  }
  faq: {
    badge: string
    title: string
    subtitle: string
    items: Array<{ q: string; a: string }>
  }
  contact: {
    badge: string
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    companyLabel: string
    companyPlaceholder: string
    serviceLabel: string
    serviceOptions: Array<{ value: string; label: string }>
    messageLabel: string
    messagePlaceholder: string
    submitBtn: string
    submittingBtn: string
    successTitle: string
    successDesc: string
    errorTitle: string
    errorDesc: string
    calendarNotice: string
    scheduleCallBtn: string
  }
}

export const translations: Record<Locale, TranslationDictionary> = {
  es: {
    meta: {
      title: "Javier Mujica · Consultor en IA y Automatización de Procesos | Chile",
      description:
        "Ingeniero Civil Industrial (U. de Chile) especializado en automatización RPA, IA aplicada y rediseño de procesos. He optimizado operaciones para CCU, Transbank y Antü Energía. Método flexible, neurodivergent-friendly y enfocado en resultados.",
      ogDescription:
        "Automatizo procesos con IA y RPA para empresas y profesionales en Chile. Clientes: CCU, Transbank, Antü Energía y más. Resultados desde el primer mes.",
      keywords: [
        "consultoría en automatización Chile",
        "RPA Python",
        "optimización de procesos",
        "transformación digital PYME",
        "IA aplicada a negocios",
        "consultor neurodivergent-friendly",
        "altas capacidades productividad",
        "ingeniero civil industrial Chile",
        "Javier Mujica consultor",
      ],
    },
    nav: {
      home: "Inicio",
      aiEngineering: "AI Engineering",
      dataEngineering: "Data Engineering",
      services: "Servicios",
      optimization: "Optimización",
      freeResources: "Recursos Gratis",
      experience: "Experiencia",
      clients: "Clientes",
      caseStudies: "Casos de Éxito",
      faq: "FAQ",
      contact: "Contacto",
      articles: "Artículos",
      ebooks: "E-Books",
      bootcamp: "🚀 Bootcamp",
      themeDark: "Cambiar a modo oscuro",
      themeLight: "Cambiar a modo claro",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      switchLanguage: "Switch to English",
    },
    hero: {
      badge: "Nuevo en portafolio: VerticApp.pro · Coach de Handstand con IA",
      focusLabel: "Enfoque Profesional:",
      aiRole: "AI Engineer",
      dataRole: "Data Engineer",
      aiTitle: "Consultoría en Inteligencia Artificial Aplicada y Automatización",
      aiSubtitle:
        "Transformo operaciones complejas en sistemas ágiles y autónomos mediante flujos de IA, agentes inteligentes y RPA. Ingeniero Civil Industrial (U. de Chile) con experiencia en CCU, Transbank y startups de alto impacto.",
      aiCtaAudit: "Auditoría Gratuita",
      aiCtaSchedule: "Agendar Llamada",
      aiCtaExplore: "Explorar Soluciones",
      dataTitle: "Data Engineering & Pipelines Confiables para Escalar",
      dataSubtitle:
        "Diseño arquitecturas de datos sólidas, pipelines ETL/ELT resilientes y modelos analíticos que convierten datos desordenados en ventajas competitivas cuantificables.",
      dataCtaAudit: "Auditar mis Datos",
      dataCtaSchedule: "Agendar Sesión Técnica",
      dataCtaExplore: "Ver Arquitecturas",
    },
    services: {
      sectionTitle: "Servicios Especializados",
      sectionSubtitle:
        "Soluciones a la medida diseñadas para multiplicar tu productividad operativa y estratégica.",
      items: [
        {
          id: "rediseno",
          title: "Rediseño de Procesos",
          description:
            "Analizo y optimizo tus flujos de trabajo cotidianos para eliminar ineficiencias de raíz. Si buscas simplificar tus operaciones diarias, liberar tiempo mental y reducir el estrés administrativo, diseño una estructura ágil que se adapte perfectamente a tus necesidades reales.",
          detailedDescription:
            "Cuando los flujos de trabajo se vuelven obsoletos o desestructurados, se genera fricción mental y operativa. Analizo cada paso de tu día a día, identifico redundancias y diseño un flujo simplificado, visual y ágil. Usando metodologías adaptativas y tableros kanban dinámicos, transformo el caos en un ritmo fluido y predecible.",
          features: [
            "Mapeo de procesos actuales",
            "Identificación de cuellos de botella",
            "Implementación de mejoras ágiles",
          ],
          benefits: [
            "Liberación de hasta un 30% de tu tiempo operativo semanal.",
            "Mayor enfoque y concentración, reduciendo el context-switching.",
            "Claridad absoluta en prioridades y entregas diarias.",
          ],
          methodology: [
            { step: "1. Diagnóstico Inicial", desc: "Mapeamos el estado actual sin fricciones ni juicios." },
            { step: "2. Detección de Cuellos de Botella", desc: "Encontramos los puntos de fuga de energía y tiempo." },
            { step: "3. Co-diseño", desc: "Diseñamos un nuevo flujo adaptado a tu estilo de trabajo." },
            { step: "4. Implementación y Ajuste", desc: "Acompañamiento continuo durante las primeras semanas." },
          ],
        },
        {
          id: "automatizacion",
          title: "Automatización & RPA",
          description:
            "Conecto tus herramientas y delego tareas repetitivas en sistemas inteligentes usando integraciones de APIs (Make, Zapier, n8n) y bots personalizados (Python/Go). Automatizo desde gestión administrativa hasta flotas y telemetría.",
          detailedDescription:
            "La automatización no es solo para empresas gigantes. Con herramientas modernas de automatización de APIs y bots a medida (RPA con Python o Go), conecto tus aplicaciones y delego tareas mecánicas como sincronizar inventarios, extraer datos de facturas, enviar notificaciones automáticas o coordinar operaciones.",
          features: [
            "Implementación de RPA (Python, Selenium, Go)",
            "Integraciones avanzadas de APIs (Make, Zapier, n8n)",
            "Automatización de operaciones y reportería",
          ],
          benefits: [
            "Cero errores manuales en procesos críticos.",
            "Operación continua 24/7 sin esfuerzo adicional.",
            "Reducción del tiempo de procesamiento de horas a segundos.",
          ],
          methodology: [
            { step: "1. Selección de Candidatos", desc: "Elegimos las tareas más repetitivas y con mayor volumen." },
            { step: "2. Desarrollo e Integración", desc: "Creamos los flujos automatizados conectando tus herramientas." },
            { step: "3. Pruebas de Resiliencia", desc: "Mecanismos de respaldo y alertas en caso de incidencias." },
            { step: "4. Monitoreo", desc: "Aseguramos la estabilidad continua del flujo." },
          ],
        },
        {
          id: "consultoria",
          title: "Consultoría Estratégica",
          description:
            "Asesoría especializada para la mejora continua y optimización operativa. Metodología 100% adaptativa, diseñada tanto para equipos corporativos como para perfiles creativos y mentes neurodivergentes.",
          detailedDescription:
            "Las consultorías tradicionales suelen fallar porque proponen metodologías rígidas e inhumanas. Mi enfoque es adaptativo: partimos del respeto a tus ritmos biológicos, estilo cognitivo (altas capacidades, TDAH, pensamiento no lineal) y cultura de equipo. Definimos objetivos claros y te guiamos con metodologías visuales y ligeras.",
          features: [
            "Diagnóstico organizacional",
            "Estrategias de mejora continua",
            "Acompañamiento neurodivergent-friendly",
          ],
          benefits: [
            "Estrategias que respetan tus niveles de energía diarios.",
            "Disminución de la frustración y la sobrecarga mental.",
            "Estructuración de metas de negocio de manera visual y clara.",
          ],
          methodology: [
            { step: "1. Alineación Cognitiva", desc: "Entendemos la dinámica y motivación de tu equipo." },
            { step: "2. Planificación Visual", desc: "Hojas de ruta sencillas y tableros con códigos de color." },
            { step: "3. Seguimiento Empático", desc: "Sesiones cortas enfocadas en destrabar bloqueos." },
            { step: "4. Iteración Continua", desc: "Ajustamos según lo que funcione en el mundo real." },
          ],
        },
        {
          id: "marca-personal",
          title: "Automatización para Profesionales",
          description:
            "Mentoría y estructura digital para terapeutas, psicólogos y consultores que desean expandir su práctica sin abrumarse. Automatizo agendamiento, cobros y seguimiento con un enfoque humano.",
          detailedDescription:
            "Si vendes tu conocimiento o terapia, tu activo más valioso es tu tiempo y empatía. Automatizar el agendamiento, la facturación y los recordatorios te permite enfocarte en tus pacientes. Implementamos un sistema que recibe a tus clientes con calidez y automatiza las tareas mecánicas de forma profesional.",
          features: [
            "Automatización de agendas y recordatorios",
            "Pasarelas de cobro e integración contable",
            "Ecosistema digital adaptativo",
          ],
          benefits: [
            "Tus clientes agendan según tu disponibilidad real sin cruces de mensajes.",
            "Profesionalización inmediata de tu marca personal.",
            "Reducción del estrés por cobranzas mediante automatizaciones seguras.",
          ],
          methodology: [
            { step: "1. Diseño del Viaje del Cliente", desc: "Mapeamos el flujo desde que te contactan hasta la sesión." },
            { step: "2. Selección de Herramientas", desc: "Plataformas fáciles de usar (Calendly, Stripe, WhatsApp)." },
            { step: "3. Automatización Integrada", desc: "Conexión de agenda, pagos, correos y base de clientes." },
            { step: "4. Capacitación Práctica", desc: "Aprende a gestionar todo sin depender de programadores." },
          ],
        },
      ],
    },
    freeResources: {
      badge: "Herramientas Gratuitas",
      title: "Recursos Interactivos para Optimizar tu Trabajo",
      subtitle:
        "Utiliza estas herramientas sin costo para diagnosticar tus procesos y calcular el retorno potencial de automatizar.",
      auditTitle: "Auditor de CV vs Oferta Laboral con IA",
      auditDesc:
        "Analiza el porcentaje de coincidencia entre tu currículum y la descripción de un puesto objetivo, obteniendo sugerencias de mejora accionables.",
      auditCvLabel: "Pega tu CV o sube archivo",
      auditJdLabel: "Pega la Oferta Laboral (Job Description)",
      auditButton: "Auditar Coincidencia con IA",
      auditAuditing: "Analizando perfil...",
      roiTitle: "Calculadora de ROI de Automatización",
      roiDesc:
        "Descubre cuánto dinero y cuántas horas puedes recuperar al mes eliminando tareas repetitivas mediante RPA e inteligencia artificial.",
      roiHoursLabel: "Horas manuales invertidas por semana",
      roiRateLabel: "Valor de tu hora de trabajo (CLP / USD)",
      roiMonthlySavings: "Ahorro Mensual Proyectado",
      roiAnnualSavings: "Ahorro Anual Proyectado",
      roiDownload: "Descargar Informe de ROI",
      prinergiaTitle: "Prinergia: Ecosistema para Terapeutas",
      prinergiaDesc:
        "Plataforma integrada para gestionar reservas, cobros recurrentes y fichas clínicas sin perder tu paz mental.",
      prinergiaSimulate: "Simular Reserva Automática",
      prinergiaResultSuccess:
        "¡Simulación Exitosa! Reserva creada, enlace de videollamada generado y ficha sincronizada automáticamente.",
      prinergiaRegisterInterest:
        "¿Eres profesional de la salud o bienestar? Deja tu correo para acceder en primicia:",
      prinergiaInterestedBtn: "Me interesa",
      prinergiaRegisteredMsg: "✅ ¡Registrado! Te notificaremos apenas esté disponible.",
      kanbanTitle: "Plantilla Kanban Neurodivergent-Friendly",
      kanbanDesc:
        "Estructura visual simplificada diseñada para organizar tareas de forma flexible, reduciendo la sobrecarga mental.",
      kanbanDownload: "Descargar Plantilla",
    },
    faq: {
      badge: "Preguntas Frecuentes",
      title: "¿Dudas sobre cómo trabajamos?",
      subtitle:
        "Respuestas claras a las inquietudes más comunes sobre consultoría, automatizaciones y entregables.",
      items: [
        {
          q: "¿Trabajas solo con empresas grandes?",
          a: "No. He trabajado tanto con grandes corporaciones (CCU, Transbank, Antü Energía) como con emprendedores, startups y profesionales independientes. El tamaño no importa, importa el proceso que quieras optimizar.",
        },
        {
          q: "¿Qué haces si mi equipo es creativo pero desordenado?",
          a: "Es mi especialidad. Te ayudo a estructurar el trabajo con herramientas visuales dinámicas (como Trello o Notion) y metodologías flexibles de gestión del tiempo. El objetivo no es volverte rígido, sino quitar lo tedioso para que la creatividad fluya.",
        },
        {
          q: "¿Automatizas todo de golpe o puedo elegir solo una parte?",
          a: "Puedes elegir solo una parte. Siempre recomiendo empezar por el proceso que más energía y tiempo te esté drenando. Resolvemos ese cuello de botella primero y medimos resultados antes de avanzar.",
        },
        {
          q: "¿En cuánto tiempo veo resultados?",
          a: "Automatizaciones directas e integraciones de APIs: de 2 a 4 semanas. Proyectos de datos o agentes complejos: de 2 a 3 meses. Desde el primer mes ya comienzas a ver mejoras cuantificables.",
        },
        {
          q: "¿Cómo es el modelo de cobro?",
          a: "Ofrecemos modalidades por hora de consultoría estratégica o fee cerrado por proyecto con entregables claros y acuerdos de éxito orientados a valor.",
        },
        {
          q: "¿Qué significa que tu metodología sea 'neurodivergent-friendly' y para altas capacidades?",
          a: "Significa que no pretendemos forzar tu mente a encajar en un molde rígido. Comprendemos la dispersión, la alta intensidad intelectual, el hiperfoco y los ritmos no lineales. Diseñamos sistemas con plazos flexibles y soporte visual que trabajan a favor de tu mente, no en tu contra.",
        },
      ],
    },
    contact: {
      badge: "Conversemos",
      title: "Hablemos de tu Proyecto",
      subtitle:
        "Cuéntame sobre tus procesos actuales o el desafío que quieres resolver. Te responderé en menos de 24 horas hábiles.",
      nameLabel: "Nombre",
      namePlaceholder: "Tu nombre o el de tu empresa",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "tu@empresa.com",
      phoneLabel: "Teléfono / WhatsApp (Opcional)",
      phonePlaceholder: "+56 9 1234 5678",
      companyLabel: "Empresa o Emprendimiento",
      companyPlaceholder: "Nombre de tu organización",
      serviceLabel: "¿En qué servicio estás interesado?",
      serviceOptions: [
        { value: "ai-engineering", label: "Consultoría en IA & Agentes Inteligentes" },
        { value: "data-engineering", label: "Data Engineering & Pipelines ETL" },
        { value: "automatizacion", label: "Automatización de Procesos & RPA" },
        { value: "rediseno", label: "Rediseño de Procesos Operativos" },
        { value: "profesionales", label: "Automatización para Profesionales / Terapeutas" },
        { value: "otro", label: "Otro desafío / Asesoría a la medida" },
      ],
      messageLabel: "Mensaje o Descripción del Desafío",
      messagePlaceholder:
        "Descríbeme qué proceso te gustaría automatizar o en qué punto tu equipo siente mayor fricción...",
      submitBtn: "Enviar Mensaje",
      submittingBtn: "Enviando mensaje...",
      successTitle: "¡Mensaje Enviado con Éxito! 🚀",
      successDesc: "Gracias por escribir. Te responderé a la brevedad para coordinar los próximos pasos.",
      errorTitle: "Error al enviar mensaje",
      errorDesc: "Ocurrió un problema de conexión. Por favor intenta nuevamente o escríbeme directamente.",
      calendarNotice: "¿Prefieres agendar directamente una reunión?",
      scheduleCallBtn: "Agendar Sesión en Calendario",
    },
  },
  en: {
    meta: {
      title: "Javier Mujica · Applied AI & Data Engineering Consultant | Global",
      description:
        "Industrial & Systems Engineer specializing in AI agents, RPA automation, and resilient data pipelines. Proven impact optimizing operations for enterprise clients and high-growth ventures. Neurodivergent-friendly, outcome-driven approach.",
      ogDescription:
        "Building autonomous AI workflows, RPA systems, and scalable data engineering pipelines. Measurable ROI from month one.",
      keywords: [
        "AI engineering consultant",
        "Data engineering consultant",
        "RPA Python automation",
        "Business process automation",
        "AI agents developer",
        "Enterprise workflow automation",
        "Neurodivergent friendly consultant",
        "Javier Mujica",
      ],
    },
    nav: {
      home: "Home",
      aiEngineering: "AI Engineering",
      dataEngineering: "Data Engineering",
      services: "Services",
      optimization: "Optimization",
      freeResources: "Free Tools",
      experience: "Experience",
      clients: "Clients",
      caseStudies: "Case Studies",
      faq: "FAQ",
      contact: "Contact",
      articles: "Articles",
      ebooks: "E-Books",
      bootcamp: "🚀 Bootcamp",
      themeDark: "Switch to dark mode",
      themeLight: "Switch to light mode",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      switchLanguage: "Cambiar a Español",
    },
    hero: {
      badge: "New in portfolio: VerticApp.pro · AI-Powered Handstand Coach",
      focusLabel: "Professional Focus:",
      aiRole: "AI Engineer",
      dataRole: "Data Engineer",
      aiTitle: "Applied Artificial Intelligence & Intelligent Automation Consulting",
      aiSubtitle:
        "Transforming complex workflows into agile, autonomous systems through AI agents, intelligent pipelines, and RPA. Industrial Engineer with proven track record across enterprise leaders and high-impact startups.",
      aiCtaAudit: "Free AI Audit",
      aiCtaSchedule: "Book a Discovery Call",
      aiCtaExplore: "Explore Solutions",
      dataTitle: "Reliable Data Engineering & Scalable ETL Pipelines",
      dataSubtitle:
        "Architecting resilient data warehouses, real-time ingestion pipelines, and modern analytics infrastructure that turns raw information into clear competitive advantages.",
      dataCtaAudit: "Audit My Data Stack",
      dataCtaSchedule: "Book Technical Session",
      dataCtaExplore: "View Architecture",
    },
    services: {
      sectionTitle: "Specialized Services",
      sectionSubtitle:
        "Tailored engineering and strategic consulting built to maximize operational leverage and revenue.",
      items: [
        {
          id: "rediseno",
          title: "Process Architecture & Redesign",
          description:
            "I analyze and streamline your daily operations to eliminate bottlenecks at their root. If you want to free up mental bandwidth and eliminate operational clutter, I design an agile, human-first structure tailored to your real team dynamics.",
          detailedDescription:
            "When operating workflows become outdated or unstructured, teams experience cognitive friction and slowdowns. I map each stage of your operations, identify points of friction, and implement a streamlined visual workflow that turns chaos into predictable execution.",
          features: [
            "End-to-end process mapping",
            "Bottleneck & leakage identification",
            "Agile visual workflow deployment",
          ],
          benefits: [
            "Free up to 30% of your weekly operational bandwidth.",
            "Sharper focus by minimizing context-switching across tools.",
            "Crystal-clear priorities and real-time visibility for the team.",
          ],
          methodology: [
            { step: "1. As-Is Discovery", desc: "We map your current operating flow without judgment or friction." },
            { step: "2. Bottleneck Detection", desc: "Pinpoint where energy, time, and revenue are leaking." },
            { step: "3. Co-Design", desc: "Craft a refined workflow matched to your cognitive style and team rhythm." },
            { step: "4. Deployment & Refinement", desc: "Hands-on rollout and continuous calibration during early weeks." },
          ],
        },
        {
          id: "automatizacion",
          title: "Intelligent Automation & RPA",
          description:
            "I connect your tech stack and delegate repetitive workloads to autonomous systems using API integrations (Make, Zapier, n8n) and custom bots (Python/Go). From administrative pipelines to IoT and fleet operations.",
          detailedDescription:
            "Automation is not reserved for massive tech giants. With modern API orchestrations and tailored robotic process automation (RPA with Python, Selenium, or Go), I link your apps and automate repetitive tasks like document ingestion, invoice reconciliation, automated triggers, and telemetry sync.",
          features: [
            "Custom RPA bots (Python, Selenium, Go)",
            "Robust API integrations (Make, Zapier, n8n)",
            "Automated reporting & operations pipelines",
          ],
          benefits: [
            "Zero manual human errors across critical administrative flows.",
            "24/7 autonomous operations without extra hiring overhead.",
            "Processing speeds accelerated from hours down to seconds.",
          ],
          methodology: [
            { step: "1. Candidate Selection", desc: "We identify high-volume, high-repetition candidate tasks." },
            { step: "2. Engineering & Integration", desc: "We build resilient workflows connecting your current tools." },
            { step: "3. Resilience & Alerting", desc: "Automated failover, fallback logic, and instant alert systems." },
            { step: "4. Continuous Monitoring", desc: "Ensuring long-term uptime and performance stability." },
          ],
        },
        {
          id: "consultoria",
          title: "Strategic AI Consulting",
          description:
            "High-impact advisory for operational optimization and AI adoption. 100% adaptive methodology tailored for corporate squads, creative founders, and neurodivergent professionals.",
          detailedDescription:
            "Legacy consultancies frequently fail because they enforce rigid, inhumane frameworks. My approach is adaptive: we respect biological rhythms, cognitive strengths (including ADHD, high intellect, and non-linear thinking), and your team culture. We define clear milestones supported by lightweight visual tools.",
          features: [
            "Organizational operational audit",
            "Continuous improvement roadmap",
            "Neurodivergent-friendly coaching & systems",
          ],
          benefits: [
            "Tailored workflows that match real daily energy levels.",
            "Dramatically reduced cognitive overload and burnout.",
            "Clarity on strategic company goals using visual tracking.",
          ],
          methodology: [
            { step: "1. Cognitive Alignment", desc: "Understanding how your team thinks and what unlocks their best work." },
            { step: "2. Visual Roadmapping", desc: "Clean, color-coded boards and friction-free milestones." },
            { step: "3. Empathetic Reviews", desc: "Short, focused sessions to remove blockers without blame." },
            { step: "4. Rapid Iteration", desc: "Continuously tuning based on real-world adoption." },
          ],
        },
        {
          id: "marca-personal",
          title: "Automation for Solo Founders & Clinicians",
          description:
            "Mentorship and digital architecture for therapists, coaches, and consultants seeking to scale their practice sustainably. I automate scheduling, billing, and follow-ups while preserving human warmth.",
          detailedDescription:
            "When you monetize expertise or clinical practice, your most valuable assets are your time and empathy. Automating appointments, invoicing, and reminders allows you to focus 100% on clients while delivering a seamless, premium onboarding experience.",
          features: [
            "Automated calendar & reminder sync",
            "Integrated payment gateways & billing",
            "Adaptive digital client management",
          ],
          benefits: [
            "Eliminate scheduling back-and-forth; clients book against real availability.",
            "Instant professional credibility through polished automated flows.",
            "Reduced payment friction with automated reminders and receipts.",
          ],
          methodology: [
            { step: "1. Client Journey Design", desc: "Mapping the ideal path from initial discovery to consultation." },
            { step: "2. Modern Tool Selection", desc: "Lean, easy-to-manage platforms (Calendly, Stripe, WhatsApp)." },
            { step: "3. Integrated Setup", desc: "Connecting calendar, payments, email, and client records." },
            { step: "4. Practical Handover", desc: "Empowering you to run the system without code dependencies." },
          ],
        },
      ],
    },
    freeResources: {
      badge: "Free Diagnostic Tools",
      title: "Interactive Tools to Accelerate Your Operations",
      subtitle:
        "Leverage these complimentary tools to audit your profile, calculate potential automation ROI, and streamline your workflow.",
      auditTitle: "AI Resume vs Job Description Matcher",
      auditDesc:
        "Analyze compatibility between your professional CV and a target job description, generating actionable keyword and upcycling suggestions.",
      auditCvLabel: "Paste your CV or upload file",
      auditJdLabel: "Paste target Job Description",
      auditButton: "Run AI Compatibility Audit",
      auditAuditing: "Auditing profile...",
      roiTitle: "Automation ROI Calculator",
      roiDesc:
        "Estimate the financial savings and recovered productive hours by automating repetitive administrative tasks with RPA and AI.",
      roiHoursLabel: "Manual hours lost per week",
      roiRateLabel: "Estimated hourly billing rate (USD / CLP)",
      roiMonthlySavings: "Projected Monthly Savings",
      roiAnnualSavings: "Projected Annual Savings",
      roiDownload: "Download ROI Summary",
      prinergiaTitle: "Prinergia: Clinician Ecosystem",
      prinergiaDesc:
        "Integrated workspace to manage client bookings, recurring payments, and digital records without burnout.",
      prinergiaSimulate: "Simulate Auto-Booking",
      prinergiaResultSuccess:
        "Simulation Successful! Appointment booked, video link generated, and client file synced automatically.",
      prinergiaRegisterInterest:
        "Are you a therapist or wellness clinician? Leave your email for early beta access:",
      prinergiaInterestedBtn: "I'm interested",
      prinergiaRegisteredMsg: "✅ You're on the list! We will notify you as soon as Prinergia launches.",
      kanbanTitle: "Neurodivergent-Friendly Kanban Template",
      kanbanDesc:
        "Simplified visual board designed to organize tasks flexibly while minimizing mental overwhelm.",
      kanbanDownload: "Download Template",
    },
    faq: {
      badge: "Frequently Asked Questions",
      title: "Questions on how we partner?",
      subtitle:
        "Clear answers regarding engagements, timelines, technology stacks, and deliverable guarantees.",
      items: [
        {
          q: "Do you only work with large enterprise clients?",
          a: "No. While I have delivered enterprise systems for CCU, Transbank, and energy operators, I also partner with startups and solo founders. What matters is solving a high-friction process with measurable ROI.",
        },
        {
          q: "How do you work with creative or non-traditional teams?",
          a: "That is where I do my best work. I help structure workflows using lightweight visual boards and adaptable time-boxing (like tailored Pomodoro intervals). The goal is never rigid bureaucracy, but removing tedious friction so creativity thrives.",
        },
        {
          q: "Can we start with a single scoped automation?",
          a: "Absolutely. I always advocate starting with the single highest-pain bottleneck. We resolve that first, validate metrics, and only expand once value is proven.",
        },
        {
          q: "What are typical delivery timeframes?",
          a: "Targeted automations and API integrations: 2 to 4 weeks. End-to-end data pipelines or autonomous AI agent squads: 2 to 3 months. Tangible progress is visible within the very first month.",
        },
        {
          q: "What is your pricing model?",
          a: "Engagements are offered as dedicated advisory hours, scoped project sprints with fixed milestone deliverables, or value-share partnerships where aligned.",
        },
        {
          q: "What does 'neurodivergent-friendly' mean in practice?",
          a: "It means we do not force people into rigid, cookie-cutter templates. We account for hyperfocus, intellectual intensity, and non-linear cognition. We design transparent visual systems that work in harmony with your natural cognitive rhythm.",
        },
      ],
    },
    contact: {
      badge: "Get in Touch",
      title: "Let's Discuss Your Project",
      subtitle:
        "Tell me about your current operations or the technical challenge you are solving. I will respond within 24 business hours.",
      nameLabel: "Name",
      namePlaceholder: "Your name or organization",
      emailLabel: "Email Address",
      emailPlaceholder: "you@company.com",
      phoneLabel: "Phone / WhatsApp (Optional)",
      phonePlaceholder: "+1 (555) 123-4567",
      companyLabel: "Company / Venture",
      companyPlaceholder: "Your organization name",
      serviceLabel: "Which service are you interested in?",
      serviceOptions: [
        { value: "ai-engineering", label: "AI Engineering & Intelligent Agents" },
        { value: "data-engineering", label: "Data Engineering & ETL Pipelines" },
        { value: "automatizacion", label: "Process Automation & RPA" },
        { value: "rediseno", label: "Operational Process Redesign" },
        { value: "profesionales", label: "Solo Founder / Practice Automation" },
        { value: "otro", label: "Custom Architecture / Strategic Advisory" },
      ],
      messageLabel: "Project Scope or Challenge Description",
      messagePlaceholder:
        "Describe what workflow you want to automate or where your squad feels the most operational friction...",
      submitBtn: "Send Message",
      submittingBtn: "Sending message...",
      successTitle: "Message Sent Successfully! 🚀",
      successDesc: "Thank you for reaching out. I will get back to you shortly to schedule next steps.",
      errorTitle: "Failed to send message",
      errorDesc: "Network error occurred. Please try again or reach out directly via LinkedIn/Email.",
      calendarNotice: "Prefer to book a direct discovery session?",
      scheduleCallBtn: "Schedule Calendar Discovery",
    },
  },
}
