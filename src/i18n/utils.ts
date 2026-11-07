import { Language, Direction } from './types';

export const STORAGE_KEY = 'cz_lang';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    // localStorage may throw in restricted/private browsing modes
  }
  // Default to Arabic (Arabic-first, never auto-detect browser language on first visit)
  return 'ar';
}

export function saveLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Graceful fallback if localStorage is unavailable
  }
}

export function applyHtmlAttributes(lang: Language): void {
  if (typeof document === 'undefined') return;
  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

export function getNestedValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  let res = template;
  for (const [key, val] of Object.entries(params)) {
    res = res.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }
  return res;
}

export function translateKey(
  lang: Language,
  arDict: Record<string, unknown>,
  enDict: Record<string, unknown> | null,
  key: string,
  params?: Record<string, string | number>
): string {
  let val: string | undefined;
  if (lang === 'en' && enDict) {
    val = getNestedValue(enDict, key);
  }
  // Fall back to Arabic dictionary if missing or in Arabic mode
  if (val === undefined) {
    val = getNestedValue(arDict, key);
  }
  // Fall back to key itself
  if (val === undefined) {
    val = key;
  }
  return interpolate(val, params);
}
