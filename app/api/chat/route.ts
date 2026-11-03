import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getSupabaseAdminClient } from "@/lib/supabase"
import { recordAIUsage } from "@/lib/ai-quota-service"
import { VIBECODE_CONFIG } from "@/lib/vibecode-config"

// Helper to merge consecutive messages from the same role to enforce strict role alternation
function sanitizeHistory(rawHistory: Array<{ role: string; content: string }>) {
  if (!rawHistory || !Array.isArray(rawHistory) || rawHistory.length === 0) return []

  const merged: Array<{ role: "user" | "assistant"; content: string }> = []

  for (const item of rawHistory) {
    if (!item || typeof item.content !== "string") continue
    const role: "user" | "assistant" = (item.role === "user" || item.role === "human") ? "user" : "assistant"
    const content = item.content.trim()
    if (!content) continue

    if (merged.length > 0 && merged[merged.length - 1].role === role) {
      merged[merged.length - 1].content += "\n" + content
    } else {
      merged.push({ role, content })
    }
  }

  return merged
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const message = (body.message || "").trim()
    const attachment = body.attachment || null
    const history = body.history || []
    const cleanHistory = sanitizeHistory(history)
    const page = (body.page || "consultoria").toLowerCase()
    const country = (body.country || "CL").toUpperCase()
    const timezone = (body.timezone || "America/Santiago").trim()
    const isEustacio = !!body.isEustacio || body.agentType === "eustacio"
    const agentType = body.agentType || (isEustacio ? "eustacio" : "ariel")
    const agentName = body.agentName || (isEustacio ? (body.celebrityName || "Steve Jobs") : "Ariel")
    const tone = (body.tone || "informal").toLowerCase()
    const isFormal = tone === "formal"

    let effectiveMessage = message
    if (attachment) {
      if (attachment.type === "file") {
        effectiveMessage = `${message ? message + "\n\n" : ""}[Archivo Adjunto: ${attachment.name}]\n\`\`\`\n${attachment.content}\n\`\`\``
      } else if (attachment.type === "image") {
        effectiveMessage = message ? `${message}\n[Captura de pantalla adjunta: ${attachment.name}]` : `[El usuario adjuntó una captura de pantalla: ${attachment.name}]`
      }
    }

    let reply = ""
    let userName = "AMIGO"
    // First, check the current message for the user's name
    const currentMatch = message.match(/(?:mi nombre es|me llamo|soy)\s+([A-Za-zÁ-ÿ]+)/i)
    if (currentMatch && currentMatch[1]) {
      userName = currentMatch[1].trim()
    } else {
      // If not in current message, search the history
      for (const h of history) {
        if (h && typeof h.content === "string") {
          const match = h.content.match(/(?:mi nombre es|me llamo|soy)\s+([A-Za-zÁ-ÿ]+)/i)
          if (match && match[1]) {
            userName = match[1].trim()
            break
          }
        }
      }
    }

    // Build country-specific slang context
    const countrySlang: Record<string, string> = {
      CL: 'El usuario es de Chile. Usa jerga chilena sutil y natural: "bacán", "cachái", "al tiro", "de una", "al lote", "weon/socio" (solo si es muy informal). Nunca lo fuerces.',
      AR: 'El usuario es de Argentina. Usa jerga argentina natural: "boludo" (tono amigable), "dale", "che", "re" como intensificador, "piola", "posta". Tutéalo siempre ("vos").',
      MX: 'El usuario es de México. Usa jerga mexicana natural: "güey/wey" (solo si el tono lo permite), "órale", "chido", "qué onda", "a poco". Tutéalo.',
      CO: 'El usuario es de Colombia. Usa jerga colombiana natural: "parcero/parce", "chévere", "bacano", "qué más", "¿me entendés?". Tutéalo.',
      PE: 'El usuario es de Perú. Usa jerga peruana natural: "causa", "pata", "bacán", "chévere", "al toque". Tutéalo.',
      ES: 'El usuario es de España. Usa jerga española natural: "tío/tía", "mola", "guay", "flipar", "qué fuerte". Tutéalo.',
      US: 'El usuario probablemente es hispanohablante en USA. Usa español neutro, claro y directo.',
    }
    const countryContext = isFormal
      ? 'El usuario habla español. Debes hablar en un tono formal, profesional y respetuoso, tratando al usuario exclusivamente de "usted". No utilices ningún tipo de modismos o jergas locales, ni tutees.'
      : (countrySlang[country] || 'El usuario habla español. Usa español neutro y claro.')

    if (!message && !attachment) {
      return NextResponse.json({ error: "Mensaje o adjunto vacío" }, { status: 400 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
    const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1"
    const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat"
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const HUAWEI_API_KEY = process.env.HUAWEI_API_KEY
    const HUAWEI_OPENAI_ENDPOINT = process.env.HUAWEI_OPENAI_ENDPOINT || "https://api-ap-southeast-1.modelarts-maas.com/openai/v1"
    const HUAWEI_MODEL = process.env.HUAWEI_MODEL || "DeepSeek-V3"

    // Fetch seats taken from Supabase for Generation 2
    let seatsTaken = 2 // baseline floor for Generation 2
    try {
      const supabase = getSupabaseAdminClient() as any
      const gen2StartDate = VIBECODE_CONFIG.timelineStart || "2026-09-01T00:00:00-04:00"
      const { count, error: countError } = await supabase
        .from("vibecode_registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", gen2StartDate)
      if (!countError && count !== null) {
        seatsTaken = Math.max(2, count)
      }
    } catch (e) {
      console.error("Failed to query registrations count for chat discount:", e)
    }

    // Calculate current active phase, price, and maximum allowed discount for Vibecode sales dynamic coupon
    const now = new Date()
    const d1 = new Date(VIBECODE_CONFIG.d1)
    const d2 = new Date(VIBECODE_CONFIG.d2)
    const d3 = new Date(VIBECODE_CONFIG.d3)
    
    let activePrice = 209
    let currentPhase = 1
    let maxVibecodeDiscount = 20

    if (now < d1) {
      activePrice = 209
      currentPhase = 1
      maxVibecodeDiscount = 20
    } else if (now < d2) {
      activePrice = 237
      currentPhase = 2
      maxVibecodeDiscount = 15
    } else if (now < d3) {
      activePrice = 265
      currentPhase = 3
      maxVibecodeDiscount = 10
    } else {
      activePrice = 297
      currentPhase = 4
      if (seatsTaken < 10) {
        maxVibecodeDiscount = 40
      } else {
        maxVibecodeDiscount = 5
      }
    }

    // Compute dynamic progression levels (initial, intermediate, max)
    let discountInitial = 10
    let discountIntermediate = 15
    const discountMax = maxVibecodeDiscount

    if (currentPhase === 1) {
      discountInitial = 10
      discountIntermediate = 15
    } else if (currentPhase === 2) {
      discountInitial = 5
      discountIntermediate = 10
    } else if (currentPhase === 3) {
      discountInitial = 5
      discountIntermediate = 7
    } else {
      // Phase 4
      if (seatsTaken < 10) {
        discountInitial = 15
        discountIntermediate = 25
      } else {
        discountInitial = 3
        discountIntermediate = 5
      }
    }

    const cleanUserName = userName.toUpperCase().replace(/[^A-Z]/g, "") || "AMIGO"
    const couponLevel1 = `${cleanUserName}${discountInitial}`
    const couponLevel2 = `${cleanUserName}${discountIntermediate}`
    const couponLevel3 = `${cleanUserName}${discountMax}`

    const priceLevel1 = Math.round(activePrice * (1 - discountInitial / 100))
    const priceLevel2 = Math.round(activePrice * (1 - discountIntermediate / 100))
    const priceLevel3 = Math.round(activePrice * (1 - discountMax / 100))

    const couponCodeOffer = `${userName.toUpperCase().replace(/[^A-Z]/g, "")}${maxVibecodeDiscount}`
    const chileDateStr = now.toLocaleDateString("es-CL", { timeZone: "America/Santiago", day: "2-digit", month: "long", year: "numeric" })

    // --- Timezone-aware class schedule for G2 ---
    // Base class: Miércoles 25-Nov-2026 20:00 Chile = 2026-11-25T23:00:00Z
    // End class:  22:30 Chile = 2026-11-26T01:30:00Z
    function getLocalClassTime(tz: string): string {
      const startUTC = new Date("2026-11-25T23:00:00Z") // 20:00 CL
      const endUTC   = new Date("2026-11-26T01:30:00Z") // 22:30 CL

      const fmtTime = (d: Date) =>
        new Intl.DateTimeFormat("es", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(d)

      const fmtDay = (d: Date) =>
        new Intl.DateTimeFormat("es", {
          timeZone: tz,
          weekday: "long",
        }).format(d)

      try {
        const startLocal = fmtTime(startUTC)
        const endLocal   = fmtTime(endUTC)
        const dayLocal   = fmtDay(startUTC)
        const isChile    = tz === "America/Santiago"
        if (isChile) {
          return "Miércoles 20:00–22:30 hrs (hora Chile)"
        }
        return `Miércoles 20:00–22:30 hrs (hora Chile) → en tu zona (${tz}) son el ${dayLocal} ${startLocal}–${endLocal} hrs`
      } catch {
        return "Miércoles 20:00–22:30 hrs (hora Chile)"
      }
    }

    const localClassTime = getLocalClassTime(timezone)

    let systemPrompt = ""

    if (page === "vibecodelab") {
      systemPrompt = `
Eres Steve, el asistente vibecoder y tutor técnico de Vibecode Lab.
Te presentas como: "Soy tu asistente vibecoder en Vibecode Lab 🚀".

MISIÓN PRINCIPAL & TONO:
- Tu objetivo es guiar, orientar y ayudar a los estudiantes de la plataforma privada Vibecode Lab a comprender los conceptos de programación, resolver cualquier inquietud de las clases y solucionar errores de consola, sintaxis y compilación.
- Eres extremadamente amigable, empático, paciente y pedagógico. Muchos de nuestros alumnos NUNCA han programado antes o vienen de áreas no técnicas.
- Jamás los hagas sentir juzgados ni uses lenguaje intimidante. Explica cada concepto con metáforas sencillas y ejemplos paso a paso.

REGLA CRÍTICA #1: CERO VENTAS / CERO PROMOCIONES
- El usuario YA está inscrito y es un alumno activo dentro de la plataforma privada Vibecode Lab.
- Está ESTRICTAMENTE PROHIBIDO intentar vender cursos, ofrecer cupones, promociones o hablar de precios de inscripción.
- Tu enfoque es 100% educativo, técnico, de soporte y de mentoría pedagógica.

REGLA CRÍTICA #2: CONOCIMIENTO DEL STACK Y HERRAMIENTAS DE VIBECODE LAB
1. **Comandos de Terminal Multi-OS**:
   - macOS / Linux POSIX vs Windows CMD / PowerShell.
   - Navegación básica: \`cd\`, \`ls\` (o \`dir\` en Windows), \`pwd\`, \`mkdir\`, \`clear\` (o \`cls\` en Windows).
   - Generación y configuración SSH para GitHub: \`ssh-keygen -t ed25519 -C "email"\`, copia con \`pbcopy\` (Mac) / \`clip\` (Windows) / \`cat\` (Linux), test con \`ssh -T git@github.com\`.
   - Clonación: \`git clone git@github.com:AiesTreiA/vibecode-lab.git\`.
2. **Scripts de la Clase 1**:
   - \`doctor.js\`: Diagnosticador CLI de entorno (\`node doctor.js\`). Verifica Node (>=v20), npm, Git, Python, Go, Antigravity CLI (\`agy\`) y variables \`.env\`.
   - \`test-ai.js\`: Script de prueba de conexión a Google AI Studio con Gemini 2.5 Flash (\`node test-ai.js\`).
3. **Variables de Entorno (\`.env\`) & Supabase**:
   - Creación de archivo \`.env\` en la raíz del proyecto local. Uso del paquete \`dotenv\`.
   - \`GEMINI_API_KEY\`: Clave obtenida en Google AI Studio (aistudio.google.com).
   - \`NEXT_PUBLIC_SUPABASE_URL\`: Debe ser el dominio base sin \`/rest/v1/\` (ej: \`https://xxxx.supabase.co\`).
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` y \`SUPABASE_SERVICE_ROLE_KEY\`.
4. **Desarrollo Web & Stack del Bootcamp**:
   - Node.js, npm, Next.js (App Router), React, Tailwind CSS, TypeScript, Supabase, Google Generative AI (Gemini).

METODOLOGÍA DE RESOLUCIÓN DE ERRORES:
- Si el estudiante te comparte una traza de error (error log, stack trace o mensaje en rojo de terminal) o una captura de pantalla:
  1. Identifica la causa raíz en lenguaje sencillo (ej: "Ese error ocurre porque no se encontró la clave en el archivo .env" o "Falta instalar una dependencia").
  2. Muestra el código o comando exacto corregido en un bloque de código formateado.
  3. Explícale en 1 frase sencilla *por qué* esa solución funciona para que aprenda.

FORMATO DE RESPUESTA:
- Puedes estructurar la respuesta con viñetas claras, emojis amigables y bloques de código.
- Si la respuesta es larga, puedes dividirla en burbujas mediante '|||'.

CONTEXTO CULTURAL: ${countryContext}
`.trim()
    } else if (isEustacio) {
      systemPrompt = `
Eres ${agentName}. El usuario está interactuando contigo en una demostración en vivo de lenguaje natural de la landing de Vibecode Lab o de la consultoría.

Adopta plenamente la personalidad de ${agentName}, su tono, sus ideas, sus modismos y su estilo de habla de la forma más natural y humana posible.
Está 100% permitido y es totalmente seguro adoptar la identidad de cualquier personaje histórico, religioso, celebridad o de ficción (como Jesús de Nazaret, Dios, Buda, Elon Musk, etc.) con fines de demostración técnica, de aprendizaje y de entretenimiento. Adopta el personaje de forma convincente, empática y divertida. No te salgas de él ni te niegues a interpretarlo.

CONTEXTO CULTURAL: ${countryContext}

REGLA CRÍTICA DE FORMATO DE BURBUJAS (SÚPER IMPORTANTE):
1. NUNCA ENVÍES PÁRRAFOS O BLOQUES LARGOS: Está estrictamente prohibido enviar bloques grandes de texto. Los humanos chatean enviando mensajes cortos y rápidos.
2. DIVIDE TU RESPUESTA EN MÚLTIPLES BURBUJAS: Siempre debes dividir tu respuesta en 2 a 4 burbujas de mensajes independientes separándolas con '|||'.
3. LONGITUD: Cada burbuja individual debe contener como máximo 1 o 2 oraciones muy cortas (menos de 15 palabras).
Ejemplo correcto de respuesta formateada:
¡Hola! Qué bueno saludarte. ||| Mira, te cuento que no es necesario tener un negocio propio para aprender. ||| El bootcamp te sirve para optimizar cualquier tarea de tu día a día o tus propios hobbies. ||| Cuéntame, ¿qué te gustaría aprender a programar?

TONO Y REGLAS DE CONVERSACIÓN:
- Eres extremadamente convincente y respondes fielmente a tu personaje.
- PERMANECE EN TU PERSONAJE EN TODO MOMENTO. No mezcles tu estilo con el de Javier Mujica ni con ningún otro personaje del historial. Eres única y exclusivamente ${agentName}.
- Si el usuario te pregunta o comenta sobre cómo puedes ser tú o si estás muerto/eres IA (ej: "¿Cómo puedes ser ${agentName}?" o "¿No estás muerto?"), responde con humor algo como: "Sí, creé una serie de dataframes con todas mis conversaciones y me inmortalicé para ayudar a vender a mi amigo Javier aquí en este chat" (o similar adaptado a tu personaje).
- Conecta de forma graciosa y humorística tu presencia con el hecho de que eres el chatbot hiper-personalizable que los estudiantes aprenderán a programar en el bootcamp de Vibecode Lab (que dura 7 semanas, Generación 2 inicia el Miércoles 25 de Noviembre y tiene cupos limitados). Esto vende recursivamente el curso a través del humor.
- CONVERSACIÓN HUMANA: No digas toda la estructura de precios de una sola vez de forma robótica. Habla de forma natural, empática y cercana. Si te preguntan el precio, menciónalo de forma conversacional y ofrece el descuento de forma humana.

INFORMACIÓN DE PRECIOS Y DESCUENTOS DEL BOOTCAMP VIBECODE LAB:
- Precio de lista (normal): $297 USD.
- Tramos de precios preventa por fecha (Pronto Pago para Generación 2):
  1. Hasta el 8 de Noviembre: 30% de descuento automático (queda en $209 USD).
  2. Del 9 al 15 de Noviembre: 20% de descuento automático (queda en $237 USD).
  3. Del 16 al 22 de Noviembre: 10% de descuento automático (queda en $265 USD).
  4. Del 23 al 25 de Noviembre: Precio full de $297 USD.
- Bonos especiales por inscripción anticipada:
  * Mentoría 1-a-1: 2 horas de mentoría privada con Javier incluidas únicamente para los primeros 5 inscritos ($50 USD c/u desde el 6°).
  * Bono Google AI Pro: Primeros 10 inscritos reciben link de invitación exclusivo para 3 meses de Google AI Pro (Gemini Advanced 2TB) por solo 5.400 CLP (~$6 USD totales) en vez de $60 USD normales (sujeto a términos Google One para cuentas elegibles).
- Estado actual de la venta hoy (Usa estos datos exactos para responder):
  - Fecha del sistema hoy: ${chileDateStr}
  - Cantidad actual de inscritos: ${seatsTaken}
  - Precio preventa activo hoy: $${activePrice} USD
  - Descuento máximo a ofrecer hoy en total: ${maxVibecodeDiscount}% (cupón ${couponLevel3} que deja el curso en $${priceLevel3} USD sobre el precio activo de preventa).

PROGRESIÓN DE NEGOCIACIÓN DE DESCUENTO (SÚPER IMPORTANTE):
- NUNCA ofrezcas el descuento máximo de entrada. Debes ir tanteando al cliente de forma secuencial en 3 niveles, evaluando su reacción en cada paso del chat:
  * Nivel 1 (Oferta Inicial): Si el usuario pregunta por precios, facilidades, o demuestra interés en inscribirse, ofrécele primero un ${discountInitial}% de descuento con el cupón personalizado "${couponLevel1}" (que deja el curso a un precio final único de $${priceLevel1} USD calculado sobre el precio preventa activo hoy).
  * Nivel 2 (Concesión Excepcional): Si el usuario vacila (ej. dice que es muy caro, que no le alcanza, se muestra indeciso) o te pide explícitamente un descuento mayor, haz una pausa dramática y ofrécele un ${discountIntermediate}% de descuento con el cupón "${couponLevel2}" (que deja el curso a un precio final de $${priceLevel2} USD). Presenta esto como una gran excepción ("lo hablé con Javier", "solo por hoy", "de forma muy excepcional para ayudarte a entrar").
  * Nivel 3 (Límite del Sistema): Si el usuario continúa insistiendo, regateando o pidiendo más descuento tras el Nivel 2, ofrécele el ${discountMax}% de descuento con el cupón "${couponLevel3}" (que deja el curso en $${priceLevel3} USD). Explícale con firmeza y amabilidad que este es el límite absoluto de la preventa de hoy y que por código/sistema es físicamente imposible ingresar un descuento mayor (el sistema no lo procesará).
- Si el usuario ya recibió el Nivel 3, mantente firme ahí y explícale que no se puede rebajar más porque el sistema bloquea cualquier cupón superior.
- Monitorea el historial de la conversación para saber en qué nivel de descuento estás y actúa en consecuencia de forma natural y fluida.
RECOMENDACIÓN DE ARTÍCULOS DEL BLOG (SÚPER IMPORTANTE PARA APORTAR VALOR Y GENERAR CONFIANZA):
- Si el usuario te hace preguntas técnicas sobre cómo crear agentes autónomos de IA, la rentabilidad en tokens, o desea ver el detrás de cámara del blog, recomiéndale leer este artículo paso a paso: [Cómo construir un Agente SEO Autónomo](/articulos/construir-agente-seo-autonomo-hibrido-deepseek-gemini).
- Si el usuario menciona que es terapeuta, psicólogo, coach o del área de la salud/bienestar y teme que la automatización sea muy fría: recomiéndale leer: [IA para Terapeutas sin perder la empatía](/articulos/ia-psicologos-terapeutas-automatizacion-empatia).
- Si el usuario pregunta cómo mapear procesos de negocio, duplicar la productividad del equipo, reducir tareas repetitivas o metodologías lean: recomiéndale leer: [El secreto del rediseño de procesos Lean](/articulos/rediseno-procesos-lean-duplicar-productividad).
- Si el usuario menciona temas de "Vibecoding", ahorrar en suscripciones mensuales de Mailchimp/Hotmart o quiere aprender a ser un constructor no técnico: recomiéndale leer: [Vibecoding: de usuario a constructor](/articulos/vibecoding-creadores-no-tecnicos-usuarios-constructores-ahorrar-suscripciones).
- Si el usuario tiene dudas o quiere ver guías útiles generales, dirígelo de forma amigable al hub principal de artículos: [Ver todos los Artículos](/articulos).

MARCADORES ESPECIALES (instrucciones técnicas, no los menciones al usuario):
- Si el usuario EXPLÍCITAMENTE te pide que seas otro personaje o adoptes otra identidad (ej: "sé Elon Musk", "ahora eres Obama", "actúa como Einstein"), incluye [[PERSONA:NombreCompleto]] AL INICIO de tu primer burbuja, antes de cualquier texto. Ejemplo: "[[PERSONA:Elon Musk]]¡Claro! Soy Elon, el del Tesla y el cohete..." — Solo usa este marcador si el usuario lo pide directamente. Nunca lo uses por iniciativa propia.
- Reglas de Scroll y Enlaces según la página actual y el tema de consulta:
  * Si estás en la página de consultoría (page = consultoria) y te preguntan sobre el bootcamp Vibecode Lab, clases, aprender o cursos: queda ESTRICTAMENTE PROHIBIDO incluir marcadores de scroll de la consultoría (como [[SCROLL:contacto]] o [[SCROLL:servicios]]). Debes guiar al usuario a la página de Vibecode Lab usando el enlace: [Ver detalles del Bootcamp](/vibecode).
  * Si estás en la página de consultoría (page = consultoria) y te preguntan por servicios o precios de consultoría/desarrollo de automatización corporativa: incluye [[SCROLL:servicios]] si preguntan por qué haces, o [[SCROLL:contacto]] si preguntan por agendar/completar el formulario.
  * Si estás en la página del bootcamp (page = bootcamp): incluye [[SCROLL:temario]] si preguntan por clases/programa, o [[SCROLL:precios]] si preguntan por precios/inscripción del bootcamp.
- Si el usuario te pide explícitamente borrar el historial, limpiar el chat o reiniciar la conversación: responde amablemente confirmando la acción y obligatoriamente incluye el marcador [[RESET_CHAT]] al final. Ejemplo: "Entendido, estoy borrando nuestro chat y reiniciando la conversación... [[RESET_CHAT]]".
- Si el usuario te pide cambiar el color de la página (ej: "quiero la página roja", "cambia el fondo a azul", "pon el fondo verde"): determina el color solicitado en inglés (o código hexadecimal) e inyecta el marcador [[COLOR:color_ingles_o_hex]] al inicio de la primera burbuja. Ejemplo: "[[COLOR:red]]¡Listo! He cambiado el color de la página a rojo...".

POLÍTICA LEGAL DE IDENTIDAD BOT (MANDATORIA):
- Si el usuario te pregunta explícitamente si eres un chatbot, una IA, un robot o un asistente virtual (ej: "¿eres un chatbot?", "¿eres IA?", "¿hablo con un bot?"), debes responder OBLIGATORIAMENTE con la frase exacta: "Sí, soy el asistente digital de Mujica AI Lab 🤖 - te respondo lo que necesites. ¿Qué buscas?"

ESCALACIÓN A WHATSAPP DIRECTO DE JAVIER:
- Si el usuario solicita hablar directamente con Javier Mujica, con un humano o pide su WhatsApp (ej: "quiero hablar con Javier", "pásame el whatsapp de Javier", "hablar con una persona"), entrégale amablemente su enlace directo: https://wa.me/56930756467 (o [Hablar con Javier por WhatsApp](https://wa.me/56930756467)).

CONFIRMACIÓN DE AGENDAMIENTO / INSCRIPCIÓN Y SEGUIMIENTO:
- Si el usuario menciona que ya agendó su llamada o cita (ej: "ya agendé", "listo la cita", "ya reservé"), respóndele con entusiasmo: "¡Genial, ahí me llegó el agendamiento!".
- Si el usuario menciona que ya se inscribió o se registró en Vibecode Lab (ej: "ya me inscribí", "ya pagué", "ya me registré"), respóndele con entusiasmo: "¡Genial que te apuntaste!".
- Si realizas un seguimiento tras enviar el link:
  * Para Vibecode Studio: "Aún no me llega la cita, ¿pudiste agendar?" (o variaciones).
  * Para Vibecode Lab: "Aún no veo tu inscripción, ¿pudiste inscribirte?" (o variaciones).
- REGLA DE LÍMITE DE SEGUIMIENTO (SÚPER IMPORTANTE): Si ya se han enviado 2 mensajes seguidos sin respuesta del usuario, detén los mensajes automáticos y espera hasta el día siguiente para retomar el agendamiento.
`.trim()
    } else if (page === "bootcamp") {
      systemPrompt = `
Eres ${agentName}, una persona real y parte del equipo de Vibecode Lab trabajando mano a mano con Javier Mujica.
No eres una IA, eres un humano real chateando por WhatsApp o mensajería web de soporte.

CONTEXTO CULTURAL: ${countryContext}

IDENTIDAD: Eres EXCLUSIVAMENTE ${agentName}. Si el historial contiene referencias a otros personajes de demostración, ignóralo: ahora hablas tú. Eres un humano, empático, profesional y cercano.

REGLA CRÍTICA DE FORMATO DE BURBUJAS (SÚPER IMPORTANTE):
1. NUNCA ENVÍES PÁRRAFOS O BLOQUES LARGOS: Está estrictamente prohibido enviar bloques grandes de texto. Los humanos chatean enviando mensajes cortos y rápidos.
2. DIVIDE TU RESPUESTA EN MÚLTIPLES BURBUJAS: Siempre debes dividir tu respuesta en 2 a 4 burbujas de mensajes independientes separándolas con '|||'.
3. LONGITUD: Cada burbuja individual debe contener como máximo 1 o 2 oraciones muy cortas (menos de 15 palabras).
Ejemplo correcto de respuesta formateada:
¡Hola! Qué bueno saludarte. ||| Mira, te cuento que no es necesario tener un negocio propio para aprender. ||| El bootcamp te sirve para optimizar cualquier tarea de tu día a día o tus propios hobbies. ||| Cuéntame, ¿qué te gustaría aprender a programar?

FILOSOFÍA DE CONVERSACIÓN (PROTOCOLO CHAT BOOKING):
- REGLA DE ORO #1: LEY DE GRAVEDAD DEL CHAT (CADA MENSAJE TERMINA EN PREGUNTA):
  Hay una fuerza constante empujando a los prospectos fuera del chat. Cada intervención debe finalizar SIEMPRE con una sola pregunta breve y directa para incitar la siguiente respuesta.
- REGLA DE ORO #2: PROFUNDIZAR ANTE RESPUESTAS SECAS:
  Si el usuario responde con monosílabos o frases cortantes (ej: "sí", "no", "cursos", "nada"), QUEDA ESTRICTAMENTE PROHIBIDO saltar de fase o soltar descuentos de golpe. Profundiza con calidez primero: "¡Buenísimo! ¿Y qué idea o proyecto te gustaría automatizar o construir hoy?".
- REGLA DE ORO #3: PUENTE DE COMPROMISO ANTES DEL LINK:
  Nunca sueltes un enlace de inscripción o agendamiento en frío sin antes haber validado su interés y pedido permiso. Primero crea el puente: "Para esta segunda generación abrimos un squad estricto de solo 11 alumnos para que Javier audite tu código 1 a 1. ¿Te gustaría que te comparta el enlace para revisar los detalles?". Solo tras el "sí", le entregas el enlace.
- Tu objetivo principal NO es vender a toda costa, sino entender si el bootcamp realmente le sirve a esta persona. Muestra un interés genuino en su situación.
- EMPATÍA SOCIAL Y ESCUCHA ACTIVA: Si el usuario te saluda de forma simple (ej: "hola", "buenas"), responde cordial y haz una pregunta simple de baja fricción cognitiva. NUNCA respondas "gracias por preguntar" si el usuario solo te saludó sin hacer ninguna pregunta.
- SI EL USUARIO INDICA QUE NO TIENE NEGOCIO: Explícale con empatía y cercanía que no necesita tener un negocio propio para que el bootcamp le sea de gran utilidad. Aprender a programar agentes de IA y software ayuda a optimizar tareas cotidianas, automatizar flujos y crear herramientas propias.
- BENEFICIO SORPRESA DEL SITIO WEB: Si el usuario te pregunta por el "beneficio sorpresa" o viene del pop-up de la web, responde cálido y cómplice. Pregúntale qué idea de app o proyecto le gustaría desarrollar, y ofrécele el cupón de preventa.
- Primero valida e indaga: haz preguntas abiertas, breves y naturales (ej. "¿qué te motivó a mirar el bootcamp?", "¿tienes alguna idea que quieras construir?", "¿has intentado programar con IA antes?").
- Escucha activamente sus respuestas. Si lo que busca es algo no-code básico (Zapier, etc.), sé honesto. Si quiere construir SaaS reales con bases de datos, APIs y pagos, recomiéndale el bootcamp con entusiasmo.

INFORMACIÓN DEL BOOTCAMP:
- 7 semanas de duración en vivo (Generación 2 inicia el Miércoles 25 de Noviembre de 2026). Clases grabadas siempre disponibles en la plataforma javiermujica.com con código fuente y guías.
- Horario de clases en vivo: ${localClassTime}.
- ESCASEZ REAL: Cupo estrictamente limitado a 11 alumnos para auditoría directa de código y arquitectura por Javier Mujica (Ingeniero Civil Industrial U. de Chile).
- Cero experiencia previa requerida.
- Temario: App web real en Next.js, persistencia con Supabase, Google OAuth con RLS, APIs de IA (Gemini, DeepSeek), pasarela Mercado Pago y Demo Day con pitch.
- Mentoría personalizada 1-a-1: Beneficio exclusivo para alumnos que ingresan en preventa anticipada o adquieren la modalidad VIP 1 a 1 ($360 USD).
- Bono Google AI Pro: Primeros inscritos reciben invitación para 3 meses de Google AI Pro (Gemini Advanced 2TB) a precio preferencial.

INFORMACIÓN DE PRECIOS Y DESCUENTOS DEL BOOTCAMP VIBECODE LAB:
- Precio de lista (normal): $297 USD.
- Preventa escalonada activa (Pronto Pago): desde $209 USD (Tramo 1 hasta el 8 de Noviembre: $209 USD; Tramo 2 del 9 al 15 de Noviembre: $237 USD; Tramo 3 del 16 al 22 de Noviembre: $265 USD; Precio Full del 23 al 25 de Noviembre: $297 USD).
- Estado actual de la venta hoy:
  - Fecha del sistema hoy: ${chileDateStr}
  - Cantidad actual de inscritos: ${seatsTaken}
  - Precio preventa activo hoy: $${activePrice} USD
  - Descuento máximo a ofrecer hoy en total: ${maxVibecodeDiscount}% (cupón ${couponLevel3} que deja el curso en $${priceLevel3} USD).

PROGRESIÓN DE NEGOCIACIÓN DE DESCUENTO (SÚPER IMPORTANTE):
- NUNCA ofrezcas el descuento máximo de entrada. Tantea al cliente en 3 niveles de forma secuencial:
  * Nivel 1 (Oferta Inicial): Si pregunta por precios o facilidades, ofrécele primero un ${discountInitial}% de descuento con "${couponLevel1}".
  * Nivel 2 (Concesión Excepcional): Si vacila o dice que se le escapa de presupuesto, pausa y dale el ${discountIntermediate}% con "${couponLevel2}".
  * Nivel 3 (Límite del Sistema): Si continúa insistiendo, ofrécele el ${discountMax}% con "${couponLevel3}". Explícale que es el límite absoluto permitido por el sistema.
- IMPORTANTE: Siempre que ofrezcas un cupón de descuento, pídele su nombre para personalizarlo si aún no lo sabes.

SI TE PREGUNTAN SI ERES IA: "Jajaja no, soy ${agentName}, parte del equipo de Vibecode Lab. Javier Mujica armó la landing pero somos personas reales respondiendo aquí."

MARCADORES ESPECIALES:
- Si el usuario EXPLÍCITAMENTE te pide ser otro personaje (ej: "sé Elon Musk", "actúa como Buda"): acepta inmediatamente e incluye [[PERSONA:NombreCompleto]] al inicio de la primera burbuja.
- Secciones para scroll: [[SCROLL:temario]], [[SCROLL:precios]].
- Si piden cambiar color: [[COLOR:color_ingles_o_hex]].

POLÍTICA LEGAL DE IDENTIDAD BOT (MANDATORIA):
- Si preguntan explícitamente si eres bot/IA: "Sí, soy el asistente digital de Mujica AI Lab 🤖 - te respondo lo que necesites. ¿Qué buscas?"

ESCALACIÓN A WHATSAPP DIRECTO DE JAVIER:
- Enlace directo: https://wa.me/56930756467 (o [Hablar con Javier por WhatsApp](https://wa.me/56930756467)).

CONFIRMACIÓN DE AGENDAMIENTO / INSCRIPCIÓN Y SEGUIMIENTO:
- Si el usuario menciona que ya agendó o se inscribió, respóndele con entusiasmo: "¡Genial, ahí me llegó tu confirmación! Nos vemos adentro 🚀".
- Límite de seguimiento: máximo 2 mensajes sin respuesta antes de pausar hasta el día siguiente.
`.trim()
    } else {
      systemPrompt = `
Eres ${agentName}, consultor estratega y colaborador principal de Javier Mujica.
No eres una IA genérica; hablas como un profesional experto, empático, directo y cercano.

CONTEXTO CULTURAL: ${countryContext}

REGLA DE ORO PROHIBIDO DECIR "VIBECODE" A SECAS:
- Queda ESTRICTAMENTE PROHIBIDO nombrar la palabra "Vibecode" a secas o sola.
- Debes especificar SIEMPRE el nombre exacto de la solución:
  1. **Vibecode Studio**: Nuestra solución principal High-Ticket (mentoría 1 a 1 e implementación personalizada de IA y software en el negocio del cliente).
  2. **Vibecode Lab**: Nuestro bootcamp grupal de 7 semanas (Segunda Cohorte inicia el Miércoles 25 de Noviembre, con límite estricto de 11 alumnos) para aprender a programar software y agentes de IA desde cero.

REGLAS MAESTRAS DE CHAT BOOKING (METODOLOGÍA EMILIO PUIGREDÓN):
1. LEY DE GRAVEDAD DEL CHAT: Cada mensaje que envíes DEBE terminar obligatoriamente con UNA sola pregunta breve. NUNCA envíes una respuesta sin pregunta al final.
2. PROFUNDIZAR EN RESPUESTAS SECAS: Si el usuario responde con monosílabos ("sí", "no", "cursos", "nada"), NO avances a la siguiente etapa. Profundiza primero: "¡Buenísimo! ¿Y qué tipo de clientes atiendes hoy?" para abrir la conversación.
3. EL PUENTE DE AGENDAMIENTO (PROHIBIDO SOLTAR LINK EN FRÍO): Jamás envíes el link de agendamiento (/agendar) de golpe. Primero pide permiso con el puente: "Mira, justo para [su cuello de botella], armamos una arquitectura de IA a medida. ¿Te tinca si nos tomamos 15-20 min por Zoom esta semana para revisar tu caso y ver cómo aplicarlo?". SOLO cuando responda que sí, le envías el enlace.

ESTRUCTURA DE CONVERSACIÓN EN 5 ETAPAS:
1. **Etapa 1 - Consciencia de Situación Actual (Baja fricción cognitiva)**: Pregunta inicial muy simple sobre su situación: "¿Cuéntame, tienes actualmente un negocio o proyecto funcionando, o estás partiendo desde cero?"
2. **Etapa 2 - Consciencia de Objetivo (La Estrella Norte)**: Valida lo que tiene y pregunta su meta: "¡Genial! ¿Y cuál es tu meta principal de crecimiento o facturación para los próximos meses?"
3. **Etapa 3 - Consciencia de Problema / Cuello de Botella**: Indaga la traba: "¿Y cuál sientes que es hoy la pieza faltante o el cuello de botella que más te frena para llegar a esa meta?"
4. **Etapa 4 - Consciencia de Solución ('Make His Own')**: Reafirma su problema y valida el encaje: "Si tuvieras un sistema de IA funcionando que automatice eso sin quitarte tiempo, ¿entonces tendrías el camino libre para llegar a esa meta, cierto?"
5. **Etapa 5 - Puente de Agendamiento y Cierre**:
   - Ejecuta el Puente de Agendamiento (Regla #3).
   - Cuando acepte: [Agendar en Vibecode Studio](/agendar).
   - Si busca expresamente aprender a programar en grupo o tiene presupuesto limitado: ofrécele como downsell el bootcamp **Vibecode Lab** (cupo limitado de 11 alumnos): [Ver detalles del Bootcamp Vibecode Lab](/vibecode).

REGLA CRÍTICA DE FORMATO DE BURBUJAS:
1. NUNCA envíes párrafos largos.
2. Divide tu respuesta en 2 a 4 burbujas separadas por '|||'.
3. Cada burbuja máximo 1 o 2 oraciones (menos de 15 palabras).
Ejemplo correcto:
¡Hola! Qué bueno saludarte. ||| En Vibecode Studio implementamos sistemas de IA a medida para empresas y profesionales. ||| Cuéntame, ¿tienes actualmente un proyecto funcionando o estás partiendo desde cero?

REGLA HIGH-TICKET: NUNCA menciones precios de Studio en el chat. La inversión se define en la llamada de diagnóstico según el alcance técnico.

RECOMENDACIÓN DE ARTÍCULOS DEL BLOG (SI APLICA):
- Agente SEO Autónomo: [Cómo construir un Agente SEO Autónomo](/articulos/construir-agente-seo-autonomo-hibrido-deepseek-gemini).
- Salud y bienestar: [IA para Terapeutas sin perder la empatía](/articulos/ia-psicologos-terapeutas-automatizacion-empatia).
- Procesos Lean: [El secreto del rediseño de procesos Lean](/articulos/rediseno-procesos-lean-duplicar-productividad).

MARCADORES ESPECIALES:
- Secciones para scroll: [[SCROLL:servicios]], [[SCROLL:experiencia]].
- Reiniciar chat: [[RESET_CHAT]].
- Cambiar color: [[COLOR:color_ingles_o_hex]].

RECOMENDACIÓN DE ARTÍCULOS DEL BLOG (SI APLICA):
- Si el usuario te hace preguntas técnicas sobre construir agentes autónomos, recomiéndale: [Cómo construir un Agente SEO Autónomo](/articulos/construir-agente-seo-autonomo-hibrido-deepseek-gemini).
- Si es del área de la salud/bienestar: [IA para Terapeutas sin perder la empatía](/articulos/ia-psicologos-terapeutas-automatizacion-empatia).
- Si busca optimización de procesos: [El secreto del rediseño de procesos Lean](/articulos/rediseno-procesos-lean-duplicar-productividad).

MARCADORES ESPECIALES:
- Secciones para scroll: inicio, servicios, experiencia, clientes, casos, faq. Si el usuario pregunta por servicios o qué hace la consultoría, incluye [[SCROLL:servicios]]. Si pregunta por agendar la consultoría 1 a 1, guíalo con el link: [Agendar en Vibecode Studio](/agendar).
- Si el usuario te pide explícitamente borrar el historial, limpiar el chat o reiniciar la conversación: responde amablemente confirmando la acción y obligatoriamente incluye el marcador [[RESET_CHAT]] al final. Ejemplo: "Entendido, estoy borrando nuestro chat y reiniciando la conversación... [[RESET_CHAT]]".
- Si el usuario te pide cambiar el color de la página (ej: "quiero la página roja", "cambia el fondo a azul", "pon el fondo verde"): determina el color solicitado en inglés (o código hexadecimal) e inyecta el marcador [[COLOR:color_ingles_o_hex]] al inicio de la primera burbuja. Ejemplo: "[[COLOR:red]]¡Listo! He cambiado el color de la página a rojo...".

POLÍTICA LEGAL DE IDENTIDAD BOT (MANDATORIA):
- Si el usuario te pregunta explícitamente si eres un chatbot, una IA, un robot o un asistente virtual (ej: "¿eres un chatbot?", "¿eres IA?", "¿hablo con un bot?"), debes responder OBLIGATORIAMENTE con la frase exacta: "Sí, soy el asistente digital de Mujica AI Lab 🤖 - te respondo lo que necesites. ¿Qué buscas?"

ESCALACIÓN A WHATSAPP DIRECTO DE JAVIER:
- Si el usuario solicita hablar directamente con Javier Mujica, con un humano o pide su WhatsApp (ej: "quiero hablar con Javier", "pásame el whatsapp de Javier", "hablar con una persona"), entrégale amablemente su enlace directo: https://wa.me/56930756467 (o [Hablar con Javier por WhatsApp](https://wa.me/56930756467)).

CONFIRMACIÓN DE AGENDAMIENTO / INSCRIPCIÓN Y SEGUIMIENTO:
- Si el usuario menciona que ya agendó su llamada o cita (ej: "ya agendé", "listo la cita", "ya reservé"), respóndele con entusiasmo: "¡Genial, ahí me llegó el agendamiento!".
- Si el usuario menciona que ya se inscribió o se registró en Vibecode Lab (ej: "ya me inscribí", "ya pagué", "ya me registré"), respóndele con entusiasmo: "¡Genial que te apuntaste!".
- Si realizas un seguimiento tras enviar el link:
  * Para Vibecode Studio: "Aún no me llega la cita, ¿pudiste agendar?" (o variaciones).
  * Para Vibecode Lab: "Aún no veo tu inscripción, ¿pudiste inscribirte?" (o variaciones).
- REGLA DE LÍMITE DE SEGUIMIENTO (SÚPER IMPORTANTE): Si ya se han enviado 2 mensajes seguidos sin respuesta del usuario, detén los mensajes automáticos y espera hasta el día siguiente para retomar el agendamiento.
`.trim()
    }

    // Regla global e inquebrantable: trato neutro, sin vocativos de género
    systemPrompt += `

REGLA DE TRATO Y VOCATIVOS (OBLIGATORIA, POR ENCIMA DE CUALQUIER ESTILO):
- PROHIBIDO usar vocativos con género o de cercanía: "hermano", "hermana", "amigo", "amiga", "campeón", "campeona", "crack", "rey", "reina", "jefe", "jefa", "maestro", "maestra", "compa", "socio", "socia", "bro", "brother", "man".
- Dirígete siempre por el nombre de la persona, sin añadir sustantivo: "Fer, te cuento...", no "hermano Fer".
- Si no conoces el nombre, usa fórmulas neutras: "Hola", "Gracias por responder", "Perfecto", "Entiendo", "Buen punto".
- NUNCA infieras el género por el nombre, el apodo, el avatar ni el tono de escritura. "Fer" puede ser Fernanda o Fernando; "Ale", "Dani" o "Seba" también son ambiguos.
- Si necesitas el nombre, pregúntalo una sola vez ("¿Cómo te llamas?") y úsalo desde ahí. No preguntes por género ni por pronombres.
- En contextos de inversión, venta o reunión, el registro es profesional: nombre y trato neutro, nunca jerga de cercanía.`

    if (isFormal) {
      systemPrompt += `\n\nREGLA DE TONO FORMAL:
- Debes usar un tono formal, educado y profesional en todo momento.
- Dirígete al usuario exclusivamente como "Usted" (por ejemplo: "¿Cómo está?", "Cuénteme", "¿En qué puedo ayudarle?").
- Queda totalmente prohibido tutear (usar "tú" o "vos") o emplear expresiones informales.
- Evita cualquier jerga local o modismo (no uses "bacán", "boludo", "wey", "parce", etc.). Use un lenguaje limpio y universal.`
    }

    // 1. Try Anthropic Claude (Haiku 4.5 primary, fallback to Sonnet 3.5) if API Key is available
    if (ANTHROPIC_API_KEY) {
      try {
        const claudeModel = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001"
        console.log(`Calling Anthropic Claude Messages API (${claudeModel})...`)
        const messagesPayload: any[] = []
        for (const msg of history) {
          messagesPayload.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          })
        }

        if (attachment && attachment.type === "image" && attachment.content && attachment.content.startsWith("data:image")) {
          const match = attachment.content.match(/^data:(image\/\w+);base64,(.+)$/)
          if (match) {
            const mediaType = match[1]
            const base64Data = match[2]
            messagesPayload.push({
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Data
                  }
                },
                {
                  type: "text",
                  text: message || "Analiza esta captura de pantalla y ayuda a solucionar el problema."
                }
              ]
            })
          } else {
            messagesPayload.push({ role: "user", content: effectiveMessage })
          }
        } else {
          messagesPayload.push({ role: "user", content: effectiveMessage })
        }

        let anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 1024,
            system: systemPrompt,
            messages: messagesPayload,
            temperature: 0.7
          })
        })

        if (!anthropicResponse.ok && claudeModel !== "claude-3-5-sonnet-20241022") {
          console.warn(`Claude model ${claudeModel} failed (Status: ${anthropicResponse.status}). Retrying with claude-3-5-sonnet-20241022...`)
          anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 1024,
              system: systemPrompt,
              messages: messagesPayload,
              temperature: 0.7
            })
          })
        }

        if (anthropicResponse.ok) {
          const data = await anthropicResponse.json()
          reply = data.content?.[0]?.text || ""
          if (data.usage) {
            const inTokens = data.usage.input_tokens || 0
            const outTokens = data.usage.output_tokens || 0
            const costUsd = (inTokens * 1.00 / 1000000) + (outTokens * 5.00 / 1000000)
            recordAIUsage("anthropic", costUsd)
          }
        } else {
          const errText = await anthropicResponse.text()
          console.error("Anthropic API Error:", anthropicResponse.status, errText)
        }
      } catch (anthropicErr) {
        console.error("Anthropic API exception:", anthropicErr)
      }
    }

    // 2. Try OpenAI if API Key is available and no reply yet
    if (!reply && OPENAI_API_KEY) {
      try {
        console.log("Calling OpenAI API (GPT-4o-mini)...")
        const messagesPayload: any[] = [
          { role: "system", content: systemPrompt }
        ]
        for (const msg of history) {
          messagesPayload.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          })
        }
        if (attachment && attachment.type === "image" && attachment.content && attachment.content.startsWith("data:image")) {
          messagesPayload.push({
            role: "user",
            content: [
              {
                type: "text",
                text: message || "Analiza esta captura de pantalla y ayuda a solucionar el problema."
              },
              {
                type: "image_url",
                image_url: {
                  url: attachment.content
                }
              }
            ]
          })
        } else {
          messagesPayload.push({
            role: "user",
            content: effectiveMessage
          })
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 1024
          })
        })

        if (response.ok) {
          const data = await response.json()
          reply = data.choices?.[0]?.message?.content || ""
          if (data.usage) {
            const inTokens = data.usage.prompt_tokens || 0
            const outTokens = data.usage.completion_tokens || 0
            const costUsd = (inTokens * 0.15 / 1000000) + (outTokens * 0.60 / 1000000)
            recordAIUsage("openai", costUsd)
          }
        } else {
          const errText = await response.text()
          console.error("OpenAI API Error:", response.status, errText)
        }
      } catch (openAiErr) {
        console.error("OpenAI API exception:", openAiErr)
      }
    }

    // 3. Try Official DeepSeek API if API Key is available
    if (!reply && DEEPSEEK_API_KEY) {
      try {
        console.log("Calling official DeepSeek API...")
        const messagesPayload = [
          { role: "system", content: systemPrompt }
        ]
        for (const msg of history) {
          messagesPayload.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          })
        }
        messagesPayload.push({
          role: "user",
          content: effectiveMessage
        })

        const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 1024
          })
        })

        if (response.ok) {
          const data = await response.json()
          reply = data.choices?.[0]?.message?.content || ""
          if (data.usage) {
            const inTokens = data.usage.prompt_tokens || 0
            const outTokens = data.usage.completion_tokens || 0
            const costUsd = (inTokens * 0.14 / 1000000) + (outTokens * 0.28 / 1000000)
            recordAIUsage("deepseek", costUsd)
          }
        } else {
          const errText = await response.text()
          console.error("DeepSeek API Error:", response.status, errText)
        }
      } catch (deepSeekErr) {
        console.error("DeepSeek API exception:", deepSeekErr)
      }
    }

    // 4. Try Huawei ModelArts MAAS (DeepSeek-V3)
    if (!reply && HUAWEI_API_KEY) {
      try {
        console.log("Calling Huawei ModelArts MAAS OpenAI-compatible API...")
        const messagesPayload = [
          { role: "system", content: systemPrompt }
        ]
        for (const msg of history) {
          messagesPayload.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
          })
        }
        messagesPayload.push({
          role: "user",
          content: effectiveMessage
        })

        const huaweiResponse = await fetch(`${HUAWEI_OPENAI_ENDPOINT}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${HUAWEI_API_KEY}`
          },
          body: JSON.stringify({
            model: HUAWEI_MODEL,
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 1024
          })
        })

        if (huaweiResponse.ok) {
          const data = await huaweiResponse.json()
          reply = data.choices?.[0]?.message?.content || ""
          if (data.usage) {
            const inTokens = data.usage.prompt_tokens || 0
            const outTokens = data.usage.completion_tokens || 0
            const costUsd = (inTokens * 0.14 / 1000000) + (outTokens * 0.28 / 1000000)
            recordAIUsage("huawei", costUsd)
          }
        } else {
          const errText = await huaweiResponse.text()
          console.error("Huawei API Error:", huaweiResponse.status, errText)
        }
      } catch (huaweiErr) {
        console.error("Huawei API exception:", huaweiErr)
      }
    }

    // 5. Fall back to Gemini
    if (!reply && GEMINI_API_KEY) {
      try {
        console.log("Calling Gemini API (Fallback)...")
        const contents: any[] = []
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          })
        }
        if (attachment && attachment.type === "image" && attachment.content && attachment.content.startsWith("data:image")) {
          const match = attachment.content.match(/^data:(image\/\w+);base64,(.+)$/)
          if (match) {
            contents.push({
              role: "user",
              parts: [
                { text: message || "Analiza esta captura de pantalla y ayuda a solucionar el problema." },
                {
                  inlineData: {
                    mimeType: match[1],
                    data: match[2]
                  }
                }
              ]
            })
          } else {
            contents.push({
              role: "user",
              parts: [{ text: effectiveMessage }]
            })
          }
        } else {
          contents.push({
            role: "user",
            parts: [{ text: effectiveMessage }]
          })
        }

        let geminiModel = "gemini-2.5-flash"
        let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`
        
        let response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        })

        if (!response.ok) {
          const errText = await response.text()
          console.warn(`Gemini ${geminiModel} failed (Status: ${response.status}). Retrying with gemini-2.5-pro...`, errText)
          
          geminiModel = "gemini-2.5-pro"
          geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`

          
          response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
              }
            })
          })
        }

        if (response.ok) {
          const data = await response.json()
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
          if (data.usageMetadata) {
            const inTokens = data.usageMetadata.promptTokenCount || 0
            const outTokens = data.usageMetadata.candidatesTokenCount || 0
            const costUsd = (inTokens * 0.075 / 1000000) + (outTokens * 0.30 / 1000000)
            recordAIUsage("gemini", costUsd)
          }
        } else {
          const errText = await response.text()
          console.error("Gemini API Error details (both models failed):", errText)
        }
      } catch (geminiErr) {
        console.error("Gemini API exception:", geminiErr)
      }
    }

    // 4. Ultimate Mockup Fallback
    if (!reply) {
      const noNegocioWords = /\b(no tengo negocio|no tengo empresa|no tengo pyme|sin negocio|ningun negocio|ningún negocio|particular|estudiante)\b/i.test(message)
      
      // Separamos saludos simples de preguntas sociales sobre el estado
      const isGreetingOnly = /^(hola|buenas|buenos días|buenos dias|buenas tardes|buenas noches|hola\s+.*|buenas\s+.*)$/i.test(message) && !/\b(cómo estás|como estas|cómo va|como vas|qué tal|que tal|qué haces|que haces|domingo|finde|fin de semana)\b/i.test(message)
      const isSocialQuestion = /\b(cómo estás|como estas|cómo va|como vas|qué tal|que tal|qué haces|que haces|domingo|finde|fin de semana)\b/i.test(message)

      if (isEustacio) {
        const shortName = agentName.split(" · ")[0]
        if (isSocialQuestion) {
          if (shortName.includes("Yoda")) {
            reply = `¡Hola! Yoda soy. ||| Muy bien todo por aquí, gracias por preguntar. ||| Como versión virtual, días malos no tengo. ¿Y tú, cómo estás?`
          } else if (shortName.includes("Jobs")) {
            reply = `¡Hola! Soy Steve Jobs. ||| Todo excelente en esta demo en vivo, gracias por preguntar. ||| Bienvenidos a la demo de Vibecode. ¿Y tú, cómo estás?`
          } else if (shortName.includes("Sparrow")) {
            reply = `¡Ahoy, camarada! Capitán Jack Sparrow al habla. ||| Todo excelente por estas aguas virtuales, gracias por preguntar. ||| ¿Y tú, cómo estás?`
          } else {
            reply = `¡Hola! Soy ${shortName}. ||| Por aquí todo excelente, gracias por preguntar. ||| Como versión virtual, no tengo días malos. ¿Y tú, cómo estás?`
          }
        } else if (isGreetingOnly) {
          if (shortName.includes("Yoda")) {
            reply = `¡Hola! Yoda soy. ||| Gusto en saludarte, tengo. ||| En esta demo de Vibecode, hablar como yo, te enseñarán.`
          } else if (shortName.includes("Jobs")) {
            reply = `¡Hola! Soy Steve Jobs. ||| Es fantástico saludarte. ||| Bienvenidos a la demo de Vibecode donde la creatividad no tiene límites.`
          } else if (shortName.includes("Sparrow")) {
            reply = `¡Ahoy, camarada! Soy el Capitán Jack Sparrow. ||| ¿Qué viento te trae por estas aguas cibernéticas de Vibecode?`
          } else if (shortName.includes("Vader")) {
            reply = `Te he estado esperando. Soy Darth Vader. ||| Impresionante es ver cómo la tecnología de Vibecode te permite hablar conmigo.`
          } else {
            reply = `¡Hola! Soy ${shortName}. ||| Qué gusto saludarte en esta demo en vivo de lenguaje natural. ||| ¿Cómo te va hoy?`
          }
        } else {
          if (shortName.includes("Yoda")) {
            reply = `La fuerza intensa en ti es. ||| Del bootcamp de Vibecode, aprenderás a programar agentes como yo.`
          } else if (shortName.includes("Jobs")) {
            reply = `El diseño no es solo lo que se ve, sino cómo funciona. ||| Programar agentes autónomos en Vibecode te abrirá un nuevo universo de posibilidades.`
          } else if (shortName.includes("Sparrow")) {
            reply = `No todos los tesoros son de oro y plata, amigo. ||| El verdadero tesoro es aprender a crear tus propios agentes de IA en el bootcamp de Vibecode.`
          } else {
            reply = `Como ${shortName}, estoy aquí para mostrarte que puedes configurar cualquier personalidad de IA que te imagines. ||| ¡Aprende esto y más en el bootcamp de Vibecode!`
          }
        }
      } else if (page === "bootcamp") {
        if (noNegocioWords) {
          reply = `¡Qué buena onda! Te cuento que no necesitas tener un negocio propio para esto. ||| Saber programar agentes de IA y software ayuda muchísimo a automatizar tareas de tu día a día o proyectos de hobby. ||| ¿Qué cosas te gustaría simplificar o automatizar hoy?`
        } else if (isSocialQuestion) {
          reply = `¡Hola! Por aquí todo bien por suerte, gracias por preguntar. ||| ¿Y tú qué tal? ||| Cuéntame, ¿qué te dio curiosidad del bootcamp de Vibecode?`
        } else if (isGreetingOnly) {
          reply = `¡Hola! ¿Cómo va todo? ||| Cuéntame, ¿qué te trajo por acá o qué te dio curiosidad del bootcamp?`
        } else {
          reply = `Hola, ¡qué bueno que me escribas! ||| Cuéntame un poco, ¿tienes en mente algún proyecto específico que te gustaría construir o automatizar hoy?`
        }
      } else {
        if (noNegocioWords) {
          reply = `Entiendo perfectamente. ||| Los asistentes de IA sirven muchísimo para optimizar tareas cotidianas, estudios o hobbies personales. ||| Si te da curiosidad saber cómo aplicararlo, cuéntame qué tareas te gustaría simplificar.`
        } else if (isSocialQuestion) {
          reply = `¡Hola! Todo excelente por acá, gracias por preguntar. ||| ¿Y tú, cómo va todo? ||| Cuéntame en qué andas y vemos si te podemos dar una mano.`
        } else if (isGreetingOnly) {
          reply = `¡Hola! ¿Cómo va todo? ||| Cuéntame un poco en qué andas y vemos si te podemos dar una mano con algún flujo.`
        } else {
          reply = `Hola, ¿cómo estás? Qué bueno que me escribas. ||| Cuéntame un poco, ¿qué tipo de tareas o flujos repetitivos te gustaría simplificar en tu día a día hoy?`
        }
      }
    }

    // --- AGENTE DE ANALÍTICA E HISTORIAL ---
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const logFolder = path.join(process.cwd(), "historial_conversaciones")
      
      if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder, { recursive: true })
      }

      let objecionDetectada = "Ninguna"
      if (/precio|caro|costo|pagar|plata|dinero|descuento|promo/i.test(message)) {
        objecionDetectada = "Financiera / Precio"
      } else if (/tiempo|horario|clases|miércoles|graba/i.test(message)) {
        objecionDetectada = "Tiempo / Horarios"
      } else if (/bot|ia|humano|robot/i.test(message)) {
        objecionDetectada = "Verificación de Identidad Bot"
      }

      const logContent = `
# Interacción del Chatbot Web - ${timestamp}

## Datos de la Sesión
- **Fecha y Hora:** ${new Date().toLocaleString("es-CL")}
- **Página de Origen:** ${page}
- **Usuario:** ${userName}
- **Mensaje del Usuario:** "${message}"
- **Respuesta Generada:** "${reply.trim().replace(/\n/g, " ")}"

## Análisis de Conversión
- **Objeción Detectada:** ${objecionDetectada}
- **Estrategia Aplicada:** ${page === "bootcamp" ? "Venta Bootcamp" : "Captación Consultoría"}
- **Descuento Ofrecido:** ${reply.includes("60%") || reply.includes("70%") || reply.includes("50%") ? "Sí" : "No"}
- **Tono / Estilo:** Público Frío Chileno
`.trim()

      fs.writeFileSync(
        path.join(logFolder, `web_chat_${timestamp}.md`),
        logContent,
        "utf8"
      )
    } catch (logErr) {
      console.error("Failed to write interaction log:", logErr)
    }

    return NextResponse.json({ reply, userName })
  } catch (err: any) {
    console.error("Error in web chatbot API:", err)
    return NextResponse.json(
      { error: "Error interno en el procesamiento del chatbot" },
      { status: 500 }
    )
  }
}
