// TEMPORAL — no es comiteja. Captura la pagina 2 sencera.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  const r = panell.getBoundingClientRect();
  return { x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), w: Math.round(r.width), h: Math.min(Math.round(r.height), 700) };
});
console.log('panell box', box);
await p.screenshot({ path: `_tmp-p2-${act}.png`, clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
console.log('fet');
await ctx.close();
await b.close();
