// TEMPORAL — no es comiteja. La rodeta sobre la tira de colors (estat real).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const sel = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cg = v2.querySelector('[data-p2-color-grid]');
  return [...cg.querySelectorAll('button')].map((x) => ({ s: x.getAttribute('data-color-barra'), o: getComputedStyle(x).outlineStyle + ' ' + getComputedStyle(x).outlineWidth })).filter((x) => x.o.includes('solid'));
});
console.log('abans:', JSON.stringify(await sel()));
await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cg = v2.querySelector('[data-p2-color-grid]');
  cg.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
});
await p.waitForTimeout(700);
console.log('despres (esdeveniment):', JSON.stringify(await sel()));
const cc = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2.querySelector('[data-p2-color-grid]').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(cc.x, cc.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(700);
console.log('despres (rodeta real):', JSON.stringify(await sel()));
await ctx.close();
await b.close();
