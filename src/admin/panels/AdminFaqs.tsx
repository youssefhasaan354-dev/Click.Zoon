import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Faq } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, AddButton, DeleteButton, OrderButton } from '@/admin/ui';

export default function AdminFaqs() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('faqs').select('*').order('sort_order');
    setItems((data as Faq[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => {
    setEditing({ id: '', question: '', answer: '', sort_order: items.length + 1 });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('faqs').update({
        question: editing.question,
        answer: editing.answer,
        sort_order: editing.sort_order,
      }).eq('id', editing.id);
    } else {
      await supabase.from('faqs').insert({
        question: editing.question,
        answer: editing.answer,
        sort_order: editing.sort_order,
      });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('faqs').delete().eq('id', id);
    load();
  };

  const move = async (item: Faq, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx > 0) {
      const target = sorted[idx - 1];
      await Promise.all([
        supabase.from('faqs').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('faqs').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const target = sorted[idx + 1];
      await Promise.all([
        supabase.from('faqs').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('faqs').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    }
    load();
  };

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="الأسئلة الشائعة" subtitle="إضافة وتعديل وحذف وترتيب الأسئلة" />
      <AddButton onAdd={startAdd} label="إضافة سؤال" />

      {editing && (
        <AdminCard className="mb-4 border-gold-500/30">
          <div className="space-y-4">
            <AdminInput label="السؤال" value={editing.question} onChange={(v) => setEditing({ ...editing, question: v })} />
            <AdminTextarea label="الإجابة" value={editing.answer} onChange={(v) => setEditing({ ...editing, answer: v })} rows={3} />
            <div className="flex gap-3">
              <button onClick={save} disabled={saving} className="bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm">
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
              <button onClick={() => setEditing(null)} className="text-navy-300 hover:text-navy-50 px-4 py-2.5 text-sm font-semibold">إلغاء</button>
            </div>
          </div>
        </AdminCard>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <AdminCard key={item.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-navy-50 font-bold text-sm">{item.question}</div>
              <div className="text-navy-400 text-xs truncate">{item.answer}</div>
            </div>
            <div className="flex items-center gap-1">
              <OrderButton direction="up" onClick={() => move(item, 'up')} />
              <OrderButton direction="down" onClick={() => move(item, 'down')} />
              <button onClick={() => setEditing(item)} className="text-navy-300 hover:text-gold-400 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all">تعديل</button>
              <DeleteButton onDelete={() => remove(item.id)} />
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
