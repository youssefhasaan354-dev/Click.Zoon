import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from '@/lib/admin-context';
import AdminLayout from '@/admin/AdminLayout';
import AdminLogin from '@/admin/AdminLogin';
import AdminDashboard from '@/admin/panels/AdminDashboard';
import AdminSettings from '@/admin/panels/AdminSettings';
import AdminHero from '@/admin/panels/AdminHero';
import AdminFaqs from '@/admin/panels/AdminFaqs';
import AdminPortfolio from '@/admin/panels/AdminPortfolio';
import AdminPricing from '@/admin/panels/AdminPricing';
import AdminSections from '@/admin/panels/AdminSections';
import AdminRequests from '@/admin/panels/AdminRequests';
import AdminCustomers from '@/admin/panels/AdminCustomers';
import TextItemsPanel from '@/admin/panels/TextItemsPanel';
import AdminChangePassword from '@/admin/panels/AdminChangePassword';
import AdminBackup from '@/admin/panels/AdminBackup';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="animate-spin text-gold-400" />
      <p className="text-navy-300 text-sm">جارٍ التحقق من الجلسة...</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  const [retrying, setRetrying] = useState(false);
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertCircle size={48} className="text-red-400" />
      <h1 className="text-xl font-bold text-navy-50">حدث خطأ</h1>
      <p className="text-navy-400 text-sm max-w-md">{message}</p>
      <button
        onClick={() => { setRetrying(true); window.location.reload(); }}
        disabled={retrying}
        className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-5 py-2.5 rounded-lg transition-all"
      >
        <RefreshCw size={18} className={retrying ? 'animate-spin' : ''} />
        إعادة المحاولة
      </button>
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, authError } = useAdmin();

  if (loading) return <FullScreenLoader />;
  if (authError) return <ErrorScreen message={authError} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route index element={<AdminGuard><AdminDashboard /></AdminGuard>} />
      <Route path="settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
      <Route path="hero" element={<AdminGuard><AdminHero /></AdminGuard>} />
      <Route path="features" element={<AdminGuard><TextItemsPanel table="features" title="المميزات" subtitle="مميزات قسم ليه تختارنا" hasIcon /></AdminGuard>} />
      <Route path="services" element={<AdminGuard><TextItemsPanel table="services" title="الخدمات" subtitle="بطاقات الخدمات المعروضة" hasIcon /></AdminGuard>} />
      <Route path="portfolio" element={<AdminGuard><AdminPortfolio /></AdminGuard>} />
      <Route path="process" element={<AdminGuard><TextItemsPanel table="process_steps" title="إزاي بنشتغل" subtitle="خطوات العمل" hasIcon /></AdminGuard>} />
      <Route path="pricing" element={<AdminGuard><AdminPricing /></AdminGuard>} />
      <Route path="faqs" element={<AdminGuard><AdminFaqs /></AdminGuard>} />
      <Route path="sections" element={<AdminGuard><AdminSections /></AdminGuard>} />
      <Route path="requests" element={<AdminGuard><AdminRequests /></AdminGuard>} />
      <Route path="customers" element={<AdminGuard><AdminCustomers /></AdminGuard>} />
      <Route path="password" element={<AdminGuard><AdminChangePassword /></AdminGuard>} />
      <Route path="backup" element={<AdminGuard><AdminBackup /></AdminGuard>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
