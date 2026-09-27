// TEMPORAL — no es comiteja. A3: la costura amb la franja a z4 i a z1 (amb l'ombra
// tambe a fora, per comparar nomes la capa).
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
const clip = { x: 1399, y: 250, width: 12, height: 8 };
const treu = () => p.evaluate(() => { const o = document.querySelector('[data-maniga-ombra="1"]'); if (o) o.style.display = 'none'; });
const capa = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v2.querySelector('[data-stripe-visual-content="2"]');
  return f ? f.closest('[data-mega-page-viewport="2"]').querySelectorAll('div[style*="z-index: 4"], div[style*="zIndex"]').length : 0;
});
await treu();
await p.waitForTimeout(200);
await p.screenshot({ path: '_tmp-a3-z4.png', clip });
await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const capa = v2.querySelector('[data-stripe-visual-content="2"]').parentElement.parentElement.parentElement;
  window.__capa = capa;
  capa.style.zIndex = '1';
});
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-a3-z1.png', clip });
await ctx.close();
await b.close();
for (const nom of ['_tmp-a3-z4.png', '_tmp-a3-z1.png']) {
  const img = PNG.sync.read(readFileSync(nom));
  const { width, data } = img;
  const fila = [];
  for (let x = 0; x < width; x += 1) {
    const i = (4 * width + x) * 4;
    fila.push(`${(1399 + x / 3).toFixed(1)}:${data[i]},${data[i + 1]},${data[i + 2]}`);
  }
  console.log(nom, fila.join(' '));
}
