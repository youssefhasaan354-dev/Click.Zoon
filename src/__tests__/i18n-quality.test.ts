import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ARABIC_REGEX = /[\u0600-\u06FF]/;
const rootDir = path.resolve(__dirname, '../../');

function getFilesRecursively(dir: string, extensions = ['.ts', '.tsx']): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function getAllKeys(obj: unknown, prefix = ''): string[] {
  let keys: string[] = [];
  if (!obj || typeof obj !== 'object') return keys;
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getAllKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

describe('i18n Quality & Completeness Guardians', () => {
  describe('Dictionary Parity & Character Integrity', () => {
    it('has 100% two-way key matching between ar.json and en.json', async () => {
      const arModule = await import('../i18n/ar.json');
      const enModule = await import('../i18n/en.json');
      const arData = arModule.default || arModule;
      const enData = enModule.default || enModule;

      const arKeys = getAllKeys(arData).sort();
      const enKeys = getAllKeys(enData).sort();

      const missingInEn = arKeys.filter((k) => !enKeys.includes(k));
      const missingInAr = enKeys.filter((k) => !arKeys.includes(k));

      expect(missingInEn, `Keys present in ar.json but missing in en.json: ${missingInEn.join(', ')}`).toEqual([]);
      expect(missingInAr, `Keys present in en.json but missing in ar.json: ${missingInAr.join(', ')}`).toEqual([]);
      expect(enKeys.length).toBe(arKeys.length);
    });

    it('ensures all values in en.json contain zero unapproved Arabic characters', async () => {
      const enModule = await import('../i18n/en.json');
      const enData = enModule.default || enModule;

      // Allowlist of specific keys in en.json permitted to mention Arabic script (e.g. language name 'العربية')
      const allowedArabicKeys = new Set([
        'lang.ar', // The Arabic language name in the language switcher: "العربية"
      ]);

      const violations: { key: string; value: string }[] = [];

      function checkValues(obj: unknown, prefix = '') {
        if (!obj || typeof obj !== 'object') return;
        for (const [k, v] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${k}` : k;
          if (typeof v === 'string') {
            if (ARABIC_REGEX.test(v) && !allowedArabicKeys.has(fullKey)) {
              violations.push({ key: fullKey, value: v });
            }
          } else if (typeof v === 'object' && !Array.isArray(v)) {
            checkValues(v, fullKey);
          }
        }
      }

      checkValues(enData);
      expect(
        violations,
        `Found Arabic characters in English dictionary (en.json): ${violations.map((v) => `${v.key} = "${v.value}"`).join(', ')}`
      ).toEqual([]);
    });
  });

  describe('Source Code Arabic Leakage Check', () => {
    // Explicit, well-documented allowlist of files and patterns permitted to contain Arabic
    const ALLOWED_FILES = new Set([
      'src/siteConfig.ts', // Default fallback text for database admin
      'src/lib/showcase.ts', // Seed portfolio designs
      'src/lib/phone.ts', // Arabic-Indic numeral normalization utility
      'src/lib/demo-requests.ts', // Service fallback error messages
      'src/lib/admin-context.tsx', // Admin auth error messages
      'src/lib/customer-context.tsx', // Customer auth error messages
      'src/lib/toast-context.tsx', // Toast notification default label
      'src/components/LanguageSwitcher.tsx', // Native language names in switcher ('العربية')
      'src/components/MockupsSection.tsx', // Delivered projects mockup prototypes (deliveredProjects)
      'src/components/Portfolio.tsx', // Fallback portfolio items (fallbackPortfolio)
      'src/components/TestimonialsSection.tsx', // Fallback client testimonials (fallbackTestimonials)
      'src/components/Seo.tsx', // Default SEO meta fallback constants (DEFAULT_TITLE, DEFAULT_DESC)
      'src/pages/CaseStudy.tsx', // Sample client case study metrics
      'src/pages/CustomerAuth.tsx', // Customer auth error fallbacks
      'src/pages/CustomerAccount.tsx', // Customer account headings
      'src/pages/CustomerRequests.tsx', // Customer requests status fallbacks
      'src/pages/ResetPassword.tsx', // Password reset error fallbacks
      'src/App.tsx', // defaultFaqs fallback for SEO schema
      'src/main.tsx', // Root ErrorBoundary fallback screen
      'src/data/landingPages.ts', // Mansoura local business landing pages (Arabic-first content targeting local search intent)
      'src/pages/ActivityLanding.tsx', // Mansoura landing page template with native lang="ar" and dir="rtl" content
    ]);

    it('verifies public components have zero unapproved Arabic strings', () => {
      const srcFiles = getFilesRecursively(path.join(rootDir, 'src'), ['.ts', '.tsx']);
      const violations: { file: string; line: number; text: string }[] = [];

      for (const filePath of srcFiles) {
        const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        // Ignore i18n dictionaries and tests
        if (relPath.startsWith('src/i18n/')) continue;
        if (relPath.startsWith('src/__tests__/')) continue;
        // Ignore internal admin management dashboard files
        if (relPath.startsWith('src/admin/')) continue;
        // Ignore documented mock data files
        if (ALLOWED_FILES.has(relPath)) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);

        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          // Skip comments
          if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            return;
          }
          // Check Arabic characters
          if (ARABIC_REGEX.test(trimmed)) {
            // Allow explicit brand name if in translate="no" or notranslate context
            if (trimmed.includes('كليك زون') && (trimmed.includes('agencyNameAr') || trimmed.includes('site_name_ar'))) {
              return;
            }
            violations.push({
              file: relPath,
              line: idx + 1,
              text: trimmed,
            });
          }
        });
      }

      expect(
        violations,
        `Found ${violations.length} unexpected raw Arabic string(s) in public components: \n${violations
          .map((v) => `  at ${v.file}:${v.line} -> "${v.text}"`)
          .join('\n')}`
      ).toEqual([]);
    });
  });
});
