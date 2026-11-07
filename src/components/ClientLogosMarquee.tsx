import { memo } from 'react';
import { Coffee, Stethoscope, Scale, Sparkles, Building2, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ClientItem {
  id: string;
  name: string;
  catKey: string;
  icon: typeof Coffee;
}

const clients: ClientItem[] = [
  { id: '1', name: 'Delano Café & Bistro', catKey: 'marquee.cat_restaurants', icon: Coffee },
  { id: '2', name: 'Elite Specialty Clinics', catKey: 'marquee.cat_medical', icon: Stethoscope },
  { id: '3', name: 'Al-Mustashar Law Group', catKey: 'marquee.cat_law', icon: Scale },
  { id: '4', name: 'Orchid Luxury Boutique', catKey: 'marquee.cat_luxury', icon: Sparkles },
  { id: '5', name: 'City Home Real Estate', catKey: 'marquee.cat_realestate', icon: Building2 },
  { id: '6', name: 'SuperFresh Gourmet', catKey: 'marquee.cat_gourmet', icon: ShoppingBag },
];

function ClientLogosMarquee() {
  const { t } = useI18n();
  const marqueeItems = [...clients, ...clients];

  return (
    <section
      className="py-12 border-y border-navy-800/60 bg-navy-950/40 overflow-hidden select-none"
      aria-label={t('marquee.aria_label')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs sm:text-sm font-semibold text-navy-400 tracking-wider">
          {t('marquee.subtitle')}
        </p>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div
          className="flex gap-6 sm:gap-10 w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
          style={{ willChange: 'transform' }}
        >
          {marqueeItems.map((client, i) => {
            const Icon = client.icon;
            return (
              <div
                key={`${client.id}-${i}`}
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-navy-800/40 border border-navy-700/50 hover:border-gold-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-navy-900/80 border border-navy-700/60 flex items-center justify-center text-navy-400 group-hover:text-gold-400 group-hover:bg-gold-500/10 group-hover:border-gold-500/40 transition-colors shrink-0">
                  <Icon size={20} />
                </div>
                <div className="text-start">
                  <div className="text-navy-100 font-bold text-sm group-hover:text-gold-300 transition-colors">
                    {client.name}
                  </div>
                  <div className="text-navy-400 text-xs">{t(client.catKey)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(ClientLogosMarquee);
