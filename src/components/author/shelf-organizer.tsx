"use client";

import React, { useMemo, useState } from "react";
import { BookArticle, ShelfItem } from "@/lib/types";
import { Book } from "@/components/ui/book";
import { assignArticlesToShelves, flattenShelfLayout } from "@/lib/shelf-utils";
import {
  Lock,
  Unlock,
  GripVertical,
  Check,
  RefreshCw,
  Trash2,
  Edit3,
  Clock,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Undo2,
} from "lucide-react";

interface ShelfOrganizerProps {
  articles: BookArticle[];
  shelves: ShelfItem[];
  onEditArticle: (article: BookArticle) => void;
  onDeleteArticle: (id: string) => void;
  /** Kilitliyken anında kalıcı raf ekleme */
  onAddShelf: (name: string) => Promise<void>;
  /** Kilitliyken anında kalıcı raf adı değiştirme */
  onRenameShelf: (id: string, name: string) => Promise<void>;
  /** Kilit kapanınca tüm düzeni (raf sırası/isimleri + kitap yerleri) kaydeder */
  onSaveLayout: (shelves: ShelfItem[], articles: BookArticle[]) => Promise<void>;
}

type Layout = Record<string, string[]>; // shelfId -> sıralı kitap id'leri
type DragState = { kind: "book"; id: string } | { kind: "shelf"; id: string } | null;

