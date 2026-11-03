import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Image, DollarSign, HelpCircle, Settings, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, AdminCard } from '@/admin/ui';
import { DemoRequest } from '@/lib/types';

interface DayStat {
  date: string;
  count: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ requests: 0, portfolio: 0, pricing: 0, faqs: 0, newLeads: 0 });
  const [chartData, setChartData] = useState<DayStat[]>([]);
  const [recentRequests, setRecentRequests] = useState<DemoRequest[]>([]);

  useEffect(() => {
    (async () => {
      const [r, p, pr, f, requestsRes] = await Promise.all([
        supabase.from('demo_requests').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio_items').select('*', { count: 'exact', head: true }),
        supabase.from('pricing_plans').select('*', { count: 'exact', head: true }),
        supabase.from('faqs').select('*', { count: 'exact', head: true }),
        supabase.from('demo_requests').select('*').order('created_at', { ascending: false }).limit(30),
      ]);

      const requestsList = (requestsRes.data as DemoRequest[]) ?? [];
      const newCount = requestsList.filter((x) => (x.status ?? 'new') === 'new').length;

      setStats({
        requests: r.count ?? 0,
        portfolio: p.count ?? 0,
        pricing: pr.count ?? 0,
        faqs: f.count ?? 0,
        newLeads: newCount,
      });

      setRecentRequests(requestsList.slice(0, 5));

      // Build 7-day or 4-week bar intervals for the 30-day chart
      const days: DayStat[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 4);
        const dateStr = d.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });

        // count requests falling in this 4-day window
        const windowStart = new Date(d);
        windowStart.setHours(0, 0, 0, 0);
        const windowEnd = new Date(d);
        windowEnd.setDate(windowEnd.getDate() + 4);

        const count = requestsList.filter((req) => {
          const reqDate = new Date(req.created_at);
          return reqDate >= windowStart && reqDate < windowEnd;
        }).length;

        days.push({ date: dateStr, count });
      }
      setChartData(days);
    })();
  }, []);

  const cards = [
    { label: 'طلبات الديمو', value: stats.requests, icon: Inbox, link: '/admin/requests', color: 'text-gold-400' },
    { label: 'مشاريع الأعمال', value: stats.portfolio, icon: Image, link: '/admin/portfolio', color: 'text-blue-400' },
    { label: 'الباقات', value: stats.pricing, icon: DollarSign, link: '/admin/pricing', color: 'text-green-400' },
    { label: 'الأسئلة الشائعة', value: stats.faqs, icon: HelpCircle, link: '/admin/faqs', color: 'text-teal-400' },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.count), 5);

  return (
    <div>
      <AdminPageHeader title="لوحة التحكم" subtitle="مرحباً بك في إدارة موقع Click Zoon" />

      {/* Metric Cards */}
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

      {/* 30-Day Activity Chart */}
      <AdminCard className="mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-gold-400" />
            <h3 className="text-base font-bold text-navy-50">نشاط طلبات الديمو خلال آخر 30 يوماً</h3>
          </div>
          <Link
            to="/admin/requests"
            className="text-xs text-gold-400 hover:text-gold-300 font-semibold inline-flex items-center gap-1"
          >
            <span>كل الطلبات</span>
            <ArrowLeft size={14} />
          </Link>
        </div>

        {/* CSS/SVG Bar Chart */}
        <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-navy-700/60">
          {chartData.map((item, idx) => {
            const heightPct = Math.max(12, Math.round((item.count / maxVal) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[11px] font-bold text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </div>
                <div
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-gold-600 via-gold-400 to-gold-300 transition-all duration-500 group-hover:brightness-125 shadow-lg shadow-gold-500/10"
                  style={{ height: `${heightPct}%` }}
                />
                <div className="text-[11px] text-navy-400 font-medium whitespace-nowrap">
                  {item.date}
                </div>
              </div>
            );
          })}
        </div>
      </AdminCard>

      {/* Recent leads & shortcuts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <AdminCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-50 flex items-center gap-2">
              <Calendar size={16} className="text-gold-400" />
              <span>أحدث الطلبات المستلمة</span>
            </h3>
            <Link to="/admin/requests" className="text-xs text-gold-400 hover:underline">
              عرض المزيد
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <p className="text-xs text-navy-400 py-6 text-center">لا توجد طلبات جديدة</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-navy-800/40 border border-navy-700/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-navy-100 block mb-0.5">{r.name}</span>
                    <span className="text-navy-400">{r.business_type}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold ${
                      r.status === 'delivered'
                        ? 'bg-green-500/15 text-green-300'
                        : r.status === 'contacted'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-blue-500/15 text-blue-300'
                    }`}
                  >
                    {r.status === 'delivered' ? 'مكتمل' : r.status === 'contacted' ? 'تواصل' : 'جديد'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        {/* Shortcuts */}
        <div className="space-y-4">
          <Link to="/admin/settings">
            <AdminCard className="hover:border-gold-500/30 transition-all flex items-center gap-3 cursor-pointer p-5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center">
                <Settings size={20} />
              </div>
              <div>
                <span className="text-navy-50 font-bold block text-sm">تعديل إعدادات الموقع العامة</span>
                <span className="text-navy-400 text-xs">رقم الواتساب، الأسعار، العناوين وشريط الإعلانات</span>
              </div>
            </AdminCard>
          </Link>

          <Link to="/admin/portfolio">
            <AdminCard className="hover:border-gold-500/30 transition-all flex items-center gap-3 cursor-pointer p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Image size={20} />
              </div>
              <div>
                <span className="text-navy-50 font-bold block text-sm">إدارة مشاريع الأعمال</span>
                <span className="text-navy-400 text-xs">إضافة صور وتعديل روابط المواقع الحية</span>
              </div>
            </AdminCard>
          </Link>
        </div>
      </div>
    </div>
  );
}
