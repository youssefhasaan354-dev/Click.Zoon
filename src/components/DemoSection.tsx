import { Clock, CheckCircle2, Gift, ArrowLeft } from 'lucide-react';
import { waLinkIntl, useSiteConfig } from '@/siteConfig';
import { useReveal } from '@/hooks/useReveal';
import { trackEvent } from '@/lib/analytics';

export default function DemoSection() {
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();

  return (
    <section id="demo" className="py-20 lg:py-28 bg-navy-950/50 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl" />

      <div ref={ref} className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 reveal ${revealed ? 'revealed' : ''}`}>
        <div className="glass-card rounded-3xl p-8 lg:p-12 border-2 border-gold-500/20 glow-gold">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-500/15 rounded-full px-4 py-1.5 mb-6">
            <Gift size={16} className="text-gold-400" />
            <span className="text-gold-300 text-sm font-bold">عرض حصري</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            نبني لك <span className="text-gradient-gold">ديمو لموقع نشاطك مجاناً</span>
          </h2>

          <p className="text-navy-200 text-lg mb-8 leading-relaxed max-w-3xl">
            شوف موقع نشاطك قبل ما تدفع أي حاجة. نجهّز لك تصميم كامل على أساس نشاطك — تطمن عليه،
            عدّل معانا، وادفع فقط لو عجبك وقررت تكمل.
          </p>

          {/* Key points */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 bg-navy-800/40 rounded-xl p-4">
              <Clock size={22} className="text-gold-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-navy-50 font-bold mb-1">مدة التجهيز</div>
                <div className="text-navy-300 text-sm">
                  من {cfg.demoMinHours} إلى {cfg.demoMaxHours} ساعة
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-navy-800/40 rounded-xl p-4">
              <CheckCircle2 size={22} className="text-gold-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-navy-50 font-bold mb-1">بدون التزام</div>
                <div className="text-navy-300 text-sm">
                  تدفع فقط لو أعجبك وقررت تكمل
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a
            href={waLinkIntl(cfg.phoneIntl, cfg.whatsappMessages.demo)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ category: 'whatsapp', action: 'click', label: 'demo_section_cta' })}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 glow-gold-hover text-lg"
          >
            اطلب الديمو المجاني
            <ArrowLeft size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
