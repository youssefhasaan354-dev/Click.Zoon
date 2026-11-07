import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runLighthouse(reportName = 'lighthouse-report.json') {
  console.log('--- Starting Lighthouse Mobile Audit ---');

  // 1. Launch Vite preview server
  const preview = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', '4173'],
    { stdio: 'pipe' }
  );

  let ready = false;
  preview.stdout.on('data', (d) => {
    if (d.toString().includes('4173') || d.toString().includes('Local:')) {
      ready = true;
    }
  });

  for (let i = 0; i < 30; i++) {
    if (ready) break;
    await sleep(200);
  }

  const reportPath = path.resolve(reportName);

  try {
    const cmd = [
      'npx --yes lighthouse http://localhost:4173/',
      '--output=json',
      `--output-path="${reportPath}"`,
      '--chrome-flags="--headless=new --no-sandbox --disable-gpu"',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--throttling-method=simulate',
      '--quiet',
    ].join(' ');

    console.log('Running Lighthouse CLI (mobile)...');
    execSync(cmd, { stdio: 'inherit', shell: true });

    if (fs.existsSync(reportPath)) {
      const raw = fs.readFileSync(reportPath, 'utf8');
      const data = JSON.parse(raw);
      const cats = data.categories;
      const audits = data.audits;

      const summary = {
        performance: Math.round(cats.performance.score * 100),
        accessibility: Math.round(cats.accessibility.score * 100),
        bestPractices: Math.round(cats['best-practices'].score * 100),
        seo: Math.round(cats.seo.score * 100),
        fcp: audits['first-contentful-paint'].displayValue,
        lcp: audits['largest-contentful-paint'].displayValue,
        tbt: audits['total-blocking-time'].displayValue,
        cls: audits['cumulative-layout-shift'].displayValue,
        speedIndex: audits['speed-index'].displayValue,
      };

      console.log('\n📊 === Lighthouse Results ===');
      console.log(`- Performance:    ${summary.performance}/100`);
      console.log(`- Accessibility:  ${summary.accessibility}/100`);
      console.log(`- Best Practices: ${summary.bestPractices}/100`);
      console.log(`- SEO:            ${summary.seo}/100`);
      console.log(`- LCP:            ${summary.lcp}`);
      console.log(`- TBT:            ${summary.tbt}`);
      console.log(`- CLS:            ${summary.cls}`);
      console.log(`- FCP:            ${summary.fcp}`);
      console.log(`- Speed Index:    ${summary.speedIndex}\n`);

      return summary;
    }
  } finally {
    preview.kill();
  }
}

runLighthouse().catch((err) => {
  console.error('Lighthouse execution failed:', err);
  process.exit(1);
});

