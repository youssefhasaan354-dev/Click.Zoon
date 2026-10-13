import { useState, useRef } from 'react';
import { Download, Upload, Loader2, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, AdminCard } from '@/admin/ui';

type Json = Record<string, unknown>;

const TABLES = [
  'site_settings',
  'hero_content',
  'features',
  'services',
  'portfolio_items',
  'process_steps',
  'pricing_plans',
  'faqs',
  'section_visibility',
  'demo_requests',
] as const;

type TableName = (typeof TABLES)[number];

const SKIP_CREATED_AT = new Set<TableName>(['demo_requests']);

export default function AdminBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const data: Record<string, Json[]> = {};
      for (const table of TABLES) {
        const { data: rows, error } = await supabase.from(table).select('*');
        if (error) throw new Error(`خطأ في قراءة جدول ${table}: ${error.message}`);
        data[table] = rows ?? [];
      }
      const blob = new Blob([JSON.stringify({ version: 1, exported_at: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clickzoon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'تم تصدير النسخة الاحتياطية بنجاح' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ غير متوقع' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data || typeof parsed.data !== 'object') {
        throw new Error('ملف غير صالح: التنسيق غير صحيح');
      }
      const backupData = parsed.data as Record<string, Json[]>;

      for (const table of TABLES) {
        const rows = backupData[table];
        if (!Array.isArray(rows)) continue;

        // Delete existing rows
        const { error: delErr } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delErr) throw new Error(`خطأ في مسح جدول ${table}: ${delErr.message}`);

        if (rows.length === 0) continue;

        // Strip created_at from tables that don't need it (DB will default)
        const cleaned = SKIP_CREATED_AT.has(table)
          ? rows.map((r) => {
              const { created_at: _cc, ...rest } = r as Record<string, unknown>;
              void _cc;
              return rest;
            })
          : rows;

        const { error: insErr } = await supabase.from(table).insert(cleaned as Record<string, unknown>[]);
        if (insErr) throw new Error(`خطأ في استيراد جدول ${table}: ${insErr.message}`);
      }

      setMessage({ type: 'success', text: 'تم استيراد النسخة الاحتياطية بنجاح — أعد تحميل الصفحة لرؤية التغييرات' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ غير متوقع' });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <AdminPageHeader title="نسخة احتياطية" subtitle="تصدير واستيراد بيانات الموقع كملف JSON" />

      {message && (
        <div className={`mb-5 flex items-start gap-3 rounded-xl p-4 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success'
            ? <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />
            : <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />}
          <span className={`text-sm ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
            {message.text}
          </span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Export */}
        <AdminCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <Download size={24} className="text-gold-400" />
            </div>
            <div>
              <h3 className="text-navy-50 font-bold">تصدير نسخة احتياطية</h3>
              <p className="text-navy-400 text-sm">ينزّل كل جداول المحتوى والطلبات كملف JSON</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-5 py-3 rounded-xl transition-all"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {exporting ? 'جارٍ التصدير...' : 'تصدير الآن'}
          </button>
        </AdminCard>

        {/* Import */}
        <AdminCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Upload size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-navy-50 font-bold">استيراد نسخة احتياطية</h3>
              <p className="text-navy-400 text-sm">يرجّع البيانات من ملف JSON — سيستبدل المحتوى الحالي</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="w-full inline-flex items-center justify-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 disabled:opacity-60 text-navy-50 font-bold px-5 py-3 rounded-xl transition-all"
          >
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {importing ? 'جارٍ الاستيراد...' : 'اختر ملف'}
          </button>
        </AdminCard>
      </div>

      {/* Tables list */}
      <AdminCard className="mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={18} className="text-gold-400" />
          <h3 className="text-navy-50 font-bold text-sm">الجداول المشمولة في النسخة</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TABLES.map((t) => (
            <div key={t} className="text-navy-300 text-xs bg-navy-800/40 rounded-lg px-3 py-2 font-mono" dir="ltr">
              {t}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-navy-400 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-gold-400" />
          <span>الاستيراد يستبدل كل البيانات الحالية في الجداول المشمولة. تأكد من تصدير نسخة قبل الاستيراد.</span>
        </div>
      </AdminCard>
    </div>
  );
}
