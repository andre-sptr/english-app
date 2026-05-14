"use client";

import { cn } from "@/lib/cn";
import type { RubricScores } from "@/types";

interface Props {
  feedback: string;
  scores: RubricScores | null;
  streaming: boolean;
}

const DIMENSION_LABELS: Record<keyof RubricScores, string> = {
  delivery:          "Delivery",
  language_use:      "Language Use",
  topic_development: "Topic Development",
};

const SCORE_COLORS = [
  "",           // 0 - no color
  "bg-red-100 text-red-700 border-red-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-green-100 text-green-700 border-green-200",
];

const SCORE_BAR_COLORS = [
  "",
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-500",
];

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className={cn(
      "w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold shrink-0",
      SCORE_COLORS[score] ?? SCORE_COLORS[0]
    )}>
      {score}
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <ScoreBadge score={score} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", SCORE_BAR_COLORS[score])}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-gray-400 shrink-0">/ 4</span>
    </div>
  );
}

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
  const avg = total !== null ? (total / 12 * 30).toFixed(0) : null; // rough TOEFL band estimate

  return (
    <div className="flex flex-col gap-4">
      {/* Feedback text */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Feedback AI</p>
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {body}
          {streaming && !scores && (
            <span className="inline-block w-0.5 h-4 bg-brand-500 animate-pulse ml-0.5 align-middle" />
          )}
        </p>

        {fix && (
          <div className="mt-3 flex gap-2 bg-brand-50 border border-brand-100 rounded-xl p-3">
            <span className="text-brand-600 shrink-0 font-bold text-sm">ONE FIX</span>
            <p className="text-sm text-brand-800">{fix}</p>
          </div>
        )}
      </div>

      {/* Scores */}
      {scores && (
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Skor TOEFL</p>
            {avg && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Estimasi band</p>
                <p className="text-lg font-bold text-brand-700">{avg}+</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {(Object.keys(DIMENSION_LABELS) as (keyof RubricScores)[]).map((dim) => (
              <ScoreRow key={dim} label={DIMENSION_LABELS[dim]} score={scores[dim]} />
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Total skor (max 12)</span>
            <span className="text-xl font-bold text-gray-800">{total} / 12</span>
          </div>
        </div>
      )}

      {/* Loading skeleton for scores */}
      {streaming && !scores && (
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm animate-pulse">
          <div className="h-3 w-32 bg-gray-200 rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200" />
              <div className="flex-1">
                <div className="h-2.5 w-28 bg-gray-200 rounded mb-2" />
                <div className="h-2 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
