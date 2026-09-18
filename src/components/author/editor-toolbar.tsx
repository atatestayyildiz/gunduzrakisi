"use client";

import React from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Eraser,
  Type,
} from "lucide-react";

export interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  syncContent: () => void;
  onCleanTextClick: () => void;
}

export function EditorToolbar({
  editorRef,
  syncContent,
  onCleanTextClick,
}: EditorToolbarProps) {
  // Execute WYSIWYG command directly on selected text without losing focus
  const exec = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);

    // If bold or italic was applied to a selected text, break out caret so continuing typing doesn't stay formatted
    const sel = window.getSelection();
    if (sel && (command === "bold" || command === "italic") && sel.rangeCount > 0) {
      sel.collapseToEnd();
      const node = sel.focusNode;
      const parent = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);

      if (parent && /^(B|STRONG|I|EM|SPAN)$/.test(parent.tagName)) {
        const cleanNode = document.createTextNode("\u200B");
        if (parent.nextSibling) {
          parent.parentNode?.insertBefore(cleanNode, parent.nextSibling);
        } else {
          parent.parentNode?.appendChild(cleanNode);
        }

        const newRange = document.createRange();
        newRange.setStart(cleanNode, 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        if (command === "bold" && document.queryCommandState("bold")) {
          document.execCommand("bold", false);
        }
        if (command === "italic" && document.queryCommandState("italic")) {
          document.execCommand("italic", false);
        }
      }
    }

    syncContent();
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

      // Reselect the formatted span
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

      // Reselect the formatted span
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
          title="Seçili kısmı kalın yap"
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
          title="Seçili kısmı italik yap"
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
          title="Bölüm Başlığı (H2)"
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
          <span className="hidden sm:inline">Metni Arındır</span>
        </button>
      </div>

      {/* Inline Selection Typography: Font & Punto applied ONLY to selected text */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Seçili Metin İçin Font Butonları */}
        <div className="flex items-center gap-0.5 bg-[#faf5ed] p-1 rounded-xl border border-[#d8c7b3]">
          <span className="text-[11px] font-serif text-amber-900/70 px-1 font-semibold select-none flex items-center gap-1">
            <Type className="w-3 h-3 text-amber-800" />
            <span className="hidden md:inline">Font:</span>
          </span>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyInlineFont("Georgia, Cambria, 'Times New Roman', serif");
            }}
            title="Seçili metni Klasik Serif fontu yap"
            className="px-2 py-1 rounded-lg hover:bg-[#e8ded0] text-xs font-serif text-[#3e2411] font-medium transition-colors cursor-pointer"
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
            className="px-2 py-1 rounded-lg hover:bg-[#e8ded0] text-xs font-mono text-[#3e2411] font-semibold transition-colors cursor-pointer"
          >
            Daktilo
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyInlineFont("ui-sans-serif, system-ui, -apple-system, sans-serif");
            }}
            title="Seçili metni Modern Yalın (Sans) fontu yap"
            className="px-2 py-1 rounded-lg hover:bg-[#e8ded0] text-xs font-sans text-[#3e2411] font-medium transition-colors cursor-pointer"
          >
            Yalın
          </button>
        </div>

        {/* Seçili Metin İçin Punto Butonları */}
        <div className="flex items-center gap-0.5 bg-[#faf5ed] p-1 rounded-xl border border-[#d8c7b3]">
          <span className="text-[11px] font-serif text-amber-900/70 px-1 font-semibold select-none">
            Punto:
          </span>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyInlineSize("0.85em");
            }}
            title="Seçili metni daha küçük yap (A⁻)"
            className="px-2 py-0.5 rounded-lg hover:bg-[#e8ded0] text-xs font-serif font-bold text-[#3e2411] transition-colors cursor-pointer"
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
            className="px-2 py-0.5 rounded-lg hover:bg-[#e8ded0] text-sm font-serif font-semibold text-[#3e2411] transition-colors cursor-pointer"
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
            className="px-2 py-0.5 rounded-lg hover:bg-[#e8ded0] text-base font-serif font-bold text-[#3e2411] transition-colors cursor-pointer"
          >
            A⁺
          </button>
        </div>
      </div>
    </div>
  );
}


