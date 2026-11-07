# تقرير جرد النصوص العربية والتنسيقات الإقليمية (Phase 1 Inventory Report)

إجمالي الأسطر التي تحتوي على حروف عربية خارج `src/i18n/`: **688** سطر.
إجمالي استدعاءات التنسيق المثبتة على ar/ar-EG: **5** استدعاء.

## 1. التوزيع حسب النوع (Breakdown by Type)

| نوع النص | العدد | الوصف |
|---|---|---|
| **UI ظاهر** | 499 | نصوص JSX مباشرة، أزرار، عناوين، نصوص الـ Wizard، الباقات |
| **attribute** | 76 | placeholder, aria-label, title, alt |
| **validation** | 57 | رسائل تحقق الحقول، تنبيهات Toast، رسائل الأخطاء |
| **data-from-DB** | 51 | بيانات احتياطية/افتراضية مطابقة لجداول قاعدة البيانات |
| **ثابت مقصود** | 0 | ثوابت كاسم البراند أو الهوية |
| **تعليق برمجي** | 5 | تعليقات داخل الكود |

## 2. استدعاءات التنسيق المثبتة على ar/ar-EG (Hardcoded Locale Calls)

| الملف | السطر | الكود الحالي |
|---|---|---|
| `src/admin/panels/AdminCustomers.tsx` | 100 | `{new Date(c.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}` |
| `src/admin/panels/AdminDashboard.tsx` | 47 | `const dateStr = d.toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' });` |
| `src/admin/panels/AdminRequests.tsx` | 63 | `new Date(r.created_at).toLocaleString('ar-EG'),` |
| `src/admin/panels/AdminRequests.tsx` | 249 | `{new Date(req.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` |
| `src/components/QuoteWizard.tsx` | 434 | `{estimatedPrice.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} {t('quote_wizard.currency')}` |

## 3. جرد نصوص Supabase المعروضة للزائر (Supabase Tables & Columns Audit)

| الجدول | الأعمدة المعروضة | هل النص عربي فقط؟ | هل يوجد عمود إنجليزي؟ | الملاحظات والتأثير |
|---|---|---|---|---|
| `site_settings` | `site_name`, `site_name_ar`, `location`, `footer_text`, `promo_bar_text`, `seo_title`, `seo_description` | نعم (عربي فقط) | لا يوجد | site_name is English, site_name_ar is Arabic. All other text fields (location, footer_text, promo_bar_text, seo_*) are Arabic-only with no _en columns. |
| `hero_content` | `badge_text`, `headline_line1`, `rotating_words`, `headline_line2`, `subtitle`, `cta_primary`, `cta_secondary` | نعم (عربي فقط) | لا يوجد | All hero text columns and rotating_words array are Arabic-only with no _en columns. |
| `features` | `title`, `description` | نعم (عربي فقط) | لا يوجد | Arabic-only. No title_en or description_en. |
| `services` | `title`, `description` | نعم (عربي فقط) | لا يوجد | Arabic-only. No title_en or description_en. |
| `portfolio_items` | `title`, `category`, `description` | نعم (عربي فقط) | لا يوجد | Arabic-only. No title_en, description_en, or category_en. |
| `process_steps` | `title`, `description` | نعم (عربي فقط) | لا يوجد | Arabic-only. Used in Process section; causes step titles/descriptions to stay Arabic if fetched without language check. |
| `pricing_plans` | `name`, `tagline`, `features` | نعم (عربي فقط) | لا يوجد | Arabic-only. Features array contains Arabic strings. No _en columns. |
| `faqs` | `question`, `answer` | نعم (عربي فقط) | لا يوجد | Arabic-only. No question_en or answer_en. |
| `testimonials` | `client_name`, `role`, `company`, `content` | نعم (عربي فقط) | لا يوجد | Arabic-only. No _en columns. |
| `section_visibility` | `id`, `label`, `visible` | مختلط | لا يوجد | Controls section visibility boolean. Label is admin-only. |

## 4. قائمة الملفات الأكثر احتواءً على نصوص عربية

| الملف | عدد الأسطر العربية |
|---|---|
| `src/components/MockupsSection.tsx` | 83 |
| `src/admin/panels/AdminRequests.tsx` | 46 |
| `src/admin/panels/AdminPortfolio.tsx` | 40 |
| `src/pages/CaseStudy.tsx` | 40 |
| `src/pages/CustomerAuth.tsx` | 36 |
| `src/admin/panels/AdminSettings.tsx` | 35 |
| `src/pages/CustomerAccount.tsx` | 30 |
| `src/lib/showcase.ts` | 28 |
| `src/admin/panels/AdminBackup.tsx` | 26 |
| `src/pages/ResetPassword.tsx` | 26 |
| `src/siteConfig.ts` | 25 |
| `src/admin/AdminLayout.tsx` | 21 |
| `src/admin/panels/AdminTestimonials.tsx` | 18 |
| `index.html` | 18 |
| `src/admin/panels/AdminDashboard.tsx` | 15 |
| `src/admin/panels/AdminPricing.tsx` | 15 |
| `src/admin/AdminLogin.tsx` | 14 |
| `src/admin/panels/AdminChangePassword.tsx` | 13 |
| `src/admin/panels/AdminHero.tsx` | 13 |
| `src/pages/CustomerRequests.tsx` | 13 |
| `src/components/Hero.tsx` | 11 |
| `src/components/TestimonialsSection.tsx` | 10 |
| `src/admin/panels/TextItemsPanel.tsx` | 9 |
| `src/admin/panels/AdminFaqs.tsx` | 8 |
| `src/components/ClientLogosMarquee.tsx` | 8 |

## 5. الجدول الكامل للنصوص المكتشفة

