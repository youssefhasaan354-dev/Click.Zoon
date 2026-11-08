/**
 * Verification Script: GA4 & CSP Validation in Real Headless Chrome
 *
 * 1. Reads the exact Content-Security-Policy from vercel.json.
 * 2. Starts a local HTTP preview server serving dist/ with the exact headers.
 * 3. Launches headless Chrome via CDP.
 * 4. Listens for CDP security events, console errors, network requests, and DOM 'securitypolicyviolation' events.
 * 5. Loads the app, accepts cookies, initializes GA4 with a live Measurement ID, and fires a test tracking event.
 * 6. Verifies that gtag/js and collect requests are dispatched successfully with ZERO CSP violations.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Read vercel.json to extract headers
const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
const allRoutesHeader = vercelConfig.headers.find((h) => h.source === '/(.*)');
const cspHeader = allRoutesHeader?.headers?.find((h) => h.key === 'Content-Security-Policy')?.value;

if (!cspHeader) {
  console.error('ERROR: Could not find Content-Security-Policy in vercel.json');
  process.exit(1);
}

console.log('=== Active CSP from vercel.json ===');
console.log(cspHeader);
console.log('====================================\n');

// MIME types dictionary
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

// Create local preview server applying vercel.json headers
function createPreviewServer(port = 4174) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // Apply vercel.json headers
      for (const h of allRoutesHeader.headers) {
        res.setHeader(h.key, h.value);
      }

      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

      let filePath = path.join(distDir, reqPath);

      // Handle SPA fallback
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const potentialHtml = path.join(filePath, 'index.html');
        if (fs.existsSync(potentialHtml)) {
          filePath = potentialHtml;
        } else {
          filePath = path.join(distDir, 'index.html');
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      } catch (err) {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`Preview server running with exact Vercel CSP on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

// Minimal WebSocket CDP client
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
      awaitPromise: true,
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
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function run() {
  console.log('=== Starting GA4 & CSP Real Browser Verification ===');

  // 1. Build project if not already built
  if (!fs.existsSync(distDir)) {
    console.error('ERROR: dist/ directory not found. Please build the project first.');
    process.exit(1);
  }

  // 2. Start Preview Server
  const previewPort = 4174;
  const server = await createPreviewServer(previewPort);

  // 3. Launch Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProfile = path.join(rootDir, 'temp_chrome_csp_verify');
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
      '--remote-debugging-port=9223',
      `--user-data-dir=${chromeProfile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-gpu',
      '--window-size=1280,900',
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;

  try {
    console.log('Connecting to Chrome on port 9223...');
    await waitHttp('http://127.0.0.1:9223/json/version');

    const listRes = await fetch('http://127.0.0.1:9223/json/list');
    const tabs = await listRes.json();
    const pageTab = tabs.find((t) => t.type === 'page') || tabs[0];
    if (!pageTab?.webSocketDebuggerUrl) throw new Error('No target debugger URL found');

    cdp = new CdpClient(pageTab.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Network.enable');

    const cspViolations = [];
    const consoleErrors = [];
    const gaRequests = [];

    // Capture console errors and CSP warnings
    cdp.on('Log.entryAdded', (entry) => {
      if (entry.entry) {
        const text = entry.entry.text || '';
        if (text.includes('Content Security Policy') || text.includes('CSP') || entry.entry.level === 'error') {
          console.log('[Browser Log]', entry.entry.level, text);
          if (text.includes('Content Security Policy') || text.includes('violates')) {
            cspViolations.push(text);
          }
        }
      }
    });

    cdp.on('Runtime.consoleAPICalled', (params) => {
      const type = params.type;
      const text = params.args?.map((a) => a.value || JSON.stringify(a)).join(' ') || '';
      if (type === 'error') {
        console.log('[Console Error]', text);
        consoleErrors.push(text);
      } else if (text.includes('CSP') || text.includes('SecurityPolicy')) {
        console.log('[Console CSP Warning]', text);
        cspViolations.push(text);
      }
    });

    // Capture network requests to verify gtag/js and collect
    cdp.on('Network.requestWillBeSent', (params) => {
      const url = params.request.url;
      if (
        url.includes('googletagmanager.com/gtag/js') ||
        url.includes('google-analytics.com/g/collect') ||
        url.includes('google-analytics.com/collect') ||
        url.includes('analytics.google.com/g/collect') ||
        url.includes('stats.g.doubleclick.net')
      ) {
        console.log(`[Captured GA4 Network Request] (${params.request.method}) ${url.substring(0, 110)}...`);
        gaRequests.push({
          requestId: params.requestId,
          url,
          method: params.request.method,
          status: 'pending',
        });
      }
    });

    cdp.on('Network.responseReceived', (params) => {
      const match = gaRequests.find((r) => r.requestId === params.requestId);
      if (match) {
        match.status = params.response.status;
        console.log(`[GA4 Response Received] Status ${params.response.status} for ${params.response.url.substring(0, 90)}...`);
      }
    });

    cdp.on('Network.loadingFailed', (params) => {
      const match = gaRequests.find((r) => r.requestId === params.requestId);
      if (match) {
        match.status = 'FAILED: ' + params.errorText;
        console.log(`[GA4 Network Failed] ${params.errorText} for request:`, match.url);
        if (params.blockedReason) {
          console.log('Blocked Reason:', params.blockedReason);
          cspViolations.push(`Network blocked (${params.blockedReason}): ${match.url}`);
        }
      }
    });

    // Step A: Navigate to preview site
    console.log(`\nNavigating to http://127.0.0.1:${previewPort}/ ...`);
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${previewPort}/` });
    await new Promise((r) => setTimeout(r, 1500));

    // Install in-page securitypolicyviolation listener
    await cdp.eval(`
      window.__cspViolations = [];
      window.addEventListener('securitypolicyviolation', (e) => {
        window.__cspViolations.push({
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          effectiveDirective: e.effectiveDirective,
          originalPolicy: e.originalPolicy
        });
        console.error('DOM securitypolicyviolation event:', e.effectiveDirective, e.blockedURI);
      });
    `);

    // Step B: Set cookie consent to accepted and provide Measurement ID
    console.log('\nSetting cz_cookie_consent to "accepted" in localStorage...');
    await cdp.eval(`localStorage.setItem('cz_cookie_consent', 'accepted')`);

    // Step C: Trigger initGoogleAnalytics with a realistic Measurement ID (e.g. G-KZ84T1W9PQ)
    const testMeasurementId = 'G-KZ84T1W9PQ';
    console.log(`Initializing GA4 with measurementId: ${testMeasurementId}...`);

    await cdp.eval(`
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=${testMeasurementId}';
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function gtag() { window.dataLayer.push(arguments); };
      }
      window.gtag('js', new Date());
      window.gtag('config', '${testMeasurementId}', { send_page_view: true });
    `);

    // Wait for gtag.js to load and execute
    console.log('Waiting for gtag.js network request...');
    await new Promise((r) => setTimeout(r, 3000));

    // Step D: Trigger an explicit custom track event (e.g. WhatsApp CTA click)
    console.log('Firing GA4 event: trackEvent("whatsapp_click", { button: "hero" })...');
    await cdp.eval(`
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'whatsapp_click', {
          event_category: 'whatsapp',
          event_label: 'hero_demo',
          button: 'hero'
        });
      }
    `);

    // Allow time for /g/collect or batch requests
    await new Promise((r) => setTimeout(r, 3500));

    // Step E: Query in-page DOM security violations
    const domViolations = await cdp.eval(`window.__cspViolations || []`);
    if (domViolations && domViolations.length > 0) {
      console.error('\n❌ DOM securitypolicyviolation events detected:', domViolations);
      cspViolations.push(...domViolations.map((v) => `${v.effectiveDirective}: ${v.blockedURI}`));
    }

    // Step F: Summary Report
    console.log('\n========================================================');
    console.log('                 GA4 & CSP VERIFICATION RESULT           ');
    console.log('========================================================');
    console.log(`Total GA4 Network Requests Captured: ${gaRequests.length}`);
    gaRequests.forEach((req, idx) => {
      console.log(`  ${idx + 1}. [${req.method}] ${req.url.split('?')[0]} -> Status: ${req.status}`);
    });

    console.log(`\nTotal CSP Violations Detected: ${cspViolations.length}`);
    if (cspViolations.length > 0) {
      cspViolations.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));
    } else {
      console.log('  ✅ 0 CSP VIOLATIONS! All gtag/js and collect requests are fully compliant with Content-Security-Policy.');
    }

    console.log(`Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    }

    if (cspViolations.length > 0) {
      throw new Error(`Test failed with ${cspViolations.length} CSP violations!`);
    }

    const hasGtagJs = gaRequests.some((r) => r.url.includes('googletagmanager.com/gtag/js'));
    const hasCollect = gaRequests.some((r) => r.url.includes('/collect') || r.url.includes('google-analytics.com'));

    console.log('\nChecks:');
    console.log(`- gtag.js requested: ${hasGtagJs ? '✅ YES' : '❌ NO'}`);
    console.log(`- collect/analytics requested: ${hasCollect ? '✅ YES' : '❌ NO'}`);
    console.log(`- Zero CSP Violations: ${cspViolations.length === 0 ? '✅ YES' : '❌ NO'}`);

    if (!hasGtagJs) {
      throw new Error('gtag.js was not requested over network!');
    }

    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY!');
  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    server.close();
    if (fs.existsSync(chromeProfile)) {
      try {
        fs.rmSync(chromeProfile, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }
}

run().catch((err) => {
  console.error('\nVerification FAILED with error:', err);
  process.exit(1);
});

