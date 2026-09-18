"use client";

import React, { useState } from "react";
import { BookArticle } from "@/lib/types";
import { Book } from "@/components/ui/book";
import { Lock, Unlock, GripVertical, Check, RefreshCw, Trash2, Edit3 } from "lucide-react";

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

  // Group books into shelves of 5
  const SHELF_SIZE = 5;
  const shelves: BookArticle[][] = [];
  for (let i = 0; i < articles.length; i += SHELF_SIZE) {
    shelves.push(articles.slice(i, i + SHELF_SIZE));
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

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveOrder(articles);
    setIsSaving(false);
    setSaveSuccess(true);
    setIsLocked(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Organizer Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#eee4d6]/90 border border-[#d5c3ab] shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer ${
              isLocked
                ? "bg-[#3f220d] text-amber-100 hover:bg-[#573013]"
                : "bg-amber-600 text-white ring-2 ring-amber-400 animate-pulse"
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Raf Kilidi Kapalı (Kilidi Aç)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Kilidi Kapat & Bitir</span>
              </>
            )}
          </button>

          <span className="text-xs font-serif text-[#6a4c33]">
            {isLocked
              ? "Sıralamayı değiştirmek için önce kilidi açın."
              : "Kitapları sürükleyip istediğiniz rafa veya sıraya taşıyabilirsiniz."}
          </span>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : null}
            <span>{saveSuccess ? "Sıralama Kaydedildi!" : "Yeni Raf Sırasını Kaydet"}</span>
          </button>
        )}
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
              {shelf.map((book, bIdx) => {
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
                    />

                    <span className="text-[11px] font-serif font-medium text-center text-[#432712] mt-2 line-clamp-1 w-full">
                      {book.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Oak plank bottom edge */}
            <div className="oak-wood-beam h-6 w-full mt-4 rounded-b-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};
