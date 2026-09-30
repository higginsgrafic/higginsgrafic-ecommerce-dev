// TEMPORAL — on acaben les dues pastilles (B/C/N i tira de col·leccions).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bcn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const banda = v2.querySelector('[data-colleccions-franja="1"]');
  const pillBcn = [...v2.querySelectorAll('span[aria-hidden="true"]')].find((s) => s.getBoundingClientRect().width > 10 && s.getBoundingClientRect().width < bcn.getBoundingClientRect().width);
  const pillBanda = banda.querySelector('[aria-current="true"]');
  const bx = (el) => { const x = el.getBoundingClientRect(); return { l: +x.left.toFixed(1), r: +x.right.toFixed(1), t: +x.top.toFixed(1), b: +x.bottom.toFixed(1), w: +x.width.toFixed(1), h: +x.height.toFixed(1) }; };
  return { caixaBcn: bx(bcn), pillBcn: bx(pillBcn), banda: bx(banda), pillBanda: bx(pillBanda) };
});
for (const [k, v] of Object.entries(r)) console.log(k.padEnd(10), JSON.stringify(v));
console.log('la pastilla del B/C/N acaba a x =', r.pillBcn.r, ' i la de la tira a x =', r.pillBanda.r, ' -> diferencia', (r.pillBanda.r - r.pillBcn.r).toFixed(1));
console.log('amples:', r.pillBcn.w, 'vs', r.pillBanda.w);
await ctx.close(); await b.close();
