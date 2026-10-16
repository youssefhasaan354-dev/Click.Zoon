import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  MailQuestion,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNoIndex } from '@/hooks/useNoIndex';

type PageStatus = 'checking' | 'ready' | 'submitting' | 'success' | 'invalid_link';

function isRateLimitError(err: { message?: string; status?: number } | null | undefined): boolean {
  if (!err) return false;
  if (err.status === 429) return true;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('security purposes')
  );
}

export default function ResetPassword() {
  useNoIndex('إعادة تعيين كلمة المرور | Click Zoon');
  const navigate = useNavigate();

  const [status, setStatus] = useState<PageStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetLoginUrl, setTargetLoginUrl] = useState<string>('/auth');

  useEffect(() => {
    // 1. Check if the URL has error fragments/queries from Supabase
    const hash = window.location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(window.location.search);

    const errorParam =
      hashParams.get('error') ||
      searchParams.get('error') ||
      hashParams.get('error_code') ||
      searchParams.get('error_code') ||
      hashParams.get('error_description') ||
      searchParams.get('error_description');

    if (errorParam) {
      setStatus('invalid_link');
      return;
    }

    let recoveryDetected = false;

    // 2. Listen for Supabase auth state change (PASSWORD_RECOVERY event)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryDetected = true;
        setStatus('ready');
      }
    });

    // 3. Check if URL hash indicates recovery
    if (hashParams.get('type') === 'recovery' || window.location.hash.includes('type=recovery')) {
      recoveryDetected = true;
      setStatus('ready');
    }

    // 4. Fallback verification after a short delay
    const timer = setTimeout(async () => {
      if (recoveryDetected) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (
          session &&
          (hashParams.get('type') === 'recovery' || window.location.hash.includes('type=recovery'))
        ) {
          setStatus('ready');
        } else if (!recoveryDetected) {
          setStatus('invalid_link');
        }
      } catch {
        if (!recoveryDetected) {
          setStatus('invalid_link');
        }
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Minimum 8 characters requirement
    if (password.length < 8) {
      setErrorMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    // Passwords match check
    if (password !== confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    setStatus('submitting');

    try {
      // 1. Update password
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus('ready');
        if (isRateLimitError(error)) {
          setErrorMessage('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');
        } else {
          setErrorMessage(error.message || 'فشل تحديث كلمة المرور. حاول مرة تانية.');
        }
        return;
      }

      // 2. Determine matching login page by checking public.admins table
      let matchingLogin = '/auth';
      const userEmail = data.user?.email;

      if (userEmail) {
        try {
          const { data: adminRow } = await supabase
            .from('admins')
            .select('email')
            .eq('email', userEmail)
            .maybeSingle();

          if (adminRow) {
            matchingLogin = '/admin/login';
          }
        } catch (checkErr) {
          console.error('Error checking admin status during password recovery:', checkErr);
        }
      }

      setTargetLoginUrl(matchingLogin);

      // 3. Explicitly sign out so recovery session is cleared and user is not logged into admin
      await supabase.auth.signOut();

      setStatus('success');

      // 4. Redirect after short delay
      setTimeout(() => {
        navigate(matchingLogin);
      }, 2500);
    } catch (err: unknown) {
      setStatus('ready');
      const errObj = err as { message?: string; status?: number };
      if (isRateLimitError(errObj)) {
        setErrorMessage('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');
      } else {
        setErrorMessage('حدث خطأ غير متوقع أثناء تحديث كلمة المرور. حاول مرة تانية.');
      }
    }
  };

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all';
  const labelClass = 'text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2';

  // Checking session state
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-3 px-4" dir="rtl">
        <Loader2 size={40} className="animate-spin text-gold-400" />
        <span className="text-navy-300 text-sm font-medium">جارٍ التحقق من رابط إعادة التعيين...</span>
      </div>
    );
  }

  // Invalid or expired link state
  if (status === 'invalid_link') {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-xl font-bold text-navy-50">Click Zoon</span>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle size={36} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-navy-50 mb-2">رابط غير صالح أو منتهي الصلاحية</h1>
              <p className="text-navy-300 text-sm leading-relaxed">
                رابط إعادة تعيين كلمة المرور انتهت صلاحيته أو تم استخدامه من قبل. يمكنك طلب رابط جديد لإعادة التعيين.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/auth"
                className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover text-sm"
              >
                <MailQuestion size={18} />
                طلب رابط جديد (حسابات العملاء)
              </Link>

              <Link
                to="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 text-navy-200 border border-navy-700 font-medium px-6 py-3 rounded-xl transition-all text-sm"
              >
                <Lock size={16} />
                طلب رابط جديد (لوحة التحكم)
              </Link>

              <Link
                to="/"
                className="block text-center text-navy-400 hover:text-gold-400 text-xs transition-colors pt-2"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12" dir="rtl">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-xl font-bold text-navy-50">Click Zoon</span>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400">
              <Check size={36} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-navy-50 mb-2">تم تغيير كلمة المرور بنجاح</h1>
              <p className="text-navy-300 text-sm">
                تم تحديث كلمة المرور الخاصة بحسابك. سيتم تحويلك لصفحة تسجيل الدخول خلال لحظات...
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(targetLoginUrl)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover text-sm"
            >
              الانتقال إلى صفحة الدخول الآن
              <ArrowRight size={18} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready or submitting state (Form view)
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-xl font-bold text-navy-50">Click Zoon</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-50 mb-2">إعادة تعيين كلمة المرور</h1>
          <p className="text-navy-400 text-sm">أدخل كلمة المرور الجديدة لحسابك</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>
              <KeyRound size={16} className="text-gold-400" />
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                className={inputClass}
                dir="ltr"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-navy-400 text-xs mt-1.5">يجب أن تكون 8 أحرف على الأقل</p>
          </div>

          <div>
            <label className={labelClass}>
              <KeyRound size={16} className="text-gold-400" />
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                dir="ltr"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
                aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover"
          >
            {status === 'submitting' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <KeyRound size={20} />
            )}
            {status === 'submitting' ? 'جارٍ تحديث كلمة المرور...' : 'تحديث كلمة المرور'}
          </button>

          <div className="pt-2 text-center">
            <Link
              to="/auth"
              className="text-navy-400 hover:text-gold-400 text-sm transition-colors"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
