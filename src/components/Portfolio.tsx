import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
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

  const projects = data.portfolio;
  const filtered = activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextProject = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? prev : (prev + 1) % filtered.length));
  }, [filtered.length]);
  const prevProject = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? prev : (prev - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') prevProject();
      if (e.key === 'ArrowLeft') nextProject();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxIndex, closeLightbox, nextProject, prevProject]);

  if (projects.length === 0) return null;

  return (
    <section id="portfolio" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">معرض الأعمال</div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
            نماذج من <span className="text-gradient-gold">أعمالنا</span>
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-gold-500 text-navy-900 glow-gold-hover'
                  : 'bg-navy-800/50 text-navy-200 hover:bg-navy-700/50 hover:text-gold-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Projects grid */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <button
              key={`${project.id}-${i}`}
              onClick={() => setLightboxIndex(i)}
              className={`reveal ${revealed ? 'revealed' : ''} group relative overflow-hidden rounded-2xl glass-card text-right transition-all duration-300 hover:-translate-y-2 hover:border-gold-500/40`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/30 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-navy-50 mb-2 group-hover:text-gold-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-navy-300 text-sm leading-relaxed line-clamp-2">{project.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-5 right-5 text-navy-50 hover:text-gold-400 transition-colors p-2"
            onClick={closeLightbox}
            aria-label="إغلاق"
          >
            <X size={28} />
          </button>

          {/* Prev/Next */}
          {filtered.length > 1 && (
            <>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 text-navy-50 hover:text-gold-400 transition-colors p-2 bg-navy-800/50 rounded-full"
                onClick={(e) => { e.stopPropagation(); prevProject(); }}
                aria-label="السابق"
              >
                <ChevronRight size={28} />
              </button>
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-50 hover:text-gold-400 transition-colors p-2 bg-navy-800/50 rounded-full"
                onClick={(e) => { e.stopPropagation(); nextProject(); }}
                aria-label="التالي"
              >
                <ChevronLeft size={28} />
              </button>
            </>
          )}

          {/* Content */}
          <div
            className="max-w-3xl w-full bg-navy-800 rounded-2xl overflow-hidden border border-navy-600/40"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filtered[lightboxIndex].image_url}
              alt={filtered[lightboxIndex].title}
              className="w-full max-h-[60vh] object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-navy-50 mb-2">{filtered[lightboxIndex].title}</h3>
              <p className="text-navy-300 leading-relaxed">{filtered[lightboxIndex].description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
