"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  PictureInPicture2
} from "lucide-react"

interface MasterclassVideoPlayerProps {
  src?: string
  youtubeId?: string
  title: string
  subtitle?: string
  poster?: string
  onClose?: () => void
  autoPlay?: boolean
}

export function MasterclassVideoPlayer({
  src,
  youtubeId,
  title,
  subtitle,
  poster,
  onClose,
  autoPlay = true,
}: MasterclassVideoPlayerProps) {
  // Helper to extract YouTube ID if passed via src or youtubeId
  const getYoutubeId = (): string | null => {
    if (youtubeId) return youtubeId
    if (!src) return null
    if (src.includes("youtu.be/")) {
      return src.split("youtu.be/")[1]?.split("?")[0] || null
    }
    if (src.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(src.split("?")[1] || "")
      return urlParams.get("v")
    }
    if (src.includes("youtube.com/embed/")) {
      return src.split("youtube.com/embed/")[1]?.split("?")[0] || null
    }
    return null
  }

  const activeYoutubeId = getYoutubeId()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Player States (for direct video)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBuffering, setIsBuffering] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number>(0)
  const [isSeeking, setIsSeeking] = useState(false)

  // Format time (seconds -> mm:ss or hh:mm:ss)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00"
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay prevented:", err)
      })
    }
  }, [isPlaying])

  const skip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(
      Math.max(videoRef.current.currentTime + seconds, 0),
      duration
    )
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return
    const clamped = Math.max(0, Math.min(1, newVolume))
    setVolume(clamped)
    videoRef.current.volume = clamped
    if (clamped === 0) {
      setIsMuted(true)
      videoRef.current.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      videoRef.current.muted = false
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
      if (volume === 0) {
        setVolume(0.8)
        videoRef.current.volume = 0.8
      }
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return
    setPlaybackRate(rate)
    videoRef.current.playbackRate = rate
    setShowSettings(false)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting fullscreen:", err)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error leaving fullscreen:", err)
      })
      setIsFullscreen(false)
    }
  }

  const togglePiP = async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (err) {
      console.error("Picture-in-picture error:", err)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const targetTime = Math.max(0, Math.min(pos * duration, duration))
    videoRef.current.currentTime = targetTime
    setCurrentTime(targetTime)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
    setHoverPosition(pos * 100)
    setHoverTime(pos * duration)
  }

  const handleProgressMouseLeave = () => {
    setHoverTime(null)
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSettings(false)
      }, 2500)
    }
  }

  useEffect(() => {
    if (activeYoutubeId) return
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime)
      }
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBuffered((bufferedEnd / video.duration) * 100)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsBuffering(false)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setShowControls(true)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("ended", handleEnded)
    }
  }, [isSeeking, activeYoutubeId])

  useEffect(() => {
    if (activeYoutubeId) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "f":
          e.preventDefault()
          toggleFullscreen()
          break
        case "m":
          e.preventDefault()
          toggleMute()
          break
        case "arrowleft":
        case "j":
          e.preventDefault()
          skip(-10)
          break
        case "arrowright":
        case "l":
          e.preventDefault()
          skip(10)
          break
        case "arrowup":
          e.preventDefault()
          handleVolumeChange(volume + 0.1)
          break
        case "arrowdown":
          e.preventDefault()
          handleVolumeChange(volume - 0.1)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay, volume, activeYoutubeId])

  // --- RENDER YOUTUBE MODE ---
  if (activeYoutubeId) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`

    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group"
      >
        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              MASTERCLASS GRABADA • HD
            </span>
            <div className="hidden sm:block">
              <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700/60 transition-colors backdrop-blur-md cursor-pointer"
              title="Cerrar reproductor"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* YouTube IFrame Embed */}
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    )
  }

  // --- RENDER HTML5 DIRECT VIDEO MODE ---
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group focus:outline-none"
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        autoPlay={autoPlay}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs pointer-events-none z-20">
          <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Cargando transmisión HD...</span>
          </div>
        </div>
      )}

      {(!isPlaying || showControls) && !isBuffering && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40 cursor-pointer z-10 transition-opacity duration-300"
        >
          <button
            type="button"
            className="p-5 rounded-full bg-indigo-600/90 text-white hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/30 backdrop-blur-md"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 fill-current translate-x-0.5" />
            )}
          </button>
        </div>
      )}

      <div
        className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            MASTERCLASS GRABADA • HD
          </span>
          <div className="hidden sm:block">
            <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700/60 transition-colors backdrop-blur-md"
            title="Cerrar reproductor"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 p-4 pt-8 z-30 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          className="relative w-full h-3 mb-3 cursor-pointer flex items-center group/progress"
        >
          <div className="w-full h-1.5 rounded-full bg-slate-800/90 group-hover/progress:h-2.5 transition-all overflow-hidden relative">
            <div
              className="absolute left-0 top-0 bottom-0 bg-slate-700/50 transition-all duration-150"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className="absolute h-4 w-4 rounded-full bg-white shadow-lg border border-indigo-500 -ml-2 top-1/2 -translate-y-1/2 scale-0 group-hover/progress:scale-100 transition-transform pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {hoverTime !== null && (
            <div
              className="absolute bottom-6 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-200 shadow-xl pointer-events-none z-40"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg text-slate-200 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
              title={isPlaying ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            <button
              onClick={() => skip(-10)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:block"
              title="Retroceder 10s (Flecha izquierda)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => skip(10)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:block"
              title="Adelantar 10s (Flecha derecha)"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
                title={isMuted ? "Activar sonido (M)" : "Silenciar (M)"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden md:block"
              />
            </div>

            <div className="text-xs font-mono text-slate-400 ml-1">
              <span className="text-slate-100 font-semibold">{formatTime(currentTime)}</span>
              <span className="mx-1 text-slate-600">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
                  showSettings
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800"
                }`}
                title="Velocidad de reproducción"
              >
                <span>{playbackRate}x</span>
              </button>

              {showSettings && (
                <div className="absolute bottom-10 right-0 w-32 p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Velocidad
                  </div>
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        playbackRate === rate
                          ? "bg-indigo-600/30 text-indigo-300 font-semibold"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <Check className="h-3 w-3 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={togglePiP}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden sm:block"
              title="Modo Imagen en Imagen (PiP)"
            >
              <PictureInPicture2 className="h-4 w-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 transition-colors"
              title={isFullscreen ? "Salir de pantalla completa (F)" : "Pantalla completa (F)"}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
