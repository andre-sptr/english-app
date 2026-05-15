"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, RotateCcw } from "lucide-react";
import { Button, IconTile, LinkButton, PageHeader, Pill } from "@/components/ui";
import { VOCAB_WORDS, VOCAB_IDS } from "@/lib/vocab-words";
import { loadCards, saveCards, getDueCards, scheduleCard, getOrCreateCard } from "@/lib/srs";
import type { VocabWord, SRSRating } from "@/types";

type ReviewPhase = "front" | "back" | "done";

const RATING_LABELS: { rating: SRSRating; label: string; className: string }[] = [
  { rating: 1, label: "Lupa", className: "border-red-100 bg-red-50 text-red-700 hover:bg-red-100" },
  { rating: 2, label: "Susah", className: "border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100" },
  { rating: 3, label: "Ingat", className: "border-yellow-100 bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
  { rating: 4, label: "Mudah", className: "border-green-100 bg-green-50 text-green-700 hover:bg-green-100" },
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
    setQueue(due.sort(() => Math.random() - 0.5));
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
      <main className="page-container">
        <div className="h-28 animate-pulse rounded-3xl border border-line bg-white shadow-soft" />
      </main>
    );
  }

  if (queue.length === 0 || phase === "done") {
    return (
      <main className="page-container">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-[2rem] border border-line bg-white p-8 text-center shadow-premium">
          <IconTile tone="teal" className="h-16 w-16">
            <CheckCircle2 className="h-8 w-8" />
          </IconTile>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-ink">Review selesai</h1>
            <p className="mt-2 text-sm leading-7 text-secondary">
              {reviewedCount > 0 ? `Kamu mereview ${reviewedCount} kata.` : "Tidak ada kata yang harus direview sekarang."}
            </p>
          </div>
          <LinkButton href="/vocab" variant="primary">Kembali ke Vocab</LinkButton>
        </div>
      </main>
    );
  }

  const progress = Math.round((currentIdx / queue.length) * 100);

  return (
    <main className="page-container">
      <PageHeader
        backHref="/vocab"
        eyebrow="Review Session"
        title="Flashcard vocabulary"
        description="Buka arti, nilai ingatanmu, lalu biarkan jadwal review berikutnya disesuaikan otomatis."
        actions={<Pill tone="neutral">{currentIdx + 1} / {queue.length}</Pill>}
      />

      <div className="mt-6 rounded-full bg-white p-1 shadow-soft">
        <div className="h-2 rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {currentWord && (
        <section className="mx-auto mt-6 max-w-3xl">
          <div className="rounded-[2rem] border border-line bg-white p-8 text-center shadow-premium sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">{currentWord.partOfSpeech}</p>
            <p className="mt-4 font-display text-6xl leading-none text-ink sm:text-7xl">{currentWord.word}</p>
          </div>

          {phase === "front" ? (
            <Button onClick={() => setPhase("back")} variant="secondary" className="mt-4 w-full text-base">
              <Eye className="h-5 w-5" />
              Lihat Arti
            </Button>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <div className="rounded-3xl border border-brand-100 bg-brand-50 p-5">
                <p className="text-base font-extrabold text-brand-900">{currentWord.definition}</p>
                <p className="mt-3 text-sm italic leading-7 text-brand-700">"{currentWord.example}"</p>
              </div>

              <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-muted">Seberapa ingat kamu?</p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATING_LABELS.map(({ rating, label, className }) => (
                  <button
                    key={rating}
                    onClick={() => handleRate(rating)}
                    className={`min-h-[48px] rounded-2xl border px-3 text-sm font-extrabold transition-colors premium-focus ${className}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link href="/vocab" className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-muted hover:text-ink premium-focus">
            <RotateCcw className="h-4 w-4" />
            Keluar dari review
          </Link>
        </section>
      )}
    </main>
  );
}
