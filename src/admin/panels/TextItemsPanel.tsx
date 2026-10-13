import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, AddButton, DeleteButton, OrderButton } from '@/admin/ui';
import { AVAILABLE_ICON_NAMES, getIcon } from '@/lib/icons';

interface TextItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
  sort_order: number;
}

interface Props {
  table: string;
  title: string;
  subtitle: string;
  hasIcon: boolean;
}

export default function TextItemsPanel({ table, title, subtitle, hasIcon }: Props) {
  const [items, setItems] = useState<TextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TextItem | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from(table).select('*').order('sort_order');
    setItems((data as TextItem[]) ?? []);
    setLoading(false);
  }, [table]);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => {
    setEditing({
      id: '',
      icon: 'Award',
      title: '',
      description: '',
      sort_order: items.length + 1,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from(table).update({
        icon: editing.icon,
        title: editing.title,
        description: editing.description,
        sort_order: editing.sort_order,
      }).eq('id', editing.id);
    } else {
      await supabase.from(table).insert({
        icon: editing.icon,
        title: editing.title,
        description: editing.description,
        sort_order: editing.sort_order,
      });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from(table).delete().eq('id', id);
    load();
  };

  const move = async (item: TextItem, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx > 0) {
      const target = sorted[idx - 1];
      await Promise.all([
        supabase.from(table).update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from(table).update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const target = sorted[idx + 1];
      await Promise.all([
        supabase.from(table).update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from(table).update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    }
    load();
  };

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title={title} subtitle={subtitle} />
      <AddButton onAdd={startAdd} label="إضافة عنصر" />

      {editing && (
        <AdminCard className="mb-4 border-gold-500/30">
          <div className="space-y-4">
            {hasIcon && (
              <div>
                <label className="text-navy-200 text-sm font-semibold mb-2 block">الأيقونة (lucide-react)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-800/80 border border-navy-600/40 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = getIcon(editing.icon || '');
                      return <Icon size={20} className="text-gold-400" />;
                    })()}
                  </div>
                  <select
                    value={editing.icon || 'Award'}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm"
                    dir="ltr"
                  >
                    {AVAILABLE_ICON_NAMES.map((name) => (
                      <option key={name} value={name} className="bg-navy-900 text-navy-50">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-navy-500 text-xs mt-1.5">
                  الأيقونات المتاحة: {AVAILABLE_ICON_NAMES.join('، ')}
                </p>
              </div>
            )}
            <AdminInput label="العنوان" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <AdminTextarea label="الوصف" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={2} />
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
        {items.map((item) => {
          const ItemIcon = hasIcon ? getIcon(item.icon || '') : null;
          return (
            <AdminCard key={item.id} className="flex items-center gap-3">
              {ItemIcon && (
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                  <ItemIcon size={20} className="text-gold-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-navy-50 font-bold text-sm">{item.title}</div>
                <div className="text-navy-400 text-xs truncate">{item.description}</div>
              </div>
              <div className="flex items-center gap-1">
                <OrderButton direction="up" onClick={() => move(item, 'up')} />
                <OrderButton direction="down" onClick={() => move(item, 'down')} />
                <button onClick={() => setEditing(item)} className="text-navy-300 hover:text-gold-400 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all">تعديل</button>
                <DeleteButton onDelete={() => remove(item.id)} />
              </div>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
