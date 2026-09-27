import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(8000);
console.log(JSON.stringify(await p.evaluate(() => {
  const ids = [...document.querySelectorAll('[id^="stripe-guide"]')].map((e) => {
    const vp = e.closest('[data-mega-page-viewport]')?.getAttribute('data-mega-page-viewport') || '?';
    const q = e.getBoundingClientRect();
    return { id: e.id, vp, x: +q.left.toFixed(1), r: +q.right.toFixed(1), w: +q.width.toFixed(1) };
  });
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const row2 = [...v2.querySelectorAll('[id^="stripe-guide"]')].map((e) => ({ id: e.id, x: +e.getBoundingClientRect().left.toFixed(1), tr: getComputedStyle(e).transform }));
  const rows = [...document.querySelectorAll('[id^="stripe-guide-stripe-row"]')].length;
  return { ids, row2, rows };
}), null, 1));
await ctx.close();
await b.close();
