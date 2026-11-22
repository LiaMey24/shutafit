import { useTheme } from '../store/useTheme';

/** Sun/moon button pinned to the top-left of the app column; switches between light and dark mode. */
export default function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const dark = theme === 'dark';
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto max-w-[430px]">
      <button
        type="button"
        aria-label={dark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
        title={dark ? 'מצב בהיר' : 'מצב כהה'}
        onClick={toggle}
        className="pointer-events-auto absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-lg ring-1 ring-slate-200 transition hover:scale-105"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
