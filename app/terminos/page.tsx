import Link from "next/link"
import { Scale, ShieldAlert, FileCode, UserCheck, Coins, Globe, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Términos de Servicio | Mujica AI Lab",
  description: "Términos y condiciones de uso de los servicios de consultoría y desarrollo de software de Javier Mujica Consultoría SpA (Mujica AI Lab SpA).",
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col items-center">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16 sm:px-8 relative z-10 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 self-start"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Volver al inicio</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center py-6 animate-fade-in">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 shadow-lg shadow-blue-500/5">
            <Scale className="h-10 w-10 animate-pulse" />
          </div>
          <p className="text-sm uppercase tracking-[0.24em] text-blue-300 font-semibold">Mujica AI Lab</p>
          <h1 className="text-4xl font-extrabold text-white mt-2 sm:text-5xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-200 bg-clip-text text-transparent">
            Términos de Servicio
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto">
            Acuerdos claros, responsabilidades bien definidas y transparencia en cada línea de desarrollo.
          </p>
          <p className="text-xs text-slate-500 mt-2">Última actualización: Julio 2026</p>
        </div>

        {/* Grid Sections */}
        <div className="grid gap-6 sm:grid-cols-2 mt-4 animate-fade-in delay-100">
          
          {/* Card 1: Aceptación */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">1. Aceptación y Alcance</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Los términos rigen la relación con <strong>JAVIER IGNACIO MUJICA CARVAJAL</strong> (Persona Natural con Giro / Sole Proprietorship), y sus nombres comerciales <strong>Mujica AI Lab</strong> y <strong>Vibecode Lab</strong>. Al interactuar con la web o contratar servicios, confirmas tu conformidad.
            </p>
          </div>

          {/* Card 2: Propiedad Intelectual */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <FileCode className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">2. Propiedad Intelectual (PI)</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Si se liquida el valor total del software, la <strong>PI te pertenece</strong>. En modelos de desarrollo con costo inicial reducido a cambio de un porcentaje (%) de ventas, la PI es de la Empresa con opción de compra según la fase.
            </p>
          </div>

          {/* Card 3: Limitación IA */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-amber-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 sm:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <ShieldAlert className="h-5 w-5 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-base font-semibold text-amber-300">3. Naturaleza de la IA y Límite de Responsabilidad</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sometemos cada implementación a una rigurosa curaduría y revisión. No obstante, los modelos de lenguaje (LLMs) están en constante evolución y pueden presentar alucinaciones o errores fuera del control directo. La Empresa <strong>no se hace responsable</strong> de conductas inadecuadas de sistemas de terceros o decisiones comerciales derivadas de respuestas automatizadas fuera de control.
            </p>
          </div>

          {/* Card 4: Pagos y Licencias */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">4. Modelos de Contratación</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ofrecemos esquemas flexibles. La compra de PI de un proyecto se valora de mutuo acuerdo basándonos en la fase de desarrollo y arquitectura en la que se encuentra el código en ese momento.
            </p>
          </div>

          {/* Card 5: Jurisdicción */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">5. Ley Aplicable</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cualquier controversia legal surgida en la interpretación o cumplimiento de estos acuerdos queda sujeta a las leyes de la República de Chile y a los Tribunales Ordinarios de <strong>Santiago de Chile</strong>.
            </p>
          </div>

        </div>

        {/* Footer info box */}
        <div className="text-center py-4 animate-fade-in delay-200">
          <p className="text-xs text-slate-500">
            ¿Dudas o requerimientos especiales sobre estos términos? Contáctanos en 
            <a href="mailto:hola@javiermujica.com" className="text-blue-400 hover:underline ml-1 font-semibold">hola@javiermujica.com</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.15s;
        }
        .delay-200 {
          animation-delay: 0.3s;
        }
      `}</style>
    </main>
  )
}
