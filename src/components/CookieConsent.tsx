import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check } from 'lucide-react';
import { initGoogleAnalytics } from '@/lib/analytics';
import { useSiteConfig } from '@/siteConfig';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const cfg = useSiteConfig();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cz_cookie_consent');
    if (!consent) {
      // Delay showing banner slightly to avoid layout shifts at first paint
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
          className="fixed bottom-4 left-4 z-50 max-w-sm bg-navy-950/95 border border-gold-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl"
          dir="rtl"
          role="dialog"
          aria-label="إشعار ملفات تعريف الارتباط والخصوصية"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-navy-50 mb-1">ملفات تعريف الارتباط والخصوصية</div>
              <p className="text-xs text-navy-300 leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وقياس أداء الموقع. بياناتك مشفرة ولا نشاركها أبداً مع أطراف خارجية.{' '}
                <Link to="/privacy" className="text-gold-400 underline hover:text-gold-300">
                  سياسة الخصوصية
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-navy-800">
            <button
              type="button"
              onClick={handleDecline}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-navy-400 hover:text-navy-200 transition-colors"
            >
              رفض
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="btn-gold px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-md shadow-gold-500/20"
            >
              <Check size={14} />
              <span>موافق</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
