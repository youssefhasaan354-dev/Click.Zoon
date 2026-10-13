import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DemoRequest } from '@/lib/types';
import { AdminPageHeader, AdminCard, DeleteButton } from '@/admin/ui';
import { Trash2, Inbox, UserCheck, UserX, Search, Download } from 'lucide-react';

const statusLabels: Record<string, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  delivered: 'تم التسليم',
  rejected: 'مرفوض',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  delivered: 'bg-green-500/15 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const statusOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'new', label: 'جديد' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'rejected', label: 'مرفوض' },
];

const statusUpdateOptions = [
  { value: 'new', label: 'جديد' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'rejected', label: 'مرفوض' },
];

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function exportToExcel(requests: DemoRequest[]) {
  const headers = ['التاريخ', 'الاسم', 'الهاتف', 'نوع النشاط', 'رابط الصفحة', 'الحالة', 'المصدر', 'عميل مسجل'];
  const rows = requests.map((r) => [
    new Date(r.created_at).toLocaleString('ar-EG'),
    r.name,
    r.phone,
    r.business_type,
    r.page_url ?? '',
    statusLabels[r.status] ?? r.status,
    r.source ?? 'form',
    r.user_id ? 'نعم' : 'لا',
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `demo-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('demo_requests').select('*').order('created_at', { ascending: false });
    setRequests((data as DemoRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    await supabase.from('demo_requests').delete().eq('id', id);
    load();
  };

  const clearAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الطلبات؟')) return;
    await supabase.from('demo_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('demo_requests').update({ status }).eq('id', id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && (r.status ?? 'new') !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim();
      return r.name.includes(q) || r.phone.includes(q) || r.business_type.includes(q);
    }
    return true;
  });

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="طلبات الديمو" subtitle={`${requests.length} طلب مستلم`} />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {requests.length > 0 && (
          <button
            onClick={() => exportToExcel(filtered)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all"
          >
            <Download size={16} />
            تصدير Excel
          </button>
        )}
        {requests.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            <Trash2 size={16} />
            حذف الكل
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الهاتف، أو نوع النشاط..."
            className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl pr-10 pl-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 focus:border-gold-500/50 focus:outline-none transition-all text-sm min-w-[140px]"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy-800 text-navy-50">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <AdminCard className="text-center py-12">
          <Inbox size={48} className="text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400">{requests.length === 0 ? 'لا توجد طلبات حتى الآن' : 'لا توجد طلبات مطابقة للبحث'}</p>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <AdminCard key={req.id} className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-navy-50 font-bold text-sm">{req.name}</span>
                  {req.user_id ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/30">
                      <UserCheck size={12} />
                      عميل مسجل
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-navy-700/50 text-navy-300 border border-navy-600/40">
                      <UserX size={12} />
                      زائر
                    </span>
                  )}
                  <span className="text-navy-500 text-xs">
                    {new Date(req.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="text-navy-300 text-sm space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-navy-500 text-xs">النشاط:</span>
                    <span>{req.business_type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-navy-500 text-xs">الهاتف:</span>
                    <a
                      href={`https://wa.me/${req.phone.replace(/^0/, '20')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:underline"
                      dir="ltr"
                    >
                      {req.phone}
                    </a>
                  </div>
                  {req.page_url && (
                    <div className="flex items-center gap-2">
                      <span className="text-navy-500 text-xs">الرابط:</span>
                      <a href={req.page_url} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline text-xs truncate" dir="ltr">
                        {req.page_url}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-navy-500 text-xs">الحالة:</span>
                  <select
                    value={req.status ?? 'new'}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${statusColors[req.status ?? 'new'] ?? statusColors.new}`}
                  >
                    {statusUpdateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-navy-800 text-navy-50">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DeleteButton onDelete={() => remove(req.id)} />
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
