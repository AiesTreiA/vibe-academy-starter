import crypto from "crypto"

export interface EbookVolumeMeta {
  vol: 1 | 2 | 3 | 4
  slug: string
  fileName: string
  title: string
  shortTitle: string
  subtitle: string
  accentName: string
  accentHex: string
  coverImage: string
  photoImage: string
  pexelsCredit: string
  pexelsUrl: string
  brandToken: string
  badgeBgClass: string
  badgeTextClass: string
  badgeBorderClass: string
  gradientClass: string
  quizBannerTitle: string
  quizBannerSubtitle: string
  dimensionKey: "infraestructura" | "pitch" | "metricas" | "capital"
  dimensionLabel: string
  chapters: {
    number: number
    title: string
    summary: string
    durationOrMetric: string
  }[]
}

export const UNICORN_BIBLE_VOLUMES: Record<1 | 2 | 3 | 4, EbookVolumeMeta> = {
  1: {
    vol: 1,
    slug: "vol-1-de-localhost-a-produccion",
    fileName: "vol-1-de-localhost-a-produccion.md",
    title: "De Localhost a Producción: Arquitectura SaaS Inquebrantable para Founders que Buscan Inversión",
    shortTitle: "De Localhost a Producción",
    subtitle:
      "Cómo transformar un prototipo local en una máquina global en Vercel con estándar de Due Diligence institucional.",
    accentName: "Electric Blue",
    accentHex: "#3B82F6",
    coverImage: "/ebooks/covers/vol-1-cover.webp",
    photoImage: "/ebooks/covers/photo-vol-1.webp",
    pexelsCredit: "Pexels #6424583 · Macro IDE Dark Bokeh",
    pexelsUrl: "https://www.pexels.com/photo/monitor-displaying-lines-of-code-6424583/",
    brandToken: "Electric Blue (#3B82F6) · HSL 217° 91% 60%",
    badgeBgClass: "bg-blue-500/15",
    badgeTextClass: "text-blue-300",
    badgeBorderClass: "border-blue-500/35",
    gradientClass: "from-[#4285F4] via-[#3B82F6] to-cyan-400",
    quizBannerTitle: "Modo Lector · Tomo 1: De Localhost a Producción (Electric Blue)",
    quizBannerSubtitle:
      "Escaneaste el QR del Tomo 1. Estás en la herramienta oficial de validación de VibeCode Lab: registra tu artefacto desplegado, formula tu hipótesis de pauta ($10 USD / 48h) y emite tu acreditación pública SQR-2026.",
    dimensionKey: "infraestructura",
    dimensionLabel: "Infraestructura & Producción",
    chapters: [
      {
        number: 1,
        title: 'El Fin del "Funciona en mi Máquina"',
        summary:
          "Qué auditan los evaluadores técnicos y VCs en los primeros 60 segundos de revisión y por qué los prototipos frágiles quedan fuera antes del pitch.",
        durationOrMetric: "Auditoría < 60s",
      },
      {
        number: 2,
        title: "Higiene de Entorno de Grado Militar",
        summary:
          "Separación estricta Staging vs. Producción y configuración avanzada de Supabase con Connection Pooling (Supavisor/PgBouncer) en puertos 6543/5432.",
        durationOrMetric: "Pooler 6543 Transaction",
      },
      {
        number: 3,
        title: "Monetización desde el Día Cero",
        summary:
          "Transición de llaves TEST- a APP_USR- en Mercado Pago, webhooks idempotentes, firma criptográfica HMAC-SHA256 (x-signature) y manejo de reintentos.",
        durationOrMetric: "Webhooks Idempotentes",
      },
      {
        number: 4,
        title: "Observabilidad, Analítica de Producto y Cero Costo de Egreso",
        summary:
          "Instrumentación de PostHog en producción (filtrado de IPs internas) y almacenamiento en Cloudflare R2 con políticas CORS blindadas y URLs firmadas.",
        durationOrMetric: "$0 Egress Fee",
      },
      {
        number: 5,
        title: "Identidad Soberana (DNS & SSL)",
        summary:
          "Guía paso a paso para NIC Chile, Cloudflare y Namecheap. Configuración de registros A (76.76.21.21), CNAME (cname.vercel-dns.com) y SSL automático.",
        durationOrMetric: "DNS + SSL Grado A+",
      },
      {
        number: 6,
        title: "Protocolo Anti-Caídas para Demo Day",
        summary:
          "Técnica de Cache Warming en rutas Edge/Serverless, fallbacks multi-proveedor de LLM y el Backup de Video Local a 60fps para salvar rondas en vivo.",
        durationOrMetric: "Uptime 99.99% Demo Day",
      },
    ],
  },
  2: {
    vol: 2,
    slug: "vol-2-el-pitch-irrefutable",
    fileName: "vol-2-el-pitch-irrefutable.md",
    title: "El Pitch Irrefutable: Dramaturgia Escénica y Cierre de Capital en 180 Segundos",
    shortTitle: "El Pitch Irrefutable",
    subtitle:
      "El Power Pitch Method® aplicado a Startups de IA para convencer a comités de CORFO, Ángeles y Venture Capitals.",
    accentName: "Vibe AI Purple·Pink",
    accentHex: "#9B72F8",
    coverImage: "/ebooks/covers/vol-2-cover.webp",
    photoImage: "/ebooks/covers/photo-vol-2.webp",
    pexelsCredit: "Pexels #9547593 · Stage Microphone Bokeh",
    pexelsUrl: "https://www.pexels.com/photo/black-microphone-in-close-up-photography-9547593/",
    brandToken: "Vibe AI Purple (#9B72F8) · Pink (#EC4899)",
    badgeBgClass: "bg-purple-500/15",
    badgeTextClass: "text-purple-300",
    badgeBorderClass: "border-purple-500/35",
    gradientClass: "from-[#9B72F8] via-[#EC4899] to-indigo-400",
    quizBannerTitle: "Modo Lector · Tomo 2: El Pitch Irrefutable (Vibe AI Purple·Pink)",
    quizBannerSubtitle:
      "Escaneaste el QR del Tomo 2. Aplica la dramaturgia del relato invencible en la herramienta oficial de VibeCode Lab: condensa tu gancho de campaña y obtén tu certificado verificable SQR-2026.",
    dimensionKey: "pitch",
    dimensionLabel: "Narrativa & Power Pitch",
    chapters: [
      {
        number: 1,
        title: "Psicología y Neurociencia del Comité de Inversión",
        summary:
          "Por qué los comités toman decisiones heurísticas en los primeros 30 segundos y las justifican con lógica financiera después (Sistema 1 vs. Sistema 2).",
        durationOrMetric: "Ventana de 30s",
      },
      {
        number: 2,
        title: "La Tríada del Relato Invencible",
        summary:
          "Cómo construir un discurso simultáneamente Deseable (urgencia de valor), Irrefutable (anclado en tracción real) y Replicable (defendible por un analista sin ti).",
        durationOrMetric: "Deseable · Irrefutable · Replicable",
      },
      {
        number: 3,
        title: "Guionización Quirúrgica de las 6 Escenas (180 Segundos)",
        summary:
          "Guiones literales palabra por palabra: 1. El Dolor (30s), 2. El Analgésico (25s), 3. Solución & Demo en 2 Clics (40s), 4. Tesis Unicornio (30s), 5. Tracción Ágil (35s), 6. The Ask 40/35/25 y Cierre de Doble Alternativa (20s).",
        durationOrMetric: "180 Segundos Exactos",
      },
      {
        number: 4,
        title: "Camaleón Estratégico: CORFO, Ángeles y VCs",
        summary:
          "Matrices de adaptación del discurso según el interlocutor: evaluadores de CORFO (Semilla Inicia/Expande), redes de Ángeles (ACAFI/ChileGlobal Angels) y Partners de VC institucional.",
        durationOrMetric: "3 Matrices de Comité",
      },
    ],
  },
  3: {
    vol: 3,
    slug: "vol-3-metricas-que-mueven-la-aguja",
    fileName: "vol-3-metricas-que-mueven-la-aguja.md",
    title: "Métricas que Mueven la Aguja: Unit Economics para Sobrevivir al Valle de la Muerte",
    shortTitle: "Métricas que Mueven la Aguja",
    subtitle: "Domina el idioma financiero con el que los fondos filtran al 95% de los fundadores.",
    accentName: "Cyber Emerald",
    accentHex: "#10B981",
    coverImage: "/ebooks/covers/vol-3-cover.webp",
    photoImage: "/ebooks/covers/photo-vol-3.webp",
    pexelsCredit: "Pexels #6781273 · Financial Analytics Display",
    pexelsUrl: "https://www.pexels.com/photo/black-screen-with-graph-6781273/",
    brandToken: "Cyber Emerald (#10B981) · Cyan (#06B6D4)",
    badgeBgClass: "bg-emerald-500/15",
    badgeTextClass: "text-emerald-300",
    badgeBorderClass: "border-emerald-500/35",
    gradientClass: "from-emerald-500 via-teal-500 to-cyan-400",
    quizBannerTitle: "Modo Lector · Tomo 3: Métricas que Mueven la Aguja (Cyber Emerald)",
    quizBannerSubtitle:
      "Escaneaste el QR del Tomo 3. Pasa de métricas de vanidad a métricas de sangre: define tu experimento de adquisición pagada ($10 USD / 48h) y certifica tu Squad con el ID SQR-2026.",
    dimensionKey: "metricas",
    dimensionLabel: "Unit Economics & Tracción",
    chapters: [
      {
        number: 1,
        title: "Métricas de Vanidad vs. Métricas de Sangre",
        summary:
          "Por qué los registros gratuitos no pagan servidores y cómo estructurar el embudo de conversión hacia ingresos recurrentes auditables.",
        durationOrMetric: "Embudo de Sangre",
      },
      {
        number: 2,
        title: "El Motor de Ingresos Predecibles (MRR, ARR y MoM Growth)",
        summary:
          "Descomposición exacta del MRR (New, Expansion, Contraction, Churned) y cómo sostener un crecimiento compuesto del 15% al 20% mensual en etapa temprana.",
        durationOrMetric: "15%–20% MoM",
      },
      {
        number: 3,
        title: "La Ecuación de la Supervivencia Comercial (LTV / CAC > 3x)",
        summary:
          "Fórmulas con margen bruto real para calcular el CAC pagado y blended, expandir el LTV y comprimir el Payback Period a menos de 6 meses con PLG.",
        durationOrMetric: "LTV/CAC > 3x · Payback < 6m",
      },
      {
        number: 4,
        title: "Retención, Activación y Crecimiento Compuesto",
        summary:
          "Diseño del Aha! Moment en menos de 5 minutos (>40% activación), control del Churn B2B (<3% mensual) y Retención Neta de Ingresos (NRR > 110%).",
        durationOrMetric: "NRR > 110%",
      },
      {
        number: 5,
        title: "Disciplina de Caja y La Regla del 40%",
        summary:
          "Gestión quirúrgica del Burn Rate, Net Burn, Default Alive vs. Default Dead, Runway de 14–18 meses y la Regla del 40% para rondas institucionales.",
        durationOrMetric: "Runway 18m · Regla 40%",
      },
    ],
  },
  4: {
    vol: 4,
    slug: "vol-4-la-escalera-al-unicornio",
    fileName: "vol-4-la-escalera-al-unicornio.md",
    title: "La Escalera al Unicornio: De Subsidios CORFO y SAFEs a Rondas Institucionales",
    shortTitle: "La Escalera al Unicornio",
    subtitle:
      "Ingeniería de capitalización, control del directorio y estrategia de des-riesgo fase por fase hasta los $1.000M USD.",
    accentName: "Vibe Solar Orange",
    accentHex: "#F97316",
    coverImage: "/ebooks/covers/vol-4-cover.webp",
    photoImage: "/ebooks/covers/photo-vol-4.webp",
    pexelsCredit: "Pexels #19346063 · Financial Skyscraper Night",
    pexelsUrl: "https://www.pexels.com/photo/financial-skyscraper-at-night-19346063/",
    brandToken: "Vibe AI Orange (#F97316) · Blue (#4285F4)",
    badgeBgClass: "bg-orange-500/15",
    badgeTextClass: "text-orange-300",
    badgeBorderClass: "border-orange-500/35",
    gradientClass: "from-[#F97316] via-[#EC4899] to-[#4285F4]",
    quizBannerTitle: "Modo Lector · Tomo 4: La Escalera al Unicornio (Vibe Solar Orange)",
    quizBannerSubtitle:
      "Escaneaste el QR del Tomo 4. Completa el registro oficial de validación y tracción para tu Data Room de inversión y emite tu credencial pública SQR-2026 verificable por CORFO, Ángeles y VCs.",
    dimensionKey: "capital",
    dimensionLabel: "Estrategia de Capital & Cap Table",
    chapters: [
      {
        number: 1,
        title: "La Filosofía del Des-Riesgo Escalonado",
        summary:
          "Por qué ningún inversor financia tu supervivencia, sino la compra de tiempo (runway) para desbloquear el siguiente múltiplo de valoración.",
        durationOrMetric: "Des-Riesgo por Hitos",
      },
      {
        number: 2,
        title: "Fases 1 y 2 — El Arranque Sin Dilución (Bootstrapping, FFF y Capital Público)",
        summary:
          "Validación con 30 entrevistas de dolor y apalancamiento de subsidios Equity-Free (CORFO Semilla Inicia, Semilla Expande, Start-Up Chile) cediendo 0% de equity.",
        durationOrMetric: "0% Dilución Inicial",
      },
      {
        number: 3,
        title: "Fase 3 — Ronda Pre-Seed y Domando el SAFE",
        summary:
          "Levantando $50K–$250K USD con Ángeles y Aceleradoras (Platanus, YC, 500 Global). Matemática exacta del Post-Money SAFE, Valuation Cap y Discount.",
        durationOrMetric: "SAFE Post-Money",
      },
      {
        number: 4,
        title: "Fase 4 — Ronda Seed y el Product-Market Fit",
        summary:
          "De $500K a $2.5M USD (Valuación $4M–$10M USD) con fondos regionales (Kaszek, Canary, Magma). Máquina repetible de ventas y expansión a México/Colombia.",
        durationOrMetric: "Seed $500K–$2.5M",
      },
      {
        number: 5,
        title: "Fases 5, 6 y 7 — De Serie A al Estatus Unicornio y Exit",
        summary:
          "El salto a $1M–$3M USD de ARR, hipercrecimiento continental en Series B/C y anatomía de referentes LatAm (Cornershop, NotCo, Buk, Betterfly, Nubank).",
        durationOrMetric: "Rumbo a $1.000M+ USD",
      },
      {
        number: 6,
        title: "Los 5 Peligros Mortales del Cap Table",
        summary:
          "Cómo llegar a Serie A con >50% para los founders, cruzar el Valle de la Muerte, ejecutar Bridge Rounds sanos y evitar Down Rounds con cláusulas Full Ratchet.",
        durationOrMetric: "Founders >50% en Serie A",
      },
    ],
  },
}

