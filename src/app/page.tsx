"use client";

import React, { useEffect, useState } from "react";
import { BookArticle, CategoryItem } from "@/lib/types";
import { getArticles, getCategories } from "@/lib/posts-service";
import { BookshelfHeader } from "@/components/reader/bookshelf-header";
import { Bookshelf } from "@/components/reader/bookshelf";

export default function HomePage() {
  const [articles, setArticles] = useState<BookArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  const filteredArticles = articles.filter((art) => {
    if (art.isDraft) return false;
    if (selectedCategory === "all") return true;
    return art.category === selectedCategory;
  });

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
            <Bookshelf articles={filteredArticles} />
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
