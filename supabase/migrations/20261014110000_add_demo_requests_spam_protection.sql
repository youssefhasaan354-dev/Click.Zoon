/*
# Add Rate Limiting / Spam Protection Trigger to demo_requests

1. Purpose:
- Prevents spamming and abuse on public.demo_requests.
- Limits submissions from the same normalized phone (digits only) to max 3 requests per 60 minutes.
- Limits submissions with the same phone + page_url combination to max 10 requests per 24 hours.
- Bypasses check if caller is an admin (public.is_admin() = true) to prevent breaking backup restore and admin flows.
- Raises an exception with code 'rate_limit' which is caught and displayed gracefully in the frontend.
*/

CREATE OR REPLACE FUNCTION public.check_demo_requests_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  norm_phone text;
  phone_count_60m integer;
  combo_count_24h integer;
BEGIN
  -- Admin bypass (e.g. restoring backups, admin workflows)
  BEGIN
    IF public.is_admin() THEN
      RETURN NEW;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- In case is_admin() cannot be evaluated, continue with rate limit check
  END;

  -- Normalize phone to digits only
  norm_phone := regexp_replace(COALESCE(NEW.phone, ''), '\D', '', 'g');

  -- Only rate limit if phone has at least 5 digits (avoids dummy / empty phone collisions)
  IF length(norm_phone) >= 5 THEN
    -- Check 1: Max 3 rows with the same normalized phone in the last 60 minutes
    SELECT count(*) INTO phone_count_60m
    FROM public.demo_requests
    WHERE regexp_replace(phone, '\D', '', 'g') = norm_phone
      AND created_at >= (now() - interval '60 minutes');

    IF phone_count_60m >= 3 THEN
      RAISE EXCEPTION 'rate_limit: لقد تجاوزت الحد المسموح من الطلبات لهذا الرقم خلال الساعة الماضية (الحد 3 طلبات). يرجى المحاولة لاحقاً.'
        USING ERRCODE = 'P0001';
    END IF;

    -- Check 2: Max 10 rows with the same phone + page_url combination in the last 24 hours
    SELECT count(*) INTO combo_count_24h
    FROM public.demo_requests
    WHERE regexp_replace(phone, '\D', '', 'g') = norm_phone
      AND (
        (page_url IS NULL AND NEW.page_url IS NULL)
        OR (page_url = NEW.page_url)
      )
      AND created_at >= (now() - interval '24 hours');

    IF combo_count_24h >= 10 THEN
      RAISE EXCEPTION 'rate_limit: لقد تجاوزت الحد المسموح من الطلبات لهذا الرقم والرابط خلال 24 ساعة (الحد 10 طلبات).'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_demo_requests_rate_limit() TO anon, authenticated;

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at
  ON public.demo_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_requests_phone_clean
  ON public.demo_requests ((regexp_replace(phone, '\D', '', 'g')), created_at DESC);

-- Attach trigger
DROP TRIGGER IF EXISTS trg_check_demo_requests_rate_limit ON public.demo_requests;
CREATE TRIGGER trg_check_demo_requests_rate_limit
  BEFORE INSERT ON public.demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.check_demo_requests_rate_limit();
