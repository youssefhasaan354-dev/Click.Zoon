import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import { getIcon } from '@/lib/icons';

const fallbackServices = [
  { icon: 'Globe', title: 'تصميم وتطوير المواقع', desc: 'موقع احترافي يعكس هوية نشاطك ويسهّل على عملائك الوصول لمعلوماتك في أي وقت.' },
  { icon: 'ShoppingCart', title: 'متاجر إلكترونية', desc: 'متجر متكامل مع ربط الدفع والتوصيل، يدير طلباتك بدون عمولات تطبيقات الطرف الثالث.' },
  { icon: 'Rocket', title: 'صفحات هبوط للحملات', desc: 'صفحات تسويقية مُحسّنة للتحويل، مصممة لزيادة مبيعاتك وحجوزاتك من الإعلانات.' },
  { icon: 'RefreshCw', title: 'إعادة تصميم وصيانة', desc: 'حدّث موقعك القديم بتصميم عصري، أو خلّينا نتكفّل بصيانته وتحديثه باستمرار.' },
  { icon: 'Search', title: 'تحسين SEO', desc: 'خلي نشاطك يظهر في نتائج جوجل وقت ما عميلك يبحث عنك، بدل ما يروح للمنافس.' },
  { icon: 'Server', title: 'حجز الدومين والاستضافة', desc: 'نتكفّل بحجز اسم موقعك وإعداده على استضافة سريعة وآمنة — من البداية للنهاية.' },
];

export default function Services() {
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();

  const services = data.services.length > 0
    ? data.services.map((s) => ({ icon: s.icon, title: s.title, desc: s.description }))
    : fallbackServices;

  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">خدماتنا</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            كل ما يحتاجه نشاطك <span className="text-gradient-gold">على الإنترنت</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            من أول تصميم الموقع لآخر تفصيلة في المتجر الإلكتروني — نوفّر لك حلول متكاملة في المنصورة والدقهلية.
          </p>
        </div>

        {/* Services grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = getIcon(service.icon);
            return (
              <div
                key={service.title}
                className={`reveal ${revealed ? 'revealed' : ''} group relative glass-card rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2 hover:border-gold-500/40 glow-gold-hover`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Gold glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-500/0 to-gold-500/0 group-hover:from-gold-500/5 group-hover:to-transparent transition-all duration-500" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-navy-700/50 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-gold-500/15 group-hover:scale-110">
                    <Icon size={28} className="text-gold-400" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-50 mb-3 group-hover:text-gold-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-navy-300 leading-relaxed">{service.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
