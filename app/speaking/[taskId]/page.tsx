"use client";

import { use, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getPromptById } from "@/lib/prompts";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreCard from "@/components/ScoreCard";
import type { PracticePhase, RubricScores } from "@/types";
import { notFound } from "next/navigation";
import { ensureAnonymousAuth, getSessionCount, checkAndIncrementSession, saveSession } from "@/lib/firebase";
import EmailUpgradeSheet from "@/components/EmailUpgradeSheet";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default function PracticePage({ params }: PageProps) {
  const { taskId } = use(params);
  const prompt = getPromptById(taskId);

  const [phase, setPhase] = useState<PracticePhase>("idle");
  const [transcription, setTranscription] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [scores, setScores] = useState<RubricScores | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uid, setUid] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sessionUsed, setSessionUsed] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const SESSION_LIMIT = 3;

  useEffect(() => {
    ensureAnonymousAuth().then(async (user) => {
      if (!user) return;
      setUid(user.uid);
      setIsAnonymous(user.isAnonymous);
      const { used } = await getSessionCount(user.uid, "speaking");
      setSessionUsed(used);
    });
  }, []);

  if (!prompt) notFound();

  const handleComplete = useCallback(async (text: string) => {
    setTranscription(text);
    setPhase("processing");
    setStreamedText("");
    setScores(null);
    setError(null);
    setStreaming(true);

    try {
      // Gate: check + increment session counter before scoring
      if (uid) {
        const { allowed, used } = await checkAndIncrementSession(uid, "speaking");
        setSessionUsed(used);
        if (!allowed) {
          setError("Kamu sudah mencapai batas 3 sesi speaking hari ini. Kembali lagi besok!");
          setPhase("result");
          setStreaming(false);
          return;
        }
      }

      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: text, prompt: prompt.topic }),
      });

      if (!response.ok) throw new Error("Scoring gagal, coba lagi.");
      if (!response.body) throw new Error("Tidak ada response dari server.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let finalScores: RubricScores | null = null;
      let feedbackText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });

        // Split on [SCORES] marker
        const markerIdx = full.indexOf("[SCORES]");
        if (markerIdx === -1) {
          setStreamedText(full);
        } else {
          feedbackText = full.slice(0, markerIdx).trim();
          setStreamedText(feedbackText);
          const jsonPart = full.slice(markerIdx + "[SCORES]".length).trim();
          const jsonMatch = jsonPart.match(/\{[^}]+\}/);
          if (jsonMatch) {
            try {
              finalScores = JSON.parse(jsonMatch[0]) as RubricScores;
              setScores(finalScores);
            } catch {
              // JSON not complete yet — keep waiting
            }
          }
        }
      }

      setPhase("result");

      // Soft email upgrade prompt after 2nd session
      if (isAnonymous && sessionUsed >= 2) {
        const dismissed = sessionStorage.getItem("upgrade-dismissed");
        if (!dismissed) setShowUpgrade(true);
      }

      // Save to Firestore (fire-and-forget)
      if (uid && finalScores) {
        saveSession(uid, {
          promptId: prompt.id,
          promptTopic: prompt.topic.slice(0, 120),
          type: "speaking",
          delivery: finalScores.delivery,
          language_use: finalScores.language_use,
          topic_development: finalScores.topic_development,
          total: finalScores.delivery + finalScores.language_use + finalScores.topic_development,
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
  }, [prompt.id, prompt.topic, uid, isAnonymous, sessionUsed]);

  const restart = () => {
    setPhase("idle");
    setTranscription("");
    setStreamedText("");
    setScores(null);
    setError(null);
    setStreaming(false);
    if (uid) {
      getSessionCount(uid, "speaking").then(({ used }) => setSessionUsed(used));
    }
  };

  const typeLabel = prompt.type === "independent" ? "Independent" : "Integrated";
  const typeColor = prompt.type === "independent"
    ? "bg-brand-50 text-brand-700 border-brand-100"
    : "bg-purple-50 text-purple-700 border-purple-100";

  return (
    <main className="flex flex-col gap-5 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/speaking" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeColor}`}>
              {typeLabel}
            </span>
            <span className="text-xs text-gray-400">
              {prompt.prepSeconds}s prep · {prompt.speakSeconds}s speaking
            </span>
            {uid && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                sessionUsed >= SESSION_LIMIT
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-gray-50 text-gray-500 border-gray-100"
              }`}>
                {SESSION_LIMIT - sessionUsed} sesi tersisa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task prompt card */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Soal TOEFL Speaking
        </p>
        {prompt.context && (
          <details className="mb-3">
            <summary className="cursor-pointer text-xs text-brand-600 font-medium">
              Baca konteks (Integrated)
            </summary>
            <div className="mt-2 p-3 rounded-lg bg-gray-50 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {prompt.context}
            </div>
          </details>
        )}
        <p className="text-sm text-gray-800 leading-relaxed">{prompt.topic}</p>
      </div>

      {/* Recording UI */}
      {(phase === "idle" || phase === "prep" || phase === "recording") && (
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <AudioRecorder
            prepSeconds={prompt.prepSeconds}
            speakSeconds={prompt.speakSeconds}
            phase={phase}
            onPhaseChange={setPhase}
            onTranscriptionChange={setTranscription}
            onComplete={handleComplete}
          />

          {phase === "idle" && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-amber-700">
                Butuh izin mikrofon browser. Pastikan kamu dalam kondisi bisa berbicara dengan jelas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Processing spinner */}
      {phase === "processing" && !streamedText && (
        <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">AI sedang menilai jawabanmu…</p>
        </div>
      )}

      {/* Streaming result */}
      {(streamedText || (phase === "result" && !error)) && (
        <ScoreCard
          feedback={streamedText}
          scores={scores}
          streaming={streaming}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Transcription (collapsible) */}
      {transcription && phase === "result" && (
        <details className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <summary className="p-4 cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
            Lihat transkrip jawaban kamu
          </summary>
          <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{transcription}</p>
        </details>
      )}

      {/* Action buttons after result */}
      {phase === "result" && (
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={restart}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all text-white font-semibold"
          >
            Coba Lagi Soal Ini
          </button>
          <Link
            href="/speaking"
            className="block w-full py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-gray-700 font-medium text-center"
          >
            Pilih Soal Lain
          </Link>
        </div>
      )}
      {showUpgrade && (
        <EmailUpgradeSheet
          onDismiss={() => {
            sessionStorage.setItem("upgrade-dismissed", "1");
            setShowUpgrade(false);
          }}
          onSuccess={() => {
            setIsAnonymous(false);
            setShowUpgrade(false);
          }}
        />
      )}
    </main>
  );
}
