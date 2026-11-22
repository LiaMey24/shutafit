interface Props {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  label: string;
  /** Tick labels under the track, from min to max. */
  ticks?: string[];
}

/** Two-thumb range slider. Direction follows the page (RTL: min on the right). */
export default function RangeSlider({ min, max, step, value, onChange, label, ticks }: Props) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ insetInlineStart: `${pct(lo)}%`, insetInlineEnd: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          className="range-input absolute inset-0 h-8 w-full"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${label} מינימום`}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        />
        <input
          type="range"
          className="range-input absolute inset-0 h-8 w-full"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${label} מקסימום`}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        />
      </div>
      {ticks && (
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
