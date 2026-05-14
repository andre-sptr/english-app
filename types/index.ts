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
