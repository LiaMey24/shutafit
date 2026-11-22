import type { ReactNode } from 'react';
import { AREAS } from '../data/questions';
import {
  AGE_RANGE,
  BUDGET_RANGE,
  MOVE_IN_RANGE,
  EMPTY_FILTERS,
  TRAITS,
  activeFilterCount,
  cycleArea,
  isSectionActive,
  resetSection,
  toggleTrait,
  type Section,
  type SearchFilters,
} from '../matching/searchFilters';
import { monthKey, monthLabel } from '../data/moveIn';
import RangeSlider from './RangeSlider';

const shekel = (n: number) => `₪${n.toLocaleString('en-US')}`;

interface Props {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  /** Number of people the current filters leave. */
  count: number;
  onClose: () => void;
}

function Card({ title, subtitle, section, filters, onChange, tone = 'plain', children }: {
  title: string;
  subtitle?: string;
  section: Section;
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  tone?: 'plain' | 'include' | 'exclude';
  children: ReactNode;
}) {
  const bg = tone === 'include' ? 'border-emerald-200 bg-emerald-50' : tone === 'exclude' ? 'border-rose-200 bg-rose-50' : 'border-slate-100 bg-white';
  return (
    <section className={`rounded-3xl border p-4 shadow-sm ${bg}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-extrabold">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <button
          type="button"
          disabled={!isSectionActive(filters, section)}
          onClick={() => onChange(resetSection(filters, section))}
          className="shrink-0 text-xs font-semibold text-brand-600 disabled:text-slate-300"
        >
          איפוס
        </button>
      </div>
      {children}
    </section>
  );
}

const bubble = (on: boolean, color: 'green' | 'red') =>
  `rounded-full border px-3 py-1.5 text-sm transition ${
    on
      ? color === 'green'
        ? 'border-emerald-500 bg-emerald-500 text-white'
        : 'border-rose-500 bg-rose-500 text-white'
      : color === 'green'
        ? 'border-emerald-200 bg-white text-emerald-800'
        : 'border-rose-200 bg-white text-rose-800'
  }`;

export default function FilterSheet({ filters, onChange, count, onClose }: Props) {
  const [aMin, aMax] = filters.age;
  const [bMin, bMax] = filters.budget;
  const [mMin, mMax] = filters.moveIn;
  const moveInLabel = `${mMin === 0 ? 'מיד' : monthLabel(monthKey(mMin))} – ${monthLabel(monthKey(mMax))}${mMax >= MOVE_IN_RANGE.max ? '+' : ''}`;
  const active = activeFilterCount(filters);
  const ageLabel = `${aMin} – ${aMax >= AGE_RANGE.max ? `${AGE_RANGE.max}+` : aMax} שנים`;
  const budgetLabel = `${shekel(bMin)} – ${shekel(bMax)}${bMax >= BUDGET_RANGE.max ? '+' : ''}`;

  return (
    <div role="dialog" aria-modal="true" aria-label="סינון והתאמת שותפים" className="fixed inset-0 z-50 flex justify-center bg-black/40">
      <div className="mx-auto flex h-full w-full max-w-[430px] flex-col bg-slate-50">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <h2 className="text-lg font-extrabold">סינון והתאמת שותפים</h2>
            <p className="text-xs text-slate-500">{active > 0 ? `${active} מסננים פעילים` : 'אין מסננים פעילים'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={active === 0}
              onClick={() => onChange({ ...EMPTY_FILTERS, text: filters.text })}
              className="text-sm font-semibold text-brand-600 disabled:text-slate-300"
            >
              איפוס הכל
            </button>
            <button type="button" onClick={onClose} aria-label="סגירה" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg">
              ✕
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <Card title="טווח גילאים" subtitle="גילאי השותפים הפוטנציאליים" section="age" filters={filters} onChange={onChange}>
            <div className="mb-2 inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-600">{ageLabel}</div>
            <RangeSlider {...AGE_RANGE} value={filters.age} onChange={(age) => onChange({ ...filters, age })} label="גיל" ticks={['18', '25', '32', '40+']} />
          </Card>

          <Card title="תקציב חודשי לחדר" subtitle="שכ״ד מקסימלי לשותף" section="budget" filters={filters} onChange={onChange}>
            <div className="mb-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">{budgetLabel}</div>
            <RangeSlider {...BUDGET_RANGE} value={filters.budget} onChange={(budget) => onChange({ ...filters, budget })} label="תקציב" ticks={['₪1,800', '₪3,000', '₪4,200', '₪5,500+']} />
          </Card>

          <Card title="טווח כניסה" subtitle="מתי את/ה רוצה להיכנס לדירה" section="moveIn" filters={filters} onChange={onChange}>
            <div className="mb-2 inline-block rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-800">{moveInLabel}</div>
            <RangeSlider {...MOVE_IN_RANGE} value={filters.moveIn} onChange={(moveIn) => onChange({ ...filters, moveIn })} label="כניסה" ticks={['מיד', monthLabel(monthKey(4)), monthLabel(monthKey(8)), `${monthLabel(monthKey(11))}+`]} />
          </Card>

          <Card title="אזורים" subtitle="לחיצה: כלול ✓ ← הוצא ✕ ← כבוי" section="areas" filters={filters} onChange={onChange}>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => {
                const inc = filters.includeAreas.includes(a.id);
                const exc = filters.excludeAreas.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onChange(cycleArea(filters, a.id))}
                    className={inc ? bubble(true, 'green') : exc ? bubble(true, 'red') : 'rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700'}
                  >
                    {inc ? '✓ ' : exc ? '✕ ' : ''}
                    {a.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="מגדר שותפים" subtitle="הרכב הדירה המועדף עליך" section="gender" filters={filters} onChange={onChange}>
            <div className="flex rounded-2xl bg-slate-100 p-1">
              {([['all', 'הכל'], ['f', 'נשים'], ['m', 'גברים']] as const).map(([g, label]) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChange({ ...filters, gender: g })}
                  aria-pressed={filters.gender === g}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold ${filters.gender === g ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {filters.gender === g && '✓ '}
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card title="מה שחייב להיות (Include)" subtitle="פרופילים שלא מקיימים תנאים אלו יסוננו החוצה" section="include" filters={filters} onChange={onChange} tone="include">
            <div className="flex flex-wrap gap-2">
              {TRAITS.map((t) => {
                const on = filters.include.includes(t.key);
                return (
                  <button key={t.key} type="button" aria-pressed={on} onClick={() => onChange(toggleTrait(filters, t.key, 'include'))} className={bubble(on, 'green')}>
                    {on ? '✓ ' : ''}
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="קווים אדומים (Exclude)" subtitle="דברים שלא באים בחשבון מבחינתך" section="exclude" filters={filters} onChange={onChange} tone="exclude">
            <div className="flex flex-wrap gap-2">
              {TRAITS.map((t) => {
                const on = filters.exclude.includes(t.key);
                return (
                  <button key={t.key} type="button" aria-pressed={on} onClick={() => onChange(toggleTrait(filters, t.key, 'exclude'))} className={bubble(on, 'red')}>
                    {on ? '✕ ' : ''}
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <footer className="border-t border-slate-200 bg-white p-4">
          <button type="button" onClick={onClose} className="w-full rounded-2xl bg-brand-600 py-3 font-bold text-white shadow-lg shadow-brand-500/30">
            הצג {count} שותפים מתאימים
          </button>
        </footer>
      </div>
    </div>
  );
}
