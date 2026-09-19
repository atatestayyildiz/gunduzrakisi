"use client";

import React, { useState } from "react";
import { BookArticle } from "@/lib/types";
import { Book } from "@/components/ui/book";
import { Lock, Unlock, GripVertical, Check, RefreshCw, Trash2, Edit3, Clock } from "lucide-react";

interface ShelfOrganizerProps {
  articles: BookArticle[];
  onOrderChange: (newArticles: BookArticle[]) => void;
  onEditArticle: (article: BookArticle) => void;
  onDeleteArticle: (id: string) => void;
  onSaveOrder: (articles: BookArticle[]) => Promise<void>;
}

export const ShelfOrganizer = ({
  articles,
  onOrderChange,
  onEditArticle,
  onDeleteArticle,
  onSaveOrder,
}: ShelfOrganizerProps) => {
  const [isLocked, setIsLocked] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // En Beğenilen ilk 5 kitap (En az 1 like almış ve beğeniye göre sıralı)
  const topLikedIds = React.useMemo(() => {
    const sorted = [...articles]
      .filter((a) => (a.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
    return new Set(sorted.map((a) => a.id));
  }, [articles]);

  // Group books into shelves of 5 (En az 2 raf mutlaka gösterilir)
  const SHELF_SIZE = 5;
  const MIN_SHELVES = 2;
  const totalShelvesCount = Math.max(MIN_SHELVES, Math.ceil(articles.length / SHELF_SIZE));
  const shelves: BookArticle[][] = [];
  for (let i = 0; i < totalShelvesCount; i++) {
    shelves.push(articles.slice(i * SHELF_SIZE, (i + 1) * SHELF_SIZE));
  }

  const handleDragStart = (globalIndex: number) => {
    if (isLocked) return;
    setDraggedIndex(globalIndex);
  };

  const handleDragOver = (e: React.DragEvent, globalIndex: number) => {
    if (isLocked) return;
    e.preventDefault();
    setDragOverIndex(globalIndex);
  };

  const handleDrop = (targetIndex: number) => {
    if (isLocked || draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...articles];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Re-index orders
    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    onOrderChange(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Kilidi aç veya kilidi kapatıp otomatik kaydet
  const handleToggleLock = async () => {
    if (isLocked) {
      setIsLocked(false);
    } else {
      setIsSaving(true);
      await onSaveOrder(articles);
      setIsSaving(false);
      setSaveSuccess(true);
      setIsLocked(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Organizer Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#eee4d6]/90 border border-[#d5c3ab] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleLock}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
              isSaving
                ? "bg-amber-800/80 text-amber-100"
                : isLocked
                ? "bg-[#3f220d] text-amber-100 hover:bg-[#573013]"
                : "bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white shadow-md border border-amber-500/40"
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-200" />
                <span>Sıralama Kaydediliyor...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Kaydedildi & Kilitlendi</span>
              </>
            ) : isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Raf Kilidi Kapalı (Kilidi Aç)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Kilidi Kapat & Bitir (Kaydet)</span>
              </>
            )}
          </button>

          <span className="text-xs font-serif text-[#6a4c33]">
            {isLocked
              ? "Sıralamayı değiştirmek için önce kilidi açın."
              : "Kitapları sürükleyip istediğiniz sıraya taşıyın, işiniz bitince 'Kilidi Kapat & Bitir'e basın."}
          </span>
        </div>
      </div>

      {/* Visual Shelves for Drag & Drop */}
      <div className="space-y-12">
        {shelves.map((shelf, sIdx) => (
          <div
            key={sIdx}
            className="p-6 rounded-2xl bg-black/10 border-4 border-[#3e1f0b] shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#664326]">
                Raf #{sIdx + 1}
              </span>
              <span className="text-[11px] font-serif italic text-neutral-500">
                {shelf.length}/5 Kitap
              </span>
            </div>

            {/* Grid of 5 books per shelf */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end min-h-[260px]">
              {shelf.length > 0 ? (
                shelf.map((book, bIdx) => {
                  const globalIndex = sIdx * SHELF_SIZE + bIdx;
                  const isDragging = draggedIndex === globalIndex;
                  const isOver = dragOverIndex === globalIndex;

                  return (
                    <div
                      key={book.id}
                      draggable={!isLocked}
                      onDragStart={() => handleDragStart(globalIndex)}
                      onDragOver={(e) => handleDragOver(e, globalIndex)}
                      onDrop={() => handleDrop(globalIndex)}
                      className={`flex flex-col items-center justify-end p-2 rounded-xl transition-all ${
                        !isLocked ? "cursor-grab active:cursor-grabbing hover:bg-white/30" : ""
                      } ${isDragging ? "opacity-30 scale-95" : "opacity-100"} ${
                        isOver ? "border-2 border-dashed border-amber-600 bg-amber-500/10 scale-105" : ""
                      }`}
                    >
                      {!isLocked && (
                        <div className="flex items-center justify-between w-full mb-2 px-1">
                          <div className="p-1 rounded bg-[#3f220d] text-amber-200">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => onEditArticle(book)}
                              title="Düzenle"
                              className="p-1 rounded bg-amber-100 text-amber-900 hover:bg-white"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteArticle(book.id)}
                              title="Sil"
                              className="p-1 rounded bg-rose-100 text-rose-900 hover:bg-rose-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      <Book
                        title={book.title}
                        variant={book.variant}
                        color={book.coverColor}
                        textColor={book.textColor}
                        textured={book.textured}
                        coverImage={book.coverImage}
                        heightRatio={book.heightRatio || 1}
                        width={130}
                        isTopLiked={topLikedIds.has(book.id)}
                      />

                      <span className="text-[11px] font-serif font-medium text-center text-[#432712] mt-2 line-clamp-1 w-full">
                        {book.title}
                      </span>

                      {Boolean(book.scheduledAt && new Date(book.scheduledAt) > new Date()) && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-serif font-semibold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-400 shadow-2xs">
                          <Clock className="w-2.5 h-2.5 text-amber-800" />
                          <span>Planlandı</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full h-full flex flex-col items-center justify-center py-12 text-center">
                  <span className="font-serif italic text-xs text-amber-900/50">
                    Bu raf henüz boş • Daktilo ile yazdığınız yeni denemeler buraya eklenecektir
                  </span>
                </div>
              )}
            </div>

            {/* Oak plank bottom edge */}
            <div className="oak-wood-beam h-6 w-full mt-4 rounded-b-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
