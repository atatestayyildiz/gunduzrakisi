"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CategoryItem } from "@/lib/types";
import { Feather, ChevronDown, Check, BookMarked } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const activeCategoryName = activeCategory ? activeCategory.name : "Tüm Kitaplar";

  return (
    <header className="relative w-full max-w-7xl mx-auto pt-4 sm:pt-6 px-3 sm:px-6">
      {/* Heavy Solid Oak Bookcase Crown Molding (Üst Kapak / Taç - Dropdown taşması için overflow-visible) */}
      <div className="relative rounded-t-3xl border-x-4 border-t-4 border-[#241004] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {/* Top Carved Molding Edge (Genişletilmiş masif meşe taç + Ahşap yakma yaldızlı imza) */}
        <div className="oak-shelf-top h-10 sm:h-12 w-full rounded-t-[22px] border-b border-[#ffd9a3]/20 flex items-center justify-end px-6 sm:px-8">
          <a
            href="https://moonworks.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            title="moonworks.com.tr hediyesidir"
            className="group relative inline-flex items-center gap-1.5 transition-all hover:brightness-125 cursor-pointer"
          >
            {/* Pyrography (Ahşap Dağlama / Yakma) & Gilded Gold Leaf Effect */}
            <span
              className="font-serif italic text-xs sm:text-[13px] tracking-wide select-none transition-all duration-300"
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

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
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

          {/* Categories Dropdown & Shelf Stats */}
          <div className="relative z-30 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            {/* Dropdown Menu Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-[#200d03]/90 hover:bg-[#2d1406] border border-amber-600/40 hover:border-amber-500 text-xs sm:text-sm font-serif text-[#f2e6d6] shadow-lg transition-all cursor-pointer backdrop-blur-xs"
              >
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform" />
                  <span className="text-[#a88265] text-xs">Kategori:</span>
                  <span className="font-bold text-amber-100">{activeCategoryName}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-amber-400/80 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Scrollable Dropdown Menu for 16+ Categories */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-[100] min-w-[240px] sm:min-w-[280px] bg-[#1a0c04]/98 border border-amber-600/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto">
                  <div className="px-3 py-2 border-b border-amber-900/30 flex items-center justify-between text-[11px] font-serif text-[#9e7a5c]">
                    <span>Kütüphane Rafları</span>
                    <span>{categories.length} Kategori</span>
                  </div>

                  {/* Scrollable Category Options */}
                  <div className="max-h-60 sm:max-h-72 overflow-y-auto mt-1 space-y-1 pr-1 custom-scrollbar">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-serif transition-all cursor-pointer text-left ${
                            isActive
                              ? "bg-amber-500/20 text-amber-200 font-bold border border-amber-500/40"
                              : "text-[#edd7c0] hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="truncate pr-2">{cat.name}</span>
                          {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shelf Stats */}
            <div className="text-xs text-[#d7be9f] font-serif italic">
              Kütüphanede <span className="text-amber-300 font-bold">{totalBooks}</span> kitap bulunuyor
            </div>
          </div>
        </div>

        {/* Lower Architrave Beam of the Crown */}
        <div className="oak-shelf-front h-4 w-full border-t border-[#c68953]/20" />
      </div>
    </header>
  );
};
