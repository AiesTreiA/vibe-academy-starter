import type { Metadata } from "next"

const BASE_URL = "https://www.javiermujica.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Vibecode Lab — Plataforma Privada de Alumnos",
  description:
    "Plataforma privada de clases grabadas, recursos descargables y mentorías 1-a-1 de Vibecode Lab.",
  icons: {
    icon: "/images/vibecode-logo-icon.png",
    shortcut: "/images/vibecode-logo-icon.png",
    apple: "/images/vibecode-logo-icon.png",
  },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/vibecodelab`,
    title: "Vibecode Lab — Plataforma Privada de Alumnos",
    description:
      "Plataforma privada de clases grabadas, recursos descargables y mentorías 1-a-1 de Vibecode Lab.",
    siteName: "Vibecode Lab",
    images: [
      {
        url: `${BASE_URL}/vibecode-og.png`,
        width: 1200,
        height: 630,
        alt: "Vibecode Lab — Plataforma Privada",
      },
    ],
    locale: "es_CL",
  },
  alternates: {
    canonical: `${BASE_URL}/vibecodelab`,
  },
}

export default function VibecodeLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
