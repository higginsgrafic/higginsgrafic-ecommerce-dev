// TEMPORAL — no es comiteja. Per a cada casa: el src que es veu, l'item que hi
// ha al DOM, i la ruta que en surt. Aixi es veu on es trenca.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cases = [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => ({
    casa: t.getAttribute('data-stripe-tile'),
    src: (t.getAttribute('data-stripe-src') || '').split('/').pop(),
    item: t.getAttribute('data-stripe-item'),
    coll: t.getAttribute('data-stripe-collection'),
    vist: (t.querySelector('img')?.currentSrc || '').split('/').pop(),
  }));
  return cases;
});
for (const x of r) console.log(`${x.casa.padStart(2)}  vist=${String(x.vist).padEnd(30)} src_attr=${String(x.src).padEnd(30)} item=${String(x.item).slice(0, 30)} coll=${x.coll}`);
await b.close();
