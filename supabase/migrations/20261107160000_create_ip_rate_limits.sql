/*
# Create request_attempts table and rate limiting RPC for IP-based throttling

1. New Tables:
   - `request_attempts`:
     - `id` (uuid, primary key)
     - `ip_hash` (text, not null) — SHA-256 hash of client IP
     - `created_at` (timestamptz, not null default now())

2. Indexes:
   - Index on `(ip_hash, created_at DESC)` for fast windowed counting.
   - Index on `created_at` for fast cleanup of old attempts.

3. Functions:
   - `check_ip_rate_limit(p_ip_hash text, p_max_requests int, p_window_minutes int)`:
     - Atomic check and record attempt.
     - Automatically cleans up records older than 1 hour.
     - Returns boolean (true if allowed, false if limit exceeded).

4. Security:
   - Enable RLS on `request_attempts`.
   - Only service_role can access or modify table directly.
   - Function executable by service_role and postgres.
*/

CREATE TABLE IF NOT EXISTS public.request_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for sliding window checks
CREATE INDEX IF NOT EXISTS idx_request_attempts_ip_hash_created_at
  ON public.request_attempts (ip_hash, created_at DESC);

-- Index for cleanup of stale attempts
CREATE INDEX IF NOT EXISTS idx_request_attempts_created_at
  ON public.request_attempts (created_at);

-- Enable RLS
ALTER TABLE public.request_attempts ENABLE ROW LEVEL SECURITY;

-- Restrict all access to service_role (Edge Functions)
DROP POLICY IF EXISTS "Service role full access on request_attempts" ON public.request_attempts;
CREATE POLICY "Service role full access on request_attempts"
  ON public.request_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Atomic RPC function for IP rate limiting
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_ip_hash text,
  p_max_requests integer DEFAULT 6,
  p_window_minutes integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  IF p_ip_hash IS NULL OR p_ip_hash = '' THEN
    RETURN true;
  END IF;

  v_window_start := now() - (p_window_minutes || ' minutes')::interval;

  -- Cleanup records older than 1 hour to prevent table bloating
  DELETE FROM public.request_attempts
  WHERE created_at < now() - interval '1 hour';

  -- Count attempts in the sliding window
  SELECT count(*) INTO v_count
  FROM public.request_attempts
  WHERE ip_hash = p_ip_hash
    AND created_at >= v_window_start;

  -- Limit exceeded
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;

  -- Record current attempt
  INSERT INTO public.request_attempts (ip_hash, created_at)
  VALUES (p_ip_hash, now());

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_ip_rate_limit(text, integer, integer) TO service_role;
