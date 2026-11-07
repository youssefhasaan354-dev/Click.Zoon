import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Smartphone, ShoppingBag } from 'lucide-react';
import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import { ShowcaseItem, ShowcaseKind, categoryLabels, kindLabels, useShowcaseItems } from '@/lib/showcase';
import { useI18n } from '@/i18n';

const kindIcons = { website: Globe, app: Smartphone, store: ShoppingBag } as const;

export function ShowcaseIcon({ item, size = 72 }: { item: ShowcaseItem; size?: number }) {
  const Icon = kindIcons[item.kind];
  const src = item.icon_url || item.image_url;
  return (
    <div
      className="shrink-0 overflow-hidden bg-navy-800 border border-navy-700/60 flex items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    >
      {src ? (
        <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      ) : (
        <Icon className="text-gold-400" size={size * 0.45} />
      )}
    </div>
  );
}

export default function ShowcasePage() {
  const { t } = useI18n();
  const { items, isSample } = useShowcaseItems();
  const [tab, setTab] = useState<'all' | ShowcaseKind>('all');

  const tabs: Array<{ key: 'all' | ShowcaseKind; label: string }> = [
    { key: 'all', label: t('showcase.tab_all') },
    { key: 'website', label: t('showcase.tab_websites') },
    { key: 'app', label: t('showcase.tab_apps') },
    { key: 'store', label: t('showcase.tab_stores') },
  ];

  const list = tab === 'all' ? items : items.filter((i) => i.kind === tab);

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Seo
        title={t('showcase.meta_title') || 'معرض الأعمال: مواقع وبرامج جاهزة'}
        description={t('showcase.meta_desc') || 'تصفح المواقع والبرامج والمتاجر الإلكترونية التي صمّمناها، وشوف الصور والرابط واطلب نموذج مماثل لنشاطك.'}
        canonical="/showcase"
      />
      <Header />
      <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-2">{t('showcase.title')}</h1>
          <p className="text-navy-300 text-base">
            {t('showcase.subtitle')}
          </p>
          {isSample && (
            <p className="mt-3 text-xs text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2 inline-block">
              {t('showcase.sample_notice')}
            </p>
          )}
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" role="tablist" aria-label="تصفية الأعمال">
          {tabs.map((tItem) => (
            <button
              key={tItem.key}
              type="button"
              role="tab"
              aria-selected={tab === tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all ${
                tab === tItem.key
                  ? 'bg-gold-500 text-navy-950 font-bold'
                  : 'bg-navy-800/80 text-navy-300 hover:text-navy-100 border border-navy-700/50'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="text-navy-400 text-center py-16">{t('showcase.empty')}</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((item) => (
              <li key={item.id || item.slug}>
                <Link
                  to={`/showcase/${item.slug}`}
                  className="flex items-center gap-4 p-4 rounded-2xl glass-card hover:border-gold-500/40 transition-colors focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <ShowcaseIcon item={item} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-navy-50 truncate">{item.title}</h2>
                    <p className="text-xs text-navy-400 truncate">
                      {t('showcase.kind_' + item.kind) || kindLabels[item.kind]} · {t('showcase.cat_' + item.category) || categoryLabels[item.category] || item.category}
                    </p>
                    {item.tagline && <p className="text-xs text-navy-300 mt-1 line-clamp-1">{item.tagline}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-bold bg-gold-500 text-navy-950 px-3.5 py-2 rounded-full">
                    {t('showcase.order_btn')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
