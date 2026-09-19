"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface AntiqueTimePickerProps {
  value?: string; // e.g. "14:30"
  onChange: (timeStr: string) => void;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  onOpenChange?: (isOpen: boolean) => void;
}

const PRESET_TIMES = [
  { label: "Sabah 09:00", value: "09:00" },
  { label: "Öğle 12:00", value: "12:00" },
  { label: "İkindi 15:30", value: "15:30" },
  { label: "Akşam 19:00", value: "19:00" },
  { label: "Dem Vakti 21:00", value: "21:00" },
];

export const AntiqueTimePicker: React.FC<AntiqueTimePickerProps> = ({
  value = "12:00",
  onChange,
  placeholder = "Saat Seçin",
  className = "",
  align = "left",
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = (newVal: boolean) => {
    setIsOpen(newVal);
    onOpenChange?.(newVal);
  };

  const [selectedHour, setSelectedHour] = useState(() => {
    return value && value.includes(":") ? value.split(":")[0].padStart(2, "0") : "12";
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    return value && value.includes(":") ? value.split(":")[1].padStart(2, "0") : "00";
  });

  // Sync state if value changes externally
  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      setSelectedHour(h.padStart(2, "0"));
      setSelectedMinute(m.padStart(2, "0"));
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        toggleOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    onChange(`${h}:${selectedMinute}`);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    onChange(`${selectedHour}:${m}`);
  };

  const handlePresetSelect = (timeStr: string) => {
    const [h, m] = timeStr.split(":");
    setSelectedHour(h);
    setSelectedMinute(m);
    onChange(timeStr);
    toggleOpen(false);
  };

  const handleNowSelect = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(Math.round(now.getMinutes() / 5) * 5 % 60).padStart(2, "0");
    setSelectedHour(h);
    setSelectedMinute(m);
    onChange(`${h}:${m}`);
    toggleOpen(false);
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutesList = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Display trigger button */}
      <button
        type="button"
        onClick={() => toggleOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#c5ab8d] hover:border-amber-800 focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 shadow-xs text-xs font-serif text-[#3b200b] transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <Clock className="w-4 h-4 text-amber-800 shrink-0 opacity-80" />
          <span className="truncate font-semibold tracking-wider">
            {value ? `${selectedHour}:${selectedMinute}` : <span className="text-amber-900/40 italic">{placeholder}</span>}
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold text-amber-900/60 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-900/15">
          Saat
        </span>
      </button>

      {/* Popover Clock Picker */}
      {isOpen && (
        <div
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-2 z-50 w-64 rounded-2xl border-2 border-[#8c5828] shadow-[0_16px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
          style={{
            backgroundColor: "#221107",
            backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.65) 0%, rgba(35,18,8,0.4) 50%, rgba(0,0,0,0.75) 100%), url('/textures/oak_wood.jpg')`,
            backgroundSize: "300px auto",
          }}
        >
          {/* Header */}
          <div className="p-3 border-b border-[#ffd9a3]/15 flex items-center justify-between bg-black/40">
            <span className="font-serif font-bold text-xs sm:text-sm text-[#faeedd] tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Yayın Saati</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-black/50 px-2 py-0.5 rounded border border-amber-600/30">
              {selectedHour}:{selectedMinute}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="p-2 border-b border-[#ffd9a3]/10 flex flex-wrap gap-1 bg-black/20">
            {PRESET_TIMES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handlePresetSelect(p.value)}
                className="text-[10px] font-serif px-2 py-0.5 rounded-md bg-amber-900/30 hover:bg-amber-800/60 text-amber-200/90 hover:text-white border border-amber-600/20 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Hour & Minute Scrollable Columns */}
          <div className="grid grid-cols-2 p-3 gap-3">
            {/* Hours Column */}
            <div>
              <span className="text-[10px] font-serif text-amber-300/70 font-semibold block text-center mb-1">
                Saat
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {hoursList.map((h) => {
                  const isSel = h === selectedHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourSelect(h)}
                      className={`w-full py-1 text-center text-xs font-mono rounded-md transition-all cursor-pointer ${
                        isSel
                          ? "bg-amber-600 text-amber-950 font-bold border border-amber-400 shadow-xs"
                          : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <span className="text-[10px] font-serif text-amber-300/70 font-semibold block text-center mb-1">
                Dakika
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {minutesList.map((m) => {
                  const isSel = m === selectedMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteSelect(m)}
                      className={`w-full py-1 text-center text-xs font-mono rounded-md transition-all cursor-pointer ${
                        isSel
                          ? "bg-amber-600 text-amber-950 font-bold border border-amber-400 shadow-xs"
                          : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-black/50 border-t border-[#ffd9a3]/15 flex items-center justify-between">
            <button
              type="button"
              onClick={handleNowSelect}
              className="text-[11px] font-serif text-amber-300 hover:text-amber-100 underline cursor-pointer px-1"
            >
              Şu Anki Saat
            </button>
            <button
              type="button"
              onClick={() => toggleOpen(false)}
              className="px-3 py-1 rounded-lg bg-amber-800/80 hover:bg-amber-700 text-xs font-serif text-amber-100 transition-colors cursor-pointer font-semibold"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
