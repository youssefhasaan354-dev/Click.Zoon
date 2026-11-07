import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PortfolioItem } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, AdminToggle, AddButton, DeleteButton, OrderButton } from '@/admin/ui';
import { Upload, Loader2, Sparkles } from 'lucide-react';

const categories = [
  { key: 'restaurants', label: 'مطاعم' },
  { key: 'stores', label: 'متاجر' },
  { key: 'cafes', label: 'كافيهات' },
  { key: 'medical', label: 'طبي' },
  { key: 'business', label: 'شركات وخدمات' },
];

const kinds = [
  { key: 'website', label: 'موقع' },
  { key: 'app', label: 'برنامج / تطبيق' },
  { key: 'store', label: 'متجر إلكتروني' },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
      slug: '',
      kind: 'website',
      tagline: '',
      long_description: '',
      features: [],
      screenshots: [],
      icon_url: null,
      visible: true,
      sort_order: items.length + 1,
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.image_url.trim()) {
      alert('اكتب عنوان المشروع وأضف صورة له على الأقل.');
      return;
    }
    setSaving(true);
    const slug = slugify(editing.slug || '') || null;
    const payload = {
      title: editing.title.trim(),
      category: editing.category,
      description: editing.description,
      image_url: editing.image_url,
      link: editing.link,
      live_url: editing.live_url || editing.link,
      slug,
      kind: editing.kind ?? 'website',
      tagline: editing.tagline ?? '',
      long_description: editing.long_description ?? '',
      features: (editing.features ?? []).map((f) => f.trim()).filter(Boolean),
      screenshots: editing.screenshots ?? [],
      icon_url: editing.icon_url || null,
      visible: editing.visible,
      sort_order: editing.sort_order,
    };

    const { error } = editing.id
      ? await supabase.from('portfolio_items').update(payload).eq('id', editing.id)
      : await supabase.from('portfolio_items').insert(payload);

    setSaving(false);
    if (error) {
      console.error('portfolio save failed:', error);
      alert(
        error.code === '23505'
          ? 'الرابط المختصر (slug) مستخدم في مشروع آخر. غيّره وجرب تاني.'
          : `تعذر الحفظ: ${error.message}\nتأكد إنك شغّلت آخر migration في Supabase.`
      );
      return;
    }
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

  const uploadToBucket = async (file: File): Promise<string | null> => {
    try {
      const optimizedFile = await compressImageToWebp(file);
      const fileName = `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, optimizedFile, { contentType: 'image/webp' });
      if (uploadError) {
        alert('تعذر رفع الصورة إلى التخزين. يرجى التحقق من اتصالك أو إعدادات التخزين.');
        return null;
      }
      return supabase.storage.from('portfolio-images').getPublicUrl(fileName).data.publicUrl;
    } catch {
      alert('حدث خطأ أثناء معالجة الصورة.');
      return null;
    }
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const url = await uploadToBucket(file);
    if (url) setEditing({ ...editing, image_url: url });
    setUploading(false);
  };

  const uploadIcon = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const url = await uploadToBucket(file);
    if (url) setEditing({ ...editing, icon_url: url });
    setUploading(false);
  };

  const uploadScreenshots = async (files: FileList) => {
    if (!editing) return;
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const url = await uploadToBucket(f);
      if (url) urls.push(url);
    }
    setEditing((cur) => (cur ? { ...cur, screenshots: [...(cur.screenshots ?? []), ...urls] } : cur));
    setUploading(false);
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
            <AdminTextarea label="الوصف المختصر (يظهر في الكارت)" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} rows={2} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-navy-200 text-sm font-semibold mb-2 block">النوع</label>
                <select
                  value={editing.kind ?? 'website'}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value as 'website' | 'app' | 'store' })}
                  className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 focus:border-gold-500/50 focus:outline-none text-sm"
                >
                  {kinds.map((k) => (
                    <option key={k.key} value={k.key}>{k.label}</option>
                  ))}
                </select>
              </div>
              <AdminInput label="الرابط المختصر (إنجليزي) مثال: delano-cafe" value={editing.slug ?? ''} onChange={(v) => setEditing({ ...editing, slug: v })} dir="ltr" />
            </div>
            <AdminInput label="سطر تعريفي قصير تحت الاسم" value={editing.tagline ?? ''} onChange={(v) => setEditing({ ...editing, tagline: v })} />
            <AdminTextarea label="وصف تفصيلي (صفحة المشروع)" value={editing.long_description ?? ''} onChange={(v) => setEditing({ ...editing, long_description: v })} rows={4} />
            <AdminTextarea label="المميزات (كل ميزة في سطر)" value={(editing.features ?? []).join('\n')} onChange={(v) => setEditing({ ...editing, features: v.split('\n') })} rows={4} />
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

            {/* Icon */}
            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block">أيقونة المشروع (مربعة — اختياري)</label>
              <div className="flex items-center gap-3">
                {editing.icon_url && (
                  <img src={editing.icon_url} alt="icon" className="w-14 h-14 rounded-2xl object-cover border border-navy-600/40" />
                )}
                <label className="inline-flex items-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 text-navy-50 font-semibold px-4 py-2 rounded-lg transition-all text-sm cursor-pointer">
                  <Upload size={16} />
                  رفع أيقونة
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadIcon(f); }} />
                </label>
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block">صور الموقع / البرنامج (لقطات الشاشة)</label>
              {(editing.screenshots ?? []).length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {(editing.screenshots ?? []).map((src, idx) => (
                    <div key={src + idx} className="relative shrink-0">
                      <img src={src} alt={`screenshot ${idx + 1}`} className="h-28 rounded-lg border border-navy-600/40" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, screenshots: (editing.screenshots ?? []).filter((_, i) => i !== idx) })}
                        className="absolute top-1 left-1 bg-red-500/90 text-white text-xs rounded-full w-5 h-5 leading-5 text-center"
                        aria-label="حذف الصورة"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="inline-flex items-center gap-2 bg-navy-700/50 hover:bg-navy-700 border border-navy-600 text-navy-50 font-semibold px-4 py-2 rounded-lg transition-all text-sm cursor-pointer">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'جارٍ الرفع...' : 'رفع صور (يمكن اختيار أكثر من صورة)'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) uploadScreenshots(e.target.files); }} />
              </label>
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
