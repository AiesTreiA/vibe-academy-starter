// lib/marketing-content-data.ts
// Base de datos de 100 ideas de contenido para Vibecode Lab y frameworks de Venta Perpetua (Emilio)

export type PillarId = "pilar-1" | "pilar-2" | "pilar-3" | "pilar-4" | "pilar-5"

export type FrameworkType = 
  | "reel_hook_omitted"      // Reel Anzuelo: Hook + Valor (Paso 1 y 2) + Paso 3 Omitido + CTA
  | "reel_cta_direct"        // Reel CTA Directo: Hook TAM amplio + Caso/Contexto + Vehículo + CTA suave
  | "reel_authority"         // Reel Autoridad & Build in Public (Estadísticas, infraestructura, retargeting)
  | "reel_values"            // Reel / Carrusel de Valores y Confianza (Amortiguador de venta)
  | "story_resource_2slides" // Story de Recursos (2 Diapositivas: Elevar Valor + Entrega)
  | "story_cta_direct"       // Story CTA Directo ("Estoy buscando a 3..." + "Te muestro cómo funciona")
  | "story_qa_hidden"        // Secuencia Q&A Hidden CTA (5 preguntas + Descompresión + Reiteración)
  | "story_poll_surfacing"   // Secuencia CTA de Encuesta (Surfacing 4 historias + DMs Outbound)

export interface ContentIdeaItem {
  id: number
  pilarId: PillarId
  pilarName: string
  title: string
  suggestedFramework: FrameworkType
  targetAvatar: "Founders & Product Owners" | "Desarrolladores & Devs" | "Creativos & Diseñadores" | "Emprendedores No Técnicos" | "General / Audiencia Amplia"
  corePainOrDesire: string
  sampleHook: string
  suggestedKeyword: string
  sampleStepOmittedOrValue?: string
}

export interface FrameworkDefinition {
  type: FrameworkType
  name: string
  icon: string
  format: "Reel / Feed" | "Stories" | "Carrusel"
  objective: string
  rules: string[]
  structureSteps: { stepNumber: number; title: string; instruction: string; example: string }[]
  goldenRule: string
}

export const PILLARS_CONFIG: Record<PillarId, { name: string; description: string; badgeColor: string; range: string }> = {
  "pilar-1": {
    name: "Destrucción de Paradigmas y Mentalidad FDE",
    description: "Desmonta mitos del desarrollo tradicional, tutoriales infinitos y agencias lentas para introducir la mentalidad Forward Deployed Engineer y Vibe Coding.",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    range: "Ideas 1 - 20"
  },
  "pilar-2": {
    name: "Detrás de Cámara, Métricas & Build in Public",
    description: "Transparencia técnica y financiera (costes de IA, Supabase, Vercel, Resend, Mercado Pago) para posicionar autoridad y servir en retargeting de 180 días.",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    range: "Ideas 21 - 40"
  },
  "pilar-3": {
    name: "Tutoriales Prácticos, Prompts & Agentes de IA",
    description: "Enseña el 'cómo' paso a paso pero omite la pieza clave (prompt de sistema, webhook, .cursorrules) para generar una avalancha de Inbound DMs.",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    range: "Ideas 41 - 60"
  },
  "pilar-4": {
    name: "Historias de Perfiles & Casos de Sinergia",
    description: "Casos de estudio reales (diseñadores que lanzan, devs que aprenden GTM, alianzas de co-founders) para generar identificación y derribar objeciones.",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    range: "Ideas 61 - 80"
  },
  "pilar-5": {
    name: "Llamados a la Acción, Descuentos & Escasez",
    description: "Conversión de alta intención aprovechando los 33 cupos límite, tramos de preventa, bono Google AI Pro y fecha de arranque en vivo.",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    range: "Ideas 81 - 100"
  }
}

