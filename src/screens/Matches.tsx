import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, ScoreRing } from '../components/ui';
import { buildInsights } from '../matching/insights';
import { filterMatches, sortMatches, type MatchFilter, type MatchSort, type MatchRow } from '../matching/matchList';
import { matchScore } from '../matching/score';
import FilterSheet from '../components/FilterSheet';
import SearchBar from '../components/SearchBar';
import { matchesSearch } from '../matching/searchFilters';
import { useFilters } from '../store/useFilters';
import { getProfile, useApp } from '../store/useApp';

const SORTS: { id: MatchSort; label: string }[] = [
  { id: 'newest', label: 'החדשות ביותר' },
  { id: 'score', label: 'התאמה גבוהה' },
];
const FILTERS: { id: MatchFilter; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'new', label: 'חדשות' },
  { id: 'chatting', label: 'בשיחה' },
];

const chip = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs font-semibold transition ${active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 shadow-sm'}`;

export default function Matches() {
  const me = useApp((s) => s.me)!;
  const matches = useApp((s) => s.matches);
  const messages = useApp((s) => s.messages);
  const unmatch = useApp((s) => s.unmatch);
  const [sort, setSort] = useState<MatchSort>('newest');
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const filters = useFilters((s) => s.filters);
  const setFilters = useFilters((s) => s.set);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rows: MatchRow[] = matches.flatMap((match) => {
    const p = getProfile(match.profileId);
    return p ? [{ match, score: matchScore(me, p).total, messages: messages[p.id] ?? [] }] : [];
  });
  const visible = sortMatches(filterMatches(rows, filter), sort).filter((r) => matchesSearch(getProfile(r.match.profileId)!, filters));
  const confirming = confirmId ? getProfile(confirmId) : undefined;

  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="mb-1 text-2xl font-extrabold">ההתאמות שלי</h1>
      <p className="mb-4 text-sm text-slate-500">צ׳אט נפתח רק כששני הצדדים הביעו עניין.</p>

      {matches.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">💞</div>
          <p className="mt-3 text-slate-600">עוד אין התאמות הדדיות.</p>
          <Link to="/discover" className="mt-4 inline-block font-bold text-brand-600">
            לגלות שותפים ←
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-2">
            <SearchBar onOpenFilters={() => setSheetOpen(true)} />
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={chip(filter === f.id)} aria-pressed={filter === f.id}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            מיון:
            {SORTS.map((s) => (
              <button key={s.id} onClick={() => setSort(s.id)} className={chip(sort === s.id)} aria-pressed={sort === s.id}>
                {s.label}
              </button>
            ))}
          </div>

          {visible.length === 0 && <p className="py-6 text-center text-sm text-slate-500">אין התאמות בסינון הזה.</p>}

          <ul className="space-y-2">
            {visible.map(({ match, score, messages: thread }) => {
              const p = getProfile(match.profileId)!;
              const last = thread[thread.length - 1];
              const { shared, gaps } = buildInsights(me, p);
              return (
                <li key={p.id} className="rounded-2xl bg-white p-3 shadow-sm">
                  <Link to={`/chat/${p.id}`} className="flex items-center gap-3">
                    <Avatar name={p.name} photo={p.photo} id={p.id} className="h-14 w-14 text-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-bold">
                        {p.name}
                        {!last && <span className="rounded-full bg-coral-500 px-2 text-[10px] text-white">חדש</span>}
                      </div>
                      <div className="truncate text-sm text-slate-500">
                        {last ? `${last.from === 'me' ? 'את/ה: ' : ''}${last.text}` : 'אמרו שלום 👋'}
                      </div>
                    </div>
                    <ScoreRing score={score} size={44} />
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {shared[0] && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">✓ {shared[0]}</span>}
                    {gaps.length > 0 && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                        ⚠ {gaps.length === 1 ? 'נקודה לתאם' : `${gaps.length} נקודות לתאם`}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-4 border-t border-slate-100 pt-2 text-xs font-semibold">
                    <Link to={`/profile/${p.id}`} className="text-brand-600">
                      לפרופיל המלא
                    </Link>
                    <button onClick={() => setConfirmId(p.id)} className="text-slate-400 hover:text-coral-500">
                      ביטול התאמה
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {sheetOpen && <FilterSheet filters={filters} onChange={setFilters} count={visible.length} onClose={() => setSheetOpen(false)} />}

      {confirming && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-xs rounded-3xl bg-white p-5 text-center shadow-xl">
            <p className="font-bold">לבטל את ההתאמה עם {confirming.name}?</p>
            <p className="mt-1 text-sm text-slate-500">הצ׳אט יימחק והפרופיל לא יופיע שוב בגילוי.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 rounded-xl bg-slate-100 py-2 font-semibold">
                חזרה
              </button>
              <button
                onClick={() => {
                  unmatch(confirming.id);
                  setConfirmId(null);
                }}
                className="flex-1 rounded-xl bg-coral-500 py-2 font-semibold text-white"
              >
                ביטול התאמה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
