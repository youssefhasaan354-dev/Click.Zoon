import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Send, MessageCircle, Check, Loader2 } from 'lucide-react';
import { submitDemoRequest } from '@/lib/demo-requests';
import { cleanPhoneNumber, isValidEgyptianPhone } from '@/lib/phone';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { useI18n } from '@/i18n';

export default function ExitIntentModal() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('cz_exit_intent_seen')) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    // Reset idle timer on user activity
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!sessionStorage.getItem('cz_exit_intent_seen')) {
          setOpen(true);
          sessionStorage.setItem('cz_exit_intent_seen', 'true');
        }
      }, 60000); // 60s idle
    };

    // Desktop exit-intent detection (cursor leaving top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !sessionStorage.getItem('cz_exit_intent_seen')) {
        setOpen(true);
        sessionStorage.setItem('cz_exit_intent_seen', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });
    resetIdle();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('cz_exit_intent_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanPhoneNumber(phone);
    if (!isValidEgyptianPhone(cleaned)) {
      setError(t('exit_intent.error_phone'));
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await submitDemoRequest({
        name: name.trim() || t('exit_intent.lead_name'),
        phone: cleaned,
        business_type: businessType.trim() || t('exit_intent.lead_biz'),
        source: 'exit_intent',
        page_url: window.location.href,
      });

      if (res.success) {
        trackEvent('generate_lead', { event_category: 'exit_intent', event_label: 'submitted' });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsapp = () => {
    trackEvent({ category: 'whatsapp', action: 'click', label: 'exit_intent_whatsapp' });
    const msg = t('exit_intent.wa_msg', { biz: businessType || t('exit_intent.wa_msg_biz_fallback') });
    const url = waLinkIntl(cfg.phoneIntl, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
          className="fixed inset-0 z-[120] bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-lg w-full bg-navy-900 border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 end-5 text-navy-400 hover:text-navy-100 p-2 rounded-full hover:bg-navy-800 transition-colors"
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <Check size={36} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-navy-50 mb-2">{t('exit_intent.success_title')}</h3>
                <p className="text-navy-300 text-sm mb-6 leading-relaxed">
                  {t('exit_intent.success_desc')}
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-gold px-8 py-2.5 rounded-xl text-sm font-bold"
                >
                  {t('exit_intent.close_btn')}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center shrink-0">
                    <Gift size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">{t('exit_intent.badge')}</span>
                    <h3 id="exit-modal-title" className="text-xl sm:text-2xl font-extrabold text-navy-50">
                      {t('exit_intent.title')}
                    </h3>
                  </div>
                </div>

                <p className="text-navy-300 text-sm leading-relaxed mb-6">
                  {t('exit_intent.subtitle')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 mb-4">
                  <div>
                    <label htmlFor="exit-phone" className="block text-xs font-semibold text-navy-200 mb-1">
                      {t('contact.phone_label')} *
                    </label>
                    <input
                      id="exit-phone"
                      type="tel"
                      required
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('exit_intent.phone_placeholder')}
                      className={`w-full bg-navy-950/80 border rounded-xl px-4 py-3 text-sm text-navy-50 focus:outline-none ${
                        error ? 'border-red-500 focus:border-red-400' : 'border-navy-700 focus:border-gold-500'
                      }`}
                    />
                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="exit-name" className="block text-xs font-semibold text-navy-200 mb-1">
                        {t('contact.name_label')}
                      </label>
                      <input
                        id="exit-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('exit_intent.name_placeholder')}
                        className="w-full bg-navy-950/80 border border-navy-700 rounded-xl px-3 py-2.5 text-sm text-navy-50 focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="exit-business" className="block text-xs font-semibold text-navy-200 mb-1">
                        {t('contact.business_label')}
                      </label>
                      <input
                        id="exit-business"
                        type="text"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        placeholder={t('exit_intent.business_placeholder')}
                        className="w-full bg-navy-950/80 border border-navy-700 rounded-xl px-3 py-2.5 text-sm text-navy-50 focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-gold py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t('exit_intent.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{t('exit_intent.submit_btn')}</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-navy-800">
                  <button
                    type="button"
                    onClick={handleWhatsapp}
                    className="text-gold-400 hover:text-gold-300 text-xs font-bold inline-flex items-center gap-1.5 py-1"
                  >
                    <MessageCircle size={14} />
                    <span>{t('exit_intent.whatsapp_btn')}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
