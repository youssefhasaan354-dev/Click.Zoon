import { useState, useEffect, useMemo } from 'react';
import { Sparkles, ChevronDown, Gift, Zap, Headphones } from 'lucide-react';
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
    }, 2500);

    return () => clearInterval(interval);
  }, [words.length]);

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
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 text-center">
        {/* Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-2 mb-8 animate-fade-in max-w-full">
          <Sparkles size={16} className="text-gold-400 shrink-0" />
          <span className="text-gold-300 text-sm font-semibold text-center">{badgeText}</span>
        </div>

        {/* Accessible Headline with reserved width to prevent CLS */}
        <h1 className="text-[1.9rem] sm:text-5xl lg:text-6xl font-extrabold leading-[1.7] sm:leading-[1.6] lg:leading-[1.5] mb-7 animate-fade-up">
          {/* Screen reader full readable sentence */}
          <span className="sr-only">
            {line1} {currentWord} {line2}
          </span>

          {/* Visual animated rotating headline */}
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
                    className="text-gradient-gold font-extrabold inline-block"
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
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <a
            href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDemoClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 glow-gold-hover text-lg animate-pulse-gold"
          >
            <Gift size={20} />
            {ctaPrimary}
          </a>
          <button
            onClick={handleServicesClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 text-navy-50 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 text-lg cursor-pointer"
          >
            {ctaSecondary}
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.45s' }}>
          {siteConfig.trustBadges.map((badge) => {
            const Icon = badgeIcons[badge.icon] || Gift;
            return (
              <div
                key={badge.title}
                className="glass-card rounded-xl p-5 flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30"
              >
                <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <Icon size={24} className="text-gold-400" />
                </div>
                <div className="text-navy-50 font-bold">{badge.title}</div>
                <div className="text-navy-300 text-sm">{badge.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block pointer-events-none">
        <ChevronDown size={28} className="text-navy-300 animate-bounce" />
      </div>
    </section>
  );
}
