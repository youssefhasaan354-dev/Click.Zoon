import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { useSiteData, useSectionVisibility } from '@/lib/site-data-context';
import { Testimonial } from '@/lib/types';

interface ExtendedTestimonial extends Testimonial {
  video_url?: string;
  live_url?: string;
}

export default function TestimonialsSection() {
  const isVisible = useSectionVisibility('testimonials');
  const { data } = useSiteData();

  // Only render verified testimonials from database; hide completely if empty
  const list = ((data.testimonials ?? []) as ExtendedTestimonial[]).filter(
    (t) => t.visible !== false
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    if (list.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % list.length);
  }, [list.length]);

  const prev = useCallback(() => {
    if (list.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  }, [list.length]);

  useEffect(() => {
    if (isPaused || list.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next, list.length]);

  if (!isVisible || list.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-navy-950/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="آراء وقصص نجاح"
          title="ماذا يقول عملاؤنا"
          highlight="عن تجربتهم مع كليك زون؟"
          subtitle="نفخر بمشاركة شركائنا رحلة التحول الرقمي وتطوير أعمالهم."
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
                  <Quote size={24} className="text-navy-600 group-hover:text-gold-500/40 transition-colors" />
                </div>
                <p className="text-navy-200 text-base leading-relaxed mb-6">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-navy-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-navy-50 font-bold text-base group-hover:text-gold-300 transition-colors">
                    {review.name}
                  </h4>
                  <p className="text-navy-400 text-xs mt-0.5">{review.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile / Tablet Carousel */}
        <div
          className="lg:hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden py-4">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            >
              {list.map((review) => (
                <div key={review.id} className="w-full shrink-0 px-2">
                  <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[260px] border border-navy-700/60">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1 text-gold-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={16}
                              className={idx < review.rating ? 'fill-gold-400 text-gold-400' : 'text-navy-600'}
                            />
                          ))}
                        </div>
                        <Quote size={20} className="text-navy-600" />
                      </div>
                      <p className="text-navy-200 text-sm sm:text-base leading-relaxed mb-6">
                        &ldquo;{review.text}&rdquo;
                      </p>
                    </div>

                    <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
                      <div>
                        <h4 className="text-navy-50 font-bold text-sm sm:text-base">{review.name}</h4>
                        <p className="text-navy-400 text-xs">{review.business}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          {list.length > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="الرأي السابق"
                  className="w-10 h-10 rounded-full bg-navy-800/80 hover:bg-gold-500/20 border border-navy-700/60 flex items-center justify-center text-navy-200 hover:text-gold-400 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="الرأي التالي"
                  className="w-10 h-10 rounded-full bg-navy-800/80 hover:bg-gold-500/20 border border-navy-700/60 flex items-center justify-center text-navy-200 hover:text-gold-400 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <div className="flex gap-1.5">
                {list.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`الانتقال إلى الرأي رقم ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === idx ? 'w-6 bg-gold-400' : 'w-2 bg-navy-700 hover:bg-navy-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
