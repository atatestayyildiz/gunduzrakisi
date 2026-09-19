"use client";

import React from "react";
import { ensureHtml } from "@/lib/html-utils";

export interface MarkdownRendererProps {
  content: string;
  fontFamily?: "serif" | "typewriter" | "sans";
  fontSize?: "small" | "medium" | "large";
}

export function MarkdownRenderer({
  content,
  fontFamily = "serif",
  fontSize = "medium",
}: MarkdownRendererProps) {
  const html = ensureHtml(content);

  // Font family classes
  const fontClass =
    fontFamily === "typewriter"
      ? "font-mono tracking-tight"
      : fontFamily === "sans"
      ? "font-sans"
      : "font-serif";

  // Base font size & line-height classes
  const sizeClass =
    fontSize === "small"
      ? "text-base sm:text-lg leading-relaxed"
      : fontSize === "large"
      ? "text-xl sm:text-[23px] leading-[1.95]"
      : "text-lg sm:text-[21px] leading-[1.85]";

  return (
    <div
      className={`reading-article ${fontClass} ${sizeClass} text-[#2c1d11]
        [&>p]:my-6 [&>p]:leading-relaxed [&>p]:text-justify [&>p]:hyphens-auto
        [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:text-5xl [&>p:first-of-type]:sm:first-letter:text-6xl [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:text-amber-900 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:leading-none
        [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-bold [&>h2]:text-[#2d1808] [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:tracking-tight [&>h2]:border-b [&>h2]:border-[#ddcfbe]/70 [&>h2]:pb-2
        [&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-bold [&>h3]:text-[#3c220f] [&>h3]:mt-8 [&>h3]:mb-3
        [&>blockquote]:my-8 [&>blockquote]:pl-6 [&>blockquote]:sm:pl-8 [&>blockquote]:border-l-4 [&>blockquote]:border-amber-800/60 [&>blockquote]:font-serif [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:sm:text-2xl [&>blockquote]:text-[#462810] [&>blockquote]:bg-[#eee4d6]/40 [&>blockquote]:py-3.5 [&>blockquote]:pr-4 [&>blockquote]:rounded-r-2xl [&>blockquote]:shadow-xs
        [&>ul]:my-4 [&>ul]:space-y-2 [&>ul]:pl-6 [&>ul]:list-disc [&>ul]:marker:text-amber-800
        [&>hr]:my-10 [&>hr]:border-0 [&>hr]:h-px [&>hr]:bg-gradient-to-r [&>hr]:from-transparent [&>hr]:via-amber-900/40 [&>hr]:to-transparent
        [&_strong]:font-bold [&_strong]:text-[#231407]
        [&_b]:font-bold [&_b]:text-[#231407]
        [&_em]:italic [&_em]:text-[#381e0b]
        [&_i]:italic [&_i]:text-[#381e0b]
        [&_u]:underline [&_u]:decoration-amber-900/60
        [&_s]:line-through [&_s]:opacity-75
        [&_del]:line-through [&_del]:opacity-75
        [&_strike]:line-through [&_strike]:opacity-75
        [&_a]:text-amber-800 [&_a]:underline [&_a]:decoration-amber-700/60 [&_a]:font-medium [&_a:hover]:text-amber-950 [&_a:hover]:decoration-amber-950
        [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:max-h-[600px] [&_img]:mx-auto [&_img]:shadow-md [&_img]:border [&_img]:border-[#d8c7b4]
        [&_figure]:my-8 [&_figure]:text-center
        [&_figcaption]:mt-2.5 [&_figcaption]:text-xs [&_figcaption]:font-serif [&_figcaption]:italic [&_figcaption]:text-[#785b44]
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