export const VIBECODE_100_IDEAS: ContentIdeaItem[] = [
  // PILAR 1 (1 - 20)
  {
    id: 1,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Por qué ver 50 horas de tutoriales en YouTube está destruyendo tus ganas de emprender.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Atrapado en el 'tutorial hell' sin lanzar nada.",
    sampleHook: "Si llevas más de 50 horas viendo tutoriales en YouTube para crear tu app, estás matando tu negocio antes de empezar.",
    suggestedKeyword: "METODO",
    sampleStepOmittedOrValue: "Paso 1: Define tu PRD en 1 hoja. Paso 2: Configura el entorno con IA. Paso 3 (Omitido): El prompt de orquestación para generar la arquitectura sin programar desde cero."
  },
  {
    id: 2,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Tu código no vale nada si no tienes una estrategia de distribución (GTM).",
    suggestedFramework: "reel_values",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Programar por meses un producto que nadie usa.",
    sampleHook: "El código más elegante del mundo vale exactamente $0 si nadie sabe que existe.",
    suggestedKeyword: "DISTRIBUCION",
    sampleStepOmittedOrValue: "Por qué los mejores ingenieros hoy no son los que escriben más líneas, sino los que integran Go-To-Market desde el día 1."
  },
  {
    id: 3,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "El mito del 'co-founder técnico': cómo la IA te da autonomía sin buscar socios a ciegas.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Paralizado buscando un CTO que trabaje por equity.",
    sampleHook: "Dejar tu idea de software en pausa porque 'no tienes un socio técnico' es el error más costoso de 2026.",
    suggestedKeyword: "AUTONOMIA",
    sampleStepOmittedOrValue: "Cómo la mentalidad Forward Deployed Engineer te permite actuar como tu propio CTO usando agentes de IA."
  },
  {
    id: 4,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Por qué el mercado no necesita otra app bonita, necesita soluciones a problemas reales.",
    suggestedFramework: "reel_values",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Obsesión por el diseño visual sin validar si el usuario pagaría.",
    sampleHook: "Una interfaz hermosa sin modelo de monetización es solo un cuadro caro en internet.",
    suggestedKeyword: "VALIDACION"
  },
  {
    id: 5,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Trabajar 8 horas optimizando software para una corporación vs. 2 horas creando tu propio SaaS.",
    suggestedFramework: "reel_values",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Cansancio de enriquecer a corporaciones sin construir activos propios.",
    sampleHook: "El verdadero riesgo no es crear tu propio software; es pasar 40 años construyendo los sueños de otra empresa.",
    suggestedKeyword: "LIBERTAD"
  },
  {
    id: 6,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "La trampa del 'desarrollador perfeccionista': por qué lanzar con errores es mejor que no lanzar.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Miedo a publicar código imperfecto.",
    sampleHook: "Si no te da vergüenza la primera versión de tu software, lanzaste demasiado tarde.",
    suggestedKeyword: "LANZAMIENTO"
  },
  {
    id: 7,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Si tu software no cobra desde el día 1, no tienes un negocio; tienes un pasatiempo caro.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Miedo a cobrar o regalar el producto esperando tracción mágica.",
    sampleHook: "El feedback más honesto de un usuario es cuando saca la tarjeta de crédito.",
    suggestedKeyword: "COBROS",
    sampleStepOmittedOrValue: "Paso 1: Configura pasarela rápida. Paso 2: Bloquea funciones clave. Paso 3 (Omitido): Script de webhook para activar accesos tras pago confirmado."
  },
  {
    id: 8,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "La diferencia entre ser un programador tradicional y tener mentalidad Forward Deployed Engineer.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Quedarse obsoleto con código manual mientras la IA avanza.",
    sampleHook: "En 2026 hay dos tipos de devs: los que compiten contra la IA escribiendo sintaxis, y los Forward Deployed Engineers que dirigen flotas de agentes.",
    suggestedKeyword: "FDE"
  },
  {
    id: 9,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Deja de construir para devs; aprende a construir para usuarios que pagan.",
    suggestedFramework: "reel_values",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Construir herramientas técnicas que solo admiran otros programadores sin comprar.",
    sampleHook: "Tus amigos desarrolladores te darán estrellas en GitHub; los clientes reales te pagarán la suscripción.",
    suggestedKeyword: "CLIENTES"
  },
  {
    id: 10,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "La razón por la que el 90% de los proyectos No-Code quedan abandonados en la semana 2.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Frustración con plataformas No-Code cerradas, lentas y caras.",
    sampleHook: "No-Code parece fácil hasta que intentas conectar una lógica personalizada y la plataforma te cobra $200 extras al mes o simplemente no se puede.",
    suggestedKeyword: "NOCODE",
    sampleStepOmittedOrValue: "Paso 1: Entiende por qué el código nativo generado por IA te pertenece al 100%. Paso 2: Arquitectura en Next.js. Paso 3 (Omitido): La estructura .cursorrules para no tocar sintaxis."
  },
  {
    id: 11,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "'Necesito levantar capital para empezar': la excusa que te mantiene en la parálisis.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Creer que sin rondas de inversión no se puede crear un SaaS rentable.",
    sampleHook: "Levantar capital para validar una idea de software en 2026 es como pedir una hipoteca para probar si te gusta acampar.",
    suggestedKeyword: "BOOTSTRAP"
  },
  {
    id: 12,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Por qué saber prompt engineering básico ya no es una ventaja competitiva en 2026.",
    suggestedFramework: "reel_authority",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Creer que pedirle cosas a un chat genérico es suficiente.",
    sampleHook: "Decirle a ChatGPT 'actúa como un programador experto' ya no te va a dar una aplicación funcional.",
    suggestedKeyword: "ARQUITECTURA"
  },
  {
    id: 13,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "La mentira de 'aprender a programar desde cero antes de lanzar una idea'.",
    suggestedFramework: "story_qa_hidden",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Creer que deben estudiar 2 años de ciencias de la computación.",
    sampleHook: "¿Realmente necesito aprender JavaScript y Python para crear mi app?",
    suggestedKeyword: "VIBECODE"
  },
  {
    id: 14,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "El peligro de construir un producto masivo cuando ni siquiera tienes 10 usuarios activos.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Sobre-ingeniería y escalabilidad prematura.",
    sampleHook: "No necesitas una infraestructura para 1 millón de usuarios cuando tienes cero.",
    suggestedKeyword: "MVP"
  },
  {
    id: 15,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Cómo la Inteligencia Artificial mató al desarrollo de software lento y costoso.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Creer que un software requiere 6 meses y $20,000 USD de desarrollo.",
    sampleHook: "El modelo tradicional de crear software tardando 6 meses está oficialmente muerto.",
    suggestedKeyword: "SISTEMA"
  },
  {
    id: 16,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Por qué contratar una agencia para hacer tu MVP es el peor error financiero de un founder.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Gastar todos los ahorros en una agencia para recibir código inservible.",
    sampleHook: "Si le pagas $10,000 a una agencia para tu primera versión, estás pagando por su oficina y sus reuniones, no por tu producto.",
    suggestedKeyword: "AGENCIA",
    sampleStepOmittedOrValue: "Paso 1: Diseña en Figma. Paso 2: Pasa a código con IA en 2 horas. Paso 3 (Omitido): Cómo conectar el backend de Supabase sin tocar la consola."
  },
  {
    id: 17,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "No te falta tiempo para tu proyecto, te falta un sistema de ejecución en vivo.",
    suggestedFramework: "story_poll_surfacing",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Procrastinación por no tener acompañamiento ni fechas límite.",
    sampleHook: "¿Qué te está frenando para lanzar tu app este mes?",
    suggestedKeyword: "EJECUCION"
  },
  {
    id: 18,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "La ilusión del networking masivo en canales de Discord sin un propósito claro.",
    suggestedFramework: "reel_values",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Estar en 50 grupos de Discord sin construir nada concreto.",
    sampleHook: "Estar en 20 comunidades de Discord no te hace emprendedor; lanzar código a producción sí.",
    suggestedKeyword: "ENFOQUE"
  },
  {
    id: 19,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Por qué los creativos y diseñadores son los nuevos founders de software más peligrosos.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Diseñadores que dependen de programadores para dar vida a sus ideas.",
    sampleHook: "Si eres diseñador y aprendes a orquestar IA, eres la persona más letal del mercado tecnológico hoy.",
    suggestedKeyword: "CREATIVO"
  },
  {
    id: 20,
    pilarId: "pilar-1",
    pilarName: "Destrucción de Paradigmas y Mentalidad FDE",
    title: "Del código acumulado en GitHub al dinero en tu cuenta bancaria: el salto de mentalidad.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Tener 30 repositorios olvidados y $0 en ingresos recurrentes.",
    sampleHook: "Un repositorio privado en GitHub con 1,000 commits no paga tus cuentas.",
    suggestedKeyword: "VENTAS"
  },

  // PILAR 2 (21 - 40)
  {
    id: 21,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Abrimos los números: cuánto nos cuesta la infraestructura de IA en este SaaS.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Miedo a que los costes de tokens de IA hagan inviable el negocio.",
    sampleHook: "Mucha gente cree que crear un SaaS con IA cuesta miles de dólares al mes en APIs. Abrimos nuestros números reales.",
    suggestedKeyword: "COSTOS"
  },
  {
    id: 22,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "El error de arquitectura en Supabase que nos costó 5 horas de trabajo y cómo solucionarlo.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Bloqueos y errores de permisos RLS en bases de datos relacionales.",
    sampleHook: "Este pequeño error en Supabase casi nos hace perder toda la autenticación de usuarios en producción.",
    suggestedKeyword: "SUPABASE",
    sampleStepOmittedOrValue: "Paso 1: Diagnóstico de la política RLS. Paso 2: Creación del trigger seguro. Paso 3 (Omitido): El SQL exacto de bypass para llamadas backend seguras."
  },
  {
    id: 23,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Esta es la landing page que convirtió al 15% de los visitantes en registros.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Landings con 1% de conversión que queman dinero en tráfico.",
    sampleHook: "Convertir 15 de cada 100 visitas en registros activos no es suerte, es una estructura matemática de 3 bloques.",
    suggestedKeyword: "LANDING"
  },
  {
    id: 24,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Cómo estructuramos la base de datos de nuestro proyecto en la Semana 3.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Esquemas de bases de datos desordenados que rompen la app al escalar.",
    sampleHook: "Así organizamos las tablas, relaciones y límites de tokens en nuestra base de datos para no tener que refactorizar nunca.",
    suggestedKeyword: "DATABASE"
  },
  {
    id: 25,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "La métrica que miramos todas las mañanas para saber si el producto está funcionando.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Mirar métricas de vanidad (visitas/likes) en lugar de retención y activación.",
    sampleHook: "Si abres Google Analytics para ver visitas en lugar de ver la tasa de activación de usuarios, estás mirando el velocímetro con el motor roto.",
    suggestedKeyword: "METRICAS"
  },
  {
    id: 26,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Muestra de código: cómo conectamos Claude y Gemini en el mismo backend de producción.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Depender de un solo proveedor de IA y sufrir caídas de servicio.",
    sampleHook: "Si tu SaaS solo usa una API de IA, estás a una caída de OpenAI de quebrar tu negocio por horas.",
    suggestedKeyword: "BACKEND",
    sampleStepOmittedOrValue: "Paso 1: Arquitectura de fallback dinámico. Paso 2: Manejador de errores. Paso 3 (Omitido): Función TypeScript con balanceador de carga automático."
  },
  {
    id: 27,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Desglose real: cuánto gastamos en Vercel, Resend y Mercado Pago este mes.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Inseguridad sobre los costes fijos de mantener un SaaS activo.",
    sampleHook: "Te muestro la factura exacta de todos nuestros servidores y pasarelas de pago de este mes.",
    suggestedKeyword: "TRANSPARENCIA"
  },
  {
    id: 28,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "El feedback directo de un usuario que nos hizo cambiar todo el flujo de onboarding.",
    suggestedFramework: "reel_values",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Diseñar productos sin escuchar dónde se confunden los usuarios.",
    sampleHook: "Pensábamos que nuestro onboarding era perfecto hasta que vimos la pantalla grabada de nuestro quinto usuario.",
    suggestedKeyword: "ONBOARDING"
  },
  {
    id: 29,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Detrás de escena de una mentoría 1-a-1: corrigiendo la lógica de cobro en vivo.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Dificultad para configurar suscripciones recurrentes y cobros automáticos.",
    sampleHook: "En la sesión 1-a-1 de hoy destrabamos en 20 minutos un bug de webhooks que llevaba 2 semanas bloqueando a un alumno.",
    suggestedKeyword: "MENTORIA"
  },
  {
    id: 30,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Cómo pasamos una maqueta de Figma a un software funcional en Vercel en 120 minutos.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Tener diseños listos pero esperar meses a que un programador los codifique.",
    sampleHook: "De Figma a producción en Vercel con login y base de datos en menos de 2 horas. Te muestro el proceso exacto.",
    suggestedKeyword: "FIGMA",
    sampleStepOmittedOrValue: "Paso 1: Exportar estructura semántica. Paso 2: Inyectar componentes Tailwind con IA. Paso 3 (Omitido): El prompt de vinculación con backend de Supabase."
  },
  {
    id: 31,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "La tasa de abandono de nuestro checkout y qué ajuste hicimos para mejorarla.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Usuarios que llegan al botón de pago pero abandonan.",
    sampleHook: "Teníamos un 40% de abandono en el checkout hasta que eliminamos estos 2 campos innecesarios.",
    suggestedKeyword: "CHECKOUT"
  },
  {
    id: 32,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Cómo configuramos la seguridad RLS en Supabase para evitar filtraciones de datos.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Miedo a que un usuario pueda leer los datos de otros clientes en la BD.",
    sampleHook: "Si no tienes configuradas estas políticas de seguridad en Supabase, cualquier persona con tu API Key puede descargar tu base de datos.",
    suggestedKeyword: "SEGURIDAD",
    sampleStepOmittedOrValue: "Paso 1: Activar RLS en todas las tablas públicas. Paso 2: Crear regla auth.uid() = user_id. Paso 3 (Omitido): Script de auditoría de seguridad automatizado."
  },
  {
    id: 33,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Un vistazo a la comunidad: así se organizan las duplas de Co-Founders en el canal exclusivo.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Sentirse solo al emprender y buscar un socio complementario.",
    sampleHook: "Mira cómo en el canal Pitch & Match se armaron 4 duplas de trabajo para lanzar sus apps en la Semana 2.",
    suggestedKeyword: "COMUNIDAD"
  },
  {
    id: 34,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "El bug en la pasarela de pagos que detuvo nuestras ventas por 3 horas.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Pánico ante imprevistos técnicos durante lanzamientos.",
    sampleHook: "Se cayeron los pagos en pleno lanzamiento. Esto fue exactamente lo que hicimos para recuperar cada venta sin perder clientes.",
    suggestedKeyword: "PASARELA"
  },
  {
    id: 35,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Cómo se ve el panel de administración cuando recibes tu primer webhook con pago confirmado.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "La emoción de validar la primera venta automática en internet.",
    sampleHook: "No hay sensación más adictiva que ver tu panel de Supabase actualizarse solo cuando un cliente paga al otro lado del mundo.",
    suggestedKeyword: "PRIMERA_VENTA"
  },
  {
    id: 36,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "De 0 a 100 usuarios: los canales de distribución que realmente nos trajeron tráfico.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Lanzar una app y no saber cómo conseguir los primeros 100 usuarios.",
    sampleHook: "Probamos 6 canales diferentes para conseguir nuestros primeros 100 usuarios. 4 fueron una pérdida de tiempo; estos 2 nos trajeron el 90% del tráfico.",
    suggestedKeyword: "TRAFICO"
  },
  {
    id: 37,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Así preparamos la infraestructura para aguantar la demo en vivo del Demo Day.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Miedo a que el servidor colapse durante una presentación en vivo frente a inversores o clientes.",
    sampleHook: "La pesadilla de cualquier founder es que la app se caiga en vivo frente a 100 personas. Así blindamos la base de datos.",
    suggestedKeyword: "DEMODAY"
  },
  {
    id: 38,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Las herramientas stack que usamos para lanzar Vibecode Lab en tiempo récord.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Confusión sobre qué tecnologías elegir para no perder tiempo configurando.",
    sampleHook: "El stack de 5 herramientas que te permite pasar de cero a una aplicación con usuarios y cobros en menos de 7 semanas.",
    suggestedKeyword: "STACK",
    sampleStepOmittedOrValue: "Paso 1: Next.js + Tailwind. Paso 2: Supabase + Resend. Paso 3 (Omitido): Nuestra plantilla base preconfigurada con autenticación y pagos."
  },
  {
    id: 39,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "Transparencia total: cuántos cupos llevamos vendidos y en qué tramo de preventa estamos.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Conocer el estado real de la inscripción antes de que suba el precio.",
    sampleHook: "Actualización de inscripciones para Vibecode Lab: ya completamos el Tramo 1.",
    suggestedKeyword: "CUPOS"
  },
  {
    id: 40,
    pilarId: "pilar-2",
    pilarName: "Detrás de Cámara, Métricas & Build in Public",
    title: "La lección más dura que aprendimos al intentar automatizar soporte con un chatbot.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Chatbots alucinando o dando respuestas frías que enojan a los clientes.",
    sampleHook: "Poner un chatbot de IA sin límites de contexto en soporte al cliente fue el error más vergonzoso que cometimos. Te cuento cómo lo corregimos.",
    suggestedKeyword: "SOPORTE"
  },

  // PILAR 3 (41 - 60)
  {
    id: 41,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo integrar la API de Gemini para crear un asistente de voz en tu app.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Aprender a conectar modelos de IA multimodales con baja latencia.",
    sampleHook: "Agregar reconocimiento de voz con Gemini a tu aplicación web toma menos de 15 minutos si conoces este endpoint.",
    suggestedKeyword: "GEMINI",
    sampleStepOmittedOrValue: "Paso 1: Obtén tu API Key. Paso 2: Configura el Web Audio API en el frontend. Paso 3 (Omitido): El hook de React con streaming en tiempo real."
  },
  {
    id: 42,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Guía paso a paso: cómo conectar Mercado Pago con webhooks en un backend moderno.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Integrar cobros en Latinoamérica sin pagar tarifas internacionales absurdas.",
    sampleHook: "Cobrar con Mercado Pago en tu SaaS es facilísimo una vez que entiendes cómo validar los webhooks de pago confirmado.",
    suggestedKeyword: "PAGOS",
    sampleStepOmittedOrValue: "Paso 1: Genera el Access Token. Paso 2: Crea la preferencia de pago. Paso 3 (Omitido): La función de verificación criptográfica de la firma del webhook."
  },
  {
    id: 43,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "El prompt exacto para que Claude te genere el esquema completo de tu base de datos.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "No saber diseñar tablas ni claves foráneas para su modelo de negocio.",
    sampleHook: "Copia este prompt exacto para que Claude te entregue el SQL perfecto de tu base de datos con tablas, relaciones y políticas de seguridad.",
    suggestedKeyword: "PROMPT_BD",
    sampleStepOmittedOrValue: "Paso 1: Describe las entidades de tu app. Paso 2: Especifica los roles de usuario. Paso 3 (Omitido): La directiva de constraints y triggers de integridad referencial."
  },
  {
    id: 44,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo configurar autenticación de usuarios de forma segura en menos de 20 minutos.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Pasar días configurando login, recuperación de contraseñas y sesiones.",
    sampleHook: "Crear un sistema de login con Google, email y sesiones seguras solía tomar 3 días. Con este flujo lo haces en 20 minutos.",
    suggestedKeyword: "AUTH",
    sampleStepOmittedOrValue: "Paso 1: Habilita el proveedor en Supabase Auth. Paso 2: Crea el Middleware en Next.js. Paso 3 (Omitido): El componente de UI con protección de rutas privadas."
  },
  {
    id: 45,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "De prompt a código: cómo usar la IA para depurar errores de sintaxis en segundos.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Quedarse trabado con una pantalla roja de error sin entender qué falló.",
    sampleHook: "Cuando tu app te tire un error en rojo, no entres en pánico. Usa esta técnica de 2 pasos para que la IA lo arregle sola.",
    suggestedKeyword: "DEBUG",
    sampleStepOmittedOrValue: "Paso 1: Copia el stack trace completo. Paso 2: Pasa el contexto del archivo afectado. Paso 3 (Omitido): El prompt de corrección quirúrgica sin romper código existente."
  },
  {
    id: 46,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo enviar correos automáticos transaccionales cuando un usuario se registra.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Falta de bienvenida profesional para nuevos registros.",
    sampleHook: "Un correo de bienvenida enviado en los primeros 60 segundos multiplica por 3 el engagement de tus nuevos usuarios.",
    suggestedKeyword: "EMAILS"
  },
  {
    id: 47,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Aprende a limitar el consumo de tu API para que tus usuarios no agoten tu saldo de IA.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Riesgo de que un usuario abuse de las funciones de IA y genere facturas impagables.",
    sampleHook: "Si no tienes un límite de créditos en la base de datos, un solo usuario puede gastar $50 de tu saldo de IA en 10 minutos.",
    suggestedKeyword: "LIMITES",
    sampleStepOmittedOrValue: "Paso 1: Columna 'credits_remaining' en la tabla de perfiles. Paso 2: Decremento atómico en cada petición. Paso 3 (Omitido): Trigger de Postgres que bloquea llamadas si el saldo es 0."
  },
  {
    id: 48,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo publicar tu aplicación web con dominio propio y certificado SSL gratis.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Miedo a la configuración de DNS y registros CNAME/A.",
    sampleHook: "Comprar tu dominio y conectarlo a Vercel con HTTPS gratis toma 3 minutos si sigues estos pasos.",
    suggestedKeyword: "DOMINIO"
  },
  {
    id: 49,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Estructuración de contexto: haz que tu chatbot responda con voz humana y empática.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Chatbots que suenan como robots aburridos y genéricos.",
    sampleHook: "La diferencia entre un bot que parece un robot de banco y uno que suena como tu mejor consultor está en estas 4 líneas de system prompt.",
    suggestedKeyword: "VOZ_BOT",
    sampleStepOmittedOrValue: "Paso 1: Define el tono y personalidad. Paso 2: Inyecta ejemplos Few-Shot. Paso 3 (Omitido): La regla de restricción de formato para no soltar parrafadas aburridas."
  },
  {
    id: 50,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo crear un modelo Freemium en tu app usando límites de uso en la base de datos.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Cómo dejar que prueben gratis sin regalar todo el valor.",
    sampleHook: "El modelo freemium perfecto: deja que tus usuarios experimenten el 'Momento Ajá' en 3 clics y pon el muro de pago justo en el punto de mayor deseo.",
    suggestedKeyword: "FREEMIUM",
    sampleStepOmittedOrValue: "Paso 1: Define la feature gatillo. Paso 2: Contador de usos gratuitos. Paso 3 (Omitido): Modal de upgrade optimizado para conversión."
  },
  {
    id: 51,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Tutorial: cómo conectar DeepSeek para procesamiento de datos complejos a bajo costo.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Abaratar costes de IA en tareas masivas sin perder calidad.",
    sampleHook: "DeepSeek procesa razonamiento complejo a una fracción del costo de otros modelos. Así lo integramos en Next.js.",
    suggestedKeyword: "DEEPSEEK",
    sampleStepOmittedOrValue: "Paso 1: Configurar cliente compatible con OpenAI SDK. Paso 2: Ajustar parámetros de temperatura. Paso 3 (Omitido): Script de parseo estructurado con JSON Schema."
  },
  {
    id: 52,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo crear un panel responsivo donde tus usuarios puedan gestionar sus suscripciones.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Interfaces de billing confusas donde los clientes cancelan por frustración.",
    sampleHook: "Un portal de suscripciones limpio reduce en un 50% los tickets de soporte por cobros.",
    suggestedKeyword: "PORTAL_BILLING"
  },
  {
    id: 53,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo usar la consola de comandos de tu sistema sin miedo y de forma profesional.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Miedo a la pantalla negra del terminal y los comandos bash.",
    sampleHook: "Solo necesitas memorizar 4 comandos de terminal para construir y publicar cualquier aplicación moderna.",
    suggestedKeyword: "TERMINAL",
    sampleStepOmittedOrValue: "Paso 1: 'cd' y 'ls' para navegar. Paso 2: 'bun dev' para probar. Paso 3 (Omitido): El script alias para hacer deploy a producción en un solo enter."
  },
  {
    id: 54,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "El flujo de trabajo para pasar de una idea escrita a una base de datos en Supabase.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Tener una idea en una servilleta y no saber cómo convertirla en tablas.",
    sampleHook: "Escribe tu idea en 3 párrafos y conviértela en un esquema relacional con autenticación lista en 5 minutos.",
    suggestedKeyword: "ESQUEMA"
  },
  {
    id: 55,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo integrar agentes de IA autónomos que ejecuten tareas en segundo plano.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Crear automatizaciones complejas que no dependan de que el usuario esté frente a la pantalla.",
    sampleHook: "Los mejores SaaS no solo responden mensajes; ejecutan tareas pesadas en segundo plano mientras el usuario duerme.",
    suggestedKeyword: "AGENTES",
    sampleStepOmittedOrValue: "Paso 1: Configurar cola de trabajos asíncrona. Paso 2: Orquestador con LLM. Paso 3 (Omitido): Manejador de estado y webhook de notificación al usuario."
  },
  {
    id: 56,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Guía rápida para diseñar una interfaz limpia y convertir visitas en usuarios registrados.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Interfaces sobrecargadas con demasiados botones que espantan al visitante.",
    sampleHook: "Los 3 principios de diseño UI que usamos en Vibecode Lab para que cualquier usuario entienda la app en 5 segundos.",
    suggestedKeyword: "DISENO_UI"
  },
  {
    id: 57,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo almacenar imágenes y archivos de usuario de forma segura en la nube.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Problemas para gestionar uploads pesados de imágenes y PDFs.",
    sampleHook: "Subir archivos de usuario a Supabase Storage con URLs firmadas y límites de peso en 3 pasos.",
    suggestedKeyword: "STORAGE",
    sampleStepOmittedOrValue: "Paso 1: Bucket privado con políticas RLS. Paso 2: Generación de Signed URL. Paso 3 (Omitido): Componente de drag & drop con preview instantáneo."
  },
  {
    id: 58,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "La estructura de un prompt de sistema (System Prompt) perfecto para SaaS.",
    suggestedFramework: "reel_hook_omitted",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "System prompts desordenados que generan alucinaciones e inconsistencias.",
    sampleHook: "Esta es la plantilla de 4 secciones que usamos en todos nuestros productos con IA para garantizar respuestas 100% precisas.",
    suggestedKeyword: "SYSTEM_PROMPT",
    sampleStepOmittedOrValue: "Paso 1: Rol y Misión. Paso 2: Límites y Restricciones. Paso 3 (Omitido): La sección de ejemplos 'Positive & Negative Few-Shot'."
  },
  {
    id: 59,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Cómo testear el flujo de pagos con tarjetas de prueba antes de salir a producción.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Miedo a lanzar y que el botón de pago falle o cobre de más.",
    sampleHook: "El checklist de 5 pruebas que debes hacer en modo Sandbox antes de recibir tu primer cliente real.",
    suggestedKeyword: "TEST_PAGOS"
  },
  {
    id: 60,
    pilarId: "pilar-3",
    pilarName: "Tutoriales Prácticos, Prompts & Agentes de IA",
    title: "Automatización Go-To-Market: recolecta feedback de usuarios automáticamente por correo.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Usuarios que se van sin decir por qué dejaron de usar la app.",
    sampleHook: "Este email automático enviado al día 3 de registro nos entrega el 80% de las ideas para nuevas funcionalidades.",
    suggestedKeyword: "FEEDBACK"
  },

  // PILAR 4 (61 - 80)
  {
    id: 61,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "De diseñador gráfico a lanzar un SaaS con usuarios de pago en 7 semanas.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Diseñadores cansados de cobrar por horas y buscando ingresos recurrentes.",
    sampleHook: "Era diseñador gráfico cobrando $30 por logo. En 7 semanas aprendió Vibe Coding y hoy tiene su propio software con clientes de pago.",
    suggestedKeyword: "CASO_DISENADOR"
  },
  {
    id: 62,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "El desarrollador Senior que aprendió a vender y dejó de depender de un sueldo corporativo.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Ingenieros de software talentosos pero sin habilidades de marketing y distribución.",
    sampleHook: "Llevaba 8 años como desarrollador senior en una multinacional. Cuando sumó habilidades Go-To-Market a su stack, lanzó su primer producto en 30 días.",
    suggestedKeyword: "CASO_DEV"
  },
  {
    id: 63,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Cómo un emprendedor sin experiencia en código encontró a su CTO dentro del bootcamp.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Falta de equipo y red de contactos para emprender en tecnología.",
    sampleHook: "Entró con una idea en una servilleta y cero conocimientos técnicos. En la Semana 2 hizo dupla con un desarrollador y hoy son socios.",
    suggestedKeyword: "EQUIPO"
  },
  {
    id: 64,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "'Pensé que la IA me iba a reemplazar': la historia de un dev que multiplicó su velocidad x10.",
    suggestedFramework: "reel_values",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Miedo a la obsolescencia laboral por la inteligencia artificial.",
    sampleHook: "La IA no va a reemplazar a los programadores; los programadores que usan IA van a reemplazar a los que no.",
    suggestedKeyword: "VELOCIDAD"
  },
  {
    id: 65,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "La historia de una creadora que convirtió su audiencia en clientes de su propia app.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Creadores de contenido buscando monetizar más allá de patrocinios efímeros.",
    sampleHook: "Tener 50,000 seguidores y vender patrocinios de $200 vs. crear una herramienta para tu comunidad y generar $4,000 USD al mes.",
    suggestedKeyword: "CREADORA"
  },
  {
    id: 66,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Un Founder con visión de negocio + Un Dev enfocado en IA: la anatomía de un MVP exitoso.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Entender la dinámica de los equipos de alto rendimiento en software.",
    sampleHook: "Por qué las mejores startups de nuestra comunidad no nacen de 10 personas, sino de duplas perfectamente complementarias.",
    suggestedKeyword: "SINERGIA"
  },
  {
    id: 67,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "De programar proyectos personales que nadie usaba a construir soluciones monetizables.",
    suggestedFramework: "reel_values",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Desperdiciar meses en ideas que no resuelven un dolor por el que la gente pague.",
    sampleHook: "El momento en que dejas de programar 'lo que te parece divertido' y empiezas a programar 'lo que le ahorra dinero a un negocio', todo cambia.",
    suggestedKeyword: "MONETIZAR"
  },
  {
    id: 68,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Cómo superar el miedo a la consola cuando nunca has escrito una línea de código.",
    suggestedFramework: "story_qa_hidden",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Sensación de intimidación ante la tecnología y los entornos de desarrollo.",
    sampleHook: "¿Qué pasa si cometo un error en la consola? ¿Puedo romper mi computador?",
    suggestedKeyword: "CONFIANZA"
  },
  {
    id: 69,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "El perfil Builder: la persona que no es dev ni marketer, pero lanza productos rápido.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "No encajar en las etiquetas tradicionales de programador o especialista de marketing.",
    sampleHook: "Hay una nueva categoría de emprendedores en 2026: los Builders. No escriben código manual, no hacen campañas complejas, pero lanzan productos en 72 horas.",
    suggestedKeyword: "BUILDER"
  },
  {
    id: 70,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Por qué los equipos de 2 personas con perfiles complementarios avanzan el doble de rápido.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Sentir que avanzar solo es demasiado lento y agotador.",
    sampleHook: "La regla de las duplas en Vibecode: un cerebro enfocado en el producto y otro en la distribución.",
    suggestedKeyword: "DUPLAS"
  },
  {
    id: 71,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Historia de éxito: cómo este MVP facturó sus primeros $100 USD en la semana de lanzamiento.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "La primera validación monetaria en el mundo real.",
    sampleHook: "Tener tu primera venta de $100 USD en internet cambia tu cerebro para siempre. Así lo logró este alumno en la semana de lanzamiento.",
    suggestedKeyword: "CASO_EXITO"
  },
  {
    id: 72,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "El caso de un consultor que automatizó su servicio y lo convirtió en un software escalable.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Consultores y agencias atrapados en vender horas de trabajo.",
    sampleHook: "Pasó de cobrar $50 la hora como consultor a empaquetar su metodología en una herramienta web que cobra $49/mes por usuario.",
    suggestedKeyword: "PRODUCTIZAR"
  },
  {
    id: 73,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Cómo los perfiles creativos están cambiando el diseño de experiencia en apps con IA.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Creativos & Diseñadores",
    corePainOrDesire: "Dar un salto cualitativo en diseño y experiencia de usuario.",
    sampleHook: "Las apps de IA más exitosas hoy no destacan por el modelo de lenguaje que usan detrás, sino por la simplicidad de su experiencia visual.",
    suggestedKeyword: "UX_IA"
  },
  {
    id: 74,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "De la frustración de buscar agencias a construir el prototipo de forma autónoma.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Malas experiencias con presupuestos inflados y entregas retrasadas.",
    sampleHook: "Cotizó su app con 3 agencias: todas le pidieron más de 4 meses y $8,000 USD. Decidió construirlo él mismo con Vibe Coding y lo tuvo listo en 3 semanas.",
    suggestedKeyword: "AUTONOMO"
  },
  {
    id: 75,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Qué ocurre cuando un desarrollador aplica principios de Go-To-Market desde el día 1.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Evitar el clásico error de crear un producto perfecto que nadie compra.",
    sampleHook: "Cuando juntas código funcional con una lista de espera de 50 usuarios interesados antes del lanzamiento, el riesgo de fracaso baja a casi cero.",
    suggestedKeyword: "GTM_DEV"
  },
  {
    id: 76,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "La historia del graduado que presentó su Pitch en el Demo Day frente a la comunidad.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Visibilidad y validación en vivo de su software.",
    sampleHook: "Mira los 3 minutos de pitch con los que este alumno presentó su SaaS en el Demo Day de cierre.",
    suggestedKeyword: "PITCH"
  },
  {
    id: 77,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Cómo dejar de ser un generalista para convertirse en un Forward Deployed Engineer cotizado.",
    suggestedFramework: "reel_cta_direct",
    targetAvatar: "Desarrolladores & Devs",
    corePainOrDesire: "Sueldos estancados como programador generalista.",
    sampleHook: "Las empresas ya no están buscando gente que solo escriba código; están pagando sueldos premium a quienes saben implementar soluciones con IA en semanas.",
    suggestedKeyword: "CARRERA_FDE"
  },
  {
    id: 78,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "El cambio de vida de pasar de buscar empleo a gestionar tu propio portafolio de apps.",
    suggestedFramework: "reel_values",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Seguridad financiera e independencia mediante micro-SaaS.",
    sampleHook: "Tener 3 micro-aplicaciones generando $1,000 USD cada una te da 10 veces más tranquilidad mental que cualquier contrato corporativo.",
    suggestedKeyword: "PORTAFOLIO"
  },
  {
    id: 79,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Un novato total construyendo un chatbot natural en la Clase 6 del programa.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Dudas de si alguien sin experiencia realmente puede lograrlo.",
    sampleHook: "Nunca había tocado una línea de código. En la sesión en vivo de la Semana 6 integró su propio agente de IA con base de datos.",
    suggestedKeyword: "EN_VIVO"
  },
  {
    id: 80,
    pilarId: "pilar-4",
    pilarName: "Historias de Perfiles & Casos de Sinergia",
    title: "Cómo el canal Pitch & Match unió a dos desconocidos para crear una startup funcional.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "La magia de las alianzas entre perfiles de negocio y técnicos.",
    sampleHook: "Vivían en países diferentes, no se conocían y se unieron en el canal de Pitch & Match. Hoy están lanzando juntos.",
    suggestedKeyword: "MATCH"
  },

  // PILAR 5 (81 - 100)
  {
    id: 81,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Quedan solo 4 cupos con el 20% de descuento de pronto pago. Mañana sube el precio.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Urgencia y ahorro económico antes del cambio de tramo.",
    sampleHook: "Oportunidad de pronto pago: nos quedan exactamente 4 cupos en el Tramo 2 con 20% de descuento.",
    suggestedKeyword: "DESCUENTO"
  },
  {
    id: 82,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "¿Por qué limitamos el bootcamp a estrictamente 33 estudiantes? Esta es la razón.",
    suggestedFramework: "reel_authority",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Comprender que el límite de plazas es por calidad pedagógica y mentoría real.",
    sampleHook: "Podríamos meter a 200 personas en una sala de Zoom y cobrarles, pero no tendríamos tiempo para revisar el código de cada uno. Por eso cerramos en 33.",
    suggestedKeyword: "33CUPOS"
  },
  {
    id: 83,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Bono especial: los primeros 8 en matricularse reciben acceso a Google AI Pro con descuento.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Incentivo adicional para tomar acción inmediata.",
    sampleHook: "Beneficio exclusivo para los primeros 8 alumnos matriculados esta semana.",
    suggestedKeyword: "BONO_AI"
  },
  {
    id: 84,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "7 semanas en vivo vs. 6 meses intentando aprender solo: tú decides el ritmo.",
    suggestedFramework: "reel_values",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "El coste de oportunidad del tiempo perdido intentando aprender sin guía.",
    sampleHook: "El tiempo va a pasar de todos modos. En 7 semanas puedes tener tu app publicada con cobros activos o seguir teniendo una libreta llena de ideas.",
    suggestedKeyword: "DECISION"
  },
  {
    id: 85,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Si esperas al 20 de Agosto, el curso volverá a su precio normal. Asegura tu lugar hoy.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Fecha límite estricta de preventa.",
    sampleHook: "La preventa con precio especial finaliza este 20 de Agosto a medianoche.",
    suggestedKeyword: "PREVENTA"
  },
  {
    id: 86,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Qué incluye exactamente la mentoría 1-a-1 de 1 hora al inicio y 1 hora al final del curso.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Saber que tendrán acompañamiento personalizado directo con el mentor.",
    sampleHook: "Así estructuramos tu sesión 1-a-1 de diagnóstico antes de que arranque la primera clase en vivo.",
    suggestedKeyword: "1ON1"
  },
  {
    id: 87,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Si no puedes asistir en vivo a los miércoles, esto es lo que pasa con las grabaciones.",
    suggestedFramework: "story_qa_hidden",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Miedo a no poder asistir por incompatibilidad de horarios laborales.",
    sampleHook: "¿Qué pasa si un miércoles tengo una reunión y no puedo conectarme a la clase en vivo?",
    suggestedKeyword: "GRABACIONES"
  },
  {
    id: 88,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Tu proyecto publicado en internet en 7 semanas o te devolvemos el enfoque de aprendizaje.",
    suggestedFramework: "reel_values",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Garantía de resultado y compromiso mutuo.",
    sampleHook: "Nuestra promesa en Vibecode Lab no es que veas videos; es que tengas una aplicación real en producción con usuarios antes de terminar.",
    suggestedKeyword: "GARANTIA"
  },
  {
    id: 89,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "El tramo de preventa activa cambia en pocas horas. Reserva tu cupo ahora.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Urgencia de última oportunidad para precio reducido.",
    sampleHook: "Quedan menos de 12 horas antes del cambio automático de precio en la plataforma.",
    suggestedKeyword: "RESERVA"
  },
  {
    id: 90,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "¿Tienes dudas sobre si tu computador sirve para el curso? Revisa estos requisitos básicos.",
    suggestedFramework: "story_qa_hidden",
    targetAvatar: "Emprendedores No Técnicos",
    corePainOrDesire: "Creer que necesitan un computador de última generación o Mac caro.",
    sampleHook: "¿Necesito una máquina potente con tarjeta gráfica para programar con IA?",
    suggestedKeyword: "REQUISITOS"
  },
  {
    id: 91,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Muestra tu SaaS funcionando frente a mentores y emprendedores en el Demo Day.",
    suggestedFramework: "reel_authority",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "El hito cumbre de presentar su software terminado frente a la comunidad.",
    sampleHook: "El Demo Day de la Semana 7 no es un examen; es el lanzamiento oficial de tu producto frente a toda nuestra red.",
    suggestedKeyword: "DEMO"
  },
  {
    id: 92,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "¿Qué incluye la inscripción? Sesiones en vivo, código fuente, mentoría y comunidad.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Claridad total sobre todos los entregables del programa.",
    sampleHook: "Desglose completo de todo lo que recibes al ingresar a Vibecode Lab este ciclo.",
    suggestedKeyword: "INCLUYE"
  },
  {
    id: 93,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "No sigas acumulando ideas en una libreta. Es hora de llevar una a producción.",
    suggestedFramework: "reel_values",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Superar el arrepentimiento de ver a otros lanzar ideas similares.",
    sampleHook: "La diferencia entre una persona con una libreta de ideas y un fundador con un negocio es una sola decisión de ejecución.",
    suggestedKeyword: "ACCION"
  },
  {
    id: 94,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "La garantía de acompañamiento directo: por qué no vas a construir en aislamiento.",
    suggestedFramework: "reel_values",
    targetAvatar: "Founders & Product Owners",
    corePainOrDesire: "Miedo a trabarse en un problema y no tener a quién preguntar.",
    sampleHook: "El motivo principal por el que los cursos online tienen 90% de abandono es la soledad. Así eliminamos ese problema.",
    suggestedKeyword: "ACOMPANAMIENTO"
  },
  {
    id: 95,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Paso a paso para matricularte hoy y asegurar tu beneficio del tramo 2.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Facilidad de inscripción en 3 simples pasos.",
    sampleHook: "Cómo asegurar tu plaza en menos de 2 minutos antes de que se agoten los cupos de este tramo.",
    suggestedKeyword: "MATRICULA"
  },
  {
    id: 96,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "¿Tienes perfil de Founder, Dev o Creativo? Mira en qué grupo encajas mejor.",
    suggestedFramework: "story_poll_surfacing",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Identificar su perfil para saber el rol que jugará en el bootcamp.",
    sampleHook: "¿Con cuál de estos perfiles te identificas más para crear software con IA?",
    suggestedKeyword: "PERFIL"
  },
  {
    id: 97,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "El checklist definitivo para saber si estás listo para sumarte a Vibecode Lab.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Autoevaluación para validar si cumplen las condiciones de entrada.",
    sampleHook: "Los 4 requisitos que debes cumplir antes de postular a un cupo de Vibecode Lab.",
    suggestedKeyword: "CHECKLIST"
  },
  {
    id: 98,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Un resumen rápido de lo que construirás semana por semana en el Syllabus.",
    suggestedFramework: "story_resource_2slides",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Hoja de ruta clara de las 7 semanas de aprendizaje y construcción.",
    sampleHook: "De la Semana 1 a la Semana 7: este es el mapa exacto para llevar tu producto a internet.",
    suggestedKeyword: "SYLLABUS"
  },
  {
    id: 99,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Las inscripciones se cierran al alcanzar los 33 cupos. Consulta los lugares disponibles.",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Escasez real y conteo regresivo de plazas.",
    sampleHook: "Estamos en la recta final de admisiones para el ciclo de Agosto.",
    suggestedKeyword: "ESTADO_CUPOS"
  },
  {
    id: 100,
    pilarId: "pilar-5",
    pilarName: "Llamados a la Acción, Descuentos & Escasez",
    title: "Miércoles 26 de Agosto a las 20:00 hrs arrancamos. ¿Vas a estar dentro o mirando desde fuera?",
    suggestedFramework: "story_cta_direct",
    targetAvatar: "General / Audiencia Amplia",
    corePainOrDesire: "Última llamada antes del inicio de la primera clase en vivo.",
    sampleHook: "Las puertas se cierran este miércoles a las 20:00 hrs para arrancar la Clase 1 en vivo.",
    suggestedKeyword: "ARRANCAMOS"
  }
]

