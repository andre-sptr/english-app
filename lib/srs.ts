import type { CardState, SRSRating } from "@/types";

const STORAGE_KEY = "vocab-srs-v1";

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

export function loadCards(): Record<string, CardState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveCards(cards: Record<string, CardState>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function getOrCreateCard(cards: Record<string, CardState>, wordId: string): CardState {
  return cards[wordId] ?? {
    wordId,
    interval: 0,
    easeFactor: DEFAULT_EASE,
    repetitions: 0,
    nextReview: 0,
  };
}

// SM-2 variant: interval in days, scheduled as ms timestamp
export function scheduleCard(card: CardState, rating: SRSRating): CardState {
  const now = Date.now();
  let { interval, easeFactor, repetitions } = card;

  if (rating === 1) {
    // Again — reset
    interval = 0;
    repetitions = 0;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    if (rating === 2) easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
    else if (rating === 4) easeFactor = Math.min(3.0, easeFactor + 0.1);
  }

  const nextReview = interval === 0
    ? now + 1 * 60 * 1000  // 1 minute for "Again" in current session
    : now + interval * 24 * 60 * 60 * 1000;

  return { ...card, interval, easeFactor, repetitions, nextReview };
}

export function getDueCards(
  cards: Record<string, CardState>,
  allWordIds: string[]
): string[] {
  const now = Date.now();
  return allWordIds.filter((id) => {
    const card = cards[id];
    return !card || card.nextReview <= now;
  });
}

export function getMasteredCount(cards: Record<string, CardState>): number {
  return Object.values(cards).filter((c) => c.repetitions >= 3 && c.interval >= 7).length;
}
