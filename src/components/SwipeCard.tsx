import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AREAS, labelOf } from '../data/questions';
import { buildInsights } from '../matching/insights';
import type { Profile, SwipeDir } from '../types';
import { Hero, InsightsView, ScoreRing } from './ui';

export interface SwipeCardHandle {
  fly: (dir: SwipeDir) => void;
}

interface Props {
  me: Profile;
  profile: Profile;
  score: number;
  onSwiped: (dir: SwipeDir) => void;
}

const THRESHOLD = 110;

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ me, profile, score, onSwiped }, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-14, 14]);
  const likeOpacity = useTransform(x, [20, THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-THRESHOLD, -20], [1, 0]);
  const insights = useMemo(() => buildInsights(me, profile), [me, profile]);

  function fly(dir: SwipeDir) {
    animate(x, dir === 'like' ? 600 : -600, { duration: 0.28, ease: 'easeIn' }).then(() => onSwiped(dir));
  }

  useImperativeHandle(ref, () => ({ fly }));

  const areas = profile.filters.areas.slice(0, 2).map((a) => labelOf(AREAS, a)).join(' · ');

  return (
    <motion.div
      className="absolute inset-0 flex cursor-grab touch-pan-y flex-col overflow-hidden rounded-3xl bg-white shadow-xl active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > THRESHOLD) fly('like');
        else if (info.offset.x < -THRESHOLD) fly('pass');
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="relative h-[46%] shrink-0">
        <Hero name={profile.name} photo={profile.photo} id={profile.id} className="h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
          <div className="text-2xl font-extrabold">
            {profile.name}, {profile.age}
          </div>
          <div className="text-sm opacity-90">{profile.occupation}</div>
          <div className="text-xs opacity-75">📍 {areas} · עד ₪{profile.filters.maxBudget.toLocaleString('he-IL')}</div>
        </div>
        <div className="absolute top-3 left-3">
          <ScoreRing score={score} />
        </div>
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 right-5 rotate-12 rounded-lg border-4 border-emerald-500 px-3 py-1 text-2xl font-extrabold text-emerald-500">
          מתאים לי
        </motion.div>
        <motion.div style={{ opacity: passOpacity }} className="absolute top-20 left-5 -rotate-12 rounded-lg border-4 border-coral-500 px-3 py-1 text-2xl font-extrabold text-coral-500">
          לא הפעם
        </motion.div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <p className="mb-3 line-clamp-2 text-sm text-slate-600">{profile.bio}</p>
        <InsightsView insights={insights} otherName={profile.name} limit={{ shared: 3, gaps: 2 }} />
      </div>
      <Link
        to={`/profile/${profile.id}`}
        onPointerDownCapture={(e) => e.stopPropagation()}
        className="border-t border-slate-100 py-2.5 text-center text-sm font-medium text-brand-600"
      >
        לפרופיל המלא ופירוט ההתאמה ←
      </Link>
    </motion.div>
  );
});

export default SwipeCard;
