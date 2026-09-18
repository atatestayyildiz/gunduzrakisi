"use client";

import React, { useState } from "react";
import { Book } from "@/components/ui/book";
import { CategoryItem } from "@/lib/types";
import { convertToWebP } from "@/lib/image-utils";
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
  ChevronRight,
  Edit,
  Trash2,
  Check,
  Calendar,
  FileText,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { RakiGlass } from "@/components/icons/raki-glass";

interface BookDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  category: string;
  onCategoryChange: (cat: string) => void;
  categories: CategoryItem[];
  onAddCategory: (name: string) => void;
  onUpdateCategory?: (id: string, name: string) => void;
  onDeleteCategory?: (id: string) => void;
  date?: string;
  onDateChange?: (date: string) => void;
  onSaveAsDraft?: () => void;
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
  musicTitle: string;
  onMusicTitleChange: (v: string) => void;
  musicArtist: string;
  onMusicArtistChange: (v: string) => void;
  musicUrl: string;
  onMusicUrlChange: (v: string) => void;
  musicCover: string;
  onMusicCoverChange: (v: string) => void;
  musicTracks?: import("@/lib/types").MusicTrack[];
  onOpenAddMusic?: () => void;
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
  onUpdateCategory,
  onDeleteCategory,
  date = "",
  onDateChange,
  onSaveAsDraft,
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
  musicTitle,
  onMusicTitleChange,
  musicArtist,
  onMusicArtistChange,
  musicUrl,
  onMusicUrlChange,
  musicCover,
  onMusicCoverChange,
  musicTracks = [],
  onOpenAddMusic,
  sips,
  readTimeMinutes,
  onSaveToShelf,
  isSaving,
}: BookDrawerProps) => {
  const [newCatName, setNewCatName] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsCompressing(true);
      setCompressionInfo("Görsel optimize ediliyor...");
      const res = await convertToWebP(file, 800, 1200, 0.82);
      onCoverImageChange(res.dataUrl);
      setCompressionInfo(`Boyut: ~${res.sizeKB} KB (Orijinal: ${res.originalSizeKB} KB)`);
    } catch (err) {
      console.error("Görsel dönüştürme hatası:", err);
      alert("Görsel işlenirken bir hata oluştu.");
    } finally {
      setIsCompressing(false);
      // Reset input so same file can be re-selected if deleted
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      {/* Backdrop overlay on mobile & background dimming */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Unified Sliding Drawer Assembly: Kulp ve çekmece gövdesi tek bir fiziksel parça olarak kayar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[440px] z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Çekmece Ahşap Montaj Kulakçığı / Çıkıntısı (Ölçü dengelendi) */}
        <div
          onClick={onToggle}
          role="button"
          tabIndex={0}
          title={isOpen ? "Çekmeceyi Kapat" : "Cilt & Raf Çekmecesini Çek"}
          className="absolute -left-8 sm:-left-9 top-1/2 -translate-y-1/2 w-9 sm:w-10 h-50 sm:h-58 rounded-l-2xl border-y-2 border-l-2 border-[#1c0c03] shadow-[-11px_6px_26px_rgba(0,0,0,0.85)] cursor-pointer group z-40"
          style={{
            backgroundColor: "#361b09",
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.06) 25%, rgba(0,0,0,0.3) 100%), url('/textures/oak_wood.jpg')`,
            backgroundSize: "260px auto",
          }}
        >
          {/* Ahşap gölgeleri ve ahşap pah efekti */}
          <div className="absolute inset-0 rounded-l-2xl bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
        </div>

        {/* Gerçek Vintage Pirinç / Döküm Çekmece Kulbu (Tutamaç sola bakacak şekilde konumlandırıldı) */}
        <div
          onClick={onToggle}
          role="button"
          tabIndex={0}
          title={isOpen ? "Çekmeceyi Kapat" : "Cilt & Raf Çekmecesini Çek"}
          className="absolute -left-16 sm:-left-20 top-1/2 -translate-y-1/2 cursor-pointer select-none group z-50 focus:outline-hidden"
        >
          {/* Ornate Drop Bail Handle with realistic drop shadow */}
          <div className="relative flex items-center justify-center p-2">
            {/* The physical antique handle cutout from the user image, rotated 90deg so the bail loop pulls LEFT */}
            <div className="relative w-16 sm:w-20 h-44 sm:h-52 flex items-center justify-center">
              <img
                src="/textures/kulp.png"
                alt="Antika Çekmece Kulbu"
                className="w-44 sm:w-52 h-auto max-w-none rotate-90 origin-center drop-shadow-[-12px_8px_18px_rgba(0,0,0,0.85)] filter group-hover:brightness-105 transition-all duration-200 pointer-events-none select-none"
              />
            </div>

            {/* Subtle vintage brass directional tag when hovered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-serif text-amber-200 border border-amber-600/40 whitespace-nowrap shadow-lg">
                {isOpen ? "Kapat" : "Çek"}
              </div>
            </div>
          </div>
        </div>

        {/* Sliding Drawer Container (Eski Meşe Ağacı Çekmece Gövdesi) */}
        <aside
          className="w-full h-full flex flex-col border-l-4 border-[#241307] shadow-[-25px_0_50px_rgba(0,0,0,0.9)] overflow-y-auto no-scrollbar relative"
          style={{
            backgroundColor: "#3a1e0b",
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(30, 15, 7, 0.35) 50%, rgba(0, 0, 0, 0.7) 100%), url('/textures/oak_wood.jpg')`,
            backgroundSize: "500px auto",
          }}
        >
          {/* Drawer Header with Heavy Oak Plank Finish & Brass Trim */}
          <div className="oak-shelf-front px-6 py-4 flex items-center justify-between text-white border-b-2 border-[#241307] sticky top-0 z-10 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#241307] border border-[#a87d29]/50 shadow-inner">
                <Bookmark className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-amber-100 tracking-wide">
                  Cilt & Raf Çekmecesi
                </h2>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl text-amber-200 hover:text-white bg-[#241307]/80 hover:bg-[#241307] border border-[#a87d29]/40 transition-colors cursor-pointer"
              title="Çekmeceyi Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 flex-1 text-sm text-[#3b2413]">
            {/* Live 3D Book Preview (Çekmece içi Kadife/Parchment Tepsi) */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#efe4d2]/95 border border-[#c4ab8f] shadow-[inset_0_2px_8px_rgba(0,0,0,0.12),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs">
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
                width={160}
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-serif text-amber-900 bg-white/70 px-3 py-1 rounded-full border border-[#d2c0aa]">
              <span>Okuma: ~{readTimeMinutes} dk</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold">
                <RakiGlass className="w-3 h-3 text-amber-800" />
                <span>{sips} yudumda biter</span>
              </span>
            </div>
          </div>

          {/* Cilt Tipi (Variant) */}
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs space-y-2">
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
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs space-y-2">
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
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs grid grid-cols-2 gap-4">
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

          {/* Kapak Görseli */}
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-serif font-semibold text-[#4a2b13]">
                Kapak Görseli
              </label>
              <span className="text-[11px] font-serif text-amber-900/60">
                {coverImage ? "Seçildi" : "Opsiyonel"}
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="hidden"
            />

            {coverImage ? (
              /* Image Preview Card */
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#d8c7b4]">
                <div className="relative w-12 h-16 rounded-md overflow-hidden bg-[#2d1b0f] border border-[#a88d72] shrink-0 shadow-xs">
                  <img
                    src={coverImage}
                    alt="Kapak Önizleme"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif font-semibold text-[#3b200b] truncate">
                    Kapak Görseli Aktif
                  </p>
                  {compressionInfo && (
                    <p className="text-[11px] font-serif text-emerald-800">
                      {compressionInfo}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onCoverImageChange("");
                      setCompressionInfo(null);
                    }}
                    className="mt-1 text-[11px] font-serif text-rose-800 underline hover:text-rose-950 cursor-pointer"
                  >
                    Görseli Kaldır
                  </button>
                </div>
              </div>
            ) : (
              /* Upload trigger button */
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#eee2d0] hover:bg-[#e2d2be] border-2 border-dashed border-[#cbb399] text-[#4a2b13] text-xs font-serif font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
                      <span>Görsel Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-amber-800" />
                      <span>Cihazdan Kapak Görseli Yükle</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Direct URL input (alternative fallback) */}
            <div className="pt-1 border-t border-[#e2d1bd]">
              <input
                type="text"
                placeholder="Görsel bağlantısı (URL)"
                value={coverImage && !coverImage.startsWith("data:") ? coverImage : ""}
                onChange={(e) => {
                  onCoverImageChange(e.target.value);
                  setCompressionInfo(null);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/70 border border-[#d8c7b4] text-[11px] font-serif text-[#3b200b] placeholder-[#9a7d65] focus:outline-hidden focus:ring-1 focus:ring-amber-800"
              />
            </div>
          </div>

          {/* Kategori Seçimi & Yönetimi */}
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-serif font-semibold text-[#4a2b13] flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-amber-800" />
                <span>Raf / Kategori</span>
              </label>

              <div className="flex items-center gap-1.5 text-xs font-serif">
                <button
                  type="button"
                  onClick={() => {
                    setShowManageCategories(!showManageCategories);
                    setShowNewCatInput(false);
                  }}
                  className="text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  {showManageCategories ? "Kapat" : "Yönet"}
                </button>
                <span className="text-amber-900/30">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCatInput(!showNewCatInput);
                    setShowManageCategories(false);
                  }}
                  className="text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  {showNewCatInput ? "Vazgeç" : "+ Yeni"}
                </button>
              </div>
            </div>

            {/* Yeni Kategori Ekleme Alanı */}
            {showNewCatInput && (
              <div className="flex gap-2 p-2 rounded-xl bg-amber-900/5 border border-[#d8c7b4]">
                <input
                  type="text"
                  placeholder="Kategori adı"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#d8c7b4] text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-800"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCat}
                  className="px-3 py-1.5 rounded-lg bg-[#4a2810] hover:bg-[#5e3415] text-amber-100 text-xs font-medium transition-colors cursor-pointer"
                >
                  Ekle
                </button>
              </div>
            )}

            {/* Kategorileri Yönetme (Düzenleme & Silme) Listesi */}
            {showManageCategories && (
              <div className="space-y-1.5 p-2.5 rounded-xl bg-amber-900/5 border border-[#d8c7b4] max-h-56 overflow-y-auto">
                <div className="text-[11px] font-serif italic text-[#7a593e] mb-1">
                  Kategori ismini değiştirebilir veya silebilirsiniz:
                </div>
                {categories
                  .filter((c) => c.id !== "all")
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between gap-1.5 p-1.5 px-2 rounded-lg bg-white border border-[#d8c7b4] shadow-xs text-xs"
                    >
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="flex-1 px-2 py-0.5 rounded border border-amber-800 text-xs bg-white focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCatName.trim() && onUpdateCategory) {
                                onUpdateCategory(cat.id, editingCatName.trim());
                                setEditingCatId(null);
                              }
                            }}
                            className="p-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                            title="Kaydet"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1 rounded bg-stone-500 hover:bg-stone-600 text-white cursor-pointer"
                            title="İptal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-serif font-medium text-[#4a2b13] truncate">
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="p-1 rounded hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                              title="İsmi Düzenle"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onDeleteCategory) {
                                  onDeleteCategory(cat.id);
                                }
                              }}
                              className="p-1 rounded hover:bg-rose-100 text-rose-800 transition-colors cursor-pointer"
                              title="Kategoriyi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Kategori Seçim Kutusu */}
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#d8c7b4] text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-800/40 cursor-pointer"
            >
              {categories
                .filter((c) => c.id !== "all")
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Yazı Tarihi */}
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-serif font-semibold text-[#4a2b13] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-800" />
                <span>Yazı Tarihi</span>
              </label>
              {onDateChange && (
                <button
                  type="button"
                  onClick={() => {
                    const todayStr = new Date().toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    });
                    onDateChange(todayStr);
                  }}
                  className="text-[11px] font-serif text-amber-800 hover:text-amber-950 underline cursor-pointer"
                >
                  Bugün Yap
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Tarih"
                value={date}
                onChange={(e) => onDateChange?.(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#d8c7b4] text-xs font-serif focus:outline-hidden focus:ring-2 focus:ring-amber-800/40"
              />
              <input
                type="date"
                title="Takvimden Tarih Seç"
                onChange={(e) => {
                  if (e.target.value && onDateChange) {
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    const dObj = new Date(y, m - 1, d);
                    onDateChange(
                      dObj.toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    );
                  }
                }}
                className="w-9 h-9 p-1 rounded-xl bg-white border border-[#d8c7b4] text-xs cursor-pointer text-amber-900"
              />
            </div>
          </div>

          {/* Müzik Eşlikçisi (Tek Seçim Kutusu) */}
          <div className="p-4 rounded-2xl bg-[#f5ead8]/95 border border-[#c5ab8d] shadow-[inset_0_1px_3px_rgba(255,255,255,0.8),0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-serif font-semibold text-[#4a2b13] flex items-center gap-1.5 text-xs sm:text-sm">
                <Music className="w-4 h-4 text-amber-800" />
                <span>Yazının Şarkısı (Opsiyonel)</span>
              </label>
              {onOpenAddMusic && (
                <button
                  type="button"
                  onClick={onOpenAddMusic}
                  className="text-[11px] font-serif text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  + Şarkı Ekle
                </button>
              )}
            </div>

            {/* Kayıtlı Şarkılar Arasından Tek Seçim Alanı */}
            <select
              value={musicUrl || ""}
              onChange={(e) => {
                const selectedUrl = e.target.value;
                if (!selectedUrl) {
                  onMusicUrlChange("");
                  onMusicTitleChange("");
                  onMusicArtistChange("");
                  onMusicCoverChange("");
                  return;
                }
                const found = musicTracks.find((t) => t.url === selectedUrl);
                if (found) {
                  onMusicUrlChange(found.url);
                  onMusicTitleChange(found.title);
                  onMusicArtistChange(found.artist || "Mert Kip");
                  onMusicCoverChange(found.cover || "");
                } else {
                  onMusicUrlChange(selectedUrl);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#d8c7b4] text-xs font-serif text-[#3b200b] focus:outline-hidden focus:ring-2 focus:ring-amber-800/40 cursor-pointer"
            >
              <option value="">Şarkı Seçilmedi (Sessiz Okuma)</option>
              {musicTracks.map((t) => (
                <option key={t.id} value={t.url}>
                  {t.title} {t.artist ? `— ${t.artist}` : ""}
                </option>
              ))}
            </select>

            {musicTitle && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/60 border border-[#d8c7b4] text-[11px] font-serif text-[#4a2b13]">
                <div className="truncate pr-2">
                  <span className="font-bold">{musicTitle}</span>
                  {musicArtist && <span className="opacity-80"> — {musicArtist}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onMusicUrlChange("");
                    onMusicTitleChange("");
                    onMusicArtistChange("");
                    onMusicCoverChange("");
                  }}
                  className="text-rose-800 hover:text-rose-950 underline shrink-0 cursor-pointer"
                >
                  Kaldır
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Action Buttons */}
        <div className="p-4 sm:p-5 border-t-2 border-[#241307] bg-[#2a1406] sticky bottom-0 z-10 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] space-y-2">
          <button
            type="button"
            onClick={onSaveToShelf}
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#4d2810] via-[#753d16] to-[#3a1d0a] hover:from-[#5e3113] hover:to-[#47240d] text-[#faedd9] font-serif font-bold text-sm tracking-wide shadow-xl border border-[#d4af37]/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSaving ? "Rafa Diziliyor..." : "Ciltle & Rafa Diz (Yayınla)"}</span>
          </button>

          {onSaveAsDraft && (
            <button
              type="button"
              onClick={onSaveAsDraft}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1c0d04] hover:bg-[#2d1607] text-amber-200/90 hover:text-amber-100 font-serif font-semibold text-xs transition-all border border-amber-900/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Taslak Olarak Sakla (Sonra Devam Et)</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  </>
);
};
