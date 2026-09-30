// TEMPORAL — tots els elements data-stripe-visual-content de la p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [...v2.querySelectorAll('[data-stripe-visual-content]')].map((el) => {
    const x = el.getBoundingClientRect();
    return {
      val: el.getAttribute('data-stripe-visual-content'),
      l: +x.left.toFixed(1), r: +x.right.toFixed(1), w: +x.width.toFixed(1), t: +x.top.toFixed(1), h: +x.height.toFixed(1),
      ow: el.offsetWidth, oh: el.offsetHeight,
      tiles: el.querySelectorAll('[data-stripe-tile]').length,
      imgs: el.querySelectorAll('img').length,
      pare: el.parentElement ? el.parentElement.className || el.parentElement.tagName : null,
      transform: getComputedStyle(el).transform.slice(0, 50),
      z: getComputedStyle(el).zIndex,
      vis: getComputedStyle(el).visibility,
    };
  });
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
