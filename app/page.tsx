import Link from "next/link";

const FEATURES = [
  {
    href: "/speaking",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Speaking",
    desc: "Rekam dan skor TOEFL Speaking dengan AI",
    badge: "3 sesi/hari",
    color: "bg-brand-50 text-brand-600 border-brand-100",
  },
  {
    href: "/writing",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: "Writing",
    desc: "Tulis esai dan dapat feedback Content, Organization, Language",
    badge: "2 sesi/hari",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    href: "/vocab",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Vocabulary",
    desc: "50 kata TOEFL akademik dengan spaced repetition",
    badge: "SRS otomatis",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-base font-bold text-ink">EnglishHub SMA</span>
          </div>
          <Link
            href="/progress"
            className="rounded-full border border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-brand-200 hover:text-brand-600"
          >
            Riwayat
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-4 pb-8">
        <h1 className="font-display text-4xl font-normal leading-[1.15] text-ink">
          Persiapan TOEFL{" "}
          <br />
          Lengkap dengan AI
        </h1>
        <div className="h-0.5 w-10 rounded-full bg-brand-600" />
        <p className="text-[15px] leading-relaxed text-secondary">
          Speaking, Writing, dan Vocabulary dalam satu platform - skor langsung dari AI sesuai rubrik ETS TOEFL.
        </p>
      </section>

      <section className="flex flex-col gap-4 pb-8">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group flex items-center gap-4 rounded-2xl border border-subtle bg-surface p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md active:scale-[0.98]"
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${feature.color}`}>
              {feature.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-display text-[21px] leading-none text-ink">{feature.title}</p>
                <span className="rounded-full border border-subtle bg-surface-2 px-2 py-0.5 text-xs text-muted">
                  {feature.badge}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-secondary">{feature.desc}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-muted/60 transition-colors group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-3 gap-3 pb-6">
        {[
          { value: "0-4", label: "Skala skor" },
          { value: "50+", label: "Kata vocab" },
          { value: "1 fix", label: "Per latihan" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl border border-subtle bg-surface p-3 text-center shadow-sm">
            <p className="font-display text-4xl leading-none text-ink">{value}</p>
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-subtle py-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Cara Kerja</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: "1", title: "Pilih modul dan soal", desc: "Speaking, Writing, atau review Vocabulary sesuai yang ingin kamu latih hari ini." },
            { step: "2", title: "Kerjakan tugasnya", desc: "Rekam jawaban speaking, tulis esai, atau review kartu kosakata dengan timer otomatis." },
            { step: "3", title: "Terima skor dan feedback AI", desc: "Skor rubrik TOEFL plus 1 perbaikan spesifik langsung dari Claude AI setiap sesi." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-secondary">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="py-6 text-center text-xs font-medium text-ink">
        Gratis. Tanpa login. Data tersimpan di perangkat.
      </p>
    </main>
  );
}
