import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings, AboutStat } from '@/lib/types';
import { AdminPageHeader, AdminCard, AdminInput, AdminTextarea, AdminToggle, SaveButton, SaveIndicator } from '@/admin/ui';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error } = await supabase.from('site_settings').update({
      site_name: settings.site_name,
      site_name_ar: settings.site_name_ar,
      logo_text: settings.logo_text,
      phone: settings.phone,
      phone_intl: settings.phone_intl,
      email: settings.email,
      location: settings.location,
      facebook: settings.facebook,
      instagram: settings.instagram,
      footer_text: settings.footer_text,
      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      seo_og_image: settings.seo_og_image,
      promo_bar_text: settings.promo_bar_text,
      demo_min_hours: settings.demo_min_hours,
      demo_max_hours: settings.demo_max_hours,
      show_prices: settings.show_prices,
      about_title: settings.about_title,
      about_text: settings.about_text,
      about_image_url: settings.about_image_url,
      about_stats: settings.about_stats,
      map_embed_url: settings.map_embed_url,
      google_analytics_id: settings.google_analytics_id,
    }).eq('id', 1);
    setSaving(false);
    if (error) { setError('تعذر حفظ الإعدادات'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <div className="text-navy-400">جارٍ التحميل...</div>;

  const set = (key: keyof SiteSettings, value: string | number | boolean) =>
    setSettings({ ...settings, [key]: value });

  return (
    <div>
      <AdminPageHeader title="إعدادات الموقع العامة" subtitle="اسم الموقع، الشعار، بيانات التواصل، السوشيال ميديا، و SEO" />
      <div className="space-y-6">
        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">الهوية</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminInput label="اسم الموقع (إنجليزي)" value={settings.site_name} onChange={(v) => set('site_name', v)} dir="ltr" />
            <AdminInput label="اسم الموقع (عربي)" value={settings.site_name_ar} onChange={(v) => set('site_name_ar', v)} />
            <AdminInput label="نص الشعار" value={settings.logo_text} onChange={(v) => set('logo_text', v)} dir="ltr" />
            <AdminInput label="نص الشريط العلوي" value={settings.promo_bar_text} onChange={(v) => set('promo_bar_text', v)} />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">بيانات التواصل</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminInput label="رقم الهاتف" value={settings.phone} onChange={(v) => set('phone', v)} dir="ltr" />
            <AdminInput label="رقم الهاتف دولي (واتساب)" value={settings.phone_intl} onChange={(v) => set('phone_intl', v)} dir="ltr" />
            <AdminInput label="البريد الإلكتروني" value={settings.email} onChange={(v) => set('email', v)} dir="ltr" />
            <AdminInput label="الموقع" value={settings.location} onChange={(v) => set('location', v)} />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">روابط السوشيال ميديا</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminInput label="فيسبوك" value={settings.facebook} onChange={(v) => set('facebook', v)} dir="ltr" />
            <AdminInput label="إنستجرام" value={settings.instagram} onChange={(v) => set('instagram', v)} dir="ltr" />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">إعدادات الديمو</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminInput label="أقل مدة (ساعات)" type="number" value={String(settings.demo_min_hours)} onChange={(v) => set('demo_min_hours', parseInt(v) || 24)} dir="ltr" />
            <AdminInput label="أقصى مدة (ساعات)" type="number" value={String(settings.demo_max_hours)} onChange={(v) => set('demo_max_hours', parseInt(v) || 72)} dir="ltr" />
          </div>
          <div className="mt-4">
            <AdminToggle label="إظهار الأسعار في الباقات" checked={settings.show_prices} onChange={(v) => set('show_prices', v)} />
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">قسم من نحن</h3>
          <div className="space-y-4">
            <AdminInput label="عنوان القسم" value={settings.about_title} onChange={(v) => set('about_title', v)} />
            <AdminTextarea label="نص التعريف" value={settings.about_text} onChange={(v) => set('about_text', v)} rows={3} />
            <AdminInput label="رابط صورة (اختياري)" value={settings.about_image_url} onChange={(v) => set('about_image_url', v)} dir="ltr" />
            <AdminTextarea
              label="أرقام (JSON)"
              value={JSON.stringify(settings.about_stats ?? [], null, 2)}
              onChange={(v) => {
                try { set('about_stats', JSON.parse(v)); } catch { /* ignore invalid JSON while typing */ }
              }}
              rows={4}
              dir="ltr"
            />
            <p className="text-navy-500 text-xs">صيغة: {`[{"value": 50, "suffix": "+", "label": "عميل"}]`}</p>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">الخريطة والتتبع</h3>
          <div className="space-y-4">
            <AdminTextarea label="رابط Google Maps Embed (اختياري)" value={settings.map_embed_url} onChange={(v) => set('map_embed_url', v)} rows={2} dir="ltr" />
            <p className="text-navy-500 text-xs">ألصق رابط embed من Google Maps. لو فاضي، الخريطة مش هتظهر.</p>
            <AdminInput label="Google Analytics ID" value={settings.google_analytics_id} onChange={(v) => set('google_analytics_id', v)} dir="ltr" />
            <p className="text-navy-500 text-xs">مثال: G-XXXXXXXXXX. لو فاضي، التتبع معطل.</p>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">نص الفوتر</h3>
          <AdminTextarea label="نص الفوتر" value={settings.footer_text} onChange={(v) => set('footer_text', v)} rows={3} />
        </AdminCard>

        <AdminCard>
          <h3 className="text-navy-50 font-bold mb-4">SEO</h3>
          <div className="space-y-4">
            <AdminInput label="عنوان SEO" value={settings.seo_title} onChange={(v) => set('seo_title', v)} dir="ltr" />
            <AdminTextarea label="وصف SEO" value={settings.seo_description} onChange={(v) => set('seo_description', v)} rows={2} />
            <AdminInput label="رابط صورة المشاركة (OG Image)" value={settings.seo_og_image} onChange={(v) => set('seo_og_image', v)} dir="ltr" />
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
