"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Layers3, Repeat2 } from "lucide-react";
import { IconTile, LinkButton, MetricCard, PageHeader, Pill } from "@/components/ui";
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
    <main className="page-container">
      <PageHeader
        backHref="/"
        eyebrow="Vocab Review"
        title="Vocabulary TOEFL"
        description={`${VOCAB_WORDS.length} kata akademik penting dengan spaced repetition sederhana agar review terasa ringan dan konsisten.`}
        actions={<Pill tone="gold">SRS otomatis</Pill>}
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard value={dueCount} label="Harus review" helper="Kartu yang jatuh tempo hari ini" tone="brand" />
        <MetricCard value={masteredCount} label="Dikuasai" helper="Benar berulang dengan interval" tone="teal" />
        <MetricCard value={`${progressPct}%`} label="Progress" helper={`${masteredCount}/${VOCAB_WORDS.length} kata`} tone="gold" />
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Penguasaan Kosakata</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">Kata dikuasai setelah benar beberapa kali dengan interval review yang semakin panjang.</p>
          </div>
          <Pill tone="neutral">{masteredCount}/{VOCAB_WORDS.length}</Pill>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </section>

      <section className="mt-6">
        {dueCount > 0 ? (
          <LinkButton href="/vocab/review" variant="primary" className="w-full sm:w-auto">
            <Repeat2 className="h-4 w-4" />
            Review {dueCount} kata sekarang
          </LinkButton>
        ) : (
          <div className="rounded-3xl border border-green-100 bg-green-50 p-5 text-green-700 shadow-soft">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-extrabold">Semua kata sudah di-review.</p>
                <p className="mt-1 text-sm leading-relaxed">Kembali lagi nanti untuk jadwal review berikutnya.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Semua Kata</p>
            <p className="mt-1 text-sm text-secondary">Preview cepat sebelum masuk ke mode review.</p>
          </div>
          <IconTile tone="gold">
            <Layers3 className="h-5 w-5" />
          </IconTile>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {VOCAB_WORDS.map((w) => (
            <div key={w.id} className="rounded-2xl border border-line bg-white px-4 py-3 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-ink">{w.word}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{w.partOfSpeech}</p>
                </div>
                <p className="max-w-[58%] text-right text-xs leading-6 text-secondary line-clamp-2">{w.definition}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
