import { useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import { getIcon } from '@/lib/icons';
import SectionHeader from '@/components/SectionHeader';
import { useI18n } from '@/i18n';

function ServiceCard({
  service,
  index,
  revealed,
}: {
  service: { icon: string; title: string; desc: string };
  index: number;
  revealed: boolean;
}) {
  const [coords, setCoords] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const Icon = getIcon(service.icon);

  return (
    <div
      className={`reveal ${revealed ? 'revealed' : ''}`}
      style={revealed ? undefined : { transitionDelay: `${index * 80}ms` }}
    >
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
        }}
        onMouseLeave={() => setCoords((prev) => ({ ...prev, active: false }))}
        className="group relative glass-card rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2 hover:border-gold-500/40 glow-gold-hover h-full flex flex-col justify-between overflow-hidden"
      >
        {/* Spotlight cursor glow */}
        {coords.active && (
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, rgba(212, 175, 55, 0.15), transparent 70%)`,
            }}
          />
        )}

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-xl bg-navy-700/60 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:bg-gold-500/20 group-hover:scale-110 group-hover:rotate-6 shadow-inner">
            <Icon size={28} className="text-gold-400 transition-colors group-hover:text-gold-300" />
          </div>
          <h3 className="text-xl font-bold text-navy-50 mb-3 group-hover:text-gold-300 transition-colors">
            {service.title}
          </h3>
          <p className="text-navy-300 leading-relaxed text-sm sm:text-base">{service.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const { t, language } = useI18n();
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();

  const fallbackServices = [
    { icon: 'Globe', title: t('services.website_development'), desc: t('services.website_desc') },
    { icon: 'ShoppingCart', title: t('services.ecommerce'), desc: t('services.ecommerce_desc') },
    { icon: 'Utensils', title: t('services.qr_menu'), desc: t('services.qr_menu_desc') },
    { icon: 'Search', title: t('services.seo_ready'), desc: t('services.seo_ready_desc') },
    { icon: 'Smartphone', title: t('services.speed_optimization'), desc: t('services.speed_optimization_desc') },
    { icon: 'Shield', title: t('services.continuous_support'), desc: t('services.continuous_support_desc') },
  ];

  const services = language === 'en'
    ? fallbackServices
    : (data.services.length > 0
        ? data.services.map((s) => ({ icon: s.icon, title: s.title, desc: s.description }))
        : fallbackServices);

  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('services.badge')}
          title={t('services.title')}
          highlight={t('services.highlight')}
          subtitle={t('services.subtitle')}
        />

        {/* Services grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={i}
              revealed={revealed}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
