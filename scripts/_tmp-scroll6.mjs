import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
console.log('sonda abans', JSON.stringify(await p.evaluate(() => window.__SG)));
await p.evaluate(() => {
  const cg = document.querySelector('[data-p2-color-grid]');
  cg.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
});
await p.waitForTimeout(600);
console.log('sonda despres', JSON.stringify(await p.evaluate(() => window.__SG)));
console.log('triat', await p.evaluate(() => {
  const cg = document.querySelector('[data-p2-color-grid]');
  const m = [...cg.querySelectorAll('button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
  return m ? m.getAttribute('data-color-barra') : null;
}));
await ctx.close();
await b.close();
