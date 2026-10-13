import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SectionVisibility } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminToggle } from '@/admin/ui';
import { AlertCircle } from 'lucide-react';

export default function AdminSections() {
  const [sections, setSections] = useState<SectionVisibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('section_visibility').select('*').order('id');
    if (error) {
      setError('فشل تحميل البيانات. حاول مرة أخرى.');
    } else {
      setSections((data as SectionVisibility[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id: string, visible: boolean) => {
    setError(null);
    setSections(sections.map((s) => s.id === id ? { ...s, visible } : s));
    const { error } = await supabase.from('section_visibility').update({ visible }).eq('id', id);
    if (error) {
      setError(`فشل حفظ التغيير: ${error.message}`);
      setSections(sections.map((s) => s.id === id ? { ...s, visible: !visible } : s));
    }
  };

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="إظهار وإخفاء الأقسام" subtitle="تحكّم في ظهور أقسام الموقع" />
      {error && (
        <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-3">
        {sections.map((section) => (
          <AdminCard key={section.id} className="flex items-center justify-between">
            <span className="text-navy-50 font-bold text-sm">{section.label}</span>
            <AdminToggle label={section.visible ? 'ظاهر' : 'مخفي'} checked={section.visible} onChange={(v) => toggle(section.id, v)} />
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
