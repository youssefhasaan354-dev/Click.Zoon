import { memo } from 'react';
import { Coffee, Stethoscope, Scale, Sparkles, Building2, ShoppingBag } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  category: string;
  icon: typeof Coffee;
}

const clients: ClientItem[] = [
  { id: '1', name: 'Delano Café & Bistro', category: 'مطاعم وكافيهات', icon: Coffee },
  { id: '2', name: 'Elite Specialty Clinics', category: 'عيادات ومراكز طبية', icon: Stethoscope },
  { id: '3', name: 'Al-Mustashar Law Group', category: 'مكاتب محاماة واستشارات', icon: Scale },
  { id: '4', name: 'Orchid Luxury Boutique', category: 'متاجر إلكترونية راقية', icon: Sparkles },
  { id: '5', name: 'City Home Real Estate', category: 'شركات واستثمار عقاري', icon: Building2 },
  { id: '6', name: 'SuperFresh Gourmet', category: 'أغذية وسوبرماركت', icon: ShoppingBag },
];

function ClientLogosMarquee() {
  // Duplicate array for seamless infinite marquee loop
  const marqueeItems = [...clients, ...clients];

  return (
    <section
      className="py-12 border-y border-navy-800/60 bg-navy-950/40 overflow-hidden select-none"
      aria-label="شركاء النجاح والأنشطة التي نخدمها"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs sm:text-sm font-semibold text-navy-400 tracking-wider">
          نُصمّم ونطوّر حضوراً رقمياً فائق التميز لأكثر من 50+ نشاط تجاري في مصر والعالم العربي
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
                <div className="text-right">
                  <div className="text-sm font-bold text-navy-300 group-hover:text-gold-300 transition-colors">
                    {client.name}
                  </div>
                  <div className="text-[11px] text-navy-500 group-hover:text-navy-400 transition-colors">
                    {client.category}
                  </div>
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
