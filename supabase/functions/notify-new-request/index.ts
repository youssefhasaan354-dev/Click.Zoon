// Supabase Edge Function: notify-new-request
// Sends a Telegram notification when a new demo/contact request is inserted into public.demo_requests

function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeEgyptianPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '20' + digits.slice(1);
  }
  if (digits.startsWith('20')) {
    return digits;
  }
  return digits || phone;
}

function formatCairoTime(isoDate?: string): string {
  try {
    const d = isoDate ? new Date(isoDate) : new Date();
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(d);
  } catch {
    return new Date().toISOString();
  }
}

function getSourceLabel(source?: string): string {
  switch (source) {
    case 'form':
      return 'نموذج الموقع (ديمو / تواصل)';
    case 'whatsapp_click':
      return 'نقرة زر واتساب';
    case 'call_click':
      return 'نقرة زر اتصال';
    default:
      return source || 'غير محدد';
  }
}

interface WebhookPayload {
  type?: string;
  table?: string;
  schema?: string;
  record?: {
    id?: string;
    name?: string;
    phone?: string;
    business_type?: string;
    page_url?: string | null;
    source?: string;
    message_source?: string;
    created_at?: string;
  };
  name?: string;
  phone?: string;
  business_type?: string;
  page_url?: string | null;
  source?: string;
  message_source?: string;
  created_at?: string;
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  // Allow health check / ping
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', function: 'notify-new-request' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 1. Verify shared webhook secret
  const configuredSecret = Deno.env.get('WEBHOOK_SECRET');
  if (configuredSecret) {
    const incomingSecret =
      req.headers.get('x-webhook-secret') ||
      req.headers.get('webhook-secret') ||
      req.headers.get('x-secret') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (incomingSecret !== configuredSecret) {
      console.warn('Unauthorized webhook call: secret mismatch');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. Parse payload
  let payload: WebhookPayload | null = null;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch (err) {
    console.error('Failed to parse request JSON:', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract record from Database Webhook or direct payload
  const record = payload?.record || payload;
  const name = record?.name || 'غير محدد';
  const phone = record?.phone || 'غير محدد';
  const businessType = record?.business_type || 'غير محدد';
  const pageUrl = record?.page_url || null;
  const source = record?.source || record?.message_source || 'form';
  const createdAt = record?.created_at;

  const normalizedPhone = normalizeEgyptianPhone(phone);
  const cairoTime = formatCairoTime(createdAt);
  const sourceLabel = getSourceLabel(source);
  const waUrl = `https://wa.me/${normalizedPhone}`;

  // 3. Prepare Telegram message
  let message = `🔔 <b>طلب جديد على كليك زون!</b>\n\n`;
  message += `👤 <b>الاسم:</b> ${escapeHtml(name)}\n`;
  message += `📱 <b>الهاتف:</b> <code>${escapeHtml(phone)}</code>\n`;
  message += `💼 <b>نوع النشاط:</b> ${escapeHtml(businessType)}\n`;
  if (pageUrl) {
    message += `🌐 <b>رابط الصفحة:</b> <a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a>\n`;
  }
  message += `📍 <b>المصدر:</b> ${escapeHtml(sourceLabel)}\n`;
  message += `🕒 <b>التوقيت (القاهرة):</b> ${escapeHtml(cairoTime)}\n\n`;
  message += `💬 <a href="${escapeHtml(waUrl)}">فتح محادثة واتساب مع العميل</a>`;

  // 4. Send message via Telegram Bot API
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment secrets');
    // Return 200 so Supabase webhook doesn't repeatedly retry on misconfiguration
    return new Response(
      JSON.stringify({ ok: false, message: 'Telegram secrets are not configured' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!telegramRes.ok) {
      const errBody = await telegramRes.text();
      console.error('Telegram API error:', telegramRes.status, errBody);
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (err) {
    console.error('Failed to send Telegram notification:', err);
  }

  // Always return 200 per specification
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
