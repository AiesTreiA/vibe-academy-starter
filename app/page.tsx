import type { Metadata } from "next"
import HomePageView from "@/components/home-page-view"

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.javiermujica.com",
    languages: {
      "es-CL": "https://www.javiermujica.com",
      "en-US": "https://www.javiermujica.com/en",
      "x-default": "https://www.javiermujica.com",
    },
  },
}

export default function Home() {
  return <HomePageView locale="es" />
}
