# دليل إعداد إشعارات تيليجرام الفورية لطلبات Click Zoon

هذا الدليل يشرح لك خطوة بخطوة (وبشكل مبسط جداً) كيفية ربط موقع Click Zoon بتيليجرام، لتصلك رسالة إشعار فورية على هاتفك في كل مرة يقوم فيها عميل بطلب ديمو أو إرسال استفسار عبر الموقع.

---

## الخطوة 1: إنشاء بوت تيليجرام والحصول على Token

1. افتح تطبيق تيليجرام وابحث عن الحساب الرسمي: **`@BotFather`**.
2. اضغط **Start** ثم أرسل الأمر: `/newbot`.
3. سيطلب منك كتابة اسم للبوت (مثلاً: `Click Zoon Alerts`).
4. بعد ذلك سيطلب منك كتابة معرف فريد ينتهي بكلمة `bot` (مثلاً: `ClickZoonAlertsBot`).
5. بعد إتمام الإنشاء، سيعطيك BotFather رسالة تحتوي على الـ **HTTP API Token** (شكله مثل: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).
6. احتفظ بهذا التوكن، هذا هو: **`TELEGRAM_BOT_TOKEN`**.

---

## الخطوة 2: معرفة الـ Chat ID الخاص بحسابك

لكي يعرف البوت أين يرسل الرسائل، يحتاج إلى معرّف المحادثة (Chat ID) الخاص بك:

1. في تطبيق تيليجرام، افتح البوت الذي أنشأته للتو واضغط **Start** (أرسل له أي رسالة مثل "مرحبا").
2. لمعرفة الـ Chat ID الخاص بك، ابحث عن بوت: **`@userinfobot`** واضغط **Start**.
3. سيرد عليك فوراً ببياناتك ومن بينها: **Id** (رقم مكون من 9 أو 10 أرقام، مثلاً: `987654321`).
4. هذا الرقم هو: **`TELEGRAM_CHAT_ID`**.

---

## الخطوة 3: تحديد سر مشترك (WEBHOOK_SECRET)

اختر كلمة سر عشوائية قوية لحماية الدالة من أي استدعاء خارجي غير مصرّح به (مثلاً: `my_clickzoon_secret_2026`).
هذا هو: **`WEBHOOK_SECRET`**.

---

## الخطوة 4: حفظ الأسرار (Secrets) في Supabase

لديك طريقتان لحفظ الأسرار الثلاثة:

### الطريقة الأولى: من لوحة تحكم Supabase (Dashboard) — الأسهل
1. ادخل إلى لوحة تحكم مشروعك في [Supabase Dashboard](https://supabase.com/dashboard).
2. من القائمة الجانبية اختر **Edge Functions**.
3. في أعلى الصفحة اضغط على علامة التبويب **Secrets** أو **Manage Secrets**.
4. أضف الأسرار التالية:
   - **`TELEGRAM_BOT_TOKEN`**: التوكن الذي حصلت عليه من BotFather.
   - **`TELEGRAM_CHAT_ID`**: معرف المحادثة (Chat ID) الخاص بك.
   - **`WEBHOOK_SECRET`**: كلمة السر التي اخترتها لحماية الـ Webhook.

### الطريقة الثانية: عبر سطر الأوامر (Supabase CLI)
إذا كنت تستخدم أداة Supabase CLI في جهازك، نفّذ الأمر التالي:
```bash
supabase secrets set TELEGRAM_BOT_TOKEN="توكن_البوت_هنا" TELEGRAM_CHAT_ID="معرف_المحادثة_هنا" WEBHOOK_SECRET="كلمة_السر_هنا"
```

---

## الخطوة 5: رفع ونشر الدالة (Deploy Edge Function)

### الخيار (أ): عبر سطر الأوامر (Supabase CLI)
من مجلد المشروع، نفذ الأمر التالي:
```bash
supabase functions deploy notify-new-request --no-verify-jwt
```

### الخيار (ب): عبر واجهة Supabase Dashboard
1. توجه إلى **Edge Functions** في لوحة التحكم.
2. اضغط على **New Function** وسمّها: `notify-new-request`.
3. انسخ محتوى الملف `supabase/functions/notify-new-request/index.ts` بالكامل والصقه في المحرر.
4. احفظ وانشر الدالة (Deploy).

---

## الخطوة 6: إنشاء خطاف قاعدة البيانات (Database Webhook)

الآن سنطلب من Supabase إرسال البيانات إلى الدالة تلقائياً عند إضافة أي طلب جديد:

1. في لوحة تحكم Supabase، ادخل إلى **Database** ثم اختر **Webhooks** من القائمة.
2. اضغط على زر **Create Webhook** أو **Enable Webhooks**.
3. املأ البيانات كالتالي:
   - **Name**: `notify_new_request_telegram`
   - **Table**: اختر جدول `demo_requests` (في مخطط `public`).
   - **Events**: فعّل خيار **Insert** فقط (ألغِ تفعيل Update و Delete).
   - **Webhook Type**: اختر **Supabase Edge Functions**، ثم اختر الدالة `notify-new-request`.
     *(أو اختر HTTP Request وضع رابط الدالة إذا لم يظهر الخيار)*.
   - **HTTP Headers**: أضف هيدر جديد:
     - **Header Name**: `x-webhook-secret`
     - **Header Value**: نفس القيمة التي وضعتها في `WEBHOOK_SECRET`.
4. اضغط **Save** أو **Create Webhook**.

---

## الخطوة 7: التجربة والتأكد من العمل

1. افتح موقعك [Click Zoon](https://clickzoon.com).
2. انزل إلى قسم التواصل / طلب الديمو المجاني.
3. املأ النموذج باسم ورقم تجريبي واضغط إرسال.
4. فور إرسال الطلب، ستصلك رسالة فورية على تيليجرام من البوت الخاص بك تحتوي على:
   - اسم العميل
   - رقم هاتفه
   - نوع النشاط
   - رابط صفحته (إن وُجد)
   - مصدر الطلب
   - توقيت الطلب بتوقيت القاهرة
   - رابط مباشر لفتح محادثة واتساب مع العميل بضغطة زر (`wa.me`)!
