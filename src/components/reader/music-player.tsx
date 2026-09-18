"use client";

import React, { useState } from "react";
import { Music, Disc3, ExternalLink, Volume2 } from "lucide-react";

interface MusicPlayerProps {
  title?: string;
  artist?: string;
  url?: string;
}

export const MusicPlayer = ({ title, artist, url }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!title) return null;

  return (
    <div className="my-8 p-4 rounded-xl bg-[#ede4d5]/70 border border-[#d8c7b3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-[#3c200c] text-amber-200 flex items-center justify-center shadow-md ${
            isPlaying ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "4s" }}
        >
          <Disc3 className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-900 font-semibold">
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Bu Yazının Eşlikçisi</span>
          </div>
          <div className="font-serif font-bold text-neutral-900 text-sm sm:text-base">
            {title} {artist ? <span className="font-normal text-neutral-600">— {artist}</span> : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3c200c] hover:bg-[#522c11] text-amber-100 text-xs font-medium transition-colors shadow-sm"
          >
            <Music className="w-3.5 h-3.5 text-amber-300" />
            <span>Müzikle Dinle</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        ) : (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3c200c] hover:bg-[#522c11] text-amber-100 text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Music className="w-3.5 h-3.5 text-amber-300" />
            <span>{isPlaying ? "Durdur" : "Havaya Gir"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
