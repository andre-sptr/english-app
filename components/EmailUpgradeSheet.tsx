"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, X } from "lucide-react";
import { upgradeWithEmail, signInWithEmail } from "@/lib/firebase";
import { Button, StatusNote } from "@/components/ui";

interface Props {
  onDismiss: () => void;
  onSuccess: () => void;
}

type Mode = "upgrade" | "signin";

export default function EmailUpgradeSheet({ onDismiss, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>("upgrade");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    if (mode === "upgrade") {
      const result = await upgradeWithEmail(email, password);
      if (result.success) {
        onSuccess();
        return;
      }
      if (result.alreadyExists) {
        setMode("signin");
        setError("Email sudah terdaftar. Masukkan password akunmu untuk masuk.");
      } else {
        setError(result.error ?? "Terjadi kesalahan. Coba lagi.");
      }
    } else {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        onSuccess();
        return;
      }
      setError("Password salah atau akun tidak ditemukan.");
    }

    setLoading(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm"
        onClick={onDismiss}
      />

      <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-[2rem] border border-line bg-white p-5 shadow-premium sm:bottom-8 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">
              {mode === "upgrade" ? "Cloud Sync" : "Sign In"}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">
              {mode === "upgrade" ? "Simpan progresmu" : "Masuk ke akun"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-secondary">
              {mode === "upgrade"
                ? "Daftarkan email agar riwayat latihanmu tidak hilang saat ganti perangkat."
                : "Masuk dengan akunmu untuk melanjutkan riwayat sebelumnya."}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-2 text-muted hover:text-ink premium-focus"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">Email</span>
            <span className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@kamu.com"
                className="min-h-[50px] w-full rounded-2xl border border-line bg-surface-2 pl-11 pr-4 text-sm font-semibold text-ink premium-focus"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">
              {mode === "upgrade" ? "Buat Password" : "Password"}
            </span>
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "upgrade" ? "Min. 6 karakter" : "Password"}
                className="min-h-[50px] w-full rounded-2xl border border-line bg-surface-2 pl-11 pr-12 text-sm font-semibold text-ink premium-focus"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted hover:bg-white hover:text-ink premium-focus"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          {error && <StatusNote tone="red">{error}</StatusNote>}

          <Button type="submit" disabled={loading} variant="primary" className="w-full">
            {loading ? "Menyimpan..." : mode === "upgrade" ? "Simpan Progres" : "Masuk"}
          </Button>
        </form>

        <button
          onClick={onDismiss}
          className="mt-3 min-h-[44px] w-full text-sm font-bold text-muted hover:text-ink premium-focus"
        >
          Nanti saja
        </button>
      </div>
    </>
  );
}
