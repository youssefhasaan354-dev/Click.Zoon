import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check } from 'lucide-react';
import { initGoogleAnalytics } from '@/lib/analytics';
import { useSiteConfig } from '@/siteConfig';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';

export default function CookieConsent() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cz_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted' && cfg.googleAnalyticsId) {
      initGoogleAnalytics(cfg.googleAnalyticsId);
    }
  }, [cfg.googleAnalyticsId]);

  const handleAccept = () => {
    localStorage.setItem('cz_cookie_consent', 'accepted');
    setVisible(false);
    if (cfg.googleAnalyticsId) {
      initGoogleAnalytics(cfg.googleAnalyticsId);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cz_cookie_consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 start-4 z-50 max-w-sm bg-navy-950/95 border border-gold-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label={t('cookie_consent.title')}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-navy-50 mb-1">{t('cookie_consent.title')}</div>
              <p className="text-xs text-navy-300 leading-relaxed">
                {t('cookie_consent.description')}{' '}
                <Link to="/privacy" className="text-gold-400 underline hover:text-gold-300">
                  {t('cookie_consent.privacy_policy')}
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-800">
            <button
              type="button"
              onClick={handleDecline}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-navy-400 hover:text-navy-200 transition-colors"
            >
              {t('cookie_consent.decline')}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="btn-gold min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-gold-500/20"
            >
              <Check size={14} />
              <span>{t('cookie_consent.accept')}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
