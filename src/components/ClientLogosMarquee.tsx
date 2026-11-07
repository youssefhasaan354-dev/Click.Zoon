import { memo } from 'react';
import { Coffee, Stethoscope, ShoppingBag, Building2, Sparkles, Scale } from 'lucide-react';

interface SectorItem {
  id: string;
  name: string;
  category: string;
  icon: typeof Coffee;
}

const sectors: SectorItem[] = [
  { id: '1', name: 'مطاعم وكافيهات', category: 'منيو إلكتروني QR وطلبات مباشرة', icon: Coffee },
  { id: '2', name: 'عيادات ومراكز طبية', category: 'حجز مواعيد واستعراض جداول الأطباء', icon: Stethoscope },
  { id: '3', name: 'متاجر إلكترونية', category: 'سلة مشتريات وبوابات دفع وشحن', icon: ShoppingBag },
  { id: '4', name: 'مكاتب محاماة واستشارات', category: 'حضور رقمي مهني واستشارات قانونية', icon: Scale },
  { id: '5', name: 'شركات واستثمار عقاري', category: 'استعراض المشروعات والوحدات السكنية', icon: Building2 },
  { id: '6', name: 'مراكز عناية وتجميل', category: 'حجز خدمات وباقات ومعرض أعمال', icon: Sparkles },
];

function ClientLogosMarquee() {
  // Duplicate array for seamless infinite marquee loop
  const marqueeItems = [...sectors, ...sectors];

  return (
    <section
      className="py-12 border-y border-navy-800/60 bg-navy-950/40 overflow-hidden select-none"
      aria-label="الأنشطة والقطاعات التجارية التي نصمم لها"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs sm:text-sm font-semibold text-navy-300 tracking-wider">
          نُصمّم ونطوّر حلولاً رقمية وتصميمات مخصصة لمختلف الأنشطة والقطاعات التجارية
        </p>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div
          className="flex gap-6 sm:gap-10 w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
          style={{ willChange: 'transform' }}
        >
          {marqueeItems.map((sector, i) => {
            const Icon = sector.icon;
            return (
              <div
                key={`${sector.id}-${i}`}
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-navy-800/40 border border-navy-700/50 hover:border-gold-500/50 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-navy-900/80 border border-navy-700/60 flex items-center justify-center text-navy-400 group-hover:text-gold-400 group-hover:bg-gold-500/10 group-hover:border-gold-500/40 transition-colors shrink-0">
                  <Icon size={20} />
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-navy-200 group-hover:text-gold-300 transition-colors">
                    {sector.name}
                  </div>
                  <div className="text-[11px] text-navy-400 group-hover:text-navy-300 transition-colors">
                    {sector.category}
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
