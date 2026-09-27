// TEMPORAL — no es comiteja. Les costures (vores de maniga) de la imatge de la franja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const r = await p.evaluate(async (url) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = 2866; c.height = 307;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 2866, 307);
  g.drawImage(img, 0, 0, 2866, 307);
  const d = g.getImageData(0, 0, 2866, 307).data;
  // "tinta" per columna = suma de (255 - min canal) sobre les files centrals (on hi ha les costures)
  const col = [];
  for (let x = 0; x < 2866; x++) {
    let s = 0;
    for (let y = 30; y < 280; y++) {
      const k = (y * 2866 + x) * 4;
      s += 255 - Math.min(d[k], d[k + 1], d[k + 2]);
    }
    col.push(s);
  }
  // maxims locals (costures): tinta per sobre dels veins
  const pics = [];
  for (let x = 6; x < 2860; x++) {
    if (col[x] > col[x - 6] + 400 && col[x] >= col[x - 1] && col[x] >= col[x + 1] && col[x] > col[x + 6] + 400) pics.push(x);
  }
  // agrupa pics propers
  const agrupat = [];
  for (const x of pics) {
    const ultim = agrupat[agrupat.length - 1];
    if (ultim && x - ultim[ultim.length - 1] < 12) ultim.push(x);
    else agrupat.push([x]);
  }
  const costures = agrupat.map((g2) => Math.round(g2.reduce((a, b2) => a + b2, 0) / g2.length));
  return { costures, mitjana: Math.round(col.reduce((a, b2) => a + b2, 0) / 2866) };
}, 'http://127.0.0.1:3003/placeholders/cercador/full-white-stripe.webp');
console.log('costures detectades:', r.costures.join(', '));
const cases = Array.from({ length: 14 }, (_, i) => Math.round(196.7 * i + 152.5));
const siluetes = [152.8, 381.6, 578.5, 775.4, 972.3, 1169.2, 1366.1, 1563, 1759.9, 1956.8, 2153.7, 2350.6, 2547.5, 2744.4];
console.log('centres de les CAIXES (tiles):', cases.join(', '));
console.log('centres de les siluetes del full:', siluetes.join(', '));
await b.close();
