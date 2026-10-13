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
import { Routes, Route } from 'react-router-dom';
import { useSectionVisibility } from '@/lib/site-data-context';

function App() {
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

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50 pb-[4.5rem] sm:pb-0">
      <ScrollProgress />
      <Header />
      <main>
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
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppWithRoutes;
