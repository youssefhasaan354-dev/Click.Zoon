import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';

export default function FloatingWhatsApp() {
  const cfg = useSiteConfig();
  const [visible, setVisible] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed left-4 sm:left-6 z-50 floating-btn-pos transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      {/* Tooltip bubble */}
      {tooltipOpen && (
        <div className="absolute bottom-16 left-0 bg-navy-800 border border-navy-600/40 rounded-2xl rounded-bl-none p-4 shadow-xl w-64 animate-fade-up">
          <button
            className="absolute top-2 left-2 text-navy-400 hover:text-navy-50 transition-colors"
            onClick={() => setTooltipOpen(false)}
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
          <p className="text-navy-100 text-sm leading-relaxed pl-5">
            محتاج موقع لنشاطك؟
            <br />
            كلّمنا على واتساب واحنا هنظبطك
          </p>
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => setTooltipOpen(!tooltipOpen)}
        className="relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-110 animate-pulse-gold"
        aria-label="تواصل عبر واتساب"
      >
        {!tooltipOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-navy-900 text-xs font-bold flex items-center justify-center animate-bounce">
            !
          </span>
        )}
        {tooltipOpen ? <X size={24} className="text-white" /> : <MessageCircle size={26} className="text-white" />}
      </button>

      {/* Direct WhatsApp link */}
      <a
        href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.general)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'floating_button' })}
        className="absolute inset-0"
        style={{ pointerEvents: tooltipOpen ? 'none' : 'auto' }}
        aria-label="فتح محادثة واتساب"
      />
    </div>
  );
}
