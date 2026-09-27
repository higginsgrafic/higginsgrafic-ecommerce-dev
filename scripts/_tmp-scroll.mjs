// TEMPORAL — no es comiteja. L'scroll (rodeta i gest) de la graella i de la tira
// de colors de la pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const carr = v2.querySelector('[data-carrusel="1"]');
  const tira = carr?.firstElementChild?.firstElementChild;
  const cg = v2.querySelector('[data-p2-color-grid]');
  if (!carr) return { error: 'sense carrusel' };
  return {
    carruselTr: tira ? getComputedStyle(tira).transform : null,
    colorsScrollLeft: cg ? cg.scrollLeft : null,
    colorsOverflowX: cg ? getComputedStyle(cg).overflowX : null,
    colorsW: cg ? +cg.getBoundingClientRect().width.toFixed(1) : null,
    colorsScrollW: cg ? cg.scrollWidth : null,
    colorsChildW: cg ? (cg.firstElementChild ? +cg.firstElementChild.getBoundingClientRect().width.toFixed(1) : null) : null,
    colorsDisplay: cg ? getComputedStyle(cg).display : null,
  };
});
console.log('abans', JSON.stringify(await estat()));
// Rodeta sobre la graella
const gc = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2.querySelector('[data-carrusel="1"]').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(gc.x, gc.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(800);
console.log('despres de la rodeta a la GRAELLA', JSON.stringify(await estat()));
// Rodeta sobre la tira de colors
const cc = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2.querySelector('[data-p2-color-grid]').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(cc.x, cc.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(800);
console.log('despres de la rodeta als COLORS', JSON.stringify(await estat()));
await ctx.close();
await b.close();
