"use client";

import React, { useEffect, useRef } from "react";
import { cleanPastedText } from "@/lib/text-cleaner";
import { ensureHtml } from "@/lib/html-utils";

export interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  fontFamily: "serif" | "typewriter" | "sans";
  fontSize: "small" | "medium" | "large";
  placeholder?: string;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onAutoCleanNotice?: () => void;
}

export function RichEditor({
  content,
  onChange,
  fontFamily,
  fontSize,
  placeholder = "Yazmaya başlayın... (Kalın ve İtalik için metni seçip üstteki butonlara basabilirsiniz)",
  editorRef,
  onAutoCleanNotice,
}: RichEditorProps) {
  const isTypingRef = useRef(false);

  // Sync external content to editor innerHTML
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    // Convert legacy plain text or markdown to real HTML so it renders formatted
    const formattedHtml = ensureHtml(content);

    // Only update innerHTML if it doesn't match and user is not currently actively typing
    if (!isTypingRef.current && el.innerHTML !== formattedHtml) {
      el.innerHTML = formattedHtml || "";
    }
  }, [content, editorRef]);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    isTypingRef.current = true;
    const html = el.innerHTML;
    onChange(html);
    // Reset typing flag shortly after
    setTimeout(() => {
      isTypingRef.current = false;
    }, 150);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const rawText = e.clipboardData.getData("text/plain");
    if (!rawText) return;

    // Check if it's from WhatsApp / Word
    const hasWhatsApp = /\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(rawText);
    const cleaned = cleanPastedText(rawText);

    if (hasWhatsApp || cleaned !== rawText) {
      e.preventDefault();
      // Split into paragraphs preserving line breaks
      const paragraphs = cleaned.split(/\r?\n\r?\n/).filter(Boolean);
      const htmlToInsert = paragraphs
        .map((p) => `<p>${p.replace(/\r?\n/g, "<br>")}</p>`)
        .join("");

      document.execCommand("insertHTML", false, htmlToInsert);
      handleInput();

      if (onAutoCleanNotice) {
        onAutoCleanNotice();
      }
    }
  };

  const fontClass =
    fontFamily === "typewriter"
      ? "font-mono tracking-tight"
      : fontFamily === "sans"
      ? "font-sans"
      : "font-serif";

  const sizeClass =
    fontSize === "small"
      ? "text-base sm:text-lg leading-relaxed"
      : fontSize === "large"
      ? "text-xl sm:text-2xl leading-[1.95]"
      : "text-lg sm:text-xl leading-[1.85]";

  return (
    <div className="relative min-h-[260px] pb-12">
      {/* Visual Placeholder when empty */}
      {(!content || content === "<p><br></p>" || content === "<br>") && (
        <div className="absolute top-0 left-0 text-[#a68972]/50 pointer-events-none font-serif italic text-lg select-none">
          {placeholder}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        className={`w-full outline-hidden min-h-[240px] text-[#2b1b0e] ${fontClass} ${sizeClass}
          [&>p]:my-4 [&>p]:leading-relaxed
          [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-bold [&>h2]:text-[#2d1808] [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:pb-1.5 [&>h2]:border-b [&>h2]:border-[#ddcfbe]
          [&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-bold [&>h3]:text-[#3c220f] [&>h3]:mt-6 [&>h3]:mb-2.5
          [&>blockquote]:my-6 [&>blockquote]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-amber-800/60 [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:text-[#462810] [&>blockquote]:bg-[#eee4d6]/40 [&>blockquote]:py-3 [&>blockquote]:rounded-r-xl
          [&>ul]:my-4 [&>ul]:space-y-1.5 [&>ul]:pl-6 [&>ul]:list-disc [&>ul]:marker:text-amber-800
          [&>hr]:my-8 [&>hr]:border-0 [&>hr]:h-px [&>hr]:bg-gradient-to-r [&>hr]:from-transparent [&>hr]:via-amber-900/40 [&>hr]:to-transparent
          [&_strong]:font-bold [&_strong]:text-[#231407]
          [&_b]:font-bold [&_b]:text-[#231407]
          [&_em]:italic [&_em]:text-[#381e0b]
          [&_i]:italic [&_i]:text-[#381e0b]
        `}
      />
    </div>
  );
}
