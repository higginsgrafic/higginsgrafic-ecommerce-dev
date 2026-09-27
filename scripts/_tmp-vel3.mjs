// TEMPORAL — no es comiteja. El vel, amb sonda directa al render.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
const r = await p.evaluate(() => {
  const totes = [...document.querySelectorAll('img')];
  const ambData = totes.filter((i) => (i.getAttribute('src') || '').startsWith('data:'));
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const z6 = [...document.querySelectorAll('img')].filter((i) => getComputedStyle(i).zIndex === '6');
  return {
    imgs: totes.length,
    ambData: ambData.length,
    primeresAmbData: ambData.slice(0, 3).map((i) => (i.getAttribute('src') || '').slice(0, 60)),
    z6: z6.map((i) => ({ src: (i.getAttribute('src') || '').slice(0, 50), dins: v2 ? v2.contains(i) : null })),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
