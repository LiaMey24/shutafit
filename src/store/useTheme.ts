import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const KEY = 'shutafit-theme';

function initial(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* localStorage unavailable */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12141f' : '#7357f6');
}

export const useTheme = create<{ theme: Theme; toggle: () => void }>((set, get) => ({
  theme: initial(),
  toggle: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
    apply(theme);
    set({ theme });
  },
}));

apply(useTheme.getState().theme);
