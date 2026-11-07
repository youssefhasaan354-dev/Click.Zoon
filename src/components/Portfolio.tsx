import { useState } from 'react';
import { Sparkles, ArrowLeft, Globe, Smartphone, ShoppingBag } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import SectionHeader from '@/components/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useShowcaseItems, categoryLabels, kindLabels, ShowcaseKind } from '@/lib/showcase';

const kindIcons: Record<ShowcaseKind, typeof Globe> = {
  website: Globe,
  app: Smartphone,
  store: ShoppingBag,
};

export default function Portfolio() {
  const { ref, revealed } = useReveal();
  const { items, isSample } = useShowcaseItems();
  const [activeFilter, setActiveFilter] = useState('all');

  // Display top 6 showcase projects on homepage
  const topProjects = items.slice(0, 6);

  const categories = ['all', ...Array.from(new Set(topProjects.map((p) => p.category)))];

  const filtered =
    activeFilter === 'all'
      ? topProjects
      : topProjects.filter((p) => p.category === activeFilter);

  if (topProjects.length === 0) return null;

  return (
    <section id="portfolio" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="معرض الأعمال والنماذج"
          title="تصميمات ونماذج جاهزة"
          highlight="لمختلف الأنشطة التجارية"
          subtitle="تصفح نماذج مواقع ومتاجر وبرامج صمّمناها لتناسب هوية نشاطك وتمنح زوارك تجربة استثنائية."
        />

        {/* Notice for sample models if DB has no custom projects yet */}
        {isSample && (
          <div className="text-center -mt-6 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-300 text-xs font-semibold">
              <Sparkles size={13} className="text-gold-400" />
              <span>نماذج تصميم توضيحية — نبني لك تصميماً مخصصاً مطابقاً لهوية نشاطك</span>
            </span>
          </div>
        )}

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12" role="tablist" aria-label="تصفية معرض الأعمال">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeFilter === cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  activeFilter === cat
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-md shadow-gold-500/20'
                    : 'bg-navy-800/80 text-navy-300 hover:text-navy-100 hover:bg-navy-700/80 border border-navy-700/50'
                }`}
              >
                {cat === 'all' ? 'الكل' : categoryLabels[cat] ?? cat}
              </button>
            ))}
          </div>
        )}

        {/* 6 Projects Grid */}
        <motion.div layout ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => {
              const KindIcon = kindIcons[project.kind] ?? Globe;
              return (
                <motion.div
                  layout
                  key={project.id || project.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`reveal ${revealed ? 'revealed' : ''}`}
                  style={revealed ? undefined : { transitionDelay: `${i * 70}ms` }}
                >
                  <Link
                    to={`/showcase/${project.slug}`}
                    className="w-full group relative overflow-hidden rounded-2xl glass-card text-right transition-transform duration-300 hover:-translate-y-2 hover:border-gold-500/40 h-full flex flex-col justify-between block focus-visible:ring-2 focus-visible:ring-gold-400"
                    aria-label={`عرض تفاصيل ${project.title}`}
                  >
                    {/* Image with zoom and gradient overlay */}
                    <div className="relative h-56 w-full overflow-hidden bg-navy-950">
                      <img
                        src={project.image_url}
                        alt={project.title ? `معاينة تصميم ${project.title}` : 'معاينة تصميم من أعمال كليك زون'}
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={338}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent pointer-events-none" />

                      {/* Kind & Category Pill Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/85 backdrop-blur-md border border-navy-700/60 text-xs font-semibold text-gold-300">
                        <KindIcon size={13} className="text-gold-400" />
                        <span>{kindLabels[project.kind]}</span>
                        <span className="text-navy-500">·</span>
                        <span>{categoryLabels[project.category] ?? project.category}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 w-full flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-navy-50 mb-2 group-hover:text-gold-300 transition-colors">
                          {project.title}
                        </h3>
                        {project.tagline && (
                          <p className="text-xs font-semibold text-gold-400/90 mb-2">{project.tagline}</p>
                        )}
                        <p className="text-navy-300 text-sm leading-relaxed line-clamp-2 mb-4">
                          {project.description}
                        </p>
                      </div>

                      {/* Bottom action button */}
                      <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-200 group-hover:text-gold-400 transition-colors inline-flex items-center gap-1.5">
                          <span>عرض التفاصيل والطلب</span>
                          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </span>
                        <span className="text-xs font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30 px-3 py-1 rounded-full">
                          معاينة
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Link to full showcase page */}
        <div className="mt-14 text-center">
          <Link
            to="/showcase"
            className="btn-gold inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-gold-500/20 hover:scale-105 transition-all"
          >
            <span>استكشف كافة الأعمال والنماذج في المعرض</span>
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
