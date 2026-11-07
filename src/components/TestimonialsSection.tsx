import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, ChevronRight, ChevronLeft, ExternalLink, Play, X, Quote } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { useSiteData, useSectionVisibility } from '@/lib/site-data-context';
import { Testimonial } from '@/lib/types';
import { useI18n } from '@/i18n';

interface ExtendedTestimonial extends Testimonial {
  video_url?: string;
  live_url?: string;
  avatar_url?: string;
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
  const { t, dir } = useI18n();
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
          badge={t('testimonials.badge')}
          title={t('testimonials.title')}
          highlight={t('testimonials.highlight')}
          subtitle={t('testimonials.subtitle')}
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
                  <div className="flex gap-1 text-gold-400" aria-label={t('testimonials.rating_aria', { rating: String(review.rating) })}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        size={16}
                        className={idx < review.rating ? 'fill-gold-400 text-gold-400' : 'text-navy-600'}
                      />
                    ))}
                  </div>
                  <Quote size={28} className="text-gold-500/20" />
                </div>
                <p className="text-navy-200 leading-relaxed text-sm mb-6 line-clamp-4">
                  "{review.text}"
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 pt-4 border-t border-navy-800">
                  {review.avatar_url ? (
                    <img
                      src={review.avatar_url}
                      alt={review.name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover border border-gold-500/30"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-navy-50 font-bold text-sm truncate">{review.name}</h4>
                    <p className="text-navy-400 text-xs truncate">{review.business}</p>
                  </div>

                  {review.video_url && (
                    <button
                      type="button"
                      onClick={() => setVideoModalUrl(review.video_url!)}
                      className="p-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 transition-colors"
                      title={t('testimonials.watch_video')}
                      aria-label={t('testimonials.watch_video')}
                    >
                      <Play size={16} className="fill-gold-400" />
                    </button>
                  )}
                </div>

                {review.live_url && (
                  <div className="mt-3 pt-2 text-start">
                    <a
                      href={review.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      <span>{t('testimonials.visit_live')}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile/Tablet Carousel */}
        <div
          className="lg:hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {list[activeIndex] && (
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1 text-gold-400" aria-label={t('testimonials.rating_aria', { rating: String(list[activeIndex].rating) })}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={16}
                      className={idx < list[activeIndex].rating ? 'fill-gold-400 text-gold-400' : 'text-navy-600'}
                    />
                  ))}
                </div>
                <Quote size={28} className="text-gold-500/20" />
              </div>

              <p className="text-navy-200 leading-relaxed text-sm sm:text-base mb-6">
                "{list[activeIndex].text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-navy-800">
                {list[activeIndex].avatar_url ? (
                  <img
                    src={list[activeIndex].avatar_url}
                    alt={list[activeIndex].name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border border-gold-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
                    {list[activeIndex].name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-navy-50 font-bold text-sm sm:text-base truncate">{list[activeIndex].name}</h4>
                  <p className="text-navy-400 text-xs sm:text-sm truncate">{list[activeIndex].business}</p>
                </div>

                {list[activeIndex].video_url && (
                  <button
                    type="button"
                    onClick={() => setVideoModalUrl(list[activeIndex].video_url!)}
                    className="p-2.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 transition-colors"
                    title={t('testimonials.watch_video')}
                    aria-label={t('testimonials.watch_video')}
                  >
                    <Play size={18} className="fill-gold-400" />
                  </button>
                )}
              </div>

              {list[activeIndex].live_url && (
                <div className="mt-4 pt-2 text-start">
                  <a
                    href={list[activeIndex].live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <span>{t('testimonials.visit_live')}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          {list.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={prev}
                className="w-10 h-10 rounded-full bg-navy-800 hover:bg-navy-700 border border-navy-700 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
                aria-label={t('mockups.prev')}
              >
                {dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>

              <div className="flex gap-1.5">
                {list.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex ? 'w-6 bg-gold-500' : 'w-2 bg-navy-700'
                    }`}
                    aria-label={`التقييم ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                className="w-10 h-10 rounded-full bg-navy-800 hover:bg-navy-700 border border-navy-700 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
                aria-label={t('mockups.next')}
              >
                {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {videoModalUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setVideoModalUrl(null)}
        >
          <div
            className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden border border-navy-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalUrl(null)}
              className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-navy-900/80 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-colors"
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>
            <iframe
              src={videoModalUrl}
              title={t('testimonials.watch_video')}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
