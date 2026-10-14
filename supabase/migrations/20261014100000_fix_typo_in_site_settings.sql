-- Fix typo in site_settings footer_text and about_text
UPDATE public.site_settings
SET footer_text = replace(footer_text, 'الأنشاط', 'الأنشطة')
WHERE footer_text LIKE '%الأنشاط%';

UPDATE public.site_settings
SET about_text = replace(about_text, 'الأنشاط', 'الأنشطة')
WHERE about_text LIKE '%الأنشاط%';
