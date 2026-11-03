import { Component, ErrorInfo, ReactNode, lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import HomePage, { ScrollToHash } from './App.tsx';
import NotFoundPage from '@/pages/NotFound';
import { AdminProvider } from './lib/admin-context.tsx';
import { CustomerProvider } from './lib/customer-context.tsx';
import { SiteDataProvider } from './lib/site-data-context.tsx';
import { useSiteConfig } from './siteConfig';
import { initGoogleAnalytics } from './lib/analytics';
import BrandedLoader from '@/components/BrandedLoader';
import { ToastProvider } from '@/lib/toast-context';
import { pageTransitionVariants, reducedMotionVariants, usePrefersReducedMotion } from '@/lib/motion';

const AdminApp = lazy(() => import('@/admin/AdminApp'));
const PrivacyPage = lazy(() => import('@/pages/Privacy'));
const CustomerAuthPage = lazy(() => import('@/pages/CustomerAuth'));
const CustomerAccountPage = lazy(() => import('@/pages/CustomerAccount'));
const CustomerRequestsPage = lazy(() => import('@/pages/CustomerRequests'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'));
const CaseStudyPage = lazy(() => import('@/pages/CaseStudy'));

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
      </BrowserRouter>
    </RootErrorBoundary>
  );
}
