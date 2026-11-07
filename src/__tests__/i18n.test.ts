import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getInitialLanguage,
  saveLanguage,
  applyHtmlAttributes,
  translateKey,
  interpolate,
  STORAGE_KEY,
} from '@/i18n';

// Setup browser globals for Node test environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockDocument = {
  documentElement: {
    lang: 'ar',
    dir: 'rtl',
  },
};

const mockStorage = new MockLocalStorage();
(globalThis as unknown as { window: unknown }).window = globalThis;
(globalThis as unknown as { localStorage: MockLocalStorage }).localStorage = mockStorage;
(globalThis as unknown as { document: typeof mockDocument }).document = mockDocument;

describe('i18n core logic and persistence', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockDocument.documentElement.lang = 'ar';
    mockDocument.documentElement.dir = 'rtl';
    vi.restoreAllMocks();
  });

  describe('getInitialLanguage & saveLanguage', () => {
    it('defaults to Arabic when no language is stored (Arabic-first)', () => {
      expect(getInitialLanguage()).toBe('ar');
    });

    it('retrieves saved language from localStorage', () => {
      mockStorage.setItem(STORAGE_KEY, 'en');
      expect(getInitialLanguage()).toBe('en');

      mockStorage.setItem(STORAGE_KEY, 'ar');
      expect(getInitialLanguage()).toBe('ar');
    });

    it('ignores invalid values in localStorage and defaults to Arabic', () => {
      mockStorage.setItem(STORAGE_KEY, 'fr');
      expect(getInitialLanguage()).toBe('ar');

      mockStorage.setItem(STORAGE_KEY, 'xyz');
      expect(getInitialLanguage()).toBe('ar');
    });

    it('persists language correctly via saveLanguage', () => {
      saveLanguage('en');
      expect(mockStorage.getItem(STORAGE_KEY)).toBe('en');

      saveLanguage('ar');
      expect(mockStorage.getItem(STORAGE_KEY)).toBe('ar');
    });

    it('handles localStorage exceptions gracefully without crashing (e.g. private browsing)', () => {
      vi.spyOn(mockStorage, 'getItem').mockImplementation(() => {
        throw new Error('QuotaExceeded or SecurityError');
      });
      vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded or SecurityError');
      });

      expect(() => saveLanguage('en')).not.toThrow();
      expect(getInitialLanguage()).toBe('ar');
    });
  });

  describe('applyHtmlAttributes', () => {
    it('sets dir="rtl" and lang="ar" for Arabic', () => {
      applyHtmlAttributes('ar');
      expect(mockDocument.documentElement.lang).toBe('ar');
      expect(mockDocument.documentElement.dir).toBe('rtl');
    });

    it('sets dir="ltr" and lang="en" for English', () => {
      applyHtmlAttributes('en');
      expect(mockDocument.documentElement.lang).toBe('en');
      expect(mockDocument.documentElement.dir).toBe('ltr');
    });
  });

  describe('translateKey and Fallbacks', () => {
    const mockAr = {
      nav: { home: 'الرئيسية', services: 'الخدمات' },
      only_in_arabic: 'محتوى عربي فقط',
      greeting: 'مرحباً {name}!',
    };

    const mockEn = {
      nav: { home: 'Home', services: 'Services' },
      greeting: 'Welcome {name}!',
    };

    it('returns English translation when language is en and key exists', () => {
      expect(translateKey('en', mockAr, mockEn, 'nav.home')).toBe('Home');
      expect(translateKey('en', mockAr, mockEn, 'nav.services')).toBe('Services');
    });

    it('returns Arabic translation when language is ar', () => {
      expect(translateKey('ar', mockAr, mockEn, 'nav.home')).toBe('الرئيسية');
      expect(translateKey('ar', mockAr, mockEn, 'nav.services')).toBe('الخدمات');
    });

    it('falls back to Arabic when key is missing in English dictionary', () => {
      // Key "only_in_arabic" does NOT exist in mockEn
      const result = translateKey('en', mockAr, mockEn, 'only_in_arabic');
      expect(result).toBe('محتوى عربي فقط');
    });

    it('falls back to Arabic when English dictionary is still loading (null)', () => {
      const result = translateKey('en', mockAr, null, 'nav.home');
      expect(result).toBe('الرئيسية');
    });

    it('falls back to key itself when missing in both dictionaries', () => {
      const nonExistentKey = 'non.existent.key';
      expect(translateKey('en', mockAr, mockEn, nonExistentKey)).toBe(nonExistentKey);
      expect(translateKey('ar', mockAr, mockEn, nonExistentKey)).toBe(nonExistentKey);
    });

    it('interpolates parameters correctly in both languages', () => {
      expect(translateKey('ar', mockAr, mockEn, 'greeting', { name: 'أحمد' })).toBe('مرحباً أحمد!');
      expect(translateKey('en', mockAr, mockEn, 'greeting', { name: 'John' })).toBe('Welcome John!');
    });

    it('handles interpolate helper function directly', () => {
      expect(interpolate('Hello {user}, you have {count} items', { user: 'Sara', count: 3 })).toBe(
        'Hello Sara, you have 3 items'
      );
    });
  });

  describe('Real Dictionaries Parity', () => {
    it('verifies that ar.json and en.json have matching top-level sections and keys', async () => {
      const arModule = await import('../i18n/ar.json');
      const enModule = await import('../i18n/en.json');

      const arData = (arModule.default || arModule) as Record<string, Record<string, unknown>>;
      const enData = (enModule.default || enModule) as Record<string, Record<string, unknown>>;

      const arKeys = Object.keys(arData).filter((k) => k !== 'default');
      const enKeys = Object.keys(enData).filter((k) => k !== 'default');

      expect(enKeys.sort()).toEqual(arKeys.sort());

      // Check each section's keys
      for (const section of arKeys) {
        const arSection = arData[section];
        const enSection = enData[section];

        if (typeof arSection === 'object' && arSection !== null) {
          const arSubKeys = Object.keys(arSection);
          const enSubKeys = Object.keys(enSection || {});
          expect(enSubKeys.sort(), `Missing keys in en.json section "${section}"`).toEqual(arSubKeys.sort());
        }
      }
    });
  });
});
