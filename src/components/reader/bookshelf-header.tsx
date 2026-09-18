"use client";

import React from "react";
import Link from "next/link";
import { CategoryItem } from "@/lib/types";
import { Feather, Filter, Sparkles } from "lucide-react";

interface BookshelfHeaderProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  totalBooks: number;
}

export const BookshelfHeader = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalBooks,
}: BookshelfHeaderProps) => {
  return (
    <header className="relative w-full max-w-7xl mx-auto pt-4 sm:pt-6 px-3 sm:px-6">
      {/* Heavy Solid Oak Bookcase Crown Molding (Üst Kapak / Taç) */}
      <div className="relative rounded-t-3xl overflow-hidden border-x-4 border-t-4 border-[#241004] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {/* Top Carved Molding Edge */}
        <div className="oak-shelf-top h-6 w-full border-b border-[#ffd9a3]/20 flex items-center justify-center">
          <div className="w-1/3 h-1 rounded-full bg-black/40 blur-2xs" />
        </div>

        {/* Second Step Bevel of Cornice */}
        <div className="h-3.5 w-full bg-[#3a1b07] border-b border-black/60 shadow-inner" />

        {/* Main Solid Oak Header Board */}
        <div className="oak-texture-surface px-6 py-8 sm:px-12 text-white relative">
          {/* Natural Wood Vignette & Ambient Light */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title & Motto */}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-bold tracking-widest font-serif text-[#faecd8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  GÜNDÜZ RAKISI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium tracking-widest uppercase bg-[#f5e6d3]/15 text-[#faecd8] px-3 py-0.5 rounded-full border border-[#f5e6d3]/30 shadow-sm backdrop-blur-xs">
                  Mert Kip
                </span>
              </div>
              <p className="mt-2 text-sm sm:text-base font-serif italic text-[#e7cfb8] tracking-wide max-w-xl drop-shadow-sm">
                “Akşama kalmayan sohbetler, ince şeylerin hatırı, Ankara ve bozkır...”
              </p>
            </div>

            {/* Actions & Gift Badge */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              {/* Moonworks Gift Badge */}
              <div
                title="moonworks.com.tr hediyesidir"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/45 backdrop-blur-xs border border-amber-500/30 text-xs text-[#ebd7c2] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-amber-100">moonworks.com.tr</span>
                <span className="text-white/30">•</span>
                <span className="text-[11px] text-amber-200/90 font-serif">Hediyesidir</span>
              </div>

              {/* Link to Writer Room */}
              <Link
                href="/yazar"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a1305]/90 hover:bg-[#3d1c07] border border-amber-600/50 text-amber-100 text-xs sm:text-sm font-serif font-medium transition-all shadow-lg hover:shadow-amber-950/60"
              >
                <Feather className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Yazar Odası</span>
              </Link>
            </div>
          </div>

          {/* Categories Bar & Shelf Stats */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <div className="flex items-center gap-1 text-xs text-[#dec2a5] mr-1 font-serif">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Raflar:</span>
              </div>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#faf5ee] text-[#331805] shadow-[0_2px_8px_rgba(0,0,0,0.4)] font-bold scale-105 border border-amber-300"
                        : "bg-black/40 hover:bg-black/60 text-[#eed9c4] border border-white/10"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-[#d7be9f] font-serif italic">
              Kitaplıkta <span className="text-amber-300 font-bold">{totalBooks}</span> deneme bulunuyor
            </div>
          </div>
        </div>

        {/* Lower Architrave Beam of the Crown */}
        <div className="oak-shelf-front h-4 w-full border-t border-[#c68953]/20" />
      </div>
    </header>
  );
};
