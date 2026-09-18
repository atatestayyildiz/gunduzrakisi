/**
 * Turkish-aware transliteration and slug generation utility.
 */
export function slugify(text: string): string {
  if (!text) return "";

  const trMap: Record<string, string> = {
    ç: "c", Ç: "c",
    ğ: "g", Ğ: "g",
    ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o",
    ş: "s", Ş: "s",
    ü: "u", Ü: "u",
  };

  const transliterated = text
    .split("")
    .map((char) => trMap[char] || char)
    .join("");

  return transliterated
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accent marks
    .replace(/[^a-z0-9]+/g, "-")      // replace non-alphanumerics (including quotes, punctuation) with hyphens
    .replace(/^-+|-+$/g, "")          // trim leading and trailing hyphens
    .replace(/-{2,}/g, "-");          // collapse multiple consecutive hyphens
}

/**
 * Safely decodes a URL component without throwing URIError.
 */
export function safeDecodeURI(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Robust matcher that checks if an article matches a URL slug parameter.
 * Handles URL-encoded characters (like %C3%BC for ü), Turkish transliteration,
 * legacy slugs, IDs, and title slugification.
 */
export function matchesArticleSlug(
  article: { id: string; slug: string; title: string },
  rawParamSlug: string
): boolean {
  if (!rawParamSlug) return false;

  const rawLower = rawParamSlug.toLowerCase().trim();
  const decodedLower = safeDecodeURI(rawParamSlug).toLowerCase().trim();
  const slugifiedParam = slugify(decodedLower);

  const candidates = [
    article.slug?.toLowerCase().trim(),
    safeDecodeURI(article.slug || "").toLowerCase().trim(),
    slugify(article.slug || ""),
    article.id?.toLowerCase().trim(),
    slugify(article.title || ""),
  ];

  return candidates.some(
    (cand) =>
      cand &&
      (cand === rawLower ||
        cand === decodedLower ||
        cand === slugifiedParam)
  );
}
