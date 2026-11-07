import { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { submitDemoRequest } from '@/lib/demo-requests';
import { trackEvent } from '@/lib/analytics';
import { cleanPhoneNumber, isValidEgyptianPhone } from '@/lib/phone';
import { ShowcaseItem, kindLabels } from '@/lib/showcase';
import { useI18n } from '@/i18n';

interface OrderModalProps {
  item: ShowcaseItem;
  onClose: () => void;
}

/** "اطلب الآن" dialog — saves the lead (source = showcase) so it shows up in the admin requests panel. */
export default function OrderModal({ item, onClose }: OrderModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const kind = t('showcase.kind_' + item.kind) || kindLabels[item.kind];
  const requestText = `${t('order_modal.request_prefix')}${item.title} (${kind})`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const cleaned = cleanPhoneNumber(phone);
    if (trimmedName.length < 2) {
      setMessage(t('order_modal.error_name'));
      return;
    }
    if (!isValidEgyptianPhone(cleaned)) {
      setMessage(t('order_modal.error_phone'));
      return;
    }
    setMessage('');
    setStatus('sending');

    const res = await submitDemoRequest({
      name: trimmedName,
      phone: cleaned,
      business_type: item.title,
      message_text: `${requestText} — ${t('order_modal.link_label', { url: window.location.href })}`,
      source: 'showcase',
      honeypot,
    });

    if (!res.success) {
      setStatus('error');
      setMessage(
        res.isRateLimited
          ? t('order_modal.error_rate_limit')
          : t('order_modal.error_general')
      );
      return;
    }
    trackEvent({ category: 'form', action: 'submit', label: `showcase_order_${item.slug}` });
    setStatus('done');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-navy-950/80 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md glass-card rounded-t-3xl sm:rounded-2xl border border-navy-700/60 p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 text-navy-400 hover:text-navy-50 p-1"
          aria-label={t('common.close')}
        >
          <X size={20} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="mx-auto text-green-400 mb-3" />
            <h2 id="order-modal-title" className="text-xl font-bold text-navy-50 mb-2">{t('order_modal.success_title')}</h2>
            <p className="text-navy-300 text-sm mb-5">
              {t('order_modal.success_desc', { title: item.title })}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-6 py-2.5 rounded-xl text-sm"
            >
              {t('order_modal.done_btn')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="order-modal-title" className="text-xl font-bold text-navy-50 mb-1">{t('order_modal.title')}</h2>
            <p className="text-navy-300 text-sm mb-5">{requestText}</p>

            {/* Honeypot: hidden from real users */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute opacity-0 pointer-events-none h-0 w-0"
              aria-hidden="true"
            />

            <label className="block text-navy-200 text-sm font-semibold mb-1.5" htmlFor="order-name">
              {t('order_modal.name_label')}
            </label>
            <input
              id="order-name"
              ref={firstFieldRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder={t('order_modal.name_placeholder')}
              className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 focus:border-gold-500/50 focus:outline-none text-sm mb-4"
            />

            <label className="block text-navy-200 text-sm font-semibold mb-1.5" htmlFor="order-phone">
              {t('order_modal.phone_label')}
            </label>
            <input
              id="order-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder={t('order_modal.phone_placeholder')}
              className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 focus:border-gold-500/50 focus:outline-none text-sm mb-4"
            />

            {message && (
              <p className={`text-xs mb-4 ${status === 'error' ? 'text-red-400' : 'text-navy-300'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-950 font-bold py-3.5 rounded-xl text-sm inline-flex items-center justify-center gap-2 transition-all glow-gold-hover shadow-lg shadow-gold-500/20"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('order_modal.submitting')}</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{t('order_modal.confirm_btn')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
