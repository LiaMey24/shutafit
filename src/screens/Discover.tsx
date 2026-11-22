import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SwipeCard, { type SwipeCardHandle } from '../components/SwipeCard';
import MatchModal from '../components/MatchModal';
import { PrimaryButton } from '../components/ui';
import { SEED_PROFILES } from '../data/seedProfiles';
import { buildDeck, FREE_SWIPES_PER_DAY, getProfile, useApp } from '../store/useApp';
import type { SwipeDir } from '../types';

export default function Discover() {
  const me = useApp((s) => s.me)!;
  const swipes = useApp((s) => s.swipes);
  const swipe = useApp((s) => s.swipe);
  const left = useApp((s) => s.swipesLeft());
  const premium = useApp((s) => s.premium);
  const setPremium = useApp((s) => s.setPremium);
  const [matchedId, setMatchedId] = useState<string | null>(null);
  const cardRef = useRef<SwipeCardHandle>(null);
  const { key } = useLocation();

  // Tapping the global Home button while on /discover dismisses the match overlay.
  useEffect(() => setMatchedId(null), [key]);

  const deck = useMemo(() => buildDeck(me, swipes), [me, swipes]);
  const filteredOut = SEED_PROFILES.length - Object.keys(swipes).length - deck.length;
  const top = deck[0];
  const matched = matchedId ? getProfile(matchedId) : undefined;

  function onSwiped(dir: SwipeDir) {
    if (!top) return;
    if (swipe(top.profile.id, dir)) setMatchedId(top.profile.id);
  }

  return (
    <div className="flex h-[calc(100dvh-58px)] flex-col px-4 pt-4 pb-3">
      <header className="mb-3 flex items-center justify-between pr-12">
        <h1 className="text-xl font-extrabold text-brand-600">Shutafit</h1>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
          {premium ? '⭐ Premium · ללא הגבלה' : `נותרו ${left}/${FREE_SWIPES_PER_DAY} החלקות היום`}
        </span>
      </header>

      <div className="relative flex-1">
        {left <= 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="text-5xl">⭐</div>
            <h2 className="mt-3 text-xl font-extrabold">נגמרו ההחלקות להיום</h2>
            <p className="mt-1 text-sm text-slate-500">בגרסה החינמית יש {FREE_SWIPES_PER_DAY} החלקות ביום. Premium נותן החלקות ללא הגבלה, בלי פרסומות וחשיפה מוגברת.</p>
            <PrimaryButton className="mt-5" onClick={() => setPremium(true)}>
              לנסות Premium (הדמיה)
            </PrimaryButton>
          </div>
        ) : top ? (
          <>
            {deck[1] && <div className="absolute inset-x-3 top-3 bottom-0 rounded-3xl bg-white/70 shadow" />}
            <SwipeCard key={top.profile.id} ref={cardRef} me={me} profile={top.profile} score={top.score} onSwiped={onSwiped} />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="text-5xl">🏁</div>
            <h2 className="mt-3 text-xl font-extrabold">עברת על כל המועמדים</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredOut > 0 && `${filteredOut} פרופילים הוסתרו בגלל תנאי הסף שלך. `}
              אפשר לעדכן תנאי סף בפרופיל.
            </p>
          </div>
        )}
      </div>

      {top && left > 0 && (
        <div className="flex items-center justify-center gap-8 pt-4">
          <button
            type="button"
            aria-label="לא הפעם"
            onClick={() => cardRef.current?.fly('pass')}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-coral-500 shadow-lg transition hover:scale-105"
          >
            ✕
          </button>
          <button
            type="button"
            aria-label="מתאים לי"
            onClick={() => cardRef.current?.fly('like')}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-3xl text-white shadow-lg shadow-brand-500/30 transition hover:scale-105"
          >
            ♥
          </button>
        </div>
      )}

      {matched && <MatchModal me={me} other={matched} onClose={() => setMatchedId(null)} />}
    </div>
  );
}
