import type { Metadata } from "next"
import HomePageView from "@/components/home-page-view"
import { translations } from "@/lib/translations"

export const metadata: Metadata = {
  title: translations.en.meta.title,
  description: translations.en.meta.description,
  keywords: translations.en.meta.keywords,
  alternates: {
    canonical: "https://www.javiermujica.com/en",
    languages: {
      "es-CL": "https://www.javiermujica.com",
      "en-US": "https://www.javiermujica.com/en",
      "x-default": "https://www.javiermujica.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.javiermujica.com/en",
    siteName: "Javier Mujica · AI & Data Engineering Consulting",
    title: translations.en.meta.title,
    description: translations.en.meta.ogDescription,
    images: [
      {
        url: "/images/optimize-hero.png",
        width: 1200,
        height: 630,
        alt: "Javier Mujica – AI & Data Engineering Consultant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: translations.en.meta.title,
    description: translations.en.meta.ogDescription,
    images: ["/images/optimize-hero.png"],
  },
}

export default function EnglishHomePage() {
  return <HomePageView locale="en" />
}
