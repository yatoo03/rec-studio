import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const font = Cairo({ subsets: ["arabic", "latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "REC.STUDIO | ابحث عن صورك",
  description: "التقط سيلفي واعثر على صورك من الفعالية.",
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={font.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
