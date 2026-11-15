import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_REPLIES, SEED_PROFILES } from '../data/seedProfiles';
import { passesHardFilters } from '../matching/hardFilters';
import { matchScore } from '../matching/score';
import type { Match, Message, Profile, SwipeDir } from '../types';

/** Free tier: swipes per day (spec §9). */
export const FREE_SWIPES_PER_DAY = 10;

const today = () => new Date().toISOString().slice(0, 10);

interface AppState {
  me: Profile | null;
  swipes: Record<string, SwipeDir>;
  matches: Match[];
  messages: Record<string, Message[]>;
  swipeDay: { date: string; count: number };
  premium: boolean;

  saveProfile: (p: Profile) => void;
  /** Records a swipe; returns true when it created a mutual match. */
  swipe: (profileId: string, dir: SwipeDir) => boolean;
  sendMessage: (profileId: string, text: string, from?: string) => void;
  swipesLeft: () => number;
  setPremium: (v: boolean) => void;
  reset: () => void;
}

/** Demo users like back more often when the match score is high. */
function demoLikesBack(me: Profile, other: Profile): boolean {
  const score = matchScore(me, other).total;
  const chance = Math.min(0.9, Math.max(0.15, (score - 40) / 50));
  return Math.random() < chance;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      me: null,
      swipes: {},
      matches: [],
      messages: {},
      swipeDay: { date: today(), count: 0 },
      premium: false,

      saveProfile: (p) => set({ me: p }),

      swipe: (profileId, dir) => {
        const { me, swipes, matches, swipeDay } = get();
        if (!me || swipes[profileId]) return false;
        const day = swipeDay.date === today() ? swipeDay : { date: today(), count: 0 };
        const other = SEED_PROFILES.find((x) => x.id === profileId);
        const matched = dir === 'like' && !!other && demoLikesBack(me, other);
        set({
          swipes: { ...swipes, [profileId]: dir },
          swipeDay: { date: day.date, count: day.count + 1 },
          matches: matched ? [{ profileId, createdAt: Date.now() }, ...matches] : matches,
        });
        return matched;
      },

      sendMessage: (profileId, text, from = 'me') => {
        const msg: Message = { id: crypto.randomUUID(), from, text, ts: Date.now() };
        set((s) => ({
          messages: { ...s.messages, [profileId]: [...(s.messages[profileId] ?? []), msg] },
        }));
      },

      swipesLeft: () => {
        const { premium, swipeDay } = get();
        if (premium) return Infinity;
        const used = swipeDay.date === today() ? swipeDay.count : 0;
        return Math.max(0, FREE_SWIPES_PER_DAY - used);
      },

      setPremium: (v) => set({ premium: v }),

      reset: () =>
        set({ me: null, swipes: {}, matches: [], messages: {}, swipeDay: { date: today(), count: 0 }, premium: false }),
    }),
    { name: 'shutafit-v1' },
  ),
);

export interface Candidate {
  profile: Profile;
  score: number;
}

/** The swipe deck: hard-filtered, not yet swiped, best score first. */
export function buildDeck(me: Profile, swipes: Record<string, SwipeDir>): Candidate[] {
  return SEED_PROFILES.filter((p) => !swipes[p.id] && passesHardFilters(me.filters, p.filters).ok)
    .map((profile) => ({ profile, score: matchScore(me, profile).total }))
    .sort((a, b) => b.score - a.score);
}

export function getProfile(id: string): Profile | undefined {
  return SEED_PROFILES.find((p) => p.id === id);
}

const GAP_REPLY = 'ראיתי שיש לנו כמה נקודות לתאם, בוא/י נדבר עליהן בכנות';

export function randomReply(hasGaps: boolean): string {
  const pool = hasGaps ? [...DEMO_REPLIES, GAP_REPLY] : DEMO_REPLIES;
  return pool[Math.floor(Math.random() * pool.length)];
}
