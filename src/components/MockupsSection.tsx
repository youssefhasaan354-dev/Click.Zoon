import { useState, useEffect, useCallback } from 'react';
import { Smartphone, Monitor, ChevronRight, ChevronLeft } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

// ============================================================
// صور الموك أب — استبدلها بلقطات شاشة حقيقية من مشاريعك
// Mockup images — replace with real project screenshots
// ============================================================

const mockupImages = [
  {
    src: 'https://images.pexels.com/photos/32523798/pexels-photo-32523798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    label: 'موقع مطعم',
  },
  {
    src: 'https://images.pexels.com/photos/2079452/pexels-photo-2079452.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    label: 'موقع كافيه',
  },
  {
    src: 'https://images.pexels.com/photos/7191162/pexels-photo-7191162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    label: 'متجر إلكتروني',
  },
  {
    src: 'https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    label: 'موقع مطعم فاخر',
  },
];

export default function MockupsSection() {
  const { ref, revealed } = useReveal();
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((p) => (p + 1) % mockupImages.length), []);
  const prev = useCallback(() => setIndex((p) => (p - 1 + mockupImages.length) % mockupImages.length), []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="mockups" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm font-bold mb-3">
            <Monitor size={16} />
            <span>شاهد شكل موقعك</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4 leading-[1.35]">
            شوف تصور موقعك على <span className="text-gradient-gold block sm:inline">الموبايل واللابتوب</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto leading-relaxed">
            نماذج بصرية تساعدك تتخيل شكل موقعك قبل التنفيذ.
          </p>
        </div>

        <div ref={ref} className={`reveal ${revealed ? 'revealed' : ''}`}>
          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-navy-800/60 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
              aria-label="السابق"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {mockupImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-8 bg-gold-500' : 'w-2 bg-navy-600 hover:bg-navy-500'
                  }`}
                  aria-label={`الشريحة ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-navy-800/60 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
              aria-label="التالي"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Mockups display */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-8">
            {/* Laptop frame */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                {/* Screen bezel */}
                <div className="bg-navy-950 rounded-t-2xl border-2 border-navy-600/40 border-b-0 p-3 shadow-2xl">
                  <div className="relative rounded-lg overflow-hidden bg-navy-800 aspect-[16/9]">
                    <img
                      src={mockupImages[index].src}
                      alt={mockupImages[index].label}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-opacity duration-500"
                      key={index}
                    />
                    {/* Browser bar */}
                    <div className="absolute top-0 right-0 left-0 h-7 bg-navy-950/80 backdrop-blur-sm flex items-center gap-1.5 px-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                      <span className="text-navy-400 text-xs mr-2 font-mono" dir="ltr">
                        {mockupImages[index].label}.com
                      </span>
                    </div>
                  </div>
                </div>
                {/* Laptop base */}
                <div className="bg-navy-700/60 rounded-b-2xl border-2 border-navy-600/40 border-t-0 h-3 w-full" />
                <div className="bg-navy-600/40 h-1 w-1/3 mx-auto rounded-b-lg" />
              </div>
            </div>

            {/* Phone frame */}
            <div className="shrink-0">
              <div className="relative bg-navy-950 rounded-[2rem] border-4 border-navy-600/40 p-2 shadow-2xl w-52 sm:w-56">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-navy-950 rounded-b-2xl z-10" />
                {/* Screen */}
                <div className="relative rounded-[1.5rem] overflow-hidden bg-navy-800 aspect-[9/18]">
                  <img
                    src={mockupImages[index].src}
                    alt={mockupImages[index].label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-opacity duration-500"
                    key={index}
                  />
                  {/* Status bar */}
                  <div className="absolute top-0 right-0 left-0 h-5 bg-navy-950/60 flex items-center justify-center">
                    <span className="text-navy-300 text-[8px] font-mono">12:00</span>
                  </div>
                </div>
              </div>
              {/* Phone label */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-navy-300 text-sm">
                <Smartphone size={14} className="text-gold-400" />
                {mockupImages[index].label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
