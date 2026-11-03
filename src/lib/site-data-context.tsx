import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  SiteData,
  SiteSettings,
  HeroContent,
  Feature,
  Service,
  PortfolioItem,
  ProcessStep,
  PricingPlan,
  Faq,
  Testimonial,
  SectionVisibility,
} from '@/lib/types';

interface SiteDataContextValue {
  data: SiteData;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CACHE_KEY = 'cz_site_data_cache_v1';

const emptyData: SiteData = {
  settings: null,
  hero: null,
  features: [],
  services: [],
  portfolio: [],
  processSteps: [],
  pricingPlans: [],
  faqs: [],
  testimonials: [],
  sectionVisibility: [],
};

function getInitialCachedData(): { initialData: SiteData; hasCache: boolean } {
  if (typeof window === 'undefined') {
    return { initialData: emptyData, hasCache: false };
  }
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteData>;
      if (parsed && typeof parsed === 'object') {
        return {
          initialData: {
            settings: parsed.settings ?? null,
            hero: parsed.hero ?? null,
            features: parsed.features ?? [],
            services: parsed.services ?? [],
            portfolio: parsed.portfolio ?? [],
            processSteps: parsed.processSteps ?? [],
            pricingPlans: parsed.pricingPlans ?? [],
            faqs: parsed.faqs ?? [],
            testimonials: parsed.testimonials ?? [],
            sectionVisibility: parsed.sectionVisibility ?? [],
          },
          hasCache: true,
        };
      }
    }
  } catch {
    // ignore parse errors
  }
  return { initialData: emptyData, hasCache: false };
}

const SiteDataContext = createContext<SiteDataContextValue | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(() => getInitialCachedData().initialData);
  const [loading, setLoading] = useState<boolean>(() => !getInitialCachedData().hasCache);

  const refresh = useCallback(async () => {
    try {
      const [
        settingsRes,
        heroRes,
        featuresRes,
        servicesRes,
        portfolioRes,
        processRes,
        pricingRes,
        faqsRes,
        testimonialsRes,
        sectionsRes,
      ] = await Promise.allSettled([
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('hero_content').select('*').eq('id', 1).maybeSingle(),
        supabase.from('features').select('*').order('sort_order'),
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('portfolio_items').select('*').eq('visible', true).order('sort_order'),
        supabase.from('process_steps').select('*').order('sort_order'),
        supabase.from('pricing_plans').select('*').eq('visible', true).order('sort_order'),
        supabase.from('faqs').select('*').order('sort_order'),
        supabase.from('testimonials').select('*').eq('visible', true).order('sort_order'),
        supabase.from('section_visibility').select('*'),
      ]);

      const unwrap = <T,>(r: PromiseSettledResult<{ data: T | null }>): T | null =>
        r.status === 'fulfilled' ? r.value.data : null;

      const nextData: SiteData = {
        settings: unwrap<SiteSettings>(settingsRes as PromiseSettledResult<{ data: SiteSettings | null }>),
        hero: unwrap<HeroContent>(heroRes as PromiseSettledResult<{ data: HeroContent | null }>),
        features: (unwrap<Feature[]>(featuresRes as PromiseSettledResult<{ data: Feature[] | null }>)) ?? [],
        services: (unwrap<Service[]>(servicesRes as PromiseSettledResult<{ data: Service[] | null }>)) ?? [],
        portfolio: (unwrap<PortfolioItem[]>(portfolioRes as PromiseSettledResult<{ data: PortfolioItem[] | null }>)) ?? [],
        processSteps: (unwrap<ProcessStep[]>(processRes as PromiseSettledResult<{ data: ProcessStep[] | null }>)) ?? [],
        pricingPlans: (unwrap<PricingPlan[]>(pricingRes as PromiseSettledResult<{ data: PricingPlan[] | null }>)) ?? [],
        faqs: (unwrap<Faq[]>(faqsRes as PromiseSettledResult<{ data: Faq[] | null }>)) ?? [],
        testimonials: (unwrap<Testimonial[]>(testimonialsRes as PromiseSettledResult<{ data: Testimonial[] | null }>)) ?? [],
        sectionVisibility: (unwrap<SectionVisibility[]>(sectionsRes as PromiseSettledResult<{ data: SectionVisibility[] | null }>)) ?? [],
      };

      setData(nextData);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(nextData));
      } catch {
        // ignore storage quota errors
      }
    } catch (err) {
      console.warn('Failed to refresh site data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteDataContext.Provider value={{ data, loading, refresh }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider');
  return ctx;
}

export function useSectionVisibility(sectionId: string): boolean {
  const { data } = useSiteData();
  const section = data.sectionVisibility.find((s) => s.id === sectionId);
  return section ? section.visible : true;
}

export function useTestimonials(): Testimonial[] {
  const { data } = useSiteData();
  return data.testimonials;
}
