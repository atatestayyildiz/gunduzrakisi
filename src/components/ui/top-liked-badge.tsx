import React from "react";

interface TopLikedBadgeProps {
  className?: string;
}

/**
 * Antique Gold & Black Medallion Badge with Laurel Wreath, Star & Ribbons.
 * Displayed on top-5 most liked books.
 */
export const TopLikedBadge: React.FC<TopLikedBadgeProps> = ({ className = "" }) => {
  return (
    <div
      className={`absolute top-1.5 right-1.5 z-30 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)] ${className}`}
      style={{
        width: "28cqw",
        height: "28cqw",
        minWidth: 38,
        minHeight: 38,
        maxWidth: 62,
        maxHeight: 62,
      }}
      title="En Beğenilen Eser"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Gold Gradient for outer rim & ribbons */}
          <linearGradient id="goldRibbonLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5b857" />
            <stop offset="50%" stopColor="#9a6e1a" />
            <stop offset="100%" stopColor="#5c3f0b" />
          </linearGradient>
          <linearGradient id="goldRibbonRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f7d488" />
            <stop offset="50%" stopColor="#b38226" />
            <stop offset="100%" stopColor="#69480e" />
          </linearGradient>
          <radialGradient id="badgeGoldBorder" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#966d1f" />
            <stop offset="88%" stopColor="#fedf94" />
            <stop offset="94%" stopColor="#d4a340" />
            <stop offset="100%" stopColor="#7a5210" />
          </radialGradient>
          <radialGradient id="badgeInnerDark" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1e2530" />
            <stop offset="65%" stopColor="#0c1017" />
            <stop offset="100%" stopColor="#05070a" />
          </radialGradient>
          <radialGradient id="badgeCenterGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3d1" />
            <stop offset="40%" stopColor="#eec774" />
            <stop offset="85%" stopColor="#b68326" />
            <stop offset="100%" stopColor="#7a5210" />
          </radialGradient>
        </defs>

        {/* 1. Hanging Ribbons behind the Medallion */}
        {/* Left Ribbon */}
        <path
          d="M 28 66 L 6 78 L 16 93 L 36 78 Z"
          fill="url(#goldRibbonLeft)"
          stroke="#422906"
          strokeWidth="0.8"
        />
        {/* Right Ribbon */}
        <path
          d="M 72 66 L 94 78 L 84 93 L 64 78 Z"
          fill="url(#goldRibbonRight)"
          stroke="#422906"
          strokeWidth="0.8"
        />

        {/* 2. Outer Heavy Gold Ring */}
        <circle cx="50" cy="50" r="38" fill="url(#badgeGoldBorder)" stroke="#452a06" strokeWidth="1" />

        {/* 3. Deep Midnight Blue/Black Inner Enamel */}
        <circle cx="50" cy="50" r="33.5" fill="url(#badgeInnerDark)" stroke="#1a1103" strokeWidth="0.8" />

        {/* 4. Fine Golden Inner Concentric Wire */}
        <circle cx="50" cy="50" r="31.5" fill="none" stroke="#eec774" strokeWidth="0.8" opacity="0.85" />

        {/* 5. Center Golden Sunburst Medallion */}
        <circle cx="50" cy="50" r="18" fill="url(#badgeCenterGold)" stroke="#6b460d" strokeWidth="0.6" />

        {/* 6. Five-pointed Star at Top */}
        <path
          d="M 50 21 L 51.5 25 L 55.5 25.2 L 52.3 27.6 L 53.5 31.5 L 50 29.2 L 46.5 31.5 L 47.7 27.6 L 44.5 25.2 L 48.5 25 Z"
          fill="#ffd982"
          stroke="#7a5210"
          strokeWidth="0.5"
        />

        {/* 7. Laurel Wreath Leaves (Left Arc) */}
        <g fill="#dfb35e" stroke="#7a5210" strokeWidth="0.3">
          <ellipse cx="25" cy="40" rx="3.5" ry="1.8" transform="rotate(-35 25 40)" />
          <ellipse cx="23" cy="48" rx="3.5" ry="1.8" transform="rotate(-15 23 48)" />
          <ellipse cx="25" cy="56" rx="3.5" ry="1.8" transform="rotate(15 25 56)" />
          <ellipse cx="29" cy="63" rx="3.5" ry="1.8" transform="rotate(35 29 63)" />
          <ellipse cx="36" cy="69" rx="3.5" ry="1.8" transform="rotate(55 36 69)" />
        </g>

        {/* 8. Laurel Wreath Leaves (Right Arc) */}
        <g fill="#dfb35e" stroke="#7a5210" strokeWidth="0.3">
          <ellipse cx="75" cy="40" rx="3.5" ry="1.8" transform="rotate(35 75 40)" />
          <ellipse cx="77" cy="48" rx="3.5" ry="1.8" transform="rotate(15 77 48)" />
          <ellipse cx="75" cy="56" rx="3.5" ry="1.8" transform="rotate(-15 75 56)" />
          <ellipse cx="71" cy="63" rx="3.5" ry="1.8" transform="rotate(-35 71 63)" />
          <ellipse cx="64" cy="69" rx="3.5" ry="1.8" transform="rotate(-55 64 69)" />
        </g>

        {/* 9. Center Star Icon Accent */}
        <path
          d="M 50 43.5 L 51.8 47.5 L 56 48 L 52.8 50.8 L 53.8 55 L 50 52.8 L 46.2 55 L 47.2 50.8 L 44 48 L 48.2 47.5 Z"
          fill="#5c3804"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};
