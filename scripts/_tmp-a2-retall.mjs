// TEMPORAL — no es comiteja. Captura del bloc de fletxes de la p2 (abans/despres).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const q = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2.querySelector('#stripe-guide-right-anchor').getBoundingClientRect();
  return { x: Math.floor(r.left) - 8, y: Math.floor(r.top) - 8, w: Math.ceil(r.width) + 16, h: Math.ceil(r.height) + 16 };
});
await p.screenshot({ path: process.argv[2] || '_tmp-a2-fletxes3x.png', clip: { x: q.x, y: q.y, width: q.w, height: q.h } });
console.log('desat', process.argv[2] || '_tmp-a2-fletxes3x.png', JSON.stringify(q));
await ctx.close();
await b.close();
