/*
# Fix infinite recursion in RLS policies

## Problem
All admin RLS policies across every table used:
  EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
The `admins` table's own SELECT policy used the same pattern — querying `admins`
from within `admins`'s RLS → infinite recursion → 500 Internal Server Error
on admins, portfolio_items, pricing_plans, and every admin-gated table.

## Fix
1. Create `is_admin()` — a SECURITY DEFINER function with search_path = public.
   It runs as the function owner (postgres), bypassing RLS on `admins`,
   so querying `admins` inside it does NOT recurse.
2. Rewrite every admin policy on every table to call `public.is_admin()`
   instead of the inline `EXISTS (SELECT 1 FROM admins ...)` subquery.
3. `admins` table: SELECT policy uses `is_admin()` (an admin can verify they
   are an admin). No INSERT/UPDATE/DELETE policies — admins table is
   managed exclusively via SQL / edge functions, never from the client.
4. Public read policies for content tables remain unchanged (anon+authenticated).
5. demo_requests: public INSERT remains; admin SELECT/DELETE uses `is_admin()`.

## Tables affected
- admins (policy rewritten, no writes from client)
- site_settings (admin UPDATE → is_admin)
- hero_content (admin UPDATE → is_admin)
- features (admin INSERT/UPDATE/DELETE → is_admin)
- services (admin INSERT/UPDATE/DELETE → is_admin)
- portfolio_items (admin SELECT/INSERT/UPDATE/DELETE → is_admin)
- process_steps (admin INSERT/UPDATE/DELETE → is_admin)
- pricing_plans (admin SELECT/INSERT/UPDATE/DELETE → is_admin)
- faqs (admin INSERT/UPDATE/DELETE → is_admin)
- section_visibility (admin UPDATE → is_admin)
- demo_requests (admin SELECT/DELETE → is_admin)

## Important notes
1. The `is_admin()` function is SECURITY DEFINER with search_path = public,
   preventing search_path injection and RLS recursion.
2. No data is modified or deleted — only policies are replaced.
3. The admin email youssefhasaan354@gmail.com is confirmed present in `admins`.
*/

-- ===== Step 1: Create is_admin() SECURITY DEFINER function =====

DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins a
    WHERE a.email = (auth.jwt() ->> 'email')
  );
$$;

-- Grant execute to authenticated and anon (anon will always get false)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ===== Step 2: Rewrite admins table policies =====
-- Only an admin can read the admins table (to verify their own admin status).
-- No INSERT/UPDATE/DELETE from the client — managed via SQL / edge functions only.

DROP POLICY IF EXISTS "Admins table read for admin only" ON public.admins;

CREATE POLICY "Admins table read for admin only"
ON public.admins FOR SELECT
TO authenticated
USING (public.is_admin());

-- ===== Step 3: site_settings =====

DROP POLICY IF EXISTS "Site settings admin write" ON public.site_settings;
CREATE POLICY "Site settings admin write"
ON public.site_settings FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== Step 4: hero_content =====

DROP POLICY IF EXISTS "Hero content admin write" ON public.hero_content;
CREATE POLICY "Hero content admin write"
ON public.hero_content FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== Step 5: features =====

DROP POLICY IF EXISTS "Features admin insert" ON public.features;
CREATE POLICY "Features admin insert"
ON public.features FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Features admin update" ON public.features;
CREATE POLICY "Features admin update"
ON public.features FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Features admin delete" ON public.features;
CREATE POLICY "Features admin delete"
ON public.features FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 6: services =====

DROP POLICY IF EXISTS "Services admin insert" ON public.services;
CREATE POLICY "Services admin insert"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Services admin update" ON public.services;
CREATE POLICY "Services admin update"
ON public.services FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Services admin delete" ON public.services;
CREATE POLICY "Services admin delete"
ON public.services FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 7: portfolio_items =====

DROP POLICY IF EXISTS "Portfolio admin read all" ON public.portfolio_items;
CREATE POLICY "Portfolio admin read all"
ON public.portfolio_items FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Portfolio admin insert" ON public.portfolio_items;
CREATE POLICY "Portfolio admin insert"
ON public.portfolio_items FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Portfolio admin update" ON public.portfolio_items;
CREATE POLICY "Portfolio admin update"
ON public.portfolio_items FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Portfolio admin delete" ON public.portfolio_items;
CREATE POLICY "Portfolio admin delete"
ON public.portfolio_items FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 8: process_steps =====

DROP POLICY IF EXISTS "Process steps admin insert" ON public.process_steps;
CREATE POLICY "Process steps admin insert"
ON public.process_steps FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Process steps admin update" ON public.process_steps;
CREATE POLICY "Process steps admin update"
ON public.process_steps FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Process steps admin delete" ON public.process_steps;
CREATE POLICY "Process steps admin delete"
ON public.process_steps FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 9: pricing_plans =====

DROP POLICY IF EXISTS "Pricing plans admin read all" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin read all"
ON public.pricing_plans FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Pricing plans admin insert" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin insert"
ON public.pricing_plans FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Pricing plans admin update" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin update"
ON public.pricing_plans FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Pricing plans admin delete" ON public.pricing_plans;
CREATE POLICY "Pricing plans admin delete"
ON public.pricing_plans FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 10: faqs =====

DROP POLICY IF EXISTS "FAQs admin insert" ON public.faqs;
CREATE POLICY "FAQs admin insert"
ON public.faqs FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "FAQs admin update" ON public.faqs;
CREATE POLICY "FAQs admin update"
ON public.faqs FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "FAQs admin delete" ON public.faqs;
CREATE POLICY "FAQs admin delete"
ON public.faqs FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 11: section_visibility =====

DROP POLICY IF EXISTS "Section visibility admin write" ON public.section_visibility;
CREATE POLICY "Section visibility admin write"
ON public.section_visibility FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== Step 12: demo_requests =====

DROP POLICY IF EXISTS "Admin can read demo requests" ON public.demo_requests;
CREATE POLICY "Admin can read demo requests"
ON public.demo_requests FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete demo requests" ON public.demo_requests;
CREATE POLICY "Admin can delete demo requests"
ON public.demo_requests FOR DELETE
TO authenticated
USING (public.is_admin());

-- ===== Step 13: Ensure admin email exists =====
INSERT INTO public.admins (email) VALUES ('youssefhasaan354@gmail.com')
ON CONFLICT (email) DO NOTHING;
