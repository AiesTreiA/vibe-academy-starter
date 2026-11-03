"use client";

import React, { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseR: number;
  targetR: number;
  alpha: number;
  color: string;
}

export function NeuralNetworkConnector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 26; // balanced density
    const mouse = { x: 0, y: 0, active: false };

    // Initialize particles inside given bounds
    const initParticles = (width: number, height: number) => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const baseR = Math.random() * 1.6 + 1.2; // 1.2px to 2.8px
        const isGreen = Math.random() > 0.5;
        // Glow emerald and cyan base colors
        const color = isGreen ? "rgba(16, 185, 129, ALPHA)" : "rgba(6, 182, 212, ALPHA)";

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: baseR,
          baseR,
          targetR: baseR,
          alpha: 0.6, // visible, clear base opacity
          color,
        });
      }
    };

    // Set canvas dimensions and handle width=0 initial state
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (particles.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };

    // Initialize dimensions
    resizeCanvas();

    // Resize observer to handle container size changes dynamically
    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      const prevWidth = canvas.width;
      const prevHeight = canvas.height;
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // If particles were empty or size was 0, initialize
      if (particles.length === 0 || prevWidth === 0) {
        initParticles(rect.width, rect.height);
      } else if (prevWidth > 0 && prevHeight > 0) {
        // Adjust particle positions proportionally to new size
        particles.forEach((p) => {
          p.x = (p.x / prevWidth) * rect.width;
          p.y = (p.y / prevHeight) * rect.height;
        });
      }
    });
    resizeObserver.observe(container);

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    // Touch events for mobile support
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
      mouse.active = true;
    };

    const handleTouchEnd = () => {
      mouse.active = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchstart", handleTouchMove);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);

    // Animation Loop
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (w === 0 || h === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      // 1. Update and Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Keep inside bounds
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Interaction with mouse/touch
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < 85) {
            // Magnetic attraction force
            const force = (85 - dist) / 85;
            p.x += (dx / dist) * force * 0.55;
            p.y += (dy / dist) * force * 0.55;
            
            p.targetR = p.baseR * 1.5;
            p.alpha = 0.85; // highly visible on hover
          } else {
            p.targetR = p.baseR;
            p.alpha = 0.5;
          }
        } else {
          p.targetR = p.baseR;
          p.alpha = 0.5;
        }

        // Interpolate radius for smooth size changes
        p.r += (p.targetR - p.r) * 0.1;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("ALPHA", p.alpha.toString());
        ctx.fill();
      });

      // 2. Draw connections (nodos a nodos)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Connect to mouse/touch if close
        if (mouse.active) {
          const dxMouse = mouse.x - p1.x;
          const dyMouse = mouse.y - p1.y;
          const distMouse = Math.hypot(dxMouse, dyMouse);
          
          if (distMouse < 85) {
            const opacity = ((85 - distMouse) / 85) * 0.65; // bright cursor line
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Connect to other nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 60) {
            let opacity = ((60 - dist) / 60) * 0.28; // clearly visible connections

            // Highlight connections if mouse/touch is near
            if (mouse.active) {
              const distMouse1 = Math.hypot(mouse.x - p1.x, mouse.y - p1.y);
              const distMouse2 = Math.hypot(mouse.x - p2.x, mouse.y - p2.y);
              if (distMouse1 < 85 || distMouse2 < 85) {
                opacity = ((60 - dist) / 60) * 0.6; // much brighter lines near hover
              }
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Draw connection line
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchstart", handleTouchMove);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-pointer"
      style={{ minHeight: "64px" }}
    >
      {/* Background glow breathing softly behind the canvas */}
      <div className="absolute inset-0 w-3/4 h-8 bg-emerald-500/5 rounded-full blur-xl mx-auto pointer-events-none animate-aura-breathe" />
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block pointer-events-none" 
      />
    </div>
  );
}
