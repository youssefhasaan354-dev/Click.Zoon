import { useEffect } from 'react';
import { SITE_URL } from '@/siteConfig';
import { useI18n } from '@/i18n';

export interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = 'Click Zoon | تصميم وتطوير المواقع والمتاجر الإلكترونية';
const DEFAULT_DESC =
  'وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التجارية في المنصورة والدقهلية وكل مصر. ديمو مجاني بدون التزام، تسليم سريع، ودعم فني مستمر.';
const BASE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || SITE_URL).replace(/\/+$/, '');
const DEFAULT_IMAGE = `${BASE_URL}/og-image.webp`;

export default function Seo({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  const { t } = useI18n();
  const effectiveTitle = title ? `${title} | Click Zoon` : (t('seo.default_title') || DEFAULT_TITLE);
  const effectiveDesc = description || (t('seo.default_description') || DEFAULT_DESC);
  useEffect(() => {
    // 1. Page title
    const fullTitle = effectiveTitle;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (nameAttr: 'name' | 'property', nameVal: string, contentVal: string) => {
      let meta = document.querySelector(`meta[${nameAttr}="${nameVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(nameAttr, nameVal);
        document.head.appendChild(meta);
      }
      meta.content = contentVal;
    };

    // 2. Meta description & robots
    setMeta('name', 'description', effectiveDesc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', effectiveDesc);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:image', ogImage);
    const currentUrl = canonical ? `${BASE_URL}${canonical}` : window.location.href;
    setMeta('property', 'og:url', currentUrl);

    // 4. Twitter Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', effectiveDesc);
    setMeta('name', 'twitter:image', ogImage);

    // 5. Canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.href = `${BASE_URL}${canonical}`;
    }

    // 6. Optional JSON-LD Structured Data
    let scriptTag: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [effectiveTitle, effectiveDesc, canonical, ogImage, ogType, noindex, jsonLd]);

  return null;
}
