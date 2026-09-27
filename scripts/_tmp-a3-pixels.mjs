// TEMPORAL — no es comiteja. A3: els pixels de la costura maniga/pastilla.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
// Franja de files a y=300 (a mitja alcada de la maniga) i a y=110 (dalt).
await p.screenshot({ path: '_tmp-a3-costura3x.png', clip: { x: 1380, y: 100, width: 40, height: 250 } });
await ctx.close();
await b.close();
const img = PNG.sync.read(readFileSync('_tmp-a3-costura3x.png'));
const { width, height, data } = img;
const px = (x, y) => { const i = (y * width + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
console.log('x absolut -> RGB a y=110(abs) i y=300(abs)');
for (let x = 0; x < width; x += 1) {
  const xa = 1380 + x / 3;
  const a = px(x, Math.round((110 - 100) * 3));
  const c = px(x, Math.round((300 - 100) * 3));
  console.log(`${xa.toFixed(1)}  y110 ${a.join(',')}   y300 ${c.join(',')}`);
}
