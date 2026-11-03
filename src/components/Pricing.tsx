import { useState } from 'react';
import { Check, Star, MessageCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { waLink, useSiteConfig, siteConfig } from '@/siteConfig';
import { useSiteData } from '@/lib/site-data-context';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';
import SectionHeader from '@/components/SectionHeader';

interface ComparisonFeature {
  name: string;
  basic: string | boolean;
  pro: string | boolean;
  ecommerce: string | boolean;
}

const comparisonFeatures: ComparisonFeature[] = [
  { name: 'عدد صفحات الموقع', basic: 'صفحة واحدة تفاعلية', pro: 'حتى 6 صفحات', ecommerce: 'صفحات ومنتجات غير محدودة' },
  { name: 'دومين .com واستضافة سريعة', basic: true, pro: true, ecommerce: true },
  { name: 'شهادة أمان مشفرة SSL', basic: true, pro: true, ecommerce: true },
  { name: 'تصميم متجاوب 100% مع الموبايل', basic: true, pro: true, ecommerce: true },
  { name: 'منيو إلكتروني / كتالوج عرض', basic: false, pro: true, ecommerce: true },
  { name: 'بوابات الدفع الإلكتروني (فيزا / محافظ)', basic: false, pro: 'اختياري', ecommerce: true },
  { name: 'ربط شركات الشحن والتوصيل', basic: false, pro: false, ecommerce: true },
  { name: 'تحسين محركات البحث SEO', basic: 'أساسي', pro: 'متقدم ومستهدف', ecommerce: 'متقدم للمتجر والمنتجات' },
  { name: 'لوحة تحكم لإدارة الموقع بسهولة', basic: false, pro: true, ecommerce: true },
  { name: 'مدة الدعم الفني والتحديثات', basic: 'شهر كامل', pro: '3 أشهر مجاناً', ecommerce: '6 أشهر متابعة مستمرة' },
  { name: 'ديمو تجريبي مجاني قبل أي دفع', basic: true, pro: true, ecommerce: true },
];

export default function Pricing() {
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const { data } = useSiteData();
  const [billingCycle, setBillingCycle] = useState<'onetime' | 'monthly'>('onetime');
  const [showTable, setShowTable] = useState(false);

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
          subtitle="اختر الباقة المناسبة لك، أو اطلب عرض سعر مخصص لاحتياجاتك بالضبط بدون أي التزام مادي مسبق."
        />

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-navy-900/90 border border-navy-700/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => setBillingCycle('onetime')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                billingCycle === 'onetime'
                  ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                  : 'text-navy-300 hover:text-navy-100'
              }`}
            >
              دفع لمرة واحدة (تملك كامل)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                billingCycle === 'monthly'
                  ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                  : 'text-navy-300 hover:text-navy-100'
              }`}
            >
              <span>اشتراك شهري شامل الصيانة</span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] px-2 py-0.5 rounded-full border border-teal-500/30">
                الأوفر للبدايات
              </span>
            </button>
          </div>
        </div>

        {billingCycle === 'monthly' && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-center text-xs sm:text-sm text-gold-300">
            💡 نظام الاشتراك الشهري يبدأ بدون تكلفة تأسيس كبيرة، ويشمل حجز الدومين، السيرفر فائق السرعة، النسخ الاحتياطي الأسبوعي، والدعم الفني المباشر.
          </div>
        )}

        {/* Plans grid */}
        <div ref={ref} className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch mb-12">
          {plans.map((plan, i) => (
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

                  {/* Price */}
                  {cfg.showPrices && plan.price ? (
                    <div className="text-center mb-6">
                      <span className="text-3xl font-extrabold text-gold-400">
                        {billingCycle === 'monthly' ? `من ${Math.round(parseInt(plan.price.replace(/\D/g, '') || '3000') / 6)} ج.م/شهر` : `ابتداءً من ${plan.price}`}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <span className="text-xl font-bold text-gradient-gold">
                        {billingCycle === 'monthly' ? 'اشتراك شهري مرن' : 'السعر حسب احتياجك'}
                      </span>
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
                  href={waLink(`${cfg.whatsappMessages.pricing} — باقة: ${plan.name} (${billingCycle === 'monthly' ? 'نظام شهري' : 'دفع لمرة واحدة'})`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('generate_lead', { event_category: 'pricing', event_label: plan.name })}
                  className={`w-full inline-flex items-center justify-center gap-2 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                    plan.highlighted
                      ? 'bg-gold-500 hover:bg-gold-400 text-navy-900 glow-gold-hover shadow-md shadow-gold-500/30'
                      : 'bg-navy-700/60 hover:bg-navy-700 text-navy-50 border border-navy-600'
                  }`}
                >
                  <MessageCircle size={18} />
                  اطلب عرض سعر وديمو
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table Toggle */}
        <div className="max-w-4xl mx-auto text-center">
          <button
            type="button"
            onClick={() => setShowTable((prev) => !prev)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy-800/80 hover:bg-navy-800 border border-gold-500/30 text-gold-300 font-bold text-sm transition-all shadow-lg"
          >
            <span>{showTable ? 'إخفاء جدول المقارنة التفصيلي' : 'مقارنة تفصيلية بين مميزات كل الباقات'}</span>
            {showTable ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showTable && (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-navy-700/80 bg-navy-900/90 shadow-2xl">
              <table className="w-full text-right text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-navy-800/90 border-b border-navy-700 text-navy-200">
                    <th className="p-4 font-bold text-gold-300">الميزة والمواصفات</th>
                    <th className="p-4 font-bold text-center">باقة أساسية</th>
                    <th className="p-4 font-bold text-center text-gold-400 bg-gold-500/10">باقة احترافية</th>
                    <th className="p-4 font-bold text-center">متجر إلكتروني</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-navy-200">
                  {comparisonFeatures.map((feat) => {
                    const renderCell = (val: string | boolean) => {
                      if (typeof val === 'boolean') {
                        return val ? (
                          <Check size={18} className="text-gold-400 mx-auto" />
                        ) : (
                          <X size={18} className="text-navy-600 mx-auto" />
                        );
                      }
                      return <span className="font-medium">{val}</span>;
                    };

                    return (
                      <tr key={feat.name} className="hover:bg-navy-800/40 transition-colors">
                        <td className="p-4 font-semibold text-navy-100">{feat.name}</td>
                        <td className="p-4 text-center">{renderCell(feat.basic)}</td>
                        <td className="p-4 text-center bg-gold-500/5 text-gold-200 font-semibold">
                          {renderCell(feat.pro)}
                        </td>
                        <td className="p-4 text-center">{renderCell(feat.ecommerce)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
