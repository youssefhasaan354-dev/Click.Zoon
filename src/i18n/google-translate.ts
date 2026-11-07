/**
 * Lazy loader for Google Website Translator
 * Runs entirely without inline scripts to preserve strict Content Security Policy.
 */

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: {
          new (options: Record<string, unknown>, elementId: string): unknown;
          InlineLayout?: {
            SIMPLE: number;
          };
        };
      };
    };
  }
}

let loadPromise: Promise<boolean> | null = null;
let isInitialized = false;

export function isGoogleTranslateLoaded(): boolean {
  return isInitialized && Boolean(window.google?.translate?.TranslateElement);
}

export function loadGoogleTranslateScript(elementId = 'google_translate_element'): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (isGoogleTranslateLoaded()) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    // 1. Define global callback in bundled JS (never an inline <script>!)
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          const Layout = window.google.translate.TranslateElement.InlineLayout?.SIMPLE ?? 0;
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'ar',
              includedLanguages: 'en,fr,de,es,it,ru,tr,zh-CN,ja,ko,hi,ur,fa',
              layout: Layout,
              autoDisplay: false,
            },
            elementId
          );
          isInitialized = true;
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn('[Google Translate] Init error:', err);
        resolve(false);
      }
    };

    // 2. Set timeout so offline/ad-blocker doesn't hang indefinitely
    const timer = setTimeout(() => {
      if (!isInitialized) {
        console.warn('[Google Translate] Loading timed out (offline or blocked).');
        resolve(false);
      }
    }, 7000);

    // 3. Inject external script (allowed by CSP script-src)
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      console.warn('[Google Translate] Script network error (ad-blocker, offline, or CSP).');
      resolve(false);
    };
    script.onload = () => {
      clearTimeout(timer);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
