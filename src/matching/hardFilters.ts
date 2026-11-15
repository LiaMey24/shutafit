import type { HardFilters } from '../types';

/** Budgets are compatible when the lower one is at least this share of the higher one. */
export const BUDGET_RATIO = 0.7;

export interface FilterResult {
  ok: boolean;
  reasons: string[];
}

/** Checks one direction: does `b` break any deal-breaker that `a` has set? */
function oneWay(a: HardFilters, b: HardFilters, reasons: string[]) {
  if (b.smokes && !a.okWithSmoker) reasons.push('עישון');
  if (b.hasPet && !a.okWithPet) reasons.push('חיית מחמד');
  if (a.keepsKosher && a.kosherIsDealBreaker && !b.keepsKosher) reasons.push('כשרות');
  if (a.keepsShabbat && a.shabbatIsDealBreaker && !b.keepsShabbat) reasons.push('שמירת שבת');
}

/**
 * Layer 1: symmetric hard filter. If any deal-breaker clashes, the two
 * profiles are never shown to each other.
 */
export function passesHardFilters(a: HardFilters, b: HardFilters): FilterResult {
  const reasons: string[] = [];

  const lo = Math.min(a.maxBudget, b.maxBudget);
  const hi = Math.max(a.maxBudget, b.maxBudget);
  if (hi > 0 && lo / hi < BUDGET_RATIO) reasons.push('תקציב');

  if (!a.areas.some((x) => b.areas.includes(x))) reasons.push('אזור');

  oneWay(a, b, reasons);
  oneWay(b, a, reasons);

  return { ok: reasons.length === 0, reasons: [...new Set(reasons)] };
}
