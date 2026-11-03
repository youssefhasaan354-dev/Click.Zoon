import { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Gift, Zap, Headphones, Check, ShoppingBag, ArrowDown } from 'lucide-react';
import { waLinkIntl, useSiteConfig, useHeroContent, siteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';

const badgeIcons: Record<string, typeof Gift> = {
  Gift,
  Zap,
  Headphones,
};

export default function Hero() {
  const cfg = useSiteConfig();
  const hero = useHeroContent();

  const words = useMemo(() => {
    return hero?.rotating_words && hero.rotating_words.length > 0
      ? hero.rotating_words
      : ['مطعمك', 'كافيهك', 'محلك', 'شركتك', 'مشروعك'];
  }, [hero?.rotating_words]);

  const [wordIdx, setWordIdx] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    } catch {
      // ignore
    }

    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % words.length);
    }, 2600);

    return () => clearInterval(interval);
  }, [words.length]);

  // Subtle mouse parallax (max 12px, desktop fine pointer only)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({
      x: normX * 12,
      y: normY * 12,
    });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const currentWord = words[wordIdx] || words[0] || 'مشروعك';
  const longestWord = useMemo(() => {
    return words.reduce((a, b) => (b.length > a.length ? b : a), words[0] || '');
  }, [words]);

  const badgeText = hero?.badge_text ?? 'تصميم وتطوير مواقع ومتاجر إلكترونية باحتراف';
  const line1 = hero?.headline_line1 ?? 'خلّي موقع';
  const line2 = hero?.headline_line2 ?? 'أونلاين واحترافي';
  const subtitle = hero?.subtitle ?? 'في Click Zoon نُصمّم ونطوّر مواقع ومتاجر إلكترونية احترافية لكل الأنشطة التجارية في المنصورة والدقهلية، بداية مجانية بدون التزام وتسليم سريع بدعم مستمر.';
  const ctaPrimary = hero?.cta_primary ?? 'اطلب ديمو مجاني';
  const ctaSecondary = hero?.cta_secondary ?? 'شاهد خدماتنا';

  const handleDemoClick = () => {
    trackEvent({ category: 'whatsapp', action: 'click', label: 'hero_demo' });
  };

  const handleServicesClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      ref={heroRef}
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background gradients and drifting orbs with transform-only parallax */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-850 to-navy-950 pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      >
        <div
          className="absolute top-1/4 right-1/4 w-72 h-72 sm:w-[28rem] sm:h-[28rem] bg-gold-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 sm:w-[26rem] sm:h-[26rem] bg-teal-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)`,
          backgroundSize: '54px 54px',
        }}
      />

      {/* Floating mini UI cards (Desktop only, decorative previews) */}
      <div
        className="hidden 2xl:block absolute right-12 top-1/3 z-10 pointer-events-none select-none transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${-mouseOffset.x * 1.4}px, ${-mouseOffset.y * 1.4}px, 0)` }}
        aria-hidden="true"
      >
        <div className="glass-card rounded-2xl p-4 border border-gold-500/30 shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div className="text-xs text-navy-300">طلب جديد مكتمل</div>
            <div className="text-sm font-bold text-navy-50">متجر إلكتروني +320 ج.م</div>
          </div>
        </div>
      </div>

      <div
        className="hidden 2xl:block absolute left-12 bottom-1/3 z-10 pointer-events-none select-none transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${mouseOffset.x * 1.5}px, ${mouseOffset.y * 1.5}px, 0)` }}
        aria-hidden="true"
      >
        <div className="glass-card rounded-2xl p-4 border border-teal-500/30 shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Check size={20} />
          </div>
          <div>
            <div className="text-xs text-navy-300">سرعة التحميل</div>
            <div className="text-sm font-bold text-green-400">99% على جوجل لايتهاوس</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 text-center">
        {/* 1. Staggered Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex flex-wrap items-center justify-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-2 mb-8 max-w-full shadow-sm"
        >
          <Sparkles size={16} className="text-gold-400 shrink-0" />
          <span className="text-gold-300 text-sm font-semibold text-center">{badgeText}</span>
        </motion.div>

        {/* 2. Staggered Accessible Headline with Zero Layout Shift */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-[1.95rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.7] sm:leading-[1.6] lg:leading-[1.5] mb-7"
        >
          {/* Screen reader full readable sentence */}
          <span className="sr-only">
            {line1} {currentWord} {line2}
          </span>

          {/* Visual rotating headline */}
          <span aria-hidden="true" className="block text-navy-50">
            {line1}{' '}
            <span className="inline-grid grid-cols-1 grid-rows-1 align-baseline text-center px-1">
              {/* Invisible longest word reserves the bounding width for CLS < 0.05 */}
              <span className="col-start-1 row-start-1 invisible select-none pointer-events-none font-extrabold">
                {longestWord}
              </span>
              <span className="col-start-1 row-start-1 flex items-baseline justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="text-gradient-gold font-extrabold inline-block shimmer-text"
                    dir="rtl"
                  >
                    {currentWord}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </span>
          <span aria-hidden="true" className="block text-gradient-gold mt-3 py-[0.12em]">
            {line2}
          </span>
        </motion.h1>

        {/* 3. Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        {/* 4. CTAs with Magnetic Hover feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDemoClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-8 py-4 rounded-xl transition-colors glow-gold-hover text-lg shadow-lg shadow-gold-500/25"
          >
            <Gift size={20} />
            {ctaPrimary}
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleServicesClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy-800/80 hover:bg-navy-700 border border-navy-600/60 text-navy-50 font-bold px-8 py-4 rounded-xl transition-colors text-lg cursor-pointer"
          >
            {ctaSecondary}
            <ArrowDown size={18} />
          </motion.button>
        </motion.div>

        {/* 5. Trust badges with stagger entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {siteConfig.trustBadges.map((badge) => {
            const Icon = badgeIcons[badge.icon] || Gift;
            return (
              <div
                key={badge.title}
                className="glass-card rounded-xl p-5 flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40"
              >
                <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <Icon size={24} className="text-gold-400" />
                </div>
                <div className="text-navy-50 font-bold">{badge.title}</div>
                <div className="text-navy-300 text-sm">{badge.subtitle}</div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 6. Mouse-wheel scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 pointer-events-none opacity-80" aria-hidden="true">
        <div className="w-6 h-10 rounded-full border-2 border-gold-400/50 flex items-start justify-center p-1.5 shadow-sm">
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-1.5 h-2 rounded-full bg-gold-400"
          />
        </div>
      </div>
    </section>
  );
}
