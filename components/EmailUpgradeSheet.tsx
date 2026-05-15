"use client";

import { useState } from "react";
import { upgradeWithEmail, signInWithEmail } from "@/lib/firebase";

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onDismiss}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 max-w-md mx-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex flex-col gap-1 mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "upgrade" ? "Simpan Progresmu" : "Masuk ke Akun"}
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "upgrade"
              ? "Daftarkan email agar riwayat latihanmu tidak hilang saat ganti perangkat."
              : "Masuk dengan akunmu untuk melanjutkan riwayat sebelumnya."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              {mode === "upgrade" ? "Buat Password" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "upgrade" ? "Min. 6 karakter" : "Password"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Menyimpan…" : mode === "upgrade" ? "Simpan Progres" : "Masuk"}
          </button>
        </form>

        <button
          onClick={onDismiss}
          className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Nanti saja
        </button>
      </div>
    </>
  );
}
