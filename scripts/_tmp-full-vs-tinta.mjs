// TEMPORAL — el full de siluetes (cercador/full-clic-area-5.svg) contra la
// TINTA de la imatge de la franja: per a cada casa, quanta tinta cobreix la
// silueta i quanta silueta cau sobre tinta.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const FULL = readFileSync('public/placeholders/cercador/full-clic-area-5.svg','utf8');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const out = await p.evaluate(async (svgTxt) => {
  const W = 2866; const H = 307;
  // 1) la imatge de la franja
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const di = g.getImageData(0, 0, W, H).data;
  const esTintaImg = (x, y) => { const i = (y * W + x) * 4; return 0.2126 * di[i] + 0.7152 * di[i + 1] + 0.0722 * di[i + 2] < 252; };
  // 2) el full de siluetes, pintat de blanc
  const URL = `data:image/svg+xml,${encodeURIComponent(svgTxt)}`;
  const im2 = new Image();
  im2.src = URL;
  await im2.decode();
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H;
  const g2 = c2.getContext('2d', { willReadFrequently: true });
  g2.drawImage(im2, 0, 0, W, H);
  const ds = g2.getImageData(0, 0, W, H).data;
  const esSilueta = (x, y) => ds[(y * W + x) * 4 + 3] > 128;
  // 3) per casa: comparar dins la seva finestra
  const PITCH = 196.9; const RIGHT0 = 305.564;
  const res = [];
  for (let k = 0; k < 14; k++) {
    const right = RIGHT0 + PITCH * k;
    const x0 = Math.max(0, Math.round(right - 320)); const x1 = Math.min(W, Math.round(right + 20));
    let tinta = 0; let coberta = 0; let silueta = 0; let sobreTinta = 0;
    for (let y = 0; y < H; y++) {
      for (let x = x0; x < x1; x++) {
        const t = esTintaImg(x, y); const s = esSilueta(x, y);
        if (t) { tinta++; if (s) coberta++; }
        if (s) { silueta++; if (t) sobreTinta++; }
      }
    }
    res.push({
      casa: k,
      finestra: [x0, x1],
      tinta,
      coberta,
      coberturaDeTinta: +(coberta / (tinta || 1) * 100).toFixed(1),
      silueta,
      precisio: +(sobreTinta / (silueta || 1) * 100).toFixed(1),
    });
  }
  return res;
}, FULL);
console.log('casa  finestra        tinta   coberta  %tinta  silueta  %silueta-sobre-tinta');
for (const r of out) {
  console.log(`${String(r.casa).padStart(3)}  ${JSON.stringify(r.finestra).padEnd(14)} ${String(r.tinta).padStart(6)} ${String(r.coberta).padStart(8)} ${String(r.coberturaDeTinta).padStart(6)} ${String(r.silueta).padStart(8)} ${String(r.precisio).padStart(8)}`);
}
await ctx.close();
await b.close();
