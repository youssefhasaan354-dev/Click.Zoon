# Click Zoon — منصة وكالة تصميم وتطوير المواقع

موقع تسويقي متكامل لوكالة **Click Zoon** المتخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية للأنشطة التجارية في المنصورة والدقهلية وجميع أنحاء مصر، مع لوحة تحكم إدارية (`/admin`)، حسابات للعملاء (`/auth`, `/account`, `/my-requests`)، ونظام حماية ومتابعة لطلبات الديمو.

---

## المتطلبات التقنية

- Node.js 18 أو أحدث
- npm أو pnpm
- حساب مشروع على [Supabase](https://supabase.com)

---

## إعداد متغيرات البيئة (`.env`)

انسخ `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

| المتغير | الوصف | إلزامي؟ |
|---|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase الخاص بك | نعم |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام (Anon Public Key) | نعم |
| `VITE_SITE_URL` | الدومين النهائي (مثال: `https://click-zoon.vercel.app`) | نعم |
| `VITE_TURNSTILE_SITE_KEY` | المفتاح العام لـ Cloudflare Turnstile لحماية النماذج من البوتات | اختياري (موصى به) |
| `VITE_GA_ID` | معرّف Google Analytics (مثل `G-XXXXXXXXXX`) | اختياري |

### متغيرات بيئة الـ Supabase Edge Functions (Secrets):
يتم ضبطها في لوحة تحكم Supabase (`Project Settings` -> `Edge Functions` -> `Secrets`):
- `TURNSTILE_SECRET_KEY`: المفتاح السري لـ Cloudflare Turnstile للتحقق من التوكن server-side.
- `WEBHOOK_SECRET`: كلمة سرية لتأمين استدعاء الـ webhook الخاصة بـ `notify-new-request` (يعمل بنظام Fail-Closed).
- `TELEGRAM_BOT_TOKEN`: توكن بوت تيليجرام لإرسال إشعارات فورية بالطلبات الجديدة.
- `TELEGRAM_CHAT_ID`: معرّف المحادثة أو القناة المستلمة للإشعارات.

---

## سجل الـ Migrations لقاعدة البيانات (بالترتيب)

عند إعداد مشروع Supabase، شغّل ملفات الـ SQL الموجودة داخل `supabase/migrations/` بالترتيب:

1. `20261010200404_create_demo_requests.sql` — إنشاء جدول طلبات الديمو والتواصل
2. `20261010201926_create_admin_dashboard_tables.sql` — جداول المحتوى الديناميكي وجدول الإداريين
3. `20261010202205_create_portfolio_storage_bucket.sql` — إعداد Storage Bucket لمعرض الأعمال
4. `20261011065632_fix_rls_infinite_recursion.sql` — إصلاح استدعاءات RLS المتكررة عبر `is_admin()`
5. `20261011084044_add_backup_restore_policies.sql` — سياسات النسخ الاحتياطي والاستعادة
6. `20261011194748_add_about_map_ga_fields.sql` — إضافة حقول الخريطة والتحليلات وبيانات من نحن
7. `20261011200224_create_profiles_and_customer_auth.sql` — حسابات العملاء وجدول profiles
8. `20261012080932_create_admin_profile.sql` — إنشاء الملف الشخصي للإداري
9. `20261012080951_restrict_trigger_function_access.sql` — تشديد أمان دوال الـ Triggers
10. `20261012082027_fix_trigger_phone_constraint.sql` — ضبط قيود أرقام الهواتف
11. `20261012085206_add_message_source_to_demo_requests.sql` — إضافة حقول مصادر الطلبات ورسائل الواتساب
12. `20261014100000_fix_typo_in_site_settings.sql` — تصحيح حقول الإعدادات
13. `20261014110000_add_demo_requests_spam_protection.sql` — حماية الطلبات ومعدل التكرار (Rate Limiting)
14. `20261014120000_create_testimonials.sql` — جدول آراء وتقييمات العملاء
15. `20261014130000_support_oauth_user_profiles.sql` — دعم تسجيل الدخول بحساب Google (OAuth)
16. `20261016140000_secure_admin_user_id_check.sql` — تأمين صلاحيات الإدارة عبر `user_id` مع اشتراط تأكيد البريد الإلكتروني، وتوسيع مصادر الطلبات

---

## تشغيل المشروع محلياً

```bash
# تثبيت الحزم
npm install

# تشغيل خادم التطوير
npm run dev

# فحص الأنواع (TypeScript)
npm run typecheck

# فحص الكود والتنسيق (ESLint)
npm run lint

# بناء نسخة الإنتاج
npm run build
```

---

## الحماية والأمان

1. **إدارة صلاحيات المشرفين (`is_admin`)**:
   - الفحص يعتمد على `auth.uid()` ومطابقة `user_id` في جدول `admins`، مع اشتراط أن يكون البريد الإلكتروني مؤكداً (`email_confirmed_at IS NOT NULL`). هذا يمنع أي محاولة لانتحال إيميل المشرف عبر التسجيل الذاتي أو الـ OAuth.
2. **حماية النماذج وطلبات الديمو**:
   - حقل خفي فخ للبوتات (Honeypot).
   - التحقق من صيغة أرقام الموبايل المصرية وتحويل الأرقام العربية-المشرقية (٠-٩) إلى أرقام لاتينية.
   - دعم التحقق الذكي عبر Cloudflare Turnstile server-side عبر Supabase Edge Function (`submit-demo-request`).
   - قيود معدل التكرار في قاعدة البيانات (Rate Limiting Trigger).
3. **أمان الإشعارات (Fail-Closed)**:
   - الدالة السحابية `notify-new-request` ترفض أي استدعاء عند عدم تعيين `WEBHOOK_SECRET` لضمان عدم تسريب الإشعارات.
4. **أمان المتصفح (CSP & Security Headers)**:
   - تفعيل `Content-Security-Policy`، `Strict-Transport-Security`، `X-Frame-Options`، وسياسات التخزين المؤقت للأصول والخطوط في `vercel.json`.

---

## التقنيات المستخدمة

- **الواجهة الأمامية**: React 18, TypeScript, Vite
- **التصميم والتنسيق**: Tailwind CSS, خط القاهرة (Cairo) مستضاف ذاتياً (Self-Hosted WOFF2)
- **الحركة والتفاعلات**: Framer Motion
- **قاعدة البيانات والمصادقة**: Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **الأيقونات**: Lucide React
