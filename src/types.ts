/** Layer 1 — hard filters / deal-breakers (spec §5, §10 HardFilters). */
export interface HardFilters {
  /** Max monthly rent per person, in ₪. */
  maxBudget: number;
  areas: string[];
  smokes: boolean;
  okWithSmoker: boolean;
  hasPet: boolean;
  okWithPet: boolean;
  keepsKosher: boolean;
  /** When true, a non-kosher roommate is a deal-breaker. */
  kosherIsDealBreaker: boolean;
  keepsShabbat: boolean;
  shabbatIsDealBreaker: boolean;
}

/** Layer 2 — living habits, each on a 1–5 scale. */
export interface Habits {
  /** 1 = relaxed, 5 = spotless */
  cleanliness: number;
  /** 1 = early bird, 5 = night owl */
  sleep: number;
  /** 1 = rarely home, 5 = works from home */
  presence: number;
  /** 1 = quiet sanctuary, 5 = open house */
  guests: number;
  /** 1 = total silence, 5 = loud and lively */
  noise: number;
}

export type HabitKey = keyof Habits;

export type Weekend = 'trips' | 'parties' | 'couch' | 'family' | 'mixed';

/** Layer 3 — personality, interests and vibe. */
export interface Personality {
  /** 1 = introvert, 5 = extrovert */
  socialBattery: number;
  weekend: Weekend;
  hobbies: string[];
  shows: string[];
  music: string[];
}

export type Gender = 'f' | 'm';

export interface Profile {
  id: string;
  name: string;
  age: number;
  /** Optional so older saved profiles stay valid. */
  gender?: Gender;
  /** Desired move-in month, "YYYY-MM". Optional for older saved profiles. */
  moveIn?: string;
  occupation: string;
  bio: string;
  /** Data URL of an uploaded photo; avatar falls back to initials. */
  photo?: string;
  filters: HardFilters;
  habits: Habits;
  personality: Personality;
}

export type SwipeDir = 'like' | 'pass';

export interface Match {
  profileId: string;
  createdAt: number;
}

export interface Message {
  id: string;
  /** 'me' or the other profile's id. */
  from: string;
  text: string;
  ts: number;
}
