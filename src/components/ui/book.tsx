"use client";

import React from "react";
import { useResponsive } from "@/components/ui/use-responsive";
import clsx from "clsx";

const DefaultIllustration = (
  <svg fill="none" height="56" viewBox="0 0 36 56" width="36" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M3.03113 28.0005C6.26017 23.1765 11.7592 20.0005 18 20.0005C24.2409 20.0005 29.7399 23.1765 32.9689 28.0005C29.7399 32.8244 24.2409 36.0005 18 36.0005C11.7592 36.0005 6.26017 32.8244 3.03113 28.0005Z"
      fill="#0070F3"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M32.9691 28.0012C34.8835 25.1411 36 21.7017 36 18.0015C36 8.06034 27.9411 0.00146484 18 0.00146484C8.05887 0.00146484 0 8.06034 0 18.0015C0 21.7017 1.11648 25.1411 3.03094 28.0012C6.25996 23.1771 11.7591 20.001 18 20.001C24.2409 20.001 29.74 23.1771 32.9691 28.0012Z"
      fill="#45DEC4"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M32.9692 28.0005C29.7402 32.8247 24.241 36.001 18 36.001C11.759 36.001 6.25977 32.8247 3.03077 28.0005C1.11642 30.8606 0 34.2999 0 38C0 47.9411 8.05887 56 18 56C27.9411 56 36 47.9411 36 38C36 34.2999 34.8836 30.8606 32.9692 28.0005Z"
      fill="#E5484D"
      fillRule="evenodd"
    />
  </svg>
);

