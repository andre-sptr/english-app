export type TaskType = "independent" | "integrated";

export interface SpeakingPrompt {
  id: string;
  type: TaskType;
  prepSeconds: number;
  speakSeconds: number;
  topic: string;
  context?: string; // for integrated tasks: reading/listening passage summary
}

export interface RubricScores {
  delivery: number;       // 0-4
  language_use: number;   // 0-4
  topic_development: number; // 0-4
}

export interface ScoringResult {
  feedback: string;
  oneFix: string;
  scores: RubricScores;
}

export interface SessionRecord {
  id: string;
  promptId: string;
  taskType: TaskType;
  transcription: string;
  scores: RubricScores;
  feedback: string;
  createdAt: number;
}

export type PracticePhase =
  | "idle"
  | "prep"
  | "recording"
  | "processing"
  | "result";

export interface WritingPrompt {
  id: string;
  type: TaskType;
  minuteLimit: number;
  targetWords: number;
  topic: string;
  context?: string;
}

export interface WritingScores {
  content: number;       // 0-4
  organization: number;  // 0-4
  language_use: number;  // 0-4
}

export type WritingPhase = "idle" | "writing" | "processing" | "result";

// Vocabulary SRS
export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export interface CardState {
  wordId: string;
  interval: number;    // days until next review
  easeFactor: number;  // multiplier (default 2.5)
  repetitions: number;
  nextReview: number;  // unix timestamp ms
}

export type SRSRating = 1 | 2 | 3 | 4; // Again / Hard / Good / Easy
