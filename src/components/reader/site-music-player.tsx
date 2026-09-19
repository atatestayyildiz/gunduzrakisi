"use client";

import React, { useEffect, useState } from "react";
import { MusicPlayerWidget, extractYouTubeId, type Track } from "@/components/ui/music-player-widget";
import { getArticles, getMusicTracks } from "@/lib/posts-service";
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
    async function loadTracks() {
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

      // 2. Müzik Sandığına kaydedilmiş genel şarkılar (eğer listede henüz yoksa ekle)
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
            // Özel şarkı atanmış: Player açılır, şarkı başlar ve player açık kalır
            setTimeout(() => {
              if (!isDrawerOpenRef.current) {
                setIsOpen(true);
              }
            }, 600);
          } else {
            // Özel şarkı atanmamış: Player bir kere açılır, sonra sessizce kapanır
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
        } else {
          // Normal ana sayfa / yazar odası davranışı
          setTimeout(() => {
            if (!isDrawerOpenRef.current) {
              setIsOpen(true);
            }
          }, 900);
        }
      }
    }
    loadTracks();
  }, [currentArticleId, refreshTrigger]);

  // Müzik linki yoksa ve şarkı ekleme yetkisi yoksa hiçbir şey render etme
  if (!mounted || (tracks.length === 0 && !showAddMusic)) return null;

  return (
    <div
      className="fixed top-0 right-3 sm:right-6 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none"
      style={{
        width: 316,
        transform: isOpen ? "translateY(0)" : "translateY(calc(-100% + 36px))",
      }}
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

        {/* Kulakçık — tam kart genişliğinde açılır/kapanır tab (36px yükseklik) */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full h-9 flex items-center justify-center gap-2 border-t border-[#1c0c03]/60 text-amber-300/85 hover:text-amber-200 text-xs font-serif tracking-wide transition-colors cursor-pointer px-4 active:scale-[0.99]"
          style={{
            backgroundColor: "rgba(0,0,0,0.42)",
          }}
          title={isOpen ? "Müzik Çaları Kapat" : "Müzik Çaları Aç"}
        >
          {isOpen ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-[11px] tracking-wide">Kapat</span>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="font-semibold text-xs tracking-wider text-amber-200">Müzik Çalar</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
