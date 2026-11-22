import { motion } from 'framer-motion';

/** Shutafit app icon: two flatmates whose arms form a roof over a 2×2 window. */

const CORAL = '#f6a993';
const LILAC = '#c29db8';
const WINDOW = '#e2be9e';
const CREAM = '#fdf6f4';

// One figure (body + arm reaching up to the roof's apex). The second figure is its mirror image.
const BODY =
  'M225 800 C225 640 330 570 430 535 C500 510 560 460 600 435 Q645 410 658 462 Q650 490 625 510 ' +
  'L435 660 C390 700 380 740 380 790 L380 880 C380 920 355 940 320 940 C260 940 225 880 225 800 Z';

// Window panes in "loading" order: top-right, top-left, bottom-left, bottom-right.
const PANES = [
  { x: 636, y: 676 },
  { x: 520, y: 676 },
  { x: 520, y: 786 },
  { x: 636, y: 786 },
];

export default function AppIcon({ className, loading = false }: { className?: string; loading?: boolean }) {
  return (
    <svg viewBox="105 110 1040 1050" className={className} role="img" aria-label="Shutafit">
      <rect x="105" y="110" width="1040" height="1050" rx="270" fill={CREAM} />
      <g transform="translate(1250 0) scale(-1 1)" fill={LILAC}>
        <circle cx="425" cy="420" r="97" />
        <path d={BODY} />
      </g>
      <g fill={CORAL}>
        <circle cx="425" cy="420" r="97" />
        <path d={BODY} />
      </g>
      {PANES.map((p, i) => (
        <motion.rect
          key={i}
          x={p.x}
          y={p.y}
          width="88"
          height="85"
          rx="20"
          fill={WINDOW}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={loading ? { opacity: 0.2, scale: 0.7 } : false}
          animate={loading ? { opacity: [0.2, 1, 1, 0.2], scale: [0.7, 1.08, 1, 0.7] } : { opacity: 1, scale: 1 }}
          transition={
            loading
              ? { duration: 1.2, times: [0, 0.25, 0.6, 1], delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
