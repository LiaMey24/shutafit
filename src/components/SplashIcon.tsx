import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import AppIcon from './AppIcon';

const MIN_SHOW_MS = 1800; // long enough for the window panes to run one full loading cycle

/** Full-screen splash shown once per page load: the icon pops in, its window panes pulse like a loader, then it fades away. */
export default function SplashIcon() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let loaded = document.readyState === 'complete';
    let minElapsed = false;
    const hideIfReady = () => {
      if (loaded && minElapsed) setVisible(false);
    };
    const onLoad = () => {
      loaded = true;
      hideIfReady();
    };
    const timer = window.setTimeout(() => {
      minElapsed = true;
      hideIfReady();
    }, MIN_SHOW_MS);
    window.addEventListener('load', onLoad);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#fdf6f4]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-busy="true"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: [0, 1.15, 1], opacity: 1 }}
            transition={reduceMotion ? { duration: 0.3 } : { duration: 0.6, times: [0, 0.6, 1], ease: 'easeOut' }}
            className="drop-shadow-xl"
          >
            <AppIcon className="h-36 w-36" loading={!reduceMotion} />
          </motion.div>
          <motion.span
            className="text-2xl font-extrabold tracking-wide text-[#b98aa9]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.4 }}
          >
            Shutafit
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
