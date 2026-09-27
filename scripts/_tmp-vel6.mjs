// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('C: ' + m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__hgInact = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => ({
  inact: window.__hgInact,
  vel: window.__vel,
  tiles: document.querySelectorAll('[data-stripe-tile]').length,
  vp2: !!document.querySelector('[data-mega-page-viewport="2"]'),
}));
console.log(JSON.stringify(r, null, 1));
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
