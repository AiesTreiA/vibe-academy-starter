"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarDays, Clock, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { validateEmailClient } from "@/lib/email-validator-client"

interface MeetingSchedulerProps {
  initialContactData: {
    name: string
    email: string
    company: string
    phone: string
    service_type: string
    message: string
  }
  consultationId: string | null
  onBookingSubmit: (bookingData: {
    name: string
    email: string
    company: string
    phone: string
    service_type: string
    message: string
    consultation_id: string | null
    meeting_time: string
    meeting_time_formatted: string
  }) => Promise<void>
  onBack: () => void
}

interface TimeSlot {
  start: Date
  end: Date
  isAvailable: boolean
}

const MEETING_DURATION_MIN = 45
const SLOT_STEP_MIN = 30 // Tramos de 30 minutos

export default function MeetingScheduler({
  initialContactData,
  consultationId,
  onBookingSubmit,
  onBack,
}: MeetingSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Select slot, 2: Enter contact details, 3: Success
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Estado para los datos de contacto, inicializado con initialContactData
  const [contactForm, setContactForm] = useState({
    name: initialContactData.name || "",
    email: initialContactData.email || "",
    company: initialContactData.company || "",
    phone: initialContactData.phone || "",
    message: initialContactData.message || "",
  })

  // Actualizar contactForm si los datos iniciales de contacto cambian (evitando re-renderizados por cambios de referencia de objeto)
  useEffect(() => {
    setContactForm({
      name: initialContactData.name || "",
      email: initialContactData.email || "",
      company: initialContactData.company || "",
      phone: initialContactData.phone || "",
      message: initialContactData.message || "",
    })
  }, [
    initialContactData.name,
    initialContactData.email,
    initialContactData.company,
    initialContactData.phone,
    initialContactData.message,
  ])

  const generateSlotsForDay = useCallback((date: Date, busySlots: Array<{ start: string; end: string }> = []): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 9 // 9 AM
    const endHour = 18 // 6 PM

    // Only generate slots for Monday to Friday
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return []
    }

    const currentTime = new Date(date)
    currentTime.setHours(startHour, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(endHour, 0, 0, 0)

    const parsedBusy = busySlots.map((b) => ({
      start: new Date(b.start).getTime(),
      end: new Date(b.end).getTime(),
    }))

    while (currentTime.getTime() < endOfDay.getTime()) {
      const slotStart = new Date(currentTime)
      const slotEnd = new Date(currentTime.getTime() + MEETING_DURATION_MIN * 60 * 1000)

      if (slotEnd.getTime() > endOfDay.getTime()) {
        break
      }

      const slotStartMs = slotStart.getTime()
      const slotEndMs = slotEnd.getTime()
      const isFuture = slotStartMs > Date.now()

      // Comprobar si traslapa con alguna reunión/evento ocupado
      const isOverlapping = parsedBusy.some((b) => slotStartMs < b.end && slotEndMs > b.start)

      slots.push({
        start: slotStart,
        end: slotEnd,
        isAvailable: isFuture && !isOverlapping,
      })

      // Avanzar en tramos de 30 minutos
      currentTime.setTime(currentTime.getTime() + SLOT_STEP_MIN * 60 * 1000)
    }
    return slots
  }, [])

  // Efecto para consultar disponibilidad real y generar slots cuando cambia la fecha
  useEffect(() => {
    let isMounted = true
    const dateStr = format(currentDate, "yyyy-MM-dd")
    console.log("📅 Date changed, fetching busy slots for:", dateStr)
    setLoadingSlots(true)

    fetch(`/api/calendar/busy-slots?date=${dateStr}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          const busy = json.success && json.busySlots ? json.busySlots : []
          setAvailableSlots(generateSlotsForDay(currentDate, busy))
        }
      })
      .catch((err) => {
        console.error("Error loading busy slots:", err)
        if (isMounted) {
          setAvailableSlots(generateSlotsForDay(currentDate, []))
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false)
      })

    setSelectedSlot(null)
    // Solo resetear al paso 1 si no estamos en el proceso de éxito
    if (!submissionSuccess) {
      setStep(1)
    }

    return () => {
      isMounted = false
    }
  }, [currentDate, generateSlotsForDay, submissionSuccess])

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      console.log("🕐 Slot selected:", format(slot.start, "PPPPp", { locale: es }))
      setSelectedSlot(slot)
      setStep(2)
    }
  }

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
    if (name === "email" && emailError) {
      setEmailError(null)
    }
  }

  const canSubmitContactForm = () => {
    return contactForm.name && contactForm.email
  }

  const handleSubmitBooking = async () => {
    setEmailError(null)
    if (!selectedSlot) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un horario para tu reunión.",
        variant: "destructive",
      })
      return
    }

    if (!canSubmitContactForm()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    // Validar el correo en el cliente (sintaxis + desechables)
    const emailCheck = validateEmailClient(contactForm.email)
    if (!emailCheck.isValid) {
      const errorReason = emailCheck.reason || "Por favor, ingresa un correo real."
      setEmailError(errorReason)
      toast({
        title: "Correo inválido",
        description: errorReason,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    let isSuccess = false

    try {
      // Formateamos la hora localmente en el navegador para evitar desfases de zona horaria en el servidor
      const meetingTimeFormatted = format(selectedSlot.start, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })

      console.log("🚀 Submitting booking with data:", {
        ...contactForm,
        consultation_id: consultationId,
        service_type: initialContactData.service_type,
        meeting_time: selectedSlot.start.toISOString(),
        meeting_time_formatted: meetingTimeFormatted,
      })

      await onBookingSubmit({
        ...contactForm,
        consultation_id: consultationId,
        service_type: initialContactData.service_type,
        meeting_time: selectedSlot.start.toISOString(),
        meeting_time_formatted: meetingTimeFormatted,
      })

      console.log("✅ Booking submitted successfully, redirecting...")
      isSuccess = true
    } catch (error: any) {
      console.error("❌ Error submitting booking:", error)
      const errorMsg = error?.message || "Hubo un problema al agendar tu reunión. Intenta nuevamente."
      setEmailError(errorMsg)
    } finally {
      if (!isSuccess) {
        setIsSubmitting(false)
      }
    }
  }

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  // Mostrar pantalla de éxito si la reserva fue exitosa
  if (step === 3 && submissionSuccess) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center mb-6 relative">
          {/* Circular animated glow background */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-30">
            <div className="w-24 h-24 rounded-full bg-primary/40 filter blur-xl animate-pulse-glow" />
          </div>
          
          {/* Sleek SVG drawing checkmark */}
          <div className="flex justify-center mb-4">
            <svg
              className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] animate-float"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-emerald-500/20"
                strokeWidth="2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
                className="animate-draw-checkmark"
              />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
            ¡Reunión Agendada Exitosamente!
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Tu reserva ha sido confirmada. Te redirigiremos automáticamente.
          </p>
        </div>

        {selectedSlot && (
          <Card className="bg-glassmorphism border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-md overflow-hidden relative">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-primary/80">Detalles de tu reunión</h4>
                <p className="text-lg font-bold text-foreground">
                  {format(selectedSlot.start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium mt-1">
                  <Clock className="w-4 h-4" />
                  {format(selectedSlot.start, "HH:mm", { locale: es })} - {format(selectedSlot.end, "HH:mm", { locale: es })} (Hora Local)
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Recibirás un correo electrónico de confirmación con los detalles y el enlace de acceso.</p>
            </CardContent>
            
            {/* Visual Countdown Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-primary w-full animate-shrink-width" />
          </Card>
        )}

        <div className="text-center pt-2">
          <Button onClick={() => (window.location.href = "/thank-you")} className="bg-primary hover:bg-primary/80 text-white font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
            Ir a página de confirmación ahora
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Agenda tu Reunión</h3>
        <p className="text-muted-foreground">Selecciona una fecha y hora para discutir tu roadmap personalizado.</p>
      </div>

      {step === 1 && (
        <Card className="animate-fade-in-up border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
            <Button variant="ghost" size="icon" onClick={handlePrevDay} disabled={isToday} className="hover:bg-primary/10 hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
              {format(currentDate, "PPPP", { locale: es })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="hover:bg-primary/10 hover:text-primary transition-colors">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingSlots ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Consultando disponibilidad en Google Calendar...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay horarios disponibles para este día. Por favor, selecciona otra fecha.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {availableSlots.map((slot, index) => {
                  const isSelected = selectedSlot?.start.getTime() === slot.start.getTime()
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className={`flex flex-col h-auto py-3 transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] ${
                        isSelected
                          ? "shadow-[0_0_15px_rgba(59,130,246,0.4)] border-primary bg-primary text-white font-bold"
                          : "hover:border-primary/50 hover:bg-primary/5 border-border/80"
                      } ${!slot.isAvailable ? "opacity-30 cursor-not-allowed hover:scale-100 hover:translate-y-0" : ""}`}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.isAvailable}
                    >
                      <span className="font-bold text-base tracking-wide">{format(slot.start, "HH:mm", { locale: es })}</span>
                      <span className="text-xs text-muted-foreground/80 mt-0.5 font-medium">{format(slot.end, "HH:mm", { locale: es })}</span>
                    </Button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedSlot && (
        <div className="space-y-6 animate-fade-in-up">
          <Card className="border-primary/30 bg-primary/5 shadow-[0_0_20px_rgba(59,130,246,0.1)] backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary animate-pulse" />
              <div>
                <p className="font-semibold text-sm text-primary/90">Horario Seleccionado:</p>
                <p className="text-base font-semibold text-foreground">{format(selectedSlot.start, "PPPPp", { locale: es })}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tus Datos de Contacto</CardTitle>
              <p className="text-muted-foreground text-sm">
                Por favor, confirma o completa tus datos para finalizar la reserva.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    required
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    className={emailError ? "border-red-500 ring-2 ring-red-500/20 focus-visible:ring-red-500" : ""}
                  />
                  {emailError && (
                    <p className="text-xs text-red-400 font-medium flex items-center gap-1.5 mt-1 bg-red-950/40 p-2 rounded-md border border-red-800/50">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyDisplay">Empresa</Label>
                <Input
                  id="companyDisplay"
                  value={contactForm.company}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+56 9 XXXX XXXX"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje adicional (opcional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="¿Hay algo específico que te gustaría discutir en la reunión?"
                  className="min-h-[100px]"
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
        {step === 1 && (
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Volver al roadmap
          </Button>
        )}
        {step === 2 && (
          <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Cambiar horario
          </Button>
        )}

        {step === 2 && (
          <Button
            onClick={handleSubmitBooking}
            disabled={!canSubmitContactForm() || isSubmitting}
            className="w-full sm:flex-1 flex items-center justify-center"
            size="lg"
          >
            {isSubmitting ? "Agendando..." : "Confirmar Reunión"}
          </Button>
        )}
      </div>
      <Toaster />
    </div>
  )
}
