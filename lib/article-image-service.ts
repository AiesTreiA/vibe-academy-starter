import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2-client"

interface ImageGenerationOptions {
  title: string
  keyword: string
  category?: string
  subtitle?: string
  slug?: string
}

interface ImageResult {
  url: string
  source: "stock" | "fallback"
  alt: string
  photographer?: string
}

interface StockPhotoItem {
  id: string
  url: string
  alt: string
  photographer: string
  tags: string[]
}

/**
 * Curated registry of verified, high-resolution (1200x630+), landscape editorial photography
 * with Open License (Unsplash License / CC0 - free commercial and editorial usage).
 */
const OPEN_STOCK_REGISTRY: Record<string, StockPhotoItem[]> = {
  "ai-coding": [
    {
      id: "photo-1571171637578-41bc2dd41cd2",
      url: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Estación de trabajo con teclado mecánico y múltiples monitores con código en modo oscuro",
      photographer: "Florian Olivo (Unsplash)",
      tags: ["código", "software", "programación", "developer", "vibecoding", "ia vs", "desarrollo", "monitores", "pantallas"]
    },
    {
      id: "photo-1605379399642-870262d3d051",
      url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Espacio de trabajo moderno con monitor panorámico e IDE de desarrollo",
      photographer: "Unsplash Contributor (Unsplash)",
      tags: ["workspace", "software", "código", "ingeniería", "desarrollo", "setup", "programador"]
    },
    {
      id: "photo-1555066931-4365d14bab8c",
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Líneas de código estructurado y desarrollo de software moderno",
      photographer: "Fotis Fotopoulos (Unsplash)",
      tags: ["código", "software", "programación", "desarrollo", "algoritmos"]
    },
    {
      id: "photo-1587620962725-abab7fe55159",
      url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Laptop con editor de código abierto en un escritorio minimalista",
      photographer: "Unsplash Contributor (Unsplash)",
      tags: ["laptop", "código", "editor", "javascript", "desarrollo"]
    },
    {
      id: "photo-1550751827-4bd374c3f58b",
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Circuitos electrónicos luminosos y arquitectura digital de inteligencia artificial",
      photographer: "Unsplash Contributor (Unsplash)",
      tags: ["ia", "neuronal", "arquitectura", "red", "tecnología", "futuro"]
    },
    {
      id: "photo-1517694712202-14dd9538aa97",
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Desarrollador programando en laptop con interfaz oscura",
      photographer: "Clément Hélardot (Unsplash)",
      tags: ["laptop", "programador", "interfaz", "frontend", "backend"]
    }
  ],
  "cloud-serverless": [
    {
      id: "photo-1558494949-ef010cbdcc31",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Racks de servidores en centro de datos de computación en la nube",
      photographer: "Jordan Harrison (Unsplash)",
      tags: ["cloud", "servidores", "serverless", "datacenter", "infraestructura"]
    },
    {
      id: "photo-1451187580459-43490279c0fa",
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Red de telecomunicaciones global y conectividad satelital en la nube",
      photographer: "NASA / Unsplash",
      tags: ["global", "red", "nube", "saas", "distribuido"]
    },
    {
      id: "photo-1527689368864-3a821dbccc34",
      url: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Estación de trabajo minimalista para arquitectura de micro-SaaS",
      photographer: "Grovemade (Unsplash)",
      tags: ["micro-saas", "startup", "arquitectura", "despliegue"]
    }
  ],
  "cybersecurity": [
    {
      id: "photo-1526374965328-7f61d4dc18c5",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Flujo de código criptográfico y matriz de protección de datos",
      photographer: "Markus Spiske (Unsplash)",
      tags: ["ciberseguridad", "código", "matriz", "encriptación", "seguridad"]
    },
    {
      id: "photo-1563986768609-322da13575f3",
      url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Protección perimetral de claves API y resguardo contra ciberataques",
      photographer: "FlyD (Unsplash)",
      tags: ["keys", "api", "candado", "protección", "inyección"]
    }
  ],
  "lean-productivity": [
    {
      id: "photo-1552664730-d307ca884978",
      url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Equipo multidisciplinario planificando sprint y procesos ágiles",
      photographer: "Annie Spratt (Unsplash)",
      tags: ["lean", "procesos", "productividad", "sprint", "equipo", "agilidad"]
    },
    {
      id: "photo-1531482615713-2afd69097998",
      url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Reunión de estrategia corporativa y optimización de flujos de trabajo",
      photographer: "Mapbox (Unsplash)",
      tags: ["estrategia", "reunión", "flujo", "optimización"]
    },
    {
      id: "photo-1522071820081-009f0129c71c",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Colaboración estrecha en equipo startup frente a computadoras portátiles",
      photographer: "Annie Spratt (Unsplash)",
      tags: ["colaboración", "startup", "talento", "empresa"]
    }
  ],
  "therapy-psychology": [
    {
      id: "photo-1544717305-2782549b5136",
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Consulta profesional cálida con enfoque terapéutico empático",
      photographer: "Total Shape (Unsplash)",
      tags: ["terapeuta", "psicólogo", "empatía", "salud", "consulta", "humano"]
    },
    {
      id: "photo-1573497620053-ea5300f94f21",
      url: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Espacio de orientación personalizada y escucha activa",
      photographer: "LinkedIn Sales Solutions (Unsplash)",
      tags: ["orientación", "escucha", "psicología", "personalizado"]
    }
  ],
  "analytics-gtm": [
    {
      id: "photo-1551288049-bebda4e38f71",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Tablero de métricas digitales, análisis de conversión y gráficos de crecimiento",
      photographer: "Luke Chesser (Unsplash)",
      tags: ["métricas", "analytics", "gtm", "crecimiento", "conversión", "datos"]
    },
    {
      id: "photo-1460925895917-afdab827c52f",
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Estrategia de posicionamiento web, SEO orgánico y marketing de rendimiento",
      photographer: "Carlos Muza (Unsplash)",
      tags: ["seo", "posicionamiento", "marketing", "visibilidad"]
    },
    {
      id: "photo-1531403009284-440f080d1e12",
      url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Prototipado de software y experiencia de usuario (UX) para nuevo producto SaaS",
      photographer: "Theme Photos (Unsplash)",
      tags: ["saas", "ux", "producto", "fde", "lanzamiento"]
    }
  ],
  "chatbots-automation": [
    {
      id: "photo-1516321318423-f06f85e504b3",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Canales digitales de comunicación y automatización de mensajería con clientes",
      photographer: "Priscilla Du Preez 🇨🇦 (Unsplash)",
      tags: ["chatbot", "bot", "ventas", "mensajería", "automatización"]
    },
    {
      id: "photo-1618005182384-a83a8bd57fbe",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=85",
      alt: "Ondas digitales abstractas y redes neuronales en movimiento",
      photographer: "Milad Fakurian (Unsplash)",
      tags: ["ia", "neuronal", "futuro", "agentes", "innovación"]
    }
  ]
};

