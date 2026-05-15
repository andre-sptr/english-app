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
    desc: "Rekam & skor TOEFL Speaking dengan AI",
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
    desc: "Tulis esai & dapat feedback Content, Organization, Language",
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
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="font-semibold text-gray-900">EnglishHub SMA</span>
          </div>
          <Link href="/progress" className="text-xs text-gray-400 hover:text-brand-600 transition-colors font-medium py-2 px-1 -mx-1 min-h-[44px] flex items-center">
            Riwayat →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-3 pb-6">
        <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          TOEFL-Aligned AI Scoring
        </div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Persiapan TOEFL<br />
          <span className="text-brand-600">Lengkap dengan AI</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Speaking, Writing, dan Vocabulary dalam satu platform — skor langsung dari AI sesuai rubrik ETS TOEFL.
        </p>
      </section>

      {/* Feature cards */}
      <section className="flex flex-col gap-3 pb-6">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-brand-200 active:scale-98 transition-all group flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${f.color}`}>
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{f.badge}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 pb-6">
        {[
          { value: "0–4", label: "Skala skor" },
          { value: "50+", label: "Kata vocab" },
          { value: "1 fix", label: "Per latihan" },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-brand-700">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="py-6 border-t border-gray-100">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Cara Kerja</h2>
        <div className="flex flex-col gap-4">
          {[
            { step: "1", title: "Pilih modul & soal", desc: "Speaking, Writing, atau review Vocabulary — sesuai yang ingin kamu latih hari ini." },
            { step: "2", title: "Kerjakan tugasnya", desc: "Rekam jawaban speaking, tulis esai, atau review kartu kosakata dengan timer otomatis." },
            { step: "3", title: "Terima skor & feedback AI", desc: "Skor rubrik TOEFL + 1 perbaikan spesifik langsung dari Claude AI setiap sesi." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-gray-400 py-6">Gratis · Tanpa login · Data tersimpan di perangkat</p>
    </main>
  );
}
