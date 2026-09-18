"use client";

import React from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Minus,
  List,
  Eraser,
  ImageIcon,
  Type,
  Pilcrow,
} from "lucide-react";

export interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  syncContent: () => void;
  fontFamily: "serif" | "typewriter" | "sans";
  setFontFamily: (font: "serif" | "typewriter" | "sans") => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (size: "small" | "medium" | "large") => void;
  onInsertImageClick: () => void;
  onCleanTextClick: () => void;
}

export function EditorToolbar({
  editorRef,
  syncContent,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  onInsertImageClick,
  onCleanTextClick,
}: EditorToolbarProps) {
  // Execute WYSIWYG command directly on selected text without losing focus
  const exec = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    syncContent();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#eee3d3]/95 border border-[#d6c4ad] shadow-xs backdrop-blur-xs mb-4">
      {/* Formatting buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
          title="Kalınlaştır (Seçili metin direkt kalın olur)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Bold className="w-4 h-4 font-bold" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
          title="İtalik Yap (Seçili metin direkt italik olur)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "h2");
          }}
          title="Büyük Başlık (H2)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "h3");
          }}
          title="Alt Başlık (H3)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        {/* Normal Paragraph */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "p");
          }}
          title="Normal Paragraf"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Pilcrow className="w-4 h-4" />
        </button>

        {/* Quote */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("formatBlock", "blockquote");
          }}
          title="Edebi Alıntı Bloğu"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertUnorderedList");
          }}
          title="Madde İmi Listesi"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Divider */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertHorizontalRule");
          }}
          title="Bozkır Ayracı Çizgisi"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[#d5c2ab] mx-1" />

        {/* Image */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onInsertImageClick();
          }}
          title="Görsel ekle (WebP sıkıştırmalı)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-xs font-serif text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-800" />
          <span className="hidden sm:inline">Görsel</span>
        </button>

        {/* Clean text */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onCleanTextClick();
          }}
          title="WhatsApp & Word karmaşasını temizle"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-xs font-serif text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Eraser className="w-3.5 h-3.5 text-amber-800" />
          <span className="hidden sm:inline">Arındır</span>
        </button>
      </div>

      {/* Typography Selectors: Font Family & Size */}
      <div className="flex items-center gap-2">
        {/* Font Family */}
        <div className="flex items-center gap-1 bg-[#faf5ed] p-1 rounded-xl border border-[#d8c7b3]">
          <Type className="w-3.5 h-3.5 text-amber-900 ml-1" />
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as "serif" | "typewriter" | "sans")}
            className="bg-transparent text-xs font-serif text-[#381f0b] font-medium focus:outline-hidden cursor-pointer pr-1"
            title="Yazı ve Okuma Fontu"
          >
            <option value="serif">Klasik Edebi (Serif)</option>
            <option value="typewriter">Daktilo (Remington Mono)</option>
            <option value="sans">Modern Yalın (Sans)</option>
          </select>
        </div>

        {/* Punto / Font Size */}
        <div className="flex items-center bg-[#faf5ed] p-1 rounded-xl border border-[#d8c7b3] text-xs font-serif text-[#381f0b]">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as "small" | "medium" | "large")}
            className="bg-transparent text-xs font-serif text-[#381f0b] font-medium focus:outline-hidden cursor-pointer px-1"
            title="Yazı Boyutu (Punto)"
          >
            <option value="small">Küçük Punto</option>
            <option value="medium">Orta Punto</option>
            <option value="large">Büyük Punto</option>
          </select>
        </div>
      </div>
    </div>
  );
}

