import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Profile } from '../types';
import { Avatar, PrimaryButton } from './ui';

export default function MatchModal({ me, other, onClose }: { me: Profile; other: Profile; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mint-200 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-sm text-center">
        <motion.h2
          dir="ltr"
          className="text-6xl font-extrabold tracking-tight text-mint-700"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, delay: 0.1 }}
        >
          MATCH!
        </motion.h2>
        <p className="mt-3 text-mint-700">את/ה ו{other.name} רוצים להכיר. הצ׳אט פתוח.</p>
        <div className="my-6 flex justify-center -space-x-4 space-x-reverse">
          <Avatar name={me.name} photo={me.photo} id="me" className="h-20 w-20 border-4 border-white text-3xl" />
          <Avatar name={other.name} photo={other.photo} id={other.id} className="h-20 w-20 border-4 border-white text-3xl" />
        </div>
        <PrimaryButton className="w-full" onClick={() => navigate(`/chat/${other.id}`)}>
          לשלוח הודעה
        </PrimaryButton>
        <button type="button" onClick={onClose} className="mt-3 w-full py-2 text-sm text-mint-700">
          להמשיך לגלוש
        </button>
      </div>
    </motion.div>
  );
}
