import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PricingPlan } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, AdminToggle, AddButton, DeleteButton, OrderButton } from '@/admin/ui';

export default function AdminPricing() {
  const [items, setItems] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('pricing_plans').select('*').order('sort_order');
    setItems((data as PricingPlan[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => {
    setEditing({
      id: '', name: '', tagline: '', price: '', features: [],
      highlighted: false, visible: true, sort_order: items.length + 1,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      name: editing.name,
      tagline: editing.tagline,
      price: editing.price,
      features: editing.features,
      highlighted: editing.highlighted,
      visible: editing.visible,
      sort_order: editing.sort_order,
    };
    if (editing.id) {
      await supabase.from('pricing_plans').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('pricing_plans').insert(payload);
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('pricing_plans').delete().eq('id', id);
    load();
  };

  const move = async (item: PricingPlan, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx > 0) {
      const target = sorted[idx - 1];
      await Promise.all([
        supabase.from('pricing_plans').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('pricing_plans').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const target = sorted[idx + 1];
      await Promise.all([
        supabase.from('pricing_plans').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('pricing_plans').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    }
    load();
  };

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="باقات الأسعار" subtitle="تعديل الباقات والمميزات والأسعار" />
      <AddButton onAdd={startAdd} label="إضافة باقة" />

      {editing && (
        <AdminCard className="mb-4 border-gold-500/30">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="اسم الباقة" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <AdminInput label="الوصف القصير" value={editing.tagline} onChange={(v) => setEditing({ ...editing, tagline: v })} />
            </div>
            <AdminInput label="السعر (اتركه فارغاً لإظهار اطلب عرض سعر)" value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} />
            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block">المميزات (كل ميزة في سطر)</label>
              <textarea
                value={editing.features.join('\n')}
                onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                rows={6}
                className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm resize-none"
              />
            </div>
            <div className="flex gap-6">
              <AdminToggle label="باقة مميزة" checked={editing.highlighted} onChange={(v) => setEditing({ ...editing, highlighted: v })} />
              <AdminToggle label="ظاهرة في الموقع" checked={editing.visible} onChange={(v) => setEditing({ ...editing, visible: v })} />
            </div>
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
              <div className="flex items-center gap-2">
                <span className="text-navy-50 font-bold text-sm">{item.name}</span>
                {item.highlighted && <span className="text-gold-300 text-xs bg-gold-500/10 px-2 py-0.5 rounded">مميزة</span>}
                {!item.visible && <span className="text-navy-500 text-xs bg-navy-800 px-2 py-0.5 rounded">مخفي</span>}
              </div>
              <div className="text-navy-400 text-xs">{item.tagline} — {item.features.length} ميزة</div>
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
