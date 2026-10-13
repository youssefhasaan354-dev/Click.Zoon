// ============================================================
// تتبع الأحداث — Google Analytics
// Analytics tracking — fires gtag events when GA is configured
// ============================================================

type EventCategory = 'whatsapp' | 'call' | 'email' | 'social' | 'form';

interface TrackEvent {
  category: EventCategory;
  action: string;
  label?: string;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent({ category, action, label }: TrackEvent) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }

  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.debug('[Track]', category, action, label);
  }
}

let gaInjected = false;

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
