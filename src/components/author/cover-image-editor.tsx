"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookCover } from "@/components/ui/book";
import { CoverImageTransform } from "@/lib/types";
import { Move, ZoomIn, ZoomOut, RotateCcw, Check, X } from "lucide-react";

export const DEFAULT_COVER_TRANSFORM: CoverImageTransform = { x: 0, y: 0, zoom: 1 };

const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = Math.round((PREVIEW_WIDTH * 60) / 49);
// zoom 1 = görsel alanı tam doldurur (çubuğun ortası, 0).
// Sağa doğru ZOOM_MAX'a kadar yakınlaşır; sola doğru görselin tamamı sığana kadar
// (en az ZOOM_FLOOR'a kadar) uzaklaşır, boş kalan kenarlarda cilt rengi görünür.
const ZOOM_MAX = 3;
const ZOOM_FLOOR = 0.5;
const OFFSET_LIMIT = 50; // background-position %0..%100 aralığına karşılık gelir

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface CoverImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  coverImage: string;
  transform?: CoverImageTransform;
  onTransformChange: (t: CoverImageTransform) => void;
  title: string;
  titleScale?: number;
  variant: "simple" | "stripe";
  coverColor: string;
  textColor: string;
  textured: boolean;
}

export const CoverImageEditor = ({
  isOpen,
  onClose,
  coverImage,
  transform,
  onTransformChange,
  title,
  titleScale,
  variant,
  coverColor,
  textColor,
  textured,
}: CoverImageEditorProps) => {
  const t = transform || DEFAULT_COVER_TRANSFORM;
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const tRef = useRef(t);
  // Görselin gerçek en/boy oranı (sürükleme hassasiyetini hesaplamak için)
  const [imageAspect, setImageAspect] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !coverImage) return;
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive && img.naturalWidth && img.naturalHeight) {
        setImageAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = coverImage;
    return () => {
      alive = false;
    };
  }, [isOpen, coverImage]);

  // Görsel alanı yüksekliği: Çift renklide kapağın üst yarısı, yekparede tamamı
  const imageAreaHeight = variant === "stripe" ? PREVIEW_HEIGHT / 2 : PREVIEW_HEIGHT;

  // Görselin alanı taşan kısmı (px): kaydırmanın %100'ü bu mesafeye denk gelir.
  // Böylece fareyle kaç piksel çekilirse görsel de o kadar kayar.
  const aspect = imageAspect ?? PREVIEW_WIDTH / imageAreaHeight;
  const coverW = Math.max(PREVIEW_WIDTH, imageAreaHeight * aspect);
  const coverH = Math.max(imageAreaHeight, PREVIEW_WIDTH / aspect);
  // Görselin tamamının sığdığı ölçek (en fazla 1)
  const containZoom = Math.min(PREVIEW_WIDTH / coverW, imageAreaHeight / coverH);
  const zoomMin = Math.min(containZoom, ZOOM_FLOOR);

  // Çubuk değeri (-100..100, orta 0) <-> zoom
  const zoomFromSlider = (v: number) =>
    v >= 0 ? 1 + (v / 100) * (ZOOM_MAX - 1) : 1 + (v / 100) * (1 - zoomMin);
  const sliderFromZoom = (z: number) =>
    z >= 1 ? ((z - 1) / (ZOOM_MAX - 1)) * 100 : ((z - 1) / (1 - zoomMin)) * 100;

  const update = (patch: Partial<CoverImageTransform>) => {
    const next = { ...tRef.current, ...patch };
    onTransformChange({
      x: clamp(next.x, -OFFSET_LIMIT, OFFSET_LIMIT),
      y: clamp(next.y, -OFFSET_LIMIT, OFFSET_LIMIT),
      zoom: clamp(next.zoom, zoomMin, ZOOM_MAX),
      aspect: imageAspect ?? next.aspect,
    });
  };
  const updateRef = useRef(update);
  useLayoutEffect(() => {
    tRef.current = t;
    updateRef.current = update;
  });

  // Tekerlek ile yakınlaştırma (pasif olmayan dinleyici, sayfa kaymasın)
  useEffect(() => {
    const el = surfaceRef.current;
    if (!isOpen || !el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      updateRef.current({ zoom: tRef.current.zoom - e.deltaY * 0.0015 });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !coverImage) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: t.x, y: t.y };
  };

  const overflowX = t.zoom * coverW - PREVIEW_WIDTH;
  const overflowY = t.zoom * coverH - imageAreaHeight;
  // Görsel alandan küçükken (taşma negatif) kaydırma yönü tersine döner;
  // kaydırıcılar bu işaretle çevrilir ki sağa çekmek her zaman görseli sağa götürsün.
  const dirX = overflowX < -1 ? -1 : 1;
  const dirY = overflowY < -1 ? -1 : 1;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    const dx = e.clientX - start.px;
    const dy = e.clientY - start.py;
    update({
      x: Math.abs(overflowX) > 1 ? start.x + (dx / overflowX) * 100 : start.x,
      y: Math.abs(overflowY) > 1 ? start.y + (dy / overflowY) * 100 : start.y,
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const sliderClass = "w-full accent-amber-700 cursor-pointer";
  const zoomSlider = Math.round(clamp(sliderFromZoom(t.zoom), -100, 100));
  const zoomLabel = zoomSlider > 0 ? `+${zoomSlider}` : `${zoomSlider}`;

  // Çekmece transform'lu olduğu için fixed pencere onun içine hapsolur; body'ye taşınır
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar rounded-2xl border-2 border-[#a87d29]/50 shadow-[0_20px_60px_rgba(0,0,0,0.92)]"
        style={{ backgroundColor: "#f5ead8" }}
      >
        <div className="oak-shelf-front px-5 py-3.5 flex items-center justify-between border-b-2 border-[#241307]">
          <h2 className="font-serif font-bold text-base text-amber-100 tracking-wide flex items-center gap-2">
            <Move className="w-4 h-4 text-amber-300" />
            Kapak Görselini Ayarla
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-200 hover:text-white bg-[#241307]/80 border border-[#a87d29]/40 cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-[11px] font-serif italic text-[#6e5036] text-center">
            Görseli sürükleyerek taşıyın, fare tekerleği veya kaydırıcı ile büyütüp küçültün.
          </p>

          {/* Canlı önizleme + sürükleme yüzeyi */}
          <div className="flex justify-center">
            <div
              className="relative rounded-l-md rounded-r shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
              style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            >
              <BookCover
                title={title || "Yazı Başlığı"}
                variant={variant}
                color={coverColor}
                textColor={textColor}
                textured={textured}
                coverImage={coverImage}
                coverImageTransform={t}
                titleScale={titleScale}
                width={PREVIEW_WIDTH}
              />
              <div
                ref={surfaceRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="absolute inset-x-0 top-0 z-30 cursor-grab active:cursor-grabbing touch-none border-2 border-dashed border-amber-300/70 rounded-l-md rounded-r"
                style={{ height: imageAreaHeight }}
                title="Sürükleyerek taşıyın"
              />
            </div>
          </div>

          {/* Kaydırıcılar */}
          <div className="space-y-3 p-4 rounded-xl bg-white/60 border border-[#d8c7b4]">
            <div>
              <div className="flex items-center justify-between text-xs font-serif font-semibold text-[#4a2b13] mb-1">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-amber-800" /> Yakınlaştır / Uzaklaştır
                </span>
                <span className="text-amber-900/70">{zoomLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ zoom: zoomFromSlider(clamp(zoomSlider - 10, -100, 100)) })}
                  className="p-1 rounded-md bg-[#e8dccb] hover:bg-[#dccbb4] text-amber-900 cursor-pointer"
                  title="Küçült"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={zoomSlider}
                  onChange={(e) => update({ zoom: zoomFromSlider(Number(e.target.value)) })}
                  className={sliderClass}
                />
                <button
                  type="button"
                  onClick={() => update({ zoom: zoomFromSlider(clamp(zoomSlider + 10, -100, 100)) })}
                  className="p-1 rounded-md bg-[#e8dccb] hover:bg-[#dccbb4] text-amber-900 cursor-pointer"
                  title="Büyüt"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-serif font-semibold text-[#4a2b13] mb-1">
                <span>Sağa / Sola</span>
                <span className="text-amber-900/70">{Math.round(t.x * dirX)}</span>
              </div>
              <input
                type="range"
                min={-OFFSET_LIMIT}
                max={OFFSET_LIMIT}
                step={0.5}
                value={t.x * dirX}
                onChange={(e) => update({ x: Number(e.target.value) * dirX })}
                className={sliderClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-serif font-semibold text-[#4a2b13] mb-1">
                <span>Yukarı / Aşağı</span>
                <span className="text-amber-900/70">{Math.round(t.y * dirY)}</span>
              </div>
              <input
                type="range"
                min={-OFFSET_LIMIT}
                max={OFFSET_LIMIT}
                step={0.5}
                value={t.y * dirY}
                onChange={(e) => update({ y: Number(e.target.value) * dirY })}
                className={sliderClass}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onTransformChange(DEFAULT_COVER_TRANSFORM)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#e8dccb] hover:bg-[#dccbb4] text-[#4a2b13] text-xs font-serif font-semibold border border-[#d2c0aa] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sıfırla
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#4d2810] via-[#753d16] to-[#3a1d0a] text-[#faedd9] text-xs font-serif font-bold border border-[#d4af37]/60 shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-amber-300" />
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
