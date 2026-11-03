import fs from "fs"
import path from "path"

// Cache base64 encoded assets in memory to avoid repeated filesystem reads
let cachedLogoBase64: string | null = null
let cachedSignatureBase64: string | null = null

function getLogoBase64(): string {
  if (cachedLogoBase64) return cachedLogoBase64
  try {
    const fullPath = path.join(process.cwd(), "public", "images", "vibecode-logo-full.png")
    const altPath = path.join(process.cwd(), "public", "images", "vibecode-logo.png")
    const targetPath = fs.existsSync(fullPath) ? fullPath : altPath
    if (fs.existsSync(targetPath)) {
      cachedLogoBase64 = "data:image/png;base64," + fs.readFileSync(targetPath).toString("base64")
      return cachedLogoBase64
    }
  } catch (err) {
    console.warn("Could not load logo image for diploma:", err)
  }
  return ""
}

function getSignatureBase64(): string {
  if (cachedSignatureBase64) return cachedSignatureBase64
  try {
    const sigPath = path.join(process.cwd(), "public", "images", "firma_javier_mujica.png")
    if (fs.existsSync(sigPath)) {
      cachedSignatureBase64 = "data:image/png;base64," + fs.readFileSync(sigPath).toString("base64")
      return cachedSignatureBase64
    }
  } catch (err) {
    console.warn("Could not load signature image for diploma:", err)
  }
  return ""
}

export interface DiplomaOptions {
  studentName?: string
  courseName?: string
  completionDate?: string
  instructorName?: string
  instructorTitle?: string
  institution?: string
  certificateId?: string
  hours?: string
  skills?: string
  qrCodeDataUrl?: string | null
  showToolbar?: boolean
  autoPrint?: boolean
}

