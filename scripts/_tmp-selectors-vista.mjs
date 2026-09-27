// TEMPORAL — no es comiteja. Els selectors (p1, p2 i la columna) amb l'estil unificat.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const d = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const sl = [...sel.children].find((c) => c.tagName === 'SPAN');
  const q = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };
  const cs = getComputedStyle(sel), ss = getComputedStyle(sl);
  return { sel: q(sel), slider: q(sl), selR: cs.borderRadius, slR: ss.borderRadius, selBg: cs.backgroundColor, slBg: ss.backgroundColor, slShadow: ss.boxShadow, offsetEsq: Math.round(sl.getBoundingClientRect().left - sel.getBoundingClientRect().left) };
});
console.log(JSON.stringify(d, null, 1));
await p.screenshot({ path: '_tmp-sel-p2.png', clip: { x: d.sel.x - 8, y: d.sel.y - 8, width: d.sel.w + 16, height: d.sel.h + 16 } });
await ctx.close();
await b.close();
