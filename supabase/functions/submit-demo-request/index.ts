// Supabase Edge Function: submit-demo-request
// Validates bot protection (Cloudflare Turnstile when configured), validates Egyptian phone format,
// enforces DB-backed IP rate limiting (hashed IP) & Phone rate limiting, verifies authenticated customer JWT,
// and securely inserts genuine leads ('form', 'wizard', 'exit_intent', 'showcase') into public.demo_requests.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Strict whitelist: only real lead submissions are stored as rows in demo_requests
const ALLOWED_SOURCES = [
  'form',
  'wizard',
  'exit_intent',
  'showcase',
] as const;

type AllowedSource = typeof ALLOWED_SOURCES[number];

interface SubmitRequestPayload {
  name: string;
  phone: string;
  business_type?: string;
  page_url?: string | null;
  message_text?: string | null;
  source: string;
  honeypot?: string;
  turnstile_token?: string;
}

const RATE_LIMIT_MAX_REQUESTS = 6;
const RATE_LIMIT_WINDOW_MINUTES = 10;

/**
 * Computes a secure SHA-256 hash of the client IP address.
 * Never stores raw IP addresses in the database.
 */
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * DB-backed rate limiter using the atomic RPC or fallback table query.
 */
async function checkDbRateLimit(
  supabaseAdmin: SupabaseClient,
  ipHash: string,
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMinutes = RATE_LIMIT_WINDOW_MINUTES
): Promise<{ allowed: boolean }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_ip_rate_limit', {
      p_ip_hash: ipHash,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes,
    });

    if (error) {
      console.warn('RPC check_ip_rate_limit error, falling back to table query:', error.message);
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
      const { count, error: countErr } = await supabaseAdmin
        .from('request_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', windowStart);

      if (countErr) {
        console.warn('Table request_attempts query error (migration may need applying):', countErr.message);
        return { allowed: true }; // Fail-open to avoid breaking service if migration is pending
      }

      if ((count ?? 0) >= maxRequests) {
        return { allowed: false };
      }

      await supabaseAdmin.from('request_attempts').insert({ ip_hash: ipHash });
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      await supabaseAdmin.from('request_attempts').delete().lt('created_at', oneHourAgo);
      return { allowed: true };
    }

    return { allowed: Boolean(data) };
  } catch (err) {
    console.error('Rate limit check exception:', err);
    return { allowed: true };
  }
}

function sanitizeText(str?: string | null, maxLen = 1000): string | null {
  if (!str) return null;
  const cleaned = str.replace(/<[^>]*>/g, '').trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLen);
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

    const ipHash = await hashIp(clientIp);

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not set');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. DB-Backed IP Rate Limiting check (hashed IP)
    const { allowed: ipAllowed } = await checkDbRateLimit(
      supabaseAdmin,
      ipHash,
      RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MINUTES
    );

    if (!ipAllowed) {
      console.warn(`DB Rate limit exceeded for IP hash: ${ipHash}`);
      return new Response(
        JSON.stringify({
          error: 'لقد تم إرسال طلبات متعددة خلال وقت قصير. يرجى الانتظار بضع دقائق والمحاولة لاحقاً.',
          code: 'rate_limit',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: SubmitRequestPayload = await req.json();

    // 2. Strict whitelist validation for 'source'
    const source = (body.source || '').trim();
    if (!source || !ALLOWED_SOURCES.includes(source as AllowedSource)) {
      console.warn('Rejected invalid source:', source, 'from IP hash:', ipHash);
      return new Response(
        JSON.stringify({
          error: `قيمة المصدر (source) غير صالحة. القيم المسموحة هي: ${ALLOWED_SOURCES.join(', ')}`,
          code: 'invalid_source',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Honeypot check (client-side trap filled by bots)
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.warn('Bot detected via honeypot from IP hash:', ipHash);
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Cloudflare Turnstile verification:
    // If TURNSTILE_SECRET_KEY is set, REQUIRE turnstile_token; reject (403) when missing.
    // Keep the permissive path only when the secret is not configured.
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    const token = body.turnstile_token;

    if (turnstileSecret) {
      if (!token) {
        console.warn('Turnstile token missing while TURNSTILE_SECRET_KEY is configured from IP hash:', ipHash);
        return new Response(
          JSON.stringify({
            error: 'رمز التحقق الأمني مطلوب (Turnstile Token Missing)',
            code: 'turnstile_missing',
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

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
        return new Response(
          JSON.stringify({
            error: 'فشل التحقق الأمني من الرمز. يرجى إعادة المحاولة.',
            code: 'turnstile_failed',
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 5. Phone number validation (Egyptian format)
    const rawPhone = (body.phone || '').trim();
    const normalizedDigits = rawPhone.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const cleanPhone = normalizedDigits.replace(/[\s\-()]/g, '');
    const phoneValid = /^(\+?20|0)?1[0125]\d{8}$/.test(cleanPhone);
    if (!phoneValid) {
      return new Response(
        JSON.stringify({ error: 'رقم الهاتف غير صالح. يرجى إدخال رقم هاتف مصري صحيح (مثال: 01020095059).' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const finalName = (body.name || '').trim() || 'طلب موقع إلكتروني';
    const finalBusiness = (body.business_type || '').trim() || 'طلب ديمو / استشارة';

    // 6. Verify Authenticated Customer JWT (preserving "Customers can read own requests" RLS)
    let verifiedUserId: string | null = null;
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (jwt && jwt !== supabaseAnonKey && jwt !== supabaseServiceKey) {
        try {
          const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
          if (!authError && authData?.user?.id) {
            verifiedUserId = authData.user.id;
          }
        } catch (jwtErr) {
          console.warn('Failed to verify customer JWT:', jwtErr);
        }
      }
    }

    // 7. Secure DB Insert via Service Role
    const { data, error } = await supabaseAdmin
      .from('demo_requests')
      .insert({
        name: (sanitizeText(finalName, 160) || 'طلب موقع إلكتروني'),
        phone: cleanPhone.slice(0, 40),
        business_type: (sanitizeText(finalBusiness, 160) || 'طلب ديمو / استشارة'),
        page_url: body.page_url ? sanitizeText(body.page_url, 500) : null,
        user_id: verifiedUserId,
        message_text: sanitizeText(body.message_text, 1000),
        source: source,
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      const isDbRateLimit = error.message.includes('rate_limit');
      return new Response(
        JSON.stringify({
          error: isDbRateLimit ? error.message : 'حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.',
          code: isDbRateLimit ? 'rate_limit' : 'db_error',
        }),
        {
          status: isDbRateLimit ? 429 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
