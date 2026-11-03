"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound, ShieldAlert, CheckCircle2, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface FirstLoginModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userId: string
  onPasswordChanged: () => void
}

export function FirstLoginModal({ isOpen, onClose, userEmail, userId, onPasswordChanged }: FirstLoginModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/vibecodelab/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error || "Error al actualizar la contraseña")
      } else {
        toast.success("¡Contraseña personalizada configurada con éxito!")
        onPasswordChanged()
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error("Ocurrió un error en la conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-indigo-900/50 text-slate-100 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-3 shadow-xl">
            <img src="/images/vibecode-logo-icon.png" alt="Vibecode Logo" className="w-10 h-10 object-contain" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            ¡Primer Inicio de Sesión Detectado!
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm mt-1">
            Estás ingresando con una <strong className="text-indigo-300">contraseña temporal</strong> generada por el sistema. Te recomendamos guardarla de forma segura o cambiarla ahora mismo por una personalizada.
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4 py-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Tu correo de acceso es <strong className="text-white font-mono">{userEmail}</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Puedes usar la contraseña enviada a tu correo o definir una clave nueva de al menos 6 caracteres.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-indigo-900/30"
              >
                <Lock className="w-4 h-4 mr-2" />
                Cambiar Contraseña Ahora
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Continuar con Clave Temporal
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Nueva Contraseña</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white focus:border-indigo-500"
                required
              />
            </div>

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                Volver
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
