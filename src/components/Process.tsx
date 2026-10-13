import * as LucideIcons from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';

type IconType = LucideIcons.LucideIcon;

const fallbackSteps = [
  { icon: 'MessageSquare', title: 'اطلب الديمو', desc: 'ابعت لنا بيانات نشاطك من النموذج أو عبر واتساب.' },
  { icon: 'PenTool', title: 'نصمم لك نموذج', desc: 'نجهّز لك تصوراً مناسباً لنشاطك خلال 24-72 ساعة.' },
  { icon: 'Rocket', title: 'اعتمد وعدّل', desc: 'راجع النموذج واطلب التعديلات التي تحتاجها قبل التنفيذ.' },
  { icon: 'Award', title: 'نطلق الموقع', desc: 'نجهّز الموقع للنشر ونسلّمه لك حسب متطلبات مشروعك.' },
];

function getIcon(name: string): IconType {
  return (LucideIcons as unknown as Record<string, IconType>)[name] ?? LucideIcons.Award;
}

export default function Process() {
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();

  const steps = data.processSteps.length > 0
    ? data.processSteps.map((s) => ({ icon: s.icon, title: s.title, desc: s.description }))
    : fallbackSteps;

  return (
    <section id="process" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">إزاي بنشتغل</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            من الفكرة <span className="text-gradient-gold">للإطلاق</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            أربع خطوات بسيطة — وأنت جاهز تنطلق بشكل رقمي.
          </p>
        </div>

        <div ref={ref} className="relative">
          <div className="hidden lg:block absolute top-12 right-0 left-0 h-0.5 bg-gradient-to-l from-gold-500/0 via-gold-500/30 to-gold-500/0" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = getIcon(step.icon);
              return (
                <div
                  key={step.title}
                  className={`reveal ${revealed ? 'revealed' : ''} relative text-center`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="relative inline-flex w-24 h-24 rounded-full bg-navy-800 border-2 border-gold-500/30 items-center justify-center mb-4 transition-all duration-300 hover:border-gold-500/60 hover:scale-105">
                    <Icon size={28} className="text-gold-400" />
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gold-500 text-navy-900 text-sm font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-navy-50 font-bold mb-2">{step.title}</h3>
                  <p className="text-navy-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