const newShelfId = () => `shelf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const ShelfOrganizer = ({
  articles,
  shelves,
  onEditArticle,
  onDeleteArticle,
  onAddShelf,
  onRenameShelf,
  onSaveLayout,
}: ShelfOrganizerProps) => {
  const [isLocked, setIsLocked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Kilit açıkken üzerinde çalışılan taslak düzen
  const [draftShelves, setDraftShelves] = useState<ShelfItem[]>([]);
  const [draftLayout, setDraftLayout] = useState<Layout>({});

  const [drag, setDrag] = useState<DragState>(null);
  const [overTarget, setOverTarget] = useState<string | null>(null);

  const [newShelfName, setNewShelfName] = useState("");
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const articleById = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);

  const topLikedIds = useMemo(() => {
    const sorted = [...articles]
      .filter((a) => (a.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
    return new Set(sorted.map((a) => a.id));
  }, [articles]);

  const propLayout = useMemo<Layout>(() => {
    const map = assignArticlesToShelves(articles, shelves);
    const out: Layout = {};
    map.forEach((list, id) => (out[id] = list.map((a) => a.id)));
    return out;
  }, [articles, shelves]);

  const viewShelves = isLocked ? shelves : draftShelves;
  const viewLayout = isLocked ? propLayout : draftLayout;

  // ─────────── Kilit / Kaydet ───────────
  const handleUnlock = () => {
    setDraftShelves(shelves.map((s) => ({ ...s })));
    setDraftLayout(Object.fromEntries(Object.entries(propLayout).map(([k, v]) => [k, [...v]])));
    setIsLocked(false);
  };

  const handleDiscard = () => {
    setIsLocked(true);
    setEditingShelfId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const map = new Map<string, BookArticle[]>();
    draftShelves.forEach((s) => {
      map.set(
        s.id,
        (draftLayout[s.id] || []).map((id) => articleById.get(id)).filter(Boolean) as BookArticle[]
      );
    });
    const normalizedShelves = draftShelves.map((s, idx) => ({ ...s, order: idx }));
    await onSaveLayout(normalizedShelves, flattenShelfLayout(normalizedShelves, map));
    setIsSaving(false);
    setIsLocked(true);
    setEditingShelfId(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // ─────────── Raf işlemleri ───────────
  const handleAddShelf = async () => {
    const name = newShelfName.trim();
    if (!name) return;
    if (isLocked) {
      await onAddShelf(name);
    } else {
      const id = newShelfId();
      setDraftShelves((prev) => [...prev, { id, name, order: prev.length }]);
      setDraftLayout((prev) => ({ ...prev, [id]: [] }));
    }
    setNewShelfName("");
  };

  const commitRename = async () => {
    const name = editingName.trim();
    const id = editingShelfId;
    setEditingShelfId(null);
    if (!id || !name) return;
    if (isLocked) {
      await onRenameShelf(id, name);
    } else {
      setDraftShelves((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    }
  };

  const handleDeleteShelf = (id: string) => {
    if (draftShelves.length <= 1) {
      alert("Kitaplıkta en az bir raf kalmalıdır.");
      return;
    }
    const idx = draftShelves.findIndex((s) => s.id === id);
    const target = draftShelves[idx === 0 ? 1 : idx - 1];
    const books = draftLayout[id] || [];
    if (books.length > 0) {
      const ok = confirm(
        `Bu raftaki ${books.length} kitap "${target.name}" rafına taşınacak. Rafı kaldırmak istiyor musunuz?`
      );
      if (!ok) return;
    }
    setDraftShelves((prev) => prev.filter((s) => s.id !== id));
    setDraftLayout((prev) => {
      const next = { ...prev };
      next[target.id] = [...(next[target.id] || []), ...books];
      delete next[id];
      return next;
    });
  };

  const moveShelf = (id: string, dir: -1 | 1) => {
    setDraftShelves((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  // ─────────── Sürükle & Bırak ───────────
  const resetDrag = () => {
    setDrag(null);
    setOverTarget(null);
  };

  const moveBook = (bookId: string, toShelfId: string, beforeBookId?: string) => {
    setDraftLayout((prev) => {
      const next: Layout = {};
      for (const [k, v] of Object.entries(prev)) next[k] = v.filter((id) => id !== bookId);
      const list = next[toShelfId] || [];
      const at = beforeBookId ? list.indexOf(beforeBookId) : -1;
      if (at >= 0) list.splice(at, 0, bookId);
      else list.push(bookId);
      next[toShelfId] = list;
      return next;
    });
  };

  const reorderShelf = (shelfId: string, beforeShelfId: string) => {
    if (shelfId === beforeShelfId) return;
    setDraftShelves((prev) => {
      const moving = prev.find((s) => s.id === shelfId);
      if (!moving) return prev;
      const rest = prev.filter((s) => s.id !== shelfId);
      const fromIdx = prev.findIndex((s) => s.id === shelfId);
      const targetIdx = prev.findIndex((s) => s.id === beforeShelfId);
      let at = rest.findIndex((s) => s.id === beforeShelfId);
      // Aşağı taşınırken hedefin arkasına yerleşsin
      if (fromIdx < targetIdx) at += 1;
      rest.splice(at, 0, moving);
      return rest;
    });
  };

  const handleShelfDrop = (e: React.DragEvent, shelfId: string) => {
    e.preventDefault();
    if (!drag) return;
    if (drag.kind === "shelf") reorderShelf(drag.id, shelfId);
    else moveBook(drag.id, shelfId);
    resetDrag();
  };

  const handleBookDrop = (e: React.DragEvent, shelfId: string, beforeBookId: string) => {
    if (!drag || drag.kind !== "book") return;
    e.preventDefault();
    e.stopPropagation();
    if (drag.id !== beforeBookId) moveBook(drag.id, shelfId, beforeBookId);
    resetDrag();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Kontrol Barı */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#eee4d6]/90 border border-[#d5c3ab] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isLocked ? handleUnlock : handleSave}
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
                <span>Düzen Kaydediliyor...</span>
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

          {!isLocked && !isSaving && (
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold text-[#4a2e17] bg-white/60 hover:bg-white border border-[#d2c0aa] cursor-pointer"
              title="Kaydetmeden değişiklikleri geri al"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Vazgeç
            </button>
          )}

          <span className="text-xs font-serif text-[#6a4c33]">
            {isLocked
              ? "Raf ekleyip adlarını değiştirebilirsiniz. Sıralama için kilidi açın."
              : "Rafları başlığından, kitapları kapağından sürükleyin. Bitince 'Kilidi Kapat & Bitir'e basın."}
          </span>
        </div>

        {/* Yeni Raf Ekle */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#d5c3ab]">
          <input
            type="text"
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddShelf();
            }}
            placeholder="Yeni rafın adı (örn. Meyhane Notları)"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white/80 border border-[#d2c0aa] text-xs font-serif text-[#3b200b] placeholder-[#9a7d65] focus:outline-hidden focus:ring-1 focus:ring-amber-800"
          />
          <button
            type="button"
            onClick={handleAddShelf}
            disabled={!newShelfName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3e220e] hover:bg-[#522d14] text-amber-100 text-xs font-serif font-semibold shadow-xs cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            Raf Ekle
          </button>
        </div>
      </div>

      {/* Raflar */}
      <div className="space-y-10">
        {viewShelves.map((shelf, sIdx) => {
          const bookIds = viewLayout[shelf.id] || [];
          const isShelfOver = overTarget === `shelf:${shelf.id}`;
          const isShelfDragging = drag?.kind === "shelf" && drag.id === shelf.id;

          return (
            <div
              key={shelf.id}
              onDragOver={(e) => {
                if (isLocked || !drag) return;
                e.preventDefault();
                setOverTarget(`shelf:${shelf.id}`);
              }}
              onDrop={(e) => handleShelfDrop(e, shelf.id)}
              className={`p-6 rounded-2xl bg-black/10 border-4 shadow-xl relative transition-all ${
                isShelfOver ? "border-amber-600 bg-amber-500/10" : "border-[#3e1f0b]"
              } ${isShelfDragging ? "opacity-40" : ""}`}
            >
              {/* Raf Başlığı */}
              <div
                draggable={!isLocked && editingShelfId !== shelf.id}
                onDragStart={() => setDrag({ kind: "shelf", id: shelf.id })}
                onDragEnd={resetDrag}
                className={`flex items-center justify-between gap-3 mb-4 ${
                  !isLocked ? "cursor-grab active:cursor-grabbing" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {!isLocked && (
                    <div className="p-1 rounded bg-[#3f220d] text-amber-200 shrink-0" title="Rafı sürükle">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {editingShelfId === shelf.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setEditingShelfId(null);
                        }}
                        className="px-2 py-1 rounded-lg border border-amber-800 text-xs font-serif bg-white focus:outline-hidden"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={commitRename}
                        className="p-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                        title="Kaydet"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingShelfId(null)}
                        className="p-1 rounded bg-stone-500 hover:bg-stone-600 text-white cursor-pointer"
                        title="İptal"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingShelfId(shelf.id);
                        setEditingName(shelf.name);
                      }}
                      className="group/name flex items-center gap-1.5 font-serif font-bold text-xs uppercase tracking-widest text-[#664326] hover:text-[#3e220e] cursor-pointer truncate"
                      title="Raf adını değiştir"
                    >
                      <span className="truncate">{shelf.name}</span>
                      <Edit3 className="w-3 h-3 opacity-50 group-hover/name:opacity-100 shrink-0" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-serif italic text-neutral-500">
                    {bookIds.length} Kitap
                  </span>
                  {!isLocked && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveShelf(shelf.id, -1)}
                        disabled={sIdx === 0}
                        className="p-1 rounded bg-amber-100 text-amber-900 hover:bg-white disabled:opacity-30 cursor-pointer"
                        title="Yukarı taşı"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveShelf(shelf.id, 1)}
                        disabled={sIdx === viewShelves.length - 1}
                        className="p-1 rounded bg-amber-100 text-amber-900 hover:bg-white disabled:opacity-30 cursor-pointer"
                        title="Aşağı taşı"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShelf(shelf.id)}
                        className="p-1 rounded bg-rose-100 text-rose-900 hover:bg-rose-200 cursor-pointer"
                        title="Rafı kaldır"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Kitaplar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end min-h-[260px]">
                {bookIds.length > 0 ? (
                  bookIds.map((bookId) => {
                    const book = articleById.get(bookId);
                    if (!book) return null;
                    const isDragging = drag?.kind === "book" && drag.id === book.id;
                    const isOver = overTarget === `book:${book.id}`;

                    return (
                      <div
                        key={book.id}
                        draggable={!isLocked}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDrag({ kind: "book", id: book.id });
                        }}
                        onDragEnd={resetDrag}
                        onDragOver={(e) => {
                          if (isLocked || drag?.kind !== "book") return;
                          e.preventDefault();
                          e.stopPropagation();
                          setOverTarget(`book:${book.id}`);
                        }}
                        onDrop={(e) => handleBookDrop(e, shelf.id, book.id)}
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
                          coverImageTransform={book.coverImageTransform}
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
                      {isLocked
                        ? "Bu raf henüz boş • Yazı eklerken bu rafı seçebilirsiniz"
                        : "Kitapları buraya sürükleyip bırakabilirsiniz"}
                    </span>
                  </div>
                )}
              </div>

              <div className="oak-wood-beam h-6 w-full mt-4 rounded-b-lg" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
