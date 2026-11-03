"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Lock, Save, ShieldCheck, KeyRound } from "lucide-react"
import { toast } from "sonner"

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Profile Form States
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  // Password Form States
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem("vibecode_user")
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setFullName(parsed.full_name || "")
        setEmail(parsed.email || "")
        setPhone(parsed.phone || "")
        setBio(parsed.bio || "")
      } catch (err) {
        console.error(err)
      }
    }
    setLoading(false)
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error("Debes iniciar sesión para actualizar tu perfil")
      return
    }

    setSavingProfile(true)

    try {
      const res = await fetch("/api/vibecodelab/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          full_name: fullName,
          email,
          phone,
          bio
        })
      })

      const data = await res.json()

      if (data.success && data.profile) {
        const updated = { ...user, ...data.profile }
        setUser(updated)
        localStorage.setItem("vibecode_user", JSON.stringify(updated))
        toast.success("Perfil actualizado con éxito")
      } else {
        toast.error(data.error || "Error actualizando perfil")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error en la conexión")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error("Debes iniciar sesión para cambiar tu contraseña")
      return
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch("/api/vibecodelab/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        const updated = { ...user, must_change_password: false }
        setUser(updated)
        localStorage.setItem("vibecode_user", JSON.stringify(updated))
        setNewPassword("")
        setConfirmPassword("")
        toast.success("¡Contraseña actualizada exitosamente!")
      } else {
        toast.error(data.error || "Error al cambiar la contraseña")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al actualizar la contraseña")
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Cargando configuración de cuenta...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-xl font-bold">No has iniciado sesión</h2>
        <p className="text-xs text-slate-400">Por favor ingresa a la plataforma Vibecode Lab primero.</p>
        <Link href="/vibecodelab">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs">
            Ir a /vibecodelab
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vibecodelab">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a Vibecode Lab
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-indigo-700 text-indigo-400 text-xs">
            {user.role === "admin" ? "Administrador" : "Alumno Vibecode"}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">Configuración de Cuenta</h1>
          <p className="text-xs text-slate-400 mt-1">
            Actualiza tus datos personales, correo electrónico y contraseña de acceso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PROFILE DATA CARD */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Información del Perfil</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Datos personales y de contacto
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Nombre Completo</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Correo Electrónico</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Teléfono / WhatsApp</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+569..."
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Bio / Biografía Breve</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos sobre tus proyectos o intereses..."
                    className="bg-slate-950 border-slate-800 text-white text-xs h-20"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs mt-2"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {savingProfile ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* CHANGE PASSWORD CARD */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-white">Cambiar Contraseña</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Actualiza tu clave de acceso a la plataforma privada
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Nueva Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Confirmar Nueva Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Repite la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                    required
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Estado de la Cuenta
                  </div>
                  <p>
                    {user.must_change_password ? (
                      <span className="text-amber-400">Actualmente estás usando una contraseña temporal.</span>
                    ) : (
                      <span className="text-emerald-400">Tu contraseña personalizada está activa y segura.</span>
                    )}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs mt-2"
                >
                  <KeyRound className="w-4 h-4 mr-1.5" />
                  {savingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
