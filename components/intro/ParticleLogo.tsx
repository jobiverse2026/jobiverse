"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Particle = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  delay: number;
};

const CANVAS_SIZE = 240;

export default function ParticleLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setAssembled(true);
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    context.scale(dpr, dpr);

    const image = new window.Image();
    image.src = "/images/branding/jobiverse-logo.svg?v=transparent-2";

    let animationFrame = 0;
    let cancelled = false;

    image.onload = () => {
      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = CANVAS_SIZE;
      sampleCanvas.height = CANVAS_SIZE;
      const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!sampleContext || cancelled) return;

      sampleContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      sampleContext.drawImage(image, 8, 8, CANVAS_SIZE - 16, CANVAS_SIZE - 16);
      const pixels = sampleContext.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
      const step = window.innerWidth < 640 ? 8 : 7;
      const particles: Particle[] = [];

      for (let y = 0; y < CANVAS_SIZE; y += step) {
        for (let x = 0; x < CANVAS_SIZE; x += step) {
          const pixelIndex = (y * CANVAS_SIZE + x) * 4;
          const alpha = pixels[pixelIndex + 3];
          const brightness = pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2];
          if (alpha > 80 && brightness < 610) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 130 + Math.random() * 210;
            particles.push({
              startX: CANVAS_SIZE / 2 + Math.cos(angle) * distance,
              startY: CANVAS_SIZE / 2 + Math.sin(angle) * distance,
              targetX: x,
              targetY: y,
              size: 0.7 + Math.random() * 1.2,
              delay: Math.random() * 0.42,
            });
          }
        }
      }

      const startedAt = performance.now();
      const duration = 1850;

      const render = (now: number) => {
        if (cancelled) return;
        context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (const particle of particles) {
          const rawProgress = Math.max(0, Math.min(1, (now - startedAt) / duration - particle.delay));
          const progress = 1 - Math.pow(1 - rawProgress, 4);
          const x = particle.startX + (particle.targetX - particle.startX) * progress;
          const y = particle.startY + (particle.targetY - particle.startY) * progress;
          context.globalAlpha = Math.min(1, rawProgress * 4);
          context.fillStyle = "#09090b";
          context.beginPath();
          context.arc(x, y, particle.size * (0.7 + progress * 0.3), 0, Math.PI * 2);
          context.fill();
        }

        context.globalAlpha = 1;
        if (now - startedAt < duration + 520) {
          animationFrame = requestAnimationFrame(render);
        } else {
          setAssembled(true);
        }
      };

      animationFrame = requestAnimationFrame(render);
    };

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-700 ${assembled ? "opacity-0" : "opacity-100"}`}
      />
      <Image
        src="/images/branding/jobiverse-logo.svg?v=transparent-2"
        alt="JobiVerse"
        width={320}
        height={320}
        priority
        className={`h-full w-full object-contain drop-shadow-[0_18px_45px_rgba(0,0,0,.12)] transition-[opacity,transform] duration-700 ${assembled ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      />
    </div>
  );
}
