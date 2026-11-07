import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import { getIcon } from '@/lib/icons';
import SectionHeader from '@/components/SectionHeader';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export default function Process() {
  const { t, dir } = useI18n();
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();

  const fallbackSteps = [
    { icon: 'MessageSquare', title: t('process.step_1_title'), desc: t('process.step_1_desc') },
    { icon: 'PenTool', title: t('process.step_2_title'), desc: t('process.step_2_desc') },
    { icon: 'Rocket', title: t('process.step_3_title'), desc: t('process.step_3_desc') },
    { icon: 'Award', title: t('process.step_4_title'), desc: t('process.step_4_desc') },
  ];

  const steps = data.processSteps.length > 0
    ? data.processSteps.map((s) => ({ icon: s.icon, title: s.title, desc: s.description }))
    : fallbackSteps;

  return (
    <section id="process" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('process.badge')}
          title={t('process.title')}
          highlight={t('process.highlight')}
          subtitle={t('process.subtitle')}
        />

        <div ref={ref} className="relative">
          {/* Animated Connecting SVG Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 inset-x-12 h-1 pointer-events-none z-0" aria-hidden="true">
            <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none">
              <motion.line
                x1={dir === 'rtl' ? '100%' : '0%'}
                y1="4"
                x2={dir === 'rtl' ? '0%' : '100%'}
                y2="4"
                stroke="url(#processLineGradient)"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="processLineGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#efc95e" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, i) => {
              const Icon = getIcon(step.icon);
              return (
                <div
                  key={step.title}
                  className={`reveal ${revealed ? 'revealed' : ''} relative text-center`}
                  style={revealed ? undefined : { transitionDelay: `${i * 100}ms` }}
                >
                  <div className="relative inline-flex w-24 h-24 rounded-full bg-navy-850 bg-navy-900 border-2 border-gold-500/30 items-center justify-center mb-4 transition-transform duration-300 hover:border-gold-500/60 hover:scale-105 shadow-xl">
                    <Icon size={28} className="text-gold-400" />

                    {/* Step number that pops in with spring */}
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 350, damping: 15, delay: 0.15 * i + 0.2 }}
                      className="absolute -top-1 rtl:-right-1 ltr:-left-1 w-8 h-8 rounded-full bg-gold-500 text-navy-900 text-sm font-extrabold flex items-center justify-center shadow-md shadow-gold-500/40"
                    >
                      {i + 1}
                    </motion.span>
                  </div>
                  <h3 className="text-navy-50 font-bold mb-2 text-lg">{step.title}</h3>
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
