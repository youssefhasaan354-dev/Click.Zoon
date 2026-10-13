/*
# Create storage bucket for portfolio images

1. Storage
- Creates a public bucket 'portfolio-images' for admin-uploaded project images.
- Public read access so site visitors can see the images.
- Insert/Update/Delete restricted to admin users only.

2. Security
- Public SELECT on storage.objects for the portfolio-images bucket.
- Admin-only INSERT, UPDATE, DELETE using the admins table email check.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;
CREATE POLICY "Portfolio images public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'portfolio-images');

DROP POLICY IF EXISTS "Portfolio images admin insert" ON storage.objects;
CREATE POLICY "Portfolio images admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Portfolio images admin update" ON storage.objects;
CREATE POLICY "Portfolio images admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email'))
)
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email'))
);

DROP POLICY IF EXISTS "Portfolio images admin delete" ON storage.objects;
CREATE POLICY "Portfolio images admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND EXISTS (SELECT 1 FROM public.admins a WHERE a.email = (auth.jwt() ->> 'email'))
);