export function generateDiplomaHtml(options: DiplomaOptions = {}): string {
  const isSqr = Boolean(options.certificateId && options.certificateId.trim().toUpperCase().startsWith("SQR-"))
  const {
    studentName = "NOMBRE Y APELLIDO DEL ALUMNO",
    courseName = isSqr
      ? "Código & Capital: La Biblia de los Squads Ágiles · VibeCode Lab"
      : "Vibecode Lab: De Cero a SaaS con IA",
    completionDate = "Octubre 2026",
    instructorName = "Javier Mujica",
    instructorTitle = "Fundador & Lead Mentor · Vibecode Lab",
    institution = "Mujica AI Lab SpA",
    certificateId = "VBC-2026-001",
    hours = isSqr
      ? "Examen de Dominio Editorial Aprobado: Arquitectura en Producción, Pitch 180s, Unit Economics & SAFEs"
      : "35 Horas Cronológicas (2,5 hrs de clases y 2,5 hrs de ejecución propia y en equipos por semana)",
    skills = isSqr
      ? "Supabase Pooler 6543 & RLS · Webhooks Idempotentes HMAC-SHA256 · Cloudflare R2 Zero-Egress · Power Pitch 180s (6 Escenas) · Unit Economics (LTV/CAC > 3x, NRR > 110%) · Post-Money SAFE & Defensa de Cap Table"
      : "Google Antigravity · Next.js (App Router) · Supabase PostgreSQL & RLS · Google Gemini AI · Cloudflare (DNS & Bucket R2) · Mercado Pago & Webhooks · Resend · PostHog Analytics · Vercel & GitHub",
    qrCodeDataUrl = null,
    showToolbar = true,
    autoPrint = false,
  } = options

  const logoBase64 = getLogoBase64()
  const sigBase64 = getSignatureBase64()

  const skillsList = skills.split("·").map((s) => s.trim())
  const skillsBadgesHtml = skillsList.map((s) => `<span class="skill-pill">${s}</span>`).join(" ")

  const safeName = studentName && studentName.trim() ? studentName.trim() : "&nbsp;"
  const safeId = certificateId && certificateId.trim() ? `ID: ${certificateId.trim()}` : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  const topTechBadgeText = isSqr ? "DOMINIO EDITORIAL · SQR" : "CERTIFICACIÓN OFICIAL"
  const mainHeadingText = isSqr ? "CERTIFICADO DE DOMINIO & SQUAD READINESS" : "DIPLOMA DE PARTICIPACIÓN"
  const navBadgeText = isSqr ? "Unicorn Squad Bible · Certificado Oficial SQR" : "Generación 1 · Diploma Oficial"
  const statementHtml = isSqr
    ? `Por haber aprobado satisfactoriamente la evaluación de dominio conceptual, técnico y financiero de <strong class="course-highlight">${courseName}</strong>, acreditando el manejo de los pilares de arquitectura en producción, dramaturgia escénica de 180 segundos, Unit Economics SaaS e ingeniería de capital de riesgo, emitido por <strong>${institution}</strong>.`
    : `Por haber completado con éxito todas las sesiones prácticas, retos de implementación y desarrollo integral de software asistido por Inteligencia Artificial en el programa intensivo <strong class="course-highlight">${courseName}</strong>, impartido por <strong>${institution}</strong>.`

  const centerElementHtml = qrCodeDataUrl
    ? `
      <div class="seal-center">
        <div style="background: rgba(255,255,255,0.08); padding: 4px; border-radius: 8px; border: 1.5px solid rgba(66, 133, 244, 0.5); box-shadow: 0 0 16px rgba(66, 133, 244, 0.3);">
          <img src="${qrCodeDataUrl}" alt="QR Verificación" style="width: 44px; height: 44px; display: block; border-radius: 4px;" />
        </div>
        <div class="seal-caption">VERIFICAR QR</div>
      </div>
    `
    : `
      <div class="seal-center">
        <div class="security-seal">
          <svg class="seal-svg" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <div class="seal-caption">VIBECODE VERIFIED</div>
      </div>
    `

  const toolbarHtml = showToolbar
    ? `
    <nav class="no-print top-nav-bar">
      <div class="nav-left">
        <a href="${isSqr ? "/ebook-quiz" : "/vibecodelab"}" class="nav-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          ${isSqr ? "Volver al Examen Editorial" : "Plataforma Vibecode"}
        </a>
        <span class="nav-badge">${navBadgeText}</span>
      </div>
      <div class="nav-right">
        ${
          isSqr
            ? `<a href="/vibecode?utm_source=diploma_sqr&utm_campaign=unicorn_bible" class="nav-back-btn" style="color: #34d399; border-color: rgba(52,211,153,0.4); background: rgba(16,185,129,0.12);">
                 🚀 Implementar en Comunidad VibeCode Lab
               </a>`
            : ""
        }
        <a href="/verify/${certificateId.trim()}" class="nav-back-btn" style="color: #38bdf8; border-color: rgba(56,189,248,0.3);">
          Verificar Pública
        </a>
        <button onclick="window.print()" class="nav-print-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Descargar PDF / Imprimir
        </button>
      </div>
    </nav>
    `
    : ""

  const autoPrintScript = autoPrint
    ? `
    <script>
      window.addEventListener('load', function() {
        // Small delay to ensure web fonts (Geist) are loaded before print
        setTimeout(function() {
          window.print();
        }, 600);
      });
    </script>
    `
    : ""

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Diploma de Participación - ${safeName} | Vibecode Lab</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600;700&display=swap');

  @page {
    size: A4 landscape;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background-color: #040814;
    color: #F8FAFC;
    font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Toolbar styling */
  .top-nav-bar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: rgba(4, 8, 20, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 24px;
    width: 100%;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nav-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.2s ease;
  }

  .nav-back-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .nav-badge {
    font-size: 12px;
    color: #a78bfa;
    font-family: 'Geist Mono', monospace;
    font-weight: 500;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-print-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #4285F4 0%, #9B72F8 50%, #EC4899 100%);
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(66, 133, 244, 0.35);
    transition: all 0.2s ease;
  }

  .nav-print-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(66, 133, 244, 0.5);
  }

  /* Screen presentation stage */
  @media screen {
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 40px;
      overflow-x: hidden;
    }
    .diploma-stage {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 1140px;
      padding: 0 16px;
    }
    .certificate-wrapper {
      position: relative;
      width: 100% !important;
      max-width: 1120px !important;
      aspect-ratio: 297 / 210;
      min-height: auto;
      padding: 9mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 50% 15%, #0f1c3f 0%, #060b1b 50%, #040814 100%);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(66, 133, 244, 0.15);
      border-radius: 16px;
    }
  }

  /* Print presentation stage */
  @media print {
    .no-print {
      display: none !important;
    }
    html, body {
      width: 297mm !important;
      height: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #040814 !important;
    }
    .diploma-stage {
      width: 297mm !important;
      height: 210mm !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .certificate-wrapper {
      position: relative;
      width: 297mm !important;
      height: 210mm !important;
      padding: 9mm !important;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 50% 15%, #0f1c3f 0%, #060b1b 50%, #040814 100%) !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
  }

  /* Outer glowing border with Vibe AI Gradient */
  .outer-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 14px;
    padding: 2px;
    background: linear-gradient(135deg, #4285F4 0%, #9B72F8 35%, #EC4899 70%, #F97316 100%);
    box-shadow: 0 0 35px rgba(66, 133, 244, 0.22);
  }

  .inner-container {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background-color: #040814;
    background-image: 
      radial-gradient(rgba(66, 133, 244, 0.12) 1.2px, transparent 1.2px),
      linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    background-size: 20px 20px, 40px 40px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 9mm 14mm 8mm 14mm;
    overflow: hidden;
  }

  /* Ambient glow spheres */
  .glow-top-left {
    position: absolute;
    top: -50px;
    left: -50px;
    width: 260px;
    height: 260px;
    background: radial-gradient(circle, rgba(66, 133, 244, 0.22) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(30px);
    pointer-events: none;
  }

  .glow-top-right {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(155, 114, 248, 0.18) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(28px);
    pointer-events: none;
  }

  .glow-bottom-right {
    position: absolute;
    bottom: -60px;
    right: -60px;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, rgba(249, 115, 22, 0.15) 50%, transparent 70%);
    border-radius: 50%;
    filter: blur(35px);
    pointer-events: none;
  }

  /* Corner brackets */
  .corner {
    position: absolute;
    width: 22px;
    height: 22px;
    border-color: #3b82f6;
    opacity: 0.85;
  }
  .corner-tl { top: 12px; left: 12px; border-top: 2.5px solid; border-left: 2.5px solid; }
  .corner-tr { top: 12px; right: 12px; border-top: 2.5px solid; border-right: 2.5px solid; }
  .corner-bl { bottom: 12px; left: 12px; border-bottom: 2.5px solid; border-left: 2.5px solid; }
  .corner-br { bottom: 12px; right: 12px; border-bottom: 2.5px solid; border-right: 2.5px solid; }

  /* Top Bar */
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .brand-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(66, 133, 244, 0.35));
  }

  .badge-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .tech-badge {
    font-family: 'Geist Mono', monospace;
    font-size: 8pt;
    font-weight: 600;
    padding: 3.5px 11px;
    border-radius: 20px;
    background: rgba(66, 133, 244, 0.15);
    border: 1px solid rgba(66, 133, 244, 0.45);
    color: #93c5fd;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .cert-id {
    font-family: 'Geist Mono', monospace;
    font-size: 8pt;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.04);
    padding: 3px 9px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    letter-spacing: 0.5px;
  }

  /* Main Body */
  .main-content {
    text-align: center;
    position: relative;
    z-index: 2;
    margin-top: 2px;
    margin-bottom: 2px;
  }

  .pre-title {
    font-family: 'Geist Mono', monospace;
    font-size: 9pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 3.5px;
    color: #94a3b8;
    margin-bottom: 4px;
  }

  .pre-title span.cursor {
    color: #3b82f6;
    font-weight: 800;
  }

  .main-title {
    font-size: 27pt;
    font-weight: 900;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #ffffff;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    margin-bottom: 6px;
    line-height: 1.1;
  }

  .presented-to {
    font-size: 9.5pt;
    font-weight: 500;
    color: #94a3b8;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .student-name {
    font-size: 26pt;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    position: relative;
    display: inline-block;
    padding: 0 20px;
    min-height: 38pt;
    line-height: 1.1;
    text-shadow: 0 0 20px rgba(66, 133, 244, 0.35);
  }

  .student-name-border {
    width: 150mm;
    height: 2px;
    margin: 0 auto 10px auto;
    background: linear-gradient(90deg, transparent 0%, #4285F4 20%, #9B72F8 45%, #EC4899 75%, #F97316 90%, transparent 100%);
  }

  .statement {
    font-size: 10.2pt;
    line-height: 1.48;
    color: #cbd5e1;
    max-width: 228mm;
    margin: 0 auto 11px auto;
  }

  .statement strong {
    color: #ffffff;
    font-weight: 600;
  }

  .course-highlight {
    color: #60a5fa;
    font-weight: 700;
  }

  /* Skills Pills */
  .skills-box {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 7px;
    max-width: 240mm;
    margin: 0 auto;
  }

  .skill-pill {
    font-family: 'Geist Mono', monospace;
    font-size: 7.5pt;
    font-weight: 500;
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(59, 130, 246, 0.35);
    color: #93c5fd;
    padding: 3px 9px;
    border-radius: 5px;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }

  /* Footer & Signatures */
  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    position: relative;
    z-index: 2;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .meta-col {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 3.5px;
    min-width: 65mm;
  }

  .meta-item {
    font-size: 7.8pt;
    color: #64748b;
  }

  .meta-item strong {
    color: #cbd5e1;
    font-family: 'Geist Mono', monospace;
    font-weight: 600;
  }

  .meta-status {
    color: #34d399 !important;
  }

  /* Seal in center */
  .seal-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .security-seal {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1.5px solid rgba(59, 130, 246, 0.5);
    background: radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(4, 8, 20, 0.95) 75%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    position: relative;
  }

  .seal-svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: #60a5fa;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .seal-caption {
    font-family: 'Geist Mono', monospace;
    font-size: 6.5pt;
    font-weight: 600;
    color: #94a3b8;
    margin-top: 4px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  /* Signature Block with Real Signature Image */
  .signature-block {
    text-align: center;
    min-width: 70mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .signature-img-wrapper {
    height: 70px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: -10px;
  }

  .signature-img {
    height: 80px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(147, 197, 253, 0.55));
  }

  .signature-line {
    width: 65mm;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), #94a3b8, rgba(59, 130, 246, 0.5), transparent);
    margin-bottom: 5px;
  }

  .instructor-name {
    font-size: 9.5pt;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: 0.5px;
  }

  .instructor-title {
    font-size: 7.2pt;
    color: #94a3b8;
    letter-spacing: 0.2px;
    margin-top: 1px;
  }

  .institution-name {
    font-size: 6.8pt;
    color: #64748b;
    font-family: 'Geist Mono', monospace;
    margin-top: 2px;
  }
