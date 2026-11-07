import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

const SITE_URL = 'https://clickzoon.com';

async function loadLandingPages() {
  const tsFile = path.resolve('src/data/landingPages.ts');
  const transformed = esbuild.buildSync({
    entryPoints: [tsFile],
    write: false,
    format: 'esm',
    bundle: false,
  });
  const code = transformed.outputFiles[0].text;
  const base64 = Buffer.from(code).toString('base64');
  const mod = await import(`data:text/javascript;base64,${base64}`);
  return mod.landingPages;
}

export async function prerenderRoutes() {
  console.log('=== Starting Deterministic Vercel-Compatible Prerender ===');
  const templatePath = path.resolve('dist/index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Prerender Error: dist/index.html does not exist. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');
  const landingPages = await loadLandingPages();

  // List of routes to prerender
  const routes = [
    {
      slug: 'privacy',
      title: 'سياسة الخصوصية | Click Zoon',
      description: 'سياسة خصوصية Click Zoon: نلتزم بحماية بياناتك الشخصية وبيانات نشاطك التجاري بأعلى معايير الأمان والشفافية.',
      h1: 'سياسة الخصوصية وحماية البيانات',
      bodyHtml: `
        <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-navy-50">
          <h1 class="text-3xl lg:text-4xl font-extrabold mb-6">سياسة الخصوصية <span class="text-gradient-gold">Click Zoon</span></h1>
          <div class="space-y-6 text-navy-200 leading-relaxed">
            <section><h2 class="text-xl font-bold text-navy-50 mb-2">1. جمع البيانات</h2><p>نجمع البيانات الأساسية التي تقدمها طواعية عند طلب ديمو تجريبي أو التواصل معنا (الاسم، رقم الهاتف، نوع النشاط التجاري).</p></section>
            <section><h2 class="text-xl font-bold text-navy-50 mb-2">2. استخدام البيانات</h2><p>تُستخدم بياناتك فقط للتواصل المباشر معك بخصوص مشروعك وبناء نموذج الديمو، ولا يتم بيع أو مشاركة بياناتك مع أي طرف ثالث.</p></section>
            <section><h2 class="text-xl font-bold text-navy-50 mb-2">3. ملفات تعريف الارتباط والتحليلات</h2><p>نستخدم ملفات تعريف ارتباط مجهولة الهوية عبر Google Analytics بعد موافقتك الصريحة لتحسين أداء وسرعة الموقع.</p></section>
          </div>
        </main>`,
    },
    ...Object.values(landingPages).map((p) => ({
      slug: p.slug,
      title: `${p.metaTitle} | Click Zoon`,
      description: p.metaDescription,
      h1: p.h1,
      pageData: p,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: p.h1,
          description: p.metaDescription,
          provider: {
            '@type': 'ProfessionalService',
            name: 'Click Zoon',
            url: `${SITE_URL}/`,
            telephone: '+201020095059',
          },
          areaServed: {
            '@type': 'AdministrativeArea',
            name: 'المنصورة والدقهلية',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: p.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'الرئيسية',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: p.badge,
              item: `${SITE_URL}/${p.slug}`,
            },
          ],
        },
      ],
      bodyHtml: `
        <main class="min-h-screen bg-navy-900 text-navy-50 pt-28 pb-20">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <header class="text-center mb-16">
              <span class="inline-block px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-bold mb-6">${p.badge}</span>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">${p.h1}</h1>
              <p class="text-lg sm:text-xl text-navy-200 max-w-3xl mx-auto leading-relaxed">${p.heroSubtitle}</p>
            </header>
            <section class="mb-20">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-center mb-10">${p.painPointsTitle}</h2>
              <div class="grid md:grid-cols-3 gap-6">
                ${p.painPoints.map((item) => `<div class="glass-card p-6 rounded-2xl border border-red-500/20"><h3 class="text-lg font-bold text-red-300 mb-2">${item.title}</h3><p class="text-sm text-navy-200 leading-relaxed">${item.desc}</p></div>`).join('')}
              </div>
            </section>
            <section class="mb-20">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-center mb-10">${p.solutionsTitle}</h2>
              <div class="grid md:grid-cols-2 gap-6">
                ${p.solutions.map((item) => `<div class="glass-card p-6 rounded-2xl border border-gold-500/20"><h3 class="text-lg font-bold text-gold-300 mb-2">${item.title}</h3><p class="text-sm text-navy-200 leading-relaxed">${item.desc}</p></div>`).join('')}
              </div>
            </section>
            <section class="mb-20">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-center mb-10">الأسئلة الشائعة</h2>
              <div class="space-y-4 max-w-3xl mx-auto">
                ${p.faqs.map((f) => `<div class="glass-card p-6 rounded-2xl border border-navy-700"><h3 class="font-bold text-navy-50 mb-2">${f.q}</h3><p class="text-sm text-navy-300 leading-relaxed">${f.a}</p></div>`).join('')}
              </div>
            </section>
            <section class="text-center glass-card p-10 rounded-3xl border border-gold-500/30">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-navy-50 mb-4">${p.ctaHeading}</h2>
              <p class="text-navy-300 max-w-2xl mx-auto mb-8">${p.ctaText}</p>
            </section>
          </div>
        </main>`,
    })),
  ];

  try {
    for (const r of routes) {
      console.log(`Prerendering route: /${r.slug}`);
      let html = baseHtml;

      // 1. Replace Title
      html = html.replace(/<title>.*?<\/title>/s, `<title>${r.title}</title>`);

      // 2. Replace Meta Description
      html = html.replace(
        /<meta name="description" content=".*?" \/>/s,
        `<meta name="description" content="${r.description}" />`
      );

      // 3. Replace Canonical
      const canonicalUrl = `${SITE_URL}/${r.slug}`;
      html = html.replace(
        /<link rel="canonical" href=".*?" \/>/s,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );

      // 4. Replace OpenGraph
      html = html.replace(/<meta property="og:title" content=".*?" \/>/s, `<meta property="og:title" content="${r.title}" />`);
      html = html.replace(/<meta property="og:description" content=".*?" \/>/s, `<meta property="og:description" content="${r.description}" />`);
      html = html.replace(/<meta property="og:url" content=".*?" \/>/s, `<meta property="og:url" content="${canonicalUrl}" />`);

      // 5. Replace Twitter
      html = html.replace(/<meta name="twitter:title" content=".*?" \/>/s, `<meta name="twitter:title" content="${r.title}" />`);
      html = html.replace(/<meta name="twitter:description" content=".*?" \/>/s, `<meta name="twitter:description" content="${r.description}" />`);

      // 6. Inject specific JSON-LD schema if provided
      if (r.jsonLd) {
        const jsonLdSnippet = `<script type="application/ld+json">\n${JSON.stringify(r.jsonLd, null, 2)}\n</script>`;
        html = html.replace('</head>', `${jsonLdSnippet}\n</head>`);
      }

      // 7. Inject Semantic Static HTML inside <div id="root">
      if (r.bodyHtml) {
        html = html.replace(
          /<div id="root">[\s\S]*?<\/div>\s*<\/div>/,
          `<div id="root">\n${r.bodyHtml.trim()}\n    </div>`
        );
      }

      const outDir = path.resolve('dist', r.slug);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const outFile = path.join(outDir, 'index.html');
      fs.writeFileSync(outFile, html, 'utf8');
      console.log(`Saved static HTML to ${outFile} (${(html.length / 1024).toFixed(1)} KB)`);
    }

    console.log('✅ Deterministic Prerender completed successfully for all routes.');
  } catch (err) {
    console.error('❌ Prerender execution failed:', err);
    process.exit(1);
  }
}

prerenderRoutes().catch((err) => {
  console.error('Prerender fatal:', err);
  process.exit(1);
});
