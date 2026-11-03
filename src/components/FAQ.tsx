import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import SectionHeader from '@/components/SectionHeader';
import { motion } from 'framer-motion';

const fallbackFaqs = [
  { q: 'كم مدة تجهيز الديمو المجاني؟', a: 'الديمو بيتجهز خلال 24 إلى 72 ساعة من وقت طلبك. بنبني لك تصميم كامل على أساس نشاطك عشان تشوف موقعك قبل ما تدفع أي حاجة.' },
  { q: 'كم مدة التسليم النهائي للموقع؟', a: 'التسليم النهائي من 3 أيام إلى أسبوع حسب متطلبات المشروع. المتاجر الإلكترونية المعقدة ممكن تأخذ وقت أطول قليلاً بسبب ربط الدفع والتوصيل.' },
  { q: 'هل في أي التزام قبل ما أشوف الديمو؟', a: 'لا، بدون أي التزام. الديمو مجاني بالكامل — تتطمن عليه، ولو عجبك نكمّل، ولو لأ، مفيش أي التزام عليك.' },
  { q: 'من يملك الدومين والاستضافة؟', a: 'أنت بتملك الدومين والاستضافة باسمك بالكامل. إحنا بنحجزهم ليك ونربطهم بالموقع، وكل بيانات الدخول بتتسلم لك بالكامل.' },
  { q: 'ماذا يحدث بعد تسليم الموقع؟', a: 'بعد التسليم، بنوفّر دعم فني مستمر حسب الباقة. أي تحديث أو تعديل أو استفسار — إحنا معاك ومش بنسيبك لوحدك.' },
  { q: 'هل أقدر أعدّل الموقع بنفسي؟', a: 'أيوة. بنسلّمك لوحة تحكم سهلة تقدر منها تعدّل المحتوى، تضيف منتجات، أو تغيّر الصور بدون الحاجة لخبرة تقنية. ولو حابب إحنا نتكفّل بالتعديلات، ده متاح برضه.' },
];

export default function FAQ() {
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = data.faqs.length > 0
    ? data.faqs.map((f) => ({ q: f.question, a: f.answer }))
    : fallbackFaqs;

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={HelpCircle}
          badge="إجابات واضحة"
          title="أسئلة شائعة"
          highlight="وكل ما يهمك معرفته"
          subtitle="كل اللي محتاج تعرفه عن خطوات العمل، الأسعار، والدعم الفني قبل ما تبدأ معانا."
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
                    className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-gold-400 to-gold-600 rounded-r-xl"
                  />
                )}

                <button
                  id={`faq-btn-${i}`}
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="text-navy-50 font-bold flex-1 text-base sm:text-lg pr-2">{faq.q}</span>
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
                    <p className="px-5 pb-5 pr-7 text-navy-300 leading-relaxed text-sm sm:text-base border-t border-navy-700/30 pt-3">
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
