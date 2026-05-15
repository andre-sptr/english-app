"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, ensureAnonymousAuth, signInWithEmail } from "@/lib/firebase";
import EmailUpgradeSheet from "@/components/EmailUpgradeSheet";
import type { User } from "firebase/auth";

type PageState = "loading" | "ready";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Sign-in form state (for returning registered users on new device)
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

    // Listen for auth state changes (e.g. after upgrade)
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
      <main className="flex flex-col gap-6 pt-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="rounded-2xl bg-white border border-gray-100 h-32 animate-pulse" />
      </main>
    );
  }

  const isAnonymous = user?.isAnonymous ?? true;

  return (
    <main className="flex flex-col gap-5 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/progress" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-gray-900 text-lg">Profil</h1>
      </div>

      {/* Auth status card */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {isAnonymous ? "Pengguna Anonim" : user?.email}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              isAnonymous
                ? "bg-amber-50 text-amber-700 border-amber-100"
                : "bg-green-50 text-green-700 border-green-100"
            }`}>
              {isAnonymous ? "Belum terdaftar" : "Terdaftar"}
            </span>
          </div>
        </div>

        {isAnonymous ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">
              Progresmu tersimpan di perangkat ini saja. Daftarkan email agar tidak hilang saat ganti perangkat.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
            >
              Simpan Progres dengan Email
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {siSuccess && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                <p className="text-sm text-green-700 font-medium">Berhasil masuk! Progresmu terhubung.</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Progresmu tersimpan di cloud dan bisa diakses dari perangkat mana pun dengan login email yang sama.
            </p>
          </div>
        )}
      </div>

      {/* Sign in on new device (for registered users) */}
      {isAnonymous && (
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-1">Sudah punya akun?</p>
          <p className="text-xs text-gray-500 mb-4">
            Jika kamu pernah mendaftar sebelumnya, masuk di sini untuk menyambungkan riwayat.
          </p>
          {!showSignIn ? (
            <button
              onClick={() => setShowSignIn(true)}
              className="w-full py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors"
            >
              Masuk dengan Email
            </button>
          ) : (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={siEmail}
                onChange={(e) => setSiEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
              />
              <input
                type="password"
                required
                value={siPassword}
                onChange={(e) => setSiPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition"
              />
              {siError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{siError}</p>
              )}
              <button
                type="submit"
                disabled={siLoading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {siLoading ? "Masuk…" : "Masuk"}
              </button>
              <button type="button" onClick={() => setShowSignIn(false)} className="text-sm text-gray-400 hover:text-gray-600 text-center">
                Batal
              </button>
            </form>
          )}
        </div>
      )}

      {/* App info */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-800">Tentang EnglishHub SMA</p>
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Speaking</span><span className="text-gray-700">3 sesi/hari · 12 soal</span>
          </div>
          <div className="flex justify-between">
            <span>Writing</span><span className="text-gray-700">2 sesi/hari · 7 soal</span>
          </div>
          <div className="flex justify-between">
            <span>Vocabulary</span><span className="text-gray-700">50 kata · SRS otomatis</span>
          </div>
          <div className="flex justify-between">
            <span>Scoring</span><span className="text-gray-700">Claude AI · rubrik ETS TOEFL</span>
          </div>
        </div>
      </div>

      <Link href="/" className="text-center text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors">
        ← Kembali ke Beranda
      </Link>

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
