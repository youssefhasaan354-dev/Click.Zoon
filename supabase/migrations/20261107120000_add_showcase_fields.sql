/*
  # Showcase (Google-Play-style) fields for portfolio_items

  1. New columns on `portfolio_items`
    - `slug` (text, unique) — URL slug for /showcase/:slug
    - `live_url` (text) — live link of the website/app (the admin panel already sends this column)
    - `kind` (text) — 'website' | 'app' | 'store'
    - `tagline` (text) — one-line subtitle shown under the title
    - `long_description` (text) — full description on the detail page
    - `features` (text[]) — bullet list of features
    - `screenshots` (text[]) — screenshot URLs for the horizontal gallery
    - `icon_url` (text) — square app icon (falls back to image_url)

  2. demo_requests.source
    - Adds 'showcase' (the "اطلب الآن" button on the showcase detail page)
*/

ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS live_url text;
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'website';
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS long_description text NOT NULL DEFAULT '';
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS screenshots text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS icon_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_items_kind_check'
  ) THEN
    ALTER TABLE public.portfolio_items
      ADD CONSTRAINT portfolio_items_kind_check CHECK (kind IN ('website', 'app', 'store'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS portfolio_items_slug_key
  ON public.portfolio_items (slug) WHERE slug IS NOT NULL;

-- Allow the new lead source
ALTER TABLE public.demo_requests DROP CONSTRAINT IF EXISTS demo_requests_source_check;
ALTER TABLE public.demo_requests
  ADD CONSTRAINT demo_requests_source_check
  CHECK (source IN ('form', 'whatsapp_click', 'call_click', 'wizard', 'exit_intent', 'floating_bar', 'showcase'));
