import { lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import App from './App.tsx';
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

function GAInitializer() {
  const cfg = useSiteConfig();
  useEffect(() => {
    initGoogleAnalytics(cfg.googleAnalyticsId);
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
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full min-h-screen"
      >
        <Routes location={location}>
          <Route path="/admin/*" element={<Suspense fallback={<BrandedLoader />}><AdminApp /></Suspense>} />
          <Route path="/auth" element={<Suspense fallback={<BrandedLoader />}><CustomerAuthPage /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<BrandedLoader />}><ResetPasswordPage /></Suspense>} />
          <Route path="/account" element={<Suspense fallback={<BrandedLoader />}><CustomerAccountPage /></Suspense>} />
          <Route path="/my-requests" element={<Suspense fallback={<BrandedLoader />}><CustomerRequestsPage /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<BrandedLoader />}><PrivacyPage /></Suspense>} />
          <Route path="/*" element={<App />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')!).render(
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
);
