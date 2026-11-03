# ⚡ Vibe Academy Starter — Open-Source Skool & Kajabi Alternative (Next.js 16 + Cloudflare R2 + Multi-AI)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAiesTreiA%2Fvibe-academy-starter)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-%240_Egress-F38020?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-indigo)

> **Self-hosted Personal Brand, LMS Academy & Multi-Model AI Chatbot Suite** created by **[Javier Mujica](https://www.javiermujica.com)** (*Vibecode Lab*).  
> Stop paying **$99–$399/mo** to Skool, Kajabi, or Teachable and **5–10% transaction fees**. Host your own academy with **$0 video egress fees** on Cloudflare R2.

---

## 🌍 English & Español Overview

- **🎥 $0 Egress Video Streaming**: Multipart uploader + HTML5/HLS player powered by **Cloudflare R2** with clickable timestamps, slide decks, errata notes, and downloadable resources.
- **🎓 Student Portal (`/vibecodelab`)**: Lesson progress tracking, 1-on-1 mentorship booking, and a built-in **Pitch & Match** founder community.
- **🤖 Multi-Provider AI Agent (`/api/chat`)**: Supports Anthropic Claude, OpenAI GPT-4o, DeepSeek V3/R1, and Google Gemini with token quota protection.
- **🛡️ Super Admin Dashboard (`/admin`)**: Manage classes, students, and system health from a single interface.

---

## ⚖️ Community Edition (Public) vs. Alumni Pro Edition (100% Graduation Reward)

| Feature / Module | 🌍 Community Edition (This Repo) | 🏆 Alumni Pro Edition (Vibecode Lab Graduates) |
| :--- | :---: | :---: |
| **LMS Portal + Cloudflare R2 Video Player ($0 Egress)** | ✅ Included | ✅ Included |
| **Student Progress Tracking & Pitch & Match Community** | ✅ Included | ✅ Included |
| **Multi-Model AI Chat Widget (Claude / OpenAI / DeepSeek / Gemini)** | ✅ Base Prompt | ✅ **Unicorn Consultative Sales Brain + Auto Follow-Up** |
| **Full LATAM & Global Payment Suite (Webpay Plus, Flow.cl, Mercado Pago, PayPal, Bank Wire)** | ⚡ Basic Checkout | ✅ **Full Production Multi-Gateway + Partial Payments** |
| **Automated AI SEO Blog Engine + Instagram Bot + UTM Deeplinks + Kanban CRM** | ❌ | ✅ **Included in Alumni Vault** |
| **Cryptographic QR Certificate Issuer (`/verify/[id]`)** | ❌ | ✅ **Included in Alumni Vault** |
| **Interactive White-Label CLI (`npm run setup-brand`)** | ❌ | ✅ **60-Second Brand & Pricing Customizer** |

> 💡 **How to unlock the Alumni Pro Edition?**  
> Enroll in **[Vibecode Lab](https://www.javiermujica.com/vibecode)** and complete **100% of the lessons** inside `/vibecodelab`. The **Alumni Pro Vault** unlocks automatically in your student dashboard!

---

## 🏆 Wall of Builders — Built by Vibecode Lab Alumni

Projects built, deployed to production, and verified by **100% graduated builders** of **[Vibecode Lab](https://www.javiermujica.com/vibecode)**:

| Builder / Founder | Verified MVP / SaaS | Stack | Certificate |
| :--- | :--- | :--- | :--- |
| **Javier Mujica** | [javiermujica.com](https://www.javiermujica.com) — AI Consulting & Vibecode Lab | Next.js 16 · Supabase · R2 · Multi-AI | 🟢 Official Creator |
| *✨ Your Name Here* | *Complete 100% of Vibecode Lab to feature your SaaS here with a direct dofollow backlink!* | Next.js · Supabase · AI | 🔒 Complete 100% |

---

## 🚀 Quick Start in 4 Steps

```bash
# 1. Clone the repository
git clone https://github.com/AiesTreiA/vibe-academy-starter.git
cd vibe-academy-starter

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp env.example .env.local

# 4. Run development server
npm run dev
```

### Upload 1GB–10GB Course Videos to Cloudflare R2
```bash
node scripts/upload-to-r2.mjs "/path/to/lesson_01.mp4" "module1-lesson1.mp4"
```

---

## 💜 Credits & Community

Created by **[Javier Mujica](https://www.javiermujica.com)**.  
If this project helps you launch your own academy or AI product, please **give it a ⭐ Star on GitHub** and share it with another builder!
