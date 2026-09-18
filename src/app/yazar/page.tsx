"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookArticle, CategoryItem } from "@/lib/types";
import {
  getArticles,
  saveArticle,
  deleteArticle,
  saveArticlesOrder,
  getCategories,
  saveCategory
} from "@/lib/posts-service";
import { cleanPastedText, calculateSips } from "@/lib/text-cleaner";
import { PastoralBackground } from "@/components/author/pastoral-bg";
import { BookDrawer } from "@/components/author/book-drawer";
import { ShelfOrganizer } from "@/components/author/shelf-organizer";
import {
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Check,
  Feather,
  LayoutGrid,
  Edit,
  Eraser,
  Wine,
  Save
} from "lucide-react";

export default function WriterPage() {
  const router = useRouter();

  // Articles & Categories
  const [articles, setArticles] = useState<BookArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Navigation tab: 'write' | 'shelves'
  const [activeTab, setActiveTab] = useState<"write" | "shelves">("write");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("denemeler");
  const [coverColor, setCoverColor] = useState("#b45309");
  const [textColor, setTextColor] = useState("#ffffff");
  const [variant, setVariant] = useState<"simple" | "stripe">("stripe");
  const [textured, setTextured] = useState(true);
  const [coverImage, setCoverImage] = useState("");
  const [heightRatio, setHeightRatio] = useState(1.0);
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  const [musicUrl, setMusicUrl] = useState("");

  // UI states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [autoCleanNotice, setAutoCleanNotice] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [art, cat] = await Promise.all([getArticles(), getCategories()]);
      setArticles(art);
      setCategories(cat);
      if (cat.length > 1) {
        setCategory(cat[1].id);
      }
    }
    loadData();
  }, []);

  // Handle paste with automatic cleaning for WhatsApp and Word formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const rawText = e.clipboardData.getData("text");
    if (!rawText) return;

    // Check if it looks like it has WhatsApp or Word artifacts
    const hasWhatsApp = /\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(rawText);
    const cleaned = cleanPastedText(rawText);

    if (cleaned !== rawText) {
      e.preventDefault();
      // Insert cleaned text at cursor
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + cleaned + content.substring(end);
      setContent(newContent);

      setAutoCleanNotice(true);
      setTimeout(() => setAutoCleanNotice(false), 3500);
    }
  };

  // Manual cleanup button
  const handleManualClean = () => {
    const cleaned = cleanPastedText(content);
    setContent(cleaned);
    setAutoCleanNotice(true);
    setTimeout(() => setAutoCleanNotice(false), 3000);
  };

  // Insert image markdown tag into editor
  const handleInsertImage = () => {
    const url = prompt("Lütfen eklenecek görselin web adresini (URL) girin:");
    if (!url) return;
    const caption = prompt("Görsel alt yazısı (opsiyonel):") || "Görsel";
    setContent((prev) => `${prev}\n\n![${caption}](${url})\n\n`);
  };

  // Add category
  const handleAddCategory = async (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const newCat: CategoryItem = { id: slug, name };
    await saveCategory(newCat);
    setCategories((prev) => [...prev, newCat]);
    setCategory(newCat.id);
  };

  // Edit existing article
  const handleEditArticle = (art: BookArticle) => {
    setEditingId(art.id);
    setTitle(art.title);
    setContent(art.content);
    setCategory(art.category);
    setCoverColor(art.coverColor);
    setTextColor(art.textColor || "#ffffff");
    setVariant(art.variant);
    setTextured(art.textured);
    setCoverImage(art.coverImage || "");
    setHeightRatio(art.heightRatio || 1.0);
    setMusicTitle(art.musicTitle || "");
    setMusicArtist(art.musicArtist || "");
    setMusicUrl(art.musicUrl || "");
    setActiveTab("write");
  };

  // Delete article
  const handleDelete = async (id: string) => {
    if (confirm("Bu denemeyi kitaplıktan kaldırmak istediğinize emin misiniz?")) {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCoverImage("");
    setMusicTitle("");
    setMusicArtist("");
    setMusicUrl("");
  };

  // Save to shelf
  const handleSaveToShelf = async () => {
    if (!title.trim()) {
      alert("Lütfen denemeniz için bir başlık belirleyin.");
      setIsDrawerOpen(true);
      return;
    }

    if (!content.trim()) {
      alert("Lütfen deneme metnini yazın.");
      return;
    }

    setIsSaving(true);

    const slug = editingId
      ? articles.find((a) => a.id === editingId)?.slug || title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, "-")
      : title
          .toLowerCase()
          .replace(/[^a-z0-9ğüşıöç]+/g, "-")
          .replace(/(^-|-$)+/g, "");

    const { readTimeMinutes, sips } = calculateSips(content);

    const today = new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const articleToSave: BookArticle = {
      id: editingId || `art_${Date.now()}`,
      slug,
      title: title.trim(),
      content: content.trim(),
      excerpt: content.trim().slice(0, 180) + "...",
      category,
      date: editingId ? (articles.find((a) => a.id === editingId)?.date || today) : today,
      readTimeMinutes,
      sips,
      coverColor,
      textColor,
      variant,
      textured,
      coverImage: coverImage || undefined,
      heightRatio,
      musicTitle: musicTitle || undefined,
      musicArtist: musicArtist || undefined,
      musicUrl: musicUrl || undefined,
      order: editingId ? (articles.find((a) => a.id === editingId)?.order || 0) : articles.length,
      createdAt: new Date().toISOString(),
    };

    await saveArticle(articleToSave);

    const updatedArticles = await getArticles();
    setArticles(updatedArticles);

    setIsSaving(false);
    setIsDrawerOpen(false);
    setNotice(`"${articleToSave.title}" başarıyla kitaplık rafına yerleştirildi!`);

    setTimeout(() => setNotice(null), 5000);
  };

  const { readTimeMinutes, sips } = calculateSips(content);

  return (
    <div className="min-h-screen plaster-wall relative text-[#2d1b0f] flex flex-col justify-between selection:bg-amber-800/20">
      {/* Pastoral Sunlight & Floating Dust Motes */}
      <PastoralBackground />

      {/* Top Bar / Navigation */}
      <header className="sticky top-0 z-30 bg-[#f7f3eb]/80 backdrop-blur-md border-b border-[#ddcfbd] px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-serif font-semibold text-[#503119] hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kitaplığa Dön</span>
            </Link>
            <span className="text-neutral-400">|</span>
            <div className="flex items-center gap-1.5 font-serif font-bold text-amber-950 text-sm">
              <Feather className="w-4 h-4 text-amber-700" />
              <span>Mert Kip — Yazar Odası</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#e8ded0] border border-[#d2c0aa]">
            <button
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-medium transition-all cursor-pointer ${
                activeTab === "write"
                  ? "bg-[#3e220e] text-white shadow-xs font-semibold"
                  : "text-[#5e4129] hover:text-black"
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Daktilo & Yazı</span>
            </button>
            <button
              onClick={() => setActiveTab("shelves")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-medium transition-all cursor-pointer ${
                activeTab === "shelves"
                  ? "bg-[#3e220e] text-white shadow-xs font-semibold"
                  : "text-[#5e4129] hover:text-black"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Raf Düzenleme ({articles.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notice Banner */}
      {notice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3e220e] text-amber-100 font-serif text-sm shadow-2xl border border-amber-500/40">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
            <Link href="/" className="ml-2 underline font-bold hover:text-white">
              Görüntüle
            </Link>
          </div>
        </div>
      )}

      {/* Main Sanctuary Area */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 flex-1">
        {activeTab === "write" ? (
          <div className="relative">
            {/* Pastoral Header Banner */}
            <div className="text-center mb-8">
              <span className="text-xs font-serif tracking-widest uppercase text-amber-900/70 font-semibold">
                Sessizlik, Bozkır ve Kağıt
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#321d0d] mt-1">
                {editingId ? "Denemeyi Düzenle" : "Yeni Bir Deneme Başlat"}
              </h1>
              <p className="font-serif italic text-xs text-[#7c604a] mt-1">
                Word ya da WhatsApp&apos;tan kopyaladığınızda metin kendiliğinden temizlenir ve arındırılır.
              </p>
            </div>

            {/* Zen Paper Sheet */}
            <div className="relative p-6 sm:p-12 rounded-3xl bg-[#faf6f0]/95 border-2 border-[#d9c7b2] shadow-2xl backdrop-blur-xs">
              {/* Paper Top Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-[#e5d6c5]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualClean}
                    title="WhatsApp ve Word fazlalıklarını temizle"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ece1d2] hover:bg-[#ded0bf] text-xs font-serif text-[#4e311a] transition-colors cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5 text-amber-800" />
                    <span>Metni Arındır</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertImage}
                    title="Paragraf arasına görsel yerleştir"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ece1d2] hover:bg-[#ded0bf] text-xs font-serif text-[#4e311a] transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-800" />
                    <span>Görsel Ekle</span>
                  </button>
                </div>

                {/* Sips & Reading Calculation */}
                <div className="flex items-center gap-3 text-xs font-serif text-[#78593e]">
                  <span className="flex items-center gap-1 bg-[#ede2d4] px-2.5 py-1 rounded-full">
                    <Wine className="w-3.5 h-3.5 text-amber-700" />
                    <span>~{sips} yudum ({readTimeMinutes} dk)</span>
                  </span>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-rose-800 underline cursor-pointer"
                    >
                      Yeniye Dön
                    </button>
                  )}
                </div>
              </div>

              {/* Automatic Cleaning Toast */}
              {autoCleanNotice && (
                <div className="mb-4 p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-serif flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Metin kopyalandı; WhatsApp tarih damgaları, isimler ve Word kodları otomatik temizlendi.
                  </span>
                </div>
              )}

              {/* Title Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Deneme Başlığı... (Örn: 'Eylül'ün Ankara Hali)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full font-serif text-2xl sm:text-4xl font-bold text-[#2d1808] placeholder-[#a68972]/60 bg-transparent border-b-2 border-transparent focus:border-amber-900/30 focus:outline-hidden pb-2"
                />
              </div>

              {/* Textarea / Body */}
              <div className="min-h-[380px]">
                <textarea
                  rows={16}
                  placeholder="Yazmaya başlayın ya da WhatsApp/Word'den kopyalayıp buraya yapıştırın..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  className="w-full font-serif text-lg sm:text-xl leading-[1.85] text-[#2b1b0e] placeholder-[#a68972]/50 bg-transparent border-0 focus:outline-hidden resize-y min-h-[350px]"
                />
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-8 pt-6 border-t border-[#e5d6c5] flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs font-serif text-[#7d6047]">
                  {content.trim().split(/\s+/).filter(Boolean).length} kelime
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4a2810] hover:bg-[#613617] text-[#fcebdc] font-serif font-semibold text-xs sm:text-sm transition-all shadow-lg border border-[#c48d5d]/40 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Kitap Cildi & Rafa Koy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Shelves Organizer Tab */
          <div>
            <div className="text-center mb-8">
              <span className="text-xs font-serif tracking-widest uppercase text-amber-900/70 font-semibold">
                Kütüphane Yönetimi
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#321d0d] mt-1">
                Rafları ve Kitapları Düzenle
              </h1>
              <p className="font-serif italic text-xs text-[#7c604a] mt-1">
                Kilidi açarak kitapları sürükleyip raflar arasında sıralayabilirsiniz.
              </p>
            </div>

            <ShelfOrganizer
              articles={articles}
              onOrderChange={(newArticles) => setArticles(newArticles)}
              onEditArticle={handleEditArticle}
              onDeleteArticle={handleDelete}
              onSaveOrder={async (newArticles) => {
                await saveArticlesOrder(newArticles);
                setNotice("Yeni raf sıralaması kaydedildi!");
                setTimeout(() => setNotice(null), 3000);
              }}
            />
          </div>
        )}
      </main>

      {/* Right-Side Pull Drawer */}
      <BookDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        title={title}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        onAddCategory={handleAddCategory}
        coverColor={coverColor}
        onCoverColorChange={setCoverColor}
        textColor={textColor}
        onTextColorChange={setTextColor}
        variant={variant}
        onVariantChange={setVariant}
        textured={textured}
        onTexturedChange={setTextured}
        coverImage={coverImage}
        onCoverImageChange={setCoverImage}
        heightRatio={heightRatio}
        onHeightRatioChange={setHeightRatio}
        musicTitle={musicTitle}
        onMusicTitleChange={setMusicTitle}
        musicArtist={musicArtist}
        onMusicArtistChange={setMusicArtist}
        musicUrl={musicUrl}
        onMusicUrlChange={setMusicUrl}
        sips={sips}
        readTimeMinutes={readTimeMinutes}
        onSaveToShelf={handleSaveToShelf}
        isSaving={isSaving}
      />

      {/* Footer Note */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-[#d8c8b4]/60 text-xs font-serif text-[#785c45]">
        <span>moonworks.com.tr Yazar İstasyonu • Mert Kip İçin Sevgiyle</span>
      </footer>
    </div>
  );
}
