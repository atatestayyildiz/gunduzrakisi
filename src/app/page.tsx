"use client";

import React, { useEffect, useState, useMemo } from "react";
import { BookArticle, CategoryItem } from "@/lib/types";
import { getArticles, getCategories } from "@/lib/posts-service";
import { BookshelfHeader } from "@/components/reader/bookshelf-header";
import { Bookshelf } from "@/components/reader/bookshelf";

export default function HomePage() {
  const [articles, setArticles] = useState<BookArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchInContent, setSearchInContent] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      const [allArticles, allCategories] = await Promise.all([
        getArticles(),
        getCategories(),
      ]);
      setArticles(allArticles);
      setCategories(allCategories);
      setLoading(false);
    }
    initData();
  }, []);

  // 1. Ziyaretçilere açık olan (taslak olmayan ve ileri tarihe planlanmamış) yazılar
  const publishedArticles = useMemo(() => {
    const now = new Date();
    return articles.filter((art) => {
      if (art.isDraft) return false;
      if (art.scheduledAt) {
        const scheduledDate = new Date(art.scheduledAt);
        if (!isNaN(scheduledDate.getTime()) && scheduledDate > now) {
          return false;
        }
      }
      return true;
    });
  }, [articles]);

  // 2. En Beğenilen ilk 5 kitap (En az 1 like almış ve beğeni sayısına göre çoktan aza sıralı)
  const topLikedArticles = useMemo(() => {
    return [...publishedArticles]
      .filter((a) => (a.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
  }, [publishedArticles]);

  const topLikedIds = useMemo(() => {
    return new Set(topLikedArticles.map((a) => a.id));
  }, [topLikedArticles]);

  // 3. Kategori ve Dinamik Arama Filtrelemesi (Başlık odaklı veya Switch Açıkken Tüm İçerik)
  const filteredArticles = useMemo(() => {
    let list = publishedArticles;

    // Kategori Filtresi
    if (selectedCategory === "top-liked") {
      list = topLikedArticles;
    } else if (selectedCategory !== "all") {
      list = list.filter((art) => art.category === selectedCategory);
    }

    // Dinamik Arama
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleLowerCase("tr-TR");
      list = list.filter((art) => {
        const title = (art.title || "").toLocaleLowerCase("tr-TR");
        if (!searchInContent) {
          // Varsayılan: Sadece Kitap İsimleri / Yazı Başlıkları
          return title.includes(q);
        }
        // Şalter Açık: Yazı İçeriği + Özet + Başlık
        const content = (art.content || "").toLocaleLowerCase("tr-TR");
        const excerpt = (art.excerpt || "").toLocaleLowerCase("tr-TR");
        return title.includes(q) || content.includes(q) || excerpt.includes(q);
      });
    }

    return list;
  }, [publishedArticles, topLikedArticles, selectedCategory, searchQuery, searchInContent]);

  return (
    <div className="min-h-screen plaster-wall flex flex-col justify-between selection:bg-amber-800/20">
      {/* Top Section with Bookshelf Cornice Header & Bookshelf */}
      <div>
        <div className="relative z-40">
          <BookshelfHeader
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalBooks={filteredArticles.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchInContent={searchInContent}
            onSearchInContentChange={setSearchInContent}
          />
        </div>

        {/* The Massive Oak Bookshelf with 5-book rows */}
        <div className="relative z-10 -mt-0.5">
          {loading ? (
            <div className="w-full max-w-7xl mx-auto py-24 text-center">
              <div className="inline-block font-serif text-amber-900 animate-pulse text-lg">
                Meşe kitaplık hazırlanıyor...
              </div>
            </div>
          ) : (
            <Bookshelf
              articles={filteredArticles}
              topLikedIds={topLikedIds}
              searchActive={Boolean(searchQuery.trim())}
            />
          )}
        </div>
      </div>

      {/* Subtle Footer Note */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center border-t border-[#d8c8b4]/60">
        <div className="flex items-center justify-center text-xs text-[#7d5f47] font-serif">
          <span>Gündüz Rakısı © {new Date().getFullYear()} — Mert Kip</span>
        </div>
      </footer>
    </div>
  );
}
