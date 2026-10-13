export interface AboutStat {
  value: number;
  suffix: string;
  label: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_name_ar: string;
  logo_text: string;
  phone: string;
  phone_intl: string;
  email: string;
  location: string;
  facebook: string;
  instagram: string;
  footer_text: string;
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
  promo_bar_text: string;
  demo_min_hours: number;
  demo_max_hours: number;
  show_prices: boolean;
  about_title: string;
  about_text: string;
  about_image_url: string;
  about_stats: AboutStat[];
  map_embed_url: string;
  google_analytics_id: string;
}

export interface HeroContent {
  id: number;
  badge_text: string;
  headline_line1: string;
  rotating_words: string[];
  headline_line2: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  link: string | null;
  visible: boolean;
  sort_order: number;
}

export interface ProcessStep {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlighted: boolean;
  visible: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface SectionVisibility {
  id: string;
  label: string;
  visible: boolean;
}

export interface DemoRequest {
  id: string;
  name: string;
  phone: string;
  business_type: string;
  page_url: string | null;
  created_at: string;
  user_id: string | null;
  status: string;
  message_text: string | null;
  source: string;
}

export interface SiteData {
  settings: SiteSettings | null;
  hero: HeroContent | null;
  features: Feature[];
  services: Service[];
  portfolio: PortfolioItem[];
  processSteps: ProcessStep[];
  pricingPlans: PricingPlan[];
  faqs: Faq[];
  sectionVisibility: SectionVisibility[];
}
