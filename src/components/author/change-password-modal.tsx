"use client";

import React, { useState } from "react";
import { Key, Eye, EyeOff, X, Check, ShieldCheck, Loader2 } from "lucide-react";
import { saveAuthorPasscode } from "@/lib/posts-service";

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPass: string) => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const clean = newPass.trim();
    const cleanConfirm = confirmPass.trim();

    if (!clean) {
      setError("Lütfen yeni bir şifre giriniz.");
      return;
    }

    if (clean.length < 4) {
      setError("Şifre en az 4 karakterden oluşmalıdır.");
      return;
    }

    if (clean !== cleanConfirm) {
      setError("Girdiğiniz iki şifre birbiriyle uyuşmuyor.");
      return;
    }

    try {
      setIsSaving(true);
      await saveAuthorPasscode(clean);
      setIsSuccess(true);
      if (onSuccess) onSuccess(clean);

      setTimeout(() => {
        setIsSuccess(false);
        setNewPass("");
        setConfirmPass("");
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Şifre güncelleme hatası:", err);
      setError("Şifre kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border-2 border-[#a87d29]/60 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden text-[#3b200b] relative animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: "#fbf6ee",
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(246, 236, 218, 0.95) 100%)`,
        }}
      >
        {/* Modal Başlığı (Masif Meşe Çerçeve) */}
        <div className="oak-shelf-front px-5 py-4 flex items-center justify-between border-b border-[#ffd9a3]/20 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#241307] border border-[#a87d29]/50 shadow-inner">
              <Key className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 tracking-wide">
                Yazar Anahtarını (Şifresini) Değiştir
              </h3>
              <p className="text-[11px] font-serif text-amber-200/70">
                Yazar Odası için yeni bir gizli giriş anahtarı belirleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-200 hover:text-white bg-[#241307]/70 hover:bg-[#241307] border border-[#a87d29]/40 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Gövdesi */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {isSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-600/30 text-emerald-900 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm">Şifreniz Başarıyla Güncellendi!</h4>
              <p className="text-xs font-serif text-emerald-800/80">
                Yeni anahtarınız buluta kaydedildi. Artık tüm cihazlarınızdan bu yeni şifreyle giriş yapabilirsiniz.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs font-serif">
                  {error}
                </div>
              )}

              {/* Yeni Şifre */}
              <div className="space-y-1.5">
                <label className="block text-xs font-serif font-semibold text-[#4a2e17]">
                  Yeni Yazar Şifresi
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Yeni gizli anahtarınız..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/90 border border-[#c5ab8d] text-xs sm:text-sm font-serif text-[#3b200b] placeholder:text-amber-900/30 focus:outline-hidden focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 text-amber-900/50 hover:text-amber-950 cursor-pointer p-1"
                    title={showPass ? "Şifreyi Gizle" : "Şifreyi Göster"}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Yeni Şifre Tekrar */}
              <div className="space-y-1.5">
                <label className="block text-xs font-serif font-semibold text-[#4a2e17]">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar yazın..."
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-white/90 border border-[#c5ab8d] text-xs sm:text-sm font-serif text-[#3b200b] placeholder:text-amber-900/30 focus:outline-hidden focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 shadow-xs transition-all"
                />
              </div>

              {/* Güvence & Bilgilendirme Kutusu */}
              <div className="p-3 rounded-xl bg-[#edd9be]/50 border border-[#c5ab8d]/60 text-[11px] font-serif text-[#603e22] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Bulut Senkronizasyonu & Güvence</span>
                </div>
                <p>
                  Belirlediğiniz yeni şifre Firestore bulutuna kaydedilir, telefon veya diğer tarayıcılarda da anında geçerli olur.
                </p>
                <p className="text-[10px] text-amber-900/70 italic">
                  * Şifrenizi unutsanız dahi sistem kurtarma anahtarı (<code className="font-mono bg-amber-900/10 px-1 rounded">gunduzrakisi</code>) her zaman çalışır.
                </p>
              </div>

              {/* Alt Butonlar */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-serif text-[#5a381d] hover:bg-neutral-200/50 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4d2810] to-[#2e1506] hover:from-[#613214] hover:to-[#3b1c09] text-[#faedd9] font-serif font-semibold text-xs tracking-wide shadow-md border border-[#d4af37]/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-amber-300" />
                      <span>Yeni Şifreyi Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}