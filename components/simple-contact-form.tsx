"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SimpleContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        company: "",
        phone: "",
        service_type: "otro",
        consultation_id: null,
        meeting_time: null,
        meeting_time_formatted: "",
      }

      const response = await fetch("/api/submit-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data?.success) {
        toast({
          title: "¡Mensaje enviado con éxito!",
          description: "Nos pondremos en contacto contigo a la brevedad.",
        })
        setFormData({
          name: "",
          email: "",
          message: "",
        })
      } else {
        throw new Error(data?.error || "Error al enviar el mensaje")
      }
    } catch (error: any) {
      console.error("Error submitting contact form:", error)
      toast({
        variant: "destructive",
        title: "Error al enviar el mensaje",
        description: error.message || "Por favor, intenta nuevamente más tarde.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-xl max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Nombre completo
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Tu nombre"
            required
            value={formData.name}
            onChange={handleChange}
            className="bg-background/50 border-border focus:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="bg-background/50 border-border focus:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium text-foreground">
            Mensaje
          </Label>
          <Textarea
            id="message"
            name="message"
            placeholder="¿En qué te puedo ayudar?"
            required
            value={formData.message}
            onChange={handleChange}
            className="min-h-[120px] bg-background/50 border-border focus:border-primary/50"
          />
        </div>

        <Button
          type="submit"
          className="w-full font-semibold transition-all duration-300 hover:scale-[1.02]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Enviando...
            </span>
          ) : (
            "Enviar"
          )}
        </Button>
      </form>
      <Toaster />
    </div>
  )
}
