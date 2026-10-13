import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Facebook, Instagram, Send, User, Store, Link, CheckCircle2 } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { useCustomer } from '@/lib/customer-context';

const RATE_LIMIT_MS = 30_000;
const MAX_NAME_LEN = 160;
const MAX_BUSINESS_LEN = 160;
const MAX_PHONE_LEN = 40;
const MAX_URL_LEN = 500;

export default function Contact() {
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const { user, profile } = useCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const lastSubmitRef = useRef<number>(0);
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

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(\+?20|0)?1[0-2,5]\d{8}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;

    if (!validatePhone(form.phone)) {
      setPhoneError('رقم الموبايل غير صحيح. مثال صحيح: 01020095059');
      return;
    }
    setPhoneError(null);

    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      setRateLimited(true);
      return;
    }
    setRateLimited(false);

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const trimmedName = form.name.trim().slice(0, MAX_NAME_LEN);
    const trimmedPhone = form.phone.trim().slice(0, MAX_PHONE_LEN);
    const trimmedBusiness = form.business.trim().slice(0, MAX_BUSINESS_LEN);
    const trimmedUrl = form.pageUrl.trim().slice(0, MAX_URL_LEN) || null;

    const businessTypeMsg = trimmedBusiness
      ? `نوع النشاط: ${trimmedBusiness}`
      : 'نوع النشاط: غير محدد';
    const msg = `السلام عليكم، أنا ${trimmedName}
رقم الهاتف: ${trimmedPhone}
${businessTypeMsg}${trimmedUrl ? `
رابط الصفحة: ${trimmedUrl}` : ''}
عايز أطلب ديمو مجاني لموقع نشاطي.`;

    const { error } = await supabase.from('demo_requests').insert({
      name: trimmedName,
      phone: trimmedPhone,
      business_type: trimmedBusiness,
      page_url: trimmedUrl,
      user_id: user?.id ?? null,
      message_text: msg,
      source: 'form',
      status: 'new',
    });

    lastSubmitRef.current = Date.now();

    if (error) {
      console.error('Demo request save failed:', error.code, error.message);
    } else {
      trackEvent({ category: 'form', action: 'submit', label: 'demo_request' });
    }

    window.open(waLinkIntl(cfg.phoneIntl, msg), '_blank', 'noopener,noreferrer');

    setIsSubmitting(false);

    if (error) {
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('success');
    if (!user) {
      setForm({ name: '', phone: '', business: '', pageUrl: '' });
    } else {
      setForm((prev) => ({ ...prev, business: '', pageUrl: '' }));
    }
  };

  const handlePhoneChange = (v: string) => {
    setForm({ ...form, phone: v });
    if (phoneError) setPhoneError(null);
  };

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all';

  return (
    <section id="contact" className="py-20 lg:py-28 bg-navy-950/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">تواصل معنا</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            اطلب ديمو مجاني <span className="text-gradient-gold">لنشاطك</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            بنخدم الأنشطة التجارية في المنصورة والدقهلية وكل مصر. املأ بيانات نشاطك، وسنرسل طلبك مباشرة إلى واتساب للبدء في تجهيز الديمو.
          </p>
        </div>

        <div ref={ref} className={`grid lg:grid-cols-2 gap-8 reveal ${revealed ? 'revealed' : ''}`}>
          {/* Form */}
          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot — hidden from users, bots fill it */}
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
                <label className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <User size={16} className="text-gold-400" />
                  الاسم
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_NAME_LEN}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="اسمك الكريم"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Store size={16} className="text-gold-400" />
                  نوع النشاط
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_BUSINESS_LEN}
                  value={form.business}
                  onChange={(e) => setForm({ ...form, business: e.target.value })}
                  placeholder="مثال: شركة، متجر، عيادة، مطعم..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-gold-400" />
                  رقم الموبايل
                </label>
                <input
                  type="tel"
                  required
                  maxLength={MAX_PHONE_LEN}
                  value={form.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className={inputClass}
                  dir="ltr"
                />
                {phoneError && (
                  <p className="text-red-300 text-xs mt-1.5" role="alert">{phoneError}</p>
                )}
              </div>

              <div>
                <label className="text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Link size={16} className="text-gold-400" />
                  رابط الصفحة <span className="text-navy-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="url"
                  maxLength={MAX_URL_LEN}
                  value={form.pageUrl}
                  onChange={(e) => setForm({ ...form, pageUrl: e.target.value })}
                  placeholder="https://example.com"
                  className={inputClass}
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 disabled:cursor-not-allowed text-navy-900 font-bold px-6 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover text-lg"
              >
                <Send size={20} />
                {isSubmitting ? 'جارٍ إرسال الطلب...' : 'اطلب الديمو عبر واتساب'}
              </button>
              <p className="text-center text-navy-400 text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} className="text-gold-400" />
                بدون التزام
              </p>
              {rateLimited && (
                <p className="text-amber-300 text-sm text-center" role="alert">
                  لقد أرسلت طلباً للتو. انتظر 30 ثانية قبل إرسال طلب آخر.
                </p>
              )}
              {submitStatus === 'success' && (
                <div className="text-center space-y-1" role="status">
                  <p className="text-green-400 text-sm font-semibold">تم إرسال طلبك بنجاح.</p>
                  <p className="text-green-300/80 text-sm">هنرد عليك في أقرب وقت.</p>
                </div>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-300 text-sm text-center" role="alert">
                  تم فتح واتساب، لكن تعذر حفظ الطلب لدينا. يمكنك إرسال الرسالة من واتساب مباشرة.
                </p>
              )}
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-5">
            {/* Direct contact buttons */}
            <a
              href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.contact)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'contact_whatsapp' })}
              className="flex items-center gap-4 glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                <MessageCircle size={24} className="text-green-400" />
              </div>
              <div>
                <div className="text-navy-400 text-sm">واتساب</div>
                <div className="text-navy-50 font-bold" dir="ltr">{cfg.phone}</div>
              </div>
            </a>

            <a
              href={`tel:${cfg.phone}`}
              onClick={() => trackEvent({ category: 'call', action: 'click', label: 'contact_call' })}
              className="flex items-center gap-4 glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 transition-colors">
                <Phone size={24} className="text-gold-400" />
              </div>
              <div>
                <div className="text-navy-400 text-sm">اتصال مباشر</div>
                <div className="text-navy-50 font-bold" dir="ltr">{cfg.phone}</div>
              </div>
            </a>

            <a
              href={`mailto:${cfg.email}`}
              onClick={() => trackEvent({ category: 'email', action: 'click', label: 'contact_email' })}
              className="flex items-center gap-4 glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors">
                <Mail size={24} className="text-teal-400" />
              </div>
              <div>
                <div className="text-navy-400 text-sm">البريد الإلكتروني</div>
                <div className="text-navy-50 font-bold text-sm" dir="ltr">{cfg.email}</div>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-center gap-4 glass-card rounded-xl p-5">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <MapPin size={24} className="text-gold-400" />
              </div>
              <div>
                <div className="text-navy-400 text-sm">الموقع</div>
                <div className="text-navy-50 font-bold">{cfg.location}</div>
              </div>
            </div>

            {/* Embedded map — only if URL is set in admin settings */}
            {cfg.mapEmbedUrl && (
              <div className="rounded-xl overflow-hidden border border-navy-600/30 h-56">
                <iframe
                  title="موقع Click Zoon على خرائط جوجل"
                  src={cfg.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(0.8) contrast(0.9)' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {/* Social */}
            <div className="flex gap-4">
              <a
                href={cfg.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'social', action: 'click', label: 'facebook' })}
                className="flex-1 flex items-center justify-center gap-2 bg-navy-800/50 hover:bg-blue-600/20 border border-navy-600/30 hover:border-blue-500/30 rounded-xl py-3.5 transition-all duration-300 group"
              >
                <Facebook size={22} className="text-blue-400" />
                <span className="text-navy-200 font-semibold text-sm">فيسبوك</span>
              </a>
              <a
                href={cfg.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'social', action: 'click', label: 'instagram' })}
                className="flex-1 flex items-center justify-center gap-2 bg-navy-800/50 hover:bg-pink-600/20 border border-navy-600/30 hover:border-pink-500/30 rounded-xl py-3.5 transition-all duration-300 group"
              >
                <Instagram size={22} className="text-pink-400" />
                <span className="text-navy-200 font-semibold text-sm">إنستجرام</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
