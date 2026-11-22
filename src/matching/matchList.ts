import type { Match, Message } from '../types';

export type MatchSort = 'newest' | 'score';
export type MatchFilter = 'all' | 'new' | 'chatting';

export interface MatchRow {
  match: Match;
  score: number;
  messages: Message[];
}

/** Applies the Matches-screen filter chip: "new" = no messages yet. */
export function filterMatches(rows: MatchRow[], filter: MatchFilter): MatchRow[] {
  if (filter === 'all') return rows;
  return rows.filter((r) => (filter === 'new' ? r.messages.length === 0 : r.messages.length > 0));
}

/** Newest first, or best score first (ties broken by newest). Does not mutate. */
export function sortMatches(rows: MatchRow[], sort: MatchSort): MatchRow[] {
  return [...rows].sort((a, b) =>
    sort === 'score' && b.score !== a.score ? b.score - a.score : b.match.createdAt - a.match.createdAt,
  );
}
