import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const c = await p.evaluate(() => {
  const b = [...document.querySelectorAll('[data-color-barra]')].find((x) => x.getAttribute('data-color-barra') === 'light-blue');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1500); }
await p.screenshot({ path: '_tmp-p2-sencera-lightblue.png', clip: { x: 340, y: 60, width: 1240, height: 420 } });
console.log('desat _tmp-p2-sencera.png');
await ctx.close(); await b.close();
