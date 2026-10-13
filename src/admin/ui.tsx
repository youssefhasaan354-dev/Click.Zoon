import { ReactNode } from 'react';
import { Loader2, Save } from 'lucide-react';

export function AdminPageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-navy-50">{title}</h1>
      {subtitle && <p className="text-navy-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>{children}</div>
  );
}

export function AdminInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <div>
      <label className="text-navy-200 text-sm font-semibold mb-2 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm"
      />
    </div>
  );
}

export function AdminTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-navy-200 text-sm font-semibold mb-2 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm resize-none"
      />
    </div>
  );
}

export function AdminToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-gold-500' : 'bg-navy-600'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
            checked ? 'right-0.5' : 'right-5'
          }`}
        />
      </button>
      <span className="text-navy-200 text-sm font-semibold">{label}</span>
    </label>
  );
}

export function SaveButton({
  onSave,
  saving,
  label = 'حفظ',
}: {
  onSave: () => void;
  saving: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onSave}
      disabled={saving}
      className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
    >
      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {saving ? 'جارٍ الحفظ...' : label}
    </button>
  );
}

export function SaveIndicator({ saved, error }: { saved: boolean; error: string | null }) {
  if (!saved && !error) return null;
  return (
    <span className={`text-sm ${error ? 'text-red-300' : 'text-green-400'}`}>
      {error || 'تم الحفظ بنجاح'}
    </span>
  );
}

export function DeleteButton({ onDelete, label = 'حذف' }: { onDelete: () => void; label?: string }) {
  return (
    <button
      onClick={onDelete}
      className="text-red-300 hover:text-red-200 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
    >
      {label}
    </button>
  );
}

export function AddButton({ onAdd, label = 'إضافة' }: { onAdd: () => void; label?: string }) {
  return (
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 text-navy-50 font-semibold px-4 py-2 rounded-lg transition-all text-sm mb-4"
    >
      + {label}
    </button>
  );
}

export function OrderButton({
  direction,
  onClick,
}: {
  direction: 'up' | 'down';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-navy-400 hover:text-gold-400 p-1 transition-colors"
      aria-label={direction === 'up' ? 'تحريك لأعلى' : 'تحريك لأسفل'}
    >
      {direction === 'up' ? '↑' : '↓'}
    </button>
  );
}
