import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';

const fallbackFaqs = [
  { q: 'كم مدة تجهيز الديمو المجاني؟', a: 'الديمو بيتجهز خلال 24 إلى 72 ساعة من وقت طلبك. بنبني لك تصميم كامل على أساس نشاطك عشان تشوف موقعك قبل ما تدفع أي حاجة.' },
  { q: 'كم مدة التسليم النهائي للموقع؟', a: 'التسليم النهائي من 3 أيام إلى أسبوع حسب متطلبات المشروع. المتاجر الإلكترونية المعقدة ممكن تأخذ وقت أطول قليلاً بسبب ربط الدفع والتوصيل.' },
  { q: 'هل في أي التزام قبل ما أشوف الديمو؟', a: 'لا، بدون أي التزام. الديمو مجاني بالكامل — تتطمن عليه، ولو عجبك نكمّل، ولو لأ، مفيش أي التزام عليك.' },
  { q: 'من يملك الدومين والاستضافة؟', a: 'أنت بتملك الدومين والاستضافة باسمك بالكامل. إحنا بنحجزهم ليك ونربطهم بالموقع، وكل بيانات الدخول بتسليمها لك.' },
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-bold mb-3">
            <HelpCircle size={16} />
            <span>أسئلة شائعة</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            أسئلة <span className="text-gradient-gold">شائعة</span>
          </h2>
          <p className="text-navy-300 text-lg">
            كل اللي محتاج تعرفه قبل ما تبدأ معانا.
          </p>
        </div>

        {/* Accordion */}
        <div ref={ref} className={`space-y-3 reveal ${revealed ? 'revealed' : ''}`}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'border-gold-500/30' : ''
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-right"
                aria-expanded={openIndex === i}
              >
                <span className="text-navy-50 font-bold flex-1">{faq.q}</span>
                <ChevronDown
                  size={22}
                  className={`text-gold-400 shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: openIndex === i ? '500px' : '0px',
                  opacity: openIndex === i ? '1' : '0',
                }}
              >
                <p className="px-5 pb-5 text-navy-300 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
