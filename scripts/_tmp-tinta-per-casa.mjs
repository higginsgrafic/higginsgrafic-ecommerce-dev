// TEMPORAL — la TINTA de cada casa, segmentada pel SEU COLOR a la imatge de
// color (full-color-stripe-5.webp): cada samarreta hi te un to diferent, i aixi
// se sap de qui es cada pixel (les siluetes del projecte es trepitgen).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const out = await p.evaluate(async () => {
  const img = new Image();
  img.src = '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp';
  await img.decode();
  const W = img.naturalWidth; const H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H).data;
  const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  // el color de referencia de cada casa: el centre del seu cos a la cintura
  const PITCH = 196.9; const RIGHT0 = 305.564;
  const refs = [];
  for (let k = 0; k < 14; k++) {
    const right = RIGHT0 + PITCH * k;
    const cx = Math.round(right - 60); // dins del cos
    refs.push({ k, cx, col: px(cx, 255) });
  }
  const semblant = (a, b, tol = 26) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
  // per a cada casa: la caixa de la seva tinta i l'extensio a unes quantes alcades
  const res = refs.map(({ k, col }) => {
    let minX = 1e9; let maxX = -1; let minY = 1e9; let maxY = -1;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const q = px(x, y);
        if (!semblant(q, col)) continue;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    const alcades = {};
    for (const y of [30, 60, 76, 100, 150, 250]) {
      let a = null; let z = null;
      for (let x = 0; x < W; x++) { if (semblant(px(x, y), col)) { if (a === null) a = x; z = x; } }
      alcades[`y${y}`] = a === null ? null : [a, z];
    }
    return { casa: k, color: col, caixa: [minX, minY, maxX - minX + 1, maxY - minY + 1], alcades };
  });
  return { W, H, res };
});
console.log('mides', out.W, out.H);
for (const r of out.res) {
  console.log(`casa ${String(r.casa).padStart(2)} color ${JSON.stringify(r.color).padEnd(16)} caixa ${JSON.stringify(r.caixa).padEnd(26)} ${JSON.stringify(r.alcades)}`);
}
await ctx.close();
await b.close();
