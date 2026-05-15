"use client";

import { useState } from "react";
import Link from "next/link";
import { WRITING_PROMPTS } from "@/lib/writing-prompts";

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

export default function WritingPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = filter === "all"
    ? WRITING_PROMPTS
    : WRITING_PROMPTS.filter((p) => p.type === filter);

  return (
    <main className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Pilih Soal Writing</h1>
          <p className="text-xs text-gray-500">Gratis 2 sesi per hari</p>
        </div>
      </div>

      <div className="flex gap-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === key
                ? "bg-brand-600 text-white border-brand-600"
                : "border-gray-200 text-gray-600 bg-white hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((prompt) => {
          const { label, color } = TYPE_LABELS[prompt.type];
          return (
            <Link
              key={prompt.id}
              href={`/writing/${prompt.id}`}
              className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-brand-200 active:scale-99 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {prompt.minuteLimit} menit · target {prompt.targetWords}+ kata
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {prompt.topic}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-brand-50 group-hover:border-brand-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
