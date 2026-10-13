import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, Loader2, Check, AlertCircle, Eye, EyeOff, ArrowRight, Inbox } from 'lucide-react';
import { useCustomer } from '@/lib/customer-context';
import { supabase } from '@/lib/supabase';

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

export default function CustomerAccount() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, refreshProfile } = useCustomer();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Password change
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Requests
  const [requests, setRequests] = useState<Array<{ id: string; name: string; business_type: string; phone: string; status: string; created_at: string }>>([]);
  const [reqLoading, setReqLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('demo_requests')
        .select('id, name, business_type, phone, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRequests((data as typeof requests) ?? []);
      setReqLoading(false);
    })();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setSaveError(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', user!.id);
    setSaving(false);
    if (error) {
      setSaveError('فشل حفظ التغييرات. حاول مرة أخرى.');
      return;
    }
    setSavedMsg('تم حفظ التغييرات بنجاح');
    refreshProfile();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdMsg(null);
    if (newPwd.length < 12) {
      setPwdError('كلمة المرور الجديدة لازم تكون 12 حرف على الأقل');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) {
      setPwdError('فشل تغيير كلمة المرور. حاول مرة أخرى.');
      return;
    }
    setPwdMsg('تم تغيير كلمة المرور بنجاح');
    setNewPwd('');
    setConfirmPwd('');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-gold-400" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all';
  const labelClass = 'text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2';

  return (
    <div className="min-h-screen bg-navy-900 text-navy-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">حسابي</h1>
            <p className="text-navy-400 text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/my-requests" className="text-gold-400 hover:text-gold-300 text-sm font-semibold flex items-center gap-1.5">
              <Inbox size={18} />
              طلباتي
            </Link>
            <button onClick={handleSignOut} className="text-red-300 hover:text-red-200 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              تسجيل خروج
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile info */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">بياناتي</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className={labelClass}>
                  <User size={16} className="text-gold-400" />
                  الاسم
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Mail size={16} className="text-gold-400" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={user.email ?? ''}
                  disabled
                  className={inputClass + ' opacity-60 cursor-not-allowed'}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Phone size={16} className="text-gold-400" />
                  رقم الموبايل
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              {saveError && (
                <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}
              {savedMsg && (
                <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
                  <Check size={16} className="shrink-0" />
                  <span>{savedMsg}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">تغيير كلمة المرور</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={labelClass}>
                  <Lock size={16} className="text-gold-400" />
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="12 حرف على الأقل"
                    className={inputClass}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-navy-500 text-xs mt-1.5">لازم 12 حرف على الأقل</p>
              </div>
              <div>
                <label className={labelClass}>
                  <Lock size={16} className="text-gold-400" />
                  تأكيد كلمة المرور
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              {pwdError && (
                <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}
              {pwdMsg && (
                <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
                  <Check size={16} className="shrink-0" />
                  <span>{pwdMsg}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={pwdLoading}
                className="inline-flex items-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 disabled:opacity-60 text-navy-50 font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                {pwdLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                {pwdLoading ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </form>
          </div>

          {/* Recent requests preview */}
          <div className="glass-card rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">آخر الطلبات</h2>
              <Link to="/my-requests" className="text-gold-400 hover:text-gold-300 text-sm flex items-center gap-1">
                عرض الكل
                <ArrowRight size={16} />
              </Link>
            </div>
            {reqLoading ? (
              <p className="text-navy-400 text-sm">جارٍ التحميل...</p>
            ) : requests.length === 0 ? (
              <p className="text-navy-400 text-sm">لا توجد طلبات حتى الآن</p>
            ) : (
              <div className="space-y-2">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="flex items-center justify-between bg-navy-800/40 rounded-lg px-4 py-3">
                    <div>
                      <span className="text-navy-50 font-semibold text-sm">{req.business_type}</span>
                      <span className="text-navy-500 text-xs mr-2">
                        {new Date(req.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[req.status] ?? statusColors.new}`}>
                      {statusLabels[req.status] ?? req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
