"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/ui/book";
import { BookArticle } from "@/lib/types";
import { BookOpeningTransition } from "./book-opening-transition";

import { BookSizePreset } from "@/lib/book-size-utils";

interface BookItemProps {
  article: BookArticle;
  index: number;
  size?: BookSizePreset;
  isTopLiked?: boolean;
}

export const BookItem = ({ article, size, isTopLiked = false }: BookItemProps) => {
  const router = useRouter();
  const [openingRect, setOpeningRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (openingRect) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setOpeningRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  };

  const scale = size ? size.widthScale : 1;
  const effectiveHeightRatio = size ? size.heightRatio : (article.heightRatio || 1);

  return (
    <>
      <div className="group/book relative flex flex-col items-center justify-end h-full px-2 sm:px-3 pb-0 hover:z-50">
        {/* 3D Book Component: Flat at rest, rotates and steps forward on hover */}
        <div
          className={`relative z-20 group-hover/book:z-50 cursor-pointer flex items-end justify-center h-full ${
            openingRect ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClick}
        >
          <Book
            title={article.title}
            variant={article.variant}
            color={article.coverColor}
            textColor={article.textColor}
            textured={article.textured}
            coverImage={article.coverImage}
            heightRatio={effectiveHeightRatio}
            isTopLiked={isTopLiked}
            width={{
              sm: Math.round(140 * scale),
              md: Math.round(165 * scale),
              lg: Math.round(180 * scale),
              xl: Math.round(196 * scale),
            }}
          />

          {/* Realistic Cast Shadow Behind Book when it steps forward on hover */}
          <div
            className="absolute inset-0 rounded-l-md rounded-r bg-black/75 pointer-events-none -z-10 opacity-0 group-hover/book:opacity-100 transition-all duration-300 ease-out blur-[10px] scale-95 group-hover/book:scale-100 group-hover/book:translate-x-3.5 group-hover/book:translate-y-3"
          />

          {/* Contact Shadow on shelf surface - deepens under shelf LED, softens when book steps forward */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-2 bg-black/45 group-hover/shelf:bg-black/75 group-hover/book:scale-115 group-hover/book:blur-[5px] group-hover/book:opacity-60 rounded-full blur-[3px] pointer-events-none -z-10 transition-all duration-300" />
        </div>
      </div>

      {/* Ultra-Smooth 3D Book Opening, Cover Swing & Viewport Expansion */}
      {openingRect && (
        <BookOpeningTransition
          article={article}
          initialRect={openingRect}
          onComplete={() => {
            router.push(`/yazi/${article.slug}`);
          }}
          onClose={() => {
            setOpeningRect(null);
          }}
        />
      )}
    </>
  );
};
