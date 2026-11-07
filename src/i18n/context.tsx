/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Language, I18nContextValue } from './types';
import arTranslations from './ar.json';
import { loadGoogleTranslateScript } from './google-translate';
import {
  getInitialLanguage,
  saveLanguage,
  applyHtmlAttributes,
  translateKey,
} from './utils';

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const init = getInitialLanguage();
    applyHtmlAttributes(init);
    return init;
  });

  const [enTranslations, setEnTranslations] = useState<Record<string, unknown> | null>(null);
  const [googleTranslateStatus, setGoogleTranslateStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [googleTranslateError, setGoogleTranslateError] = useState<string | null>(null);

  // Lazy-load English dictionary
  const loadEnDictionary = useCallback(async (): Promise<Record<string, unknown> | null> => {
    if (enTranslations) return enTranslations;
    try {
      const module = await import('./en.json');
      const data = (module.default || module) as Record<string, unknown>;
      setEnTranslations(data);
      return data;
    } catch (err) {
      console.error('[i18n] Failed to load en.json:', err);
      return null;
    }
  }, [enTranslations]);

  // If initial language is English, fetch en.json on mount
  useEffect(() => {
    if (language === 'en' && !enTranslations) {
      loadEnDictionary();
    }
  }, [language, enTranslations, loadEnDictionary]);

  // Synchronize document attributes whenever language changes
  useEffect(() => {
    applyHtmlAttributes(language);
  }, [language]);

  const setLanguage = useCallback(
    async (newLang: Language) => {
      if (newLang === 'en' && !enTranslations) {
        await loadEnDictionary();
      }
      setLanguageState(newLang);
      saveLanguage(newLang);
      applyHtmlAttributes(newLang);
    },
    [enTranslations, loadEnDictionary]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return translateKey(language, arTranslations, enTranslations, key, params);
    },
    [language, enTranslations]
  );

  const loadGoogleTranslate = useCallback(async (): Promise<boolean> => {
    setGoogleTranslateStatus('loading');
    setGoogleTranslateError(null);
    const success = await loadGoogleTranslateScript();
    if (success) {
      setGoogleTranslateStatus('ready');
      return true;
    } else {
      setGoogleTranslateStatus('error');
      setGoogleTranslateError(t('lang.load_error'));
      return false;
    }
  }, [t]);

  const value = useMemo<I18nContextValue>(() => {
    const isRtl = language === 'ar';
    const direction = isRtl ? 'rtl' : 'ltr';
    return {
      language,
      direction,
      dir: direction,
      isRtl,
      setLanguage,
      t,
      loadGoogleTranslate,
      googleTranslateStatus,
      googleTranslateError,
    };
  }, [language, setLanguage, t, loadGoogleTranslate, googleTranslateStatus, googleTranslateError]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an <I18nProvider>');
  }
  return ctx;
}
