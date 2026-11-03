import Link from "next/link"
import { Shield, Cookie, Mail, Cpu, Eye, Scale, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Política de Privacidad | Mujica AI Lab",
  description: "Política de privacidad y tratamiento de datos personales de Javier Mujica Consultoría SpA (Mujica AI Lab SpA).",
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col items-center">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />

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
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
            <Shield className="h-10 w-10 animate-pulse" />
          </div>
          <p className="text-sm uppercase tracking-[0.24em] text-indigo-300 font-semibold">Mujica AI Lab</p>
          <h1 className="text-4xl font-extrabold text-white mt-2 sm:text-5xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            Política de Privacidad
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto">
            Tu privacidad y la seguridad de tus datos son pilares fundamentales de nuestro laboratorio de inteligencia artificial.
          </p>
          <p className="text-xs text-slate-500 mt-2">Última actualización: Julio 2026</p>
        </div>

        {/* Compliance Badges */}
        <div className="grid grid-cols-3 gap-4 text-center py-2 animate-fade-in delay-100">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm text-xs font-semibold text-slate-300">
            🇨🇱 Ley 19.628 (Chile)
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm text-xs font-semibold text-slate-300">
            🇪🇺 GDPR Compliant
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm text-xs font-semibold text-slate-300">
            🇺🇸 CCPA Framework
          </div>
        </div>

        {/* Grid Sections */}
        <div className="grid gap-6 sm:grid-cols-2 mt-4 animate-fade-in delay-200">
          
          {/* Card 1: Responsable */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">1. Responsable Legal</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              El tratamiento de datos es gestionado por <strong>JAVIER IGNACIO MUJICA CARVAJAL</strong> (Persona Natural con Giro / Sole Proprietorship), operando comercialmente bajo <strong>Mujica AI Lab</strong> y <strong>Vibecode Lab</strong>. Nos regimos por altos estándares globales de protección.
            </p>
          </div>

          {/* Card 2: Datos Recopilados */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">2. Información Recopilada</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Recopilamos únicamente datos necesarios para la gestión comercial y simulaciones: <strong>nombre, empresa, teléfono y correo electrónico</strong>. No comercializamos tus datos personales bajo ninguna circunstancia.
            </p>
          </div>

          {/* Card 3: Cookies & IA */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Cookie className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">3. Cookies e Interacción</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Utilizamos cookies técnicas para almacenar preferencias de navegación y adaptar el <strong>tono de conversación del chatbot</strong> en tiempo real, garantizando una interacción fluida y personalizada.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed mt-3">
              Además, usamos herramientas de analítica para entender cómo se usa el sitio y mejorarlo: <strong>PostHog</strong> (páginas visitadas, clics, tiempo de permanencia, tipo de dispositivo y navegador, y su ubicación aproximada por IP), <strong>Google Analytics 4</strong> y <strong>Meta Pixel</strong> (medición de visitas y campañas). Estas herramientas pueden almacenar identificadores en tu navegador (cookies o almacenamiento local) y procesar datos en servidores fuera de Chile, por ejemplo en Estados Unidos. No usamos esta información para identificarte personalmente ni la vendemos a terceros. Puedes bloquear estas cookies desde la configuración de tu navegador o con una extensión de bloqueo de rastreadores.
            </p>
          </div>

          {/* Card 4: Seguridad y APIs */}
          <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">4. APIs y Procesamiento de IA</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Procesamos información de forma segura mediante APIs empresariales de primer nivel (como <strong>Anthropic, OpenAI, Gemini y DeepSeek</strong>). Los datos personales nunca se usan para entrenar modelos públicos.
            </p>
          </div>

        </div>

        {/* Detailed Information Section 5 */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 backdrop-blur-md mt-4 animate-fade-in delay-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">5. Comunicaciones y Tus Derechos</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              Al registrarte para una reunión, suscribirte a divulgaciones o descargar recursos abiertos, asumimos tu interés genuino en recibir nuestras novedades tecnológicas. Puedes solicitar la baja inmediata (<strong>opt-out</strong>) mediante el enlace al pie de cada correo o enviando un mensaje directo.
            </p>
            <p>
              Tienes el control absoluto de tus datos. Puedes ejercer tus derechos <strong>ARCO</strong> (Acceso, Rectificación, Cancelación y Oposición) en cualquier momento escribiendo a 
              <a href="mailto:hola@javiermujica.com" className="text-indigo-400 hover:underline ml-1 font-semibold">hola@javiermujica.com</a>.
            </p>
          </div>
        </div>

        {/* Google OAuth & User Data Policy Section 6 */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-8 backdrop-blur-md mt-4 animate-fade-in delay-300 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">6. Uso de Google OAuth y Política de Datos del Usuario</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              Para nuestra aplicación <strong>Vibecode Lab</strong> (plataforma privada de alumnos disponible en <Link href="/vibecodelab" className="text-indigo-400 hover:underline font-semibold">/vibecodelab</Link>), utilizamos la autenticación oficial de <strong>Google OAuth</strong> para permitir a los usuarios iniciar sesión de manera rápida y segura sin gestionar contraseñas adicionales.
            </p>
            <p>
              <strong>Alcance y Datos Solicitados:</strong> Solicitamos únicamente los permisos básicos de perfil del usuario (<code>openid</code>, <code>email</code>, <code>profile</code>). Estos datos se utilizan exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-300">
              <li>Verificar la identidad del estudiante e inscribirlo en su panel privado de clases.</li>
              <li>Generar de forma automatizada invitaciones a sesiones de mentoría 1-a-1 vía Google Meet cuando el usuario lo solicite.</li>
            </ul>
            <p>
              <strong>Uso Limitado y Privacidad Garantizada:</strong> El uso y la transferencia a cualquier otra aplicación de la información recibida a través de las APIs de Google por parte de Vibecode Lab se adhiere a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Política de Datos de Usuario de los Servicios de API de Google</a>, incluidos los requisitos de Uso Limitado (Limited Use Requirements). No vendemos, transferimos ni utilizamos datos de Google para publicidad o entrenamiento de modelos de inteligencia artificial.
            </p>
          </div>
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
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </main>
  )
}