async function uploadToR2(imageBuffer: Buffer, slug: string, contentType: string = "image/jpeg"): Promise<string | null> {
  if (!R2_BUCKET || !R2_PUBLIC_URL || !process.env.R2_ACCOUNT_ID) {
    console.warn("⚠️ R2 credentials not fully configured, skipping R2 upload");
    return null;
  }

  try {
    const cleanSlug = (slug || `article-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-_]/g, "");
    const timestamp = Date.now();
    const versionedKey = `articles/${cleanSlug}-hero-${timestamp}.jpg`;
    const defaultKey = `articles/${cleanSlug}-hero.jpg`;

    // 1. Upload versioned key (bypasses browser and CDN immutable cache)
    const commandVersioned = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: versionedKey,
      Body: imageBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable"
    });
    await r2Client.send(commandVersioned);

    // 2. Overwrite default key for backwards compatibility
    const commandDefault = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: defaultKey,
      Body: imageBuffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable"
    });
    await r2Client.send(commandDefault);

    const publicUrl = `${R2_PUBLIC_URL}/${versionedKey}`;
    console.log("✅ Image successfully persisted to R2 (versioned):", publicUrl);
    return publicUrl;
  } catch (err: any) {
    console.error("❌ Failed to upload image to R2:", err.message);
    return null;
  }
}

async function searchUnsplashOfficialApi(query: string): Promise<{ url: string; alt: string; photographer: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;
    const res = await fetch(endpoint, {
      headers: {
        "Authorization": `Client-ID ${accessKey}`,
        "Accept-Version": "v1"
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return null;

    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    const photo = results[0];
    return {
      url: `${photo.urls.raw || photo.urls.regular}&auto=format&fit=crop&w=1200&h=630&q=85`,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user?.name ? `${photo.user.name} (@${photo.user.username})` : "Unsplash"
    };
  } catch (err: any) {
    console.warn("⚠️ Official Unsplash API search failed:", err.message);
    return null;
  }
}

function findBestCategoryKey(title: string, keyword: string, category?: string): string {
  const text = `${title} ${keyword} ${category || ""}`.toLowerCase();

  if (text.includes("psicolog") || text.includes("terapeut") || text.includes("salud mental") || text.includes("empat")) {
    return "therapy-psychology";
  }
  if (text.includes("ciberseguridad") || text.includes("seguridad") || text.includes("keys") || text.includes("inyeccion") || text.includes("ataque")) {
    return "cybersecurity";
  }
  if (text.includes("lean") || text.includes("proceso") || text.includes("productividad") || text.includes("sprint") || text.includes("equipo")) {
    return "lean-productivity";
  }
  if (text.includes("serverless") || text.includes("micro-saas") || text.includes("cloud") || text.includes("infraestructura") || text.includes("nube")) {
    return "cloud-serverless";
  }
  if (text.includes("chatbot") || text.includes("bot") || text.includes("whatsapp") || text.includes("conversacional")) {
    return "chatbots-automation";
  }
  if (text.includes("gtm") || text.includes("ventas") || text.includes("saas") || text.includes("metrica") || text.includes("seo") || text.includes("posicionamiento")) {
    return "analytics-gtm";
  }
  
  return "ai-coding";
}

export async function generateOrFetchArticleImage(options: ImageGenerationOptions): Promise<ImageResult> {
  const { title, keyword, category = "automatizacion", slug = "article" } = options;
  console.log(`📸 Sourcing open-license editorial stock photo for: "${title}" (${keyword})`);

  // 1. Try official Unsplash API if key is available
  const officialResult = await searchUnsplashOfficialApi(`${keyword} ${title}`);
  let chosenUrl = officialResult?.url;
  let chosenAlt = officialResult?.alt || title;
  let chosenPhotographer = officialResult?.photographer || "Unsplash";

  // 2. Curated Open License Stock Registry
  if (!chosenUrl) {
    const catKey = findBestCategoryKey(title, keyword, category);
    const photoList = OPEN_STOCK_REGISTRY[catKey] || OPEN_STOCK_REGISTRY["ai-coding"];

    const searchText = `${title} ${keyword} ${slug}`.toLowerCase();
    let bestPhoto = photoList[0];
    let maxScore = -1;

    for (const item of photoList) {
      let score = 0;
      for (const tag of item.tags) {
        if (searchText.includes(tag.toLowerCase())) {
          score += 2;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestPhoto = item;
      }
    }

    let photoItem = bestPhoto;
    if (maxScore <= 0) {
      let hash = 0;
      for (let i = 0; i < slug.length; i++) {
        hash = (hash << 5) - hash + slug.charCodeAt(i);
        hash |= 0;
      }
      photoItem = photoList[Math.abs(hash) % photoList.length];
    }

    chosenUrl = photoItem.url;
    chosenAlt = `${photoItem.alt} - ${title}`;
    chosenPhotographer = photoItem.photographer;
    console.log(`✅ Selected curated stock photo [${photoItem.id}] for category "${catKey}" (score: ${maxScore}):`, chosenUrl);
  }

  // 3. Download image and persist to user Cloudflare R2 CDN
  try {
    console.log("🚀 Downloading stock image to persist into Cloudflare R2 CDN...");
    const imgRes = await fetch(chosenUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (imgRes.ok) {
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const r2Url = await uploadToR2(buffer, slug, "image/jpeg");

      if (r2Url) {
        return {
          url: r2Url,
          source: "stock",
          alt: chosenAlt,
          photographer: chosenPhotographer
        };
      }
    }
  } catch (err: any) {
    console.warn("⚠️ Failed persisting stock photo to R2, falling back to direct CDN URL:", err.message);
  }

  return {
    url: chosenUrl,
    source: "stock",
    alt: chosenAlt,
    photographer: chosenPhotographer
  };
}
