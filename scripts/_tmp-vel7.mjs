// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
const p = await ctx.newPage();
const moduls = [];
p.on('response', (r) => { if (/MegaslidePagina2/.test(r.url())) moduls.push(r.url()); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__hgInact = []; window.__vel = null; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => ({
  esArray: Array.isArray(window.__hgInact),
  quantes: (window.__hgInact || []).length,
  inact: window.__hgInact,
  vel: window.__vel,
}));
console.log('moduls demanats:', JSON.stringify(moduls));
console.log(JSON.stringify(r, null, 1));
await b.close();
