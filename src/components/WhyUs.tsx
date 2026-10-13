import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import { siteConfig } from '@/siteConfig';
import { getIcon } from '@/lib/icons';

const fallbackFeatures = [
  { icon: 'Award', title: 'تصميم احترافي', desc: 'كل موقع مصمم خصيصاً ليُعبّر عن هوية نشاطك.' },
  { icon: 'Smartphone', title: 'موبايل أولاً', desc: 'أغلب عملائك على الموبايل — وخلي تجربتهم مثالية.' },
  { icon: 'Zap', title: 'تسليم سريع', desc: 'الديمو في 24-72 ساعة، والتسليم النهائي من 3 أيام إلى أسبوع.' },
  { icon: 'Headphones', title: 'دعم مستمر', desc: 'مش بنسيبك بعد الإطلاق — دعم فني وتحديثات مستمرة.' },
  { icon: 'Search', title: 'جاهز لـ SEO', desc: 'مهيّأ لظهور جوجل من اليوم الأول.' },
  { icon: 'ShieldCheck', title: 'بدون عمولات', desc: 'طلباتك بتوصلك مباشرة — بدون عمولات تطبيقات التوصيل.' },
];

export default function WhyUs() {
  const { ref: featRef, revealed: featRevealed } = useReveal();
  const { data } = useSiteData();

  const features = data.features.length > 0
    ? data.features.map((f) => ({ icon: f.icon, title: f.title, desc: f.description }))
    : fallbackFeatures;

  return (
    <>
      {/* Why Us */}
      <section id="why-us" className="py-20 lg:py-28 bg-navy-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">ليه Click Zoon</div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
              <span className="text-gradient-gold">ليه تختارنا</span> لتطوير نشاطك؟
            </h2>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto">
              مش بس بنعمل موقع — بنبني لك حضوراً رقمياً يخدم نشاطك.
            </p>
          </div>

          <div ref={featRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => {
              const Icon = getIcon(feat.icon);
              return (
                <div
                  key={feat.title}
                  className={`reveal ${featRevealed ? 'revealed' : ''} flex items-start gap-4 glass-card rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="w-11 h-11 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-navy-50 font-bold mb-1">{feat.title}</h3>
                    <p className="text-navy-300 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {siteConfig.counters.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
              {siteConfig.counters.map((counter) => (
                <div key={counter.label} className="text-center glass-card rounded-xl p-6">
                  <div className="text-4xl font-extrabold text-gradient-gold mb-2">
                    {counter.value}{counter.suffix}
                  </div>
                  <div className="text-navy-300 text-sm">{counter.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {siteConfig.showReviews && siteConfig.reviews.length > 0 && (
        <section className="py-20 lg:py-28 bg-navy-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">آراء عملائنا</div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
                ماذا قال <span className="text-gradient-gold">عملاؤنا</span>؟
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteConfig.reviews.map((review, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={idx < review.rating ? 'text-gold-400' : 'text-navy-600'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-navy-200 leading-relaxed mb-4">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-navy-50 font-bold text-sm">{review.name}</div>
                      <div className="text-navy-400 text-xs">{review.business}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