export const FRAMEWORKS_LIST: FrameworkDefinition[] = [
  {
    type: "reel_hook_omitted",
    name: "Reel de Recurso / Anzuelo (Framework del Paso Omitido)",
    icon: "🧲",
    format: "Reel / Feed",
    objective: "Generar una avalancha de comentarios y DMs Inbound entregando alto valor pero ocultando la pieza crítica final.",
    rules: [
      "No dar la solución completa de golpe (elimina la razón de comentar).",
      "No hacer un anzuelo vacío sin valor (hace que nadie quiera comentar).",
      "Dar pasos 1 y 2 que hagan sentir al prospecto que puede lograrlo.",
      "Censurar/ocultar visualmente o en guion el Paso 3 (guion exacto, prompt de sistema, webhook).",
      "Terminar con CTA a comentar una palabra clave concisa."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Hook Negativo o Dolor Concreto (0-4s)", instruction: "Apunta a un error común o dolor agudo del nicho con aversión a la pérdida.", example: "Si le estás enviando cotizaciones por PDF a tus prospectos por email, estás regalando el 50% de tus ventas..." },
      { stepNumber: 2, title: "Solución Inicial / Valor Aplicable (4-25s)", instruction: "Explica el paso 1 y 2 con total claridad. Deben sentir '¡Esto es facilísimo y tiene todo el sentido!'", example: "En vez de eso, diles esto palabra por palabra: 'Nuestras propuestas son personalizadas, ¿te parece si hacemos una llamada rápida de 10 min para resolver dudas?'" },
      { stepNumber: 3, title: "El Paso Omitido / La Pieza Clave (25-40s)", instruction: "Censura u oculta la pieza final (el guion exacto de la llamada, el prompt o la función).", example: "Pero en esa llamada no improvisas: sigues este guion exacto de 3 preguntas para cerrar la venta ahí mismo (aparece censurado en pantalla)." },
      { stepNumber: 4, title: "CTA Anzuelo al DM (40-50s)", instruction: "Invita a comentar la palabra clave para recibir la pieza faltante por mensaje privado.", example: "Si quieres que te envíe el guion completo de esa llamada para cerrar clientes, comenta 'GUION' y te lo paso por privado." }
    ],
    goldenRule: "Entrega tanto valor en los primeros pasos que deseen con locura la pieza que falta."
  },
  {
    type: "reel_cta_direct",
    name: "Reel de CTA Directo (Contextualizado para Audiencia Semilla)",
    icon: "🚀",
    format: "Reel / Feed",
    objective: "Convertir en el feed a prospectos fríos que aún no te conocen, contextualizando la oportunidad antes de vender.",
    rules: [
      "Nunca vender directo en el segundo 1 en un Reel (la gente pasará de largo).",
      "Hook amplio dirigido al Mercado Total Accesible (TAM).",
      "Narrar una historia de caso de éxito o contrastar el vehículo antiguo vs. nuevo.",
      "Usar la transición suave: 'comenta X y te cuento/muestro cómo funciona'."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Hook Amplio de Oportunidad (0-5s)", instruction: "Capta la atención de una audiencia masiva interesada en el resultado final.", example: "El 80% de las personas que intentan crear una aplicación este año van a quebrar antes del mes 2 por este error..." },
      { stepNumber: 2, title: "Contextualización & Caso de Éxito (5-30s)", instruction: "Explica por qué el camino tradicional falla y cómo un cliente real lo solucionó.", example: "Tenía un cliente que gastó 4 meses buscando programadores. Cambiamos su enfoque al modelo Forward Deployed Engineer y lanzó en 14 días..." },
      { stepNumber: 3, title: "Presentación del Vehículo (30-45s)", instruction: "Introduce tu metodología propia (Vibe Coding / Social Funnel) como el puente definitivo.", example: "Usamos nuestro sistema de orquestación de agentes de IA para construir código nativo en días sin tocar sintaxis manual." },
      { stepNumber: 4, title: "CTA a DM Suave (45-60s)", instruction: "Llama a comentar para mostrarles cómo funciona en su caso particular.", example: "Si quieres ver cómo aplicar este sistema en tu idea antes del miércoles, comenta 'VIBECODE' y te muestro cómo funciona." }
    ],
    goldenRule: "En reels fríos primero construyes el contexto y el deseo; luego abres la puerta al chat."
  },
  {
    type: "reel_authority",
    name: "Reel de Autoridad & Build in Public",
    icon: "💎",
    format: "Reel / Feed",
    objective: "Posicionar maestría técnica, resultados y estatus para alimentar la confianza y crear activos de retargeting.",
    rules: [
      "No sonar pedante o puramente autorreferente (usar ganchos indirectos).",
      "Mostrar métricas reales, números de infraestructura, costes o bugs resueltos.",
      "Ideal para crear anuncios de retargeting a seguidores de los últimos 180 días."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Hook Indirecto / Curiosidad (0-5s)", instruction: "Inicia con un dato o reflexión provocadora en vez de 'mira lo bueno que soy'.", example: "Esta estadística de retención en aplicaciones con IA me voló la cabeza..." },
      { stepNumber: 2, title: "Revelación de Datos / Bastidores (5-35s)", instruction: "Abre los números, el código, el panel de control o la experiencia real del equipo.", example: "Abrimos nuestro panel de costos: esto es exactamente lo que pagamos en Vercel, Supabase y Gemini para aguantar 10,000 peticiones diarias..." },
      { stepNumber: 3, title: "Lección / Principio de Autoridad (35-50s)", instruction: "Sintetiza la moraleja técnica que demuestra que dominas el juego.", example: "La estabilidad de un software no depende de cuánto gastes, sino de cómo blindes tus políticas RLS y limites de tokens desde el día 1." }
    ],
    goldenRule: "Infla el pecho con hechos, métricas y código real, no con promesas vacías."
  },
  {
    type: "reel_values",
    name: "Reel / Carrusel de Confianza & Valores (Lado B)",
    icon: "☕",
    format: "Reel / Feed",
    objective: "Conectar a nivel humano, amortiguar los días de venta agresiva y hacer que el cliente quiera comprarte a ti y a nadie más.",
    rules: [
      "No intentar vender en este contenido.",
      "Hablar de ética de trabajo, visión a largo plazo, familia, pareja, no tomar atajos.",
      "Funciona como el gran 'amortiguador' de fatiga cuando haces CTA directos en historias."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Reflexión Personal / Postura (0-5s)", instruction: "Plantea tu filosofía o una conversación honesta sobre la vida y los negocios.", example: "En un mundo obsesionado con ganar dinero rápido en 15 minutos, nosotros preferimos construir negocios como una panadería tradicional de barrio..." },
      { stepNumber: 2, title: "Desarrollo de la Filosofía (5-45s)", instruction: "Explica por qué priorizas la sostenibilidad, la palabra y el respeto al cliente.", example: "No vemos a los estudiantes como un número de facturación. Si alguien entra a nuestro programa, nos comprometemos a llevar su proyecto a producción..." },
      { stepNumber: 3, title: "Cierre de Conexión (45-60s)", instruction: "Deja una pregunta o reflexión sin presionar a ninguna compra.", example: "¿Prefieres el negocio de los 15 minutos de fama o el que sigue de pie en 10 años? Déjame tu opinión en los comentarios." }
    ],
    goldenRule: "La gente compra la metodología por la cabeza, pero toma la decisión final por el corazón y los valores compartidos."
  },
  {
    type: "story_resource_2slides",
    name: "Stories de Recurso (Regla de las 2 Diapositivas)",
    icon: "📦",
    format: "Stories",
    objective: "Entregar un recurso gratuito elevando al máximo el valor percibido para llenar el inbox de respuestas.",
    rules: [
      "Obligatorio: Exactamente 2 historias consecutivas.",
      "Historia 1: Elevar el valor percibido (resultado, caso real, pantallazo censurado).",
      "Historia 2: Oferta y llamada simple ('responde YO' o 'responde PALABRA').",
      "Protocolo: Subir cuando no queden historias activas previas para no diluir visualizaciones."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Diapositiva 1: Elevación de Valor Percibido", instruction: "Muestra la historia de fondo o el impacto brutal que genera este documento/video.", example: "Ayer un alumno de Vibecode Lab estaba trabado con los webhooks de pago. Le compartí esta plantilla interna y en 12 minutos tenía su primer cobro confirmado en producción..." },
      { stepNumber: 2, title: "Diapositiva 2: La Oferta y CTA Simple", instruction: "Ofrece el recurso sin saturar de texto. Solo llamada a responder.", example: "Grabé un video corto de 8 minutos con la plantilla exacta lista para copiar y pegar. Si quieres que te lo envíe, responde 'PAGOS' y te lo paso por aquí." }
    ],
    goldenRule: "Nunca intentes condensar la historia de valor y la llamada a la acción en una sola diapositiva."
  },
  {
    type: "story_cta_direct",
    name: "Stories de CTA Directo ('Estoy buscando a 3...')",
    icon: "🎯",
    format: "Stories",
    objective: "Capturar clientes de alta intención listos para trabajar contigo mediante una invitación directa y honesta.",
    rules: [
      "Usar ángulos probados: 'Estoy buscando a 3 [Nicho]', 'Grupo Beta', 'Te tomo de la mano', 'Oportunidad única'.",
      "Fórmula de transición suave: 'Responde YO y te muestro cómo funciona' (NUNCA 'responde y págame').",
      "Ideal: Dejar correr sola durante 24 horas sin subir nada antes ni después para maximizar retención."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Apertura de Oportunidad / Filtro", instruction: "Especifica el nicho exacto y la cantidad de plazas disponibles.", example: "Estoy buscando a 3 emprendedores o diseñadores que quieran lanzar su propio SaaS con IA en los próximos 60 días." },
      { stepNumber: 2, title: "La Promesa & El Acompañamiento", instruction: "Explica cómo trabajarán juntos y los beneficios concretos.", example: "Vamos a tomarte de la mano, conectaremos tu backend de Supabase y te daremos las plantillas de Vibe Coding para salir a producción con cobros reales." },
      { stepNumber: 3, title: "CTA de Curiosidad", instruction: "Llama a responder para revisar los detalles por mensaje privado.", example: "Si quieres ver cómo funciona el programa y si tu idea califica para este ciclo, responde 'VIBECODE' y te cuento por privado." }
    ],
    goldenRule: "El CTA directo no vende la compra; vende la curiosidad de descubrir cómo funciona."
  },
  {
    type: "story_qa_hidden",
    name: "Secuencia Q&A Hidden CTA (5 Preguntas Psicológicas)",
    icon: "🕵️",
    format: "Stories",
    objective: "Vender en historias de preguntas y respuestas sin parecer un vendedor, guiando la mente del prospecto paso a paso.",
    rules: [
      "Usar sticker: 'Pregúntame sobre [Tema]. Sé brutalmente honesto'.",
      "Secuencia de 5 preguntas exactas: Gancho -> Autoridad -> Vehículo -> Contrarian -> Ayuda (Auto-pregunta).",
      "Descompresión: 2 a 3 respuestas personales/divertidas después de la venta.",
      "Story final: Reiterar la llamada a la acción para los que llegaron al final.",
      "Usar fotos variadas por historia, poco texto y nunca poner links externos."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Pregunta 1: Gancho (Hook / Dopamina)", instruction: "Pregunta curiosa, divertida o polémica para frenar el scroll.", example: "¿Es verdad que necesitas saber matemáticas avanzadas para hacer apps con IA? -> (Foto divertida) Para nada, si sabes escribir en español claro, sabes dirigir agentes." },
      { stepNumber: 2, title: "Pregunta 2: Autoridad & Eficiencia", instruction: "Pregunta sobre tus resultados o los de tus alumnos.", example: "¿Cuántas apps han lanzado en Vibecode? -> Más de 40 plataformas en producción, desde micro-SaaS de $500/mes hasta herramientas corporativas." },
      { stepNumber: 3, title: "Pregunta 3: El Vehículo Único", instruction: "Pregunta sobre tu método o ingredientes del éxito.", example: "¿Cuál es el secreto de su velocidad? -> El stack FDE: Next.js + Supabase + Cursor Rules preconfiguradas. No escribimos sintaxis desde cero." },
      { stepNumber: 4, title: "Pregunta 4: Contrarian (Romper Mito)", instruction: "Pregunta sobre el error más común en la industria.", example: "¿Qué opinas de aprender a programar en bootcamps tradicionales de 1 año? -> Es el peor error en 2026. Te enseñan a escribir bucles 'for' cuando el mercado pide soluciones con IA." },
      { stepNumber: 5, title: "Pregunta 5: Ayuda / Hidden CTA (Auto-pregunta)", instruction: "Pregunta de alta intención para abrir el chat.", example: "Me convencí, ¿dónde puedo ver si quedan cupos para el bootcamp de Agosto? -> Responde 'CUPOS' por aquí y te muestro cómo entrar al grupo de prueba." },
      { stepNumber: 6, title: "Descompresión & Reiteración Final", instruction: "2 respuestas ligeras + Story final recordando la oportunidad.", example: "Por cierto, si viste la historia anterior y quieres asegurar tu lugar antes de que suba el tramo, responde 'CUPOS' ahora." }
    ],
    goldenRule: "La pregunta de ayuda se coloca estratégicamente cuando la autoridad y el vacío de conocimiento ya están en su punto máximo."
  },
  {
    type: "story_poll_surfacing",
    name: "Secuencia CTA de Encuesta (Técnica de Surfacing)",
    icon: "📊",
    format: "Stories",
    objective: "Hacer emerger a prospectos calificados que nunca responden a un CTA tradicional mediante micro-interacciones sin fricción.",
    rules: [
      "Secuencia de 4 encuestas consecutivas: Nicho -> Situación Financiera -> Obstáculo -> CTA de Recurso.",
      "Filtrar y prospectar por DM con mensaje no amenazante ('vi tu voto... estoy preparando contenido...').",
      "No calificar financieramente en el chat: ya sabes su respuesta de la Historia 2."
    ],
    structureSteps: [
      { stepNumber: 1, title: "Historia 1: Encuesta de Nicho", instruction: "¿Cuál te describe mejor? Opción 1: Tu nicho objetivo (Founders / Devs / Creativos). Opciones 2-4: Otros perfiles.", example: "Por curiosidad, ¿cuál te describe mejor hoy? [Soy Founder / Creador] [Soy Programador / Dev] [Tengo un negocio tradicional] [Otro]" },
      { stepNumber: 2, title: "Historia 2: Encuesta de Situación / Calificación", instruction: "Pregunta indirecta que revela capacidad de inversión o nivel de madurez.", example: "¿Cuál es tu meta de facturación mensual para este año con tu software? [Menos de $1k] [$1k a $5k] [$5k a $10k] [+$10k]" },
      { stepNumber: 3, title: "Historia 3: Encuesta de Obstáculo Principal", instruction: "Identifica el dolor exacto para hiper-personalizar el primer mensaje de prospección.", example: "¿Cuál es tu mayor freno hoy para lanzar? [No soy técnico] [Me falta tiempo] [No sé cómo conseguir clientes] [Miedo a los costos]" },
      { stepNumber: 4, title: "Historia 4: CTA de Recurso Específico", instruction: "Ofrece la guía o sesión para resolver el obstáculo votado.", example: "Si quieres que te envíe una guía paso a paso para destrabar tu obstáculo específico, responde 'GUIA' y te la mando." }
    ],
    goldenRule: "Un tap en una encuesta requiere 100 veces menos esfuerzo que un DM, pero te entrega el 100% de la información para cerrar."
  }
]

