import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-xl border border-border text-center space-y-6">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
        <h1 className="text-3xl font-bold text-foreground">¡Gracias por agendar tu reunión!</h1>
        <p className="text-lg text-muted-foreground">
          Hemos recibido tu solicitud y te hemos enviado un correo de confirmacion con los detalles de la reunion.
        </p>
        <p className="text-md text-muted-foreground">Revisa tu bandeja de entrada (y la carpeta de spam, por si acaso).</p>
        <div className="space-y-3 pt-2">
          <Link href="/frame" passHref>
            <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 font-bold text-white shadow-lg">
              Completar Pasos Obligatorios (/frame)
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button size="sm" variant="ghost" className="w-full text-slate-400">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
