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
} from "lucide-react";

export interface EditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  setContent: (val: string) => void;
  fontFamily: "serif" | "typewriter" | "sans";
  setFontFamily: (font: "serif" | "typewriter" | "sans") => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (size: "small" | "medium" | "large") => void;
  onInsertImageClick: () => void;
  onCleanTextClick: () => void;
}

export function EditorToolbar({
  textareaRef,
  content,
  setContent,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  onInsertImageClick,
  onCleanTextClick,
}: EditorToolbarProps) {
  // Helper to wrap or insert text around selection
  const wrapSelection = (prefix: string, suffix = prefix, placeholder = "metin") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);

    let replacement = "";
    let newCursorPos = 0;

    if (selected) {
      // If text is selected, wrap it
      replacement = `${prefix}${selected}${suffix}`;
      const newContent = content.slice(0, start) + replacement + content.slice(end);
      setContent(newContent);
      newCursorPos = start + replacement.length;
    } else {
      // If no text is selected, insert placeholder and select it
      replacement = `${prefix}${placeholder}${suffix}`;
      const newContent = content.slice(0, start) + replacement + content.slice(end);
      setContent(newContent);
      newCursorPos = start + prefix.length;
    }

    setTimeout(() => {
      el.focus();
      if (!selected) {
        el.setSelectionRange(newCursorPos, newCursorPos + placeholder.length);
      } else {
        el.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Helper to prepend to the current line
  const prependLine = (prefix: string, defaultText = "Metin buraya...") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const lastNewline = content.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const before = content.slice(0, lineStart);
    const after = content.slice(lineStart);

    // If line already starts with prefix, remove it (toggle)
    if (after.startsWith(prefix)) {
      const toggled = after.slice(prefix.length);
      setContent(before + toggled);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(lineStart, lineStart);
      }, 0);
      return;
    }

    const newContent = before + prefix + (after.trim() ? after : defaultText);
    setContent(newContent);

    setTimeout(() => {
      el.focus();
      const pos = lineStart + prefix.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const insertDivider = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const dividerText = "\n\n* * *\n\n";
    const newContent = content.slice(0, start) + dividerText + content.slice(start);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + dividerText.length, start + dividerText.length);
    }, 0);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#eee3d3]/95 border border-[#d6c4ad] shadow-xs backdrop-blur-xs mb-4">
      {/* Formatting buttons */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Bold */}
        <button
          type="button"
          onClick={() => wrapSelection("**", "**", "kalın metin")}
          title="Kalın (Ctrl+B)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Bold className="w-4 h-4 font-bold" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => wrapSelection("*", "*", "italik metin")}
          title="İtalik (Ctrl+I)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => prependLine("## ", "Bölüm Başlığı")}
          title="Büyük Başlık (##)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={() => prependLine("### ", "Alt Başlık")}
          title="Alt Başlık (###)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        {/* Quote */}
        <button
          type="button"
          onClick={() => prependLine("> ", "Alıntı veya dikkat çeken dize...")}
          title="Edebi Alıntı Bloğu (>)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* List */}
        <button
          type="button"
          onClick={() => prependLine("- ", "Madde")}
          title="Madde İmi (-)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Divider */}
        <button
          type="button"
          onClick={insertDivider}
          title="Bozkır Ayracı (* * *)"
          className="p-2 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-[#d5c2ab] mx-1" />

        {/* Image */}
        <button
          type="button"
          onClick={onInsertImageClick}
          title="Paragraf arasına görsel ekle"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#faf5ed] hover:bg-[#ded0bf] text-xs font-serif text-[#3e2411] border border-[#d8c7b3] transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-800" />
          <span className="hidden sm:inline">Görsel</span>
        </button>

        {/* Clean text */}
        <button
          type="button"
          onClick={onCleanTextClick}
          title="WhatsApp & Word izlerini arındır"
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
