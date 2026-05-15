"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, LineChart, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { ensureAnonymousAuth, getRecentSessions, type SessionRecord } from "@/lib/firebase";
import { Card, EmptyState, IconTile, LinkButton, MetricCard, PageHeader, Pill, SegmentedControl, StatusNote } from "@/components/ui";

type Filter = "all" | "speaking" | "writing";

const SCORE_COLORS = [
  "",
  "bg-red-50 text-red-700",
  "bg-orange-50 text-orange-700",
  "bg-yellow-50 text-yellow-700",
  "bg-green-50 text-green-700",
];

function formatDate(ts: SessionRecord["createdAt"]): string {
  if (!ts) return "";
  const d = ts.toDate();
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    " - " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
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

function Sparkline({ data, max = 12 }: { data: number[]; max?: number }) {
  if (data.length < 2) {
    return <p className="py-4 text-center text-sm font-semibold text-muted">Butuh minimal 2 sesi untuk tampilkan grafik</p>;
  }
  const W = 520, H = 96, PAD = 10;
  const xStep = (W - PAD * 2) / (data.length - 1);
  const yScale = (H - PAD * 2) / max;
  const pts = data.map((v, i) => ({ x: PAD + i * xStep, y: H - PAD - v * yScale }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 96 }}>
      <polyline points={polyline} fill="none" stroke="#1B55D9" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#1B55D9" stroke="#FFFFFF" strokeWidth="2" />
      ))}
      <text x={pts[pts.length - 1].x} y={Math.max(12, pts[pts.length - 1].y - 10)} textAnchor="middle" fontSize="13" fill="#183FAE" fontWeight="800">
        {data[data.length - 1]}
      </text>
    </svg>
  );
}

function avg(arr: number[]): string {
  if (!arr.length) return "-";
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
}

function DimBar({ label, value }: { label: string; value: string }) {
  const num = parseFloat(value);
  return (
    <div className="grid grid-cols-[6rem_1fr_2.5rem] items-center gap-3">
      <p className="truncate text-xs font-bold text-secondary">{label}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-700"
          style={{ width: isNaN(num) ? "0%" : `${(num / 4) * 100}%` }}
        />
      </div>
      <p className="text-right text-xs font-black text-ink">{value}</p>
    </div>
  );
}

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
    { key: "all", label: `Semua (${all.length})` },
    { key: "speaking", label: `Speaking (${spk.length})` },
    { key: "writing", label: `Writing (${wrt.length})` },
  ];

  return (
    <main className="page-container">
      <PageHeader
        backHref="/"
        eyebrow="Progress"
        title="Riwayat & progress"
        description="Pantau tren skor, dimensi terkuat, dan sesi terbaru dari latihan Speaking dan Writing."
        actions={
          <LinkButton href="/profile" variant="secondary">
            Profil
            <UserRound className="h-4 w-4" />
          </LinkButton>
        }
      />

      {loading && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl border border-line bg-white shadow-soft" />
          ))}
        </div>
      )}

      {noFirebase && !loading && (
        <div className="mt-6">
          <StatusNote tone="gold">Riwayat membutuhkan Firebase. Cek konfigurasi .env.</StatusNote>
        </div>
      )}

      {!loading && !noFirebase && all.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Belum ada riwayat"
            description="Selesaikan sesi pertamamu untuk melihat tren skor dan dimensi latihan."
            action={<LinkButton href="/speaking" variant="brand">Mulai Speaking</LinkButton>}
          />
        </div>
      )}

      {!loading && all.length > 0 && (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetricCard value={all.length} label="Sesi total" tone="brand" />
            <MetricCard value={avgTotal ?? "-"} label="Rata-rata /12" tone="teal" />
            <MetricCard value={streak} label="Hari beruntun" tone="gold" />
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Tren Skor</p>
                  <p className="mt-1 text-sm text-secondary">Sesi terbaru berada di sisi kanan.</p>
                </div>
                <IconTile tone="brand"><LineChart className="h-5 w-5" /></IconTile>
              </div>
              <Sparkline data={[...sessions].reverse().slice(-10).map((s) => s.total)} />
              <div className="mt-2 flex justify-between text-xs font-bold text-muted">
                <span>0</span>
                <span>/ 12</span>
              </div>
            </Card>

            <Card>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Rata-rata Dimensi</p>
              <div className="mt-4 flex flex-col gap-5">
                {spk.length > 0 && (
                  <div>
                    <Pill tone="brand">Speaking</Pill>
                    <div className="mt-3 flex flex-col gap-3">
                      <DimBar label="Delivery" value={avg(spk.map((s) => s.delivery))} />
                      <DimBar label="Language" value={avg(spk.map((s) => s.language_use))} />
                      <DimBar label="Topic Dev." value={avg(spk.map((s) => s.topic_development))} />
                    </div>
                  </div>
                )}
                {wrt.length > 0 && (
                  <div>
                    <Pill tone="purple">Writing</Pill>
                    <div className="mt-3 flex flex-col gap-3">
                      <DimBar label="Content" value={avg(wrt.map((s) => s.topic_development))} />
                      <DimBar label="Org." value={avg(wrt.map((s) => s.delivery))} />
                      <DimBar label="Language" value={avg(wrt.map((s) => s.language_use))} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedControl items={FILTER_TABS} value={filter} onChange={setFilter} />
            <p className="text-sm font-semibold text-muted">{sessions.length} sesi ditampilkan</p>
          </section>

          <section className="mt-4 grid gap-3 lg:grid-cols-2">
            {sessions.length === 0 && (
              <p className="py-4 text-center text-sm font-semibold text-muted lg:col-span-2">Belum ada sesi {filter} yang tercatat.</p>
            )}
            {sessions.map((s) => {
              const isSpeaking = s.type === "speaking";
              const dims = isSpeaking
                ? [
                    { label: "D", score: s.delivery },
                    { label: "LU", score: s.language_use },
                    { label: "TD", score: s.topic_development },
                  ]
                : [
                    { label: "C", score: s.topic_development },
                    { label: "Org", score: s.delivery },
                    { label: "LU", score: s.language_use },
                  ];
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Pill tone={isSpeaking ? "brand" : "purple"}>{isSpeaking ? "Speaking" : "Writing"}</Pill>
                        <span className="text-xs font-semibold text-muted">{formatDate(s.createdAt)}</span>
                      </div>
                      <p className="line-clamp-2 text-sm font-semibold leading-6 text-ink">{s.promptTopic}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-ink">
                        {s.total}<span className="text-xs font-bold text-muted">/12</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {dims.map(({ label, score }) => (
                      <span key={label} className={cn("rounded-full px-2 py-1 text-xs font-black", SCORE_COLORS[score] ?? "")}>
                        {label} {score}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
