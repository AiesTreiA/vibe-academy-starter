# Fuentes Técnicas, Financieras y Regulatorias · "CÓDIGO & CAPITAL"

Este documento respalda las referencias arquitectónicas, metodológicas, financieras y de ecosistema citadas en los 4 tomos de la tetralogía.

---

## 1. Fuentes de Infraestructura y Producción (Tomo I)

1. **Vercel — Custom Domains & DNS Configuration (2025–2026):**
   - Registro `A` apex para dominios raíz: `76.76.21.21` (o rangos Anycast asignados por proyecto en el panel de Vercel).
   - Registro `CNAME` para subdominios (`www`): `cname.vercel-dns.com`.
   - Emisión automática de certificados TLS mediante Let's Encrypt (desafíos HTTP-01 y DNS-01).
2. **Supabase — Connection Pooling with Supavisor & PgBouncer:**
   - Puerto `6543`: Modo *Transaction* (recomendado para funciones *Serverless*, Edge y Next.js Server Actions / Route Handlers con `?pgbouncer=true`).
   - Puerto `5432`: Modo *Session* / Conexión directa (requerido para migraciones DDL y conexiones persistentes).
3. **Mercado Pago Developers — Webhooks & Validación de Firma (`x-signature`):**
   - Formato de cabecera `x-signature`: `ts=<timestamp>,v1=<hash>`.
   - Manifiesto de validación HMAC-SHA256: `id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];`.
4. **Cloudflare R2 — Pricing & S3 API Compatibility:**
   - Política de \$0 USD por cargos de egreso (*egress bandwidth*) y compatibilidad con `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`.
5. **NIC Chile (`.cl`) — Reglas de Delegación DNS:**
   - Configuración de servidores de nombres (*nameservers*) autoritativos hacia Cloudflare para habilitar DNS Anycast y gestión de registros `A`/`CNAME` sin latencia de propagación.

---

## 2. Fuentes de Dramaturgia Escénica y Psicología de Decisión (Tomo II)

1. **Sepúlveda Velásquez, Héctor — *El Mago del Desierto* y *Power Pitch Method®*:**
   - Marco conceptual de comunicación estratégica basado en la construcción de propuestas de valor **Deseables**, **Irrefutables** y **Replicables**, y en la estructura dramática del conflicto (dolor) frente al analgésico.
2. **Kahneman, Daniel (2011) — *Thinking, Fast and Slow* (Farrar, Straus and Giroux):**
   - Distinción entre el Sistema 1 (rápido, intuitivo, asociativo y emocional) y el Sistema 2 (lento, deliberativo y analítico), base teórica para comprender cómo se forman los juicios iniciales en comités de evaluación bajo alta carga cognitiva.
3. **Cialdini, Robert (2021) — *Influence, New and Expanded: The Psychology of Persuasion*:**
   - Principios de escasez, autoridad, prueba social y encuadre de alternativas aplicados al cierre de reuniones de seguimiento y apertura de *Data Rooms*.

---

## 3. Fuentes de Unit Economics y Benchmarks SaaS (Tomo III)

1. **Bessemer Venture Partners — *State of the Cloud & SaaS Metrics Benchmarks*:**
   - Estándares institucionales de LTV/CAC (> 3x), *CAC Payback Period* (< 12 meses en B2B general; < 6 meses en modelos *Product-Led Growth*), Retención Neta de Ingresos (*NRR* > 110% en B2B) y *Rule of 40*.
2. **OpenView Partners — *Product Benchmarks Report (PLG)*:**
   - Tasas de activación (*Time-to-Value* < 5 minutos) y conversión de tráfico autogestionado a cuentas de pago.
3. **Graham, Paul (Y Combinator, 2012 & 2015) — *"Startup = Growth"* y *"Default Alive or Default Dead?"*:**
   - Tasas de crecimiento semanal/mensual en etapa temprana (5%–7% semanal equivalente a ~15%–25% mensual compuesto) y cálculo de supervivencia operativa con la caja actual.

---

## 4. Fuentes de Capitalización, Subsidios y Ecosistema LatAm (Tomo IV)

1. **Y Combinator — *Post-Money SAFE User Guide* (Kirsty Nathoo):**
   - Mecánica matemática exacta del *Post-Money SAFE*, cálculo de propiedad directa ($\text{Inversión} / \text{Post-Money Valuation Cap}$), interacción con el *Option Pool* (*ESOP*) y conversión en ronda semilla con precio (*Priced Seed Round*).
2. **CORFO (Corporación de Fomento de la Producción, Chile) — Bases Técnicas Semilla Inicia y Semilla Expande:**
   - Subsidios públicos de cofinanciamiento *equity-free* para emprendimientos dinámicos de alto potencial de crecimiento. *(⚠️ Verificar montos máximos y porcentajes de cofinanciamiento en las bases vigentes de cada convocatoria anual en `corfo.cl`).*
3. **Start-Up Chile (Build / Ignite / Growth) — Bases de Postulación:**
   - Programa de aceleración pública *equity-free* con sede en Santiago de Chile.
4. **Casos de Estudio del Ecosistema Latinoamericano:**
   - **Cornershop (Chile/México):** Adquisición total por Uber en 2021 a una valoración superior a \$3.000M USD tras una ejecución enfocada en densidad logística y retención por cohorte.
   - **NotCo (Chile):** Estatus de Unicornio (\$1.500M USD en Serie D, 2021) apalancando su plataforma propietaria de IA (*Giuseppe*) como foso defensivo tecnológico.
   - **Buk (Chile/LatAm):** SaaS B2B de gestión de capital humano que alcanzó una valoración de ~\$850M USD en su Serie B (2025), referente regional de eficiencia de capital, bajo *churn* y expansión multi-país (Chile, Colombia, México, Perú).
   - **Betterfly (Chile):** Alcanzó valoración de Unicornio (\$1.000M USD en Serie C, 2022) en el sector InsurTech/Beneficios B2B, ofreciendo lecciones críticas sobre hipercrecimiento y ajuste posterior de estructura en mercados cambiantes.
   - **Nubank (Brasil/México/Colombia):** Mayor referente FinTech cotizado en bolsa (NYSE: NU) de América Latina, con eficiencia radical en costo de servicio y adquisición orgánica.
