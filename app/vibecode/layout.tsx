import type { Metadata } from "next"

const BASE_URL = "https://www.javiermujica.com"
const OG_IMAGE = `${BASE_URL}/vibecode-og.png`

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Vibecode Lab — Deja de postular. Empieza a construir tu propio SaaS.",
  description:
    "Programa de 7 semanas y ecosistema para Developers, Founders, Creativos y Builders con mentalidad de Forward Deployed Engineer. Construye, valida y lanza tu SaaS.",
  keywords: [
    "Vibecode Lab",
    "Forward Deployed Engineer",
    "FDE OpenAI",
    "SaaS validation",
    "SaaS launch",
    "Go-To-Market SaaS",
    "desarrollo SaaS IA",
    "ecosistema builders",
    "bootcamp SaaS",
    "Javier Mujica vibecode",
  ],
  openGraph: {
    type: "website",
    url: `${BASE_URL}/vibecode`,
    title: "Vibecode Lab — Deja de postular. Empieza a construir tu propio SaaS.",
    description:
      "Programa de 7 semanas en vivo y ecosistema para Developers, Founders, Creativos y Builders. Aprende a crear, validar, lanzar y monetizar tu propio SaaS.",
    siteName: "Vibecode Lab",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Vibecode Lab — Ecosistema para Builders y Forward Deployed Engineers",
        type: "image/png",
      },
    ],
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibecode Lab — Deja de postular. Empieza a construir tu propio SaaS.",
    description:
      "Deja de construir los productos de otros. Empieza a construir los tuyos en Vibecode Lab.",
    images: [OG_IMAGE],
    creator: "@javiermujica",
  },
  icons: {
    icon: "/images/vibecode-logo-icon.png",
    shortcut: "/images/vibecode-logo-icon.png",
    apple: "/images/vibecode-logo-icon.png",
  },
  alternates: {
    canonical: `${BASE_URL}/vibecode`,
  },
}

export default function VibecodeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
