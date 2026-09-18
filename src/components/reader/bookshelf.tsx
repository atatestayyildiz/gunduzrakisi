"use client";

import React from "react";
import { BookArticle } from "@/lib/types";
import { BookItem } from "./book-item";
import { BookOpen } from "lucide-react";

interface BookshelfProps {
  articles: BookArticle[];
}

export const Bookshelf = ({ articles }: BookshelfProps) => {
  // Split articles into rows of exactly 5 books per shelf
  const SHELF_CAPACITY = 5;
  const shelves: BookArticle[][] = [];

  for (let i = 0; i < articles.length; i += SHELF_CAPACITY) {
    shelves.push(articles.slice(i, i + SHELF_CAPACITY));
  }

  if (articles.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex flex-col items-center justify-center p-10 rounded-2xl oak-texture-surface border-2 border-[#693917] shadow-2xl text-amber-100">
          <BookOpen className="w-12 h-12 text-amber-400 mb-3 opacity-80" />
          <p className="font-serif text-lg text-[#faecd8]">Bu rafta henüz bir deneme bulunmuyor.</p>
          <p className="text-xs text-[#ddbe9d] mt-1 font-serif">Tüm rafları görüntülemek için kategoriyi değiştirebilirsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 pb-28">
      {/* Outer Heavy Oak Bookcase Furniture Frame */}
      <div className="relative shadow-[0_30px_60px_rgba(0,0,0,0.65)] rounded-b-3xl border-x-4 border-b-4 border-[#200d02] overflow-hidden flex">
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
            <div className="oak-shelf-front h-8 sm:h-10 w-full flex items-center justify-between px-6 border-b-2 border-[#1a0b02]">
              <div className="w-16 h-1 rounded-full bg-amber-600/30 shadow-inner" />
              <span className="text-[10px] text-[#dec09e]/75 font-serif tracking-widest uppercase font-semibold">
                Masif Meşe Kütüphane • Üst Bölme
              </span>
              <div className="w-16 h-1 rounded-full bg-amber-600/30 shadow-inner" />
            </div>
            {/* Deep drop shadow falling onto the first book row */}
            <div className="h-8 w-full bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />
          </div>

          {/* Shelves Stack */}
          {shelves.map((shelfBooks, shelfIndex) => (
            <div key={shelfIndex} className="relative flex flex-col pt-3 sm:pt-4">
              {/* Backboard shadow above books */}
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-0" />

              {/* Books Row: exactly 5 slots per shelf, height tuned to 1.12x of book */}
              <div className="relative z-10 w-full px-2 sm:px-6 md:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 sm:gap-x-4 items-end justify-items-center h-[196px] sm:h-[210px] md:h-[228px] lg:h-[248px] xl:h-[270px]">
                {shelfBooks.map((article, idx) => (
                  <BookItem key={article.id} article={article} index={idx} />
                ))}

                {/* Empty Book Slots placeholders for remaining space on shelf */}
                {Array.from({ length: Math.max(0, SHELF_CAPACITY - shelfBooks.length) }).map((_, emptyIdx) => (
                  <div
                    key={`empty-${emptyIdx}`}
                    className="hidden lg:flex flex-col items-center justify-end h-[89%] w-[170px] border-2 border-dashed border-amber-900/20 rounded-lg p-3 opacity-40 hover:opacity-70 transition-opacity pointer-events-none"
                  >
                    <span className="text-[11px] font-serif italic text-amber-200/60 text-center">
                      Yeni deneme için ayrıldı...
                    </span>
                  </div>
                ))}
              </div>

              {/* Heavy Solid Oak Shelf Beam (Ara Raf) */}
              <div className="relative z-20 w-full mt-2">
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

                  {/* Center Brass Trim Accent */}
                  <div className="hidden sm:block w-24 h-1 rounded-full bg-amber-600/30 shadow-inner" />

                  {/* Engraved Furniture Housemark */}
                  <span className="text-[10px] text-[#dec09e]/70 font-serif italic drop-shadow-xs">
                    Gündüz Rakısı • Meşe Kitaplık
                  </span>
                </div>

                {/* Deep Drop Shadow cast by shelf onto backboard below */}
                <div className="h-10 w-full bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Heavy Vertical Oak Pillar (Yan Duvar) */}
        <div className="oak-side-pillar w-6 sm:w-10 md:w-12 shrink-0 border-l-2 border-[#190901] shadow-[inset_8px_0_15px_rgba(0,0,0,0.6)] relative z-20" />
      </div>

      {/* Heavy Oak Base Pedestal (Taban Mobilyası) */}
      <div className="relative w-full rounded-b-2xl overflow-hidden border-t-2 border-[#f7cb93]/30 shadow-[0_25px_35px_rgba(0,0,0,0.7)]">
        {/* Upper Step of Base */}
        <div className="oak-shelf-top h-4 w-full" />
        {/* Main Heavy Base Plinth with Solid Texture */}
        <div className="oak-texture-surface h-10 sm:h-12 w-full flex items-center justify-center border-b-4 border-[#120601]">
          <div className="w-64 h-1 rounded-full bg-black/50 shadow-inner" />
        </div>
      </div>
    </main>
  );
};
