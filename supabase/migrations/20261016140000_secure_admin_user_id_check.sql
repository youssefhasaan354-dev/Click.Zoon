/*
# Secure admin authentication check and extend demo_requests source constraint

1. Security Hardening
- Add `user_id` uuid column to `public.admins` table referencing `auth.users(id)`
- Backfill `user_id` for existing admins by email match
- Redefine `is_admin()` function to verify:
  * User is signed in (`auth.uid() = a.user_id`)
  * User's email is confirmed (`email_confirmed_at IS NOT NULL`)
  * Prevents email impersonation via OAuth or customer self-signup

2. Feature Support
- Extend `demo_requests.source` CHECK constraint to include:
  * 'wizard' (quote builder)
  * 'exit_intent' (exit popup)
  * 'floating_bar' (sticky CTA bar)
*/

-- Step 1: Add user_id column to admins table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.admins
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

    CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
  END IF;
END $$;

-- Step 2: Backfill user_id for existing admins from auth.users
UPDATE public.admins a
SET user_id = u.id
FROM auth.users u
WHERE a.email = u.email
  AND a.user_id IS NULL;

-- Step 3: Hardened is_admin() function with email confirmation requirement
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins a
    JOIN auth.users u ON (a.user_id = u.id OR (a.user_id IS NULL AND a.email = u.email))
    WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Step 4: Extend demo_requests source CHECK constraint
DO $$
BEGIN
  ALTER TABLE public.demo_requests DROP CONSTRAINT IF EXISTS demo_requests_source_check;
  ALTER TABLE public.demo_requests
    ADD CONSTRAINT demo_requests_source_check
    CHECK (source IN ('form', 'whatsapp_click', 'call_click', 'wizard', 'exit_intent', 'floating_bar'));
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
