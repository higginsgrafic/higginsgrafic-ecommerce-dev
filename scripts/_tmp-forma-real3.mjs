// TEMPORAL — no es coiteja. La samarreta BLANCA de la imatge de la franja
// (la primera casa) contra: la forma del VEL (full-clic-area), la dels DIBUIXOS
// (VECTOR_FRANJA_SAMARRETA) i la del fitxer de l'amo (clic-area-2.svg).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 900, height: 500 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2000);
const codi = readFileSync('src/config/vectorFranja.js', 'utf8');
const treu = (nom) => { const i = codi.indexOf(`${nom} = '`); return codi.slice(i + nom.length + 4, codi.indexOf("';", i)); };
const t2 = readFileSync('public/placeholders/cercador/clic-area-2.svg', 'utf8').replace(/\n/g, ' ');
const amo = /<path[^>]*\sd="([^"]+)"/.exec(t2)[1];
const amoTr = /matrix\(1\.007953[^"]*\)/.exec(t2)[0];
const full = readFileSync('public/placeholders/cercador/full-clic-area-5.svg', 'utf8').replace(/\n/g, ' ');
const vell = /<path[^>]*\sd="([^"]+)"/.exec(full)[1];
const r = await p.evaluate(async ({ amo, amoTr, vell, vec }) => {
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx2 = c.getContext('2d');
  ctx2.drawImage(img, 0, 0);
  const { data, width, height } = ctx2.getImageData(0, 0, c.width, c.height);
  // La samarreta BLANCA: pixels clars (els colors de fons son foscos)
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
  const x1 = Math.round(306);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.min(width, x1); x++) {
      const i = (y * width + x) * 4;
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      const a = data[i + 3];
      if (a > 40 && lum > 200) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
  }
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
  return {
    imatge: { w: width, h: height },
    samarretaBlanca: minX === 1e9 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
    formaVel: caixa(vell),
    formaDibuixos: caixa(vec),
    formaAmo: caixa(amo, amoTr),
  };
}, { amo, amoTr, vell, vec: treu('VECTOR_FRANJA_SAMARRETA') });
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
