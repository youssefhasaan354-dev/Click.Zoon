import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Inbox, ArrowRight, Loader2 } from 'lucide-react';
import { useCustomer } from '@/lib/customer-context';
import { useI18n, formatDate } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { useNoIndex } from '@/hooks/useNoIndex';

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

interface CustomerRequest {
  id: string;
  name: string;
  business_type: string;
  phone: string;
  page_url: string | null;
  status: string;
  created_at: string;
}

export default function CustomerRequests() {
  const { language } = useI18n();
  useNoIndex('طلباتي | Click Zoon');
  const navigate = useNavigate();
  const { user, loading } = useCustomer();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [reqLoading, setReqLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('demo_requests')
        .select('id, name, business_type, phone, page_url, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRequests((data as CustomerRequest[]) ?? []);
      setReqLoading(false);
    })();
  }, [user]);

  if (loading || reqLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-gold-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Inbox size={24} className="text-gold-400" />
            <h1 className="text-2xl font-bold">طلباتي</h1>
          </div>
          <Link to="/account" className="text-gold-400 hover:text-gold-300 text-sm font-semibold">
            حسابي
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Inbox size={48} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400 mb-4">لا توجد طلبات حتى الآن</p>
            <a href="/#contact" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
              اطلب ديمو مجاني
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-navy-50 font-bold">{req.business_type}</span>
                    <span className="text-navy-500 text-xs mr-2">
                      {formatDate(req.created_at, language, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[req.status] ?? statusColors.new}`}>
                    {statusLabels[req.status] ?? req.status}
                  </span>
                </div>
                <div className="text-navy-300 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-navy-500 text-xs">الاسم:</span>
                    <span>{req.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-navy-500 text-xs">الهاتف:</span>
                    <span dir="ltr">{req.phone}</span>
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
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <a href="/" className="text-navy-400 hover:text-gold-400 text-sm transition-colors inline-flex items-center gap-1">
            <ArrowRight size={16} className="rotate-180" />
            العودة للموقع
          </a>
        </div>
      </div>
    </div>
  );
}
