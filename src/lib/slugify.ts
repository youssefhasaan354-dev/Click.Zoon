/**
 * Utility functions for generating and validating URL slugs.
 */

const arabicToEnglishMap: Record<string, string> = {
  مطعم: 'restaurant',
  كافيه: 'cafe',
  مقهى: 'cafe',
  متجر: 'store',
  عيادة: 'clinic',
  دكتور: 'doctor',
  مستشفى: 'hospital',
  مركز: 'center',
  شركة: 'company',
  مكتب: 'office',
  صالون: 'salon',
  عقارات: 'real-estate',
  محاماة: 'law',
  فندق: 'hotel',
  موقع: 'website',
  تطبيق: 'app',
  برنامج: 'software',
};

/**
 * Converts a string (Arabic or English) to a clean, URL-safe lowercase English slug.
 */
export function slugify(input: string): string {
  if (!input) return '';

  let processed = input.trim().toLowerCase();

  // Replace common Arabic business terms with English equivalents
  for (const [ar, en] of Object.entries(arabicToEnglishMap)) {
    processed = processed.replace(new RegExp(ar, 'g'), ` ${en} `);
  }

  // Keep only alphanumeric ascii characters and replace everything else with hyphens
  const slug = processed
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Validates that a slug contains only lowercase English letters, numbers, and hyphens.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}