export function isValidVolume(val: unknown): val is 1 | 2 | 3 | 4 {
  const num = Number(val)
  return num === 1 || num === 2 || num === 3 || num === 4
}

/**
 * Generates an authoritative certificate ID:
 * - `SQR-2026-XXX` for Unicorn Squad Bible readers (`source === "ebook"`)
 * - `VBC-2026-XXX` for VibeCode Lab cohort graduates (`source !== "ebook"`)
 */
export function generateCertificateId(source?: string | null): string {
  const prefix = source === "ebook" ? "SQR" : "VBC"
  const randomDigits = crypto.randomInt(100, 999)
  return `${prefix}-2026-${randomDigits}`
}

/**
 * Generates a deterministic SHA-256 verification hash snippet for public display
 */
export function generateVerificationHash(certificateId: string, email: string, mvpUrl: string): string {
  return crypto
    .createHash("sha256")
    .update(`${certificateId}|${email.toLowerCase().trim()}|${mvpUrl.trim()}|vibecodelab-2026`)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase()
}

export interface QuizReadinessEvaluation {
  totalScore: number
  level: "Localhost" | "Staging" | "Production-Ready" | "Investment-Ready"
  dimensions: {
    infraestructura: number // out of 25
    pitch: number // out of 25
    metricas: number // out of 25
    capital: number // out of 25
  }
  recommendedVolumes: (1 | 2 | 3 | 4)[]
}

