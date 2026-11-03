# CÓDIGO & CAPITAL: La Biblia de los Squads Ágiles para Escalar SaaS y Levantar Capital en Tiempo Récord
### Tetralogía Editorial Oficial · Metodología VibeCode Lab de Javier Mujica

> **EL MANIFIESTO DE LA BIBLIA ÁGIL:**
> "El viejo Venture Capital murió. Durante veinte años te mintieron diciendo que para levantar capital necesitabas pasar seis meses diseñando un PowerPoint, quemar miles de dólares en agencias lentas y rogar por reuniones tomando café con inversionistas.
>
> Bienvenido a la era del **Vibe Coding y el Capital de Alta Velocidad**. Hoy, los equipos y *Squads* más ágiles del planeta no piden permiso ni levantan rondas con promesas vacías: despliegan arquitecturas serverless en producción en semanas, procesan pagos reales en vivo, automatizan su foso defensivo con agentes de IA y se sientan frente a CORFO, Ángeles y VCs con tracción irrefutable.
>
> Esta tetralogía no es un libro de lectura pasiva; es **La Biblia Operativa del Squad Moderno**. Es la metodología de levantamiento de capital para startups tecnológicas más ágil creada en la historia: un sistema diseñado para que equipos pequeños de alto rendimiento pasen de *localhost* a una valoración de Unicornio (\$1.000M+ USD) dominando el código, la dramaturgia escénica, los *unit economics* y la ingeniería financiera sin ceder el control de su compañía."

---

## Estructura de la Tetralogía (`/ebooks-manuscripts/`)

| Tomo | Archivo Manuscrito | Título Oficial | Color de Acento | Ruta Corta QR |
|---|---|---|---|---|
| **Tomo I** | [`vol-1-de-localhost-a-produccion.md`](./vol-1-de-localhost-a-produccion.md) | *De Localhost a Producción: Arquitectura SaaS Inquebrantable para Founders que Buscan Inversión* | **Azul Eléctrico** (`#3B82F6`) | `https://www.javiermujica.com/go/1` |
| **Tomo II** | [`vol-2-el-pitch-irrefutable.md`](./vol-2-el-pitch-irrefutable.md) | *El Pitch Irrefutable: Dramaturgia Escénica y Cierre de Capital en 180 Segundos* | **Púrpura Escenario** (`#9B72F8`) | `https://www.javiermujica.com/go/2` |
| **Tomo III** | [`vol-3-metricas-que-mueven-la-aguja.md`](./vol-3-metricas-que-mueven-la-aguja.md) | *Métricas que Mueven la Aguja: Unit Economics para Sobrevivir al Valle de la Muerte* | **Esmeralda Métricas** (`#10B981`) | `https://www.javiermujica.com/go/3` |
| **Tomo IV** | [`vol-4-la-escalera-al-unicornio.md`](./vol-4-la-escalera-al-unicornio.md) | *La Escalera al Unicornio: De Subsidios CORFO y SAFEs a Rondas Institucionales* | **Naranja Solar** (`#F97316`) | `https://www.javiermujica.com/go/4` |

### Archivos Compartidos (`_shared/`)
- [`_shared/glosario.md`](./_shared/glosario.md): Definiciones tácticas de términos de ingeniería, producto, *unit economics* y *venture capital*.
- [`_shared/fuentes.md`](./_shared/fuentes.md): Fuentes técnicas, financieras, regulatorias y atribuciones metodológicas verificables por tomo.

---

## Integración con el Ecosistema Web (`javiermujica.com`)

Cada tomo culmina con un **Código QR Dinámico** pregenerado en `/public/ebooks/qr/vol-{1..4}.{svg,png}` y servido en tiempo real por `/api/qr?vol={1..4}`.
Al escanear el código QR desde Kindle, iPad, móvil o edición impresa:
1. El lector ingresa a `/go/[vol]`, que registra el evento de telemetría sin PII en `ebook_qr_scans` y redirige a:
   `https://www.javiermujica.com/ebook-quiz?source=ebook&vol=[1|2|3|4]&utm_campaign=unicorn_bible`
2. El **Examen Interactivo de Lectura (`/ebook-quiz`)** permite evaluar los conceptos específicos de cada tomo (o rendir el Examen Maestro de 16 preguntas de la Tetralogía Completa), entregando cápsulas pedagógicas instantáneas con referencia exacta al capítulo correspondiente.
3. Al aprobar ($\ge 75\%$), el sistema emite automáticamente el certificado público **`SQR-2026-XXX`** (*Squad Readiness & Dominio Editorial*), descargable en `/api/quiz/diploma?id=SQR-2026-XXX` y verificable en `https://www.javiermujica.com/verify/[id]`, e invita al lector a acelerar su proceso implementando su SaaS dentro de la **Comunidad de VibeCode Lab (`/vibecode`)**.

---

## Exportación a EPUB / PDF / Kindle (Pandoc)

Para compilar cualquiera de los tomos a EPUB3 o PDF de imprenta:

```bash
# Exportar Tomo I a EPUB3
pandoc ebooks-manuscripts/vol-1-de-localhost-a-produccion.md \
  -o public/ebooks/vol-1-de-localhost-a-produccion.epub \
  --toc --toc-depth=2 --metadata lang=es-CL

# Exportar los 4 Tomos unificados
pandoc \
  ebooks-manuscripts/vol-1-de-localhost-a-produccion.md \
  ebooks-manuscripts/vol-2-el-pitch-irrefutable.md \
  ebooks-manuscripts/vol-3-metricas-que-mueven-la-aguja.md \
  ebooks-manuscripts/vol-4-la-escalera-al-unicornio.md \
  -o public/ebooks/codigo-y-capital-tetralogia-completa.epub \
  --toc --toc-depth=2
```

---

## Descargo Editorial, Financiero y de Propiedad Intelectual

1. **Propósito Educativo:** Todo el contenido técnico, financiero, tributario y societario de esta obra tiene fines exclusivamente educativos y estratégicos. No constituye asesoría legal, contable, tributaria ni recomendación de inversión de valores.
2. **Atribución Metodológica (Tomo II):** El marco dramático **Power Pitch Method®** citado en el Tomo II es propiedad intelectual y autoría de **Héctor Sepúlveda Velásquez**. Su inclusión en esta obra se realiza con reconocimiento explícito a su autor original, adaptando sus principios escénicos al contexto específico de demostraciones técnicas de productos SaaS e Inteligencia Artificial bajo la metodología de **VibeCode Lab**.
3. **Vigencia de Convocatorias y Parámetros Técnicos:** Los montos de subsidios públicos (CORFO Semilla Inicia, Semilla Expande, Start-Up Chile), tasas impositivas y parámetros de red están documentados con corte a 2026; verifica siempre las bases vigentes de cada convocatoria oficial antes de postular.
