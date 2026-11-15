import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Option } from '../data/questions';
import type { Gap, Insights } from '../matching/insights';

const GRADIENTS = [
  'from-brand-400 to-brand-700',
  'from-coral-400 to-brand-500',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-coral-500',
  'from-sky-400 to-brand-600',
  'from-pink-400 to-fuchsia-600',
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, photo, id, className = 'h-12 w-12 text-lg' }: { name: string; photo?: string; id: string; className?: string }) {
  if (photo) return <img src={photo} alt={name} className={`${className} rounded-full object-cover`} />;
  return (
    <div className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${GRADIENTS[hash(id) % GRADIENTS.length]}`}>
      {name.slice(0, 1)}
    </div>
  );
}

/** Large hero image for cards: photo or a gradient with the initial. */
export function Hero({ name, photo, id, className = '' }: { name: string; photo?: string; id: string; className?: string }) {
  if (photo) return <img src={photo} alt={name} className={`${className} object-cover`} draggable={false} />;
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br text-8xl font-extrabold text-white/90 ${GRADIENTS[hash(id) % GRADIENTS.length]}`}>
      {name.slice(0, 1)}
    </div>
  );
}

export function scoreColor(score: number) {
  if (score >= 75) return '#16a34a';
  if (score >= 55) return '#7357f6';
  return '#f59e0b';
}

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="white" stroke="#ece9f8" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-extrabold text-slate-800" style={{ fontSize: size * 0.28 }}>{score}%</span>
        {size >= 64 && <span className="mt-0.5 text-[10px] text-slate-500">התאמה</span>}
      </div>
    </div>
  );
}

export function ChipSelect({ options, value, onChange, max }: { options: Option[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              if (on) onChange(value.filter((x) => x !== o.id));
              else if (!max || value.length < max) onChange([...value, o.id]);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
              on ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ScalePicker({ question, options, value, onChange }: { question: string; options: string[]; value: number; onChange: (v: number) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-semibold text-slate-800">{question}</legend>
      {options.map((label, i) => {
        const on = value === i + 1;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`block w-full rounded-xl border px-4 py-2.5 text-start text-sm transition ${
              on ? 'border-brand-500 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
            }`}
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}

export function YesNo({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
      </div>
      <div className="flex shrink-0 overflow-hidden rounded-full border border-slate-200 text-sm">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`px-4 py-1.5 ${value === v ? 'bg-brand-500 text-white' : 'bg-white text-slate-600'}`}
          >
            {v ? 'כן' : 'לא'}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-bold text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

export function GapItem({ gap, otherName }: { gap: Gap; otherName: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="mt-0.5">⚡</span>
      <span>
        <b className="font-semibold">{gap.topic}:</b> את/ה „{gap.mine}” · {otherName} „{gap.theirs}”
      </span>
    </li>
  );
}

export function InsightsView({ insights, otherName, limit }: { insights: Insights; otherName: string; limit?: { shared: number; gaps: number } }) {
  const shared = limit ? insights.shared.slice(0, limit.shared) : insights.shared;
  const gaps = limit ? insights.gaps.slice(0, limit.gaps) : insights.gaps;
  return (
    <div className="space-y-3">
      {shared.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-bold text-emerald-700">✓ מה משותף לכם</div>
          <ul className="space-y-1">
            {shared.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-emerald-600">●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {gaps.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-bold text-amber-700">⚡ נקודות לתיאום ציפיות</div>
          <ul className="space-y-1">
            {gaps.map((g) => (
              <GapItem key={g.topic} gap={g} otherName={otherName} />
            ))}
          </ul>
        </div>
      )}
      {shared.length === 0 && gaps.length === 0 && <p className="text-sm text-slate-500">אין פערים משמעותיים ביניכם.</p>}
    </div>
  );
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-2xl bg-brand-500 px-5 py-3 font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}
