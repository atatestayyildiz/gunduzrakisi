"use client";

import React from "react";

// Parses inline bold, italic, and links safely
function renderInlineText(text: string): React.ReactNode[] {
  // Regex to match **bold**, *italic*, and [link](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-[#231407]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return (
        <em key={index} className="italic text-[#381e0b]">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-900 underline underline-offset-2 hover:text-amber-950 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

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
  const rawParagraphs = content.split("\n\n").map((p) => p.trim()).filter(Boolean);

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

  let firstParagraphRendered = false;

  return (
    <div className={`${fontClass} ${sizeClass} text-[#2c1d11] space-y-6 sm:space-y-7`}>
      {rawParagraphs.map((block, index) => {
        // Image markdown: ![alt](url)
        const imgMatch = block.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const alt = imgMatch[1];
          const src = imgMatch[2];
          return (
            <figure key={index} className="my-8 text-center">
              <img
                src={src}
                alt={alt || "Görsel"}
                className="rounded-2xl max-w-full max-h-[600px] mx-auto shadow-md border border-[#d8c7b4] object-contain"
                loading="lazy"
              />
              {alt && alt !== "Görsel" && (
                <figcaption className="mt-2.5 text-xs font-serif italic text-[#785b44]">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // Section Heading 2: ## ...
        if (block.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-2xl sm:text-3xl font-bold text-[#2d1808] mt-10 mb-4 tracking-tight border-b border-[#ddcfbe]/70 pb-2"
            >
              {renderInlineText(block.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // Section Heading 3: ### ...
        if (block.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-xl sm:text-2xl font-bold text-[#3c220f] mt-8 mb-3"
            >
              {renderInlineText(block.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // Section Divider: * * * or ---
        if (
          block === "* * *" ||
          block === "---" ||
          block === "***" ||
          block === "___"
        ) {
          return (
            <div
              key={index}
              className="my-10 flex items-center justify-center gap-3 text-amber-900/50 select-none"
            >
              <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-amber-900/30" />
              <span className="text-xs tracking-widest font-serif">✦ ✦ ✦</span>
              <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-amber-900/30" />
            </div>
          );
        }

        // Blockquote: starts with > or quotation mark
        const isQuote =
          block.startsWith("> ") ||
          block.startsWith("“") ||
          block.startsWith('"') ||
          block.startsWith("«");

        if (isQuote) {
          const cleanQuote = block.startsWith("> ") ? block.slice(2) : block;
          return (
            <blockquote
              key={index}
              className="my-8 pl-6 sm:pl-8 border-l-4 border-amber-800/60 font-serif italic text-xl sm:text-2xl text-[#462810] bg-[#eee4d6]/40 py-3.5 pr-4 rounded-r-2xl shadow-xs"
            >
              {renderInlineText(cleanQuote)}
            </blockquote>
          );
        }

        // Unordered list: block contains lines starting with -
        const lines = block.split("\n");
        const isList = lines.every((line) => line.trim().startsWith("- "));
        if (isList) {
          return (
            <ul key={index} className="my-4 space-y-2 pl-6 list-disc marker:text-amber-800">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="leading-relaxed">
                  {renderInlineText(line.replace(/^-\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Regular paragraph
        const applyDropCap = !firstParagraphRendered;
        firstParagraphRendered = true;

        return (
          <p
            key={index}
            className={`text-justify hyphens-auto leading-relaxed ${
              applyDropCap
                ? "first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:text-amber-900 first-letter:font-serif first-letter:leading-none"
                : ""
            }`}
          >
            {renderInlineText(block)}
          </p>
        );
      })}
    </div>
  );
}
