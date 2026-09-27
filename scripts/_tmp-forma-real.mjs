// TEMPORAL — no es coiteja. Quina de les tres formes coincideix amb la samarreta
// de la imatge de la franja (la de veritat).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 400 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
// 1. Les tres formes (caixes)
const codi = readFileSync('src/config/vectorFranja.js', 'utf8');
const treu = (nom) => { const i = codi.indexOf(`${nom} = '`); return codi.slice(i + nom.length + 4, codi.indexOf("';", i)); };
const full = readFileSync('public/placeholders/cercador/full-clic-area-5.svg', 'utf8').replace(/\n/g, ' ');
const vell = /<path[^>]*\sd="([^"]+)"/.exec(full)[1];
const t1 = readFileSync('public/placeholders/cercador/clic-area-1.svg', 'utf8').replace(/\n/g, ' ');
const t1p = /<path[^>]*\sd="([^"]+)"/.exec(t1)[1];
const t1tr = /matrix\(1\.007953[^"]*\)/.exec(t1)[0];
const info = await p.evaluate(({ vell, vec, t1p, t1tr }) => {
  const caixa = (d, transform) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '600'); svg.setAttribute('height', '600');
    svg.style.position = 'absolute'; svg.style.left = '-9999px';
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (transform) g.setAttribute('transform', transform);
    const q = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    q.setAttribute('d', d); g.appendChild(q); svg.appendChild(g); document.body.appendChild(svg);
    const bb = g.getBBox(); svg.remove();
    return [+bb.x.toFixed(1), +bb.y.toFixed(1), +bb.width.toFixed(1), +bb.height.toFixed(1)];
  };
  return {
    vel: caixa(vell),
    dibuixos: caixa(vec),
    amo: caixa(t1p, t1tr),
  };
}, { vell, vec: treu('VECTOR_FRANJA_SAMARRETA'), t1p, t1tr });
console.log('CAIXES (x, y, ample, alt):', JSON.stringify(info));
await ctx.close();
await b.close();

// 2. La caixa de la TINTA de la primera samarreta de la imatge de la franja
const img = PNG.sync.read(readFileSync('public/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'));
const { width, height, data } = img;
console.log('imatge:', width + 'x' + height);
// La primera casella es 0..305,56 en unitats del viewBox (2866 d'ample): escalem
const ESC = width / 2866;
const x0 = 0, x1 = Math.round(306 * ESC);
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
for (let y = 0; y < height; y++) {
  for (let x = x0; x < Math.min(width, x1); x++) {
    const i = (y * width + x) * 4;
    const a = data[i + 3];
    if (a > 20) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
}
console.log('tinta de la 1a samarreta (px imatge):', { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
console.log('en unitats del viewBox (x/ESC):', { x: +(minX / ESC).toFixed(1), y: +(minY / ESC).toFixed(1), w: +((maxX - minX + 1) / ESC).toFixed(1), h: +((maxY - minY + 1) / ESC).toFixed(1) });
