import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Smartphone,
  Monitor,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Lock,
  Menu,
  Wifi,
  Battery,
  Signal,
  ArrowLeft,
  Star,
  Clock,
  Flame,
  Coffee,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  UtensilsCrossed,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import SectionHeader from '@/components/SectionHeader';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/motion';

interface MobileCard {
  title: string;
  desc: string;
  meta: string;
  tag?: string;
  icon: LucideIcon;
}

interface DeliveredProject {
  id: string;
  src: string;
  title: string;
  category: string;
  domain: string;
  theme: {
    accentColor: string;
    badgeBg: string;
    ctaBg: string;
    cardBorder: string;
    iconBg: string;
  };
  header: {
    logoText: string;
    logoSub: string;
    statusBadge: string;
    icon: LucideIcon;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  cards: MobileCard[];
}

const deliveredProjects: DeliveredProject[] = [
  {
    id: 'restaurant',
    src: '/mockups/mockup-1-restaurant.webp',
    title: 'قصر الريم للمشويات',
    category: 'موقع وتطبيق مطعم ومشويات',
    domain: 'clickzoon.com/demo/restaurant',
    theme: {
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      ctaBg: 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-navy-950 shadow-amber-500/30',
      cardBorder: 'border-amber-500/25 bg-navy-900/90',
      iconBg: 'bg-amber-500/15 border border-amber-500/30',
    },
    header: {
      logoText: 'قصر الريم',
      logoSub: 'مشويات & مأكولات شرقية',
      statusBadge: 'مفتوح للطلب',
      icon: UtensilsCrossed,
    },
    hero: {
      badge: '🔥 وجبات طازجة ومنيو إلكتروني QR',
      headline: 'طعم المشويات الأصيل يوصلك سخن لحد باب بيتك',
      subheadline: 'أشهى المشويات الحلبية على الفحم بتتبيلة سرية وتوصيل حراري فائق السرعة.',
      ctaText: 'اطلب وجبتك الآن',
    },
    cards: [
      {
        title: 'صينية الريم الملكية',
        desc: 'كيلو كباب وكفتة مع ريش ضاني وأرز بسمتي ومقبلات حارة',
        meta: '٤٢٠ ج.م',
        tag: 'الأكثر طلباً',
        icon: Flame,
      },
      {
        title: 'توصيل حراري فائق السرعة',
        desc: 'تغليف ثلاثي محكم يحافظ على حرارة وطراوة المشويات خلال 35 دقيقة',
        meta: 'توصيل مجاني',
        tag: 'سريع',
        icon: Clock,
      },
      {
        title: 'حجز صالات VIP وعزائم',
        desc: 'صالات عائلية خاصة ومجهزة بأرقى مستوى خدمة وضيافة',
        meta: 'تأكيد فوري',
        tag: 'صالات فاخرة',
        icon: Star,
      },
    ],
  },
  {
    id: 'cafe',
    src: '/mockups/mockup-2-cafe.webp',
    title: 'روست كافيه & كوفي بار',
    category: 'كافيه وسبيشالتي كوفي',
    domain: 'clickzoon.com/demo/cafe',
    theme: {
      accentColor: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
      ctaBg: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-navy-950 shadow-yellow-500/30',
      cardBorder: 'border-yellow-500/25 bg-navy-900/90',
      iconBg: 'bg-yellow-500/15 border border-yellow-500/30',
    },
    header: {
      logoText: 'روست كافيه',
      logoSub: 'Specialty Coffee Bar',
      statusBadge: 'بن محمص اليوم',
      icon: Coffee,
    },
    hero: {
      badge: '☕ تجربة القهوة المختصة V60 & Flat White',
      headline: 'قهوتك الموزونة بمزاج عالي، محمصة بعناية يومياً',
      subheadline: 'محاصيل مختصة فردية المصدر وحلويات فرنسية طازجة في أجواء هادئة وراقية.',
      ctaText: 'استكشف قائمة المشروبات',
    },
    cards: [
      {
        title: 'بن سلفادور وكولومبيا V60',
        desc: 'إيحاءات فواكه استوائية وشوكولاتة بحموضة متوازنة ومذاق مخملي',
        meta: '٨٥ ج.م',
        tag: 'محصول مميز',
        icon: Coffee,
      },
      {
        title: 'كرواسون ومخبوزات فرنسية',
        desc: 'مخبوزات طازجة بالزبدة الطبيعية تُخبز يومياً في معملنا الخاص',
        meta: 'طازج صباحاً',
        tag: 'مخبوز اليوم',
        icon: Sparkles,
      },
      {
        title: 'اشتراك بوكس القهوة المنزلي',
        desc: 'محاصيل مختارة تصلك أسبوعياً مع بطاقات وصفات التحضير المنزلية',
        meta: 'شحن أسبوعي',
        tag: 'باقة توفير',
        icon: Star,
      },
    ],
  },
  {
    id: 'store',
    src: '/mockups/mockup-3-store.webp',
    title: 'متجر مودانيستا فاشون',
    category: 'متجر إلكتروني متكامل للأزياء',
    domain: 'clickzoon.com/demo/store',
    theme: {
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      ctaBg: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-navy-950 shadow-emerald-500/30',
      cardBorder: 'border-emerald-500/25 bg-navy-900/90',
      iconBg: 'bg-emerald-500/15 border border-emerald-500/30',
    },
    header: {
      logoText: 'مودانيستا',
      logoSub: 'Modern Fashion & Style',
      statusBadge: 'شحن فوري',
      icon: ShoppingBag,
    },
    hero: {
      badge: '✨ كولكشن الموسم الحصري أونلاين',
      headline: 'أحدث صيحات الموضة والأناقة بتصاميم راقية وخامات أصلية',
      subheadline: 'تسوقي أرقى الإطلالات العصرية مع استبدال مجاني وتوصيل سريع حتى باب المنزل.',
      ctaText: 'تسوقي الكولكشن الجديد',
    },
    cards: [
      {
        title: 'معطف صوف كشمير طويل',
        desc: 'قصة راقية بخامات شتوية دافئة وتطريز يدوي متقن بألوان الموسم',
        meta: '١,٢٥٠ ج.م',
        tag: 'تريند الأسبوع',
        icon: ShoppingBag,
      },
      {
        title: 'حقائب جلد طبيعي كلاسيك',
        desc: 'تصميم إيطالي أنيق متعدد الاستخدامات بضمان عام كامل',
        meta: '٦٨٠ ج.م',
        tag: 'خامة أصلية',
        icon: Sparkles,
      },
      {
        title: 'دفع عند الاستلام واستبدال',
        desc: 'معاينة كاملة قبل الاستلام وخيارات تقسيط مرنة بدون فوائد',
        meta: 'استبدال 14 يوم',
        tag: 'تسوق موثوق',
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: 'medical',
    src: '/mockups/mockup-4-medical.webp',
    title: 'مركز النور الطبي التخصصي',
    category: 'منصة حجز عيادات وخدمات طبية',
    domain: 'clickzoon.com/demo/clinic',
    theme: {
      accentColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      ctaBg: 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-navy-950 shadow-cyan-500/30',
      cardBorder: 'border-cyan-500/25 bg-navy-900/90',
      iconBg: 'bg-cyan-500/15 border border-cyan-500/30',
    },
    header: {
      logoText: 'مركز النور',
      logoSub: 'Medical Specialized Center',
      statusBadge: 'طوارئ 24/7',
      icon: HeartPulse,
    },
    hero: {
      badge: '🩺 نخبة الاستشاريين وأحدث الأجهزة',
      headline: 'صحتك وصحة عائلتك في أيدٍ أمينة برعاية طبية متكاملة',
      subheadline: 'حجز مواعيد فوري في أكثر من 18 تخصصاً طبياً مع تحاليل رقمية واستشارات معتمدة.',
      ctaText: 'احجز موعدك الطبي الآن',
    },
    cards: [
      {
        title: 'عيادة الباطنة والقلب',
        desc: 'فحص شامل وتخطيط قلب ومتابعة دورية مع كبار الأطباء الاستشاريين',
        meta: 'كشف ٣٥٠ ج.م',
        tag: 'متاح اليوم',
        icon: Stethoscope,
      },
      {
        title: 'معمل تحاليل وأشعة فورية',
        desc: 'أحدث أجهزة الفحص الرقمي والنتائج تصلك معتمدة عبر واتساب',
        meta: 'نتائج سريعة',
        tag: 'دقة معتمدة',
        icon: HeartPulse,
      },
      {
        title: 'استشارات طبية منزلية 24/7',
        desc: 'زيارات تمريضية وطبية منزلية للحالات الحرجة وكبار السن',
        meta: 'تغطية فورية',
        tag: 'خدمة مستمرة',
        icon: ShieldCheck,
      },
    ],
  },
];

function MobileScreenContent({
  slide,
  scale,
  shouldDrift,
}: {
  slide: DeliveredProject;
  scale: number;
  shouldDrift: boolean;
}) {
  const HeaderIcon = slide.header.icon;

  return (
    <div
      style={{
        width: 390,
        height: 845,
        transform: `scale(${scale})`,
        transformOrigin: 'top right',
      }}
      className="absolute top-0 right-0 flex flex-col font-cairo select-none"
      dir="rtl"
    >
      {/* Pinned Top Bar (Status bar + Mobile Header) */}
      <div className="shrink-0 z-30 bg-navy-950/95 backdrop-blur-md border-b border-navy-800/70 pt-2 pb-2.5">
        {/* Status Bar */}
        <div className="h-8 px-6 flex items-center justify-between text-navy-300 text-[14px] font-mono" dir="ltr">
          <span className="font-semibold text-navy-200">9:41</span>
          <div className="flex items-center gap-2 text-navy-300">
            <Signal size={14} />
            <Wifi size={14} />
            <div className="flex items-center gap-1">
              <span className="text-[12px]">100%</span>
              <Battery size={16} />
            </div>
          </div>
        </div>

        {/* Header (Logo + Hamburger) */}
        <div className="px-5 pt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${slide.theme.iconBg}`}>
              <HeaderIcon size={22} className={slide.theme.accentColor} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-[20px] text-navy-50 leading-tight">{slide.header.logoText}</span>
              </div>
              <span className="text-[12px] text-navy-300 font-medium block">{slide.header.logoSub}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-navy-800/90 border border-navy-700 text-gold-300 hidden sm:inline-block">
              {slide.header.statusBadge}
            </span>
            <div
              className="w-10 h-10 rounded-2xl bg-navy-800/90 border border-navy-700/80 flex items-center justify-center text-navy-200 shadow-sm"
              aria-label="قائمة الموبايل"
            >
              <Menu size={20} className="text-navy-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable / Driftable Content */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          animate={shouldDrift ? { y: [0, -85, 0] } : { y: 0 }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="px-5 pt-3.5 pb-12 space-y-3.5"
        >
          {/* Badge */}
          <div>
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[15px] font-bold border shadow-xs ${slide.theme.badgeBg}`}
            >
              {slide.hero.badge}
            </span>
          </div>

          {/* Headline */}
          <h3
            className="text-[33px] font-black text-navy-50 leading-[1.25] tracking-tight break-words"
            style={{ overflowWrap: 'anywhere', textWrap: 'balance' }}
          >
            {slide.hero.headline}
          </h3>

          {/* Subheadline / Description */}
          <p className="text-[20px] text-navy-200 leading-[1.4] line-clamp-2 font-normal">
            {slide.hero.subheadline}
          </p>

          {/* Wide CTA Button */}
          <div>
            <div
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-[19px] flex items-center justify-between shadow-xl ${slide.theme.ctaBg}`}
            >
              <span>{slide.hero.ctaText}</span>
              <div className="w-8 h-8 rounded-xl bg-navy-950/20 flex items-center justify-center">
                <ArrowLeft size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Vertical Cards */}
          <div className="space-y-3 pt-1">
            {slide.cards.map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${slide.theme.cardBorder} bg-navy-900/90 backdrop-blur-md shadow-md`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${slide.theme.iconBg}`}>
                        <CardIcon size={20} className={slide.theme.accentColor} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[19px] text-navy-50 leading-tight">{card.title}</h4>
                        <span className={`text-[14px] font-semibold ${slide.theme.accentColor}`}>{card.meta}</span>
                      </div>
                    </div>
                    {card.tag && (
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-navy-800/90 border border-navy-700 text-gold-300 shrink-0">
                        {card.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] text-navy-300 mt-2 leading-snug">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MobilePhoneMockup({
  projects,
  currentIndex,
  isPlaying,
  isHovered,
  prefersReduced,
}: {
  projects: DeliveredProject[];
  currentIndex: number;
  isPlaying: boolean;
  isHovered: boolean;
  prefersReduced: boolean;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.62);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const update = () => {
      if (el.clientWidth > 0) {
        setScale(el.clientWidth / 390);
      }
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <motion.div
      animate={prefersReduced ? {} : { y: [4, -4, 4] }}
      transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
      className="shrink-0"
    >
      {/* Phone chassis with titanium edge, rounded corners and 9:19.5 aspect ratio */}
      <div className="relative bg-gradient-to-b from-[#1e2738] via-[#0f172a] to-[#0a0f1d] rounded-[3rem] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(234,179,8,0.08)] border-2 border-navy-700/60 w-[240px] sm:w-[260px] md:w-[270px] select-none">
        {/* Dynamic Island Notch */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md shadow-black/80 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-navy-800/80 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-blue-500/60" />
          </span>
          <span className="w-8 h-1 rounded-full bg-[#1f293d]" />
        </div>

        {/* Home indicator bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/25 z-40 pointer-events-none" />

        {/* Inner Screen */}
        <div
          ref={screenRef}
          className="relative rounded-[2.3rem] overflow-hidden bg-navy-950 aspect-[9/19.5] w-full border border-navy-800/80 shadow-inner"
          dir="rtl"
        >
          {projects.map((proj, i) => (
            <div
              key={proj.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <MobileScreenContent
                slide={proj}
                scale={scale}
                shouldDrift={isPlaying && !isHovered && !prefersReduced && i === currentIndex}
              />
            </div>
          ))}

          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-navy-950 via-navy-950/80 to-transparent z-20 pointer-events-none" />
        </div>
      </div>

      {/* Phone label */}
      <div className="flex items-center justify-center gap-1.5 mt-3 text-navy-300 text-sm">
        <Smartphone size={14} className="text-gold-400" />
        <span>عرض الموبايل المتجاوب</span>
      </div>
    </motion.div>
  );
}

export default function MockupsSection() {
  const { ref, revealed } = useReveal();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % deliveredProjects.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + deliveredProjects.length) % deliveredProjects.length);
  }, []);

  // Autoplay with pause on hover/focus/touch and reduced motion respect
  useEffect(() => {
    if (!isPlaying || isHovered || prefersReduced) return;
    const timer = setInterval(next, 4800);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, prefersReduced, next]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsHovered(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 40) {
      next();
    } else if (diff < -40) {
      prev();
    }
    touchStartXRef.current = null;
  };

  return (
    <section id="mockups" className="py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={Monitor}
          badge="نماذج تصميم تفاعلية"
          title="معاينة حية لشاشات موقعك"
          highlight="على الموبايل والكمبيوتر"
          subtitle="نماذج تصميم توضيحية تحاكي تجربة التصفح الفعلية وسرعة الاستجابة لمختلف الأنشطة التجارية."
        />

        <div
          ref={ref}
          className={`reveal ${revealed ? 'revealed' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            {/* Prev Button (RTL aware) */}
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
              aria-label="المشروع السابق"
              title="السابق"
            >
              <ChevronRight size={20} />
            </button>

            {/* Pagination Dots with ≥ 44x44px clickable target wrapper */}
            <div className="flex items-center gap-1.5 px-2" role="tablist" aria-label="شرائح المشاريع">
              {deliveredProjects.map((proj, i) => (
                <button
                  key={proj.domain}
                  role="tab"
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                  className="p-3 focus:outline-none"
                  aria-label={`عرض مشروع ${proj.title}`}
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      i === index ? 'w-8 bg-gold-500 shadow-md shadow-gold-500/30' : 'w-2.5 bg-navy-600 hover:bg-navy-500'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all"
              aria-label="المشروع التالي"
              title="التالي"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Play/Pause Button for WCAG 2.2.2 */}
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-11 h-11 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-600/40 text-navy-200 hover:text-gold-400 flex items-center justify-center transition-all mr-2"
              aria-label={isPlaying ? 'إيقاف التمرير التلقائي مؤقتاً' : 'تشغيل التمرير التلقائي'}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          {/* Current project info pill */}
          <div className="text-center mb-8 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-block px-4 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 text-gold-300 text-sm font-bold shadow-sm">
              {deliveredProjects[index].title} — <span className="text-navy-300 font-normal">{deliveredProjects[index].category}</span>
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-semibold">
              نموذج تصميم توضيحي
            </span>
          </div>

          {/* Mockups display with subtle floating animation */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-8">
            {/* Laptop frame */}
            <motion.div
              animate={prefersReduced ? {} : { y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                {/* Screen bezel */}
                <div className="bg-navy-950 rounded-t-2xl border-2 border-navy-600/50 border-b-0 p-3 shadow-2xl">
                  <div className="relative rounded-lg overflow-hidden bg-navy-900 aspect-[16/9]">
                    {/* Browser address bar */}
                    <div className="absolute top-0 right-0 left-0 h-8 bg-navy-950/90 backdrop-blur-sm flex items-center gap-2 px-3 z-20 border-b border-navy-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex items-center gap-1.5 bg-navy-900/80 border border-navy-700/50 rounded-md px-2.5 py-0.5 text-xs text-navy-300 font-mono flex-1 max-w-xs" dir="ltr">
                        <Lock size={10} className="text-green-400 shrink-0" />
                        <span className="truncate">https://{deliveredProjects[index].domain}</span>
                      </div>
                    </div>

                    {/* True cross-fade images without remounting flash */}
                    <div className="absolute inset-0 pt-8">
                      {deliveredProjects.map((proj, i) => (
                        <img
                          key={proj.src}
                          src={proj.src}
                          alt={`تصميم ${proj.title} على شاشة كمبيوتر`}
                          width={800}
                          height={450}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                          decoding="async"
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Laptop base */}
                <div className="bg-navy-700/70 rounded-b-2xl border-2 border-navy-600/50 border-t-0 h-3.5 w-full shadow-lg" />
                <div className="bg-navy-600/50 h-1.5 w-1/3 mx-auto rounded-b-lg" />
              </div>

              {/* Laptop label */}
              <div className="flex items-center justify-center gap-1.5 mt-3 text-navy-300 text-sm">
                <Monitor size={14} className="text-gold-400" />
                <span>عرض الديسكتوب واللابتوب</span>
              </div>
            </motion.div>

            {/* Dedicated Native Mobile Phone Mockup */}
            <MobilePhoneMockup
              projects={deliveredProjects}
              currentIndex={index}
              isPlaying={isPlaying}
              isHovered={isHovered}
              prefersReduced={prefersReduced}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
