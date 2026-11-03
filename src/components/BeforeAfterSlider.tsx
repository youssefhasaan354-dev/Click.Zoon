import { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 5) percentage = 5;
    if (percentage > 95) percentage = 95;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(5, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(95, prev + 5));
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-navy-900/60 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="التحول والتطوير"
          title="شاهد الفرق الحقيقي"
          highlight="قبل وبعد تطوير كليك زون"
          subtitle="قارن بنفسك بين المواقع التقليدية البطيئة غير المتجاوبة، وبين مواقع كليك زون المصممة لزيادة المبيعات والسرعة الفائقة."
        />

        {/* Feature badges above */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8 text-center text-xs sm:text-sm">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-semibold">
            <XCircle size={16} />
            <span>قبل: بطيء، غير متجاوب، معدل ارتداد 65%</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 font-semibold">
            <CheckCircle2 size={16} />
            <span>بعد: سرعة 0.8s، متجاوب 100%، زيادة حجز 180%</span>
          </div>
        </div>

        {/* Comparison slider container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-navy-700/80 cursor-ew-resize select-none glass-card"
        >
          {/* AFTER Image (Full container background) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/mockups/mockup-2-cafe-desktop.webp"
              alt="بعد تطوير كليك زون - تصميم عصري فائق السرعة"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              width={1280}
              height={720}
            />
            {/* After tag */}
            <div className="absolute top-4 left-4 z-10 bg-navy-950/85 backdrop-blur-md border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✨ بعد كليك زون (حديث وسريع)
            </div>
          </div>

          {/* BEFORE Image (Clipped overlay) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}>
              <img
                src="/mockups/mockup-1-corporate-desktop.webp"
                alt="قبل التطوير - موقع قديم"
                className="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                loading="lazy"
                decoding="async"
                width={1280}
                height={720}
              />
              {/* Before tag */}
              <div className="absolute top-4 right-4 z-10 bg-red-950/85 backdrop-blur-md border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                ⚠️ قبل التطوير (تقليدي قديم)
              </div>
            </div>
          </div>

          {/* Divider line & handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-gold-300 via-gold-500 to-gold-400 cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
            style={{ left: `${sliderPosition}%` }}
          >
            <div
              role="slider"
              tabIndex={0}
              aria-label="مؤشر المقارنة بين الموقع قبل وبعد التطوير"
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuemin={0}
              aria-valuemax={100}
              onKeyDown={handleKeyDown}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-950 border-2 border-gold-400 text-gold-300 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <ArrowLeftRight size={18} className="text-gold-400" />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          اسحب المؤشر لليمين واليسار لرؤية الفرق، أو استخدم أزرار الأسهم في لوحة المفاتيح.
        </p>
      </div>
    </section>
  );
}
