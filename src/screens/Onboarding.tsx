import { monthKey, monthLabel } from '../data/moveIn';
import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AREAS, HABIT_QUESTIONS, HOBBIES, MUSIC, SHOWS, SOCIAL_QUESTION, WEEKENDS } from '../data/questions';
import { useApp } from '../store/useApp';
import type { Profile } from '../types';
import { Avatar, ChipSelect, PrimaryButton, ScalePicker, Section, YesNo } from '../components/ui';

const STEPS = [
  { title: 'נעים להכיר', sub: 'הפרופיל שלך מציג את האדם, לא את הדירה.' },
  { title: 'תנאי סף', sub: 'מה שלא מתאים כאן, לא יוצג לך בכלל.' },
  { title: 'הרגלי מגורים', sub: 'תרחישים מהיומיום. אין תשובה נכונה, רק כנה.' },
  { title: 'אישיות ו-Vibe', sub: 'על מה נדבר בסלון?' },
];

function emptyProfile(): Profile {
  return {
    id: 'me',
    name: '',
    age: 0,
    occupation: '',
    bio: '',
    filters: {
      maxBudget: 3000,
      areas: [],
      smokes: false,
      okWithSmoker: false,
      hasPet: false,
      okWithPet: true,
      keepsKosher: false,
      kosherIsDealBreaker: false,
      keepsShabbat: false,
      shabbatIsDealBreaker: false,
    },
    habits: { cleanliness: 0, sleep: 0, presence: 0, guests: 0, noise: 0 },
    personality: { socialBattery: 0, weekend: '' as Profile['personality']['weekend'], hobbies: [], shows: [], music: [] },
  };
}

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none focus:border-brand-400';

