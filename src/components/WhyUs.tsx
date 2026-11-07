import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import { siteConfig } from '@/siteConfig';
import { getIcon } from '@/lib/icons';
import SectionHeader from '@/components/SectionHeader';
import Counter from '@/components/Counter';
import { useI18n } from '@/i18n';

export default function WhyUs() {
  const { t, language } = useI18n();
  const { ref: featRef, revealed: featRevealed } = useReveal();
  const { data } = useSiteData();

  const fallbackFeatures = [
    { icon: 'Award', title: t('why_us.feat1_title'), desc: t('why_us.feat1_desc') },
    { icon: 'Smartphone', title: t('why_us.feat2_title'), desc: t('why_us.feat2_desc') },
    { icon: 'Zap', title: t('why_us.feat3_title'), desc: t('why_us.feat3_desc') },
    { icon: 'Headphones', title: t('why_us.feat4_title'), desc: t('why_us.feat4_desc') },
    { icon: 'Search', title: t('why_us.feat5_title'), desc: t('why_us.feat5_desc') },
    { icon: 'ShieldCheck', title: t('why_us.feat6_title'), desc: t('why_us.feat6_desc') },
  ];

  const features = language === 'en'
    ? fallbackFeatures
    : (data.features.length > 0
        ? data.features.map((f) => ({ icon: f.icon, title: f.title, desc: f.description }))
        : fallbackFeatures);

  return (
    <section id="why-us" className="py-20 lg:py-28 bg-navy-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('why_us.badge')}
          title={t('why_us.title')}
          highlight={t('why_us.highlight')}
          subtitle={t('why_us.subtitle')}
        />

        <div ref={featRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => {
            const Icon = getIcon(feat.icon);
            return (
              <div
                key={feat.title}
                className={`reveal ${featRevealed ? 'revealed' : ''}`}
                style={featRevealed ? undefined : { transitionDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start gap-4 glass-card rounded-xl p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-gold-500/30 h-full">
                  <div className="w-11 h-11 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-navy-50 font-bold mb-1">{feat.title}</h3>
                    <p className="text-navy-300 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {siteConfig.counters.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {siteConfig.counters.map((counter) => (
              <div key={counter.label} className="text-center glass-card rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="text-4xl font-extrabold text-gradient-gold mb-2">
                  <Counter value={counter.value} suffix={counter.suffix} />
                </div>
                <div className="text-navy-300 text-sm">{counter.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
