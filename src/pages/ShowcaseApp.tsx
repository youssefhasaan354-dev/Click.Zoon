import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, ArrowRight, Check, ShoppingCart } from 'lucide-react';
import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import OrderModal from '@/components/OrderModal';
import NotFound from '@/pages/NotFound';
import { ShowcaseIcon } from '@/pages/Showcase';
import { categoryLabels, kindLabels, useShowcaseItems } from '@/lib/showcase';
import { trackEvent } from '@/lib/analytics';
import { useI18n } from '@/i18n';

export default function ShowcaseAppPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const { items } = useShowcaseItems();
  const [ordering, setOrdering] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  const item = items.find((i) => i.slug === slug);
  if (!item) return <NotFound />;

  const liveUrl = item.live_url || item.link;
  const related = items.filter((i) => i.slug !== item.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Seo
        title={`${item.title}: ${t('showcase.kind_' + item.kind) || kindLabels[item.kind]}`}
        description={item.tagline || item.description}
        canonical={`/showcase/${item.slug}`}
        ogImage={item.image_url.startsWith('http') ? item.image_url : undefined}
      />
      <Header />
      <main id="main" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link to="/showcase" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-gold-300 mb-6">
          <ArrowRight size={16} className="rtl:rotate-0 ltr:rotate-180" />
          <span>{t('showcase.all_works')}</span>
        </Link>

        {/* Title block (Google Play style) */}
        <div className="flex items-start gap-5 mb-6">
          <ShowcaseIcon item={item} size={96} />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-50 mb-1">{item.title}</h1>
            <p className="text-gold-400 text-sm font-semibold">
              {(t('showcase.kind_' + item.kind) || kindLabels[item.kind])} · {(t('showcase.cat_' + item.category) || categoryLabels[item.category] || item.category)}
            </p>
            {item.tagline && <p className="text-navy-300 text-sm mt-2">{item.tagline}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            type="button"
            onClick={() => {
              trackEvent({ category: 'form', action: 'open', label: `showcase_order_${item.slug}` });
              setOrdering(true);
            }}
            className="flex-1 sm:flex-none sm:min-w-[200px] bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-8 py-3.5 rounded-full inline-flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingCart size={18} />
            <span>{t('showcase.order_now')}</span>
          </button>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none border border-navy-600 hover:border-gold-500/50 text-navy-100 font-semibold px-6 py-3.5 rounded-full inline-flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink size={18} />
              <span>{item.kind === 'app' ? t('showcase.open_app') : t('showcase.open_site')}</span>
            </a>
          )}
        </div>

        {/* Screenshots */}
        <section aria-label={t('showcase.screenshots_aria')} className="mb-10">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {item.screenshots.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setZoom(src)}
                className="snap-start shrink-0 rounded-2xl overflow-hidden border border-navy-700/60 bg-navy-950 focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label={t('showcase.zoom_img', { n: i + 1 })}
              >
                <img
                  src={src}
                  alt={t('showcase.img_alt', { title: item.title, n: i + 1 })}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-56 sm:h-72 w-auto max-w-[85vw] object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-navy-50 mb-3">
            {item.kind === 'app' ? t('showcase.about_app') : t('showcase.about_site')}
          </h2>
          <p className="text-navy-200 leading-relaxed whitespace-pre-line">{item.long_description}</p>
        </section>

        {item.features.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-navy-50 mb-3">{t('showcase.features')}</h2>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {item.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-navy-200 text-sm">
                  <Check size={18} className="text-gold-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-navy-50 mb-4">{t('showcase.similar_works')}</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/showcase/${r.slug}`}
                    className="flex items-center gap-3 p-3 rounded-2xl glass-card hover:border-gold-500/40 transition-colors"
                  >
                    <ShowcaseIcon item={r} size={56} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-50 truncate">{r.title}</p>
                      <p className="text-xs text-navy-400">{t('showcase.kind_' + r.kind) || kindLabels[r.kind]}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Screenshot Zoom Modal */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] bg-navy-950/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <img
            src={zoom}
            alt={t('showcase.zoom_alt')}
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain border border-navy-700"
          />
        </div>
      )}

      {ordering && <OrderModal item={item} onClose={() => setOrdering(false)} />}
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
