import type { Metadata } from "next"
import VibecodePageView from "@/components/vibecode-page-view"
import { vibecodeTranslations } from "@/lib/vibecode-translations"

export const metadata: Metadata = {
  title: vibecodeTranslations.en.meta.title,
  description: vibecodeTranslations.en.meta.description,
  alternates: {
    canonical: "https://www.javiermujica.com/en/vibecode",
    languages: {
      "es-CL": "https://www.javiermujica.com/vibecode",
      "en-US": "https://www.javiermujica.com/en/vibecode",
      "x-default": "https://www.javiermujica.com/vibecode",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.javiermujica.com/en/vibecode",
    siteName: "Vibecode Lab · AI SaaS Bootcamp",
    title: vibecodeTranslations.en.meta.title,
    description: vibecodeTranslations.en.meta.ogDescription,
    images: [
      {
        url: "/images/vibecode-og.png",
        width: 1200,
        height: 630,
        alt: "Vibecode Lab AI Bootcamp",
      },
    ],
  },
}

export default function EnglishVibecodePage() {
  return <VibecodePageView locale="en" />
}
