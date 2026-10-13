import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, AdminCard } from '@/admin/ui';
import { Users, Search } from 'lucide-react';

interface CustomerRow {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  email: string | null;
  request_count: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .order('created_at', { ascending: false });

    if (!profiles) {
      setLoading(false);
      return;
    }

    // Get request counts per user
    const { data: counts } = await supabase
      .from('demo_requests')
      .select('user_id')
      .not('user_id', 'is', null);

    const countMap = new Map<string, number>();
    (counts ?? []).forEach((r: { user_id: string }) => {
      const uid = r.user_id;
      countMap.set(uid, (countMap.get(uid) ?? 0) + 1);
    });

    // Get emails from auth via admin list — not available via anon key
    // We'll show what we have from profiles
    const rows: CustomerRow[] = (profiles as Omit<CustomerRow, 'email' | 'request_count'>[]).map((p) => ({
      ...p,
      email: null,
      request_count: countMap.get(p.id) ?? 0,
    }));

    setCustomers(rows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? customers.filter((c) =>
        c.full_name.includes(search.trim()) ||
        c.phone?.includes(search.trim())
      )
    : customers;

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="العملاء" subtitle={`${customers.length} عميل مسجل`} />

      <div className="relative mb-4">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو رقم الموبايل..."
          className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl pr-10 pl-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <AdminCard className="text-center py-12">
          <Users size={48} className="text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400">لا يوجد عملاء مسجلون بعد</p>
        </AdminCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <AdminCard key={c.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center shrink-0">
                <span className="text-gold-400 font-bold text-sm">
                  {c.full_name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-navy-50 font-bold text-sm">{c.full_name}</div>
                <div className="text-navy-400 text-xs flex items-center gap-3">
                  <span dir="ltr">{c.phone || '—'}</span>
                  <span>
                    {new Date(c.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-gold-400 font-bold text-lg">{c.request_count}</div>
                <div className="text-navy-500 text-xs">طلب</div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
