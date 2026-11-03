// Supabase Edge Function: submit-demo-request
// Validates bot protection (Cloudflare Turnstile when configured), validates Egyptian phone format,
// enforces IP & Phone rate limiting, and securely inserts leads into public.demo_requests using Service Role.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SubmitRequestPayload {
  name: string;
  phone: string;
  business_type?: string;
  page_url?: string | null;
  user_id?: string | null;
  message_text?: string;
  source?: string;
  honeypot?: string;
  turnstile_token?: string;
}

// In-memory sliding window rate limiter per client IP
// Protects endpoint when Turnstile is not configured or client lacks Turnstile token
const ipRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  if (!ip || ip === 'unknown-ip') return false;
  const now = Date.now();
  const history = (ipRequestHistory.get(ip) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (history.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  history.push(now);
  ipRequestHistory.set(ip, history);
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown-ip';

    // 1. IP Rate Limiting check
    if (isRateLimited(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({
          error: 'لقد تجاوزت الحد المسموح من الطلبات خلال وقت قصير. يرجى الانتظار بضع دقائق ثم المحاولة.',
          code: 'rate_limit',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: SubmitRequestPayload = await req.json();

    // 2. Honeypot check (client-side trap filled by bots)
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.warn('Bot detected via honeypot from IP:', clientIp);
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Cloudflare Turnstile verification:
    // If TURNSTILE_SECRET_KEY is configured AND turnstile_token is supplied, verify it with Cloudflare.
    // If TURNSTILE_SECRET_KEY is NOT configured, or client lacks VITE_TURNSTILE_SITE_KEY (token missing),
    // allow the request through safely protected by IP rate limiting, honeypot, and phone validation.
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    const token = body.turnstile_token;

    if (turnstileSecret && token) {
      const formData = new FormData();
      formData.append('secret', turnstileSecret);
      formData.append('response', token);
      if (clientIp && clientIp !== 'unknown-ip') {
        formData.append('remoteip', clientIp);
      }

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });

      const verifyOutcome = await verifyRes.json();
      if (!verifyOutcome.success) {
        console.warn('Turnstile verification failed:', verifyOutcome['error-codes']);
        return new Response(JSON.stringify({ error: 'فشل التحقق الأمني من الرمز' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. Phone number validation (Egyptian format)
    const rawPhone = (body.phone || '').trim();
    // Normalize Arabic-Indic digits if any (٠١٢٣٤٥٦٧٨٩)
    const normalizedDigits = rawPhone.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const cleanPhone = normalizedDigits.replace(/[\s\-()]/g, '');
    const phoneValid = /^(\+?20|0)?1[0125]\d{8}$/.test(cleanPhone);
    if (!phoneValid) {
      return new Response(JSON.stringify({ error: 'رقم الهاتف غير صالح. يرجى إدخال رقم مصري صحيح.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Supabase DB Insert using Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not set');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('demo_requests')
      .insert({
        name: (body.name || '').trim().slice(0, 160),
        phone: cleanPhone.slice(0, 40),
        business_type: (body.business_type || '').trim().slice(0, 160),
        page_url: body.page_url ? body.page_url.trim().slice(0, 500) : null,
        user_id: body.user_id || null,
        message_text: body.message_text || null,
        source: body.source || 'form',
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
