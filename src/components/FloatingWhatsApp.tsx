import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { trackInteractionClick } from '@/lib/demo-requests';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingWhatsApp() {
  const cfg = useSiteConfig();
  const [scrolledPast, setScrolledPast] = useState(false);
  const [contactInView, setContactInView] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const contactObserverRef = useRef<IntersectionObserver | null>(null);

  // 1. Scroll detection (visible after 300px)
  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 2. Hide when #contact form is in viewport to avoid covering inputs
  useEffect(() => {
    const contactEl = document.getElementById('contact');
    if (!contactEl) return;

    contactObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setContactInView(entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    contactObserverRef.current.observe(contactEl);
    return () => contactObserverRef.current?.disconnect();
  }, []);

  // 3. Gentle ring pulse every 6 seconds (not constant distraction)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const visible = scrolledPast && !contactInView;

  return (
    <div
      className={`fixed left-4 sm:left-6 z-50 floating-btn-pos transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      {/* Tooltip bubble with spring entrance */}
      <AnimatePresence>
        {tooltipOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 350 }}
            className="absolute bottom-16 left-0 bg-navy-900 border border-gold-500/40 rounded-2xl rounded-bl-none p-4 shadow-2xl w-64 text-right backdrop-blur-md z-20"
          >
            <button
              className="absolute top-2 left-2 text-navy-400 hover:text-gold-300 transition-colors p-1"
              onClick={() => setTooltipOpen(false)}
              aria-label="إغلاق التلميح"
            >
              <X size={15} />
            </button>
            <p className="text-navy-100 text-sm leading-relaxed pl-4">
              عايز تبدأ موقع لنشاطك؟
              <br />
              <span className="text-gold-400 font-bold">تواصل مباشرة على واتساب</span> وسنجهّز لك الديمو المجاني.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button with gentle ring pulse every ~6s */}
      <div className="relative">
        {/* Expanding pulse ring */}
        {isPulsing && (
          <span
            className="absolute -inset-2 rounded-full border-2 border-green-400/80 animate-ping pointer-events-none"
            aria-hidden="true"
          />
        )}

        <button
          onClick={() => setTooltipOpen(!tooltipOpen)}
          className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-lg shadow-green-500/35 transition-transform duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="تواصل عبر واتساب"
        >
          {!tooltipOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-navy-950 text-xs font-bold flex items-center justify-center shadow-md">
              !
            </span>
          )}
          {tooltipOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <MessageCircle size={26} className="text-white" />
          )}
        </button>

        {/* Direct WhatsApp link overlay if tooltip is closed */}
        {!tooltipOpen && (
          <a
            href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent({ category: 'whatsapp', action: 'click', label: 'floating_button' });
              trackInteractionClick('whatsapp_click', { business_type: 'زر واتساب العائم' });
            }}
            className="absolute inset-0 rounded-full"
            aria-label="فتح محادثة واتساب مع Click Zoon"
          />
        )}
      </div>
    </div>
  );
}
