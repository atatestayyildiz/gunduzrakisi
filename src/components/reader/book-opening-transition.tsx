"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookArticle } from "@/lib/types";
import { BookCover } from "@/components/ui/book";
import { BookOpen, ArrowRight, X, Music, Heart, Eye } from "lucide-react";
import { RakiGlass } from "@/components/icons/raki-glass";
import { getCleanExcerpt } from "@/lib/text-cleaner";

interface BookOpeningTransitionProps {
  article: BookArticle;
  initialRect: { top: number; left: number; width: number; height: number };
  onComplete: () => void;
  onClose?: () => void;
}

export const BookOpeningTransition = ({
  article,
  initialRect,
  onComplete,
  onClose,
}: BookOpeningTransitionProps) => {
  // Choreographed Phases:
  // 1. 'initial': Sitting on shelf (closed)
  // 2. 'lifting': Flying to screen center & expanding (closed)
  // 3. 'open': Swung open at center, page revealed & readable
  // 4. 'closing_cover': Cover swings shut at center
  // 5. 'returning': Closed book glides back down to shelf
  // 6. 'expanding': "Yazıyı Oku" pressed, expanding into reader page
  const [phase, setPhase] = useState<
    "initial" | "lifting" | "open" | "closing_cover" | "returning" | "expanding"
  >("initial");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Step 1: Smoothly fly from shelf to center (book remains closed)
    const liftTimer = setTimeout(() => {
      setPhase("lifting");
    }, 20);

    // Step 2: Once book arrives at center, smoothly swing front cover open
    const openTimer = setTimeout(() => {
      setPhase("open");
    }, 440);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(liftTimer);
      clearTimeout(openTimer);
    };
  }, []);

  const handleReadNow = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (phase !== "open") return;
    setPhase("expanding");
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  const handleCloseBook = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (phase !== "open") return;

    // Step 1: First, swing cover shut while keeping book at center
    setPhase("closing_cover");

    // Step 2: Once cover is fully closed, glide closed book back down to shelf
    setTimeout(() => {
      setPhase("returning");

      // Step 3: Once book lands on shelf, cleanly unmount transition overlay
      setTimeout(() => {
        onClose?.();
      }, 420);
    }, 380);
  };

  // True physical size at 1:1 scale with even integer pixels (prevents subpixel font blur)
  const calcWidth = typeof window !== "undefined"
    ? Math.min(380, Math.max(310, Math.round(window.innerWidth * 0.42)))
    : 360;
  const targetWidth = calcWidth % 2 === 0 ? calcWidth : calcWidth + 1;
  const rawHeight = Math.round((targetWidth * 60) / 49);
  const targetHeight = rawHeight % 2 === 0 ? rawHeight : rawHeight + 1;

  const isAtCenter = phase === "lifting" || phase === "open" || phase === "closing_cover";
  const isCoverOpen = phase === "open" || phase === "expanding";

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden">
      {/* Dimmed Ambient Backdrop */}
      <div
        onClick={handleCloseBook}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-400 ease-out cursor-pointer ${
          isAtCenter ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Floating Close Button on top right */}
      <div
        className={`fixed top-6 right-6 z-[10001] transition-all duration-300 ${
          phase === "open"
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={handleCloseBook}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/75 hover:bg-black text-white/90 hover:text-white text-xs font-serif border border-white/20 shadow-2xl backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
        >
          <X className="w-4 h-4" />
          <span>Rafa Bırak</span>
        </button>
      </div>

      {/* 3D Book Container */}
      <div
        style={{
          perspective: 2000,
          position: "fixed",
          transition:
            phase === "expanding"
              ? "all 420ms cubic-bezier(0.4, 0, 0.2, 1)"
              : phase === "lifting"
              ? "all 420ms cubic-bezier(0.16, 1, 0.3, 1)"
              : phase === "returning"
              ? "all 420ms cubic-bezier(0.25, 1, 0.5, 1)"
              : "none",
          top: isAtCenter ? "47%" : `${initialRect.top}px`,
          left: isAtCenter ? "50%" : `${initialRect.left}px`,
          width: isAtCenter ? `${targetWidth}px` : `${initialRect.width}px`,
          height: isAtCenter ? `${targetHeight}px` : `${initialRect.height}px`,
          transform:
            phase === "expanding"
              ? "translate(-50%, -50%) scale(3.8)"
              : isAtCenter
              ? "translate(-50%, -50%)"
              : "translate(0, 0)",
          transformOrigin: "center center",
          opacity: phase === "expanding" ? 0 : 1,
          zIndex: 10000,
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* 1. INTERIOR PAGE (İç Sayfa - Jilet gibi keskin yazı, öncelikli z-index, taşmasız overflow-hidden) */}
          <div
            className={`absolute inset-0 bg-[#fefdf9] rounded-r-md border border-[#e5d8c8] shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-6 sm:p-8 flex flex-col justify-between z-20 overflow-hidden pointer-events-auto select-text transition-opacity duration-300 ${
              isCoverOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{
              transform: "translateZ(0px)",
              backfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
              textRendering: "optimizeLegibility",
            }}
          >
            {/* Smooth parchment gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/2 pointer-events-none" />

            {/* Inner Content - Fades in gracefully when cover swings open */}
            <div
              className={`relative z-10 transition-opacity duration-300 ${
                phase === "open" ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e2d5c3] pb-2.5 mb-3 text-xs font-serif text-[#8b6546]">
                <span className="uppercase tracking-widest font-bold">Gündüz Rakısı</span>
                <div className="flex items-center gap-2">
                  {/* Beğeni Sayısı */}
                  <span
                    className="flex items-center gap-1 text-rose-800 font-semibold bg-[#fcf2f2] px-2 py-0.5 rounded-full border border-rose-200/70 shadow-2xs"
                    title="Beğeni Sayısı"
                  >
                    <Heart className="w-3 h-3 text-rose-600 fill-rose-600" />
                    <span>{article.likes || 0}</span>
                  </span>
                  {/* Yudum Rozeti */}
                  <span className="flex items-center gap-1 text-amber-900 font-semibold bg-[#f4ece1] px-2 py-0.5 rounded-full border border-amber-900/15 shadow-2xs">
                    <RakiGlass className="w-3.5 h-3.5 text-amber-700" />
                    <span>{article.sips} yudumda</span>
                  </span>
                </div>
              </div>

              {/* Title - Razor sharp serif font */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2d1808] leading-tight mb-2.5 tracking-tight">
                {article.title}
              </h2>

              {/* Metalar: Eşlikçi Müzik & Tekil Okuma Sayısı */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {article.musicTitle && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#7a5b42] font-serif bg-[#f2e9dc] px-2.5 py-0.5 rounded-md border border-[#e0d2bf]">
                    <Music className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="font-medium">Eşlikçi: {article.musicTitle}</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1 text-[11px] text-[#7a5b42] font-serif bg-[#fbf6ee] px-2.5 py-0.5 rounded-md border border-[#e8ded0]">
                  <Eye className="w-3.5 h-3.5 text-amber-800/80" />
                  <span>Bu yazı <strong className="text-amber-950 font-bold">{article.views || 0}</strong> defa okundu</span>
                </div>
              </div>

              {/* Excerpt */}
              <p className="font-serif text-sm leading-relaxed text-[#3f2a1b] line-clamp-5 italic">
                {getCleanExcerpt(article.excerpt || article.content, 260)}
              </p>
            </div>

            {/* Read Action Button at bottom of page - Highest priority z-index */}
            <div
              className={`relative z-30 pt-4 border-t border-[#e2d5c3] flex items-center justify-between gap-3 transition-opacity duration-300 ${
                phase === "open" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <span className="text-xs font-serif text-[#9e7f67]">Sayfa 1</span>

              <button
                type="button"
                onClick={handleReadNow}
                className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3f220d] hover:bg-[#593114] active:scale-95 text-amber-100 font-serif font-bold text-xs sm:text-sm tracking-wide shadow-xl border border-[#c48d5d]/50 transition-all hover:scale-105 cursor-pointer z-50 pointer-events-auto"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Yazıyı Oku</span>
                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. SWINGING FRONT COVER (Hinged on the left spine) */}
          <div
            className={`absolute inset-0 z-30 ${phase === "open" ? "pointer-events-none" : "pointer-events-auto"}`}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              transition:
                phase === "closing_cover"
                  ? "transform 380ms cubic-bezier(0.25, 1, 0.5, 1)"
                  : phase === "open"
                  ? "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              transform: isCoverOpen ? "rotateY(-142deg)" : "rotateY(0deg)",
            }}
          >
            {/* 2A. FRONT COVER EXTERIOR (Dış Kapak - Raftaki kitabın %100 birebir aynısı) */}
            <div
              className="absolute inset-0 rounded-l-md rounded-r overflow-hidden shadow-book"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <BookCover
                title={article.title}
                variant={article.variant}
                color={article.coverColor}
                textColor={article.textColor}
                textured={article.textured}
                coverImage={article.coverImage}
              />
            </div>

            {/* 4B. FRONT COVER INTERIOR / ENDPAPER (İç Kapak Astarı - Temiz, antika krem kağıt) */}
            <div
              className="absolute inset-0 rounded-l-md rounded-r overflow-hidden p-6 sm:p-8 flex flex-col justify-between border-r-2 border-[#d5c3ab] bg-[#f7f2ea]"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                boxShadow: "inset 10px 0 20px rgba(0,0,0,0.12)",
              }}
            >
              {/* Subtle vintage bookplate mark */}
              <div className="opacity-45 text-[11px] font-serif tracking-widest uppercase text-amber-950 font-bold">
                Gündüz Rakısı • Mert Kip
              </div>
              <div className="flex items-center justify-between opacity-40 text-[10px] font-serif italic text-amber-950 border-t border-amber-900/20 pt-3">
                <span>Özel Ciltli Baskı</span>
                <span>Ankara</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Reading Page Cross-Fade Overlay */}
      <div
        className={`fixed inset-0 bg-[#f4eee5] transition-opacity duration-300 pointer-events-none ${
          phase === "expanding" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>,
    document.body
  );
};
