import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.join(rootDir, 'docs/screenshots/en');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method && this.eventListeners.has(msg.method)) {
          const cbs = this.eventListeners.get(msg.method);
          cbs.forEach((cb) => cb(msg.params));
        }
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
          else res(msg.result);
        }
      };
    });
  }

  on(method, cb) {
    if (!this.eventListeners.has(method)) {
      this.eventListeners.set(method, []);
    }
    this.eventListeners.get(method).push(cb);
  }

  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.id++;
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'Eval error');
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function waitHttp(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

const scannerFunction = `(() => {
  const arabicRegex = /[\\u0600-\\u06FF]/;
  const violations = [];

  function isExempt(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (el.tagName === 'NOSCRIPT' || (el.closest && el.closest('noscript'))) return true;
    if (el.getAttribute('lang') === 'ar' || (el.closest && el.closest('[lang="ar"]'))) return true;
    if (el.getAttribute('translate') === 'no') return true;
    if (el.classList && el.classList.contains('notranslate')) return true;
    if (el.getAttribute('data-i18n-exempt') !== null) return true;
    return isExempt(el.parentElement);
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue ? node.nodeValue.trim() : '';
    if (!text || !arabicRegex.test(text)) continue;

    const parent = node.parentElement;
    if (isExempt(parent)) continue;

    let selector = parent.tagName.toLowerCase();
    if (parent.id) selector += '#' + parent.id;
    else if (parent.className && typeof parent.className === 'string') {
      selector += '.' + parent.className.trim().split(/\\s+/).slice(0, 2).join('.');
    }

    violations.push({
      selector,
      text: text.substring(0, 100),
      tag: parent.tagName,
    });
  }

  return violations;
})()`;

async function run() {
  console.log('=== Starting Browser Verification for AR & EN Locales ===');

  let previewProc = null;
  try {
    const res = await fetch('http://127.0.0.1:4173/');
    if (res.ok) {
      console.log('Preview server already running on port 4173.');
    }
  } catch {
    console.log('Launching Vite Preview...');
    const viteBin = path.join(rootDir, 'node_modules/vite/bin/vite.js');
    previewProc = spawn(process.execPath, [viteBin, 'preview', '--port', '4173', '--host', '127.0.0.1', '--strictPort'], {
      cwd: rootDir,
      stdio: 'pipe',
    });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProfile = path.join(rootDir, 'temp_chrome_verify');
  if (fs.existsSync(chromeProfile)) {
    try {
      fs.rmSync(chromeProfile, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  const chromeProc = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${chromeProfile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-gpu',
      '--window-size=1280,900',
    ],
    { stdio: 'ignore' }
  );

  let cdp;
  const auditResults = {
    totalViolations: 0,
    arabicMode: null,
    sections: [],
    pages: [],
    modals: [],
    wizardSteps: [],
  };

  try {
    console.log('Waiting for preview server on port 4173 and Chrome on 9222...');
    await waitHttp('http://127.0.0.1:4173');
    await waitHttp('http://127.0.0.1:9222/json/version');

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find((t) => t.type === 'page') || tabs[0];
    const targetWsUrl = pageTab?.webSocketDebuggerUrl;
    if (!targetWsUrl) throw new Error('No target debugger URL found');

    cdp = new CdpClient(targetWsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('Connected to Chrome via CDP on page tab:', pageTab.id);

    const navigateAndWait = async (url) => {
      await cdp.send('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, 1200));
    };

    // =========================================================
    // PART 1: ARABIC DEFAULT MODE VERIFICATION
    // =========================================================
    console.log('\n--- 1. Testing Arabic Mode (Default) ---');
    await navigateAndWait('http://127.0.0.1:4173/');
    await cdp.eval(`localStorage.setItem('cz_lang', 'ar')`);
    await cdp.send('Page.reload');
    await new Promise((r) => setTimeout(r, 1200));

    const arLang = await cdp.eval('document.documentElement.lang');
    const arDir = await cdp.eval('document.documentElement.dir');
    const arTitle = await cdp.eval('document.title');
    console.log(`Arabic Mode: lang="${arLang}", dir="${arDir}", title="${arTitle}"`);

    if (arLang !== 'ar' || arDir !== 'rtl') {
      throw new Error(`Arabic mode mismatch: expected lang="ar" dir="rtl", got lang="${arLang}" dir="${arDir}"`);
    }

    const arShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(rootDir, 'docs/screenshots/00-desktop-home-ar.png'), Buffer.from(arShot.data, 'base64'));
    console.log('Saved screenshot: docs/screenshots/00-desktop-home-ar.png');

    auditResults.arabicMode = {
      lang: arLang,
      dir: arDir,
      title: arTitle,
      verified: true,
    };

    // =========================================================
    // PART 2: ENGLISH MODE & AUDIT
    // =========================================================
    console.log('\n--- 2. Testing English Mode & Scanning for Arabic Leaks ---');
    await cdp.eval(`localStorage.setItem('cz_lang', 'en')`);
    await cdp.send('Page.reload');
    await new Promise((r) => setTimeout(r, 1200));

    const enLang = await cdp.eval('document.documentElement.lang');
    const enDir = await cdp.eval('document.documentElement.dir');
    const enTitle = await cdp.eval('document.title');
    console.log(`English Mode: lang="${enLang}", dir="${enDir}", title="${enTitle}"`);

    if (enLang !== 'en' || enDir !== 'ltr') {
      throw new Error(`English mode mismatch: expected lang="en" dir="ltr", got lang="${enLang}" dir="${enDir}"`);
    }

    // Step B: Capture Desktop Viewport (1280px)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise((r) => setTimeout(r, 500));

    const homeShot1280 = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '01-desktop-home-hero.png'), Buffer.from(homeShot1280.data, 'base64'));
    console.log('Saved screenshot: 01-desktop-home-hero.png');

    const homeViolations = await cdp.eval(scannerFunction);
    console.log(`Homepage unexpected Arabic text nodes (Desktop): ${homeViolations.length}`);
    if (homeViolations.length > 0) {
      console.log('Violations on homepage:', homeViolations);
    }
    auditResults.sections.push({ section: 'homepage_desktop', violations: homeViolations });
    auditResults.totalViolations += homeViolations.length;

    // Step C: Section by Section Desktop Screenshots
    const sectionsToInspect = [
      { id: 'hero', name: '02-desktop-hero', selector: 'header + section, main > section:first-of-type' },
      { id: 'marquee', name: '03-desktop-marquee', selector: 'section[aria-label*="Partners"], section[aria-label*="شركاء"]' },
      { id: 'process', name: '04-desktop-process', selector: '#process' },
      { id: 'mockups', name: '05-desktop-mockups', selector: '#mockups' },
      { id: 'services', name: '06-desktop-services', selector: '#services' },
      { id: 'transformation', name: '07-desktop-before-after', selector: '#transformation' },
      { id: 'why-us', name: '08-desktop-why-us', selector: '#why-us' },
      { id: 'pricing', name: '09-desktop-pricing', selector: '#pricing' },
      { id: 'faq', name: '10-desktop-faq', selector: '#faq' },
      { id: 'wizard', name: '11-desktop-wizard', selector: '#wizard' },
      { id: 'contact', name: '12-desktop-contact', selector: '#contact' },
    ];

    for (const sec of sectionsToInspect) {
      const exists = await cdp.eval(`Boolean(document.querySelector('${sec.selector}'))`);
      if (exists) {
        await cdp.eval(`(() => {
          const el = document.querySelector('${sec.selector}');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        })()`);
        await new Promise((r) => setTimeout(r, 400));
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(screenshotsDir, `${sec.name}.png`), Buffer.from(shot.data, 'base64'));
      }
    }

    // Step D: Mobile Viewport (390px)
    console.log('\n--- Mobile Viewport (390px) Audit ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 500));

    await cdp.eval('window.scrollTo(0, 0)');
    await new Promise((r) => setTimeout(r, 300));

    const mobileHeroShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '13-mobile-hero.png'), Buffer.from(mobileHeroShot.data, 'base64'));

    await cdp.eval(`(() => {
      const el = document.getElementById('process');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await new Promise((r) => setTimeout(r, 400));
    const mobileProcessShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '14-mobile-process.png'), Buffer.from(mobileProcessShot.data, 'base64'));

    await cdp.eval(`(() => {
      const el = document.getElementById('mockups');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await new Promise((r) => setTimeout(r, 400));
    const mobileMockupsShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '15-mobile-mockups.png'), Buffer.from(mobileMockupsShot.data, 'base64'));

    // Step E: Walk QuoteWizard Steps (1 to 4)
    console.log('\n--- QuoteWizard All 4 Steps Walkthrough ---');
    await cdp.eval(`(() => {
      const el = document.getElementById('wizard');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`);
    await new Promise((r) => setTimeout(r, 400));

    for (let step = 1; step <= 4; step++) {
      const stepViolations = await cdp.eval(scannerFunction);
      console.log(`Wizard Step ${step} unexpected Arabic nodes: ${stepViolations.length}`);
      if (stepViolations.length > 0) {
        console.log(`Violations in step ${step}:`, stepViolations);
      }
      auditResults.wizardSteps.push({ step, violations: stepViolations });
      auditResults.totalViolations += stepViolations.length;

      const wShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(screenshotsDir, `16-wizard-step-${step}.png`), Buffer.from(wShot.data, 'base64'));

      if (step < 4) {
        await cdp.eval(`(() => {
          const optionBtn = document.querySelector('#wizard button[role="radio"], #wizard input[type="radio"], #wizard button.group');
          if (optionBtn) optionBtn.click();
          const nextBtn = Array.from(document.querySelectorAll('#wizard button')).find(b => b.textContent && (b.textContent.includes('Next') || b.textContent.includes('التالي')));
          if (nextBtn) nextBtn.click();
        })()`);
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // Step F: Modals (OrderModal)
    console.log('\n--- Modals Audit ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await navigateAndWait('http://127.0.0.1:4173/showcase/sample-restaurant');

    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Order') || b.textContent.includes('اطلب')));
      if (btn) btn.click();
    })()`);
    await new Promise((r) => setTimeout(r, 600));

    const orderModalViolations = await cdp.eval(scannerFunction);
    console.log(`OrderModal unexpected Arabic nodes: ${orderModalViolations.length}`);
    if (orderModalViolations.length > 0) {
      console.log('Violations in OrderModal:', orderModalViolations);
    }
    auditResults.modals.push({ modal: 'OrderModal', violations: orderModalViolations });
    auditResults.totalViolations += orderModalViolations.length;

    const orderModalShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(screenshotsDir, '17-modal-order.png'), Buffer.from(orderModalShot.data, 'base64'));

    // Step G: Secondary Pages Audit
    console.log('\n--- Secondary Pages Audit ---');
    const secondaryPages = [
      { name: 'showcase', url: 'http://127.0.0.1:4173/showcase', file: '18-page-showcase.png' },
      { name: 'showcase-app', url: 'http://127.0.0.1:4173/showcase/sample-restaurant', file: '19-page-showcase-app.png' },
      { name: 'privacy', url: 'http://127.0.0.1:4173/privacy', file: '20-page-privacy.png' },
      { name: 'case-study-delano', url: 'http://127.0.0.1:4173/work/delano-cafe', file: '21-page-case-study.png' },
      { name: 'landing-restaurant-mansoura', url: 'http://127.0.0.1:4173/restaurant-website-mansoura', file: '22-page-mansoura-restaurant.png' },
    ];

    for (const page of secondaryPages) {
      await navigateAndWait(page.url);

      const pageViolations = await cdp.eval(scannerFunction);
      console.log(`Page "${page.name}" unexpected Arabic nodes: ${pageViolations.length}`);
      if (pageViolations.length > 0) {
        console.log(`Violations on ${page.name}:`, pageViolations);
      }
      auditResults.pages.push({ page: page.name, violations: pageViolations });
      auditResults.totalViolations += pageViolations.length;

      const pShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(screenshotsDir, page.file), Buffer.from(pShot.data, 'base64'));
    }

    console.log('\n======================================================');
    console.log(`FINAL RESULT: Total Unexpected Arabic Text Nodes: ${auditResults.totalViolations}`);
    console.log('======================================================\n');

    fs.writeFileSync(path.join(rootDir, 'scripts/browser-audit-result.json'), JSON.stringify(auditResults, null, 2));

    if (auditResults.totalViolations > 0) {
      throw new Error(`Browser audit detected ${auditResults.totalViolations} Arabic violations in English mode!`);
    }

    console.log('SUCCESS: Both Arabic and English locales passed with 0 violations!');
  } finally {
    if (cdp) cdp.close();
    try {
      chromeProc.kill();
    } catch {
      // ignore
    }
    if (previewProc) {
      try {
        previewProc.kill();
      } catch {
        // ignore
      }
    }
    try {
      fs.rmSync(chromeProfile, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
