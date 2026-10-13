import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, LogIn, Loader2, UserPlus, User, Phone, Eye, EyeOff, Check, AlertCircle, KeyRound, MailQuestion } from 'lucide-react';
import { useCustomer } from '@/lib/customer-context';
import { supabase } from '@/lib/supabase';

export default function CustomerAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user } = useCustomer();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  );

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Signup state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Password reset state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Password recovery (from email link)
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryNewPwd, setRecoveryNewPwd] = useState('');
  const [recoveryConfirmPwd, setRecoveryConfirmPwd] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    if (user) navigate('/account');
  }, [user, navigate]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const validatePhone = (p: string): boolean => {
    const cleaned = p.replace(/[\s\-()]/g, '');
    return /^(\+?20|0)?1[0-2,5]\d{8}$/.test(cleaned);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    navigate('/account');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 12) {
      setError('كلمة المرور لازم تكون 12 حرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    if (!validatePhone(phone)) {
      setError('رقم الموبايل غير صحيح. مثال صحيح: 01020095059');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, newPassword, fullName.trim(), phone.trim());
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSuccess('تم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول الآن.');
    setMode('login');
    setFullName('');
    setPhone('');
    setNewPassword('');
    setConfirmPassword('');
    setEmail(email);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setResetLoading(false);
    if (error) {
      setResetMessage('فشل إرسال رابط إعادة التعيين. حاول مرة تانية.');
      return;
    }
    setResetMessage('تم إرسال رابط إعادة تعيين كلمة المرور على بريدك الإلكتروني.');
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (recoveryNewPwd.length < 12) {
      setRecoveryError('كلمة المرور الجديدة لازم تكون 12 حرف على الأقل');
      return;
    }
    if (recoveryNewPwd !== recoveryConfirmPwd) {
      setRecoveryError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    setRecoveryLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: recoveryNewPwd });
    setRecoveryLoading(false);
    if (updateError) {
      setRecoveryError('فشل تحديث كلمة المرور. حاول مرة تانية.');
      return;
    }
    setRecoverySuccess(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      setRecoveryMode(false);
      setRecoveryNewPwd('');
      setRecoveryConfirmPwd('');
    }, 2500);
  };

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all';
  const labelClass = 'text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2';

  if (recoverySuccess) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-xl font-bold text-navy-50">Click Zoon</span>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <Check size={48} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-navy-50 mb-2">تم تغيير كلمة المرور</h1>
            <p className="text-navy-400 text-sm">هيتم تحويلك لصفحة الدخول خلال لحظات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (recoveryMode) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
              <span className="text-xl font-bold text-navy-50">Click Zoon</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-50 mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-navy-400 text-sm">أدخل كلمة المرور الجديدة</p>
          </div>
          <form onSubmit={handleRecovery} className="glass-card rounded-2xl p-8 space-y-5">
            <div>
              <label className={labelClass}>
                <KeyRound size={16} className="text-gold-400" />
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={recoveryNewPwd}
                  onChange={(e) => setRecoveryNewPwd(e.target.value)}
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
                <KeyRound size={16} className="text-gold-400" />
                تأكيد كلمة المرور
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={recoveryConfirmPwd}
                onChange={(e) => setRecoveryConfirmPwd(e.target.value)}
                placeholder="••••••••••••"
                className={inputClass}
                dir="ltr"
              />
            </div>
            {recoveryError && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={recoveryLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover"
            >
              {recoveryLoading ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />}
              {recoveryLoading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-extrabold text-gradient-gold">CZ</span>
            <span className="text-xl font-bold text-navy-50">Click Zoon</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-50 mb-2">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-navy-400 text-sm">
            {mode === 'login' ? 'ادخل لحسابك لمتابعة طلباتك' : 'أنشئ حساب لتتبع طلبات الديمو الخاصة بك'}
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-4">
            <Check size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="glass-card rounded-2xl p-8 space-y-5">
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
                placeholder="you@example.com"
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
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                dir="ltr"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
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
              onClick={() => setShowReset((v) => !v)}
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
                    placeholder="you@example.com"
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
                {resetMessage && (
                  <p className={`text-sm text-center ${resetMessage.includes('فشل') ? 'text-red-300' : 'text-green-300'}`}>
                    {resetMessage}
                  </p>
                )}
              </form>
            )}

            <p className="text-center text-navy-400 text-sm">
              ليس لديك حساب؟{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(null); }} className="text-gold-400 hover:text-gold-300 font-semibold">
                إنشاء حساب
              </button>
            </p>
            <a href="/" className="block text-center text-navy-400 hover:text-gold-400 text-sm transition-colors">
              العودة للموقع
            </a>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="glass-card rounded-2xl p-8 space-y-5">
            <div>
              <label className={labelClass}>
                <User size={16} className="text-gold-400" />
                الاسم الكامل
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اسمك الكريم"
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
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
                placeholder="01xxxxxxxxx"
                className={inputClass}
                dir="ltr"
              />
            </div>
            <div>
              <label className={labelClass}>
                <Lock size={16} className="text-gold-400" />
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={inputClass}
                dir="ltr"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
            </button>
            <p className="text-center text-navy-400 text-sm">
              لديك حساب بالفعل؟{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className="text-gold-400 hover:text-gold-300 font-semibold">
                تسجيل الدخول
              </button>
            </p>
            <a href="/" className="block text-center text-navy-400 hover:text-gold-400 text-sm transition-colors">
              العودة للموقع
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
