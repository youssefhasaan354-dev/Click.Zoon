import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, ExternalLink, Sparkles, Monitor, Smartphone, BookOpen } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { useSiteData } from '@/lib/site-data-context';
import SectionHeader from '@/components/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PortfolioItem } from '@/lib/types';
import { useI18n } from '@/i18n';

interface ExtendedPortfolioItem extends PortfolioItem {
  slug?: string;
}

const getSafeImageUrl = (url?: string, idx: number = 0) => {
  if (!url || url.includes('pexels.com')) {
    const fallbacks = [
      '/mockups/mockup-1-restaurant.webp',
      '/mockups/mockup-2-cafe.webp',
      '/mockups/mockup-3-store.webp',
      '/mockups/mockup-4-medical.webp',
    ];
    return fallbacks[idx % fallbacks.length];
  }
  return url;
};

const fallbackPortfolio: ExtendedPortfolioItem[] = [
  {
    id: 'f-1',
    title: 'Delano Café & Bistro',
    category: 'cafes',
    description: 'منيو إلكتروني تفاعلي QR مع نظام طلب مباشر ودفع سريع عبر واتساب بدون أي عمولات وسيطة.',
    image_url: '/mockups/mockup-2-cafe.webp',
    link: 'https://delano-cafe.clickzoon.com',
    live_url: 'https://delano-cafe.clickzoon.com',
    slug: 'delano-cafe',
    visible: true,
    sort_order: 1,
  },
  {
    id: 'f-2',
    title: 'مجمع عيادات رويال التخصصية',
    category: 'restaurants',
    description: 'موقع طبي متكامل مع حجز مواعيد ذكي، استعراض جداول الأطباء، وتأكيد الحجز فورياً عبر واتساب.',
    image_url: '/mockups/mockup-4-medical.webp',
    link: 'https://royal-clinics.clickzoon.com',
    live_url: 'https://royal-clinics.clickzoon.com',
    slug: 'royal-clinic',
    visible: true,
    sort_order: 2,
  },
  {
    id: 'f-3',
    title: 'متجر Orchid Luxury',
    category: 'stores',
    description: 'متجر إلكتروني فخم للأزياء والعطور، مربوط مع بوابات الدفع الإلكتروني وشركات الشحن السريع في مصر.',
    image_url: '/mockups/mockup-3-store.webp',
    link: 'https://orchid-boutique.clickzoon.com',
    live_url: 'https://orchid-boutique.clickzoon.com',
    visible: true,
    sort_order: 3,
  },
  {
    id: 'f-4',
    title: 'مطاعم ومشويات الباشا',
    category: 'restaurants',
    description: 'موقع تعريفي وقائمة طعام إلكترونية مع خدمة حجز الطاولات وتوصيل الطلبات للمنازل.',
    image_url: '/mockups/mockup-1-restaurant.webp',
    link: 'https://albasha-grill.clickzoon.com',
    live_url: 'https://albasha-grill.clickzoon.com',
    visible: true,
    sort_order: 4,
  },
];

const fallbackPortfolioEn: ExtendedPortfolioItem[] = [
  {
    id: 'f-1',
    title: 'Delano Café & Bistro',
    category: 'cafes',
    description: 'Interactive QR digital menu with direct instant ordering and WhatsApp checkout with zero commissions.',
    image_url: '/mockups/mockup-2-cafe.webp',
    link: 'https://delano-cafe.clickzoon.com',
    live_url: 'https://delano-cafe.clickzoon.com',
    slug: 'delano-cafe',
    visible: true,
    sort_order: 1,
  },
  {
    id: 'f-2',
    title: 'Royal Specialty Clinics',
    category: 'restaurants',
    description: 'Comprehensive medical website with smart appointment booking, doctor schedules, and instant WhatsApp confirmations.',
    image_url: '/mockups/mockup-4-medical.webp',
    link: 'https://royal-clinics.clickzoon.com',
    live_url: 'https://royal-clinics.clickzoon.com',
    slug: 'royal-clinic',
    visible: true,
    sort_order: 2,
  },
  {
    id: 'f-3',
    title: 'Orchid Luxury Boutique',
    category: 'stores',
    description: 'Luxury fashion and perfume e-commerce store integrated with online payment gateways and fast shipping across Egypt.',
    image_url: '/mockups/mockup-3-store.webp',
    link: 'https://orchid-boutique.clickzoon.com',
    live_url: 'https://orchid-boutique.clickzoon.com',
    visible: true,
    sort_order: 3,
  },
  {
    id: 'f-4',
    title: 'Al-Basha Gourmet Grill',
    category: 'restaurants',
    description: 'Brand website and electronic menu with online table booking and direct doorstep delivery system.',
    image_url: '/mockups/mockup-1-restaurant.webp',
    link: 'https://albasha-grill.clickzoon.com',
    live_url: 'https://albasha-grill.clickzoon.com',
    visible: true,
    sort_order: 4,
  },
];

