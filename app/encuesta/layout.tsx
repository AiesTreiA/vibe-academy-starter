import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "De la Idea al Mercado · Encuesta de Validación | Vibecode Lab",
  description:
    "Se acabó el simulacro. Comprométete con tu idea, define tu presupuesto de pauta y sal al mercado real con datos en mano.",
  openGraph: {
    title: "De la Idea al Mercado · Encuesta de Validación | Vibecode Lab",
    description:
      "Se acabó el simulacro. La disciplina de validar con datos reales hoy es el ensayo general para levantar inversión.",
    images: [
      {
        url: "/images/encuesta-pitch-investors.jpg",
        width: 1200,
        height: 630,
        alt: "De la Idea al Mercado - Validación y Pitch",
      },
    ],
  },
  icons: {
    icon: "/images/vibecode-logo-icon.png",
    shortcut: "/images/vibecode-logo-icon.png",
    apple: "/images/vibecode-logo-icon.png",
  },
}

export default function EncuestaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
