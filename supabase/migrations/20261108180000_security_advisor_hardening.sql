/*
# Supabase Security Advisor Hardening Pass (2026-11-08)

Resolves warnings reported by Supabase Security Advisor based on verified live DB state:

1. demo_requests table:
   - Removes open INSERT policies ("Public can submit demo requests" and "Authenticated can submit demo requests").
   - All forms (Contact, QuoteWizard, OrderModal, ExitIntentModal) submit exclusively via the Supabase Edge Function
     `submit-demo-request` which uses `service_role` (bypassing RLS).
   - Closes direct anonymous spam vectors while preserving full customer and admin read/update flows.

2. Function Execution Permissions (RPC Security):
   - `check_ip_rate_limit(text, integer, integer)`: Revokes EXECUTE from PUBLIC, anon, and authenticated.
     Grants exclusively to `service_role` (and existing postgres).
   - `handle_new_user()`: Revokes EXECUTE from PUBLIC, anon, and authenticated (Trigger function on auth.users).
   - Note: `check_demo_requests_rate_limit()` is already restricted to {postgres, service_role} on the live DB and requires no change.

3. Storage Bucket 'portfolio-images':
   - Drops wide public SELECT policy "Portfolio images public read" on `storage.objects`.
   - Creates admin-only SELECT policy "Portfolio images admin read" on `storage.objects` for authenticated admins (`is_admin()`).
   - Public visitors continue loading images via public CDN URLs (`/storage/v1/object/public/portfolio-images/...`) without querying `storage.objects`.
   - Leaves existing admin insert/update/delete policies intact.

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


-- ============================================================================
-- Step 4: Harden Storage Bucket 'portfolio-images' RLS Policies
-- ============================================================================

-- Drop wide public listing policy on storage.objects
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;

-- Allow only authenticated admins to list/query storage objects in this bucket
DROP POLICY IF EXISTS "Portfolio images admin read" ON storage.objects;
CREATE POLICY "Portfolio images admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND public.is_admin()
  );
