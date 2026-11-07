import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Facebook, Instagram, Send, User, Store, Link, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';
import { submitDemoRequest } from '@/lib/demo-requests';
import { useCustomer } from '@/lib/customer-context';
import { validateEgyptianPhone, cleanPhoneNumber } from '@/lib/phone';
import SectionHeader from '@/components/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/i18n';

const RATE_LIMIT_MS = 30_000;
const MAX_NAME_LEN = 160;
const MAX_BUSINESS_LEN = 160;
const MAX_PHONE_LEN = 40;
const MAX_URL_LEN = 500;

export default function Contact() {
  const { t, language } = useI18n();
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const { user, profile } = useCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
  const lastSubmitRef = useRef<number>(0);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    business: '',
    pageUrl: '',
  });
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (user && profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.full_name,
        phone: profile.phone ?? '',
      }));
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;

    if (!validateEgyptianPhone(form.phone)) {
      setPhoneError(t('contact.phone_error'));
      phoneInputRef.current?.focus();
      return;
    }
    setPhoneError(null);

    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      setRateLimitMsg(t('contact.rate_limit_recent'));
      setRateLimited(true);
      return;
    }
    setRateLimited(false);
    setRateLimitMsg(null);

    const trimmedName = form.name.trim().slice(0, MAX_NAME_LEN);
    const cleanedPhone = cleanPhoneNumber(form.phone).slice(0, MAX_PHONE_LEN);
    const trimmedBusiness = form.business.trim().slice(0, MAX_BUSINESS_LEN);
    const trimmedUrl = form.pageUrl.trim().slice(0, MAX_URL_LEN) || null;

        const businessTypeMsg = trimmedBusiness
      ? t('contact.wa_msg_biz', { biz: trimmedBusiness })
      : t('contact.wa_msg_biz', { biz: t('contact.wa_msg_biz_unset') });
    const msg = `${t('contact.wa_msg_hello', { name: trimmedName })}
${t('contact.wa_msg_phone', { phone: cleanedPhone })}
${businessTypeMsg}${trimmedUrl ? `\n${t('contact.wa_msg_url', { url: trimmedUrl })}` : ''}
${t('contact.wa_msg_footer')}`;

    const waUrl = waLinkIntl(cfg.phoneIntl, msg);

    // Synchronously open blank window inside user click context to prevent iOS Safari popup blocker
    let popupWindow: Window | null = null;
    try {
      popupWindow = window.open('about:blank', '_blank');
    } catch {
      // Browser blocked popup or in webview
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    let isRateLimited = false;
    let saveError = false;

    try {
      const res = await submitDemoRequest({
        name: trimmedName,
        phone: cleanedPhone,
        business_type: trimmedBusiness,
        page_url: trimmedUrl,
        message_text: msg,
        source: 'form',
        honeypot,
      });

      lastSubmitRef.current = Date.now();
      isRateLimited = Boolean(res.isRateLimited);

      if (!res.success) {
        saveError = true;
        console.error('Demo request save failed:', res.error);
      } else {
        trackEvent({ category: 'form', action: 'submit', label: 'demo_request' });
      }
    } catch (err) {
      saveError = true;
      console.error('Demo request submission exception:', err);
    } finally {
      setIsSubmitting(false);
    }

    if (isRateLimited) {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
      setRateLimitMsg(t('contact.rate_limit_exceeded'));
      setRateLimited(true);
      setSubmitStatus('idle');
      return;
    }

    // Direct the user to WhatsApp
    if (popupWindow && !popupWindow.closed) {
      popupWindow.location.href = waUrl;
    } else {
      window.location.href = waUrl;
    }

    if (saveError) {
      setSubmitStatus('error');
    } else {
      setSubmitStatus('success');
      if (!user) {
        setForm({ name: '', phone: '', business: '', pageUrl: '' });
      } else {
        setForm((prev) => ({ ...prev, business: '', pageUrl: '' }));
      }
    }
  };

  const handlePhoneChange = (v: string) => {
    setForm({ ...form, phone: v });
    if (phoneError) setPhoneError(null);
    if (rateLimited) setRateLimited(false);
  };

  const inputClass =
    'w-full bg-navy-800/70 border border-navy-600/50 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/60 focus:outline-none focus:ring-2 focus:ring-gold-500/30 transition-all';

  return (
    <section id="contact" className="py-20 lg:py-28 bg-navy-950/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={Sparkles}
          badge={t('contact.badge')}
          title={t('contact.title')}
          highlight={t('contact.highlight')}
          subtitle={t('contact.subtitle')}
        />

        <div ref={ref} className={`grid lg:grid-cols-2 gap-8 reveal ${revealed ? 'revealed' : ''}`}>
          {/* Form Card */}
          <div className="glass-card rounded-2xl p-7 sm:p-9 relative overflow-hidden">
            {/* CSS Celebration Gold Particles on submit success */}
            {submitStatus === 'success' && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-gold-400 opacity-90 animate-fade-out"
                    style={{
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      transform: `scale(${Math.random() * 1.5 + 0.5})`,
                      animation: `shimmer 1.5s ease-out forwards ${i * 0.04}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot for bots */}
              <input
                type="text"
                name="company_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute opacity-0 pointer-events-none -z-10"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label htmlFor="contact-name" className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <User size={16} className="text-gold-400" />
                  {t('contact.name_label')} <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={MAX_NAME_LEN}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('contact.name_placeholder')}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-business" className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Store size={16} className="text-gold-400" />
                  {t('contact.business_label')} <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-business"
                  type="text"
                  required
                  autoComplete="organization"
                  maxLength={MAX_BUSINESS_LEN}
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                  placeholder={t('contact.business_placeholder')}
                  className={inputClass}
                />
              </div>

              {/* Phone Field with Shake animation on validation error */}
              <motion.div
                animate={phoneError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <label htmlFor="contact-phone" className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-gold-400" />
                  {t('contact.phone_label')} <span className="text-red-400">*</span>
                </label>
                <input
                  ref={phoneInputRef}
                  id="contact-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={MAX_PHONE_LEN}
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={t('contact.phone_placeholder')}
                  className={`${inputClass} ${phoneError ? 'border-red-500/70 focus:border-red-500' : ''}`}
                  dir="ltr"
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? 'contact-phone-error' : undefined}
                />
                {phoneError && (
                  <p id="contact-phone-error" className="text-red-300 text-xs mt-1.5 font-medium" role="alert">
                    {phoneError}
                  </p>
                )}
              </motion.div>

              <div>
                <label htmlFor="contact-page-url" className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Link size={16} className="text-gold-400" />
                  {t('contact.url_label')} <span className="text-navy-300 text-xs font-normal">{t('contact.url_optional')}</span>
                </label>
                <input
                  id="contact-page-url"
                  type="url"
                  autoComplete="url"
                  maxLength={MAX_URL_LEN}
                  value={form.pageUrl}
                  onChange={(e) => setForm({ ...form, pageUrl: e.target.value })}
                  placeholder={t('contact.url_placeholder')}
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              {/* Button with State Morph: idle -> loading -> success */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-70 disabled:cursor-not-allowed text-navy-950 font-bold px-6 py-4 rounded-xl transition-all duration-300 glow-gold-hover text-lg shadow-lg shadow-gold-500/20"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.span
                      key="submitting"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Loader2 size={20} className="animate-spin text-navy-950" />
                      <span>{t('contact.submitting')}</span>
                    </motion.span>
                  ) : submitStatus === 'success' ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 text-navy-950"
                    >
                      <CheckCircle2 size={22} className="text-navy-950" />
                      <span>{t('contact.submit_success')}</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Send size={20} />
                      <span>{t('contact.submit_btn')}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <p className="text-center text-navy-300 text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} className="text-gold-400" />
                {t('contact.guarantee_note')}
              </p>

              {rateLimited && (
                <p className="text-amber-300 text-sm text-center" role="alert">
                  {rateLimitMsg || t('contact.rate_limit_recent')}
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-amber-300 text-sm text-center" role="alert">
                  {t('contact.whatsapp_opened_note')}
                </p>
              )}
            </form>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-5">
            <a
              href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.contact)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent({ category: 'whatsapp', action: 'click', label: 'contact_whatsapp' });
              }}
              className="flex items-center gap-4 glass-card rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-gold-500/40 group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0 group-hover:bg-green-500/25 transition-colors">
                <MessageCircle size={24} className="text-green-400" />
              </div>
              <div>
                <div className="text-navy-300 text-sm">{t('contact.whatsapp_support')}</div>
                <div className="text-navy-50 font-bold notranslate" translate="no" dir="ltr">{cfg.phone}</div>
              </div>
            </a>

            <a
              href={`tel:${cfg.phone}`}
              onClick={() => {
                trackEvent({ category: 'call', action: 'click', label: 'contact_call' });
              }}
              className="flex items-center gap-4 glass-card rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-gold-500/40 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center shrink-0 group-hover:bg-gold-500/25 transition-colors">
                <Phone size={24} className="text-gold-400" />
              </div>
              <div>
                <div className="text-navy-300 text-sm">{t('contact.phone_call')}</div>
                <div className="text-navy-50 font-bold notranslate" translate="no" dir="ltr">{cfg.phone}</div>
              </div>
            </a>

            <a
              href={`mailto:${cfg.email}`}
              onClick={() => trackEvent({ category: 'email', action: 'click', label: 'contact_email' })}
              className="flex items-center gap-4 glass-card rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-gold-500/40 group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0 group-hover:bg-teal-500/25 transition-colors">
                <Mail size={24} className="text-teal-400" />
              </div>
              <div>
                <div className="text-navy-300 text-sm">{t('contact.email_official')}</div>
                <div className="text-navy-50 font-bold text-sm notranslate" translate="no" dir="ltr">{cfg.email}</div>
              </div>
            </a>

            <div className="flex items-center gap-4 glass-card rounded-2xl p-5">
              <div className="w-12 h-12 rounded-xl bg-gold-500/15 flex items-center justify-center shrink-0">
                <MapPin size={24} className="text-gold-400" />
              </div>
              <div>
                <div className="text-navy-300 text-sm">{t('contact.service_area')}</div>
                <div className="text-navy-50 font-bold">{(language === 'en' ? t('contact.location_online') : cfg.location)} — {t('contact.service_area_desc')}</div>
              </div>
            </div>

            {/* Embedded Google Map */}
            {cfg.mapEmbedUrl && (
              <div className="rounded-2xl overflow-hidden border border-navy-700/50 h-56 shadow-lg">
                <iframe
                  title={t('contact.map_title')}
                  src={cfg.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(0.9)' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href={cfg.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'social', action: 'click', label: 'facebook' })}
                className="flex-1 flex items-center justify-center gap-2 bg-navy-800/60 hover:bg-blue-600/20 border border-navy-700/50 hover:border-blue-500/40 rounded-xl py-3.5 transition-colors group"
              >
                <Facebook size={20} className="text-blue-400" />
                <span className="text-navy-200 font-semibold text-sm">{t('contact.facebook')}</span>
              </a>
              <a
                href={cfg.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'social', action: 'click', label: 'instagram' })}
                className="flex-1 flex items-center justify-center gap-2 bg-navy-800/60 hover:bg-pink-600/20 border border-navy-700/50 hover:border-pink-500/40 rounded-xl py-3.5 transition-colors group"
              >
                <Instagram size={20} className="text-pink-400" />
                <span className="text-navy-200 font-semibold text-sm">{t('contact.instagram')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
