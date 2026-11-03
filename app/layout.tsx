import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ChatbotWidget from "@/components/chatbot-widget"
import CookieBanner from "@/components/cookie-banner"
import ThirdPartyAnalytics from "@/components/third-party-analytics"
import PostHogAnalytics from "@/components/posthog-analytics"
import VisitTracker from "@/components/visit-tracker"

const BASE_URL = "https://www.javiermujica.com"
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-0W9X2VZ3BB"
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1019752834265314"
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || ""

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Javier Mujica · Consultor en IA y Automatización de Procesos | Chile",
    template: "%s | Javier Mujica Consultoría",
  },
  description:
    "Ingeniero Civil Industrial (U. de Chile) especializado en automatización RPA, IA aplicada y rediseño de procesos. He optimizado operaciones para CCU, Transbank y Antü Energía. Método flexible, neurodivergent-friendly (orientado a altas capacidades y neurodiversidades) y enfocado en resultados.",
  keywords: [
    "consultoría en automatización Chile",
    "RPA Python",
    "optimización de procesos",
    "transformación digital PYME",
    "IA aplicada a negocios",
    "consultor neurodivergent-friendly",
    "altas capacidades productividad",
    "neurodivergente friendly chile",
    "automatización make zapier n8n",
    "ingeniero civil industrial Chile",
    "Javier Mujica consultor",
  ],
  authors: [{ name: "Javier Mujica", url: BASE_URL }],
  creator: "Javier Mujica",
  publisher: "Javier Mujica",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: BASE_URL,
    siteName: "Javier Mujica · Consultoría en IA y Automatización",
    title: "Javier Mujica · Consultor en IA y Automatización de Procesos | Chile",
    description:
      "Automatizo procesos con IA y RPA para empresas y profesionales en Chile. Clientes: CCU, Transbank, Antü Energía y más. Resultados desde el primer mes.",
    images: [
      {
        url: "/images/optimize-hero.png",
        width: 1200,
        height: 630,
        alt: "Javier Mujica – Consultor en IA y Automatización de Procesos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@javiermujica",
    creator: "@javiermujica",
    title: "Javier Mujica · Consultor en IA y Automatización | Chile",
    description:
      "Automatizo procesos con IA y RPA para empresas y profesionales en Chile. Metodología flexible, neurodivergent-friendly, resultados desde el primer mes.",
    images: ["/images/optimize-hero.png"],
  },
  verification: {
    google: GOOGLE_VERIFICATION,
  },
  other: {
    "theme-color": "#0f172a",
    "facebook-domain-verification": "zk5eyayov2vqj2rvot5e3rn58p5krs",
  },
}

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Javier Mujica",
      url: BASE_URL,
      jobTitle: "Consultor en IA Aplicada y Automatización de Procesos",
      description:
        "Ingeniero Civil Industrial de la Universidad de Chile especializado en RPA, automatización con Python y rediseño de procesos para empresas y profesionales.",
      alumniOf: { "@type": "EducationalOrganization", name: "Universidad de Chile" },
      knowsAbout: ["RPA", "Python", "Automatización de procesos", "IA aplicada", "Consultoría estratégica"],
      sameAs: ["https://www.linkedin.com/in/javier-mujica-aa32291a/"],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${BASE_URL}/#business`,
      name: "Javier Mujica · Consultoría en IA y Automatización",
      url: BASE_URL,
      description:
        "Consultoría especializada en automatización RPA, IA aplicada y rediseño de procesos para empresas y profesionales en Chile.",
      founder: { "@id": `${BASE_URL}/#person` },
      areaServed: { "@type": "Country", name: "Chile" },
      serviceType: ["Automatización RPA", "Consultoría estratégica", "Rediseño de procesos", "Transformación digital"],
      priceRange: "CLP 50.000/hora",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/images/logo-completo.webp" fetchPriority="high" type="image/webp" />
        <link rel="preload" as="image" href="/images/optimize-hero.webp" fetchPriority="high" type="image/webp" media="(min-width: 768px)" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <ThirdPartyAnalytics gaId={GA_ID} metaPixelId={META_PIXEL_ID} />
        <PostHogAnalytics />
        <VisitTracker />
        {children}
        <CookieBanner />
        <ChatbotWidget />
      </body>
    </html>
  )
}
