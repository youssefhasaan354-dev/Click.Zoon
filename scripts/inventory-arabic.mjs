import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ARABIC_REGEX = /[\u0600-\u06FF]/;

function shouldIgnoreFile(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (norm.startsWith('src/i18n/')) return true;
  if (norm.includes('node_modules/')) return true;
  if (norm.includes('dist/')) return true;
  if (norm.includes('.git/')) return true;
  if (norm.endsWith('.d.ts')) return true;
  return false;
}

function getFiles(dir, extensions = ['.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function classifyMatch(line, trimmed, relPath) {
  // Attributes
  if (/(?:placeholder|aria-label|title|alt)\s*[:=]/i.test(trimmed)) {
    return 'attribute';
  }
  // Validation / errors / toasts
  if (/(?:toast|error|setError|invalid|required|throw new Error|alert\(|errorMessage|validation)/i.test(trimmed)) {
    return 'validation';
  }
  // Comments
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return 'تعليق برمجي (code comment)';
  }
  // Brand name intentional constant
  if (/['"`]كليك زون['"`]/.test(trimmed) && /(?:brand|site_name_ar|appName)/i.test(trimmed)) {
    return 'ثابت مقصود';
  }
  // Data from DB / Fallback data
  if (/(?:fallback|data\.|siteConfig\.|seed|mockups|processSteps|pricingPlans|services|features|testimonials|faqs)/i.test(trimmed) &&
      (trimmed.includes('{') || trimmed.includes(':') || trimmed.includes('[') || trimmed.includes('=>'))) {
    return 'data-from-DB';
  }
  if (relPath.includes('src/lib/showcase.ts') || relPath.includes('src/siteConfig.ts')) {
    return 'data-from-DB';
  }
  // Default to visible UI
  return 'UI ظاهر';
}

async function run() {
  console.log('=== Starting Complete Arabic Inventory Scan ===');
  const srcFiles = getFiles(path.join(rootDir, 'src'), ['.ts', '.tsx']);
  const otherFiles = [
    path.join(rootDir, 'index.html'),
  ];
  if (fs.existsSync(path.join(rootDir, 'public'))) {
    otherFiles.push(...getFiles(path.join(rootDir, 'public'), ['.html', '.json', '.svg', '.txt']));
  }

  const allFiles = [...srcFiles, ...otherFiles];
  const inventory = [];
  const localeMatches = [];

  for (const filePath of allFiles) {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    if (shouldIgnoreFile(relPath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Check Arabic characters
      if (ARABIC_REGEX.test(trimmed)) {
        const classification = classifyMatch(line, trimmed, relPath);
        inventory.push({
          file: relPath,
          line: lineNum,
          text: trimmed,
          type: classification,
        });
      }

      // Check hardcoded ar/ar-EG in date/number formatting
      if (/(?:toLocaleDateString|toLocaleString|toLocaleTimeString|Intl\.)\s*\([^)]*['"](?:ar|ar-EG|ar-SA)['"]/.test(trimmed)) {
        localeMatches.push({
          file: relPath,
          line: lineNum,
          text: trimmed,
          type: 'hardcoded-locale',
        });
      }
    });
  }

  // Summary counts
  const byType = {};
  for (const item of inventory) {
    byType[item.type] = (byType[item.type] || 0) + 1;
  }

  const byFile = {};
  for (const item of inventory) {
    byFile[item.file] = (byFile[item.file] || 0) + 1;
  }

  // Supabase audit data
  const supabaseAudit = [
    {
      table: 'site_settings',
      columns: ['site_name', 'site_name_ar', 'location', 'footer_text', 'promo_bar_text', 'seo_title', 'seo_description'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'site_name is English, site_name_ar is Arabic. All other text fields (location, footer_text, promo_bar_text, seo_*) are Arabic-only with no _en columns.'
    },
    {
      table: 'hero_content',
      columns: ['badge_text', 'headline_line1', 'rotating_words', 'headline_line2', 'subtitle', 'cta_primary', 'cta_secondary'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'All hero text columns and rotating_words array are Arabic-only with no _en columns.'
    },
    {
      table: 'features',
      columns: ['title', 'description'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. No title_en or description_en.'
    },
    {
      table: 'services',
      columns: ['title', 'description'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. No title_en or description_en.'
    },
    {
      table: 'portfolio_items',
      columns: ['title', 'category', 'description'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. No title_en, description_en, or category_en.'
    },
    {
      table: 'process_steps',
      columns: ['title', 'description'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. Used in Process section; causes step titles/descriptions to stay Arabic if fetched without language check.'
    },
    {
      table: 'pricing_plans',
      columns: ['name', 'tagline', 'features'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. Features array contains Arabic strings. No _en columns.'
    },
    {
      table: 'faqs',
      columns: ['question', 'answer'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. No question_en or answer_en.'
    },
    {
      table: 'testimonials',
      columns: ['client_name', 'role', 'company', 'content'],
      arOnly: true,
      hasEnColumn: false,
      notes: 'Arabic-only. No _en columns.'
    },
    {
      table: 'section_visibility',
      columns: ['id', 'label', 'visible'],
      arOnly: false,
      hasEnColumn: false,
      notes: 'Controls section visibility boolean. Label is admin-only.'
    }
  ];

  const output = {
    summary: {
      totalArabicLines: inventory.length,
      hardcodedLocaleCalls: localeMatches.length,
      byType,
      topFiles: Object.entries(byFile).sort((a,b)=>b[1]-a[1]).slice(0, 20),
    },
    supabaseAudit,
    localeMatches,
    items: inventory,
  };

  fs.writeFileSync(path.join(rootDir, 'scripts/inventory-report.json'), JSON.stringify(output, null, 2), 'utf8');

  // Write Markdown Report
  let md = '# تقرير جرد النصوص العربية والتنسيقات الإقليمية (Phase 1 Inventory Report)\n\n';
  md += `إجمالي الأسطر التي تحتوي على حروف عربية خارج \`src/i18n/\`: **${inventory.length}** سطر.\n`;
  md += `إجمالي استدعاءات التنسيق المثبتة على ar/ar-EG: **${localeMatches.length}** استدعاء.\n\n`;

  md += '## 1. التوزيع حسب النوع (Breakdown by Type)\n\n';
  md += '| نوع النص | العدد | الوصف |\n|---|---|---|\n';
  md += `| **UI ظاهر** | ${byType['UI ظاهر'] || 0} | نصوص JSX مباشرة، أزرار، عناوين، نصوص الـ Wizard، الباقات |\n`;
  md += `| **attribute** | ${byType['attribute'] || 0} | placeholder, aria-label, title, alt |\n`;
  md += `| **validation** | ${byType['validation'] || 0} | رسائل تحقق الحقول، تنبيهات Toast، رسائل الأخطاء |\n`;
  md += `| **data-from-DB** | ${byType['data-from-DB'] || 0} | بيانات احتياطية/افتراضية مطابقة لجداول قاعدة البيانات |\n`;
  md += `| **ثابت مقصود** | ${byType['ثابت مقصود'] || 0} | ثوابت كاسم البراند أو الهوية |\n`;
  md += `| **تعليق برمجي** | ${byType['تعليق برمجي (code comment)'] || 0} | تعليقات داخل الكود |\n\n`;

  md += '## 2. استدعاءات التنسيق المثبتة على ar/ar-EG (Hardcoded Locale Calls)\n\n';
  md += '| الملف | السطر | الكود الحالي |\n|---|---|---|\n';
  localeMatches.forEach(l => {
    md += `| \`${l.file}\` | ${l.line} | \`${l.text.replace(/\|/g, '\\|')}\` |\n`;
  });

  md += '\n## 3. جرد نصوص Supabase المعروضة للزائر (Supabase Tables & Columns Audit)\n\n';
  md += '| الجدول | الأعمدة المعروضة | هل النص عربي فقط؟ | هل يوجد عمود إنجليزي؟ | الملاحظات والتأثير |\n|---|---|---|---|---|\n';
  supabaseAudit.forEach(s => {
    md += `| \`${s.table}\` | \`${s.columns.join('`, `')}\` | ${s.arOnly ? 'نعم (عربي فقط)' : 'مختلط'} | ${s.hasEnColumn ? 'نعم' : 'لا يوجد'} | ${s.notes} |\n`;
  });

  md += '\n## 4. قائمة الملفات الأكثر احتواءً على نصوص عربية\n\n';
  md += '| الملف | عدد الأسطر العربية |\n|---|---|\n';
  Object.entries(byFile).sort((a,b)=>b[1]-a[1]).slice(0, 25).forEach(([f, c]) => {
    md += `| \`${f}\` | ${c} |\n`;
  });

  md += '\n## 5. الجدول الكامل للنصوص المكتشفة\n\n';
  md += '| # | الملف | السطر | النوع | النص المستخرج |\n|---|---|---|---|---|\n';
  inventory.forEach((item, i) => {
    const cleanText = item.text.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').substring(0, 90);
    md += `| ${i + 1} | \`${item.file}\` | ${item.line} | **${item.type}** | \`${cleanText}\` |\n`;
  });

  fs.writeFileSync(path.join(rootDir, 'scripts/inventory-report.md'), md, 'utf8');
  console.log('Markdown report generated at scripts/inventory-report.md');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
