import { Check, Star, MessageCircle } from 'lucide-react';
import { waLink, useSiteConfig, siteConfig } from '@/siteConfig';
import { useSiteData } from '@/lib/site-data-context';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';
import SectionHeader from '@/components/SectionHeader';

export default function Pricing() {
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const { data } = useSiteData();

  const plans = data.pricingPlans.length > 0
    ? data.pricingPlans.map((p) => ({
        name: p.name,
        tagline: p.tagline,
        price: p.price,
        features: p.features,
        highlighted: p.highlighted,
      }))
    : siteConfig.pricingPlans;

  if (plans.length === 0) return null;

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-navy-950/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="الباقات والأسعار"
          title="باقات مدروسة"
          highlight="تناسب حجم وتطلعات نشاطك"
          subtitle="اختر الباقة المناسبة لك، أو اطلب عرض سعر مخصص لاحتياجاتك بالضبط بدون أي التزام."
        />

        {/* Plans grid */}
        <div ref={ref} className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            /* Reveal wrapper handles scroll reveal without interfering with card hover & scale */
            <div
              key={plan.name}
              className={`reveal ${revealed ? 'revealed' : ''} ${plan.highlighted ? 'z-10' : ''}`}
              style={revealed ? undefined : { transitionDelay: `${i * 100}ms` }}
            >
              <div
                className={`relative rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-2 h-full flex flex-col justify-between ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-gold-500/15 via-navy-800/80 to-navy-900/90 border-2 border-gold-500/60 glow-gold md:scale-105 shadow-2xl'
                    : 'glass-card border border-navy-700/40 hover:border-gold-500/30'
                }`}
              >
                {/* Animated gold border glow accent for highlighted plan */}
                {plan.highlighted && (
                  <div
                    className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-gold-400 via-gold-200 to-gold-500 -z-10 opacity-30 blur-[2px] animate-pulse"
                    style={{ animationDuration: '4s' }}
                    aria-hidden="true"
                  />
                )}

                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-gold-500/30">
                    <Star size={14} className="fill-navy-900" />
                    الأكثر طلباً
                  </div>
                )}

                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-extrabold text-navy-50 mb-1">{plan.name}</h3>
                    <p className="text-navy-300 text-sm">{plan.tagline}</p>
                  </div>

                  {/* Price — يظهر فقط إذا كان مفعّل في الإعدادات */}
                  {cfg.showPrices && plan.price ? (
                    <div className="text-center mb-6">
                      <span className="text-3xl font-extrabold text-gold-400">ابتداءً من {plan.price}</span>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <span className="text-xl font-bold text-gradient-gold">السعر حسب احتياجك</span>
                      <span className="block text-sm text-navy-300 mt-1">اطلب عرض سعر مخصص مجاناً</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check size={18} className="text-gold-400 shrink-0 mt-0.5" />
                        <span className="text-navy-200 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <a
                  href={waLink(`${cfg.whatsappMessages.pricing} — باقة: ${plan.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: `pricing_${plan.name}` })}
                  className={`w-full inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                    plan.highlighted
                      ? 'bg-gold-500 hover:bg-gold-400 text-navy-900 glow-gold-hover shadow-md shadow-gold-500/30'
                      : 'bg-navy-700/60 hover:bg-navy-700 text-navy-50 border border-navy-600'
                  }`}
                >
                  <MessageCircle size={18} />
                  اطلب عرض سعر
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
