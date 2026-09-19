"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface AntiqueDatePickerProps {
  value?: string; // e.g. "19 Eylül 2026" or "2026-09-19"
  onChange: (formattedDate: string, isoDateStr?: string) => void;
  placeholder?: string;
  className?: string;
  formatAsTurkish?: boolean;
  align?: "left" | "right";
  onOpenChange?: (isOpen: boolean) => void;
}

const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const WEEK_DAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function parseInitialDate(val?: string): Date {
  if (!val) return new Date();

  // Try ISO date (2026-09-19)
  if (val.includes("-")) {
    const parts = val.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  // Try Turkish date string: "19 Eylül 2026"
  const tokens = val.trim().split(/\s+/);
  if (tokens.length >= 3) {
    const day = parseInt(tokens[0], 10);
    const monthName = tokens[1];
    const year = parseInt(tokens[2], 10);
    const monthIdx = TURKISH_MONTHS.findIndex(
      (m) => m.toLowerCase() === monthName.toLowerCase()
    );
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }

  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

export const AntiqueDatePicker: React.FC<AntiqueDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Tarih Seçin",
  className = "",
  formatAsTurkish = true,
  align = "left",
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = (newVal: boolean) => {
    setIsOpen(newVal);
    onOpenChange?.(newVal);
  };

  const initialDate = parseInitialDate(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close on click outside
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

  // Sync view when opened
  useEffect(() => {
    if (isOpen) {
      const d = parseInitialDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [isOpen, value]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selectedObj = new Date(viewYear, viewMonth, day);
    const isoStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const trStr = selectedObj.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    onChange(formatAsTurkish ? trStr : isoStr, isoStr);
    toggleOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const isoStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const trStr = today.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    onChange(formatAsTurkish ? trStr : isoStr, isoStr);
    toggleOpen(false);
  };

  // Calendar math:
  // First day of month (0 = Sun, 1 = Mon ... in JS Date)
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust so Monday is 0
  const startOffset = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Highlight check
  const selectedDateObj = value ? parseInitialDate(value) : null;
  const isSelectedDate = (day: number) => {
    if (!selectedDateObj) return false;
    return (
      selectedDateObj.getFullYear() === viewYear &&
      selectedDateObj.getMonth() === viewMonth &&
      selectedDateObj.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const t = new Date();
    return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === day;
  };

  const displayLabel = React.useMemo(() => {
    if (!value) return null;
    const d = parseInitialDate(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  }, [value]);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Display trigger button */}
      <button
        type="button"
        onClick={() => toggleOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-white border border-[#c5ab8d] hover:border-amber-800 focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 shadow-xs text-xs font-serif text-[#3b200b] transition-all cursor-pointer text-left"
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-amber-800 shrink-0 opacity-80" />
          <span className="truncate font-medium">
            {displayLabel || <span className="text-amber-900/40 italic">{placeholder}</span>}
          </span>
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-2 z-50 w-72 rounded-2xl border-2 border-[#8c5828] shadow-[0_16px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
          style={{
            backgroundColor: "#221107",
            backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.65) 0%, rgba(35,18,8,0.4) 50%, rgba(0,0,0,0.75) 100%), url('/textures/oak_wood.jpg')`,
            backgroundSize: "300px auto",
          }}
        >
          {/* Header Month / Year Navigation */}
          <div className="p-3 border-b border-[#ffd9a3]/15 flex items-center justify-between bg-black/40">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-serif font-bold text-xs sm:text-sm text-[#faeedd] tracking-wide">
              {TURKISH_MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 px-3 pt-2 text-center">
            {WEEK_DAYS.map((wd) => (
              <span key={wd} className="text-[10px] font-serif font-bold text-amber-300/60 uppercase">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 p-3">
            {/* Blank leading days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`blank-${i}`} className="w-8 h-8" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const selected = isSelectedDate(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-serif flex items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? "bg-gradient-to-b from-amber-500 to-amber-700 text-amber-950 font-bold shadow-md border border-[#ffe3a3]"
                      : today
                      ? "bg-amber-950/60 text-amber-200 border border-amber-600/50 font-bold hover:bg-amber-800/50"
                      : "text-[#faedd9]/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="p-2.5 bg-black/50 border-t border-[#ffd9a3]/15 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-serif text-amber-300 hover:text-amber-100 underline cursor-pointer px-1"
            >
              Bugün Yap
            </button>

            <button
              type="button"
              onClick={() => toggleOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-serif text-[#faeedd] transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
