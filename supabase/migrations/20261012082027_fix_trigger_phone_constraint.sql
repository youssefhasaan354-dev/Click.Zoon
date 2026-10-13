/*
# Fix handle_new_user trigger — phone constraint failure

## Problem
The handle_new_user() trigger used COALESCE(NEW.raw_user_meta_data->>'phone', '')
which produces '' (empty string) when phone metadata is missing.
The profiles.phone column has CHECK (char_length(btrim(phone)) BETWEEN 5 AND 40),
so an empty string violates the constraint, causing the trigger to throw,
which rolls back the entire user creation transaction — signup fails silently.

## Fix
1. Relax the phone constraint to allow empty strings (0–40 chars) so that
   even if metadata is missing, the trigger can still insert a row.
   The frontend signup form validates phone before sending, so valid
   signups will always have a proper phone. The constraint relaxation
   is a safety net for edge cases (e.g. admin-created users).
2. Update the trigger to use NULL instead of '' when phone is missing,
   and make the phone column nullable to accommodate this.
*/

-- Make phone nullable and relax constraint
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_check
  CHECK (phone IS NULL OR char_length(btrim(phone)) BETWEEN 5 AND 40);

-- Update trigger to use NULL when phone is missing
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
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'مستخدم'),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;
