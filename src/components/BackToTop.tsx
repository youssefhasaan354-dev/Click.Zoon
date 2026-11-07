import { useEffect, useState, useMemo } from 'react';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function BackToTop() {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
      setVisible(scrollTop > 450);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const circleRadius = 20;
  const circumference = useMemo(() => 2 * Math.PI * circleRadius, [circleRadius]);
  const strokeOffset = circumference - (circumference * progress) / 100;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed end-4 sm:end-6 z-40 w-12 h-12 rounded-full bg-navy-900/90 hover:bg-navy-800 text-gold-400 border border-gold-500/30 backdrop-blur-md flex items-center justify-center shadow-xl shadow-navy-950/60 floating-btn-pos transition-all duration-300 hover:scale-110 group ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      aria-label={t('common.back_to_top')}
      title={t('common.back_to_top')}
    >
      {/* Circular progress SVG */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={circleRadius}
          className="text-navy-700/60"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={circleRadius}
          className="text-gold-400 transition-[stroke-dashoffset] duration-100 ease-linear"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          fill="transparent"
        />
      </svg>

      <ArrowUp size={20} className="transition-transform group-hover:-translate-y-0.5 text-gold-400" />
    </button>
  );
}
