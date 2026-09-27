import { chromium } from '@playwright/test';
const b = await chromium.launch({ headless: false });
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const triat = () => p.evaluate(() => {
  const cg = document.querySelector('[data-p2-color-grid]');
  const m = [...cg.querySelectorAll('button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
  return m ? m.getAttribute('data-color-barra') : null;
});
const tr = () => p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const t = v.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return t ? getComputedStyle(t).transform : null;
});
const punt = (s) => p.evaluate((x) => { const r = document.querySelector(x).getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }, s);
let c = await punt('[data-p2-color-grid]');
console.log('colors abans', await triat());
await p.mouse.move(c.x, c.y);
for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(500); }
console.log('colors despres de 3 rodeta amunt', await triat());
c = await punt('[data-mega-page-viewport="2"] [data-carrusel="1"]');
console.log('graella p2 abans', await tr());
await p.mouse.move(c.x, c.y);
for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 240); await p.waitForTimeout(500); }
console.log('graella p2 despres de 3 rodeta', await tr());
await ctx.close();
await b.close();
