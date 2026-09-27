// TEMPORAL — la silueta de l'ultima casa del full: on acaba, i amb quina forma?
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const FULL = readFileSync('public/placeholders/cercador/full-clic-area-5.svg', 'utf8');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const r = await p.evaluate(async (svgTxt) => {
  const W = 2866; const H = 307;
  const doc = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');
  const camins = [...doc.querySelectorAll('path')];
  const out = [];
  for (const k of [11, 12, 13]) {
    const c = camins[k];
    const un = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${c.getAttribute('d')}" fill="#000"/></svg>`;
    const im = new Image();
    im.src = `data:image/svg+xml,${encodeURIComponent(un)}`;
    await im.decode();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    const tinta = (x, y) => d[(y * W + x) * 4 + 3] > 128;
    const alcades = {};
    for (const y of [40, 60, 76, 90, 120]) {
      let a = -1; let z = -1;
      for (let x = 0; x < W; x++) { if (tinta(x, y)) { if (a < 0) a = x; z = x; } }
      alcades['y' + y] = [a, z];
    }
    out.push({ casa: k, alcades });
  }
  return out;
}, FULL);
for (const q of r) console.log('casa', q.casa, JSON.stringify(q.alcades));
await ctx.close(); await b.close();
