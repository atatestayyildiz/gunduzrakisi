/**
 * Utilities to ensure text and legacy markdown are converted to clean, semantic HTML.
 * Ensures single line breaks are preserved and never collapse onto a single line.
 */

export function inlineFormat(text: string): string {
  if (!text) return "";

  // Convert **bold** to <strong>bold</strong>
  let res = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *italic* to <em>italic</em>
  res = res.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Convert [text](url) to <a href="url">text</a>
  res = res.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-900 underline underline-offset-2 hover:text-amber-950 font-medium">$1</a>'
  );

  return res;
}

export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  return /<(p|div|h[1-6]|blockquote|ul|ol|figure|hr|br)\b[^>]*>/i.test(content);
}

export function ensureHtml(content: string): string {
  if (!content) return "";

  // If already rich HTML, return clean content
  if (isHtmlContent(content)) {
    return content;
  }

  // Otherwise, parse line by line (preserving every single line break and markdown tag)
  const lines = content.split(/\r?\n/);
  const output: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      output.push("</ul>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    // List item (- item)
    if (trimmed.startsWith("- ")) {
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      const itemText = inlineFormat(trimmed.slice(2));
      output.push(`<li>${itemText}</li>`);
      continue;
    }

    closeList();

    // Image (![alt](url))
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      output.push(
        `<figure class="my-6 text-center"><img src="${src}" alt="${alt || "Görsel"}" class="rounded-2xl max-w-full max-h-[550px] mx-auto shadow-md border border-[#d8c7b4] object-contain" />${
          alt && alt !== "Görsel"
            ? `<figcaption class="mt-2 text-xs font-serif italic text-[#785b44]">${alt}</figcaption>`
            : ""
        }</figure>`
      );
      continue;
    }

    // Heading 2 (## ...)
    if (trimmed.startsWith("## ")) {
      output.push(`<h2>${inlineFormat(trimmed.slice(3))}</h2>`);
      continue;
    }

    // Heading 3 (### ...)
    if (trimmed.startsWith("### ")) {
      output.push(`<h3>${inlineFormat(trimmed.slice(4))}</h3>`);
      continue;
    }

    // Divider (* * * or ---)
    if (
      trimmed === "* * *" ||
      trimmed === "---" ||
      trimmed === "***" ||
      trimmed === "___"
    ) {
      output.push("<hr>");
      continue;
    }

    // Blockquote (> ... or “...”)
    if (
      trimmed.startsWith("> ") ||
      trimmed.startsWith("“") ||
      trimmed.startsWith('"') ||
      trimmed.startsWith("«")
    ) {
      const quoteText = trimmed.startsWith("> ") ? trimmed.slice(2) : trimmed;
      output.push(`<blockquote>${inlineFormat(quoteText)}</blockquote>`);
      continue;
    }

    // Regular paragraph for the line
    output.push(`<p>${inlineFormat(trimmed)}</p>`);
  }

  closeList();

  return output.join("");
}
