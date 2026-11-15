import { useNavigate } from 'react-router-dom';
import { Avatar, Section } from '../components/ui';
import { AREAS, HABIT_QUESTIONS, HOBBIES, SOCIAL_QUESTION, WEEKENDS, labelOf } from '../data/questions';
import { useApp } from '../store/useApp';

export default function MyProfile() {
  const navigate = useNavigate();
  const me = useApp((s) => s.me)!;
  const swiped = useApp((s) => Object.keys(s.swipes).length);
  const matchCount = useApp((s) => s.matches.length);
  const premium = useApp((s) => s.premium);
  const setPremium = useApp((s) => s.setPremium);
  const reset = useApp((s) => s.reset);
  const f = me.filters;

  const dealBreakers = [
    !f.okWithSmoker && 'בלי מעשנים',
    !f.okWithPet && 'בלי חיות מחמד',
    f.kosherIsDealBreaker && 'מטבח כשר',
    f.shabbatIsDealBreaker && 'שמירת שבת',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4 px-4 pt-5 pb-6">
      <div className="flex items-center gap-4">
        <Avatar name={me.name} photo={me.photo} id="me" className="h-20 w-20 text-3xl" />
        <div>
          <h1 className="text-2xl font-extrabold">{me.name}, {me.age}</h1>
          <div className="text-slate-600">{me.occupation}</div>
          <div className="mt-1 text-xs text-slate-500">{swiped} החלקות · {matchCount} התאמות</div>
        </div>
      </div>
      {me.bio && <p className="text-sm text-slate-700">{me.bio}</p>}

      <Section title="תנאי סף">
        <div className="space-y-1 text-sm">
          <div>💰 עד ₪{f.maxBudget.toLocaleString('he-IL')} · 📍 {f.areas.map((a) => labelOf(AREAS, a)).join(', ')}</div>
          <div>{dealBreakers.length ? `🚫 ${dealBreakers.join(' · ')}` : 'אין תנאי סף נוספים'}</div>
        </div>
      </Section>

      <Section title="הרגלים ואישיות">
        <ul className="space-y-1 text-sm">
          {HABIT_QUESTIONS.map((q) => (
            <li key={q.key}>
              <b className="font-medium">{q.topic}:</b> {q.levels[me.habits[q.key] - 1]}
            </li>
          ))}
          <li>
            <b className="font-medium">{SOCIAL_QUESTION.topic}:</b> {SOCIAL_QUESTION.levels[me.personality.socialBattery - 1]}
          </li>
          <li>
            <b className="font-medium">סופ״ש:</b> {WEEKENDS.find((w) => w.id === me.personality.weekend)?.label}
          </li>
          <li>
            <b className="font-medium">תחביבים:</b> {me.personality.hobbies.map((h) => labelOf(HOBBIES, h)).join(', ')}
          </li>
        </ul>
      </Section>

      <button type="button" onClick={() => navigate('/onboarding')} className="w-full rounded-2xl bg-brand-500 py-3 font-bold text-white">
        עריכת פרופיל ושאלון
      </button>

      <Section title="מנוי">
        <div className="flex items-center justify-between text-sm">
          <span>{premium ? '⭐ Premium פעיל (הדמיה)' : 'חינמי · 10 החלקות ביום'}</span>
          <button type="button" onClick={() => setPremium(!premium)} className="font-bold text-brand-600">
            {premium ? 'חזרה לחינמי' : 'שדרוג (הדמיה)'}
          </button>
        </div>
      </Section>

      <button
        type="button"
        onClick={() => {
          if (confirm('לאפס את כל נתוני הדמו (פרופיל, החלקות, התאמות והודעות)?')) {
            reset();
            navigate('/onboarding');
          }
        }}
        className="w-full py-2 text-sm text-slate-400 underline"
      >
        איפוס נתוני הדמו
      </button>
    </div>
  );
}
