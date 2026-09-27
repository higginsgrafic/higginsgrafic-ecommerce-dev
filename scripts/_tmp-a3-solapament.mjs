// TEMPORAL — no es comiteja. A3: quantes columnes de pixels de la vora dreta de
// la franja son tinta (samarreta) i quantes de la columna de colleccions.
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
// Capturem sense la columna (opacitat 0) per veure la franja de sota.
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v2.querySelector('[data-stripe-visual-content="2"]').getBoundingClientRect();
  const c = v2.querySelector('[data-colleccions-targeta]').parentElement.getBoundingClientRect();
  window.__col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  window.__col.style.opacity = '0';
  return { fx: Math.floor(f.left), fy: Math.floor(f.top), fw: Math.ceil(f.width), fh: Math.ceil(f.height), cx: c.left, cy: c.top, cw: c.width, ch: c.height, crevR: c.right, crevB: c.bottom };
});
await p.waitForTimeout(400);
await p.screenshot({ path: '_tmp-a3-sense-col.png', clip: { x: info.fx, y: info.fy, width: info.fw, height: info.fh } });
console.log('franja', JSON.stringify(info));
await ctx.close();
await b.close();
const img = PNG.sync.read(readFileSync('_tmp-a3-sense-col.png'));
const { width, height, data } = img;
// Per cada columna, el pixel mes fosc (tinta) i l'alcada de tinta.
const files = [];
for (let x = 0; x < width; x += 1) {
  let min = 255; let n = 0;
  for (let y = 0; y < height; y += 1) {
    const i = (y * width + x) * 4;
    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    if (lum < min) min = lum;
    if (lum < 250) n += 1;
  }
  files.push({ x, min: Math.round(min), n });
}
const tinta = files.filter((f) => f.n > 0);
const darrera = tinta.length ? tinta[tinta.length - 1].x : null;
console.log('amplada franja:', width, 'alcada:', height);
console.log('ultima columna amb tinta:', darrera, '-> x absolut', info.fx + (darrera ?? 0));
console.log('vora dreta de la franja: x', info.fx + width, '| esquerra de la columna:', Math.round(info.cx));
console.log('solapament (px):', Math.round(info.fx + width - info.cx));
console.log('mostra de les 16 ultimes columnes amb tinta:');
console.log(tinta.slice(-16).map((f) => `x${info.fx + f.x}:${f.n}px(lum${f.min})`).join(' '));
