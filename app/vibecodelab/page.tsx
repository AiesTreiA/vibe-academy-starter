"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StudentView } from "@/components/vibecodelab/student-view"
import { AdminView } from "@/components/vibecodelab/admin-view"
import { FirstLoginModal } from "@/components/vibecodelab/first-login-modal"
import { getSupabaseClient } from "@/lib/supabase"
import {
  KeyRound,
  LogOut,
  Settings,
  ArrowRight,
  Sun,
  Moon,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export default function VibecodeLabPage() {
  const { theme, setTheme } = useTheme()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [previewAsStudent, setPreviewAsStudent] = useState(false)

  // Dynamically update favicon for Vibecode Lab route
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.getElementsByTagName("head")[0].appendChild(link)
    }
    link.type = "image/png"
    link.href = "/images/vibecode-logo-icon.png"
  }, [])

  // Form States
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // First Login Modal state
  const [firstLoginModalOpen, setFirstLoginModalOpen] = useState(false)

  // Helper function to sync session user profile
  const syncProfileAndSession = async (sessionUser: any) => {
    try {
      const emailNormalized = sessionUser.email?.toLowerCase() || ""
      const fullName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || emailNormalized.split("@")[0]
      const avatarUrl = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture

      const res = await fetch("/api/vibecodelab/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionUser.id,
          email: emailNormalized,
          full_name: fullName,
          avatar_url: avatarUrl
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success || data.access_granted === false) {
        // Access Denied (User has not paid / is not registered)
        console.warn("⛔ Access denied by backend profile validation:", data.error)
        toast.error(data.error || "Tu cuenta no registra un pago activo en Vibecode Lab.", {
          duration: 8000,
        })
        setUser(null)
        localStorage.removeItem("vibecode_user")
        try {
          const supabase = getSupabaseClient()
          await supabase.auth.signOut()
        } catch (e) {
          console.warn("SignOut error after access denial:", e)
        }
      } else if (data.success && data.profile) {
        setUser(data.profile)
        localStorage.setItem("vibecode_user", JSON.stringify(data.profile))

        if (data.profile.must_change_password) {
          setFirstLoginModalOpen(true)
        }
      }
    } catch (err) {
      console.error("Error syncing profile with backend:", err)
    } finally {
      setLoading(false)
      setGoogleLoading(false)
    }
  }

  // Persistent Auth State Listener & Initial Session Load
  useEffect(() => {
    // Check if URL has error parameters from OAuth redirect
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const errorDesc = urlParams.get("error_description") || urlParams.get("error")
      if (errorDesc) {
        console.warn("⚠️ [VIBECODE AUTH] OAuth URL Error:", errorDesc)
        if (errorDesc.includes("bad_oauth_state") || errorDesc.includes("state")) {
          toast.error("Configuración de redirección incompleta en Supabase. Actualiza las Redirect URLs en el Dashboard.")
        } else {
          toast.error(`Error de autenticación: ${errorDesc}`)
        }
      }
    }

    let supabase: any
    try {
      supabase = getSupabaseClient()
    } catch (err) {
      console.warn("Supabase client init error in browser:", err)
    }

    if (!supabase) {
      const savedUser = localStorage.getItem("vibecode_user")
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem("vibecode_user")
        }
      }
      setLoading(false)
      return
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        syncProfileAndSession(session.user)
      } else {
        const savedUser = localStorage.getItem("vibecode_user")
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch (e) {
            localStorage.removeItem("vibecode_user")
          }
        }
        setLoading(false)
      }
    })

    // 2. Listen for Auth State Changes (Google OAuth, Sign In, Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log(`🔐 [VIBECODE AUTH EVENT] ${event}`)
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        await syncProfileAndSession(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        localStorage.removeItem("vibecode_user")
        setLoading(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Email / Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/vibecodelab/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error || "Error al iniciar sesión")
      } else {
        const profile = data.profile
        setUser(profile)
        localStorage.setItem("vibecode_user", JSON.stringify(profile))
        toast.success(`¡Bienvenido/a ${profile.full_name}!`)

        if (profile.must_change_password) {
          setFirstLoginModalOpen(true)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Ocurrió un error en la conexión")
    } finally {
      setSubmitting(false)
    }
  }

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const supabase = getSupabaseClient()
      const redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/vibecodelab`
        : "https://www.javiermujica.com/vibecodelab"

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          }
        }
      })

      if (error) {
        console.error("Google OAuth error:", error)
        toast.error(`Error de autenticación con Google: ${error.message}`)
        setGoogleLoading(false)
      }
    } catch (err: any) {
      console.error("Google OAuth exception:", err)
      toast.error("No se pudo iniciar el flujo con Google")
      setGoogleLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.warn("Supabase signOut warning:", err)
    }
    setUser(null)
    localStorage.removeItem("vibecode_user")
    toast.info("Sesión cerrada")
  }

  const handlePasswordChanged = () => {
    if (user) {
      const updated = { ...user, must_change_password: false }
      setUser(updated)
      localStorage.setItem("vibecode_user", JSON.stringify(updated))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2 text-sm font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        Verificando sesión de Vibecode Lab...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Platform Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vibecodelab" className="flex items-center gap-2.5 group">
            <img
              src="/images/vibecode-logo-icon.png"
              alt="Vibecode Lab Logo"
              className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                VIBECODE<span className="text-indigo-400">LAB</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Plataforma Privada</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-full w-9 h-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-3 border-l border-slate-800">
              {user.role === "admin" && (
                <Button
                  size="sm"
                  variant={previewAsStudent ? "default" : "outline"}
                  onClick={() => setPreviewAsStudent(!previewAsStudent)}
                  className={`text-xs h-8 px-2.5 font-semibold transition-all ${
                    previewAsStudent
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30"
                      : "border-indigo-600/60 text-indigo-300 hover:bg-indigo-950/40 hover:text-white"
                  }`}
                  title={previewAsStudent ? "Volver a Panel de Administración" : "Ver como Alumno"}
                >
                  {previewAsStudent ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
                      <span className="hidden sm:inline">Volver a </span>Admin
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      <span className="hidden sm:inline">Ver como </span>Alumno
                    </>
                  )}
                </Button>
              )}

              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{user.full_name}</span>
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 py-0 h-4 self-end ${
                    user.role === "admin"
                      ? previewAsStudent
                        ? "border-indigo-600/60 text-indigo-300 bg-indigo-950/40"
                        : "border-amber-600/60 text-amber-400 bg-amber-950/40"
                      : "border-indigo-600/60 text-indigo-300 bg-indigo-950/40"
                  }`}
                >
                  {user.role === "admin" ? (previewAsStudent ? "Vista Alumno" : "Administrador") : "Alumno"}
                </Badge>
              </div>

              <Link href="/configuracion">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg w-8 h-8"
                  title="Configuración de Cuenta"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg w-8 h-8"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {!user ? (
          /* GUEST LOGIN VIEW */
          <div className="max-w-md mx-auto py-8 space-y-6">
            <div className="text-center space-y-3">
              <img
                src="/images/vibecode-logo-full.png"
                alt="Vibecode Lab Logo"
                className="mx-auto h-16 w-auto object-contain drop-shadow-2xl mb-2"
              />
              <h1 className="text-2xl font-extrabold text-white">Ingresa a Vibecode Lab</h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Inicia sesión con tu cuenta de Google o con tu correo y contraseña de alumno.
              </p>
            </div>

            <Card className="bg-slate-900 border-slate-800 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Acceso a la Plataforma</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Elige tu método de inicio de sesión preferido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Official Google OAuth Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full bg-slate-950 hover:bg-slate-900 border-slate-700 hover:border-slate-600 text-white font-medium text-xs py-2.5 flex items-center justify-center gap-2.5 transition-all shadow-md"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continuar con Google</span>
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-bold tracking-wider relative shrink-0">
                    O con tu Correo
                  </span>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Correo Electrónico</Label>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-slate-300">Contraseña</Label>
                      <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">
                        ¿Clave temporal? Revisa tu email
                      </span>
                    </div>
                    <Input
                      type="password"
                      placeholder="Contraseña de acceso"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-indigo-900/30 py-2.5"
                  >
                    {submitting ? "Autenticando..." : "Ingresar con Correo"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Google OAuth & App Functionality Public Disclosure Box */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs text-slate-300 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Acerca de Vibecode Lab & Transparencia de Datos</span>
              </div>
              <p className="leading-relaxed">
                <strong>Vibecode Lab</strong> es la plataforma educativa oficial de bootcamps de desarrollo asistido con Inteligencia Artificial operada por <strong>Javier Mujica Consultoría SpA (Mujica AI Lab SpA)</strong>.
              </p>
              <div className="space-y-1.5 pt-1 text-slate-400">
                <p><strong>🎯 Funcionalidad de la Aplicación:</strong> Otorga acceso a estudiantes a clases en vivo y grabadas, repositorios de código, slides interactivas de entorno, agendamiento de mentorías 1-a-1 y la comunidad Pitch & Match.</p>
                <p><strong>🔒 Uso de Autenticación Google OAuth:</strong> Utilizamos tu cuenta de Google únicamente para verificar tu identidad (correo electrónico y nombre), permitiéndote iniciar sesión de forma segura sin gestionar contraseñas adicionales.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] border-t border-slate-800/80">
                <Link href="/vibecode" className="text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                  <span>Ver Programa Vibecode Lab</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-slate-700">·</span>
                <Link href="/privacidad" className="text-slate-400 hover:text-white underline">
                  Política de Privacidad
                </Link>
                <span className="text-slate-700">·</span>
                <a href="mailto:hola@javiermujica.com" className="text-slate-400 hover:text-white underline">
                  Soporte: hola@javiermujica.com
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ROLE-BASED VIEW */
          <>
            {user.role === "admin" && previewAsStudent && (
              <div className="mb-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/60 border border-indigo-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-indigo-950/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shrink-0">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Modo Previsualización de Alumno</span>
                      <Badge className="bg-indigo-950 text-indigo-300 border-indigo-700 text-[10px]">
                        Admin Preview
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Estás viendo exactamente la misma interfaz y reproductor de video que ven tus estudiantes.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setPreviewAsStudent(false)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/30 shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Volver al Panel Admin
                </Button>
              </div>
            )}

            {user.role === "admin" && !previewAsStudent ? (
              <AdminView user={user} onSwitchToStudentView={() => setPreviewAsStudent(true)} />
            ) : (
              <StudentView user={user} />
            )}

            {/* First Login Change Password Prompt Modal */}
            <FirstLoginModal
              isOpen={firstLoginModalOpen}
              onClose={() => setFirstLoginModalOpen(false)}
              userEmail={user.email}
              userId={user.id}
              onPasswordChanged={handlePasswordChanged}
            />
          </>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 px-8 text-center text-xs text-slate-500">
        © 2026 Vibecode Lab · Javier Mujica Consultoría. Todos los derechos reservados.
      </footer>
    </div>
  )
}
