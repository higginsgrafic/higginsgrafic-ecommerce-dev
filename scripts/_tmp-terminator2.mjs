// TEMPORAL — no es comiteja. El Terminator surt a la franja si s'hi fa scroll?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(2500);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const veure = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const img = t.querySelector('img');
    return (img?.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '').replace('.webp', '') || '-';
  });
});
const vist = new Set();
let term = null;
for (let i = 0; i <= 20; i++) {
  const v = await veure();
  v.forEach((x) => vist.add(x));
  if (v.some((x) => /terminator/i.test(x))) term = { i, v };
  if (i < 20) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(400); }
}
console.log('dibuixos diferents vistos a la franja:', vist.size);
console.log('son tots:', [...vist].sort().join(' | '));
console.log('TERMINATOR:', term ? `SI, al scroll ${term.i}` : 'NO, en cap dels 21 estats');
await b.close();