export default function Portfolio() {
  const { t, dir, language } = useI18n();
  const { ref, revealed } = useReveal();
  const { data } = useSiteData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const filters = [
    { key: 'all', label: t('portfolio.filter_all') },
    { key: 'restaurants', label: t('portfolio.filter_restaurants') },
    { key: 'stores', label: t('portfolio.filter_stores') },
    { key: 'cafes', label: t('portfolio.filter_cafes') },
  ];

  const rawProjects = language === 'en' ? fallbackPortfolioEn : (data.portfolio && data.portfolio.length > 0 ? data.portfolio : fallbackPortfolio);
  const projects = rawProjects as ExtendedPortfolioItem[];
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
    setDeviceMode('desktop');
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        prevProject();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextProject();
      } else if (e.key === 'Tab') {
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
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
        <SectionHeader
          badge={t('portfolio.badge')}
          title={t('portfolio.title')}
          highlight={t('portfolio.highlight')}
          subtitle={t('portfolio.subtitle')}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                activeFilter === filter.key
                  ? 'bg-gold-500 text-navy-950 font-bold shadow-md shadow-gold-500/20'
                  : 'bg-navy-800/80 text-navy-300 hover:text-navy-100 hover:bg-navy-700/80 border border-navy-700/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Grid with Framer Motion layout animation for smooth reflow */}
        <motion.div layout ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <motion.div
                layout
                key={project.id || project.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`reveal ${revealed ? 'revealed' : ''}`}
                style={revealed ? undefined : { transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-full group relative overflow-hidden rounded-2xl glass-card text-start transition-transform duration-300 hover:-translate-y-2 hover:border-gold-500/40 h-full flex flex-col justify-between">
                  {/* Image with zoom and gentle overlay */}
                  <div className="relative h-56 w-full overflow-hidden bg-navy-950">
                    <img
<<<<<<< HEAD
                      src={getSafeImageUrl(project.image_url, i)}
                      alt={project.title ? `معاينة مشروع ${project.title}` : 'معاينة مشروع من أعمال Click Zoon'}
=======
                      src={project.image_url}
                      alt={project.title ? t('portfolio.preview_alt', { title: project.title }) : t('portfolio.preview_alt_default')}
>>>>>>> origin/main
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={338}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent pointer-events-none" />

                    {/* Quick view button on hover */}
                    <button
                      type="button"
                      onClick={(e) => openLightbox(i, e)}
                      className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-navy-950/60 backdrop-blur-sm transition-opacity"
                      aria-label={t('portfolio.preview_aria', { title: project.title })}
                    >
                      <span className="btn-gold px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xl">
                        <Sparkles size={14} />
                        <span>{t('portfolio.view_details')}</span>
                      </span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-5 w-full flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-navy-50 mb-2 group-hover:text-gold-300 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-navy-300 text-sm leading-relaxed line-clamp-2 mb-4">{project.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-navy-800">
                      {(project.slug || project.id === 'f-1' || project.id === 'f-2') ? (
                        <Link
                          to={`/work/${project.slug || (project.id === 'f-1' ? 'delano-cafe' : 'royal-clinic')}`}
                          className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
                        >
                          <BookOpen size={13} />
                          <span>{t('portfolio.case_study')}</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-navy-400 font-medium">Click Zoon</span>
                      )}

                      {(project.live_url || project.link) && (
                        <a
                          href={project.live_url || project.link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-navy-300 hover:text-gold-400 flex items-center gap-1 transition-colors"
                        >
                          <span>{t('portfolio.live_preview')}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="text-center mt-10">
          <Link
            to="/showcase"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-7 py-3.5 rounded-xl transition-all glow-gold-hover"
          >
            <span>{t('portfolio.all_showcase_btn')}</span>
            <ChevronLeft size={18} className="rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>

      {/* Lightbox & Device Frame Preview Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            id="portfolio-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={filtered[lightboxIndex].title || t('portfolio.preview_dialog_aria')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-navy-950/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button with min 44x44px tap target */}
            <button
              ref={closeButtonRef}
              className="absolute top-5 end-5 text-navy-100 hover:text-gold-400 transition-colors w-11 h-11 rounded-full bg-navy-900/80 border border-navy-700/60 flex items-center justify-center z-10"
              onClick={closeLightbox}
              aria-label={t('common.close')}
            >
              <X size={24} />
            </button>

            {/* Prev/Next buttons (RTL aware) */}
            {filtered.length > 1 && (
              <>
                <button
                  className="absolute end-4 sm:end-6 top-1/2 -translate-y-1/2 text-navy-100 hover:text-gold-400 transition-colors w-12 h-12 bg-navy-900/90 border border-navy-700/60 rounded-full flex items-center justify-center z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevProject();
                  }}
                  aria-label={t('mockups.prev_project')}
                  title={t('mockups.prev')}
                >
                  {dir === 'rtl' ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
                </button>
                <button
                  className="absolute start-4 sm:start-6 top-1/2 -translate-y-1/2 text-navy-100 hover:text-gold-400 transition-colors w-12 h-12 bg-navy-900/90 border border-navy-700/60 rounded-full flex items-center justify-center z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextProject();
                  }}
                  aria-label={t('mockups.next_project')}
                  title={t('mockups.next')}
                >
                  {dir === 'rtl' ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
                </button>
              </>
            )}

            {/* Dialog Content with subtle spring zoom */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full bg-navy-900 rounded-2xl overflow-hidden border border-navy-700/60 shadow-2xl relative transition-all duration-300 ${
                deviceMode === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with device frame toggle */}
              <div className="p-4 bg-navy-950 border-b border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeviceMode('desktop')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      deviceMode === 'desktop' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'text-navy-400 hover:text-navy-200'
                    }`}
                    title={t('mockups.desktop_preview')}
                  >
                    <Monitor size={16} />
                    <span className="hidden sm:inline">{t('mockups.desktop_preview')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode('mobile')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      deviceMode === 'mobile' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'text-navy-400 hover:text-navy-200'
                    }`}
                    title={t('mockups.mobile_preview')}
                  >
                    <Smartphone size={16} />
                    <span className="hidden sm:inline">{t('mockups.mobile_preview')}</span>
                  </button>
                </div>

                <div className="text-xs text-navy-400">
                  {lightboxIndex + 1} / {filtered.length}
                </div>
              </div>

              {/* Preview Window */}
              <div className="relative bg-navy-950 flex items-center justify-center overflow-hidden p-2">
                <div className={`overflow-hidden transition-all duration-300 rounded-xl ${
                  deviceMode === 'mobile' ? 'w-[280px] h-[480px] border-4 border-navy-700 shadow-inner' : 'w-full max-h-[55vh]'
                }`}>
                  <img
<<<<<<< HEAD
                    src={getSafeImageUrl(filtered[lightboxIndex].image_url, lightboxIndex)}
                    alt={filtered[lightboxIndex].title ? `صورة مشروع ${filtered[lightboxIndex].title}` : 'تفاصيل مشروع Click Zoon'}
=======
                    src={filtered[lightboxIndex].image_url}
                    alt={filtered[lightboxIndex].title ? t('portfolio.modal_img_alt', { title: filtered[lightboxIndex].title }) : t('portfolio.modal_img_alt_default')}
>>>>>>> origin/main
                    width={1200}
                    height={675}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Footer info & CTA */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-navy-50 mb-1">{filtered[lightboxIndex].title}</h3>
                    <p className="text-navy-300 text-sm leading-relaxed">{filtered[lightboxIndex].description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(filtered[lightboxIndex].live_url || filtered[lightboxIndex].link) && (
                      <a
                        href={filtered[lightboxIndex].live_url || filtered[lightboxIndex].link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 bg-gold-500/10 border border-gold-500/30 px-4 py-2 rounded-xl transition-colors"
                      >
                        <span>{t('portfolio.live_preview')}</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
