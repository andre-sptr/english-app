"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/cn";
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

  // Keep ref in sync for use inside recognition callbacks
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

  // Cleanup on unmount
  useEffect(() => () => stopRecognition(), [stopRecognition]);

  const totalSeconds = phase === "prep" ? prepSeconds : speakSeconds;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  if (phase === "idle") {
    return (
      <button
        onClick={startPrep}
        className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all text-white text-lg font-semibold shadow-lg"
      >
        Mulai Latihan
      </button>
    );
  }

  if (phase === "prep") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Persiapan</p>
        <div className="relative flex items-center justify-center w-28 h-28">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="50" fill="none" stroke="#dbeafe" strokeWidth="8" />
            <circle
              cx="56" cy="56" r="50" fill="none" stroke="#2563eb" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="text-4xl font-bold text-brand-700">{timeLeft}</span>
        </div>
        <p className="text-gray-600 text-sm text-center">
          Pikirkan jawaban kamu sebelum mulai berbicara
        </p>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="text-sm font-medium text-red-500 uppercase tracking-wide flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Sedang Merekam
        </p>

        {/* Timer ring */}
        <div className="relative flex items-center justify-center w-28 h-28">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="50" fill="none" stroke="#fee2e2" strokeWidth="8" />
            <circle
              cx="56" cy="56" r="50" fill="none" stroke="#ef4444" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="text-4xl font-bold text-red-600">{timeLeft}</span>
        </div>

        {/* Live transcription */}
        <div className="w-full min-h-[80px] rounded-xl bg-surface-2 border border-subtle p-3 text-sm text-gray-700">
          {finalText || interimText ? (
            <>
              <span>{finalText}</span>
              <span className="text-gray-400 italic">{interimText}</span>
            </>
          ) : (
            <span className="text-gray-400 italic">
              {speechSupported ? "Mulai berbicara..." : "Ketik jawaban di bawah (Web Speech API tidak didukung browser ini)"}
            </span>
          )}
        </div>

        {/* Manual text input fallback for unsupported browsers */}
        {!speechSupported && (
          <textarea
            className="w-full rounded-xl border border-gray-300 p-3 text-sm resize-none"
            rows={4}
            placeholder="Ketik jawaban TOEFL Speaking kamu di sini..."
            onChange={(e) => {
              setFinalText(e.target.value);
              finalTextRef.current = e.target.value;
              onTranscriptionChange(e.target.value);
            }}
          />
        )}

        <button
          onClick={finishRecording}
          className="w-full py-3 rounded-2xl bg-gray-800 hover:bg-gray-900 text-white font-semibold transition-colors"
        >
          Selesai Lebih Awal
        </button>
      </div>
    );
  }

  return null;
}
