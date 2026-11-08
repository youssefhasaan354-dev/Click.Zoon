/*
# Supabase Security Advisor Hardening Pass (2026-11-08)

Resolves warnings reported by Supabase Security Advisor without breaking application functionality:

1. demo_requests table:
   - Removes open INSERT policies ("Public can submit demo requests" and "Authenticated can submit demo requests").
   - All forms (Contact, QuoteWizard, OrderModal, ExitIntentModal) submit exclusively via the Supabase Edge Function
     `submit-demo-request` which uses `service_role` (bypassing RLS).
   - Closes direct anonymous spam vectors while preserving full customer and admin read/update flows.

2. Function Execution Permissions (RPC Security):
   - `check_ip_rate_limit`: Revokes EXECUTE from PUBLIC, anon, and authenticated. Grants exclusively to `service_role`.
   - `check_demo_requests_rate_limit`: Revokes EXECUTE from PUBLIC, anon, and authenticated (Trigger function).
   - `handle_new_user`: Revokes EXECUTE from PUBLIC, anon, and authenticated (Trigger function on auth.users).
   - Triggers execute under database system/owner authority and do not require public EXECUTE privileges.

3. Storage Bucket 'portfolio-images':
   - Replaces wide public SELECT policy on `storage.objects` with an admin-only SELECT policy.
   - Public visitors load images directly via the public CDN URL (`/storage/v1/object/public/portfolio-images/...`),
     which is served by the Storage CDN (`bucket.public = true`) without querying `storage.objects`.
   - Restricts file listing and administrative operations on `storage.objects` to authenticated admins (`is_admin()`).

4. Note on `is_admin()`:
   - Kept granted to authenticated and anon because all administrative RLS policies evaluate `public.is_admin()`,
     and `admin-context.tsx` checks admin status on login via `supabase.rpc('is_admin')`.
*/

-- ============================================================================
-- Step 1: Secure demo_requests RLS Policies
-- ============================================================================

-- Drop wide-open INSERT policies (WITH CHECK (true))
DROP POLICY IF EXISTS "Public can submit demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Authenticated can submit demo requests" ON public.demo_requests;

-- Note: If direct client insertion without Edge Function is ever required in the future,
-- use a strictly constrained policy such as:
-- CREATE POLICY "Public can submit validated demo requests"
--   ON public.demo_requests FOR INSERT
--   TO anon, authenticated
--   WITH CHECK (
--     length(trim(name)) BETWEEN 2 AND 160
--     AND length(trim(phone)) BETWEEN 10 AND 20
--     AND (business_type IS NULL OR length(business_type) <= 160)
--     AND (page_url IS NULL OR length(page_url) <= 500)
--     AND (source IN ('form', 'wizard', 'exit_intent', 'showcase'))
--     AND (status = 'new' OR status IS NULL)
--     AND (user_id IS NULL OR user_id = auth.uid())
--   );


-- ============================================================================
-- Step 2: Restrict check_ip_rate_limit to service_role (Edge Functions only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_ip_rate_limit'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.check_ip_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.check_ip_rate_limit(text, integer, integer) TO service_role;
  END IF;
END $$;


-- ============================================================================
-- Step 3: Revoke Public RPC Execution on Trigger Functions
-- ============================================================================

-- handle_new_user() runs on auth.users AFTER INSERT trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- check_demo_requests_rate_limit() runs on demo_requests BEFORE INSERT trigger
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_demo_requests_rate_limit'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.check_demo_requests_rate_limit() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;


-- ============================================================================
-- Step 4: Harden Storage Bucket 'portfolio-images' RLS Policies
-- ============================================================================

-- Drop wide public listing policy on storage.objects
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;

-- Allow only authenticated admins to list storage objects in this bucket
DROP POLICY IF EXISTS "Portfolio images admin read" ON storage.objects;
CREATE POLICY "Portfolio images admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND public.is_admin()
  );

-- Update admin upload/update/delete policies to use public.is_admin() consistently
DROP POLICY IF EXISTS "Portfolio images admin insert" ON storage.objects;
CREATE POLICY "Portfolio images admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Portfolio images admin update" ON storage.objects;
CREATE POLICY "Portfolio images admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Portfolio images admin delete" ON storage.objects;
CREATE POLICY "Portfolio images admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND public.is_admin()
  );

