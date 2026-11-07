// scripts/prerender.mjs
// Post-build prerender script for Click Zoon
// Generates static HTML files for /, /showcase, /privacy, and all /showcase/:slug
// with route-specific Title, Description, Canonical, OG Tags, JSON-LD, and crawlable markup.
// Also generates a dynamic sitemap.xml including all showcase projects.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');

// Read siteUrl from env with fallback to clickzoon.com
const siteUrl = (
  process.env.VITE_SITE_URL ||
  'https://clickzoon.com'
).trim().replace(/\/+$/, '');

// Static fallback projects if database is not reachable at build time
const defaultProjects = [
  {
    slug: 'sample-restaurant',
    title: 'موقع مطعم',
    kind: 'موقع',
    category: 'مطاعم',
    tagline: 'منيو إلكتروني وطلب عبر واتساب',
    description: 'نموذج تصميم لمطعم مع منيو إلكتروني QR وحجز طاولات.',
    image_url: '/mockups/mockup-1-restaurant.webp',
  },
  {
    slug: 'sample-cafe',
    title: 'موقع كافيه',
    kind: 'موقع',
    category: 'كافيهات',
    tagline: 'هوية دافئة ومنيو تفاعلي',
    description: 'نموذج تصميم لكافيه بمنيو تفاعلي وصور جذابة وربط مباشر مع السوشيال ميديا.',
    image_url: '/mockups/mockup-2-cafe.webp',
  },
  {
    slug: 'sample-store',
    title: 'متجر إلكتروني',
    kind: 'متجر إلكتروني',
    category: 'متاجر',
    tagline: 'بيع أونلاين بدفع وشحن',
    description: 'نموذج متجر إلكتروني مع سلة مشتريات وربط بوابات الدفع الإلكتروني والشحن.',
    image_url: '/mockups/mockup-3-store.webp',
  },
  {
    slug: 'sample-clinic',
    title: 'موقع عيادة',
    kind: 'موقع',
    category: 'طبي',
    tagline: 'حجز مواعيد وجداول الأطباء',
    description: 'نموذج موقع طبي بحجز مواعيد إلكتروني وتأكيد فوري عبر واتساب.',
    image_url: '/mockups/mockup-4-medical.webp',
  },
];

async function fetchProjects() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/portfolio_items?select=id,slug,title,kind,category,tagline,description,image_url,visible&order=sort_order.asc`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const active = (data || []).filter((p) => p.visible !== false && p.slug);
        if (active.length > 0) {
          console.log(`[Prerender] Fetched ${active.length} projects from Supabase database.`);
          return active;
        }
      }
    } catch (err) {
      console.warn('[Prerender] Database fetch skipped, using sample projects:', err.message);
    }
  }
  return defaultProjects;
}

function generateSitemap(projects) {
  const today = new Date().toISOString().slice(0, 10);
  // Exclude sample/fallback mockups whose slug starts with sample-
  const indexableProjects = projects.filter((p) => p.slug && !p.slug.startsWith('sample-'));
  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${siteUrl}/showcase`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/privacy`, priority: '0.3', changefreq: 'monthly' },
    ...indexableProjects.map((p) => ({
      loc: `${siteUrl}/showcase/${p.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar-EG" href="${u.loc}" />
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8');
  try {
    fs.writeFileSync(path.join(projectRoot, 'public', 'sitemap.xml'), xml, 'utf-8');
  } catch {
    // ignore
  }
  console.log(`[Prerender] Generated sitemap.xml with ${urls.length} routes.`);
}

function generateRobots() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /account
Disallow: /my-requests

