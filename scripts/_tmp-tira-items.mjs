// TEMPORAL — no es comiteja. L'ordre real dels items de la tira i l'index que
// hauria de tenir cada casa amb el desplacament actual.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const imgs = [...v2.querySelectorAll('[data-stripe-tile] img')].map((i) => (i.currentSrc || '').split('/').pop());
  return imgs;
});
console.log('ce que es veu:', JSON.stringify(r.slice(0, 14)));
await b.close();
