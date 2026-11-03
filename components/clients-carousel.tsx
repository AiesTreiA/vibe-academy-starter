"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Client {
  name: string
  url: string
  image: string
}

export default function ClientsCarousel() {
  const clients: Client[] = [
    {
      name: "VerticApp",
      url: "https://verticapp.pro",
      image: "/images/logo-verticapp.svg"
    },
    {
      name: "CCU",
      url: "https://www.ccu.cl/",
      image: "/images/logo-ccu.png"
    },
    {
      name: "Transbank",
      url: "https://www.transbank.cl/",
      image: "/images/logo-transbank.png"
    },
    {
      name: "PROGESTION",
      url: "https://www.progestion.com/",
      image: "/images/logo-progestion.png"
    },
    {
      name: "Recursiva",
      url: "https://recursiva.global/",
      image: "/images/logo-recursiva.png"
    },
    {
      name: "Antü Energía",
      url: "https://www.antuenergia.cl/",
      image: "/images/logo-antu.png"
    },
    {
      name: "Roboris",
      url: "https://roboris.cl/",
      image: "/images/logo-roboris.png"
    },
    {
      name: "Mundos-Virtuales",
      url: "https://www.linkedin.com/company/mundos-virtuales",
      image: "/images/logo-mundos-virtuales.png"
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleItemsCount, setVisibleItemsCount] = useState(4)
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null)

  // Adjust number of visible items based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItemsCount(2) // mobile
      } else if (window.innerWidth < 1024) {
        setVisibleItemsCount(3) // tablet
      } else {
        setVisibleItemsCount(4) // desktop
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxIndex = Math.max(0, clients.length - visibleItemsCount)

  // Ensure currentIndex stays within bounds when visibleItemsCount changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [visibleItemsCount, maxIndex])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  // Handle Autoplay (every 3.5 seconds)
  const startAutoplay = () => {
    stopAutoplay()
    autoplayTimer.current = setInterval(() => {
      nextSlide()
    }, 3500)
  }

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current)
      autoplayTimer.current = null
    }
  }

  useEffect(() => {
    startAutoplay()
    return () => stopAutoplay()
  }, [visibleItemsCount, currentIndex])

  const handleManualNext = () => {
    stopAutoplay()
    nextSlide()
    startAutoplay()
  }

  const handleManualPrev = () => {
    stopAutoplay()
    prevSlide()
    startAutoplay()
  }

  const handleDotClick = (index: number) => {
    stopAutoplay()
    setCurrentIndex(index)
    startAutoplay()
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8 group/carousel">
      {/* Carousel Wrapper */}
      <div className="overflow-hidden relative rounded-2xl p-1">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / clients.length)}%)`,
            // Adjust width to show items side by side
            width: `${(clients.length / visibleItemsCount) * 100}%`,
          }}
        >
          {clients.map((client) => (
            <div
              key={client.name}
              className="px-2"
              style={{ width: `${100 / clients.length}%` }}
            >
              <a
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center h-[120px] rounded-xl border border-slate-200 dark:border-slate-200/80 bg-white dark:bg-white hover:bg-slate-50 dark:hover:bg-slate-50 transition-all duration-300 hover:scale-105 hover:border-primary/40 shadow-sm hover:shadow-md hover:shadow-primary/5 p-6"
              >
                {/* Logo Image */}
                <img
                  src={client.image}
                  alt={client.name}
                  width={120}
                  height={60}
                  loading="lazy"
                  decoding="async"
                  className="max-h-[60px] max-w-full object-contain select-none transition-all duration-300 group-hover:scale-105"
                />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Control: Left Arrow */}
      <button
        onClick={handleManualPrev}
        className="absolute left-[-16px] top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card border border-border p-2.5 rounded-full shadow-lg text-muted-foreground hover:text-foreground hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Manual Control: Right Arrow */}
      <button
        onClick={handleManualNext}
        className="absolute right-[-16px] top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card border border-border p-2.5 rounded-full shadow-lg text-muted-foreground hover:text-foreground hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicator Dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center items-center gap-1 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className="p-2 flex items-center justify-center focus:outline-none min-w-[32px] min-h-[32px]"
              aria-label={`Ir al slide ${index + 1}`}
            >
              <span className={`block h-2.5 rounded-full transition-colors duration-200 ${
                currentIndex === index
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5"
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
