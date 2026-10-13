/*
# Create admin dashboard content tables and admin whitelist

1. New Tables
- `admins` — whitelist of admin emails allowed to access /admin
- `site_settings` — single-row table for general site settings (name, logo, contact, social, SEO, footer text)
- `hero_content` — hero section: headline, rotating words, subtitle, button texts
- `features` — why-us feature cards (icon, title, description, sort order)
- `services` — service cards (icon, title, description, sort order)
- `portfolio_items` — portfolio projects (title, category, description, image URL, link, visible flag, sort order)
- `process_steps` — process steps (icon, title, description, sort order)
- `pricing_plans` — pricing plans (name, tagline, price, features array, highlighted flag, visible flag, sort order)
- `faqs` — FAQ items (question, answer, sort order)
- `section_visibility` — toggles to show/hide each section on the public site

2. Security
- All tables have RLS enabled.
- Public (anon, authenticated) can READ published content only.
  - site_settings, hero_content, features, services, portfolio_items (visible only), process_steps, pricing_plans (visible only), faqs, section_visibility → SELECT for anon+authenticated
  - demo_requests → INSERT only for anon+authenticated, no SELECT/UPDATE/DELETE
- Only admin users (matching email in admins table) can INSERT, UPDATE, DELETE.
  - Admin check: EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email'))
- demo_requests: admin can SELECT and DELETE (to view and clear submissions).

3. Important notes
- site_settings is a single-row table enforced by a unique constraint on id=1.
- All content tables have sort_order for reordering.
- portfolio_items has a visible boolean for show/hide toggle.
- pricing_plans has a visible boolean for show/hide the entire pricing section toggle.
- Seed data is included matching the current hardcoded site content.
*/

