/*
# Add message_text and source columns to demo_requests

## Changes
- `message_text` (text, nullable) — stores the full WhatsApp message text
- `source` (text, not null, default 'form') — where the request came from
  CHECK in ('form', 'whatsapp_click', 'call_click')
- `status` column already exists from a previous migration

## Security
- No RLS changes needed — existing policies cover the new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_requests' AND column_name = 'message_text') THEN
    ALTER TABLE public.demo_requests
      ADD COLUMN message_text text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demo_requests' AND column_name = 'source') THEN
    ALTER TABLE public.demo_requests
      ADD COLUMN source text NOT NULL DEFAULT 'form' CHECK (source IN ('form', 'whatsapp_click', 'call_click'));
  END IF;
END $$;
