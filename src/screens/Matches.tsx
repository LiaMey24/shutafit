import { Link } from 'react-router-dom';
import { Avatar, ScoreRing } from '../components/ui';
import { matchScore } from '../matching/score';
import { getProfile, useApp } from '../store/useApp';

export default function Matches() {
  const me = useApp((s) => s.me)!;
  const matches = useApp((s) => s.matches);
  const messages = useApp((s) => s.messages);

  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="mb-1 pr-12 text-2xl font-extrabold">ההתאמות שלי</h1>
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
        <ul className="space-y-2">
          {matches.map((m) => {
            const p = getProfile(m.profileId);
            if (!p) return null;
            const thread = messages[p.id] ?? [];
            const last = thread[thread.length - 1];
            return (
              <li key={p.id}>
                <Link to={`/chat/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow">
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
                  <ScoreRing score={matchScore(me, p).total} size={44} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