-- ===== admins table =====
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins table read for admin only" ON public.admins;
CREATE POLICY "Admins table read for admin only"
ON public.admins FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== site_settings (single row) =====
CREATE TABLE IF NOT EXISTS public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'Click Zoon',
  site_name_ar text NOT NULL DEFAULT 'كليك زون',
  logo_text text NOT NULL DEFAULT 'CZ',
  phone text NOT NULL DEFAULT '01020095059',
  phone_intl text NOT NULL DEFAULT '201020095059',
  email text NOT NULL DEFAULT 'clickzoon30@gmail.com',
  location text NOT NULL DEFAULT 'خدمة عملاء أونلاين',
  facebook text NOT NULL DEFAULT 'https://www.facebook.com/ClikZoon',
  instagram text NOT NULL DEFAULT 'https://www.instagram.com/click_zoon',
  footer_text text NOT NULL DEFAULT 'وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية لكل الأنشطة التجارية. نبني لك حضوراً رقمياً يُميّز نشاطك.',
  seo_title text NOT NULL DEFAULT 'Click Zoon — تصميم وتطوير المواقع والمتاجر الإلكترونية',
  seo_description text NOT NULL DEFAULT 'نُصمّم ونطوّر مواقع ومتاجر إلكترونية احترافية لكل الأنشطة التجارية — بداية مجانية بدون التزام، وتسليم سريع بدعم مستمر.',
  seo_og_image text NOT NULL DEFAULT '/og-image.png',
  promo_bar_text text NOT NULL DEFAULT 'نبني لك ديمو لموقع نشاطك مجاناً — بدون التزام',
  demo_min_hours int NOT NULL DEFAULT 24,
  demo_max_hours int NOT NULL DEFAULT 72,
  show_prices boolean NOT NULL DEFAULT false,
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings public read" ON public.site_settings;
CREATE POLICY "Site settings public read"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Site settings admin write" ON public.site_settings;
CREATE POLICY "Site settings admin write"
ON public.site_settings FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== hero_content (single row) =====
CREATE TABLE IF NOT EXISTS public.hero_content (
  id int PRIMARY KEY DEFAULT 1,
  badge_text text NOT NULL DEFAULT 'تصميم وتطوير مواقع ومتاجر إلكترونية باحتراف',
  headline_line1 text NOT NULL DEFAULT 'خلّي موقع',
  rotating_words text[] NOT NULL DEFAULT ARRAY['مطعمك', 'كافيهك', 'محلك', 'شركتك', 'مشروعك'],
  headline_line2 text NOT NULL DEFAULT 'أونلاين واحترافي',
  subtitle text NOT NULL DEFAULT 'في Click Zoon نُصمّم ونطوّر مواقع ومتاجر إلكترونية احترافية لكل الأنشطة التجارية — بداية مجانية بدون التزام، وتسليم سريع بدعم مستمر.',
  cta_primary text NOT NULL DEFAULT 'اطلب ديمو مجاني',
  cta_secondary text NOT NULL DEFAULT 'شاهد خدماتنا',
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hero content public read" ON public.hero_content;
CREATE POLICY "Hero content public read"
ON public.hero_content FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Hero content admin write" ON public.hero_content;
CREATE POLICY "Hero content admin write"
ON public.hero_content FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== features =====
CREATE TABLE IF NOT EXISTS public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Award',
  title text NOT NULL,
  description text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Features public read" ON public.features;
CREATE POLICY "Features public read"
ON public.features FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Features admin insert" ON public.features;
CREATE POLICY "Features admin insert"
ON public.features FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Features admin update" ON public.features;
CREATE POLICY "Features admin update"
ON public.features FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Features admin delete" ON public.features;
CREATE POLICY "Features admin delete"
ON public.features FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== services =====
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Globe',
  title text NOT NULL,
  description text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Services public read" ON public.services;
CREATE POLICY "Services public read"
ON public.services FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Services admin insert" ON public.services;
CREATE POLICY "Services admin insert"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Services admin update" ON public.services;
CREATE POLICY "Services admin update"
ON public.services FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Services admin delete" ON public.services;
CREATE POLICY "Services admin delete"
ON public.services FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== portfolio_items =====
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'restaurants',
  description text NOT NULL,
  image_url text NOT NULL,
  link text,
  visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolio public read visible" ON public.portfolio_items;
CREATE POLICY "Portfolio public read visible"
ON public.portfolio_items FOR SELECT
TO anon, authenticated
USING (visible = true);

DROP POLICY IF EXISTS "Portfolio admin read all" ON public.portfolio_items;
CREATE POLICY "Portfolio admin read all"
ON public.portfolio_items FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Portfolio admin insert" ON public.portfolio_items;
CREATE POLICY "Portfolio admin insert"
ON public.portfolio_items FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Portfolio admin update" ON public.portfolio_items;
CREATE POLICY "Portfolio admin update"
ON public.portfolio_items FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Portfolio admin delete" ON public.portfolio_items;
CREATE POLICY "Portfolio admin delete"
ON public.portfolio_items FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== process_steps =====
CREATE TABLE IF NOT EXISTS public.process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'MessageSquare',
  title text NOT NULL,
  description text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Process steps public read" ON public.process_steps;
CREATE POLICY "Process steps public read"
ON public.process_steps FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Process steps admin insert" ON public.process_steps;
CREATE POLICY "Process steps admin insert"
ON public.process_steps FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Process steps admin update" ON public.process_steps;
CREATE POLICY "Process steps admin update"
ON public.process_steps FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Process steps admin delete" ON public.process_steps;
CREATE POLICY "Process steps admin delete"
ON public.process_steps FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== pricing_plans =====
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text NOT NULL,
  price text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT ARRAY[]::text[],
  highlighted boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pricing plans public read visible" ON public.pricing_plans;
CREATE POLICY "Pricing plans public read visible"
ON public.pricing_plans FOR SELECT
TO anon, authenticated
USING (visible = true);

DROP POLICY IF EXISTS "Pricing plans admin read all" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin read all"
ON public.pricing_plans FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Pricing plans admin insert" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin insert"
ON public.pricing_plans FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Pricing plans admin update" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin update"
ON public.pricing_plans FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Pricing plans admin delete" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin delete"
ON public.pricing_plans FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== faqs =====
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "FAQs public read" ON public.faqs;
CREATE POLICY "FAQs public read"
ON public.faqs FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "FAQs admin insert" ON public.faqs;
CREATE POLICY "FAQs admin insert"
ON public.faqs FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "FAQs admin update" ON public.faqs;
CREATE POLICY "FAQs admin update"
ON public.faqs FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "FAQs admin delete" ON public.faqs;
CREATE POLICY "FAQs admin delete"
ON public.faqs FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== section_visibility =====
CREATE TABLE IF NOT EXISTS public.section_visibility (
  id text PRIMARY KEY,
  label text NOT NULL,
  visible boolean NOT NULL DEFAULT true
);

ALTER TABLE public.section_visibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Section visibility public read" ON public.section_visibility;
CREATE POLICY "Section visibility public read"
ON public.section_visibility FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Section visibility admin write" ON public.section_visibility;
CREATE POLICY "Section visibility admin write"
ON public.section_visibility FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== demo_requests policies update =====
-- Allow admin to read and delete demo requests
DROP POLICY IF EXISTS "Admin can read demo requests" ON public.demo_requests;
CREATE POLICY "Admin can read demo requests"
ON public.demo_requests FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

DROP POLICY IF EXISTS "Admin can delete demo requests" ON public.demo_requests;
CREATE POLICY "Admin can delete demo requests"
ON public.demo_requests FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- ===== SEED DATA =====

-- Admin email
INSERT INTO public.admins (email) VALUES ('youssefhasaan354@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Site settings
INSERT INTO public.site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Hero content
INSERT INTO public.hero_content (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Features
INSERT INTO public.features (icon, title, description, sort_order) VALUES
('Award', 'تصميم احترافي', 'كل موقع مصمم خصيصاً ليُعبّر عن هوية نشاطك.', 1),
('Smartphone', 'موبايل أولاً', 'أغلب عملائك على الموبايل — وخلي تجربتهم مثالية.', 2),
('Zap', 'تسليم سريع', 'الديمو في 24-72 ساعة، والتسليم النهائي من 3 أيام إلى أسبوع.', 3),
('Headphones', 'دعم مستمر', 'مش بنسيبك بعد الإطلاق — دعم فني وتحديثات مستمرة.', 4),
('Search', 'جاهز لـ SEO', 'مهيّأ لظهور جوجل من اليوم الأول.', 5),
('ShieldCheck', 'بدون عمولات', 'طلباتك بتوصلك مباشرة — بدون عمولات تطبيقات التوصيل.', 6)
ON CONFLICT DO NOTHING;

-- Services
INSERT INTO public.services (icon, title, description, sort_order) VALUES
('Globe', 'تصميم وتطوير المواقع', 'موقع احترافي يعكس هوية نشاطك ويسهّل على عملائك الوصول لمعلوماتك في أي وقت.', 1),
('ShoppingCart', 'متاجر إلكترونية', 'متجر متكامل مع ربط الدفع والتوصيل، يدير طلباتك بدون عمولات تطبيقات الطرف الثالث.', 2),
('Rocket', 'صفحات هبوط للحملات', 'صفحات تسويقية مُحسّنة للتحويل، مصممة لزيادة مبيعاتك وحجوزاتك من الإعلانات.', 3),
('RefreshCw', 'إعادة تصميم وصيانة', 'حدّث موقعك القديم بتصميم عصري، أو خلّينا نتكفّل بصيانته وتحديثه باستمرار.', 4),
('Search', 'تحسين SEO', 'خلي نشاطك يظهر في نتائج جوجل وقت ما عميلك يبحث عنك، بدل ما يروح للمنافس.', 5),
('Server', 'حجز الدومين والاستضافة', 'نتكفّل بحجز اسم موقعك وإعداده على استضافة سريعة وآمنة — من البداية للنهاية.', 6)
ON CONFLICT DO NOTHING;

-- Portfolio items
INSERT INTO public.portfolio_items (title, category, description, image_url, visible, sort_order) VALUES
('موقع مطعم — مثال', 'restaurants', 'موقع متكامل لمطعم: قائمة طعام، حجوزات، طلبات واتساب، ومعرض صور. — مثال، يُستبدل بمشروع حقيقي', 'https://images.pexels.com/photos/32523798/pexels-photo-32523798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 1),
('متجر إلكتروني — مثال', 'stores', 'متجر إلكتروني مع إدارة منتجات، سلة شراء، وربط الدفع والتوصيل. — مثال، يُستبدل بمشروع حقيقي', 'https://images.pexels.com/photos/7191162/pexels-photo-7191162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 2),
('موقع كافيه — مثال', 'cafes', 'موقع كافيه بتصميم دافئ: قائمة مشروبات، معرض، وموقع على الخريطة. — مثال، يُستبدل بمشروع حقيقي', 'https://images.pexels.com/photos/2079452/pexels-photo-2079452.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 3),
('موقع مطعم — مثال ٢', 'restaurants', 'تصميم عصري لمطعم فاخر مع حجوزات أونلاين وقائمة تفاعلية. — مثال، يُستبدل بمشروع حقيقي', 'https://images.pexels.com/photos/10135116/pexels-photo-10135116.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 4),
('متجر توصيل — مثال', 'stores', 'متجر لتوصيل الطعام مع تتبع الطلب وربط خدمات التوصيل. — مثال، يُستبدل بمشروع حقيقي', 'https://images.pexels.com/photos/16052344/pexels-photo-16052344.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 5),
('موقع كافيه — مثال ٢', 'cafes', 'صفحة هبوط لكافيه: عروض، قائمة، وروابط سوشيال ميديا. — مثال، يُستبدل بمشروع حقيقي', 'https://images.pexels.com/photos/34104248/pexels-photo-34104248.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, 6)
ON CONFLICT DO NOTHING;

-- Process steps
INSERT INTO public.process_steps (icon, title, description, sort_order) VALUES
('MessageSquare', 'اطلب الديمو', 'ابعت لنا بيانات نشاطك من النموذج أو عبر واتساب.', 1),
('PenTool', 'نصمم لك نموذج', 'نجهّز لك تصوراً مناسباً لنشاطك خلال 24-72 ساعة.', 2),
('Rocket', 'اعتمد وعدّل', 'راجع النموذج واطلب التعديلات التي تحتاجها قبل التنفيذ.', 3),
('Award', 'نطلق الموقع', 'نجهّز الموقع للنشر ونسلّمه لك حسب متطلبات مشروعك.', 4)
ON CONFLICT DO NOTHING;

-- Pricing plans
INSERT INTO public.pricing_plans (name, tagline, price, features, highlighted, visible, sort_order) VALUES
('أساسية', 'مناسبة للأنشطة الصغيرة', '', ARRAY['موقع من صفحة واحدة', 'تصميم متجاوب مع الموبايل', 'ربط واتساب واتصال مباشر', 'تحسين أساسي لمحركات البحث', 'دومين واستضافة لسنة'], false, true, 1),
('احترافية', 'الأكثر طلباً', '', ARRAY['موقع متعدد الصفحات', 'تصميم مخصص بالكامل لهويتك', 'معرض صور + آراء العملاء', 'تحسين متقدم لمحركات البحث (SEO)', 'ربط Google Maps', 'دومين واستضافة لسنة', 'دعم فني لمدة 3 أشهر'], true, true, 2),
('متجر إلكتروني', 'ابدأ تبيع أونلاين', '', ARRAY['متجر إلكتروني متكامل', 'إدارة منتجات وطلبات', 'ربط طرق الدفع الإلكتروني', 'ربط خدمات التوصيل', 'لوحة تحكم لإدارة المتجر', 'دومين واستضافة لسنة', 'دعم فني لمدة شهر'], false, true, 3)
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO public.faqs (question, answer, sort_order) VALUES
('كم مدة تجهيز الديمو المجاني؟', 'الديمو بيتجهز خلال 24 إلى 72 ساعة من وقت طلبك. بنبني لك تصميم كامل على أساس نشاطك عشان تشوف موقعك قبل ما تدفع أي حاجة.', 1),
('كم مدة التسليم النهائي للموقع؟', 'التسليم النهائي من 3 أيام إلى أسبوع حسب متطلبات المشروع. المتاجر الإلكترونية المعقدة ممكن تأخذ وقت أطول قليلاً بسبب ربط الدفع والتوصيل.', 2),
('هل في أي التزام قبل ما أشوف الديمو؟', 'لا، بدون أي التزام. الديمو مجاني بالكامل — تتطمن عليه، ولو عجبك نكمّل، ولو لأ، مفيش أي التزام عليك.', 3),
('من يملك الدومين والاستضافة؟', 'أنت بتملك الدومين والاستضافة باسمك بالكامل. إحنا بنحجزهم ليك ونربطهم بالموقع، وكل بيانات الدخول بتسليمها لك.', 4),
('ماذا يحدث بعد تسليم الموقع؟', 'بعد التسليم، بنوفّر دعم فني مستمر حسب الباقة. أي تحديث أو تعديل أو استفسار — إحنا معاك ومش بنسيبك لوحدك.', 5),
('هل أقدر أعدّل الموقع بنفسي؟', 'أيوة. بنسلّمك لوحة تحكم سهلة تقدر منها تعدّل المحتوى، تضيف منتجات، أو تغيّر الصور بدون الحاجة لخبرة تقنية. ولو حابب إحنا نتكفّل بالتعديلات، ده متاح برضه.', 6)
ON CONFLICT DO NOTHING;

-- Section visibility
INSERT INTO public.section_visibility (id, label, visible) VALUES
('hero', 'الهيرو', true),
('mockups', 'الموك أب', true),
('demo', 'الديمو المجاني', true),
('services', 'الخدمات', true),
('calculator', 'حاسبة العمولات', true),
('why-us', 'ليه تختارنا', true),
('portfolio', 'معرض الأعمال', true),
('process', 'إزاي بنشتغل', true),
('pricing', 'الباقات', true),
('faq', 'الأسئلة الشائعة', true),
('contact', 'تواصل معنا', true)
ON CONFLICT (id) DO NOTHING;
