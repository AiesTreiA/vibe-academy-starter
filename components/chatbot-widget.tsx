"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { MessageSquare, X, Send, Check, Copy, Gift, Globe, Plus, Paperclip, Image as ImageIcon, FileText, Maximize2, Minimize2 } from "lucide-react"

export interface AttachmentData {
  type: "image" | "file"
  name: string
  content: string
  previewUrl?: string
}

interface Message {
  role: "user" | "model"
  content: string
  attachment?: AttachmentData
}

// Renders **bold** and [link text](url)
function renderMessage(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(...renderBold(text.slice(lastIndex, match.index)))
    const [, linkText, href] = match
    parts.push(
      <a key={match.index} href={href} target={href.startsWith("/") || href.startsWith("#") ? "_self" : "_blank"}
        rel="noopener noreferrer"
        className="underline font-semibold text-indigo-300 hover:text-white transition-colors cursor-pointer"
      >{linkText}</a>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(...renderBold(text.slice(lastIndex)))
  return parts
}

function renderBold(text: string): React.ReactNode[] {
  const boldRegex = /\*\*([^*]+)\*\*/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(<strong key={match.index}>{match[1]}</strong>)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

// Country config: code → { flag, label, slang hint }
const COUNTRIES: Record<string, { flag: string; label: string }> = {
  CL: { flag: "🇨🇱", label: "Chile" },
  AR: { flag: "🇦🇷", label: "Argentina" },
  MX: { flag: "🇲🇽", label: "México" },
  CO: { flag: "🇨🇴", label: "Colombia" },
  PE: { flag: "🇵🇪", label: "Perú" },
  ES: { flag: "🇪🇸", label: "España" },
  US: { flag: "🇺🇸", label: "USA (ES)" },
  OTHER: { flag: "🌎", label: "Otro" },
}

export default function ChatbotWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [agentType, setAgentType] = useState<"ariel" | "cierre" | "eustacio">("ariel")
  const [agentName, setAgentName] = useState("Ariel")
  const [nameFlash, setNameFlash] = useState(false) // triggers header flash animation
  const [greetingSent, setGreetingSent] = useState(false) // tracks if initial greeting has been sent
  const [discountRequested, setDiscountRequested] = useState(false) // tracks if user asked about discounts
  const [tone, setTone] = useState<"formal" | "informal">("informal")

  // Link follow-up & consecutive unanswered message state
  const [pendingLink, setPendingLink] = useState<{ type: "studio" | "lab"; sentAt: number; followUpCount: number } | null>(null)
  const [consecutiveBotMessages, setConsecutiveBotMessages] = useState<number>(0)
  const [isPausedUntilTomorrow, setIsPausedUntilTomorrow] = useState<boolean>(false)
  const userRepliedRef = useRef<boolean>(false)
  const timer1Ref = useRef<NodeJS.Timeout | null>(null)
  const timer2Ref = useRef<NodeJS.Timeout | null>(null)

  // Helper: scroll to a section ID with a highlight pulse
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    // brief highlight ring
    el.style.transition = "box-shadow 0.3s ease"
    el.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.6), 0 0 32px 8px rgba(99,102,241,0.18)"
    el.style.borderRadius = "12px"
    setTimeout(() => {
      el.style.boxShadow = ""
      el.style.borderRadius = ""
    }, 1800)
  }

  // Helper: parse and strip special markers from a bubble text
  const parseMarkers = (text: string): { clean: string; persona?: string; scroll?: string; reset?: boolean; color?: string } => {
    let clean = text
    let persona: string | undefined
    let scroll: string | undefined
    let reset = false
    let color: string | undefined

    const personaMatch = clean.match(/\[\[PERSONA:([^\]]+)\]\]/)
    if (personaMatch) {
      persona = personaMatch[1].trim()
      clean = clean.replace(personaMatch[0], "").trimStart()
    }
    const scrollMatch = clean.match(/\[\[SCROLL:([^\]]+)\]\]/)
    if (scrollMatch) {
      scroll = scrollMatch[1].trim()
      clean = clean.replace(scrollMatch[0], "").trimStart()
    }
    const resetMatch = clean.match(/\[\[RESET_CHAT\]\]/)
    if (resetMatch) {
      reset = true
      clean = clean.replace(resetMatch[0], "").trimStart()
    }
    const colorMatch = clean.match(/\[\[COLOR:([^\]]+)\]\]/)
    if (colorMatch) {
      color = colorMatch[1].trim()
      clean = clean.replace(colorMatch[0], "").trimStart()
    }
    return { clean, persona, scroll, reset, color }
  }

  const [coreName, suffix] = agentType === "eustacio" && agentName.includes(" · ")
    ? agentName.split(" · ")
    : [agentName, ""]

  // Listen for Eustacio launch event from terminal mockup
  useEffect(() => {
    const handleOpenEustacio = (e: Event) => {
      const customEvent = e as CustomEvent
      const charName = customEvent.detail?.character || "Steve Jobs"
      setAgentType("eustacio")
      setAgentName(charName)
      setHasPlayed(true)
      setIsOpen(true)
      setInitialized(false) // Force greeting reload with Eustacio persona
    }
    window.addEventListener("open-chatbot-eustacio", handleOpenEustacio)
    return () => {
      window.removeEventListener("open-chatbot-eustacio", handleOpenEustacio)
    }
  }, [])

  // Listen for general open chatbot event (from popups, CTA buttons, etc.)
  useEffect(() => {
    const handleOpenChatbot = (e: Event) => {
      const customEvent = e as CustomEvent
      setIsOpen(true)
      setHasPlayed(true)
      if (customEvent.detail?.prefill) {
        setInputValue(customEvent.detail.prefill)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 150)
      }
    }
    window.addEventListener("open-chatbot", handleOpenChatbot)
    return () => {
      window.removeEventListener("open-chatbot", handleOpenChatbot)
    }
  }, [])

  // Geolocation state
  const [countryCode, setCountryCode] = useState<string>("CL")
  const [countryDetected, setCountryDetected] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  // Visitor timezone (IANA string, e.g. "America/Mexico_City")
  const [visitorTimezone, setVisitorTimezone] = useState<string>("America/Santiago")

  // Dev mode: check if running on localhost
  const [isDevMode, setIsDevMode] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Attachment State
  const [attachment, setAttachment] = useState<AttachmentData | null>(null)
  const attachmentInputRef = useRef<HTMLInputElement | null>(null)

  // Vibecodelab-only: expand/collapse panel and drag-over state
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragCounterRef = useRef(0)

  // Load an image File/Blob into the attachment state
  const loadImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo no debe superar los 5 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      setAttachment({ type: "image", name: file.name, content: dataUrl, previewUrl: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  // Drag & Drop handlers (vibecodelab only — gated at render time)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && [...e.dataTransfer.items].some(i => i.kind === "file" && i.type.startsWith("image/"))) {
      setIsDraggingOver(true)
    }
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDraggingOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDraggingOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) loadImageFile(file)
  }

  // Paste image with Ctrl+V (vibecodelab only — attached to textarea onPaste)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) loadImageFile(file)
        return
      }
    }
  }


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith("image/")) {
      loadImageFile(file)
    } else {
      // Max file size 5MB for text files
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no debe superar los 5 MB")
        return
      }
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target?.result as string
        setAttachment({
          type: "file",
          name: file.name,
          content: text
        })
      }
      reader.readAsText(file)
    }

    if (attachmentInputRef.current) attachmentInputRef.current.value = ""
  }

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)


  const isVibecodeLab = pathname?.includes("/vibecodelab")
  const isVibecodePage = pathname?.includes("/vibecode") && !isVibecodeLab
  const pageType = isVibecodeLab ? "vibecodelab" : isVibecodePage ? "bootcamp" : "consultoria"
  const country = COUNTRIES[countryCode] || COUNTRIES["OTHER"]

  // Detect dev mode on mount
  useEffect(() => {
    setIsDevMode(
      typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1")
    )
  }, [])

  // Detect and persist visitor timezone via Intl API + cookie
  useEffect(() => {
    if (typeof window === "undefined") return
    // Read from cookie first
    const cookieMatch = document.cookie.match(/(?:^|; )tz_visitor=([^;]+)/)
    if (cookieMatch) {
      setVisitorTimezone(decodeURIComponent(cookieMatch[1]))
      return
    }
    // Detect from browser
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected) {
        setVisitorTimezone(detected)
        // Persist in cookie for 7 days
        const maxAge = 7 * 24 * 60 * 60
        document.cookie = `tz_visitor=${encodeURIComponent(detected)}; Max-Age=${maxAge}; SameSite=Lax; path=/`
      }
    } catch {
      // Keep default "America/Santiago" if detection fails
    }
  }, [])

  // Detect country from IP only when chat is opened
  useEffect(() => {
    if (!isOpen || countryDetected) return
    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) {
          setCountryCode("CL")
          setCountryDetected(true)
          return
        }
        const code = data?.country_code
        if (code && COUNTRIES[code]) {
          setCountryCode(code)
        } else if (code) {
          setCountryCode("OTHER")
        }
        setCountryDetected(true)
      })
      .catch(() => {
        setCountryCode("CL") // default to Chile if fails
        setCountryDetected(true)
      })
  }, [countryDetected])

  // When chat opens, simulate human-like waiting before greeting
  useEffect(() => {
    if (isOpen && !initialized) {
      setInitialized(true)
      setMessages([])
      setCouponCode(null)
      setDiscountRequested(false)

      const startGreeting = async () => {
        // 1. Espera de lectura inicial (1s a 2s)
        const waitBeforeListen = 1000 + Math.random() * 1000
        await new Promise(r => setTimeout(r, waitBeforeListen))

        // 2. Mostrar indicador de escritura (1s a 2s)
        setIsTyping(true)
        const typingDelay = 1000 + Math.random() * 1000
        await new Promise(r => setTimeout(r, typingDelay))
        setIsTyping(false)

        let greeting = ""
        if (isVibecodeLab) {
          greeting = "¡Hola! 👋 Soy Steve, tu asistente vibecoder en Vibecode Lab. 🚀\n\nEstoy aquí para acompañarte en todo tu proceso: ya sea configurando tu entorno, resolviendo errores de compilación mientras construyes (build), estructurando tu app o apoyándote en la fase de salida al mercado.\n\n¿En qué etapa de tu proyecto te encuentras hoy o con qué te puedo ayudar?"
        } else if (tone === "formal") {
          if (agentType === "eustacio") {
            greeting = `Estimado(a), le saluda ${agentName}. En esta demostración en vivo he sido programado para adaptarme a mi personalidad y que pueda apreciar la fluidez con la que me comunico. Este es solo un ejemplo de las infinitas posibilidades en la configuración de su chatbot, el cual aprenderá a desarrollar en el bootcamp Vibecode Lab. ¿En qué le puedo asistir hoy?`
          } else if (agentType === "cierre") {
            greeting = `Estimado(a), buenas tardes. Mi nombre es ${agentName}. He notado que ha estado probando nuestro simulador de IA en la página. Cuénteme, ¿tiene algún proyecto en mente o le interesaría aprender a programarlos a nivel profesional?`
          } else {
            // Ariel
            greeting = isVibecodePage
              ? `Estimado(a), le saluda ${agentName}. Cuénteme, ¿qué le ha traído por aquí?`
              : `Estimado(a), le saluda ${agentName}. Cuénteme qué dificultades o desafíos está presentando en su negocio actualmente.`
          }
        } else {
          if (agentType === "eustacio") {
            greeting = `¡Hola! Soy ${agentName}. En esta demo en vivo me programaron para tener mi personalidad y que veas lo fluido que hablo. Esto es solo un ejemplo de que la configuración de tu chatbot no tiene límites y es exactamente lo que aprenderás a crear en el bootcamp Vibecode Lab. ¿Qué te gustaría preguntarme?`
          } else if (agentType === "cierre") {
            greeting = `Hola, ¿cómo estás? Soy ${agentName}. Vi que estuviste probando el simulador de IA en la página. Cuéntame, ¿tienes algún proyecto en mente o te dio curiosidad por aprender a programarlos?`
          } else {
            // Ariel
            greeting = isVibecodePage
              ? "Ey, ¿qué tal? 👋 Soy Ariel del equipo de Vibecode. Cuéntame, ¿estás buscando aprender a crear tus propias apps con IA o necesitas asesoría personalizada para tu proyecto?"
              : "Ey, ¿qué tal? 👋 Soy Ariel del equipo de Javier Mujica. Cuéntame, ¿tienes actualmente un proyecto, sitio web o aplicación funcionando, o estás partiendo desde cero?"
          }
        }

        setMessages([{ role: "model", content: greeting }])
        setGreetingSent(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }

      startGreeting()
    }
  }, [isOpen, initialized, agentType, agentName, tone, isVibecodeLab])

  // Load session from sessionStorage on mount & route change
  useEffect(() => {
    try {
      if (isVibecodeLab) {
        setAgentName("Steve")
        setAgentType("ariel")
        const saved = sessionStorage.getItem("vibecodelab_student_chat_session")
        if (saved) {
          const parsed = JSON.parse(saved)
          // Ensure messages don't contain old sales messages from Ariel
          const validMessages = (parsed.messages || []).filter((m: Message) => !m.content.includes("Soy Ariel del equipo"))
          if (validMessages.length > 0) {
            setMessages(validMessages)
            setInitialized(true)
          } else {
            setMessages([])
            setInitialized(false)
          }
          if (parsed.isOpen) setIsOpen(parsed.isOpen)
        } else {
          setMessages([])
          setInitialized(false)
        }
        return
      }

      const saved = sessionStorage.getItem("vibecode_chat_session")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.messages) setMessages(parsed.messages)
        if (parsed.isOpen) setIsOpen(parsed.isOpen)
        if (parsed.tone) setTone(parsed.tone)
        if (parsed.agentType) setAgentType(parsed.agentType)
        if (parsed.agentName) setAgentName(parsed.agentName)
        if (parsed.initialized) setInitialized(parsed.initialized)
        if (parsed.discountRequested) setDiscountRequested(parsed.discountRequested)
      }
    } catch (e) {
      console.error("Failed to load chat session:", e)
    }
  }, [isVibecodeLab])

  // Save session to sessionStorage on state change
  useEffect(() => {
    if (initialized) {
      try {
        const key = isVibecodeLab ? "vibecodelab_student_chat_session" : "vibecode_chat_session"
        const sessionData = {
          messages,
          isOpen,
          tone,
          agentType: isVibecodeLab ? "ariel" : agentType,
          agentName: isVibecodeLab ? "Steve" : agentName,
          initialized,
          discountRequested
        }
        sessionStorage.setItem(key, JSON.stringify(sessionData))
      } catch (e) {
        console.error("Failed to save chat session:", e)
      }
    }
  }, [messages, isOpen, tone, agentType, agentName, initialized, discountRequested, isVibecodeLab])

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, isOpen])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    const currentAttachment = attachment

    if ((!text && !currentAttachment) || isTyping) return

    // Quick client-side check for reset commands
    if (/^\s*(borra(r)?\s+(todo\s+el\s+)?chat|reinicia(r)?\s+(el\s+)?chat|comenzar?\s+de\s+cero)\b/i.test(text)) {
      setInputValue("")
      setAttachment(null)
      setMessages([])
      setInitialized(false)
      setCouponCode(null)
      setDiscountRequested(false)
      setAgentType("ariel")
      setAgentName("Ariel")
      sessionStorage.removeItem("vibecode_chat_session")
      return
    }

    // Detect if user is asking about discounts or promotions
    if (/\b(descuento|promo|oferta|código|cupón)\b/i.test(text)) {
      setDiscountRequested(true)
    }

    // Reset unanswered counters and timers when user sends a message
    userRepliedRef.current = true
    setConsecutiveBotMessages(0)
    setIsPausedUntilTomorrow(false)
    if (timer1Ref.current) clearTimeout(timer1Ref.current)
    if (timer2Ref.current) clearTimeout(timer2Ref.current)

    setInputValue("")
    setAttachment(null)

    const userMessageContent = text || (currentAttachment?.type === "image" ? "[Imagen adjunta]" : `[Archivo: ${currentAttachment?.name}]`)
    setMessages(prev => [...prev, { role: "user", content: userMessageContent, attachment: currentAttachment || undefined }])

    try {
      const historyPayload = messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }))

      // 1. Simular tiempo de lectura/espera antes de que empiece a escribir (1 a 2 segundos)
      const readDelay = 1000 + Math.random() * 1000
      
      const startApiCall = Date.now()
      const apiPromise = fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          attachment: currentAttachment,
          history: historyPayload,
          page: pageType,
          country: countryCode,
          timezone: visitorTimezone,
          isEustacio: agentType === "eustacio",
          celebrityName: agentType === "eustacio" ? agentName : undefined,
          agentType: agentType,
          agentName: agentName,
          tone: tone
        })
      })

      const elapsedApiInit = Date.now() - startApiCall
      if (readDelay > elapsedApiInit) {
        await new Promise(r => setTimeout(r, readDelay - elapsedApiInit))
      }

      // 2. Simular tiempo en que muestra "escribiendo..." (1 a 2 segundos)
      setIsTyping(true)
      const writeDelay = 1000 + Math.random() * 1000

      const [response] = await Promise.all([
        apiPromise,
        new Promise(r => setTimeout(r, writeDelay))
      ])

      setIsTyping(false)

      if (!response.ok) throw new Error("API error")

      const data = await response.json()
      const rawReply: string = data.reply || "¿Me puedes repetir eso?"
      const apiUserName: string = data.userName || "AMIGO"

      const bubbles = rawReply.split("|||").map((b: string) => b.trim()).filter(Boolean)

      for (let i = 0; i < bubbles.length; i++) {
        if (i > 0) {
          setIsTyping(true)
          await new Promise(r => setTimeout(r, 5000))
        }
        setIsTyping(false)

        const { clean, persona, scroll, reset, color } = parseMarkers(bubbles[i])

        // Handle [[PERSONA:Name]] — update header with flash and keep history for continuity
        if (persona && i === 0) {
          setAgentName(persona)
          setAgentType("eustacio")
          setNameFlash(true)
          setTimeout(() => setNameFlash(false), 700)
        }

        // Handle [[SCROLL:id]]
        if (scroll && i === 0) {
          setTimeout(() => scrollToSection(scroll!), 600)
        }

        // Handle [[COLOR:color]]
        if (color) {
          document.body.style.transition = 'background-color 0.8s ease-in-out'
          document.body.style.backgroundColor = color
          document.body.style.backgroundImage = 'none'
        }

        // Handle [[RESET_CHAT]]
        if (reset) {
          setTimeout(() => {
            setMessages([])
            setInitialized(false)
            setCouponCode(null)
            setDiscountRequested(false)
            setAgentType("ariel")
            setAgentName("Ariel")
            sessionStorage.removeItem("vibecode_chat_session")
          }, 1500)
        }

        setMessages(prev => [...prev, { role: "model", content: clean }])
        if (i < bubbles.length - 1) {
          setIsTyping(true)
          await new Promise(r => setTimeout(r, 5000))
        }
      }

      // Check if rawReply contains Vibecode Studio or Vibecode Lab booking/registration links
      const hasStudioLink = /\/agendar|javiermujica\.com\/agendar|deeplink\/agendar/i.test(rawReply)
      const hasLabLink = /\/vibecode|javiermujica\.com\/vibecode|deeplink\/vibecode/i.test(rawReply)

      if (hasStudioLink || hasLabLink) {
        const linkType: "studio" | "lab" = hasStudioLink ? "studio" : "lab"
        setPendingLink({ type: linkType, sentAt: Date.now(), followUpCount: 0 })
        userRepliedRef.current = false

        // Timer 1: 1 minute (60,000ms) after link sent
        timer1Ref.current = setTimeout(() => {
          if (!userRepliedRef.current) {
            const firstFollowUpMsg = linkType === "studio"
              ? "Aún no me llega la cita, ¿pudiste agendar?"
              : "Aún no veo tu inscripción, ¿pudiste inscribirte?"

            setMessages(prev => [...prev, { role: "model", content: firstFollowUpMsg }])
            setConsecutiveBotMessages(1)
            setPendingLink(prev => prev ? { ...prev, followUpCount: 1 } : null)

            // Timer 2: 5 minutes (300,000ms) after 1st follow-up
            timer2Ref.current = setTimeout(() => {
              if (!userRepliedRef.current) {
                const secondFollowUpMsg = linkType === "studio"
                  ? "¿Tuviste algún problema para seleccionar el horario? Avísame si necesitas ayuda =)"
                  : "¿Te dio algún problema el enlace de inscripción? Cuéntame y te ayudo =)"

                setMessages(prev => [...prev, { role: "model", content: secondFollowUpMsg }])
                setConsecutiveBotMessages(2)
                setPendingLink(prev => prev ? { ...prev, followUpCount: 2 } : null)
                setIsPausedUntilTomorrow(true) // 2 consecutive unanswered messages limit -> pause until tomorrow
              }
            }, 5 * 60 * 1000)
          }
        }, 60 * 1000)
      }

      const couponMatch = rawReply.match(/\b[A-ZÁÉÍÓÚ]{2,}(\d{1,2})\b/)
      if (couponMatch) {
        const code = couponMatch[0].toUpperCase()
        setCouponCode(code)
        // Automatically open the registration modal and apply the coupon
        window.dispatchEvent(new CustomEvent("open-enrollment-modal", { 
          detail: { 
            coupon: code,
            name: apiUserName !== "AMIGO" ? apiUserName : undefined
          } 
        }))
      }

    } catch (err) {
      console.error(err)
      setIsTyping(false)
      setMessages(prev => [...prev, { role: "model", content: "Mmm, tuve un problema de conexión. ¿Me lo repites?" }])
    }
  }

  const copyCoupon = () => {
    if (!couponCode) return
    navigator.clipboard.writeText(couponCode).catch(() => {})
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
    if (isVibecodePage) {
      const url = new URL(window.location.href)
      url.searchParams.set("coupon", couponCode)
      window.history.replaceState({}, "", url.toString())
      window.location.reload()
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      if (messages.length === 0 || !initialized) {
        setInitialized(false)
        if (isVibecodeLab) {
          setAgentType("ariel")
          setAgentName("Steve")
        } else if (hasPlayed) {
          setAgentType("cierre")
          const names = ["Pablo", "Daniela", "Felipe"]
          setAgentName(names[Math.floor(Math.random() * names.length)])
        } else {
          setAgentType("ariel")
          setAgentName("Ariel")
        }
      }
    }
    setIsOpen(prev => !prev)
  }

  const suggestions = isVibecodeLab
    ? [
        { label: "🐛 Error de Consola", text: "Tengo un error en mi terminal y necesito ayuda pedagógica para solucionarlo." },
        { label: "🔑 Configurar .env", text: "¿Cómo creo y configuro mi archivo .env con Supabase y Gemini?" },
        { label: "🩺 Script doctor.js", text: "¿Para qué sirve el script doctor.js y cómo ejecuto el diagnóstico?" },
      ]
    : isVibecodePage
    ? [
        { label: "🎁 Beneficio Sorpresa", text: "Vi en la página que tienen un beneficio sorpresa para mí, ¿de qué se trata?" },
        { label: "📅 ¿Cuándo parte?", text: "¿Cuándo parten las clases de la Generación 2?" },
        { label: "💸 ¿Hay descuento?", text: "Me parece caro, ¿existe alguna promo?" },
      ]
    : [
        { label: "🤖 ¿Qué automatizas?", text: "¿Qué tipo de procesos puedes automatizar?" },
        { label: "💰 ¿Cuánto cuesta?", text: "¿Cuánto sale una consultoría?" },
        { label: "🎁 60% OFF", text: "¿Cómo funciona lo del 60% de descuento en el primer proyecto?" },
      ]

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end select-none pointer-events-none" style={{ maxWidth: "calc(100vw - 1.5rem)" }}>
      <div className="pointer-events-auto flex flex-col items-end">
        {/* Chat Panel */}
        {isOpen && (
          <div
            className={`relative mb-4 flex flex-col overflow-hidden rounded-2xl border bg-slate-950/97 shadow-2xl backdrop-blur-md transition-all duration-300 ${isDraggingOver ? "border-indigo-500/80 ring-2 ring-indigo-500/40" : "border-slate-800/80"}`}
            style={{
              width: isVibecodeLab
                ? (isExpanded ? "min(720px, calc(100vw - 2rem))" : "min(480px, calc(100vw - 2rem))")
                : "min(360px, calc(100vw - 2rem))",
              height: isVibecodeLab
                ? (isExpanded ? "calc(100dvh - 5.5rem)" : "min(680px, calc(100dvh - 5.5rem))")
                : "min(520px, calc(100dvh - 7.5rem))",
              animation: "chatSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards",
              transformOrigin: "bottom right"
            }}
            {...(isVibecodeLab ? {
              onDragEnter: handleDragEnter,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onDrop: handleDrop
            } : {})}
          >
          {/* Drag-over overlay — vibecodelab only */}
          {isVibecodeLab && isDraggingOver && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-slate-950/90 pointer-events-none">
              <ImageIcon className="h-10 w-10 text-indigo-400 mb-3 animate-bounce" />
              <p className="text-sm font-semibold text-indigo-300">Suelta aquí tu captura</p>
              <p className="text-[10px] text-slate-400 mt-1">Se adjuntará al próximo mensaje</p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-green-400 to-indigo-500 text-xs font-bold text-white">
                  {isVibecodeLab ? "ST" : agentName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-slate-950 bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold text-slate-100 transition-all duration-300 ${nameFlash ? "scale-105 text-indigo-300" : ""}`}
                  >
                    {isVibecodeLab ? "Steve" : agentName}
                  </span>
                  {agentType !== "eustacio" && (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[6px] font-bold text-white">✓</span>
                  )}
                </div>
                <span className="text-[9px] text-slate-400">
                  {isVibecodeLab ? "Asistente Vibecoder · En línea" : agentType === "eustacio" ? "Demo de IA · En línea" : "En línea"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Country badge — always visible, clickable only in dev */}
              {!isVibecodeLab && (
                <div className="relative">
                  <button
                    onClick={() => isDevMode && setShowCountryPicker(p => !p)}
                    title={isDevMode ? "Cambiar país (modo dev)" : `Detectado: ${country.label}`}
                    className={`flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 transition ${isDevMode ? "hover:border-indigo-600 hover:text-white cursor-pointer" : "cursor-default"}`}
                  >
                    <span>{country.flag}</span>
                    <span>{country.label}</span>
                    {isDevMode && <Globe className="h-2.5 w-2.5 ml-0.5 text-indigo-400" />}
                  </button>

                  {/* Dev country picker dropdown */}
                  {isDevMode && showCountryPicker && (
                    <div className="absolute right-0 top-7 z-50 w-36 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
                      {Object.entries(COUNTRIES).map(([code, { flag, label }]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setCountryCode(code)
                            setShowCountryPicker(false)
                            // Reset conversation to apply new country context
                            setInitialized(false)
                            setMessages([])
                            setIsTyping(true)
                            setTimeout(() => {
                              setInitialized(true)
                              setIsTyping(false)
                              setMessages([{ role: "model", content: "Ey, ¿qué tal? Soy el asistente de Javier. Cuéntame." }])
                            }, 900)
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] text-left transition hover:bg-slate-900 ${countryCode === code ? "text-indigo-400 font-bold" : "text-slate-400"}`}
                        >
                          <span>{flag}</span><span>{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Expand/collapse button — vibecodelab only */}
              {isVibecodeLab && (
                <button
                  onClick={() => setIsExpanded(p => !p)}
                  aria-label={isExpanded ? "Reducir chat" : "Expandir chat"}
                  title={isExpanded ? "Reducir" : "Expandir"}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              )}

              <button
                onClick={handleToggle}
                aria-label="Cerrar chat"
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tone Switcher Bar — hidden in vibecodelab */}
          {!isVibecodeLab && (
            <div className="flex items-center justify-between bg-slate-900/40 border-b border-slate-800/60 px-4 py-2 shrink-0 text-[10px] text-slate-400">
              <span className="font-medium tracking-wide">Tono de conversación:</span>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800/80 rounded-full p-0.5 shadow-inner">
                <button
                  onClick={() => {
                    if (tone !== "informal") {
                      setTone("informal")
                      if (messages.length <= 1) {
                        setInitialized(false)
                        setMessages([])
                      }
                    }
                  }}
                  className={`px-3 py-0.5 rounded-full transition-all duration-200 text-[10px] font-bold ${
                    tone === "informal"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20"
                      : "hover:text-slate-200 cursor-pointer"
                  }`}
                >
                  Tú (Informal)
                </button>
                <button
                  onClick={() => {
                    if (tone !== "formal") {
                      setTone("formal")
                      if (messages.length <= 1) {
                        setInitialized(false)
                        setMessages([])
                      }
                    }
                  }}
                  className={`px-3 py-0.5 rounded-full transition-all duration-200 text-[10px] font-bold ${
                    tone === "formal"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/20"
                      : "hover:text-slate-200 cursor-pointer"
                  }`}
                >
                  Usted (Formal)
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-950/20 p-4" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-none bg-indigo-600 text-white"
                      : "rounded-bl-none border border-slate-800/40 bg-slate-900 text-slate-200"
                  }`}
                >
                  {msg.attachment && (
                    <div className="mb-2 overflow-hidden rounded-lg bg-slate-950/60 p-1.5 border border-white/20">
                      {msg.attachment.type === "image" ? (
                        <img
                          src={msg.attachment.previewUrl || msg.attachment.content}
                          alt={msg.attachment.name}
                          className="max-h-40 w-full rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(msg.attachment?.content, "_blank")}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-200 truncate">
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === "model" ? renderMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* 3-dot typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-none border border-slate-800/40 bg-slate-900 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "160ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "320ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Coupon bar */}
          {couponCode && discountRequested && (
            <div className="flex items-center justify-between border-t border-b border-indigo-500/25 bg-indigo-950/80 px-4 py-2 text-[10px] text-indigo-300 gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 shrink-0" />
                <span>Cupón detectado: <strong>{couponCode}</strong></span>
              </div>
              <button
                onClick={copyCoupon}
                className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-indigo-500/20 bg-slate-950 px-2.5 py-1 font-bold text-indigo-200 transition hover:text-white"
              >
                {copySuccess ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copySuccess ? "Copiado" : isVibecodePage ? "Copiar y Registrarse" : "Copiar"}
              </button>
            </div>
          )}

          {/* Suggestion chips */}
          {messages.length <= 2 && !isTyping && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-900/60 bg-slate-950 px-3 py-2 shrink-0" style={{ scrollbarWidth: "none" }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSendMessage(s.text)}
                  className="shrink-0 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] text-indigo-400 transition hover:bg-slate-800"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={attachmentInputRef}
            type="file"
            accept="image/*,.txt,.js,.ts,.tsx,.py,.json,.log,.env,.md"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attachment Preview Bar */}
          {attachment && (
            <div className="flex items-center justify-between bg-slate-950 border-t border-slate-800 px-3 py-1.5 text-xs text-slate-300 gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {attachment.type === "image" ? (
                  <img src={attachment.previewUrl} alt="Adjunto" className="h-7 w-7 rounded object-cover border border-slate-700 shrink-0" />
                ) : (
                  <div className="p-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono shrink-0">
                    📄
                  </div>
                )}
                <span className="truncate text-[11px] font-medium text-indigo-200">{attachment.name}</span>
              </div>
              <button
                onClick={() => setAttachment(null)}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded-full shrink-0"
                title="Quitar adjunto"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-end gap-1.5 border-t border-slate-850 bg-slate-900/60 p-2.5 shrink-0">
            {/* Attach button — compact (+) outside vibecodelab, labeled inside */}
            {isVibecodeLab ? (
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                title="Adjuntar imagen o archivo · También puedes arrastrar o pegar con Ctrl+V"
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 h-8 text-[10px] font-medium text-slate-300 hover:text-white transition whitespace-nowrap"
              >
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Adjuntar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                title="Adjuntar imagen o archivo de código"
                className="shrink-0 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 h-8 w-8 text-slate-300 hover:text-white transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}

            {/* Input: textarea in vibecodelab, text input elsewhere */}
            {isVibecodeLab ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                rows={1}
                placeholder={attachment ? "Añadir mensaje (opcional)..." : "Escribe o pega aquí tu error o duda... (Ctrl+V para imagen)"}
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value)
                  // auto-grow up to ~5 rows
                  e.target.style.height = "auto"
                  e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                onPaste={handlePaste}
                disabled={isTyping}
                style={{ resize: "none", minHeight: "2rem", maxHeight: "110px" }}
                className="flex-1 min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-600 focus:outline-none disabled:opacity-50 overflow-y-auto"
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                placeholder={attachment ? "Añadir mensaje (opcional)..." : "Escribe algo..."}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                disabled={isTyping}
                className="flex-1 min-w-0 rounded-full border border-slate-850 bg-slate-950 px-3.5 py-1.5 text-base md:text-xs text-white placeholder-slate-500 focus:border-indigo-600 focus:outline-none disabled:opacity-50"
              />
            )}

            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || (!inputValue.trim() && !attachment)}
              aria-label="Enviar mensaje"
              className="shrink-0 flex items-center justify-center rounded-full bg-indigo-600 h-8 w-8 text-white transition hover:bg-indigo-500 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}


      {/* Toggle bubble */}
      <button
        onClick={handleToggle}
        aria-label="Abrir asistente de IA"
        title="Asistente IA"
        className="relative h-14 w-14 shrink-0 cursor-pointer rounded-full border border-white/20 bg-gradient-to-tr from-emerald-500 via-indigo-600 to-violet-700 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
      >
        <span className="absolute inset-[-3px] rounded-full bg-indigo-600/20 animate-ping pointer-events-none" />
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes nameFlash {
          0%   { color: #a5b4fc; text-shadow: 0 0 12px rgba(99,102,241,0.8); }
          50%  { color: #fff;    text-shadow: 0 0 24px rgba(99,102,241,1); }
          100% { color: #f1f5f9; text-shadow: none; }
        }
      `}</style>
    </div>
  )
}
