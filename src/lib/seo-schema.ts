import { SITE_URL } from '@/siteConfig';
import arJson from '@/i18n/ar.json';

export interface SchemaQuestion {
  q: string;
  a: string;
}

export function getFaqSchemaItems(): SchemaQuestion[] {
  return [
    { q: arJson.faq.q1, a: arJson.faq.a1 },
    { q: arJson.faq.q2, a: arJson.faq.a2 },
    { q: arJson.faq.q3, a: arJson.faq.a3 },
    { q: arJson.faq.q4, a: arJson.faq.a4 },
    { q: arJson.faq.q5, a: arJson.faq.a5 },
    { q: arJson.faq.q6, a: arJson.faq.a6 },
  ];
}

export function generateMainJsonLd(siteUrl: string = SITE_URL) {
  const org = {
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#organization`,
    name: 'Click Zoon',
    alternateName: 'كليك زون لتصميم المواقع',
    url: `${siteUrl}/`,
    logo: `${siteUrl}/og-image.webp`,
    image: `${siteUrl}/og-image.webp`,
    description:
      'وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التجارية في المنصورة، الدقهلية، وجميع أنحاء مصر. خدمة عملاء أونلاين ودعم فني مستمر.',
    telephone: '+201020095059',
    email: 'clickzoon30@gmail.com',
    priceRange: '$$',
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'المنصورة',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'الدقهلية',
      },
      {
        '@type': 'Country',
        name: 'مصر',
      },
    ],
    sameAs: [
      'https://www.facebook.com/ClikZoon',
      'https://www.instagram.com/click_zoon',
    ],
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: 'Click Zoon',
    alternateName: 'كليك زون',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    inLanguage: ['ar', 'en'],
  };

  const faqItems = getFaqSchemaItems();
  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${siteUrl}/#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [org, website, faqPage],
  };
}
