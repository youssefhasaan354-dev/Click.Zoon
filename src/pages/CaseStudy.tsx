import { useParams, Link, Navigate } from 'react-router-dom';
import { ExternalLink, CheckCircle2, TrendingUp, Sparkles, Star } from 'lucide-react';
import Seo from '@/components/Seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Counter from '@/components/Counter';
import { waLink } from '@/siteConfig';
import { useI18n } from '@/i18n';

interface CaseStudyData {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  heroImage: string;
  liveUrl: string;
  problem: string[];
  solution: string[];
  metrics: { value: number; suffix: string; label: string }[];
  testimonial: { text: string; author: string; role: string };
}

const caseStudies: Record<string, CaseStudyData> = {
  'delano-cafe': {
    slug: 'delano-cafe',
    title: 'تصميم منيو إلكتروني وموقع تفاعلي لكافيه ديلانو',
    client: 'Delano Café & Bistro',
    category: 'مطاعم وكافيهات',
    year: '2026',
    heroImage: '/mockups/mockup-2-cafe-desktop.webp',
    liveUrl: 'https://delano-cafe.clickzoon.com',
    problem: [
      'الاعتماد الكامل على منيو ورقي مطبوع يصعب تحديثه عند تغير الأسعار أو الأصناف.',
      'خسارة نسبة كبيرة من طلبات الدليفري بسبب عمولات تطبيقات التوصيل التي تصل لـ 20-25%.',
      'صعوبة تصفح الأصناف وصور الأطباق عبر شاشات الموبايل في المكان.',
    ],
    solution: [
      'بناء منيو إلكتروني QR تفاعلي فائق السرعة يعمل فوراً بدون الحاجة لتحميل أي تطبيق.',
      'ربط نظام طلب مباشر يرسل تفاصيل الطلب والطاولة أو العنوان مباشرة عبر واتساب بدون عمولة.',
      'لوحة تحكم سهلة باللغة العربية تتيح لمدير المكان تعديل الأسعار وإخفاء الأصناف غير المتاحة بثوانٍ.',
    ],
    metrics: [
      { value: 180, suffix: '%', label: 'زيادة في طلبات الأونلاين المباشرة' },
      { value: 0, suffix: '%', label: 'عمولات تطبيقات توصيل وسيطة' },
      { value: 98, suffix: '/100', label: 'نتيجة سرعة وأداء Lighthouse' },
      { value: 48, suffix: ' ساعة', label: 'مدة تجهيز وتسليم الديمو' },
    ],
    testimonial: {
      text: 'الموقع وفر علينا آلاف الجنيهات كانت بتروح عمولات شهرية. الزباين مبسوطة جداً من سرعة المنيو وسهولة الطلب.',
      author: 'م. كريم الديب',
      role: 'مؤسس Delano Café',
    },
  },
  'royal-clinic': {
    slug: 'royal-clinic',
    title: 'تطوير موقع طبي ونظام حجز مواعيد لعيادات رويال التخصصية',
    client: 'Royal Specialty Clinics',
    category: 'مراكز وعيادات طبية',
    year: '2026',
    heroImage: '/mockups/mockup-3-clinic-desktop.webp',
    liveUrl: 'https://royal-clinics.clickzoon.com',
    problem: [
      'ضغط كبير على خطوط الهاتف واستقبال العيادة لتأكيد المواعيد والاستفسار عن جداول الأطباء.',
      'موقع قديم غير متجاوب مع الهواتف الذكية مع وقت تحميل يتجاوز 5 ثوانٍ.',
      'عدم ظهور العيادة في الصفحة الأولى في نتائج البحث في جوجل لخدمات الكشف التخصصي.',
    ],
    solution: [
      'تصميم موقع طبي راقٍ يبرز تخصصات الأطباء، السيرة الذاتية، ومواعيد العيادات بوضوح.',
      'نظام حجز مواعيد إلكتروني ذكي يحدد الطبيب والوقت المناسب ويؤكد الحجز آلياً عبر واتساب.',
      'تهيئة سيو محلية دقيقة للكلمات المفتاحية الطبية، مما جعل الموقع يتصدر نتائج البحث.',
    ],
    metrics: [
      { value: 145, suffix: '%', label: 'زيادة الحجوزات الطبية المؤكدة' },
      { value: 70, suffix: '%', label: 'توفير وقت مكالمات الاستقبال' },
      { value: 99, suffix: '/100', label: 'تقييم تجربة الموبايل (Mobile UX)' },
      { value: 1, suffix: '#', label: 'المرتبة الأولى في نتائج البحث محلياً' },
    ],
    testimonial: {
      text: 'كليك زون حوّلوا موقعنا من مجرد صفحة إلى أهم قناة لاستقبال المرضى الجدد وتنظيم جدول الأطباء بدقة.',
      author: 'د. أحمد منصور',
      role: 'المدير التنفيذي لمجمع عيادات رويال',
    },
  },
};

