import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Smartphone, ShoppingBag } from 'lucide-react';
import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import { ShowcaseItem, ShowcaseKind, categoryLabels, kindLabels, useShowcaseItems } from '@/lib/showcase';

const kindIcons = { website: Globe, app: Smartphone, store: ShoppingBag } as const;

const tabs: Array<{ key: 'all' | ShowcaseKind; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'website', label: 'مواقع' },
  { key: 'app', label: 'برامج' },
  { key: 'store', label: 'متاجر' },
];

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
  const { items, isSample, loading, error, refresh } = useShowcaseItems();
  const [tab, setTab] = useState<'all' | ShowcaseKind>('all');
  const list = tab === 'all' ? items : items.filter((i) => i.kind === tab);

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Seo
        title="معرض الأعمال: مواقع وبرامج جاهزة"
        description="تصفح المواقع والبرامج والمتاجر الإلكترونية التي صمّمناها، وشوف الصور والرابط واطلب نموذج مماثل لنشاطك."
        canonical="/showcase"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'معرض الأعمال | Click Zoon',
          description: 'تصفح المواقع والبرامج والمتاجر الإلكترونية التي صمّمناها من كليك زون واطلب نموذجاً مماثلاً لنشاطك.',
        }}
      />
      <Header />
      <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-2">معرض الأعمال</h1>
          <p className="text-navy-300 text-base">
            مواقع وبرامج جاهزة. افتح أي مشروع، شوف صوره ورابطه، واطلبه لنشاطك بضغطة واحدة.
          </p>
          {isSample && (
            <p className="mt-3 text-xs text-gold-300 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2 inline-block">
              هذه نماذج تصميم توضيحية. يمكنك إضافة مشاريعك الفعلية من لوحة التحكم ← أعمالنا.
            </p>
          )}
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8" role="tablist" aria-label="تصفية الأعمال">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all ${
                tab === t.key
                  ? 'bg-gold-500 text-navy-950 font-bold'
                  : 'bg-navy-800/80 text-navy-300 hover:text-navy-100 border border-navy-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && items.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="جاري تحميل المشاريع">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl glass-card animate-pulse border border-navy-700/40">
                <div className="w-[72px] h-[72px] rounded-2xl bg-navy-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-navy-800 rounded w-3/4" />
                  <div className="h-3 bg-navy-800 rounded w-1/2" />
                  <div className="h-3 bg-navy-800 rounded w-5/6" />
                </div>
                <div className="w-16 h-8 rounded-full bg-navy-800 shrink-0" />
              </div>
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl p-8 border border-red-500/20 max-w-md mx-auto">
            <p className="text-red-300 font-bold mb-2">تعذر تحميل المشاريع</p>
            <p className="text-navy-400 text-sm mb-6">{error}</p>
            <button
              type="button"
              onClick={() => refresh()}
              className="btn-gold px-6 py-2.5 rounded-full text-sm font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : list.length === 0 ? (
          <p className="text-navy-400 text-center py-16">لا توجد مشاريع في هذا القسم حالياً.</p>
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
                      {kindLabels[item.kind]} · {categoryLabels[item.category] ?? item.category}
                    </p>
                    {item.tagline && <p className="text-xs text-navy-300 mt-1 line-clamp-1">{item.tagline}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-bold bg-gold-500 text-navy-950 px-3.5 py-2 rounded-full">
                    اطلب الآن
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
