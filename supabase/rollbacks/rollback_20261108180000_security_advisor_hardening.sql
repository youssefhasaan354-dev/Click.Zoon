/*
# Rollback: Supabase Security Advisor Hardening Pass (2026-11-08)

================================================================================
VERIFIED ORIGINAL LIVE DB STATE (from pg_policies and proacl):
- demo_requests:
    Policy "Public can submit demo requests" FOR INSERT TO anon, authenticated WITH CHECK (true);
    Policy "Authenticated can submit demo requests" FOR INSERT TO authenticated WITH CHECK (true);
- check_ip_rate_limit(text, integer, integer):
    proacl: {postgres=X/postgres, service_role=X/postgres, =X/postgres, anon=X/postgres, authenticated=X/postgres}
    (Had execute permissions for PUBLIC, anon, authenticated, service_role, postgres).
- handle_new_user():
    proacl: {postgres=X/postgres, service_role=X/postgres, =X/postgres}
    (Had execute permissions for PUBLIC, service_role, postgres; no explicit grants to anon/authenticated).
- check_demo_requests_rate_limit():
    proacl: {postgres=X/postgres, service_role=X/postgres}
    (Already restricted on live DB; untouched by migration and untouched by rollback).
- storage.objects (bucket 'portfolio-images'):
    Policy "Portfolio images public read" FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio-images');
    Admin insert/update/delete policies remained untouched.
================================================================================
*/

-- ============================================================================
-- Step 1: Revert demo_requests Policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can submit demo requests" ON public.demo_requests;
CREATE POLICY "Public can submit demo requests"
  ON public.demo_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can submit demo requests" ON public.demo_requests;
CREATE POLICY "Authenticated can submit demo requests"
  ON public.demo_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================================
-- Step 2: Revert Function Execution Privileges
-- ============================================================================

-- Re-grant execute on check_ip_rate_limit to PUBLIC, anon, authenticated
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_ip_rate_limit'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.check_ip_rate_limit(text, integer, integer) TO PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Re-grant execute on handle_new_user trigger function to PUBLIC
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC;
  END IF;
END $$;


-- ============================================================================
-- Step 3: Revert storage.objects Policies for portfolio-images
-- ============================================================================

-- Drop admin read policy
DROP POLICY IF EXISTS "Portfolio images admin read" ON storage.objects;

-- Restore original public read/list policy (admin write policies were untouched)
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;
CREATE POLICY "Portfolio images public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'portfolio-images');

