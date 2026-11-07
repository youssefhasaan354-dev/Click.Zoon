/*
  # Security Hardening: Strict RLS on portfolio_items and demo_requests

  1. portfolio_items
    - Public (anon + authenticated) can only READ visible items (visible = true)
    - Admins can read all items (including hidden/drafts) and insert, update, delete

  2. demo_requests
    - Drop direct public and authenticated INSERT policies: submissions must go through the
      Edge Function 'submit-demo-request' (service_role) for rate limiting, bot protection, and phone validation.
    - Logged-in customers can read only their own requests (auth.uid() = user_id)
    - Admins can read, update status, and delete requests
*/

-- 1. Tighten portfolio_items RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolio public read" ON public.portfolio_items;
CREATE POLICY "Portfolio public read"
ON public.portfolio_items FOR SELECT
TO anon, authenticated
USING (visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Portfolio admin all" ON public.portfolio_items;
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


-- 2. Tighten demo_requests RLS (direct REST insert blocked, service_role Edge Function only)
DROP POLICY IF EXISTS "Public can submit demo requests" ON public.demo_requests;
DROP POLICY IF EXISTS "Authenticated can submit demo requests" ON public.demo_requests;

-- Customers read own requests
DROP POLICY IF EXISTS "Customers can read own requests" ON public.demo_requests;
CREATE POLICY "Customers can read own requests"
ON public.demo_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Admins full management
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

DROP POLICY IF EXISTS "Admins can update requests" ON public.demo_requests;
CREATE POLICY "Admins can update requests"
ON public.demo_requests FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
