import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';

const filters = [
  { key: 'all', label: 'الكل' },
  { key: 'restaurants', label: 'مطاعم' },
  { key: 'stores', label: 'متاجر' },
  { key: 'cafes', label: 'كافيهات' },
];

export default function Portfolio() {
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const projects = data.portfolio;
  const filtered = activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  const nextProject = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? prev : (prev + 1) % filtered.length));
  }, [filtered.length]);

  const prevProject = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? prev : (prev - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  const openLightbox = (idx: number, e: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setLightboxIndex(idx);
  };

  // Keyboard navigation & accessibility focus management
  useEffect(() => {
    if (lightboxIndex === null) return;

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        // In RTL, right arrow navigates to the previous card on the right
        e.preventDefault();
        prevProject();
      } else if (e.key === 'ArrowLeft') {
        // In RTL, left arrow navigates to the next card on the left
        e.preventDefault();
        nextProject();
      } else if (e.key === 'Tab') {
        // Simple focus trap within lightbox dialog
        const dialog = document.getElementById('portfolio-lightbox-dialog');
        if (!dialog) return;
        const focusables = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxIndex, closeLightbox, nextProject, prevProject]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    // In RTL, swipe left (diff > 50) means advancing to the next item
    if (diff > 50) {
      nextProject();
    } else if (diff < -50) {
      prevProject();
    }
    touchStartXRef.current = null;
  };

  if (projects.length === 0) return null;

  return (
    <section id="portfolio" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">أعمالنا السابقة</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            نماذج من <span className="text-gradient-gold">أعمالنا ومشاريعنا</span>
          </h2>
          <p className="text-navy-300 text-lg max-w-2xl mx-auto">
            مواقع ومتاجر إلكترونية حقيقية صمّمناها ونفّذناها لعملائنا في المنصورة ومصر.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              aria-pressed={activeFilter === f.key}
              className={`min-h-[44px] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeFilter === f.key
                  ? 'bg-gold-500 text-navy-900 shadow-md shadow-gold-500/20 font-bold'
                  : 'bg-navy-800/60 text-navy-200 hover:bg-navy-700/60 hover:text-navy-50 border border-navy-700/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <div
              key={`${project.id}-${i}`}
              className={`reveal ${revealed ? 'revealed' : ''}`}
              style={revealed ? undefined : { transitionDelay: `${i * 80}ms` }}
            >
              <button
                type="button"
                onClick={(e) => openLightbox(i, e)}
                className="w-full group relative overflow-hidden rounded-2xl glass-card text-right transition-transform duration-300 hover:-translate-y-2 hover:border-gold-500/40 h-full flex flex-col justify-between"
                aria-label={`عرض تفاصيل مشروع ${project.title}`}
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-navy-950">
                  <img
                    src={project.image_url}
                    alt={project.title ? `معاينة مشروع ${project.title}` : 'معاينة مشروع من أعمال Click Zoon'}
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={338}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/30 to-transparent pointer-events-none" />
                </div>

                {/* Info */}
                <div className="p-5 w-full">
                  <h3 className="text-lg font-bold text-navy-50 mb-2 group-hover:text-gold-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-navy-300 text-sm leading-relaxed line-clamp-2">{project.description}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          id="portfolio-lightbox-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={filtered[lightboxIndex].title || 'معاينة المشروع'}
          className="fixed inset-0 z-[100] bg-navy-950/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button with min 44x44px tap target */}
          <button
            ref={closeButtonRef}
            className="absolute top-5 right-5 text-navy-100 hover:text-gold-400 transition-colors w-11 h-11 rounded-full bg-navy-900/80 border border-navy-700/60 flex items-center justify-center z-10"
            onClick={closeLightbox}
            aria-label="إغلاق المعاينة"
          >
            <X size={24} />
          </button>

          {/* Prev/Next buttons (RTL aware) */}
          {filtered.length > 1 && (
            <>
              <button
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-navy-100 hover:text-gold-400 transition-colors w-12 h-12 bg-navy-900/90 border border-navy-700/60 rounded-full flex items-center justify-center z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prevProject();
                }}
                aria-label="المشروع السابق"
                title="السابق"
              >
                <ChevronRight size={28} />
              </button>
              <button
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-navy-100 hover:text-gold-400 transition-colors w-12 h-12 bg-navy-900/90 border border-navy-700/60 rounded-full flex items-center justify-center z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  nextProject();
                }}
                aria-label="المشروع التالي"
                title="التالي"
              >
                <ChevronLeft size={28} />
              </button>
            </>
          )}

          {/* Dialog Content */}
          <div
            className="max-w-3xl w-full bg-navy-900 rounded-2xl overflow-hidden border border-navy-700/60 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-navy-950 max-h-[60vh] flex items-center justify-center overflow-hidden">
              <img
                src={filtered[lightboxIndex].image_url}
                alt={filtered[lightboxIndex].title ? `صورة مشروع ${filtered[lightboxIndex].title}` : 'تفاصيل مشروع Click Zoon'}
                width={1200}
                height={675}
                className="w-full max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-xl font-bold text-navy-50">{filtered[lightboxIndex].title}</h3>
                {(filtered[lightboxIndex].live_url || filtered[lightboxIndex].link) && (
                  <a
                    href={filtered[lightboxIndex].live_url || filtered[lightboxIndex].link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 bg-gold-500/10 border border-gold-500/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>زيارة الموقع</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <p className="text-navy-300 leading-relaxed">{filtered[lightboxIndex].description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
