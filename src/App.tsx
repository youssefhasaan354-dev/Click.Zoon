import { useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MockupsSection from '@/components/MockupsSection';
import DemoSection from '@/components/DemoSection';
import Services from '@/components/Services';
import CommissionCalculator from '@/components/CommissionCalculator';
import AboutUs from '@/components/AboutUs';
import Pricing from '@/components/Pricing';
import Portfolio from '@/components/Portfolio';
import WhyUs from '@/components/WhyUs';
import Process from '@/components/Process';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import ScrollProgress from '@/components/ScrollProgress';
import MobileBottomBar from '@/components/MobileBottomBar';
import BackToTop from '@/components/BackToTop';
import NotFoundPage from '@/pages/NotFound';
import Seo from '@/components/Seo';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSectionVisibility, useSiteData } from '@/lib/site-data-context';

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
      const timer = setTimeout(tryScroll, 120);
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

function HomePage() {
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
      <ScrollToHash />
      <ScrollProgress />
      <Header />
      <main id="main">
        <Hero />
        {showMockups && <MockupsSection />}
        {showDemo && <DemoSection />}
        {showServices && <Services />}
        {showCalculator && <CommissionCalculator />}
        {showAbout && <AboutUs />}
        {showWhyUs && <WhyUs />}
        {showPortfolio && <Portfolio />}
        {showProcess && <Process />}
        {showPricing && <Pricing />}
        {showFaq && <FAQ />}
        {showContact && <Contact />}
      </main>
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomBar />
      <BackToTop />
    </div>
  );
}

function AppWithRoutes() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default AppWithRoutes;
