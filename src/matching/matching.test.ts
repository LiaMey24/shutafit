import { describe, expect, it } from 'vitest';
import type { Profile } from '../types';
import { passesHardFilters } from './hardFilters';
import { buildInsights } from './insights';
import { jaccard, matchScore } from './score';

function makeProfile(over: Partial<Profile> = {}): Profile {
  return {
    id: 'x',
    name: 'בדיקה',
    age: 25,
    occupation: '',
    bio: '',
    filters: {
      maxBudget: 3000,
      areas: ['tlv'],
      smokes: false,
      okWithSmoker: true,
      hasPet: false,
      okWithPet: true,
      keepsKosher: false,
      kosherIsDealBreaker: false,
      keepsShabbat: false,
      shabbatIsDealBreaker: false,
    },
    habits: { cleanliness: 3, sleep: 3, presence: 3, guests: 3, noise: 3 },
    personality: {
      socialBattery: 3,
      weekend: 'couch',
      hobbies: ['gaming', 'cooking'],
      shows: ['comedy'],
      music: ['indie'],
    },
    ...over,
  };
}

const withFilters = (f: Partial<Profile['filters']>) =>
  makeProfile({ filters: { ...makeProfile().filters, ...f } });

describe('hard filters', () => {
  it('lets two compatible profiles through', () => {
    expect(passesHardFilters(makeProfile().filters, makeProfile().filters).ok).toBe(true);
  });

  it('blocks a smoker for someone who does not accept smokers, in both directions', () => {
    const smoker = withFilters({ smokes: true });
    const strict = withFilters({ okWithSmoker: false });
    expect(passesHardFilters(smoker.filters, strict.filters)).toEqual({ ok: false, reasons: ['עישון'] });
    expect(passesHardFilters(strict.filters, smoker.filters).ok).toBe(false);
  });

  it('blocks a pet owner for someone with an allergy', () => {
    const cat = withFilters({ hasPet: true });
    const allergic = withFilters({ okWithPet: false });
    expect(passesHardFilters(cat.filters, allergic.filters).reasons).toContain('חיית מחמד');
  });

  it('blocks only when kashrut is marked as a deal-breaker', () => {
    const soft = withFilters({ keepsKosher: true });
    const strict = withFilters({ keepsKosher: true, kosherIsDealBreaker: true });
    const none = makeProfile();
    expect(passesHardFilters(soft.filters, none.filters).ok).toBe(true);
    expect(passesHardFilters(strict.filters, none.filters).reasons).toEqual(['כשרות']);
    expect(passesHardFilters(strict.filters, soft.filters).ok).toBe(true);
  });

  it('blocks when there is no shared area or budgets are far apart', () => {
    expect(passesHardFilters(makeProfile().filters, withFilters({ areas: ['haifa'] }).filters).reasons).toEqual(['אזור']);
    expect(passesHardFilters(makeProfile().filters, withFilters({ maxBudget: 1800 }).filters).reasons).toEqual(['תקציב']);
    expect(passesHardFilters(makeProfile().filters, withFilters({ maxBudget: 2400 }).filters).ok).toBe(true);
  });
});

describe('match score', () => {
  it('gives 100 for identical answers', () => {
    expect(matchScore(makeProfile(), makeProfile()).total).toBe(100);
  });

  it('drops when habits are opposite', () => {
    const a = makeProfile({ habits: { cleanliness: 1, sleep: 1, presence: 1, guests: 1, noise: 1 } });
    const b = makeProfile({ habits: { cleanliness: 5, sleep: 5, presence: 5, guests: 5, noise: 5 } });
    const s = matchScore(a, b);
    expect(s.habits).toBe(0);
    expect(s.total).toBe(40); // personality identical → only the 40% personality share remains
  });

  it('jaccard is neutral when a list is empty', () => {
    expect(jaccard([], ['a'])).toBe(0.5);
    expect(jaccard(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3);
  });
});

describe('insights', () => {
  it('reports big habit gaps and shared hobbies', () => {
    const me = makeProfile({ habits: { cleanliness: 3, sleep: 1, presence: 3, guests: 3, noise: 3 } });
    const other = makeProfile({ habits: { cleanliness: 3, sleep: 5, presence: 4, guests: 3, noise: 3 } });
    const { gaps, shared } = buildInsights(me, other);
    expect(gaps).toEqual([{ topic: 'שעות שינה', mine: 'ציפור בוקר', theirs: 'ציפור לילה', size: 4 }]);
    expect(shared.some((s) => s.startsWith('תחביבים'))).toBe(true);
    expect(shared.some((s) => s.startsWith('נוכחות'))).toBe(false); // gap of 1 is neither shared nor friction
  });
});
