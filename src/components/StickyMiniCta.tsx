import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, ArrowLeft, X } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';

export default function StickyMiniCta() {
  const cfg = useSiteConfig();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('cz_mini_cta_dismissed') === 'true';
  });

  useEffect(() => {
    if (dismissed) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = window.scrollY / scrollHeight;

      // Show after 35% scroll, hide near bottom footer (> 90%)
      if (progress > 0.35 && progress < 0.92) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem('cz_mini_cta_dismissed', 'true');
  };

  const handleScrollToWizard = () => {
    const el = document.getElementById('wizard') || document.getElementById('demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-4 bg-navy-950/95 border border-gold-500/50 shadow-2xl rounded-full px-6 py-3.5 backdrop-blur-xl"
          dir="rtl"
          role="region"
          aria-label="شريط طلب الديمو السريع"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping" />
            <Sparkles size={16} className="text-gold-400" />
            <span className="text-sm font-bold text-navy-50">
              جاهز تشوف موقع نشاطك؟ اطلب نموذج ديمو مجاني خلال 48 ساعة
            </span>
          </div>

          <div className="flex items-center gap-2 mr-2">
            <button
              type="button"
              onClick={handleScrollToWizard}
              className="btn-gold px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-gold-500/20"
            >
              <span>اطلب الديمو</span>
              <ArrowLeft size={14} />
            </button>

            <a
              href={waLinkIntl(cfg.phoneIntl, 'مرحباً كليك زون، عايز أطلب ديمو مجاني لنشاطي')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('generate_lead', { event_category: 'sticky_bar', event_label: 'whatsapp' })}
              className="px-3.5 py-1.5 rounded-full bg-navy-800 text-gold-300 hover:bg-navy-700 border border-gold-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle size={14} />
              <span>واتساب</span>
            </a>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-navy-400 hover:text-navy-100 p-1 rounded-full transition-colors mr-1"
              aria-label="إغلاق هذا الشريط"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
