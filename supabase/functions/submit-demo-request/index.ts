// Supabase Edge Function: submit-demo-request
// Validates bot protection (Cloudflare Turnstile / hCaptcha), validates Egyptian phone format,
// and securely inserts leads into public.demo_requests using Service Role.

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
    const body: SubmitRequestPayload = await req.json();

    // 1. Honeypot check (client-side trap filled by bots)
    if (body.honeypot && body.honeypot.trim().length > 0) {
      console.warn('Bot detected via honeypot');
      return new Response(JSON.stringify({ error: 'Spam detected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Cloudflare Turnstile verification (if TURNSTILE_SECRET_KEY is configured)
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (turnstileSecret) {
      const token = body.turnstile_token;
      if (!token) {
        return new Response(JSON.stringify({ error: 'Verification token required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '';
      const formData = new FormData();
      formData.append('secret', turnstileSecret);
      formData.append('response', token);
      if (clientIp) formData.append('remoteip', clientIp);

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });

      const verifyOutcome = await verifyRes.json();
      if (!verifyOutcome.success) {
        console.warn('Turnstile verification failed:', verifyOutcome['error-codes']);
        return new Response(JSON.stringify({ error: 'Security verification failed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. Phone number validation
    const rawPhone = (body.phone || '').trim();
    const cleanPhone = rawPhone.replace(/[\s\-()]/g, '');
    const phoneValid = /^(\+?20|0)?1[0125]\d{8}$/.test(cleanPhone);
    if (!phoneValid) {
      return new Response(JSON.stringify({ error: 'Invalid Egyptian phone number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Supabase DB Insert
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
