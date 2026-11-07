import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export default function BrandedLoader({ onComplete }: { onComplete?: () => void }) {
  const { t } = useI18n();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!onComplete) return;
    const timer = setTimeout(() => {
      setFading(true);
      onComplete();
    }, 850);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`min-h-screen bg-navy-950 flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-label={t('common.loading')}
    >
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Branded "CZ" SVG Logo Mark with stroke drawing */}
      <div className="relative z-10 w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
          <defs>
            <linearGradient id="czLoaderGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#efc95e" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#b8932a" />
            </linearGradient>
          </defs>

          {/* Hexagon / shield frame */}
          <motion.polygon
            points="50,6 88,28 88,72 50,94 12,72 12,28"
            fill="none"
            stroke="url(#czLoaderGold)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Letter C */}
          <motion.path
            d="M 44,38 C 36,38 32,44 32,50 C 32,56 36,62 44,62"
            fill="none"
            stroke="url(#czLoaderGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeInOut' }}
          />

          {/* Letter Z */}
          <motion.path
            d="M 52,38 L 66,38 L 52,62 L 66,62"
            fill="none"
            stroke="url(#czLoaderGold)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-4 flex flex-col items-center gap-1.5"
      >
        <span className="text-gradient-gold text-lg font-extrabold tracking-widest font-mono notranslate" translate="no">
          CLICK ZOON
        </span>
        <span className="text-navy-300 text-xs font-semibold">
          {t('common.tagline')}
        </span>
      </motion.div>
    </div>
  );
}
