"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/ui/book";
import { BookArticle } from "@/lib/types";

interface BookItemProps {
  article: BookArticle;
  index: number;
}

export const BookItem = ({ article }: BookItemProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/yazi/${article.slug}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-end h-full px-2 sm:px-3">
      {/* 3D Book Component: Flat at rest, rotates -20deg on hover */}
      <div className="relative z-10 cursor-pointer" onClick={handleClick}>
        <Book
          title={article.title}
          variant={article.variant}
          color={article.coverColor}
          textColor={article.textColor}
          textured={article.textured}
          coverImage={article.coverImage}
          heightRatio={article.heightRatio || 1}
          width={{ sm: 140, md: 165, lg: 180, xl: 196 }}
        />
      </div>

      {/* Realistic Shadow Cast on the Oak Shelf Surface */}
      <div className="w-4/5 h-2.5 bg-black/25 rounded-full blur-[4px] -mt-1 pointer-events-none" />
    </div>
  );
};
