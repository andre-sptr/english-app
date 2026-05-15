import { cn } from "@/lib/cn";

const SCORE_STYLES = [
  "",
  "border-red-200 bg-red-50 text-red-700",
  "border-orange-200 bg-orange-50 text-orange-700",
  "border-yellow-200 bg-yellow-50 text-yellow-700",
  "border-green-200 bg-green-50 text-green-700",
];

const BAR_STYLES = [
  "",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
];

export function ScoreBadge({ score }: { score: number }) {
  return (
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg font-black", SCORE_STYLES[score] ?? SCORE_STYLES[0])}>
      {score}
    </div>
  );
}

export default function ScoreMeter({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <ScoreBadge score={score} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-bold text-ink">{label}</p>
          <span className="text-xs font-bold text-muted">/ 4</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn("h-full rounded-full transition-all duration-700", BAR_STYLES[score] ?? BAR_STYLES[0])}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
