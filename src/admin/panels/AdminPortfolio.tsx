import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PortfolioItem } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, AdminToggle, AddButton, DeleteButton, OrderButton } from '@/admin/ui';
import { Upload, Loader2, Sparkles } from 'lucide-react';

const categories = [
  { key: 'restaurants', label: 'مطاعم' },
  { key: 'stores', label: 'متاجر' },
  { key: 'cafes', label: 'كافيهات' },
];

/**
 * Client-side WebP compression using HTML5 Canvas
 */
async function compressImageToWebp(file: File, maxWidth = 1280, quality = 0.85): Promise<File> {
  if (typeof window === 'undefined' || !window.HTMLCanvasElement) return file;

  return new Promise((resolve) => {
    const img = document.createElement('img');
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
              const newFile = new File([blob], newName, { type: 'image/webp' });
              resolve(newFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('sort_order');
    setItems((data as PortfolioItem[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => {
    setEditing({
      id: '',
      title: '',
      category: 'restaurants',
      description: '',
      image_url: '',
      link: null,
      live_url: null,
      visible: true,
      sort_order: items.length + 1,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      title: editing.title,
      category: editing.category,
      description: editing.description,
      image_url: editing.image_url,
      link: editing.link,
      live_url: editing.live_url || editing.link,
      visible: editing.visible,
      sort_order: editing.sort_order,
    };

    if (editing.id) {
      await supabase.from('portfolio_items').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('portfolio_items').insert(payload);
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    await supabase.from('portfolio_items').delete().eq('id', id);
    load();
  };

  const move = async (item: PortfolioItem, direction: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    if (direction === 'up' && idx > 0) {
      const target = sorted[idx - 1];
      await Promise.all([
        supabase.from('portfolio_items').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('portfolio_items').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const target = sorted[idx + 1];
      await Promise.all([
        supabase.from('portfolio_items').update({ sort_order: target.sort_order }).eq('id', item.id),
        supabase.from('portfolio_items').update({ sort_order: item.sort_order }).eq('id', target.id),
      ]);
    }
    load();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const optimizedFile = await compressImageToWebp(file);
      const fileName = `portfolio-${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, optimizedFile, { contentType: 'image/webp' });

      if (uploadError) {
        alert('تعذر رفع الصورة إلى التخزين. يرجى التحقق من اتصالك أو إعدادات التخزين.');
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      setEditing({ ...editing, image_url: urlData.publicUrl });
    } catch {
      alert('حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;

  return (
    <div>
      <AdminPageHeader title="أعمالنا" subtitle="إضافة وتعديل وحذف وترتيب المشاريع — مع ضغط WebP التلقائي" />
      <AddButton onAdd={startAdd} label="إضافة مشروع" />

      {editing && (
        <AdminCard className="mb-4 border-gold-500/30">
          <div className="space-y-4">
            <AdminInput label="عنوان المشروع" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block">التصنيف</label>
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 focus:border-gold-500/50 focus:outline-none text-sm"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <AdminTextarea label="الوصف" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={2} />
            <AdminInput label="رابط المشروع الحي (Live URL)" value={editing.live_url || editing.link || ''} onChange={(v) => setEditing({ ...editing, live_url: v || null, link: v || null })} dir="ltr" />

            {/* Image upload with WebP compression */}
            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block flex items-center justify-between">
                <span>صورة المشروع</span>
                <span className="text-[11px] text-gold-400 flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>يتم تحويلها لـ WebP مضغوطة تلقائياً</span>
                </span>
              </label>
              {editing.image_url && (
                <img src={editing.image_url} alt="preview" className="w-full h-40 object-cover rounded-xl mb-2 border border-navy-600/40" />
              )}
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 text-navy-50 font-semibold px-4 py-2 rounded-lg transition-all text-sm cursor-pointer">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'جارٍ الضغط والرفع...' : 'رفع صورة مضغوطة'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                  />
                </label>
                <input
                  type="url"
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  placeholder="أو الصق رابط صورة"
                  dir="ltr"
                  className="flex-1 bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none text-sm"
                />
              </div>
            </div>

            <AdminToggle label="ظاهر في الموقع" checked={editing.visible} onChange={(v) => setEditing({ ...editing, visible: v })} />

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
            <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-lg object-cover shrink-0 border border-navy-600/40" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-navy-50 font-bold text-sm">{item.title}</span>
                {!item.visible && <span className="text-navy-500 text-xs bg-navy-800 px-2 py-0.5 rounded">مخفي</span>}
              </div>
              <p className="text-navy-400 text-xs truncate">{item.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <OrderButton direction="up" onClick={() => move(item, 'up')} />
              <OrderButton direction="down" onClick={() => move(item, 'down')} />
              <button onClick={() => setEditing(item)} className="text-navy-400 hover:text-gold-400 px-2 py-1 text-xs font-semibold">تعديل</button>
              <DeleteButton onDelete={() => remove(item.id)} />
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
