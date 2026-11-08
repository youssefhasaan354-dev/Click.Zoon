// ============================================================
// تتبع الأحداث — Google Analytics
// Analytics tracking — fires gtag events when GA is configured
// ============================================================

export type EventCategory = 'whatsapp' | 'call' | 'email' | 'social' | 'form';

export interface TrackEventOptions {
  category?: EventCategory;
  action?: string;
  label?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

let gaInjected = false;

/**
 * Safe analytics event tracker:
 * Does nothing if Google Analytics is not initialized or window is undefined.
 * Supports both signatures:
 *   trackEvent(name, params)
 * and
 *   trackEvent({ category, action, label })
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void;
export function trackEvent(options: TrackEventOptions): void;
export function trackEvent(
  nameOrOptions: string | TrackEventOptions,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !gaInjected || typeof window.gtag !== 'function') {
    return;
  }

  try {
    if (localStorage.getItem('cz_cookie_consent') !== 'accepted') {
      return;
    }
  } catch {
    return;
  }

  try {
    if (typeof nameOrOptions === 'string') {
      window.gtag('event', nameOrOptions, params || {});
      if (import.meta.env.DEV) {
        console.debug('[Track]', nameOrOptions, params);
      }
    } else {
      const { category, action, label, ...rest } = nameOrOptions;
      const eventName = action || 'custom_event';
      const eventParams = {
        event_category: category,
        event_label: label,
        ...rest,
        ...(params || {}),
      };
      window.gtag('event', eventName, eventParams);
      if (import.meta.env.DEV) {
        console.debug('[Track]', category, eventName, label, rest);
      }
    }
  } catch (err) {
    console.warn('[Track error]', err);
  }
}

export function isAnalyticsInitialized(): boolean {
  return gaInjected;
}

export function initGoogleAnalytics(measurementId: string) {
  if (!measurementId || gaInjected || typeof document === 'undefined') return;

  try {
    if (localStorage.getItem('cz_cookie_consent') !== 'accepted') return;
  } catch {
    return;
  }

  // 1. Initialize dataLayer and queue function BEFORE injecting script
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    // MUST push arguments object directly, NOT an array or rest spread
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }

  // 2. Grant Consent Mode v2 explicitly before config
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  });

  // 3. Queue js and config commands
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  // 4. Inject Google Tag Manager / GA4 remote script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gaInjected = true;

  if (import.meta.env.DEV) {
    console.debug('[GA4] Initialized with measurementId:', measurementId);
  }
}
