"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Mic2, SlidersHorizontal } from "lucide-react";
import { IconTile, PageHeader, Pill, SegmentedControl } from "@/components/ui";
import { SPEAKING_PROMPTS } from "@/lib/prompts";

type Filter = "all" | "independent" | "integrated";

const TYPE_LABELS = {
  independent: { label: "Independent", tone: "brand" as const },
  integrated: { label: "Integrated", tone: "purple" as const },
};

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "independent", label: "Independent" },
  { key: "integrated", label: "Integrated" },
];

export default function SpeakingPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = filter === "all"
    ? SPEAKING_PROMPTS
    : SPEAKING_PROMPTS.filter((p) => p.type === filter);

  return (
    <main className="page-container">
      <PageHeader
        backHref="/"
        eyebrow="Speaking Studio"
        title="Pilih soal speaking"
        description="Pilih prompt, gunakan prep time, lalu rekam jawaban untuk mendapatkan skor TOEFL dan feedback AI."
        actions={<Pill tone="brand">Gratis 3 sesi per hari</Pill>}
      />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl items={FILTER_TABS} value={filter} onChange={setFilter} />
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          <SlidersHorizontal className="h-4 w-4" />
          {visible.length} soal tersedia
        </p>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {visible.map((prompt) => {
          const { label, tone } = TYPE_LABELS[prompt.type];
          return (
            <Link
              key={prompt.id}
              href={`/speaking/${prompt.id}`}
              className="group rounded-3xl border border-line bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-premium premium-focus"
            >
              <div className="flex items-start gap-4">
                <IconTile tone={tone === "brand" ? "brand" : "purple"}>
                  <Mic2 className="h-5 w-5" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={tone}>{label}</Pill>
                    <Pill tone="neutral">
                      <Clock3 className="h-3.5 w-3.5" />
                      {prompt.prepSeconds}s prep / {prompt.speakSeconds}s speak
                    </Pill>
                  </div>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink">{prompt.topic}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
