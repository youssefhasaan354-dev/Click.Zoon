import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Simple CDP client
class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
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
        }
      };
    });
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

function findBrowserBinary() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  // Check Unix-like PATH
  const unixBins = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium'];
  for (const bin of unixBins) {
    try {
      const out = execSync(`which ${bin} 2>/dev/null`, { encoding: 'utf8' }).trim();
      if (out && fs.existsSync(out)) return out;
    } catch (_) {}
  }

  return null;
}

export async function prerenderRoutes(routes = ['/', '/privacy']) {
  console.log(`Starting Prerender for routes: ${routes.join(', ')}...`);

  const browserPath = findBrowserBinary();
  if (!browserPath) {
    console.warn('⚠️ No Chrome/Edge binary found on system. Skipping browser-based prerendering.');
    return;
  }
  console.log(`Using browser: ${browserPath}`);

  // 1. Launch Vite preview
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

  const userDataDir = path.resolve('temp_prerender_profile');
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const chrome = spawn(
    browserPath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--remote-debugging-port=9222',
      `--user-data-dir=${userDataDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-features=Translate',
    ],
    { stdio: 'ignore' }
  );

  await sleep(1500);

  let cdp = null;
  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionJson = await versionRes.json();

    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];

    cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    for (const route of routes) {
      console.log(`Prerendering route: ${route}`);
      // Ensure language is set to Arabic (default)
      await cdp.send('Runtime.evaluate', {
        expression: `localStorage.setItem('cz_lang', 'ar')`,
      });

      const url = `http://localhost:4173${route}`;
      await cdp.send('Page.navigate', { url });

      // Wait for content to render
      for (let attempt = 0; attempt < 25; attempt++) {
        await sleep(250);
        const check = await cdp.send('Runtime.evaluate', {
          expression: `(() => {
            const root = document.getElementById('root');
            const h1 = document.querySelector('h1');
            return !!(root && root.children.length > 0 && h1 && !document.querySelector('.animate-spin'));
          })()`,
          returnByValue: true,
        });
        if (check.result.value) {
          break;
        }
      }

      await sleep(800); // allow Framer Motion to settle

      // Extract rendered HTML
      const htmlRes = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          return '<!doctype html>\\n' + document.documentElement.outerHTML;
        })()`,
        returnByValue: true,
      });

      const renderedHtml = htmlRes.result.value;

      let outPath;
      if (route === '/') {
        outPath = path.resolve('dist/index.html');
      } else {
        const routeDir = path.resolve('dist', route.replace(/^\//, ''));
        if (!fs.existsSync(routeDir)) fs.mkdirSync(routeDir, { recursive: true });
        outPath = path.join(routeDir, 'index.html');
      }

      fs.writeFileSync(outPath, renderedHtml, 'utf8');
      console.log(`Saved prerendered HTML to ${outPath} (${(renderedHtml.length / 1024).toFixed(1)} KB)`);
    }

    console.log('--- Prerender successfully finished for all routes ---');
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    preview.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

// Direct execution
if (process.argv[1] && process.argv[1].includes('prerender.mjs')) {
  prerenderRoutes().catch((err) => {
    console.error('Prerender error:', err);
    process.exit(1);
  });
}
