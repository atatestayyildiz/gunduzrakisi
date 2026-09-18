import React from "react";

interface RakiGlassProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const RakiGlass = ({ className = "w-3.5 h-3.5", ...props }: RakiGlassProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Silindirik klasik ince uzun rakı kadehi */}
      <path d="M7.5 3h9v15a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V3z" />
      {/* Kalın cam dip tabanı */}
      <line x1="7.5" y1="16.5" x2="16.5" y2="16.5" />
      {/* Rakı seviye çizgisi */}
      <line x1="8" y1="10.5" x2="16" y2="10.5" strokeWidth="1.3" strokeDasharray="1.5 1.5" />
      {/* Buz küpü detayı */}
      <rect x="9.5" y="12" width="2.5" height="2.5" rx="0.5" strokeWidth="1" />
    </svg>
  );
};
