export type Locale = "es" | "en"

export interface VibecodeTranslations {
  languageBanner: {
    text: string
    actionText: string
    actionHref: string
  }
  meta: {
    title: string
    description: string
    ogDescription: string
  }
  nav: {
    manifesto: string
    profiles: string
    paradigms: string
    curriculum: string
    pricing: string
    ebooks: string
    oneOnOne: string
    reserveSpot: string
  }
  hero: {
    badge: string
    titleLead: string
    titleHighlight: string
    subtitle: string
    ctaReserve: string
    ctaProgram: string
    ctaOneOnOne: string
    countdownLabel: string
    liveCohortNotice: string
  }
}

export const vibecodeTranslations: Record<Locale, VibecodeTranslations> = {
  es: {
    languageBanner: {
      text: "Bootcamp en vivo en español · Mentorías 1:1 privadas disponibles en inglés",
      actionText: "Ver Mentoría 1:1",
      actionHref: "/vibecode-1on1",
    },
    meta: {
      title: "Vibecode Lab · Bootcamp & Ecosistema Builder de SaaS con IA | Javier Mujica",
      description:
        "7 semanas prácticas en vivo para diseñar, construir y desplegar tu software con IA, integrando pagos reales, autenticación y despliegue continuo. Mentalidad Forward Deployed Engineer.",
      ogDescription:
        "De la idea al mercado: Construye, valida y lanza tu SaaS con IA en 7 semanas.",
    },
    nav: {
      manifesto: "Manifiesto FDE",
      profiles: "Perfiles",
      paradigms: "Paradigmas",
      curriculum: "Programa",
      pricing: "Inversión",
      ebooks: "📚 Biblia E-Books",
      oneOnOne: "Mentoría 1:1",
      reserveSpot: "Reservar mi cupo",
    },
    hero: {
      badge: "Bootcamp & Ecosistema Builder · 7 Semanas en Vivo",
      titleLead: "De la idea al mercado:",
      titleHighlight: "Construye, valida y lanza tu SaaS con IA.",
      subtitle:
        "Combina Inteligencia Artificial, software y estrategia de negocio para pasar más rápido de un problema real a un producto SaaS funcional. Diseñado para Developers, Founders, Creativos y Builders con mentalidad de Forward Deployed Engineer.",
      ctaReserve: "Reservar mi cupo",
      ctaProgram: "Explorar Programa",
      ctaOneOnOne: "Mentoría 1-on-1 en Inglés/Español",
      countdownLabel: "Inicio de cohorte en vivo:",
      liveCohortNotice: "Cupos limitados por cohorte para garantizar feedback 1 a 1.",
    },
  },
  en: {
    languageBanner: {
      text: "Notice: The 7-week live group cohort is delivered in Spanish. Private 1-on-1 mentorship & consulting sessions are fully available in English.",
      actionText: "Explore 1-on-1 Mentorship ↗",
      actionHref: "/vibecode-1on1",
    },
    meta: {
      title: "Vibecode Lab · AI-Powered SaaS Builder Bootcamp & Ecosystem | Javier Mujica",
      description:
        "7 hands-on live weeks to design, engineer, and deploy your AI SaaS with production payments, authentication, and continuous delivery. Forward Deployed Engineer mindset.",
      ogDescription:
        "From concept to revenue: Build, validate, and launch your AI-powered SaaS in 7 weeks.",
    },
    nav: {
      manifesto: "FDE Manifesto",
      profiles: "Profiles",
      paradigms: "Paradigms",
      curriculum: "Curriculum",
      pricing: "Tuition",
      ebooks: "📚 E-Books Bible",
      oneOnOne: "1-on-1 Mentorship",
      reserveSpot: "Reserve My Seat",
    },
    hero: {
      badge: "Builder Ecosystem & Bootcamp · 7 Weeks Live",
      titleLead: "From concept to market:",
      titleHighlight: "Build, validate, and launch your AI-driven SaaS.",
      subtitle:
        "Blend Artificial Intelligence, modern software engineering, and GTM strategy to turn real-world problems into production-ready software faster than ever. Built for Developers, Founders, and Builders with a Forward Deployed Engineer mindset.",
      ctaReserve: "Reserve My Seat",
      ctaProgram: "Explore Curriculum",
      ctaOneOnOne: "Book 1-on-1 Mentorship",
      countdownLabel: "Live Cohort Kickoff:",
      liveCohortNotice: "Limited seats per cohort to guarantee personalized code reviews.",
    },
  },
}
