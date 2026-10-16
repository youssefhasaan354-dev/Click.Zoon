/*
# Support OAuth (Google) User Profiles in handle_new_user Trigger

1. Changes:
- Ensure public.profiles.phone column is nullable and allows empty or NULL values for OAuth users.
- Update public.handle_new_user() trigger function:
  - Takes full_name from raw_user_meta_data->>'full_name' or raw_user_meta_data->>'name'.
  - Defaults full_name to 'مستخدم' if metadata is missing or empty.
  - Takes phone from raw_user_meta_data->>'phone', converting empty strings to NULL.
  - Explicitly sets role to 'customer' (preventing admin escalation).
  - Uses ON CONFLICT (id) DO NOTHING to safely handle duplicate triggers.
  - Defined as SECURITY DEFINER with safe search_path = public, auth.
  - Revokes EXECUTE from anon and authenticated to prevent direct execution.
*/

-- 1. Ensure phone column in profiles is nullable and permits NULL or empty values
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_check
  CHECK (phone IS NULL OR char_length(btrim(phone)) = 0 OR char_length(btrim(phone)) BETWEEN 5 AND 40);

-- 2. Update trigger function to support OAuth (Google) users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  extracted_name text;
  extracted_phone text;
BEGIN
  -- Extract full_name from raw_user_meta_data ('full_name' or 'name') with fallback
  extracted_name := COALESCE(
    NULLIF(btrim(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(btrim(NEW.raw_user_meta_data->>'name'), ''),
    'مستخدم'
  );

  -- Extract phone if available, or NULL
  extracted_phone := NULLIF(btrim(NEW.raw_user_meta_data->>'phone'), '');

  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    extracted_name,
    extracted_phone,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Ensure trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Restrict execution permissions on the trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
