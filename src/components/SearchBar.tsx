import { activeFilterCount } from '../matching/searchFilters';
import { useFilters } from '../store/useFilters';

/** Text search plus a button that opens the filter sheet. */
export default function SearchBar({ onOpenFilters }: { onOpenFilters: () => void }) {
  const filters = useFilters((s) => s.filters);
  const setFilters = useFilters((s) => s.set);
  const count = activeFilterCount(filters);
  return (
    <div className="flex gap-2">
      <input
        type="search"
        value={filters.text}
        onChange={(e) => setFilters({ ...filters, text: e.target.value })}
        placeholder="חיפוש לפי שם, עיסוק..."
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={onOpenFilters}
        className={`relative rounded-xl px-3 py-2 text-sm font-semibold shadow-sm ${count ? 'bg-brand-600 text-white' : 'bg-white text-slate-700'}`}
      >
        ⚙️ סינון
        {count > 0 && (
          <span className="absolute -top-1.5 -left-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
