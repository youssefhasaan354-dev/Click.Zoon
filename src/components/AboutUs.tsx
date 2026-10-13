import { useReveal } from '@/hooks/useReveal';
import { useSiteConfig } from '@/siteConfig';
import { useSectionVisibility } from '@/lib/site-data-context';

export default function AboutUs() {
  const { ref, revealed } = useReveal();
  const cfg = useSiteConfig();
  const visible = useSectionVisibility('about');

  if (!visible || (!cfg.aboutText && !cfg.aboutImageUrl)) return null;

  const stats: { value: number; suffix: string; label: string }[] = cfg.aboutStats ?? [];

  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`grid lg:grid-cols-2 gap-12 items-center reveal ${revealed ? 'revealed' : ''}`}>
          {/* Image */}
          {cfg.aboutImageUrl && (
            <div className="relative rounded-2xl overflow-hidden glass-card">
              <img
                src={cfg.aboutImageUrl}
                alt={cfg.aboutTitle}
                loading="lazy"
                className="w-full h-72 lg:h-96 object-cover"
              />
            </div>
          )}

          {/* Text */}
          <div className={cfg.aboutImageUrl ? '' : 'lg:col-span-2 text-center'}>
            <div className="inline-block text-gold-400 text-sm font-bold mb-3 tracking-wider">
              {cfg.aboutTitle}
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy-50 mb-5">
              <span className="text-gradient-gold">كليك زون</span> — من نحن
            </h2>
            <p className="text-navy-200 text-lg leading-relaxed mb-8">
              {cfg.aboutText}
            </p>

            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center glass-card rounded-xl p-4">
                    <div className="text-3xl font-extrabold text-gradient-gold mb-1">
                      {stat.value}{stat.suffix}
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
