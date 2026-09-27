// TEMPORAL — tria un color de samarreta a la p2 i mesura el ROMBE (doble vel)
// en el pixel del solapament, abans de tocar res.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const idx = Number(process.argv[2] ?? 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const colors = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const g = v.querySelector('[data-p2-color-grid]');
  if (!g) return [];
  return [...g.querySelectorAll('button, [role="button"], [data-color]')].map((e, i) => {
    const r = e.getBoundingClientRect();
    return { i, tag: e.tagName, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), t: (e.getAttribute('title') || e.getAttribute('data-color') || e.textContent || '').slice(0, 14) };
  });
});
console.log('colors', JSON.stringify(colors.slice(0, 20)));
if (colors[idx]) {
  await p.mouse.click(colors[idx].x, colors[idx].y);
  await p.waitForTimeout(1200);
}
console.log('shirtColor?', await p.evaluate(() => document.querySelector('[data-mega-page-viewport="2"] [data-p2-color-selector]')?.getAttribute('data-shirt-color') || null));
const info = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const r = franja.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
});
await p.waitForTimeout(400);
const buf = await p.screenshot({ clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
const png = PNG.sync.read(buf);
const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
console.log('rombe(250,60)', px(250, 60), 'rombe(250,100)', px(250, 100), 'espatlla(200,20)', px(200, 20), 'cos(150,150)', px(150, 150), 'fons(300,150)', px(300, 150));
await p.screenshot({ path: '_tmp-rombe-color.png', clip: { x: info.x, y: info.y, width: info.width, height: info.height } });
console.log('desat _tmp-rombe-color.png');
await ctx.close(); await b.close();
