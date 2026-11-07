import { useMemo } from 'react';
import { useSiteData } from '@/lib/site-data-context';
import { PortfolioItem } from '@/lib/types';

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
export const fallback: ShowcaseItem[] = [
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

export function normalizeItem(p: PortfolioItem, index: number): ShowcaseItem {
  return {
    ...p,
    slug: p.slug || `project-${p.id || index}`,
    kind: (p.kind as ShowcaseKind) ?? 'website',
    tagline: p.tagline ?? '',
    long_description: p.long_description || p.description,
    features: p.features ?? [],
    screenshots: p.screenshots && p.screenshots.length > 0 ? p.screenshots : [p.image_url],
  };
}

export function useShowcaseItems(): {
  items: ShowcaseItem[];
  isSample: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { data, loading, error, refresh } = useSiteData();

  const computed = useMemo(() => {
    const real = (data.portfolio ?? []).filter((p) => p.visible !== false);
    if (real.length > 0) {
      return { items: real.map(normalizeItem), isSample: false };
    }
    return { items: fallback, isSample: true };
  }, [data.portfolio]);

  return {
    ...computed,
    loading,
    error: error ?? null,
    refresh,
  };
}
