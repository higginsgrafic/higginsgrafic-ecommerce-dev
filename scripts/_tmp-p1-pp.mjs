import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const tr = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  return getComputedStyle(t).transform;
});
const boto = (l) => p.evaluate((lab) => { const e = document.querySelector(`[data-fletxes-p1="1"] button[aria-label="${lab}"]`); const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }, l);
console.log('abans', await tr(), JSON.stringify(await p.evaluate(() => window.__PP || null)));
const c = await boto('Següent');
await p.mouse.click(c.x, c.y);
await p.waitForTimeout(1200);
console.log('despres', await tr(), JSON.stringify(await p.evaluate(() => window.__PP || null)));
await ctx.close();
await b.close();
