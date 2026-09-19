export interface BookArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  date: string;
  readTimeMinutes: number;
  sips: number; // "X yudumda okunur"
  coverColor: string;
  textColor?: string;
  variant: "simple" | "stripe";
  textured: boolean;
  coverImage?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;   // Direkt .mp3 / ses dosyası URL'si
  musicCover?: string; // Albüm kapağı görseli URL'si (opsiyonel)
  order: number;
  heightRatio?: number; // 0.92 to 1.08 for natural variety on shelf
  isDraft?: boolean;
  fontFamily?: "serif" | "typewriter" | "sans";
  fontSize?: "small" | "medium" | "large";
  createdAt?: string;
  likes?: number;
  views?: number;
  scheduledAt?: string; // ISO date string e.g. "2026-09-25T14:30:00.000Z"
}

export interface CategoryItem {
  id: string;
  name: string;
  count?: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;      // YouTube URL
  cover?: string;   // Album cover image URL
  createdAt?: string;
}

