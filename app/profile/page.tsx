"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, Cloud, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { auth, ensureAnonymousAuth, signInWithEmail } from "@/lib/firebase";
import EmailUpgradeSheet from "@/components/EmailUpgradeSheet";
import type { User } from "firebase/auth";
import { Button, Card, LinkButton, PageHeader, Pill, StatusNote } from "@/components/ui";

type PageState = "loading" | "ready";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [showSignIn, setShowSignIn] = useState(false);
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siLoading, setSiLoading] = useState(false);
  const [siError, setSiError] = useState("");
  const [siSuccess, setSiSuccess] = useState(false);

  useEffect(() => {
    ensureAnonymousAuth().then((u) => {
      setUser(u);
      setPageState("ready");
    });

    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiLoading(true);
    setSiError("");
    const result = await signInWithEmail(siEmail, siPassword);
    if (result.success) {
      setSiSuccess(true);
      setShowSignIn(false);
    } else {
      setSiError("Password salah atau akun tidak ditemukan.");
    }
    setSiLoading(false);
  };

  if (pageState === "loading") {
    return (
      <main className="page-container">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="h-72 animate-pulse rounded-3xl border border-line bg-white shadow-soft" />
          <div className="h-72 animate-pulse rounded-3xl border border-line bg-white shadow-soft" />
        </div>
      </main>
    );
  }

  const isAnonymous = user?.isAnonymous ?? true;

  return (
    <main className="page-container">
      <PageHeader
        backHref="/progress"
        eyebrow="Account"
        title="Profil"
        description="Kelola status akun dan opsi sinkronisasi progres latihan."
        actions={<Pill tone={isAnonymous ? "gold" : "green"}>{isAnonymous ? "Belum terdaftar" : "Terdaftar"}</Pill>}
      />

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-brand-100 bg-brand-50 text-brand-600">
              <UserRound className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Status Akun</p>
              <h2 className="mt-2 truncate text-2xl font-black text-ink">
                {isAnonymous ? "Pengguna Anonim" : user?.email}
              </h2>
              <p className="mt-2 text-sm leading-7 text-secondary">
                {isAnonymous
                  ? "Progresmu tersimpan di perangkat ini. Daftarkan email agar progres tetap aman saat ganti perangkat."
                  : "Progresmu tersimpan di cloud dan bisa diakses dari perangkat mana pun dengan login email yang sama."}
              </p>
            </div>
          </div>

          {isAnonymous ? (
            <Button onClick={() => setShowUpgrade(true)} variant="primary" className="mt-6 w-full sm:w-auto">
              <Cloud className="h-4 w-4" />
              Simpan Progres dengan Email
            </Button>
          ) : (
            <StatusNote tone="green" className="mt-6">
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Berhasil terhubung. Progresmu sudah tersimpan di cloud.
            </StatusNote>
          )}
        </Card>

        {isAnonymous && (
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-2 text-ink">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-black text-ink">Sudah punya akun?</p>
                <p className="mt-1 text-sm leading-7 text-secondary">Masuk untuk menyambungkan riwayat dari perangkat lain.</p>
              </div>
            </div>

            {!showSignIn ? (
              <Button onClick={() => setShowSignIn(true)} variant="secondary" className="mt-5 w-full">
                <Mail className="h-4 w-4" />
                Masuk dengan Email
              </Button>
            ) : (
              <form onSubmit={handleSignIn} className="mt-5 flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="Email"
                  className="min-h-[48px] w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-soft premium-focus"
                />
                <input
                  type="password"
                  required
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                  placeholder="Password"
                  className="min-h-[48px] w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-soft premium-focus"
                />
                {siError && <StatusNote tone="red">{siError}</StatusNote>}
                <Button type="submit" disabled={siLoading} variant="primary" className="w-full">
                  {siLoading ? "Masuk..." : "Masuk"}
                </Button>
                <button type="button" onClick={() => setShowSignIn(false)} className="min-h-[44px] text-sm font-bold text-muted hover:text-ink premium-focus">
                  Batal
                </button>
              </form>
            )}
          </Card>
        )}

        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-ink">Tentang EnglishHub</p>
              <p className="text-sm text-secondary">Ringkasan modul yang tersedia di perangkat ini.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Speaking", "3 sesi/hari - 12 soal"],
              ["Writing", "2 sesi/hari - 7 soal"],
              ["Vocabulary", "50 kata - SRS otomatis"],
              ["Scoring", "Claude AI - rubrik TOEFL"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-surface-2 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{label}</p>
                <p className="mt-2 text-sm font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div className="mt-6">
        <LinkButton href="/" variant="ghost">Kembali ke Beranda</LinkButton>
      </div>

      {siSuccess && (
        <div className="mt-4">
          <StatusNote tone="green">Berhasil masuk. Progresmu terhubung.</StatusNote>
        </div>
      )}

      {showUpgrade && (
        <EmailUpgradeSheet
          onDismiss={() => setShowUpgrade(false)}
          onSuccess={() => {
            setShowUpgrade(false);
            ensureAnonymousAuth().then(setUser);
          }}
        />
      )}
    </main>
  );
}
