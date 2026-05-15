"use client";

import { useState } from "react";
import Link from "next/link";
import { SPEAKING_PROMPTS } from "@/lib/prompts";

type Filter = "all" | "independent" | "integrated";

const TYPE_LABELS = {
  independent: { label: "Independent", color: "bg-brand-50 text-brand-700 border-brand-100" },
  integrated:  { label: "Integrated",  color: "bg-purple-50 text-purple-700 border-purple-100" },
};

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all",         label: "Semua" },
  { key: "independent", label: "Independent" },
  { key: "integrated",  label: "Integrated" },
];

export default function SpeakingPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = filter === "all"
    ? SPEAKING_PROMPTS
    : SPEAKING_PROMPTS.filter((p) => p.type === filter);

  return (
    <main className="flex flex-col gap-6 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-2xl leading-tight text-ink">Pilih Soal Speaking</h1>
          <p className="text-xs text-muted">Gratis 3 sesi per hari</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === key
                ? "bg-brand-600 text-white border-brand-600"
                : "border-subtle text-secondary bg-surface hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3">
        {visible.map((prompt) => {
          const { label, color } = TYPE_LABELS[prompt.type];
          return (
            <Link
              key={prompt.id}
              href={`/speaking/${prompt.id}`}
              className="rounded-2xl bg-surface border border-subtle p-5 shadow-sm hover:shadow-md hover:border-brand-200 active:scale-[0.99] transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
                      {label}
                    </span>
                    <span className="text-xs text-muted">
                      {prompt.speakSeconds}s
                    </span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed line-clamp-3">
                    {prompt.topic}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-subtle flex items-center justify-center shrink-0 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                  <svg className="w-4 h-4 text-muted group-hover:text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
