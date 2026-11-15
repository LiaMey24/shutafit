import { HABIT_QUESTIONS, HOBBIES, MUSIC, SHOWS, SOCIAL_QUESTION, WEEKENDS, labelOf } from '../data/questions';
import type { Profile } from '../types';

/** A habit gap of this many scale points or more is shown as a friction point. */
export const GAP_THRESHOLD = 2;

export interface Gap {
  topic: string;
  mine: string;
  theirs: string;
  /** Distance on the 1–5 scale (2–4). */
  size: number;
}

export interface Insights {
  shared: string[];
  gaps: Gap[];
}

const scaleQuestions = [...HABIT_QUESTIONS, SOCIAL_QUESTION];

function valueOf(p: Profile, key: string): number {
  return key === 'socialBattery'
    ? p.personality.socialBattery
    : p.habits[key as keyof Profile['habits']];
}

/**
 * Transparent matching: lists common ground and potential friction
 * between `me` and `other`, biggest gaps first.
 */
export function buildInsights(me: Profile, other: Profile): Insights {
  const shared: string[] = [];
  const gaps: Gap[] = [];

  const common = (a: string[], b: string[]) => a.filter((x) => b.includes(x));

  const hobbies = common(me.personality.hobbies, other.personality.hobbies);
  if (hobbies.length) shared.push(`תחביבים: ${hobbies.map((h) => labelOf(HOBBIES, h)).join(', ')}`);

  const shows = common(me.personality.shows, other.personality.shows);
  if (shows.length) shared.push(`בינג׳ משותף: ${shows.map((s) => labelOf(SHOWS, s)).join(', ')}`);

  const music = common(me.personality.music, other.personality.music);
  if (music.length) shared.push(`מוזיקה: ${music.map((m) => labelOf(MUSIC, m)).join(', ')}`);

  if (me.personality.weekend === other.personality.weekend) {
    const w = WEEKENDS.find((x) => x.id === me.personality.weekend)!;
    shared.push(`סופ״ש: ${w.label}`);
  }

  for (const q of scaleQuestions) {
    const a = valueOf(me, q.key);
    const b = valueOf(other, q.key);
    const size = Math.abs(a - b);
    if (size === 0) {
      shared.push(`${q.topic}: שניכם „${q.levels[a - 1]}”`);
    } else if (size >= GAP_THRESHOLD) {
      gaps.push({ topic: q.topic, mine: q.levels[a - 1], theirs: q.levels[b - 1], size });
    }
  }

  gaps.sort((x, y) => y.size - x.size);
  return { shared, gaps };
}
