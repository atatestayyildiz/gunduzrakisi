import type { Metadata } from "next";
import { EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gündüz Rakısı | Mert Kip",
  description: "İnce şeylerin hatırı, telaşsız masalar ve bir parça memleket. Mert Kip'in deneme kitaplığı.",
  icons: {
    icon: [
      { url: "/textures/gunduzrakisifavicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/textures/gunduzrakisifavicon.png" },
    ],
    shortcut: "/textures/gunduzrakisifavicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${ebGaramond.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-700/20 selection:text-amber-950">
        {children}
      </body>
    </html>
  );
}
