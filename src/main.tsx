import { Component, ErrorInfo, ReactNode, lazy, Suspense, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';

// Safeguard React reconciliation against Google Translate and third-party DOM modifications
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Safeguarded DOM conflict on removeChild:', child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Safeguarded DOM conflict on insertBefore:', referenceNode);
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
import HomePage, { ScrollToHash } from './App.tsx';
import NotFoundPage from '@/pages/NotFound';
import { AdminProvider } from './lib/admin-context.tsx';
import { CustomerProvider } from './lib/customer-context.tsx';
import { SiteDataProvider } from './lib/site-data-context.tsx';
import { useSiteConfig } from './siteConfig';
import { initGoogleAnalytics, isAnalyticsInitialized } from './lib/analytics';
import BrandedLoader from '@/components/BrandedLoader';
import { ToastProvider } from '@/lib/toast-context';
import { I18nProvider } from '@/i18n';
import { pageTransitionVariants, reducedMotionVariants, usePrefersReducedMotion } from '@/lib/motion';

const AdminApp = lazy(() => import('@/admin/AdminApp'));
const PrivacyPage = lazy(() => import('@/pages/Privacy'));
const CustomerAuthPage = lazy(() => import('@/pages/CustomerAuth'));
const CustomerAccountPage = lazy(() => import('@/pages/CustomerAccount'));
const CustomerRequestsPage = lazy(() => import('@/pages/CustomerRequests'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'));
const CaseStudyPage = lazy(() => import('@/pages/CaseStudy'));
const ShowcasePage = lazy(() => import('@/pages/Showcase'));
const ShowcaseAppPage = lazy(() => import('@/pages/ShowcaseApp'));
const ActivityLandingPage = lazy(() => import('@/pages/ActivityLanding'));

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-navy-950 text-navy-50 flex items-center justify-center p-6 text-center font-cairo">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl border border-navy-700/60 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-navy-100 mb-2">عذراً، حدث خطأ غير متوقع</h1>
            <p className="text-sm text-navy-300 mb-6">
              نعمل على إصلاح هذا الخلل في أقرب وقت. يمكنك إعادة المحاولة الآن.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition-all glow-gold-hover shadow-lg"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function GAInitializer() {
  const cfg = useSiteConfig();
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    try {
      const consent = typeof window !== 'undefined' ? localStorage.getItem('cz_cookie_consent') : null;
      if (consent === 'accepted' && cfg.googleAnalyticsId) {
        initGoogleAnalytics(cfg.googleAnalyticsId);
      }
    } catch {
      // LocalStorage access may fail in private mode
    }
  }, [cfg.googleAnalyticsId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isAnalyticsInitialized() && typeof window !== 'undefined' && window.gtag && cfg.googleAnalyticsId) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }
  }, [location.pathname, location.search, cfg.googleAnalyticsId]);

  return null;
}

function AnimatedAppRoutes() {
  const location = useLocation();
  const prefersReduced = usePrefersReducedMotion();
  const variants = prefersReduced ? reducedMotionVariants : pageTransitionVariants;
  // Keep admin panel under single key to avoid re-triggering animation on inner sub-tab navigation
  const routeKey = location.pathname.startsWith('/admin') ? 'admin-root' : location.pathname;

  return (
    <>
      <ScrollToHash />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={routeKey}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-h-screen"
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/*" element={<Suspense fallback={<BrandedLoader />}><AdminApp /></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<BrandedLoader />}><CustomerAuthPage /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<BrandedLoader />}><ResetPasswordPage /></Suspense>} />
            <Route path="/account" element={<Suspense fallback={<BrandedLoader />}><CustomerAccountPage /></Suspense>} />
            <Route path="/my-requests" element={<Suspense fallback={<BrandedLoader />}><CustomerRequestsPage /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={<BrandedLoader />}><PrivacyPage /></Suspense>} />
            <Route path="/restaurant-website-mansoura" element={<Suspense fallback={<BrandedLoader />}><ActivityLandingPage forcedSlug="restaurant-website-mansoura" /></Suspense>} />
            <Route path="/cafe-website-mansoura" element={<Suspense fallback={<BrandedLoader />}><ActivityLandingPage forcedSlug="cafe-website-mansoura" /></Suspense>} />
            <Route path="/mall-website-mansoura" element={<Suspense fallback={<BrandedLoader />}><ActivityLandingPage forcedSlug="mall-website-mansoura" /></Suspense>} />
            <Route path="/ecommerce-website-mansoura" element={<Suspense fallback={<BrandedLoader />}><ActivityLandingPage forcedSlug="ecommerce-website-mansoura" /></Suspense>} />
            <Route path="/landing/:slug" element={<Suspense fallback={<BrandedLoader />}><ActivityLandingPage /></Suspense>} />
            <Route path="/showcase" element={<Suspense fallback={<BrandedLoader />}><ShowcasePage /></Suspense>} />
            <Route path="/showcase/:slug" element={<Suspense fallback={<BrandedLoader />}><ShowcaseAppPage /></Suspense>} />
            <Route path="/work/:slug" element={<Suspense fallback={<BrandedLoader />}><CaseStudyPage /></Suspense>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <BrowserRouter>
        <I18nProvider>
          <AdminProvider>
            <CustomerProvider>
              <SiteDataProvider>
                <ToastProvider>
                  <GAInitializer />
                  <AnimatedAppRoutes />
                </ToastProvider>
              </SiteDataProvider>
            </CustomerProvider>
          </AdminProvider>
        </I18nProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  );
}
