import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const desc = (el) => el ? { imgs: el.querySelectorAll('img').length, tiles: el.querySelectorAll('[data-stripe-tile]').length, botons: el.querySelectorAll('button').length } : null;
  return { p1: desc(v1), p2: desc(v2), pagina: [...document.querySelectorAll('[data-mega-page-viewport]')].map((x) => x.getAttribute('data-mega-page-viewport')) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
