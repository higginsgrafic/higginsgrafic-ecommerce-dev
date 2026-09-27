// TEMPORAL — no es comiteja. Les cases tenen els atributs i la imatge?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [...v2.querySelectorAll('[data-stripe-tile]')].slice(0, 5).map((t) => ({
    casa: t.getAttribute('data-stripe-tile'),
    clau: t.getAttribute('data-stripe-casa'),
    item: t.getAttribute('data-stripe-item'),
    coll: t.getAttribute('data-stripe-collection'),
    teImg: !!t.querySelector('img'),
    src: (t.querySelector('img')?.currentSrc || t.querySelector('img')?.src || '-').split('/').pop(),
  }));
});
for (const x of r) console.log(JSON.stringify(x));
await b.close();