Sitemap: ${siteUrl}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robots, 'utf-8');
  try {
    fs.writeFileSync(path.join(projectRoot, 'public', 'robots.txt'), robots, 'utf-8');
  } catch {
    // ignore
  }
  console.log('[Prerender] Generated robots.txt.');
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtml({
  template,
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  noIndex = false,
  jsonLd,
  bodyContent,
}) {
  const fullUrl = `${siteUrl}${canonicalPath}`;
  const fullOgImage = ogImage?.startsWith('http') ? ogImage : `${siteUrl}${ogImage || '/og-image.webp'}`;

  let html = template;

  if (noIndex) {
    if (html.includes('<meta name="robots"')) {
      html = html.replace(/<meta name="robots" content=".*?" \/>/, '<meta name="robots" content="noindex, follow" />');
    } else {
      html = html.replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>');
    }
  }

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // Replace or inject Description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Canonical
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${fullUrl}" />`
  );

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${fullUrl}" />`
  );
  html = html.replace(
    /<meta property="og:image" content=".*?" \/>/,
    `<meta property="og:image" content="${fullOgImage}" />`
  );
  html = html.replace(
    /<meta property="og:type" content=".*?" \/>/,
    `<meta property="og:type" content="${ogType}" />`
  );

  // Twitter
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content=".*?" \/>/,
    `<meta name="twitter:image" content="${fullOgImage}" />`
  );

  // JSON-LD injection before </head>
  if (jsonLd) {
    const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(
      jsonLd,
      null,
      2
    )}\n    </script>\n  </head>`;
    html = html.replace('</head>', jsonLdScript);
  }

  // Pre-rendered root content for crawlability before JS hydration
  if (bodyContent) {
    const rootBlockPattern = /<div id="root">[\s\S]*?<\/div>\s*(?=\s*<!-- Noscript)/;
    const prerenderedRoot = `<div id="root">\n${bodyContent}\n    </div>`;
    html = html.replace(rootBlockPattern, prerenderedRoot);
  }

  return html;
}

async function runPrerender() {
  if (!fs.existsSync(distDir)) {
    console.error('[Prerender] Error: dist/ directory not found. Run vite build first.');
    process.exit(1);
  }

  const templatePath = path.join(distDir, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  const projects = await fetchProjects();

  // 1. Sitemap and Robots
  generateSitemap(projects);
  generateRobots();

  // 2. Prerender /showcase
  const showcaseDir = path.join(distDir, 'showcase');
  fs.mkdirSync(showcaseDir, { recursive: true });

  const showcaseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'معرض الأعمال | Click Zoon',
    description: 'تصفح المواقع والمتاجر والبرامج الجاهزة التي صممتها ونفذتها وكالة كليك زون.',
    url: `${siteUrl}/showcase`,
    publisher: {
      '@type': 'Organization',
      name: 'Click Zoon',
      url: `${siteUrl}/`,
    },
  };

  const showcaseHtml = renderHtml({
    template,
    title: 'معرض الأعمال: مواقع وبرامج جاهزة | Click Zoon',
    description: 'تصفح نماذج المواقع والبرامج والمتاجر الإلكترونية الجاهزة من كليك زون واطلب نموذج مماثل لنشاطك التجاري.',
    canonicalPath: '/showcase',
    jsonLd: showcaseJsonLd,
    bodyContent: `      <div style="background-color:#0a1628;color:#e8edf5;padding:60px 20px;text-align:center;font-family:'Cairo',sans-serif;" dir="rtl">
        <h1 style="font-size:2.2rem;font-weight:800;color:#efc95e;margin-bottom:1rem;">معرض الأعمال — Click Zoon</h1>
        <p style="font-size:1.15rem;color:#9bafc9;max-width:760px;margin:0 auto 2rem;line-height:1.7;">
          مواقع وبرامج جاهزة. افتح أي مشروع، شوف صوره ورابطه، واطلبه لنشاطك بضغطة واحدة.
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:960px;margin:0 auto;">
          ${projects
            .map(
              (p) =>
                `<div style="background:#10223d;border:1px solid #1c355e;border-radius:12px;padding:16px;width:280px;text-align:right;">
                  <h2 style="font-size:1.1rem;font-weight:bold;color:#fff;margin-bottom:6px;">${escapeHtml(p.title)}</h2>
                  <p style="font-size:0.85rem;color:#9bafc9;margin-bottom:12px;">${escapeHtml(p.tagline || p.description)}</p>
                  <a href="/showcase/${escapeHtml(p.slug)}" style="color:#efc95e;font-weight:bold;text-decoration:none;font-size:0.85rem;">عرض التفاصيل والطلب &larr;</a>
                </div>`
            )
            .join('\n          ')}
        </div>
      </div>`,
  });

  fs.writeFileSync(path.join(showcaseDir, 'index.html'), showcaseHtml, 'utf-8');
  console.log('[Prerender] Wrote dist/showcase/index.html');

  // 3. Prerender /privacy
  const privacyDir = path.join(distDir, 'privacy');
  fs.mkdirSync(privacyDir, { recursive: true });

  const privacyHtml = renderHtml({
    template,
    title: 'سياسة الخصوصية | Click Zoon',
    description: 'سياسة الخصوصية وحماية بيانات العملاء والزوار في وكالة Click Zoon لتصميم وتطوير المواقع.',
    canonicalPath: '/privacy',
    bodyContent: `      <div style="background-color:#0a1628;color:#e8edf5;padding:60px 20px;text-align:center;font-family:'Cairo',sans-serif;" dir="rtl">
        <h1 style="font-size:2.2rem;font-weight:800;color:#efc95e;margin-bottom:1rem;">سياسة الخصوصية — Click Zoon</h1>
        <p style="font-size:1.1rem;color:#9bafc9;max-width:760px;margin:0 auto 1.5rem;line-height:1.7;">
          نلتزم في كليك زون بحماية خصوصية بياناتك وتشفيرها وعدم مشاركتها مع أي طرف ثالث بأي شكل.
        </p>
        <a href="/" style="color:#efc95e;font-weight:bold;text-decoration:underline;">العودة للصفحة الرئيسية</a>
      </div>`,
  });

  fs.writeFileSync(path.join(privacyDir, 'index.html'), privacyHtml, 'utf-8');
  console.log('[Prerender] Wrote dist/privacy/index.html');

  // 4. Prerender each /showcase/:slug
  for (const project of projects) {
    const slugDir = path.join(showcaseDir, project.slug);
    fs.mkdirSync(slugDir, { recursive: true });

    const isSample = Boolean(project.slug && project.slug.startsWith('sample-'));
    const isApp = project.kind === 'app' || project.kind === 'برنامج';
    const projectJsonLd = {
      '@context': 'https://schema.org',
      '@type': isApp ? 'SoftwareApplication' : 'CreativeWork',
      name: project.title,
      headline: project.tagline || project.title,
      description: project.description,
      image: project.image_url?.startsWith('http') ? project.image_url : `${siteUrl}${project.image_url || '/og-image.webp'}`,
      url: `${siteUrl}/showcase/${project.slug}`,
      creator: {
        '@type': 'Organization',
        name: 'Click Zoon',
        url: `${siteUrl}/`,
      },
      ...(isApp ? { applicationCategory: 'BusinessApplication', operatingSystem: 'All' } : {}),
    };

    const projectHtml = renderHtml({
      template,
      title: `${project.title} | نماذج أعمال Click Zoon`,
      description: project.tagline ? `${project.tagline} — ${project.description}` : project.description,
      canonicalPath: `/showcase/${project.slug}`,
      ogImage: project.image_url,
      noIndex: isSample,
      jsonLd: projectJsonLd,
      bodyContent: `      <div style="background-color:#0a1628;color:#e8edf5;padding:60px 20px;text-align:center;font-family:'Cairo',sans-serif;" dir="rtl">
        <h1 style="font-size:2.2rem;font-weight:800;color:#efc95e;margin-bottom:1rem;">${escapeHtml(project.title)}</h1>
        <p style="font-size:1.15rem;color:#cbd5e1;max-width:760px;margin:0 auto 1.5rem;line-height:1.7;">
          ${escapeHtml(project.tagline || project.description)}
        </p>
        <p style="font-size:1rem;color:#9bafc9;max-width:760px;margin:0 auto 2rem;line-height:1.7;">
          ${escapeHtml(project.description)}
        </p>
        <a href="/showcase" style="color:#efc95e;font-weight:bold;margin:0 10px;text-decoration:none;">&larr; كل الأعمال</a>
        <a href="/" style="color:#9bafc9;margin:0 10px;text-decoration:none;">الرئيسية</a>
      </div>`,
    });

    fs.writeFileSync(path.join(slugDir, 'index.html'), projectHtml, 'utf-8');
    console.log(`[Prerender] Wrote dist/showcase/${project.slug}/index.html`);
  }

  console.log('[Prerender] Successfully finished prerendering all public routes.');
}

runPrerender();
