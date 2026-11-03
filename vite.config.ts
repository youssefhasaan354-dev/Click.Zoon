import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';

function siteSeoPlugin(siteUrl: string): Plugin {
  const writeFiles = () => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth
Disallow: /account
Disallow: /my-requests

Sitemap: ${siteUrl}/sitemap.xml
`;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>2026-11-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar-EG" href="${siteUrl}/" />
  </url>
  <url>
    <loc>${siteUrl}/privacy</loc>
    <lastmod>2026-11-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="ar-EG" href="${siteUrl}/privacy" />
  </url>
</urlset>
`;
    try {
      const robotsPath = fileURLToPath(new URL('./public/robots.txt', import.meta.url));
      const sitemapPath = fileURLToPath(new URL('./public/sitemap.xml', import.meta.url));
      fs.writeFileSync(robotsPath, robots, 'utf-8');
      fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
    } catch (err) {
      console.warn('Could not write robots.txt or sitemap.xml:', err);
    }
  };

  return {
    name: 'site-seo-plugin',
    configResolved() {
      writeFiles();
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        return html.replace(/%SITE_URL%/g, siteUrl);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || process.env.VITE_SITE_URL || 'https://click-zoon.vercel.app')
    .trim()
    .replace(/\/+$/, '');

  return {
    plugins: [react(), siteSeoPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-motion': ['framer-motion'],
          },
        },
      },
    },
  };
});
