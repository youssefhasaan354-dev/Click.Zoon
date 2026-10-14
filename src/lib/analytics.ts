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

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  gaInjected = true;
}
