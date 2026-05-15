"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { VOCAB_WORDS, VOCAB_IDS } from "@/lib/vocab-words";
import { loadCards, saveCards, getDueCards, scheduleCard, getOrCreateCard } from "@/lib/srs";
import type { VocabWord, SRSRating } from "@/types";

type ReviewPhase = "front" | "back" | "done";

const RATING_LABELS: { rating: SRSRating; label: string; color: string }[] = [
  { rating: 1, label: "Lupa",  color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" },
  { rating: 2, label: "Susah", color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" },
  { rating: 3, label: "Ingat", color: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200" },
  { rating: 4, label: "Mudah", color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" },
];

export default function VocabReviewPage() {
  const [queue, setQueue] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<ReviewPhase>("front");
  const [reviewedCount, setReviewedCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cards = loadCards();
    const due = getDueCards(cards, VOCAB_IDS);
    setQueue(due.sort(() => Math.random() - 0.5)); // shuffle
    setLoaded(true);
  }, []);

  const currentWordId = queue[currentIdx];
  const currentWord: VocabWord | undefined = VOCAB_WORDS.find((w) => w.id === currentWordId);

  const handleRate = useCallback((rating: SRSRating) => {
    const cards = loadCards();
    const card = getOrCreateCard(cards, currentWordId);
    const updated = scheduleCard(card, rating);
    cards[currentWordId] = updated;
    saveCards(cards);
    setReviewedCount((c) => c + 1);

    const next = currentIdx + 1;
    if (next >= queue.length) {
      setPhase("done");
    } else {
      setCurrentIdx(next);
      setPhase("front");
    }
  }, [currentWordId, currentIdx, queue.length]);

  if (!loaded) {
    return (
    <main className="flex flex-col gap-6 pt-8">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </main>
    );
  }

  if (queue.length === 0 || phase === "done") {
    return (
      <main className="flex flex-col gap-6 pt-8 items-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-display text-2xl text-ink">Review Selesai!</p>
          <p className="text-sm text-gray-500 mt-1">
            {reviewedCount > 0 ? `Kamu mereview ${reviewedCount} kata.` : "Tidak ada kata yang harus direview sekarang."}
          </p>
        </div>
        <Link
          href="/vocab"
          className="px-8 py-3 rounded-2xl bg-ink hover:bg-ink/90 text-white font-semibold transition-colors"
        >
          Kembali ke Vocab
        </Link>
      </main>
    );
  }

  const progress = Math.round((currentIdx / queue.length) * 100);

  return (
    <main className="flex flex-col gap-5 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/vocab" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-400">{currentIdx + 1} / {queue.length}</p>
            <p className="text-xs text-gray-400">{reviewedCount} direview</p>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      {currentWord && (
        <div className="flex flex-col gap-4">
          {/* Front */}
          <div className="rounded-3xl bg-surface border border-subtle shadow-sm p-8 min-h-[200px] flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              {currentWord.partOfSpeech}
            </p>
            <p className="font-display text-5xl text-ink text-center">{currentWord.word}</p>
          </div>

          {/* Reveal button / Back */}
          {phase === "front" ? (
            <button
              onClick={() => setPhase("back")}
              className="w-full py-4 rounded-2xl border-2 border-brand-200 text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors"
            >
              Lihat Arti
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
                <p className="text-sm font-semibold text-brand-800 mb-1">{currentWord.definition}</p>
                <p className="text-xs text-brand-600 italic">"{currentWord.example}"</p>
              </div>

              <p className="text-xs text-center text-gray-400 font-medium">Seberapa ingat kamu?</p>

              <div className="grid grid-cols-4 gap-2">
                {RATING_LABELS.map(({ rating, label, color }) => (
                  <button
                    key={rating}
                    onClick={() => handleRate(rating)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
