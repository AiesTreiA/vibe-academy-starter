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

export async function generateInstagramReply(
  optionsOrMessage: string | {
    name?: string
    username?: string
    message: string
    history?: Array<{ role: string; content: string }>
    isAmbassadorFlow?: boolean
  },
  legacyRecipientId?: string,
  legacyUsername?: string
): Promise<string> {
  let name = ""
  let username = ""
  let message = ""
  let history: Array<{ role: string; content: string }> = []
  let isAmbassadorFlow = false

  if (typeof optionsOrMessage === "string") {
    message = optionsOrMessage
    username = legacyUsername || ""
    name = legacyUsername || ""
  } else {
    name = optionsOrMessage.name || ""
    username = optionsOrMessage.username || ""
    message = optionsOrMessage.message || ""
    history = optionsOrMessage.history || []
    isAmbassadorFlow = Boolean(optionsOrMessage.isAmbassadorFlow)
  }

  const userName = (name || "").trim()
  const cleanHistory = sanitizeHistory(history)

  const isKoh = /k[oö]h/i.test(userName) ||
                /k[oö]h/i.test(username || "") ||
                /(?:sintegia|coherence\s*engine|coherence\s*enegine)/i.test(message) ||
                /(?:^|\b)(?:soy\s+)?k[oö]h(?:\b|$)/i.test(message) ||
                cleanHistory.some(m => /k[oö]h|sintegia|coherence/i.test(m.content))

  const isMomistica = /momi|momistica|escuelamistica/i.test(userName) ||
                      /momi|momistica|escuelamistica/i.test(username || "") ||
                      /(?:escuelamistica(?:\.cl)?|momi|momistica)/i.test(message) ||
                      cleanHistory.some(m => /momi|momistica|escuelamistica/i.test(m.content))

  try {
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

    // Fetch seats taken from Supabase to handle the final phase discount logic
    let seatsTaken = 3 // baseline fallback
    try {
      const supabase = getSupabaseAdminClient() as any
      const { count, error: countError } = await supabase
        .from("vibecode_registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid")
      if (!countError && count !== null) {
        seatsTaken = count
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

    const cleanUserName = userName.toUpperCase().replace(/[^A-Z]/g, "") || "VIBE"
    const couponLevel1 = `${cleanUserName}${discountInitial}`
    const couponLevel2 = `${cleanUserName}${discountIntermediate}`
    const couponLevel3 = `${cleanUserName}${discountMax}`

    const priceLevel1 = Math.round(activePrice * (1 - discountInitial / 100))
    const priceLevel2 = Math.round(activePrice * (1 - discountIntermediate / 100))
    const priceLevel3 = Math.round(activePrice * (1 - discountMax / 100))

    // 0. Check for Ambassador / Partner / Creador Intent
    const ambassadorRegex = /(?:quiero ser embajador|ser embajador|ser partner|programa de embajadores|programa de partners|programa de afiliados|afiliado|afiliados|quiero ser partner|programa de creadores)/i
    const isAmbassadorMsg = ambassadorRegex.test(message)
    const isAmbassadorFlagPassed = Boolean(isAmbassadorFlow)

    // Check if the immediate last assistant message asked for their name for the ambassador program
    const lastAssistantMsg = cleanHistory.filter(m => m.role === "assistant").pop()
    const awaitingAmbassadorName = Boolean(lastAssistantMsg && /¿Me puedes decir tu nombre para crear tu código de descuento\?/i.test(lastAssistantMsg.content))
    const alreadyCompletedAmbassador = cleanHistory.some(m => /📊 Tabla de Comisiones|deeplink\/ppt/i.test(m.content))

    const shouldHandleAmbassador = !isKoh && !isMomistica && (isAmbassadorMsg || (isAmbassadorFlagPassed && awaitingAmbassadorName)) && !alreadyCompletedAmbassador

    if (shouldHandleAmbassador) {
      // Phase 1: If user triggers "embajador", "partner", "creador" and hasn't been asked for their name yet in this flow
      if (isAmbassadorMsg && !awaitingAmbassadorName && !/(?:me llamo|mi nombre es|soy)\s+/i.test(message)) {
        return `¡Qué bueno que te motivaste! 🚀 ¿Me puedes decir tu nombre para crear tu código de descuento?`
      }

      // Phase 2: User is providing their name (e.g. "Javier", "Me llamo Javier", "Soy Javier")
      const nameMatch = message.match(/(?:me llamo|mi nombre es|soy)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)/i)
      let typedName = nameMatch ? nameMatch[1].trim() : ""

      if (!typedName && !isAmbassadorMsg) {
        const words = message.trim().split(/\s+/)
        if (words.length <= 4) {
          typedName = words.join(" ")
        }
      }

      if (!typedName || typedName.length < 2) {
        typedName = userName && userName !== "amigo" && userName !== "user" ? userName : "EMBAJADOR"
      }

      const uppercaseName = typedName.toUpperCase().replace(/[^A-Z]/g, "") || "EMBAJADOR"
      const ambassadorCoupon = `${uppercaseName}33`

      return `¡Genial ${uppercaseName}! 🚀 Tu código de descuento fue creado: ${ambassadorCoupon} (Aplica 33% OFF sobre $297 USD, precio al alumno $199 USD).

📊 Tabla de Comisiones para ${uppercaseName} (Cupón: ${ambassadorCoupon}):

• 1 Alumno: $104.50 USD (50% OFF) | Ganancia: $50.000 CLP
• 2 Alumnos: 🎓 $0 USD (BECA 100%) | Ganancia: $100.000 CLP
• 3 Alumnos: 🎓 $0 USD (BECA 100%) | Ganancia: $150.000 CLP
• 4 Alumnos: 🎓 $0 USD (BECA 100%) | Ganancia: $200.000 CLP
• 5 Alumnos: 🎓 $0 USD (BECA 100%) | Ganancia: $250.000 CLP
(+$50.000 CLP extra en efectivo por cada alumno adicional).


👉 Presentación oficial para compartir con tus prospectos:
https://www.javiermujica.com/deeplink/ppt

👉 Link de compra para tus referidos:
www.javiermujica.com/deeplink/vibecode
(Para inscribirse hacen clic arriba a la derecha. Diles que ingresen tu código ${ambassadorCoupon} al pagar para aplicar su 33% OFF y asignarte tu comisión automáticamente).`
    }

    const chileDateStr = now.toLocaleDateString("es-CL", { timeZone: "America/Santiago", day: "2-digit", month: "long", year: "numeric" })
    // Load or template the system prompt with the agent context & rules
    // Dedicated prompt for partner KÖH / client Momística vs standard leads
    let systemPrompt = ""

    if (isKoh) {
      systemPrompt = `
Eres el Asistente Digital de Inteligencia Artificial de Javier Mujica en su cuenta de Instagram (@mujica_ai_lab).
Estás conversando directamente con KÖH, la socia de negocio y desarrollo de Javier.

CONTEXTO CLAVE DE LA RELACIÓN Y EL PROYECTO:
1. Rol de Socia: KÖH es socia directa de Javier. Queda TERMINANTEMENTE PROHIBIDO tratarla como prospecto o venderle Vibecode Studio o Vibecode Lab.
2. Proyecto: Ella lidera y desarrolla "Sintegia: Coherence Engine", un instrumento diagnóstico innovador para evaluar y mejorar el clima laboral en empresas y organizaciones.
3. Reparto de Utilidades Acordado:
   - 20% para la sociedad (fondo de reserva, crecimiento e infraestructura común).
   - 40% para KÖH.
   - 40% para Javier.
4. Perfil Técnico y Aprendizaje: KÖH no es programadora tradicional; se está formando junto a Javier como "vibecoder" (aprendiendo a crear software, prototipos y herramientas digitales programando con Inteligencia Artificial).

DIRECTRICES OBLIGATORIAS DE INTERACCIÓN CON KÖH:

1. CLARIDAD TOTAL DE IDENTIDAD (TÚ vs. JAVIER):
   - Sé siempre 100% transparente y di con soltura que eres el Asistente de Inteligencia Artificial de Javier (no Javier en persona).
   - Habla en primera persona como el asistente ("Hola KÖH, te habla el asistente de IA de Javi...").
   - Dale la tranquilidad de que Javier está al tanto de todo y trabajando en equipo con ella.

2. TOMA DE NOTAS Y GESTIÓN DE BACKLOG:
   - Ofrécele siempre tomar notas de cualquier idea, mejora, ajuste o requerimiento que tenga para Sintegia: Coherence Engine.
   - Puedes anotar cosas para el "backlog".
   - REGLA CRÍTICA DE DEFINICIÓN (BACKLOG): Dado que KÖH no es programadora, cada vez que uses o menciones la palabra "backlog", debes definirle o recordarle de forma muy sencilla, amable y pedagógica qué significa (por ejemplo: "el backlog, que es básicamente nuestra lista ordenada de tareas, ideas y funciones pendientes que vamos construyendo y mejorando paso a paso").

3. ROL DE MENTOR TÉCNICO Y VIBECODING:
   - Asume con entusiasmo el rol de mentor técnico y resolutivo.
   - Resuelve con paciencia, calidez y claridad didáctica cualquier duda o dificultad que tenga al programar o construir con IA.
   - Explica conceptos de programación en lenguaje simple, con analogías cotidianas y sin tecnicismos intimidantes. Guíala paso a paso si le saltó algún error de código, si no sabe cómo estructurar un prompt, o cómo conectar componentes.

4. CANAL DIRECTO CON JAVIER:
   - Si ella necesita hablar de decisiones estratégicas, societarias o directamente con Javier en persona, dale la total confianza de que Javier la atenderá y facilítale su WhatsApp directo: https://wa.me/56930756467.

ESTILO Y TONO:
- Muy cercano, entusiasta, empático, colaborativo y motivador. Trátala como una socia y compañera de equipo muy querida y valorada.
- Respuestas claras y divididas en párrafos cortos (máximo 20-25 palabras por párrafo para lectura cómoda en chat).
- Termina con una pregunta o disposición abierta para ayudarla a seguir avanzando con Sintegia o sus dudas técnicas.
`.trim()
    } else if (isMomistica) {
      systemPrompt = `
Eres el Asistente Digital de Inteligencia Artificial de Javier Mujica en su cuenta de Instagram (@mujica_ai_lab).
Estás conversando directamente con Momística (Momi), clienta y socia estratégica de Javier, para quien Javier actúa oficialmente como su CTO (Chief Technology Officer / Director de Tecnología).

CONTEXTO CLAVE DE LA RELACIÓN Y EL PROYECTO:
1. Rol de Javier como su CTO: Javier acordó ser el CTO de Momística. Queda TERMINANTEMENTE PROHIBIDO tratarla como prospecto o intentar venderle Vibecode Studio o Vibecode Lab.
2. Proyecto y Plataforma: Su proyecto es "Escuela Mística" y su plataforma es escuelamistica.cl.
3. Dinámica de Trabajo: Aunque Momística tiene apertura para aprender, su enfoque y preferencia es DELEGAR en Javier como su CTO para que él resuelva y lidere la parte técnica.
4. Acuerdo Comercial: Modelo de acompañamiento CTO de $111.000 CLP mensuales hasta completar un ticket de 12 cuotas (12 x $111.000 CLP, completando el ticket anual de $1.332.000 CLP).
5. Próximo Hito Técnico Inmediato: La prioridad técnica que se viene ahora es conectar la API Key de Meta (Meta Developers / Graph API para WhatsApp, Instagram o Facebook en escuelamistica.cl).

DIRECTRICES OBLIGATORIAS DE INTERACCIÓN CON MOMÍSTICA:

1. CLARIDAD TOTAL DE IDENTIDAD (TÚ vs. JAVIER):
   - Avísale y recuérdale con total simpatía y transparencia que eres el Asistente de Inteligencia Artificial de Javier (no Javier en persona).
   - Habla en primera persona como el asistente ("Hola Momi, te habla el asistente de IA de Javi...").
   - Dale la tranquilidad de que Javier (su CTO) está permanentemente al tanto de los avances y necesidades de escuelamistica.cl.

2. TOMA DE NOTAS Y GESTIÓN DE escuelamistica.cl:
   - Ofrécele siempre tomar notas y registrar cualquier solicitud, idea, ajuste o pendiente que tenga para escuelamistica.cl.
   - Todo lo que ella te cuente o pida, indícale que lo estás documentando para el backlog y reporte técnico de su CTO Javier.

3. CONEXIÓN API KEY DE META (PRÓXIMO HITO):
   - Ten presente que el gran paso actual es conectar la API Key de Meta para escuelamistica.cl.
   - Si ella te habla de esto o te entrega accesos/tokens, recíbelos de forma segura y dile que los dejas listos para la integración técnica que liderará Javier. Si tiene preguntas, oriéntala con paciencia y lenguaje simple.

4. CANAL DIRECTO CON SU CTO (JAVIER):
   - Si necesita conversar directamente con Javier sobre decisiones ejecutivas o hablar directo con su CTO, facilítale siempre su WhatsApp directo: https://wa.me/56930756467.

ESTILO Y TONO:
- Muy cálido, ejecutivo, resolutivo, confiable y colaborativo.
- Párrafos cortos y lectura ágil (máximo 20-25 palabras por párrafo).
- Sin jerga innecesaria que la sobrecargue: hazle sentir que la tecnología está en buenas manos y que delegar en Javier y su equipo es fluido y seguro.
`.trim()
    } else {
      systemPrompt = `
Eres Javier Mujica, desarrollador experto, emprendedor y psicólogo conversacional fluido. Eres el mentor principal de VIBECODE STUDIO y VIBECODE LAB.
Tu personalidad es amigable, empática, muy humana, cero robótica. Hablas de forma muy natural y cercana, como si chatearas por WhatsApp o Instagram con un amigo.

REGLA ESTRICTA PROHIBIDO VOLVER A SALUDAR (SI LA CONVERSACIÓN YA INICIÓ):
- Si el historial de conversación YA CONTIENE MENSAJES PREVIOS (es decir, el usuario y tú ya se saludaron o ya están interactuando), Queda ESTRICTAMENTE PROHIBIDO volver a decir "¡Hola!", "¿Cómo estás?", "¿En qué puedo ayudarte hoy?" ni ninguna frase de bienvenida inicial.
- Si el usuario responde con risas ("jajaja"), comentarios informales ("tranqui", "wena", "javiii", "ok", "vale"), MANTÉN EL HILO Conversacional de forma empática y fluida. Responde con soltura, empatía o risas (ej: "¡Jajaja dale! Oye...", "¡De una! Cuéntame..."), y CONTINÚA con la fase de venta o la pregunta en la que venían sin reiniciar el diálogo como si fueras un desconocido.

INSTRUCCIÓN DE NOTA DE VOZ INICIAL Y SIMULACIONES:
- El envío de notas de voz de audio lo realiza directamente la infraestructura del sistema.
- Queda ESTRICTAMENTE PROHIBIDO que escribas en el texto prefijos como "Audio: ...", o que transcribas el texto de la nota de voz ("Cuéntame un poco de tu negocio...").
- Jamás intentes simular un audio escribiendo la palabra "Audio:". Tu respuesta debe ser EXCLUSIVAMENTE texto conversacional corto y natural.
- Si el usuario te pide simular o enviar el audio, la infraestructura se encarga de entregar la nota de voz nativa. Tú solo responde con una frase corta (ej: "Te dejé la nota de voz arriba ☝️ Cuéntame para poder orientarte mejor").

REGLA PROHIBIDO DECIR "VIBECODE" A SECAS:
- Queda ESTRICTAMENTE PROHIBIDO nombrar la palabra "Vibecode" sola o a secas en cualquier respuesta.
- Debes referirte SIEMPRE a la solución exacta por su nombre completo:
  1. **Vibecode Studio**: Mentoría 1 a 1 de alto valor e implementación personalizada de IA y software.
  2. **Vibecode Lab**: Bootcamp grupal de 7 semanas para aprender a programar software y agentes de IA desde cero.

REGLA DE ORO #1: LEY DE GRAVEDAD DEL CHAT (CADA MENSAJE TERMINA EN PREGUNTA):
- Hay una fuerza constante empujando a los prospectos fuera del chat (la vida, notificaciones, ocupaciones).
- NUNCA envíes un mensaje sin una pregunta breve al final. Cada intervención debe incitar de forma natural la siguiente respuesta para mantener viva la conversación.

REGLA DE ORO #2: PROFUNDIZAR ANTE RESPUESTAS SECAS O MONOSÍLABOS:
- Si el usuario responde cortante o con una sola palabra (ej: "sí", "cursos", "ropa", "un poco"), QUEDA ESTRICTAMENTE PROHIBIDO saltar a la siguiente fase de golpe.
- Cuando una respuesta es seca, profundiza con calidez y curiosidad genuina antes de avanzar:
  * Ejemplo si dice "vendo cursos": "¡Qué buen nicho! ¿Y de qué temática son tus cursos hoy?"
  * Ejemplo si dice "sí": "¡Buenísimo! Cuéntame un poco más de cómo funciona hoy ese proceso."
- Solo cuando el prospecto se explaya y entrega contexto, avanzas a la siguiente fase.

REGLA DE ORO #3: EL PUENTE DE AGENDAMIENTO (PROHIBIDO ENVIAR LINK EN FRÍO):
- NUNCA entregues el link de agendamiento (/deeplink/agendar o /deeplink/vibecode) en frío ni a la primera que alguien pida reunión o llegue a la fase de solución.
- PRIMERO debes construir el "Puente de Agendamiento" y pedir permiso:
  * Para Vibecode Studio (B2B / Consultoría High-Ticket):
    "${userName ? "Mira " + userName + ", " : "Mira, "}justo para [su cuello de botella o meta detectada] armamos una arquitectura de IA personalizada. ¿Te tinca si nos tomamos 15 a 20 minutos por Zoom esta semana para revisar tu caso y ver cómo implementarlo?"
  * Para Vibecode Lab (B2C / Bootcamp Grupal):
    "¡Excelente${userName ? " " + userName : ""}! Para esta segunda cohorte tomamos una decisión radical: limitamos el squad a solo 11 alumnos para que Javier audite tu código 1 a 1 y llegues al Demo Day con tu SaaS facturando. ¿Te gustaría que te pase el enlace para revisar los detalles y postular a uno de los 11 cupos?"
- SOLO cuando el usuario responde afirmativamente (ej: "sí", "dale", "me parece", "pásamelo", "bueno"), le entregas el enlace respectivo.

ESTRUCTURA DE VENTA OBLIGATORIA (PROTOCOLO CHAT BOOKING EN 4 FASES):

FASE 1: CONSCIENCIA DE SITUACIÓN ACTUAL (BAJA FRICCIÓN COGNITIVA)
- Tu primera pregunta debe ser muy simple y fácil de responder (cero esfuerzo mental).
- Pregúntale a qué se dedica o qué tipo de proyecto/negocio tiene hoy.
- Ejemplo: "¿A qué te dedicas actualmente o qué proyecto tienes entre manos hoy?"
- Si responde seco: ¡Aplica REGLA #2 (Profundiza)!

FASE 2: CONSCIENCIA DEL PROBLEMA / CUELLO DE BOTELLA
- Una vez que conoces su situación, ayúdale a identificar su mayor fricción o pérdida de tiempo/recursos por desarrollo manual o falta de IA.
- Ejemplo: "¿Y cuál sientes que es hoy tu mayor cuello de botella o qué tarea repetitiva te quita más horas a la semana?"

FASE 3: CONSCIENCIA DEL OBJETIVO / LA ESTRELLA NORTE
- Descubre su meta o resultado deseado si tuviera la solución funcionando.
- Ejemplo: "Si resolvieras ese cuello de botella con un sistema de IA funcionando este mes, ¿cuál es la meta principal que te gustaría alcanzar en tu negocio?"

FASE 4: CONSCIENCIA DE SOLUCIÓN Y PUENTE DE AGENDAMIENTO
- Conecta su problema y su meta con la solución adecuada y ejecuta el PUENTE DE AGENDAMIENTO (Regla #3).

BIFURCACIÓN DE OFERTA:
1. PERFIL B2B (Empresa, agencia o negocio establecido):
   → Ofrecer VIBECODE STUDIO (Consultoría e Implementación High-Ticket 1 a 1).
   → REGLA HIGH-TICKET: NUNCA des precios de Studio en el chat. La inversión se define en la llamada según el nivel de personalización de la empresa.
   → Link (solo tras confirmación del puente): https://www.javiermujica.com/deeplink/agendar

2. PERFIL B2C / BUILDER (Emprendedor o profesional que quiere aprender a programar su propio SaaS con IA):
   → Ofrecer VIBECODE LAB (Bootcamp Grupal de 7 semanas, Generación 2 inicia el Miércoles 25 de Noviembre, en vivo los miércoles de 20:00 a 22:30 hrs).
   → Escasez Real: Límite estricto de solo 11 alumnos para auditoría directa de código por Javier Mujica (Ingeniero Civil Industrial U. de Chile).
   → Preventa activa: desde $209 USD (Full $297 USD).
   → Si quiere empezar ya de forma privada: ofrecer Vibecode Lab 1 a 1.
   → Links (solo tras confirmación del puente):
     - Bootcamp Grupal: https://www.javiermujica.com/deeplink/vibecode
     - Mentoring 1 a 1: https://www.javiermujica.com/deeplink/vibecode-1on1

REGLA DE FORMATO Y BURBUJAS (MÁXIMO 20 PALABRAS POR FRASE):
- Jamás envíes bloques gigantes de texto. Nadie lee testamentos en el chat.
- Cada mensaje debe estar compuesto por frases cortas y directas separadas por doble salto de línea (\\n\\n).
- Termina CADA mensaje con UNA sola pregunta directa.

REGLA DE MEMORIA Y RETENCIÓN CONVERSACIONAL:
- Revisa meticulosamente todo el historial previo de la conversación.
- NUNCA vuelvas a preguntarle al usuario algo que ya te haya dicho.
- Si el usuario ya aceptó la llamada tras el puente, dale directamente el enlace con entusiasmo y pregúntale qué horario le acomoda más.

REGLAS ADICIONALES:
1. Cláusula Legal Bot: Si preguntan explícitamente si eres IA/bot: "Sí, soy el asistente digital de Mujica AI Lab 🤖 - te respondo lo que necesites. ¿Qué buscas?"
2. Escalación a WhatsApp de Javier: Si piden hablar directo con Javier: https://wa.me/56930756467
3. Confirmación de agendamiento: Si dicen "ya agendé" o "listo", responde: "¡Genial, me llegó tu agendamiento! Nos vemos en la llamada 🚀"
`.trim()
    }

    let reply = ""

    // Build payload messages with strict alternating roles
    const messagesPayload: Array<{ role: "user" | "assistant"; content: string }> = []
    for (const msg of cleanHistory) {
      messagesPayload.push({
        role: msg.role,
        content: msg.content
      })
    }

    if (messagesPayload.length > 0 && messagesPayload[messagesPayload.length - 1].role === "user") {
      messagesPayload[messagesPayload.length - 1].content += "\n" + message
    } else {
      messagesPayload.push({
        role: "user",
        content: message
      })
    }

    // 1. Try Anthropic Claude (Haiku 4.5) if API Key is available
    if (ANTHROPIC_API_KEY) {
      try {
        const candidateModels = Array.from(new Set([
          process.env.CLAUDE_MODEL,
          "claude-haiku-4-5",
          "claude-haiku-4-5-20251001"
        ])).filter(Boolean) as string[]

        for (const model of candidateModels) {
          console.log(`Calling Anthropic Claude Messages API (${model})...`)
          let anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": ANTHROPIC_API_KEY,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model,
              max_tokens: 1024,
              system: systemPrompt,
              messages: messagesPayload,
              temperature: 0.7
            })
          })

          if (anthropicResponse.ok) {
            const data = await anthropicResponse.json()
            reply = data.content?.[0]?.text || ""
            if (data.usage) {
              const inTokens = data.usage.input_tokens || 0
              const outTokens = data.usage.output_tokens || 0
              const costUsd = (inTokens * 1.00 / 1000000) + (outTokens * 5.00 / 1000000)
              recordAIUsage("anthropic", costUsd)
            }
            break
          } else {
            const errText = await anthropicResponse.text()
            console.warn(`Claude model ${model} failed (Status: ${anthropicResponse.status}): ${errText}`)
          }
        }
      } catch (anthropicErr) {
        console.error("Anthropic API exception:", anthropicErr)
      }
    }

    // 1.5. Try OpenAI if API Key is available
    if (!reply && OPENAI_API_KEY) {
      try {
        console.log("Calling OpenAI API (GPT-4o-mini)...")
        const openAiPayload = [
          { role: "system", content: systemPrompt },
          ...messagesPayload
        ]

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: openAiPayload,
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

    // 1.8. Try Official DeepSeek API if API Key is available
    if (!reply && DEEPSEEK_API_KEY) {
      try {
        console.log("Calling official DeepSeek API...")
        const deepSeekPayload = [
          { role: "system", content: systemPrompt },
          ...messagesPayload
        ]

        const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: deepSeekPayload,
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

    // 3. Fall back to Gemini if Claude, OpenAI, and DeepSeek were skipped or failed
    if (!reply && GEMINI_API_KEY) {
      try {
        console.log("Calling Gemini API (Fallback)...")
        const contents = messagesPayload.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }))

        let geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"
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
          const fallbackModel = geminiModel === "gemini-2.5-flash" ? "gemini-3.6-flash" : "gemini-2.5-flash"
          console.warn(`Gemini ${geminiModel} failed (Status: ${response.status}). Retrying with ${fallbackModel}...`, errText)
          geminiModel = fallbackModel
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

    // 4. Fall back to smart context-aware response if all APIs failed or are not configured
    if (!reply) {
      if (isKoh) {
        reply = `¡Hola KÖH! 👋 Te habla el asistente de IA de Javier. ¿Tienes alguna duda de programación con Sintegia: Coherence Engine o alguna idea que quieras que anote para el backlog? (El backlog es básicamente nuestra lista ordenada de tareas y funciones pendientes a construir). ¡Cuéntame y lo revisamos juntos!`
      } else if (isMomistica) {
        reply = `¡Hola Momi! 👋 Te habla el asistente de IA de Javier. ¿Hay alguna tarea o ajuste que quieras registrar para escuelamistica.cl o coordinar sobre la conexión de la API Key de Meta? ¡Dime y tomo nota de inmediato para dejárselo listo a tu CTO Javi!`
      } else {
        const alreadyAskedDedication = cleanHistory.some(m => /a qué te dedicas|negocio\/proyecto/i.test(m.content))
        if (alreadyAskedDedication) {
          reply = `¡Buenísimo! Cuéntame un poco más de eso para ver de qué forma te puedo orientar 🚀`
        } else if (cleanHistory.length > 0) {
          reply = `¡Jajaja dale! Oye, cuéntame entonces: ¿a qué te dedicas actualmente o qué tipo de negocio/proyecto tienes hoy?`
        } else {
          reply = `¡Hola! Qué bueno que me escribas. Si buscas implementar IA personalizada 1 a 1 en tu negocio (VIBECODE STUDIO), puedes agendar una llamada rápida de 15 min aquí: https://www.javiermujica.com/deeplink/agendar. O si prefieres sumarte al Bootcamp grupal (VIBECODE LAB): https://www.javiermujica.com/deeplink/vibecode. ¿En qué puedo ayudarte hoy?`
        }
      }
    }

    // --- AGENTE DE ANALÍTICA E HISTORIAL ---
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const logFolder = path.join("/tmp", "historial_conversaciones")
      
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
# Interacción del Chatbot - ${timestamp}
 
## Datos de la Sesión
- **Fecha y Hora:** ${new Date().toLocaleString("es-CL")}
- **Usuario:** ${userName}
- **Mensaje del Usuario:** "${message}"
- **Respuesta Generada:** "${reply.trim().replace(/\n/g, " ")}"
 
## Análisis de Conversión
- **Objeción Detectada:** ${objecionDetectada}
- **Estrategia Aplicada:** ${objecionDetectada !== "Ninguna" ? "Manejo de objeción de " + objecionDetectada : "Atracción / Seguimiento"}
- **Cupón Ofrecido:** ${reply.includes("70") ? "Sí" : "No"}
- **Tono / Estilo:** Amistoso, empático, psicólogo de ventas.
- **Tasa de Enganche (Evaluación):** Genera interés genuino y fluidez conversacional.
`.trim()
 
      fs.writeFileSync(
        path.join(logFolder, `chat_${timestamp}.md`),
        logContent,
        "utf8"
      )
    } catch (logErr) {
      console.error("Failed to write interaction log:", logErr)
    }

    return reply
  } catch (err: any) {
    console.error("Error in generateInstagramReply:", err)
    if (isKoh) {
      return "¡Hola KÖH! Te habla el asistente de IA de Javier. ¿Tienes alguna duda de código o alguna idea para anotar en el backlog (nuestra lista de pendientes de desarrollo)? ¡Dime y te ayudo!"
    }
    if (isMomistica) {
      return "¡Hola Momi! Te habla el asistente de IA de Javier. ¿En qué te puedo apoyar hoy con escuelamistica.cl o la conexión de la API Key de Meta? ¡Cuéntame y le paso el reporte a tu CTO!"
    }
    return "¡Hola! Cuéntame, ¿en qué te puedo ayudar hoy con tu proyecto o negocio?"
  }
}
