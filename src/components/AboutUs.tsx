import { useReveal } from '@/hooks/useReveal';
import { useSiteConfig } from '@/siteConfig';
import { useSectionVisibility } from '@/lib/site-data-context';
import Counter from '@/components/Counter';
import { useI18n } from '@/i18n';

export default function AboutUs() {
  const { t, language } = useI18n();
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const visible = useSectionVisibility('about');

  const stats: { value: number; suffix: string; label: string }[] = cfg.aboutStats ?? [];
  const hasStats = stats.length > 0;
  const activeAboutTitle = language === 'en' ? t('about_us.badge') : cfg.aboutTitle;
  const activeAboutText = language === 'en' ? t('about_us.description') : cfg.aboutText;
  const hasText = Boolean(activeAboutText && activeAboutText.trim());
  const hasImage = Boolean(cfg.aboutImageUrl && cfg.aboutImageUrl.trim());

  // Early return: nothing renders when both stats and text (and image) are empty, or section is hidden
  if (!visible || (!hasText && !hasStats && !hasImage)) return null;

  // Standalone counters row when about text and image are empty but stats exist
  if (!hasText && !hasImage) {
    return (
      <section id="about" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={ref} className={`reveal ${revealed ? 'revealed' : ''}`}>
            {activeAboutTitle && (
              <div className="text-center mb-8">
                <div className="inline-block text-gold-400 text-sm font-bold tracking-wider">
                  {activeAboutTitle}
                </div>
              </div>
            )}
            <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'lg:grid-cols-4' : stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 max-w-5xl mx-auto`}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center glass-card rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-extrabold text-gradient-gold mb-2">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-navy-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`grid ${hasImage ? 'lg:grid-cols-2' : ''} gap-12 items-center reveal ${revealed ? 'revealed' : ''}`}>
          {/* Image */}
          {hasImage && (
            <div className="relative rounded-2xl overflow-hidden glass-card">
              <img
                src={cfg.aboutImageUrl}
                alt={activeAboutTitle ? t('about_us.alt_img', { title: activeAboutTitle }) : t('about_us.alt_img_default')}
                loading="lazy"
                decoding="async"
                width={800}
                height={450}
                className="w-full h-72 lg:h-96 object-cover"
              />
            </div>
          )}

          {/* Text */}
          <div className={hasImage ? '' : 'lg:col-span-2 text-center max-w-3xl mx-auto'}>
            <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">
              {activeAboutTitle}
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-5">
              <span className="text-gradient-gold notranslate" translate="no">{t('about_us.title_prefix')}</span> — {t('about_us.title_suffix')}
            </h2>
            {hasText && (
              <p className="text-navy-200 text-lg leading-relaxed mb-8">
                {activeAboutText}
              </p>
            )}

            {hasStats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center glass-card rounded-xl p-4 transition-transform duration-300 hover:-translate-y-1">
                    <div className="text-3xl font-extrabold text-gradient-gold mb-1">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-navy-300 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
