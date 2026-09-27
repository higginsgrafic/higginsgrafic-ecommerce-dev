// TEMPORAL — no es comiteja. La rodeta sobre la tira de colors ha de canviar la
// tria (una barra endavant o enrere).
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
  const marca = cg?.querySelector('button[style*="outline"]') || [...(cg?.querySelectorAll('button') || [])].find((x) => x.style.outline && x.style.outline !== 'none');
  return marca ? marca.getAttribute('data-color-barra') : null;
});
console.log('color triat abans:', await sel());
const cc = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2.querySelector('[data-p2-color-grid]').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(cc.x, cc.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(700);
console.log('despres de rodeta avall:', await sel());
await p.mouse.wheel(0, -120);
await p.waitForTimeout(700);
console.log('despres de rodeta amunt:', await sel());
await ctx.close();
await b.close();
