import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { HeroContent } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, SaveButton, SaveIndicator } from '@/admin/ui';

export default function AdminHero() {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('hero_content').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setHero(data as HeroContent);
    });
  }, []);

  const handleSave = async () => {
    if (!hero) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error } = await supabase.from('hero_content').update({
      badge_text: hero.badge_text,
      headline_line1: hero.headline_line1,
      rotating_words: hero.rotating_words,
      headline_line2: hero.headline_line2,
      subtitle: hero.subtitle,
      cta_primary: hero.cta_primary,
      cta_secondary: hero.cta_secondary,
    }).eq('id', 1);
    setSaving(false);
    if (error) { setError('تعذر الحفظ'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!hero) return <div className="text-navy-400">جارٍ التحميل...</div>;

  const set = (key: keyof HeroContent, value: string | string[]) =>
    setHero({ ...hero, [key]: value });

  return (
    <div>
      <AdminPageHeader title="قسم الهيرو" subtitle="العنوان الرئيسي، الكلمات المتحركة، الفقرة، والأزرار" />
      <div className="space-y-6">
        <AdminCard>
          <div className="space-y-4">
            <AdminInput label="نص الشارة (Badge)" value={hero.badge_text} onChange={(v) => set('badge_text', v)} />
            <AdminInput label="السطر الأول من العنوان" value={hero.headline_line1} onChange={(v) => set('headline_line1', v)} />
            <div>
              <label className="text-navy-200 text-sm font-semibold mb-2 block">
                الكلمات المتحركة (افصل بينها بفاصلة)
              </label>
              <input
                type="text"
                value={hero.rotating_words.join('، ')}
                onChange={(e) => set('rotating_words', e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))}
                className="w-full bg-navy-800/60 border border-navy-600/40 rounded-xl px-4 py-2.5 text-navy-50 placeholder-navy-400 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all text-sm"
                dir="rtl"
              />
              <p className="text-navy-500 text-xs mt-1">اكتب الكلمات مفصولة بفاصلة، مثال: مطعمك، كافيهك، محلك</p>
            </div>
            <AdminInput label="السطر الثاني من العنوان" value={hero.headline_line2} onChange={(v) => set('headline_line2', v)} />
            <AdminTextarea label="الفقرة" value={hero.subtitle} onChange={(v) => set('subtitle', v)} rows={3} />
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminInput label="نص الزر الأساسي" value={hero.cta_primary} onChange={(v) => set('cta_primary', v)} />
              <AdminInput label="نص الزر الثانوي" value={hero.cta_secondary} onChange={(v) => set('cta_secondary', v)} />
            </div>
          </div>
        </AdminCard>

        <div className="flex items-center gap-4">
          <SaveButton onSave={handleSave} saving={saving} />
          <SaveIndicator saved={saved} error={error} />
        </div>
      </div>
    </div>
  );
}
