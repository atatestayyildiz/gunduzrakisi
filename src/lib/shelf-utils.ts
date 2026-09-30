import { BookArticle, ShelfItem } from "./types";

const LEGACY_SHELF_CAPACITY = 5;

/**
 * Kitapları raflara dağıtır. Geçerli shelfId'si olan kitap kendi rafına gider;
 * rafı olmayan (eski) kitaplar eski 5'erli düzene göre sırayla yerleştirilir,
 * taşan kısım son rafa eklenir. Her rafın kitapları `order`a göre sıralıdır.
 */
export function assignArticlesToShelves(
  articles: BookArticle[],
  shelves: ShelfItem[]
): Map<string, BookArticle[]> {
  const result = new Map<string, BookArticle[]>();
  shelves.forEach((s) => result.set(s.id, []));
  if (shelves.length === 0) return result;

  const sorted = [...articles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const unassigned: BookArticle[] = [];

  for (const art of sorted) {
    const bucket = art.shelfId ? result.get(art.shelfId) : undefined;
    if (bucket) bucket.push(art);
    else unassigned.push(art);
  }

  unassigned.forEach((art, idx) => {
    const shelfIdx = Math.min(Math.floor(idx / LEGACY_SHELF_CAPACITY), shelves.length - 1);
    result.get(shelves[shelfIdx].id)!.push(art);
  });

  return result;
}

/**
 * Raf düzenine göre kitaplara kalıcı shelfId ve global order atar.
 */
export function flattenShelfLayout(
  shelves: ShelfItem[],
  layout: Map<string, BookArticle[]>
): BookArticle[] {
  const out: BookArticle[] = [];
  shelves.forEach((s) => {
    (layout.get(s.id) || []).forEach((art) => {
      out.push({ ...art, shelfId: s.id, order: out.length });
    });
  });
  return out;
}

/**
 * Hiç raf tanımlanmamışsa eski düzene (5'erli, en az 2 raf) uygun varsayılan raflar.
 */
export function buildDefaultShelves(publishedCount: number): ShelfItem[] {
  const count = Math.max(2, Math.ceil(publishedCount / LEGACY_SHELF_CAPACITY));
  return Array.from({ length: count }, (_, i) => ({
    id: `shelf_${i + 1}`,
    name: `Raf ${i + 1}`,
    order: i,
  }));
}
