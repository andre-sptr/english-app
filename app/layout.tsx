import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EnglishHub SMA - Latihan TOEFL dengan AI",
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
      <body className={`${plusJakarta.variable} ${dmSerif.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
