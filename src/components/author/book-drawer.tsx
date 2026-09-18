"use client";

import React, { useState } from "react";
import { Book } from "@/components/ui/book";
import { CategoryItem } from "@/lib/types";
import {
  X,
  Sliders,
  Palette,
  Music,
  FolderPlus,
  Bookmark,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface BookDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  category: string;
  onCategoryChange: (cat: string) => void;
  categories: CategoryItem[];
  onAddCategory: (name: string) => void;
  coverColor: string;
  onCoverColorChange: (color: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  variant: "simple" | "stripe";
  onVariantChange: (v: "simple" | "stripe") => void;
  textured: boolean;
  onTexturedChange: (val: boolean) => void;
  coverImage?: string;
  onCoverImageChange: (img: string) => void;
  heightRatio: number;
  onHeightRatioChange: (ratio: number) => void;
  musicTitle: string;
  onMusicTitleChange: (v: string) => void;
  musicArtist: string;
  onMusicArtistChange: (v: string) => void;
  musicUrl: string;
  onMusicUrlChange: (v: string) => void;
  sips: number;
  readTimeMinutes: number;
  onSaveToShelf: () => void;
  isSaving?: boolean;
}

const PRESET_PALETTES = [
  { label: "Bozkır Sarısı", color: "#b45309" },
  { label: "Mülkiye Mavisi", color: "#1e3a5f" },
  { label: "Kiremit", color: "#991b1b" },
  { label: "Zeytin Yeşili", color: "#2d6a4f" },
  { label: "Kadife Bordo", color: "#831843" },
  { label: "Kömür Grisi", color: "#27272a" },
  { label: "Koyu Petrol", color: "#0f766e" },
  { label: "Toprak Kahvesi", color: "#78350f" },
];

export const BookDrawer = ({
  isOpen,
  onToggle,
  title,
  category,
  onCategoryChange,
  categories,
  onAddCategory,
  coverColor,
  onCoverColorChange,
  textColor,
  onTextColorChange,
  variant,
  onVariantChange,
  textured,
  onTexturedChange,
  coverImage,
  onCoverImageChange,
  heightRatio,
  onHeightRatioChange,
  musicTitle,
  onMusicTitleChange,
  musicArtist,
  onMusicArtistChange,
  musicUrl,
  onMusicUrlChange,
  sips,
  readTimeMinutes,
  onSaveToShelf,
  isSaving,
}: BookDrawerProps) => {
  const [newCatName, setNewCatName] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName("");
      setShowNewCatInput(false);
    }
  };

  return (
    <>
      {/* Brass / Leather Vintage Drawer Pull Handle on the Right Edge */}
      <div
        onClick={onToggle}
        title="Kitap Cildi & Raf Ayarları Çekmecesi"
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer flex items-center transition-all duration-300 ${
          isOpen ? "translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        }`}
      >
        <div className="flex items-center gap-1.5 py-4 px-2.5 rounded-l-2xl bg-[#4a2810] hover:bg-[#5e3415] text-[#fce8d5] shadow-2xl border-y border-l border-[#c48d5d]/50 group">
          <ChevronLeft className="w-4 h-4 text-amber-300 group-hover:-translate-x-0.5 transition-transform" />
          <div className="flex flex-col items-center gap-1">
            <Bookmark className="w-4 h-4 text-amber-300" />
            <span
              className="text-[11px] font-serif font-bold tracking-widest uppercase writing-mode-vertical"
              style={{ writingMode: "vertical-rl" }}
            >
              Çekmece
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 lg:hidden"
        />
      )}

      {/* Sliding Drawer Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#f8f4ec] border-l-2 border-[#d5c2ad] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header with Wood Plank Finish */}
        <div className="oak-wood-beam px-6 py-4 flex items-center justify-between text-white border-b border-black/30 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-300" />
            <h2 className="font-serif font-bold text-lg text-amber-100">Kitap Cildi & Raf Ayarları</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 text-sm text-[#3b2413]">
          {/* Live 3D Book Preview */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#eee4d6]/70 border border-[#d6c3ad] shadow-inner">
            <span className="text-xs font-serif italic text-[#755338] mb-4">
              Canlı Kitap Önizlemesi
            </span>
            <div className="py-2">
              <Book
                title={title || "Yazı Başlığı"}
                variant={variant}
                color={coverColor}
                textColor={textColor}
                textured={textured}
                coverImage={coverImage}
                heightRatio={heightRatio}
                width={160}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-serif text-amber-900 bg-white/70 px-3 py-1 rounded-full border border-[#d2c0aa]">
              <span>Okuma: ~{readTimeMinutes} dk</span>
              <span>•</span>
              <strong className="font-semibold">{sips} yudumda biter</strong>
            </div>
          </div>

          {/* Cilt Tipi (Variant) */}
          <div className="space-y-2">
            <label className="font-serif font-semibold text-[#4a2b13] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-800" />
              <span>Kapak Tasarım Modeli</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onVariantChange("stripe")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  variant === "stripe"
                    ? "bg-[#3e220e] text-white border-[#3e220e] shadow-sm font-semibold"
                    : "bg-white/70 hover:bg-white text-[#4a2b13] border-[#d8c7b4]"
                }`}
              >
                Çift Renkli (Stripe)
              </button>
              <button
                type="button"
                onClick={() => onVariantChange("simple")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  variant === "simple"
                    ? "bg-[#3e220e] text-white border-[#3e220e] shadow-sm font-semibold"
                    : "bg-white/70 hover:bg-white text-[#4a2b13] border-[#d8c7b4]"
                }`}
              >
                Yekpare (Simple)
              </button>
            </div>
          </div>

          {/* Renk Seçimi */}
          <div className="space-y-2">
            <label className="font-serif font-semibold text-[#4a2b13] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-800" />
                <span>Cilt Rengi</span>
              </span>
              <input
                type="color"
                value={coverColor}
                onChange={(e) => onCoverColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-[#d5c3ab] cursor-pointer"
                title="Özel Renk Seç"
              />
            </label>

            <div className="grid grid-cols-4 gap-2">
              {PRESET_PALETTES.map((p) => (
                <button
                  key={p.color}
                  type="button"
                  onClick={() => onCoverColorChange(p.color)}
                  className={`flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                    coverColor === p.color
                      ? "ring-2 ring-amber-800 border-transparent scale-105 shadow-sm"
                      : "border-[#d8c7b4] hover:scale-102"
                  }`}
                >
                  <span
                    className="w-full h-6 rounded-md shadow-xs"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-[10px] text-center truncate mt-1 text-[#624733]">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Metin Rengi & Doku */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-semibold text-[#4a2b13] mb-1">
                Yazı Rengi
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onTextColorChange("#ffffff")}
                  className={`flex-1 py-1.5 rounded-lg border text-xs cursor-pointer ${
                    textColor === "#ffffff" ? "bg-white font-bold border-amber-800 ring-1 ring-amber-800" : "bg-white/50 border-[#d8c7b4]"
                  }`}
                >
                  Açık (Beyaz)
                </button>
                <button
                  type="button"
                  onClick={() => onTextColorChange("#171717")}
                  className={`flex-1 py-1.5 rounded-lg border text-xs cursor-pointer ${
                    textColor === "#171717" ? "bg-neutral-900 text-white font-bold border-amber-800" : "bg-neutral-800 text-white/80 border-[#d8c7b4]"
                  }`}
                >
                  Koyu
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-semibold text-[#4a2b13] mb-1">
                Kapak Dokusu
              </label>
              <button
                type="button"
                onClick={() => onTexturedChange(!textured)}
                className={`w-full py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                  textured
                    ? "bg-amber-900 text-amber-50 border-amber-900 font-semibold"
                    : "bg-white/60 text-[#4a2b13] border-[#d8c7b4]"
                }`}
              >
                {textured ? "Doku Açık" : "Düz"}
              </button>
            </div>
          </div>

          {/* Kitap Boy Varyasyonu (Organik Raflar) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-serif">
              <span className="font-semibold text-[#4a2b13]">Kitap Boy Oranı (Organik Raf Farkı)</span>
              <span className="text-amber-900">{heightRatio.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.92"
              max="1.08"
              step="0.02"
              value={heightRatio}
              onChange={(e) => onHeightRatioChange(parseFloat(e.target.value))}
              className="w-full accent-amber-800 cursor-pointer"
            />
          </div>

          {/* Kapak Görseli (Opsiyonel) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-serif font-semibold text-[#4a2b13]">
              Özel Kapak Görseli URL (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="https://... (Örn: Blogger / Unsplash görseli)"
              value={coverImage || ""}
              onChange={(e) => onCoverImageChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#d8c7b4] text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
            />
          </div>

          {/* Kategori Seçimi */}
          <div className="space-y-2">
            <label className="font-serif font-semibold text-[#4a2b13] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-amber-800" />
                <span>Kategori</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-[11px] text-amber-900 underline hover:text-amber-950 cursor-pointer"
              >
                {showNewCatInput ? "Vazgeç" : "+ Yeni Kategori"}
              </button>
            </label>

            {showNewCatInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Yeni kategori adı..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#d8c7b4] text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCat}
                  className="px-3 py-1.5 rounded-xl bg-[#4a2810] text-amber-100 text-xs font-medium cursor-pointer"
                >
                  Ekle
                </button>
              </div>
            )}

            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#d8c7b4] text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-800/40 cursor-pointer"
            >
              {categories.filter((c) => c.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Müzik Eşlikçisi (Opsiyonel) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-[#ede4d5]/60 border border-[#d8c7b3]">
            <label className="font-serif font-semibold text-[#4a2b13] flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-800" />
              <span>Yazının Şarkısı (Opsiyonel)</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Şarkı Adı (örn: Balıkesir)"
                value={musicTitle}
                onChange={(e) => onMusicTitleChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c7b4] text-xs"
              />
              <input
                type="text"
                placeholder="Sanatçı (örn: Birsen Tezer)"
                value={musicArtist}
                onChange={(e) => onMusicArtistChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c7b4] text-xs"
              />
              <input
                type="text"
                placeholder="Spotify / Müzik Linki"
                value={musicUrl}
                onChange={(e) => onMusicUrlChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c7b4] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer Action Button */}
        <div className="p-5 border-t border-[#d8c7b4] bg-[#efe8dc] sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onSaveToShelf}
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl bg-[#3f220d] hover:bg-[#593114] text-amber-100 font-serif font-bold text-sm tracking-wide shadow-lg border border-[#c48d5d]/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSaving ? "Rafa Diziliyor..." : "Kitabı Rafa Yerleştir"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
