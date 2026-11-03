"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    serviceType: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío de formulario
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Formulario enviado",
      description: "Nos pondremos en contacto contigo a la brevedad.",
    })

    setFormData({
      name: "",
      email: "",
      company: "",
      phone: "",
      serviceType: "",
      message: "",
    })

    setIsSubmitting(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Tu nombre"
              required
              value={formData.name}
              onChange={handleChange}
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
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              name="company"
              placeholder="Nombre de tu empresa"
              value={formData.company}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+56 9 XXXX XXXX"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceType">Tipo de servicio</Label>
          <Select value={formData.serviceType} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
                 <SelectItem value="bienestar-ia">Sistema de Ventas y Automatización con IA (Bienestar)</SelectItem>
                 <SelectItem value="rediseno">Rediseño de procesos</SelectItem>
                 <SelectItem value="digitalizacion">Digitalización y automatización</SelectItem>
                 <SelectItem value="erp">Levantamiento de procesos y selección de ERP</SelectItem>
                 <SelectItem value="rpa">Automatización RPA</SelectItem>
                 <SelectItem value="gestion-agricola">Gestión agrícola (SOFIA, Webfleet)</SelectItem>
                 <SelectItem value="telemetria">Sistemas de telemetría y monitoreo</SelectItem>
                 <SelectItem value="tramites-tgr">Automatización de trámites TGR</SelectItem>
                 <SelectItem value="licitaciones">Consultoría para licitaciones públicas</SelectItem>
                 <SelectItem value="consultoria">Consultoría estratégica</SelectItem>
                 <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            name="message"
            placeholder="Describe brevemente tu proyecto o necesidad"
            className="min-h-[100px]"
            value={formData.message}
            onChange={handleChange}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar consulta"}
        </Button>
      </form>
      <Toaster />
    </>
  )
}
