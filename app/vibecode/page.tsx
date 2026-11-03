import type { Metadata } from "next"
import VibecodePageView from "@/components/vibecode-page-view"
import { vibecodeTranslations } from "@/lib/vibecode-translations"

export const metadata: Metadata = {
  title: vibecodeTranslations.es.meta.title,
  description: vibecodeTranslations.es.meta.description,
  alternates: {
    canonical: "https://www.javiermujica.com/vibecode",
    languages: {
      "es-CL": "https://www.javiermujica.com/vibecode",
      "en-US": "https://www.javiermujica.com/en/vibecode",
      "x-default": "https://www.javiermujica.com/vibecode",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://www.javiermujica.com/vibecode",
    siteName: "Vibecode Lab · Bootcamp Builder",
    title: vibecodeTranslations.es.meta.title,
    description: vibecodeTranslations.es.meta.ogDescription,
    images: [
      {
        url: "/images/vibecode-og.png",
        width: 1200,
        height: 630,
        alt: "Vibecode Lab Bootcamp",
      },
    ],
  },
}

export default function VibecodePage() {
  return <VibecodePageView locale="es" />
}
