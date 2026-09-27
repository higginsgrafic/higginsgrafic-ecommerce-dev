import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const dx = -v1.getBoundingClientRect().left;
  const f = v1.querySelector('[data-stripe-visual-content="1"]').getBoundingClientRect();
  const fl = v1.querySelector('[data-fletxes-p1="1"]').getBoundingClientRect();
  const bl = v1.querySelector('[data-bloc-dreta-p1="1"]').getBoundingClientRect();
  const q = (r) => ({ x: +(r.left + dx).toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
  return { franja: q(f), fletxes: q(fl), bloc: q(bl), solapamentY: +(f.bottom - fl.top).toFixed(1), solapamentX: +(f.right - fl.left).toFixed(1) };
}), null, 1));
await ctx.close();
await b.close();
