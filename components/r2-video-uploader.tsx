"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Upload,
  CheckCircle,
  Loader2,
  X,
  Film,
  Copy,
  Check,
  Zap,
  HardDrive,
  Clock,
  AlertCircle,
  RotateCcw,
} from "lucide-react"

interface R2VideoUploaderProps {
  onUploaded?: (publicUrl: string, key: string) => void
}

interface UploadStats {
  speedMbPerSec: number
  uploadedBytes: number
  totalBytes: number
  currentPart: number
  totalParts: number
  estimatedSecondsRemaining: number
}

const DEFAULT_PART_SIZE = 10 * 1024 * 1024 // 10 MiB

export function R2VideoUploader({ onUploaded }: R2VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<"idle" | "presigning" | "uploading" | "assembling" | "done" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<UploadStats>({
    speedMbPerSec: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    currentPart: 0,
    totalParts: 0,
    estimatedSecondsRemaining: 0,
  })
  const [publicUrl, setPublicUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeSessionRef = useRef<{ uploadId: string; key: string } | null>(null)
  const speedSamplesRef = useRef<{ time: number; bytes: number }[]>([])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const gb = bytes / (1024 * 1024 * 1024)
    if (gb >= 1) return `${gb.toFixed(2)} GB`
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatSeconds = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "--"
    if (seconds < 60) return `${Math.ceil(seconds)}s`
    const mins = Math.floor(seconds / 60)
    const secs = Math.ceil(seconds % 60)
    return `${mins}m ${secs.toString().padStart(2, "0")}s`
  }

  const validateAndSetFile = (f: File) => {
    if (!f.type.startsWith("video/") && !/\.(mp4|mov|webm|mkv|avi)$/i.test(f.name)) {
      setErrorMsg("Solo se permiten archivos de video (MP4, MOV, WebM, etc.)")
      return
    }
    setFile(f)
    setStatus("idle")
    setProgress(0)
    setPublicUrl("")
    setErrorMsg("")
    setStats({
      speedMbPerSec: 0,
      uploadedBytes: 0,
      totalBytes: f.size,
      currentPart: 0,
      totalParts: Math.ceil(f.size / DEFAULT_PART_SIZE),
      estimatedSecondsRemaining: 0,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) validateAndSetFile(f)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) validateAndSetFile(f)
  }

  const handleUpload = async () => {
    if (!file) return

    setStatus("presigning")
    setErrorMsg("")
    setProgress(0)
    speedSamplesRef.current = []

    abortControllerRef.current = new AbortController()
    const abortSignal = abortControllerRef.current.signal

    const fileSize = file.size
    const partSize = DEFAULT_PART_SIZE
    const totalParts = Math.ceil(fileSize / partSize)

    try {
      // 1. Iniciar subida multipart en API
      const initRes = await fetch("/api/upload-video/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "init",
          filename: file.name,
          contentType: file.type || "video/mp4",
          fileSize,
        }),
        signal: abortSignal,
      })

      const initData = await initRes.json()
      if (!initRes.ok) {
        throw new Error(initData.error || "Error iniciando subida multipart")
      }

      const { uploadId, key } = initData
      activeSessionRef.current = { uploadId, key }

      setStatus("uploading")

      const completedParts: { PartNumber: number; ETag: string }[] = []
      let totalUploadedBytes = 0
      const startTime = Date.now()

      // 2. Subir partes con concurrencia controlada (2 partes en paralelo)
      const CONCURRENCY = 2
      const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1)
      let currentPartIndex = 0

      // Función trabajadora para subir chunks
      const uploadWorker = async () => {
        while (currentPartIndex < partNumbers.length) {
          if (abortSignal.aborted) throw new Error("Subida cancelada por el usuario")

          const partNumber = partNumbers[currentPartIndex++]
          const start = (partNumber - 1) * partSize
          const end = Math.min(start + partSize, fileSize)
          const chunk = file.slice(start, end)
          const chunkSize = end - start

          // Pedir URL firmada para la parte
          const urlRes = await fetch("/api/upload-video/multipart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "get-part-urls",
              key,
              uploadId,
              partNumbers: [partNumber],
            }),
            signal: abortSignal,
          })

          const urlData = await urlRes.json()
          if (!urlRes.ok || !urlData.urls?.[partNumber]) {
            throw new Error(urlData.error || `Error obteniendo URL para parte ${partNumber}`)
          }

          const presignedUrl = urlData.urls[partNumber]

          // Subir el chunk directo a R2 con reintento
          let etag = ""
          let attempts = 0
          while (attempts < 3) {
            attempts++
            try {
              etag = await uploadChunk(presignedUrl, chunk, abortSignal)
              break
            } catch (chunkErr: any) {
              if (abortSignal.aborted) throw chunkErr
              if (attempts >= 3) throw chunkErr
              // Esperar 1 segundo antes de reintentar
              await new Promise((r) => setTimeout(r, 1000))
            }
          }

          completedParts.push({ PartNumber: partNumber, ETag: etag })
          totalUploadedBytes += chunkSize

          // Actualizar métricas
          const now = Date.now()
          speedSamplesRef.current.push({ time: now, bytes: totalUploadedBytes })
          if (speedSamplesRef.current.length > 10) speedSamplesRef.current.shift()

          // Calcular velocidad con ventana deslizante
          let currentSpeedMb = 0
          if (speedSamplesRef.current.length > 1) {
            const first = speedSamplesRef.current[0]
            const last = speedSamplesRef.current[speedSamplesRef.current.length - 1]
            const timeDiffSec = (last.time - first.time) / 1000
            const bytesDiff = last.bytes - first.bytes
            if (timeDiffSec > 0) {
              currentSpeedMb = bytesDiff / (1024 * 1024) / timeDiffSec
            }
          } else {
            const elapsedSec = (now - startTime) / 1000
            if (elapsedSec > 0) {
              currentSpeedMb = totalUploadedBytes / (1024 * 1024) / elapsedSec
            }
          }

          const currentProgress = Math.min(Math.round((totalUploadedBytes / fileSize) * 100), 99)
          const remainingBytes = fileSize - totalUploadedBytes
          const estSeconds = currentSpeedMb > 0 ? remainingBytes / (1024 * 1024) / currentSpeedMb : 0

          setProgress(currentProgress)
          setStats({
            speedMbPerSec: Number(currentSpeedMb.toFixed(2)),
            uploadedBytes: totalUploadedBytes,
            totalBytes: fileSize,
            currentPart: completedParts.length,
            totalParts,
            estimatedSecondsRemaining: Math.max(0, Math.round(estSeconds)),
          })
        }
      }

      // Lanzar workers paralelos
      const workers = Array.from({ length: Math.min(CONCURRENCY, totalParts) }, () => uploadWorker())
      await Promise.all(workers)

      // 3. Ensamblar partes en Cloudflare R2
      setStatus("assembling")

      const completeRes = await fetch("/api/upload-video/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          key,
          uploadId,
          parts: completedParts,
        }),
        signal: abortSignal,
      })

      const completeData = await completeRes.json()
      if (!completeRes.ok) {
        throw new Error(completeData.error || "Error completando ensamblaje de video")
      }

      const finalUrl = completeData.publicUrl
      setPublicUrl(finalUrl)
      setProgress(100)
      setStatus("done")
      activeSessionRef.current = null
      onUploaded?.(finalUrl, key)
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("cancelada")) {
        console.log("[R2 Uploader] Subida cancelada por usuario")
        reset()
        return
      }

      console.error("[R2 Uploader] Error en subida multipart:", err)
      setErrorMsg(err.message || "Ocurrió un error durante la subida")
      setStatus("error")

      // Abortar en R2 para limpiar
      if (activeSessionRef.current) {
        try {
          await fetch("/api/upload-video/multipart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "abort",
              ...activeSessionRef.current,
            }),
          })
        } catch (_) {}
      }
    }
  }

  // Sube un chunk individual via PUT con XMLHttpRequest para capturar ETag
  const uploadChunk = (url: string, chunk: Blob, signal: AbortSignal): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", url)

      const onAbort = () => {
        xhr.abort()
        reject(new Error("Subida cancelada"))
      }

      signal.addEventListener("abort", onAbort, { once: true })

      xhr.onload = () => {
        signal.removeEventListener("abort", onAbort)
        if (xhr.status >= 200 && xhr.status < 300) {
          let etag = ""
          try {
            const allHeaders = (xhr.getAllResponseHeaders() || "").toLowerCase()
            if (allHeaders.includes("etag")) {
              const raw = xhr.getResponseHeader("ETag") || xhr.getResponseHeader("etag")
              if (raw) etag = raw.replace(/"/g, "")
            }
          } catch (_) {}
          // Si el navegador bloquea ETag por CORS ExposeHeaders, resolvemos de todas formas
          // ya que el servidor recuperará los ETags con ListPartsCommand
          resolve(etag)
        } else {
          reject(new Error(`Chunk falló con HTTP ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        signal.removeEventListener("abort", onAbort)
        reject(new Error("Error de red al transferir chunk a R2"))
      }

      xhr.send(chunk)
    })
  }

  const handleCancel = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (activeSessionRef.current) {
      try {
        await fetch("/api/upload-video/multipart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "abort",
            ...activeSessionRef.current,
          }),
        })
      } catch (_) {}
    }
    reset()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setFile(null)
    setStatus("idle")
    setProgress(0)
    setPublicUrl("")
    setErrorMsg("")
    setStats({
      speedMbPerSec: 0,
      uploadedBytes: 0,
      totalBytes: 0,
      currentPart: 0,
      totalParts: 0,
      estimatedSecondsRemaining: 0,
    })
    activeSessionRef.current = null
    if (inputRef.current) inputRef.current.value = ""
  }

  const isUploading = status === "presigning" || status === "uploading" || status === "assembling"

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-5 shadow-2xl space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Uploader de Video Pro
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Cloudflare R2 Multipart
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Soporta videos de 1 GB a 5 GB+ sin cortes</p>
          </div>
        </div>

        {file && !isUploading && (
          <button
            onClick={reset}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Limpiar archivo"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      {!isUploading && status !== "done" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative group flex flex-col items-center justify-center w-full min-h-[130px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-indigo-400 bg-indigo-500/15 scale-[1.01] shadow-lg shadow-indigo-500/10"
              : file
              ? "border-indigo-500/60 bg-slate-800/60 hover:border-indigo-400"
              : "border-slate-700/80 bg-slate-950/40 hover:bg-slate-850 hover:border-slate-600"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <div className="flex items-center gap-4 px-6 py-4 w-full">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                <Film className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">{file.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="font-mono text-indigo-300 font-semibold">{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>~{Math.ceil(file.size / DEFAULT_PART_SIZE)} bloques de 10 MB</span>
                </div>
              </div>
              <span className="text-xs text-indigo-400 font-semibold hover:underline">Cambiar</span>
            </div>
          ) : (
            <div className="text-center px-4 py-4 space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  <span className="text-indigo-400 underline decoration-indigo-400/50">Haz clic para explorar</span> o arrastra tu video aquí
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">MP4, MOV, WebM, MKV (sin límite de tamaño)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pro Animated Loader / Telemetry HUD */}
      {isUploading && (
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-950 p-4 space-y-3.5 shadow-inner">
          {/* Top Status & Percentage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </div>
              <span className="text-xs font-bold text-slate-200">
                {status === "presigning"
                  ? "Inicializando sesión en Cloudflare..."
                  : status === "assembling"
                  ? "Ensamblando bloques en R2..."
                  : "Subiendo chunks en paralelo..."}
              </span>
            </div>
            <span className="text-sm font-black font-mono tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              {status === "assembling" ? "99%" : `${progress}%`}
            </span>
          </div>

          {/* Animated Glowing Progress Bar */}
          <div className="relative w-full h-3 bg-slate-800/90 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-sky-400 transition-all duration-300 ease-out shadow-lg shadow-indigo-500/50 relative overflow-hidden"
              style={{ width: `${status === "presigning" ? 4 : status === "assembling" ? 99 : progress}%` }}
            >
              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />
            </div>
          </div>

          {/* Live Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Speed Gauge */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Velocidad</p>
                <p className="text-xs font-bold font-mono text-slate-100 truncate">
                  {stats.speedMbPerSec > 0 ? `${stats.speedMbPerSec} MB/s` : "Calculando..."}
                </p>
              </div>
            </div>

            {/* Transferred Size */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <HardDrive className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Transferido</p>
                <p className="text-xs font-bold font-mono text-slate-100 truncate">
                  {formatBytes(stats.uploadedBytes)} / {formatBytes(stats.totalBytes)}
                </p>
              </div>
            </div>

            {/* Part Count */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <Film className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Bloques</p>
                <p className="text-xs font-bold font-mono text-slate-100 truncate">
                  {stats.currentPart} / {stats.totalParts} partes
                </p>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <Clock className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400">Restante</p>
                <p className="text-xs font-bold font-mono text-slate-100 truncate">
                  {formatSeconds(stats.estimatedSecondsRemaining)}
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleCancel}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-colors flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Cancelar subida
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && errorMsg && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-rose-200">Error en la subida</p>
            <p className="text-xs text-rose-400/90 mt-0.5 break-words">{errorMsg}</p>
          </div>
          <button
            onClick={handleUpload}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reintentar
          </button>
        </div>
      )}

      {/* Success State */}
      {status === "done" && publicUrl && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-bold text-slate-100">¡Video subido con éxito a Cloudflare R2!</span>
            </div>
            <button
              onClick={reset}
              className="text-[11px] text-indigo-400 hover:underline font-semibold"
            >
              Subir otro video
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg p-2">
            <code className="text-[11px] font-mono text-emerald-300 truncate flex-1 select-all">
              {publicUrl}
            </code>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
              title="Copiar URL"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            La URL se ha vinculado automáticamente al formulario. Puedes guardar la clase cuando estés listo.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {file && !isUploading && status !== "done" && (
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleUpload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Upload className="h-4 w-4" />
            Iniciar Subida Multipart ({formatBytes(file.size)})
          </button>
        </div>
      )}
    </div>
  )
}
