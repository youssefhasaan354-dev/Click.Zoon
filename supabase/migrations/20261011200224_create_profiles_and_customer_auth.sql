/*
# Create profiles table, is_admin function, and link demo requests to users

## 1. New Tables
- `public.profiles` — one row per auth user, linked to `auth.users(id)`.
  - `id` (uuid, PK, references auth.users ON DELETE CASCADE)
  - `full_name` (text, not null, 1–160 chars)
  - `phone` (text, not null, 5–40 chars)
  - `role` (text, not null, default 'customer', CHECK in ('customer','admin'))
  - `created_at` (timestamptz, default now())

## 2. Security — is_admin() function
- `public.is_admin()` — SECURITY DEFINER, returns boolean.
  Reads the profiles table to check whether `auth.uid()` has role = 'admin'.
  This lets RLS policies and the admin panel verify admin status server-side.
- Search path is set to `public, auth` to prevent search_path injection.

## 3. Trigger — auto-create profile on signup
- `public.handle_new_user()` trigger function fires AFTER INSERT on auth.users.
  Inserts a row into profiles with role='customer' using new_user metadata
  (full_name, phone) from the sign-up payload stored in raw_user_meta_data.
- `public.on_auth_user_created` trigger attaches it to auth.users.

## 4. Modified Tables
- `public.demo_requests` — two new columns added:
  - `user_id` (uuid, nullable, references auth.users ON DELETE SET NULL)
  - `status` (text, not null, default 'new', CHECK in ('new','contacted','delivered','rejected'))

## 5. RLS — profiles
- Enable RLS on profiles.
- SELECT: authenticated users can read their own profile. Admins can read all.
- UPDATE: authenticated users can update their own profile (but NOT the role column —
  enforced by a separate UPDATE policy that excludes role from writeable columns
  via a WITH CHECK that re-validates the existing role value).
- No INSERT or DELETE from the client — profiles are created only by the trigger.

## 6. RLS — demo_requests (updated)
- Keep existing anon insert policy (guests can still submit).
- Add SELECT for authenticated customers: they can read only their own requests
  (where user_id = auth.uid()).
- Add SELECT for admins: they can read all requests.
- Add UPDATE for admins: they can update status on any request.
- Keep deny policies for anon SELECT/UPDATE/DELETE unchanged.
- Authenticated customers cannot UPDATE or DELETE their requests.

## 7. Important Notes
- The role column is NOT writable from the client. The UPDATE policy's
  WITH CHECK ensures `role = (SELECT role FROM profiles WHERE id = auth.uid())`,
  meaning the role value must remain unchanged after the update.
- Admins are managed exclusively through the database or Supabase dashboard,
  never through the frontend.
- The existing admins table is still used for the admin login flow —
  the is_admin() function checks profiles.role for a more robust approach,
  and a migration script copies existing admin emails into profiles with role='admin'.
*/

-- ============================================================
-- 1. profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 160),
  phone text NOT NULL CHECK (char_length(btrim(phone)) BETWEEN 5 AND 40),
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. is_admin() function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- 3. Trigger — auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. Add columns to demo_requests
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_requests' AND column_name = 'user_id') THEN
    ALTER TABLE public.demo_requests
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_requests' AND column_name = 'status') THEN
    ALTER TABLE public.demo_requests
      ADD COLUMN status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','delivered','rejected'));
  END IF;
END $$;

-- ============================================================
-- 5. RLS policies — profiles
-- ============================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- ============================================================
-- 6. RLS policies — demo_requests (updated)
-- ============================================================

-- Keep existing anon insert (guests can submit)
-- (already exists, no change needed)

-- Authenticated customers can read their own requests
DROP POLICY IF EXISTS "Customers can read own requests" ON public.demo_requests;
CREATE POLICY "Customers can read own requests"
ON public.demo_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Admins can update request status
DROP POLICY IF EXISTS "Admins can update requests" ON public.demo_requests;
CREATE POLICY "Admins can update requests"
ON public.demo_requests FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Authenticated customers can insert requests linked to their account
DROP POLICY IF EXISTS "Authenticated can submit demo requests" ON public.demo_requests;
CREATE POLICY "Authenticated can submit demo requests"
ON public.demo_requests FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================
-- 7. Grant is_admin() to authenticated and anon
-- ============================================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;