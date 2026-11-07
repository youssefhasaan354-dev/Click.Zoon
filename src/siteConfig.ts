import { useSiteData } from '@/lib/site-data-context';
import { SiteSettings, HeroContent, AboutStat } from '@/lib/types';

// ============================================================
// محتوى الموقع — القيم الافتراضية
// يتم استخدامها ك fallback في حال عدم تحميل البيانات من قاعدة البيانات
// ============================================================

export const SITE_URL = 'https://clickzoon.com';
export const SITE_DOMAIN = 'clickzoon.com';

export const siteConfig = {
  siteUrl: SITE_URL,
  siteDomain: SITE_DOMAIN,
  agencyName: 'Click Zoon',
  agencyNameAr: 'كليك زون',
  phone: '01020095059',
  phoneIntl: '201020095059',
  email: 'clickzoon30@gmail.com',
  location: 'خدمة عملاء أونلاين',
  facebook: 'https://www.facebook.com/ClikZoon',
  instagram: 'https://www.instagram.com/click_zoon',
  logoText: 'CZ',
  footerText: 'وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التجارية. نبني لك حضوراً رقمياً يُميّز نشاطك.',
  promoBarText: 'نبني لك ديمو لموقع نشاطك مجاناً — بدون التزام',
  seoTitle: 'Click Zoon — تصميم وتطوير المواقع والمتاجر الإلكترونية',
  seoDescription: 'نُصمّم ونطوّر مواقع ومتاجر إلكترونية احترافية لكل الأنشطة التجارية — بداية مجانية بدون التزام، وتسليم سريع بدعم مستمر.',
  seoOgImage: '/og-image.png',

  whatsappMessages: {
    general: 'السلام عليكم، عايز أعرف تفاصيل عن عمل موقع لنشاطي',
    demo: 'السلام عليكم، عايز أطلب ديمو مجاني لموقع نشاطي',
    pricing: 'السلام عليكم، عايز أعرف تفاصيل أسعار باقة',
    contact: 'السلام عليكم، عندي استفسار عن خدماتكم',
  },

  trustBadges: [
    { icon: 'Gift', title: 'ديمو مجاني', subtitle: 'بدون التزام' },
    { icon: 'Zap', title: 'تسليم سريع', subtitle: 'من 3 أيام إلى أسبوع' },
    { icon: 'Headphones', title: 'دعم مستمر', subtitle: 'بعد الإطلاق' },
  ],

  pricingPlans: [
    {
      name: 'أساسية',
      tagline: 'مناسبة للأنشطة الصغيرة',
      features: ['موقع من صفحة واحدة', 'تصميم متجاوب مع الموبايل', 'ربط واتساب واتصال مباشر', 'تحسين أساسي لمحركات البحث', 'دومين واستضافة لسنة'],
      highlighted: false,
      price: '',
    },
    {
      name: 'احترافية',
      tagline: 'الأكثر طلباً',
      features: ['موقع متعدد الصفحات', 'تصميم مخصص بالكامل لهويتك', 'معرض صور + آراء العملاء', 'تحسين متقدم لمحركات البحث (SEO)', 'ربط Google Maps', 'دومين واستضافة لسنة', 'دعم فني لمدة 3 أشهر'],
      highlighted: true,
      price: '',
    },
    {
      name: 'متجر إلكتروني',
      tagline: 'ابدأ تبيع أونلاين',
      features: ['متجر إلكتروني متكامل', 'إدارة منتجات وطلبات', 'ربط طرق الدفع الإلكتروني', 'ربط خدمات التوصيل', 'لوحة تحكم لإدارة المتجر', 'دومين واستضافة لسنة', 'دعم فني لمدة شهر'],
      highlighted: false,
      price: '',
    },
  ],

  counters: [] as AboutStat[],
  showReviews: false,
  reviews: [] as Array<{ name: string; business: string; text: string; rating: number }>,
  showPrices: false,
  demoMinHours: 24,
  demoMaxHours: 72,
};

// --- Live config hook (merges DB data with defaults) ---
export function useSiteConfig() {
  const { data } = useSiteData();
  const s: SiteSettings | null = data.settings;

  return {
    ...siteConfig,
    agencyName: s?.site_name ?? siteConfig.agencyName,
    agencyNameAr: s?.site_name_ar ?? siteConfig.agencyNameAr,
    phone: s?.phone ?? siteConfig.phone,
    phoneIntl: s?.phone_intl ?? siteConfig.phoneIntl,
    email: s?.email ?? siteConfig.email,
    location: s?.location ?? siteConfig.location,
    facebook: s?.facebook ?? siteConfig.facebook,
    instagram: s?.instagram ?? siteConfig.instagram,
    logoText: s?.logo_text ?? siteConfig.logoText,
    footerText: s?.footer_text ?? siteConfig.footerText,
    promoBarText: s?.promo_bar_text ?? siteConfig.promoBarText,
    seoTitle: s?.seo_title ?? siteConfig.seoTitle,
    seoDescription: s?.seo_description ?? siteConfig.seoDescription,
    seoOgImage: s?.seo_og_image ?? siteConfig.seoOgImage,
    showPrices: s?.show_prices ?? siteConfig.showPrices,
    demoMinHours: s?.demo_min_hours ?? siteConfig.demoMinHours,
    demoMaxHours: s?.demo_max_hours ?? siteConfig.demoMaxHours,
    aboutTitle: s?.about_title ?? 'من نحن',
    aboutText: s?.about_text ?? '',
    aboutImageUrl: s?.about_image_url ?? '',
    aboutStats: s?.about_stats ?? [],
    mapEmbedUrl: s?.map_embed_url ?? '',
    googleAnalyticsId:
      s?.google_analytics_id ||
      (import.meta.env.VITE_GA_MEASUREMENT_ID as string) ||
      (import.meta.env.VITE_GA_ID as string) ||
      '',
  };
}

export function useHeroContent(): HeroContent | null {
  const { data } = useSiteData();
  return data.hero;
}

// --- Helper URLs (use defaults) ---
export const waLink = (msg?: string) =>
  `https://wa.me/${siteConfig.phoneIntl}?text=${encodeURIComponent(msg || siteConfig.whatsappMessages.general)}`;

export const waLinkIntl = (phoneIntl: string, msg?: string) =>
  `https://wa.me/${phoneIntl}?text=${encodeURIComponent(msg || siteConfig.whatsappMessages.general)}`;

export const telLink = `tel:${siteConfig.phone}`;
export const mailLink = `mailto:${siteConfig.email}`;
