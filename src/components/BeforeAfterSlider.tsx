import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle2, XCircle, Sparkles, AlertTriangle } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { usePrefersReducedMotion } from '@/lib/motion';
import { useReveal } from '@/hooks/useReveal';
import { useI18n } from '@/i18n';

export default function BeforeAfterSlider() {
  const { t } = useI18n();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [beforeLoaded, setBeforeLoaded] = useState(false);
  const [afterLoaded, setAfterLoaded] = useState(false);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hasInteractedRef = useRef(false);
  const prefersReduced = usePrefersReducedMotion();
  const { ref: revealRef, revealed } = useReveal({ threshold: 0.2 });

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 3) percentage = 3;
    if (percentage > 97) percentage = 97;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setSliderPosition(percentage);
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    hasInteractedRef.current = true;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    hasInteractedRef.current = true;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(3, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(97, prev + 5));
    }
  };

  // Hint nudge animation when revealed (moves right & left once)
  useEffect(() => {
    if (!revealed || prefersReduced || hasInteractedRef.current) return;
    const timer = setTimeout(() => {
      let start: number | null = null;
      const duration = 1200;
      const animateHint = (now: number) => {
        if (hasInteractedRef.current) return;
        if (!start) start = now;
        const progress = Math.min((now - start) / duration, 1);
        const offset = Math.sin(progress * 2 * Math.PI) * 8;
        setSliderPosition(50 + offset);
        if (progress < 1) {
          requestAnimationFrame(animateHint);
        } else {
          setSliderPosition(50);
        }
      };
      requestAnimationFrame(animateHint);
    }, 700);

    return () => clearTimeout(timer);
  }, [revealed, prefersReduced]);

  const isLoading = (!beforeLoaded && !beforeError) || (!afterLoaded && !afterError);

  return (
    <section className="py-20 lg:py-28 bg-navy-900/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('before_after.badge')}
          title={t('before_after.title')}
          highlight={t('before_after.highlight')}
          subtitle={t('before_after.subtitle')}
        />

        {/* Feature badges above */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8 text-center text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-semibold shadow-xs">
            <XCircle size={18} className="shrink-0 text-red-400" />
            <span>{t('before_after.before_tagline')}</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold shadow-xs">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span>{t('before_after.after_tagline')}</span>
          </div>
        </div>

        {/* Comparison slider container */}
        <div
          ref={revealRef}
          className={`reveal ${revealed ? 'revealed' : ''}`}
        >
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'pan-y' }}
            className="relative w-full aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-navy-700/80 cursor-ew-resize select-none bg-navy-950"
          >
            {/* Loading skeleton */}
            {isLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-navy-950/80 backdrop-blur-xs animate-pulse pointer-events-none">
                <div className="flex flex-col items-center gap-3 text-gold-400/80">
                  <div className="w-10 h-10 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-navy-300">{t('before_after.loading')}</span>
                </div>
              </div>
            )}

            {/* AFTER Layer (Left side / Base background) */}
            <div className="absolute inset-0 w-full h-full">
              {!afterError ? (
                <img
                  src="/before-after/after.webp"
                  alt={t('before_after.after_badge')}
                  draggable={false}
                  onLoad={() => setAfterLoaded(true)}
                  onError={() => setAfterError(true)}
                  className={`w-full h-full object-cover select-none transition-opacity duration-500 ${
                    afterLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950 p-6 text-center">
                  <Sparkles size={36} className="text-gold-400 mb-2" />
                  <p className="text-gold-300 font-bold text-sm">{t('before_after.after_badge')}</p>
                </div>
              )}

              {/* After tag (top left) */}
              <div className="absolute top-4 left-4 z-10 bg-navy-950/90 backdrop-blur-md border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
                <Sparkles size={14} className="text-gold-400" />
                <span>{t('before_after.after_badge')}</span>
              </div>
            </div>

            {/* BEFORE Layer (Right side / Clipped on top) */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                WebkitClipPath: `inset(0 0 0 ${sliderPosition}%)`,
              }}
            >
              {!beforeError ? (
                <img
                  src="/before-after/before.webp"
                  alt={t('before_after.before_badge')}
                  draggable={false}
                  onLoad={() => setBeforeLoaded(true)}
                  onError={() => setBeforeError(true)}
                  className={`w-full h-full object-cover select-none transition-opacity duration-500 filter contrast-105 ${
                    beforeLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-950/60 to-navy-950 p-6 text-center">
                  <AlertTriangle size={36} className="text-red-400 mb-2" />
                  <p className="text-red-300 font-bold text-sm">{t('before_after.before_badge')}</p>
                </div>
              )}

              {/* Before tag (top right) */}
              <div className="absolute top-4 right-4 z-10 bg-red-950/90 backdrop-blur-md border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{t('before_after.before_badge')}</span>
              </div>
            </div>

            {/* Divider line & handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-gold-300 via-gold-500 to-gold-400 cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
              style={{ left: `${sliderPosition}%` }}
            >
              <div
                role="slider"
                tabIndex={0}
                aria-label={t('before_after.slider_label')}
                aria-valuenow={Math.round(sliderPosition)}
                aria-valuemin={3}
                aria-valuemax={97}
                onKeyDown={handleKeyDown}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-950 border-2 border-gold-400 text-gold-300 shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 transition-transform cursor-ew-resize"
              >
                <ArrowLeftRight size={18} className="text-gold-400" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          {t('before_after.drag_hint')}
        </p>
      </div>
    </section>
  );
}
