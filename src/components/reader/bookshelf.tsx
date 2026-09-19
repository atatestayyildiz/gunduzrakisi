"use client";

import React from "react";
import { BookArticle } from "@/lib/types";
import { BookItem } from "./book-item";
import { assignShelfBookSizes } from "@/lib/book-size-utils";

interface BookshelfProps {
  articles: BookArticle[];
  topLikedIds?: Set<string>;
  searchActive?: boolean;
}

export const Bookshelf = ({ articles, topLikedIds, searchActive = false }: BookshelfProps) => {
  // Her zaman en az 2 tam meşe raf gösterilir; kitap sayısı arttıkça 5'erli yeni raflar eklenir
  const SHELF_CAPACITY = 5;
  const MIN_SHELVES = 2;
  const totalShelfCount = Math.max(MIN_SHELVES, Math.ceil(articles.length / SHELF_CAPACITY));
  const shelves: BookArticle[][] = [];

  for (let i = 0; i < totalShelfCount; i++) {
    shelves.push(articles.slice(i * SHELF_CAPACITY, (i + 1) * SHELF_CAPACITY));
  }

  return (
    <main className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 pb-28">
      {/* Outer Heavy Oak Bookcase Furniture Frame (Düz alt birleşim, tek parça monolitik yapı) */}
      <div className="relative shadow-[0_30px_60px_rgba(0,0,0,0.65)] border-x-4 border-[#200d02] flex">
        {/* Left Heavy Vertical Oak Pillar (Yan Duvar) */}
        <div className="oak-side-pillar w-6 sm:w-10 md:w-12 shrink-0 border-r-2 border-[#190901] shadow-[inset_-8px_0_15px_rgba(0,0,0,0.6)] relative z-20" />

        {/* Center Cabinet Interior (Arka Panel + Raflar) */}
        <div className="oak-backboard flex-1 flex flex-col relative">
          {/* Inner ambient shadows cast by side pillars and top crown */}
          <div className="absolute inset-0 shadow-[inset_0_12px_25px_rgba(0,0,0,0.7),inset_15px_0_20px_rgba(0,0,0,0.5),inset_-15px_0_20px_rgba(0,0,0,0.5)] pointer-events-none z-10" />

          {/* Top Divider Shelf Beam between Header and Top Shelf Compartment */}
          <div className="relative z-20 w-full">
            {/* Top surface */}
            <div className="oak-shelf-top h-3.5 sm:h-4 w-full border-t border-[#f4c88f]/30" />
            {/* Front beveled oak face */}
            <div className="oak-shelf-front h-7 sm:h-8 w-full border-b-2 border-[#1a0b02]" />
          </div>

          {/* Shelves Stack */}
          {shelves.map((shelfBooks, shelfIndex) => (
            <div key={shelfIndex} className="group/shelf relative flex flex-col pt-3 sm:pt-4 hover:z-40">
              {/* Natural Deep Soffit Shadow under upper beam (Normal gölgeli kısım) */}
              <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10" />

              {/* Warm Downward Ambient LED Lighting (Normalde kapalı, mouse rafa geldiğinde yavaşça açılır) */}
              <div className="absolute top-0 inset-x-0 pointer-events-none z-15 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-700 ease-out">
                {/* 1. Recessed LED Strip Diffuser Channel */}
                <div className="shelf-led-channel w-full" />

                {/* 2. Downward Warm Light Wash onto Oak Backboard & Book Spines */}
                <div className="shelf-led-wash h-44 sm:h-60 w-full" />

                {/* 3. Soft Warm Ambient Amber Glow Spotlights */}
                <div className="absolute top-0 inset-x-0 h-48 flex justify-around opacity-70 pointer-events-none">
                  <div className="w-52 h-40 rounded-full bg-amber-500/18 blur-3xl -translate-y-8" />
                  <div className="w-64 h-44 rounded-full bg-amber-400/22 blur-3xl -translate-y-8" />
                  <div className="w-52 h-40 rounded-full bg-amber-500/18 blur-3xl -translate-y-8" />
                </div>
              </div>

              {/* Downward Light Curtain (Kitapların önüne ve raf boşluğuna dökülen amber ışık perdesi) */}
              <div
                className="absolute top-0 inset-x-0 h-48 sm:h-64 pointer-events-none z-25 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-700 ease-out"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.08) 28%, rgba(217, 119, 6, 0.02) 60%, transparent 100%)",
                  mixBlendMode: "screen",
                }}
              />

              {/* Books Row: exactly 5 slots per shelf, height tuned to 1.12x of book */}
              <div className="relative z-20 hover:z-50 w-full px-2 sm:px-6 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 sm:gap-x-4 items-end justify-items-center h-[196px] sm:h-[210px] md:h-[228px] lg:h-[248px] xl:h-[270px]">
                {shelfBooks.length > 0 ? (
                  assignShelfBookSizes(shelfBooks, shelfIndex).map(({ book, size }, idx) => (
                    <BookItem
                      key={book.id}
                      article={book}
                      index={idx}
                      size={size}
                      isTopLiked={topLikedIds?.has(book.id)}
                    />
                  ))
                ) : (
                  /* Boş Raf Durumu: Ekran boş kalmaz, ahşap raf atmosferi ve yönlendirme korunur */
                  <div className="col-span-full h-full flex flex-col items-center justify-center text-center px-4 py-4">
                    {shelfIndex === 0 && searchActive ? (
                      <div className="flex flex-col items-center justify-center pointer-events-auto">
                        <p className="font-serif text-sm sm:text-base text-[#faebd7]/95 font-medium">
                          Aramanızla eşleşen kitap bulunamadı.
                        </p>
                        <p className="text-xs text-amber-200/80 mt-1 font-serif italic">
                          Farklı bir arama terimi deneyebilir veya arama kutusunu temizleyebilirsiniz.
                        </p>
                      </div>
                    ) : shelfIndex === 0 && articles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center pointer-events-auto">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                          <div className="w-8 h-px bg-amber-500/50" />
                          <span className="font-serif italic text-xs text-amber-200/90 tracking-wide">
                            1. Raf Henüz Boş
                          </span>
                          <div className="w-8 h-px bg-amber-500/50" />
                        </div>
                        <p className="font-serif text-xs sm:text-sm text-[#faebd7]/90 max-w-md drop-shadow-xs">
                          Mert Kip&apos;in edebi yazıları ve denemeleri yakında bu raflarda yerini alacak.
                        </p>
                      </div>
                    ) : shelfIndex === 0 && articles.length > 0 ? (
                      <div className="flex flex-col items-center justify-center">
                        <p className="font-serif text-xs sm:text-sm text-[#faebd7]/90">
                          Bu kategoride henüz bir deneme bulunmuyor.
                        </p>
                        <p className="text-[11px] text-[#ddbe9d]/80 mt-1 font-serif italic">
                          Tüm rafları görüntülemek için yukarıdan &apos;Tüm Kitaplar&apos; kategorisini seçebilirsiniz.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center pointer-events-none opacity-40">
                        <span className="font-serif italic text-xs text-amber-200/60 tracking-wider">
                          {shelfIndex + 1}. Raf • Yeni denemeler için hazır bekliyor
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Heavy Solid Oak Shelf Beam (Ara Raf) */}
              <div className="relative z-10 w-full mt-0">
                {/* Top Surface of Shelf where books rest */}
                <div className="oak-shelf-top h-4 sm:h-5 w-full border-t border-[#f4c88f]/30 flex items-center justify-between px-6" />

                {/* Thick Front Facing Beveled Edge of Oak Plank */}
                <div className="oak-shelf-front h-9 sm:h-12 w-full flex items-center justify-between px-4 sm:px-8 border-b-2 border-[#1a0b02]">
                  {/* Brass Plaque with Carved Shelf Number */}
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-md border border-amber-600/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-xs" />
                    <span className="text-[10px] sm:text-[11px] font-serif tracking-widest text-[#f5cca0] uppercase font-bold">
                      RAF #{shelfIndex + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Heavy Vertical Oak Pillar (Yan Duvar) */}
        <div className="oak-side-pillar w-6 sm:w-10 md:w-12 shrink-0 border-l-2 border-[#190901] shadow-[inset_8px_0_15px_rgba(0,0,0,0.6)] relative z-20" />
      </div>

      {/* Heavy Oak Base Pedestal (Taban Mobilyası - Gövdeye sıfır ve kesintisiz masif birleşim) */}
      <div className="relative w-full rounded-b-3xl overflow-hidden border-x-4 border-b-4 border-[#200d02] shadow-[0_25px_35px_rgba(0,0,0,0.7)] -mt-px">
        {/* Upper Step of Base */}
        <div className="oak-shelf-top h-3.5 sm:h-4 w-full" />
        {/* Main Heavy Base Plinth with Solid Texture */}
        <div className="oak-texture-surface h-10 sm:h-12 w-full flex items-center justify-start px-6 sm:px-8 border-b-2 border-[#120601]">
          {/* Sol Alttaki Ahşap Yakma Yaldızlı İmza */}
          <a
            href="https://moonworks.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            title="moonworks.com.tr hediyesidir"
            className="group relative inline-flex items-center gap-1.5 transition-all hover:brightness-125 cursor-pointer"
          >
            {/* Pyrography (Ahşap Dağlama / Yakma) & Gilded Gold Leaf Effect */}
            <span
              className="font-serif italic text-[11px] sm:text-[12px] tracking-wide select-none transition-all duration-300"
              style={{
                color: "#edd2b4",
                textShadow:
                  "0 1px 1px rgba(0, 0, 0, 0.95), 0 -1px 1px rgba(35, 14, 3, 0.9), 0 0 8px rgba(245, 175, 80, 0.4)",
                letterSpacing: "0.03em",
              }}
            >
              <span className="font-semibold text-[#fae5cc]">moonworks.com.tr</span>{" "}
              <span className="text-[#e2be96]/90 font-normal">hediyesidir</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-[#f3c892] opacity-60 shadow-[0_0_4px_#f59e0b] group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </main>
  );
};
