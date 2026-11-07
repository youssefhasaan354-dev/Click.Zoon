import { supabase } from '@/lib/supabase';

export type DemoRequestSource = 'form' | 'wizard' | 'exit_intent' | 'showcase';

export interface SubmitDemoRequestPayload {
  name: string;
  phone: string;
  business_type?: string;
  page_url?: string | null;
  message_text?: string | null;
  source: DemoRequestSource;
  honeypot?: string;
  turnstile_token?: string;
}

export interface SubmitDemoRequestResult {
  success: boolean;
  data?: { id: string; created_at: string };
  error?: string;
  isRateLimited?: boolean;
}

/**
 * Submit genuine lead request (form, wizard, exit_intent) via the secure Supabase Edge Function 'submit-demo-request'.
 * Preserves customer session JWT so registered customers have user_id linked automatically.
 */
export async function submitDemoRequest(
  payload: SubmitDemoRequestPayload
): Promise<SubmitDemoRequestResult> {
  try {
    // 1. Get current user session if any
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    // 2. Invoke Edge Function
    const { data, error } = await supabase.functions.invoke('submit-demo-request', {
      body: {
        ...payload,
        page_url: payload.page_url || (typeof window !== 'undefined' ? window.location.href : null),
      },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (error) {
      let errorMessage = 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.';
      let isRateLimited = false;

      // Extract error body from FunctionsHttpError if available
      try {
        if ('context' in error && error.context && typeof error.context.json === 'function') {
          const errJson = await error.context.json();
          if (errJson?.error) errorMessage = errJson.error;
          if (errJson?.code === 'rate_limit' || error.message?.includes('429')) {
            isRateLimited = true;
          }
        }
      } catch {
        if (error.message) errorMessage = error.message;
      }

      if (error.message?.includes('429') || errorMessage.includes('تجاوزت الحد')) {
        isRateLimited = true;
      }

      return {
        success: false,
        error: errorMessage,
        isRateLimited,
      };
    }

    return {
      success: true,
      data: data?.data,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل الاتصال بالخادم';
    return {
      success: false,
      error: msg,
    };
  }
}
