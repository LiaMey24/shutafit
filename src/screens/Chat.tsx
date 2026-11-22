import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Avatar, GapItem } from '../components/ui';
import { buildInsights } from '../matching/insights';
import { matchScore } from '../matching/score';
import { getProfile, randomReply, useApp } from '../store/useApp';
import type { Message } from '../types';

const EMPTY: Message[] = [];

export default function Chat() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useApp((s) => s.me)!;
  const isMatch = useApp((s) => s.matches.some((m) => m.profileId === id));
  const thread = useApp((s) => s.messages[id] ?? EMPTY);
  const sendMessage = useApp((s) => s.sendMessage);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [showGaps, setShowGaps] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const other = getProfile(id);
  const insights = useMemo(() => (other ? buildInsights(me, other) : null), [me, other]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, typing]);

  if (!other || !isMatch || !insights) return <Navigate to="/matches" replace />;
  const hasGaps = insights.gaps.length > 0;

  function send(msg: string) {
    const t = msg.trim();
    if (!t) return;
    sendMessage(id, t);
    setText('');
    // Demo: the other side replies after a short pause.
    setTyping(true);
    setTimeout(() => {
      sendMessage(id, randomReply(hasGaps), id);
      setTyping(false);
    }, 1400);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
  }

  const time = (ts: number) => new Date(ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white py-3 pr-16 pl-4">
        <button type="button" onClick={() => navigate('/matches')} className="text-xl text-slate-500" aria-label="חזרה">
          →
        </button>
        <Link to={`/profile/${id}`} className="flex flex-1 items-center gap-3">
          <Avatar name={other.name} photo={other.photo} id={other.id} className="h-10 w-10" />
          <div>
            <div className="font-bold">{other.name}</div>
            <div className="text-xs text-slate-500">{matchScore(me, other).total}% התאמה · לפרופיל</div>
          </div>
        </Link>
      </header>

      {insights.gaps.length > 0 && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5">
          <button type="button" onClick={() => setShowGaps(!showGaps)} className="flex w-full items-center justify-between text-sm font-bold text-amber-800">
            ⚡ כדאי לתאם ציפיות לגבי {insights.gaps.length} נושאים
            <span>{showGaps ? '▲' : '▼'}</span>
          </button>
          {showGaps && (
            <>
              <ul className="mt-2 space-y-1 text-amber-900">
                {insights.gaps.map((g) => (
                  <GapItem key={g.topic} gap={g} otherName={other.name} />
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {insights.gaps.map((g) => (
                  <button
                    key={g.topic}
                    type="button"
                    onClick={() => send(`היי! ראיתי שיש בינינו פער ב${g.topic}. איך את/ה רואה את זה?`)}
                    className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs text-amber-800"
                  >
                    לשאול על {g.topic}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            זו תחילת השיחה שלכם.{' '}
            {insights.gaps.length > 0 ? 'אפשר לפתוח באחד הנושאים למעלה.' : 'אין ביניכם פערים משמעותיים, אז אפשר פשוט להגיד שלום 👋'}
          </p>
        )}
        {thread.map((m) => {
          const mine = m.from === 'me';
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-md bg-brand-500 text-white' : 'rounded-bl-md bg-white text-slate-800 shadow-sm'}`}>
                {m.text}
                <div className={`mt-0.5 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>{time(m.ts)}</div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-end">
            <div className="rounded-2xl bg-white px-3.5 py-2 text-sm text-slate-400 shadow-sm">{other.name} מקליד/ה…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="כתיבת הודעה…"
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:border-brand-400"
        />
        <button type="submit" disabled={!text.trim()} className="rounded-full bg-brand-500 px-5 font-bold text-white disabled:opacity-40">
          שליחה
        </button>
      </form>
    </div>
  );
}
