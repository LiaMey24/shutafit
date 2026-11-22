/** Move-in month helpers. A month is stored as "YYYY-MM"; filters use months from now (0 = this month). */
const pad = (n: number) => String(n).padStart(2, '0');

export function monthKey(offset: number, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth() + offset, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Months from `from` to a "YYYY-MM" key; past months clamp to 0 ("ready now"). */
export function monthsFromNow(key: string, from = new Date()): number {
  const [y, m] = key.split('-').map(Number);
  return Math.max(0, (y - from.getFullYear()) * 12 + (m - 1 - from.getMonth()));
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
}
