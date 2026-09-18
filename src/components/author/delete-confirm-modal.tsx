"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  description,
  confirmText = "Evet, Sil",
  cancelText = "Vazgeç",
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-[#faf6ee] border-2 border-[#bfa282] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_3px_rgba(255,255,255,0.8)] p-6 text-center text-[#2d1b0f] overflow-hidden"
      >
        {/* Subtle decorative parchment lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#8b3a1a]/60 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#85654c] hover:text-[#381f0d] hover:bg-[#ebdcc8] transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wax Seal Warning Icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-[#7a2810] to-[#451406] text-[#fbebd8] flex items-center justify-center shadow-lg border-2 border-[#d4af37]/50 mb-4">
          <Trash2 className="w-6 h-6 text-amber-200" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-[#321c0b]">
          {title}
        </h3>

        {/* Item Name Highlight */}
        <div className="my-2.5 px-3 py-1.5 rounded-xl bg-[#eee2d0] border border-[#d8c5ad] font-serif text-sm font-semibold text-[#482810] break-words">
          &ldquo;{itemName}&rdquo;
        </div>

        {/* Description / Subtext */}
        <p className="font-serif italic text-xs text-[#78593e] leading-relaxed mb-6">
          {description ||
            "Bu işlemi onayladığınızda kayıt kütüphaneden ve veritabanından kalıcı olarak silinecektir."}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#cbb399] bg-[#ede0ce] hover:bg-[#e0d0bc] text-[#4a2e17] font-serif text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8b2614] via-[#a32d17] to-[#711e0e] hover:brightness-110 text-rose-50 font-serif text-xs font-bold shadow-md border border-[#c44730]/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? "Siliniyor..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
