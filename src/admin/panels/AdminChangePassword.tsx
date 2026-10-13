import { useState } from 'react';
import { Lock, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 12) {
      setError('كلمة المرور الجديدة لازم تكون 12 حرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    if (newPassword === currentPassword) {
      setError('كلمة المرور الجديدة لازم تكون مختلفة عن الحالية');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (updateError) {
      setError('فشل تغيير كلمة المرور. تأكد إن كلمة المرور الحالية صحيحة وحاول مرة تانية.');
      return;
    }

    setSuccess('تم تغيير كلمة المرور بنجاح');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const inputClass =
    'w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-3 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all';
  const labelClass = 'text-navy-200 text-sm font-semibold mb-2 flex items-center gap-2';

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-50 mb-1">تغيير كلمة المرور</h1>
        <p className="text-navy-400 text-sm">غيّر كلمة مرور حسابك للحفاظ على أمان لوحة التحكم</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 max-w-lg">
        {/* Current password */}
        <div>
          <label className={labelClass}>
            <Lock size={16} className="text-gold-400" />
            كلمة المرور الحالية
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className={inputClass}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className={labelClass}>
            <Lock size={16} className="text-gold-400" />
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="12 حرف على الأقل"
              className={inputClass}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-navy-500 text-xs mt-1.5">لازم 12 حرف على الأقل</p>
        </div>

        {/* Confirm password */}
        <div>
          <label className={labelClass}>
            <Lock size={16} className="text-gold-400" />
            تأكيد كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={inputClass}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            <Check size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-6 py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] glow-gold-hover"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
          {loading ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}
        </button>
      </form>
    </div>
  );
}