export default function Onboarding() {
  const existing = useApp((s) => s.me);
  const saveProfile = useApp((s) => s.saveProfile);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Profile>(existing ?? emptyProfile());

  const setF = (patch: Partial<Profile['filters']>) => setD({ ...d, filters: { ...d.filters, ...patch } });
  const setH = (patch: Partial<Profile['habits']>) => setD({ ...d, habits: { ...d.habits, ...patch } });
  const setP = (patch: Partial<Profile['personality']>) => setD({ ...d, personality: { ...d.personality, ...patch } });

  const valid = [
    d.name.trim().length > 0 && d.age >= 16 && d.age <= 99,
    d.filters.areas.length > 0,
    Object.values(d.habits).every((v) => v > 0),
    d.personality.socialBattery > 0 && !!d.personality.weekend && d.personality.hobbies.length > 0,
  ][step];

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Downscale so the photo fits comfortably in localStorage.
    const img = new Image();
    img.onload = () => {
      const size = 320;
      const canvas = document.createElement('canvas');
      const scale = size / Math.min(img.width, img.height);
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, (size - img.width * scale) / 2, (size - img.height * scale) / 2, img.width * scale, img.height * scale);
      setD((cur) => ({ ...cur, photo: canvas.toDataURL('image/jpeg', 0.8) }));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      saveProfile({ ...d, name: d.name.trim() });
      navigate('/discover');
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 bg-slate-50/95 px-5 pt-5 pb-3 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xl font-extrabold text-brand-600">Shutafit</span>
          <span className="text-sm text-slate-500">שלב {step + 1} מתוך {STEPS.length}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-slate-200'}`} />
          ))}
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">{STEPS[step].title}</h1>
        <p className="text-sm text-slate-500">{STEPS[step].sub}</p>
      </header>

      <main className="flex-1 space-y-4 px-5 pb-6">
        {step === 0 && (
          <>
            <div className="flex items-center gap-4">
              <Avatar name={d.name || '?'} photo={d.photo} id="me" className="h-20 w-20 text-3xl" />
              <label className="cursor-pointer rounded-xl border border-dashed border-brand-400 px-4 py-2 text-sm font-medium text-brand-600">
                {d.photo ? 'החלפת תמונה' : 'הוספת תמונה'}
                <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium">שם פרטי</span>
              <input className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">גיל</span>
              <input className={input} type="number" inputMode="numeric" min={16} max={99} value={d.age || ''} onChange={(e) => setD({ ...d, age: Number(e.target.value) })} />
            </label>
            <div className="space-y-1">
              <span className="text-sm font-medium">מגדר</span>
              <div className="flex gap-2">
                {([['f', 'אישה'], ['m', 'גבר']] as const).map(([g, label]) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setD({ ...d, gender: d.gender === g ? undefined : g })}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm ${d.gender === g ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium">מועד כניסה מבוקש</span>
              <select className={input} value={d.moveIn ?? ''} onChange={(e) => setD({ ...d, moveIn: e.target.value || undefined })}>
                <option value="">לא משנה</option>
                {Array.from({ length: 12 }, (_, i) => monthKey(i)).map((k) => (
                  <option key={k} value={k}>{monthLabel(k)}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">עיסוק</span>
              <input className={input} placeholder="למשל: סטודנט/ית לעיצוב" value={d.occupation} onChange={(e) => setD({ ...d, occupation: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">קצת עליי</span>
              <textarea className={`${input} min-h-24`} maxLength={200} placeholder="מה חשוב לך בבית משותף?" value={d.bio} onChange={(e) => setD({ ...d, bio: e.target.value })} />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <Section title="תקציב ואזור">
              <label className="block">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">שכר דירה מקסימלי לחודש (לאדם)</span>
                  <b className="text-brand-600">₪{d.filters.maxBudget.toLocaleString('he-IL')}</b>
                </div>
                <input type="range" min={1500} max={6000} step={100} value={d.filters.maxBudget} onChange={(e) => setF({ maxBudget: Number(e.target.value) })} className="mt-2 w-full accent-brand-500" />
              </label>
              <div className="mt-3 mb-2 text-sm font-medium">אזורים מבוקשים</div>
              <ChipSelect options={AREAS} value={d.filters.areas} onChange={(areas) => setF({ areas })} />
            </Section>
            <Section title="עישון">
              <YesNo label="אני מעשן/ת" value={d.filters.smokes} onChange={(smokes) => setF({ smokes })} />
              <YesNo label="מוכן/ה לגור עם מעשן/ת" value={d.filters.okWithSmoker} onChange={(okWithSmoker) => setF({ okWithSmoker })} />
            </Section>
            <Section title="חיות מחמד">
              <YesNo label="יש לי חיית מחמד" value={d.filters.hasPet} onChange={(hasPet) => setF({ hasPet })} />
              <YesNo label="מוכן/ה לגור עם חיית מחמד" hint="לא = למשל אלרגיה" value={d.filters.okWithPet} onChange={(okWithPet) => setF({ okWithPet })} />
            </Section>
            <Section title="כשרות ושבת">
              <YesNo label="שומר/ת כשרות" value={d.filters.keepsKosher} onChange={(keepsKosher) => setF({ keepsKosher, kosherIsDealBreaker: keepsKosher && d.filters.kosherIsDealBreaker })} />
              {d.filters.keepsKosher && (
                <YesNo label="מטבח כשר הוא תנאי סף" value={d.filters.kosherIsDealBreaker} onChange={(kosherIsDealBreaker) => setF({ kosherIsDealBreaker })} />
              )}
              <YesNo label="שומר/ת שבת" value={d.filters.keepsShabbat} onChange={(keepsShabbat) => setF({ keepsShabbat, shabbatIsDealBreaker: keepsShabbat && d.filters.shabbatIsDealBreaker })} />
              {d.filters.keepsShabbat && (
                <YesNo label="שמירת שבת בבית היא תנאי סף" value={d.filters.shabbatIsDealBreaker} onChange={(shabbatIsDealBreaker) => setF({ shabbatIsDealBreaker })} />
              )}
            </Section>
          </>
        )}

        {step === 2 &&
          HABIT_QUESTIONS.map((q) => (
            <Section key={q.key} title={q.topic}>
              <ScalePicker question={q.question} options={q.options} value={d.habits[q.key]} onChange={(v) => setH({ [q.key]: v })} />
            </Section>
          ))}

        {step === 3 && (
          <>
            <Section title={SOCIAL_QUESTION.topic}>
              <ScalePicker question={SOCIAL_QUESTION.question} options={SOCIAL_QUESTION.options} value={d.personality.socialBattery} onChange={(socialBattery) => setP({ socialBattery })} />
            </Section>
            <Section title="איך נראה סופ״ש טיפוסי?">
              <ChipSelect options={WEEKENDS} value={[d.personality.weekend]} onChange={(v) => setP({ weekend: (v[v.length - 1] ?? d.personality.weekend) as Profile['personality']['weekend'] })} />
            </Section>
            <Section title="תחביבים ופנאי (עד 5)">
              <ChipSelect options={HOBBIES} value={d.personality.hobbies} max={5} onChange={(hobbies) => setP({ hobbies })} />
            </Section>
            <Section title="סדרות וסרטים">
              <ChipSelect options={SHOWS} value={d.personality.shows} onChange={(shows) => setP({ shows })} />
            </Section>
            <Section title="מה מתנגן ברקע?">
              <ChipSelect options={MUSIC} value={d.personality.music} onChange={(music) => setP({ music })} />
            </Section>
          </>
        )}
      </main>

      <footer className="sticky bottom-0 flex gap-3 bg-slate-50/95 px-5 py-4 backdrop-blur">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-600">
            חזרה
          </button>
        )}
        <PrimaryButton className="flex-1" disabled={!valid} onClick={next}>
          {step === STEPS.length - 1 ? (existing ? 'שמירה' : 'בואו נמצא שותפים') : 'המשך'}
        </PrimaryButton>
      </footer>
    </div>
  );
}
