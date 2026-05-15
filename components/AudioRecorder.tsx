"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic2, Square, Waves } from "lucide-react";
import { Button, StatusNote } from "@/components/ui";
import type { PracticePhase } from "@/types";

interface Props {
  prepSeconds: number;
  speakSeconds: number;
  phase: PracticePhase;
  onPhaseChange: (phase: PracticePhase) => void;
  onTranscriptionChange: (text: string) => void;
  onComplete: (transcription: string) => void;
}

export default function AudioRecorder({
  prepSeconds,
  speakSeconds,
  phase,
  onPhaseChange,
  onTranscriptionChange,
  onComplete,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTextRef = useRef("");

  useEffect(() => { finalTextRef.current = finalText; }, [finalText]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSpeechSupported(false);
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPrep = useCallback(() => {
    setTimeLeft(prepSeconds);
    onPhaseChange("prep");

    let t = prepSeconds;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current!);
        startRecording();
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepSeconds]);

  const startRecording = useCallback(() => {
    setFinalText("");
    setInterimText("");
    finalTextRef.current = "";
    setTimeLeft(speakSeconds);
    onPhaseChange("recording");

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let newFinal = finalTextRef.current;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += t + " ";
          } else {
            interim += t;
          }
        }
        setFinalText(newFinal);
        finalTextRef.current = newFinal;
        setInterimText(interim);
        onTranscriptionChange(newFinal + interim);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }

    let t = speakSeconds;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        finishRecording();
      }
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakSeconds]);

  const finishRecording = useCallback(() => {
    stopRecognition();
    const result = finalTextRef.current.trim();
    onComplete(result);
  }, [stopRecognition, onComplete]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  const totalSeconds = phase === "prep" ? prepSeconds : speakSeconds;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  if (phase === "idle") {
    return (
      <div className="flex flex-col gap-4">
        <Button onClick={startPrep} variant="brand" className="w-full text-base">
          <Mic2 className="h-5 w-5" />
          Mulai Latihan
        </Button>
        <StatusNote tone="gold">
          Browser akan meminta izin mikrofon. Pilih tempat yang tenang agar transkrip lebih akurat.
        </StatusNote>
      </div>
    );
  }

  if (phase === "prep") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Persiapan</p>
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#D7E9FF" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="56" fill="none" stroke="#1B55D9" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="font-display text-6xl leading-none text-brand-700">{timeLeft}</span>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-secondary">
          Susun poin utama sebelum mulai berbicara.
        </p>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-red-600">
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          Sedang Merekam
        </p>

        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#FEE2E2" strokeWidth="10" />
            <circle
              cx="64" cy="64" r="56" fill="none" stroke="#DC2626" strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="font-display text-6xl leading-none text-red-600">{timeLeft}</span>
        </div>

        <div className="w-full rounded-3xl border border-line bg-surface-2 p-4 text-sm leading-7 text-ink">
          {finalText || interimText ? (
            <>
              <span>{finalText}</span>
              <span className="text-muted italic">{interimText}</span>
            </>
          ) : (
            <span className="flex items-center gap-2 text-muted italic">
              <Waves className="h-4 w-4" />
              {speechSupported ? "Mulai berbicara..." : "Ketik jawaban di bawah. Web Speech API tidak didukung browser ini."}
            </span>
          )}
        </div>

        {!speechSupported && (
          <textarea
            className="w-full resize-none rounded-2xl border border-line bg-white p-4 text-sm leading-7 text-ink shadow-soft premium-focus"
            rows={4}
            placeholder="Ketik jawaban TOEFL Speaking kamu di sini..."
            onChange={(e) => {
              setFinalText(e.target.value);
              finalTextRef.current = e.target.value;
              onTranscriptionChange(e.target.value);
            }}
          />
        )}

        <Button onClick={finishRecording} variant="danger" className="w-full">
          <Square className="h-4 w-4" />
          Selesai Lebih Awal
        </Button>
      </div>
    );
  }

  return null;
}
