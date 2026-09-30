"use client";

import React, { useEffect, useState } from "react";
import { Feather, X } from "lucide-react";

interface AuthorNameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export const AuthorNameModal = ({ isOpen, currentName, onClose, onSave }: AuthorNameModalProps) => {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch {
      alert("Yazar adı kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm p-6 rounded-2xl border-2 border-[#a87d29]/50 shadow-[0_20px_60px_rgba(0,0,0,0.92)] space-y-4"
        style={{ backgroundColor: "rgba(28, 12, 4, 0.97)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
            <Feather className="w-4 h-4 text-amber-300" />
            Yazar Adı
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="font-serif text-xs text-[#e8cfb3]/80">
          Kitaplıkta, yazı sayfalarında ve imzalarda görünecek isim.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-[#120702] border border-[#a87d29]/40 text-amber-100 text-sm font-serif focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6b3512] via-[#8c4617] to-[#54280b] hover:brightness-110 text-amber-100 text-xs font-serif font-semibold border border-[#d4af37]/60 shadow-lg cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
};
