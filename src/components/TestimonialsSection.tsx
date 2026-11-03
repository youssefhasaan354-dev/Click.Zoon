import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, ChevronRight, ChevronLeft, ExternalLink, Play, X, Quote } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { useSiteData, useSectionVisibility } from '@/lib/site-data-context';
import { Testimonial } from '@/lib/types';

interface ExtendedTestimonial extends Testimonial {
  video_url?: string;
  live_url?: string;
}

const defaultTestimonials: ExtendedTestimonial[] = [
  {
    id: 't-1',
    name: 'د. أحمد منصور',
    business: 'مدير مجمع عيادات رويال التخصصية',
    text: 'كليك زون نقلوا تواجد عياداتنا لمستوى تاني خالص. نظام حجز المواعيد على واتساب وفر علينا مجهود كبير، ونسبة الحجوزات زادت أكتر من الضعف من أول شهر.',
    rating: 5,
    live_url: 'https://royal-clinics.clickzoon.com',
    visible: true,
    sort_order: 1,
  },
  {
    id: 't-2',
    name: 'م. كريم الديب',
    business: 'مؤسس Delano Café & Bistro',
    text: 'الديمو المجاني اللي استلمته في 48 ساعة كان مبهر ومطابق لهويتنا بالظبط. الموقع سريع والمنيو الإلكتروني سهل الاستخدام لكل زبايننا بدون أي عمولات.',
    rating: 5,
    live_url: 'https://delano-cafe.clickzoon.com',
    visible: true,
    sort_order: 2,
  },
  {
    id: 't-3',
    name: 'أ. سارة فؤاد',
    business: 'مؤسسة متجر Orchid Luxury',
    text: 'أفضل تجربة تعامل مع شركة تصميم مواقع. احترافية عالية، التزام بالمواعيد، ولوحة تحكم المتجر سهلة جداً بدير منها طلباتي بنفسي بدون أي تعقيد.',
    rating: 5,
    live_url: 'https://orchid-boutique.clickzoon.com',
    visible: true,
    sort_order: 3,
  },
];

export default function TestimonialsSection() {
  const isVisible = useSectionVisibility('testimonials');
  const { data } = useSiteData();
  const rawList = data.testimonials && data.testimonials.length > 0 ? data.testimonials : defaultTestimonials;
  const list = rawList as ExtendedTestimonial[];

  const [activeIndex, setActiveIndex] = useState(0);
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % list.length);
  }, [list.length]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  }, [list.length]);

  useEffect(() => {
    if (isPaused || list.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next, list.length]);

  if (!isVisible) return null;

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-navy-950/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="آراء وقصص نجاح"
          title="ماذا يقول أصحاب الأنشطة"
          highlight="عن تجربتهم مع كليك زون؟"
          subtitle="شركاؤنا هم سر نجاحنا. نفخر بمشاركتهم رحلة التحول الرقمي وزيادة مبيعاتهم."
        />

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {list.map((review) => (
            <div
              key={review.id}
              className="group relative glass-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-gold-500/40 glow-gold-hover h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-gold-400" aria-label={`تقييم ${review.rating} من 5`}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={16}
                        className={idx < review.rating ? 'fill-gold-400 text-gold-400' : 'text-navy-600'}
                      />
                    ))}
                  </div>
                  <Quote size={28} className="text-gold-500/20 group-hover:text-gold-500/40 transition-colors" />
                </div>

                <p className="text-navy-200 text-base leading-relaxed mb-6">
                  "{review.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-navy-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-300 font-bold text-base shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-navy-50 font-bold text-sm sm:text-base">{review.name}</div>
                    {review.business && <div className="text-navy-400 text-xs">{review.business}</div>}
                  </div>
                </div>

                {review.live_url && (
                  <a
                    href={review.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold transition-colors"
                    title="زيارة موقع العميل"
                  >
                    <span>الموقع</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                {review.video_url && (
                  <button
                    onClick={() => setVideoModalUrl(review.video_url || null)}
                    className="p-2 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-all flex items-center gap-1 text-xs"
                    title="مشاهدة فيديو التجربة"
                  >
                    <Play size={12} className="fill-gold-400" />
                    <span>فيديو</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile / Tablet Carousel */}
        <div
          className="lg:hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="glass-card rounded-2xl p-6 sm:p-8 min-h-[260px] flex flex-col justify-between">
            {list[activeIndex] && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1 text-gold-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={16}
                          className={idx < list[activeIndex].rating ? 'fill-gold-400 text-gold-400' : 'text-navy-600'}
                        />
                      ))}
                    </div>
                    <Quote size={24} className="text-gold-500/25" />
                  </div>

                  <p className="text-navy-200 text-base leading-relaxed mb-6">
                    "{list[activeIndex].text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-navy-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-300 font-bold">
                      {list[activeIndex].name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-navy-50 font-bold text-sm">{list[activeIndex].name}</div>
                      {list[activeIndex].business && (
                        <div className="text-navy-400 text-xs">{list[activeIndex].business}</div>
                      )}
                    </div>
                  </div>

                  {list[activeIndex].live_url && (
                    <a
                      href={list[activeIndex].live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-semibold"
                    >
                      <span>الموقع</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              aria-label="الرأي السابق"
              className="w-11 h-11 rounded-full bg-navy-800/80 border border-navy-700 flex items-center justify-center text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div className="flex gap-2">
              {list.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`الذهاب إلى الرأي رقم ${idx + 1}`}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === activeIndex ? 'bg-gold-500 w-6' : 'bg-navy-700 hover:bg-navy-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="الرأي التالي"
              className="w-11 h-11 rounded-full bg-navy-800/80 border border-navy-700 flex items-center justify-center text-navy-300 hover:text-gold-400 hover:border-gold-500/40 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal if active */}
      {videoModalUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setVideoModalUrl(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-navy-900 border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalUrl(null)}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-navy-800 text-navy-300 hover:text-white flex items-center justify-center"
              aria-label="إغلاق الفيديو"
            >
              <X size={20} />
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={videoModalUrl}
                title="فيديو رأي العميل"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
