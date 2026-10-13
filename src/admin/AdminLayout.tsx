import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Type,
  Award,
  Grid,
  Image,
  ListOrdered,
  DollarSign,
  HelpCircle,
  Eye,
  Inbox,
  LogOut,
  Menu,
  X,
  ExternalLink,
  KeyRound,
  DatabaseBackup,
  Users,
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

const navItems = [
  { path: '/admin', label: 'الرئيسية', icon: LayoutDashboard },
  { path: '/admin/settings', label: 'إعدادات الموقع', icon: Settings },
  { path: '/admin/hero', label: 'الهيرو', icon: Type },
  { path: '/admin/features', label: 'المميزات', icon: Award },
  { path: '/admin/services', label: 'الخدمات', icon: Grid },
  { path: '/admin/portfolio', label: 'أعمالنا', icon: Image },
  { path: '/admin/process', label: 'إزاي بنشتغل', icon: ListOrdered },
  { path: '/admin/pricing', label: 'الباقات', icon: DollarSign },
  { path: '/admin/faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { path: '/admin/sections', label: 'إظهار/إخفاء الأقسام', icon: Eye },
  { path: '/admin/requests', label: 'طلبات الديمو', icon: Inbox },
  { path: '/admin/customers', label: 'العملاء', icon: Users },
  { path: '/admin/password', label: 'تغيير كلمة المرور', icon: KeyRound },
  { path: '/admin/backup', label: 'نسخة احتياطية', icon: DatabaseBackup },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-navy-950 flex" dir="rtl">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-navy-900 border-l border-navy-700/30 fixed inset-y-0 right-0">
        <div className="p-5 border-b border-navy-700/30">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-lg font-bold text-navy-50">لوحة التحكم</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive(item.path)
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/20'
                    : 'text-navy-300 hover:bg-navy-800/50 hover:text-navy-50'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-navy-700/30 space-y-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-navy-300 hover:bg-navy-800/50 hover:text-navy-50 transition-all"
          >
            <ExternalLink size={18} className="shrink-0" />
            عرض الموقع
          </a>
          <div className="text-navy-500 text-xs px-3 truncate">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Sidebar — mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-navy-950/80" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-navy-900 border-l border-navy-700/30 flex flex-col">
            <div className="p-5 border-b border-navy-700/30 flex items-center justify-between">
              <span className="text-lg font-bold text-navy-50">القائمة</span>
              <button onClick={() => setSidebarOpen(false)} className="text-navy-300">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive(item.path)
                        ? 'bg-gold-500/15 text-gold-300'
                        : 'text-navy-300 hover:bg-navy-800/50'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-navy-700/30">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10"
              >
                <LogOut size={18} />
                تسجيل خروج
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:mr-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-700/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-navy-50">
            <Menu size={24} />
          </button>
          <span className="text-lg font-bold text-gradient-gold">CZ لوحة التحكم</span>
        </div>

        <main className="p-4 lg:p-8 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
