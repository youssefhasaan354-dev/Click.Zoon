import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, Loader2, MailQuestion } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const { signIn } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all';
  const labelClass = 'text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error, isAdmin } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    if (!isAdmin) {
      setError('هذا الحساب ليس لديه صلاحية الدخول للوحة التحكم');
      return;
    }
    navigate('/admin');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetSuccess(null);
    setResetError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        const isRateLimit =
          error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('too many requests') ||
          error.message?.toLowerCase().includes('security purposes');
        if (isRateLimit) {
          setResetError('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');
        } else {
          setResetError('فشل إرسال رابط إعادة التعيين. حاول مرة تانية.');
        }
        return;
      }
      setResetSuccess('تم إرسال رابط إعادة تعيين كلمة المرور على بريدك الإلكتروني.');
    } catch {
      setResetError('حدث خطأ غير متوقع. حاول مرة تانية.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-xl font-bold text-navy-50">Click Zoon</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-50 mb-2">لوحة التحكم</h1>
          <p className="text-navy-400 text-sm">سجّل الدخول لإدارة محتوى الموقع</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
          <div>
            <label className={labelClass}>
              <Mail size={16} className="text-gold-400" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div>
            <label className={labelClass}>
              <Lock size={16} className="text-gold-400" />
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowReset((v) => !v);
              if (!resetEmail && email) setResetEmail(email);
            }}
            className="w-full text-center text-navy-400 hover:text-gold-400 text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <MailQuestion size={15} />
            نسيت كلمة المرور؟
          </button>

          {showReset && (
            <form onSubmit={handleReset} className="space-y-3 pt-2 border-t border-navy-700/30">
              <div>
                <label className={labelClass}>
                  <Mail size={16} className="text-gold-400" />
                  بريدك الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={inputClass}
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-600 disabled:opacity-60 text-navy-50 font-bold px-6 py-3 rounded-xl transition-all"
              >
                {resetLoading ? <Loader2 size={18} className="animate-spin" /> : <MailQuestion size={18} />}
                {resetLoading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </button>
              {resetError && (
                <p className="text-sm text-center text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                  {resetError}
                </p>
              )}
              {resetSuccess && (
                <p className="text-sm text-center text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg p-2.5">
                  {resetSuccess}
                </p>
              )}
            </form>
          )}

          <a href="/" className="block text-center text-navy-400 hover:text-gold-400 text-sm transition-colors">
            العودة للموقع
          </a>
        </form>
      </div>
    </div>
  );
}