export default function CaseStudyPage() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? caseStudies[slug] : null;

  if (!study) {
    return <Navigate to="/#portfolio" replace />;
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: study.title,
      description: `دراسة حالة: كيف ساعدت وكالة كليك زون ${study.client} في تحقيق نمو استثنائي وتطوير حضورهم الرقمي.`,
      image: study.heroImage,
      publisher: {
        '@type': 'Organization',
        name: 'Click Zoon',
        url: 'https://click-zoon.vercel.app',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50">
      <Seo
        title={`${study.title} | دراسة حالة Click Zoon`}
        description={`قصة نجاح ${study.client}: التحديات، الحلول الرقمية، والنتائج القياسية التي تحققت مع كليك زون.`}
        canonical={`/work/${study.slug}`}
        jsonLd={jsonLd}
      />
      <Header />

      <main id="main" className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-navy-400 mb-8">
            <Link to="/" className="hover:text-gold-300 transition-colors">
              {t('nav.home')}
            </Link>
            <span>/</span>
            <Link to="/#portfolio" className="hover:text-gold-300 transition-colors">
              {t('nav.showcase')}
            </Link>
            <span>/</span>
            <span className="text-gold-400 font-semibold">{study.client}</span>
          </div>

          {/* Hero Header */}
          <div className="mb-10">
            <div className="inline-block px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-bold mb-4">
              {study.category} • {study.year}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-50 mb-6 leading-tight">
              {study.title}
            </h1>
            <p className="text-lg text-navy-300 max-w-3xl leading-relaxed">
              تعرّف على كيف حوّلنا التحديات التقنية والتسويقية إلى قصة نجاح ملموسة بالأرقام والنتائج.
            </p>
          </div>

          {/* Featured Mockup Preview */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-navy-700/80 mb-14 glass-card">
            <img
              src={study.heroImage}
              alt={study.title}
              width={1280}
              height={720}
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-4 left-4 z-10">
              <a
                href={study.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-xl"
              >
                <span>معاينة الموقع الحي</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Results Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-navy-50 mb-6 flex items-center gap-2">
              <TrendingUp className="text-gold-400" />
              <span>النتائج القياسية بالأرقام</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {study.metrics.map((m) => (
                <div key={m.label} className="glass-card rounded-2xl p-6 text-center border border-gold-500/25">
                  <div className="text-3xl sm:text-4xl font-extrabold text-gradient-gold mb-2">
                    <Counter value={m.value} suffix={m.suffix} />
                  </div>
                  <div className="text-xs sm:text-sm text-navy-300 font-medium">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem & Solution Columns */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Problem */}
            <div className="glass-card rounded-2xl p-7 border border-red-500/25 bg-red-950/10">
              <h3 className="text-xl font-bold text-navy-50 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <span>التحدي قبل التطوير</span>
              </h3>
              <ul className="space-y-3">
                {study.problem.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-navy-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="glass-card rounded-2xl p-7 border border-gold-500/30 bg-navy-950/40">
              <h3 className="text-xl font-bold text-navy-50 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <span>الحل الذكي من كليك زون</span>
              </h3>
              <ul className="space-y-3">
                {study.solution.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-navy-200 leading-relaxed">
                    <CheckCircle2 size={18} className="text-gold-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Client Testimonial Quote */}
          <div className="glass-card rounded-2xl p-8 border border-gold-500/40 mb-16 relative">
            <div className="flex gap-1 text-gold-400 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <p className="text-lg sm:text-xl text-navy-100 font-medium leading-relaxed mb-6">
              "{study.testimonial.text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-300 font-bold flex items-center justify-center text-lg">
                {study.testimonial.author.charAt(0)}
              </div>
              <div>
                <div className="text-navy-50 font-bold">{study.testimonial.author}</div>
                <div className="text-navy-400 text-xs sm:text-sm">{study.testimonial.role}</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-navy-800 to-navy-950 border border-gold-500/40 shadow-2xl">
            <Sparkles size={32} className="text-gold-400 mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-50 mb-3">
              جاهز لتحقيق نفس النجاح لنشاطك التجاري؟
            </h3>
            <p className="text-navy-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              احصل على نموذج ديمو تجريبي لموقع نشاطك خلال 48 ساعة مجاناً وبدون أي التزام مالي.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/#wizard" className="btn-gold px-8 py-3.5 rounded-xl font-bold text-sm">
                احسب تكلفة موقعك واطلب الديمو
              </Link>
              <a
                href={waLink(`مرحباً كليك زون، اطلعت على دراسة حالة ${study.client} وحابب أعمل موقع لنشاطي`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl border border-navy-600 hover:border-gold-500/50 text-navy-200 hover:text-navy-50 font-bold text-sm transition-colors"
              >
                تحدث مع مستشارنا عبر واتساب
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