interface ResponsiveProp<T> {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export interface BookProps {
  title: string;
  variant?: "simple" | "stripe";
  width?: number | ResponsiveProp<number>;
  color?: string;
  textColor?: string;
  illustration?: React.ReactNode;
  textured?: boolean;
  coverImage?: string;
  className?: string;
  scale?: number;
  heightRatio?: number;
  onClick?: () => void;
}

export interface BookCoverProps {
  title: string;
  variant?: "simple" | "stripe";
  color?: string;
  textColor?: string;
  illustration?: React.ReactNode;
  textured?: boolean;
  coverImage?: string;
  className?: string;
  width?: number;
}

export const BookCover = ({
  title,
  variant = "stripe",
  color,
  textColor,
  illustration,
  textured = false,
  coverImage,
  className,
  width,
}: BookCoverProps) => {
  const _color = color ? color : variant === "simple" ? "var(--ds-background-200)" : "var(--ds-amber-600)";
  const _illustration = illustration ? illustration : DefaultIllustration;
  const resolvedTextColor = textColor || (variant === "stripe" && !coverImage ? "var(--ds-gray-1000)" : "#ffffff");

  return (
    <div
      className={clsx(
        "flex flex-col h-full w-full rounded-l-md rounded-r overflow-hidden bg-background-200 shadow-book relative after:absolute after:border after:border-gray-alpha-400 after:w-full after:h-full after:shadow-book-border after:rounded-l-md after:rounded-r",
        className
      )}
      style={{ containerType: "inline-size" }}
    >
      {coverImage && variant === "simple" ? (
        /* Yekpare (Simple): Tüm kapakta yüklenen görsel yer alır */
        <div
          className="w-full h-full relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('${coverImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-[7%] pl-[14%]">
            <span
              className="leading-[1.2em] tracking-[-.02em] font-semibold text-balance drop-shadow-md text-[11cqw]"
              style={{ color: resolvedTextColor }}
            >
              {title}
            </span>
          </div>
          <div className="absolute h-full w-[8.2%] mix-blend-overlay" style={{ background: "var(--ds-book-bind)" }} />
        </div>
      ) : coverImage && variant === "stripe" ? (
        /* Çift Renkli (Stripe): Üst yarısı yüklenen görsel, alt yarısı seçilen cilt rengi */
        <>
          {/* Üst Yarısı: Görsel */}
          <div
            className="w-full flex-1 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url('${coverImage}')` }}
          >
            <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />
            <div className="absolute h-full w-[8.2%] mix-blend-overlay" style={{ background: "var(--ds-book-bind)" }} />
          </div>

          {/* Alt Yarısı: Seçilen Renk & Başlık */}
          <div
            className="relative flex-1 flex flex-col justify-between"
            style={{ background: _color }}
          >
            <div className="absolute h-full w-[8.2%] opacity-25" style={{ background: "var(--ds-book-bind)" }} />
            <div
              className="flex flex-col justify-between w-full h-full p-[6.1%] pl-[14.3%]"
              style={{
                containerType: "inline-size",
                gap: width ? `calc((24px / 196) * ${width})` : "calc(24cqw * 0.12)",
              }}
            >
              <span
                className="leading-[1.25em] tracking-[-.02em] text-balance font-semibold text-[10.5cqw]"
                style={{ color: resolvedTextColor }}
              >
                {title}
              </span>
              <svg className="scale-75 -ml-1 -mb-1" height="24" width="24" style={{ fill: resolvedTextColor }}>
                <path d="M21,21H3L12,3Z" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        /* Görsel Yoksa: Standart Yekpare / Çift Renkli Tasarım */
        <>
          <div
            className={clsx(
              "w-full relative overflow-hidden",
              variant === "stripe" && "flex-1"
            )}
            style={{ background: _color }}
          >
            {variant === "stripe" && illustration && (
              <div className="absolute h-full w-full">
                {_illustration}
              </div>
            )}
            <div className="absolute h-full w-[8.2%] mix-blend-overlay" style={{ background: "var(--ds-book-bind)" }} />
          </div>
          <div
            className={clsx(
              "relative flex-1",
              (variant === "stripe" || (variant === "simple" && color === undefined)) && "bg-book-gradient"
            )}
            style={{ background: variant === "simple" && color !== undefined ? _color : undefined }}
          >
            <div className="absolute h-full w-[8.2%] opacity-20" style={{ background: "var(--ds-book-bind)" }} />
            <div
              className={clsx(
                "flex flex-col w-full p-[6.1%] pl-[14.3%]",
                variant === "simple" ? "gap-4" : "justify-between"
              )}
              style={{
                containerType: "inline-size",
                gap: width ? `calc((24px / 196) * ${width})` : "calc(24cqw * 0.12)",
                height: variant === "stripe" ? "100%" : undefined
              }}
            >
              <span
                className={clsx(
                  "leading-[1.25em] tracking-[-.02em] text-balance font-semibold",
                  variant === "simple" ? "text-[12cqw]" : "text-[10.5cqw]"
                )}
                style={{ color: resolvedTextColor }}
              >
                {title}
              </span>
              {variant === "stripe" ? (
                <svg className="scale-75 -ml-1 -mb-1" height="24" width="24" style={{ fill: resolvedTextColor }}>
                  <path d="M21,21H3L12,3Z" />
                </svg>
              ) : (
                _illustration
              )}
            </div>
          </div>
        </>
      )}

      {textured && (
        <div
          className="absolute top-0 left-0 inset-0 rotate-180 rounded-l-md rounded-r mix-blend-hard-light pointer-events-none bg-cover bg-no-repeat opacity-50 brightness-110 bg-[url('https://cdn.21st.dev/assets/mirror/1a/1a2ecfcafab4d36898151e5960d2bddd8c13c8b5e3721538ce626d366810e518.avif')]"
        />
      )}

      {/* Realistic Overhead Shelf LED Light Response on Book Cover (Hover olunca öne çıktığı için tepe ışığı söner) */}
      <div className="absolute inset-0 rounded-l-md rounded-r pointer-events-none overflow-hidden opacity-0 group-hover/shelf:opacity-100 group-hover/book:!opacity-0 transition-opacity duration-300 ease-out z-20">
        {/* 1. Bright Top Edge Rim Highlight (Kitabın tepesine vuran parlak kenar) */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-amber-200/40 via-[#fff3d6] to-amber-200/40 shadow-[0_1px_5px_rgba(251,191,36,0.9)]" />

        {/* 2. Top-Down Amber Light Cascade over Front Cover */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(251, 191, 36, 0.38) 0%, rgba(245, 158, 11, 0.18) 32%, rgba(217, 119, 6, 0.04) 65%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />

        {/* 3. Soft Ambient Upper Angle Glaze */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(175deg, rgba(255, 230, 160, 0.3) 0%, transparent 45%)",
          }}
        />
      </div>
    </div>
  );
};

export const Book = ({
  title,
  variant = "stripe",
  width = 196,
  color,
  textColor,
  illustration,
  textured = false,
  coverImage,
  className,
  scale = 1,
  heightRatio = 1,
  onClick
}: BookProps) => {
  const _width = useResponsive(width);

  return (
    <div
      className={clsx("block w-fit cursor-pointer select-none align-bottom", className)}
      style={{ perspective: 900, transform: `scale(${scale})` }}
      onClick={onClick}
    >
      <div
        className="aspect-[49/60] w-fit relative rotate-0 duration-[250ms] book-rotate"
        style={{
          transformStyle: "preserve-3d",
          minWidth: _width,
          containerType: "inline-size",
          height: `calc((${_width}px * 60 / 49) * ${heightRatio})`
        }}
      >
        <div style={{ width: _width, height: "100%" }}>
          <BookCover
            title={title}
            variant={variant}
            color={color}
            textColor={textColor}
            illustration={illustration}
            textured={textured}
            coverImage={coverImage}
            width={_width}
          />
        </div>

        {/* Book pages edge (side) */}
        <div
          className="h-[calc(100%_-_2_*_3px)] w-[calc(29cqw_-_2px)] absolute top-[3px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, #eaeaea, transparent 70%), linear-gradient(#fff, #fafafa)",
            transform: `translateX(calc(${_width} * 1px - 29cqw / 2 - 3px)) rotateY(90deg) translateX(calc(29cqw / 2))`
          }}
        />
        {/* Book back cover */}
        <div
          className="bg-gray-200 absolute left-0 top-0 rounded-l-md rounded-r h-full pointer-events-none"
          style={{ width: _width, transform: "translateZ(calc(-1 * 29cqw))" }}
        />
      </div>
    </div>
  );
};
