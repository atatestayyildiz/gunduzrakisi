"use client";

import React, { useEffect, useState } from "react";
import { MusicPlayerWidget, extractYouTubeId, type Track } from "@/components/ui/music-player-widget";
import { getArticles } from "@/lib/posts-service";
import { Music, ChevronDown, ChevronUp } from "lucide-react";

interface SiteMusicPlayerProps {
  currentArticleId?: string;
}

export function SiteMusicPlayer({ currentArticleId }: SiteMusicPlayerProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadTracks() {
      const articles = await getArticles();

      // Yalnızca yayınlanmış ve geçerli YouTube linki olan yazılar
      const withMusic = articles.filter(
        (a) => !a.isDraft && a.musicUrl && extractYouTubeId(a.musicUrl)
      );

      // Aktif yazının şarkısını başa al
      const current = withMusic.filter((a) => a.id === currentArticleId);
      const rest = withMusic.filter((a) => a.id !== currentArticleId);
      const sorted = [...current, ...rest];

      const list: Track[] = sorted.map((a) => ({
        title: a.musicTitle || a.title,
        artist: a.musicArtist || "Mert Kip",
        cover: a.musicCover || "",
        src: a.musicUrl!,
      }));

      setTracks(list);

      if (list.length > 0) {
        // İlk girişte 900ms sonra aç
        setTimeout(() => setIsOpen(true), 900);
      }
    }
    loadTracks();
  }, [currentArticleId]);

  // Müzik linki yoksa hiçbir şey render etme
  if (!mounted || tracks.length === 0) return null;

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
        <MusicPlayerWidget tracks={tracks} />

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