/**
 * Evaluates the practical quiz submission (MVP URL + $10/48h campaign pitch + obstacles)
 * into a 0-100 Unicorn & Investment Readiness Score breakdown without altering the quiz questions.
 */
export function evaluateQuizReadiness(params: {
  mvpUrl: string
  campaignPitch: string
  obstacles: string[]
  superpowerTestimonial?: string
  sourceVol?: number | null
}): QuizReadinessEvaluation {
  const url = (params.mvpUrl || "").toLowerCase().trim()
  const pitch = (params.campaignPitch || "").trim()
  const obstacles = params.obstacles || []

  // Dimension 1: Infraestructura & Producción (out of 25)
  let infra = 18
  if (url.startsWith("https://")) infra += 3
  if (!url.includes("localhost") && !url.includes("127.0.0.1")) infra += 2
  if (!url.endsWith(".vercel.app") && url.includes(".")) infra += 2 // custom domain bonus
  infra = Math.min(25, infra)

  // Dimension 2: Narrativa & Power Pitch (out of 25)
  let pitchScore = 17
  if (pitch.length >= 60) pitchScore += 3
  if (pitch.length >= 140) pitchScore += 2
  if (!obstacles.some((o) => o.includes("promesa") || o.includes("dudas_promesa"))) pitchScore += 3
  pitchScore = Math.min(25, pitchScore)

  // Dimension 3: Unit Economics & Tracción (out of 25)
  let metricas = 17
  if (/(\$|usd|clp|%|leads|registros|conversion|cpl|cac|horas)/i.test(pitch)) metricas += 5
  if (!obstacles.some((o) => o.includes("friccion_tecnica"))) metricas += 3
  metricas = Math.min(25, metricas)

  // Dimension 4: Estrategia de Capital & Cap Table (out of 25)
  let capital = 18
  if (!obstacles.some((o) => o.includes("tarjeta") || o.includes("acuerdo_tarjeta"))) capital += 4
  if ((params.superpowerTestimonial || "").trim().length >= 40) capital += 3
  capital = Math.min(25, capital)

  const totalScore = Math.min(100, infra + pitchScore + metricas + capital)

  let level: QuizReadinessEvaluation["level"] = "Investment-Ready"
  if (totalScore < 40) level = "Localhost"
  else if (totalScore < 60) level = "Staging"
  else if (totalScore < 80) level = "Production-Ready"

  const entries: { vol: 1 | 2 | 3 | 4; score: number }[] = [
    { vol: 1, score: infra },
    { vol: 2, score: pitchScore },
    { vol: 3, score: metricas },
    { vol: 4, score: capital },
  ]
  entries.sort((a, b) => a.score - b.score)

  return {
    totalScore,
    level,
    dimensions: {
      infraestructura: infra,
      pitch: pitchScore,
      metricas,
      capital,
    },
    recommendedVolumes: [entries[0].vol, entries[1].vol],
  }
}

