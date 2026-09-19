"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Link as LinkIcon,
  Unlink,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Eraser,
  Type,
  Check,
  X,
} from "lucide-react";

export interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  syncContent: () => void;
  onCleanTextClick: () => void;
}

const INK_COLORS = [
  { name: "Mürekkep Siyahı", color: "#1c0c04" },
  { name: "Toprak Kahvesi", color: "#78350f" },
  { name: "Kiremit Bordo", color: "#991b1b" },
  { name: "Kadife Gül", color: "#be185d" },
  { name: "Çam Yeşili", color: "#15803d" },
  { name: "Gece Mavisi", color: "#1d4ed8" },
  { name: "Kömür Grisi", color: "#52525b" },
  { name: "Sıcak Yaldız", color: "#d97706" },
];

export function EditorToolbar({
  editorRef,
  syncContent,
  onCleanTextClick,
}: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasExistingLink, setHasExistingLink] = useState(false);

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const linkModalRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
      if (
        linkModalRef.current &&
        !linkModalRef.current.contains(e.target as Node)
      ) {
        setShowLinkModal(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Save selection before opening popovers
  const rememberSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore selection
  const restoreSelection = () => {
    if (savedRangeRef.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  // Execute WYSIWYG command directly on selected text without losing focus
  const exec = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    syncContent();
  };

  // Apply color to selected text
  const applyInlineColor = (colorCSS: string) => {
    restoreSelection();
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    try {
      document.execCommand("styleWithCSS", false, "true");
      const ok = document.execCommand("foreColor", false, colorCSS);
      if (!ok) {
        throw new Error("foreColor command not supported");
      }
      syncContent();
    } catch {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.color = colorCSS;

      try {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);

        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
        syncContent();
      } catch (err) {
        console.error("Renk uygulama hatası:", err);
      }
    }
    setShowColorPicker(false);
  };

  // Open link modal
  const handleOpenLinkModal = () => {
    rememberSelection();
    const sel = window.getSelection();
    let currentHref = "";
    let isInsideA = false;
    if (sel && sel.anchorNode) {
      const a = sel.anchorNode.parentElement?.closest("a");
      if (a) {
        currentHref = a.getAttribute("href") || "";
        isInsideA = true;
      }
    }
    setLinkUrl(currentHref);
    setHasExistingLink(isInsideA);
    setShowLinkModal(true);
  };

  // Apply Link
  const handleApplyLink = () => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setShowLinkModal(false);
      return;
    }

    let finalUrl = linkUrl.trim();
    if (
      finalUrl &&
      !/^https?:\/\//i.test(finalUrl) &&
      !finalUrl.startsWith("/") &&
      !finalUrl.startsWith("#") &&
      !finalUrl.startsWith("mailto:")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!finalUrl) {
      document.execCommand("unlink", false);
      syncContent();
      setShowLinkModal(false);
      return;
    }

    const range = sel.getRangeAt(0);

    if (sel.isCollapsed) {
      // Metin seçilmediyse link adresinin kendisini metin olarak ekle
      const link = document.createElement("a");
      link.href = finalUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = finalUrl;
      link.className =
        "text-amber-800 underline decoration-amber-700/60 font-medium hover:text-amber-950 transition-colors";
      range.insertNode(link);
      range.collapse(false);
    } else {
      // Seçili metni linkle sar
      const link = document.createElement("a");
      link.href = finalUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className =
        "text-amber-800 underline decoration-amber-700/60 font-medium hover:text-amber-950 transition-colors";

      const fragment = range.extractContents();
      link.appendChild(fragment);
      range.insertNode(link);

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(link);
      sel.addRange(newRange);
    }

    syncContent();
    setShowLinkModal(false);
  };

  // Remove Link
  const handleRemoveLink = () => {
    restoreSelection();
    document.execCommand("unlink", false);
    syncContent();
    setShowLinkModal(false);
  };

  // Apply font family ONLY to selected text
  const applyInlineFont = (fontFamilyCSS: string) => {
    if (editorRef.current) editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontFamily = fontFamilyCSS;

    try {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      syncContent();
    } catch (err) {
      console.error("Font uygulama hatası:", err);
    }
  };

  // Apply font size (punto) ONLY to selected text
  const applyInlineSize = (sizeCSS: string) => {
    if (editorRef.current) editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = sizeCSS;

    try {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
      syncContent();
    } catch (err) {
      console.error("Punto uygulama hatası:", err);
    }
  };

  return (
    <div className="sticky top-2 sm:top-3 z-30 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#eee3d3]/98 border border-[#d6c4ad] shadow-[0_6px_24px_rgba(45,24,9,0.14)] backdrop-blur-md mb-5 select-none transition-all">
      {/* GRUP 1: Karakter Stilleri (Kalın, İtalik, Altı Çizili, Üstü Çizili) */}
      <div className="flex items-center gap-0.5 bg-[#faf5ed] p-0.5 rounded-xl border border-[#d8c7b3] shadow-2xs h-8 sm:h-9">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
          title="Kalın (Ctrl+B)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
          title="İtalik (Ctrl+I)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("underline");
          }}
          title="Altı Çizili (Ctrl+U)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("strikeThrough");
          }}
          title="Üstü Çizili"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Strikethrough className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* GRUP 2: Metin Rengi & Bağlantı (Link) */}
      <div className="flex items-center gap-0.5 bg-[#faf5ed] p-0.5 rounded-xl border border-[#d8c7b3] shadow-2xs h-8 sm:h-9 relative">
        {/* Renk Seçici Butonu */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              rememberSelection();
              setShowColorPicker(!showColorPicker);
              setShowLinkModal(false);
            }}
            title="Metin Rengini Değiştir"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-95 ${
              showColorPicker
                ? "bg-[#3e2411] text-[#faedd9]"
                : "hover:bg-[#ded0bf] text-[#3e2411]"
            }`}
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
          </button>

          {/* Antika Mürekkep Renk Paleti Popover */}
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 rounded-2xl bg-[#221006] border-2 border-[#8c5828] shadow-[0_16px_35px_rgba(0,0,0,0.8)] z-50 w-56 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-serif font-bold tracking-wider text-amber-200/70 uppercase mb-2 px-0.5">
                Mürekkep Tonları
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {INK_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyInlineColor(c.color);
                    }}
                    title={c.name}
                    className="w-8 h-8 rounded-lg border border-white/20 hover:scale-110 transition-transform shadow-xs cursor-pointer flex items-center justify-center group"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>

              {/* Özel Renk Seçici */}
              <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                <span className="text-[11px] font-serif text-[#faeedd]/80">
                  Özel Ton:
                </span>
                <input
                  type="color"
                  onChange={(e) => applyInlineColor(e.target.value)}
                  className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent p-0"
                  title="İstediğiniz rengi seçin"
                />
              </div>
            </div>
          )}
        </div>

        {/* Link Butonu */}
        <div className="relative" ref={linkModalRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleOpenLinkModal();
              setShowColorPicker(false);
            }}
            title="Seçili Metne Bağlantı (Link) Ekle / Düzenle"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-95 ${
              showLinkModal
                ? "bg-[#3e2411] text-[#faedd9]"
                : "hover:bg-[#ded0bf] text-[#3e2411]"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
          </button>

          {/* Link Popover */}
          {showLinkModal && (
            <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 p-3 rounded-2xl bg-[#221006] border-2 border-[#8c5828] shadow-[0_16px_35px_rgba(0,0,0,0.8)] z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-amber-200 tracking-wide flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bağlantı (Link) Ekle</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="text-white/50 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="https://orneksite.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyLink();
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-amber-600/40 text-xs font-serif text-[#faebd7] placeholder:text-amber-200/30 focus:outline-hidden focus:border-amber-400"
                  autoFocus
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  {hasExistingLink && (
                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-serif border border-rose-700/50 cursor-pointer flex items-center gap-1 mr-auto"
                      title="Bağlantıyı Kaldır"
                    >
                      <Unlink className="w-3 h-3" />
                      <span>Kaldır</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#faeedd] text-xs font-serif cursor-pointer"
                  >
                    İptal
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyLink}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-[#1a0c04] font-bold text-xs font-serif shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{hasExistingLink ? "Güncelle" : "Ekle"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRUP 3: Blok ve Yapı Butonları (Başlık 2, Başlık 3, Alıntı, Bozkır Ayracı) */}
      <div className="flex items-center gap-0.5 bg-[#faf5ed] p-0.5 rounded-xl border border-[#d8c7b3] shadow-2xs h-8 sm:h-9">
        {/* Heading 2 */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "h2");
          }}
          title="Bölüm Başlığı (H2)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Heading2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "h3");
          }}
          title="Alt Başlık (H3)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Heading3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Quote */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "blockquote");
          }}
          title="Edebi Alıntı Bloğu"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Divider */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertHorizontalRule");
          }}
          title="Bozkır Ayracı Çizgisi"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#ded0bf] text-[#3e2411] transition-colors cursor-pointer active:scale-95"
        >
          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* GRUP 4: Seçili Metin İçin Font Ailesi */}
      <div className="flex items-center gap-0.5 bg-[#faf5ed] p-0.5 rounded-xl border border-[#d8c7b3] shadow-2xs h-8 sm:h-9">
        <Type className="w-3.5 h-3.5 text-amber-800/80 mx-1 shrink-0" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyInlineFont("Georgia, Cambria, 'Times New Roman', serif");
          }}
          title="Seçili metni Klasik Serif fontu yap"
          className="px-2 h-7 sm:h-8 flex items-center rounded-lg hover:bg-[#e8ded0] text-xs font-serif text-[#3e2411] font-medium transition-colors cursor-pointer"
        >
          Serif
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyInlineFont("'Courier New', Courier, monospace");
          }}
          title="Seçili metni Daktilo (Monospace) fontu yap"
          className="px-2 h-7 sm:h-8 flex items-center rounded-lg hover:bg-[#e8ded0] text-xs font-mono text-[#3e2411] font-semibold transition-colors cursor-pointer"
        >
          Daktilo
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyInlineFont(
              "ui-sans-serif, system-ui, -apple-system, sans-serif"
            );
          }}
          title="Seçili metni Modern Yalın (Sans) fontu yap"
          className="px-2 h-7 sm:h-8 flex items-center rounded-lg hover:bg-[#e8ded0] text-xs font-sans text-[#3e2411] font-medium transition-colors cursor-pointer"
        >
          Yalın
        </button>
      </div>

      {/* GRUP 5: Seçili Metin İçin Punto Boyutları */}
      <div className="flex items-center gap-0.5 bg-[#faf5ed] p-0.5 rounded-xl border border-[#d8c7b3] shadow-2xs h-8 sm:h-9">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyInlineSize("0.85em");
          }}
          title="Seçili metni daha küçük yap (A⁻)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#e8ded0] text-xs font-serif font-bold text-[#3e2411] transition-colors cursor-pointer"
        >
          A⁻
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyInlineSize("1em");
          }}
          title="Seçili metni standart punto yap (A)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#e8ded0] text-sm font-serif font-semibold text-[#3e2411] transition-colors cursor-pointer"
        >
          A
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyInlineSize("1.32em");
          }}
          title="Seçili metni daha büyük yap (A⁺)"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#e8ded0] text-base font-serif font-bold text-[#3e2411] transition-colors cursor-pointer"
        >
          A⁺
        </button>
      </div>

      {/* GRUP 6: Metni Arındırıcı (Temizleme) */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onCleanTextClick();
        }}
        title="WhatsApp & Word karmaşasını temizle"
        className="flex items-center gap-1.5 px-2.5 h-8 sm:h-9 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-xs font-serif text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-2xs active:scale-95"
      >
        <Eraser className="w-3.5 h-3.5 text-amber-800" />
        <span>Arındır</span>
      </button>
    </div>
  );
}
