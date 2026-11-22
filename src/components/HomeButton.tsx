import { useLocation, useNavigate } from 'react-router-dom';

/** Always-visible shortcut to the homepage (Discover), pinned to the top-right of the app column. */
export default function HomeButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname === '/onboarding') return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] mx-auto max-w-[430px]">
      <button
        type="button"
        aria-label="לדף הבית"
        onClick={() => navigate('/discover')}
        className="pointer-events-auto absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-lg ring-1 ring-slate-200 transition hover:scale-105"
      >
        🏠
      </button>
    </div>
  );
}
