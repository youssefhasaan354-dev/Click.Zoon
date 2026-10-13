/*
# Add About Us section, map embed, and Google Analytics fields

1. New Columns on site_settings
- about_title (text) — heading for the "About Us" section
- about_text (text) — body paragraph for the "About Us" section
- about_image_url (text) — optional image URL for the "About Us" section
- about_stats (jsonb, default '[]') — optional array of {value, suffix, label} counters
- map_embed_url (text) — Google Maps embed iframe src; if empty the map is hidden
- google_analytics_id (text) — GA Measurement ID (e.g. G-XXXXXXX); if empty tracking is disabled

2. New Columns on demo_requests
- (no new columns — phone validation is client-side only)

3. New section_visibility rows
- 'about' row so the admin can show/hide the About Us section

4. Security
- No new tables. Existing RLS on site_settings and section_visibility remains unchanged.
- New columns inherit the same RLS policies as their parent table.
*/

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS about_title text DEFAULT 'من نحن',
  ADD COLUMN IF NOT EXISTS about_text text DEFAULT 'كليك زون وكالة متخصصة في تصميم وتطوير المواقع والمتاجر الإلكترونية في المنصورة، الدقهلية. نساعد الأنشاط التجارية على بناء حضور رقمي قوي يوصلها لعملائها أونلاين.',
  ADD COLUMN IF NOT EXISTS about_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_stats jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS map_embed_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_analytics_id text DEFAULT '';

INSERT INTO section_visibility (id, label, visible)
VALUES ('about', 'من نحن', true)
ON CONFLICT (id) DO NOTHING;
