"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookArticle } from "@/lib/types";
import { getArticles, getCachedArticlesSync, toggleArticleLike, incrementArticleViews } from "@/lib/posts-service";
import { matchesArticleSlug } from "@/lib/slug-utils";
import { ReadingProgress } from "@/components/reader/reading-progress";
import { SiteMusicPlayer } from "@/components/reader/site-music-player";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Feather,
  Heart,
  Eye
} from "lucide-react";
import { RakiGlass } from "@/components/icons/raki-glass";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<BookArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAuthorAuthenticated, setIsAuthorAuthenticated] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("gunduz_rakisi_author_auth");
      setIsAuthorAuthenticated(auth === "granted");
    }
  }, []);

  useEffect(() => {
    // 1. Instant Cache Hydration: If article exists in cache, display immediately!
    const cachedList = getCachedArticlesSync();
    const cachedFound = cachedList.find((a) => matchesArticleSlug(a, resolvedParams.slug));
    if (cachedFound) {
      setArticle(cachedFound);
      setLikesCount(cachedFound.likes || 0);
      setViewsCount(cachedFound.views || 0);
      setLoading(false);
      if (typeof window !== "undefined") {
        const liked = localStorage.getItem(`gunduz_rakisi_liked_${cachedFound.id}`);
        setHasLiked(liked === "true");
      }
    }

    // 2. Background Revalidation
    async function load() {
      try {
        const articles = await getArticles();
        const found = articles.find((a) => matchesArticleSlug(a, resolvedParams.slug));
        if (found) {
          setArticle(found);
          setLikesCount(found.likes || 0);
          setViewsCount(found.views || 0);
          if (typeof window !== "undefined") {
            const liked = localStorage.getItem(`gunduz_rakisi_liked_${found.id}`);
            setHasLiked(liked === "true");
          }
        }
      } catch (err) {
        console.warn("Article load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.slug]);

  // 5 Saniye Kuralı: Okuyucu sayfada en az 5 saniye vakit geçirirse tekil okuma sayacını artır
  useEffect(() => {
    if (!article) return;

    const timer = setTimeout(async () => {
      if (typeof window !== "undefined") {
        const viewKey = `gunduz_rakisi_viewed_${article.id}`;
        const alreadyCounted = localStorage.getItem(viewKey);
        if (!alreadyCounted) {
          localStorage.setItem(viewKey, "true");
          const updatedViews = await incrementArticleViews(article.id);
          if (updatedViews > 0) {
            setViewsCount(updatedViews);
          }
        }
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [article?.id]);

  const handleToggleLike = async () => {
    if (!article) return;
    const nextState = !hasLiked;
    setHasLiked(nextState);

    if (typeof window !== "undefined") {
      if (nextState) {
        localStorage.setItem(`gunduz_rakisi_liked_${article.id}`, "true");
      } else {
        localStorage.removeItem(`gunduz_rakisi_liked_${article.id}`);
      }
    }

    const newCount = await toggleArticleLike(article.id, nextState);
    setLikesCount(newCount);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen plaster-wall flex items-center justify-center">
        <div className="font-serif italic text-amber-900 text-lg animate-pulse">
          Kitap raftan indiriliyor...
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen plaster-wall flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 rounded-2xl bg-[#eee7db] border border-[#d2c0aa] max-w-md shadow-lg">
          <h2 className="font-serif text-2xl font-bold text-amber-950 mb-2">Deneme Bulunamadı</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Aradığınız yazı kitaplığın bu rafında yer almıyor olabilir.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3f220d] text-amber-100 font-medium hover:bg-[#573013] transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kitaplığa Geri Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen plaster-wall relative text-[#2b2118] selection:bg-amber-800/20">
      <ReadingProgress />

      {/* Floating Music Player — sağ üstten kayarak açılır */}
      <SiteMusicPlayer currentArticleId={article.id} />

      {/* Top Floating Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#f4eee5]/85 backdrop-blur-md border-b border-[#e2d5c3] px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-[#4a2e17] hover:text-[#1e0f06] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif">Kitaplığa Dön</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthorAuthenticated && (
              <Link
                href="/yazar"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3e220e] hover:bg-[#522e14] text-amber-200 hover:text-white text-xs font-medium transition-colors cursor-pointer shadow-xs border border-amber-500/30"
                title="Yazar Odasına Dön"
              >
                <Feather className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-serif">Yazar Odası</span>
              </Link>
            )}

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e7ded1] hover:bg-[#ded1c0] text-xs font-medium text-[#4a2e17] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Reading Page Content */}
      <article className="max-w-2xl sm:max-w-3xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-24">
        {/* Article Header */}
        <header className="mb-10 text-center sm:text-left border-b border-[#d8c8b4] pb-8">
          {/* Sips Badge */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-4">
            {/* Iconic "X Yudumda Okunur" indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fcf9f2] text-amber-900 border border-amber-800/30 shadow-xs">
              <RakiGlass className="w-3.5 h-3.5 text-amber-600" />
              <span>Bu yazı <strong className="font-bold text-amber-950">{article.sips} yudumda</strong> okunur</span>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#2d1808] leading-[1.18] sm:leading-[1.15] mb-5">
            {article.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-[#7d5f47] font-serif">
            <span className="font-semibold text-[#3d2008]">Mert Kip</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              {article.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              ~{article.readTimeMinutes} dakika
            </span>

            {/* Like Butonu ve Sayacı */}
            <span>•</span>
            <button
              type="button"
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer select-none active:scale-90 ${
                hasLiked
                  ? "bg-rose-100 text-rose-700 font-bold border border-rose-300 shadow-xs"
                  : "bg-[#f4ece1] hover:bg-[#ebdccc] text-[#6d4c32] border border-[#d8c8b4]"
              }`}
              title={hasLiked ? "Beğeniyi Geri Al" : "Bu Yazıyı Beğen"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  hasLiked ? "fill-rose-600 text-rose-600 scale-110" : "text-rose-900/60 hover:text-rose-600"
                }`}
              />
              <span className="font-semibold">{likesCount}</span>
            </button>

            {/* Tekil Okuma Sayısı */}
            <span>•</span>
            <span className="flex items-center gap-1.5 text-xs text-[#7d5f47]">
              <Eye className="w-3.5 h-3.5 opacity-75" />
              <span>Bu yazı <strong className="text-amber-950 font-bold">{viewsCount}</strong> defa okundu</span>
            </span>
          </div>
        </header>

        {/* Article Body - Typography-First Experience */}
        <MarkdownRenderer
          content={article.content}
          fontFamily={article.fontFamily}
          fontSize={article.fontSize}
        />


        {/* Article Sign-off & Divider */}
        <div className="mt-14 pt-8 border-t border-[#d8c8b4] flex flex-col items-center sm:items-start gap-3">
          <div className="w-16 h-0.5 bg-amber-900/30" />
          <p className="font-serif italic text-base text-[#6b4c33]">
            — Mert Kip, <span className="text-amber-950 font-medium">Gündüz Rakısı</span>
          </p>
        </div>

        {/* Footer Note */}
        <footer className="mt-16 pt-8 border-t border-[#d8c8b4]/60 text-center">
          <p className="text-xs text-[#7d5f47] font-serif leading-relaxed">
            Bu dijital kitaplık{" "}
            <a
              href="https://moonworks.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-900 hover:text-amber-950 underline underline-offset-2 font-medium"
            >
              moonworks.com.tr
            </a>{" "}
            tarafından Mert Kip&apos;in edebi yazıları için sevgiyle tasarlanıp kodlanmıştır.
          </p>
        </footer>
      </article>
    </div>
  );
}
