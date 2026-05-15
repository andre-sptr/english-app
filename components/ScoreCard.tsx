"use client";

import { Sparkles } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import ScoreMeter from "@/components/ScoreMeter";
import type { RubricScores } from "@/types";

interface Props {
  feedback: string;
  scores: RubricScores | null;
  streaming: boolean;
}

const DIMENSION_LABELS: Record<keyof RubricScores, string> = {
  delivery: "Delivery",
  language_use: "Language Use",
  topic_development: "Topic Development",
};

function parseFeedbackAndFix(raw: string): { body: string; fix: string } {
  const fixIdx = raw.indexOf("ONE FIX:");
  if (fixIdx === -1) return { body: raw.trim(), fix: "" };
  const body = raw.slice(0, fixIdx).trim();
  const fix = raw.slice(fixIdx + "ONE FIX:".length).replace(/^\s*/, "").split("\n")[0].trim();
  return { body, fix };
}

export default function ScoreCard({ feedback, scores, streaming }: Props) {
  const { body, fix } = parseFeedbackAndFix(feedback);
  const total = scores
    ? scores.delivery + scores.language_use + scores.topic_development
    : null;
  const avg = total !== null ? (total / 12 * 30).toFixed(0) : null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Feedback AI</p>
            <p className="mt-1 text-sm font-semibold text-secondary">Rubrik TOEFL dengan satu arahan paling penting.</p>
          </div>
          <Pill tone="brand">
            <Sparkles className="h-3.5 w-3.5" />
            Live
          </Pill>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
          {body}
          {streaming && !scores && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-500 align-middle" />
          )}
        </p>

        {fix && (
          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">One Fix</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-900">{fix}</p>
          </div>
        )}
      </Card>

      {scores && (
        <Card>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Skor TOEFL</p>
              <p className="mt-1 text-sm text-secondary">Estimasi performa dari 3 dimensi utama.</p>
            </div>
            {avg && (
              <div className="text-right">
                <p className="text-xs font-bold text-muted">Band</p>
                <p className="font-display text-4xl leading-none text-brand-700">{avg}+</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {(Object.keys(DIMENSION_LABELS) as (keyof RubricScores)[]).map((dim) => (
              <ScoreMeter key={dim} label={DIMENSION_LABELS[dim]} score={scores[dim]} />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Total</span>
            <span className="text-2xl font-black text-ink">{total} / 12</span>
          </div>
        </Card>
      )}

      {streaming && !scores && (
        <Card className="animate-pulse">
          <div className="mb-5 h-3 w-36 rounded-full bg-surface-2" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 flex items-center gap-3 last:mb-0">
              <div className="h-11 w-11 rounded-2xl bg-surface-2" />
              <div className="flex-1">
                <div className="mb-2 h-3 w-32 rounded-full bg-surface-2" />
                <div className="h-2.5 rounded-full bg-surface-2" />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
