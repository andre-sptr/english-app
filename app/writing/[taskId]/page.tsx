"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWritingPromptById } from "@/lib/writing-prompts";
import { ensureAnonymousAuth, getSessionCount, checkAndIncrementSession, saveSession } from "@/lib/firebase";
import type { WritingPhase, WritingScores } from "@/types";
import { cn } from "@/lib/cn";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

const SCORE_COLORS = ["", "bg-red-100 text-red-700 border-red-200", "bg-orange-100 text-orange-700 border-orange-200", "bg-yellow-100 text-yellow-700 border-yellow-200", "bg-green-100 text-green-700 border-green-200"];
const SCORE_BAR = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-bold shrink-0", SCORE_COLORS[score] ?? "")}>
        {score}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", SCORE_BAR[score])} style={{ width: `${(score / 4) * 100}%` }} />
        </div>
      </div>
      <span className="text-xs text-gray-400 shrink-0">/ 4</span>
    </div>
  );
}

export default function WritingPracticePage({ params }: PageProps) {
  const { taskId } = use(params);
  const prompt = getWritingPromptById(taskId);
  if (!prompt) notFound();

  const [phase, setPhase] = useState<WritingPhase>("idle");
  const [essay, setEssay] = useState("");
  const [timeLeft, setTimeLeft] = useState(prompt.minuteLimit * 60);
  const [streamedText, setStreamedText] = useState("");
  const [scores, setScores] = useState<WritingScores | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uid, setUid] = useState<string | null>(null);
  const [sessionUsed, setSessionUsed] = useState(0);
  const SESSION_LIMIT = 2;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ensureAnonymousAuth().then(async (user) => {
      if (!user) return;
      setUid(user.uid);
      const { used } = await getSessionCount(user.uid, "writing");
      setSessionUsed(used);
    });
  }, []);

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const startWriting = () => {
    setPhase("writing");
    let t = prompt.minuteLimit * 60;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current!);
        submitEssay(essay);
      }
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const submitEssay = useCallback(async (text: string) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setPhase("processing");
    setStreamedText("");
    setScores(null);
    setError(null);
    setStreaming(true);

    try {
      if (uid) {
        const { allowed, used } = await checkAndIncrementSession(uid, "writing");
        setSessionUsed(used);
        if (!allowed) {
          setError("Kamu sudah mencapai batas 2 sesi writing hari ini. Kembali lagi besok!");
          setPhase("result");
          setStreaming(false);
          return;
        }
      }

      const response = await fetch("/api/writing-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay: text, prompt: prompt.topic, context: prompt.context }),
      });

      if (!response.ok) throw new Error("Scoring gagal, coba lagi.");
      if (!response.body) throw new Error("Tidak ada response dari server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let finalScores: WritingScores | null = null;
      let feedbackText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });

        const markerIdx = full.indexOf("[SCORES]");
        if (markerIdx === -1) {
          setStreamedText(full);
        } else {
          feedbackText = full.slice(0, markerIdx).trim();
          setStreamedText(feedbackText);
          const jsonMatch = full.slice(markerIdx + "[SCORES]".length).trim().match(/\{[^}]+\}/);
          if (jsonMatch) {
            try {
              finalScores = JSON.parse(jsonMatch[0]) as WritingScores;
              setScores(finalScores);
            } catch {}
          }
        }
      }

      setPhase("result");

      if (uid && finalScores) {
        saveSession(uid, {
          promptId: prompt.id,
          promptTopic: prompt.topic.slice(0, 120),
          type: "writing",
          delivery: finalScores.organization,
          language_use: finalScores.language_use,
          topic_development: finalScores.content,
          total: finalScores.content + finalScores.organization + finalScores.language_use,
          feedback: feedbackText,
          transcription: text,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setPhase("result");
    } finally {
      setStreaming(false);
    }
  }, [prompt.id, prompt.topic, prompt.context, uid]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft <= 300 ? "text-red-600" : "text-brand-700";
  const typeLabel = prompt.type === "independent" ? "Independent" : "Integrated";
  const typeColor = prompt.type === "independent" ? "bg-brand-50 text-brand-700 border-brand-100" : "bg-purple-50 text-purple-700 border-purple-100";

  const parseFix = (raw: string) => {
    const idx = raw.indexOf("ONE FIX:");
    if (idx === -1) return { body: raw.trim(), fix: "" };
    return { body: raw.slice(0, idx).trim(), fix: raw.slice(idx + 8).split("\n")[0].trim() };
  };

  return (
    <main className="flex flex-col gap-5 pt-8">
      <div className="flex items-center gap-3">
        <Link href="/writing" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeColor}`}>{typeLabel}</span>
            <span className="text-xs text-gray-400">{prompt.minuteLimit} menit · {prompt.targetWords}+ kata</span>
            {uid && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sessionUsed >= SESSION_LIMIT ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                {SESSION_LIMIT - sessionUsed} sesi tersisa
              </span>
            )}
          </div>
        </div>
        {phase === "writing" && (
          <span className={`text-xl font-bold tabular-nums ${timeColor}`}>
            {minutes}:{String(seconds).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="rounded-2xl bg-surface border border-subtle p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Soal TOEFL Writing</p>
        {prompt.context && (
          <details className="mb-3">
            <summary className="cursor-pointer text-xs text-brand-600 font-medium">Baca konteks (Integrated)</summary>
            <div className="mt-2 p-3 rounded-lg bg-surface-2 text-xs text-gray-600 leading-relaxed whitespace-pre-line">{prompt.context}</div>
          </details>
        )}
        <p className="text-sm text-gray-800 leading-relaxed">{prompt.topic}</p>
      </div>

      {phase === "idle" && (
        <div className="rounded-2xl bg-surface border border-subtle p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-amber-700">Setelah mulai, timer berjalan. Tulis minimal {prompt.targetWords} kata dalam {prompt.minuteLimit} menit.</p>
          </div>
          <button
            onClick={startWriting}
            className="w-full py-4 rounded-2xl bg-ink hover:bg-ink/90 active:scale-95 transition-all text-white text-lg font-semibold shadow-lg"
          >
            Mulai Menulis
          </button>
        </div>
      )}

      {phase === "writing" && (
        <div className="rounded-2xl bg-surface border border-subtle p-4 shadow-sm flex flex-col gap-3">
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Mulai menulis esaimu di sini..."
            className="w-full min-h-[280px] resize-none text-sm text-gray-800 leading-relaxed focus:outline-none"
            autoFocus
          />
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className={`text-xs font-medium ${wordCount >= prompt.targetWords ? "text-green-600" : "text-gray-400"}`}>
              {wordCount} / {prompt.targetWords} kata
            </span>
            <button
              onClick={() => submitEssay(essay)}
              disabled={wordCount < 10}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              Selesai & Nilai
            </button>
          </div>
        </div>
      )}

      {phase === "processing" && !streamedText && (
        <div className="rounded-2xl bg-surface border border-subtle p-8 shadow-sm flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">AI sedang menilai esaimu…</p>
        </div>
      )}

      {(streamedText || (phase === "result" && !error)) && (() => {
        const { body, fix } = parseFix(streamedText);
        const total = scores ? scores.content + scores.organization + scores.language_use : null;
        return (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-surface border border-subtle p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Feedback AI</p>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {body}
                {streaming && !scores && <span className="inline-block w-0.5 h-4 bg-brand-500 animate-pulse ml-0.5 align-middle" />}
              </p>
              {fix && (
                <div className="mt-3 flex gap-2 bg-brand-50 border border-brand-100 rounded-xl p-3">
                  <span className="text-brand-600 shrink-0 font-bold text-sm">ONE FIX</span>
                  <p className="text-sm text-brand-800">{fix}</p>
                </div>
              )}
            </div>

            {scores && (
              <div className="rounded-2xl bg-surface border border-subtle p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Skor Writing</p>
                  {total !== null && <p className="text-xl font-bold text-brand-700">{total} / 12</p>}
                </div>
                <div className="flex flex-col gap-3">
                  <ScoreRow label="Content" score={scores.content} />
                  <ScoreRow label="Organization" score={scores.organization} />
                  <ScoreRow label="Language Use" score={scores.language_use} />
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {phase === "result" && (
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => { setPhase("idle"); setEssay(""); setStreamedText(""); setScores(null); setError(null); setTimeLeft(prompt.minuteLimit * 60); }}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all text-white font-semibold"
          >
            Coba Lagi Soal Ini
          </button>
          <Link href="/writing" className="block w-full py-3 rounded-2xl border border-subtle hover:bg-surface-2 transition-all text-gray-700 font-medium text-center">
            Pilih Soal Lain
          </Link>
        </div>
      )}
    </main>
  );
}
