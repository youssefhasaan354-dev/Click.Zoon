import { lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AdminProvider } from './lib/admin-context.tsx';
import { CustomerProvider } from './lib/customer-context.tsx';
import { SiteDataProvider } from './lib/site-data-context.tsx';
import { useSiteConfig } from './siteConfig';
import { initGoogleAnalytics } from './lib/analytics';
import { Loader2 } from 'lucide-react';

const AdminApp = lazy(() => import('@/admin/AdminApp'));
const PrivacyPage = lazy(() => import('@/pages/Privacy'));
const CustomerAuthPage = lazy(() => import('@/pages/CustomerAuth'));
const CustomerAccountPage = lazy(() => import('@/pages/CustomerAccount'));
const CustomerRequestsPage = lazy(() => import('@/pages/CustomerRequests'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'));

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-3" dir="rtl">
      <Loader2 size={40} className="animate-spin text-gold-400" />
      <span className="text-navy-300 text-sm font-medium">جارٍ التحميل...</span>
    </div>
  );
}

function GAInitializer() {
  const cfg = useSiteConfig();
  useEffect(() => {
    initGoogleAnalytics(cfg.googleAnalyticsId);
  }, [cfg.googleAnalyticsId]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AdminProvider>
      <CustomerProvider>
        <SiteDataProvider>
          <GAInitializer />
          <Routes>
            <Route path="/admin/*" element={<Suspense fallback={<FullScreenLoader />}><AdminApp /></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<FullScreenLoader />}><CustomerAuthPage /></Suspense>} />
            <Route path="/reset-password" element={<Suspense fallback={<FullScreenLoader />}><ResetPasswordPage /></Suspense>} />
            <Route path="/account" element={<Suspense fallback={<FullScreenLoader />}><CustomerAccountPage /></Suspense>} />
            <Route path="/my-requests" element={<Suspense fallback={<FullScreenLoader />}><CustomerRequestsPage /></Suspense>} />
            <Route path="/privacy" element={<Suspense fallback={<FullScreenLoader />}><PrivacyPage /></Suspense>} />
            <Route path="/*" element={<App />} />
          </Routes>
        </SiteDataProvider>
      </CustomerProvider>
    </AdminProvider>
  </BrowserRouter>
);
