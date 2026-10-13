-- Add INSERT and DELETE policies to single-row and section_visibility tables
-- so the admin backup/restore feature can clear and re-insert rows.

-- ===== site_settings: INSERT + DELETE =====
DROP POLICY IF EXISTS "Site settings admin insert" ON public.site_settings;
CREATE POLICY "Site settings admin insert"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Site settings admin delete" ON public.site_settings;
CREATE POLICY "Site settings admin delete"
ON public.site_settings FOR DELETE
TO authenticated
USING (is_admin());

-- ===== hero_content: INSERT + DELETE =====
DROP POLICY IF EXISTS "Hero content admin insert" ON public.hero_content;
CREATE POLICY "Hero content admin insert"
ON public.hero_content FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Hero content admin delete" ON public.hero_content;
CREATE POLICY "Hero content admin delete"
ON public.hero_content FOR DELETE
TO authenticated
USING (is_admin());

-- ===== section_visibility: INSERT + DELETE =====
DROP POLICY IF EXISTS "Section visibility admin insert" ON public.section_visibility;
CREATE POLICY "Section visibility admin insert"
ON public.section_visibility FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Section visibility admin delete" ON public.section_visibility;
CREATE POLICY "Section visibility admin delete"
ON public.section_visibility FOR DELETE
TO authenticated
USING (is_admin());
