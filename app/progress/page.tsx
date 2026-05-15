"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureAnonymousAuth, getRecentSessions, type SessionRecord } from "@/lib/firebase";
import { cn } from "@/lib/cn";

const SCORE_COLORS = [
  "",
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
];

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", SCORE_COLORS[score] ?? SCORE_COLORS[0])}>
      {label} {score}
    </span>
  );
}

function formatDate(ts: SessionRecord["createdAt"]): string {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function TrendArrow({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length < 2) return null;
  const recent = sessions[0].total;
  const prev = sessions[1].total;
  if (recent > prev) return <span className="text-green-600 text-sm font-semibold">↑ Meningkat</span>;
  if (recent < prev) return <span className="text-red-500 text-sm font-semibold">↓ Menurun</span>;
  return <span className="text-gray-400 text-sm">→ Stabil</span>;
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [noFirebase, setNoFirebase] = useState(false);

  useEffect(() => {
    ensureAnonymousAuth().then(async (user) => {
      if (!user) { setNoFirebase(true); setLoading(false); return; }
      const data = await getRecentSessions(user.uid);
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const avgTotal = sessions.length
    ? (sessions.reduce((s, r) => s + r.total, 0) / sessions.length).toFixed(1)
    : null;

  return (
    <main className="flex flex-col gap-6 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Riwayat Latihan</h1>
          <p className="text-xs text-gray-400">{sessions.length} sesi tercatat</p>
        </div>
      </div>

      {/* Summary card */}
      {sessions.length >= 1 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-brand-700">{sessions.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Sesi total</p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-brand-700">{avgTotal}</p>
            <p className="text-xs text-gray-400 mt-0.5">Rata-rata /12</p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm flex flex-col items-center justify-center">
            <TrendArrow sessions={sessions} />
            <p className="text-xs text-gray-400 mt-0.5">Tren terbaru</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4 animate-pulse">
              <div className="h-3 w-48 bg-gray-200 rounded mb-3" />
              <div className="h-2.5 w-full bg-gray-100 rounded mb-2" />
              <div className="flex gap-2 mt-3">
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-5 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Firebase */}
      {noFirebase && !loading && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm text-amber-700">Riwayat membutuhkan koneksi Firebase. Cek konfigurasi di .env.</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !noFirebase && sessions.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Belum ada riwayat</p>
            <p className="text-sm text-gray-400 mt-1">Selesaikan sesi speaking pertamamu untuk melihat perkembanganmu di sini.</p>
          </div>
          <Link
            href="/speaking"
            className="mt-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Mulai Latihan
          </Link>
        </div>
      )}

      {/* Session list */}
      {!loading && sessions.length > 0 && (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-gray-700 leading-snug line-clamp-2 flex-1">{s.promptTopic}</p>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-gray-900">{s.total}<span className="text-xs font-normal text-gray-400">/12</span></p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <ScorePill label="D" score={s.delivery} />
                <ScorePill label="LU" score={s.language_use} />
                <ScorePill label="TD" score={s.topic_development} />
              </div>
              <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
