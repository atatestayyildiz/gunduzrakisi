"use client";

import React, { useState } from "react";
import { MusicTrack } from "@/lib/types";
import { extractYouTubeId } from "@/components/ui/music-player-widget";
import { Music, Plus, X, Trash2, Sparkles, Edit, RotateCcw } from "lucide-react";

export interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: MusicTrack[];
  onSaveTrack: (track: MusicTrack) => Promise<void>;
  onDeleteTrack: (id: string) => Promise<void>;
}

export function AddMusicModal({
  isOpen,
  onClose,
  tracks,
  onSaveTrack,
  onDeleteTrack,
}: AddMusicModalProps) {
  const [activeTab, setActiveTab] = useState<"add" | "list">("add");
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingTrackId(null);
    setTitle("");
    setArtist("");
    setCover("");
    setUrl("");
    setError("");
  };

  const handleStartEdit = (track: MusicTrack) => {
    setEditingTrackId(track.id);
    setTitle(track.title);
    setArtist(track.artist || "");
    setCover(track.cover || "");
    setUrl(track.url);
    setActiveTab("add");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Lütfen şarkı adını girin.");
      return;
    }
    if (!url.trim() || !extractYouTubeId(url)) {
      setError("Lütfen geçerli bir YouTube veya YouTube Music bağlantısı girin.");
      return;
    }

    try {
      setIsSaving(true);
      const trackToSave: MusicTrack = {
        id: editingTrackId || `track_${Date.now()}`,
        title: title.trim(),
        artist: artist.trim() || "Mert Kip",
        url: url.trim(),
        cover: cover.trim() || undefined,
        createdAt: editingTrackId
          ? tracks.find((t) => t.id === editingTrackId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      };
      await onSaveTrack(trackToSave);
      resetForm();
      setActiveTab("list");
    } catch (err) {
      console.error(err);
      setError("Şarkı kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border-2 border-[#a87d29]/50 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: "#200e05",
          backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.6) 0%, rgba(40,20,10,0.4) 50%, rgba(0,0,0,0.7) 100%), url('/textures/oak_wood.jpg')`,
          backgroundSize: "400px auto",
        }}
      >
        {/* Modal Header */}
        <div className="oak-shelf-front px-5 py-4 flex items-center justify-between border-b border-[#ffd9a3]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#140802] border border-[#a87d29]/40 text-amber-300 shadow-inner">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-100 text-sm sm:text-base">
                Müzik Sandığı Yönetimi
              </h3>
              <p className="text-[11px] font-serif italic text-amber-200/70">
                Yazılarınıza eşlik edecek şarkılar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200/70 hover:text-white hover:bg-black/30 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-amber-900/40 bg-black/20 text-xs font-serif">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-semibold transition-colors cursor-pointer ${
              activeTab === "add"
                ? "bg-amber-950/60 text-amber-200 border-b-2 border-amber-500"
                : "text-amber-200/60 hover:text-amber-100"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Şarkı Ekle</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-semibold transition-colors cursor-pointer ${
              activeTab === "list"
                ? "bg-amber-950/60 text-amber-200 border-b-2 border-amber-500"
                : "text-amber-200/60 hover:text-amber-100"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Kayıtlı Şarkılar ({tracks.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === "add" ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700/50 text-rose-200 text-xs font-serif">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-serif font-medium text-amber-200/90 mb-1">
                  Şarkı Adı *
                </label>
                <input
                  type="text"
                  placeholder="Şarkı Adı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#120702] border border-[#a87d29]/40 text-amber-100 text-xs font-serif placeholder-amber-200/30 focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-amber-200/90 mb-1">
                  Sanatçı
                </label>
                <input
                  type="text"
                  placeholder="Sanatçı Adı"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#120702] border border-[#a87d29]/40 text-amber-100 text-xs font-serif placeholder-amber-200/30 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-amber-200/90 mb-1">
                  YouTube Bağlantısı (URL) *
                </label>
                <input
                  type="text"
                  placeholder="youtube.com/watch?v=... veya youtu.be/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#120702] border border-[#a87d29]/40 text-amber-100 text-xs font-serif placeholder-amber-200/30 focus:outline-hidden focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-medium text-amber-200/90 mb-1">
                  Albüm Kapağı Görseli (URL) (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Boş bırakılırsa YouTube'dan otomatik alınır"
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#120702] border border-[#a87d29]/40 text-amber-100 text-xs font-serif placeholder-amber-200/30 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                {editingTrackId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 text-amber-200 text-xs font-serif border border-amber-900/50 transition-all cursor-pointer"
                  >
                    Vazgeç
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4d2810] via-[#753d16] to-[#3a1d0a] hover:from-[#5e3113] hover:to-[#47240d] text-amber-100 font-serif font-bold text-xs shadow-lg border border-[#d4af37]/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isSaving
                      ? "Kaydediliyor..."
                      : editingTrackId
                      ? "Değişiklikleri Güncelle"
                      : "Şarkıyı Kaydet"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              {tracks.length === 0 ? (
                <div className="text-center py-8 text-xs font-serif text-amber-200/50">
                  Henüz kaydedilmiş şarkı bulunmuyor.
                </div>
              ) : (
                tracks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#140802]/80 border border-[#a87d29]/30 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-serif font-bold text-amber-100 truncate">
                        {t.title}
                      </p>
                      <p className="font-serif text-[11px] text-amber-200/70 truncate">
                        {t.artist || "Mert Kip"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(t)}
                        className="p-1.5 rounded-lg text-amber-300 hover:text-white hover:bg-amber-950/60 transition-colors cursor-pointer"
                        title="Şarkıyı Düzenle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTrack(t.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Şarkıyı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
