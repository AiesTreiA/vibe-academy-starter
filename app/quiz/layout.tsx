import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quiz Final de Cierre · Cohorte 1 | Vibecode Lab",
  description:
    "Reflexión final, diagnóstico de validación de mercado y balance de transformación de la primera generación de Vibecode Lab.",
  openGraph: {
    title: "Quiz Final de Cierre · Generación 1 | Vibecode Lab",
    description:
      "El código compila en local, pero la verdad compila afuera. Balance final, diagnóstico del MVP y testimonios de la Cohorte 1.",
    images: [
      {
        url: "/images/encuesta-pitch-investors.jpg",
        width: 1200,
        height: 630,
        alt: "Vibecode Lab - Quiz Final de Cierre",
      },
    ],
  },
  icons: {
    icon: "/images/vibecode-logo-icon.png",
    shortcut: "/images/vibecode-logo-icon.png",
    apple: "/images/vibecode-logo-icon.png",
  },
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
