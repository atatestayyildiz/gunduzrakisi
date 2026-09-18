"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MusicTrack } from "@/lib/types";
import { extractYouTubeId } from "@/components/ui/music-player-widget";
import { Search, ChevronDown, Check, Music, VolumeX, X, Plus } from "lucide-react";

interface MusicTrackSelectProps {
  tracks: MusicTrack[];
  selectedUrl: string;
  onSelect: (track: MusicTrack | null) => void;
  onOpenAddMusic?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function getTrackCover(t: { cover?: string; url: string }) {
  if (t.cover) return t.cover;
  const ytId = extractYouTubeId(t.url);
  return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "";
}

function normalize(str: string) {
  return str
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export function MusicTrackSelect({
  tracks,
  selectedUrl,
  onSelect,
  onOpenAddMusic,
  isOpen: propsIsOpen,
  onOpenChange,
}: MusicTrackSelectProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : internalIsOpen;
  const [openUpward, setOpenUpward] = useState(true);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setIsOpen = useCallback(
    (next: boolean) => {
      if (onOpenChange) {
        onOpenChange(next);
      } else {
        setInternalIsOpen(next);
      }
    },
    [onOpenChange]
  );

  const toggleOpen = () => {
    const nextState = !isOpen;
    if (nextState && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 280);
    }
    setIsOpen(nextState);
  };

  const selectedTrack = useMemo(
    () => tracks.find((t) => t.url === selectedUrl) || null,
    [tracks, selectedUrl]
  );

  // Close on outside click or escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      // Auto-focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredTracks = useMemo(() => {
    if (!search.trim()) return tracks;
    const q = normalize(search);
    return tracks.filter(
      (t) =>
        normalize(t.title).includes(q) ||
        (t.artist && normalize(t.artist).includes(q))
    );
  }, [tracks, search]);

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full px-3 py-2.5 rounded-xl border text-xs font-serif flex items-center justify-between gap-2.5 transition-all shadow-xs cursor-pointer ${
          isOpen
            ? "bg-[#fffdf9] border-amber-800 ring-2 ring-amber-800/30 text-[#3b200b]"
            : "bg-white/95 hover:bg-white border-[#c5ab8d] text-[#3b200b]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedTrack ? (
            <>
              {(() => {
                const coverImg = getTrackCover(selectedTrack);
                return coverImg ? (
                  <img
                    src={coverImg}
                    alt={selectedTrack.title}
                    className="w-6 h-6 rounded-md object-cover border border-[#c5ab8d]/60 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-amber-900/15 border border-amber-800/30 flex items-center justify-center text-amber-800 shrink-0">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                );
              })()}
              <div className="truncate text-left">
                <span className="font-semibold block truncate text-[12px] text-[#2c1707]">
                  {selectedTrack.title}
                </span>
                <span className="text-[10.5px] text-[#7a4f29] truncate block italic">
                  {selectedTrack.artist || "Mert Kip"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-md bg-[#2c1707]/10 flex items-center justify-center text-[#7a4f29] shrink-0">
                <VolumeX className="w-3.5 h-3.5 opacity-60" />
              </div>
              <span className="text-amber-950/70 italic text-[11.5px] truncate">
                Şarkı Seçilmedi (Sessiz Okuma)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedTrack && (
            <span
              role="button"
              tabIndex={0}
              title="Şarkıyı Kaldır"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="p-1 rounded-md hover:bg-rose-100 text-rose-700/80 hover:text-rose-900 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-amber-800/70 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-amber-950" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 rounded-2xl border-2 border-[#bfa282] bg-[#fbf6ee] shadow-[0_16px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.8)_inset] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col ${
            openUpward
              ? "bottom-[calc(100%+6px)] origin-bottom"
              : "top-[calc(100%+6px)] origin-top"
          }`}
          style={{
            backgroundImage: `linear-gradient(160deg, rgba(255,255,255,0.7) 0%, rgba(248,238,222,0.9) 100%)`,
          }}
        >
          {/* Dynamic Search Box */}
          <div className="p-2 border-b border-[#c5ab8d]/50 bg-white/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-amber-900/50 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Şarkı veya sanatçı ara..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white border border-[#c5ab8d] text-xs font-serif text-[#3b200b] placeholder:text-amber-900/40 focus:outline-hidden focus:ring-2 focus:ring-amber-800/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 p-0.5 text-amber-900/50 hover:text-amber-950 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Sınırlandırılmış Scroll Liste (max-h-56) */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 divide-y divide-[#c5ab8d]/20 custom-scrollbar">
            {/* Sessiz Okuma (Şarkısız) Seçeneği */}
            {!search && (
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-serif transition-colors cursor-pointer text-left ${
                  !selectedTrack
                    ? "bg-amber-800/15 text-amber-950 font-semibold"
                    : "hover:bg-amber-800/8 text-[#4a2b13]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-[#7a4f29]" />
                  <span>Şarkı Seçilmedi (Sessiz Okuma)</span>
                </div>
                {!selectedTrack && <Check className="w-3.5 h-3.5 text-amber-900" />}
              </button>
            )}

            {/* Arama Sonuçları / Şarkı Listesi */}
            {filteredTracks.map((t) => {
              const isSelected = selectedTrack?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelect(t);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 text-xs font-serif transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-amber-800/15 text-amber-950 font-semibold shadow-2xs"
                      : "hover:bg-amber-800/8 text-[#3b200b]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {(() => {
                      const coverImg = getTrackCover(t);
                      return coverImg ? (
                        <img
                          src={coverImg}
                          alt={t.title}
                          className="w-7 h-7 rounded-md object-cover border border-[#c5ab8d]/60 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-amber-900/10 border border-amber-800/20 flex items-center justify-center text-amber-900 shrink-0">
                          <Music className="w-3.5 h-3.5" />
                        </div>
                      );
                    })()}
                    <div className="truncate">
                      <div className="truncate font-medium text-[12px]">{t.title}</div>
                      <div className="text-[10.5px] text-[#7a4f29] truncate italic">
                        {t.artist || "Mert Kip"}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  )}
                </button>
              );
            })}

            {/* Boş Arama Durumu */}
            {filteredTracks.length === 0 && (
              <div className="py-6 px-3 text-center">
                <Music className="w-6 h-6 mx-auto mb-1.5 text-amber-900/40" />
                <p className="text-xs font-serif text-amber-950/70 italic">
                  Eşleşen şarkı bulunamadı.
                </p>
                {onOpenAddMusic && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAddMusic();
                    }}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-800/10 hover:bg-amber-800/20 text-amber-900 text-xs font-serif font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Yeni Şarkı Ekle</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Popover Alt Bilgi Çubuğu */}
          <div className="px-3 py-1.5 bg-[#f0e2cf] border-t border-[#c5ab8d]/50 flex items-center justify-between text-[10.5px] font-serif text-amber-900/70">
            <span>Toplam {tracks.length} şarkı kayıtlı</span>
            {onOpenAddMusic && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddMusic();
                }}
                className="text-amber-900 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Şarkı Yönetimi</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
