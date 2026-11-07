export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface I18nContextValue {
  language: Language;
  direction: Direction;
  dir: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  loadGoogleTranslate: () => Promise<boolean>;
  googleTranslateStatus: 'idle' | 'loading' | 'ready' | 'error';
  googleTranslateError: string | null;
}
