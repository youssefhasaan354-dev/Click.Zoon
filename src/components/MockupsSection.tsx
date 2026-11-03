import { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, Monitor, ChevronRight, ChevronLeft, Pause, Play, Lock } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

// ==============================================================================
// لقطات شاشة المشاريع المُنفذة — يمكنك استبدال هذه الملفات بلقطات شاشة مشاريعك الحقيقية
// Delivered project screenshots — you can replace these files in public/mockups/
// ==============================================================================
const deliveredProjects = [
  {
    src: '/mockups/mockup-1-restaurant.webp',
    title: 'قصر الريم للمشويات',
    category: 'موقع وتطبيق مطعم ومشويات',
    domain: 'qasrelreem.clickzoon.com',
  },
  {
    src: '/mockups/mockup-2-cafe.webp',
    title: 'روست كافيه & كوفي بار',
    category: 'كافيه وسبيشالتي كوفي',
    domain: 'roastcafe.clickzoon.com',
  },
  {
    src: '/mockups/mockup-3-store.webp',
    title: 'متجر مودانيستا فاشون',
    category: 'متجر إلكتروني متكامل للأزياء',
    domain: 'modanista.clickzoon.com',
  },
  {
    src: '/mockups/mockup-4-medical.webp',
    title: 'مركز النور الطبي التخصصي',
    category: 'منصة حجز عيادات وخدمات طبية',
    domain: 'alnoormedical.clickzoon.com',
  },
];

export default function MockupsSection() {
  const { ref, revealed } = useReveal();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % deliveredProjects.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + deliveredProjects.length) % deliveredProjects.length);
  }, []);

  // Autoplay with pause on hover/focus/touch and reduced motion respect
  useEffect(() => {
    if (!isPlaying || isHovered) return;
    if (typeof window === 'undefined') return;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    } catch {
      // ignore
    }

    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, next]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsHovered(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    // In RTL layout, swipe left (diff > 40) moves to next, swipe right moves to prev
    if (diff > 40) {
      next();
    } else if (diff < -40) {
      prev();
    }
    touchStartXRef.current = null;
  };

  return (
    <section id="mockups" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-bold mb-3">
            <Monitor size={16} />
            <span>معاينة حقيقية للمشاريع</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4 leading-[1.35]">
            شوف تصور موقعك على <span className="text-gradient-gold block sm:inline">الموبايل واللابتوب</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto leading-relaxed">
            نماذج بصرية حقيقية من مشاريع نفّذناها لعملائنا تساعدك تتخيل شكل موقعك وسرعته قبل البدء.
          </p>
        </div>

        <div
          ref={ref}
          className={`reveal ${revealed ? 'revealed' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            {/* Prev Button (RTL aware) */}
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
              aria-label="المشروع السابق"
              title="السابق"
            >
              <ChevronRight size={20} />
            </button>

            {/* Pagination Dots with ≥ 44x44px clickable target wrapper */}
            <div className="flex items-center gap-1.5 px-2" role="tablist" aria-label="شرائح المشاريع">
              {deliveredProjects.map((proj, i) => (
                <button
                  key={proj.domain}
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                  className="p-3 focus:outline-none"
                  aria-label={`عرض مشروع ${proj.title}`}
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === index ? 'w-8 bg-gold-500' : 'w-2.5 bg-navy-600 hover:bg-navy-500'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
              aria-label="المشروع التالي"
              title="التالي"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Play/Pause Button for WCAG 2.2.2 */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-11 h-11 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all mr-2"
              aria-label={isPlaying ? 'إيقاف التمرير التلقائي مؤقتاً' : 'تشغيل التمرير التلقائي'}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          {/* Current project info pill */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-navy-800/70 border border-gold-500/30 text-gold-300 text-sm font-bold shadow-sm">
              {deliveredProjects[index].title} — <span className="text-navy-300 font-normal">{deliveredProjects[index].category}</span>
            </span>
          </div>

          {/* Mockups display */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-8">
            {/* Laptop frame */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                {/* Screen bezel */}
                <div className="bg-navy-950 rounded-t-2xl border-2 border-navy-600/50 border-b-0 p-3 shadow-2xl">
                  <div className="relative rounded-lg overflow-hidden bg-navy-900 aspect-[16/9]">
                    {/* Browser address bar */}
                    <div className="absolute top-0 right-0 left-0 h-8 bg-navy-950/90 backdrop-blur-sm flex items-center gap-2 px-3 z-20 border-b border-navy-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex items-center gap-1.5 bg-navy-900/80 border border-navy-700/50 rounded-md px-2.5 py-0.5 text-xs text-navy-300 font-mono flex-1 max-w-xs" dir="ltr">
                        <Lock size={10} className="text-green-400 shrink-0" />
                        <span className="truncate">https://{deliveredProjects[index].domain}</span>
                      </div>
                    </div>

                    {/* True cross-fade images without remounting flash */}
                    <div className="absolute inset-0 pt-8">
                      {deliveredProjects.map((proj, i) => (
                        <img
                          key={proj.src}
                          src={proj.src}
                          alt={`تصميم ${proj.title} على شاشة كمبيوتر`}
                          width={800}
                          height={450}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                          decoding="async"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Laptop base */}
                <div className="bg-navy-700/70 rounded-b-2xl border-2 border-navy-600/50 border-t-0 h-3.5 w-full shadow-lg" />
                <div className="bg-navy-600/50 h-1.5 w-1/3 mx-auto rounded-b-lg" />
              </div>
            </div>

            {/* Phone frame */}
            <div className="shrink-0">
              <div className="relative bg-navy-950 rounded-[2.2rem] border-4 border-navy-600/50 p-2 shadow-2xl w-52 sm:w-56">
                {/* Notch / Speaker */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-18 h-4 bg-navy-950 rounded-b-xl z-30 flex items-center justify-center">
                  <span className="w-8 h-1 rounded-full bg-navy-700" />
                </div>

                {/* Screen */}
                <div className="relative rounded-[1.7rem] overflow-hidden bg-navy-900 aspect-[9/18]">
                  {/* Phone status bar */}
                  <div className="absolute top-0 right-0 left-0 h-6 bg-navy-950/70 backdrop-blur-xs flex items-center justify-between px-3 text-[10px] text-navy-300 font-mono z-20" dir="ltr">
                    <span>10:30</span>
                    <span className="text-[9px]">5G 85%</span>
                  </div>

                  {/* True cross-fade phone images */}
                  <div className="absolute inset-0">
                    {deliveredProjects.map((proj, i) => (
                      <img
                        key={proj.src}
                        src={proj.src}
                        alt={`تصميم ${proj.title} على شاشة موبايل`}
                        width={320}
                        height={640}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-in-out ${
                          i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone label */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-navy-300 text-sm">
                <Smartphone size={14} className="text-gold-400" />
                <span>عرض الموبايل المتجاوب</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
