import { describe, expect, it, vi } from 'vitest';

// The store persists to localStorage, which the node test environment lacks.
vi.hoisted(() => {
  (globalThis as { localStorage?: unknown }).localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
});
import type { Profile } from '../types';
import { passesHardFilters } from './hardFilters';
import { buildInsights } from './insights';
import { jaccard, matchScore } from './score';
import { monthKey } from '../data/moveIn';
import { EMPTY_FILTERS, activeFilterCount, cycleArea, matchesSearch, resetSection, toggleTrait, type SearchFilters } from './searchFilters';
import { filterMatches, sortMatches, type MatchRow } from './matchList';
import { useApp } from '../store/useApp';

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

describe('matches list', () => {
  const row = (id: string, createdAt: number, score: number, msgs = 0): MatchRow => ({
    match: { profileId: id, createdAt },
    score,
    messages: Array.from({ length: msgs }, (_, i) => ({ id: `${id}${i}`, from: 'me', text: 'hi', ts: i })),
  });
  const rows = [row('a', 1, 90, 1), row('b', 3, 60), row('c', 2, 90)];

  it('sorts newest first and by score with newest as tiebreak', () => {
    expect(sortMatches(rows, 'newest').map((r) => r.match.profileId)).toEqual(['b', 'c', 'a']);
    expect(sortMatches(rows, 'score').map((r) => r.match.profileId)).toEqual(['c', 'a', 'b']);
  });

  it('filters new vs chatting', () => {
    expect(filterMatches(rows, 'new').map((r) => r.match.profileId)).toEqual(['b', 'c']);
    expect(filterMatches(rows, 'chatting').map((r) => r.match.profileId)).toEqual(['a']);
    expect(filterMatches(rows, 'all')).toHaveLength(3);
  });

  it('unmatch removes match and chat but keeps the swipe', () => {
    const s = useApp.getState();
    useApp.setState({
      swipes: { a: 'like' },
      matches: [{ profileId: 'a', createdAt: 1 }],
      messages: { a: [{ id: '1', from: 'me', text: 'hi', ts: 1 }] },
    });
    s.unmatch('a');
    const after = useApp.getState();
    expect(after.matches).toEqual([]);
    expect(after.messages.a).toBeUndefined();
    expect(after.swipes.a).toBe('like');
  });
});

describe('search filters', () => {
  const p = makeProfile({ age: 26, gender: 'f', filters: { ...makeProfile().filters, maxBudget: 3000, areas: ['tlv', 'haifa'] } });
  const f = (o: Partial<SearchFilters>): SearchFilters => ({ ...EMPTY_FILTERS, ...o });

  it('filters by age and budget range; the top end means no limit', () => {
    expect(matchesSearch(p, f({ age: [25, 30] }))).toBe(true);
    expect(matchesSearch(p, f({ age: [18, 25] }))).toBe(false);
    expect(matchesSearch(p, f({ budget: [3500, 5500] }))).toBe(false);
    expect(matchesSearch(p, f({ budget: [1800, 2500] }))).toBe(false);
    expect(matchesSearch(makeProfile({ age: 55 }), f({ age: [30, 40] }))).toBe(true);
  });

  it('filters by move-in window', () => {
    const soon = makeProfile({ moveIn: monthKey(1) });
    expect(matchesSearch(soon, f({ moveIn: [0, 2] }))).toBe(true);
    expect(matchesSearch(soon, f({ moveIn: [3, 6] }))).toBe(false);
    expect(matchesSearch(makeProfile({ moveIn: monthKey(11) }), f({ moveIn: [5, 11] }))).toBe(true);
    expect(matchesSearch(makeProfile(), f({ moveIn: [0, 3] }))).toBe(false);
    expect(matchesSearch(makeProfile(), f({}))).toBe(true);
  });

  it('filters by gender', () => {
    expect(matchesSearch(p, f({ gender: 'f' }))).toBe(true);
    expect(matchesSearch(p, f({ gender: 'm' }))).toBe(false);
    expect(matchesSearch(makeProfile(), f({ gender: 'f' }))).toBe(false);
  });

  it('includes and excludes lifestyle traits, never both', () => {
    const smoker = withFilters({ smokes: true });
    expect(matchesSearch(smoker, f({ include: ['smokes'] }))).toBe(true);
    expect(matchesSearch(smoker, f({ exclude: ['smokes'] }))).toBe(false);
    expect(matchesSearch(p, f({ include: ['smokes'] }))).toBe(false);
    expect(matchesSearch(p, f({ exclude: ['smokes'] }))).toBe(true);
    const both = toggleTrait(toggleTrait(EMPTY_FILTERS, 'smokes', 'include'), 'smokes', 'exclude');
    expect(both.include).toEqual([]);
    expect(both.exclude).toEqual(['smokes']);
  });

  it('includes and excludes areas', () => {
    expect(matchesSearch(p, f({ includeAreas: ['jlm', 'tlv'] }))).toBe(true);
    expect(matchesSearch(p, f({ includeAreas: ['jlm'] }))).toBe(false);
    expect(matchesSearch(p, f({ excludeAreas: ['haifa'] }))).toBe(false);
    expect(matchesSearch(p, f({ excludeAreas: ['jlm'] }))).toBe(true);
    expect(cycleArea(cycleArea(EMPTY_FILTERS, 'tlv'), 'tlv').excludeAreas).toEqual(['tlv']);
  });

  it('each section resets on its own', () => {
    const busy = f({ age: [20, 25], budget: [2000, 3000], gender: 'f', include: ['hasPet'], exclude: ['smokes'], includeAreas: ['tlv'] });
    expect(activeFilterCount(busy)).toBe(6);
    const afterAge = resetSection(busy, 'age');
    expect(afterAge.age).toEqual(EMPTY_FILTERS.age);
    expect(afterAge.budget).toEqual([2000, 3000]);
    expect(afterAge.include).toEqual(['hasPet']);
    expect(resetSection(busy, 'areas').includeAreas).toEqual([]);
    expect(activeFilterCount(resetSection(resetSection(busy, 'include'), 'exclude'))).toBe(4);
  });
});
