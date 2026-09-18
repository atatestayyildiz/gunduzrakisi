"use client";

import React, { useEffect, useRef } from "react";

export const PastoralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create floating dust motes
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.3) * 0.4,
      speedY: -(Math.random() * 0.4 + 0.15),
      opacity: Math.random() * 0.5 + 0.15,
      wobble: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.wobble += 0.02;
        p.x += Math.sin(p.wobble) * 0.3 + p.speedX;

        // Reset if drifted off screen
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 238, 195, ${p.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(255, 225, 160, 0.5)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Warm Sunbeam Ray shining from top-left */}
      <div
        className="absolute -top-32 -left-32 w-[900px] h-[800px] rounded-full sunbeam-overlay blur-3xl opacity-70"
        style={{ transform: "rotate(-25deg)" }}
      />

      {/* Second soft warm amber glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-amber-200/10 blur-3xl" />



      {/* Floating dust motes in sunbeam */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
