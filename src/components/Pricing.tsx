import { Check, Star, MessageCircle } from 'lucide-react';
import { waLink, useSiteConfig, siteConfig } from '@/siteConfig';
import { useSiteData } from '@/lib/site-data-context';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';

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
    <section id="pricing" className="py-20 lg:py-28 bg-navy-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">الباقات</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            باقات تناسب <span className="text-gradient-gold">كل نشاط</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            اختر الباقة المناسبة لك، أو اطلب عرض سعر مخصص لاحتياجاتك بالضبط.
          </p>
        </div>

        {/* Plans grid */}
        <div ref={ref} className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`reveal ${revealed ? 'revealed' : ''} relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-gold-500/10 to-navy-800/60 border-2 border-gold-500/40 glow-gold md:scale-105'
                  : 'glass-card border border-navy-600/30'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Star size={14} className="fill-navy-900" />
                  الأكثر طلباً
                </div>
              )}

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
                  <span className="text-xl font-bold text-navy-200">تبدأ من</span>
                  <span className="block text-sm text-navy-400 mt-1">اطلب عرض سعر مخصص</span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={18} className="text-gold-400 shrink-0 mt-0.5" />
                    <span className="text-navy-200 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={waLink(`${cfg.whatsappMessages.pricing} — باقة: ${plan.name}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: `pricing_${plan.name}` })}
                className={`w-full inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-gold-500 hover:bg-gold-400 text-navy-900'
                    : 'bg-navy-700/50 hover:bg-navy-700 text-navy-50 border border-navy-600'
                }`}
              >
                <MessageCircle size={18} />
                اطلب عرض سعر
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
