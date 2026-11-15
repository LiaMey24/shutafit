import type { Habits, HabitKey, Personality, Profile, Weekend } from '../types';

/** Weights inside the living-habits block (sum = 1). */
export const HABIT_WEIGHTS: Record<HabitKey, number> = {
  cleanliness: 0.25,
  sleep: 0.2,
  guests: 0.2,
  noise: 0.2,
  presence: 0.15,
};

/** Weights inside the personality block (sum = 1). */
export const PERSONALITY_WEIGHTS = {
  hobbies: 0.3,
  socialBattery: 0.25,
  shows: 0.15,
  music: 0.15,
  weekend: 0.15,
};

/** Share of the final score that comes from habits; the rest is personality. */
export const HABITS_SHARE = 0.6;

/** Similarity of two 1–5 answers: 1 when equal, 0 when at opposite ends. */
export function scaleSimilarity(a: number, b: number): number {
  return 1 - Math.abs(a - b) / 4;
}

/** Overlap of two tag lists. Neutral (0.5) when either side picked nothing. */
export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0.5;
  const sa = new Set(a);
  const inter = b.filter((x) => sa.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return inter / union;
}

export function weekendSimilarity(a: Weekend, b: Weekend): number {
  if (a === b) return 1;
  if (a === 'mixed' || b === 'mixed') return 0.6;
  return 0.2;
}

export function habitsScore(a: Habits, b: Habits): number {
  return (Object.keys(HABIT_WEIGHTS) as HabitKey[]).reduce(
    (sum, k) => sum + HABIT_WEIGHTS[k] * scaleSimilarity(a[k], b[k]),
    0,
  );
}

export function personalityScore(a: Personality, b: Personality): number {
  const w = PERSONALITY_WEIGHTS;
  return (
    w.hobbies * jaccard(a.hobbies, b.hobbies) +
    w.socialBattery * scaleSimilarity(a.socialBattery, b.socialBattery) +
    w.shows * jaccard(a.shows, b.shows) +
    w.music * jaccard(a.music, b.music) +
    w.weekend * weekendSimilarity(a.weekend, b.weekend)
  );
}

export interface ScoreBreakdown {
  total: number;
  habits: number;
  personality: number;
}

/** Layers 2 + 3: holistic match score, 0–100. */
export function matchScore(a: Profile, b: Profile): ScoreBreakdown {
  const h = habitsScore(a.habits, b.habits);
  const p = personalityScore(a.personality, b.personality);
  return {
    total: Math.round(100 * (HABITS_SHARE * h + (1 - HABITS_SHARE) * p)),
    habits: Math.round(100 * h),
    personality: Math.round(100 * p),
  };
}
