import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import SectionHeader from '@/components/SectionHeader';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';

export default function FAQ() {
  const { t } = useI18n();
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const fallbackFaqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
  ];

  const faqs = data.faqs.length > 0
    ? data.faqs.map((f) => ({ q: f.question, a: f.answer }))
    : fallbackFaqs;

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={HelpCircle}
          badge={t('faq.badge')}
          title={t('faq.title')}
          highlight={t('faq.highlight')}
          subtitle={t('faq.subtitle')}
        />

        {/* Accordion */}
        <div ref={ref} className={`space-y-3.5 reveal ${revealed ? 'revealed' : ''}`}>
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`relative glass-card rounded-xl overflow-hidden transition-all duration-300 border ${
                  isOpen ? 'border-gold-500/40 bg-navy-800/80 shadow-lg shadow-gold-500/5' : 'border-navy-700/40'
                }`}
              >
                {/* Gold animated accent bar on the active FAQ */}
                {isOpen && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.25 }}
                    className="absolute top-0 start-0 bottom-0 w-1.5 bg-gradient-to-b from-gold-400 to-gold-600 rtl:rounded-r-xl ltr:rounded-l-xl"
                  />
                )}

                <button
                  id={`faq-btn-${i}`}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-start transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="text-navy-50 font-bold flex-1 text-base sm:text-lg ps-2">{faq.q}</span>
                  <ChevronDown
                    size={22}
                    className={`text-gold-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* CSS Grid-template-rows height animation */}
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 ps-7 text-navy-300 leading-relaxed text-sm sm:text-base border-t border-navy-700/30 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
