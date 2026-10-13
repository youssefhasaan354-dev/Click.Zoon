import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Image, DollarSign, HelpCircle, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, AdminCard } from '@/admin/ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ requests: 0, portfolio: 0, pricing: 0, faqs: 0 });

  useEffect(() => {
    (async () => {
      const [r, p, pr, f] = await Promise.all([
        supabase.from('demo_requests').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio_items').select('*', { count: 'exact', head: true }),
        supabase.from('pricing_plans').select('*', { count: 'exact', head: true }),
        supabase.from('faqs').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        requests: r.count ?? 0,
        portfolio: p.count ?? 0,
        pricing: pr.count ?? 0,
        faqs: f.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: 'طلبات الديمو', value: stats.requests, icon: Inbox, link: '/admin/requests', color: 'text-gold-400' },
    { label: 'مشاريع الأعمال', value: stats.portfolio, icon: Image, link: '/admin/portfolio', color: 'text-blue-400' },
    { label: 'الباقات', value: stats.pricing, icon: DollarSign, link: '/admin/pricing', color: 'text-green-400' },
    { label: 'الأسئلة الشائعة', value: stats.faqs, icon: HelpCircle, link: '/admin/faqs', color: 'text-teal-400' },
  ];

  return (
    <div>
      <AdminPageHeader title="لوحة التحكم" subtitle="مرحباً بك في إدارة موقع Click Zoon" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.link}>
              <AdminCard className="hover:border-gold-500/30 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center">
                    <Icon size={24} className={card.color} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-navy-50">{card.value}</div>
                    <div className="text-navy-400 text-sm">{card.label}</div>
                  </div>
                </div>
              </AdminCard>
            </Link>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/settings">
          <AdminCard className="hover:border-gold-500/30 transition-all flex items-center gap-3 cursor-pointer">
            <Settings size={20} className="text-gold-400" />
            <span className="text-navy-50 font-semibold">تعديل إعدادات الموقع العامة</span>
          </AdminCard>
        </Link>
        <Link to="/admin/sections">
          <AdminCard className="hover:border-gold-500/30 transition-all flex items-center gap-3 cursor-pointer">
            <span className="text-navy-50 font-semibold">إظهار وإخفاء أقسام الموقع</span>
          </AdminCard>
        </Link>
      </div>
    </div>
  );
}
