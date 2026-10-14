import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/lib/types';
import {
  AdminPageHeader,
  AdminCard,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AddButton,
  DeleteButton,
  OrderButton,
} from '@/admin/ui';
import { Star } from 'lucide-react';

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order');
    setItems((data as Testimonial[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startAdd = () => {
    setEditing({
      id: '',
      name: '',
      business: '',
      text: '',
      rating: 5,
      visible: true,
      sort_order: items.length + 1,
    });
  };

  const save = async () => {
    if (!editing || !editing.name.trim() || !editing.text.trim()) return;
    setSaving(true);
    if (editing.id) {
      await supabase
        .from('testimonials')
        .update({
          name: editing.name.trim(),
          business: editing.business.trim(),
          text: editing.text.trim(),
          rating: Math.min(5, Math.max(1, editing.rating || 5)),
          visible: editing.visible,
          sort_order: editing.sort_order,
        })
        .eq('id', editing.id);
    } else {
      await supabase.from('testimonials').insert({
        name: editing.name.trim(),
        business: editing.business.trim(),
        text: editing.text.trim(),
        rating: Math.min(5, Math.max(1, editing.rating || 5)),
        visible: editing.visible,
        sort_order: editing.sort_order,
      });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  };

  const move = async (item: Testimonial, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx > 0) {
      const target = sorted[idx - 1];
      await Promise.all([
        supabase.from('testimonials').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('testimonials').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const target = sorted[idx + 1];
      await Promise.all([
        supabase.from('testimonials').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('testimonials').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    }
    load();
  };

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="آراء العملاء" subtitle="إضافة وتعديل وحذف وترتيب تقييمات العملاء" />
      <AddButton onAdd={startAdd} label="إضافة رأي عميل" />

      {editing && (
        <AdminCard className="mb-4 border-gold-500/30">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput
                label="اسم العميل *"
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
                placeholder="مثال: أحمد محمود"
              />
              <AdminInput
                label="النشاط / الصفة"
                value={editing.business}
                onChange={(v) => setEditing({ ...editing, business: v })}
                placeholder="مثال: صاحب كافيه، طبيب، متجر..."
              />
            </div>

            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block">التقييم (من 1 إلى 5 نجوم)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditing({ ...editing, rating: star })}
                    className="p-1 transition-transform hover:scale-110"
                    title={`${star} نجوم`}
                  >
                    <Star
                      size={24}
                      className={
                        star <= editing.rating
                          ? 'text-gold-400 fill-gold-400'
                          : 'text-navy-600'
                      }
                    />
                  </button>
                ))}
                <span className="text-navy-300 text-sm mr-2">{editing.rating} من 5</span>
              </div>
            </div>

            <AdminTextarea
              label="نص الرأي أو التقييم *"
              value={editing.text}
              onChange={(v) => setEditing({ ...editing, text: v })}
              rows={3}
              placeholder="اكتب ما قاله العميل عن تجربته مع كليك زون..."
            />

            <AdminToggle
              label="ظاهر في الموقع"
              checked={editing.visible}
              onChange={(v) => setEditing({ ...editing, visible: v })}
            />

            <div className="flex gap-3">
              <button
                onClick={save}
                disabled={saving || !editing.name.trim() || !editing.text.trim()}
                className="bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
              >
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="text-navy-300 hover:text-navy-50 px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </AdminCard>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-navy-400 text-sm">
            لا توجد آراء عملاء حالياً. اضغط "إضافة رأي عميل" لإضافة أول تقييم.
          </div>
        ) : (
          items.map((item) => (
            <AdminCard key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-navy-50 font-bold text-sm">{item.name}</span>
                  {item.business && <span className="text-navy-400 text-xs">({item.business})</span>}
                  <div className="flex gap-0.5 text-gold-400 text-xs">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-gold-400" />
                    ))}
                  </div>
                  {!item.visible && (
                    <span className="text-navy-500 text-xs bg-navy-800 px-2 py-0.5 rounded">مخفي</span>
                  )}
                </div>
                <div className="text-navy-300 text-xs leading-relaxed line-clamp-2">"{item.text}"</div>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center">
                <OrderButton direction="up" onClick={() => move(item, 'up')} />
                <OrderButton direction="down" onClick={() => move(item, 'down')} />
                <button
                  onClick={() => setEditing(item)}
                  className="text-navy-300 hover:text-gold-400 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                >
                  تعديل
                </button>
                <DeleteButton onDelete={() => remove(item.id)} />
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  );
}
