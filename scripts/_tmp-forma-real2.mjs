// TEMPORAL — no es coiteja. La caixa de la TINTA de la primera samarreta de la
// imatge de la franja, comparada amb les tres formes.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 900, height: 400 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2000);
const r = await p.evaluate(async () => {
  // 1) la imatge de la franja
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
  const ESC = width / 2866;
  const x1 = Math.round(306 * ESC);
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.min(width, x1); x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
  }
  // 2) les formes
  const caixa = (d, transform) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '600'); svg.setAttribute('height', '600');
    svg.style.position = 'absolute'; svg.style.left = '-9999px';
    const gg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (transform) gg.setAttribute('transform', transform);
    const q = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    q.setAttribute('d', d); gg.appendChild(q); svg.appendChild(gg); document.body.appendChild(svg);
    const bb = gg.getBBox(); svg.remove();
    return { x: +bb.x.toFixed(1), y: +bb.y.toFixed(1), w: +bb.width.toFixed(1), h: +bb.height.toFixed(1) };
  };
  const cami = (u) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('width','10'); s.setAttribute('height','10'); return s; };
  return {
    imatge: { w: width, h: height, escala: +ESC.toFixed(4) },
    tinta: { x: +(minX / ESC).toFixed(1), y: +(minY / ESC).toFixed(1), w: +((maxX - minX + 1) / ESC).toFixed(1), h: +((maxY - minY + 1) / ESC).toFixed(1) },
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
