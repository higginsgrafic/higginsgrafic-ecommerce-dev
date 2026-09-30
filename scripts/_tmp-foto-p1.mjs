// TEMPORAL — captura la PAGINA 1 del megaslide (desplacant-hi) a una mida.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1366), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const info = await p.evaluate(() => {
  // L'ancestre que desplaca les pagines.
  let el = document.querySelector('[data-mega-page-viewport="1"]');
  const cami = [];
  while (el && el !== document.body) {
    if (el.scrollWidth > el.clientWidth + 10) cami.push({ tag: el.tagName.toLowerCase(), id: el.id, sw: el.scrollWidth, cw: el.clientWidth });
    el = el.parentElement;
  }
  return { cami };
});
await p.click('button[aria-label="Anterior"]').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const x = v1.getBoundingClientRect();
  return { x: Math.round(x.left), y: Math.round(x.top), width: Math.round(x.width), height: Math.round(x.height) };
});
console.log(`${w}x${h}`, JSON.stringify(info), 'v1', JSON.stringify(r));
await p.screenshot({ path: `/tmp/p1-${w}.png`, clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.min(w, r.width), height: Math.min(h - r.y, r.height) } });
console.log(`/tmp/p1-${w}.png`, 'errors=', errors.length);
await ctx.close(); await b.close();
