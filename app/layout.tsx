import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EnglishHub SMA — Latihan TOEFL Speaking",
  description:
    "Latihan TOEFL Speaking dengan AI. Rekam jawaban kamu, dapatkan skor dan feedback instan sesuai rubrik ETS TOEFL.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen">
        <div className="max-w-lg mx-auto px-4 pb-16">{children}</div>
      </body>
    </html>
  );
}
