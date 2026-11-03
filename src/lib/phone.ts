/**
 * Egyptian phone number validation and normalization utilities
 */

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Normalizes Eastern Arabic-Indic digits (٠-٩) and Persian digits to Latin digits (0-9).
 */
export function normalizeArabicDigits(str: string): string {
  if (!str) return '';
  return str.replace(/[٠-٩]/g, (char) => {
    const idx = ARABIC_INDIC_DIGITS.indexOf(char);
    return idx !== -1 ? String(idx) : char;
  });
}

/**
 * Cleans phone string by converting Arabic digits and removing whitespace, dashes, parens.
 */
export function cleanPhoneNumber(phone: string): string {
  const latin = normalizeArabicDigits(phone);
  return latin.replace(/[\s\-()]/g, '');
}

/**
 * Validates Egyptian phone numbers:
 * Starts with optional (+20 or 0), followed by 10, 11, 12, or 15, then 8 digits.
 * Accepts normalized Arabic-Indic and Latin digits.
 */
export function validateEgyptianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return /^(\+?20|0)?1[0125]\d{8}$/.test(cleaned);
}

export const isValidEgyptianPhone = validateEgyptianPhone;