| # | الملف | السطر | النوع | النص المستخرج |
|---|---|---|---|---|
| 1 | `src/admin/AdminApp.tsx` | 26 | **UI ظاهر** | `<p className="text-navy-300 text-sm">جارٍ التحقق من الجلسة...</p>` |
| 2 | `src/admin/AdminApp.tsx` | 36 | **UI ظاهر** | `<h1 className="text-xl font-bold text-navy-50">حدث خطأ</h1>` |
| 3 | `src/admin/AdminApp.tsx` | 44 | **UI ظاهر** | `إعادة المحاولة` |
| 4 | `src/admin/AdminApp.tsx` | 60 | **UI ظاهر** | `useNoIndex('لوحة التحكم \| Click Zoon');` |
| 5 | `src/admin/AdminApp.tsx` | 67 | **attribute** | `<Route path="features" element={<AdminGuard><TextItemsPanel table="features" title="المميز` |
| 6 | `src/admin/AdminApp.tsx` | 68 | **attribute** | `<Route path="services" element={<AdminGuard><TextItemsPanel table="services" title="الخدما` |
| 7 | `src/admin/AdminApp.tsx` | 70 | **attribute** | `<Route path="process" element={<AdminGuard><TextItemsPanel table="process_steps" title="إز` |
| 8 | `src/admin/AdminLayout.tsx` | 27 | **UI ظاهر** | `{ path: '/admin', label: 'الرئيسية', icon: LayoutDashboard },` |
| 9 | `src/admin/AdminLayout.tsx` | 28 | **UI ظاهر** | `{ path: '/admin/settings', label: 'إعدادات الموقع', icon: Settings },` |
| 10 | `src/admin/AdminLayout.tsx` | 29 | **UI ظاهر** | `{ path: '/admin/hero', label: 'الهيرو', icon: Type },` |
| 11 | `src/admin/AdminLayout.tsx` | 30 | **data-from-DB** | `{ path: '/admin/features', label: 'المميزات', icon: Award },` |
| 12 | `src/admin/AdminLayout.tsx` | 31 | **data-from-DB** | `{ path: '/admin/services', label: 'الخدمات', icon: Grid },` |
| 13 | `src/admin/AdminLayout.tsx` | 32 | **UI ظاهر** | `{ path: '/admin/portfolio', label: 'أعمالنا', icon: Image },` |
| 14 | `src/admin/AdminLayout.tsx` | 33 | **UI ظاهر** | `{ path: '/admin/process', label: 'إزاي بنشتغل', icon: ListOrdered },` |
| 15 | `src/admin/AdminLayout.tsx` | 34 | **UI ظاهر** | `{ path: '/admin/pricing', label: 'الباقات', icon: DollarSign },` |
| 16 | `src/admin/AdminLayout.tsx` | 35 | **data-from-DB** | `{ path: '/admin/testimonials', label: 'آراء العملاء', icon: MessageSquareQuote },` |
| 17 | `src/admin/AdminLayout.tsx` | 36 | **data-from-DB** | `{ path: '/admin/faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },` |
| 18 | `src/admin/AdminLayout.tsx` | 37 | **UI ظاهر** | `{ path: '/admin/sections', label: 'إظهار/إخفاء الأقسام', icon: Eye },` |
| 19 | `src/admin/AdminLayout.tsx` | 38 | **UI ظاهر** | `{ path: '/admin/requests', label: 'طلبات الديمو', icon: Inbox },` |
| 20 | `src/admin/AdminLayout.tsx` | 39 | **UI ظاهر** | `{ path: '/admin/customers', label: 'العملاء', icon: Users },` |
| 21 | `src/admin/AdminLayout.tsx` | 40 | **UI ظاهر** | `{ path: '/admin/password', label: 'تغيير كلمة المرور', icon: KeyRound },` |
| 22 | `src/admin/AdminLayout.tsx` | 41 | **UI ظاهر** | `{ path: '/admin/backup', label: 'نسخة احتياطية', icon: DatabaseBackup },` |
| 23 | `src/admin/AdminLayout.tsx` | 65 | **UI ظاهر** | `<span className="text-lg font-bold text-navy-50">لوحة التحكم</span>` |
| 24 | `src/admin/AdminLayout.tsx` | 94 | **UI ظاهر** | `عرض الموقع` |
| 25 | `src/admin/AdminLayout.tsx` | 102 | **UI ظاهر** | `تسجيل خروج` |
| 26 | `src/admin/AdminLayout.tsx` | 113 | **UI ظاهر** | `<span className="text-lg font-bold text-navy-50">القائمة</span>` |
| 27 | `src/admin/AdminLayout.tsx` | 144 | **UI ظاهر** | `تسجيل خروج` |
| 28 | `src/admin/AdminLayout.tsx` | 158 | **UI ظاهر** | `<span className="text-lg font-bold text-gradient-gold">CZ لوحة التحكم</span>` |
| 29 | `src/admin/AdminLogin.tsx` | 44 | **validation** | `setError('هذا الحساب ليس لديه صلاحية الدخول للوحة التحكم');` |
| 30 | `src/admin/AdminLogin.tsx` | 66 | **validation** | `setResetError('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');` |
| 31 | `src/admin/AdminLogin.tsx` | 68 | **validation** | `setResetError('فشل إرسال رابط إعادة التعيين. حاول مرة تانية.');` |
| 32 | `src/admin/AdminLogin.tsx` | 72 | **UI ظاهر** | `setResetSuccess('تم إرسال رابط إعادة تعيين كلمة المرور على بريدك الإلكتروني.');` |
| 33 | `src/admin/AdminLogin.tsx` | 74 | **validation** | `setResetError('حدث خطأ غير متوقع. حاول مرة تانية.');` |
| 34 | `src/admin/AdminLogin.tsx` | 88 | **UI ظاهر** | `<h1 className="text-2xl font-bold text-navy-50 mb-2">لوحة التحكم</h1>` |
| 35 | `src/admin/AdminLogin.tsx` | 89 | **UI ظاهر** | `<p className="text-navy-400 text-sm">سجّل الدخول لإدارة محتوى الموقع</p>` |
| 36 | `src/admin/AdminLogin.tsx` | 96 | **UI ظاهر** | `البريد الإلكتروني` |
| 37 | `src/admin/AdminLogin.tsx` | 112 | **UI ظاهر** | `كلمة المرور` |
| 38 | `src/admin/AdminLogin.tsx` | 137 | **UI ظاهر** | `{loading ? 'جارٍ الدخول...' : 'دخول'}` |
| 39 | `src/admin/AdminLogin.tsx` | 149 | **UI ظاهر** | `نسيت كلمة المرور؟` |
| 40 | `src/admin/AdminLogin.tsx` | 157 | **UI ظاهر** | `بريدك الإلكتروني` |
| 41 | `src/admin/AdminLogin.tsx` | 175 | **UI ظاهر** | `{resetLoading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}` |
| 42 | `src/admin/AdminLogin.tsx` | 191 | **UI ظاهر** | `العودة للموقع` |
| 43 | `src/admin/panels/AdminBackup.tsx` | 40 | **validation** | `if (error) throw new Error(`خطأ في قراءة جدول ${table}: ${error.message}`);` |
| 44 | `src/admin/panels/AdminBackup.tsx` | 52 | **UI ظاهر** | `setMessage({ type: 'success', text: 'تم تصدير النسخة الاحتياطية بنجاح' });` |
| 45 | `src/admin/panels/AdminBackup.tsx` | 54 | **validation** | `setMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ غير متوقع'` |
| 46 | `src/admin/panels/AdminBackup.tsx` | 69 | **validation** | `throw new Error('ملف غير صالح: تعذّرت قراءة ملف JSON');` |
| 47 | `src/admin/panels/AdminBackup.tsx` | 73 | **validation** | `throw new Error('ملف غير صالح: التنسيق غير صحيح');` |
| 48 | `src/admin/panels/AdminBackup.tsx` | 78 | **validation** | `throw new Error('ملف غير صالح: كائن البيانات (data) غير موجود أو غير صحيح');` |
| 49 | `src/admin/panels/AdminBackup.tsx` | 86 | **validation** | `throw new Error(`ملف غير صالح: بيانات جدول ${key} ليست مصفوفة`);` |
| 50 | `src/admin/panels/AdminBackup.tsx` | 102 | **validation** | `throw new Error(`خطأ في قراءة بيانات جدول ${table} الحالية: ${fetchErr.message}`);` |
| 51 | `src/admin/panels/AdminBackup.tsx` | 122 | **UI ظاهر** | `? 'تمت استعادة البيانات السابقة للجدول بنجاح'` |
| 52 | `src/admin/panels/AdminBackup.tsx` | 123 | **UI ظاهر** | `: 'تعذرت استعادة البيانات السابقة للجدول';` |
| 53 | `src/admin/panels/AdminBackup.tsx` | 124 | **validation** | `throw new Error(`خطأ في تحديث جدول ${table}: ${upsertErr.message} (${restoreMsg})`);` |
| 54 | `src/admin/panels/AdminBackup.tsx` | 136 | **validation** | `throw new Error(`خطأ في مسح جدول ${table}: ${delErr.message} (البيانات السابقة لم تتأثر)`)` |
| 55 | `src/admin/panels/AdminBackup.tsx` | 176 | **UI ظاهر** | `? 'تمت استعادة البيانات السابقة للجدول بنجاح'` |
| 56 | `src/admin/panels/AdminBackup.tsx` | 177 | **UI ظاهر** | `: 'تعذرت استعادة البيانات السابقة للجدول';` |
| 57 | `src/admin/panels/AdminBackup.tsx` | 178 | **validation** | `throw new Error(`خطأ في استيراد بيانات جدول ${table}: ${insErr.message} (${restoreMsg})`);` |
| 58 | `src/admin/panels/AdminBackup.tsx` | 182 | **UI ظاهر** | `setMessage({ type: 'success', text: 'تم استيراد النسخة الاحتياطية بنجاح — أعد تحميل الصفحة` |
| 59 | `src/admin/panels/AdminBackup.tsx` | 184 | **validation** | `setMessage({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ غير متوقع'` |
| 60 | `src/admin/panels/AdminBackup.tsx` | 193 | **attribute** | `<AdminPageHeader title="نسخة احتياطية" subtitle="تصدير واستيراد بيانات الموقع كملف JSON" /` |
| 61 | `src/admin/panels/AdminBackup.tsx` | 216 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold">تصدير نسخة احتياطية</h3>` |
| 62 | `src/admin/panels/AdminBackup.tsx` | 217 | **UI ظاهر** | `<p className="text-navy-400 text-sm">ينزّل كل جداول المحتوى والطلبات كملف JSON</p>` |
| 63 | `src/admin/panels/AdminBackup.tsx` | 226 | **UI ظاهر** | `{exporting ? 'جارٍ التصدير...' : 'تصدير الآن'}` |
| 64 | `src/admin/panels/AdminBackup.tsx` | 237 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold">استيراد نسخة احتياطية</h3>` |
| 65 | `src/admin/panels/AdminBackup.tsx` | 238 | **UI ظاهر** | `<p className="text-navy-400 text-sm">يرجّع البيانات من ملف JSON — سيستبدل المحتوى الحالي</` |
| 66 | `src/admin/panels/AdminBackup.tsx` | 257 | **UI ظاهر** | `{importing ? 'جارٍ الاستيراد...' : 'اختر ملف'}` |
| 67 | `src/admin/panels/AdminBackup.tsx` | 266 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold text-sm">الجداول المشمولة في النسخة</h3>` |
| 68 | `src/admin/panels/AdminBackup.tsx` | 277 | **UI ظاهر** | `<span>الاستيراد يستبدل كل البيانات الحالية في الجداول المشمولة. تأكد من تصدير نسخة قبل الا` |
| 69 | `src/admin/panels/AdminChangePassword.tsx` | 22 | **validation** | `setError('كلمة المرور الجديدة لازم تكون 12 حرف على الأقل');` |
| 70 | `src/admin/panels/AdminChangePassword.tsx` | 26 | **validation** | `setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');` |
| 71 | `src/admin/panels/AdminChangePassword.tsx` | 30 | **validation** | `setError('كلمة المرور الجديدة لازم تكون مختلفة عن الحالية');` |
| 72 | `src/admin/panels/AdminChangePassword.tsx` | 41 | **validation** | `setError('فشل تغيير كلمة المرور. تأكد إن كلمة المرور الحالية صحيحة وحاول مرة تانية.');` |
| 73 | `src/admin/panels/AdminChangePassword.tsx` | 45 | **UI ظاهر** | `setSuccess('تم تغيير كلمة المرور بنجاح');` |
| 74 | `src/admin/panels/AdminChangePassword.tsx` | 58 | **UI ظاهر** | `<h1 className="text-2xl font-bold text-navy-50 mb-1">تغيير كلمة المرور</h1>` |
| 75 | `src/admin/panels/AdminChangePassword.tsx` | 59 | **UI ظاهر** | `<p className="text-navy-400 text-sm">غيّر كلمة مرور حسابك للحفاظ على أمان لوحة التحكم</p>` |
| 76 | `src/admin/panels/AdminChangePassword.tsx` | 67 | **UI ظاهر** | `كلمة المرور الحالية` |
| 77 | `src/admin/panels/AdminChangePassword.tsx` | 93 | **UI ظاهر** | `كلمة المرور الجديدة` |
| 78 | `src/admin/panels/AdminChangePassword.tsx` | 101 | **attribute** | `placeholder="12 حرف على الأقل"` |
| 79 | `src/admin/panels/AdminChangePassword.tsx` | 113 | **UI ظاهر** | `<p className="text-navy-500 text-xs mt-1.5">لازم 12 حرف على الأقل</p>` |
| 80 | `src/admin/panels/AdminChangePassword.tsx` | 120 | **UI ظاهر** | `تأكيد كلمة المرور الجديدة` |
| 81 | `src/admin/panels/AdminChangePassword.tsx` | 162 | **UI ظاهر** | `{loading ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}` |
| 82 | `src/admin/panels/AdminCustomers.tsx` | 64 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 83 | `src/admin/panels/AdminCustomers.tsx` | 68 | **attribute** | `<AdminPageHeader title="العملاء" subtitle={`${customers.length} عميل مسجل`} />` |
| 84 | `src/admin/panels/AdminCustomers.tsx` | 76 | **attribute** | `placeholder="بحث بالاسم أو رقم الموبايل..."` |
| 85 | `src/admin/panels/AdminCustomers.tsx` | 84 | **UI ظاهر** | `<p className="text-navy-400">لا يوجد عملاء مسجلون بعد</p>` |
| 86 | `src/admin/panels/AdminCustomers.tsx` | 106 | **UI ظاهر** | `<div className="text-navy-500 text-xs">طلب</div>` |
| 87 | `src/admin/panels/AdminDashboard.tsx` | 67 | **UI ظاهر** | `{ label: 'طلبات الديمو', value: stats.requests, icon: Inbox, link: '/admin/requests', colo` |
| 88 | `src/admin/panels/AdminDashboard.tsx` | 68 | **UI ظاهر** | `{ label: 'مشاريع الأعمال', value: stats.portfolio, icon: Image, link: '/admin/portfolio', ` |
| 89 | `src/admin/panels/AdminDashboard.tsx` | 69 | **UI ظاهر** | `{ label: 'الباقات', value: stats.pricing, icon: DollarSign, link: '/admin/pricing', color:` |
| 90 | `src/admin/panels/AdminDashboard.tsx` | 70 | **data-from-DB** | `{ label: 'الأسئلة الشائعة', value: stats.faqs, icon: HelpCircle, link: '/admin/faqs', colo` |
| 91 | `src/admin/panels/AdminDashboard.tsx` | 77 | **attribute** | `<AdminPageHeader title="لوحة التحكم" subtitle="مرحباً بك في إدارة موقع Click Zoon" />` |
| 92 | `src/admin/panels/AdminDashboard.tsx` | 106 | **UI ظاهر** | `<h3 className="text-base font-bold text-navy-50">نشاط طلبات الديمو خلال آخر 30 يوماً</h3>` |
| 93 | `src/admin/panels/AdminDashboard.tsx` | 112 | **UI ظاهر** | `<span>كل الطلبات</span>` |
| 94 | `src/admin/panels/AdminDashboard.tsx` | 146 | **UI ظاهر** | `<span>أحدث الطلبات المستلمة</span>` |
| 95 | `src/admin/panels/AdminDashboard.tsx` | 149 | **UI ظاهر** | `عرض المزيد` |
| 96 | `src/admin/panels/AdminDashboard.tsx` | 154 | **UI ظاهر** | `<p className="text-xs text-navy-400 py-6 text-center">لا توجد طلبات جديدة</p>` |
| 97 | `src/admin/panels/AdminDashboard.tsx` | 175 | **UI ظاهر** | `{r.status === 'delivered' ? 'مكتمل' : r.status === 'contacted' ? 'تواصل' : 'جديد'}` |
| 98 | `src/admin/panels/AdminDashboard.tsx` | 191 | **UI ظاهر** | `<span className="text-navy-50 font-bold block text-sm">تعديل إعدادات الموقع العامة</span>` |
| 99 | `src/admin/panels/AdminDashboard.tsx` | 192 | **UI ظاهر** | `<span className="text-navy-400 text-xs">رقم الواتساب، الأسعار، العناوين وشريط الإعلانات</s` |
| 100 | `src/admin/panels/AdminDashboard.tsx` | 203 | **UI ظاهر** | `<span className="text-navy-50 font-bold block text-sm">إدارة مشاريع الأعمال</span>` |
| 101 | `src/admin/panels/AdminDashboard.tsx` | 204 | **UI ظاهر** | `<span className="text-navy-400 text-xs">إضافة صور وتعديل روابط المواقع الحية</span>` |
| 102 | `src/admin/panels/AdminFaqs.tsx` | 69 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 103 | `src/admin/panels/AdminFaqs.tsx` | 73 | **attribute** | `<AdminPageHeader title="الأسئلة الشائعة" subtitle="إضافة وتعديل وحذف وترتيب الأسئلة" />` |
| 104 | `src/admin/panels/AdminFaqs.tsx` | 74 | **UI ظاهر** | `<AddButton onAdd={startAdd} label="إضافة سؤال" />` |
| 105 | `src/admin/panels/AdminFaqs.tsx` | 79 | **UI ظاهر** | `<AdminInput label="السؤال" value={editing.question} onChange={(v) => setEditing({ ...editi` |
| 106 | `src/admin/panels/AdminFaqs.tsx` | 80 | **UI ظاهر** | `<AdminTextarea label="الإجابة" value={editing.answer} onChange={(v) => setEditing({ ...edi` |
| 107 | `src/admin/panels/AdminFaqs.tsx` | 83 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : 'حفظ'}` |
| 108 | `src/admin/panels/AdminFaqs.tsx` | 85 | **UI ظاهر** | `<button onClick={() => setEditing(null)} className="text-navy-300 hover:text-navy-50 px-4 ` |
| 109 | `src/admin/panels/AdminFaqs.tsx` | 101 | **UI ظاهر** | `<button onClick={() => setEditing(item)} className="text-navy-300 hover:text-gold-400 px-3` |
| 110 | `src/admin/panels/AdminHero.tsx` | 33 | **validation** | `if (error) { setError('تعذر الحفظ'); return; }` |
| 111 | `src/admin/panels/AdminHero.tsx` | 38 | **UI ظاهر** | `if (!hero) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 112 | `src/admin/panels/AdminHero.tsx` | 45 | **attribute** | `<AdminPageHeader title="قسم الهيرو" subtitle="العنوان الرئيسي، الكلمات المتحركة، الفقرة، و` |
| 113 | `src/admin/panels/AdminHero.tsx` | 49 | **UI ظاهر** | `<AdminInput label="نص الشارة (Badge)" value={hero.badge_text} onChange={(v) => set('badge_` |
| 114 | `src/admin/panels/AdminHero.tsx` | 50 | **UI ظاهر** | `<AdminInput label="السطر الأول من العنوان" value={hero.headline_line1} onChange={(v) => se` |
| 115 | `src/admin/panels/AdminHero.tsx` | 53 | **UI ظاهر** | `الكلمات المتحركة (افصل بينها بفاصلة)` |
| 116 | `src/admin/panels/AdminHero.tsx` | 57 | **UI ظاهر** | `value={hero.rotating_words.join('، ')}` |
| 117 | `src/admin/panels/AdminHero.tsx` | 58 | **UI ظاهر** | `onChange={(e) => set('rotating_words', e.target.value.split(/[،,]/).map((s) => s.trim()).f` |
| 118 | `src/admin/panels/AdminHero.tsx` | 62 | **UI ظاهر** | `<p className="text-navy-500 text-xs mt-1">اكتب الكلمات مفصولة بفاصلة، مثال: مطعمك، كافيهك،` |
| 119 | `src/admin/panels/AdminHero.tsx` | 64 | **UI ظاهر** | `<AdminInput label="السطر الثاني من العنوان" value={hero.headline_line2} onChange={(v) => s` |
| 120 | `src/admin/panels/AdminHero.tsx` | 65 | **UI ظاهر** | `<AdminTextarea label="الفقرة" value={hero.subtitle} onChange={(v) => set('subtitle', v)} r` |
| 121 | `src/admin/panels/AdminHero.tsx` | 67 | **UI ظاهر** | `<AdminInput label="نص الزر الأساسي" value={hero.cta_primary} onChange={(v) => set('cta_pri` |
| 122 | `src/admin/panels/AdminHero.tsx` | 68 | **UI ظاهر** | `<AdminInput label="نص الزر الثانوي" value={hero.cta_secondary} onChange={(v) => set('cta_s` |
| 123 | `src/admin/panels/AdminPortfolio.tsx` | 8 | **UI ظاهر** | `{ key: 'restaurants', label: 'مطاعم' },` |
| 124 | `src/admin/panels/AdminPortfolio.tsx` | 9 | **UI ظاهر** | `{ key: 'stores', label: 'متاجر' },` |
| 125 | `src/admin/panels/AdminPortfolio.tsx` | 10 | **UI ظاهر** | `{ key: 'cafes', label: 'كافيهات' },` |
| 126 | `src/admin/panels/AdminPortfolio.tsx` | 11 | **UI ظاهر** | `{ key: 'medical', label: 'طبي' },` |
| 127 | `src/admin/panels/AdminPortfolio.tsx` | 12 | **UI ظاهر** | `{ key: 'business', label: 'شركات وخدمات' },` |
| 128 | `src/admin/panels/AdminPortfolio.tsx` | 16 | **UI ظاهر** | `{ key: 'website', label: 'موقع' },` |
| 129 | `src/admin/panels/AdminPortfolio.tsx` | 17 | **UI ظاهر** | `{ key: 'app', label: 'برنامج / تطبيق' },` |
| 130 | `src/admin/panels/AdminPortfolio.tsx` | 18 | **UI ظاهر** | `{ key: 'store', label: 'متجر إلكتروني' },` |
| 131 | `src/admin/panels/AdminPortfolio.tsx` | 125 | **validation** | `alert('اكتب عنوان المشروع وأضف صورة له على الأقل.');` |
| 132 | `src/admin/panels/AdminPortfolio.tsx` | 157 | **UI ظاهر** | `? 'الرابط المختصر (slug) مستخدم في مشروع آخر. غيّره وجرب تاني.'` |
| 133 | `src/admin/panels/AdminPortfolio.tsx` | 158 | **validation** | `: `تعذر الحفظ: ${error.message}\nتأكد إنك شغّلت آخر migration في Supabase.`` |
| 134 | `src/admin/panels/AdminPortfolio.tsx` | 167 | **UI ظاهر** | `if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;` |
| 135 | `src/admin/panels/AdminPortfolio.tsx` | 199 | **validation** | `alert('تعذر رفع الصورة إلى التخزين. يرجى التحقق من اتصالك أو إعدادات التخزين.');` |
| 136 | `src/admin/panels/AdminPortfolio.tsx` | 204 | **validation** | `alert('حدث خطأ أثناء معالجة الصورة.');` |
| 137 | `src/admin/panels/AdminPortfolio.tsx` | 237 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 138 | `src/admin/panels/AdminPortfolio.tsx` | 241 | **attribute** | `<AdminPageHeader title="أعمالنا" subtitle="إضافة وتعديل وحذف وترتيب المشاريع — مع ضغط WebP` |
| 139 | `src/admin/panels/AdminPortfolio.tsx` | 242 | **UI ظاهر** | `<AddButton onAdd={startAdd} label="إضافة مشروع" />` |
| 140 | `src/admin/panels/AdminPortfolio.tsx` | 247 | **attribute** | `<AdminInput label="عنوان المشروع" value={editing.title} onChange={(v) => setEditing({ ...e` |
| 141 | `src/admin/panels/AdminPortfolio.tsx` | 249 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">التصنيف</label>` |
| 142 | `src/admin/panels/AdminPortfolio.tsx` | 260 | **UI ظاهر** | `<AdminTextarea label="الوصف المختصر (يظهر في الكارت)" value={editing.description} onChange` |
| 143 | `src/admin/panels/AdminPortfolio.tsx` | 263 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">النوع</label>` |
| 144 | `src/admin/panels/AdminPortfolio.tsx` | 274 | **UI ظاهر** | `<AdminInput label="الرابط المختصر (إنجليزي) مثال: delano-cafe" value={editing.slug ?? ''} ` |
| 145 | `src/admin/panels/AdminPortfolio.tsx` | 276 | **UI ظاهر** | `<AdminInput label="سطر تعريفي قصير تحت الاسم" value={editing.tagline ?? ''} onChange={(v) ` |
| 146 | `src/admin/panels/AdminPortfolio.tsx` | 277 | **UI ظاهر** | `<AdminTextarea label="وصف تفصيلي (صفحة المشروع)" value={editing.long_description ?? ''} on` |
| 147 | `src/admin/panels/AdminPortfolio.tsx` | 278 | **data-from-DB** | `<AdminTextarea label="المميزات (كل ميزة في سطر)" value={(editing.features ?? []).join('\n'` |
| 148 | `src/admin/panels/AdminPortfolio.tsx` | 279 | **UI ظاهر** | `<AdminInput label="رابط المشروع الحي (Live URL)" value={editing.live_url \|\| editing.link` |
| 149 | `src/admin/panels/AdminPortfolio.tsx` | 284 | **UI ظاهر** | `<span>صورة المشروع</span>` |
| 150 | `src/admin/panels/AdminPortfolio.tsx` | 287 | **UI ظاهر** | `<span>يتم تحويلها لـ WebP مضغوطة تلقائياً</span>` |
| 151 | `src/admin/panels/AdminPortfolio.tsx` | 296 | **UI ظاهر** | `{uploading ? 'جارٍ الضغط والرفع...' : 'رفع صورة مضغوطة'}` |
| 152 | `src/admin/panels/AdminPortfolio.tsx` | 308 | **attribute** | `placeholder="أو الصق رابط صورة"` |
| 153 | `src/admin/panels/AdminPortfolio.tsx` | 317 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">أيقونة المشروع (مربعة — ` |
| 154 | `src/admin/panels/AdminPortfolio.tsx` | 324 | **UI ظاهر** | `رفع أيقونة` |
| 155 | `src/admin/panels/AdminPortfolio.tsx` | 332 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">صور الموقع / البرنامج (ل` |
| 156 | `src/admin/panels/AdminPortfolio.tsx` | 342 | **attribute** | `aria-label="حذف الصورة"` |
| 157 | `src/admin/panels/AdminPortfolio.tsx` | 352 | **UI ظاهر** | `{uploading ? 'جارٍ الرفع...' : 'رفع صور (يمكن اختيار أكثر من صورة)'}` |
| 158 | `src/admin/panels/AdminPortfolio.tsx` | 357 | **UI ظاهر** | `<AdminToggle label="ظاهر في الموقع" checked={editing.visible} onChange={(v) => setEditing(` |
| 159 | `src/admin/panels/AdminPortfolio.tsx` | 361 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : 'حفظ'}` |
| 160 | `src/admin/panels/AdminPortfolio.tsx` | 363 | **UI ظاهر** | `<button onClick={() => setEditing(null)} className="text-navy-300 hover:text-navy-50 px-4 ` |
| 161 | `src/admin/panels/AdminPortfolio.tsx` | 376 | **UI ظاهر** | `{!item.visible && <span className="text-navy-500 text-xs bg-navy-800 px-2 py-0.5 rounded">` |
| 162 | `src/admin/panels/AdminPortfolio.tsx` | 383 | **UI ظاهر** | `<button onClick={() => setEditing(item)} className="text-navy-400 hover:text-gold-400 px-2` |
| 163 | `src/admin/panels/AdminPricing.tsx` | 73 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 164 | `src/admin/panels/AdminPricing.tsx` | 77 | **attribute** | `<AdminPageHeader title="باقات الأسعار" subtitle="تعديل الباقات والمميزات والأسعار" />` |
| 165 | `src/admin/panels/AdminPricing.tsx` | 78 | **UI ظاهر** | `<AddButton onAdd={startAdd} label="إضافة باقة" />` |
| 166 | `src/admin/panels/AdminPricing.tsx` | 84 | **UI ظاهر** | `<AdminInput label="اسم الباقة" value={editing.name} onChange={(v) => setEditing({ ...editi` |
| 167 | `src/admin/panels/AdminPricing.tsx` | 85 | **UI ظاهر** | `<AdminInput label="الوصف القصير" value={editing.tagline} onChange={(v) => setEditing({ ...` |
| 168 | `src/admin/panels/AdminPricing.tsx` | 87 | **UI ظاهر** | `<AdminInput label="السعر (اتركه فارغاً لإظهار اطلب عرض سعر)" value={editing.price} onChang` |
| 169 | `src/admin/panels/AdminPricing.tsx` | 89 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">المميزات (كل ميزة في سطر` |
| 170 | `src/admin/panels/AdminPricing.tsx` | 98 | **UI ظاهر** | `<AdminToggle label="باقة مميزة" checked={editing.highlighted} onChange={(v) => setEditing(` |
| 171 | `src/admin/panels/AdminPricing.tsx` | 99 | **UI ظاهر** | `<AdminToggle label="ظاهرة في الموقع" checked={editing.visible} onChange={(v) => setEditing` |
| 172 | `src/admin/panels/AdminPricing.tsx` | 103 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : 'حفظ'}` |
| 173 | `src/admin/panels/AdminPricing.tsx` | 105 | **UI ظاهر** | `<button onClick={() => setEditing(null)} className="text-navy-300 hover:text-navy-50 px-4 ` |
| 174 | `src/admin/panels/AdminPricing.tsx` | 117 | **UI ظاهر** | `{item.highlighted && <span className="text-gold-300 text-xs bg-gold-500/10 px-2 py-0.5 rou` |
| 175 | `src/admin/panels/AdminPricing.tsx` | 118 | **UI ظاهر** | `{!item.visible && <span className="text-navy-500 text-xs bg-navy-800 px-2 py-0.5 rounded">` |
| 176 | `src/admin/panels/AdminPricing.tsx` | 120 | **data-from-DB** | `<div className="text-navy-400 text-xs">{item.tagline} — {item.features.length} ميزة</div>` |
| 177 | `src/admin/panels/AdminPricing.tsx` | 125 | **UI ظاهر** | `<button onClick={() => setEditing(item)} className="text-navy-300 hover:text-gold-400 px-3` |
| 178 | `src/admin/panels/AdminRequests.tsx` | 8 | **UI ظاهر** | `new: 'جديد',` |
| 179 | `src/admin/panels/AdminRequests.tsx` | 9 | **UI ظاهر** | `contacted: 'تم التواصل',` |
| 180 | `src/admin/panels/AdminRequests.tsx` | 10 | **UI ظاهر** | `delivered: 'تم التسليم',` |
| 181 | `src/admin/panels/AdminRequests.tsx` | 11 | **UI ظاهر** | `rejected: 'مرفوض',` |
| 182 | `src/admin/panels/AdminRequests.tsx` | 22 | **UI ظاهر** | `form: 'النموذج الرئيسي',` |
| 183 | `src/admin/panels/AdminRequests.tsx` | 23 | **UI ظاهر** | `wizard: 'حاسبة الباقات',` |
| 184 | `src/admin/panels/AdminRequests.tsx` | 24 | **UI ظاهر** | `exit_intent: 'نافذة الخروج',` |
| 185 | `src/admin/panels/AdminRequests.tsx` | 25 | **UI ظاهر** | `showcase: 'معرض الأعمال (اطلب الآن)',` |
| 186 | `src/admin/panels/AdminRequests.tsx` | 26 | **UI ظاهر** | `contact: 'نموذج الاتصال (قديم)',` |
| 187 | `src/admin/panels/AdminRequests.tsx` | 27 | **UI ظاهر** | `demo: 'طلب الديمو (قديم)',` |
| 188 | `src/admin/panels/AdminRequests.tsx` | 31 | **UI ظاهر** | `{ value: 'all', label: 'كل الحالات' },` |
| 189 | `src/admin/panels/AdminRequests.tsx` | 32 | **UI ظاهر** | `{ value: 'new', label: 'جديد' },` |
| 190 | `src/admin/panels/AdminRequests.tsx` | 33 | **UI ظاهر** | `{ value: 'contacted', label: 'تم التواصل' },` |
| 191 | `src/admin/panels/AdminRequests.tsx` | 34 | **UI ظاهر** | `{ value: 'delivered', label: 'تم التسليم' },` |
| 192 | `src/admin/panels/AdminRequests.tsx` | 35 | **UI ظاهر** | `{ value: 'rejected', label: 'مرفوض' },` |
| 193 | `src/admin/panels/AdminRequests.tsx` | 39 | **UI ظاهر** | `{ value: 'all', label: 'كل المصادر' },` |
| 194 | `src/admin/panels/AdminRequests.tsx` | 40 | **UI ظاهر** | `{ value: 'form', label: 'النموذج الرئيسي' },` |
| 195 | `src/admin/panels/AdminRequests.tsx` | 41 | **UI ظاهر** | `{ value: 'wizard', label: 'حاسبة الباقات' },` |
| 196 | `src/admin/panels/AdminRequests.tsx` | 42 | **UI ظاهر** | `{ value: 'exit_intent', label: 'نافذة الخروج' },` |
| 197 | `src/admin/panels/AdminRequests.tsx` | 43 | **UI ظاهر** | `{ value: 'showcase', label: 'معرض الأعمال (اطلب الآن)' },` |
| 198 | `src/admin/panels/AdminRequests.tsx` | 47 | **UI ظاهر** | `{ value: 'new', label: 'جديد' },` |
| 199 | `src/admin/panels/AdminRequests.tsx` | 48 | **UI ظاهر** | `{ value: 'contacted', label: 'تم التواصل' },` |
| 200 | `src/admin/panels/AdminRequests.tsx` | 49 | **UI ظاهر** | `{ value: 'delivered', label: 'تم التسليم' },` |
| 201 | `src/admin/panels/AdminRequests.tsx` | 50 | **UI ظاهر** | `{ value: 'rejected', label: 'مرفوض' },` |
| 202 | `src/admin/panels/AdminRequests.tsx` | 61 | **UI ظاهر** | `const headers = ['التاريخ', 'الاسم', 'الهاتف', 'نوع النشاط', 'المصدر', 'ملاحظات وتفاصيل', ` |
| 203 | `src/admin/panels/AdminRequests.tsx` | 71 | **UI ظاهر** | `r.user_id ? 'نعم' : 'لا',` |
| 204 | `src/admin/panels/AdminRequests.tsx` | 100 | **UI ظاهر** | `if (!confirm('هل تريد بالتأكيد حذف هذا الطلب؟')) return;` |
| 205 | `src/admin/panels/AdminRequests.tsx` | 106 | **UI ظاهر** | `if (!confirm('هل أنت متأكد من حذف جميع الطلبات؟')) return;` |
| 206 | `src/admin/panels/AdminRequests.tsx` | 137 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 207 | `src/admin/panels/AdminRequests.tsx` | 142 | **attribute** | `title="طلبات الديمو والعملاء المحتملين"` |
| 208 | `src/admin/panels/AdminRequests.tsx` | 143 | **attribute** | `subtitle={`${requests.length} طلب مستلم إجمالاً — ${countByStatus.new} طلب جديد بحاجة للتو` |
| 209 | `src/admin/panels/AdminRequests.tsx` | 154 | **UI ظاهر** | `<span>تصدير CSV / Excel</span>` |
| 210 | `src/admin/panels/AdminRequests.tsx` | 163 | **UI ظاهر** | `<span>حذف الكل</span>` |
| 211 | `src/admin/panels/AdminRequests.tsx` | 171 | **UI ظاهر** | `جديد: {countByStatus.new}` |
| 212 | `src/admin/panels/AdminRequests.tsx` | 174 | **UI ظاهر** | `تم التواصل: {countByStatus.contacted}` |
| 213 | `src/admin/panels/AdminRequests.tsx` | 177 | **UI ظاهر** | `تم التسليم: {countByStatus.delivered}` |
| 214 | `src/admin/panels/AdminRequests.tsx` | 190 | **attribute** | `placeholder="بحث بالاسم، الهاتف، أو النشاط..."` |
| 215 | `src/admin/panels/AdminRequests.tsx` | 223 | **UI ظاهر** | `<p className="text-navy-400">{requests.length === 0 ? 'لا توجد طلبات حتى الآن' : 'لا توجد ` |
| 216 | `src/admin/panels/AdminRequests.tsx` | 235 | **UI ظاهر** | `عميل مسجل` |
| 217 | `src/admin/panels/AdminRequests.tsx` | 240 | **UI ظاهر** | `زائر` |
| 218 | `src/admin/panels/AdminRequests.tsx` | 255 | **UI ظاهر** | `<span className="text-navy-400 text-xs font-semibold">النشاط:</span>` |
| 219 | `src/admin/panels/AdminRequests.tsx` | 259 | **UI ظاهر** | `<span className="text-navy-400 text-xs font-semibold">الهاتف / واتساب:</span>` |
| 220 | `src/admin/panels/AdminRequests.tsx` | 261 | **UI ظاهر** | `href={`https://wa.me/${req.phone.replace(/^0/, '20')}?text=${encodeURIComponent(`مرحباً أس` |
| 221 | `src/admin/panels/AdminRequests.tsx` | 272 | **UI ظاهر** | `<span className="text-gold-400 font-bold block mb-0.5">تفاصيل وخيارات الطلب:</span>` |
| 222 | `src/admin/panels/AdminRequests.tsx` | 278 | **UI ظاهر** | `<span className="text-navy-500 text-xs">رابط المصدر:</span>` |
| 223 | `src/admin/panels/AdminRequests.tsx` | 287 | **UI ظاهر** | `<span className="text-navy-400 text-xs font-semibold">تغيير الحالة:</span>` |
| 224 | `src/admin/panels/AdminSections.tsx` | 15 | **validation** | `setError('فشل تحميل البيانات. حاول مرة أخرى.');` |
| 225 | `src/admin/panels/AdminSections.tsx` | 19 | **data-from-DB** | `list = [...list, { id: 'testimonials', label: 'آراء العملاء', visible: true }];` |
| 226 | `src/admin/panels/AdminSections.tsx` | 38 | **validation** | `setError(`فشل حفظ التغيير: ${error.message}`);` |
| 227 | `src/admin/panels/AdminSections.tsx` | 43 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 228 | `src/admin/panels/AdminSections.tsx` | 47 | **attribute** | `<AdminPageHeader title="إظهار وإخفاء الأقسام" subtitle="تحكّم في ظهور أقسام الموقع" />` |
| 229 | `src/admin/panels/AdminSections.tsx` | 59 | **UI ظاهر** | `label={section.visible ? 'ظاهر' : 'مخفي'}` |
| 230 | `src/admin/panels/AdminSettings.tsx` | 49 | **validation** | `if (error) { setError('تعذر حفظ الإعدادات'); return; }` |
| 231 | `src/admin/panels/AdminSettings.tsx` | 54 | **UI ظاهر** | `if (!settings) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 232 | `src/admin/panels/AdminSettings.tsx` | 61 | **attribute** | `<AdminPageHeader title="إعدادات الموقع العامة" subtitle="اسم الموقع، الشعار، بيانات التواص` |
| 233 | `src/admin/panels/AdminSettings.tsx` | 64 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">الهوية</h3>` |
| 234 | `src/admin/panels/AdminSettings.tsx` | 66 | **UI ظاهر** | `<AdminInput label="اسم الموقع (إنجليزي)" value={settings.site_name} onChange={(v) => set('` |
| 235 | `src/admin/panels/AdminSettings.tsx` | 67 | **UI ظاهر** | `<AdminInput label="اسم الموقع (عربي)" value={settings.site_name_ar} onChange={(v) => set('` |
| 236 | `src/admin/panels/AdminSettings.tsx` | 68 | **UI ظاهر** | `<AdminInput label="نص الشعار" value={settings.logo_text} onChange={(v) => set('logo_text',` |
| 237 | `src/admin/panels/AdminSettings.tsx` | 69 | **UI ظاهر** | `<AdminInput label="نص الشريط العلوي" value={settings.promo_bar_text} onChange={(v) => set(` |
| 238 | `src/admin/panels/AdminSettings.tsx` | 74 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">بيانات التواصل</h3>` |
| 239 | `src/admin/panels/AdminSettings.tsx` | 76 | **UI ظاهر** | `<AdminInput label="رقم الهاتف" value={settings.phone} onChange={(v) => set('phone', v)} di` |
| 240 | `src/admin/panels/AdminSettings.tsx` | 77 | **UI ظاهر** | `<AdminInput label="رقم الهاتف دولي (واتساب)" value={settings.phone_intl} onChange={(v) => ` |
| 241 | `src/admin/panels/AdminSettings.tsx` | 78 | **UI ظاهر** | `<AdminInput label="البريد الإلكتروني" value={settings.email} onChange={(v) => set('email',` |
| 242 | `src/admin/panels/AdminSettings.tsx` | 79 | **UI ظاهر** | `<AdminInput label="الموقع" value={settings.location} onChange={(v) => set('location', v)} ` |
| 243 | `src/admin/panels/AdminSettings.tsx` | 84 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">روابط السوشيال ميديا</h3>` |
| 244 | `src/admin/panels/AdminSettings.tsx` | 86 | **UI ظاهر** | `<AdminInput label="فيسبوك" value={settings.facebook} onChange={(v) => set('facebook', v)} ` |
| 245 | `src/admin/panels/AdminSettings.tsx` | 87 | **UI ظاهر** | `<AdminInput label="إنستجرام" value={settings.instagram} onChange={(v) => set('instagram', ` |
| 246 | `src/admin/panels/AdminSettings.tsx` | 92 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">إعدادات الديمو</h3>` |
| 247 | `src/admin/panels/AdminSettings.tsx` | 94 | **UI ظاهر** | `<AdminInput label="أقل مدة (ساعات)" type="number" value={String(settings.demo_min_hours)} ` |
| 248 | `src/admin/panels/AdminSettings.tsx` | 95 | **UI ظاهر** | `<AdminInput label="أقصى مدة (ساعات)" type="number" value={String(settings.demo_max_hours)}` |
| 249 | `src/admin/panels/AdminSettings.tsx` | 98 | **UI ظاهر** | `<AdminToggle label="إظهار الأسعار في الباقات" checked={settings.show_prices} onChange={(v)` |
| 250 | `src/admin/panels/AdminSettings.tsx` | 103 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">قسم من نحن</h3>` |
| 251 | `src/admin/panels/AdminSettings.tsx` | 105 | **UI ظاهر** | `<AdminInput label="عنوان القسم" value={settings.about_title} onChange={(v) => set('about_t` |
| 252 | `src/admin/panels/AdminSettings.tsx` | 106 | **UI ظاهر** | `<AdminTextarea label="نص التعريف" value={settings.about_text} onChange={(v) => set('about_` |
| 253 | `src/admin/panels/AdminSettings.tsx` | 107 | **UI ظاهر** | `<AdminInput label="رابط صورة (اختياري)" value={settings.about_image_url} onChange={(v) => ` |
| 254 | `src/admin/panels/AdminSettings.tsx` | 109 | **UI ظاهر** | `label="أرقام (JSON)"` |
| 255 | `src/admin/panels/AdminSettings.tsx` | 117 | **UI ظاهر** | `<p className="text-navy-500 text-xs">صيغة: {`[{"value": 50, "suffix": "+", "label": "عميل"` |
| 256 | `src/admin/panels/AdminSettings.tsx` | 122 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">الخريطة والتتبع</h3>` |
| 257 | `src/admin/panels/AdminSettings.tsx` | 124 | **UI ظاهر** | `<AdminTextarea label="رابط Google Maps Embed (اختياري)" value={settings.map_embed_url} onC` |
| 258 | `src/admin/panels/AdminSettings.tsx` | 125 | **UI ظاهر** | `<p className="text-navy-500 text-xs">ألصق رابط embed من Google Maps. لو فاضي، الخريطة مش ه` |
| 259 | `src/admin/panels/AdminSettings.tsx` | 127 | **UI ظاهر** | `<p className="text-navy-500 text-xs">مثال: G-XXXXXXXXXX. لو فاضي، التتبع معطل.</p>` |
| 260 | `src/admin/panels/AdminSettings.tsx` | 132 | **UI ظاهر** | `<h3 className="text-navy-50 font-bold mb-4">نص الفوتر</h3>` |
| 261 | `src/admin/panels/AdminSettings.tsx` | 133 | **UI ظاهر** | `<AdminTextarea label="نص الفوتر" value={settings.footer_text} onChange={(v) => set('footer` |
| 262 | `src/admin/panels/AdminSettings.tsx` | 139 | **UI ظاهر** | `<AdminInput label="عنوان SEO" value={settings.seo_title} onChange={(v) => set('seo_title',` |
| 263 | `src/admin/panels/AdminSettings.tsx` | 140 | **UI ظاهر** | `<AdminTextarea label="وصف SEO" value={settings.seo_description} onChange={(v) => set('seo_` |
| 264 | `src/admin/panels/AdminSettings.tsx` | 141 | **UI ظاهر** | `<AdminInput label="رابط صورة المشاركة (OG Image)" value={settings.seo_og_image} onChange={` |
| 265 | `src/admin/panels/AdminTestimonials.tsx` | 98 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 266 | `src/admin/panels/AdminTestimonials.tsx` | 102 | **attribute** | `<AdminPageHeader title="آراء العملاء" subtitle="إضافة وتعديل وحذف وترتيب تقييمات العملاء" ` |
| 267 | `src/admin/panels/AdminTestimonials.tsx` | 103 | **UI ظاهر** | `<AddButton onAdd={startAdd} label="إضافة رأي عميل" />` |
| 268 | `src/admin/panels/AdminTestimonials.tsx` | 110 | **UI ظاهر** | `label="اسم العميل *"` |
| 269 | `src/admin/panels/AdminTestimonials.tsx` | 113 | **attribute** | `placeholder="مثال: أحمد محمود"` |
| 270 | `src/admin/panels/AdminTestimonials.tsx` | 116 | **UI ظاهر** | `label="النشاط / الصفة"` |
| 271 | `src/admin/panels/AdminTestimonials.tsx` | 119 | **attribute** | `placeholder="مثال: صاحب كافيه، طبيب، متجر..."` |
| 272 | `src/admin/panels/AdminTestimonials.tsx` | 124 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">التقييم (من 1 إلى 5 نجوم` |
| 273 | `src/admin/panels/AdminTestimonials.tsx` | 132 | **attribute** | `title={`${star} نجوم`}` |
| 274 | `src/admin/panels/AdminTestimonials.tsx` | 144 | **UI ظاهر** | `<span className="text-navy-300 text-sm mr-2">{editing.rating} من 5</span>` |
| 275 | `src/admin/panels/AdminTestimonials.tsx` | 149 | **UI ظاهر** | `label="نص الرأي أو التقييم *"` |
| 276 | `src/admin/panels/AdminTestimonials.tsx` | 153 | **attribute** | `placeholder="اكتب ما قاله العميل عن تجربته مع كليك زون..."` |
| 277 | `src/admin/panels/AdminTestimonials.tsx` | 157 | **UI ظاهر** | `label="ظاهر في الموقع"` |
| 278 | `src/admin/panels/AdminTestimonials.tsx` | 168 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : 'حفظ'}` |
| 279 | `src/admin/panels/AdminTestimonials.tsx` | 174 | **UI ظاهر** | `إلغاء` |
| 280 | `src/admin/panels/AdminTestimonials.tsx` | 184 | **UI ظاهر** | `لا توجد آراء عملاء حالياً. اضغط "إضافة رأي عميل" لإضافة أول تقييم.` |
| 281 | `src/admin/panels/AdminTestimonials.tsx` | 199 | **UI ظاهر** | `<span className="text-navy-500 text-xs bg-navy-800 px-2 py-0.5 rounded">مخفي</span>` |
| 282 | `src/admin/panels/AdminTestimonials.tsx` | 211 | **UI ظاهر** | `تعديل` |
| 283 | `src/admin/panels/TextItemsPanel.tsx` | 92 | **UI ظاهر** | `if (loading) return <div className="text-navy-400">جارٍ التحميل...</div>;` |
| 284 | `src/admin/panels/TextItemsPanel.tsx` | 97 | **UI ظاهر** | `<AddButton onAdd={startAdd} label="إضافة عنصر" />` |
| 285 | `src/admin/panels/TextItemsPanel.tsx` | 104 | **UI ظاهر** | `<label className="text-navy-200 text-sm font-semibold mb-2 block">الأيقونة (lucide-react)<` |
| 286 | `src/admin/panels/TextItemsPanel.tsx` | 126 | **UI ظاهر** | `الأيقونات المتاحة: {AVAILABLE_ICON_NAMES.join('، ')}` |
| 287 | `src/admin/panels/TextItemsPanel.tsx` | 130 | **attribute** | `<AdminInput label="العنوان" value={editing.title} onChange={(v) => setEditing({ ...editing` |
| 288 | `src/admin/panels/TextItemsPanel.tsx` | 131 | **UI ظاهر** | `<AdminTextarea label="الوصف" value={editing.description} onChange={(v) => setEditing({ ...` |
| 289 | `src/admin/panels/TextItemsPanel.tsx` | 134 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : 'حفظ'}` |
| 290 | `src/admin/panels/TextItemsPanel.tsx` | 136 | **UI ظاهر** | `<button onClick={() => setEditing(null)} className="text-navy-300 hover:text-navy-50 px-4 ` |
| 291 | `src/admin/panels/TextItemsPanel.tsx` | 159 | **UI ظاهر** | `<button onClick={() => setEditing(item)} className="text-navy-300 hover:text-gold-400 px-3` |
| 292 | `src/admin/ui.tsx` | 109 | **UI ظاهر** | `label = 'حفظ',` |
| 293 | `src/admin/ui.tsx` | 122 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : label}` |
| 294 | `src/admin/ui.tsx` | 131 | **validation** | `{error \|\| 'تم الحفظ بنجاح'}` |
| 295 | `src/admin/ui.tsx` | 136 | **UI ظاهر** | `export function DeleteButton({ onDelete, label = 'حذف' }: { onDelete: () => void; label?: ` |
| 296 | `src/admin/ui.tsx` | 147 | **UI ظاهر** | `export function AddButton({ onAdd, label = 'إضافة' }: { onAdd: () => void; label?: string ` |
| 297 | `src/admin/ui.tsx` | 169 | **attribute** | `aria-label={direction === 'up' ? 'تحريك لأعلى' : 'تحريك لأسفل'}` |
| 298 | `src/App.tsx` | 63 | **UI ظاهر** | `{ question: 'كم مدة تجهيز الديمو المجاني؟', answer: 'الديمو بيتجهز خلال 24 إلى 72 ساعة من ` |
| 299 | `src/App.tsx` | 64 | **UI ظاهر** | `{ question: 'كم مدة التسليم النهائي للموقع؟', answer: 'التسليم النهائي من 3 أيام إلى أسبوع` |
| 300 | `src/App.tsx` | 65 | **UI ظاهر** | `{ question: 'هل في أي التزام قبل ما أشوف الديمو؟', answer: 'لا، بدون أي التزام. الديمو مجا` |
| 301 | `src/App.tsx` | 66 | **UI ظاهر** | `{ question: 'من يملك الدومين والاستضافة؟', answer: 'أنت بتملك الدومين والاستضافة باسمك بال` |
| 302 | `src/components/ClientLogosMarquee.tsx` | 12 | **UI ظاهر** | `{ id: '1', name: 'Delano Café & Bistro', category: 'مطاعم وكافيهات', icon: Coffee },` |
| 303 | `src/components/ClientLogosMarquee.tsx` | 13 | **UI ظاهر** | `{ id: '2', name: 'Elite Specialty Clinics', category: 'عيادات ومراكز طبية', icon: Stethosc` |
| 304 | `src/components/ClientLogosMarquee.tsx` | 14 | **UI ظاهر** | `{ id: '3', name: 'Al-Mustashar Law Group', category: 'مكاتب محاماة واستشارات', icon: Scale` |
| 305 | `src/components/ClientLogosMarquee.tsx` | 15 | **UI ظاهر** | `{ id: '4', name: 'Orchid Luxury Boutique', category: 'متاجر إلكترونية راقية', icon: Sparkl` |
| 306 | `src/components/ClientLogosMarquee.tsx` | 16 | **UI ظاهر** | `{ id: '5', name: 'City Home Real Estate', category: 'شركات واستثمار عقاري', icon: Building` |
| 307 | `src/components/ClientLogosMarquee.tsx` | 17 | **UI ظاهر** | `{ id: '6', name: 'SuperFresh Gourmet', category: 'أغذية وسوبرماركت', icon: ShoppingBag },` |
| 308 | `src/components/ClientLogosMarquee.tsx` | 27 | **attribute** | `aria-label="شركاء النجاح والأنشطة التي نخدمها"` |
| 309 | `src/components/ClientLogosMarquee.tsx` | 31 | **UI ظاهر** | `نُصمّم ونطوّر حضوراً رقمياً فائق التميز لأكثر من 50+ نشاط تجاري في مصر والعالم العربي` |
| 310 | `src/components/Header.tsx` | 348 | **UI ظاهر** | `{t('common.welcome')}، <span className="text-gold-300 font-bold">{displayName}</span>` |
| 311 | `src/components/Hero.tsx` | 25 | **UI ظاهر** | `: ['مطعمك', 'كافيهك', 'محلك', 'شركتك', 'مشروعك'];` |
| 312 | `src/components/Hero.tsx` | 70 | **UI ظاهر** | `const currentWord = words[wordIdx] \|\| words[0] \|\| 'مشروعك';` |
| 313 | `src/components/Hero.tsx` | 75 | **UI ظاهر** | `const badgeText = language === 'en' ? t('hero.badge') : (hero?.badge_text ?? 'تصميم وتطوير` |
| 314 | `src/components/Hero.tsx` | 76 | **UI ظاهر** | `const line1 = language === 'en' ? t('hero.title_prefix') : (hero?.headline_line1 ?? 'خلّي ` |
| 315 | `src/components/Hero.tsx` | 77 | **UI ظاهر** | `const line2 = language === 'en' ? t('hero.title_highlight') : (hero?.headline_line2 ?? 'أو` |
| 316 | `src/components/Hero.tsx` | 78 | **attribute** | `const subtitle = language === 'en' ? t('hero.description') : (hero?.subtitle ?? 'في Click ` |
| 317 | `src/components/Hero.tsx` | 79 | **UI ظاهر** | `const ctaPrimary = language === 'en' ? t('hero.cta_primary') : (hero?.cta_primary ?? 'اطلب` |
| 318 | `src/components/Hero.tsx` | 80 | **UI ظاهر** | `const ctaSecondary = language === 'en' ? t('hero.cta_secondary') : (hero?.cta_secondary ??` |
| 319 | `src/components/Hero.tsx` | 140 | **UI ظاهر** | `<div className="text-xs text-navy-300">{language === 'en' ? 'Completed Order' : 'طلب جديد ` |
| 320 | `src/components/Hero.tsx` | 141 | **UI ظاهر** | `<div className="text-sm font-bold text-navy-50 notranslate" translate="no">{language === '` |
| 321 | `src/components/Hero.tsx` | 156 | **UI ظاهر** | `<div className="text-xs text-navy-300">{language === 'en' ? 'Load Speed' : 'سرعة التحميل'}` |
| 322 | `src/components/LanguageSwitcher.tsx` | 84 | **UI ظاهر** | `<span className="uppercase font-bold tracking-wider">{language === 'ar' ? 'العربية' : 'EN'` |
| 323 | `src/components/LanguageSwitcher.tsx` | 115 | **UI ظاهر** | `<span>العربية</span>` |
| 324 | `src/components/LanguageSwitcher.tsx` | 133 | **UI ظاهر** | `<span className="text-[11px] text-navy-400 font-normal">(الإنجليزية)</span>` |
| 325 | `src/components/MockupsSection.tsx` | 272 | **attribute** | `title: 'قصر الريم للمشويات',` |
| 326 | `src/components/MockupsSection.tsx` | 273 | **UI ظاهر** | `category: 'موقع وتطبيق مطعم ومشويات',` |
| 327 | `src/components/MockupsSection.tsx` | 283 | **UI ظاهر** | `logoText: 'قصر الريم',` |
| 328 | `src/components/MockupsSection.tsx` | 284 | **UI ظاهر** | `logoSub: 'مشويات & مأكولات شرقية',` |
| 329 | `src/components/MockupsSection.tsx` | 285 | **UI ظاهر** | `statusBadge: 'مفتوح للطلب',` |
| 330 | `src/components/MockupsSection.tsx` | 289 | **UI ظاهر** | `badge: '🔥 خصم 20% على أول طلب أونلاين',` |
| 331 | `src/components/MockupsSection.tsx` | 290 | **UI ظاهر** | `headline: 'طعم المشويات الأصيل يوصلك سخن لحد باب بيتك',` |
| 332 | `src/components/MockupsSection.tsx` | 291 | **UI ظاهر** | `subheadline: 'أشهى المشويات الحلبية على الفحم بتتبيلة سرية وتوصيل حراري فائق السرعة.',` |
| 333 | `src/components/MockupsSection.tsx` | 292 | **UI ظاهر** | `ctaText: 'اطلب وجبتك الآن',` |
| 334 | `src/components/MockupsSection.tsx` | 296 | **attribute** | `title: 'صينية الريم الملكية',` |
| 335 | `src/components/MockupsSection.tsx` | 297 | **UI ظاهر** | `desc: 'كيلو كباب وكفتة مع ريش ضاني وأرز بسمتي ومقبلات حارة',` |
| 336 | `src/components/MockupsSection.tsx` | 298 | **UI ظاهر** | `meta: '٤٢٠ ج.م',` |
| 337 | `src/components/MockupsSection.tsx` | 299 | **UI ظاهر** | `tag: 'الأكثر طلباً ⭐ 4.9',` |
| 338 | `src/components/MockupsSection.tsx` | 303 | **attribute** | `title: 'توصيل حراري فائق السرعة',` |
| 339 | `src/components/MockupsSection.tsx` | 304 | **UI ظاهر** | `desc: 'تغليف ثلاثي محكم يحافظ على حرارة وطراوة المشويات خلال 35 دقيقة',` |
| 340 | `src/components/MockupsSection.tsx` | 305 | **UI ظاهر** | `meta: 'توصيل مجاني',` |
| 341 | `src/components/MockupsSection.tsx` | 306 | **UI ظاهر** | `tag: 'سريع',` |
| 342 | `src/components/MockupsSection.tsx` | 310 | **attribute** | `title: 'حجز صالات VIP وعزائم',` |
| 343 | `src/components/MockupsSection.tsx` | 311 | **UI ظاهر** | `desc: 'صالات عائلية خاصة ومجهزة بأرقى مستوى خدمة وضيافة',` |
| 344 | `src/components/MockupsSection.tsx` | 312 | **UI ظاهر** | `meta: 'تأكيد فوري',` |
| 345 | `src/components/MockupsSection.tsx` | 313 | **UI ظاهر** | `tag: 'صالات فاخرة',` |
| 346 | `src/components/MockupsSection.tsx` | 321 | **attribute** | `title: 'روست كافيه & كوفي بار',` |
| 347 | `src/components/MockupsSection.tsx` | 322 | **UI ظاهر** | `category: 'كافيه وسبيشالتي كوفي',` |
| 348 | `src/components/MockupsSection.tsx` | 332 | **UI ظاهر** | `logoText: 'روست كافيه',` |
| 349 | `src/components/MockupsSection.tsx` | 334 | **UI ظاهر** | `statusBadge: 'بن محمص اليوم',` |
| 350 | `src/components/MockupsSection.tsx` | 338 | **UI ظاهر** | `badge: '☕ تجربة القهوة المختصة V60 & Flat White',` |
| 351 | `src/components/MockupsSection.tsx` | 339 | **UI ظاهر** | `headline: 'قهوتك الموزونة بمزاج عالي، محمصة بعناية يومياً',` |
| 352 | `src/components/MockupsSection.tsx` | 340 | **UI ظاهر** | `subheadline: 'محاصيل مختصة فردية المصدر وحلويات فرنسية طازجة في أجواء هادئة وراقية.',` |
| 353 | `src/components/MockupsSection.tsx` | 341 | **UI ظاهر** | `ctaText: 'استكشف قائمة المشروبات',` |
| 354 | `src/components/MockupsSection.tsx` | 345 | **attribute** | `title: 'بن سلفادور وكولومبيا V60',` |
| 355 | `src/components/MockupsSection.tsx` | 346 | **UI ظاهر** | `desc: 'إيحاءات فواكه استوائية وشوكولاتة بحموضة متوازنة ومذاق مخملي',` |
| 356 | `src/components/MockupsSection.tsx` | 347 | **UI ظاهر** | `meta: '٨٥ ج.م',` |
| 357 | `src/components/MockupsSection.tsx` | 348 | **UI ظاهر** | `tag: 'محصول مميز ⭐ 4.9',` |
| 358 | `src/components/MockupsSection.tsx` | 352 | **attribute** | `title: 'كرواسون ومخبوزات فرنسية',` |
| 359 | `src/components/MockupsSection.tsx` | 353 | **UI ظاهر** | `desc: 'مخبوزات طازجة بالزبدة الطبيعية تُخبز يومياً في معملنا الخاص',` |
| 360 | `src/components/MockupsSection.tsx` | 354 | **UI ظاهر** | `meta: 'طازج صباحاً',` |
| 361 | `src/components/MockupsSection.tsx` | 355 | **UI ظاهر** | `tag: 'مخبوز اليوم',` |
| 362 | `src/components/MockupsSection.tsx` | 359 | **attribute** | `title: 'اشتراك بوكس القهوة المنزلي',` |
| 363 | `src/components/MockupsSection.tsx` | 360 | **UI ظاهر** | `desc: 'محاصيل مختارة تصلك أسبوعياً مع بطاقات وصفات التحضير المنزلية',` |
| 364 | `src/components/MockupsSection.tsx` | 361 | **UI ظاهر** | `meta: 'شحن أسبوعي',` |
| 365 | `src/components/MockupsSection.tsx` | 362 | **UI ظاهر** | `tag: 'وفر 25%',` |
| 366 | `src/components/MockupsSection.tsx` | 370 | **attribute** | `title: 'متجر مودانيستا فاشون',` |
| 367 | `src/components/MockupsSection.tsx` | 371 | **UI ظاهر** | `category: 'متجر إلكتروني متكامل للأزياء',` |
| 368 | `src/components/MockupsSection.tsx` | 381 | **UI ظاهر** | `logoText: 'مودانيستا',` |
| 369 | `src/components/MockupsSection.tsx` | 383 | **UI ظاهر** | `statusBadge: 'شحن فوري',` |
| 370 | `src/components/MockupsSection.tsx` | 387 | **UI ظاهر** | `badge: '✨ كولكشن الشتاء 2026 الحصري',` |
| 371 | `src/components/MockupsSection.tsx` | 388 | **UI ظاهر** | `headline: 'أحدث صيحات الموضة والأناقة بتصاميم راقية وخامات أصلية',` |
| 372 | `src/components/MockupsSection.tsx` | 389 | **UI ظاهر** | `subheadline: 'تسوقي أرقى الإطلالات العصرية مع استبدال مجاني وتوصيل سريع حتى باب المنزل.',` |
| 373 | `src/components/MockupsSection.tsx` | 390 | **UI ظاهر** | `ctaText: 'تسوقي الكولكشن الجديد',` |
| 374 | `src/components/MockupsSection.tsx` | 394 | **attribute** | `title: 'معطف صوف كشمير طويل',` |
| 375 | `src/components/MockupsSection.tsx` | 395 | **UI ظاهر** | `desc: 'قصة راقية بخامات شتوية دافئة وتطريز يدوي متقن بألوان الموسم',` |
| 376 | `src/components/MockupsSection.tsx` | 396 | **UI ظاهر** | `meta: '١,٢٥٠ ج.م',` |
| 377 | `src/components/MockupsSection.tsx` | 397 | **UI ظاهر** | `tag: 'تريند الأسبوع ⭐ 4.9',` |
| 378 | `src/components/MockupsSection.tsx` | 401 | **attribute** | `title: 'حقائب جلد طبيعي كلاسيك',` |
| 379 | `src/components/MockupsSection.tsx` | 402 | **UI ظاهر** | `desc: 'تصميم إيطالي أنيق متعدد الاستخدامات بضمان عام كامل',` |
| 380 | `src/components/MockupsSection.tsx` | 403 | **UI ظاهر** | `meta: '٦٨٠ ج.م',` |
| 381 | `src/components/MockupsSection.tsx` | 404 | **UI ظاهر** | `tag: 'خامة أصلية',` |
| 382 | `src/components/MockupsSection.tsx` | 408 | **attribute** | `title: 'دفع عند الاستلام واستبدال',` |
| 383 | `src/components/MockupsSection.tsx` | 409 | **UI ظاهر** | `desc: 'معاينة كاملة قبل الاستلام وخيارات تقسيط مرنة بدون فوائد',` |
| 384 | `src/components/MockupsSection.tsx` | 410 | **UI ظاهر** | `meta: 'استبدال 14 يوم',` |
| 385 | `src/components/MockupsSection.tsx` | 411 | **UI ظاهر** | `tag: 'تسوق آمن 100%',` |
| 386 | `src/components/MockupsSection.tsx` | 419 | **attribute** | `title: 'مركز النور الطبي التخصصي',` |
| 387 | `src/components/MockupsSection.tsx` | 420 | **UI ظاهر** | `category: 'منصة حجز عيادات وخدمات طبية',` |
| 388 | `src/components/MockupsSection.tsx` | 430 | **UI ظاهر** | `logoText: 'مركز النور',` |
| 389 | `src/components/MockupsSection.tsx` | 432 | **UI ظاهر** | `statusBadge: 'طوارئ 24/7',` |
| 390 | `src/components/MockupsSection.tsx` | 436 | **UI ظاهر** | `badge: '🩺 نخبة الاستشاريين وأحدث الأجهزة',` |
| 391 | `src/components/MockupsSection.tsx` | 437 | **UI ظاهر** | `headline: 'صحتك وصحة عائلتك في أيدٍ أمينة برعاية طبية متكاملة',` |
| 392 | `src/components/MockupsSection.tsx` | 438 | **UI ظاهر** | `subheadline: 'حجز مواعيد فوري في أكثر من 18 تخصصاً طبياً مع تحاليل رقمية واستشارات معتمدة.` |
| 393 | `src/components/MockupsSection.tsx` | 439 | **UI ظاهر** | `ctaText: 'احجز موعدك الطبي الآن',` |
| 394 | `src/components/MockupsSection.tsx` | 443 | **attribute** | `title: 'عيادة الباطنة والقلب',` |
| 395 | `src/components/MockupsSection.tsx` | 444 | **UI ظاهر** | `desc: 'فحص شامل وتخطيط قلب ومتابعة دورية مع كبار الأطباء الاستشاريين',` |
| 396 | `src/components/MockupsSection.tsx` | 445 | **UI ظاهر** | `meta: 'كشف ٣٥٠ ج.م',` |
| 397 | `src/components/MockupsSection.tsx` | 446 | **UI ظاهر** | `tag: 'متاح اليوم ⭐ 4.9',` |
| 398 | `src/components/MockupsSection.tsx` | 450 | **attribute** | `title: 'معمل تحاليل وأشعة فورية',` |
| 399 | `src/components/MockupsSection.tsx` | 451 | **UI ظاهر** | `desc: 'أحدث أجهزة الفحص الرقمي والنتائج تصلك معتمدة عبر واتساب',` |
| 400 | `src/components/MockupsSection.tsx` | 452 | **UI ظاهر** | `meta: 'نتائج خلال ساعتين',` |
| 401 | `src/components/MockupsSection.tsx` | 453 | **UI ظاهر** | `tag: 'دقة 99.8%',` |
| 402 | `src/components/MockupsSection.tsx` | 457 | **attribute** | `title: 'استشارات طبية منزلية 24/7',` |
| 403 | `src/components/MockupsSection.tsx` | 458 | **UI ظاهر** | `desc: 'زيارات تمريضية وطبية منزلية للحالات الحرجة وكبار السن',` |
| 404 | `src/components/MockupsSection.tsx` | 459 | **UI ظاهر** | `meta: 'تغطية فورية',` |
| 405 | `src/components/MockupsSection.tsx` | 460 | **UI ظاهر** | `tag: 'خدمة 24 ساعة',` |
| 406 | `src/components/MockupsSection.tsx` | 524 | **attribute** | `aria-label="قائمة الموبايل"` |
| 407 | `src/components/MockupsSection.tsx` | 858 | **attribute** | `alt={language === 'en' ? `${proj.title} website design on desktop` : `تصميم ${proj.title} ` |
| 408 | `src/components/OrderModal.tsx` | 14 | **تعليق برمجي (code comment)** | `/** "اطلب الآن" dialog — saves the lead (source = showcase) so it shows up in the admin re` |
| 409 | `src/components/Portfolio.tsx` | 20 | **UI ظاهر** | `description: 'منيو إلكتروني تفاعلي QR مع نظام طلب مباشر ودفع سريع عبر واتساب بدون أي عمولا` |
| 410 | `src/components/Portfolio.tsx` | 30 | **attribute** | `title: 'مجمع عيادات رويال التخصصية',` |
| 411 | `src/components/Portfolio.tsx` | 32 | **UI ظاهر** | `description: 'موقع طبي متكامل مع حجز مواعيد ذكي، استعراض جداول الأطباء، وتأكيد الحجز فوريا` |
| 412 | `src/components/Portfolio.tsx` | 42 | **attribute** | `title: 'متجر Orchid Luxury',` |
| 413 | `src/components/Portfolio.tsx` | 44 | **UI ظاهر** | `description: 'متجر إلكتروني فخم للأزياء والعطور، مربوط مع بوابات الدفع الإلكتروني وشركات ا` |
| 414 | `src/components/Portfolio.tsx` | 53 | **attribute** | `title: 'مطاعم ومشويات الباشا',` |
| 415 | `src/components/Portfolio.tsx` | 55 | **UI ظاهر** | `description: 'موقع تعريفي وقائمة طعام إلكترونية مع خدمة حجز الطاولات وتوصيل الطلبات للمناز` |
| 416 | `src/components/Portfolio.tsx` | 299 | **attribute** | `aria-label={filtered[lightboxIndex].title \|\| 'معاينة المشروع'}` |
| 417 | `src/components/Pricing.tsx` | 42 | **UI ظاهر** | `tagline: t('pricing.plan_basic_tagline') \|\| 'مناسبة للأنشطة الصغيرة',` |
| 418 | `src/components/Pricing.tsx` | 55 | **UI ظاهر** | `tagline: t('pricing.plan_pro_tagline') \|\| 'الأكثر طلباً',` |
| 419 | `src/components/Pricing.tsx` | 71 | **UI ظاهر** | `tagline: t('pricing.plan_ecommerce_tagline') \|\| 'ابدأ تبيع أونلاين',` |
| 420 | `src/components/Pricing.tsx` | 217 | **UI ظاهر** | `href={waLink(`${cfg.whatsappMessages.pricing} — باقة: ${plan.name} (${billingCycle === 'mo` |
| 421 | `src/components/QuoteWizard.tsx` | 149 | **UI ظاهر** | `.join('، ');` |
| 422 | `src/components/QuoteWizard.tsx` | 160 | **UI ظاهر** | `message_text: `المميزات: ${featureLabels} \| التوقيت: ${timelineLabel} \| التقدير: ${estim` |
| 423 | `src/components/Seo.tsx` | 14 | **attribute** | `const DEFAULT_TITLE = 'Click Zoon \| تصميم وتطوير المواقع والمتاجر الإلكترونية';` |
| 424 | `src/components/Seo.tsx` | 16 | **UI ظاهر** | `'وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التجارية في المنصور` |
| 425 | `src/components/TestimonialsSection.tsx` | 17 | **UI ظاهر** | `name: 'د. أحمد منصور',` |
| 426 | `src/components/TestimonialsSection.tsx` | 18 | **UI ظاهر** | `business: 'مدير مجمع عيادات رويال التخصصية',` |
| 427 | `src/components/TestimonialsSection.tsx` | 19 | **UI ظاهر** | `text: 'كليك زون نقلوا تواجد عياداتنا لمستوى تاني خالص. نظام حجز المواعيد على واتساب وفر عل` |
| 428 | `src/components/TestimonialsSection.tsx` | 27 | **UI ظاهر** | `name: 'م. كريم الديب',` |
| 429 | `src/components/TestimonialsSection.tsx` | 28 | **UI ظاهر** | `business: 'مؤسس Delano Café & Bistro',` |
| 430 | `src/components/TestimonialsSection.tsx` | 29 | **UI ظاهر** | `text: 'الديمو المجاني اللي استلمته في 48 ساعة كان مبهر ومطابق لهويتنا بالظبط. الموقع سريع ` |
| 431 | `src/components/TestimonialsSection.tsx` | 37 | **UI ظاهر** | `name: 'أ. سارة فؤاد',` |
| 432 | `src/components/TestimonialsSection.tsx` | 38 | **UI ظاهر** | `business: 'مؤسسة متجر Orchid Luxury',` |
| 433 | `src/components/TestimonialsSection.tsx` | 39 | **UI ظاهر** | `text: 'أفضل تجربة تعامل مع شركة تصميم مواقع. احترافية عالية، التزام بالمواعيد، ولوحة تحكم ` |
| 434 | `src/components/TestimonialsSection.tsx` | 257 | **attribute** | `aria-label={`التقييم ${i + 1}`}` |
| 435 | `src/lib/admin-context.tsx` | 81 | **validation** | `setAuthError('تعذّر الاتصال بالخادم. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.');` |
| 436 | `src/lib/admin-context.tsx` | 147 | **validation** | `return { error: 'بيانات الدخول غير صحيحة', isAdmin: false };` |
| 437 | `src/lib/analytics.ts` | 2 | **تعليق برمجي (code comment)** | `// تتبع الأحداث — Google Analytics` |
| 438 | `src/lib/customer-context.tsx` | 86 | **validation** | `if (error) return { error: 'بيانات الدخول غير صحيحة' };` |
| 439 | `src/lib/customer-context.tsx` | 101 | **validation** | `return { error: 'هذا البريد الإلكتروني مسجل بالفعل. سجّل الدخول بدلاً من ذلك.' };` |
| 440 | `src/lib/customer-context.tsx` | 103 | **validation** | `return { error: 'كلمة المرور ضعيفة. استخدم 12 حرف على الأقل.' };` |
| 441 | `src/lib/customer-context.tsx` | 104 | **validation** | `return { error: `تعذر إنشاء الحساب: ${error.message}` };` |
| 442 | `src/lib/customer-context.tsx` | 127 | **validation** | `return { error: 'تعذر تسجيل الدخول بحساب جوجل. حاول مرة أخرى.' };` |
| 443 | `src/lib/customer-context.tsx` | 133 | **validation** | `return { error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول بجوجل.' };` |
| 444 | `src/lib/demo-requests.ts` | 45 | **validation** | `let errorMessage = 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.';` |
| 445 | `src/lib/demo-requests.ts` | 61 | **validation** | `if (error.message?.includes('429') \|\| errorMessage.includes('تجاوزت الحد')) {` |
| 446 | `src/lib/demo-requests.ts` | 77 | **validation** | `const msg = err instanceof Error ? err.message : 'فشل الاتصال بالخادم';` |
| 447 | `src/lib/phone.ts` | 5 | **UI ظاهر** | `const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];` |
| 448 | `src/lib/phone.ts` | 8 | **تعليق برمجي (code comment)** | `* Normalizes Eastern Arabic-Indic digits (٠-٩) and Persian digits to Latin digits (0-9).` |
| 449 | `src/lib/phone.ts` | 12 | **UI ظاهر** | `return str.replace(/[٠-٩]/g, (char) => {` |
| 450 | `src/lib/showcase.ts` | 17 | **data-from-DB** | `website: 'موقع',` |
| 451 | `src/lib/showcase.ts` | 18 | **data-from-DB** | `app: 'برنامج',` |
| 452 | `src/lib/showcase.ts` | 19 | **data-from-DB** | `store: 'متجر إلكتروني',` |
| 453 | `src/lib/showcase.ts` | 23 | **data-from-DB** | `restaurants: 'مطاعم',` |
| 454 | `src/lib/showcase.ts` | 24 | **data-from-DB** | `cafes: 'كافيهات',` |
| 455 | `src/lib/showcase.ts` | 25 | **data-from-DB** | `stores: 'متاجر',` |
| 456 | `src/lib/showcase.ts` | 26 | **data-from-DB** | `medical: 'طبي',` |
| 457 | `src/lib/showcase.ts` | 27 | **data-from-DB** | `business: 'شركات وخدمات',` |
| 458 | `src/lib/showcase.ts` | 35 | **attribute** | `title: 'موقع مطعم',` |
| 459 | `src/lib/showcase.ts` | 36 | **data-from-DB** | `tagline: 'منيو إلكتروني وطلب عبر واتساب',` |
| 460 | `src/lib/showcase.ts` | 39 | **data-from-DB** | `description: 'نموذج تصميم لمطعم مع منيو إلكتروني وحجز طاولات.',` |
| 461 | `src/lib/showcase.ts` | 41 | **data-from-DB** | `'نموذج تصميم جاهز لمطعم: منيو إلكتروني سهل التعديل، طلب مباشر عبر واتساب، حجز طاولات وخريط` |
| 462 | `src/lib/showcase.ts` | 42 | **data-from-DB** | `features: ['منيو إلكتروني QR', 'طلب مباشر عبر واتساب', 'حجز طاولات', 'متوافق مع الموبايل']` |
| 463 | `src/lib/showcase.ts` | 53 | **attribute** | `title: 'موقع كافيه',` |
| 464 | `src/lib/showcase.ts` | 54 | **data-from-DB** | `tagline: 'هوية دافئة ومنيو تفاعلي',` |
| 465 | `src/lib/showcase.ts` | 57 | **data-from-DB** | `description: 'نموذج تصميم لكافيه بمنيو تفاعلي وصور جذابة.',` |
| 466 | `src/lib/showcase.ts` | 58 | **data-from-DB** | `long_description: 'نموذج تصميم لكافيه بصور جذابة ومنيو تفاعلي وربط مباشر مع السوشيال ميديا` |
| 467 | `src/lib/showcase.ts` | 59 | **data-from-DB** | `features: ['منيو تفاعلي', 'معرض صور', 'ربط السوشيال ميديا', 'سرعة تحميل عالية'],` |
| 468 | `src/lib/showcase.ts` | 70 | **attribute** | `title: 'متجر إلكتروني',` |
| 469 | `src/lib/showcase.ts` | 71 | **data-from-DB** | `tagline: 'بيع أونلاين بدفع وشحن',` |
| 470 | `src/lib/showcase.ts` | 74 | **data-from-DB** | `description: 'نموذج متجر إلكتروني مع سلة مشتريات وربط الدفع والشحن.',` |
| 471 | `src/lib/showcase.ts` | 75 | **data-from-DB** | `long_description: 'نموذج متجر إلكتروني متكامل: إدارة المنتجات والطلبات، سلة مشتريات، ربط ا` |
| 472 | `src/lib/showcase.ts` | 76 | **data-from-DB** | `features: ['سلة مشتريات', 'إدارة المنتجات والطلبات', 'ربط الدفع الإلكتروني', 'ربط شركات ال` |
| 473 | `src/lib/showcase.ts` | 87 | **attribute** | `title: 'موقع عيادة',` |
| 474 | `src/lib/showcase.ts` | 88 | **data-from-DB** | `tagline: 'حجز مواعيد وجداول الأطباء',` |
| 475 | `src/lib/showcase.ts` | 91 | **data-from-DB** | `description: 'نموذج موقع طبي بحجز مواعيد وتأكيد عبر واتساب.',` |
| 476 | `src/lib/showcase.ts` | 92 | **data-from-DB** | `long_description: 'نموذج موقع طبي: عرض الأطباء والتخصصات، حجز مواعيد، وتأكيد الحجز عبر وات` |
| 477 | `src/lib/showcase.ts` | 93 | **data-from-DB** | `features: ['حجز مواعيد', 'ملفات الأطباء', 'تأكيد عبر واتساب', 'SEO محلي'],` |
| 478 | `src/lib/toast-context.tsx` | 29 | **UI ظاهر** | `const copyToClipboard = useCallback(async (text: string, label = 'النص') => {` |
| 479 | `src/lib/toast-context.tsx` | 33 | **validation** | `showToast(`تم نسخ ${label} إلى الحافظة بنجاح ✓`, 'success');` |
| 480 | `src/lib/toast-context.tsx` | 36 | **validation** | `showToast(`تعذر النسخ التلقائي: ${text}`, 'info');` |
| 481 | `src/main.tsx` | 50 | **UI ظاهر** | `<h1 className="text-xl font-bold text-navy-100 mb-2">عذراً، حدث خطأ غير متوقع</h1>` |
| 482 | `src/main.tsx` | 52 | **UI ظاهر** | `نعمل على إصلاح هذا الخلل في أقرب وقت. يمكنك إعادة المحاولة الآن.` |
| 483 | `src/main.tsx` | 61 | **UI ظاهر** | `إعادة تحميل الصفحة` |
| 484 | `src/pages/CaseStudy.tsx` | 27 | **attribute** | `title: 'تصميم منيو إلكتروني وموقع تفاعلي لكافيه ديلانو',` |
| 485 | `src/pages/CaseStudy.tsx` | 29 | **UI ظاهر** | `category: 'مطاعم وكافيهات',` |
| 486 | `src/pages/CaseStudy.tsx` | 34 | **UI ظاهر** | `'الاعتماد الكامل على منيو ورقي مطبوع يصعب تحديثه عند تغير الأسعار أو الأصناف.',` |
| 487 | `src/pages/CaseStudy.tsx` | 35 | **UI ظاهر** | `'خسارة نسبة كبيرة من طلبات الدليفري بسبب عمولات تطبيقات التوصيل التي تصل لـ 20-25%.',` |
| 488 | `src/pages/CaseStudy.tsx` | 36 | **UI ظاهر** | `'صعوبة تصفح الأصناف وصور الأطباق عبر شاشات الموبايل في المكان.',` |
| 489 | `src/pages/CaseStudy.tsx` | 39 | **UI ظاهر** | `'بناء منيو إلكتروني QR تفاعلي فائق السرعة يعمل فوراً بدون الحاجة لتحميل أي تطبيق.',` |
| 490 | `src/pages/CaseStudy.tsx` | 40 | **UI ظاهر** | `'ربط نظام طلب مباشر يرسل تفاصيل الطلب والطاولة أو العنوان مباشرة عبر واتساب بدون عمولة.',` |
| 491 | `src/pages/CaseStudy.tsx` | 41 | **UI ظاهر** | `'لوحة تحكم سهلة باللغة العربية تتيح لمدير المكان تعديل الأسعار وإخفاء الأصناف غير المتاحة ` |
| 492 | `src/pages/CaseStudy.tsx` | 44 | **UI ظاهر** | `{ value: 180, suffix: '%', label: 'زيادة في طلبات الأونلاين المباشرة' },` |
| 493 | `src/pages/CaseStudy.tsx` | 45 | **UI ظاهر** | `{ value: 0, suffix: '%', label: 'عمولات تطبيقات توصيل وسيطة' },` |
| 494 | `src/pages/CaseStudy.tsx` | 46 | **UI ظاهر** | `{ value: 98, suffix: '/100', label: 'نتيجة سرعة وأداء Lighthouse' },` |
| 495 | `src/pages/CaseStudy.tsx` | 47 | **UI ظاهر** | `{ value: 48, suffix: ' ساعة', label: 'مدة تجهيز وتسليم الديمو' },` |
| 496 | `src/pages/CaseStudy.tsx` | 50 | **UI ظاهر** | `text: 'الموقع وفر علينا آلاف الجنيهات كانت بتروح عمولات شهرية. الزباين مبسوطة جداً من سرعة` |
| 497 | `src/pages/CaseStudy.tsx` | 51 | **UI ظاهر** | `author: 'م. كريم الديب',` |
| 498 | `src/pages/CaseStudy.tsx` | 52 | **UI ظاهر** | `role: 'مؤسس Delano Café',` |
| 499 | `src/pages/CaseStudy.tsx` | 57 | **attribute** | `title: 'تطوير موقع طبي ونظام حجز مواعيد لعيادات رويال التخصصية',` |
| 500 | `src/pages/CaseStudy.tsx` | 59 | **UI ظاهر** | `category: 'مراكز وعيادات طبية',` |
| 501 | `src/pages/CaseStudy.tsx` | 64 | **UI ظاهر** | `'ضغط كبير على خطوط الهاتف واستقبال العيادة لتأكيد المواعيد والاستفسار عن جداول الأطباء.',` |
| 502 | `src/pages/CaseStudy.tsx` | 65 | **UI ظاهر** | `'موقع قديم غير متجاوب مع الهواتف الذكية مع وقت تحميل يتجاوز 5 ثوانٍ.',` |
| 503 | `src/pages/CaseStudy.tsx` | 66 | **UI ظاهر** | `'عدم ظهور العيادة في الصفحة الأولى في نتائج البحث في جوجل لخدمات الكشف التخصصي.',` |
| 504 | `src/pages/CaseStudy.tsx` | 69 | **UI ظاهر** | `'تصميم موقع طبي راقٍ يبرز تخصصات الأطباء، السيرة الذاتية، ومواعيد العيادات بوضوح.',` |
| 505 | `src/pages/CaseStudy.tsx` | 70 | **UI ظاهر** | `'نظام حجز مواعيد إلكتروني ذكي يحدد الطبيب والوقت المناسب ويؤكد الحجز آلياً عبر واتساب.',` |
| 506 | `src/pages/CaseStudy.tsx` | 71 | **UI ظاهر** | `'تهيئة سيو محلية دقيقة للكلمات المفتاحية الطبية، مما جعل الموقع يتصدر نتائج البحث.',` |
| 507 | `src/pages/CaseStudy.tsx` | 74 | **UI ظاهر** | `{ value: 145, suffix: '%', label: 'زيادة الحجوزات الطبية المؤكدة' },` |
| 508 | `src/pages/CaseStudy.tsx` | 75 | **UI ظاهر** | `{ value: 70, suffix: '%', label: 'توفير وقت مكالمات الاستقبال' },` |
| 509 | `src/pages/CaseStudy.tsx` | 76 | **UI ظاهر** | `{ value: 99, suffix: '/100', label: 'تقييم تجربة الموبايل (Mobile UX)' },` |
| 510 | `src/pages/CaseStudy.tsx` | 77 | **UI ظاهر** | `{ value: 1, suffix: '#', label: 'المرتبة الأولى في نتائج البحث محلياً' },` |
| 511 | `src/pages/CaseStudy.tsx` | 80 | **UI ظاهر** | `text: 'كليك زون حوّلوا موقعنا من مجرد صفحة إلى أهم قناة لاستقبال المرضى الجدد وتنظيم جدول ` |
| 512 | `src/pages/CaseStudy.tsx` | 81 | **UI ظاهر** | `author: 'د. أحمد منصور',` |
| 513 | `src/pages/CaseStudy.tsx` | 82 | **UI ظاهر** | `role: 'المدير التنفيذي لمجمع عيادات رويال',` |
| 514 | `src/pages/CaseStudy.tsx` | 101 | **UI ظاهر** | `description: `دراسة حالة: كيف ساعدت وكالة كليك زون ${study.client} في تحقيق نمو استثنائي و` |
| 515 | `src/pages/CaseStudy.tsx` | 114 | **attribute** | `title={`${study.title} \| دراسة حالة Click Zoon`}` |
| 516 | `src/pages/CaseStudy.tsx` | 115 | **UI ظاهر** | `description={`قصة نجاح ${study.client}: التحديات، الحلول الرقمية، والنتائج القياسية التي ت` |
| 517 | `src/pages/CaseStudy.tsx` | 195 | **UI ظاهر** | `<span>التحدي قبل التطوير</span>` |
| 518 | `src/pages/CaseStudy.tsx` | 213 | **UI ظاهر** | `<span>الحل الذكي من كليك زون</span>` |
| 519 | `src/pages/CaseStudy.tsx` | 251 | **UI ظاهر** | `جاهز لتحقيق نفس النجاح لنشاطك التجاري؟` |
| 520 | `src/pages/CaseStudy.tsx` | 254 | **UI ظاهر** | `احصل على نموذج ديمو تجريبي لموقع نشاطك خلال 48 ساعة مجاناً وبدون أي التزام مالي.` |
| 521 | `src/pages/CaseStudy.tsx` | 258 | **UI ظاهر** | `احسب تكلفة موقعك واطلب الديمو` |
| 522 | `src/pages/CaseStudy.tsx` | 261 | **UI ظاهر** | `href={waLink(`مرحباً كليك زون، اطلعت على دراسة حالة ${study.client} وحابب أعمل موقع لنشاطي` |
| 523 | `src/pages/CaseStudy.tsx` | 266 | **UI ظاهر** | `تحدث مع مستشارنا عبر واتساب` |
| 524 | `src/pages/CustomerAccount.tsx` | 10 | **UI ظاهر** | `new: 'جديد',` |
| 525 | `src/pages/CustomerAccount.tsx` | 11 | **UI ظاهر** | `contacted: 'تم التواصل',` |
| 526 | `src/pages/CustomerAccount.tsx` | 12 | **UI ظاهر** | `delivered: 'تم التسليم',` |
| 527 | `src/pages/CustomerAccount.tsx` | 13 | **UI ظاهر** | `rejected: 'مرفوض',` |
| 528 | `src/pages/CustomerAccount.tsx` | 25 | **UI ظاهر** | `useNoIndex('حسابي \| Click Zoon');` |
| 529 | `src/pages/CustomerAccount.tsx` | 82 | **validation** | `setSaveError('فشل حفظ التغييرات. حاول مرة أخرى.');` |
| 530 | `src/pages/CustomerAccount.tsx` | 85 | **UI ظاهر** | `setSavedMsg('تم حفظ التغييرات بنجاح');` |
| 531 | `src/pages/CustomerAccount.tsx` | 94 | **validation** | `setPwdError('كلمة المرور الجديدة لازم تكون 12 حرف على الأقل');` |
| 532 | `src/pages/CustomerAccount.tsx` | 98 | **validation** | `setPwdError('كلمة المرور وتأكيدها غير متطابقين');` |
| 533 | `src/pages/CustomerAccount.tsx` | 105 | **validation** | `setPwdError('فشل تغيير كلمة المرور. حاول مرة أخرى.');` |
| 534 | `src/pages/CustomerAccount.tsx` | 108 | **UI ظاهر** | `setPwdMsg('تم تغيير كلمة المرور بنجاح');` |
| 535 | `src/pages/CustomerAccount.tsx` | 138 | **UI ظاهر** | `<h1 className="text-2xl font-bold mb-1">حسابي</h1>` |
| 536 | `src/pages/CustomerAccount.tsx` | 144 | **UI ظاهر** | `طلباتي` |
| 537 | `src/pages/CustomerAccount.tsx` | 147 | **UI ظاهر** | `تسجيل خروج` |
| 538 | `src/pages/CustomerAccount.tsx` | 155 | **UI ظاهر** | `<h2 className="text-lg font-bold mb-4">بياناتي</h2>` |
| 539 | `src/pages/CustomerAccount.tsx` | 160 | **UI ظاهر** | `الاسم` |
| 540 | `src/pages/CustomerAccount.tsx` | 173 | **UI ظاهر** | `البريد الإلكتروني` |
| 541 | `src/pages/CustomerAccount.tsx` | 186 | **UI ظاهر** | `رقم الموبايل` |
| 542 | `src/pages/CustomerAccount.tsx` | 215 | **UI ظاهر** | `{saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}` |
| 543 | `src/pages/CustomerAccount.tsx` | 222 | **UI ظاهر** | `<h2 className="text-lg font-bold mb-4">تغيير كلمة المرور</h2>` |
| 544 | `src/pages/CustomerAccount.tsx` | 227 | **UI ظاهر** | `كلمة المرور الجديدة` |
| 545 | `src/pages/CustomerAccount.tsx` | 235 | **attribute** | `placeholder="12 حرف على الأقل"` |
| 546 | `src/pages/CustomerAccount.tsx` | 247 | **UI ظاهر** | `<p className="text-navy-500 text-xs mt-1.5">لازم 12 حرف على الأقل</p>` |
| 547 | `src/pages/CustomerAccount.tsx` | 252 | **UI ظاهر** | `تأكيد كلمة المرور` |
| 548 | `src/pages/CustomerAccount.tsx` | 282 | **UI ظاهر** | `{pwdLoading ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}` |
| 549 | `src/pages/CustomerAccount.tsx` | 290 | **UI ظاهر** | `<h2 className="text-lg font-bold">آخر الطلبات</h2>` |
| 550 | `src/pages/CustomerAccount.tsx` | 292 | **UI ظاهر** | `عرض الكل` |
| 551 | `src/pages/CustomerAccount.tsx` | 297 | **UI ظاهر** | `<p className="text-navy-400 text-sm">جارٍ التحميل...</p>` |
| 552 | `src/pages/CustomerAccount.tsx` | 299 | **UI ظاهر** | `<p className="text-navy-400 text-sm">لا توجد طلبات حتى الآن</p>` |
| 553 | `src/pages/CustomerAccount.tsx` | 323 | **UI ظاهر** | `العودة للموقع` |
| 554 | `src/pages/CustomerAuth.tsx` | 17 | **UI ظاهر** | `useNoIndex(mode === 'signup' ? 'إنشاء حساب جديد \| Click Zoon' : 'تسجيل الدخول \| Click Zo` |
| 555 | `src/pages/CustomerAuth.tsx` | 88 | **validation** | `setError('كلمة المرور لازم تكون 12 حرف على الأقل');` |
| 556 | `src/pages/CustomerAuth.tsx` | 92 | **validation** | `setError('كلمة المرور وتأكيدها غير متطابقين');` |
| 557 | `src/pages/CustomerAuth.tsx` | 96 | **validation** | `setError('رقم الموبايل غير صحيح. مثال صحيح: 01020095059');` |
| 558 | `src/pages/CustomerAuth.tsx` | 107 | **UI ظاهر** | `setSuccess('تم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول الآن.');` |
| 559 | `src/pages/CustomerAuth.tsx` | 132 | **validation** | `setResetError('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');` |
| 560 | `src/pages/CustomerAuth.tsx` | 134 | **validation** | `setResetError('فشل إرسال رابط إعادة التعيين. حاول مرة تانية.');` |
| 561 | `src/pages/CustomerAuth.tsx` | 138 | **UI ظاهر** | `setResetSuccess('تم إرسال رابط إعادة تعيين كلمة المرور على بريدك الإلكتروني.');` |
| 562 | `src/pages/CustomerAuth.tsx` | 140 | **validation** | `setResetError('حدث خطأ غير متوقع. حاول مرة تانية.');` |
| 563 | `src/pages/CustomerAuth.tsx` | 159 | **UI ظاهر** | `{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}` |
| 564 | `src/pages/CustomerAuth.tsx` | 162 | **UI ظاهر** | `{mode === 'login' ? 'ادخل لحسابك لمتابعة طلباتك' : 'أنشئ حساب لتتبع طلبات الديمو الخاصة بك` |
| 565 | `src/pages/CustomerAuth.tsx` | 204 | **UI ظاهر** | `<span>{googleLoading ? 'جارٍ التحويل إلى جوجل...' : 'المتابعة بحساب جوجل'}</span>` |
| 566 | `src/pages/CustomerAuth.tsx` | 217 | **UI ظاهر** | `<span className="bg-[#121f35] px-3 text-xs text-navy-400 font-medium absolute">أو</span>` |
| 567 | `src/pages/CustomerAuth.tsx` | 223 | **UI ظاهر** | `البريد الإلكتروني` |
| 568 | `src/pages/CustomerAuth.tsx` | 238 | **UI ظاهر** | `كلمة المرور` |
| 569 | `src/pages/CustomerAuth.tsx` | 262 | **UI ظاهر** | `{loading ? 'جارٍ الدخول...' : 'دخول'}` |
| 570 | `src/pages/CustomerAuth.tsx` | 274 | **UI ظاهر** | `نسيت كلمة المرور؟` |
| 571 | `src/pages/CustomerAuth.tsx` | 282 | **UI ظاهر** | `بريدك الإلكتروني` |
| 572 | `src/pages/CustomerAuth.tsx` | 300 | **UI ظاهر** | `{resetLoading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}` |
| 573 | `src/pages/CustomerAuth.tsx` | 316 | **UI ظاهر** | `ليس لديك حساب؟{' '}` |
| 574 | `src/pages/CustomerAuth.tsx` | 318 | **UI ظاهر** | `إنشاء حساب` |
| 575 | `src/pages/CustomerAuth.tsx` | 322 | **UI ظاهر** | `العودة للموقع` |
| 576 | `src/pages/CustomerAuth.tsx` | 356 | **UI ظاهر** | `<span>{googleLoading ? 'جارٍ التحويل إلى جوجل...' : 'المتابعة بحساب جوجل'}</span>` |
| 577 | `src/pages/CustomerAuth.tsx` | 369 | **UI ظاهر** | `<span className="bg-[#121f35] px-3 text-xs text-navy-400 font-medium absolute">أو</span>` |
| 578 | `src/pages/CustomerAuth.tsx` | 375 | **UI ظاهر** | `الاسم الكامل` |
| 579 | `src/pages/CustomerAuth.tsx` | 382 | **attribute** | `placeholder="اسمك الكريم"` |
| 580 | `src/pages/CustomerAuth.tsx` | 389 | **UI ظاهر** | `البريد الإلكتروني` |
| 581 | `src/pages/CustomerAuth.tsx` | 404 | **UI ظاهر** | `رقم الموبايل` |
| 582 | `src/pages/CustomerAuth.tsx` | 419 | **UI ظاهر** | `كلمة المرور` |
| 583 | `src/pages/CustomerAuth.tsx` | 427 | **attribute** | `placeholder="12 حرف على الأقل"` |
| 584 | `src/pages/CustomerAuth.tsx` | 439 | **UI ظاهر** | `<p className="text-navy-500 text-xs mt-1.5">لازم 12 حرف على الأقل</p>` |
| 585 | `src/pages/CustomerAuth.tsx` | 444 | **UI ظاهر** | `تأكيد كلمة المرور` |
| 586 | `src/pages/CustomerAuth.tsx` | 468 | **UI ظاهر** | `{loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}` |
| 587 | `src/pages/CustomerAuth.tsx` | 471 | **UI ظاهر** | `لديك حساب بالفعل؟{' '}` |
| 588 | `src/pages/CustomerAuth.tsx` | 473 | **UI ظاهر** | `تسجيل الدخول` |
| 589 | `src/pages/CustomerAuth.tsx` | 477 | **UI ظاهر** | `العودة للموقع` |
| 590 | `src/pages/CustomerRequests.tsx` | 10 | **UI ظاهر** | `new: 'جديد',` |
| 591 | `src/pages/CustomerRequests.tsx` | 11 | **UI ظاهر** | `contacted: 'تم التواصل',` |
| 592 | `src/pages/CustomerRequests.tsx` | 12 | **UI ظاهر** | `delivered: 'تم التسليم',` |
| 593 | `src/pages/CustomerRequests.tsx` | 13 | **UI ظاهر** | `rejected: 'مرفوض',` |
| 594 | `src/pages/CustomerRequests.tsx` | 35 | **UI ظاهر** | `useNoIndex('طلباتي \| Click Zoon');` |
| 595 | `src/pages/CustomerRequests.tsx` | 74 | **UI ظاهر** | `<h1 className="text-2xl font-bold">طلباتي</h1>` |
| 596 | `src/pages/CustomerRequests.tsx` | 77 | **UI ظاهر** | `حسابي` |
| 597 | `src/pages/CustomerRequests.tsx` | 84 | **UI ظاهر** | `<p className="text-navy-400 mb-4">لا توجد طلبات حتى الآن</p>` |
| 598 | `src/pages/CustomerRequests.tsx` | 86 | **UI ظاهر** | `اطلب ديمو مجاني` |
| 599 | `src/pages/CustomerRequests.tsx` | 106 | **UI ظاهر** | `<span className="text-navy-500 text-xs">الاسم:</span>` |
| 600 | `src/pages/CustomerRequests.tsx` | 110 | **UI ظاهر** | `<span className="text-navy-500 text-xs">الهاتف:</span>` |
| 601 | `src/pages/CustomerRequests.tsx` | 115 | **UI ظاهر** | `<span className="text-navy-500 text-xs">الرابط:</span>` |
| 602 | `src/pages/CustomerRequests.tsx` | 130 | **UI ظاهر** | `العودة للموقع` |
| 603 | `src/pages/NotFound.tsx` | 14 | **attribute** | `<Seo title="الصفحة غير موجودة (404)" noindex={true} />` |
| 604 | `src/pages/Privacy.tsx` | 14 | **attribute** | `title="سياسة الخصوصية"` |
| 605 | `src/pages/Privacy.tsx` | 16 | **UI ظاهر** | `description="سياسة خصوصية Click Zoon: نلتزم بحماية بياناتك الشخصية وبيانات نشاطك التجاري ب` |
| 606 | `src/pages/ResetPassword.tsx` | 31 | **UI ظاهر** | `useNoIndex('إعادة تعيين كلمة المرور \| Click Zoon');` |
| 607 | `src/pages/ResetPassword.tsx` | 114 | **validation** | `setErrorMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل');` |
| 608 | `src/pages/ResetPassword.tsx` | 120 | **validation** | `setErrorMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقين');` |
| 609 | `src/pages/ResetPassword.tsx` | 133 | **validation** | `setErrorMessage('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');` |
| 610 | `src/pages/ResetPassword.tsx` | 135 | **validation** | `setErrorMessage(error.message \|\| 'فشل تحديث كلمة المرور. حاول مرة تانية.');` |
| 611 | `src/pages/ResetPassword.tsx` | 175 | **validation** | `setErrorMessage('تم إرسال عدد كبير من الطلبات، حاول بعد قليل');` |
| 612 | `src/pages/ResetPassword.tsx` | 177 | **validation** | `setErrorMessage('حدث خطأ غير متوقع أثناء تحديث كلمة المرور. حاول مرة تانية.');` |
| 613 | `src/pages/ResetPassword.tsx` | 191 | **UI ظاهر** | `<span className="text-navy-300 text-sm font-medium">جارٍ التحقق من رابط إعادة التعيين...</` |
| 614 | `src/pages/ResetPassword.tsx` | 212 | **UI ظاهر** | `<h1 className="text-xl font-bold text-navy-50 mb-2">رابط غير صالح أو منتهي الصلاحية</h1>` |
| 615 | `src/pages/ResetPassword.tsx` | 214 | **UI ظاهر** | `رابط إعادة تعيين كلمة المرور انتهت صلاحيته أو تم استخدامه من قبل. يمكنك طلب رابط جديد لإعا` |
| 616 | `src/pages/ResetPassword.tsx` | 224 | **UI ظاهر** | `طلب رابط جديد (حسابات العملاء)` |
| 617 | `src/pages/ResetPassword.tsx` | 232 | **UI ظاهر** | `طلب رابط جديد (لوحة التحكم)` |
| 618 | `src/pages/ResetPassword.tsx` | 239 | **UI ظاهر** | `العودة للصفحة الرئيسية` |
| 619 | `src/pages/ResetPassword.tsx` | 264 | **UI ظاهر** | `<h1 className="text-2xl font-bold text-navy-50 mb-2">تم تغيير كلمة المرور بنجاح</h1>` |
| 620 | `src/pages/ResetPassword.tsx` | 266 | **UI ظاهر** | `تم تحديث كلمة المرور الخاصة بحسابك. سيتم تحويلك لصفحة تسجيل الدخول خلال لحظات...` |
| 621 | `src/pages/ResetPassword.tsx` | 275 | **UI ظاهر** | `الانتقال إلى صفحة الدخول الآن` |
| 622 | `src/pages/ResetPassword.tsx` | 293 | **UI ظاهر** | `<h1 className="text-2xl font-bold text-navy-50 mb-2">إعادة تعيين كلمة المرور</h1>` |
| 623 | `src/pages/ResetPassword.tsx` | 294 | **UI ظاهر** | `<p className="text-navy-400 text-sm">أدخل كلمة المرور الجديدة لحسابك</p>` |
| 624 | `src/pages/ResetPassword.tsx` | 308 | **UI ظاهر** | `كلمة المرور الجديدة` |
| 625 | `src/pages/ResetPassword.tsx` | 316 | **attribute** | `placeholder="8 أحرف على الأقل"` |
| 626 | `src/pages/ResetPassword.tsx` | 325 | **attribute** | `aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}` |
| 627 | `src/pages/ResetPassword.tsx` | 330 | **UI ظاهر** | `<p className="text-navy-400 text-xs mt-1.5">يجب أن تكون 8 أحرف على الأقل</p>` |
| 628 | `src/pages/ResetPassword.tsx` | 336 | **UI ظاهر** | `تأكيد كلمة المرور` |
| 629 | `src/pages/ResetPassword.tsx` | 353 | **attribute** | `aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}` |
| 630 | `src/pages/ResetPassword.tsx` | 370 | **UI ظاهر** | `{status === 'submitting' ? 'جارٍ تحديث كلمة المرور...' : 'تحديث كلمة المرور'}` |
| 631 | `src/pages/ResetPassword.tsx` | 378 | **UI ظاهر** | `العودة لتسجيل الدخول` |
| 632 | `src/pages/Showcase.tsx` | 47 | **attribute** | `title={t('showcase.meta_title') \|\| 'معرض الأعمال: مواقع وبرامج جاهزة'}` |
| 633 | `src/pages/Showcase.tsx` | 48 | **UI ظاهر** | `description={t('showcase.meta_desc') \|\| 'تصفح المواقع والبرامج والمتاجر الإلكترونية التي` |
| 634 | `src/pages/Showcase.tsx` | 65 | **attribute** | `<div className="flex gap-2 overflow-x-auto pb-2 mb-8" role="tablist" aria-label="تصفية الأ` |
| 635 | `src/pages/ShowcaseApp.tsx` | 165 | **attribute** | `alt="تكبير الصورة"` |
| 636 | `src/siteConfig.ts` | 5 | **تعليق برمجي (code comment)** | `// محتوى الموقع — القيم الافتراضية` |
| 637 | `src/siteConfig.ts` | 6 | **تعليق برمجي (code comment)** | `// يتم استخدامها ك fallback في حال عدم تحميل البيانات من قاعدة البيانات` |
| 638 | `src/siteConfig.ts` | 11 | **data-from-DB** | `agencyNameAr: 'كليك زون',` |
| 639 | `src/siteConfig.ts` | 15 | **data-from-DB** | `location: 'خدمة عملاء أونلاين',` |
| 640 | `src/siteConfig.ts` | 19 | **data-from-DB** | `footerText: 'وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التجاري` |
| 641 | `src/siteConfig.ts` | 20 | **data-from-DB** | `promoBarText: 'نبني لك ديمو لموقع نشاطك مجاناً — بدون التزام',` |
| 642 | `src/siteConfig.ts` | 21 | **attribute** | `seoTitle: 'Click Zoon — تصميم وتطوير المواقع والمتاجر الإلكترونية',` |
| 643 | `src/siteConfig.ts` | 22 | **data-from-DB** | `seoDescription: 'نُصمّم ونطوّر مواقع ومتاجر إلكترونية احترافية لكل الأنشطة التجارية — بداي` |
| 644 | `src/siteConfig.ts` | 26 | **data-from-DB** | `general: 'السلام عليكم، عايز أعرف تفاصيل عن عمل موقع لنشاطي',` |
| 645 | `src/siteConfig.ts` | 27 | **data-from-DB** | `demo: 'السلام عليكم، عايز أطلب ديمو مجاني لموقع نشاطي',` |
| 646 | `src/siteConfig.ts` | 28 | **data-from-DB** | `pricing: 'السلام عليكم، عايز أعرف تفاصيل أسعار باقة',` |
| 647 | `src/siteConfig.ts` | 29 | **data-from-DB** | `contact: 'السلام عليكم، عندي استفسار عن خدماتكم',` |
| 648 | `src/siteConfig.ts` | 33 | **attribute** | `{ icon: 'Gift', title: 'ديمو مجاني', subtitle: 'بدون التزام' },` |
| 649 | `src/siteConfig.ts` | 34 | **attribute** | `{ icon: 'Zap', title: 'تسليم سريع', subtitle: 'من 3 أيام إلى أسبوع' },` |
| 650 | `src/siteConfig.ts` | 35 | **attribute** | `{ icon: 'Headphones', title: 'دعم مستمر', subtitle: 'بعد الإطلاق' },` |
| 651 | `src/siteConfig.ts` | 40 | **data-from-DB** | `name: 'أساسية',` |
| 652 | `src/siteConfig.ts` | 41 | **data-from-DB** | `tagline: 'مناسبة للأنشطة الصغيرة',` |
| 653 | `src/siteConfig.ts` | 42 | **data-from-DB** | `features: ['موقع من صفحة واحدة', 'تصميم متجاوب مع الموبايل', 'ربط واتساب واتصال مباشر', 'ت` |
| 654 | `src/siteConfig.ts` | 47 | **data-from-DB** | `name: 'احترافية',` |
| 655 | `src/siteConfig.ts` | 48 | **data-from-DB** | `tagline: 'الأكثر طلباً',` |
| 656 | `src/siteConfig.ts` | 49 | **data-from-DB** | `features: ['موقع متعدد الصفحات', 'تصميم مخصص بالكامل لهويتك', 'معرض صور + آراء العملاء', '` |
| 657 | `src/siteConfig.ts` | 54 | **data-from-DB** | `name: 'متجر إلكتروني',` |
| 658 | `src/siteConfig.ts` | 55 | **data-from-DB** | `tagline: 'ابدأ تبيع أونلاين',` |
| 659 | `src/siteConfig.ts` | 56 | **data-from-DB** | `features: ['متجر إلكتروني متكامل', 'إدارة منتجات وطلبات', 'ربط طرق الدفع الإلكتروني', 'ربط` |
| 660 | `src/siteConfig.ts` | 94 | **attribute** | `aboutTitle: s?.about_title ?? 'من نحن',` |
| 661 | `src/__tests__/i18n.test.ts` | 110 | **data-from-DB** | `nav: { home: 'الرئيسية', services: 'الخدمات' },` |
| 662 | `src/__tests__/i18n.test.ts` | 111 | **UI ظاهر** | `only_in_arabic: 'محتوى عربي فقط',` |
| 663 | `src/__tests__/i18n.test.ts` | 112 | **UI ظاهر** | `greeting: 'مرحباً {name}!',` |
| 664 | `src/__tests__/i18n.test.ts` | 126 | **UI ظاهر** | `expect(translateKey('ar', mockAr, mockEn, 'nav.home')).toBe('الرئيسية');` |
| 665 | `src/__tests__/i18n.test.ts` | 127 | **UI ظاهر** | `expect(translateKey('ar', mockAr, mockEn, 'nav.services')).toBe('الخدمات');` |
| 666 | `src/__tests__/i18n.test.ts` | 133 | **UI ظاهر** | `expect(result).toBe('محتوى عربي فقط');` |
| 667 | `src/__tests__/i18n.test.ts` | 138 | **UI ظاهر** | `expect(result).toBe('الرئيسية');` |
| 668 | `src/__tests__/i18n.test.ts` | 148 | **UI ظاهر** | `expect(translateKey('ar', mockAr, mockEn, 'greeting', { name: 'أحمد' })).toBe('مرحباً أحمد` |
| 669 | `index.html` | 17 | **UI ظاهر** | `<title>Click Zoon \| تصميم وتطوير المواقع والمتاجر الإلكترونية</title>` |
| 670 | `index.html` | 18 | **UI ظاهر** | `<meta name="description" content="Click Zoon وكالة متخصصة في تصميم وتطوير المواقع والمتاجر` |
| 671 | `index.html` | 19 | **UI ظاهر** | `<meta name="keywords" content="تصميم مواقع, متاجر إلكترونية, Click Zoon, كليك زون, موقع مط` |
| 672 | `index.html` | 25 | **UI ظاهر** | `<meta property="og:title" content="Click Zoon \| تصميم وتطوير المواقع والمتاجر الإلكترونية` |
| 673 | `index.html` | 26 | **UI ظاهر** | `<meta property="og:description" content="وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإ` |
| 674 | `index.html` | 30 | **UI ظاهر** | `<meta property="og:image:alt" content="Click Zoon — تصميم وتطوير المواقع والمتاجر الإلكترو` |
| 675 | `index.html` | 36 | **UI ظاهر** | `<meta name="twitter:title" content="Click Zoon \| تصميم وتطوير المواقع والمتاجر الإلكتروني` |
| 676 | `index.html` | 37 | **UI ظاهر** | `<meta name="twitter:description" content="وكالة متخصصة في تصميم وتطوير المواقع والمتاجر ال` |
| 677 | `index.html` | 39 | **UI ظاهر** | `<meta name="twitter:image:alt" content="Click Zoon — تصميم وتطوير المواقع والمتاجر الإلكتر` |
| 678 | `index.html` | 47 | **UI ظاهر** | `"alternateName": "كليك زون لتصميم المواقع",` |
| 679 | `index.html` | 51 | **UI ظاهر** | `"description": "وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التج` |
| 680 | `index.html` | 53 | **UI ظاهر** | `"المنصورة",` |
| 681 | `index.html` | 54 | **UI ظاهر** | `"الدقهلية",` |
| 682 | `index.html` | 55 | **UI ظاهر** | `"مصر"` |
| 683 | `index.html` | 72 | **UI ظاهر** | `Click Zoon \| تصميم وتطوير المواقع والمتاجر الإلكترونية` |
| 684 | `index.html` | 75 | **UI ظاهر** | `في Click Zoon نُصمّم ونطوّر مواقع ومتاجر إلكترونية احترافية لكل الأنشطة التجارية في المنصو` |
| 685 | `index.html` | 83 | **UI ظاهر** | `<p style="font-size:1.1rem;margin:0 0 8px 0;font-weight:bold;">مرحباً بك في Click Zoon</p>` |
| 686 | `index.html` | 85 | **UI ظاهر** | `لطلب ديمو مجاني لموقع نشاطك أو الاستفسار المباشر، يمكنك التواصل معنا هاتفياً أو عبر واتساب` |
| 687 | `public/og-image.svg` | 17 | **UI ظاهر** | `<text x="600" y="340" font-family="Arial, sans-serif" font-size="32" font-weight="400" fil` |
| 688 | `public/og-image.svg` | 18 | **UI ظاهر** | `<text x="600" y="400" font-family="Arial, sans-serif" font-size="24" font-weight="400" fil` |
