import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('public/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Simple CDP client using native fetch + WebSocket (Node 24)
class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        } else if (msg.method) {
          const listeners = this.eventListeners.get(msg.method) || [];
          listeners.forEach((fn) => fn(msg.params));
        }
      };
    });
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((res, rej) => {
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('--- Starting Phase 0 Browser Verification ---');

  const errors = [];
  const warnings = [];

  // 1. Build and preview server
  console.log('Launching Vite preview server...');
  const preview = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--port', '4173'],
    { stdio: 'pipe' }
  );

  // Wait for preview server to be ready
  let serverReady = false;
  preview.stdout.on('data', (d) => {
    const text = d.toString();
    if (text.includes('4173') || text.includes('Local:')) {
      serverReady = true;
    }
  });

  for (let i = 0; i < 30; i++) {
    if (serverReady) break;
    await sleep(200);
  }

  // 2. Launch Chrome Headless
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve('temp_chrome_profile');
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  console.log('Launching Headless Chrome on debug port 9222...');
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--remote-debugging-port=9222',
      `--user-data-dir=${userDataDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-features=Translate', // don't auto translate, let test control it
    ],
    { stdio: 'ignore' }
  );

  await sleep(1500);

  let cdp = null;
  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionJson = await versionRes.json();
    const webSocketDebuggerUrl = versionJson.webSocketDebuggerUrl;

    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('Connected to Chrome DevTools Protocol!');

    // Enable domains
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');

    // Collect console & CSP errors
    cdp.on('Runtime.consoleAPICalled', (params) => {
      const text = params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
      if (params.type === 'error') {
        errors.push(`[Console Error] ${text}`);
      } else if (params.type === 'warning') {
        warnings.push(`[Console Warn] ${text}`);
      }
    });

    cdp.on('Log.entryAdded', (params) => {
      if (params.entry.level === 'error') {
        errors.push(`[Browser Error] ${params.entry.text}`);
      }
    });

    // Helper for viewport and screenshot
    const captureScreen = async (width, height, filename) => {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: width < 768,
      });
      await sleep(400);
      const res = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`Saved screenshot: ${filePath} (${width}x${height})`);
    };

    // A. Arabic Version (Default)
    console.log('Navigating to Arabic site...');
    await cdp.send('Page.navigate', { url: 'http://localhost:4173/' });
    await sleep(2000);

    // Verify lang & dir
    const arAttrs = await cdp.send('Runtime.evaluate', {
      expression: `({ lang: document.documentElement.lang, dir: document.documentElement.dir })`,
      returnByValue: true,
    });
    console.log('Arabic HTML attributes:', arAttrs.result.value);

    // Capture screenshots for AR
    await captureScreen(1280, 800, 'ar-desktop-1280.png');
    await captureScreen(768, 1024, 'ar-tablet-768.png');
    await captureScreen(390, 844, 'ar-mobile-390.png');

    // B. English Version
    console.log('Switching to English...');
    await cdp.send('Runtime.evaluate', {
      expression: `window.__setLang ? window.__setLang('en') : (localStorage.setItem('cz_lang', 'en'), location.reload())`,
    });
    await sleep(2000);

    const enAttrs = await cdp.send('Runtime.evaluate', {
      expression: `({ lang: document.documentElement.lang, dir: document.documentElement.dir })`,
      returnByValue: true,
    });
    console.log('English HTML attributes:', enAttrs.result.value);

    // Capture screenshots for EN
    await captureScreen(1280, 800, 'en-desktop-1280.png');
    await captureScreen(768, 1024, 'en-tablet-768.png');
    await captureScreen(390, 844, 'en-mobile-390.png');

    // C. Test Modals and Interactive Features
    console.log('Testing interactive widgets & modals...');
    const interactRes = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const errors = [];
        try {
          // Check rotating word container has translate="no"
          const heroWord = document.querySelector('.notranslate[translate="no"]');
          if (!heroWord) errors.push('Rotating hero word missing translate="no"');
        } catch (e) {
          errors.push(e.message);
        }
        return { errors, title: document.title };
      })()`,
      returnByValue: true,
    });
    console.log('Interaction test result:', interactRes.result.value);

    // D. Test Google Translate Widget Trigger in Arabic
    console.log('Testing Google Translate trigger...');
    // Reset to Arabic first
    await cdp.send('Runtime.evaluate', {
      expression: `localStorage.setItem('cz_lang', 'ar')`,
    });
    await cdp.send('Page.navigate', { url: 'http://localhost:4173/' });
    await sleep(2000);

    const gtResult = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        // Open language dropdown
        const trigger = document.querySelector('button[aria-haspopup="true"]');
        if (!trigger) return { success: false, reason: 'trigger button not found' };
        trigger.click();
        await new Promise(r => setTimeout(r, 600));

        // Find "لغات أخرى" button
        const allButtons = Array.from(document.querySelectorAll('button'));
        const moreBtn = allButtons.find(b => b.textContent && b.textContent.includes('لغات أخرى'));
        if (!moreBtn) return { success: false, reason: 'moreBtn not found', buttonsFound: allButtons.map(b => b.textContent.trim()).slice(0, 5) };
        moreBtn.click();

        await new Promise(r => setTimeout(r, 2000));
        const el = document.getElementById('google_translate_element');
        const disclaimer = document.querySelector('[translate="no"]');
        return {
          success: true,
          elementFound: !!el,
          disclaimerFound: document.body.innerText.includes('ترجمة آلية بواسطة Google'),
          innerHtml: el ? el.innerHTML : ''
        };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('Google Translate widget trigger result:', gtResult.result.value);

    // Reset back to Arabic
    await cdp.send('Runtime.evaluate', {
      expression: `localStorage.setItem('cz_lang', 'ar')`,
    });

    console.log('=== Console Logs & CSP Summary ===');
    console.log(`Console Errors: ${errors.length}`);
    errors.forEach((e) => console.log('  ❌', e));
    console.log(`Console Warnings: ${warnings.length}`);
    warnings.slice(0, 10).forEach((w) => console.log('  ⚠️', w));

    console.log('--- Phase 0 Verification Complete ---');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    preview.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

main().catch(console.error);
