// TEMPORAL — no es comiteja. Les cantonades dels selectors, a 6x, amb els radis
// nous (5,3 exterior / 3 interior).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 6 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const d = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const q = (e) => { const r = e.getBoundingClientRect(); return { x: Math.floor(r.left) - 4, y: Math.floor(r.top) - 4, w: Math.ceil(r.width) + 8, h: Math.ceil(r.height) + 8 }; };
  return { sel: q(sel), selR: getComputedStyle(sel).borderRadius, col: q(col), colR: getComputedStyle(col).borderRadius };
});
console.log(JSON.stringify(d));
await p.screenshot({ path: '_tmp-canto-selector.png', clip: { x: d.sel.x, y: d.sel.y, width: d.sel.w, height: 48 } });
await p.screenshot({ path: '_tmp-canto-columna.png', clip: { x: d.col.x, y: d.col.y, width: d.col.w, height: 48 } });
console.log('desats');
await ctx.close();
await b.close();
