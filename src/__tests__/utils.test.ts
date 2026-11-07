import { describe, it, expect } from 'vitest';
import { slugify, isValidSlug } from '@/lib/slugify';
import { validateEgyptianPhone, cleanPhoneNumber, normalizeArabicDigits } from '@/lib/phone';
import { normalizeItem } from '@/lib/showcase';
import { PortfolioItem } from '@/lib/types';

describe('slugify and isValidSlug', () => {
  it('converts common Arabic business terms to English keywords', () => {
    expect(slugify('مطعم البرنس')).toContain('restaurant');
    expect(slugify('كافيه ومقهى رويال')).toContain('cafe');
    expect(slugify('عيادة دكتور الأسنان')).toContain('clinic-doctor');
    expect(slugify('متجر ملابس')).toContain('store');
    expect(slugify('شركة عقارات')).toContain('company-real-estate');
  });

  it('converts English names into clean kebab-case slugs', () => {
    expect(slugify('Delano Cafe & Lounge')).toBe('delano-cafe-lounge');
    expect(slugify('  My  Awesome   Project! 2026  ')).toBe('my-awesome-project-2026');
  });

  it('handles empty or blank input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('validates correct slugs with isValidSlug', () => {
    expect(isValidSlug('delano-cafe')).toBe(true);
    expect(isValidSlug('sample-restaurant-1')).toBe(true);
    expect(isValidSlug('clickzoon')).toBe(true);
    expect(isValidSlug('clinic-2026')).toBe(true);
  });

  it('rejects invalid slugs with isValidSlug', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Delano-Cafe')).toBe(false); // Uppercase not allowed
    expect(isValidSlug('delano cafe')).toBe(false); // Spaces not allowed
    expect(isValidSlug('مطعم-البرنس')).toBe(false); // Arabic characters not allowed
    expect(isValidSlug('delano_cafe')).toBe(false); // Underscores not allowed
    expect(isValidSlug('delano--cafe')).toBe(false); // Consecutive dashes not allowed
    expect(isValidSlug('-delano-cafe')).toBe(false); // Leading dash not allowed
    expect(isValidSlug('delano-cafe-')).toBe(false); // Trailing dash not allowed
    expect(isValidSlug('cafe!')).toBe(false); // Special characters not allowed
  });
});

describe('Egyptian Phone Validation and Normalization', () => {
  it('normalizes Eastern Arabic-Indic digits to Latin digits', () => {
    expect(normalizeArabicDigits('٠١٠١٢٣٤٥٦٧٨')).toBe('01012345678');
    expect(normalizeArabicDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });

  it('cleans phone numbers by removing spaces, hyphens, and parens', () => {
    expect(cleanPhoneNumber(' 010-1234-5678 ')).toBe('01012345678');
    expect(cleanPhoneNumber('(011) 9876 5432')).toBe('01198765432');
    expect(cleanPhoneNumber('٠١٢ - ٣٤٥٦ - ٧٨٩٠')).toBe('01234567890');
  });

  it('validates standard 11-digit Egyptian mobile numbers', () => {
    // Vodafone (010)
    expect(validateEgyptianPhone('01012345678')).toBe(true);
    // Etisalat (011)
    expect(validateEgyptianPhone('01112345678')).toBe(true);
    // Orange (012)
    expect(validateEgyptianPhone('01212345678')).toBe(true);
    // WE (015)
    expect(validateEgyptianPhone('01512345678')).toBe(true);
  });

  it('accepts country-code prefixes (+20, 20)', () => {
    expect(validateEgyptianPhone('+201012345678')).toBe(true);
    expect(validateEgyptianPhone('201112345678')).toBe(true);
    expect(validateEgyptianPhone('+20 121 234 5678')).toBe(true);
  });

  it('accepts Arabic-Indic formatted phone numbers', () => {
    expect(validateEgyptianPhone('٠١٠١٢٣٤٥٦٧٨')).toBe(true);
    expect(validateEgyptianPhone('+٢٠١٠١٢٣٤٥٦٧٨')).toBe(true);
  });

  it('rejects invalid Egyptian phone numbers', () => {
    expect(validateEgyptianPhone('')).toBe(false);
    expect(validateEgyptianPhone('01912345678')).toBe(false); // Invalid network prefix 019
    expect(validateEgyptianPhone('01312345678')).toBe(false); // Invalid network prefix 013
    expect(validateEgyptianPhone('0101234567')).toBe(false); // 10 digits (too short)
    expect(validateEgyptianPhone('010123456789')).toBe(false); // 12 digits (too long)
    expect(validateEgyptianPhone('0233445566')).toBe(false); // Landline number
    expect(validateEgyptianPhone('010abcdefgh')).toBe(false); // Non-digit letters
  });
});

describe('normalizeItem for Showcase items', () => {
  it('applies fallback values when optional fields are missing', () => {
    const rawItem: PortfolioItem = {
      id: 'item-123',
      title: 'مشروع افتراضي',
      category: 'restaurants',
      description: 'وصف مختصر للمشروع',
      image_url: '/images/project.webp',
      link: null,
      visible: true,
      sort_order: 1,
    };

    const normalized = normalizeItem(rawItem, 0);

    expect(normalized.slug).toBe('project-item-123');
    expect(normalized.kind).toBe('website');
    expect(normalized.tagline).toBe('');
    expect(normalized.long_description).toBe('وصف مختصر للمشروع');
    expect(normalized.features).toEqual([]);
    expect(normalized.screenshots).toEqual(['/images/project.webp']);
  });

  it('preserves existing values when fully populated', () => {
    const rawItem: PortfolioItem = {
      id: 'item-456',
      title: 'متجر فاخر',
      category: 'stores',
      kind: 'store',
      slug: 'luxury-store',
      tagline: 'تجربة تسوق فريدة',
      description: 'وصف مختصر',
      long_description: 'وصف تفصيلي شامل لكافة مميزات المتجر',
      features: ['دفع إلكتروني', 'شحن سريع'],
      image_url: '/images/store-cover.webp',
      screenshots: ['/images/screen-1.webp', '/images/screen-2.webp'],
      link: 'https://example.com',
      live_url: 'https://example.com',
      visible: true,
      sort_order: 2,
    };

    const normalized = normalizeItem(rawItem, 1);

    expect(normalized.slug).toBe('luxury-store');
    expect(normalized.kind).toBe('store');
    expect(normalized.tagline).toBe('تجربة تسوق فريدة');
    expect(normalized.long_description).toBe('وصف تفصيلي شامل لكافة مميزات المتجر');
    expect(normalized.features).toEqual(['دفع إلكتروني', 'شحن سريع']);
    expect(normalized.screenshots).toEqual(['/images/screen-1.webp', '/images/screen-2.webp']);
  });
});
