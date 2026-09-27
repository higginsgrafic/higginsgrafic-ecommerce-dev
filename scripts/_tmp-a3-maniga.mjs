// TEMPORAL — no es comiteja. A3: la vora de la maniga dreta de la franja, per
// files (on acaba la tinta de cada fila de samarretes).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v2.querySelector('[data-stripe-visual-content="2"]').getBoundingClientRect();
  return { fx: Math.floor(f.left), fy: Math.floor(f.top), fw: Math.ceil(f.width), fh: Math.ceil(f.height) };
});
await p.screenshot({ path: '_tmp-a3-franja-sola.png', clip: { x: info.fx, y: info.fy, width: info.fw, height: info.fh } });
await ctx.close();
await b.close();
const img = PNG.sync.read(readFileSync('_tmp-a3-franja-sola.png'));
const { width, height, data } = img;
const lum = (x, y) => { const i = (y * width + x) * 4; return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; };
// Per cada fila (cada 4 px), l'ultima columna amb tinta clara (<252).
const files = [];
for (let y = 2; y < height; y += 4) {
  let last = null;
  for (let x = width - 1; x >= 0; x -= 1) { if (lum(x, y) < 252) { last = x; break; } }
  files.push({ y, last: last === null ? null : info.fx + last });
}
console.log('franja', JSON.stringify(info));
console.log('fila y -> ultima tinta x (absolut):');
console.log(files.filter((f) => f.last !== null).map((f) => `${f.y}:${f.last}`).join(' '));
