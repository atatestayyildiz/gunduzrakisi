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
  musicUrl?: string;
  order: number;
  heightRatio?: number; // 0.92 to 1.08 for natural variety on shelf
  isDraft?: boolean;
  createdAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  count?: number;
}
