import { Award } from 'lucide-react';
import Counter from '@/components/Counter';
import { useSiteConfig } from '@/siteConfig';
import { useReveal } from '@/hooks/useReveal';

export default function SocialProofStrip() {
  const cfg = useSiteConfig();
  const { ref, revealed } = useReveal();

  const customStats = cfg.aboutStats && cfg.aboutStats.length > 0 ? cfg.aboutStats : null;

  // Do not display fabricated numbers: only render if configured in database
  if (!customStats || customStats.length === 0) {
    return null;
  }

  return (
    <div className="relative z-20 -mt-8 sm:-mt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className={`glass-card rounded-2xl p-4 sm:p-6 shadow-2xl border border-gold-500/25 bg-navy-900/90 backdrop-blur-xl transition-all duration-700 reveal ${
          revealed ? 'revealed' : ''
        }`}
      >
        <div className={`grid grid-cols-2 ${customStats.length >= 4 ? 'lg:grid-cols-4' : customStats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6 divide-y sm:divide-y-0 divide-navy-700/40`}>
          {customStats.map((item, idx) => {
            const Icon = 'icon' in item && item.icon ? (item.icon as typeof Award) : Award;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 sm:gap-4 p-2 sm:p-3 ${
                  idx > 0 ? 'lg:border-r lg:border-navy-700/50' : ''
                }`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 text-gold-400">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy-50">
                    <span className="text-gradient-gold">
                      <Counter value={item.value} suffix={item.suffix} />
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-navy-300 font-medium leading-tight">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
