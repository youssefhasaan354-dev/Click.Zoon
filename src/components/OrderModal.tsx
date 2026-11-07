import { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { submitDemoRequest } from '@/lib/demo-requests';
import { trackEvent } from '@/lib/analytics';
import { cleanPhoneNumber, isValidEgyptianPhone } from '@/lib/phone';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { ShowcaseItem, kindLabels } from '@/lib/showcase';

interface OrderModalProps {
  item: ShowcaseItem;
  onClose: () => void;
}

/** "اطلب الآن" dialog — saves the lead (source = showcase) so it shows up in the admin requests panel. */
export default function OrderModal({ item, onClose }: OrderModalProps) {
  const cfg = useSiteConfig();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    firstFieldRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusables = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [onClose]);

  const kind = kindLabels[item.kind];
  const requestText = `طلب نموذج: ${item.title} (${kind})`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const cleaned = cleanPhoneNumber(phone);
    if (trimmedName.length < 2) {
      setMessage('اكتب اسمك من فضلك.');
      return;
    }
    if (!isValidEgyptianPhone(cleaned)) {
      setMessage('رقم الموبايل غير صحيح. مثال: 01012345678');
      return;
    }
    setMessage('');
    setStatus('sending');

    const res = await submitDemoRequest({
      name: trimmedName,
      phone: cleaned,
      business_type: item.title,
      message_text: `${requestText} — الرابط: ${window.location.href}`,
      source: 'showcase',
      honeypot,
    });

    if (!res.success) {
      setStatus('error');
      setMessage(
        res.isRateLimited
          ? 'لقد تجاوزت الحد المسموح من الطلبات مؤقتاً. حاول لاحقاً أو تواصل واتساب.'
          : 'تعذر إرسال الطلب. جرّب مرة أخرى أو تواصل معنا على واتساب.'
      );
      return;
    }
    trackEvent({ category: 'form', action: 'submit', label: `showcase_order_${item.slug}` });
    setStatus('done');
  };

  const waUrl = waLinkIntl(
    cfg.phoneIntl,
    `السلام عليكم، عايز أطلب نموذج "${item.title}" (${kind}) لنشاطي.`
  );

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
      <div
        ref={dialogRef}
        dir="rtl"
        className="w-full sm:max-w-md glass-card rounded-t-3xl sm:rounded-2xl border border-navy-700/60 p-6 relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 text-navy-400 hover:text-navy-50 p-1"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        {status === 'done' ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="mx-auto text-green-400 mb-3" />
            <h2 id="order-modal-title" className="text-xl font-bold text-navy-50 mb-2">تم استلام طلبك</h2>
            <p className="text-navy-300 text-sm mb-5">هنتواصل معاك قريباً بخصوص «{item.title}».</p>
            <button
              type="button"
              onClick={onClose}
              className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-6 py-2.5 rounded-xl text-sm"
            >
              تمام
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="order-modal-title" className="text-xl font-bold text-navy-50 mb-1">اطلب الآن</h2>
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

            <label className="block text-navy-200 text-sm font-semibold mb-1.5" htmlFor="order-name">الاسم</label>
            <input
              id="order-name"
              ref={firstFieldRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 focus:border-gold-500/50 focus:outline-none text-sm mb-4"
            />

            <label className="block text-navy-200 text-sm font-semibold mb-1.5" htmlFor="order-phone">رقم الموبايل / واتساب</label>
            <input
              id="order-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="01012345678"
              className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-500 focus:border-gold-500/50 focus:outline-none text-sm mb-3 text-right"
            />

            {message && (
              <p role="alert" className="text-red-300 text-sm mb-3">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {status === 'sending' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {status === 'sending' ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: `showcase_${item.slug}` })}
              className="mt-3 w-full border border-navy-600 hover:border-gold-500/50 text-navy-100 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
            >
              <MessageCircle size={18} />
              أو كلمنا على واتساب مباشرة
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
