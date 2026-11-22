import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../types';
import { Avatar, PrimaryButton } from './ui';

export default function MatchModal({ me, other, onClose }: { me: Profile; other: Profile; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-700/80 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14 }}
      >
        <div className="mb-1 text-4xl">🎉</div>
        <h2 className="text-3xl font-extrabold text-brand-600">יש מאץ׳!</h2>
        <p className="mt-1 text-slate-600">את/ה ו{other.name} רוצים להכיר. הצ׳אט פתוח.</p>
        <div className="my-5 flex justify-center -space-x-4 space-x-reverse">
          <Avatar name={me.name} photo={me.photo} id="me" className="h-20 w-20 border-4 border-white text-3xl" />
          <Avatar name={other.name} photo={other.photo} id={other.id} className="h-20 w-20 border-4 border-white text-3xl" />
        </div>
        <PrimaryButton className="w-full" onClick={() => navigate(`/chat/${other.id}`)}>
          לשלוח הודעה
        </PrimaryButton>
        <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-sm text-slate-500">
          להמשיך לגלוש
        </button>
      </motion.div>
    </motion.div>
  );
}
