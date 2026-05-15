"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import { FileText, Loader2, PenLine, RefreshCw } from "lucide-react";
import { getWritingPromptById } from "@/lib/writing-prompts";
import { ensureAnonymousAuth, getSessionCount, checkAndIncrementSession, saveSession } from "@/lib/firebase";
import type { WritingPhase, WritingScores } from "@/types";
import { cn } from "@/lib/cn";
import ScoreMeter from "@/components/ScoreMeter";
import { Button, Card, LinkButton, PageHeader, Pill, StatusNote } from "@/components/ui";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

function ScorePanel({ scores }: { scores: WritingScores }) {
  const total = scores.content + scores.organization + scores.language_use;
  return (
    <Card>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Skor Writing</p>
          <p className="mt-1 text-sm text-secondary">Content, Organization, dan Language Use.</p>
        </div>
        <p className="text-2xl font-black text-brand-700">{total} / 12</p>
      </div>
      <div className="flex flex-col gap-4">
        <ScoreMeter label="Content" score={scores.content} />
        <ScoreMeter label="Organization" score={scores.organization} />
        <ScoreMeter label="Language Use" score={scores.language_use} />
      </div>
    </Card>
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
            } catch {
              // Keep waiting until streamed JSON is complete.
            }
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft <= 300 ? "text-red-600" : "text-brand-700";
  const typeLabel = prompt.type === "independent" ? "Independent" : "Integrated";
  const typeTone = prompt.type === "independent" ? "brand" : "purple";
  const sessionsLeft = Math.max(0, SESSION_LIMIT - sessionUsed);

  const parseFix = (raw: string) => {
    const idx = raw.indexOf("ONE FIX:");
    if (idx === -1) return { body: raw.trim(), fix: "" };
    return { body: raw.slice(0, idx).trim(), fix: raw.slice(idx + 8).split("\n")[0].trim() };
  };

  return (
    <main className="page-container">
      <PageHeader
        backHref="/writing"
        eyebrow="Writing Practice"
        title="Latihan writing"
        description="Kerjakan esai dengan timer, pantau target kata, lalu kirim untuk feedback AI."
        actions={
          <div className="flex flex-wrap gap-2">
            <Pill tone={typeTone}>{typeLabel}</Pill>
            <Pill tone="neutral">{prompt.minuteLimit} menit / {prompt.targetWords}+ kata</Pill>
            {uid && <Pill tone={sessionsLeft === 0 ? "red" : "green"}>{sessionsLeft} sesi tersisa</Pill>}
            {phase === "writing" && <Pill tone={timeLeft <= 300 ? "red" : "brand"}>{minutes}:{String(seconds).padStart(2, "0")}</Pill>}
          </div>
        }
      />

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Soal TOEFL Writing</p>
              <p className="text-sm font-semibold text-secondary">Baca prompt dan konteks sebelum mulai.</p>
            </div>
          </div>
          {prompt.context && (
            <details className="mb-4 rounded-2xl border border-line bg-surface-2 p-4">
              <summary className="cursor-pointer text-sm font-extrabold text-brand-700 premium-focus">
                Baca konteks integrated
              </summary>
              <div className="mt-3 whitespace-pre-line text-sm leading-7 text-secondary">{prompt.context}</div>
            </details>
          )}
          <p className="text-base font-semibold leading-8 text-ink">{prompt.topic}</p>
        </Card>

        {phase === "idle" && (
          <Card className="flex flex-col justify-between gap-5">
            <StatusNote tone="gold">
              Setelah mulai, timer berjalan. Tulis minimal {prompt.targetWords} kata dalam {prompt.minuteLimit} menit.
            </StatusNote>
            <Button onClick={startWriting} variant="primary" className="w-full text-base">
              <PenLine className="h-5 w-5" />
              Mulai Menulis
            </Button>
          </Card>
        )}

        {phase === "writing" && (
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Essay Editor</p>
                <p className={cn("mt-1 text-sm font-bold", wordCount >= prompt.targetWords ? "text-green-700" : "text-muted")}>
                  {wordCount} / {prompt.targetWords} kata
                </p>
              </div>
              <span className={`text-2xl font-black tabular-nums ${timeColor}`}>
                {minutes}:{String(seconds).padStart(2, "0")}
              </span>
            </div>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Mulai menulis esaimu di sini..."
              className="min-h-[360px] w-full resize-none bg-white p-5 text-sm leading-8 text-ink focus:outline-none"
              autoFocus
            />
            <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-secondary">Kirim saat struktur esai sudah cukup jelas.</p>
              <Button onClick={() => submitEssay(essay)} disabled={wordCount < 10} variant="brand">
                Selesai & Nilai
              </Button>
            </div>
          </Card>
        )}

        {phase === "processing" && !streamedText && (
          <Card className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
            <div>
              <p className="text-lg font-black text-ink">AI sedang menilai esaimu</p>
              <p className="mt-1 text-sm text-secondary">Feedback akan muncul secara streaming.</p>
            </div>
          </Card>
        )}
      </section>

      {(streamedText || (phase === "result" && !error)) && (() => {
        const { body, fix } = parseFix(streamedText);
        return (
          <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Feedback AI</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink">
                {body}
                {streaming && !scores && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-500 align-middle" />}
              </p>
              {fix && (
                <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">One Fix</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-900">{fix}</p>
                </div>
              )}
            </Card>

            {scores && <ScorePanel scores={scores} />}
          </section>
        );
      })()}

      {error && (
        <div className="mt-6">
          <StatusNote tone="red">{error}</StatusNote>
        </div>
      )}

      {phase === "result" && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => {
              setPhase("idle");
              setEssay("");
              setStreamedText("");
              setScores(null);
              setError(null);
              setTimeLeft(prompt.minuteLimit * 60);
            }}
            variant="brand"
          >
            <RefreshCw className="h-4 w-4" />
            Coba Lagi Soal Ini
          </Button>
          <LinkButton href="/writing" variant="secondary">Pilih Soal Lain</LinkButton>
        </div>
      )}
    </main>
  );
}
