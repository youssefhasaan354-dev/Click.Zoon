import { Phone, MessageCircle } from 'lucide-react';
import { useSiteConfig, waLinkIntl } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';

export default function MobileBottomBar() {
  const cfg = useSiteConfig();

  return (
    <div
      className="sm:hidden fixed bottom-0 right-0 left-0 z-50 bg-navy-900/95 backdrop-blur-md border-t border-gold-500/20 flex safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a
        href={`tel:${cfg.phone}`}
        onClick={() => trackEvent({ category: 'call', action: 'click', label: 'mobile_bar' })}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-navy-50 font-bold border-l border-navy-700/40 active:bg-navy-800 transition-colors text-sm"
      >
        <Phone size={18} className="text-gold-400 shrink-0" />
        اتصل
      </a>
      <a
        href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.general)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'mobile_bar' })}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold-500/10 text-gold-300 font-bold active:bg-gold-500/20 transition-colors text-sm"
      >
        <MessageCircle size={18} className="text-green-400 shrink-0" />
        واتساب
      </a>
    </div>
  );
}
