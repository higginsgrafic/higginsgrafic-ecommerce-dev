// TEMPORAL — no es comiteja. Retall de la franja de la p2 a 3x per mirar-lo de prop.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
const act = process.argv[2] || 'first_contact';
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const r = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-visual-content="2"]').getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
});
await p.screenshot({ path: `_tmp-retall3x-${act}.png`, clip: { x: box.x, y: box.y, width: Math.min(box.w, 1920 - box.x), height: box.h } });
console.log(`desat _tmp-retall3x-${act}.png (${box.w}x${box.h} a 3x)`);
await ctx.close();
await b.close();
