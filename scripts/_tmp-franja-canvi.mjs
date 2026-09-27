// TEMPORAL — no es comiteja. En canviar de colleccio, la franja canvia?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const franja = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [...v2.querySelectorAll('[data-stripe-tile] img')].map((i) => (i.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '').replace('.webp', ''));
});
console.log('FIRST CONTACT :', JSON.stringify(await franja()));
for (const col of ['THE HUMAN INSIDE', 'CUBE', 'MISCEL·LÀNIA']) {
  const t = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, col);
  const bb = await t.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1800);
  console.log(col.padEnd(14) + ':', JSON.stringify(await franja()));
}
await b.close();
