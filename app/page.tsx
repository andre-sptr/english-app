import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Clock3, LineChart, Mic2, PenLine, Sparkles, Target } from "lucide-react";
import { IconTile, LinkButton, MetricCard, Pill } from "@/components/ui";

const FEATURES: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  badge: string;
  tone: "brand" | "purple" | "gold";
}[] = [
  {
    href: "/speaking",
    icon: Mic2,
    title: "Speaking Studio",
    desc: "Rekam jawaban, dapatkan transkrip, skor rubrik, dan satu fix spesifik.",
    badge: "3 sesi/hari",
    tone: "brand",
  },
  {
    href: "/writing",
    icon: PenLine,
    title: "Writing Lab",
    desc: "Latihan esai TOEFL dengan timer, word count, dan feedback AI terstruktur.",
    badge: "2 sesi/hari",
    tone: "purple",
  },
  {
    href: "/vocab",
    icon: BookOpen,
    title: "Vocab Review",
    desc: "50 kosakata akademik TOEFL dengan spaced repetition otomatis.",
    badge: "SRS otomatis",
    tone: "gold",
  },
];

const STEPS = [
  { icon: Target, title: "Pilih fokus harian", desc: "Mulai dari Speaking, Writing, atau Vocabulary sesuai target latihan hari ini." },
  { icon: Clock3, title: "Latihan dalam timer", desc: "Kerjakan soal dengan batas waktu yang meniru tekanan ujian TOEFL." },
  { icon: Sparkles, title: "Perbaiki satu hal", desc: "Feedback dibuat ringkas agar kamu tahu perbaikan paling berdampak untuk sesi berikutnya." },
];

export default function Home() {
  return (
    <main className="page-container">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="rounded-[2rem] border border-line bg-white px-6 py-7 shadow-premium sm:px-8 sm:py-9">
          <Pill tone="brand">
            <Sparkles className="h-3.5 w-3.5" />
            TOEFL-Aligned AI Scoring
          </Pill>

          <div className="mt-7 max-w-3xl">
            <h1 className="text-4xl font-black leading-[1.06] tracking-tight text-ink sm:text-5xl xl:text-6xl">
              Studio latihan TOEFL yang terasa serius, cepat, dan personal.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-secondary">
              EnglishHub SMA menyatukan Speaking, Writing, dan Vocabulary dalam dashboard latihan AI yang fokus pada skor rubrik dan perbaikan praktis.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/speaking" variant="brand">
              Mulai Speaking
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/progress" variant="secondary">
              Lihat Progress
              <LineChart className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>

        <div className="grid gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-3xl border border-line bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-premium premium-focus"
              >
                <div className="flex items-start gap-4">
                  <IconTile tone={feature.tone}>
                    <Icon className="h-5 w-5" />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-ink">{feature.title}</h2>
                      <Pill tone="neutral">{feature.badge}</Pill>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-secondary">{feature.desc}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard value="0-4" label="Skala skor" helper="Per dimensi rubrik TOEFL" tone="brand" />
        <MetricCard value="50+" label="Kata vocab" helper="Kosakata akademik prioritas" tone="gold" />
        <MetricCard value="1 fix" label="Per latihan" helper="Satu arahan paling praktis" tone="teal" />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="rounded-3xl border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <IconTile tone={index === 0 ? "brand" : index === 1 ? "teal" : "gold"}>
                  <Icon className="h-5 w-5" />
                </IconTile>
                <span className="font-display text-5xl leading-none text-line">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-black text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-secondary">{step.desc}</p>
            </div>
          );
        })}
      </section>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.18em] text-muted">
        Gratis - tanpa login - data tersimpan di perangkat
      </p>
    </main>
  );
}
