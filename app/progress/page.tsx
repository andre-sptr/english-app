"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureAnonymousAuth, getRecentSessions, type SessionRecord } from "@/lib/firebase";
import { cn } from "@/lib/cn";

type Filter = "all" | "speaking" | "writing";

// ── helpers ──────────────────────────────────────────────────────────────────

const SCORE_COLORS = [
  "",
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
];

function formatDate(ts: SessionRecord["createdAt"]): string {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function calculateStreak(sessions: SessionRecord[]): number {
  const dates = new Set(
    sessions
      .filter((s) => s.createdAt)
      .map((s) => s.createdAt!.toDate().toISOString().slice(0, 10))
  );
  let streak = 0;
  const check = new Date();
  while (true) {
    const key = check.toISOString().slice(0, 10);
    if (dates.has(key)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ── Sparkline (SVG) ───────────────────────────────────────────────────────────

function Sparkline({ data, max = 12 }: { data: number[]; max?: number }) {
  if (data.length < 2) return <p className="text-xs text-gray-400 text-center py-3">Butuh ≥2 sesi untuk tampilkan grafik</p>;
  const W = 280, H = 56, PAD = 6;
  const xStep = (W - PAD * 2) / (data.length - 1);
  const yScale = (H - PAD * 2) / max;
  const pts = data.map((v, i) => ({ x: PAD + i * xStep, y: H - PAD - v * yScale }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }}>
      <polyline points={polyline} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#2563eb" />
      ))}
      <text x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 8} textAnchor="middle" fontSize="10" fill="#2563eb" fontWeight="600">
        {data[data.length - 1]}
      </text>
    </svg>
  );
}

// ── Dimension averages ────────────────────────────────────────────────────────

function avg(arr: number[]): string {
  if (!arr.length) return "—";
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}

function DimBar({ label, value }: { label: string; value: string }) {
  const num = parseFloat(value);
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-gray-500 w-24 shrink-0">{label}</p>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-400 transition-all duration-700"
          style={{ width: isNaN(num) ? "0%" : `${(num / 4) * 100}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-gray-700 w-8 text-right">{value}</p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [all, setAll] = useState<SessionRecord[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [noFirebase, setNoFirebase] = useState(false);

  useEffect(() => {
    ensureAnonymousAuth().then(async (user) => {
      if (!user) { setNoFirebase(true); setLoading(false); return; }
      const data = await getRecentSessions(user.uid, 50);
      setAll(data);
      setLoading(false);
    });
  }, []);

  const sessions = filter === "all" ? all : all.filter((s) => s.type === filter);

  const streak = calculateStreak(all);
  const avgTotal = sessions.length
    ? (sessions.reduce((s, r) => s + r.total, 0) / sessions.length).toFixed(1)
    : null;

  const spk = all.filter((s) => s.type === "speaking");
  const wrt = all.filter((s) => s.type === "writing");

  const FILTER_TABS: { key: Filter; label: string }[] = [
    { key: "all",      label: `Semua (${all.length})` },
    { key: "speaking", label: `Speaking (${spk.length})` },
    { key: "writing",  label: `Writing (${wrt.length})` },
  ];

  return (
    <main className="flex flex-col gap-5 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-lg">Riwayat & Progress</h1>
          <p className="text-xs text-gray-500">{all.length} sesi tercatat</p>
        </div>
        <Link href="/profile" className="text-xs text-brand-600 font-medium hover:text-brand-700 py-2 px-1 -mx-1 min-h-[44px] flex items-center">
          Profil →
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4 animate-pulse h-20" />
          ))}
        </div>
      )}

      {noFirebase && !loading && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm text-amber-700">Riwayat membutuhkan Firebase. Cek konfigurasi .env.</p>
        </div>
      )}

      {!loading && !noFirebase && all.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Belum ada riwayat</p>
            <p className="text-sm text-gray-400 mt-1">Selesaikan sesi pertamamu untuk melihat perkembanganmu.</p>
          </div>
          <Link href="/speaking" className="mt-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
            Mulai Speaking
          </Link>
        </div>
      )}

      {!loading && all.length > 0 && (
        <>
          {/* Top stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-brand-700">{all.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Sesi total</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-brand-700">{avgTotal ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Rata-rata /12</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-brand-700">{streak}</p>
              <p className="text-xs text-gray-400 mt-0.5">Hari beruntun</p>
            </div>
          </div>

          {/* Score trend chart */}
          {sessions.length >= 2 && (
            <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tren Skor (terbaru di kanan)</p>
              <Sparkline data={[...sessions].reverse().slice(-10).map((s) => s.total)} />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>/ 12</span>
              </div>
            </div>
          )}

          {/* Dimension averages */}
          <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rata-rata per Dimensi</p>
            {spk.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-brand-600 mb-2">Speaking</p>
                <div className="flex flex-col gap-2">
                  <DimBar label="Delivery" value={avg(spk.map((s) => s.delivery))} />
                  <DimBar label="Language Use" value={avg(spk.map((s) => s.language_use))} />
                  <DimBar label="Topic Dev." value={avg(spk.map((s) => s.topic_development))} />
                </div>
              </div>
            )}
            {wrt.length > 0 && (
              <div>
                <p className="text-xs font-medium text-purple-600 mb-2">Writing</p>
                <div className="flex flex-col gap-2">
                  <DimBar label="Content" value={avg(wrt.map((s) => s.topic_development))} />
                  <DimBar label="Organization" value={avg(wrt.map((s) => s.delivery))} />
                  <DimBar label="Language Use" value={avg(wrt.map((s) => s.language_use))} />
                </div>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  filter === key
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-gray-200 text-gray-600 bg-white hover:border-brand-200"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Session list */}
          <div className="flex flex-col gap-3">
            {sessions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada sesi {filter} yang tercatat.</p>
            )}
            {sessions.map((s) => {
              const isSpeaking = s.type === "speaking";
              const dims = isSpeaking
                ? [
                    { label: "D",  score: s.delivery },
                    { label: "LU", score: s.language_use },
                    { label: "TD", score: s.topic_development },
                  ]
                : [
                    { label: "C",  score: s.topic_development },
                    { label: "Org", score: s.delivery },
                    { label: "LU", score: s.language_use },
                  ];
              return (
                <div key={s.id} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full border",
                          isSpeaking ? "bg-brand-50 text-brand-700 border-brand-100" : "bg-purple-50 text-purple-700 border-purple-100"
                        )}>
                          {isSpeaking ? "Speaking" : "Writing"}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-1">{s.promptTopic}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-gray-900">
                        {s.total}<span className="text-xs font-normal text-gray-400">/12</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {dims.map(({ label, score }) => (
                      <span key={label} className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", SCORE_COLORS[score] ?? "")}>
                        {label} {score}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
