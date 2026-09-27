import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(8000);
await p.screenshot({ path: '_tmp-b2-1024.png' });
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sam = v2.querySelector('[data-stripe-visual-content="2"]');
  const fila = sam?.parentElement?.parentElement?.parentElement;
  const franjaRow = v2.querySelector('#stripe-guide-stripe-row-p2') || sam?.closest('[id]');
  const q = (el) => el ? { id: el.id || null, x: +el.getBoundingClientRect().left.toFixed(1), r: +el.getBoundingClientRect().right.toFixed(1), w: +el.getBoundingClientRect().width.toFixed(1), tr: getComputedStyle(el).transform } : null;
  return { sam: q(sam), fila: q(fila), franjaRow: q(franjaRow), pareSam: q(sam?.parentElement) };
}), null, 1));
await ctx.close();
await b.close();
