/*
# Create testimonials table and section_visibility entry

1. New Tables:
- `public.testimonials`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `name` (text, not null)
  - `business` (text, not null default '')
  - `text` (text, not null)
  - `rating` (int, default 5, check 1..5)
  - `visible` (boolean, default true)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz, default now())

2. Security:
- Enable RLS on public.testimonials.
- Public read policy: SELECT only where visible = true for anon and authenticated.
- Admin policies: SELECT all, INSERT, UPDATE, DELETE using public.is_admin().

3. Section Visibility:
- Add 'testimonials' (label 'آراء العملاء', visible true) to public.section_visibility with ON CONFLICT DO NOTHING.
- No fake seed rows.
*/

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business text NOT NULL DEFAULT '',
  text text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read visible testimonials
DROP POLICY IF EXISTS "Testimonials public read visible" ON public.testimonials;
CREATE POLICY "Testimonials public read visible"
ON public.testimonials FOR SELECT
TO anon, authenticated
USING (visible = true);

-- Admin can read all testimonials (including hidden)
DROP POLICY IF EXISTS "Testimonials admin select all" ON public.testimonials;
CREATE POLICY "Testimonials admin select all"
ON public.testimonials FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin insert
DROP POLICY IF EXISTS "Testimonials admin insert" ON public.testimonials;
CREATE POLICY "Testimonials admin insert"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin update
DROP POLICY IF EXISTS "Testimonials admin update" ON public.testimonials;
CREATE POLICY "Testimonials admin update"
ON public.testimonials FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin delete
DROP POLICY IF EXISTS "Testimonials admin delete" ON public.testimonials;
CREATE POLICY "Testimonials admin delete"
ON public.testimonials FOR DELETE
TO authenticated
USING (public.is_admin());

-- Add section visibility entry
INSERT INTO public.section_visibility (id, label, visible)
VALUES ('testimonials', 'آراء العملاء', true)
ON CONFLICT (id) DO NOTHING;
