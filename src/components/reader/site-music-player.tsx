"use client";

import React, { useEffect, useState } from "react";
import { MusicPlayerWidget, extractYouTubeId, type Track } from "@/components/ui/music-player-widget";
import { getArticles, getMusicTracks, getCachedArticlesSync } from "@/lib/posts-service";
import { Music, ChevronDown, ChevronUp, Plus } from "lucide-react";

interface SiteMusicPlayerProps {
  currentArticleId?: string;
  showAddMusic?: boolean;
  onOpenAddMusic?: () => void;
  refreshTrigger?: number;
  isDrawerOpen?: boolean;
}

export function SiteMusicPlayer({
  currentArticleId,
  showAddMusic = false,
  onOpenAddMusic,
  refreshTrigger = 0,
  isDrawerOpen = false,
}: SiteMusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const isDrawerOpenRef = React.useRef(isDrawerOpen);

  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
    if (isDrawerOpen) {
      setIsOpen(false);
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    setMounted(true);

    // Hızlı İlk Önbellek Yüklemesi: Sayfa açılır açılmaz müziğin hazır olması için
    const cachedArticles = getCachedArticlesSync();
    if (cachedArticles.length > 0) {
      const cachedWithMusic = cachedArticles.filter(
        (a) => !a.isDraft && a.musicUrl && extractYouTubeId(a.musicUrl)
      );
      const cachedCurrent = cachedWithMusic.filter((a) => a.id === currentArticleId);
      const cachedRest = cachedWithMusic.filter((a) => a.id !== currentArticleId);
      const sorted = [...cachedCurrent, ...cachedRest];
      if (sorted.length > 0) {
        const quickList: Track[] = sorted.map((a) => {
          const ytId = a.musicUrl ? extractYouTubeId(a.musicUrl) : null;
          const autoCover = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "";
          return {
            title: a.musicTitle || a.title,
            artist: a.musicArtist || "Mert Kip",
            cover: a.musicCover || autoCover,
            src: a.musicUrl!,
          };
        });
        setTracks(quickList);
        const hasSpecific = Boolean(
          currentArticleId &&
          cachedArticles.some(
            (a) => a.id === currentArticleId && !a.isDraft && a.musicUrl && extractYouTubeId(a.musicUrl)
          )
        );
        if (hasSpecific) {
          setAutoPlay(true);
          setTimeout(() => {
            if (!isDrawerOpenRef.current) setIsOpen(true);
          }, 500);
        }
      }
    }

    async function loadTracks() {
      try {
        const [articles, savedTracks] = await Promise.all([
          getArticles(),
          getMusicTracks(),
        ]);

        const list: Track[] = [];

        // 1. Yazılara atanmış şarkılar
        const withMusic = articles.filter(
          (a) => !a.isDraft && a.musicUrl && extractYouTubeId(a.musicUrl)
        );

        const current = withMusic.filter((a) => a.id === currentArticleId);
        const rest = withMusic.filter((a) => a.id !== currentArticleId);
        const sortedArticles = [...current, ...rest];

        sortedArticles.forEach((a) => {
          const ytId = a.musicUrl ? extractYouTubeId(a.musicUrl) : null;
          const autoCover = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "";
          list.push({
            title: a.musicTitle || a.title,
            artist: a.musicArtist || "Mert Kip",
            cover: a.musicCover || autoCover,
            src: a.musicUrl!,
          });
        });

        // 2. Müzik Sandığına kaydedilmiş genel şarkılar
        savedTracks.forEach((st) => {
          if (!list.some((item) => item.src === st.url)) {
            const ytId = extractYouTubeId(st.url);
            const autoCover = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "";
            list.push({
              title: st.title,
              artist: st.artist,
              cover: st.cover || autoCover,
              src: st.url,
            });
          }
        });

        setTracks(list);

        const hasSpecificMusic = Boolean(
          currentArticleId && articles.some(
            (a) => a.id === currentArticleId && !a.isDraft && a.musicUrl && extractYouTubeId(a.musicUrl)
          )
        );

        setAutoPlay(hasSpecificMusic);

        if (list.length > 0) {
          if (currentArticleId) {
            if (hasSpecificMusic) {
              setTimeout(() => {
                if (!isDrawerOpenRef.current) {
                  setIsOpen(true);
                }
              }, 600);
            } else {
              setTimeout(() => {
                if (!isDrawerOpenRef.current) {
                  setIsOpen(true);
                  setTimeout(() => {
                    if (!isDrawerOpenRef.current) {
                      setIsOpen(false);
                    }
                  }, 2200);
                }
              }, 600);
            }
          }
        }
      } catch (err) {
        console.warn("loadTracks error:", err);
      }
    }
    loadTracks();
  }, [currentArticleId, refreshTrigger]);

  // Müzik linki yoksa ve şarkı ekleme yetkisi yoksa hiçbir şey render etme
  if (!mounted || (tracks.length === 0 && !showAddMusic)) return null;

  return (
    <div className="fixed top-0 right-2 sm:right-6 z-50 select-none flex flex-col items-end pointer-events-none">
      {/* 1. KAPALI DURUM: Ultra-kompakt, ekranda yer kaplamayan edebi kulakçık */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-b-xl border-b-2 border-l border-r border-[#d4af37]/45 shadow-[0_4px_16px_rgba(0,0,0,0.65)] cursor-pointer text-amber-200 transition-all hover:brightness-110 active:scale-95"
          style={{
            backgroundColor: "#2a1406",
            backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.6) 0%, rgba(35,18,8,0.3) 50%, rgba(0,0,0,0.7) 100%), url('/textures/oak_wood.jpg')`,
            backgroundSize: "280px auto",
          }}
          title="Müzik Çaları Aç"
        >
          <Music className="w-3 h-3 text-amber-300 animate-pulse" />
          <span className="font-serif font-bold text-[11px] sm:text-xs tracking-wider text-amber-100">
            Müzik
          </span>
          <ChevronDown className="w-3 h-3 text-amber-400" />
        </button>
      )}

      {/* 2. AÇIK DURUM: Mobilde 280px, Masaüstünde 316px kompakt oynatıcı kartı */}
      <div
        className={`w-[280px] sm:w-[316px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "-translate-y-full opacity-0 scale-95 pointer-events-none absolute top-0 right-0"
        }`}
      >
        <div
          className="relative shadow-[0_12px_45px_rgba(0,0,0,0.85)] border-b-2 border-l-2 border-r-2 border-[#1c0c03] rounded-b-2xl overflow-hidden"
          style={{
            backgroundColor: "#2a1406",
            backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(30,15,7,0.3) 50%, rgba(0,0,0,0.65) 100%), url('/textures/oak_wood.jpg')`,
            backgroundSize: "400px auto",
          }}
        >
          {/* Üst ince pirinç şerit */}
          <div
            className="h-0.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #d4af37 30%, #f0d060 50%, #d4af37 70%, transparent)",
            }}
          />

          {/* Oynatıcı kartı */}
          {tracks.length > 0 && <MusicPlayerWidget tracks={tracks} autoPlay={autoPlay} />}

          {/* Yazar Odasına Özel "Şarkı Ekle / Yönet" Barı */}
          {showAddMusic && onOpenAddMusic && (
            <div className="px-3 py-2 bg-[#1a0b03]/90 border-t border-[#ffd9a3]/15 flex items-center justify-between">
              <span className="text-[11px] font-serif text-amber-200/70 italic">
                {tracks.length} Şarkı Kayıtlı
              </span>
              <button
                type="button"
                onClick={onOpenAddMusic}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#4d2810] to-[#3a1d0a] hover:from-[#613314] hover:to-[#4a250d] text-amber-200 text-xs font-serif font-semibold border border-amber-600/40 hover:border-amber-400 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Şarkı Ekle</span>
              </button>
            </div>
          )}

          {/* Kapatma Kulakçığı */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full h-8 flex items-center justify-center gap-1.5 border-t border-[#1c0c03]/60 text-amber-300/85 hover:text-amber-200 text-xs font-serif tracking-wide transition-colors cursor-pointer px-4 active:scale-[0.99]"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
            }}
            title="Müzik Çaları Kapat"
          >
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-[11px] tracking-wide">Kapat</span>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
