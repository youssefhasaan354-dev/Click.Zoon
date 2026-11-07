import { useEffect, useMemo, lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SocialProofStrip from '@/components/SocialProofStrip';
import ClientLogosMarquee from '@/components/ClientLogosMarquee';
import ScrollProgress from '@/components/ScrollProgress';
import MobileBottomBar from '@/components/MobileBottomBar';
import Seo from '@/components/Seo';
import { useLocation } from 'react-router-dom';
import { useSectionVisibility, useSiteData } from '@/lib/site-data-context';

// Lazy-load below-the-fold sections to boost initial load & mobile LCP/TBT
const MockupsSection = lazy(() => import('@/components/MockupsSection'));
const BeforeAfterSlider = lazy(() => import('@/components/BeforeAfterSlider'));
const DemoSection = lazy(() => import('@/components/DemoSection'));
const QuoteWizard = lazy(() => import('@/components/QuoteWizard'));
const Services = lazy(() => import('@/components/Services'));
const CommissionCalculator = lazy(() => import('@/components/CommissionCalculator'));
const AboutUs = lazy(() => import('@/components/AboutUs'));
const WhyUs = lazy(() => import('@/components/WhyUs'));
const Portfolio = lazy(() => import('@/components/Portfolio'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
const Process = lazy(() => import('@/components/Process'));
const Pricing = lazy(() => import('@/components/Pricing'));
const FAQ = lazy(() => import('@/components/FAQ'));
const Contact = lazy(() => import('@/components/Contact'));
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
const StickyMiniCta = lazy(() => import('@/components/StickyMiniCta'));
const CookieConsent = lazy(() => import('@/components/CookieConsent'));
const ExitIntentModal = lazy(() => import('@/components/ExitIntentModal'));
const BackToTop = lazy(() => import('@/components/BackToTop'));

function SectionSuspense({
  id,
  children,
  minHeight = 'min-h-[220px]',
}: {
  id?: string;
  children: React.ReactNode;
  minHeight?: string;
}) {
  return (
    <Suspense
      fallback={
        id ? (
          <div id={id} className={`w-full ${minHeight} flex items-center justify-center opacity-0 pointer-events-none`} aria-hidden="true" />
        ) : null
      }
    >
      {children}
    </Suspense>
  );
}

export function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      if (pathname !== '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const id = hash.replace(/^#/, '');
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      const timer = setTimeout(tryScroll, 160);
      return () => clearTimeout(timer);
    }
  }, [hash, pathname]);

  return null;
}

const defaultFaqs = [
  { question: 'كم مدة تجهيز الديمو المجاني؟', answer: 'الديمو بيتجهز خلال 24 إلى 72 ساعة من وقت طلبك على أساس نشاطك قبل ما تدفع أي حاجة.' },
  { question: 'كم مدة التسليم النهائي للموقع؟', answer: 'التسليم النهائي من 3 أيام إلى أسبوع حسب متطلبات المشروع.' },
  { question: 'هل في أي التزام قبل ما أشوف الديمو؟', answer: 'لا، بدون أي التزام. الديمو مجاني بالكامل — تتطمن عليه، ولو عجبك نكمّل.' },
  { question: 'من يملك الدومين والاستضافة؟', answer: 'أنت بتملك الدومين والاستضافة باسمك بالكامل وجميع بيانات الدخول بتتسلم لك.' },
];

export default function HomePage() {
  const { data } = useSiteData();
  const showMockups = useSectionVisibility('mockups');
  const showDemo = useSectionVisibility('demo');
  const showServices = useSectionVisibility('services');
  const showCalculator = useSectionVisibility('calculator');
  const showAbout = useSectionVisibility('about');
  const showWhyUs = useSectionVisibility('why-us');
  const showPortfolio = useSectionVisibility('portfolio');
  const showProcess = useSectionVisibility('process');
  const showPricing = useSectionVisibility('pricing');
  const showFaq = useSectionVisibility('faq');
  const showContact = useSectionVisibility('contact');

  const faqsForSchema = useMemo(() => {
    return data.faqs && data.faqs.length > 0 ? data.faqs : defaultFaqs;
  }, [data.faqs]);

  const jsonLd = useMemo(() => {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqsForSchema.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ];
  }, [faqsForSchema]);

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <Seo canonical="/" jsonLd={jsonLd} />
      <ScrollProgress />
      <Header />
      <main id="main">
        {/* Above-the-fold critical rendering path */}
        <Hero />
        <SocialProofStrip />
        <ClientLogosMarquee />

        {/* Below-the-fold lazy sections with preserved anchor IDs */}
        {showMockups && (
          <SectionSuspense id="mockups">
            <MockupsSection />
          </SectionSuspense>
        )}

        <SectionSuspense id="before-after">
          <BeforeAfterSlider />
        </SectionSuspense>

        {showDemo && (
          <SectionSuspense id="demo">
            <DemoSection />
          </SectionSuspense>
        )}

        <SectionSuspense id="wizard">
          <QuoteWizard />
        </SectionSuspense>

        {showServices && (
          <SectionSuspense id="services">
            <Services />
          </SectionSuspense>
        )}

        {showCalculator && (
          <SectionSuspense id="calculator">
            <CommissionCalculator />
          </SectionSuspense>
        )}

        {showAbout && (
          <SectionSuspense id="about">
            <AboutUs />
          </SectionSuspense>
        )}

        {showWhyUs && (
          <SectionSuspense id="why-us">
            <WhyUs />
          </SectionSuspense>
        )}

        {showPortfolio && (
          <SectionSuspense id="portfolio">
            <Portfolio />
          </SectionSuspense>
        )}

        <SectionSuspense id="testimonials">
          <TestimonialsSection />
        </SectionSuspense>

        {showProcess && (
          <SectionSuspense id="process">
            <Process />
          </SectionSuspense>
        )}

        {showPricing && (
          <SectionSuspense id="pricing">
            <Pricing />
          </SectionSuspense>
        )}

        {showFaq && (
          <SectionSuspense id="faq">
            <FAQ />
          </SectionSuspense>
        )}

        {showContact && (
          <SectionSuspense id="contact">
            <Contact />
          </SectionSuspense>
        )}
      </main>

      <Footer />
      <FloatingWhatsApp />

      <Suspense fallback={null}>
        <StickyMiniCta />
      </Suspense>

      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>

      <Suspense fallback={null}>
        <ExitIntentModal />
      </Suspense>

      <MobileBottomBar />

      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </div>
  );
}
