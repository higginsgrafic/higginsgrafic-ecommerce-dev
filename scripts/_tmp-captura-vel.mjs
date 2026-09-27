// TEMPORAL — no es comiteja. Captura el canton esquerre de la franja de la p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const r = franja.getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
});
console.log('franja box', box);
// Franja sencera
await p.screenshot({ path: `_tmp-franja-${act}.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
// Canton esquerre (primers 260 px)
await p.screenshot({ path: `_tmp-franja-${act}-esq.png`, clip: { x: Math.max(0, box.x - 40), y: box.y, width: 300, height: box.h } });
console.log('fet');
await ctx.close();
await b.close();
