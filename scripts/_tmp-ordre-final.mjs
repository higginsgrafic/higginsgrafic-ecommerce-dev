// TEMPORAL — no es comiteja. L'ordre de la franja amb AUSTEN: surt el mateix
// ordre que a la graella (marc, solid, marc, solid...)?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const ordre = [];
for (let i = 0; i <= 60; i++) {
  const v = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    return [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop() || '-');
  });
  for (const x of v) if (/solid|frame/.test(x) && !ordre.includes(x)) ordre.push(x);
  if (i < 60) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(280); }
}
console.log('ordre en que surten a la franja:');
ordre.forEach((x, i) => console.log('  ', i + 1, x));
await b.close();
