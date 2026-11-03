"use client"

import { useState, useEffect } from "react"
import { UploadCloud, File, MessageSquare, ArrowRight, Bot, User, CheckCircle2 } from "lucide-react"

export default function R2DemoPage() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "¡Hola! Soy tu asistente IA experto en análisis de datos. Sube tus documentos aquí para que los analicemos juntos." }
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  // Cargar contador desde localStorage para simular estado de usuario
  useEffect(() => {
    const savedCount = localStorage.getItem("demo_upload_count");
    if (savedCount) {
      setUploadCount(parseInt(savedCount));
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    // Lógica PLG / Freemium: La 3ra subida lanza el Paywall
    if (uploadCount >= 2) {
      // Idealmente aquí lanzamos evento de PostHog: posthog.capture('paywall_shown')
      alert("Límite Freemium Alcanzado. Redirigiendo a pasarela de pagos para Suscripción Pro ($10 USD)...");
      // Redirigir a la página de checkout o pricing
      window.location.href = "/pricing?plan=pro"; 
      return;
    }

    setIsUploading(true);

    try {
      // 1. Añadir mensaje del usuario a la UI
      setMessages(prev => [...prev, { role: "user", content: `He adjuntado el archivo: ${file.name}` }]);

      // 2. Pedir URL prefirmada al backend
      const res = await fetch("/api/r2-upload", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });
      const data = await res.json();

      if (data.url) {
        // 3. Subir el archivo directo a R2 (Cloudflare Storage)
        await fetch(data.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        // 4. Actualizar contador
        const newCount = uploadCount + 1;
        setUploadCount(newCount);
        localStorage.setItem("demo_upload_count", newCount.toString());

        // 5. Simular respuesta de la IA
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: "ai", 
            content: `He analizado exitosamente el archivo "${file.name}". Contiene información valiosa y ya he extraído los puntos clave. Tienes acceso a esta función gratuita gracias a R2. (Te quedan ${2 - newCount} intentos gratis). ¿Qué deseas hacer con estos datos?` 
          }]);
          setFile(null);
          setIsUploading(false);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center py-10 px-4">
      <div className="max-w-2xl w-full">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Demostración PLG: AI + R2</h1>
          <p className="text-slate-400">Sube tus archivos directo a la nube. Descubre el valor de la IA de inmediato.</p>
        </div>

        {/* Chat UI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
          
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'ai' ? 'items-start' : 'items-start flex-row-reverse'}`}>
                <div className={`p-2 rounded-full flex-shrink-0 ${msg.role === 'ai' ? 'bg-cyan-900 text-cyan-400' : 'bg-indigo-900 text-indigo-400'}`}>
                  {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'ai' ? 'bg-slate-800 text-slate-300' : 'bg-indigo-600 text-white'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isUploading && (
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-full bg-cyan-900 text-cyan-400"><Bot size={20} /></div>
                <div className="p-3 rounded-lg bg-slate-800 text-slate-400 animate-pulse">
                  Procesando documento...
                </div>
              </div>
            )}
          </div>

          {/* Área de Input y Subida */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="flex flex-col gap-3">
              {/* Progreso Freemium */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className={uploadCount >= 2 ? "text-rose-400" : "text-emerald-400"}>
                  {uploadCount >= 2 ? "Límite gratuito alcanzado" : `Intentos gratuitos restantes: ${2 - uploadCount}`}
                </span>
                {uploadCount >= 2 && (
                  <span className="text-amber-400 flex items-center gap-1">
                    Requiere Suscripción Pro <ArrowRight size={12} />
                  </span>
                )}
              </div>

              {/* Botones */}
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="file" 
                    id="file-upload"
                    className="sr-only" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 hover:border-slate-500 transition-colors text-slate-400"
                  >
                    {file ? (
                      <><File size={18} className="text-cyan-400" /> {file.name}</>
                    ) : (
                      <><UploadCloud size={18} /> Seleccionar Archivo (PDF, Img, etc)</>
                    )}
                  </label>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                    !file || isUploading 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : uploadCount >= 2
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-rose-900/50'
                        : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  {uploadCount >= 2 ? "Desbloquear IA ($10/m)" : "Analizar"}
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
