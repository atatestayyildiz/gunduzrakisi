/**
 * Cleans and normalizes text pasted from WhatsApp, Microsoft Word, Google Docs, etc.
 */
export function cleanPastedText(rawText: string): string {
  if (!rawText) return "";

  let text = rawText;

  // 1. Remove WhatsApp timestamps and author prefixes
  // Format A: Date first, then time -> e.g. "17.09.2026, 14:32 - Mert: " or "[17.09.2026 14:32:05] Mert: "
  text = text.replace(/^\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\]?\s*(?:-\s*)?[^:\n]+:\s*/gm, "");

  // Format B: Time first, then date -> e.g. "[14:32, 17.09.2026] Mert: " or "14:32, 17/09/2026 - Mert: "
  text = text.replace(/^\[?\d{1,2}:\d{2}(?::\d{2})?,?\s+\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\]?\s*(?:-\s*)?[^:\n]+:\s*/gm, "");

  // Format C: Generic WhatsApp / Telegram sender line -> e.g. "[14:32] Mert: "
  text = text.replace(/^\[\d{1,2}:\d{2}(?::\d{2})?\]\s+[^:\n]+:\s*/gm, "");

  // 2. Remove common WhatsApp system notices
  text = text.replace(/<Medya dahil edilmedi>|<Media omitted>/gi, "");
  text = text.replace(/Bu mesaj silindi\.|This message was deleted\./gi, "");

  // 3. Normalize non-breaking spaces and zero-width characters
  text = text.replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ");
  text = text.replace(/[\u00AD\u200C\u200D]/g, ""); // soft hyphens and joiners

  // 4. Normalize quotes and dashes
  text = text.replace(/[\u2018\u2019\u201A\u201B]/g, "'");
  text = text.replace(/[\u201C\u201D\u201E\u201F]/g, '"');
  text = text.replace(/[\u2013\u2014]/g, "–");

  // 5. Clean up Word bullets and fake list artifacts
  text = text.replace(/^[•·o*]\s+/gm, "• ");

  // 6. Fix excessive spaces at line ends
  text = text.replace(/[ \t]+$/gm, "");

  // 7. Collapse 3+ consecutive line breaks into 2
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Calculates estimated reading time and iconic "yudum" (sips) count.
 * Average reading speed: ~180 words per minute.
 * 1 yudum rakı ~ 1.5 - 2 minutes of leisurely reading.
 */
export function calculateSips(text: string): { readTimeMinutes: number; sips: number } {
  if (!text) return { readTimeMinutes: 1, sips: 1 };
  const plainText = text.replace(/<[^>]+>/g, " ").trim();
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 180));
  // 1 to 2 mins per sip
  const sips = Math.max(1, Math.ceil(readTimeMinutes / 1.5));
  return { readTimeMinutes, sips };
}