export interface EbookExamQuestion {
  id: string
  vol: 1 | 2 | 3 | 4
  chapterRef: string
  question: string
  options: {
    id: "A" | "B" | "C" | "D"
    text: string
  }[]
  correctOptionId: "A" | "B" | "C" | "D"
  explanation: string
}

export const EBOOK_EXAM_QUESTIONS: EbookExamQuestion[] = [
  // ============================================================================
  // TOMO 1: DE LOCALHOST A PRODUCCIÓN
  // ============================================================================
  {
    id: "v1_q1",
    vol: 1,
    chapterRef: "Tomo I · Cap. 2: Higiene de Entorno y Connection Pooling",
    question:
      "Durante un Demo Day, 200 inversionistas escanean tu QR al mismo tiempo y abren tu app en Vercel Serverless. ¿Qué configuración de Supabase PostgreSQL evita el colapso por agotamiento de conexiones (FATAL: remaining connection slots)?",
    options: [
      {
        id: "A",
        text: "Conectar las funciones Serverless al puerto 5432 en modo Session directo sin límites.",
      },
      {
        id: "B",
        text: "Usar Supavisor (Connection Pooler) en el puerto 6543 en modo Transaction (?pgbouncer=true&connection_limit=1) y reservar el puerto 5432 solo para migraciones.",
      },
      {
        id: "C",
        text: "Exponer la llave SUPABASE_SERVICE_ROLE_KEY en el navegador con NEXT_PUBLIC_ para evitar pasar por el servidor.",
      },
      {
        id: "D",
        text: "Guardar los datos temporalmente en archivos locales dentro de la carpeta /tmp de Vercel.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Las funciones Serverless escalan horizontalmente en milisegundos. El puerto 6543 (Supavisor en modo Transaction) presta una conexión física solo durante los milisegundos que dura la consulta SQL y la libera de inmediato, permitiendo miles de peticiones concurrentes.",
  },
  {
    id: "v1_q2",
    vol: 1,
    chapterRef: "Tomo I · Cap. 3: Monetización desde el Día Cero",
    question:
      "¿Cuál es el protocolo de seguridad de grado militar para activar una suscripción paga con Mercado Pago en producción (APP_USR-)?",
    options: [
      {
        id: "A",
        text: "Activar la cuenta apenas el navegador del usuario vuelve a la URL /success?status=approved.",
      },
      {
        id: "B",
        text: "Recibir el POST en el Webhook, validar la firma HMAC-SHA256 (x-signature), verificar el estado real con GET /v1/payments/{id} en la API de Mercado Pago y hacer UPSERT idempotente por mp_payment_id UNIQUE.",
      },
      {
        id: "C",
        text: "Confiar en cualquier JSON que llegue por POST al endpoint del webhook sin verificar cabeceras para responder más rápido.",
      },
      {
        id: "D",
        text: "Usar credenciales TEST-... en producción y activar manualmente las cuentas revisando el correo.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Nunca se confía en la redirección del navegador. El servidor debe validar criptográficamente el header x-signature (HMAC-SHA256), hacer verificación cruzada contra la API de Mercado Pago y garantizar idempotencia en base de datos para no duplicar provisiones ante reintentos.",
  },
  {
    id: "v1_q3",
    vol: 1,
    chapterRef: "Tomo I · Cap. 4: Observabilidad y Cero Costo de Egreso",
    question:
      "¿Cómo proteges un margen bruto superior al 80% y evitas el error 413 Payload Too Large (límite de 4,5 MB en Vercel) al manejar archivos pesados en tu SaaS?",
    options: [
      {
        id: "A",
        text: "Codificando los archivos en Base64 y enviándolos dentro del body JSON de la función Serverless hacia una tabla de PostgreSQL.",
      },
      {
        id: "B",
        text: "Generando Presigned URLs en el backend para que el navegador suba directo por PUT a Cloudflare R2 con CORS restringido a tu dominio y $0 USD de costo de egreso (Zero Egress).",
      },
      {
        id: "C",
        text: "Dejando un bucket S3 tradicional abierto al público con AllowedOrigins: ['*'] y pagando $0,09 USD/GB por cada descarga.",
      },
      {
        id: "D",
        text: "Subiendo los archivos de los clientes al repositorio de GitHub en cada commit.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Cloudflare R2 elimina el impuesto de transferencia saliente ($0 Egress Fee), protegiendo el margen bruto del SaaS, y el uso de Presigned URLs evita pasar binarios pesados por la función Serverless de Vercel.",
  },
  {
    id: "v1_q4",
    vol: 1,
    chapterRef: "Tomo I · Caps. 5 y 6: Identidad Soberana (DNS/SSL) y Demo Day",
    question:
      "Al conectar un dominio .cl (NIC Chile) o .com mediante Cloudflare hacia Vercel, ¿por qué ocurre el error ERR_TOO_MANY_REDIRECTS y cómo se previene?",
    options: [
      {
        id: "A",
        text: "Ocurre porque Cloudflare tiene la nube naranja activa con SSL en modo 'Flexible' (hablando por HTTP plano con Vercel); se previene usando 'DNS Only' (Nube Gris) o modo SSL 'Full (Strict)'.",
      },
      {
        id: "B",
        text: "Ocurre por usar Let's Encrypt; se resuelve desactivando HTTPS en producción.",
      },
      {
        id: "C",
        text: "Ocurre por agregar registros TXT de DKIM y SPF para el correo transaccional.",
      },
      {
        id: "D",
        text: "Ocurre cuando ejecutas el script de Cache Warming antes del Demo Day.",
      },
    ],
    correctOptionId: "A",
    explanation:
      "En modo Flexible, Cloudflare se comunica por HTTP (puerto 80) con Vercel y Vercel redirige con 308 a HTTPS infinitamente. Usar DNS Only (Nube Gris) o SSL Full (Strict) elimina el bucle de inmediato.",
  },

  // ============================================================================
  // TOMO 2: EL PITCH IRREFUTABLE (180 SEGUNDOS)
  // ============================================================================
  {
    id: "v2_q1",
    vol: 2,
    chapterRef: "Tomo II · Cap. 1: Psicología y Neurociencia del Comité",
    question:
      "Según la arquitectura cognitiva (Sistema 1 vs. Sistema 2) aplicada en el Tomo II, ¿por qué fracasan los pitches que abren con la historia del equipo o explicando la tecnología?",
    options: [
      {
        id: "A",
        text: "Porque los inversionistas no entienden nada de software ni de inteligencia artificial.",
      },
      {
        id: "B",
        text: "Porque el Sistema 1 toma una decisión heurística de atención en los primeros 30 segundos: si no abres cuantificando un dolor agudo y costoso (Hair-on-fire problem), el Sistema 2 analítico jamás se activa para escuchar tus métricas.",
      },
      {
        id: "C",
        text: "Porque un pitch siempre debe durar más de 25 minutos para que el comité entre en confianza.",
      },
      {
        id: "D",
        text: "Porque las diapositivas deben tener al menos 80 palabras por lámina para que el jurado lea en silencio.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Bajo fatiga cognitiva, el comité decide en los primeros 30 segundos (Escena 1: El Dolor) si el problema es urgente y sangrante. Solo cuando secuestras la atención del Sistema 1 con dolor cuantificado en dólares/horas, el Sistema 2 evalúa tu producto y tus finanzas.",
  },
  {
    id: "v2_q2",
    vol: 2,
    chapterRef: "Tomo II · Cap. 2: La Tríada del Relato Invencible",
    question:
      "En la adaptación del Power Pitch Method® de VibeCode Lab, un relato invencible debe ser Deseable, Irrefutable y Replicable. ¿Qué significa que sea 'Replicable'?",
    options: [
      {
        id: "A",
        text: "Que cualquier competidor pueda copiar tu código fuente en un fin de semana.",
      },
      {
        id: "B",
        text: "Que puedas repetir el mismo discurso sin cambiar ni una coma frente a CORFO, Ángeles y VCs.",
      },
      {
        id: "C",
        text: "Que el analista que te escuchó pueda defender tu startup el lunes frente a los socios senior que NO estuvieron en tu presentación, usando tu Frase Ancla y 3 cifras memorables.",
      },
      {
        id: "D",
        text: "Que uses analogías combinando al menos cuatro empresas famosas ('Somos el Uber de los seguros con TikTok y Blockchain').",
      },
    ],
    correctOptionId: "C",
    explanation:
      "Quien te escucha en la primera reunión rara vez firma el cheque solo. La Replicabilidad (portabilidad cognitiva) equipa a tu campeón interno con una Frase Ancla de <25 palabras y 3 números inolvidables para ganar el comité del lunes sin ti.",
  },
  {
    id: "v2_q3",
    vol: 2,
    chapterRef: "Tomo II · Cap. 3: Guionización Quirúrgica de las 6 Escenas (180s)",
    question:
      "En la Escena 6 (The Ask & Cierre, últimos 20 segundos del pitch de 180s), ¿cuál es la fórmula recomendada de asignación de capital y la técnica de cierre?",
    options: [
      {
        id: "A",
        text: "Pedir un monto abierto ('lo que quieran invertir') y cerrar preguntando '¿Tienen alguna duda?'.",
      },
      {
        id: "B",
        text: "Destinar 80% a sueldos ejecutivos y 20% a oficinas, cerrando con un agradecimiento pasivo.",
      },
      {
        id: "C",
        text: "Fórmula 40% Go-To-Market / 35% I+D en Agentes de IA / 25% Runway (18 meses), vinculada a un Hito Desbloqueador de MRR y un Cierre de Doble Alternativa para agendar la revisión del Data Room.",
      },
      {
        id: "D",
        text: "Omitir el monto de la ronda para que el inversionista adivine cuánto vale la empresa.",
      },
    ],
    correctOptionId: "C",
    explanation:
      "La regla 40/35/25 demuestra disciplina de capital orientada a crecimiento y producto, y el Cierre de Doble Alternativa ('¿Revisamos el Data Room el miércoles a las 10:00 o el jueves a las 15:00?') mantiene la autoridad escénica de par a par.",
  },
  {
    id: "v2_q4",
    vol: 2,
    chapterRef: "Tomo II · Cap. 4: Camaleón Estratégico (CORFO, Ángeles y VCs)",
    question:
      "¿Cómo debes calibrar tu cálculo de tamaño de mercado (TAM/SAM/SOM) en la Escena 4 para no perder credibilidad ante un comité institucional?",
    options: [
      {
        id: "A",
        text: "De arriba hacia abajo (Top-Down): 'El mercado mundial de la IA es de 5 billones de dólares y capturaremos el 0,1%'.",
      },
      {
        id: "B",
        text: "De abajo hacia arriba (Bottom-Up): Número exacto de empresas/clientes target verificables en tu región multiplicado por tu Ticket Anual Promedio (ACV).",
      },
      {
        id: "C",
        text: "Sumando el PIB total de Chile, México y Brasil sin segmentar por industria.",
      },
      {
        id: "D",
        text: "Diciendo que tu producto sirve para cualquier ser humano con acceso a internet.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "El cálculo Top-Down ('capturaremos el 0,1% de un trillón') es una bandera roja inmediata de amateurismo. El cálculo Bottom-Up (Clientes verificables × ACV anual) demuestra que conoces exactamente a quién le vendes y cuánto paga.",
  },

  // ============================================================================
  // TOMO 3: MÉTRICAS QUE MUEVEN LA AGUJA (UNIT ECONOMICS)
  // ============================================================================
  {
    id: "v3_q1",
    vol: 3,
    chapterRef: "Tomo III · Caps. 1 y 2: Métricas de Sangre, MRR y MoM Growth",
    question:
      "¿Cuál es la fórmula exacta del Movimiento Neto de Ingresos Recurrentes (Net New MRR) de un mes y qué ritmo de crecimiento mensual compuesto (MoM) distingue a una startup Venture-Scale en etapa temprana?",
    options: [
      {
        id: "A",
        text: "Net New MRR = Facturación histórica acumulada + subsidios CORFO; crecimiento del 2% mensual.",
      },
      {
        id: "B",
        text: "Net New MRR = New MRR + Expansion MRR + Reactivation MRR - Contraction MRR - Churned MRR; sosteniendo un crecimiento MoM del 15% al 20% mensual (SaaS Quick Ratio >= 4x).",
      },
      {
        id: "C",
        text: "Net New MRR = Total de usuarios registrados gratuitos multiplicado por el precio del plan más caro.",
      },
      {
        id: "D",
        text: "Reconocer los 12 meses de un contrato anual de $12.000 USD como $12.000 USD de MRR en un solo mes.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "El MRR mide exclusivamente ingresos recurrentes mensuales normalizados (desglosados en New, Expansion, Reactivation, Contraction y Churned). Crecer al 15%–20% MoM multiplica por ~7,4x a ~8,9x el tamaño de la empresa en 12 meses.",
  },
  {
    id: "v3_q2",
    vol: 3,
    chapterRef: "Tomo III · Cap. 3: La Ecuación de la Supervivencia Comercial (LTV / CAC)",
    question:
      "Si tu SaaS de IA tiene un ARPU de $100 USD/mes, un Margen Bruto (Gross Margin) del 80% y un Churn mensual de ingresos del 2,5%, ¿cuál es tu LTV real y qué pasa si tu CAC es de $400 USD?",
    options: [
      {
        id: "A",
        text: "LTV = $3.200 USD (($100 × 0,80) / 0,025); tu ratio LTV/CAC es 8,0x (> 3x) y tu CAC Payback Period es de 5,0 meses (< 6 meses), cumpliendo el estándar de élite.",
      },
      {
        id: "B",
        text: "LTV = $100 USD; como es menor que el CAC de $400 USD, pierdes dinero en cada cliente.",
      },
      {
        id: "C",
        text: "LTV = $4.000 USD sin descontar costos de tokens de IA ni servidores; Payback de 24 meses.",
      },
      {
        id: "D",
        text: "El Margen Bruto nunca se incluye en la fórmula del LTV ni del CAC Payback.",
      },
    ],
    correctOptionId: "A",
    explanation:
      "El LTV siempre debe ponderarse por el Margen Bruto: LTV = (ARPU × Gross Margin %) / Churn = ($100 × 0,80) / 0,025 = $3.200 USD. Con un CAC de $400 USD, el Payback es $400 / $80 = 5 meses (< 6m) y el ratio LTV/CAC es 8x (> 3x).",
  },
  {
    id: "v3_q3",
    vol: 3,
    chapterRef: "Tomo III · Cap. 4: Retención por Cohortes y NRR",
    question:
      "¿Qué significa que tu startup B2B alcance un Net Revenue Retention (NRR) anual del 118%?",
    options: [
      {
        id: "A",
        text: "Que el 18% de tus clientes canceló su suscripción durante el año.",
      },
      {
        id: "B",
        text: "Que la cohorte de clientes existentes al inicio del periodo hoy factura un 18% MÁS por sí sola (sin contar clientes nuevos), porque la expansión (upsells, más asientos o uso de IA) superó a las bajas y contracciones.",
      },
      {
        id: "C",
        text: "Que tu tasa de rebote en la landing page fue del 118%.",
      },
      {
        id: "D",
        text: "Que gastaste un 118% más en anuncios de Meta Ads que el mes anterior.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Un NRR > 110% (Churn Neto Negativo) es el Santo Grial del SaaS: significa que tu base instalada es un motor de interés compuesto que crece incluso antes de sumar las ventas a nuevos clientes.",
  },
  {
    id: "v3_q4",
    vol: 3,
    chapterRef: "Tomo III · Cap. 5: Disciplina de Caja, Runway y Regla del 40%",
    question:
      "Tu startup tiene $120.000 USD en el banco, gasta $18.000 USD/mes en total (Gross Burn) y cobra $10.000 USD/mes de clientes (Cash Collected). ¿Cuál es tu Net Burn, tu Runway actual y cuándo debes iniciar el proceso de levantamiento de la siguiente ronda?",
    options: [
      {
        id: "A",
        text: "Net Burn = $8.000 USD/mes y Runway = 15 meses; debes iniciar el proceso de fundraising al menos 6 meses antes de tu Zero Cash Date (cuando te queden ~9 meses de caja) si aún no eres Default Alive.",
      },
      {
        id: "B",
        text: "Net Burn = $18.000 USD/mes y debes esperar a que quede 1 semana de caja en el banco para hablar con VCs.",
      },
      {
        id: "C",
        text: "Runway = 120 meses porque los ingresos no importan al calcular la caja.",
      },
      {
        id: "D",
        text: "Debes triplicar el gasto en oficinas inmediatamente para aparentar éxito ante los fondos.",
      },
    ],
    correctOptionId: "A",
    explanation:
      "Net Burn = Gross Burn ($18K) - Ingresos Cobrados ($10K) = $8.000 USD/mes. Con $120K en caja tienes 15 meses de Runway. Como levantar una ronda toma de 4 a 6 meses, nunca debes salir al mercado con menos de 6 meses de oxígeno.",
  },

  // ============================================================================
  // TOMO 4: LA ESCALERA AL UNICORNIO (SAFEs Y CAP TABLE)
  // ============================================================================
  {
    id: "v4_q1",
    vol: 4,
    chapterRef: "Tomo IV · Caps. 1 y 2: Des-Riesgo Escalonado y Capital Equity-Free",
    question:
      "Según la estrategia de las Fases 1 y 2 de La Biblia del Squad Ágil, ¿cuánto equity (porcentaje de la empresa) debes ceder para construir el MVP inicial y cómo debes financiar el arranque?",
    options: [
      {
        id: "A",
        text: "Ceder el 45% de la empresa el día 1 a un inversionista tradicional por $20.000 USD para contratar una agencia externa.",
      },
      {
        id: "B",
        text: "0% de dilución (0% Equity): el Squad construye y despliega el MVP en semanas, valida con 30 entrevistas + primeros cobros reales y apalanca fondos Equity-Free (CORFO Semilla Inicia/Expande, Start-Up Chile y créditos Cloud/IA).",
      },
      {
        id: "C",
        text: "Endeudarse con créditos bancarios personales a 36 meses antes de escribir una sola línea de código.",
      },
      {
        id: "D",
        text: "No lanzar nada al mercado hasta haber constituido cinco filiales internacionales.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Con Vibe Coding e infraestructura Serverless, el riesgo técnico del MVP se elimina en semanas con costo marginal cercano a cero. Combinar primeros cobros reales con subsidios no dilutivos (CORFO/Start-Up Chile) permite llegar a Pre-Seed con el 100% del Cap Table intacto.",
  },
  {
    id: "v4_q2",
    vol: 4,
    chapterRef: "Tomo IV · Cap. 3: Ronda Pre-Seed y Matemática del Post-Money SAFE",
    question:
      "Si en tu ronda Pre-Seed levantas $150.000 USD mediante un Post-Money SAFE con un Valuation Cap de $1.500.000 USD, ¿qué porcentaje de propiedad asegura ese inversionista antes de la futura ronda Seed y qué regla protege tu Cap Table?",
    options: [
      {
        id: "A",
        text: "Asegura exactamente el 10,0% ($150.000 / $1.500.000); la regla de oro es no superar el 15% de dilución acumulada sumando todos los SAFEs de la etapa Pre-Seed.",
      },
      {
        id: "B",
        text: "Es un préstamo bancario con 18% de interés anual que debes devolver en efectivo a los 12 meses.",
      },
      {
        id: "C",
        text: "El inversionista se queda con el 51% de la empresa automáticamente.",
      },
      {
        id: "D",
        text: "El Post-Money SAFE no diluye a los fundadores aunque emitas diez SAFEs seguidos.",
      },
    ],
    correctOptionId: "A",
    explanation:
      "En un Post-Money SAFE (estándar Y Combinator), la propiedad del inversionista queda fijada matemáticamente por Monto Invertido / Post-Money Valuation Cap ($150K / $1,5M = 10%). Como los Post-Money SAFEs son aditivos entre sí, debes mantener la dilución total Pre-Seed <= 15%.",
  },
  {
    id: "v4_q3",
    vol: 4,
    chapterRef: "Tomo IV · Cap. 4: Estructura Internacional y Vesting de Fundadores",
    question:
      "¿Para qué sirve la cláusula de Reverse Vesting de 4 años con 1 año de Cliff entre los cofundadores de un Squad?",
    options: [
      {
        id: "A",
        text: "Para obligar a los inversionistas a trabajar programando los fines de semana.",
      },
      {
        id: "B",
        text: "Para proteger a la empresa y a los fundadores que se quedan: si un cofundador abandona la startup antes de cumplir 12 meses (el Cliff), se retira con el 0% de las acciones, evitando dejar 'Dead Equity' en manos de un socio inactivo.",
      },
      {
        id: "C",
        text: "Para prohibir que la empresa venda software fuera de su país de origen durante 4 años.",
      },
      {
        id: "D",
        text: "Para eliminar el pool de opciones (ESOP) de los empleados clave.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "Un Cap Table con un ex-socio inactivo que conserva el 30% o 50% de las acciones vuelve a la startup 'No Invertible' para cualquier VC. El Vesting de 48 meses con Cliff de 12 meses garantiza que el equity se gane con permanencia y ejecución real.",
  },
  {
    id: "v4_q4",
    vol: 4,
    chapterRef: "Tomo IV · Cap. 6: Los 5 Peligros Mortales del Cap Table",
    question:
      "Al negociar un Term Sheet, ¿cuál es la combinación de 'Términos Limpios' (Clean Terms) estándar de mercado frente a cláusulas venenosas que pueden dejar a los fundadores sin retorno en un Exit o Down Round?",
    options: [
      {
        id: "A",
        text: "Aceptar Liquidación Preferente 3x Participating Preferred y cláusula anti-dilución Full Ratchet.",
      },
      {
        id: "B",
        text: "Exigir Liquidación Preferente 1x Non-Participating Preferred y protección anti-dilución Broad-Based Weighted Average, reteniendo >50% del Cap Table en manos de los fundadores al cerrar la Serie A.",
      },
      {
        id: "C",
        text: "Inflar artificialmente la valoración Pre-Seed a $50M USD sin facturación para asegurar un Down Round en la ronda siguiente.",
      },
      {
        id: "D",
        text: "Entregar el control de la mayoría del Directorio en la ronda Pre-Seed por un cheque de $25.000 USD.",
      },
    ],
    correctOptionId: "B",
    explanation:
      "El estándar limpio de Silicon Valley y LatAm es 1x Non-Participating Preferred (sin 'double dip') y Broad-Based Weighted Average. Las cláusulas Full Ratchet o múltiplos 2x/3x Participating pueden aniquilar la participación de los fundadores.",
  },
]

export interface EbookExamEvaluation {
  mode: "vol-1" | "vol-2" | "vol-3" | "vol-4" | "all"
  modeTitle: string
  totalQuestions: number
  correctCount: number
  scorePct: number
  passed: boolean
  pillarScores: {
    infraestructura: number
    pitch: number
    metricas: number
    capital: number
  }
}

export function evaluateEbookExam(
  answers: Record<string, "A" | "B" | "C" | "D">,
  mode: "vol-1" | "vol-2" | "vol-3" | "vol-4" | "all"
): EbookExamEvaluation {
  const targetQuestions =
    mode === "all"
      ? EBOOK_EXAM_QUESTIONS
      : EBOOK_EXAM_QUESTIONS.filter((q) => q.vol === Number(mode.replace("vol-", "")))

  let correctCount = 0
  const volCorrect: Record<1 | 2 | 3 | 4, { right: number; total: number }> = {
    1: { right: 0, total: 0 },
    2: { right: 0, total: 0 },
    3: { right: 0, total: 0 },
    4: { right: 0, total: 0 },
  }

  for (const q of targetQuestions) {
    volCorrect[q.vol].total += 1
    if (answers[q.id] === q.correctOptionId) {
      correctCount += 1
      volCorrect[q.vol].right += 1
    }
  }

  const totalQuestions = targetQuestions.length || 1
  const scorePct = Math.round((correctCount / totalQuestions) * 100)
  const passed = scorePct >= 75

  const calcPillar = (v: 1 | 2 | 3 | 4) => {
    if (volCorrect[v].total === 0) return Math.round((scorePct / 100) * 25)
    return Math.round((volCorrect[v].right / volCorrect[v].total) * 25)
  }

  const modeTitles: Record<typeof mode, string> = {
    "vol-1": "Tomo I: De Localhost a Producción (Arquitectura SaaS)",
    "vol-2": "Tomo II: El Pitch Irrefutable (Dramaturgia 180s)",
    "vol-3": "Tomo III: Métricas que Mueven la Aguja (Unit Economics)",
    "vol-4": "Tomo IV: La Escalera al Unicornio (SAFEs & Cap Table)",
    all: "Tetralogía Completa: Código & Capital (4 Tomos)",
  }

  return {
    mode,
    modeTitle: modeTitles[mode],
    totalQuestions,
    correctCount,
    scorePct,
    passed,
    pillarScores: {
      infraestructura: calcPillar(1),
      pitch: calcPillar(2),
      metricas: calcPillar(3),
      capital: calcPillar(4),
    },
  }
}

