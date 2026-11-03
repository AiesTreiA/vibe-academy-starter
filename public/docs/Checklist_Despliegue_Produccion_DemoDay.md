# Checklist Operativo: Despliegue en Producción & Demo Day

> **VibeCode Lab — Tu Hoja de Ruta de Verificación Previa al Escenario**  
> Antes de que comiencen los 3 minutos de tu pitch, recorre este checklist junto a tu squad para asegurar que tu infraestructura no falle, tu relato sea contundente y cumplas con todos los requisitos de graduación.

---

## 🛠️ FASE 1: AUDITORÍA TÉCNICA EN VERCEL (CERO FALLAS)

- [ ] **1. Variables de Entorno de Producción Verificadas:**
  - [ ] Mercado Pago: Llaves cambiadas de modo prueba (`TEST-...`) a credenciales de producción (`APP_USR-...`).
  - [ ] Webhook de Mercado Pago: URL apuntando a tu dominio oficial (`https://tu-saas.com/api/webhooks/mercadopago`).
  - [ ] Supabase: String de conexión configurado con el **Connection Pooler** (puerto 6543) para soportar ejecuciones serverless sin agotar conexiones.
  - [ ] Cloudflare R2: Bucket de producción con políticas CORS restringidas a tu dominio HTTPS.
  - [ ] Variables no expuestas: Asegurar que llaves secretas nunca tengan el prefijo `NEXT_PUBLIC_`.

- [ ] **2. Dominio Propio & Certificado SSL Activo:**
  - [ ] Registro DNS A (`@` apuntando a `76.76.21.21`) y CNAME (`www` apuntando a `cname.vercel-dns.com`) propagados con éxito.
  - [ ] Candado verde visible en el navegador bajo protocolo `https://`.
  - [ ] Redirección automática de `http://` a `https://` funcionando.

- [ ] **3. Pre-Calentamiento y Plan B Anti-Caídas:**
  - [ ] **Cache Warming:** Visita en modo incógnito tu Landing, Login, Onboarding, Paywall y Dashboard para precargar las funciones Serverless en la Edge Network.
  - [ ] **Video de Respaldo Local (Mandatorio):** Ten grabado en tu escritorio un video de 45 segundos en 1080p mostrando el flujo perfecto de tu SaaS (subida a R2, procesamiento con IA y respuesta). Si el Wi-Fi falla en vivo, reproduces el video sin titubear.

---

## 🎭 FASE 2: AUDITORÍA DEL POWER PITCH (LOS 15 MINUTOS DE SPRINT)

- [ ] **1. Estructura Teatral de las 6 Escenas:**
  - [ ] **Escena 1 (Dolor):** ¿El problema está cuantificado con cifras duras de dinero o tiempo perdido?
  - [ ] **Escena 2 (Analgésico):** ¿Mencionas por qué Excel o los métodos manuales actuales no resuelven la causa raíz?
  - [ ] **Escena 3 (Solución & Demo):** ¿Tienes abierta en una pestaña la app en Vercel lista para mostrar en 30 segundos?
  - [ ] **Escena 4 (Ambición):** ¿Mencionas el tamaño de mercado (TAM regional) y tu ventaja tecnológica?
  - [ ] **Escena 5 (Tracción & Facilidad):** ¿Muestras usuarios activos, estado en producción y modelo de cobro con Mercado Pago?
  - [ ] **Escena 6 (Capital Ask, Uso de Fondos para el Unicornio & Doble Alternativa):** ¿El discurso declara con precisión cuánto capital se requiere (The Ask: ej. 50K USD SAFE / 25M CLP CORFO), el plan de inversión estratégica para escalar hacia un unicornio (40% GTM / 35% Producto e IA / 25% Runway), el hito financiero que desbloquea y cierra con dos alternativas positivas?

- [ ] **2. Control Estricto de Tiempo:**
  - [ ] Ensayo a reloj en mano con un compañero de squad: **Duración entre 02:45 y 03:00 minutos**. Si supera los 3:00 min, recorta adjetivos y detalles innecesarios.

- [ ] **3. Los 3 Pilares del Relato (Sepúlveda):**
  - [ ] **Deseable:** ¿La audiencia siente urgencia por usar la herramienta?
  - [ ] **Irrefutable:** ¿Está respaldado por tu app funcionando en vivo y números reales?
  - [ ] **Replicable:** ¿Cualquier compañero podría explicárselo a otra persona al terminar la clase?

---

## 🎓 FASE 3: GRADUACIÓN & CERTIFICACIÓN ADMINISTRATIVA

- [ ] **1. Presentación en Vivo (Demo Day):**
  - [ ] Pitch ejecutado en los 3:00 minutos.
  - [ ] Al menos dos preguntas de Q&A respondidas con solvencia técnica y financiera.

- [ ] **2. Entregable Mandatorio: Quiz Final de Cierre (`javiermujica.com/quiz`):**
  - [ ] Ingresar a [https://www.javiermujica.com/quiz](https://www.javiermujica.com/quiz).
  - [ ] Registrar nombre formal del proyecto, squad y la **URL pública de tu proyecto** (en producción o enlace de tu prototipo actual).
  - [ ] Completar la reflexión de aprendizajes y evaluación NPS.
  - [ ] **Paso 1 — Certificado Preliminar Inmediato:** Al enviar el formulario, el sistema genera y descarga automáticamente en tu navegador tu **Certificado Preliminar de Participación en PDF** (cerrando tu ciclo formal).
  - [ ] **Paso 2 — Certificación Oficial con QR e ID Único:** Una vez que tu squad envíe el prototipo funcional terminado y sea revisado y validado por Javier en producción, se activará tu **página pública de confirmación oficial con código QR, ID único y link directo a tu MVP**.

---

## 📖 GLOSARIO RÁPIDO PARA EL CHECKLIST

| Sigla | Significado | ¿Por qué es clave en este checklist? |
| :--- | :--- | :--- |
| **SSL / HTTPS** | Protocolo de cifrado seguro | Evita que los navegadores muestren la advertencia roja de "Sitio no seguro". |
| **DNS** | Sistema de nombres de dominio | Conecta tu nombre comercial con los servidores de Vercel. |
| **Connection Pooling** | Administrador de conexiones de base de datos | Evita que Supabase rechace peticiones cuando varios usuarios entran al mismo tiempo. |
| **CORS** | Seguridad de origen cruzado | Permite que tu frontend acceda a las imágenes y PDFs alojados en Cloudflare R2 sin bloqueos de red. |
| **TAM** | *Total Addressable Market* | Tamaño del mercado total al que aspira tu startup en dólares. |
| **NPS** | *Net Promoter Score* | Métrica de lealtad y satisfacción que evalúa tu experiencia en el bootcamp. |
| **Q&A** | *Questions and Answers* | Preguntas y respuestas posteriores a tu presentación. |
