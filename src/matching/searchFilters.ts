import { monthsFromNow } from '../data/moveIn';
import type { Gender, Profile } from '../types';

/** Lifestyle conditions from the spec's layer 1 (smoking, pets, kosher, Shabbat). */
export const TRAITS = [
  { key: 'smokes', label: 'מעשן/ת', icon: '🚬' },
  { key: 'hasPet', label: 'חיית מחמד', icon: '🐾' },
  { key: 'keepsKosher', label: 'שומר/ת כשרות', icon: '🍴' },
  { key: 'keepsShabbat', label: 'שומר/ת שבת', icon: '🕯️' },
] as const;
export type TraitKey = (typeof TRAITS)[number]['key'];

/** Slider ranges. The top end of each slider means "no upper limit" (40+ / 5,500+). */
export const AGE_RANGE = { min: 18, max: 40, step: 1 } as const;
export const BUDGET_RANGE = { min: 1800, max: 5500, step: 100 } as const;

/** Move-in window in months from now; the top end means "no upper limit". */
export const MOVE_IN_RANGE = { min: 0, max: 11, step: 1 } as const;

export interface SearchFilters {
  text: string;
  moveIn: [number, number];
  age: [number, number];
  budget: [number, number];
  gender: 'all' | Gender;
  /** Must have the trait (green ✓). */
  include: TraitKey[];
  /** Must not have the trait (red ✕). */
  exclude: TraitKey[];
  includeAreas: string[];
  excludeAreas: string[];
}

export const EMPTY_FILTERS: SearchFilters = {
  text: '',
  moveIn: [MOVE_IN_RANGE.min, MOVE_IN_RANGE.max],
  age: [AGE_RANGE.min, AGE_RANGE.max],
  budget: [BUDGET_RANGE.min, BUDGET_RANGE.max],
  gender: 'all',
  include: [],
  exclude: [],
  includeAreas: [],
  excludeAreas: [],
};

/** Independent sections of the filter sheet, each with its own reset. */
export type Section = 'age' | 'budget' | 'moveIn' | 'gender' | 'include' | 'exclude' | 'areas';

export function resetSection(f: SearchFilters, section: Section): SearchFilters {
  switch (section) {
    case 'age': return { ...f, age: EMPTY_FILTERS.age };
    case 'budget': return { ...f, budget: EMPTY_FILTERS.budget };
    case 'moveIn': return { ...f, moveIn: EMPTY_FILTERS.moveIn };
    case 'gender': return { ...f, gender: 'all' };
    case 'include': return { ...f, include: [] };
    case 'exclude': return { ...f, exclude: [] };
    case 'areas': return { ...f, includeAreas: [], excludeAreas: [] };
  }
}

export function isSectionActive(f: SearchFilters, section: Section): boolean {
  switch (section) {
    case 'age': return f.age[0] !== AGE_RANGE.min || f.age[1] !== AGE_RANGE.max;
    case 'budget': return f.budget[0] !== BUDGET_RANGE.min || f.budget[1] !== BUDGET_RANGE.max;
    case 'moveIn': return f.moveIn[0] !== MOVE_IN_RANGE.min || f.moveIn[1] !== MOVE_IN_RANGE.max;
    case 'gender': return f.gender !== 'all';
    case 'include': return f.include.length > 0;
    case 'exclude': return f.exclude.length > 0;
    case 'areas': return f.includeAreas.length + f.excludeAreas.length > 0;
  }
}

const SECTIONS: Section[] = ['age', 'budget', 'moveIn', 'gender', 'include', 'exclude', 'areas'];

/** Number of active sections (the text search is not counted). */
export function activeFilterCount(f: SearchFilters): number {
  return SECTIONS.filter((s) => isSectionActive(f, s)).length;
}

export function isEmptyFilters(f: SearchFilters): boolean {
  return !f.text.trim() && activeFilterCount(f) === 0;
}

/** Marks a trait as include or exclude; a trait is never in both lists. */
export function toggleTrait(f: SearchFilters, key: TraitKey, list: 'include' | 'exclude'): SearchFilters {
  const other = list === 'include' ? 'exclude' : 'include';
  const on = f[list].includes(key);
  return {
    ...f,
    [list]: on ? f[list].filter((k) => k !== key) : [...f[list], key],
    [other]: f[other].filter((k) => k !== key),
  };
}

/** Area chip cycle: off → include → exclude → off. */
export function cycleArea(f: SearchFilters, id: string): SearchFilters {
  if (f.includeAreas.includes(id))
    return { ...f, includeAreas: f.includeAreas.filter((a) => a !== id), excludeAreas: [...f.excludeAreas, id] };
  if (f.excludeAreas.includes(id)) return { ...f, excludeAreas: f.excludeAreas.filter((a) => a !== id) };
  return { ...f, includeAreas: [...f.includeAreas, id] };
}

export function matchesSearch(p: Profile, f: SearchFilters): boolean {
  const q = f.text.trim().toLowerCase();
  if (q && !`${p.name} ${p.occupation} ${p.bio}`.toLowerCase().includes(q)) return false;

  const [ageMin, ageMax] = f.age;
  if (p.age < ageMin) return false;
  if (ageMax < AGE_RANGE.max && p.age > ageMax) return false;

  const [bMin, bMax] = f.budget;
  if (p.filters.maxBudget < bMin) return false;
  if (bMax < BUDGET_RANGE.max && p.filters.maxBudget > bMax) return false;

  const [mMin, mMax] = f.moveIn;
  if (mMin !== MOVE_IN_RANGE.min || mMax !== MOVE_IN_RANGE.max) {
    if (!p.moveIn) return false;
    const m = monthsFromNow(p.moveIn);
    if (m < mMin || (mMax < MOVE_IN_RANGE.max && m > mMax)) return false;
  }

  if (f.gender !== 'all' && p.gender !== f.gender) return false;

  const areas = p.filters.areas;
  if (f.includeAreas.length && !f.includeAreas.some((a) => areas.includes(a))) return false;
  if (f.excludeAreas.some((a) => areas.includes(a))) return false;

  if (f.include.some((k) => !p.filters[k])) return false;
  if (f.exclude.some((k) => p.filters[k])) return false;
  return true;
}
