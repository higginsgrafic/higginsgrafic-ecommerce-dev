import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const tira = v1.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return { tr: getComputedStyle(tira).transform, primerTop: (tira?.querySelector('button')?.getAttribute('style') || '').slice(0, 40) };
});
console.log('abans', JSON.stringify(await estat()));
const box = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const dx = -v1.getBoundingClientRect().left;
  const el = v1.querySelector('#stripe-guide-right-arrow');
  const q = el.getBoundingClientRect();
  return { x: q.left + q.width / 2, y: q.top + q.height / 2, cx: +(q.left + dx).toFixed(1), cy: +q.top.toFixed(1), w: q.width, h: q.height };
});
console.log('fletxa dreta', JSON.stringify(box));
await p.mouse.click(box.x, box.y);
await p.waitForTimeout(1200);
console.log('despres', JSON.stringify(await estat()));
// Ara la fletxa esquerra (a dalt)
const box2 = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const el = v1.querySelector('button[aria-label="Anterior"]');
  const q = el.getBoundingClientRect();
  return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
});
await p.mouse.click(box2.x, box2.y);
await p.waitForTimeout(1200);
console.log('despres d esquerra', JSON.stringify(await estat()));
await ctx.close();
await b.close();
