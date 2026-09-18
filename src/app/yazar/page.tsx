"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookArticle, CategoryItem } from "@/lib/types";
import {
  getArticles,
  saveArticle,
  deleteArticle,
  saveArticlesOrder,
  getCategories,
  saveCategory,
  updateCategory,
  deleteCategory
} from "@/lib/posts-service";
import { cleanPastedText, calculateSips } from "@/lib/text-cleaner";
import { slugify } from "@/lib/slug-utils";
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
  Save,
  Calendar,
  FileText,
  Trash2
} from "lucide-react";

export default function WriterPage() {
  const router = useRouter();

  // Önceden tanımlı 5 kitap boyu — her yeni kitaba rastgele biri atanır
  const BOOK_HEIGHT_RATIOS = [0.92, 0.96, 1.0, 1.04, 1.08];
  const randomHeightRatio = () =>
    BOOK_HEIGHT_RATIOS[Math.floor(Math.random() * BOOK_HEIGHT_RATIOS.length)];

  // Articles & Categories
  const [articles, setArticles] = useState<BookArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Navigation tab: 'write' | 'drafts' | 'shelves'
  const [activeTab, setActiveTab] = useState<"write" | "drafts" | "shelves">("write");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("denemeler");
  const [coverColor, setCoverColor] = useState("#b45309");
  const [textColor, setTextColor] = useState("#ffffff");
  const [variant, setVariant] = useState<"simple" | "stripe">("stripe");
  const [textured, setTextured] = useState(true);
  const [coverImage, setCoverImage] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [musicCover, setMusicCover] = useState("");

  // UI states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [autoCleanNotice, setAutoCleanNotice] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  // Dynamic typewriter platen paper-feed tracking:
  // Sayfa ilk açıldığında veya metin platene ulaşmadığında sayfa tamamen sabittir (scroll kilitli).
  // Metin platene ulaştığı andan itibaren kağıt satır satır yukarı beslenir.
  const [paperFeedScroll, setPaperFeedScroll] = useState(0);

  useEffect(() => {
    if (activeTab !== "write") return;

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
    }

    if (mainRef.current && textareaRef.current) {
      const textarea = textareaRef.current;
      const main = mainRef.current;

      if (!content.trim()) {
        setPaperFeedScroll(0);
        main.scrollTop = 0;
        return;
      }

      const mainRect = main.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();

      // Platen çizgisi: silindirin hemen üst sınırı (175px)
      const platenYInMain = (window.innerHeight - 175) - mainRect.top;

      // Yazılan metnin en alt noktasının main içerisindeki mutlak konumu:
      const textBottomAbsY = (textareaRect.top - mainRect.top) + main.scrollTop + textareaRect.height;

      if (textBottomAbsY > platenYInMain) {
        const requiredFeed = Math.ceil(textBottomAbsY - platenYInMain);
        setPaperFeedScroll(requiredFeed);
      } else {
        setPaperFeedScroll(0);
        main.scrollTop = 0;
      }
    }
  }, [content, activeTab]);

  // DOM paddingBottom ve overflow-y-auto render edildikten HEMEN SONRA scroll'u senkronize et
  // (Böylece 12. satıra geçerken gecikme veya silindirin arkasında kalma yaşanmaz):
  useEffect(() => {
    if (activeTab === "write" && paperFeedScroll > 0 && mainRef.current && textareaRef.current) {
      const cursor = textareaRef.current.selectionEnd ?? content.length;
      if (cursor >= content.length - 2) {
        mainRef.current.scrollTop = paperFeedScroll;
      }
    }
  }, [paperFeedScroll, activeTab, content.length]);

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

  // Update category
  const handleUpdateCategory = async (id: string, newName: string) => {
    await updateCategory(id, newName);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    const catToDelete = categories.find((c) => c.id === id);
    const catName = catToDelete ? `"${catToDelete.name}"` : "bu";
    if (confirm(`${catName} kategorisini silmek istediğinize emin misiniz?`)) {
      await deleteCategory(id);
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      if (category === id) {
        const fallback = updated.find((c) => c.id !== "all")?.id || "all";
        setCategory(fallback);
      }
    }
  };

  const drafts = articles.filter((a) => a.isDraft);
  const published = articles.filter((a) => !a.isDraft);

  // Edit existing article or draft
  const handleEditArticle = (art: BookArticle) => {
    setEditingId(art.id);
    setTitle(art.title);
    setContent(art.content);
    setCategory(art.category);
    setDate(art.date || "");
    setCoverColor(art.coverColor);
    setTextColor(art.textColor || "#ffffff");
    setVariant(art.variant);
    setTextured(art.textured);
    setCoverImage(art.coverImage || "");
    setMusicTitle(art.musicTitle || "");
    setMusicArtist(art.musicArtist || "");
    setMusicUrl(art.musicUrl || "");
    setMusicCover(art.musicCover || "");
    setActiveTab("write");
  };

  // Delete article or draft
  const handleDelete = async (id: string) => {
    const isTargetDraft = drafts.some((d) => d.id === id);
    const label = isTargetDraft ? "Bu taslağı" : "Bu denemeyi kitaplıktan";
    if (confirm(`${label} silmek istediğinize emin misiniz?`)) {
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
    setDate("");
    setCoverImage("");
    setMusicTitle("");
    setMusicArtist("");
    setMusicUrl("");
    setMusicCover("");
  };

  // Save as draft
  const handleSaveAsDraft = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Lütfen taslağınız için en azından bir başlık veya metin girin.");
      return;
    }

    setIsSaving(true);
    const draftTitle = title.trim() || "Başlıksız Taslak";
    const slug = editingId
      ? articles.find((a) => a.id === editingId)?.slug || slugify(draftTitle)
      : slugify(draftTitle) || `taslak-${Date.now()}`;

    const { readTimeMinutes, sips } = calculateSips(content);

    const today = new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const articleToSave: BookArticle = {
      id: editingId || `draft_${Date.now()}`,
      slug,
      title: draftTitle,
      content: content.trim(),
      excerpt: content.trim().slice(0, 180) + "...",
      category,
      date: date.trim() || (editingId ? (articles.find((a) => a.id === editingId)?.date || today) : today),
      readTimeMinutes,
      sips,
      coverColor,
      textColor,
      variant,
      textured,
      coverImage: coverImage || undefined,
      heightRatio: editingId ? (articles.find((a) => a.id === editingId)?.heightRatio ?? randomHeightRatio()) : randomHeightRatio(),
      musicTitle: musicTitle || undefined,
      musicArtist: musicArtist || undefined,
      musicUrl: musicUrl || undefined,
      musicCover: musicCover || undefined,
      order: editingId ? (articles.find((a) => a.id === editingId)?.order || 0) : articles.length,
      isDraft: true,
      createdAt: editingId ? (articles.find((a) => a.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    await saveArticle(articleToSave);

    const updatedArticles = await getArticles();
    setArticles(updatedArticles);
    setEditingId(articleToSave.id);
    setIsSaving(false);
    setIsDrawerOpen(false);
    setNotice(`"${draftTitle}" taslak olarak saklandı. Dilediğiniz zaman devam edebilirsiniz.`);

    setTimeout(() => setNotice(null), 4000);
  };

  // Save to shelf (Publish)
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
      ? articles.find((a) => a.id === editingId)?.slug || slugify(title)
      : slugify(title);

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
      date: date.trim() || (editingId ? (articles.find((a) => a.id === editingId)?.date || today) : today),
      readTimeMinutes,
      sips,
      coverColor,
      textColor,
      variant,
      textured,
      coverImage: coverImage || undefined,
      heightRatio: editingId ? (articles.find((a) => a.id === editingId)?.heightRatio ?? randomHeightRatio()) : randomHeightRatio(),
      musicTitle: musicTitle || undefined,
      musicArtist: musicArtist || undefined,
      musicUrl: musicUrl || undefined,
      musicCover: musicCover || undefined,
      order: editingId ? (articles.find((a) => a.id === editingId)?.order || 0) : published.length,
      isDraft: false,
      createdAt: editingId ? (articles.find((a) => a.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
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
    <div className="h-screen w-screen plaster-wall relative text-[#2d1b0f] flex flex-col overflow-hidden selection:bg-amber-800/20">
      {/* Pastoral Sunlight & Floating Dust Motes */}
      <PastoralBackground />

      {/* Top Bar / Navigation (Sabit Başlık) */}
      <header className="shrink-0 z-30 bg-[#f7f3eb]/85 backdrop-blur-md border-b border-[#ddcfbd] px-4 sm:px-8 py-3.5 shadow-xs">
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
              onClick={() => setActiveTab("drafts")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-medium transition-all cursor-pointer ${
                activeTab === "drafts"
                  ? "bg-[#3e220e] text-white shadow-xs font-semibold"
                  : "text-[#5e4129] hover:text-black"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Taslaklar ({drafts.length})</span>
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
              <span>Raf Düzenleme ({published.length})</span>
            </button>
          </div>

          {/* Action Buttons in Top Bar */}
          {activeTab === "write" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                title="Yazınızı taslak olarak saklayın, daha sonra devam edin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8ded0] hover:bg-[#d8c8b4] text-[#4a2e17] font-serif font-semibold text-xs transition-all border border-[#d2c0aa] cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-amber-800" />
                <span>Taslak Kaydet</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4a2810] hover:bg-[#613617] text-[#fcebdc] font-serif font-semibold text-xs transition-all shadow-md border border-[#c48d5d]/40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ciltle & Rafa Koy</span>
              </button>
            </div>
          )}
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

      {/* Main Sanctuary Area (Daktilodan çıkan kağıt gibi scroll eden orta blok; görünür scrollbar yok, büyü bozulmaz!) */}
      <main
        ref={mainRef}
        onScroll={(e) => {
          if (activeTab === "write" && paperFeedScroll > 0) {
            if (e.currentTarget.scrollTop > paperFeedScroll) {
              e.currentTarget.scrollTop = paperFeedScroll;
            }
          }
        }}
        className={`relative z-10 flex-1 no-scrollbar px-4 sm:px-6 pt-8 sm:pt-12 ${
          activeTab === "write"
            ? paperFeedScroll === 0
              ? "overflow-y-hidden pb-0"
              : "overflow-y-auto pb-0"
            : "overflow-y-auto pb-24"
        }`}
      >
        <div className="max-w-4xl mx-auto w-full">
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

            {/* Zen Paper Sheet (Tek parça, dikişsiz ve altı daktiloya inen sonsuz kağıt) */}
            <div
              className="relative px-6 pt-6 sm:px-12 sm:pt-12 rounded-t-3xl rounded-b-none bg-[#faf6f0]/95 border-x-2 border-t-2 border-b-0 border-[#d9c7b2] shadow-2xl backdrop-blur-xs min-h-[calc(100vh-170px)]"
              style={{ paddingBottom: `${paperFeedScroll}px` }}
            >
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

                  <button
                    type="button"
                    onClick={handleSaveAsDraft}
                    disabled={isSaving}
                    title="Taslak olarak kaydet"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e6d8c5] hover:bg-[#d8c7b0] text-xs font-serif text-[#4e311a] font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-800" />
                    <span>Taslak Kaydet</span>
                  </button>
                </div>

                {/* Sips & Reading Calculation & Edit Status */}
                <div className="flex items-center gap-3 text-xs font-serif text-[#78593e]">
                  {editingId && (
                    <span className="text-[11px] font-serif italic text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                      {drafts.some((d) => d.id === editingId)
                        ? "Taslak Düzenleniyor"
                        : "Yayınlanmış Kitap Düzenleniyor"}
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-[#ede2d4] px-2.5 py-1 rounded-full">
                    <Wine className="w-3.5 h-3.5 text-amber-700" />
                    <span>~{sips} yudum ({readTimeMinutes} dk)</span>
                  </span>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-rose-800 underline hover:text-rose-950 cursor-pointer"
                      title="Düzenlemeyi bırak ve boş temiz kağıda geç"
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
                  placeholder="Deneme Başlığı... (Örn: 'Eylül'ün Ankara Hali')"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full font-serif text-2xl sm:text-4xl font-bold text-[#2d1808] placeholder-[#a68972]/60 bg-transparent border-b-2 border-transparent focus:border-amber-900/30 focus:outline-hidden pb-2"
                />
              </div>

              {/* Textarea / Body */}
              <div className="min-h-[180px]">
                <textarea
                  ref={textareaRef}
                  placeholder="Yazmaya başlayın ya da WhatsApp/Word'den kopyalayıp buraya yapıştırın..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  className="w-full font-serif text-lg sm:text-xl leading-[1.85] text-[#2b1b0e] placeholder-[#a68972]/50 bg-transparent border-0 focus:outline-hidden resize-none overflow-hidden block min-h-[180px]"
                />
              </div>
            </div>
          </div>
        ) : activeTab === "drafts" ? (
          /* Taslak Sandığı (Drafts) Tab */
          <div>
            <div className="text-center mb-8">
              <span className="text-xs font-serif tracking-widest uppercase text-amber-900/70 font-semibold">
                Yazarın Masası
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#321d0d] mt-1">
                Taslak Sandığı
              </h1>
              <p className="font-serif italic text-xs text-[#7c604a] mt-1">
                Yarım kalan, üzerinde çalıştığınız veya daha sonra devam edeceğiniz yazılar.
              </p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-serif text-xs text-[#6e4e34]">
                Sandıkta toplam <strong>{drafts.length}</strong> taslak bulunuyor
              </span>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab("write");
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3e220e] hover:bg-[#522d14] text-amber-100 font-serif text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>+ Yeni Yazıya Başla</span>
              </button>
            </div>

            {drafts.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#f5ebe0]/80 border-2 border-dashed border-[#d8c3ad] text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#3e220e]/10 text-amber-900 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 opacity-75" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#3d2411] mb-1">
                  Henüz Kayıtlı Taslağınız Yok
                </h3>
                <p className="font-serif italic text-xs text-[#7c604a] max-w-sm mx-auto mb-5">
                  Daktilo ekranında yazı yazarken &apos;Taslak Kaydet&apos; butonuna basarak yazılarınızı buraya saklayabilir, istediğiniz zaman devam edebilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a2810] text-amber-100 font-serif text-xs font-semibold shadow-md hover:bg-[#613617] cursor-pointer"
                >
                  <span>Daktiloya Geç & Yazmaya Başla</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-5 rounded-2xl bg-[#faf5ed]/95 border border-[#dbc7b0] shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow relative"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#4a2910]/10 text-amber-900 text-[10px] font-semibold uppercase tracking-wider">
                          {draft.category || "denemeler"}
                        </span>
                        <span className="text-[11px] font-serif text-neutral-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-800/70" />
                          {draft.date || "Tarihsiz"}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#2f1b0d] mb-2 line-clamp-1">
                        {draft.title || "Başlıksız Taslak"}
                      </h3>

                      <p className="font-serif italic text-xs text-[#6e5036] line-clamp-3 leading-relaxed mb-4">
                        {draft.content || "Henüz bir metin girilmedi..."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e8dacc] flex items-center justify-between gap-2">
                      <div className="text-[11px] font-serif text-amber-900/70">
                        ~{draft.readTimeMinutes} dk • {draft.sips} yudum
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(draft.id)}
                          className="p-1.5 rounded-lg text-rose-800 hover:bg-rose-100/70 transition-colors cursor-pointer"
                          title="Taslağı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleEditArticle(draft);
                            setIsDrawerOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#e8ded0] hover:bg-[#ded0be] text-amber-950 font-serif text-xs font-medium transition-colors cursor-pointer"
                          title="Ciltle ve Yayınla"
                        >
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Ciltle</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditArticle(draft)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3e220e] hover:bg-[#522d14] text-amber-100 font-serif text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Feather className="w-3 h-3" />
                          <span>Devam Et</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              articles={published}
              onOrderChange={(newPublished) => {
                const combined = [
                  ...newPublished,
                  ...articles.filter((a) => a.isDraft)
                ];
                setArticles(combined);
              }}
              onEditArticle={handleEditArticle}
              onDeleteArticle={handleDelete}
              onSaveOrder={async (newPublished) => {
                const combined = [
                  ...newPublished,
                  ...articles.filter((a) => a.isDraft)
                ];
                await saveArticlesOrder(combined);
                setNotice("Yeni raf sıralaması kaydedildi!");
                setTimeout(() => setNotice(null), 3000);
              }}
            />
          </div>
        )}

          {/* Footer Note */}
          {activeTab !== "write" && (
            <footer className="w-full text-center pt-10 pb-6 text-xs font-serif text-[#785c45] opacity-75">
              <span>moonworks.com.tr Yazar İstasyonu • Mert Kip İçin Sevgiyle</span>
            </footer>
          )}
        </div>
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
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        date={date}
        onDateChange={setDate}
        onSaveAsDraft={handleSaveAsDraft}
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
        musicTitle={musicTitle}
        onMusicTitleChange={setMusicTitle}
        musicArtist={musicArtist}
        onMusicArtistChange={setMusicArtist}
        musicUrl={musicUrl}
        onMusicUrlChange={setMusicUrl}
        musicCover={musicCover}
        onMusicCoverChange={setMusicCover}
        sips={sips}
        readTimeMinutes={readTimeMinutes}
        onSaveToShelf={handleSaveToShelf}
        isSaving={isSaving}
      />

      {/* Realistic Antique Typewriter Body & Carriage Anchored along the bottom (Daktilodan çıkan kağıt efekti) */}
      {activeTab === "write" && (
        <div className="fixed bottom-0 inset-x-0 pointer-events-none z-20 flex justify-center items-end overflow-hidden">
          {/* Ambient shadow cast on desk under typewriter */}
          <div className="absolute -bottom-6 w-full max-w-5xl h-28 bg-black/70 blur-3xl -z-10" />

          {/* Typewriter Carriage & Keybars Cutout: bir %10 daha büyütüldü, %45 yukarıda */}
          <div className="relative w-full max-w-7xl flex justify-center translate-y-[45%]">
            <img
              src="/textures/remington.png"
              alt="Vintage Typewriter Carriage"
              className="w-full max-w-[1330px] h-auto object-contain object-bottom drop-shadow-[0_-15px_30px_rgba(0,0,0,0.85)] select-none pointer-events-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
