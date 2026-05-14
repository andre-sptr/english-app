// Web Speech API type declarations (not in TypeScript's default DOM lib)

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult:  ((event: SpeechRecognitionEvent) => void) | null;
  onerror:   ((event: Event) => void) | null;
  onend:     (() => void) | null;
}

declare var SpeechRecognition: {
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition: typeof SpeechRecognition | undefined;
  webkitSpeechRecognition: typeof SpeechRecognition | undefined;
}
