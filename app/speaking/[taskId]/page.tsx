"use client";

import { use, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ListChecks, Loader2, RefreshCw } from "lucide-react";
import { getPromptById } from "@/lib/prompts";
import AudioRecorder from "@/components/AudioRecorder";
import ScoreCard from "@/components/ScoreCard";
import type { PracticePhase, RubricScores } from "@/types";
import { ensureAnonymousAuth, getSessionCount, checkAndIncrementSession, saveSession } from "@/lib/firebase";
import EmailUpgradeSheet from "@/components/EmailUpgradeSheet";
import { Button, Card, LinkButton, PageHeader, Pill, StatusNote } from "@/components/ui";

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
              // Keep waiting until streamed JSON is complete.
            }
          }
        }
      }

      setPhase("result");

      if (isAnonymous && sessionUsed >= 2) {
        const dismissed = sessionStorage.getItem("upgrade-dismissed");
        if (!dismissed) setShowUpgrade(true);
      }

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
  const typeTone = prompt.type === "independent" ? "brand" : "purple";
  const sessionsLeft = Math.max(0, SESSION_LIMIT - sessionUsed);

  return (
    <main className="page-container">
      <PageHeader
        backHref="/speaking"
        eyebrow="Speaking Practice"
        title="Latihan speaking"
        description="Gunakan waktu persiapan, rekam jawaban, lalu tunggu feedback AI berdasarkan rubrik TOEFL."
        actions={
          <div className="flex flex-wrap gap-2">
            <Pill tone={typeTone}>{typeLabel}</Pill>
            <Pill tone="neutral">{prompt.prepSeconds}s prep / {prompt.speakSeconds}s speaking</Pill>
            {uid && <Pill tone={sessionsLeft === 0 ? "red" : "green"}>{sessionsLeft} sesi tersisa</Pill>}
          </div>
        }
      />

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Soal TOEFL Speaking</p>
              <p className="text-sm font-semibold text-secondary">Baca prompt sebelum mulai timer.</p>
            </div>
          </div>

          {prompt.context && (
            <details className="mb-4 rounded-2xl border border-line bg-surface-2 p-4">
              <summary className="cursor-pointer text-sm font-extrabold text-brand-700 premium-focus">
                Baca konteks integrated
              </summary>
              <div className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">
                {prompt.context}
              </div>
            </details>
          )}

          <p className="text-base font-semibold leading-8 text-ink">{prompt.topic}</p>
        </Card>

        {(phase === "idle" || phase === "prep" || phase === "recording") && (
          <Card>
            <AudioRecorder
              prepSeconds={prompt.prepSeconds}
              speakSeconds={prompt.speakSeconds}
              phase={phase}
              onPhaseChange={setPhase}
              onTranscriptionChange={setTranscription}
              onComplete={handleComplete}
            />
          </Card>
        )}

        {phase === "processing" && !streamedText && (
          <Card className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
            <div>
              <p className="text-lg font-black text-ink">AI sedang menilai jawabanmu</p>
              <p className="mt-1 text-sm text-secondary">Skor dan feedback akan muncul otomatis.</p>
            </div>
          </Card>
        )}
      </section>

      {(streamedText || (phase === "result" && !error)) && (
        <section className="mt-6">
          <ScoreCard feedback={streamedText} scores={scores} streaming={streaming} />
        </section>
      )}

      {error && (
        <div className="mt-6">
          <StatusNote tone="red">{error}</StatusNote>
        </div>
      )}

      {transcription && phase === "result" && (
        <details className="mt-6 rounded-3xl border border-line bg-white shadow-soft">
          <summary className="flex cursor-pointer items-center gap-2 p-5 text-sm font-extrabold text-secondary hover:text-ink premium-focus">
            <ListChecks className="h-4 w-4" />
            Lihat transkrip jawaban kamu
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-secondary">{transcription}</p>
        </details>
      )}

      {phase === "result" && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={restart} variant="brand">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi Soal Ini
          </Button>
          <LinkButton href="/speaking" variant="secondary">Pilih Soal Lain</LinkButton>
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