export const WEEKLY_SCHEDULE_TEMPLATES = {
  "7_days": {
    name: "Estructura Óptima de 7 Días (Venta Perpetua Completa)",
    description: "Máximo volumen de conversaciones y agendas. Sincroniza Inbound en stories con amortiguación en feed.",
    days: [
      {
        day: "Lunes",
        storyType: "story_resource_2slides",
        storyTitle: "Story de Recurso (2 Diapositivas)",
        storyGoal: "Alto volumen de Inbound DMs para arrancar la semana con conversaciones activas.",
        feedType: "reel_cta_direct",
        feedTitle: "Reel CTA Directo (Vehículo & Oportunidad)",
        feedGoal: "Presentar el vehículo FDE a audiencia semilla.",
        amortiguacionCheck: "Balance equilibrado: Recurso en Stories amortigua el CTA directo en el Feed."
      },
      {
        day: "Martes",
        storyType: "story_qa_hidden",
        storyTitle: "Secuencia Q&A Hidden CTA (5 preguntas)",
        storyGoal: "Nutrición psicológica, romper mitos y captar leads calificados con la pregunta de ayuda.",
        feedType: "reel_hook_omitted",
        feedTitle: "Reel Anzuelo Contrarian (Paso Omitido)",
        feedGoal: "Atracción masiva con ruptura de paradigmas de programación tradicional.",
        amortiguacionCheck: "Ambos formatos entregan alto valor y curiosidad sin quemar la lista."
      },
      {
        day: "Miércoles",
        storyType: "story_cta_direct",
        storyTitle: "Story CTA Directo ('Estoy buscando a 3...')",
        storyGoal: "Conversión de alta intención para el tramo activo de preventa.",
        feedType: "reel_values",
        feedTitle: "Reel / Carrusel de Confianza & Valores",
        feedGoal: "Conexión humana, ética de trabajo y filosofía de negocio.",
        amortiguacionCheck: "REGLA DE ORO: La venta directa en historias queda perfectamente amortiguada por el contenido de valores en el Feed."
      },
      {
        day: "Jueves",
        storyType: "story_poll_surfacing",
        storyTitle: "Secuencia CTA de Encuesta (Surfacing 4 stories)",
        storyGoal: "Hacer emerger prospectos calificados para prospección Outbound en frío amigable.",
        feedType: "reel_authority",
        feedTitle: "Reel de Autoridad & Métricas (Build in Public)",
        feedGoal: "Mostrar infraestructura, costes reales de IA o casos de éxito indirectos.",
        amortiguacionCheck: "Día de prospección: el feed no distrae con CTAs agresivos."
      },
      {
        day: "Viernes",
        storyType: "story_resource_2slides",
        storyTitle: "Story de Recurso de Fin de Semana",
        storyGoal: "Generar leads de lectura y estudio para el fin de semana.",
        feedType: "reel_hook_omitted",
        feedTitle: "Reel Anzuelo Técnico (Paso Omitido)",
        feedGoal: "Tutorial práctico sobre prompts, webhooks o arquitectura.",
        amortiguacionCheck: "Doble entrega de valor: la audiencia percibe pura utilidad."
      },
      {
        day: "Sábado",
        storyType: "reel_values",
        storyTitle: "Stories de Conexión Personal & Lifestyle",
        storyGoal: "Mostrar el día a día, reflexiones de vida y descanso comercial.",
        feedType: "reel_values",
        feedTitle: "Carrusel de Reflexión / Lado B",
        feedGoal: "Fortalecer la relación de confianza con la comunidad.",
        amortiguacionCheck: "Día de cero venta: no se agendan llamadas los domingos, se nutre el vínculo."
      },
      {
        day: "Domingo",
        storyType: "story_cta_direct",
        storyTitle: "Story CTA Directo de Cierre de Semana",
        storyGoal: "Llenar la agenda de llamadas del lunes con prospectos decididos.",
        feedType: "reel_hook_omitted",
        feedTitle: "Reel Anzuelo / Lead Magnet de Inicio de Ciclo",
        feedGoal: "Generar comentarios para alimentar el setter el lunes por la mañana.",
        amortiguacionCheck: "Alineación de inicio de semana: agenda llena para el equipo comercial."
      }
    ]
  },
  "4_days": {
    name: "Estructura Eficiente de 4 Días",
    description: "Ideal para founders ocupados. Historias todos los días + 4 publicaciones semanales en Feed con amortiguación garantizada.",
    days: [
      {
        day: "Lunes",
        storyType: "story_resource_2slides",
        storyTitle: "Story de Recurso (2 Diapositivas)",
        storyGoal: "Generar Inbound DMs inmediatos.",
        feedType: "reel_cta_direct",
        feedTitle: "Reel CTA Directo (Vehículo FDE)",
        feedGoal: "Captar prospectos con visión de negocio.",
        amortiguacionCheck: "Amortiguado por entrega de recurso en historias."
      },
      {
        day: "Miércoles",
        storyType: "story_cta_direct",
        storyTitle: "Story CTA Directo ('Busco a 3...')",
        storyGoal: "Venta directa de cupos limitados.",
        feedType: "reel_values",
        feedTitle: "Reel / Carrusel de Valores & Confianza",
        feedGoal: "Humanizar y proteger a la audiencia de fatiga publicitaria.",
        amortiguacionCheck: "Amortiguación perfecta entre venta en Stories y valores en Feed."
      },
      {
        day: "Viernes",
        storyType: "story_poll_surfacing",
        storyTitle: "Secuencia CTA de Encuesta (Surfacing)",
        storyGoal: "Filtrar por nicho y capacidad financiera para outbound.",
        feedType: "reel_hook_omitted",
        feedTitle: "Reel Anzuelo Técnico (Paso Omitido)",
        feedGoal: "Captar desarrolladores y emprendedores técnicos.",
        amortiguacionCheck: "Enfoque en conversaciones y valor."
      },
      {
        day: "Domingo",
        storyType: "story_cta_direct",
        storyTitle: "Story CTA Directo de Agenda",
        storyGoal: "Pre-agendar llamadas para el inicio de semana.",
        feedType: "reel_authority",
        feedTitle: "Reel de Autoridad & Métricas",
        feedGoal: "Prueba social y transparencia de resultados.",
        amortiguacionCheck: "Cierre estratégico antes del lunes."
      }
    ]
  }
}
