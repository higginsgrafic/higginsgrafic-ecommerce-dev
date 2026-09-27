import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [...v2.querySelectorAll('[data-stripe-tile]')].slice(0, 6).map((t) => ({
    casa: t.getAttribute('data-stripe-tile'),
    item: t.getAttribute('data-stripe-item'),
    coll: t.getAttribute('data-stripe-collection'),
    src: (t.querySelector('img')?.currentSrc || '').split('/').pop(),
  }));
});
for (const x of r) console.log(JSON.stringify(x));
await b.close();