</style>
</head>
<body>

${toolbarHtml}

<div class="diploma-stage">
  <div class="certificate-wrapper">
    <div class="outer-frame">
      <div class="inner-container">
        <!-- Ambient Glows -->
        <div class="glow-top-left"></div>
        <div class="glow-top-right"></div>
        <div class="glow-bottom-right"></div>

        <!-- Corners -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <!-- Header -->
        <div class="top-bar">
          <div class="brand-block">
            ${logoBase64 ? `<img class="brand-logo" src="${logoBase64}" alt="Vibecode Lab" />` : `<strong style="font-size: 16px; letter-spacing: 1px;">VIBECODE LAB</strong>`}
          </div>
          <div class="badge-container">
            <span class="tech-badge">${topTechBadgeText}</span>
            <span class="cert-id">${safeId}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="main-content">
          <div class="pre-title">&lt; CERTIFICADO DE ACREDITACIÓN <span class="cursor">_</span> &gt;</div>
          <h1 class="main-title">${mainHeadingText}</h1>
          <div class="presented-to">Concedido a</div>
          
          <div class="student-name">${safeName}</div>
          <div class="student-name-border"></div>

          <p class="statement">
            ${statementHtml}
          </p>

          <!-- Skills stack -->
          <div class="skills-box">
            ${skillsBadgesHtml}
          </div>
        </div>

        <!-- Footer / Metadata & Signature -->
        <div class="footer-section">
          <div class="meta-col">
            <div class="meta-item"><strong>INTENSIDAD:</strong> ${hours}</div>
            <div class="meta-item"><strong>EMISIÓN:</strong> ${completionDate}</div>
            <div class="meta-item"><strong>ESTADO:</strong> <strong class="meta-status">Verificado & Aprobado ✓</strong></div>
          </div>

          ${centerElementHtml}

          <div class="signature-block">
            <div class="signature-img-wrapper">
              ${sigBase64 ? `<img class="signature-img" src="${sigBase64}" alt="${instructorName}" />` : `<div style="height: 50px;"></div>`}
            </div>
            <div class="signature-line"></div>
            <div class="instructor-name">${instructorName}</div>
            <div class="instructor-title">${instructorTitle}</div>
            <div class="institution-name">${institution}</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

${autoPrintScript}

</body>
</html>
`
}
