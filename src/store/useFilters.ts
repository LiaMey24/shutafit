import { create } from 'zustand';
import { EMPTY_FILTERS, type SearchFilters } from '../matching/searchFilters';

/** Search and filter state shared by Discover and Matches. In memory only. */
interface FiltersState {
  filters: SearchFilters;
  set: (f: SearchFilters) => void;
  reset: () => void;
}

export const useFilters = create<FiltersState>()((set) => ({
  filters: EMPTY_FILTERS,
  set: (filters) => set({ filters }),
  reset: () => set({ filters: EMPTY_FILTERS }),
}));
