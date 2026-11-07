import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Zap,
  Check,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import Seo from '@/components/Seo';
import { landingPages } from '@/data/landingPages';
import { waLink, SITE_URL } from '@/siteConfig';
import { trackEvent } from '@/lib/analytics';
import { useI18n } from '@/i18n';

interface ActivityLandingProps {
  forcedSlug?: string;
}

export default function ActivityLanding({ forcedSlug }: ActivityLandingProps) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = forcedSlug || routeSlug || '';
  const page = landingPages[slug];
  const { isRtl } = useI18n();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!page) {
    return <Navigate to="/404" replace />;
  }

  const handleWhatsAppClick = (label: string) => {
    trackEvent({
      category: 'whatsapp',
      action: 'click',
      label: `landing_${page.activityType}_${label}`,
    });
  };

  const whatsappHref = waLink(page.whatsappMessage);

  // Structured Data (Service + FAQPage + BreadcrumbList)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.h1,
      description: page.metaDescription,
      provider: {
        '@type': 'ProfessionalService',
        name: 'Click Zoon',
        url: `${SITE_URL}/`,
        telephone: '+201020095059',
      },
      areaServed: {
        '@type': 'AdministrativeArea',
        name: 'المنصورة والدقهلية',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'الرئيسية',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.badge,
          item: `${SITE_URL}/${page.slug}`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 flex flex-col pb-16 sm:pb-0">
      <Seo
        title={page.metaTitle}
        description={page.metaDescription}
        canonical={`/${page.slug}`}
        jsonLd={jsonLd}
      />

      <Header />

      <main id="main" lang="ar" dir="rtl" className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative py-16 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 border-b border-navy-800/80">
          <div className="absolute inset-0 bg-radial-gold opacity-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-2 text-xs text-navy-400">
              <Link to="/" className="hover:text-gold-300 transition-colors">
                الرئيسية
              </Link>
              <span className="text-navy-600">/</span>
              <span className="text-navy-300">{page.badge}</span>
            </nav>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <Sparkles size={14} className="text-gold-400 shrink-0" />
              <span className="text-gold-300 text-xs sm:text-sm font-semibold">{page.badge}</span>
            </div>

            {/* H1 */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-navy-50 leading-[1.6] sm:leading-[1.5] mb-6 max-w-4xl mx-auto">
              {page.h1}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-navy-200 leading-relaxed max-w-3xl mx-auto mb-10">
              {page.heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWhatsAppClick('hero_cta')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:scale-105"
              >
                <MessageCircle size={18} className="shrink-0" />
                <span>اطلب ديمو مجاني لنشاطك</span>
              </a>
              <a
                href="#solutions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-navy-700 hover:border-gold-500/50 text-navy-200 hover:text-gold-300 bg-navy-800/60 transition-all"
              >
                <span>تفاصيل ما نقدمه</span>
                <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
              </a>
            </div>

            {/* Mini Trust Points */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-navy-300">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-gold-400" />
                <span>تجهيز ديمو خلال 48 ساعة</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-gold-400" />
                <span>بدون أي دفع مسبق</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-gold-400" />
                <span>دعم فني وضمان عمل</span>
              </span>
            </div>
          </div>
        </section>

        {/* 2. Pain Points Section */}
        <section className="py-16 sm:py-20 bg-navy-950/70 border-b border-navy-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold mb-3 uppercase tracking-wider">
                <ShieldAlert size={14} />
                <span>التحديات الحالية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-50">{page.painPointsTitle}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {page.painPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-2xl border border-red-500/20 bg-navy-900/40 relative overflow-hidden flex flex-col"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-sm mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-navy-100 mb-2 leading-snug">{point.title}</h3>
                  <p className="text-xs sm:text-sm text-navy-300 leading-relaxed mt-auto">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Solutions Section */}
        <section id="solutions" className="py-16 sm:py-24 bg-navy-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 text-xs text-gold-400 font-bold mb-3 uppercase tracking-wider">
                <Zap size={14} />
                <span>الحل التقني المتكامل</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-50">
                {page.solutionsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {page.solutions.map((sol, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 sm:p-7 rounded-2xl border border-navy-700/60 hover:border-gold-500/40 transition-all bg-navy-850/60"
                >
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                      <CheckCircle2 size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-navy-100">{sol.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-navy-300 leading-relaxed">{sol.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Live Showcase Example Section */}
        <section className="py-16 sm:py-20 bg-navy-950 border-y border-navy-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs text-gold-400 font-bold uppercase tracking-wider">نموذج حي من أعمالنا</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-50 mt-2">
                شاهد كيف يبدو الموقع النهائي
              </h2>
            </div>

            <div className="glass-card rounded-2xl border border-gold-500/30 overflow-hidden bg-navy-900/60 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-gold-500/15 text-gold-300 text-xs font-bold mb-3">
                  {page.showcaseSample.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-navy-50 mb-3">
                  {page.showcaseSample.title}
                </h3>
                <p className="text-sm text-navy-300 leading-relaxed mb-6">
                  {page.showcaseSample.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/showcase"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gold-400 hover:text-gold-300 bg-gold-500/10 border border-gold-500/30 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <span>تصفح كل النماذج في المعرض</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-navy-700/80 aspect-video shadow-2xl bg-navy-950 flex items-center justify-center">
                <img
                  src={page.showcaseSample.image}
                  alt={page.showcaseSample.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={640}
                  height={360}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. FAQs Section */}
        <section className="py-16 sm:py-24 bg-navy-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs text-gold-400 font-bold mb-2">
                <HelpCircle size={14} />
                <span>إجابات على استفساراتك</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-50">
                أسئلة شائعة عن تصميم موقع {page.badge.replace('تصميم مواقع ', '')}
              </h2>
            </div>

            <div className="space-y-3.5">
              {page.faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div
                    key={i}
                    className={`glass-card rounded-xl overflow-hidden transition-all duration-300 border ${
                      isOpen ? 'border-gold-500/40 bg-navy-800/80 shadow-lg' : 'border-navy-700/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="w-full text-start p-4 sm:p-5 flex items-center justify-between gap-4"
                    >
                      <span className="font-bold text-sm sm:text-base text-navy-100">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gold-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 pt-0 text-xs sm:text-sm text-navy-300 leading-relaxed border-t border-navy-700/40 mt-1 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. High Converting Bottom CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-t from-navy-950 to-navy-900 border-t border-navy-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-card rounded-3xl p-8 sm:p-12 border border-gold-500/40 shadow-2xl relative overflow-hidden bg-gradient-to-b from-navy-850 to-navy-950">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Sparkles size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-50 mb-4">
                {page.ctaHeading}
              </h2>
              <p className="text-sm sm:text-base text-navy-200 max-w-2xl mx-auto mb-8 leading-relaxed">
                {page.ctaText}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleWhatsAppClick('bottom_cta')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-extrabold px-9 py-4 rounded-xl shadow-xl shadow-gold-500/25 transition-all hover:scale-105 text-sm sm:text-base"
                >
                  <MessageCircle size={20} className="shrink-0" />
                  <span>تواصل عبر واتساب واطلب الديمو</span>
                </a>
              </div>
              <p className="text-[11px] text-navy-400 mt-4">
                بدون التزام أو دفع مسبق — تتطمن على تصميم موقعك أولاً
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomBar />
    </div>
  );
}
