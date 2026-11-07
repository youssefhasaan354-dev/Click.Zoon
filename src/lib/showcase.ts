import { useMemo } from 'react';
import { useSiteData } from '@/lib/site-data-context';
import { PortfolioItem } from '@/lib/types';
import { useI18n } from '@/i18n';

export type ShowcaseKind = 'website' | 'app' | 'store';

export interface ShowcaseItem extends PortfolioItem {
  slug: string;
  kind: ShowcaseKind;
  tagline: string;
  long_description: string;
  features: string[];
  screenshots: string[];
}

export const kindLabels: Record<ShowcaseKind, string> = {
  website: 'موقع',
  app: 'برنامج',
  store: 'متجر إلكتروني',
};

export const categoryLabels: Record<string, string> = {
  restaurants: 'مطاعم',
  cafes: 'كافيهات',
  stores: 'متاجر',
  medical: 'طبي',
  business: 'شركات وخدمات',
};

/** Fallback sample designs shown only until real projects are added from the admin panel. */
const fallback: ShowcaseItem[] = [
  {
    id: 'sample-1',
    slug: 'sample-restaurant',
    title: 'موقع مطعم',
    tagline: 'منيو إلكتروني وطلب عبر واتساب',
    category: 'restaurants',
    kind: 'website',
    description: 'نموذج تصميم لمطعم مع منيو إلكتروني وحجز طاولات.',
    long_description:
      'نموذج تصميم جاهز لمطعم: منيو إلكتروني سهل التعديل، طلب مباشر عبر واتساب، حجز طاولات وخريطة الموقع.',
    features: ['منيو إلكتروني QR', 'طلب مباشر عبر واتساب', 'حجز طاولات', 'متوافق مع الموبايل'],
    image_url: '/mockups/mockup-1-restaurant.webp',
    screenshots: ['/mockups/mockup-1-restaurant.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 1,
  },
  {
    id: 'sample-2',
    slug: 'sample-cafe',
    title: 'موقع كافيه',
    tagline: 'هوية دافئة ومنيو تفاعلي',
    category: 'cafes',
    kind: 'website',
    description: 'نموذج تصميم لكافيه بمنيو تفاعلي وصور جذابة.',
    long_description: 'نموذج تصميم لكافيه بصور جذابة ومنيو تفاعلي وربط مباشر مع السوشيال ميديا.',
    features: ['منيو تفاعلي', 'معرض صور', 'ربط السوشيال ميديا', 'سرعة تحميل عالية'],
    image_url: '/mockups/mockup-2-cafe.webp',
    screenshots: ['/mockups/mockup-2-cafe.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 2,
  },
  {
    id: 'sample-3',
    slug: 'sample-store',
    title: 'متجر إلكتروني',
    tagline: 'بيع أونلاين بدفع وشحن',
    category: 'stores',
    kind: 'store',
    description: 'نموذج متجر إلكتروني مع سلة مشتريات وربط الدفع والشحن.',
    long_description: 'نموذج متجر إلكتروني متكامل: إدارة المنتجات والطلبات، سلة مشتريات، ربط الدفع والشحن.',
    features: ['سلة مشتريات', 'إدارة المنتجات والطلبات', 'ربط الدفع الإلكتروني', 'ربط شركات الشحن'],
    image_url: '/mockups/mockup-3-store.webp',
    screenshots: ['/mockups/mockup-3-store.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 3,
  },
  {
    id: 'sample-4',
    slug: 'sample-clinic',
    title: 'موقع عيادة',
    tagline: 'حجز مواعيد وجداول الأطباء',
    category: 'medical',
    kind: 'website',
    description: 'نموذج موقع طبي بحجز مواعيد وتأكيد عبر واتساب.',
    long_description: 'نموذج موقع طبي: عرض الأطباء والتخصصات، حجز مواعيد، وتأكيد الحجز عبر واتساب.',
    features: ['حجز مواعيد', 'ملفات الأطباء', 'تأكيد عبر واتساب', 'SEO محلي'],
    image_url: '/mockups/mockup-4-medical.webp',
    screenshots: ['/mockups/mockup-4-medical.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 4,
  },
];

const fallbackEn: ShowcaseItem[] = [
  {
    id: 'sample-1',
    slug: 'sample-restaurant',
    title: 'Restaurant Website',
    tagline: 'Digital Menu & Instant WhatsApp Ordering',
    category: 'restaurants',
    kind: 'website',
    description: 'Modern prototype for restaurants with QR menu and table booking.',
    long_description:
      'Ready-to-deploy restaurant website prototype: easy-to-update QR menu, direct WhatsApp order routing, table booking, and location map.',
    features: ['QR Digital Menu', 'Direct WhatsApp Ordering', 'Table Booking', 'Mobile-First Responsive'],
    image_url: '/mockups/mockup-1-restaurant.webp',
    screenshots: ['/mockups/mockup-1-restaurant.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 1,
  },
  {
    id: 'sample-2',
    slug: 'sample-cafe',
    title: 'Cafe & Bistro Website',
    tagline: 'Warm Aesthetic & Interactive Experience',
    category: 'cafes',
    kind: 'website',
    description: 'Warm cafe showcase with interactive menu and rich visuals.',
    long_description: 'Engaging cafe website with beautiful imagery, interactive menu categories, and direct social media integrations.',
    features: ['Interactive Menu', 'Visual Gallery', 'Social Media Sync', 'Lightning Fast Speed'],
    image_url: '/mockups/mockup-2-cafe.webp',
    screenshots: ['/mockups/mockup-2-cafe.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 2,
  },
  {
    id: 'sample-3',
    slug: 'sample-store',
    title: 'E-Commerce Store',
    tagline: 'Sell Online with Checkout & Shipping',
    category: 'stores',
    kind: 'store',
    description: 'E-commerce platform prototype with shopping cart and automated checkout.',
    long_description: 'Complete e-commerce store: product catalog, shopping cart, online payment gateways, and automated shipping partner tracking.',
    features: ['Shopping Cart', 'Catalog Management', 'Payment Gateways', 'Shipping Tracking'],
    image_url: '/mockups/mockup-3-store.webp',
    screenshots: ['/mockups/mockup-3-store.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 3,
  },
  {
    id: 'sample-4',
    slug: 'sample-clinic',
    title: 'Medical Clinic Website',
    tagline: 'Doctor Schedules & Smart Booking',
    category: 'medical',
    kind: 'website',
    description: 'Medical clinic website with doctor profiles and WhatsApp appointment confirmation.',
    long_description: 'Specialty clinic website: doctor directory, specialty listings, online appointments, and WhatsApp notifications.',
    features: ['Online Appointments', 'Doctor Profiles', 'WhatsApp Confirmation', 'Local SEO Optimized'],
    image_url: '/mockups/mockup-4-medical.webp',
    screenshots: ['/mockups/mockup-4-medical.webp'],
    link: null,
    live_url: null,
    visible: true,
    sort_order: 4,
  },
];

export function normalizeItem(p: PortfolioItem, index: number): ShowcaseItem {
  return {
    ...p,
    slug: p.slug || `project-${p.id || index}`,
    kind: p.kind ?? 'website',
    tagline: p.tagline ?? '',
    long_description: p.long_description || p.description,
    features: p.features ?? [],
    screenshots: p.screenshots && p.screenshots.length > 0 ? p.screenshots : [p.image_url],
  };
}

export function useShowcaseItems(): { items: ShowcaseItem[]; isSample: boolean } {
  const { data } = useSiteData();
  const { language } = useI18n();
  return useMemo(() => {
    if (language === 'en') {
      return { items: fallbackEn, isSample: true };
    }
    const real = (data.portfolio ?? []).filter((p) => p.visible !== false);
    if (real.length > 0) {
      return { items: real.map(normalizeItem), isSample: false };
    }
    return { items: fallback, isSample: true };
  }, [data.portfolio, language]);
}
