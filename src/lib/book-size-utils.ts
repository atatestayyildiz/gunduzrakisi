/**
 * 5 Distinct Book Dimensions (Enine ve Boyuna Farklı Ölçüler)
 * 
 * Gerçek kitap yayıncılığı standartlarına (Cep boy, İnce-uzun, Standart roman, Geniş deneme, Büyük boy cilt)
 * dayanır; hem genişlik (widthScale) hem yükseklik (heightRatio) açısından 5 farklı silüet sunar.
 */

export interface BookSizePreset {
  id: string;
  name: string;
  widthScale: number;
  heightRatio: number;
}

export const BOOK_SIZE_PRESETS: BookSizePreset[] = [
  // 1. Kompakt / Cep Boy: Biraz daha kibar ve zarif
  { id: "pocket", name: "Cep Boy", widthScale: 0.94, heightRatio: 0.93 },

  // 2. İnce-Uzun: Zarif dikey deneme boyutu
  { id: "slim-tall", name: "İnce Uzun", widthScale: 0.96, heightRatio: 1.04 },

  // 3. Standart Edebiyat: Dengeli referans boyutu
  { id: "standard", name: "Standart Edebiyat", widthScale: 1.00, heightRatio: 1.00 },

  // 4. Dolgun Deneme: Hafifçe geniş ama komşu kitapları sıkıştırmayan ölçü
  { id: "wide-medium", name: "Geniş Boy", widthScale: 1.02, heightRatio: 0.97 },

  // 5. Ciltli Edisyon: Dikkat çekici ama raf sınırlarını aşmayan asil oran
  { id: "grand-tome", name: "Büyük Boy", widthScale: 1.03, heightRatio: 1.05 },
];

/**
 * Deterministic pseudo-random number generator from a string seed.
 * Ensures consistent look across server/client renders without hydration mismatch.
 */
function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Assigns book sizes to a shelf row of books such that:
 * 1. 5 different presets are used across the library.
 * 2. Every shelf contains MINIMUM 3 different book size formats.
 * 3. The distribution is deterministic based on the book IDs and shelf index,
 *    meaning it looks delightfully random but won't shuffle or jitter on re-render.
 */
export function assignShelfBookSizes<T extends { id: string }>(
  shelfBooks: T[],
  shelfIndex: number
): { book: T; size: BookSizePreset }[] {
  const shelfSeed = shelfIndex * 1337;
  const count = shelfBooks.length;

  if (count === 0) return [];

  // If shelf has only 1 or 2 books
  if (count <= 2) {
    return shelfBooks.map((book, idx) => ({
      book,
      size: BOOK_SIZE_PRESETS[(idx + shelfIndex) % BOOK_SIZE_PRESETS.length],
    }));
  }

  // Pick 3 to 4 distinct preset indices for this shelf to guarantee >= 3 distinct formats
  const availablePresetIndices = [0, 1, 2, 3, 4];
  // Deterministic shuffle of presets for this shelf
  for (let i = availablePresetIndices.length - 1; i > 0; i--) {
    const j = (pseudoRandom(shelfIndex + "_" + i) + shelfSeed) % (i + 1);
    [availablePresetIndices[i], availablePresetIndices[j]] = [
      availablePresetIndices[j],
      availablePresetIndices[i],
    ];
  }

  // Ensure minimum 3 unique choices on the shelf:
  const chosenIndices: number[] = [];
  for (let i = 0; i < Math.min(3, count); i++) {
    chosenIndices.push(availablePresetIndices[i]);
  }

  // Remaining slots get pseudo-randomly selected presets
  for (let i = 3; i < count; i++) {
    const bookSeed = pseudoRandom(shelfBooks[i].id + "_" + i);
    const pick = availablePresetIndices[bookSeed % availablePresetIndices.length];
    chosenIndices.push(pick);
  }

  // Shuffle chosenIndices deterministically along the shelf slots so the first 3 aren't static
  for (let i = chosenIndices.length - 1; i > 0; i--) {
    const j = (pseudoRandom("pos_" + shelfIndex + "_" + i) + i) % (i + 1);
    [chosenIndices[i], chosenIndices[j]] = [chosenIndices[j], chosenIndices[i]];
  }

  return shelfBooks.map((book, idx) => ({
    book,
    size: BOOK_SIZE_PRESETS[chosenIndices[idx]],
  }));
}
