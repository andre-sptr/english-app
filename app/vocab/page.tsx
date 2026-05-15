"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VOCAB_WORDS, VOCAB_IDS } from "@/lib/vocab-words";
import { loadCards, getDueCards, getMasteredCount } from "@/lib/srs";

export default function VocabPage() {
  const [dueCount, setDueCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    const cards = loadCards();
    setDueCount(getDueCards(cards, VOCAB_IDS).length);
    setMasteredCount(getMasteredCount(cards));
  }, []);

  const progressPct = Math.round((masteredCount / VOCAB_WORDS.length) * 100);

  return (
    <main className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Vocabulary TOEFL</h1>
          <p className="text-xs text-gray-400">{VOCAB_WORDS.length} kata akademik penting</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-brand-700">{dueCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Harus review</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-brand-700">{masteredCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Dikuasai</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-brand-700">{progressPct}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Progress</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Penguasaan Kosakata</p>
          <span className="text-xs text-gray-400">{masteredCount}/{VOCAB_WORDS.length}</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Kata "dikuasai" = benar ≥3 kali dengan interval ≥7 hari
        </p>
      </div>

      {/* CTA */}
      {dueCount > 0 ? (
        <Link
          href="/vocab/review"
          className="block w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all text-white text-center text-lg font-semibold shadow-lg"
        >
          Review {dueCount} Kata Sekarang
        </Link>
      ) : (
        <div className="rounded-2xl bg-green-50 border border-green-100 p-5 text-center">
          <p className="text-green-700 font-semibold">Semua kata sudah di-review!</p>
          <p className="text-sm text-green-600 mt-1">Kembali lagi nanti untuk review berikutnya.</p>
        </div>
      )}

      {/* Word list preview */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Semua Kata</p>
        <div className="flex flex-col gap-2">
          {VOCAB_WORDS.map((w) => (
            <div key={w.id} className="rounded-xl bg-white border border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-semibold text-gray-800 text-sm">{w.word}</span>
                <span className="text-xs text-gray-400 ml-2">({w.partOfSpeech})</span>
              </div>
              <p className="text-xs text-gray-500 text-right max-w-[55%] line-clamp-1">{w.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
