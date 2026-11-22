import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import MatchModal from '../components/MatchModal';
import { Hero, InsightsView, ScoreRing, Section } from '../components/ui';
import { AREAS, HABIT_QUESTIONS, HOBBIES, MUSIC, SHOWS, SOCIAL_QUESTION, WEEKENDS, labelOf } from '../data/questions';
import { passesHardFilters } from '../matching/hardFilters';
import { buildInsights } from '../matching/insights';
import { matchScore } from '../matching/score';
import { getProfile, useApp } from '../store/useApp';
import type { Profile, SwipeDir } from '../types';

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Tags({ ids, list }: { ids: string[]; list: { id: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <span key={id} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
          {labelOf(list, id)}
        </span>
      ))}
    </div>
  );
}

function filterSummary(p: Profile) {
  const f = p.filters;
  return [
    f.smokes ? '🚬 מעשן/ת' : '🚭 לא מעשן/ת',
    f.hasPet ? '🐾 יש חיית מחמד' : null,
    !f.okWithPet ? '🙅 בלי חיות מחמד' : null,
    f.keepsKosher ? '✡️ שומר/ת כשרות' : null,
    f.keepsShabbat ? '🕯️ שומר/ת שבת' : null,
  ].filter(Boolean) as string[];
}

export default function CandidateDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useApp((s) => s.me)!;
  const swiped = useApp((s) => s.swipes[id]);
  const isMatch = useApp((s) => s.matches.some((m) => m.profileId === id));
  const swipe = useApp((s) => s.swipe);
  const left = useApp((s) => s.swipesLeft());
  const [showMatch, setShowMatch] = useState(false);
  const other = getProfile(id);
  if (!other) return <Navigate to="/discover" replace />;

  const score = matchScore(me, other);
  const insights = buildInsights(me, other);
  const filter = passesHardFilters(me.filters, other.filters);

  function act(dir: SwipeDir) {
    if (swipe(id, dir)) setShowMatch(true);
    else navigate('/discover');
  }

  const scaleRows = [
    ...HABIT_QUESTIONS.map((q) => ({ q, mine: me.habits[q.key], theirs: other.habits[q.key] })),
    { q: SOCIAL_QUESTION, mine: me.personality.socialBattery, theirs: other.personality.socialBattery },
  ];

  return (
    <div className="pb-28">
      <div className="relative h-72">
        <Hero name={other.name} photo={other.photo} id={other.id} className="h-full w-full" />
        <button type="button" onClick={() => navigate(-1)} className="absolute top-4 right-16 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium shadow">
          → חזרה
        </button>
        <div className="absolute -bottom-8 left-5 rounded-full bg-white p-1 shadow-lg">
          <ScoreRing score={score.total} size={76} />
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div>
          <h1 className="text-2xl font-extrabold">{other.name}, {other.age}</h1>
          <div className="text-slate-600">{other.occupation}</div>
          <p className="mt-2 text-sm text-slate-700">{other.bio}</p>
        </div>

        <Section title="פירוט ההתאמה">
          <div className="space-y-3">
            <Bar label="הרגלי מגורים (60%)" value={score.habits} />
            <Bar label="אישיות ותחומי עניין (40%)" value={score.personality} />
          </div>
          {filter.ok ? (
            <p className="mt-3 text-xs text-emerald-700">✓ עומד/ת בכל תנאי הסף שלך</p>
          ) : (
            <p className="mt-3 text-xs font-medium text-coral-500">✕ לא עומד/ת בתנאי הסף: {filter.reasons.join(', ')}</p>
          )}
        </Section>

        <Section title="חפיפה ופערים">
          <InsightsView insights={insights} otherName={other.name} />
        </Section>

        <Section title="השוואת הרגלים">
          <div className="divide-y divide-slate-100 text-sm">
            <div className="grid grid-cols-3 pb-1.5 text-xs font-bold text-slate-400">
              <span>נושא</span>
              <span>את/ה</span>
              <span>{other.name}</span>
            </div>
            {scaleRows.map(({ q, mine, theirs }) => {
              const gap = Math.abs(mine - theirs);
              return (
                <div key={q.key} className="grid grid-cols-3 py-2">
                  <span className="font-medium">{q.topic}</span>
                  <span>{q.levels[mine - 1]}</span>
                  <span className={gap >= 2 ? 'font-semibold text-amber-600' : gap === 0 ? 'text-emerald-600' : ''}>{q.levels[theirs - 1]}</span>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="תנאים ולוגיסטיקה">
          <div className="space-y-1 text-sm">
            <div>💰 עד ₪{other.filters.maxBudget.toLocaleString('he-IL')} לחודש</div>
            <div>📍 {other.filters.areas.map((a) => labelOf(AREAS, a)).join(', ')}</div>
            <div className="flex flex-wrap gap-x-3">{filterSummary(other).map((t) => <span key={t}>{t}</span>)}</div>
          </div>
        </Section>

        <Section title="אישיות ו-Vibe">
          <div className="space-y-3 text-sm">
            <div>סופ״ש: {WEEKENDS.find((w) => w.id === other.personality.weekend)?.label}</div>
            <Tags ids={other.personality.hobbies} list={HOBBIES} />
            <Tags ids={other.personality.shows} list={SHOWS} />
            <Tags ids={other.personality.music} list={MUSIC} />
          </div>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[430px] gap-3 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-[#12141f] dark:via-[#12141f] px-4 pt-6 pb-4">
        {isMatch ? (
          <Link to={`/chat/${id}`} className="flex-1 rounded-2xl bg-brand-500 py-3 text-center font-bold text-white">
            💬 לצ׳אט עם {other.name}
          </Link>
        ) : swiped ? (
          <div className="flex-1 rounded-2xl bg-white py-3 text-center text-sm text-slate-500 shadow-sm">
            {swiped === 'like' ? 'סימנת שמתאים לך, עדיין אין התאמה הדדית' : 'סימנת „לא הפעם”'}
          </div>
        ) : left > 0 && filter.ok ? (
          <>
            <button type="button" onClick={() => act('pass')} className="flex-1 rounded-2xl bg-white py-3 font-bold text-coral-500 shadow">
              ✕ לא הפעם
            </button>
            <button type="button" onClick={() => act('like')} className="flex-1 rounded-2xl bg-brand-500 py-3 font-bold text-white shadow-lg shadow-brand-500/30">
              ♥ מתאים לי
            </button>
          </>
        ) : null}
      </div>

      {showMatch && <MatchModal me={me} other={other} onClose={() => navigate('/discover')} />}
    </div>
  );
}
