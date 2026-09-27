// TEMPORAL — les tirades de TINTA de la imatge de color, amb el COLOR de cada
// tirada: diu de quina casa es cada pixel i on arrenca i acaba de debò.
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
  const lum = (x, y) => { const q = px(x, y); return 0.2126 * q[0] + 0.7152 * q[1] + 0.0722 * q[2]; };
  const esTinta = (x, y) => lum(x, y) < 252;
  const tirades = {};
  for (const y of [20, 40, 60, 76, 100, 150, 250]) {
    const t = [];
    let dins = esTinta(0, y);
    let inici = dins ? 0 : null;
    for (let x = 1; x < W; x++) {
      const a = esTinta(x, y);
      if (a && !dins) inici = x;
      if (!a && dins) t.push([inici, x - 1, px(Math.round((inici + x - 1) / 2), y)]);
      dins = a;
    }
    if (dins) t.push([inici, W - 1, px(Math.round((inici + W - 1) / 2), y)]);
    tirades['y' + y] = t.filter(([a, z]) => z - a > 5);
  }
  return tirades;
});
for (const [k, v] of Object.entries(out)) {
  console.log(k, v.map(([a, z, c]) => `${a}..${z}(${z - a + 1})${JSON.stringify(c)}`).join(' '));
}
await ctx.close();
await b.close();
