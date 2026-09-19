"use client";

import React from "react";
import { Clock, Calendar, Check, X } from "lucide-react";

interface ScheduleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  scheduleDate: string;
  scheduleTime: string;
}

export const ScheduleConfirmModal: React.FC<ScheduleConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  scheduleDate,
  scheduleTime,
}) => {
  if (!isOpen) return null;

  // Format date nicely in Turkish
  let formattedDateStr = scheduleDate;
  try {
    const [y, m, d] = scheduleDate.split("-").map(Number);
    const dObj = new Date(y, m - 1, d);
    if (!isNaN(dObj.getTime())) {
      formattedDateStr = dObj.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch {}

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border-2 border-amber-600/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden text-[#faeedd] animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "#200e05",
          backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.6) 0%, rgba(30,15,7,0.3) 50%, rgba(0,0,0,0.7) 100%), url('/textures/oak_wood.jpg')`,
          backgroundSize: "350px auto",
        }}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-amber-900/40 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amber-100">
                Yazıyı Planlamak Üzeresiniz
              </h3>
              <p className="text-[11px] font-serif text-amber-200/60">
                Gündüz Rakısı • Otomatik Yayın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-amber-200/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="font-serif text-sm leading-relaxed text-[#f4dfca]">
            <strong className="text-amber-200 font-semibold">
              &ldquo;{title || "Başlıksız Deneme"}&rdquo;
            </strong>{" "}
            başlıklı yazınız, belirlenen tarih ve saatte otomatik olarak kitaplık raflarında yerini alacaktır.
          </p>

          {/* Planned Date Box */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-amber-600/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-serif text-amber-300 font-semibold">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Yayın Tarihi: {formattedDateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-serif text-amber-200/80 pl-6">
              <Clock className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Yayın Saati: {scheduleTime}</span>
            </div>
          </div>

          <p className="text-xs font-serif italic text-amber-200/60">
            * O tarih ve saate kadar yazı yalnızca sizin yazar odanızda planlanmış olarak saklanacak, genel ziyaretçilere kapalı kalacaktır.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-black/50 border-t border-amber-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-serif text-amber-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-serif font-bold text-xs tracking-wide shadow-lg border border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 text-amber-300" />
            <span>Onayla ve Planla</span>
          </button>
        </div>
      </div>
    </div>
  );
};
