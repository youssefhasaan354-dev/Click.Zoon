/*
# Rollback: Supabase Security Advisor Hardening Pass (2026-11-08)

Reverts all changes made by 20261108180000_security_advisor_hardening.sql to their exact prior state:
1. Re-creates open INSERT policies on demo_requests for anon and authenticated.
2. Re-grants EXECUTE on check_ip_rate_limit, handle_new_user, and check_demo_requests_rate_limit.
3. Re-creates public SELECT policy on storage.objects for portfolio-images bucket.
*/

-- ============================================================================
-- Step 1: Revert demo_requests Policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can submit demo requests" ON public.demo_requests;
CREATE POLICY "Public can submit demo requests"
  ON public.demo_requests FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can submit demo requests" ON public.demo_requests;
CREATE POLICY "Authenticated can submit demo requests"
  ON public.demo_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================================
-- Step 2: Revert Function Execution Privileges
-- ============================================================================

-- Re-grant execute on check_ip_rate_limit to anon, authenticated, and public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_ip_rate_limit'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.check_ip_rate_limit(text, integer, integer) TO authenticated, anon;
  END IF;
END $$;

-- Re-grant execute on handle_new_user trigger function
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon;
  END IF;
END $$;

-- Re-grant execute on check_demo_requests_rate_limit
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_demo_requests_rate_limit'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.check_demo_requests_rate_limit() TO anon, authenticated;
  END IF;
END $$;


-- ============================================================================
-- Step 3: Revert storage.objects Policies for portfolio-images
-- ============================================================================

-- Drop admin read policy
DROP POLICY IF EXISTS "Portfolio images admin read" ON storage.objects;

-- Restore public read/list policy
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;
CREATE POLICY "Portfolio images public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-images');

-- Restore original admin write policies
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

