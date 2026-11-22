import type { ReactNode } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useApp } from './store/useApp';
import Onboarding from './screens/Onboarding';
import Discover from './screens/Discover';
import CandidateDetail from './screens/CandidateDetail';
import Matches from './screens/Matches';
import Chat from './screens/Chat';
import MyProfile from './screens/MyProfile';
import SplashIcon from './components/SplashIcon';

function RequireProfile({ children }: { children: ReactNode }) {
  const me = useApp((s) => s.me);
  return me ? <>{children}</> : <Navigate to="/onboarding" replace />;
}

function BottomNav() {
  const unread = useApp((s) => s.matches.filter((m) => !(s.messages[m.profileId]?.length)).length);
  const item = (to: string, icon: string, label: string, badge = 0) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'font-bold text-brand-600' : 'text-slate-500'}`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
      {badge > 0 && (
        <span className="absolute top-1 left-1/2 -translate-x-4 rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-white">{badge}</span>
      )}
    </NavLink>
  );
  return (
    <nav className="sticky bottom-0 z-20 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {item('/discover', '🏠', 'גילוי')}
      {item('/matches', '💬', 'התאמות', unread)}
      {item('/me', '👤', 'הפרופיל שלי')}
    </nav>
  );
}

function WithNav({ children }: { children: ReactNode }) {
  return (
    <RequireProfile>
      <div className="flex min-h-full flex-col">
        <div className="flex-1">{children}</div>
        <BottomNav />
      </div>
    </RequireProfile>
  );
}

export default function App() {
  const me = useApp((s) => s.me);
  return (
    <div className="mx-auto min-h-full max-w-[430px] bg-slate-50 sm:my-0 sm:shadow-2xl">
      <SplashIcon />
      <Routes>
        <Route path="/" element={<Navigate to={me ? '/discover' : '/onboarding'} replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/discover" element={<WithNav><Discover /></WithNav>} />
        <Route path="/profile/:id" element={<RequireProfile><CandidateDetail /></RequireProfile>} />
        <Route path="/matches" element={<WithNav><Matches /></WithNav>} />
        <Route path="/chat/:id" element={<RequireProfile><Chat /></RequireProfile>} />
        <Route path="/me" element={<WithNav><MyProfile /></WithNav>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
