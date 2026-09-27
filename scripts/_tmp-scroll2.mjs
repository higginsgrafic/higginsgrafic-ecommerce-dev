// TEMPORAL — no es comiteja. La rodeta, amb esdeveniment manual.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const tr = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const t = v2.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return t ? getComputedStyle(t).transform : null;
});
const trP1 = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return t ? getComputedStyle(t).transform : null;
});
console.log('p2 abans', await tr(), '| p1 abans', await trP1());
console.log('--- esdeveniment manual a la p2 ---');
await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const retall = v2.querySelector('[data-carrusel="1"]').firstElementChild;
  retall.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
});
await p.waitForTimeout(600);
console.log('p2 despres', await tr());
console.log('--- esdeveniment manual a la p1 ---');
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const retall = v1.querySelector('[data-carrusel="1"]').firstElementChild;
  retall.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
});
await p.waitForTimeout(600);
console.log('p1 despres', await trP1());
console.log('--- rodeta real de Playwright sobre la p1 ---');
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(400);
const gc = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const r = v1.querySelector('[data-carrusel="1"]').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(gc.x, gc.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(600);
console.log('p1 amb mouse.wheel', await trP1());
await ctx.close();
await b.close();
