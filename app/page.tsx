import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="pt-10 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="font-semibold text-gray-900">EnglishHub SMA</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center gap-8 py-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            TOEFL-Aligned AI Scoring
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Latihan TOEFL Speaking<br />
            <span className="text-brand-600">dengan Feedback AI</span>
          </h1>

          <p className="text-gray-500 text-base leading-relaxed">
            Rekam jawaban Speaking kamu, langsung dapat skor{" "}
            <strong className="text-gray-700">Delivery, Language Use,</strong> dan{" "}
            <strong className="text-gray-700">Topic Development</strong> sesuai rubrik
            ETS TOEFL — plus satu perbaikan spesifik setiap sesi.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "45 dtk", label: "Per sesi" },
            { value: "0–4", label: "Skala skor" },
            { value: "1 fix", label: "Per latihan" },
          ].map(({ value, label }) => (
            <div
              key={value}
              className="rounded-xl bg-white border border-gray-200 p-3 text-center shadow-sm"
            >
              <p className="text-xl font-bold text-brand-700">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/speaking"
            className="block w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all text-white text-center text-lg font-semibold shadow-lg"
          >
            Mulai Latihan Speaking
          </Link>
          <Link
            href="/progress"
            className="block w-full py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 text-center text-sm font-medium"
          >
            Lihat Riwayat Latihan
          </Link>
          <p className="text-center text-xs text-gray-400">
            Gratis · 3 sesi/hari · Tanpa login
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-5">
          Cara Kerja
        </h2>
        <div className="flex flex-col gap-4">
          {[
            {
              step: "1",
              title: "Pilih soal TOEFL",
              desc: "Independent atau Integrated task, dengan waktu persiapan 15 detik.",
            },
            {
              step: "2",
              title: "Rekam jawabanmu",
              desc: "Berbicara dalam bahasa Inggris selama 45 detik. AI mendengarkan dan mentranskrip.",
            },
            {
              step: "3",
              title: "Terima skor & feedback",
              desc: "Skor Delivery, Language Use, Topic Development + 1 perbaikan spesifik untuk sesi berikutnya.",
            },
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
    </main>
  );
}
