"use client";

import React, { useEffect, useState } from "react";
import { BookArticle, CategoryItem } from "@/lib/types";
import { getArticles, getCategories } from "@/lib/posts-service";
import { BookshelfHeader } from "@/components/reader/bookshelf-header";
import { Bookshelf } from "@/components/reader/bookshelf";
import { Sparkles } from "lucide-react";

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
    if (selectedCategory === "all") return true;
    return art.category === selectedCategory;
  });

  return (
    <div className="min-h-screen plaster-wall flex flex-col justify-between selection:bg-amber-800/20">
      {/* Top Section with Bookshelf Cornice Header */}
      <div>
        <BookshelfHeader
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalBooks={filteredArticles.length}
        />

        {/* The Massive Oak Bookshelf with 5-book rows */}
        <div className="relative -mt-0.5">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#7d5f47] font-serif">
          <span>Gündüz Rakısı © {new Date().getFullYear()} — Mert Kip</span>
          <span className="hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1 text-[#5b3e27]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Bir <a href="https://moonworks.com.tr" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-900">moonworks.com.tr</a> hediyesidir.
          </span>
        </div>
      </footer>
    </div>
  );
}
