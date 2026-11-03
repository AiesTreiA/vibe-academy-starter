"use client"

import Link from "next/link"
import { NeuralNetworkConnector } from "./neural-network-connector"

interface FooterProps {
  logoSrc?: string
  logoAlt?: string
  logoClassName?: string
}

export function Footer({
  logoSrc = "/images/logo-completo.webp",
  logoAlt = "Javier Mujica Logo",
  logoClassName = "h-56 md:h-72 w-auto opacity-90 hover:opacity-100 transition-opacity filter brightness-110"
}: FooterProps) {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo to the left */}
        <div className="flex justify-center md:justify-start shrink-0">
          <img 
            src={logoSrc} 
            alt={logoAlt} 
            width={300}
            height={100}
            loading="lazy"
            decoding="async"
            className={logoClassName} 
          />
        </div>
        
        {/* Interactive Neural Network Connector */}
        <div className="flex-1 w-full h-20 max-w-xs md:max-w-sm mx-auto relative overflow-hidden my-2 md:my-0">
          <NeuralNetworkConnector />
        </div>

        {/* Texts to the right */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4 shrink-0">
          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-slate-400">
            <p className="font-medium">
              © 2026 JAVIER IGNACIO MUJICA CARVAJAL · Mujica AI Lab · Vibecode Lab. Todos los derechos reservados.
            </p>
            {/* Line 1: Social, Email & Main Lab */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-2 gap-y-1">
              <a 
                href="https://www.instagram.com/mujica_ai_lab" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                Instagram
              </a>
              <span className="text-slate-600">·</span>
              <a 
                href="https://www.facebook.com/profile.php?id=61591534187376" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                Facebook
              </a>
              <span className="text-slate-600">·</span>
              <a 
                href="https://www.linkedin.com/in/javier-mujica-aa32291a/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                LinkedIn
              </a>
              <span className="text-slate-600">·</span>
              <a 
                href="mailto:hola@javiermujica.com" 
                className="hover:text-white transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                hola@javiermujica.com
              </a>
              <span className="text-slate-600">·</span>
              <Link 
                href="/vibecode" 
                className="hover:text-indigo-400 font-semibold transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                Vibecode Lab
              </Link>
              <span className="text-slate-600">·</span>
              <Link 
                href="/vibecode-1on1" 
                className="hover:text-cyan-400 font-semibold transition-colors duration-200 px-1.5 py-1 inline-block text-cyan-400/90"
              >
                Vibecode 1:1
              </Link>
              <span className="text-slate-600">·</span>
              <a 
                href="https://verticapp.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-emerald-400 font-semibold transition-colors duration-200 px-1.5 py-1 inline-block text-emerald-400/90"
              >
                VerticApp.pro
              </a>
            </div>

            {/* Line 2: Platform & Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-2 gap-y-1">
              <Link 
                href="/vibecodelab" 
                className="hover:text-indigo-300 font-medium transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                Plataforma Alumnos
              </Link>
              <span className="text-slate-600">·</span>
              <Link 
                href="/privacidad" 
                className="hover:text-white transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                Política de Privacidad
              </Link>
              <span className="text-slate-600">·</span>
              <Link 
                href="/terminos" 
                className="hover:text-white transition-colors duration-200 px-1.5 py-1 inline-block"
              >
                Términos de Servicio
              </Link>
            </div>
          </div>
          
          {/* AI Logos */}
          <div className="flex flex-col items-center md:items-end gap-1.5 mt-1">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">Tecnologías IA Integradas</span>
            <div className="flex items-center gap-3.5 transition-opacity duration-300">
              {/* NVIDIA NIM */}
              <Link href="/nvidia" className="flex items-center gap-1 group" title="NVIDIA NIM Accelerated">
                <svg className="h-4 w-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.94 4.54a7.92 7.92 0 0 1 5.92-.08c3.48 1.25 5.56 4.7 5.14 8.35-.4 3.44-2.88 6.22-6.2 6.94a7.91 7.91 0 0 1-8.23-3.66c-.19-.34-.08-.77.26-.97.34-.19.78-.08.97.26a6.45 6.45 0 0 0 6.7 2.99c2.7-.58 4.73-2.85 5.05-5.65.34-2.98-1.36-5.8-4.2-6.82a6.45 6.45 0 0 0-4.83.07 6.47 6.47 0 0 0-3.77 5.23c-.3 2.15.54 4.22 2.22 5.53.3.23.36.67.13.97-.23.3-.67.36-.97.13a8.04 8.04 0 0 1-2.73-6.83A7.95 7.95 0 0 1 8.94 4.54z" fill="#76B900"/>
                  <path d="M9.8 7.37c2.37-.62 4.88.35 6.07 2.37 1.18 2 1.05 4.56-.32 6.42-.24.32-.7.38-1.02.14-.32-.24-.38-.7-.14-1.02 1.08-1.46 1.18-3.47.25-5.04-.93-1.58-2.9-2.34-4.75-1.85a4.98 4.98 0 0 0-3.37 3.59 4.96 4.96 0 0 0 1.24 4.67c.28.27.29.72.02 1-.27.28-.72.29-1-.02a6.45 6.45 0 0 1-1.61-6.07 6.48 6.48 0 0 1 4.63-4.23z" fill="#76B900"/>
                </svg>
                <span className="text-[10px] text-slate-300 font-medium group-hover:text-[#76b900] transition-colors">NVIDIA</span>
              </Link>

              {/* DeepSeek */}
              <div className="flex items-center gap-1" title="DeepSeek">
                <svg className="h-4 w-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" stroke="#3B82F6" strokeWidth="8" fill="none" />
                  <path d="M35 50 C45 35, 55 35, 65 50 C55 65, 45 65, 35 50 Z" fill="#3B82F6" />
                  <circle cx="50" cy="50" r="6" fill="#1D4ED8" />
                </svg>
                <span className="text-[10px] text-slate-300 font-medium">DeepSeek</span>
              </div>
              
              {/* Gemini */}
              <div className="flex items-center gap-1" title="Google Gemini">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="footer-gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9adbf9" />
                      <stop offset="50%" stopColor="#7a9bf2" />
                      <stop offset="100%" stopColor="#d599ff" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" fill="url(#footer-gemini-grad)" />
                </svg>
                <span className="text-[10px] text-slate-300 font-medium">Gemini</span>
              </div>
              
              {/* Anthropic */}
              <div className="flex items-center gap-1" title="Anthropic">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 22H6.5L8.8 17H15.2L17.5 22H22L12 2ZM12 7.8L14.3 13H9.7L12 7.8Z" fill="#CC7A5C" />
                </svg>
                <span className="text-[10px] text-slate-300 font-medium">Anthropic</span>
              </div>

              {/* Claude */}
              <div className="flex items-center gap-1" title="Claude AI">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C8 3 5 6 5 10C5 12.5 6.5 14.5 8.5 15.5C8 17.5 6.5 19.5 4.5 21C7.5 21 10.5 19.5 12 17.5C13.5 19.5 16.5 21 19.5 21C17.5 19.5 16 17.5 15.5 15.5C17.5 14.5 19 12.5 19 10C19 6 16 3 12 3Z" fill="#D97706" />
                </svg>
                <span className="text-[10px] text-slate-300 font-medium">Claude</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
